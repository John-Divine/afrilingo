import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInAnonymously,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  updateProfile,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDocFromServer,
  setDoc,
  getDoc,
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  updateDoc,
  increment,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import type { UserAccount, CommunityPost } from '../types';

// Initialize Firebase App
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth
export const auth = getAuth(app);

// Initialize Firestore with specific database ID if provided
export const db = firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  return errInfo;
}

// Test connectivity according to skill requirements
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline or network unreachable.');
    }
    return false;
  }
}

// Ensure an authenticated session exists (Anonymous by default until user registers/logs in)
export async function ensureAuth(): Promise<User | null> {
  if (auth.currentUser) return auth.currentUser;
  try {
    const cred = await signInAnonymously(auth);
    return cred.user;
  } catch (err) {
    console.warn('Anonymous sign-in skipped:', err);
    return null;
  }
}

// Register new account with Email & Password
export async function registerWithEmail(
  email: string,
  pass: string,
  displayName: string
): Promise<User> {
  const cred = await createUserWithEmailAndPassword(auth, email, pass);
  if (displayName) {
    await updateProfile(cred.user, { displayName });
  }
  return cred.user;
}

// Login with Email & Password
export async function loginWithEmail(email: string, pass: string): Promise<User> {
  const cred = await signInWithEmailAndPassword(auth, email, pass);
  return cred.user;
}

// Sign in with Google (Default supported provider in Firebase AI Studio)
export async function loginWithGoogle(): Promise<User> {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  const cred = await signInWithPopup(auth, provider);
  return cred.user;
}

// Logout
export async function logoutUser(): Promise<void> {
  await signOut(auth);
  // Re-sign anonymously so the user can continue learning as guest
  await signInAnonymously(auth).catch(() => {});
}

// Sync user account profile to Firestore
export async function syncUserProfileToFirestore(account: UserAccount): Promise<void> {
  const user = auth.currentUser;
  if (!user) return;

  const userRef = doc(db, 'users', user.uid);
  const data = {
    userId: user.uid,
    displayName: account.name,
    email: account.email || user.email || '',
    sageloName: account.sageloName,
    region: account.region,
    avatarKey: account.avatarKey,
    xp: account.xp,
    streak: account.streakDays,
    hearts: account.hearts,
    cowries: 480 + (account.xp % 500),
    followingIds: account.followingIds || [],
    completedLessons: account.completedLessons || [],
    masteredWords: account.masteredWords || [],
    notebook: account.notebook || [],
    updatedAt: new Date().toISOString(),
  };

  try {
    await setDoc(userRef, data, { merge: true });

    // Also update public community directory for discovery & leaderboard
    const communityRef = doc(db, 'community_learners', user.uid);
    await setDoc(
      communityRef,
      {
        userId: user.uid,
        displayName: account.name,
        sageloName: account.sageloName,
        region: account.region,
        avatarKey: account.avatarKey,
        xp: account.xp,
        streak: account.streakDays,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}`);
  }
}

// Fetch user profile from Firestore
export async function fetchUserProfileFromFirestore(userId: string): Promise<Partial<UserAccount> | null> {
  try {
    const userRef = doc(db, 'users', userId);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      const data = snap.data();
      return {
        id: data.userId,
        name: data.displayName || 'Learner',
        email: data.email || '',
        sageloName: data.sageloName || '',
        region: data.region || 'Cameroon',
        avatarKey: data.avatarKey || 'mwana',
        xp: data.xp || 0,
        streakDays: data.streak || 1,
        hearts: data.hearts ?? 5,
        followingIds: data.followingIds || [],
        completedLessons: data.completedLessons || [],
        masteredWords: data.masteredWords || [],
        notebook: data.notebook || [],
      };
    }
    return null;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, `users/${userId}`);
    return null;
  }
}

// Subscribe to public community learners (for Discover & Friends Leaderboard)
export function subscribeToCommunityLearners(
  callback: (learners: Array<{
    userId: string;
    displayName: string;
    sageloName: string;
    region: string;
    avatarKey: string;
    xp: number;
    streak: number;
  }>) => void
) {
  const q = query(collection(db, 'community_learners'), orderBy('xp', 'desc'), limit(50));
  return onSnapshot(
    q,
    (snapshot) => {
      const list = snapshot.docs.map((docSnap) => {
        const d = docSnap.data();
        return {
          userId: d.userId || docSnap.id,
          displayName: d.displayName || 'Learner',
          sageloName: d.sageloName || '',
          region: d.region || 'West Africa',
          avatarKey: d.avatarKey || 'mwana',
          xp: d.xp || 0,
          streak: d.streak || 1,
        };
      });
      callback(list);
    },
    (err) => {
      handleFirestoreError(err, OperationType.LIST, 'community_learners');
    }
  );
}

// Publish community post
export async function postToCommunity(payload: {
  sageloText: string;
  englishTranslation: string;
  evidentiality: 'ha' | 'ra' | 'si' | 'ni';
  grammarTag: string;
  author: UserAccount;
}): Promise<void> {
  const user = auth.currentUser;
  if (!user) return;

  const postId = `post_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const postRef = doc(db, 'community_posts', postId);

  try {
    await setDoc(postRef, {
      postId,
      userId: user.uid,
      authorId: user.uid,
      authorName: payload.author.name,
      authorSageloName: payload.author.sageloName,
      authorRegion: payload.author.region,
      authorAvatarKey: payload.author.avatarKey,
      sageloText: payload.sageloText,
      englishTranslation: payload.englishTranslation,
      evidentiality: payload.evidentiality,
      grammarTag: payload.grammarTag,
      shantiCount: 0,
      likedBy: [],
      createdAt: new Date().toISOString(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, `community_posts/${postId}`);
  }
}

// Subscribe to community wisdom posts
export function subscribeToCommunityPosts(
  callback: (posts: CommunityPost[]) => void
) {
  const q = query(collection(db, 'community_posts'), orderBy('createdAt', 'desc'), limit(30));
  return onSnapshot(
    q,
    (snapshot) => {
      const posts = snapshot.docs.map((docSnap) => {
        const d = docSnap.data();
        return {
          id: d.postId || docSnap.id,
          authorId: d.authorId || d.userId || '',
          authorName: d.authorName || 'Learner',
          authorSageloName: d.authorSageloName || '',
          authorRegion: d.authorRegion || 'Africa',
          authorAvatarKey: d.authorAvatarKey || 'mwana',
          sageloText: d.sageloText || '',
          englishTranslation: d.englishTranslation || '',
          evidentiality: d.evidentiality || 'ha',
          grammarTag: d.grammarTag || 'Community Exchange',
          shantiCount: d.shantiCount || 0,
          likedBy: d.likedBy || [],
          createdAt: d.createdAt || new Date().toISOString(),
        } as CommunityPost;
      });
      callback(posts);
    },
    (err) => {
      handleFirestoreError(err, OperationType.LIST, 'community_posts');
    }
  );
}

// Toggle Shanti / Cheer on a post
export async function togglePostShantiInFirestore(
  postId: string,
  currentUserId: string,
  isLiked: boolean
): Promise<void> {
  const postRef = doc(db, 'community_posts', postId);
  try {
    if (isLiked) {
      await updateDoc(postRef, {
        shantiCount: increment(-1),
        likedBy: arrayRemove(currentUserId),
      });
    } else {
      await updateDoc(postRef, {
        shantiCount: increment(1),
        likedBy: arrayUnion(currentUserId),
      });
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `community_posts/${postId}`);
  }
}
