import React, { useState, useEffect } from 'react';
import {
  Flame,
  Heart,
  Gem,
  Award,
  Zap,
  Play,
  RotateCcw,
  Volume2,
  CheckCircle2,
  Clock,
  ChevronRight,
  ChevronDown,
  MoreVertical,
  MoreHorizontal,
  Globe,
  Sparkles,
  Trophy,
  Shield,
  ShoppingBag,
  Compass,
  Star,
  Lock,
  BookOpen,
  User,
  Users,
  Search,
  Check,
  PlusCircle,
  HelpCircle,
  MessageSquare,
  Gift,
  LogIn,
  LogOut,
  Layers,
  GitBranch,
  ArrowRight,
} from 'lucide-react';
import type { UserAccount, CommunityPost } from './types';
import {
  SAGELO_CURRICULUM,
  ALL_LESSONS,
  CurriculumLesson,
  UNIT_CHECKPOINTS,
  UnitCheckpoint,
} from './data/sageloCurriculum';
import {
  FRENCH_CURRICULUM,
  ALL_FRENCH_LESSONS,
  FRENCH_UNIT_CHECKPOINTS,
} from './data/frenchCurriculum';
import {
  SKILL_BRANCHES,
  isBranchUnlocked,
  SkillBranch,
} from './data/sageloBranchingPaths';
import {
  FRENCH_SKILL_BRANCHES,
  isFrenchBranchUnlocked,
} from './data/frenchBranchingPaths';
import { LessonSessionModal } from './components/LessonSessionModal';
import { UnitCheckpointModal } from './components/UnitCheckpointModal';
import { CartoonCharacter } from './components/CartoonCharacters';
import { MatchMadnessGame } from './components/MatchMadnessGame';
import { PracticeLabView } from './components/PracticeLabView';
import { LexiconPhrasebookView } from './components/LexiconPhrasebookView';
import { DuolingoStoriesView } from './components/DuolingoStoriesView';
import { LanguageChoiceModal } from './components/LanguageChoiceModal';
import { AuthModal } from './components/AuthModal';
import { ConnectWithOthersView } from './components/ConnectWithOthersView';
import { PWAInstallButton } from './components/PWAInstallButton';
import { OfflineIndicator } from './components/OfflineIndicator';
import { playSageloPhrase } from './utils/sageloAudio';
import {
  auth,
  ensureAuth,
  syncUserProfileToFirestore,
  fetchUserProfileFromFirestore,
  logoutUser,
} from './lib/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';

const CLEAN_GUEST_USER: UserAccount = {
  id: 'guest',
  name: 'Sagelo Learner',
  sageloName: 'Misaga Learner',
  email: '',
  region: 'Africa',
  avatarKey: 'mwana',
  xp: 0,
  streakDays: 1,
  hearts: 5,
  dailyGoalXp: 50,
  todayXp: 0,
  completedLessons: [],
  lessonScores: {},
  masteredWords: [],
  notebook: [],
  followingIds: [], // STRICTLY EMPTY: zero inherited connections
  joinedAt: 'Recent',
  completedCheckpoints: [],
  masteryCertified: false,
};

function createCleanAccount(id: string, name?: string, email?: string): UserAccount {
  const displayName = (name || '').trim() || 'Sagelo Learner';
  const firstName = displayName.split(' ')[0] || 'Learner';
  return {
    id,
    name: displayName,
    sageloName: `Misaga ${firstName}`,
    email: email || '',
    region: 'Africa',
    avatarKey: 'mwana',
    xp: 0,
    streakDays: 1,
    hearts: 5,
    dailyGoalXp: 50,
    todayXp: 0,
    completedLessons: [],
    lessonScores: {},
    masteredWords: [],
    notebook: [],
    followingIds: [], // Zero dummy followings
    joinedAt: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    completedCheckpoints: [],
    masteryCertified: false,
  };
}

// Unit section color palette in Royal Emerald, Jade & Gold
const UNIT_THEMES = [
  {
    bg: 'bg-[#059669]', // Imperial Emerald
    border: 'border-[#047857]',
    lightBg: 'bg-[#059669]/10',
    text: 'text-[#059669]',
    name: 'Unit 0 • Foundations of Sagelo',
    guideTitle: 'The Philosophy of Sages & Sound Rules',
  },
  {
    bg: 'bg-[#0D9488]', // Radiant Jade
    border: 'border-[#0F766E]',
    lightBg: 'bg-[#0D9488]/10',
    text: 'text-[#0D9488]',
    name: 'Unit 1 • First Words & Core Roots',
    guideTitle: 'Core Nouns, Evidentiality Particles & Pronouns',
  },
  {
    bg: 'bg-[#D97706]', // Royal Gold
    border: 'border-[#B45309]',
    lightBg: 'bg-[#D97706]/10',
    text: 'text-[#D97706]',
    name: 'Unit 2 • Objects, Descriptions & Questions',
    guideTitle: 'Modifiers (-e), Food Stems & Interrogatives',
  },
  {
    bg: 'bg-[#10B981]', // Mint Jade
    border: 'border-[#059669]',
    lightBg: 'bg-[#10B981]/10',
    text: 'text-[#10B981]',
    name: 'Unit 3 • Numbers, Space & Time',
    guideTitle: 'Counting to Ten, Locatives & Clock Expressions',
  },
  {
    bg: 'bg-[#F59E0B]', // Amber Gold
    border: 'border-[#D97706]',
    lightBg: 'bg-[#F59E0B]/10',
    text: 'text-[#F59E0B]',
    name: 'Unit 4 • Action, Movement & Causation',
    guideTitle: 'Aspect Markers, Movement Roots & -ifi Causative',
  },
  {
    bg: 'bg-[#0F766E]', // Deep Teal Jade
    border: 'border-[#115E59]',
    lightBg: 'bg-[#0F766E]/10',
    text: 'text-[#0F766E]',
    name: 'Unit 5 • Social Ties & Market Life',
    guideTitle: 'Family Terms, Bargaining & Emotions',
  },
  {
    bg: 'bg-[#047857]', // Forest Emerald
    border: 'border-[#065F46]',
    lightBg: 'bg-[#047857]/10',
    text: 'text-[#047857]',
    name: 'Unit 6 • Abstract Thought & Discourse',
    guideTitle: 'Conjunctions, Relative Clauses & Evidential Nuance',
  },
  {
    bg: 'bg-[#EAB308]', // Grand Sovereign Gold
    border: 'border-[#CA8A04]',
    lightBg: 'bg-[#EAB308]/10',
    text: 'text-[#CA8A04]',
    name: 'Unit 7 • Wisdom, Literature & Mastery',
    guideTitle: 'Proverbs, Mantras & Final Synthesis Exam',
  },
];

const FRENCH_UNIT_THEMES = [
  {
    bg: 'bg-[#059669]', // Imperial Emerald
    border: 'border-[#047857]',
    lightBg: 'bg-[#059669]/10',
    text: 'text-[#059669]',
    name: 'Unité 1 • Salutations & Premiers Pas',
    guideTitle: 'Greetings, Courtesies & Essential Pronouns',
  },
  {
    bg: 'bg-[#0D9488]', // Radiant Jade
    border: 'border-[#0F766E]',
    lightBg: 'bg-[#0D9488]/10',
    text: 'text-[#0D9488]',
    name: 'Unité 2 • Café & Bistro Parisien',
    guideTitle: 'Food, Drinks & Restaurant Ordering',
  },
  {
    bg: 'bg-[#D97706]', // Royal Gold
    border: 'border-[#B45309]',
    lightBg: 'bg-[#D97706]/10',
    text: 'text-[#D97706]',
    name: 'Unité 3 • En Ville & Le Métro',
    guideTitle: 'City Navigation, Transport & Directions',
  },
  {
    bg: 'bg-[#10B981]', // Mint Jade
    border: 'border-[#059669]',
    lightBg: 'bg-[#10B981]/10',
    text: 'text-[#10B981]',
    name: 'Unité 4 • Famille, Heure & Routine',
    guideTitle: 'Family Members, Daily Schedule & Time',
  },
  {
    bg: 'bg-[#F59E0B]', // Amber Gold
    border: 'border-[#D97706]',
    lightBg: 'bg-[#F59E0B]/10',
    text: 'text-[#F59E0B]',
    name: 'Unité 5 • Marché, Shopping & Nombres',
    guideTitle: 'Market Stalls, Prices & Numbers 1-100',
  },
  {
    bg: 'bg-[#0F766E]', // Deep Teal Jade
    border: 'border-[#115E59]',
    lightBg: 'bg-[#0F766E]/10',
    text: 'text-[#0F766E]',
    name: 'Unité 6 • Le Passé Composé & Récits',
    guideTitle: 'Past Tense with Avoir & Être Auxiliaries',
  },
  {
    bg: 'bg-[#EAB308]', // Grand Sovereign Gold
    border: 'border-[#CA8A04]',
    lightBg: 'bg-[#EAB308]/10',
    text: 'text-[#CA8A04]',
    name: 'Unité 7 • Sagesse & Examen Final',
    guideTitle: 'French Proverbs, Idioms & Final Mastery Challenge',
  },
];

const SAGELO_BRANCH_BY_UNIT: Record<string, SkillBranch | undefined> = {
  'unit-1': SKILL_BRANCHES.find(b => b.id === 'branch-conversational'),
  'unit-2': SKILL_BRANCHES.find(b => b.id === 'branch-healing'),
  'unit-3': SKILL_BRANCHES.find(b => b.id === 'branch-business'),
  'unit-5': SKILL_BRANCHES.find(b => b.id === 'branch-philosophy'),
};

const FRENCH_BRANCH_BY_UNIT: Record<string, SkillBranch | undefined> = {
  'fr-unit-1': FRENCH_SKILL_BRANCHES.find(b => b.id === 'branch-fr-cafe'),
  'fr-unit-2': FRENCH_SKILL_BRANCHES.find(b => b.id === 'branch-fr-metro'),
  'fr-unit-3': FRENCH_SKILL_BRANCHES.find(b => b.id === 'branch-fr-business'),
  'fr-unit-5': FRENCH_SKILL_BRANCHES.find(b => b.id === 'branch-fr-slang'),
};

export default function App() {
  // Active course state: 'sagelo' or 'french' (Duolingo style course switching)
  const [activeCourse, setActiveCourse] = useState<'sagelo' | 'french'>(() => {
    try {
      const saved = localStorage.getItem('afrilingo_active_course');
      if (saved === 'french' || saved === 'sagelo') return saved;
    } catch {
      // ignore
    }
    return 'sagelo';
  });
  const [courseMenuOpen, setCourseMenuOpen] = useState(false);
  const [optionsMenuOpen, setOptionsMenuOpen] = useState(false);
  const [languageModalOpen, setLanguageModalOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('afrilingo_active_course', activeCourse);
    } catch {
      // ignore
    }
  }, [activeCourse]);

  const [activeTab, setActiveTab] = useState<
    | 'learn'
    | 'branches'
    | 'practice'
    | 'leaderboards'
    | 'quests'
    | 'connect'
    | 'shop'
    | 'stories'
    | 'dictionary'
    | 'profile'
  >('learn');

  const [learnViewMode, setLearnViewMode] = useState<'main_path' | 'branches'>('main_path');

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('signup');
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);

  const [user, setUser] = useState<UserAccount>(() => {
    try {
      const activeId = localStorage.getItem('afrilingo_active_user_id');
      if (activeId && activeId !== 'guest') {
        const saved = localStorage.getItem(`afrilingo_user_${activeId}`);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && parsed.id && parsed.id !== 'user-dienga') {
            return {
              ...parsed,
              followingIds: (parsed.followingIds || []).filter(
                (id: string) => id !== 'user-amina' && id !== 'user-kwame' && id !== 'user-dienga'
              ),
              notebook: (parsed.notebook || []).filter(
                (n: { id: string }) => n.id !== 'note-1' && n.id !== 'note-2'
              ),
            };
          }
        }
      }
      return CLEAN_GUEST_USER;
    } catch {
      return CLEAN_GUEST_USER;
    }
  });

  // Listen to Firebase Auth & restore Firestore user profile
  useEffect(() => {
    ensureAuth();
    const unsub = onAuthStateChanged(auth, async (u) => {
      setFirebaseUser(u);
      if (u && !u.isAnonymous) {
        const remoteProfile = await fetchUserProfileFromFirestore(u.uid);
        if (remoteProfile) {
          // Strictly load this specific user's authenticated profile - never inherit dummy account
          const cleanFollowing = (remoteProfile.followingIds || []).filter(
            (id: string) => id !== 'user-amina' && id !== 'user-kwame' && id !== 'user-dienga'
          );
          const cleanNotebook = (remoteProfile.notebook || []).filter(
            (n: { id: string }) => n.id !== 'note-1' && n.id !== 'note-2'
          );
          const cleanUser: UserAccount = {
            id: u.uid,
            name: remoteProfile.name || u.displayName || 'Sagelo Learner',
            email: u.email || remoteProfile.email || '',
            sageloName: remoteProfile.sageloName || `Misaga ${u.displayName || 'Learner'}`,
            region: remoteProfile.region || 'Africa',
            avatarKey: remoteProfile.avatarKey || 'mwana',
            xp: remoteProfile.xp ?? 0,
            streakDays: remoteProfile.streakDays ?? 1,
            hearts: remoteProfile.hearts ?? 5,
            dailyGoalXp: remoteProfile.dailyGoalXp ?? 50,
            todayXp: remoteProfile.todayXp ?? 0,
            completedLessons: remoteProfile.completedLessons || [],
            lessonScores: remoteProfile.lessonScores || {},
            masteredWords: remoteProfile.masteredWords || [],
            notebook: cleanNotebook,
            followingIds: cleanFollowing, // Only who this user is actually connected to
            completedCheckpoints: remoteProfile.completedCheckpoints || [],
            masteryCertified: remoteProfile.masteryCertified || false,
            graduationDate: remoteProfile.graduationDate,
            joinedAt: remoteProfile.joinedAt || 'October 2026',
          };
          setUser(cleanUser);
          try {
            localStorage.setItem('afrilingo_active_user_id', u.uid);
            localStorage.setItem(`afrilingo_user_${u.uid}`, JSON.stringify(cleanUser));
          } catch {}
        } else {
          // Brand new user: initialize a clean account without dummy inheritance
          const newUser = createCleanAccount(u.uid, u.displayName || undefined, u.email || undefined);
          setUser(newUser);
          try {
            localStorage.setItem('afrilingo_active_user_id', u.uid);
            localStorage.setItem(`afrilingo_user_${u.uid}`, JSON.stringify(newUser));
          } catch {}
          syncUserProfileToFirestore(newUser);
        }
      }
    });
    return () => unsub();
  }, []);

  const [activeLesson, setActiveLesson] = useState<CurriculumLesson | null>(null);
  const [activeCheckpoint, setActiveCheckpoint] = useState<UnitCheckpoint | null>(null);
  const [guidebookUnit, setGuidebookUnit] = useState<number | null>(null);
  const [chestModal, setChestModal] = useState<{ gems: number } | null>(null);

  // Match Madness mini-game state (in practice tab)
  const [matchActive, setMatchActive] = useState(false);
  const [matchTimer, setMatchTimer] = useState(45);
  const [matchScore, setMatchScore] = useState(0);
  const [selectedMatch, setSelectedMatch] = useState<{
    id: string;
    type: 'sagelo' | 'english';
    text: string;
  } | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<string[]>([]);

  // Daily Quests state
  const [claimedQuests, setClaimedQuests] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('afrilingo_claimed_quests_v2');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Calculate cowrie gems
  const cowrieGems = 480 + (user.xp % 500);

  // Active course derived curriculum and assets
  const isFrench = activeCourse === 'french';
  const currentCurriculum = isFrench ? FRENCH_CURRICULUM : SAGELO_CURRICULUM;
  const currentAllLessons = isFrench ? ALL_FRENCH_LESSONS : ALL_LESSONS;
  const currentCheckpoints = isFrench ? FRENCH_UNIT_CHECKPOINTS : UNIT_CHECKPOINTS;
  const currentBranchByUnit = isFrench ? FRENCH_BRANCH_BY_UNIT : SAGELO_BRANCH_BY_UNIT;
  const currentSkillBranches = isFrench ? FRENCH_SKILL_BRANCHES : SKILL_BRANCHES;
  const currentUnitThemes = isFrench ? FRENCH_UNIT_THEMES : UNIT_THEMES;
  const checkBranchUnlocked = isFrench ? isFrenchBranchUnlocked : isBranchUnlocked;

  // Filter completed lessons for active course
  const sageloCompletedLessons = user.completedLessons.filter((id) => !id.startsWith('fr-'));
  const frenchCompletedLessons = user.completedLessons.filter((id) => id.startsWith('fr-'));
  const activeCourseCompletedLessons = isFrench ? frenchCompletedLessons : sageloCompletedLessons;
  const unlockedBranchCount = currentSkillBranches.filter(
    (b) => checkBranchUnlocked(b, user.completedLessons).isUnlocked
  ).length;

  // Save user changes both locally and in Firestore
  const updateUser = (updated: UserAccount) => {
    setUser(updated);
    try {
      localStorage.setItem(`afrilingo_user_${updated.id}`, JSON.stringify(updated));
      localStorage.setItem('afrilingo_active_user_id', updated.id);
    } catch {
      // ignore
    }
    syncUserProfileToFirestore(updated);
  };

  const handleLessonComplete = (result: {
    lessonId: string;
    score: number;
    xpEarned: number;
    newWords: string[];
    isFirstTime?: boolean;
  }) => {
    setActiveLesson(null);
    const isFirstTime = !user.completedLessons.includes(result.lessonId);
    // Strict enforcement: points are earned once. Repeating a lesson gives 0 points.
    const effectiveXpEarned = isFirstTime ? result.xpEarned : 0;

    const updatedCompleted = isFirstTime
      ? [...user.completedLessons, result.lessonId]
      : user.completedLessons;
    const updatedWords = Array.from(
      new Set([...user.masteredWords, ...result.newWords])
    );
    const updated: UserAccount = {
      ...user,
      xp: user.xp + effectiveXpEarned,
      todayXp: user.todayXp + effectiveXpEarned,
      completedLessons: updatedCompleted,
      lessonScores: {
        ...user.lessonScores,
        [result.lessonId]: Math.max(
          user.lessonScores[result.lessonId] || 0,
          result.score
        ),
      },
      masteredWords: updatedWords,
    };
    updateUser(updated);
  };

  const handleAuthSuccess = (updatedData: Partial<UserAccount>) => {
    setUser((prev) => {
      const isSwitching = updatedData.id && updatedData.id !== prev.id;
      const base: UserAccount = isSwitching
        ? createCleanAccount(updatedData.id!, updatedData.name, updatedData.email)
        : prev;

      // Filter out any dummy account IDs so they are NEVER inherited
      const cleanFollowing = (updatedData.followingIds ?? base.followingIds ?? []).filter(
        (id) => id !== 'user-amina' && id !== 'user-kwame' && id !== 'user-dienga'
      );
      const cleanNotebook = (updatedData.notebook ?? base.notebook ?? []).filter(
        (n) => n.id !== 'note-1' && n.id !== 'note-2'
      );

      const updated: UserAccount = {
        ...base,
        ...updatedData,
        followingIds: cleanFollowing,
        notebook: cleanNotebook,
      };

      try {
        localStorage.setItem(`afrilingo_user_${updated.id}`, JSON.stringify(updated));
        localStorage.setItem('afrilingo_active_user_id', updated.id);
      } catch {}
      syncUserProfileToFirestore(updated);
      return updated;
    });
  };

  const handleCheckpointComplete = (
    checkpointId: string,
    xpEarned: number,
    isFinalGraduation?: boolean
  ) => {
    const isAlreadyDone = (user.completedCheckpoints || []).includes(checkpointId);
    // Strict enforcement: checkpoints also only award XP on first pass
    const effectiveXp = isAlreadyDone ? 0 : xpEarned;

    const updatedCheckpoints = isAlreadyDone
      ? user.completedCheckpoints || []
      : [...(user.completedCheckpoints || []), checkpointId];

    const updated: UserAccount = {
      ...user,
      xp: user.xp + effectiveXp,
      todayXp: user.todayXp + effectiveXp,
      completedCheckpoints: updatedCheckpoints,
      masteryCertified: isFinalGraduation ? true : user.masteryCertified,
      graduationDate: isFinalGraduation ? new Date().toISOString() : user.graduationDate,
    };
    updateUser(updated);
  };

  const handleClaimChest = () => {
    const reward = 20;
    setChestModal({ gems: reward });
    updateUser({
      ...user,
      xp: user.xp + 15,
      todayXp: user.todayXp + 15,
    });
  };

  const handleRefillHearts = () => {
    updateUser({
      ...user,
      hearts: 5,
    });
  };

  // Match Madness timer
  useEffect(() => {
    if (!matchActive || matchTimer <= 0) return;
    const interval = setInterval(() => {
      setMatchTimer(prev => {
        if (prev <= 1) {
          setMatchActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [matchActive, matchTimer]);

  const MATCH_PAIRS = [
    { id: '1', sagelo: 'shanti', english: 'peace / hello' },
    { id: '2', sagelo: 'wai', english: 'water' },
    { id: '3', sagelo: 'jua', english: 'sun / day' },
    { id: '4', sagelo: 'mun', english: 'moon / night' },
    { id: '5', sagelo: 'ndeko', english: 'friend / brother' },
    { id: '6', sagelo: 'sago', english: 'wisdom' },
    { id: '7', sagelo: 'lume', english: 'light / brightness' },
    { id: '8', sagelo: 'voli', english: 'want / wish' },
  ];

  const handleTileClick = (tile: {
    id: string;
    type: 'sagelo' | 'english';
    text: string;
  }) => {
    if (matchedPairs.includes(tile.id)) return;
    if (!selectedMatch) {
      setSelectedMatch(tile);
      if (tile.type === 'sagelo') playSageloPhrase(tile.text);
      return;
    }
    if (selectedMatch.type === tile.type) {
      setSelectedMatch(tile);
      return;
    }
    if (selectedMatch.id === tile.id) {
      setMatchedPairs(prev => [...prev, tile.id]);
      setMatchScore(prev => prev + 10);
      setSelectedMatch(null);
      if (tile.type === 'sagelo') playSageloPhrase(tile.text);
      if (matchedPairs.length + 1 >= MATCH_PAIRS.length) {
        setTimeout(() => {
          updateUser({
            ...user,
            xp: user.xp + 25,
            todayXp: user.todayXp + 25,
          });
        }, 300);
      }
    } else {
      setSelectedMatch(null);
    }
  };

  // Quests definitions
  const quests = [
    {
      id: 'quest-xp',
      title: 'Earn 30 XP Today',
      description: 'Complete lessons or practice drills to grow your wisdom.',
      progress: Math.min(user.todayXp, 30),
      goal: 30,
      reward: 15,
      completed: user.todayXp >= 30,
    },
    {
      id: 'quest-lessons',
      title: 'Complete 2 Sagelo Lessons',
      description: 'Advance on the stepping-stone learning trail.',
      progress: Math.min(user.completedLessons.length, 2),
      goal: 2,
      reward: 20,
      completed: user.completedLessons.length >= 2,
    },
    {
      id: 'quest-words',
      title: 'Master 5 Core Roots',
      description: 'Commit foundational nouns and verbs to memory.',
      progress: Math.min(user.masteredWords.length, 5),
      goal: 5,
      reward: 25,
      completed: user.masteredWords.length >= 5,
    },
  ];

  const handleClaimQuest = (questId: string, rewardXp: number) => {
    if (claimedQuests.includes(questId)) return;
    const updated = [...claimedQuests, questId];
    setClaimedQuests(updated);
    try {
      localStorage.setItem('afrilingo_claimed_quests_v2', JSON.stringify(updated));
    } catch {
      // ignore
    }
    updateUser({
      ...user,
      xp: user.xp + rewardXp,
      todayXp: user.todayXp + rewardXp,
    });
  };

  // Savannah Leagues Leaderboard
  const leagueRanks = [
    { rank: 1, name: 'Amina Diop', country: '🇸🇳 Senegal', xp: 520, isUser: false, avatar: '🧕🏾' },
    { rank: 2, name: 'Kwame Mensah', country: '🇬🇭 Ghana', xp: 480, isUser: false, avatar: '👨🏾‍🦱' },
    {
      rank: 3,
      name: `${user.name} (You)`,
      country: `🇨🇲 ${user.region}`,
      xp: user.xp,
      isUser: true,
      avatar: '🧒🏾',
    },
    { rank: 4, name: 'Zola Dlamini', country: '🇿🇦 South Africa', xp: 310, isUser: false, avatar: '👩🏾' },
    { rank: 5, name: 'Tariq Al-Mansur', country: '🇪🇬 Egypt', xp: 275, isUser: false, avatar: '👳🏾‍♂️' },
    { rank: 6, name: 'Chinedu Eze', country: '🇳🇬 Nigeria', xp: 210, isUser: false, avatar: '👨🏾' },
    { rank: 7, name: 'Fatoumata Traore', country: '🇲🇱 Mali', xp: 180, isUser: false, avatar: '👩🏾‍🦱' },
  ];

  return (
    <div className="min-h-screen bg-[#150E09] text-[#FEF3C7] flex flex-col md:flex-row font-['Nunito',sans-serif] w-full max-w-full overflow-x-hidden">
      {/* 1. DUOLINGO LEFT SIDEBAR (STICKY DESKTOP) */}
      <aside className="w-64 border-r-2 border-[#3D2619] bg-[#1E130D] h-screen sticky top-0 hidden md:flex flex-col justify-between p-4 z-40 select-none shrink-0 text-[#FEF3C7]">
        <div className="space-y-6">
          {/* Duolingo Wordmark / Logo in Royal Emerald */}
          <div className="px-3 pt-2 flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#059669] border-b-4 border-[#047857] flex items-center justify-center text-white text-2xl shadow-sm">
              🦜
            </div>
            <div>
              <span className="text-2xl font-black tracking-tight text-[#10B981]">
                afrilingo
              </span>
              <p className="text-[10px] font-black uppercase tracking-wider text-[#D4A373] -mt-1">
                {isFrench ? 'Learn French' : 'Learn Sagelo'}
              </p>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1.5">
            <button
              onClick={() => {
                setActiveTab('learn');
                setLearnViewMode('main_path');
              }}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl font-black text-sm uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'learn'
                  ? 'bg-[#059669]/25 text-[#10B981] border-2 border-[#059669]'
                  : 'text-[#D4A373] hover:bg-[#2A1C14] hover:text-[#FEF3C7]'
              }`}
            >
              <Compass className="w-6 h-6 text-[#10B981]" />
              <span>LEARN</span>
            </button>

            <button
              onClick={() => setActiveTab('practice')}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl font-black text-sm uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'practice'
                  ? 'bg-[#0D9488]/25 text-[#14B8A6] border-2 border-[#0D9488]'
                  : 'text-[#D4A373] hover:bg-[#2A1C14] hover:text-[#FEF3C7]'
              }`}
            >
              <Zap className="w-6 h-6 text-[#14B8A6]" />
              <span>PRACTICE</span>
            </button>

            <button
              onClick={() => setActiveTab('connect')}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl font-black text-sm uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'connect'
                  ? 'bg-[#059669]/25 text-[#10B981] border-2 border-[#059669]'
                  : 'text-[#D4A373] hover:bg-[#2A1C14] hover:text-[#FEF3C7]'
              }`}
            >
              <Users className="w-6 h-6 text-[#10B981]" />
              <span>CONNECT</span>
            </button>

            <button
              onClick={() => setActiveTab('leaderboards')}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl font-black text-sm uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'leaderboards'
                  ? 'bg-[#F59E0B]/25 text-[#FBBF24] border-2 border-[#F59E0B]'
                  : 'text-[#D4A373] hover:bg-[#2A1C14] hover:text-[#FEF3C7]'
              }`}
            >
              <Shield className="w-6 h-6 text-[#F59E0B]" />
              <span>LEADERBOARDS</span>
            </button>

            <button
              onClick={() => setActiveTab('quests')}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl font-black text-sm uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'quests'
                  ? 'bg-[#F59E0B]/25 text-[#FBBF24] border-2 border-[#F59E0B]'
                  : 'text-[#D4A373] hover:bg-[#2A1C14] hover:text-[#FEF3C7]'
              }`}
            >
              <Trophy className="w-6 h-6 text-[#F59E0B]" />
              <span>QUESTS</span>
            </button>

            <button
              onClick={() => setActiveTab('shop')}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl font-black text-sm uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'shop'
                  ? 'bg-[#0D9488]/25 text-[#14B8A6] border-2 border-[#0D9488]'
                  : 'text-[#D4A373] hover:bg-[#2A1C14] hover:text-[#FEF3C7]'
              }`}
            >
              <ShoppingBag className="w-6 h-6 text-[#14B8A6]" />
              <span>SHOP</span>
            </button>

            <button
              onClick={() => setActiveTab('stories')}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl font-black text-sm uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'stories'
                  ? 'bg-[#059669]/25 text-[#10B981] border-2 border-[#059669]'
                  : 'text-[#D4A373] hover:bg-[#2A1C14] hover:text-[#FEF3C7]'
              }`}
            >
              <BookOpen className="w-6 h-6 text-[#10B981]" />
              <span>STORIES</span>
            </button>

            <button
              onClick={() => setActiveTab('dictionary')}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl font-black text-sm uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'dictionary'
                  ? 'bg-[#0D9488]/25 text-[#14B8A6] border-2 border-[#0D9488]'
                  : 'text-[#D4A373] hover:bg-[#2A1C14] hover:text-[#FEF3C7]'
              }`}
            >
              <Search className="w-6 h-6 text-[#14B8A6]" />
              <span>DICTIONARY</span>
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl font-black text-sm uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'profile'
                  ? 'bg-[#059669]/25 text-[#10B981] border-2 border-[#059669]'
                  : 'text-[#D4A373] hover:bg-[#2A1C14] hover:text-[#FEF3C7]'
              }`}
            >
              <User className="w-6 h-6 text-[#10B981]" />
              <span>PROFILE</span>
            </button>
          </nav>
        </div>

        {/* Install AfriLingo Banner in Sidebar */}
        <PWAInstallButton variant="sidebar" />

        {/* Bottom Course Flag Pill with Click-to-Choose Languages */}
        <div className="relative">
          <button
            onClick={() => setLanguageModalOpen(true)}
            className="w-full p-3 bg-[#241710] hover:bg-[#2C1D14] border-2 border-[#3D2619] hover:border-[#059669] rounded-2xl flex items-center justify-between text-left transition-all cursor-pointer group shadow-xs active:translate-y-0.5"
            title="Choose Languages (Duolingo Style)"
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-2xl select-none shrink-0 group-hover:scale-110 transition-transform">
                {isFrench ? '🇫🇷' : '🌍'}
              </span>
              <div className="min-w-0 truncate">
                <div className="text-xs font-black text-[#FEF3C7] flex items-center gap-1.5">
                  <span className="truncate">{isFrench ? 'French Course' : 'Sagelo Course'}</span>
                  <span className="text-[9px] font-extrabold text-[#10B981] bg-[#059669]/20 px-1.5 py-0.2 rounded-md shrink-0 border border-[#059669]/30">
                    Active
                  </span>
                </div>
                <div className="text-[11px] font-bold text-[#D4A373] truncate flex items-center gap-1">
                  <span>{activeCourseCompletedLessons.length} / {currentAllLessons.length}</span>
                  <span className="text-[#F59E0B] font-black underline">Switch</span>
                </div>
              </div>
            </div>
            <Globe className="w-4 h-4 text-[#D4A373] group-hover:text-[#10B981] transition-colors shrink-0" />
          </button>
        </div>
      </aside>

      {/* 2. MAIN CENTER + RIGHT AREA */}
      <div className="flex-1 flex flex-col min-w-0 w-full max-w-full">
        {/* DUOLINGO TOP FLOATING STATUS BAR (EMERALD, JADE & GOLD ON RICH WOOD) */}
        <header className="sticky top-0 z-[99] bg-[#1E130D]/95 backdrop-blur-md border-b-2 border-[#3D2619] px-3 sm:px-8 py-2.5 sm:py-3 flex items-center justify-between gap-2 max-w-full">
          <div className="flex items-center gap-2 md:hidden shrink-0">
            <span className="text-2xl">🦜</span>
            <span className="text-lg sm:text-xl font-black tracking-tight text-[#10B981]">
              afrilingo
            </span>
            {/* Mobile Language Chooser Button */}
            <button
              onClick={() => setLanguageModalOpen(true)}
              className="ml-1 px-2.5 py-1 bg-[#241710] hover:bg-[#2C1D14] border-2 border-[#3D2619] hover:border-[#059669] rounded-xl text-xs font-black text-[#FEF3C7] flex items-center gap-1 cursor-pointer active:translate-y-0.5 transition-colors"
              title="Choose Language (Duolingo Style)"
            >
              <span className="text-base select-none">{isFrench ? '🇫🇷' : '🌍'}</span>
              <span className="text-[10px] uppercase font-black text-[#10B981]">Switch</span>
            </button>
          </div>

          {/* Desktop Language Selector / Course Switcher (Duolingo Style) */}
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={() => setLanguageModalOpen(true)}
              className="px-3.5 py-1.5 bg-[#241710] hover:bg-[#2C1D14] border-2 border-[#3D2619] hover:border-[#059669] rounded-2xl text-xs font-black text-[#FEF3C7] flex items-center gap-2.5 transition-all cursor-pointer shadow-xs active:translate-y-0.5 group"
              title="Choose Language to Learn (Duolingo Style)"
            >
              <span className="text-xl select-none group-hover:scale-110 transition-transform">
                {isFrench ? '🇫🇷' : '🌍'}
              </span>
              <span className="uppercase tracking-wider text-[10px] text-[#D4A373]">COURSE:</span>
              <span className="font-black text-sm text-[#10B981]">
                {isFrench ? 'Français' : 'Sagelo'}
              </span>
              <span className="text-[10px] bg-[#1C120B] px-2 py-0.5 rounded-full font-mono font-black text-[#FEF3C7] border border-[#3D2619]">
                {activeCourseCompletedLessons.length}/{currentAllLessons.length}
              </span>
              <span className="text-[10px] bg-[#059669] text-[#FEF3C7] px-2 py-0.5 rounded-lg font-black uppercase tracking-wider shadow-2xs">
                Languages 🌐
              </span>
            </button>
          </div>

          {/* Gamification Badges: Streak, Gems, Hearts, 3-Dot Options & Profile */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Flame Streak in Sovereign Gold */}
            <div
              className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 bg-[#241710] border-2 border-[#D97706]/50 rounded-2xl font-mono-num font-black text-xs sm:text-sm text-[#F59E0B] shadow-xs cursor-default"
              title="Daily Learning Streak (Gold)"
            >
              <Flame className="w-3.5 h-3.5 sm:w-5 sm:h-5 fill-[#F59E0B] text-[#F59E0B] animate-pulse" />
              <span>{user.streakDays}</span>
            </div>

            {/* Cowrie Gems in Warm Burnished Gold & Jade */}
            <div
              className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 bg-[#241710] border-2 border-[#0D9488]/50 rounded-2xl font-mono-num font-black text-xs sm:text-sm text-[#14B8A6] shadow-xs cursor-default"
              title="Cowrie Gems / Lingots (Gold & Jade)"
            >
              <Gem className="w-3.5 h-3.5 sm:w-5 sm:h-5 fill-[#14B8A6] text-[#14B8A6]" />
              <span>{cowrieGems}</span>
            </div>

            {/* Chi / Hearts in Emerald */}
            <button
              onClick={handleRefillHearts}
              className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 bg-[#241710] border-2 border-[#059669]/50 hover:bg-[#2C1D14] rounded-2xl font-mono-num font-black text-xs sm:text-sm text-[#10B981] shadow-xs transition-colors cursor-pointer"
              title="Hearts / Life Energy (Click to refill)"
            >
              <Heart className="w-3.5 h-3.5 sm:w-5 sm:h-5 fill-[#10B981] text-[#10B981]" />
              <span>{user.hearts}</span>
            </button>

            {/* Master Graduation Seal Pill (if certified) */}
            {user.masteryCertified && (
              <button
                onClick={() => {
                  const masteryCp = currentCheckpoints[isFrench ? 'fr-unit-7' : 'unit-mastery'];
                  if (masteryCp) setActiveCheckpoint(masteryCp);
                }}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 bg-[#241710] hover:bg-[#2C1D14] border-2 border-[#F59E0B] rounded-2xl text-xs font-black text-[#F59E0B] shadow-xs transition-colors shrink-0 animate-pulse cursor-pointer"
                title={isFrench ? 'View Official French Diploma' : 'View Official Master of Sagelo Graduation Diploma'}
              >
                <span>👑</span>
                <span className="hidden sm:inline">{isFrench ? 'Diplôme Français' : 'Master Misaga'}</span>
              </button>
            )}

            {/* 3-DOT OPTIONS BUTTON (Languages, Profile, Mini-games) */}
            <div className="relative z-[100]">
              <button
                onClick={() => setOptionsMenuOpen(!optionsMenuOpen)}
                className={`p-2 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-center ${
                  optionsMenuOpen
                    ? 'bg-[#059669] text-[#FEF3C7] border-[#047857] shadow-lg ring-2 ring-[#059669]/40'
                    : 'bg-[#241710] hover:bg-[#2C1D14] text-[#F59E0B] border-[#3D2619] hover:border-[#F59E0B]'
                }`}
                title="Options & Language Selection"
                aria-label="More options"
              >
                <MoreVertical className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              {/* 3-Dot Options Dropdown Menu (Guaranteed on Top of All Elements) */}
              {optionsMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-2xs"
                    onClick={() => setOptionsMenuOpen(false)}
                  />
                  <div className="absolute top-full right-0 mt-2 w-76 bg-[#241710] rounded-3xl border-2 border-b-6 border-[#F59E0B] p-3 shadow-2xl z-[101] space-y-2 text-[#FEF3C7] animate-in fade-in slide-in-from-top-2">
                    <div className="px-3 py-1 text-[11px] font-black uppercase tracking-wider text-[#D4A373] flex items-center justify-between border-b border-[#3D2619] pb-2">
                      <span>AfriLingo Menu</span>
                      <span className="text-[10px] text-[#F59E0B] font-black">Woodland Sovereign</span>
                    </div>

                    {/* Option 1: Choose Language to Learn (Duolingo style) */}
                    <button
                      onClick={() => {
                        setOptionsMenuOpen(false);
                        setLanguageModalOpen(true);
                      }}
                      className="w-full p-3 rounded-2xl border-2 border-[#3D2619] hover:border-[#059669] bg-[#1C120B] hover:bg-[#2C1D14] flex items-center justify-between text-left transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#059669]/20 text-[#10B981] flex items-center justify-center text-lg shrink-0 group-hover:scale-105 transition-transform border border-[#059669]/30">
                          🌐
                        </div>
                        <div>
                          <div className="text-xs font-black text-[#FEF3C7]">
                            Choose Language
                          </div>
                          <p className="text-[10px] font-bold text-[#D4A373]">
                            {isFrench ? '🇫🇷 French Active' : '🌍 Sagelo Active'} • Switch Course
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#D4A373] group-hover:text-[#10B981] transition-colors" />
                    </button>

                    {/* Option 2: Profile & Skill Tracks */}
                    <button
                      onClick={() => {
                        setOptionsMenuOpen(false);
                        setActiveTab('profile');
                      }}
                      className="w-full p-3 rounded-2xl border-2 border-[#3D2619] hover:border-[#F59E0B] bg-[#1C120B] hover:bg-[#2C1D14] flex items-center justify-between text-left transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#F59E0B]/20 text-[#F59E0B] flex items-center justify-center text-lg shrink-0 group-hover:scale-105 transition-transform border border-[#F59E0B]/30">
                          👤
                        </div>
                        <div>
                          <div className="text-xs font-black text-[#FEF3C7] flex items-center gap-1.5">
                            <span>Profile & Skill Tracks</span>
                            <span className="text-[9px] bg-[#059669] text-white px-1.5 py-0.2 rounded-full font-black">
                              {unlockedBranchCount} Tracks
                            </span>
                          </div>
                          <p className="text-[10px] font-bold text-[#D4A373]">
                            Stats, certificates & branches
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#D4A373] group-hover:text-[#F59E0B] transition-colors" />
                    </button>

                    {/* Option 3: Rapid Practice Mini-game */}
                    <button
                      onClick={() => {
                        setOptionsMenuOpen(false);
                        setActiveTab('practice');
                      }}
                      className="w-full p-3 rounded-2xl border-2 border-[#3D2619] hover:border-[#0D9488] bg-[#1C120B] hover:bg-[#2C1D14] flex items-center justify-between text-left transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#0D9488]/20 text-[#14B8A6] flex items-center justify-center text-lg shrink-0 group-hover:scale-105 transition-transform border border-[#0D9488]/30">
                          ⚡
                        </div>
                        <div>
                          <div className="text-xs font-black text-[#FEF3C7]">
                            Match Madness Practice
                          </div>
                          <p className="text-[10px] font-bold text-[#D4A373]">
                            45s rapid recall mini-game
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#D4A373] group-hover:text-[#14B8A6] transition-colors" />
                    </button>

                    {/* Theme Badge */}
                    <div className="p-2.5 rounded-xl bg-[#1C120B] border border-[#3D2619] flex items-center justify-between text-[11px] font-bold text-[#FEF3C7]">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#059669]" />
                        <span className="w-2.5 h-2.5 rounded-full bg-[#0D9488]" />
                        <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
                        <span className="font-black text-[10px] uppercase text-[#10B981]">Emerald, Jade & Gold</span>
                      </div>
                      <span className="text-[10px] font-mono text-[#F59E0B] font-black">Timber</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Account Profile / Sign In Pill */}
            <button
              onClick={() => {
                if (firebaseUser && !firebaseUser.isAnonymous) {
                  setActiveTab('profile');
                } else {
                  setAuthModalMode('signup');
                  setAuthModalOpen(true);
                }
              }}
              className="flex items-center gap-1 px-2.5 sm:px-3 py-1 sm:py-1.5 bg-[#241710] hover:bg-[#2C1D14] border-2 border-[#059669] rounded-2xl text-xs font-black text-[#10B981] shadow-xs transition-colors shrink-0 cursor-pointer"
              title={firebaseUser && !firebaseUser.isAnonymous ? `Signed in as ${user.email}` : 'Sign In / Create Account'}
            >
              <span className="text-base sm:text-lg">
                {user.avatarKey === 'mpaka' ? '👴🏾' : user.avatarKey === 'nyango' ? '👩🏾' : '🧒🏾'}
              </span>
              <span className="hidden sm:inline">
                {firebaseUser && !firebaseUser.isAnonymous ? user.name.split(' ')[0] : 'Sign In'}
              </span>
            </button>

            {/* Install App Quick Action */}
            <PWAInstallButton variant="compact" />
          </div>
        </header>

        {/* VIEWPORT CONTAINER */}
        <div className="flex-1 max-w-6xl w-full mx-auto px-3 sm:px-6 py-6 sm:py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 pb-24 md:pb-8 overflow-x-hidden">
          {/* CENTER COLUMN: ACTIVE TAB CONTENT */}
          <main className="lg:col-span-8 space-y-8">
            {/* TAB 1: THE DUOLINGO WINDING PATH (WITH MERGED BRANCH OUTPOSTS) */}
            {activeTab === 'learn' && (
              <div className="space-y-12">
                {/* Loop across all course Units */}
                {currentCurriculum.map((unit, unitIndex) => {
                  const theme = currentUnitThemes[unitIndex % currentUnitThemes.length];
                      return (
                        <div key={unit.id} className="space-y-8">
                      {/* DUOLINGO UNIT HEADER CARD */}
                      <div
                        className={`${theme.bg} ${theme.border} border-b-6 text-white rounded-3xl p-6 sm:p-7 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4`}
                      >
                        <div className="space-y-1">
                          <span className="text-xs font-black uppercase tracking-wider text-white/80">
                            {isFrench ? `SECTION 1 • UNITÉ ${unitIndex + 1}` : `SECTION 1 • UNIT ${unitIndex}`}
                          </span>
                          <h2 className="text-2xl font-black tracking-tight text-white">
                            {unit.title}
                          </h2>
                          <p className="text-xs font-bold text-white/90 max-w-md">
                            {unit.subtitle}
                          </p>
                        </div>

                        <button
                          onClick={() => setGuidebookUnit(unitIndex)}
                          className="bg-[#241710]/80 hover:bg-[#2C1D14] border-2 border-[#FEF3C7]/40 text-[#FEF3C7] font-black text-xs uppercase tracking-wider px-4 py-2.5 rounded-2xl flex items-center gap-2 self-start sm:self-center transition-all active:translate-y-0.5 cursor-pointer shadow-xs"
                        >
                          <BookOpen className="w-4 h-4 text-[#F59E0B]" />
                          <span>GUIDEBOOK</span>
                        </button>
                      </div>

                      {/* STEPPING-STONE WINDING PATH */}
                      <div className="relative py-4 flex flex-col items-center space-y-8">
                        {unit.lessons.map((lesson, lessonIndex) => {
                          const isCompleted = user.completedLessons.includes(
                            lesson.id
                          );
                          const isCurrent =
                            !isCompleted &&
                            (lessonIndex === 0 ||
                              user.completedLessons.includes(
                                unit.lessons[lessonIndex - 1]?.id || ''
                              ));
                          const isLocked = !isCompleted && !isCurrent;

                          // Duolingo snake offset pattern (gentle on mobile to prevent horizontal scrolling)
                          const offsets = [
                            'translate-x-0',
                            'translate-x-6 sm:translate-x-14',
                            'translate-x-10 sm:translate-x-24',
                            'translate-x-6 sm:translate-x-14',
                            'translate-x-0',
                            '-translate-x-6 sm:-translate-x-14',
                            '-translate-x-10 sm:-translate-x-24',
                            '-translate-x-6 sm:-translate-x-14',
                          ];
                          const offsetClass = offsets[lessonIndex % offsets.length];

                          return (
                            <div
                              key={lesson.id}
                              className={`relative flex flex-col items-center transition-all ${offsetClass}`}
                            >
                              {/* Duolingo Jumping "START" Speech Bubble */}
                              {isCurrent && (
                                <div className="mb-2 bg-[#059669] text-[#FEF3C7] text-xs font-black uppercase px-4 py-1.5 rounded-2xl shadow-md border-b-2 border-[#047857] animate-bounce tracking-wider flex items-center gap-1.5 z-10">
                                  <span>START +{lesson.xpReward} XP</span>
                                </div>
                              )}

                              {/* 3D Round Duolingo Button */}
                              <button
                                onClick={() => !isLocked && setActiveLesson(lesson)}
                                disabled={isLocked}
                                title={
                                  isCompleted
                                    ? `Review ${lesson.title} (0 XP - points already earned)`
                                    : isCurrent
                                    ? `Start ${lesson.title} (+${lesson.xpReward} XP)`
                                    : `Locked - ${lesson.title}`
                                }
                                className={`relative w-20 h-20 rounded-full flex flex-col items-center justify-center transition-all duration-150 active:translate-y-1 ${
                                  isCompleted
                                    ? 'bg-[#F59E0B] border-b-6 border-[#D97706] hover:brightness-105 shadow-md text-[#1E130D] cursor-pointer'
                                    : isCurrent
                                    ? 'bg-[#059669] border-b-6 border-[#047857] hover:brightness-105 shadow-xl text-[#FEF3C7] ring-8 ring-[#059669]/25 cursor-pointer'
                                    : 'bg-[#241710] border-b-6 border-[#1B110B] text-[#6B4E3D] cursor-not-allowed'
                                }`}
                              >
                                {isCompleted ? (
                                  <CheckCircle2 className="w-9 h-9 stroke-[3]" />
                                ) : isCurrent ? (
                                  <Star className="w-9 h-9 fill-[#FEF3C7] text-[#FEF3C7] stroke-[2.5]" />
                                ) : (
                                  <Lock className="w-8 h-8 stroke-[2.5]" />
                                )}
                              </button>

                              {/* Lesson title label */}
                              <div className="mt-2 text-center max-w-[140px]">
                                <p className="text-xs font-black text-[#FEF3C7] leading-tight line-clamp-1">
                                  {lesson.title}
                                </p>
                                <span className="text-[10px] font-bold text-[#D4A373]">
                                  {isCompleted
                                    ? `${lesson.numberLabel} • Review (0 XP)`
                                    : `${lesson.numberLabel} • +${lesson.xpReward} XP`}
                                </span>
                              </div>
                            </div>
                          );
                        })}

                        {/* Mid-unit Treasure Chest */}
                        <div className="py-2 flex flex-col items-center">
                          <button
                            onClick={handleClaimChest}
                            className="w-16 h-16 rounded-2xl bg-[#F59E0B] border-b-6 border-[#D97706] flex items-center justify-center text-3xl shadow-md hover:scale-105 active:translate-y-1 transition-all cursor-pointer"
                            title="Open Reward Chest"
                          >
                            🎁
                          </button>
                          <span className="text-[11px] font-black uppercase text-[#F59E0B] tracking-wider mt-1.5">
                            Bonus Chest
                          </span>
                        </div>

                        {/* INTERACTIVE DUOLINGO CHECKPOINT GATEWAY MONUMENT */}
                        {(() => {
                          const checkpoint = currentCheckpoints[unit.id];
                          if (!checkpoint) return null;
                          const allUnitLessonsCompleted = unit.lessons.every((l) =>
                            user.completedLessons.includes(l.id)
                          );
                          const isCheckpointCompleted = (user.completedCheckpoints || []).includes(
                            checkpoint.id
                          );
                          const isCheckpointUnlocked =
                            allUnitLessonsCompleted || isCheckpointCompleted;
                          const isFinalUnit = unit.id === 'unit-mastery' || unit.id === 'fr-unit-7';

                          return (
                            <div className="pt-4 flex flex-col items-center">
                              {/* Bouncing speech bubble when unlocked but not completed */}
                              {isCheckpointUnlocked && !isCheckpointCompleted && (
                                <div
                                  className={`mb-2 ${
                                    isFinalUnit
                                      ? 'bg-[#F59E0B] border-[#D97706] text-[#1E130D]'
                                      : 'bg-[#059669] border-[#047857] text-[#FEF3C7]'
                                  } text-xs font-black uppercase px-4 py-1.5 rounded-2xl shadow-lg border-b-2 animate-bounce tracking-wider flex items-center gap-1.5 z-10`}
                                >
                                  <span>
                                    {isFinalUnit
                                      ? '👑 FINAL GRADUATION EXAM'
                                      : `GATEWAY CHALLENGE +${checkpoint.xpReward} XP`}
                                  </span>
                                </div>
                              )}

                              {isCheckpointCompleted && (
                                <div className="mb-2 flex items-center gap-1.5 px-3 py-1 bg-[#241710] border border-[#F59E0B] rounded-full text-[11px] font-black uppercase text-[#F59E0B] tracking-wider shadow-xs">
                                  <Sparkles className="w-3.5 h-3.5 text-[#F59E0B]" />
                                  <span>
                                    {isFinalUnit ? 'SUPREME MASTER SEAL' : `MASTERED • ${checkpoint.badgeName}`}
                                  </span>
                                </div>
                              )}

                              {/* 3D Gateway Trophy Button */}
                              <button
                                onClick={() => isCheckpointUnlocked && setActiveCheckpoint(checkpoint)}
                                disabled={!isCheckpointUnlocked}
                                className={`relative w-24 h-24 rounded-3xl border-b-6 flex flex-col items-center justify-center text-4xl shadow-xl transition-all duration-150 active:translate-y-1 ${
                                  isCheckpointCompleted
                                    ? 'bg-[#F59E0B] border-[#D97706] hover:brightness-105 ring-4 ring-[#F59E0B]/30 cursor-pointer text-[#1E130D]'
                                    : isCheckpointUnlocked
                                    ? isFinalUnit
                                      ? 'bg-[#F59E0B] border-[#D97706] hover:brightness-105 ring-8 ring-[#F59E0B]/30 animate-pulse cursor-pointer text-[#1E130D]'
                                      : `${theme.bg} ${theme.border} hover:brightness-105 ring-6 ring-[#059669]/30 cursor-pointer text-[#FEF3C7]`
                                    : 'bg-[#241710] border-[#1B110B] text-[#6B4E3D] cursor-not-allowed'
                                }`}
                                title={
                                  isCheckpointUnlocked
                                    ? `Challenge ${checkpoint.title}`
                                    : `Finish all ${unit.lessons.length} lessons in Unit ${unitIndex} to unlock this Checkpoint Gateway`
                                }
                              >
                                <span>{isFinalUnit ? '👑' : isCheckpointCompleted ? checkpoint.badgeIcon : '🏰'}</span>
                                {!isCheckpointUnlocked && (
                                  <div className="absolute inset-0 bg-black/40 rounded-3xl flex items-center justify-center">
                                    <Lock className="w-7 h-7 text-[#6B4E3D] stroke-[3] drop-shadow-md" />
                                  </div>
                                )}
                              </button>

                              <div className="text-center mt-2 max-w-[210px]">
                                <p className="text-xs font-black text-[#FEF3C7] uppercase tracking-wider">
                                  {checkpoint.title}
                                </p>
                                <span className="text-[10px] font-bold text-[#D4A373]">
                                  {isCheckpointCompleted
                                    ? 'Conquered! Tap to review'
                                    : isCheckpointUnlocked
                                    ? isFinalUnit
                                      ? 'Ready for Graduation Exam!'
                                      : 'Ready for Gateway Challenge!'
                                    : `Locked (Finish Unit ${unitIndex})`}
                                </span>
                              </div>
                            </div>
                          );
                        })()}

                        {/* CARTOON CHARACTER MILESTONES ALONG THE DUOLINGO PATH (WARM DARK WOOD) */}
                        {unitIndex === 0 && (
                          <div className="py-4 flex items-center gap-3 bg-[#241710] border-2 border-[#3D2619] rounded-3xl p-4 max-w-sm w-full shadow-xs">
                            <CartoonCharacter character="duo" mood="speaking" size="sm" animate={true} />
                            <div className="text-left">
                              <span className="text-[10px] font-black uppercase text-[#10B981] tracking-wider">
                                {isFrench ? 'Duo Hibou says:' : 'Duo Kuku says:'}
                              </span>
                              <p className="text-xs font-bold text-[#FEF3C7] leading-snug">
                                {isFrench
                                  ? '"Bienvenue ! Step into French. Keep your streak alive with 5 minutes a day!"'
                                  : '"Karibu! You\'ve stepped onto the path of sages. Build your streak daily!"'}
                              </p>
                            </div>
                          </div>
                        )}

                        {unitIndex === 2 && (
                          <div className="py-4 flex items-center gap-3 bg-[#241710] border-2 border-[#3D2619] rounded-3xl p-4 max-w-sm w-full shadow-xs">
                            <CartoonCharacter character="mwana" mood="celebrating" size="sm" animate={false} />
                            <div className="text-left">
                              <span className="text-[10px] font-black uppercase text-[#F59E0B] tracking-wider">
                                Mwana Kofi cheers:
                              </span>
                              <p className="text-xs font-bold text-[#FEF3C7] leading-snug">
                                {isFrench
                                  ? '"Croissants, cafés & bistro manners! Remember: always greet with \'Bonjour\' in France."'
                                  : '"Evidentiality lets you declare truth with honor. You\'re unstoppable!"'}
                              </p>
                            </div>
                          </div>
                        )}

                        {unitIndex === 4 && (
                          <div className="py-4 flex items-center gap-3 bg-[#241710] border-2 border-[#3D2619] rounded-3xl p-4 max-w-sm w-full shadow-xs">
                            <CartoonCharacter character="nyango" mood="thinking" size="sm" animate={false} />
                            <div className="text-left">
                              <span className="text-[10px] font-black uppercase text-[#14B8A6] tracking-wider">
                                Nyango Amina notes:
                              </span>
                              <p className="text-xs font-bold text-[#FEF3C7] leading-snug">
                                {isFrench
                                  ? '"French liaison connects words like music: \'les_amis\' flows seamlessly!"'
                                  : '"Every root connects to an exact mental world. Notice the pure symmetry!"'}
                              </p>
                            </div>
                          </div>
                        )}

                        {unitIndex === 6 && (
                          <div className="py-4 flex items-center gap-3 bg-[#241710] border-2 border-[#3D2619] rounded-3xl p-4 max-w-sm w-full shadow-md">
                            <CartoonCharacter character="mpaka" mood="speaking" size="sm" animate={false} />
                            <div className="text-left">
                              <span className="text-[10px] font-black uppercase text-[#F59E0B] tracking-wider">
                                Grand Master Mpaka invites:
                              </span>
                              <p className="text-xs font-bold text-[#FEF3C7] leading-snug">
                                {isFrench
                                  ? '"French proverbs and the Passé Composé summit await. Take your mastery exam!"'
                                  : '"The final summit is near. Prepare yourself for the Grand Graduation Checkpoint!"'}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* BRANCHING SKILL TREE OUTPOST GATEWAY (MERGED DIRECTLY ON PATH) */}
                        {(() => {
                          const branchForUnit = currentBranchByUnit[unit.id];
                          if (!branchForUnit) return null;
                          const branchStatus = checkBranchUnlocked(branchForUnit, user.completedLessons);
                          const branchCompletedCount = branchForUnit.lessons.filter((l) =>
                            user.completedLessons.includes(l.id)
                          ).length;
                          const isBranchMastered =
                            branchForUnit.lessons.length > 0 &&
                            branchCompletedCount === branchForUnit.lessons.length;

                          return (
                            <div className="pt-6 pb-2 w-full max-w-md mx-auto">
                              {/* Curved branching connector */}
                              <div className="flex flex-col items-center">
                                <div className="w-0.5 h-6 border-l-2 border-dashed border-[#3D2619]" />
                                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#241710] border border-[#3D2619] text-[10px] font-black uppercase tracking-wider text-[#14B8A6] shadow-2xs mb-3">
                                  <GitBranch className="w-3.5 h-3.5 text-[#14B8A6]" />
                                  <span>Branching Skill Outpost</span>
                                </div>
                              </div>

                              <div
                                className={`rounded-3xl border-2 border-b-6 transition-all p-5 shadow-sm overflow-hidden relative ${
                                  branchStatus.isUnlocked
                                    ? 'bg-[#1E130D] border-[#0D9488] shadow-md ring-4 ring-[#0D9488]/20'
                                    : 'bg-[#180E08] border-[#3D2619]'
                                }`}
                              >
                                <div className="flex items-start justify-between gap-3 relative z-10">
                                  <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-2xl bg-[#241710] border-2 border-[#3D2619] shadow-sm flex items-center justify-center text-2xl shrink-0 text-[#F59E0B]">
                                      {branchForUnit.icon}
                                    </div>
                                    <div>
                                      <div className="flex items-center gap-1.5">
                                        <span className="text-[10px] font-black uppercase tracking-wider text-[#D4A373]">
                                          Specialized Track
                                        </span>
                                        {isBranchMastered && (
                                          <span className="px-1.5 py-0.2 rounded bg-[#059669] text-[#FEF3C7] text-[9px] font-black uppercase">
                                            Mastered
                                          </span>
                                        )}
                                      </div>
                                      <h4 className="text-base font-black text-[#FEF3C7] leading-tight">
                                        {branchForUnit.title}
                                      </h4>
                                    </div>
                                  </div>

                                  {branchStatus.isUnlocked ? (
                                    <span className="px-2.5 py-1 rounded-xl bg-[#059669]/20 border border-[#059669] text-[#10B981] text-xs font-black flex items-center gap-1 shrink-0">
                                      <Sparkles className="w-3.5 h-3.5 text-[#10B981]" />
                                      <span>Unlocked</span>
                                    </span>
                                  ) : (
                                    <span className="px-2.5 py-1 rounded-xl bg-[#241710] border border-[#3D2619] text-[#D4A373] text-xs font-black flex items-center gap-1 shrink-0">
                                      <Lock className="w-3.5 h-3.5" />
                                      <span>Locked</span>
                                    </span>
                                  )}
                                </div>

                                <p className="text-xs font-bold text-[#D4A373] mt-3 relative z-10 leading-relaxed">
                                  {branchForUnit.tagline}
                                </p>

                                <div className="mt-4 pt-3 border-t border-[#3D2619] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                  {branchStatus.isUnlocked ? (
                                    <div className="space-y-1.5 w-full">
                                      <div className="flex items-center justify-between text-[11px] font-bold text-[#10B981]">
                                        <span>
                                          {branchCompletedCount} of {branchForUnit.lessons.length} branch lessons completed
                                        </span>
                                        <span className="text-xs">🌳</span>
                                      </div>
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <button
                                          type="button"
                                          onClick={() => setActiveTab('profile')}
                                          className="px-3.5 py-2 bg-[#241710] hover:bg-[#2C1D14] border-2 border-[#0D9488] text-[#14B8A6] rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 active:translate-y-0.5 transition-all cursor-pointer shadow-xs"
                                        >
                                          <Layers className="w-3.5 h-3.5 text-[#14B8A6]" />
                                          <span>Explore in Profile</span>
                                        </button>
                                        {branchForUnit.lessons[0] && (
                                          <button
                                            type="button"
                                            onClick={() => setActiveLesson(branchForUnit.lessons[0])}
                                            className="px-3.5 py-2 bg-[#059669] hover:bg-[#047857] border-b-2 border-[#065F46] text-[#FEF3C7] rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 active:translate-y-0.5 transition-all cursor-pointer shadow-xs"
                                          >
                                            <span>Start Lesson 1</span>
                                            <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="w-full space-y-2">
                                      <div className="flex items-center justify-between text-xs font-bold text-[#D4A373]">
                                        <span>
                                          Complete {branchForUnit.unlockRequirement.requiredCompletedCount} lessons in Unit {unitIndex}
                                        </span>
                                        <span className="font-mono text-[#FEF3C7]">
                                          {branchStatus.completedCount} / {branchStatus.requiredCount}
                                        </span>
                                      </div>
                                      <div className="w-full h-2.5 bg-[#241710] border border-[#3D2619] rounded-full overflow-hidden">
                                        <div
                                          className="h-full bg-[#0D9488] rounded-full transition-all duration-300"
                                          style={{ width: `${branchStatus.progressPercent}%` }}
                                        />
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* TAB 2: DUOLINGO PRACTICE (MATCH MADNESS & TONE/SCRIPT LABS) */}
            {activeTab === 'practice' && (
              <div className="space-y-8">
                {/* Match Madness 45s Rapid-Recall Mini-game */}
                <MatchMadnessGame
                  activeCourse={activeCourse}
                  onEarnXp={(earnedXp) => {
                    updateUser({
                      ...user,
                      xp: user.xp + earnedXp,
                      todayXp: user.todayXp + earnedXp,
                    });
                  }}
                />

                {/* Sound & Tone Resonance Lab + Script Studio */}
                <PracticeLabView />
              </div>
            )}

            {/* TAB 3: LEADERBOARDS (SAVANNAH LEAGUES) */}
            {activeTab === 'leaderboards' && (
              <div className="bg-[#1E130D] border-2 border-b-6 border-[#3D2619] rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
                <div className="flex items-center gap-4 border-b-2 pb-5 border-[#3D2619]">
                  <div className="w-16 h-16 rounded-3xl bg-[#F59E0B] border-b-6 border-[#D97706] flex items-center justify-center text-[#1E130D] text-3xl shadow-sm">
                    🛡️
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-[#FEF3C7]">
                      Gold Baobab League
                    </h3>
                    <p className="text-xs font-bold text-[#D4A373] mt-0.5">
                      Top 3 learners promote to the Diamond Council in 2 days!
                    </p>
                  </div>
                </div>

                {/* Ranking list with green promotion zone */}
                <div className="space-y-2.5">
                  {leagueRanks.map(item => (
                    <div
                      key={item.rank}
                      className={`flex items-center justify-between p-4 rounded-2xl border-2 border-b-4 transition-all ${
                        item.isUser
                          ? 'bg-[#059669]/15 border-[#059669] ring-4 ring-[#059669]/20'
                          : 'bg-[#241710] border-[#3D2619]'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <span
                          className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-mono-num font-black ${
                            item.rank === 1
                              ? 'bg-[#F59E0B] text-[#1E130D] border border-[#D97706]'
                              : item.rank === 2
                              ? 'bg-[#0D9488] text-[#FEF3C7] border border-[#0F766E]'
                              : item.rank === 3
                              ? 'bg-[#059669] text-[#FEF3C7] border border-[#047857]'
                              : 'bg-[#1E130D] text-[#D4A373] border border-[#3D2619]'
                          }`}
                        >
                          {item.rank}
                        </span>

                        <span className="text-2xl select-none">{item.avatar}</span>

                        <div>
                          <p className="text-base font-black text-[#FEF3C7]">
                            {item.name}
                          </p>
                          <p className="text-xs font-bold text-[#D4A373]">
                            {item.country}
                          </p>
                        </div>
                      </div>

                      <div className="font-mono-num font-black text-base text-[#10B981]">
                        {item.xp} XP
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: DAILY QUESTS */}
            {activeTab === 'quests' && (
              <div className="bg-[#1E130D] border-2 border-b-6 border-[#3D2619] rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
                <div className="flex items-center gap-4 border-b-2 pb-5 border-[#3D2619]">
                  <div className="w-16 h-16 rounded-3xl bg-[#F59E0B] border-b-6 border-[#D97706] flex items-center justify-center text-[#1E130D] text-3xl shadow-sm">
                    🎯
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-[#FEF3C7]">
                      Daily Quests
                    </h3>
                    <p className="text-xs font-bold text-[#D4A373] mt-0.5">
                      Earn XP, keep your streak alive, and unlock gift chests every day.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {quests.map(quest => {
                    const isClaimed = claimedQuests.includes(quest.id);
                    return (
                      <div
                        key={quest.id}
                        className="p-5 rounded-2xl border-2 border-b-4 border-[#3D2619] bg-[#241710] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div className="space-y-1.5 flex-1">
                          <h4 className="text-base font-black text-[#FEF3C7]">
                            {quest.title}
                          </h4>
                          <p className="text-xs font-bold text-[#D4A373]">
                            {quest.description}
                          </p>
                          <div className="flex items-center gap-3 pt-1 w-full max-w-xs">
                            <div className="h-3.5 w-full bg-[#1E130D] border border-[#3D2619] rounded-full overflow-hidden">
                              <div
                                className="h-full bg-[#F59E0B] transition-all"
                                style={{
                                  width: `${Math.min(
                                    100,
                                    (quest.progress / quest.goal) * 100
                                  )}%`,
                                }}
                              />
                            </div>
                            <span className="text-xs font-mono-num font-black text-[#D4A373]">
                              {quest.progress}/{quest.goal}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleClaimQuest(quest.id, quest.reward)}
                          disabled={!quest.completed || isClaimed}
                          className={`px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all border-b-4 cursor-pointer ${
                            isClaimed
                              ? 'bg-[#1E130D] border-[#3D2619] text-[#6B4E3D] cursor-default'
                              : quest.completed
                              ? 'bg-[#F59E0B] hover:bg-[#D97706] border-[#B45309] text-[#1E130D] shadow-md active:translate-y-1'
                              : 'bg-[#1E130D] border-[#3D2619] text-[#6B4E3D] cursor-not-allowed'
                          }`}
                        >
                          {isClaimed
                            ? 'Claimed ✓'
                            : quest.completed
                            ? `Claim +${quest.reward} XP 🎁`
                            : `Locked (+${quest.reward} XP)`}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB: CONNECT WITH OTHERS */}
            {activeTab === 'connect' && (
              <ConnectWithOthersView
                currentUser={user}
                onUpdateUser={updateUser}
                onOpenAuthModal={() => {
                  setAuthModalMode('signup');
                  setAuthModalOpen(true);
                }}
              />
            )}

            {/* TAB 5: COWRIE GEMS BAZAAR (SHOP) */}
            {activeTab === 'shop' && (
              <div className="bg-[#1E130D] border-2 border-b-6 border-[#3D2619] rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
                <div className="flex items-center justify-between border-b-2 pb-5 border-[#3D2619]">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-3xl bg-[#0D9488] border-b-6 border-[#0F766E] flex items-center justify-center text-[#FEF3C7] text-3xl shadow-sm">
                      🛒
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-[#FEF3C7]">
                        The Cowrie Bazaar
                      </h3>
                      <p className="text-xs font-bold text-[#D4A373] mt-0.5">
                        Exchange your hard-earned gems for heart refills and power-ups.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 px-4 py-2 bg-[#241710] border-2 border-[#F59E0B] rounded-2xl font-mono-num font-black text-base text-[#F59E0B]">
                    <Gem className="w-5 h-5 fill-[#F59E0B]" />
                    <span>{cowrieGems} Gems</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Item 1: Heart Refill */}
                  <div className="p-5 rounded-2xl border-2 border-b-4 border-[#3D2619] bg-[#241710] space-y-3">
                    <div className="text-3xl">❤️</div>
                    <h4 className="font-black text-base text-[#FEF3C7]">
                      Full Heart Refill
                    </h4>
                    <p className="text-xs font-bold text-[#D4A373] leading-relaxed">
                      Restores your Chi life energy to full 5/5 hearts so you never get interrupted during lessons.
                    </p>
                    <button
                      onClick={handleRefillHearts}
                      className="w-full py-3 bg-[#059669] hover:bg-[#047857] border-b-4 border-[#065F46] text-[#FEF3C7] text-xs font-black uppercase rounded-2xl active:translate-y-1 transition-all cursor-pointer"
                    >
                      Refill Hearts (Free)
                    </button>
                  </div>

                  {/* Item 2: Streak Freeze */}
                  <div className="p-5 rounded-2xl border-2 border-b-4 border-[#3D2619] bg-[#241710] space-y-3">
                    <div className="text-3xl">🧊</div>
                    <h4 className="font-black text-base text-[#FEF3C7]">
                      Streak Freeze Amulet
                    </h4>
                    <p className="text-xs font-bold text-[#D4A373] leading-relaxed">
                      Protects your learning streak for an entire day if you miss a study session.
                    </p>
                    <button
                      disabled
                      className="w-full py-3 bg-[#1E130D] border-b-4 border-[#3D2619] text-[#D4A373] text-xs font-black uppercase rounded-2xl cursor-not-allowed"
                    >
                      Equipped (Active) ✓
                    </button>
                  </div>

                  {/* Item 3: Double XP Potion */}
                  <div className="p-5 rounded-2xl border-2 border-b-4 border-[#3D2619] bg-[#241710] space-y-3">
                    <div className="text-3xl">🧪</div>
                    <h4 className="font-black text-base text-[#FEF3C7]">
                      Baobab Double XP Boost
                    </h4>
                    <p className="text-xs font-bold text-[#D4A373] leading-relaxed">
                      Doubles all XP earned in lessons for the next 15 minutes of focused learning!
                    </p>
                    <button
                      onClick={() => {
                        updateUser({
                          ...user,
                          xp: user.xp + 50,
                          todayXp: user.todayXp + 50,
                        });
                      }}
                      className="w-full py-3 bg-[#F59E0B] hover:bg-[#D97706] border-b-4 border-[#B45309] text-[#1E130D] text-xs font-black uppercase rounded-2xl active:translate-y-1 transition-all cursor-pointer"
                    >
                      Activate (+50 XP Bonus)
                    </button>
                  </div>

                  {/* Item 4: Kente Robe Outfit */}
                  <div className="p-5 rounded-2xl border-2 border-b-4 border-[#3D2619] bg-[#241710] space-y-3">
                    <div className="text-3xl">👑</div>
                    <h4 className="font-black text-base text-[#FEF3C7]">
                      Golden Kente Crown Outfit
                    </h4>
                    <p className="text-xs font-bold text-[#D4A373] leading-relaxed">
                      Custom avatar accessory for your profile and leaderboard badges.
                    </p>
                    <button
                      disabled
                      className="w-full py-3 bg-[#1E130D] border-b-4 border-[#3D2619] text-[#F59E0B] text-xs font-black uppercase rounded-2xl cursor-default"
                    >
                      Unlocked ✓
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 6: STORIES (DUOLINGO DIALOGUES) */}
            {activeTab === 'stories' && (
              <DuolingoStoriesView
                activeCourse={activeCourse}
                completedStoryIds={user.completedStories || []}
                onCompleteStory={(storyId, xp) => {
                  const isFirstTime = !(user.completedStories || []).includes(storyId);
                  const effectiveXp = isFirstTime ? xp : 0;
                  const updatedStories = isFirstTime
                    ? [...(user.completedStories || []), storyId]
                    : user.completedStories || [];
                  updateUser({
                    ...user,
                    xp: user.xp + effectiveXp,
                    todayXp: user.todayXp + effectiveXp,
                    completedStories: updatedStories,
                  });
                }}
              />
            )}

            {/* TAB 7: DICTIONARY & PHRASES */}
            {activeTab === 'dictionary' && (
              <LexiconPhrasebookView
                activeCourse={activeCourse}
                masteredWords={user.masteredWords}
                onSaveToNotebook={(sagelo, english) => {
                  const newNote = {
                    id: `note-${Date.now()}`,
                    sagelo,
                    english,
                    evidentiality: 'ha' as const,
                    createdAt: new Date().toISOString(),
                  };
                  updateUser({
                    ...user,
                    notebook: [newNote, ...user.notebook],
                  });
                }}
              />
            )}

            {/* TAB 8: PROFILE */}
            {activeTab === 'profile' && (
              <div className="bg-[#1E130D] border-2 border-b-6 border-[#3D2619] rounded-3xl p-6 sm:p-8 space-y-8 shadow-sm text-[#FEF3C7]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b-2 pb-6 border-[#3D2619]">
                  <div className="flex items-center gap-5">
                    <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#059669] to-[#0D9488] border-b-6 border-[#047857] text-white flex items-center justify-center text-4xl shadow-md shrink-0">
                      {user.avatarKey === 'mpaka'
                        ? '👴🏾'
                        : user.avatarKey === 'nyango'
                        ? '👩🏾'
                        : '🧒🏾'}
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-[#FEF3C7]">
                        {user.name}
                      </h3>
                      <p className="text-sm font-bold text-[#10B981]">
                        {user.sageloName}
                      </p>
                      <p className="text-xs font-bold text-[#D4A373] mt-0.5">
                        Joined {user.joinedAt} • {user.region}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {firebaseUser && !firebaseUser.isAnonymous ? (
                      <button
                        onClick={async () => {
                          await logoutUser();
                          localStorage.removeItem('afrilingo_active_user_id');
                          localStorage.removeItem('afrilingo_user_v2');
                          setUser(CLEAN_GUEST_USER);
                        }}
                        className="px-4 py-2 bg-[#2A1C14] border-2 border-b-4 border-[#EF4444]/40 hover:bg-[#382318] text-xs font-black uppercase text-[#F87171] rounded-2xl active:translate-y-1 transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setAuthModalMode('signup');
                          setAuthModalOpen(true);
                        }}
                        className="px-4 py-2 bg-[#059669] hover:bg-[#047857] border-b-4 border-[#065F46] text-[#FEF3C7] text-xs font-black uppercase rounded-2xl active:translate-y-1 transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                      >
                        <LogIn className="w-3.5 h-3.5" />
                        <span>Create / Sign In</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        const newName = prompt('Enter your name:', user.name);
                        if (newName) updateUser({ ...user, name: newName });
                      }}
                      className="px-4 py-2 bg-[#241710] border-2 border-b-4 border-[#3D2619] hover:bg-[#2C1D14] text-xs font-black uppercase text-[#FEF3C7] rounded-2xl active:translate-y-1 transition-all cursor-pointer"
                    >
                      Edit Name
                    </button>
                  </div>
                </div>

                {/* Active Language Track Card with Duolingo-style switcher */}
                <div className="p-4 sm:p-5 rounded-3xl bg-[#241710] border-2 border-[#10B981]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <span className="text-3xl sm:text-4xl p-2.5 rounded-2xl bg-[#1C120B] shadow-xs border border-[#3D2619] shrink-0">
                      {isFrench ? '🇫🇷' : '🌍'}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-black uppercase tracking-wider text-[#10B981]">
                          Active Language Track
                        </span>
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[#1C120B] text-[#F59E0B] border border-[#D97706]/40">
                          Emerald & Gold
                        </span>
                      </div>
                      <h4 className="text-base sm:text-lg font-black text-[#FEF3C7]">
                        {isFrench ? 'French (Français Intermédiaire)' : 'Sagelo (African Pan-Dialectal Lingua Franca)'}
                      </h4>
                      <p className="text-xs font-bold text-[#D4A373]">
                        {activeCourseCompletedLessons.length} lessons completed • {unlockedBranchCount} skill branches open
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setLanguageModalOpen(true)}
                    className="px-4 py-2.5 bg-[#1C120B] hover:bg-[#2C1D14] border-2 border-b-4 border-[#059669] text-[#10B981] text-xs font-black uppercase rounded-2xl active:translate-y-0.5 transition-all flex items-center gap-2 shadow-xs shrink-0 cursor-pointer self-start sm:self-center"
                  >
                    <Globe className="w-4 h-4" />
                    <span>Choose Language</span>
                  </button>
                </div>

                {/* SKILL TREES & SPECIALIZED TRACKS SECTION IN PROFILE */}
                <div className="space-y-4 p-5 sm:p-6 rounded-3xl bg-[#241710] border-2 border-b-6 border-[#3D2619] shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-[#059669] border-b-4 border-[#047857] text-[#FEF3C7] flex items-center justify-center text-2xl shadow-xs shrink-0">
                        🌳
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-base font-black text-[#FEF3C7] tracking-tight">
                            Skill Trees & Specialized Tracks
                          </h4>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#F59E0B] text-[#150E09] shadow-xs">
                            {unlockedBranchCount}/{currentSkillBranches.length} Unlocked
                          </span>
                        </div>
                        <p className="text-xs font-bold text-[#D4A373]">
                          {isFrench ? 'French practical specializations beyond the core track' : 'Cultural masteries beyond the core Sagelo path'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 4 Skill Branches Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    {currentSkillBranches.map((branch) => {
                      const branchStatus = checkBranchUnlocked(branch, user.completedLessons);
                      const completedCount = branch.lessons.filter((l) => user.completedLessons.includes(l.id)).length;
                      const isComplete = branch.lessons.length > 0 && completedCount === branch.lessons.length;

                      return (
                        <div
                          key={branch.id}
                          className={`p-4 rounded-2xl border-2 transition-all flex flex-col justify-between ${
                            branchStatus.isUnlocked
                              ? 'bg-[#1C120B] border-[#0D9488]/40 hover:border-[#10B981] shadow-xs text-[#FEF3C7]'
                              : 'bg-[#1A1009] border-[#3D2619] text-[#D4A373] opacity-80'
                          }`}
                        >
                          <div className="space-y-2">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-2.5">
                                <span className="text-2xl p-1.5 rounded-xl bg-[#241710] border border-[#3D2619]">
                                  {branch.icon}
                                </span>
                                <div>
                                  <h5 className="text-xs font-black text-[#FEF3C7] line-clamp-1">
                                    {branch.title}
                                  </h5>
                                  <span className="text-[10px] font-bold text-[#F59E0B] uppercase">
                                    {branch.category}
                                  </span>
                                </div>
                              </div>
                              {branchStatus.isUnlocked ? (
                                isComplete ? (
                                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[#059669]/20 text-[#10B981] border border-[#059669]/40">
                                    ✓ Mastered
                                  </span>
                                ) : (
                                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[#0D9488]/20 text-[#14B8A6] border border-[#0D9488]/40">
                                    In Progress
                                  </span>
                                )
                              ) : (
                                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[#241710] text-[#D4A373] border border-[#3D2619] flex items-center gap-1">
                                  🔒 Unit {branch.unlockRequirement.unitNumber}
                                </span>
                              )}
                            </div>

                            <p className="text-[11px] font-semibold text-[#D4A373] line-clamp-2">
                              {branch.tagline}
                            </p>
                          </div>

                          {/* Progress bar */}
                          <div className="pt-3 space-y-1.5">
                            <div className="flex items-center justify-between text-[10px] font-black text-[#D4A373]">
                              <span>Progress</span>
                              <span>{completedCount}/{branch.lessons.length} lessons</span>
                            </div>
                            <div className="h-2 w-full bg-[#241710] border border-[#3D2619] rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-[#059669] via-[#0D9488] to-[#F59E0B] rounded-full transition-all duration-300"
                                style={{
                                  width: `${branch.lessons.length > 0 ? (completedCount / branch.lessons.length) * 100 : 0}%`,
                                }}
                              />
                            </div>

                            {branchStatus.isUnlocked && branch.lessons.length > 0 && (
                              <button
                                onClick={() => {
                                  const nextLesson = branch.lessons.find((l) => !user.completedLessons.includes(l.id)) || branch.lessons[0];
                                  setActiveLesson(nextLesson);
                                }}
                                className="w-full mt-2 py-1.5 bg-[#241710] hover:bg-[#059669] border border-[#3D2619] hover:border-[#047857] text-[#10B981] hover:text-[#FEF3C7] text-[11px] font-black uppercase rounded-xl transition-colors flex items-center justify-center gap-1 cursor-pointer"
                              >
                                <span>{isComplete ? 'Review Branch' : 'Continue Track'}</span>
                                <ChevronRight className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Account & Sync Status Banner */}
                <div className={`p-4 rounded-2xl border-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  firebaseUser && !firebaseUser.isAnonymous
                    ? 'bg-[#064E3B]/40 border-[#059669]/60 text-[#10B981]'
                    : 'bg-[#241710] border-[#D97706]/40 text-[#F59E0B]'
                }`}>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider">
                      <span>{firebaseUser && !firebaseUser.isAnonymous ? '● Account Synced to Firestore' : '○ Guest Learner Session'}</span>
                    </div>
                    <p className="text-xs font-bold text-[#D4A373]">
                      {firebaseUser && !firebaseUser.isAnonymous
                        ? `Logged in as ${user.email}. Your progress and connections sync in real time.`
                        : 'You are currently browsing as a guest. Create an account to preserve streaks and connect with other learners.'}
                    </p>
                  </div>
                  {(!firebaseUser || firebaseUser.isAnonymous) && (
                    <button
                      onClick={() => {
                        setAuthModalMode('login');
                        setAuthModalOpen(true);
                      }}
                      className="px-3.5 py-1.5 bg-[#F59E0B] text-[#150E09] text-xs font-black uppercase rounded-xl border-b-2 border-[#D97706] self-start sm:self-center shrink-0 cursor-pointer"
                    >
                      Log In Now
                    </button>
                  )}
                </div>

                {/* Avatar Persona Switcher */}
                <div className="space-y-2">
                  <h4 className="text-xs font-black uppercase text-[#D4A373] tracking-wider">
                    Avatar Persona
                  </h4>
                  <div className="grid grid-cols-3 gap-3 max-w-sm">
                    {(['mwana', 'nyango', 'mpaka'] as const).map((key) => (
                      <button
                        key={key}
                        onClick={() => updateUser({ ...user, avatarKey: key })}
                        className={`p-3 rounded-2xl border-2 text-center transition-all cursor-pointer ${
                          user.avatarKey === key
                            ? 'border-[#059669] bg-[#059669]/25 ring-2 ring-[#059669]'
                            : 'border-[#3D2619] bg-[#241710] hover:bg-[#2C1D14]'
                        }`}
                      >
                        <div className="text-2xl mb-1">
                          {key === 'mwana' ? '🧒🏾' : key === 'nyango' ? '👩🏾' : '👴🏾'}
                        </div>
                        <div className="text-xs font-black capitalize text-[#FEF3C7]">{key}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Connect with Friends Shortcut */}
                <div className="bg-[#241710] border-2 border-b-4 border-[#3D2619] rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-[#0D9488] border-b-4 border-[#0F766E] text-[#FEF3C7] flex items-center justify-center text-2xl shadow-xs shrink-0">
                      🌍
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-[#14B8A6] uppercase tracking-wider">
                        Social & Study Circles
                      </h4>
                      <p className="text-xs font-bold text-[#D4A373]">
                        Connect with fellow Sagelo learners, give high-fives, and share wisdom posts!
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab('connect')}
                    className="px-4 py-2.5 bg-[#0D9488] hover:bg-[#0F766E] border-b-4 border-[#115E59] text-[#FEF3C7] text-xs font-black uppercase rounded-2xl active:translate-y-0.5 transition-all self-start sm:self-center shrink-0 shadow-xs cursor-pointer"
                  >
                    Find Friends →
                  </button>
                </div>

                {/* Statistics Grid */}
                <div className="space-y-3">
                  <h4 className="text-sm font-black uppercase text-[#D4A373] tracking-wider">
                    Statistics
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="p-4 rounded-2xl border-2 border-b-4 border-[#3D2619] bg-[#241710]">
                      <div className="text-2xl font-mono-num font-black text-[#F59E0B]">
                        🔥 {user.streakDays}
                      </div>
                      <div className="text-xs font-bold text-[#D4A373]">
                        Day Streak
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl border-2 border-b-4 border-[#3D2619] bg-[#241710]">
                      <div className="text-2xl font-mono-num font-black text-[#F59E0B]">
                        ⚡ {user.xp}
                      </div>
                      <div className="text-xs font-bold text-[#D4A373]">
                        Total XP
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl border-2 border-b-4 border-[#3D2619] bg-[#241710]">
                      <div className="text-2xl font-mono-num font-black text-[#FBBF24]">
                        🛡️ Gold
                      </div>
                      <div className="text-xs font-bold text-[#D4A373]">
                        Current League
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl border-2 border-b-4 border-[#3D2619] bg-[#241710]">
                      <div className="text-2xl font-mono-num font-black text-[#10B981]">
                        📚 {user.masteredWords.length}
                      </div>
                      <div className="text-xs font-bold text-[#D4A373]">
                        Roots Mastered
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sagelo Learner Notebook Entries */}
                <div className="space-y-3">
                  <h4 className="text-sm font-black uppercase text-[#D4A373] tracking-wider">
                    Learner Notebook
                  </h4>
                  <div className="space-y-3">
                    {user.notebook.map(note => (
                      <div
                        key={note.id}
                        className="p-4 rounded-2xl border-2 border-[#3D2619] bg-[#241710] flex items-center justify-between gap-4"
                      >
                        <div>
                          <p className="text-base font-black text-[#FEF3C7]">
                            {note.sagelo}
                          </p>
                          <p className="text-xs font-bold text-[#D4A373]">
                            {note.english}
                          </p>
                        </div>
                        <button
                          onClick={() =>
                            playSageloPhrase(note.sagelo)
                          }
                          className="w-9 h-9 rounded-xl bg-[#059669] text-white flex items-center justify-center shrink-0 border-b-2 border-[#047857] cursor-pointer"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Install App on Device Card */}
                <div className="p-5 bg-[#241710] border-2 border-[#059669]/50 rounded-3xl space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">📲</span>
                    <div>
                      <h4 className="text-base font-black text-[#10B981]">
                        Install AfriLingo on Your Device
                      </h4>
                      <p className="text-xs font-bold text-[#D4A373]">
                        Instant home screen access, native standalone view, and offline lesson practice.
                      </p>
                    </div>
                  </div>
                  <PWAInstallButton variant="full" />
                </div>
              </div>
            )}
          </main>

          {/* DESKTOP RIGHT SIDEBAR (Duolingo Widgets) */}
          <aside className="lg:col-span-4 space-y-6 hidden lg:block">
            {/* 7-Day Speaking Goal Sprint */}
            <div className="bg-[#1E130D] border-2 border-b-4 border-[#3D2619] rounded-3xl p-5 space-y-3 shadow-xs text-[#FEF3C7]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-[#10B981]">
                  7-Day Speaking Sprint
                </span>
                <span className="text-xs font-mono-num font-black text-[#F59E0B]">
                  Day 1 of 7
                </span>
              </div>
              <h4 className="font-black text-base text-[#FEF3C7]">
                Speak Everyday Phrases in 1 Week
              </h4>
              <div className="bg-[#241710] border-2 border-[#3D2619] rounded-2xl p-4 space-y-2">
                <p className="text-sm font-black text-[#10B981]">
                  "Shanti, ndeko! Yo {user.name} oni."
                </p>
                <p className="text-xs font-bold text-[#D4A373]">
                  Peace, friend! I am {user.name}.
                </p>
                <button
                  onClick={() =>
                    playSageloPhrase(`Shanti, ndeko! Yo ${user.name} oni.`)
                  }
                  className="w-full py-2 bg-[#0D9488] hover:bg-[#0F766E] border-b-4 border-[#115E59] text-[#FEF3C7] text-xs font-black uppercase rounded-xl flex items-center justify-center gap-1.5 active:translate-y-1 transition-all cursor-pointer"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Listen with African Tone</span>
                </button>
              </div>
            </div>

            {/* Daily Quests Widget */}
            <div className="bg-[#1E130D] border-2 border-b-4 border-[#3D2619] rounded-3xl p-5 space-y-4 shadow-xs text-[#FEF3C7]">
              <div className="flex items-center justify-between">
                <h4 className="font-black text-base text-[#FEF3C7]">
                  Daily Quests
                </h4>
                <button
                  onClick={() => setActiveTab('quests')}
                  className="text-xs font-black text-[#F59E0B] uppercase tracking-wider hover:underline cursor-pointer"
                >
                  VIEW ALL
                </button>
              </div>

              <div className="space-y-3">
                {quests.slice(0, 2).map(q => (
                  <div key={q.id} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-black text-[#FEF3C7]">
                      <span>{q.title}</span>
                      <span className="text-[#D4A373] font-mono-num">
                        {q.progress}/{q.goal}
                      </span>
                    </div>
                    <div className="h-3 w-full bg-[#241710] border border-[#3D2619] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#059669] to-[#F59E0B]"
                        style={{
                          width: `${Math.min(100, (q.progress / q.goal) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Savannah League Standing Widget */}
            <div className="bg-[#1E130D] border-2 border-b-4 border-[#3D2619] rounded-3xl p-5 space-y-3 shadow-xs text-[#FEF3C7]">
              <div className="flex items-center justify-between">
                <h4 className="font-black text-base text-[#FEF3C7]">
                  Gold Baobab League
                </h4>
                <button
                  onClick={() => setActiveTab('leaderboards')}
                  className="text-xs font-black text-[#14B8A6] uppercase tracking-wider hover:underline cursor-pointer"
                >
                  LEADERBOARDS
                </button>
              </div>

              <div className="flex items-center gap-4 bg-[#241710] p-3 rounded-2xl border-2 border-[#3D2619]">
                <div className="w-12 h-12 rounded-2xl bg-[#F59E0B] border-b-4 border-[#D97706] text-[#160E09] flex items-center justify-center text-2xl shadow-xs">
                  🛡️
                </div>
                <div>
                  <div className="text-xs font-black text-[#10B981] uppercase tracking-wider">
                    ● PROMOTION ZONE
                  </div>
                  <p className="text-sm font-black text-[#FEF3C7]">
                    You are in 3rd place!
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* 3. MOBILE BOTTOM NAVIGATION BAR */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#1E130D] border-t-2 border-[#3D2619] flex justify-around p-2 z-40 max-w-full">
        <button
          onClick={() => {
            setActiveTab('learn');
            setLearnViewMode('main_path');
          }}
          className={`p-2 rounded-xl flex flex-col items-center gap-1 cursor-pointer ${
            activeTab === 'learn' ? 'text-[#10B981]' : 'text-[#D4A373]'
          }`}
        >
          <Compass className="w-5 h-5" />
          <span className="text-[10px] font-black uppercase">Learn</span>
        </button>

        <button
          onClick={() => setActiveTab('practice')}
          className={`p-2 rounded-xl flex flex-col items-center gap-1 cursor-pointer ${
            activeTab === 'practice' ? 'text-[#14B8A6]' : 'text-[#D4A373]'
          }`}
        >
          <Zap className="w-5 h-5" />
          <span className="text-[10px] font-black uppercase">Practice</span>
        </button>

        <button
          onClick={() => setActiveTab('connect')}
          className={`p-2 rounded-xl flex flex-col items-center gap-1 cursor-pointer ${
            activeTab === 'connect' ? 'text-[#10B981]' : 'text-[#D4A373]'
          }`}
        >
          <Users className="w-5 h-5" />
          <span className="text-[10px] font-black uppercase">Connect</span>
        </button>

        <button
          onClick={() => setActiveTab('leaderboards')}
          className={`p-2 rounded-xl flex flex-col items-center gap-1 cursor-pointer ${
            activeTab === 'leaderboards' ? 'text-[#F59E0B]' : 'text-[#D4A373]'
          }`}
        >
          <Shield className="w-5 h-5" />
          <span className="text-[10px] font-black uppercase">Leagues</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`p-2 rounded-xl flex flex-col items-center gap-1 cursor-pointer ${
            activeTab === 'profile' ? 'text-[#F59E0B]' : 'text-[#D4A373]'
          }`}
        >
          <User className="w-5 h-5" />
          <span className="text-[10px] font-black uppercase">Profile</span>
        </button>
      </nav>

      {/* 4. DUOLINGO GUIDEBOOK MODAL */}
      {guidebookUnit !== null && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#1E130D] border-2 border-b-6 border-[#3D2619] rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl max-h-[85vh] overflow-y-auto text-[#FEF3C7]">
            <div className="flex items-center justify-between border-b-2 pb-4 border-[#3D2619]">
              <div>
                <span className="text-xs font-black uppercase text-[#14B8A6] tracking-wider">
                  {isFrench ? `GUIDE DE L'UNITÉ ${guidebookUnit + 1}` : `UNIT ${guidebookUnit} GUIDEBOOK`}
                </span>
                <h3 className="text-2xl font-black text-[#FEF3C7]">
                  {currentUnitThemes[guidebookUnit]?.guideTitle || 'Grammar & Vocabulary'}
                </h3>
              </div>
              <button
                onClick={() => setGuidebookUnit(null)}
                className="text-[#D4A373] hover:text-[#FEF3C7] text-xl font-black p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-sm text-[#FEF3C7] leading-relaxed">
              {isFrench ? (
                <div className="space-y-4">
                  <div className="p-4 bg-[#241710] border-2 border-[#3D2619] rounded-2xl space-y-2">
                    <h4 className="font-black text-base text-[#F59E0B]">
                      Concepts Clés • Unité {guidebookUnit + 1}
                    </h4>
                    <p className="text-xs text-[#D4A373]">
                      Essential grammar, polite expressions, and daily communication habits:
                    </p>
                    <ul className="text-xs font-bold text-[#FEF3C7] space-y-1 list-disc list-inside">
                      <li><strong>Le / La / Les</strong>: French nouns have grammatical gender (le café, la baguette, les amis).</li>
                      <li><strong>Tu vs. Vous</strong>: Use 'tu' with close peers, and 'vous' for politeness, elders, and strangers.</li>
                      <li><strong>S'il vous plaît</strong>: Essential polite phrase required whenever ordering in France.</li>
                      <li><strong>Liaison</strong>: Silent consonants blend with following vowels for melodic speech ("les_amis").</li>
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-black text-sm text-[#14B8A6] uppercase tracking-wider">
                      Prononciation & Audio:
                    </h4>
                    <div className="space-y-2">
                      <button
                        onClick={() => playSageloPhrase('Bonjour, comment allez-vous ?', { lang: 'french' })}
                        className="w-full p-3 bg-[#241710] border-2 border-b-4 border-[#3D2619] hover:border-[#0D9488] text-[#FEF3C7] rounded-xl flex items-center justify-between text-left font-black text-sm cursor-pointer"
                      >
                        <span>Bonjour, comment allez-vous ? (Hello, how are you?)</span>
                        <Volume2 className="w-4 h-4 text-[#14B8A6]" />
                      </button>
                      <button
                        onClick={() => playSageloPhrase('Une carafe d\'eau et un café, s\'il vous plaît !', { lang: 'french' })}
                        className="w-full p-3 bg-[#241710] border-2 border-b-4 border-[#3D2619] hover:border-[#0D9488] text-[#FEF3C7] rounded-xl flex items-center justify-between text-left font-black text-sm cursor-pointer"
                      >
                        <span>Une carafe d'eau et un café, s'il vous plaît !</span>
                        <Volume2 className="w-4 h-4 text-[#14B8A6]" />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-[#241710] border-2 border-[#3D2619] rounded-2xl space-y-2">
                    <h4 className="font-black text-base text-[#F59E0B]">
                      Core Concepts in Unit {guidebookUnit}:
                    </h4>
                    <p className="text-xs text-[#D4A373]">
                      Sagelo words follow regular root structures with 5 fundamental vowel endings:
                    </p>
                    <ul className="text-xs font-bold text-[#FEF3C7] space-y-1 list-disc list-inside">
                      <li><strong>-o</strong>: Abstract concept / noun (sago = wisdom, ludo = play)</li>
                      <li><strong>-a</strong>: Concrete tangible entity (kora = heart, buma = tree)</li>
                      <li><strong>-e</strong>: Adjective / description (sage = wise, bono = good)</li>
                      <li><strong>-i</strong>: Verb action (sagi = understand, kani = walk)</li>
                      <li><strong>-u</strong>: Passive state / adverb (sagu = is grown)</li>
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-black text-sm text-[#14B8A6] uppercase tracking-wider">
                      Key Audio Examples:
                    </h4>
                    <div className="space-y-2">
                      <button
                        onClick={() =>
                          playSageloPhrase('Shanti, ndeko!')
                        }
                        className="w-full p-3 bg-[#241710] border-2 border-b-4 border-[#3D2619] hover:border-[#0D9488] text-[#FEF3C7] rounded-xl flex items-center justify-between text-left font-black text-sm cursor-pointer"
                      >
                        <span>Shanti, ndeko! (Peace, friend!)</span>
                        <Volume2 className="w-4 h-4 text-[#14B8A6]" />
                      </button>
                      <button
                        onClick={() =>
                          playSageloPhrase('Yo ta sago voli ha.')
                        }
                        className="w-full p-3 bg-[#241710] border-2 border-b-4 border-[#3D2619] hover:border-[#0D9488] text-[#FEF3C7] rounded-xl flex items-center justify-between text-left font-black text-sm cursor-pointer"
                      >
                        <span>Yo ta sago voli ha. (I truly want wisdom.)</span>
                        <Volume2 className="w-4 h-4 text-[#14B8A6]" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => setGuidebookUnit(null)}
              className="w-full py-3.5 bg-[#059669] hover:bg-[#047857] border-b-4 border-[#065F46] text-[#FEF3C7] font-black uppercase text-sm rounded-2xl active:translate-y-1 transition-all cursor-pointer shadow-md"
            >
              Close Guidebook
            </button>
          </div>
        </div>
      )}

      {/* 5. BONUS CHEST MODAL */}
      {chestModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#1E130D] border-2 border-b-6 border-[#3D2619] rounded-3xl max-w-sm w-full p-6 text-center space-y-5 shadow-2xl text-[#FEF3C7]">
            <div className="w-20 h-20 rounded-3xl bg-[#F59E0B] border-b-6 border-[#D97706] text-4xl flex items-center justify-center mx-auto shadow-md">
              🎁
            </div>
            <div>
              <h3 className="text-2xl font-black text-[#FEF3C7]">
                Chest Unlocked!
              </h3>
              <p className="text-xs font-bold text-[#D4A373] mt-1">
                You found bonus gems and XP on the learning path!
              </p>
            </div>
            <div className="py-2 flex items-center justify-center gap-3">
              <span className="px-4 py-2 bg-[#241710] border-2 border-[#0D9488] rounded-2xl font-mono-num font-black text-base text-[#14B8A6]">
                +{chestModal.gems} Gems
              </span>
              <span className="px-4 py-2 bg-[#241710] border-2 border-[#F59E0B] rounded-2xl font-mono-num font-black text-base text-[#F59E0B]">
                +15 XP
              </span>
            </div>
            <button
              onClick={() => setChestModal(null)}
              className="w-full py-3.5 bg-[#059669] hover:bg-[#047857] border-b-4 border-[#065F46] text-[#FEF3C7] font-black uppercase text-sm rounded-2xl active:translate-y-1 transition-all cursor-pointer shadow-md"
            >
              Claim Rewards
            </button>
          </div>
        </div>
      )}

      {/* 6. DUOLINGO INTERACTIVE LESSON MODAL */}
      {activeLesson && (
        <LessonSessionModal
          lesson={activeLesson}
          isAlreadyCompleted={user.completedLessons.includes(activeLesson.id)}
          onClose={() => setActiveLesson(null)}
          onComplete={handleLessonComplete}
        />
      )}

      {/* 6B. DUOLINGO UNIT & FINAL CHECKPOINT CHALLENGE MODAL */}
      {activeCheckpoint && (
        <UnitCheckpointModal
          checkpoint={activeCheckpoint}
          isOpen={!!activeCheckpoint}
          onClose={() => setActiveCheckpoint(null)}
          onComplete={handleCheckpointComplete}
          userName={user.name}
          userSageloName={user.sageloName}
        />
      )}

      {/* 7. FIREBASE AUTH MODAL (SIGN IN / CREATE ACCOUNT) */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        currentUser={user}
        onAuthSuccess={handleAuthSuccess}
        defaultMode={authModalMode}
      />

      {/* 7B. DUOLINGO-STYLE LANGUAGE SELECTION MODAL */}
      <LanguageChoiceModal
        isOpen={languageModalOpen}
        onClose={() => setLanguageModalOpen(false)}
        activeCourse={activeCourse}
        onSelectCourse={(courseId) => {
          setActiveCourse(courseId);
          try {
            localStorage.setItem('afrilingo_active_course', courseId);
          } catch {}
        }}
        completedLessons={user.completedLessons}
        userXp={user.xp}
      />

      {/* 8. PWA OFFLINE CONNECTIVITY INDICATOR */}
      <OfflineIndicator />
    </div>
  );
}
