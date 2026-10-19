import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  Search,
  UserPlus,
  UserCheck,
  Flame,
  Zap,
  Sparkles,
  Heart,
  Volume2,
  Send,
  MessageCircle,
  BookOpen,
  CheckCircle2,
  Globe,
} from 'lucide-react';
import type { UserAccount, CommunityPost } from '../types';
import {
  subscribeToCommunityLearners,
  subscribeToCommunityPosts,
  postToCommunity,
  togglePostShantiInFirestore,
  syncUserProfileToFirestore,
} from '../lib/firebase';
import { playSageloPhrase } from '../utils/sageloAudio';

interface ConnectWithOthersViewProps {
  currentUser: UserAccount;
  onUpdateUser: (updated: UserAccount) => void;
  onOpenAuthModal?: () => void;
}

interface LearnerProfile {
  userId: string;
  displayName: string;
  sageloName: string;
  region: string;
  avatarKey: string;
  xp: number;
  streak: number;
  avatarEmoji?: string;
}

const DEFAULT_COMMUNITY_MEMBERS: LearnerProfile[] = [
  {
    userId: 'user-amina',
    displayName: 'Amina Diallo',
    sageloName: 'Nyango Amina',
    region: '🇸🇳 Dakar, Senegal',
    avatarKey: 'nyango',
    xp: 680,
    streak: 14,
    avatarEmoji: '👩🏾',
  },
  {
    userId: 'user-kwame',
    displayName: 'Kwame Mensah',
    sageloName: 'Mpaka Kwame',
    region: '🇬🇭 Accra, Ghana',
    avatarKey: 'mpaka',
    xp: 520,
    streak: 9,
    avatarEmoji: '👴🏾',
  },
  {
    userId: 'user-zola',
    displayName: 'Zola Dlamini',
    sageloName: 'Mwana Zola',
    region: '🇿🇦 Johannesburg, South Africa',
    avatarKey: 'mwana',
    xp: 410,
    streak: 6,
    avatarEmoji: '👩🏾‍🦱',
  },
  {
    userId: 'user-tariq',
    displayName: 'Tariq Al-Mansur',
    sageloName: 'Misaga Tariq',
    region: '🇪🇬 Cairo, Egypt',
    avatarKey: 'mwana',
    xp: 380,
    streak: 4,
    avatarEmoji: '👳🏾‍♂️',
  },
  {
    userId: 'user-chinedu',
    displayName: 'Chinedu Eze',
    sageloName: 'Ndeko Chinedu',
    region: '🇳🇬 Lagos, Nigeria',
    avatarKey: 'mwana',
    xp: 345,
    streak: 8,
    avatarEmoji: '👨🏾',
  },
  {
    userId: 'user-fatou',
    displayName: 'Fatoumata Traore',
    sageloName: 'Nyango Fatou',
    region: '🇲🇱 Bamako, Mali',
    avatarKey: 'nyango',
    xp: 290,
    streak: 5,
    avatarEmoji: '🧕🏾',
  },
];

export const ConnectWithOthersView: React.FC<ConnectWithOthersViewProps> = ({
  currentUser,
  onUpdateUser,
  onOpenAuthModal,
}) => {
  const [subTab, setSubTab] = useState<'find' | 'feed' | 'wisdom'>('find');
  const [wisdomFilter, setWisdomFilter] = useState<'connections' | 'all'>('connections');
  const [searchQuery, setSearchQuery] = useState('');
  const [cheeredUsers, setCheeredUsers] = useState<Record<string, boolean>>({});

  // Community Posts
  const [posts, setPosts] = useState<CommunityPost[]>([
    {
      id: 'seed-1',
      authorId: 'user-amina',
      authorName: 'Amina Diallo',
      authorSageloName: 'Nyango Amina',
      authorRegion: 'Senegal',
      authorAvatarKey: 'nyango',
      sageloText: 'Bono jua, ndeko! Sago sim doni; sago sagu ha.',
      englishTranslation: 'Good day, friend! Wisdom is not given; wisdom is grown (attested).',
      evidentiality: 'ha',
      grammarTag: 'Lesson 3 • Proverbs',
      shantiCount: 18,
      likedBy: [],
      createdAt: '2026-10-07T09:15:00Z',
    },
    {
      id: 'seed-2',
      authorId: 'user-kwame',
      authorName: 'Kwame Mensah',
      authorSageloName: 'Mpaka Kwame',
      authorRegion: 'Ghana',
      authorAvatarKey: 'mpaka',
      sageloText: 'Yo kani na maro kon siko ha. Yo voli shanti ra.',
      englishTranslation: 'I walked to the market with my sibling. I hear they want peace.',
      evidentiality: 'ra',
      grammarTag: 'Lesson 5 • Market Life',
      shantiCount: 12,
      likedBy: [],
      createdAt: '2026-10-07T08:30:00Z',
    },
  ]);

  // Firestore community learners
  const [firestoreLearners, setFirestoreLearners] = useState<LearnerProfile[]>([]);
  const [newSagelo, setNewSagelo] = useState('');
  const [newEnglish, setNewEnglish] = useState('');
  const [newEvidentiality, setNewEvidentiality] = useState<'ha' | 'ra' | 'si' | 'ni'>('ha');
  const [postSubmitting, setPostSubmitting] = useState(false);

  // Subscribe to real-time Firestore learners and posts
  useEffect(() => {
    const unsubLearners = subscribeToCommunityLearners((learners) => {
      if (learners && learners.length > 0) {
        setFirestoreLearners(learners);
      }
    });

    const unsubPosts = subscribeToCommunityPosts((remotePosts) => {
      if (remotePosts && remotePosts.length > 0) {
        setPosts(remotePosts);
      }
    });

    return () => {
      unsubLearners();
      unsubPosts();
    };
  }, []);

  // Merge default learners with Firestore learners
  const allLearners: LearnerProfile[] = useMemo(() => {
    const map = new Map<string, LearnerProfile>();
    DEFAULT_COMMUNITY_MEMBERS.forEach((m) => map.set(m.userId, m));
    firestoreLearners.forEach((f) => {
      if (f.userId !== currentUser.id) {
        map.set(f.userId, {
          ...f,
          avatarEmoji: f.avatarKey === 'mpaka' ? '👴🏾' : f.avatarKey === 'nyango' ? '👩🏾' : '🧒🏾',
        });
      }
    });
    return Array.from(map.values());
  }, [firestoreLearners, currentUser.id]);

  // The specific set of IDs that the CURRENT logged-in user is connected to
  const connectedUserIds = currentUser.followingIds || [];

  // Connected learners list (strictly who the user is connected to)
  const connectedLearners = useMemo(() => {
    return allLearners.filter((l) => connectedUserIds.includes(l.userId));
  }, [allLearners, connectedUserIds]);

  // Filter learners by search in Directory
  const filteredLearners = allLearners.filter((l) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      l.displayName.toLowerCase().includes(q) ||
      l.sageloName.toLowerCase().includes(q) ||
      l.region.toLowerCase().includes(q)
    );
  });

  // Filtered posts for Wisdom Wall: when 'connections', only show posts from user & connected friends
  const displayedPosts = useMemo(() => {
    if (wisdomFilter === 'all') return posts;
    return posts.filter(
      (p) => p.authorId === currentUser.id || connectedUserIds.includes(p.authorId)
    );
  }, [posts, wisdomFilter, currentUser.id, connectedUserIds]);

  const handleToggleFollow = (targetUserId: string) => {
    const currentFollowing = currentUser.followingIds || [];
    const isFollowing = currentFollowing.includes(targetUserId);
    const updatedFollowing = isFollowing
      ? currentFollowing.filter((id) => id !== targetUserId)
      : [...currentFollowing, targetUserId];

    const updatedUser: UserAccount = {
      ...currentUser,
      followingIds: updatedFollowing,
    };
    onUpdateUser(updatedUser);
    syncUserProfileToFirestore(updatedUser);
  };

  const handleCheerUser = (learner: LearnerProfile) => {
    setCheeredUsers((prev) => ({ ...prev, [learner.userId]: true }));
    playSageloPhrase('Shanti, ndeko!');
    setTimeout(() => {
      setCheeredUsers((prev) => ({ ...prev, [learner.userId]: false }));
    }, 4000);
  };

  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSagelo.trim() || !newEnglish.trim()) return;
    setPostSubmitting(true);

    try {
      await postToCommunity({
        sageloText: newSagelo.trim(),
        englishTranslation: newEnglish.trim(),
        evidentiality: newEvidentiality,
        grammarTag: 'Learner Practice',
        author: currentUser,
      });

      // Local optimistic update
      const localPost: CommunityPost = {
        id: `local-${Date.now()}`,
        authorId: currentUser.id,
        authorName: currentUser.name,
        authorSageloName: currentUser.sageloName,
        authorRegion: currentUser.region,
        authorAvatarKey: currentUser.avatarKey,
        sageloText: newSagelo.trim(),
        englishTranslation: newEnglish.trim(),
        evidentiality: newEvidentiality,
        grammarTag: 'Learner Practice',
        shantiCount: 1,
        likedBy: [currentUser.id],
        createdAt: new Date().toISOString(),
      };
      setPosts((prev) => [localPost, ...prev]);

      setNewSagelo('');
      setNewEnglish('');
    } catch (err) {
      console.error('Failed to post:', err);
    } finally {
      setPostSubmitting(false);
    }
  };

  const handleToggleShanti = (post: CommunityPost) => {
    const isLiked = (post.likedBy || []).includes(currentUser.id);
    const updatedLikedBy = isLiked
      ? (post.likedBy || []).filter((id) => id !== currentUser.id)
      : [...(post.likedBy || []), currentUser.id];
    const updatedShanti = isLiked ? Math.max(0, post.shantiCount - 1) : post.shantiCount + 1;

    setPosts((prev) =>
      prev.map((p) =>
        p.id === post.id
          ? {
              ...p,
              shantiCount: updatedShanti,
              likedBy: updatedLikedBy,
            }
          : p
      )
    );

    togglePostShantiInFirestore(post.id, currentUser.id, isLiked);
  };

  const handleSaveToNotebook = (sagelo: string, english: string) => {
    const newNote = {
      id: `note-${Date.now()}`,
      sagelo,
      english,
      evidentiality: 'ha' as const,
      createdAt: new Date().toISOString(),
    };
    const updated: UserAccount = {
      ...currentUser,
      notebook: [newNote, ...currentUser.notebook],
    };
    onUpdateUser(updated);
    syncUserProfileToFirestore(updated);
    playSageloPhrase(sagelo);
  };

  return (
    <div className="space-y-6 max-w-full overflow-x-hidden">
      {/* 1. HERO BANNER: DUOLINGO STYLE COMMUNITY CIRCLE */}
      <div className="bg-[#58CC02] border-b-6 border-[#46A302] text-white rounded-3xl p-6 sm:p-7 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider text-white/80">
              SOCIAL & STUDY CIRCLE
            </span>
            <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-black uppercase">
              Live Network
            </span>
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <span>Connect with Learners</span>
            <span className="text-2xl">🌍</span>
          </h2>
          <p className="text-xs font-bold text-white/90 max-w-md">
            Practice Sagelo with learners across Africa. Follow friends, celebrate streaks, and see real updates from people you connect with!
          </p>
        </div>

        {/* Action Button: Profile / Sign in */}
        {onOpenAuthModal && (
          <button
            onClick={onOpenAuthModal}
            className="bg-white hover:bg-[#F7F7F7] border-b-4 border-[#E5E5E5] text-[#58CC02] font-black text-xs uppercase tracking-wider px-4 py-2.5 rounded-2xl flex items-center gap-2 self-start sm:self-center transition-all active:translate-y-0.5 shadow-sm shrink-0"
          >
            <Sparkles className="w-4 h-4 text-[#FF9600]" />
            <span>Profile & Account</span>
          </button>
        )}
      </div>

      {/* 2. SUBTAB SWITCHER */}
      <div className="flex bg-[#F7F7F7] p-1.5 rounded-2xl border-2 border-[#E5E5E5] max-w-md w-full">
        <button
          onClick={() => setSubTab('find')}
          className={`flex-1 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 ${
            subTab === 'find'
              ? 'bg-white text-[#58CC02] shadow-xs border-2 border-[#58CC02]/20'
              : 'text-[#777777] hover:text-[#3C3C3C]'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Find Friends</span>
        </button>

        <button
          onClick={() => setSubTab('feed')}
          className={`flex-1 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 ${
            subTab === 'feed'
              ? 'bg-white text-[#1CB0F6] shadow-xs border-2 border-[#1CB0F6]/20'
              : 'text-[#777777] hover:text-[#3C3C3C]'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>Friends Feed ({connectedLearners.length})</span>
        </button>

        <button
          onClick={() => setSubTab('wisdom')}
          className={`flex-1 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 ${
            subTab === 'wisdom'
              ? 'bg-white text-[#CE82FF] shadow-xs border-2 border-[#CE82FF]/20'
              : 'text-[#777777] hover:text-[#3C3C3C]'
          }`}
        >
          <MessageCircle className="w-4 h-4" />
          <span>Wisdom Wall</span>
        </button>
      </div>

      {/* 3. SUBTAB: FIND FRIENDS & DIRECTORY */}
      {subTab === 'find' && (
        <div className="space-y-6">
          {/* Active Connections Spotlight (if user has connected with anyone) */}
          {connectedLearners.length > 0 ? (
            <div className="bg-white border-2 border-b-6 border-[#58CC02]/30 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-[#58CC02]" />
                  <h3 className="font-black text-base text-[#3C3C3C]">
                    My Connected Learners ({connectedLearners.length})
                  </h3>
                </div>
                <span className="text-xs font-bold text-[#58CC02]">
                  Synced to your account
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {connectedLearners.map((learner) => (
                  <div
                    key={`connected-${learner.userId}`}
                    className="p-3.5 rounded-2xl border-2 border-[#58CC02]/20 bg-[#F4FDF0] flex items-center justify-between gap-3 shadow-xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-11 h-11 rounded-2xl bg-white border border-[#58CC02]/30 text-2xl flex items-center justify-center shrink-0">
                        {learner.avatarEmoji || '🧒🏾'}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-black text-[#3C3C3C] truncate">
                          {learner.displayName}
                        </p>
                        <p className="text-xs font-bold text-[#58CC02] truncate">
                          {learner.sageloName} • {learner.region}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleCheerUser(learner)}
                        className="px-2.5 py-1.5 bg-white border-2 border-[#FFD8A8] hover:bg-[#FFF4E5] rounded-xl text-[11px] font-black uppercase text-[#EA580C] transition-all"
                        title="Cheer friend"
                      >
                        🎉 Cheer
                      </button>
                      <button
                        onClick={() => handleToggleFollow(learner.userId)}
                        className="px-2.5 py-1.5 bg-white border border-[#E5E5E5] hover:border-[#EF4444] text-[#777777] hover:text-[#EF4444] rounded-xl text-[10px] font-black uppercase transition-all"
                        title="Disconnect"
                      >
                        Connected ✓
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-[#F0FDF4] border-2 border-[#86EFAC] rounded-3xl p-5 flex items-center gap-4">
              <span className="text-3xl">🌱</span>
              <div>
                <h4 className="font-black text-sm text-[#166534]">
                  You have not connected to any learners yet
                </h4>
                <p className="text-xs font-bold text-[#15803D]">
                  Browse the learners in the directory below and click "Follow" to connect and see their achievements in your feed!
                </p>
              </div>
            </div>
          )}

          {/* Search Input */}
          <div className="relative w-full max-w-full">
            <Search className="w-5 h-5 absolute left-4 top-3.5 text-[#AFAFAF]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search learners by name, Sagelo moniker, or country..."
              className="w-full pl-12 pr-4 py-3 rounded-2xl border-2 border-[#E5E5E5] focus:border-[#58CC02] focus:outline-hidden font-bold text-sm text-[#3C3C3C] bg-white shadow-xs"
            />
          </div>

          {/* Friends Quest Card */}
          <div className="bg-[#FFF4E5] border-2 border-b-4 border-[#FFD8A8] rounded-3xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#FF9600] border-b-4 border-[#E58600] text-2xl flex items-center justify-center text-white shrink-0 shadow-xs">
                🤝
              </div>
              <div>
                <h4 className="font-black text-sm text-[#EA580C] uppercase tracking-wider">
                  Weekly Friends Quest
                </h4>
                <p className="text-xs font-bold text-[#3C3C3C]">
                  Earn 100 XP together with your connected friends this week for 30 Cowrie Gems!
                </p>
                <div className="text-[11px] font-bold text-[#AFAFAF] mt-0.5">
                  Connected with {connectedUserIds.length} learners
                </div>
              </div>
            </div>
            <div className="px-3.5 py-1.5 bg-white border-2 border-[#FFD8A8] rounded-2xl font-mono-num font-black text-xs text-[#EA580C] self-start sm:self-center shrink-0">
              {connectedUserIds.length > 0 ? '65 / 100 XP' : '0 / 100 XP'}
            </div>
          </div>

          {/* Learners Directory Grid */}
          <div className="space-y-3">
            <h3 className="font-black text-base text-[#3C3C3C] flex items-center gap-2">
              <Globe className="w-5 h-5 text-[#58CC02]" />
              <span>Discover Learners Across Africa</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredLearners.map((learner) => {
                const isFollowing = connectedUserIds.includes(learner.userId);
                const isCheered = cheeredUsers[learner.userId];

                return (
                  <div
                    key={learner.userId}
                    className="bg-white border-2 border-b-4 border-[#E5E5E5] rounded-3xl p-5 flex flex-col justify-between gap-4 shadow-xs hover:border-[#1CB0F6] transition-all"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-14 h-14 rounded-2xl bg-[#F7F7F7] border-2 border-[#E5E5E5] text-3xl flex items-center justify-center shrink-0">
                          {learner.avatarEmoji || '🧒🏾'}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-base font-black text-[#3C3C3C] truncate">
                            {learner.displayName}
                          </h4>
                          <p className="text-xs font-bold text-[#58CC02] truncate">
                            {learner.sageloName}
                          </p>
                          <p className="text-[11px] font-bold text-[#AFAFAF] truncate mt-0.5">
                            {learner.region}
                          </p>
                        </div>
                      </div>

                      {/* Stats pill */}
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <div className="flex items-center gap-1 font-mono-num text-xs font-black text-[#EA580C]">
                          <Flame className="w-3.5 h-3.5 fill-[#EA580C]" />
                          <span>{learner.streak}d</span>
                        </div>
                        <div className="flex items-center gap-1 font-mono-num text-xs font-black text-[#FF9600]">
                          <Zap className="w-3.5 h-3.5 text-[#FF9600]" />
                          <span>{learner.xp} XP</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions: Follow and High-five */}
                    <div className="flex items-center gap-2 pt-2 border-t-2 border-[#F7F7F7]">
                      <button
                        onClick={() => handleToggleFollow(learner.userId)}
                        className={`flex-1 py-2.5 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all active:translate-y-0.5 ${
                          isFollowing
                            ? 'bg-[#F7F7F7] border-2 border-[#E5E5E5] text-[#777777] hover:bg-[#E5E5E5]'
                            : 'bg-[#58CC02] hover:bg-[#61E002] border-b-4 border-[#46A302] text-white shadow-xs'
                        }`}
                      >
                        {isFollowing ? (
                          <>
                            <UserCheck className="w-4 h-4 text-[#58CC02]" />
                            <span>Following ✓</span>
                          </>
                        ) : (
                          <>
                            <UserPlus className="w-4 h-4" />
                            <span>Connect +</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => handleCheerUser(learner)}
                        className={`px-3.5 py-2.5 rounded-2xl font-black text-xs uppercase tracking-wider border-2 border-b-4 transition-all active:translate-y-0.5 ${
                          isCheered
                            ? 'bg-[#DCFCE7] border-[#86EFAC] text-[#166534]'
                            : 'bg-white border-[#E5E5E5] hover:bg-[#FFF4E5] hover:border-[#FFD8A8] text-[#EA580C]'
                        }`}
                        title="Send High-Five / Cheer"
                      >
                        {isCheered ? '✋ Sent!' : '✋ High Five'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 4. SUBTAB: FRIENDS FEED & ACTIVITY (STRICTLY CONNECTED USERS) */}
      {subTab === 'feed' && (
        <div className="space-y-4">
          {connectedLearners.length === 0 ? (
            <div className="bg-white border-2 border-b-6 border-[#E5E5E5] rounded-3xl p-8 text-center space-y-4 shadow-xs">
              <div className="w-16 h-16 mx-auto rounded-3xl bg-[#1CB0F6]/10 border-2 border-[#1CB0F6]/20 flex items-center justify-center text-3xl">
                🤝
              </div>
              <div className="space-y-1.5 max-w-sm mx-auto">
                <h3 className="font-black text-lg text-[#3C3C3C]">
                  No Connected Friends Yet
                </h3>
                <p className="text-xs font-bold text-[#777777] leading-relaxed">
                  When you connect with fellow learners in Find Friends, their streak milestones, lesson achievements, and celebratory highlights will appear here.
                </p>
              </div>
              <button
                onClick={() => setSubTab('find')}
                className="px-5 py-2.5 bg-[#1CB0F6] hover:bg-[#1899D6] border-b-4 border-[#1580B8] text-white font-black text-xs uppercase rounded-2xl transition-all active:translate-y-0.5"
              >
                Find Learners to Connect
              </button>
            </div>
          ) : (
            <div className="bg-white border-2 border-b-4 border-[#E5E5E5] rounded-3xl p-5 space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-base text-[#3C3C3C] flex items-center gap-2">
                  <Zap className="w-5 h-5 text-[#1CB0F6]" />
                  <span>Recent Friend Highlights ({connectedLearners.length})</span>
                </h3>
                <span className="text-xs font-bold text-[#1CB0F6]">
                  Live Connected Feed
                </span>
              </div>

              <div className="space-y-3">
                {connectedLearners.map((friend) => (
                  <div
                    key={`feed-${friend.userId}`}
                    className="p-4 rounded-2xl bg-[#F7F7F7] border-2 border-[#E5E5E5] flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{friend.avatarEmoji || '🧒🏾'}</span>
                      <div>
                        <p className="text-sm font-black text-[#3C3C3C]">
                          {friend.displayName} ({friend.sageloName}) reached a {friend.streak}-day streak!
                        </p>
                        <p className="text-xs font-bold text-[#AFAFAF]">
                          {friend.xp} XP earned • {friend.region}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        playSageloPhrase('Shanti, ndeko!');
                        handleCheerUser(friend);
                      }}
                      className="px-3.5 py-1.5 bg-[#FFC800] border-b-4 border-[#E5A500] text-white font-black text-xs uppercase rounded-xl active:translate-y-0.5 flex items-center gap-1 shrink-0"
                    >
                      <span>🎉</span>
                      <span>Cheer</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 5. SUBTAB: WISDOM WALL & STUDY EXCHANGE */}
      {subTab === 'wisdom' && (
        <div className="space-y-6">
          {/* Post composer */}
          <div className="bg-white border-2 border-b-6 border-[#E5E5E5] rounded-3xl p-5 sm:p-6 space-y-4 shadow-xs">
            <div className="flex items-center gap-3">
              <span className="text-2xl">✍🏾</span>
              <div>
                <h3 className="font-black text-base text-[#3C3C3C]">
                  Share a Sagelo Phrase with the Community
                </h3>
                <p className="text-xs font-bold text-[#777777]">
                  Practice your evidentiality particles (-ha, -ra, -si, -ni) and let peers review!
                </p>
              </div>
            </div>

            <form onSubmit={handlePostSubmit} className="space-y-3">
              <div>
                <input
                  type="text"
                  required
                  value={newSagelo}
                  onChange={(e) => setNewSagelo(e.target.value)}
                  placeholder="Sagelo phrase (e.g. Yo sagi sago bono ha)"
                  className="w-full px-4 py-2.5 rounded-2xl border-2 border-[#E5E5E5] focus:border-[#58CC02] focus:outline-hidden font-bold text-sm text-[#3C3C3C]"
                />
              </div>

              <div>
                <input
                  type="text"
                  required
                  value={newEnglish}
                  onChange={(e) => setNewEnglish(e.target.value)}
                  placeholder="English translation (e.g. I understand wisdom well)"
                  className="w-full px-4 py-2.5 rounded-2xl border-2 border-[#E5E5E5] focus:border-[#58CC02] focus:outline-hidden font-bold text-sm text-[#3C3C3C]"
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                {/* Evidentiality picker */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase text-[#AFAFAF]">Particle:</span>
                  {(['ha', 'ra', 'si', 'ni'] as const).map((part) => (
                    <button
                      key={part}
                      type="button"
                      onClick={() => setNewEvidentiality(part)}
                      className={`px-3 py-1 rounded-xl text-xs font-black uppercase transition-all ${
                        newEvidentiality === part
                          ? 'bg-[#CE82FF] text-white shadow-xs'
                          : 'bg-[#F7F7F7] text-[#777777] border border-[#E5E5E5]'
                      }`}
                    >
                      -{part}
                    </button>
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={postSubmitting}
                  className="px-6 py-2.5 bg-[#58CC02] hover:bg-[#61E002] border-b-4 border-[#46A302] text-white font-black text-xs uppercase rounded-2xl transition-all active:translate-y-0.5 shadow-xs flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{postSubmitting ? 'Posting...' : 'Share Phrase'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Filter Pills: My Connections vs All Community */}
          <div className="flex items-center justify-between border-b-2 border-[#E5E5E5] pb-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setWisdomFilter('connections')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                  wisdomFilter === 'connections'
                    ? 'bg-[#58CC02] text-white shadow-xs'
                    : 'bg-[#F7F7F7] text-[#777777] hover:bg-[#E5E5E5]'
                }`}
              >
                My Connections ({posts.filter((p) => p.authorId === currentUser.id || connectedUserIds.includes(p.authorId)).length})
              </button>

              <button
                onClick={() => setWisdomFilter('all')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                  wisdomFilter === 'all'
                    ? 'bg-[#1CB0F6] text-white shadow-xs'
                    : 'bg-[#F7F7F7] text-[#777777] hover:bg-[#E5E5E5]'
                }`}
              >
                All Community ({posts.length})
              </button>
            </div>

            <span className="text-[11px] font-bold text-[#AFAFAF] hidden sm:inline">
              {wisdomFilter === 'connections' ? 'Showing posts from you & people you follow' : 'Showing all public posts'}
            </span>
          </div>

          {/* Posts list */}
          <div className="space-y-4">
            {displayedPosts.length === 0 ? (
              <div className="p-8 text-center bg-white border-2 border-b-4 border-[#E5E5E5] rounded-3xl space-y-3">
                <span className="text-3xl">💬</span>
                <p className="font-black text-base text-[#3C3C3C]">
                  No phrases shared by your connections yet.
                </p>
                <p className="text-xs font-bold text-[#777777] max-w-sm mx-auto">
                  Share your first Sagelo sentence using the box above, or switch to "All Community" to view phrases shared across Africa!
                </p>
                <button
                  onClick={() => setWisdomFilter('all')}
                  className="mt-1 px-4 py-2 bg-[#F7F7F7] hover:bg-[#E5E5E5] border-2 border-[#E5E5E5] text-xs font-black uppercase text-[#1CB0F6] rounded-xl transition-all"
                >
                  View All Community Phrases
                </button>
              </div>
            ) : (
              displayedPosts.map((post) => {
                const isLiked = (post.likedBy || []).includes(currentUser.id);

                return (
                  <div
                    key={post.id}
                    className="bg-white border-2 border-b-4 border-[#E5E5E5] rounded-3xl p-5 space-y-4 shadow-xs"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-[#F7F7F7] border-2 border-[#E5E5E5] flex items-center justify-center text-2xl shrink-0">
                          {post.authorAvatarKey === 'mpaka'
                            ? '👴🏾'
                            : post.authorAvatarKey === 'nyango'
                            ? '👩🏾'
                            : '🧒🏾'}
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-[#3C3C3C] leading-snug">
                            {post.authorName}
                          </h4>
                          <p className="text-xs font-bold text-[#58CC02]">
                            {post.authorSageloName || 'Learner'} • {post.authorRegion}
                          </p>
                        </div>
                      </div>

                      <span className="px-2.5 py-1 bg-[#F7F7F7] border border-[#E5E5E5] rounded-xl text-[10px] font-black uppercase text-[#AFAFAF]">
                        -{post.evidentiality}
                      </span>
                    </div>

                    {/* Phrase content */}
                    <div className="p-4 rounded-2xl bg-[#F7F7F7] border-2 border-[#E5E5E5] space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-base font-black text-[#3C3C3C]">
                          {post.sageloText}
                        </p>
                        <button
                          onClick={() => playSageloPhrase(post.sageloText)}
                          className="w-8 h-8 rounded-xl bg-[#1CB0F6] text-white flex items-center justify-center shrink-0 border-b-2 border-[#1899D6] hover:brightness-105"
                          title="Listen to audio"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-xs font-bold text-[#777777]">
                        {post.englishTranslation}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between gap-3 pt-1">
                      <button
                        onClick={() => handleToggleShanti(post)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase flex items-center gap-1.5 transition-all ${
                          isLiked
                            ? 'bg-[#FEF2F2] border-2 border-[#FECACA] text-[#EF4444]'
                            : 'bg-[#F7F7F7] hover:bg-[#E5E5E5] text-[#777777]'
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${isLiked ? 'fill-[#EF4444]' : ''}`} />
                        <span>{post.shantiCount} Shanti</span>
                      </button>

                      <button
                        onClick={() => handleSaveToNotebook(post.sageloText, post.englishTranslation)}
                        className="px-3.5 py-2 bg-white border-2 border-b-4 border-[#E5E5E5] hover:bg-[#F7F7F7] rounded-xl text-xs font-black uppercase text-[#3C3C3C] flex items-center gap-1.5 transition-all active:translate-y-0.5"
                      >
                        <BookOpen className="w-3.5 h-3.5 text-[#1CB0F6]" />
                        <span>Save to Notebook</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
