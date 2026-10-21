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
import { BranchingSkillTreesView } from './components/BranchingSkillTreesView';
import {
  SKILL_BRANCHES,
  isBranchUnlocked,
  SkillBranch,
} from './data/sageloBranchingPaths';
import { LessonSessionModal } from './components/LessonSessionModal';
import { UnitCheckpointModal } from './components/UnitCheckpointModal';
import { CartoonCharacter } from './components/CartoonCharacters';
import { MatchMadnessGame } from './components/MatchMadnessGame';
import { PracticeLabView } from './components/PracticeLabView';
import { LexiconPhrasebookView } from './components/LexiconPhrasebookView';
import { DuolingoStoriesView } from './components/DuolingoStoriesView';
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

// Unit section color palette for authentic Duolingo multi-unit path
const UNIT_THEMES = [
  {
    bg: 'bg-[#58CC02]',
    border: 'border-[#46A302]',
    lightBg: 'bg-[#58CC02]/10',
    text: 'text-[#58CC02]',
    name: 'Unit 0 • Foundations of Sagelo',
    guideTitle: 'The Philosophy of Sages & Sound Rules',
  },
  {
    bg: 'bg-[#1CB0F6]',
    border: 'border-[#1899D6]',
    lightBg: 'bg-[#1CB0F6]/10',
    text: 'text-[#1CB0F6]',
    name: 'Unit 1 • First Words & Core Roots',
    guideTitle: 'Core Nouns, Evidentiality Particles & Pronouns',
  },
  {
    bg: 'bg-[#CE82FF]',
    border: 'border-[#A855F7]',
    lightBg: 'bg-[#CE82FF]/10',
    text: 'text-[#CE82FF]',
    name: 'Unit 2 • Objects, Descriptions & Questions',
    guideTitle: 'Modifiers (-e), Food Stems & Interrogatives',
  },
  {
    bg: 'bg-[#FF9600]',
    border: 'border-[#E58600]',
    lightBg: 'bg-[#FF9600]/10',
    text: 'text-[#FF9600]',
    name: 'Unit 3 • Numbers, Space & Time',
    guideTitle: 'Counting to Ten, Locatives & Clock Expressions',
  },
  {
    bg: 'bg-[#00CD9C]',
    border: 'border-[#00A880]',
    lightBg: 'bg-[#00CD9C]/10',
    text: 'text-[#00CD9C]',
    name: 'Unit 4 • Action, Movement & Causation',
    guideTitle: 'Aspect Markers, Movement Roots & -ifi Causative',
  },
  {
    bg: 'bg-[#FF4B4B]',
    border: 'border-[#EA2B2B]',
    lightBg: 'bg-[#FF4B4B]/10',
    text: 'text-[#FF4B4B]',
    name: 'Unit 5 • Social Ties & Market Life',
    guideTitle: 'Family Terms, Bargaining & Emotions',
  },
  {
    bg: 'bg-[#2B70C9]',
    border: 'border-[#22579C]',
    lightBg: 'bg-[#2B70C9]/10',
    text: 'text-[#2B70C9]',
    name: 'Unit 6 • Abstract Thought & Discourse',
    guideTitle: 'Conjunctions, Relative Clauses & Evidential Nuance',
  },
  {
    bg: 'bg-[#FFC800]',
    border: 'border-[#E5A500]',
    lightBg: 'bg-[#FFC800]/10',
    text: 'text-[#FFC800]',
    name: 'Unit 7 • Wisdom, Literature & Mastery',
    guideTitle: 'Proverbs, Mantras & Final Synthesis Exam',
  },
];

const BRANCH_BY_UNIT: Record<string, SkillBranch | undefined> = {
  'unit-1': SKILL_BRANCHES.find(b => b.id === 'branch-conversational'),
  'unit-2': SKILL_BRANCHES.find(b => b.id === 'branch-healing'),
  'unit-3': SKILL_BRANCHES.find(b => b.id === 'branch-business'),
  'unit-5': SKILL_BRANCHES.find(b => b.id === 'branch-philosophy'),
};

export default function App() {
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
  }) => {
    setActiveLesson(null);
    const updatedCompleted = user.completedLessons.includes(result.lessonId)
      ? user.completedLessons
      : [...user.completedLessons, result.lessonId];
    const updatedWords = Array.from(
      new Set([...user.masteredWords, ...result.newWords])
    );
    const updated: UserAccount = {
      ...user,
      xp: user.xp + result.xpEarned,
      todayXp: user.todayXp + result.xpEarned,
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
    const updatedCheckpoints = user.completedCheckpoints?.includes(checkpointId)
      ? user.completedCheckpoints
      : [...(user.completedCheckpoints || []), checkpointId];

    const updated: UserAccount = {
      ...user,
      xp: user.xp + xpEarned,
      todayXp: user.todayXp + xpEarned,
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
    <div className="min-h-screen bg-white text-[#3C3C3C] flex flex-col md:flex-row font-['Nunito',sans-serif] w-full max-w-full overflow-x-hidden">
      {/* 1. DUOLINGO LEFT SIDEBAR (STICKY DESKTOP) */}
      <aside className="w-64 border-r-2 border-[#E5E5E5] bg-white h-screen sticky top-0 hidden md:flex flex-col justify-between p-4 z-40 select-none shrink-0">
        <div className="space-y-6">
          {/* Duolingo Wordmark / Logo */}
          <div className="px-3 pt-2 flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#58CC02] border-b-4 border-[#46A302] flex items-center justify-center text-white text-2xl shadow-sm">
              🦜
            </div>
            <div>
              <span className="text-2xl font-black tracking-tight text-[#58CC02]">
                afrilingo
              </span>
              <p className="text-[10px] font-black uppercase tracking-wider text-[#AFAFAF] -mt-1">
                Learn Sagelo
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
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl font-black text-sm uppercase tracking-wider transition-all ${
                activeTab === 'learn' && learnViewMode === 'main_path'
                  ? 'bg-[#58CC02]/15 text-[#58CC02] border-2 border-[#58CC02]'
                  : 'text-[#777777] hover:bg-[#F7F7F7]'
              }`}
            >
              <Compass className="w-6 h-6 text-[#58CC02]" />
              <span>LEARN</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('learn');
                setLearnViewMode('branches');
              }}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl font-black text-sm uppercase tracking-wider transition-all ${
                activeTab === 'branches' || (activeTab === 'learn' && learnViewMode === 'branches')
                  ? 'bg-[#1E293B] text-[#38BDF8] border-2 border-[#38BDF8]'
                  : 'text-[#777777] hover:bg-[#F7F7F7]'
              }`}
            >
              <div className="flex items-center gap-4">
                <Layers className="w-6 h-6 text-[#38BDF8]" />
                <span>SKILL TREES</span>
              </div>
              {SKILL_BRANCHES.filter((b) => isBranchUnlocked(b, user.completedLessons).isUnlocked).length > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-[#58CC02] text-white text-[10px] font-black">
                  {SKILL_BRANCHES.filter((b) => isBranchUnlocked(b, user.completedLessons).isUnlocked).length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('practice')}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl font-black text-sm uppercase tracking-wider transition-all ${
                activeTab === 'practice'
                  ? 'bg-[#1CB0F6]/15 text-[#1CB0F6] border-2 border-[#1CB0F6]'
                  : 'text-[#777777] hover:bg-[#F7F7F7]'
              }`}
            >
              <Zap className="w-6 h-6 text-[#1CB0F6]" />
              <span>PRACTICE</span>
            </button>

            <button
              onClick={() => setActiveTab('connect')}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl font-black text-sm uppercase tracking-wider transition-all ${
                activeTab === 'connect'
                  ? 'bg-[#58CC02]/15 text-[#58CC02] border-2 border-[#58CC02]'
                  : 'text-[#777777] hover:bg-[#F7F7F7]'
              }`}
            >
              <Users className="w-6 h-6 text-[#58CC02]" />
              <span>CONNECT</span>
            </button>

            <button
              onClick={() => setActiveTab('leaderboards')}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl font-black text-sm uppercase tracking-wider transition-all ${
                activeTab === 'leaderboards'
                  ? 'bg-[#FFC800]/15 text-[#D97706] border-2 border-[#FFC800]'
                  : 'text-[#777777] hover:bg-[#F7F7F7]'
              }`}
            >
              <Shield className="w-6 h-6 text-[#FFC800]" />
              <span>LEADERBOARDS</span>
            </button>

            <button
              onClick={() => setActiveTab('quests')}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl font-black text-sm uppercase tracking-wider transition-all ${
                activeTab === 'quests'
                  ? 'bg-[#FF9600]/15 text-[#EA580C] border-2 border-[#FF9600]'
                  : 'text-[#777777] hover:bg-[#F7F7F7]'
              }`}
            >
              <Trophy className="w-6 h-6 text-[#FF9600]" />
              <span>QUESTS</span>
            </button>

            <button
              onClick={() => setActiveTab('shop')}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl font-black text-sm uppercase tracking-wider transition-all ${
                activeTab === 'shop'
                  ? 'bg-[#CE82FF]/15 text-[#A855F7] border-2 border-[#CE82FF]'
                  : 'text-[#777777] hover:bg-[#F7F7F7]'
              }`}
            >
              <ShoppingBag className="w-6 h-6 text-[#CE82FF]" />
              <span>SHOP</span>
            </button>

            <button
              onClick={() => setActiveTab('stories')}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl font-black text-sm uppercase tracking-wider transition-all ${
                activeTab === 'stories'
                  ? 'bg-[#00CD9C]/15 text-[#00A880] border-2 border-[#00CD9C]'
                  : 'text-[#777777] hover:bg-[#F7F7F7]'
              }`}
            >
              <BookOpen className="w-6 h-6 text-[#00CD9C]" />
              <span>STORIES</span>
            </button>

            <button
              onClick={() => setActiveTab('dictionary')}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl font-black text-sm uppercase tracking-wider transition-all ${
                activeTab === 'dictionary'
                  ? 'bg-[#2B70C9]/15 text-[#2B70C9] border-2 border-[#2B70C9]'
                  : 'text-[#777777] hover:bg-[#F7F7F7]'
              }`}
            >
              <Search className="w-6 h-6 text-[#2B70C9]" />
              <span>DICTIONARY</span>
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl font-black text-sm uppercase tracking-wider transition-all ${
                activeTab === 'profile'
                  ? 'bg-[#FF4B4B]/15 text-[#FF4B4B] border-2 border-[#FF4B4B]'
                  : 'text-[#777777] hover:bg-[#F7F7F7]'
              }`}
            >
              <User className="w-6 h-6 text-[#FF4B4B]" />
              <span>PROFILE</span>
            </button>
          </nav>
        </div>

        {/* Install AfriLingo Banner in Sidebar */}
        <PWAInstallButton variant="sidebar" />

        {/* Bottom Course Flag Pill */}
        <div className="p-3 bg-[#F7F7F7] border-2 border-[#E5E5E5] rounded-2xl flex items-center gap-3">
          <span className="text-2xl">🌍</span>
          <div>
            <div className="text-xs font-black text-[#3C3C3C]">Sagelo Course</div>
            <div className="text-[11px] font-bold text-[#AFAFAF]">
              {user.completedLessons.length} / {ALL_LESSONS.length} Lessons Done
            </div>
          </div>
        </div>
      </aside>

      {/* 2. MAIN CENTER + RIGHT AREA */}
      <div className="flex-1 flex flex-col min-w-0 w-full max-w-full overflow-x-hidden">
        {/* DUOLINGO TOP FLOATING STATUS BAR */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-xs border-b-2 border-[#E5E5E5] px-3 sm:px-8 py-2.5 sm:py-3 flex items-center justify-between gap-2 max-w-full overflow-x-hidden">
          <div className="flex items-center gap-2 md:hidden shrink-0">
            <span className="text-2xl">🦜</span>
            <span className="text-lg sm:text-xl font-black tracking-tight text-[#58CC02]">
              afrilingo
            </span>
          </div>

          <div className="hidden md:flex items-center gap-2">
            <span className="text-sm font-black text-[#AFAFAF] uppercase tracking-wider">
              LANGUAGE:
            </span>
            <span className="px-3 py-1 bg-[#F7F7F7] border-2 border-[#E5E5E5] rounded-xl text-xs font-black text-[#3C3C3C] flex items-center gap-1.5">
              🌍 Sagelo (Language of Sages)
            </span>
          </div>

          {/* Gamification Badges: Streak, Gems, Hearts & Profile / Sign In */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* Flame Streak */}
            <div
              className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 bg-[#FFF4E5] border-2 border-[#FFD8A8] rounded-2xl font-mono-num font-black text-xs sm:text-sm text-[#EA580C] shadow-xs cursor-default"
              title="Daily Learning Streak"
            >
              <Flame className="w-3.5 h-3.5 sm:w-5 sm:h-5 fill-[#EA580C] text-[#EA580C] animate-pulse" />
              <span>{user.streakDays}</span>
            </div>

            {/* Cowrie Gems */}
            <div
              className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 bg-[#EFF6FF] border-2 border-[#BFDBFE] rounded-2xl font-mono-num font-black text-xs sm:text-sm text-[#1CB0F6] shadow-xs cursor-default"
              title="Cowrie Gems / Lingots"
            >
              <Gem className="w-3.5 h-3.5 sm:w-5 sm:h-5 fill-[#1CB0F6] text-[#1CB0F6]" />
              <span>{cowrieGems}</span>
            </div>

            {/* Chi / Hearts */}
            <button
              onClick={handleRefillHearts}
              className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 bg-[#FEF2F2] border-2 border-[#FECACA] hover:bg-[#FEE2E2] rounded-2xl font-mono-num font-black text-xs sm:text-sm text-[#FF4B4B] shadow-xs transition-colors"
              title="Hearts / Health (Click to refill)"
            >
              <Heart className="w-3.5 h-3.5 sm:w-5 sm:h-5 fill-[#FF4B4B] text-[#FF4B4B]" />
              <span>{user.hearts}</span>
            </button>

            {/* Master Misaga Graduation Seal Pill (if certified) */}
            {user.masteryCertified && (
              <button
                onClick={() => {
                  const masteryCp = UNIT_CHECKPOINTS['unit-mastery'];
                  if (masteryCp) setActiveCheckpoint(masteryCp);
                }}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 bg-[#FFFBEB] hover:bg-[#FEF3C7] border-2 border-[#FDE68A] rounded-2xl text-xs font-black text-[#D97706] shadow-xs transition-colors shrink-0 animate-pulse"
                title="View Official Master of Sagelo Graduation Diploma"
              >
                <span>👑</span>
                <span className="hidden sm:inline">Master Misaga</span>
              </button>
            )}

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
              className="flex items-center gap-1 px-2.5 sm:px-3 py-1 sm:py-1.5 bg-[#58CC02]/10 hover:bg-[#58CC02]/20 border-2 border-[#58CC02]/40 rounded-2xl text-xs font-black text-[#46A302] shadow-xs transition-colors shrink-0"
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
            {/* TAB 1: THE DUOLINGO WINDING PATH & BRANCHING SKILL TREES */}
            {(activeTab === 'learn' || activeTab === 'branches') && (
              <div className="space-y-8">
                {/* DUAL-MODE VIEW SWITCHER */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-2.5 rounded-3xl border-2 border-b-6 border-[#E5E5E5] shadow-xs">
                  <div className="flex items-center gap-1.5 p-1 bg-[#F7F7F7] rounded-2xl border border-[#E5E5E5] w-full sm:w-auto">
                    <button
                      onClick={() => {
                        setActiveTab('learn');
                        setLearnViewMode('main_path');
                      }}
                      className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        activeTab !== 'branches' && learnViewMode === 'main_path'
                          ? 'bg-[#58CC02] border-b-2 border-[#46A302] text-white shadow-xs'
                          : 'text-[#777777] hover:text-[#3C3C3C]'
                      }`}
                    >
                      <Compass className="w-4 h-4" />
                      <span>Main Path (8 Units)</span>
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab('learn');
                        setLearnViewMode('branches');
                      }}
                      className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        activeTab === 'branches' || (activeTab === 'learn' && learnViewMode === 'branches')
                          ? 'bg-[#1E293B] border-b-2 border-[#0F172A] text-[#38BDF8] shadow-xs'
                          : 'text-[#777777] hover:text-[#3C3C3C]'
                      }`}
                    >
                      <Layers className="w-4 h-4 text-[#38BDF8]" />
                      <span>Skill Trees</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                        SKILL_BRANCHES.filter((b) => isBranchUnlocked(b, user.completedLessons).isUnlocked).length > 0
                          ? 'bg-[#38BDF8] text-[#0F172A]'
                          : 'bg-[#E2E8F0] text-[#64748B]'
                      }`}>
                        {SKILL_BRANCHES.filter((b) => isBranchUnlocked(b, user.completedLessons).isUnlocked).length} Unlocked
                      </span>
                    </button>
                  </div>

                  <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-[#777777] pr-2">
                    <span>
                      {learnViewMode === 'branches' || activeTab === 'branches'
                        ? '🌟 Specialized topic trees: Business, Conversation, Healing & Philosophy'
                        : '💡 Complete foundational units to branch into specialized topics'}
                    </span>
                  </div>
                </div>

                {/* VIEW A: BRANCHING SKILL TREES VIEW */}
                {activeTab === 'branches' || (activeTab === 'learn' && learnViewMode === 'branches') ? (
                  <BranchingSkillTreesView
                    completedLessonIds={user.completedLessons}
                    onStartLesson={(branchLesson) => setActiveLesson(branchLesson)}
                    onJumpToUnit={() => {
                      setActiveTab('learn');
                      setLearnViewMode('main_path');
                    }}
                  />
                ) : (
                  /* VIEW B: MAIN DUOLINGO WINDING PATH */
                  <div className="space-y-12">
                    {/* Loop across all 8 Units */}
                    {SAGELO_CURRICULUM.map((unit, unitIndex) => {
                      const theme = UNIT_THEMES[unitIndex % UNIT_THEMES.length];
                      return (
                        <div key={unit.id} className="space-y-8">
                      {/* DUOLINGO UNIT HEADER CARD */}
                      <div
                        className={`${theme.bg} ${theme.border} border-b-6 text-white rounded-3xl p-6 sm:p-7 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4`}
                      >
                        <div className="space-y-1">
                          <span className="text-xs font-black uppercase tracking-wider text-white/80">
                            SECTION 1 • UNIT {unitIndex}
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
                          className="bg-white/20 hover:bg-white/30 border-2 border-white/40 text-white font-black text-xs uppercase tracking-wider px-4 py-2.5 rounded-2xl flex items-center gap-2 self-start sm:self-center transition-all active:translate-y-0.5"
                        >
                          <BookOpen className="w-4 h-4" />
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
                                <div className="mb-2 bg-[#58CC02] text-white text-xs font-black uppercase px-4 py-1.5 rounded-2xl shadow-md border-b-2 border-[#46A302] animate-bounce tracking-wider flex items-center gap-1.5 z-10">
                                  <span>START +{lesson.xpReward} XP</span>
                                </div>
                              )}

                              {/* 3D Round Duolingo Button */}
                              <button
                                onClick={() => !isLocked && setActiveLesson(lesson)}
                                disabled={isLocked}
                                className={`relative w-20 h-20 rounded-full flex flex-col items-center justify-center transition-all duration-150 active:translate-y-1 ${
                                  isCompleted
                                    ? 'bg-[#FFC800] border-b-6 border-[#E5A500] hover:brightness-105 shadow-md text-white'
                                    : isCurrent
                                    ? 'bg-[#58CC02] border-b-6 border-[#46A302] hover:brightness-105 shadow-xl text-white ring-8 ring-[#58CC02]/25'
                                    : 'bg-[#E5E5E5] border-b-6 border-[#C7C7C7] text-[#AFAFAF] cursor-not-allowed'
                                }`}
                              >
                                {isCompleted ? (
                                  <CheckCircle2 className="w-9 h-9 stroke-[3]" />
                                ) : isCurrent ? (
                                  <Star className="w-9 h-9 fill-white stroke-[2.5]" />
                                ) : (
                                  <Lock className="w-8 h-8 stroke-[2.5]" />
                                )}
                              </button>

                              {/* Lesson title label */}
                              <div className="mt-2 text-center max-w-[140px]">
                                <p className="text-xs font-black text-[#3C3C3C] leading-tight line-clamp-1">
                                  {lesson.title}
                                </p>
                                <span className="text-[10px] font-bold text-[#AFAFAF]">
                                  {lesson.numberLabel}
                                </span>
                              </div>
                            </div>
                          );
                        })}

                        {/* Mid-unit Treasure Chest */}
                        <div className="py-2 flex flex-col items-center">
                          <button
                            onClick={handleClaimChest}
                            className="w-16 h-16 rounded-2xl bg-[#FF9600] border-b-6 border-[#E58600] flex items-center justify-center text-3xl shadow-md hover:scale-105 active:translate-y-1 transition-all"
                            title="Open Reward Chest"
                          >
                            🎁
                          </button>
                          <span className="text-[11px] font-black uppercase text-[#FF9600] tracking-wider mt-1.5">
                            Bonus Chest
                          </span>
                        </div>

                        {/* INTERACTIVE DUOLINGO CHECKPOINT GATEWAY MONUMENT */}
                        {(() => {
                          const checkpoint = UNIT_CHECKPOINTS[unit.id];
                          if (!checkpoint) return null;
                          const allUnitLessonsCompleted = unit.lessons.every((l) =>
                            user.completedLessons.includes(l.id)
                          );
                          const isCheckpointCompleted = (user.completedCheckpoints || []).includes(
                            checkpoint.id
                          );
                          const isCheckpointUnlocked =
                            allUnitLessonsCompleted || isCheckpointCompleted;
                          const isFinalUnit = unit.id === 'unit-mastery';

                          return (
                            <div className="pt-4 flex flex-col items-center">
                              {/* Bouncing speech bubble when unlocked but not completed */}
                              {isCheckpointUnlocked && !isCheckpointCompleted && (
                                <div
                                  className={`mb-2 ${
                                    isFinalUnit
                                      ? 'bg-[#FF9600] border-[#D97706]'
                                      : 'bg-[#58CC02] border-[#46A302]'
                                  } text-white text-xs font-black uppercase px-4 py-1.5 rounded-2xl shadow-lg border-b-2 animate-bounce tracking-wider flex items-center gap-1.5 z-10`}
                                >
                                  <span>
                                    {isFinalUnit
                                      ? '👑 FINAL GRADUATION EXAM'
                                      : `GATEWAY CHALLENGE +${checkpoint.xpReward} XP`}
                                  </span>
                                </div>
                              )}

                              {isCheckpointCompleted && (
                                <div className="mb-2 flex items-center gap-1.5 px-3 py-1 bg-[#FFFBEB] border border-[#FDE68A] rounded-full text-[11px] font-black uppercase text-[#D97706] tracking-wider shadow-xs">
                                  <Sparkles className="w-3.5 h-3.5 text-[#D97706]" />
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
                                    ? 'bg-[#FFC800] border-[#E5A500] hover:brightness-105 ring-4 ring-[#FFC800]/30 cursor-pointer'
                                    : isCheckpointUnlocked
                                    ? isFinalUnit
                                      ? 'bg-[#FF9600] border-[#D97706] hover:brightness-105 ring-8 ring-[#FF9600]/30 animate-pulse cursor-pointer'
                                      : `${theme.bg} ${theme.border} hover:brightness-105 ring-6 ring-[#58CC02]/30 cursor-pointer`
                                    : 'bg-[#E5E5E5] border-[#C7C7C7] text-[#AFAFAF] cursor-not-allowed'
                                }`}
                                title={
                                  isCheckpointUnlocked
                                    ? `Challenge ${checkpoint.title}`
                                    : `Finish all ${unit.lessons.length} lessons in Unit ${unitIndex} to unlock this Checkpoint Gateway`
                                }
                              >
                                <span>{isFinalUnit ? '👑' : isCheckpointCompleted ? checkpoint.badgeIcon : '🏰'}</span>
                                {!isCheckpointUnlocked && (
                                  <div className="absolute inset-0 bg-[#3C3C3C]/20 rounded-3xl flex items-center justify-center">
                                    <Lock className="w-7 h-7 text-white stroke-[3] drop-shadow-md" />
                                  </div>
                                )}
                              </button>

                              <div className="text-center mt-2 max-w-[210px]">
                                <p className="text-xs font-black text-[#3C3C3C] uppercase tracking-wider">
                                  {checkpoint.title}
                                </p>
                                <span className="text-[10px] font-bold text-[#AFAFAF]">
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

                        {/* CARTOON CHARACTER MILESTONES ALONG THE DUOLINGO PATH */}
                        {unitIndex === 0 && (
                          <div className="py-4 flex items-center gap-3 bg-[#F7F7F7] border-2 border-[#E5E5E5] rounded-3xl p-4 max-w-sm w-full shadow-xs">
                            <CartoonCharacter character="duo" mood="speaking" size="sm" animate={true} />
                            <div className="text-left">
                              <span className="text-[10px] font-black uppercase text-[#58CC02] tracking-wider">
                                Duo Kuku says:
                              </span>
                              <p className="text-xs font-bold text-[#3C3C3C] leading-snug">
                                "Karibu! You've stepped onto the path of sages. Build your streak daily!"
                              </p>
                            </div>
                          </div>
                        )}

                        {unitIndex === 2 && (
                          <div className="py-4 flex items-center gap-3 bg-[#F7F7F7] border-2 border-[#E5E5E5] rounded-3xl p-4 max-w-sm w-full shadow-xs">
                            <CartoonCharacter character="mwana" mood="celebrating" size="sm" animate={false} />
                            <div className="text-left">
                              <span className="text-[10px] font-black uppercase text-[#E59900] tracking-wider">
                                Mwana Kofi cheers:
                              </span>
                              <p className="text-xs font-bold text-[#3C3C3C] leading-snug">
                                "Evidentiality lets you declare truth with honor. You're unstoppable!"
                              </p>
                            </div>
                          </div>
                        )}

                        {unitIndex === 4 && (
                          <div className="py-4 flex items-center gap-3 bg-[#F7F7F7] border-2 border-[#E5E5E5] rounded-3xl p-4 max-w-sm w-full shadow-xs">
                            <CartoonCharacter character="nyango" mood="thinking" size="sm" animate={false} />
                            <div className="text-left">
                              <span className="text-[10px] font-black uppercase text-[#C84B24] tracking-wider">
                                Nyango Amina notes:
                              </span>
                              <p className="text-xs font-bold text-[#3C3C3C] leading-snug">
                                "Every root connects to an exact mental world. Notice the pure symmetry!"
                              </p>
                            </div>
                          </div>
                        )}

                        {unitIndex === 6 && (
                          <div className="py-4 flex items-center gap-3 bg-[#FFFDF5] border-2 border-[#FDE68A] rounded-3xl p-4 max-w-sm w-full shadow-md">
                            <CartoonCharacter character="mpaka" mood="speaking" size="sm" animate={false} />
                            <div className="text-left">
                              <span className="text-[10px] font-black uppercase text-[#B45309] tracking-wider">
                                Grand Master Mpaka invites:
                              </span>
                              <p className="text-xs font-bold text-[#451A03] leading-snug">
                                "The final summit is near. Prepare yourself for the Grand Graduation Checkpoint!"
                              </p>
                            </div>
                          </div>
                        )}

                        {/* BRANCHING SKILL TREE OUTPOST GATEWAY (Unlocks specialized branches after this unit) */}
                        {(() => {
                          const branchForUnit = BRANCH_BY_UNIT[unit.id];
                          if (!branchForUnit) return null;
                          const branchStatus = isBranchUnlocked(branchForUnit, user.completedLessons);
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
                                <div className="w-0.5 h-6 border-l-2 border-dashed border-[#AFAFAF]" />
                                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#E5E5E5] text-[10px] font-black uppercase tracking-wider text-[#64748B] shadow-2xs mb-3">
                                  <GitBranch className="w-3.5 h-3.5 text-[#38BDF8]" />
                                  <span>Branching Skill Path</span>
                                </div>
                              </div>

                              <div
                                className={`rounded-3xl border-2 border-b-6 transition-all p-5 shadow-sm overflow-hidden relative ${
                                  branchStatus.isUnlocked
                                    ? 'bg-gradient-to-br from-white via-[#F8FAFC] to-white border-[#38BDF8] hover:border-[#0284C7] shadow-md ring-4 ring-[#38BDF8]/10'
                                    : 'bg-[#F8FAFC] border-[#E2E8F0]'
                                }`}
                              >
                                <div className="flex items-start justify-between gap-3 relative z-10">
                                  <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-2xl bg-white border-2 border-black/5 shadow-sm flex items-center justify-center text-2xl shrink-0">
                                      {branchForUnit.icon}
                                    </div>
                                    <div>
                                      <div className="flex items-center gap-1.5">
                                        <span className="text-[10px] font-black uppercase tracking-wider text-[#64748B]">
                                          Specialized Track
                                        </span>
                                        {isBranchMastered && (
                                          <span className="px-1.5 py-0.2 rounded bg-[#58CC02] text-white text-[9px] font-black uppercase">
                                            Mastered
                                          </span>
                                        )}
                                      </div>
                                      <h4 className="text-base font-black text-[#0F172A] leading-tight">
                                        {branchForUnit.title}
                                      </h4>
                                    </div>
                                  </div>

                                  {branchStatus.isUnlocked ? (
                                    <span className="px-2.5 py-1 rounded-xl bg-[#DCFCE7] border border-[#86EFAC] text-[#166534] text-xs font-black flex items-center gap-1 shrink-0">
                                      <Sparkles className="w-3.5 h-3.5 text-[#58CC02]" />
                                      <span>Unlocked</span>
                                    </span>
                                  ) : (
                                    <span className="px-2.5 py-1 rounded-xl bg-black/5 border border-black/10 text-[#64748B] text-xs font-black flex items-center gap-1 shrink-0">
                                      <Lock className="w-3.5 h-3.5" />
                                      <span>Locked</span>
                                    </span>
                                  )}
                                </div>

                                <p className="text-xs font-bold text-[#475569] mt-3 relative z-10 leading-relaxed">
                                  {branchForUnit.tagline}
                                </p>

                                <div className="mt-4 pt-3 border-t border-black/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                  {branchStatus.isUnlocked ? (
                                    <div className="space-y-1.5 w-full">
                                      <div className="flex items-center justify-between text-[11px] font-bold text-[#15803D]">
                                        <span>
                                          {branchCompletedCount} of {branchForUnit.lessons.length} branch lessons completed
                                        </span>
                                        <span className="text-xs">🌳</span>
                                      </div>
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setActiveTab('learn');
                                            setLearnViewMode('branches');
                                          }}
                                          className="px-3.5 py-2 bg-[#0F172A] hover:bg-[#1E293B] text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 active:translate-y-0.5 transition-all cursor-pointer shadow-xs"
                                        >
                                          <Layers className="w-3.5 h-3.5 text-[#38BDF8]" />
                                          <span>Open Skill Tree</span>
                                        </button>
                                        {branchForUnit.lessons[0] && (
                                          <button
                                            type="button"
                                            onClick={() => setActiveLesson(branchForUnit.lessons[0])}
                                            className="px-3.5 py-2 bg-[#58CC02] hover:bg-[#61E002] border-b-2 border-[#46A302] text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 active:translate-y-0.5 transition-all cursor-pointer shadow-xs"
                                          >
                                            <span>Start Lesson 1</span>
                                            <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="w-full space-y-2">
                                      <div className="flex items-center justify-between text-xs font-bold text-[#64748B]">
                                        <span>
                                          Complete {branchForUnit.unlockRequirement.requiredCompletedCount} lessons in Unit {unitIndex}
                                        </span>
                                        <span className="font-mono">
                                          {branchStatus.completedCount} / {branchStatus.requiredCount}
                                        </span>
                                      </div>
                                      <div className="w-full h-2.5 bg-[#E2E8F0] rounded-full overflow-hidden">
                                        <div
                                          className="h-full bg-[#38BDF8] rounded-full transition-all duration-300"
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
              </div>
            )}

            {/* TAB 2: DUOLINGO PRACTICE (MATCH MADNESS & TONE/SCRIPT LABS) */}
            {activeTab === 'practice' && (
              <div className="space-y-8">
                {/* Match Madness 45s Rapid-Recall Mini-game */}
                <MatchMadnessGame
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
              <div className="bg-white border-2 border-b-6 border-[#E5E5E5] rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
                <div className="flex items-center gap-4 border-b-2 pb-5 border-[#E5E5E5]">
                  <div className="w-16 h-16 rounded-3xl bg-[#FFC800] border-b-6 border-[#E5A500] flex items-center justify-center text-white text-3xl shadow-sm">
                    🛡️
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-[#3C3C3C]">
                      Gold Baobab League
                    </h3>
                    <p className="text-xs font-bold text-[#777777] mt-0.5">
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
                          ? 'bg-[#58CC02]/10 border-[#58CC02] ring-4 ring-[#58CC02]/20'
                          : 'bg-white border-[#E5E5E5]'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <span
                          className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-mono-num font-black ${
                            item.rank === 1
                              ? 'bg-[#FEF08A] text-[#854D0E] border border-[#FACC15]'
                              : item.rank === 2
                              ? 'bg-[#E2E8F0] text-[#334155] border border-[#CBD5E1]'
                              : item.rank === 3
                              ? 'bg-[#FFEDD5] text-[#9A3412] border border-[#FDBA74]'
                              : 'text-[#AFAFAF]'
                          }`}
                        >
                          {item.rank}
                        </span>

                        <span className="text-2xl select-none">{item.avatar}</span>

                        <div>
                          <p className="text-base font-black text-[#3C3C3C]">
                            {item.name}
                          </p>
                          <p className="text-xs font-bold text-[#AFAFAF]">
                            {item.country}
                          </p>
                        </div>
                      </div>

                      <div className="font-mono-num font-black text-base text-[#58CC02]">
                        {item.xp} XP
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: DAILY QUESTS */}
            {activeTab === 'quests' && (
              <div className="bg-white border-2 border-b-6 border-[#E5E5E5] rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
                <div className="flex items-center gap-4 border-b-2 pb-5 border-[#E5E5E5]">
                  <div className="w-16 h-16 rounded-3xl bg-[#FF9600] border-b-6 border-[#E58600] flex items-center justify-center text-white text-3xl shadow-sm">
                    🎯
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-[#3C3C3C]">
                      Daily Quests
                    </h3>
                    <p className="text-xs font-bold text-[#777777] mt-0.5">
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
                        className="p-5 rounded-2xl border-2 border-b-4 border-[#E5E5E5] bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div className="space-y-1.5 flex-1">
                          <h4 className="text-base font-black text-[#3C3C3C]">
                            {quest.title}
                          </h4>
                          <p className="text-xs font-bold text-[#777777]">
                            {quest.description}
                          </p>
                          <div className="flex items-center gap-3 pt-1 w-full max-w-xs">
                            <div className="h-3.5 w-full bg-[#E5E5E5] rounded-full overflow-hidden">
                              <div
                                className="h-full bg-[#FF9600] transition-all"
                                style={{
                                  width: `${Math.min(
                                    100,
                                    (quest.progress / quest.goal) * 100
                                  )}%`,
                                }}
                              />
                            </div>
                            <span className="text-xs font-mono-num font-black text-[#AFAFAF]">
                              {quest.progress}/{quest.goal}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleClaimQuest(quest.id, quest.reward)}
                          disabled={!quest.completed || isClaimed}
                          className={`px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all border-b-4 ${
                            isClaimed
                              ? 'bg-[#E5E5E5] border-[#D0D0D0] text-[#AFAFAF] cursor-default'
                              : quest.completed
                              ? 'bg-[#FF9600] hover:bg-[#E58600] border-[#C26B00] text-white shadow-md active:translate-y-1'
                              : 'bg-[#E5E5E5] border-[#D0D0D0] text-[#AFAFAF] cursor-not-allowed'
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
              <div className="bg-white border-2 border-b-6 border-[#E5E5E5] rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
                <div className="flex items-center justify-between border-b-2 pb-5 border-[#E5E5E5]">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-3xl bg-[#CE82FF] border-b-6 border-[#A855F7] flex items-center justify-center text-white text-3xl shadow-sm">
                      🛒
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-[#3C3C3C]">
                        The Cowrie Bazaar
                      </h3>
                      <p className="text-xs font-bold text-[#777777] mt-0.5">
                        Exchange your hard-earned gems for heart refills and power-ups.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 px-4 py-2 bg-[#EFF6FF] border-2 border-[#BFDBFE] rounded-2xl font-mono-num font-black text-base text-[#1CB0F6]">
                    <Gem className="w-5 h-5 fill-[#1CB0F6]" />
                    <span>{cowrieGems} Gems</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Item 1: Heart Refill */}
                  <div className="p-5 rounded-2xl border-2 border-b-4 border-[#E5E5E5] bg-white space-y-3">
                    <div className="text-3xl">❤️</div>
                    <h4 className="font-black text-base text-[#3C3C3C]">
                      Full Heart Refill
                    </h4>
                    <p className="text-xs font-bold text-[#777777] leading-relaxed">
                      Restores your Chi life energy to full 5/5 hearts so you never get interrupted during lessons.
                    </p>
                    <button
                      onClick={handleRefillHearts}
                      className="w-full py-3 bg-[#FF4B4B] hover:bg-[#EA2B2B] border-b-4 border-[#DC2626] text-white text-xs font-black uppercase rounded-2xl active:translate-y-1 transition-all"
                    >
                      Refill Hearts (Free)
                    </button>
                  </div>

                  {/* Item 2: Streak Freeze */}
                  <div className="p-5 rounded-2xl border-2 border-b-4 border-[#E5E5E5] bg-white space-y-3">
                    <div className="text-3xl">🧊</div>
                    <h4 className="font-black text-base text-[#3C3C3C]">
                      Streak Freeze Amulet
                    </h4>
                    <p className="text-xs font-bold text-[#777777] leading-relaxed">
                      Protects your learning streak for an entire day if you miss a study session.
                    </p>
                    <button
                      disabled
                      className="w-full py-3 bg-[#E5E5E5] border-b-4 border-[#D0D0D0] text-[#AFAFAF] text-xs font-black uppercase rounded-2xl cursor-not-allowed"
                    >
                      Equipped (Active) ✓
                    </button>
                  </div>

                  {/* Item 3: Double XP Potion */}
                  <div className="p-5 rounded-2xl border-2 border-b-4 border-[#E5E5E5] bg-white space-y-3">
                    <div className="text-3xl">🧪</div>
                    <h4 className="font-black text-base text-[#3C3C3C]">
                      Baobab Double XP Boost
                    </h4>
                    <p className="text-xs font-bold text-[#777777] leading-relaxed">
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
                      className="w-full py-3 bg-[#1CB0F6] hover:bg-[#1899D6] border-b-4 border-[#1580B8] text-white text-xs font-black uppercase rounded-2xl active:translate-y-1 transition-all"
                    >
                      Activate (+50 XP Bonus)
                    </button>
                  </div>

                  {/* Item 4: Kente Robe Outfit */}
                  <div className="p-5 rounded-2xl border-2 border-b-4 border-[#E5E5E5] bg-white space-y-3">
                    <div className="text-3xl">👑</div>
                    <h4 className="font-black text-base text-[#3C3C3C]">
                      Golden Kente Crown Outfit
                    </h4>
                    <p className="text-xs font-bold text-[#777777] leading-relaxed">
                      Custom avatar accessory for your profile and leaderboard badges.
                    </p>
                    <button
                      disabled
                      className="w-full py-3 bg-[#FFC800] border-b-4 border-[#E5A500] text-white text-xs font-black uppercase rounded-2xl cursor-default"
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
                onCompleteStory={(storyId, xp) => {
                  updateUser({
                    ...user,
                    xp: user.xp + xp,
                    todayXp: user.todayXp + xp,
                  });
                }}
              />
            )}

            {/* TAB 7: DICTIONARY & PHRASES */}
            {activeTab === 'dictionary' && (
              <LexiconPhrasebookView
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
              <div className="bg-white border-2 border-b-6 border-[#E5E5E5] rounded-3xl p-6 sm:p-8 space-y-8 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b-2 pb-6 border-[#E5E5E5]">
                  <div className="flex items-center gap-5">
                    <div className="w-20 h-20 rounded-3xl bg-[#58CC02] border-b-6 border-[#46A302] text-white flex items-center justify-center text-4xl shadow-md shrink-0">
                      {user.avatarKey === 'mpaka'
                        ? '👴🏾'
                        : user.avatarKey === 'nyango'
                        ? '👩🏾'
                        : '🧒🏾'}
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-[#3C3C3C]">
                        {user.name}
                      </h3>
                      <p className="text-sm font-bold text-[#58CC02]">
                        {user.sageloName}
                      </p>
                      <p className="text-xs font-bold text-[#AFAFAF] mt-0.5">
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
                        className="px-4 py-2 bg-[#FEF2F2] border-2 border-b-4 border-[#FECACA] hover:bg-[#FEE2E2] text-xs font-black uppercase text-[#EF4444] rounded-2xl active:translate-y-1 transition-all flex items-center gap-1.5"
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
                        className="px-4 py-2 bg-[#58CC02] hover:bg-[#61E002] border-b-4 border-[#46A302] text-white text-xs font-black uppercase rounded-2xl active:translate-y-1 transition-all flex items-center gap-1.5 shadow-sm"
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
                      className="px-4 py-2 bg-white border-2 border-b-4 border-[#E5E5E5] hover:bg-[#F7F7F7] text-xs font-black uppercase text-[#3C3C3C] rounded-2xl active:translate-y-1 transition-all"
                    >
                      Edit Name
                    </button>
                  </div>
                </div>

                {/* Account & Sync Status Banner */}
                <div className={`p-4 rounded-2xl border-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  firebaseUser && !firebaseUser.isAnonymous
                    ? 'bg-[#DCFCE7]/60 border-[#86EFAC] text-[#166534]'
                    : 'bg-[#FFF4E5] border-[#FFD8A8] text-[#9A3412]'
                }`}>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider">
                      <span>{firebaseUser && !firebaseUser.isAnonymous ? '● Account Synced to Firestore' : '○ Guest Learner Session'}</span>
                    </div>
                    <p className="text-xs font-bold">
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
                      className="px-3.5 py-1.5 bg-[#FF9600] text-white text-xs font-black uppercase rounded-xl border-b-2 border-[#E58600] self-start sm:self-center shrink-0"
                    >
                      Log In Now
                    </button>
                  )}
                </div>

                {/* Avatar Persona Switcher */}
                <div className="space-y-2">
                  <h4 className="text-xs font-black uppercase text-[#AFAFAF] tracking-wider">
                    Avatar Persona
                  </h4>
                  <div className="grid grid-cols-3 gap-3 max-w-sm">
                    {(['mwana', 'nyango', 'mpaka'] as const).map((key) => (
                      <button
                        key={key}
                        onClick={() => updateUser({ ...user, avatarKey: key })}
                        className={`p-3 rounded-2xl border-2 text-center transition-all ${
                          user.avatarKey === key
                            ? 'border-[#58CC02] bg-[#58CC02]/10 ring-2 ring-[#58CC02]'
                            : 'border-[#E5E5E5] bg-white hover:bg-[#F7F7F7]'
                        }`}
                      >
                        <div className="text-2xl mb-1">
                          {key === 'mwana' ? '🧒🏾' : key === 'nyango' ? '👩🏾' : '👴🏾'}
                        </div>
                        <div className="text-xs font-black capitalize text-[#3C3C3C]">{key}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Connect with Friends Shortcut */}
                <div className="bg-[#EFF6FF] border-2 border-b-4 border-[#BFDBFE] rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-[#1CB0F6] border-b-4 border-[#1899D6] text-white flex items-center justify-center text-2xl shadow-xs shrink-0">
                      🌍
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-[#1CB0F6] uppercase tracking-wider">
                        Social & Study Circles
                      </h4>
                      <p className="text-xs font-bold text-[#3C3C3C]">
                        Connect with fellow Sagelo learners, give high-fives, and share wisdom posts!
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab('connect')}
                    className="px-4 py-2.5 bg-[#1CB0F6] hover:bg-[#1899D6] border-b-4 border-[#1580B8] text-white text-xs font-black uppercase rounded-2xl active:translate-y-0.5 transition-all self-start sm:self-center shrink-0 shadow-xs"
                  >
                    Find Friends →
                  </button>
                </div>

                {/* Statistics Grid */}
                <div className="space-y-3">
                  <h4 className="text-sm font-black uppercase text-[#AFAFAF] tracking-wider">
                    Statistics
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="p-4 rounded-2xl border-2 border-b-4 border-[#E5E5E5] bg-white">
                      <div className="text-2xl font-mono-num font-black text-[#EA580C]">
                        🔥 {user.streakDays}
                      </div>
                      <div className="text-xs font-bold text-[#777777]">
                        Day Streak
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl border-2 border-b-4 border-[#E5E5E5] bg-white">
                      <div className="text-2xl font-mono-num font-black text-[#FF9600]">
                        ⚡ {user.xp}
                      </div>
                      <div className="text-xs font-bold text-[#777777]">
                        Total XP
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl border-2 border-b-4 border-[#E5E5E5] bg-white">
                      <div className="text-2xl font-mono-num font-black text-[#FFC800]">
                        🛡️ Gold
                      </div>
                      <div className="text-xs font-bold text-[#777777]">
                        Current League
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl border-2 border-b-4 border-[#E5E5E5] bg-white">
                      <div className="text-2xl font-mono-num font-black text-[#1CB0F6]">
                        📚 {user.masteredWords.length}
                      </div>
                      <div className="text-xs font-bold text-[#777777]">
                        Roots Mastered
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sagelo Learner Notebook Entries */}
                <div className="space-y-3">
                  <h4 className="text-sm font-black uppercase text-[#AFAFAF] tracking-wider">
                    Learner Notebook
                  </h4>
                  <div className="space-y-3">
                    {user.notebook.map(note => (
                      <div
                        key={note.id}
                        className="p-4 rounded-2xl border-2 border-[#E5E5E5] bg-[#F7F7F7] flex items-center justify-between gap-4"
                      >
                        <div>
                          <p className="text-base font-black text-[#3C3C3C]">
                            {note.sagelo}
                          </p>
                          <p className="text-xs font-bold text-[#777777]">
                            {note.english}
                          </p>
                        </div>
                        <button
                          onClick={() =>
                            playSageloPhrase(note.sagelo)
                          }
                          className="w-9 h-9 rounded-xl bg-[#1CB0F6] text-white flex items-center justify-center shrink-0 border-b-2 border-[#1899D6]"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Install App on Device Card */}
                <div className="p-5 bg-gradient-to-br from-[#F0FDF4] to-[#DCFCE7] border-2 border-[#86EFAC] rounded-3xl space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">📲</span>
                    <div>
                      <h4 className="text-base font-black text-[#15803D]">
                        Install AfriLingo on Your Device
                      </h4>
                      <p className="text-xs font-bold text-[#166534]">
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
            <div className="bg-white border-2 border-b-4 border-[#E5E5E5] rounded-3xl p-5 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-[#58CC02]">
                  7-Day Speaking Sprint
                </span>
                <span className="text-xs font-mono-num font-black text-[#EA580C]">
                  Day 1 of 7
                </span>
              </div>
              <h4 className="font-black text-base text-[#3C3C3C]">
                Speak Everyday Phrases in 1 Week
              </h4>
              <div className="bg-[#F7F7F7] border-2 border-[#E5E5E5] rounded-2xl p-4 space-y-2">
                <p className="text-sm font-black text-[#58CC02]">
                  "Shanti, ndeko! Yo {user.name} oni."
                </p>
                <p className="text-xs font-bold text-[#777777]">
                  Peace, friend! I am {user.name}.
                </p>
                <button
                  onClick={() =>
                    playSageloPhrase(`Shanti, ndeko! Yo ${user.name} oni.`)
                  }
                  className="w-full py-2 bg-[#1CB0F6] hover:bg-[#1899D6] border-b-4 border-[#1580B8] text-white text-xs font-black uppercase rounded-xl flex items-center justify-center gap-1.5 active:translate-y-1 transition-all"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Listen with African Tone</span>
                </button>
              </div>
            </div>

            {/* Daily Quests Widget */}
            <div className="bg-white border-2 border-b-4 border-[#E5E5E5] rounded-3xl p-5 space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <h4 className="font-black text-base text-[#3C3C3C]">
                  Daily Quests
                </h4>
                <button
                  onClick={() => setActiveTab('quests')}
                  className="text-xs font-black text-[#1CB0F6] uppercase tracking-wider hover:underline"
                >
                  VIEW ALL
                </button>
              </div>

              <div className="space-y-3">
                {quests.slice(0, 2).map(q => (
                  <div key={q.id} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-black text-[#3C3C3C]">
                      <span>{q.title}</span>
                      <span className="text-[#AFAFAF] font-mono-num">
                        {q.progress}/{q.goal}
                      </span>
                    </div>
                    <div className="h-3 w-full bg-[#E5E5E5] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#FF9600]"
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
            <div className="bg-white border-2 border-b-4 border-[#E5E5E5] rounded-3xl p-5 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <h4 className="font-black text-base text-[#3C3C3C]">
                  Gold Baobab League
                </h4>
                <button
                  onClick={() => setActiveTab('leaderboards')}
                  className="text-xs font-black text-[#1CB0F6] uppercase tracking-wider hover:underline"
                >
                  LEADERBOARDS
                </button>
              </div>

              <div className="flex items-center gap-4 bg-[#F7F7F7] p-3 rounded-2xl border-2 border-[#E5E5E5]">
                <div className="w-12 h-12 rounded-2xl bg-[#FFC800] border-b-4 border-[#E5A500] flex items-center justify-center text-2xl shadow-xs">
                  🛡️
                </div>
                <div>
                  <div className="text-xs font-black text-[#58CC02] uppercase tracking-wider">
                    ● PROMOTION ZONE
                  </div>
                  <p className="text-sm font-black text-[#3C3C3C]">
                    You are in 3rd place!
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* 3. MOBILE BOTTOM NAVIGATION BAR */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t-2 border-[#E5E5E5] flex justify-around p-2 z-40 max-w-full">
        <button
          onClick={() => {
            setActiveTab('learn');
            setLearnViewMode('main_path');
          }}
          className={`p-2 rounded-xl flex flex-col items-center gap-1 ${
            activeTab === 'learn' && learnViewMode === 'main_path' ? 'text-[#58CC02]' : 'text-[#AFAFAF]'
          }`}
        >
          <Compass className="w-5 h-5" />
          <span className="text-[10px] font-black uppercase">Learn</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('learn');
            setLearnViewMode('branches');
          }}
          className={`p-2 rounded-xl flex flex-col items-center gap-1 relative ${
            activeTab === 'branches' || (activeTab === 'learn' && learnViewMode === 'branches')
              ? 'text-[#38BDF8]'
              : 'text-[#AFAFAF]'
          }`}
        >
          <Layers className="w-5 h-5" />
          <span className="text-[10px] font-black uppercase">Trees</span>
          {SKILL_BRANCHES.filter((b) => isBranchUnlocked(b, user.completedLessons).isUnlocked).length > 0 && (
            <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-[#58CC02]" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('practice')}
          className={`p-2 rounded-xl flex flex-col items-center gap-1 ${
            activeTab === 'practice' ? 'text-[#1CB0F6]' : 'text-[#AFAFAF]'
          }`}
        >
          <Zap className="w-5 h-5" />
          <span className="text-[10px] font-black uppercase">Practice</span>
        </button>

        <button
          onClick={() => setActiveTab('connect')}
          className={`p-2 rounded-xl flex flex-col items-center gap-1 ${
            activeTab === 'connect' ? 'text-[#58CC02]' : 'text-[#AFAFAF]'
          }`}
        >
          <Users className="w-5 h-5" />
          <span className="text-[10px] font-black uppercase">Connect</span>
        </button>

        <button
          onClick={() => setActiveTab('leaderboards')}
          className={`p-2 rounded-xl flex flex-col items-center gap-1 ${
            activeTab === 'leaderboards' ? 'text-[#FFC800]' : 'text-[#AFAFAF]'
          }`}
        >
          <Shield className="w-5 h-5" />
          <span className="text-[10px] font-black uppercase">Leagues</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`p-2 rounded-xl flex flex-col items-center gap-1 ${
            activeTab === 'profile' ? 'text-[#FF4B4B]' : 'text-[#AFAFAF]'
          }`}
        >
          <User className="w-5 h-5" />
          <span className="text-[10px] font-black uppercase">Profile</span>
        </button>
      </nav>

      {/* 4. DUOLINGO GUIDEBOOK MODAL */}
      {guidebookUnit !== null && (
        <div className="fixed inset-0 z-50 bg-[#3C3C3C]/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border-2 border-b-6 border-[#E5E5E5] rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b-2 pb-4 border-[#E5E5E5]">
              <div>
                <span className="text-xs font-black uppercase text-[#1CB0F6] tracking-wider">
                  UNIT {guidebookUnit} GUIDEBOOK
                </span>
                <h3 className="text-2xl font-black text-[#3C3C3C]">
                  {UNIT_THEMES[guidebookUnit]?.guideTitle || 'Grammar & Vocabulary'}
                </h3>
              </div>
              <button
                onClick={() => setGuidebookUnit(null)}
                className="text-[#AFAFAF] hover:text-[#3C3C3C] text-xl font-black p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-sm text-[#4B4B4B] leading-relaxed">
              <div className="p-4 bg-[#F7F7F7] border-2 border-[#E5E5E5] rounded-2xl space-y-2">
                <h4 className="font-black text-base text-[#3C3C3C]">
                  Core Concepts in Unit {guidebookUnit}:
                </h4>
                <p className="text-xs text-[#777777]">
                  Sagelo words follow regular root structures with 5 fundamental vowel endings:
                </p>
                <ul className="text-xs font-bold text-[#3C3C3C] space-y-1 list-disc list-inside">
                  <li><strong>-o</strong>: Abstract concept / noun (sago = wisdom, ludo = play)</li>
                  <li><strong>-a</strong>: Concrete tangible entity (kora = heart, buma = tree)</li>
                  <li><strong>-e</strong>: Adjective / description (sage = wise, bono = good)</li>
                  <li><strong>-i</strong>: Verb action (sagi = understand, kani = walk)</li>
                  <li><strong>-u</strong>: Passive state / adverb (sagu = is grown)</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="font-black text-sm text-[#3C3C3C] uppercase tracking-wider">
                  Key Audio Examples:
                </h4>
                <div className="space-y-2">
                  <button
                    onClick={() =>
                      playSageloPhrase('Shanti, ndeko!')
                    }
                    className="w-full p-3 bg-white border-2 border-b-4 border-[#E5E5E5] hover:border-[#1CB0F6] rounded-xl flex items-center justify-between text-left font-black text-sm"
                  >
                    <span>Shanti, ndeko! (Peace, friend!)</span>
                    <Volume2 className="w-4 h-4 text-[#1CB0F6]" />
                  </button>
                  <button
                    onClick={() =>
                      playSageloPhrase('Yo ta sago voli ha.')
                    }
                    className="w-full p-3 bg-white border-2 border-b-4 border-[#E5E5E5] hover:border-[#1CB0F6] rounded-xl flex items-center justify-between text-left font-black text-sm"
                  >
                    <span>Yo ta sago voli ha. (I truly want wisdom.)</span>
                    <Volume2 className="w-4 h-4 text-[#1CB0F6]" />
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={() => setGuidebookUnit(null)}
              className="w-full py-3.5 bg-[#58CC02] hover:bg-[#61E002] border-b-4 border-[#46A302] text-white font-black uppercase text-sm rounded-2xl active:translate-y-1 transition-all"
            >
              Close Guidebook
            </button>
          </div>
        </div>
      )}

      {/* 5. BONUS CHEST MODAL */}
      {chestModal && (
        <div className="fixed inset-0 z-50 bg-[#3C3C3C]/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border-2 border-b-6 border-[#E5E5E5] rounded-3xl max-w-sm w-full p-6 text-center space-y-5 shadow-2xl">
            <div className="w-20 h-20 rounded-3xl bg-[#FF9600] border-b-6 border-[#E58600] text-4xl flex items-center justify-center mx-auto shadow-md">
              🎁
            </div>
            <div>
              <h3 className="text-2xl font-black text-[#3C3C3C]">
                Chest Unlocked!
              </h3>
              <p className="text-xs font-bold text-[#777777] mt-1">
                You found bonus gems and XP on the learning path!
              </p>
            </div>
            <div className="py-2 flex items-center justify-center gap-3">
              <span className="px-4 py-2 bg-[#EFF6FF] border-2 border-[#BFDBFE] rounded-2xl font-mono-num font-black text-base text-[#1CB0F6]">
                +{chestModal.gems} Gems
              </span>
              <span className="px-4 py-2 bg-[#FFF4E5] border-2 border-[#FFD8A8] rounded-2xl font-mono-num font-black text-base text-[#EA580C]">
                +15 XP
              </span>
            </div>
            <button
              onClick={() => setChestModal(null)}
              className="w-full py-3.5 bg-[#58CC02] hover:bg-[#61E002] border-b-4 border-[#46A302] text-white font-black uppercase text-sm rounded-2xl active:translate-y-1 transition-all"
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

      {/* 8. PWA OFFLINE CONNECTIVITY INDICATOR */}
      <OfflineIndicator />
    </div>
  );
}
