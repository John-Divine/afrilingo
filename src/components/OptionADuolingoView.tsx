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
} from 'lucide-react';
import type { UserAccount } from '../types';
import {
  SAGELO_CURRICULUM,
  ALL_LESSONS,
  CurriculumLesson,
} from '../data/sageloCurriculum';
import { playSageloPhrase } from '../utils/sageloAudio';

interface OptionADuolingoViewProps {
  user: UserAccount;
  onStartLesson: (lesson: CurriculumLesson) => void;
  onUpdateUser: (updatedUser: UserAccount) => void;
  onSwitchToOptionB: () => void;
}

export const OptionADuolingoView: React.FC<OptionADuolingoViewProps> = ({
  user,
  onStartLesson,
  onUpdateUser,
  onSwitchToOptionB,
}) => {
  const [activeTab, setActiveTab] = useState<
    'path' | 'match' | 'quests' | 'leagues' | 'bazaar'
  >('path');

  // Match Madness Mini-game state
  const [matchGameActive, setMatchGameActive] = useState(false);
  const [matchTimer, setMatchTimer] = useState(45);
  const [matchScore, setMatchScore] = useState(0);
  const [selectedMatch, setSelectedMatch] = useState<{
    id: string;
    type: 'sagelo' | 'english';
    text: string;
  } | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<string[]>([]);

  // Daily Quests State
  const [claimedQuests, setClaimedQuests] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('afrilingo_claimed_quests');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Cowrie Shells balance (derived or initialized)
  const cowries = (user.xp * 2) % 1000 + 120;

  // Match Madness pool
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

  // Match Madness Timer
  useEffect(() => {
    if (!matchGameActive || matchTimer <= 0) return;
    const interval = setInterval(() => {
      setMatchTimer(prev => {
        if (prev <= 1) {
          setMatchGameActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [matchGameActive, matchTimer]);

  const handleStartMatchGame = () => {
    setMatchGameActive(true);
    setMatchTimer(45);
    setMatchScore(0);
    setMatchedPairs([]);
    setSelectedMatch(null);
  };

  const handleTileClick = (tile: {
    id: string;
    type: 'sagelo' | 'english';
    text: string;
  }) => {
    if (matchedPairs.includes(tile.id)) return;

    if (!selectedMatch) {
      setSelectedMatch(tile);
      if (tile.type === 'sagelo') {
        playSageloPhrase(tile.text, { useVoice: false });
      }
      return;
    }

    if (selectedMatch.type === tile.type) {
      setSelectedMatch(tile);
      return;
    }

    // Check if matching pair
    if (selectedMatch.id === tile.id) {
      setMatchedPairs(prev => [...prev, tile.id]);
      setMatchScore(prev => prev + 10);
      setSelectedMatch(null);
      playSageloPhrase(tile.type === 'sagelo' ? tile.text : selectedMatch.text, {
        useVoice: false,
      });

      if (matchedPairs.length + 1 >= MATCH_PAIRS.length) {
        // Round won!
        setTimeout(() => {
          onUpdateUser({
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

  const handleClaimQuest = (questId: string, xpReward: number) => {
    if (claimedQuests.includes(questId)) return;
    const updated = [...claimedQuests, questId];
    setClaimedQuests(updated);
    try {
      localStorage.setItem('afrilingo_claimed_quests', JSON.stringify(updated));
    } catch {
      // ignore
    }
    onUpdateUser({
      ...user,
      xp: user.xp + xpReward,
      todayXp: user.todayXp + xpReward,
    });
  };

  const handleRefillHearts = () => {
    onUpdateUser({
      ...user,
      hearts: 5,
    });
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

  // Savannah Leagues
  const leagueRanks = [
    { rank: 1, name: 'Amina Diop', country: '🇸🇳 Senegal', xp: 520, isUser: false },
    { rank: 2, name: 'Kwame Mensah', country: '🇬🇭 Ghana', xp: 480, isUser: false },
    {
      rank: 3,
      name: `${user.name} (You)`,
      country: `🇨🇲 ${user.region}`,
      xp: user.xp,
      isUser: true,
    },
    { rank: 4, name: 'Zola Dlamini', country: '🇿🇦 South Africa', xp: 310, isUser: false },
    { rank: 5, name: 'Tariq Al-Mansur', country: '🇪🇬 Egypt', xp: 275, isUser: false },
    { rank: 6, name: 'Chinedu Eze', country: '🇳🇬 Nigeria', xp: 210, isUser: false },
    { rank: 7, name: 'Fatoumata Traore', country: '🇲🇱 Mali', xp: 180, isUser: false },
  ];

  return (
    <div className="min-h-screen bg-[#F7F4EB] text-[#1F1915] pb-24">
      {/* OPTION SWITCHER CALLOUT BANNER */}
      <div className="bg-[#1B6B4A] text-white px-4 py-2.5 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-3">
          <span className="bg-[#D99B26] text-[#1F1915] text-xs font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
            Active: Option A
          </span>
          <p className="text-xs sm:text-sm font-medium">
            <strong>AfriLingo Classic</strong> — High-energy gamified Duolingo experience with African flare, stepping-stone path, match madness, and leagues!
          </p>
        </div>
        <button
          onClick={onSwitchToOptionB}
          className="bg-white/15 hover:bg-white/25 text-white border border-white/30 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#D99B26]" />
          Switch to Option B (Sasagu Sanctuary)
        </button>
      </div>

      {/* TOP DUOLINGO GAMIFICATION STATUS BAR */}
      <header className="sticky top-0 z-30 bg-[#FAF7F0] border-b-2 border-[#E5DEC9] px-4 sm:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#58CC02] border-b-4 border-[#46A302] flex items-center justify-center text-white font-bold text-lg shadow-sm">
            🌍
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-display font-extrabold text-[#1F1915] tracking-tight">
              AfriLingo
            </h1>
            <p className="text-[11px] font-semibold text-[#8C7A6B] -mt-1">
              Sagelo Course • Section 1
            </p>
          </div>
        </div>

        {/* Gamification Pills */}
        <div className="flex items-center gap-3 sm:gap-6">
          {/* Streak Flame */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FFF4E5] border border-[#FFD8A8] rounded-xl font-mono-num font-bold text-sm text-[#D97706] shadow-xs">
            <Flame className="w-4 h-4 text-[#EA580C] fill-[#EA580C] animate-pulse" />
            <span>{user.streakDays}</span>
          </div>

          {/* Cowrie Gems */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#EFF6FF] border border-[#BFDBFE] rounded-xl font-mono-num font-bold text-sm text-[#2563EB] shadow-xs">
            <Gem className="w-4 h-4 text-[#3B82F6] fill-[#93C5FD]" />
            <span>{cowries}</span>
          </div>

          {/* Chi / Hearts */}
          <button
            onClick={handleRefillHearts}
            title="Click to refill Chi hearts"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FEF2F2] border border-[#FECACA] hover:bg-[#FEE2E2] rounded-xl font-mono-num font-bold text-sm text-[#DC2626] transition-colors shadow-xs"
          >
            <Heart className="w-4 h-4 text-[#EF4444] fill-[#EF4444]" />
            <span>{user.hearts}</span>
          </button>
        </div>
      </header>

      {/* MAIN LAYOUT: LEFT SIDEBAR + CENTER CONTENT + RIGHT WIDGETS */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT NAVIGATION TABS (DUOLINGO STYLE) */}
        <aside className="lg:col-span-3 space-y-2">
          <div className="bg-white border-2 border-[#E5DEC9] rounded-2xl p-3 shadow-xs space-y-1">
            <button
              onClick={() => setActiveTab('path')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${
                activeTab === 'path'
                  ? 'bg-[#58CC02]/15 text-[#1F1915] border-2 border-[#58CC02]'
                  : 'text-[#6B5E52] hover:bg-[#F7F4EB]'
              }`}
            >
              <Compass className="w-5 h-5 text-[#58CC02]" />
              <span>LEARN PATH</span>
            </button>

            <button
              onClick={() => setActiveTab('match')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${
                activeTab === 'match'
                  ? 'bg-[#C84B24]/15 text-[#1F1915] border-2 border-[#C84B24]'
                  : 'text-[#6B5E52] hover:bg-[#F7F4EB]'
              }`}
            >
              <Zap className="w-5 h-5 text-[#C84B24]" />
              <span>MATCH MADNESS</span>
            </button>

            <button
              onClick={() => setActiveTab('leagues')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${
                activeTab === 'leagues'
                  ? 'bg-[#D99B26]/15 text-[#1F1915] border-2 border-[#D99B26]'
                  : 'text-[#6B5E52] hover:bg-[#F7F4EB]'
              }`}
            >
              <Shield className="w-5 h-5 text-[#D99B26]" />
              <span>SAVANNAH LEAGUES</span>
            </button>

            <button
              onClick={() => setActiveTab('quests')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${
                activeTab === 'quests'
                  ? 'bg-[#2563EB]/15 text-[#1F1915] border-2 border-[#2563EB]'
                  : 'text-[#6B5E52] hover:bg-[#F7F4EB]'
              }`}
            >
              <Trophy className="w-5 h-5 text-[#2563EB]" />
              <span>DAILY QUESTS</span>
            </button>

            <button
              onClick={() => setActiveTab('bazaar')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${
                activeTab === 'bazaar'
                  ? 'bg-[#7C3AED]/15 text-[#1F1915] border-2 border-[#7C3AED]'
                  : 'text-[#6B5E52] hover:bg-[#F7F4EB]'
              }`}
            >
              <ShoppingBag className="w-5 h-5 text-[#7C3AED]" />
              <span>COWRIE BAZAAR</span>
            </button>
          </div>

          {/* Quick Mascot Advice Card */}
          <div className="bg-gradient-to-br from-[#FFFBEB] to-[#FEF3C7] border-2 border-[#FDE68A] rounded-2xl p-4 shadow-xs">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">🦜</span>
              <div>
                <h4 className="font-bold text-sm text-[#92400E]">Kofi the Sunbird</h4>
                <p className="text-[11px] text-[#B45309]">Savannah Language Guide</p>
              </div>
            </div>
            <p className="text-xs text-[#78350F] leading-relaxed">
              "In Sagelo, adding <strong>-i</strong> makes any action a verb (e.g. <em>sagi</em> = understand, <em>lerni</em> = study). Consistency is your greatest power!"
            </p>
          </div>
        </aside>

        {/* CENTER COLUMN: ACTIVE TAB CONTENT */}
        <main className="lg:col-span-6 space-y-6">
          {/* TAB 1: THE DUOLINGO STEPPING STONE PATH */}
          {activeTab === 'path' && (
            <div className="space-y-8">
              {/* UNIT HEADER BANNER */}
              <div className="bg-[#58CC02] text-white rounded-2xl p-5 shadow-sm border-b-4 border-[#46A302]">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-[#D7FFB8]">
                      Unit 1 • Getting Started
                    </span>
                    <h2 className="text-xl font-display font-black tracking-tight mt-0.5">
                      First Words & Greetings
                    </h2>
                    <p className="text-xs text-white/90 mt-1">
                      Learn core roots, greetings, and form your very first Sagelo sentences.
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-2xl">
                    🌟
                  </div>
                </div>
              </div>

              {/* STEPPING STONE WINDING PATH */}
              <div className="relative py-4 flex flex-col items-center space-y-7">
                {ALL_LESSONS.slice(0, 10).map((lesson, index) => {
                  const isCompleted = user.completedLessons.includes(lesson.id);
                  const isCurrent =
                    !isCompleted &&
                    (index === 0 ||
                      user.completedLessons.includes(ALL_LESSONS[index - 1].id));
                  const isLocked = !isCompleted && !isCurrent;

                  // Winding horizontal offset for true Duolingo snake pattern
                  const offsets = [
                    'translate-x-0',
                    'translate-x-8',
                    'translate-x-14',
                    'translate-x-8',
                    'translate-x-0',
                    '-translate-x-8',
                    '-translate-x-14',
                    '-translate-x-8',
                    'translate-x-0',
                    'translate-x-8',
                  ];
                  const offsetClass = offsets[index % offsets.length];

                  return (
                    <div
                      key={lesson.id}
                      className={`relative flex flex-col items-center transition-all ${offsetClass}`}
                    >
                      {/* Active lesson tooltip beacon */}
                      {isCurrent && (
                        <div className="mb-2 bg-[#58CC02] text-white text-xs font-black uppercase px-3 py-1 rounded-xl shadow-md border-b-2 border-[#46A302] animate-bounce">
                          START HERE!
                        </div>
                      )}

                      {/* 3D Round Duolingo Button */}
                      <button
                        onClick={() => !isLocked && onStartLesson(lesson)}
                        disabled={isLocked}
                        className={`relative w-18 h-18 rounded-full flex flex-col items-center justify-center transition-all duration-150 active:translate-y-1 ${
                          isCompleted
                            ? 'bg-[#FFC800] border-b-6 border-[#D99B26] hover:brightness-105 shadow-md text-white'
                            : isCurrent
                            ? 'bg-[#58CC02] border-b-6 border-[#46A302] hover:brightness-105 shadow-lg text-white ring-4 ring-[#58CC02]/30'
                            : 'bg-[#E5DEC9] border-b-6 border-[#C7BCA3] text-[#8C7A6B] cursor-not-allowed'
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="w-8 h-8 stroke-[3]" />
                        ) : isCurrent ? (
                          <Star className="w-8 h-8 fill-white stroke-[2.5]" />
                        ) : (
                          <Lock className="w-7 h-7 stroke-[2]" />
                        )}
                      </button>

                      {/* Lesson title badge */}
                      <div className="mt-2 text-center max-w-[130px]">
                        <p className="text-xs font-bold text-[#1F1915] leading-tight line-clamp-1">
                          {lesson.title}
                        </p>
                        <span className="text-[10px] font-mono-num text-[#8C7A6B]">
                          {lesson.numberLabel} • {lesson.xpReward} XP
                        </span>
                      </div>
                    </div>
                  );
                })}

                {/* Checkpoint Castle Trophy */}
                <div className="pt-4 flex flex-col items-center">
                  <div className="w-20 h-20 rounded-3xl bg-[#C84B24] border-b-6 border-[#9E3516] flex items-center justify-center text-3xl shadow-lg">
                    🏰
                  </div>
                  <p className="text-xs font-black text-[#C84B24] uppercase tracking-wider mt-2">
                    Unit 1 Checkpoint
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MATCH MADNESS MINI-GAME */}
          {activeTab === 'match' && (
            <div className="bg-white border-2 border-[#E5DEC9] rounded-2xl p-6 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b pb-4 border-[#E5DEC9]">
                <div>
                  <h3 className="text-lg font-bold text-[#1F1915] flex items-center gap-2">
                    <Zap className="w-5 h-5 text-[#C84B24]" />
                    Match Madness • Sagelo Roots
                  </h3>
                  <p className="text-xs text-[#8C7A6B] mt-0.5">
                    Match the Sagelo word to its English meaning as fast as you can!
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="px-3 py-1 bg-[#FEF3C7] border border-[#FDE68A] rounded-xl font-mono-num font-bold text-sm text-[#B45309]">
                    ⏱️ {matchTimer}s
                  </div>
                  <div className="px-3 py-1 bg-[#DCFCE7] border border-[#86EFAC] rounded-xl font-mono-num font-bold text-sm text-[#166534]">
                    ⭐ {matchScore} pts
                  </div>
                </div>
              </div>

              {!matchGameActive ? (
                <div className="py-8 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-[#FEF2F2] text-[#C84B24] flex items-center justify-center mx-auto text-3xl">
                    ⚡
                  </div>
                  <h4 className="text-base font-bold text-[#1F1915]">
                    Ready for a Speed Round?
                  </h4>
                  <p className="text-xs text-[#6B5E52] max-w-sm mx-auto">
                    Test your instant recall of core vocabulary under the clock. Earn bonus XP for clean streaks!
                  </p>
                  <button
                    onClick={handleStartMatchGame}
                    className="bg-[#C84B24] hover:bg-[#A83817] text-white font-bold text-sm px-6 py-3 rounded-xl border-b-4 border-[#8A2B0F] shadow-md transition-all active:translate-y-1"
                  >
                    Start Match Round (45s)
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    {/* Left column: Sagelo Words */}
                    <div className="space-y-2.5">
                      <p className="text-[11px] font-bold uppercase text-[#8C7A6B] tracking-wider text-center">
                        Sagelo Root
                      </p>
                      {MATCH_PAIRS.map(pair => {
                        const isMatched = matchedPairs.includes(pair.id);
                        const isSelected =
                          selectedMatch?.type === 'sagelo' &&
                          selectedMatch.id === pair.id;
                        return (
                          <button
                            key={`sag-${pair.id}`}
                            onClick={() =>
                              handleTileClick({
                                id: pair.id,
                                type: 'sagelo',
                                text: pair.sagelo,
                              })
                            }
                            disabled={isMatched}
                            className={`w-full p-3.5 rounded-xl border-2 font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                              isMatched
                                ? 'bg-[#DCFCE7] border-[#86EFAC] text-[#166534] opacity-50 cursor-default line-through'
                                : isSelected
                                ? 'bg-[#C84B24] border-[#8A2B0F] text-white shadow-md'
                                : 'bg-[#FAF7F0] border-[#E5DEC9] text-[#1F1915] hover:bg-white active:translate-y-0.5'
                            }`}
                          >
                            <span>{pair.sagelo}</span>
                            <Volume2 className="w-3.5 h-3.5 text-current opacity-70" />
                          </button>
                        );
                      })}
                    </div>

                    {/* Right column: English Meanings */}
                    <div className="space-y-2.5">
                      <p className="text-[11px] font-bold uppercase text-[#8C7A6B] tracking-wider text-center">
                        Meaning
                      </p>
                      {MATCH_PAIRS.map(pair => {
                        const isMatched = matchedPairs.includes(pair.id);
                        const isSelected =
                          selectedMatch?.type === 'english' &&
                          selectedMatch.id === pair.id;
                        return (
                          <button
                            key={`eng-${pair.id}`}
                            onClick={() =>
                              handleTileClick({
                                id: pair.id,
                                type: 'english',
                                text: pair.english,
                              })
                            }
                            disabled={isMatched}
                            className={`w-full p-3.5 rounded-xl border-2 font-bold text-sm transition-all flex items-center justify-center ${
                              isMatched
                                ? 'bg-[#DCFCE7] border-[#86EFAC] text-[#166534] opacity-50 cursor-default line-through'
                                : isSelected
                                ? 'bg-[#C84B24] border-[#8A2B0F] text-white shadow-md'
                                : 'bg-[#FAF7F0] border-[#E5DEC9] text-[#1F1915] hover:bg-white active:translate-y-0.5'
                            }`}
                          >
                            <span>{pair.english}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SAVANNAH LEAGUES */}
          {activeTab === 'leagues' && (
            <div className="bg-white border-2 border-[#E5DEC9] rounded-2xl p-6 shadow-sm space-y-6">
              <div className="flex items-center gap-4 border-b pb-4 border-[#E5DEC9]">
                <div className="w-12 h-12 rounded-2xl bg-[#D99B26] border-b-4 border-[#B07B18] flex items-center justify-center text-white text-2xl shadow-sm">
                  🛡️
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#1F1915]">
                    Gold Baobab League
                  </h3>
                  <p className="text-xs text-[#8C7A6B]">
                    Top 3 advance to the Diamond Council at the end of the week!
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                {leagueRanks.map(item => (
                  <div
                    key={item.rank}
                    className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                      item.isUser
                        ? 'bg-[#58CC02]/10 border-[#58CC02] ring-2 ring-[#58CC02]/30'
                        : 'bg-[#FAF7F0] border-[#E5DEC9]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono-num font-bold ${
                          item.rank === 1
                            ? 'bg-[#FEF08A] text-[#854D0E]'
                            : item.rank === 2
                            ? 'bg-[#E2E8F0] text-[#334155]'
                            : item.rank === 3
                            ? 'bg-[#FFEDD5] text-[#9A3412]'
                            : 'text-[#8C7A6B]'
                        }`}
                      >
                        {item.rank}
                      </span>
                      <div>
                        <p className="text-sm font-bold text-[#1F1915]">
                          {item.name}
                        </p>
                        <p className="text-[11px] text-[#8C7A6B]">{item.country}</p>
                      </div>
                    </div>
                    <div className="font-mono-num font-bold text-sm text-[#1B6B4A]">
                      {item.xp} XP
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: DAILY QUESTS */}
          {activeTab === 'quests' && (
            <div className="bg-white border-2 border-[#E5DEC9] rounded-2xl p-6 shadow-sm space-y-6">
              <div className="flex items-center gap-3 border-b pb-4 border-[#E5DEC9]">
                <Trophy className="w-6 h-6 text-[#2563EB]" />
                <div>
                  <h3 className="text-lg font-bold text-[#1F1915]">
                    Daily Quests
                  </h3>
                  <p className="text-xs text-[#8C7A6B]">
                    Complete daily tasks to unlock bonus XP and Cowrie treasures.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {quests.map(quest => {
                  const isClaimed = claimedQuests.includes(quest.id);
                  return (
                    <div
                      key={quest.id}
                      className="p-4 rounded-xl border-2 border-[#E5DEC9] bg-[#FAF7F0] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold text-[#1F1915]">
                          {quest.title}
                        </h4>
                        <p className="text-xs text-[#6B5E52]">
                          {quest.description}
                        </p>
                        <div className="flex items-center gap-2 mt-2 w-48">
                          <div className="h-2 w-full bg-[#E5DEC9] rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#2563EB] transition-all"
                              style={{
                                width: `${Math.min(
                                  100,
                                  (quest.progress / quest.goal) * 100
                                )}%`,
                              }}
                            />
                          </div>
                          <span className="text-[10px] font-mono-num font-bold text-[#8C7A6B]">
                            {quest.progress}/{quest.goal}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleClaimQuest(quest.id, quest.reward)}
                        disabled={!quest.completed || isClaimed}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                          isClaimed
                            ? 'bg-[#E5DEC9] text-[#8C7A6B] cursor-default'
                            : quest.completed
                            ? 'bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-md active:translate-y-0.5'
                            : 'bg-[#E5DEC9] text-[#8C7A6B] cursor-not-allowed'
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

          {/* TAB 5: COWRIE BAZAAR (SHOP) */}
          {activeTab === 'bazaar' && (
            <div className="bg-white border-2 border-[#E5DEC9] rounded-2xl p-6 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b pb-4 border-[#E5DEC9]">
                <div>
                  <h3 className="text-lg font-bold text-[#1F1915] flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-[#7C3AED]" />
                    The Cowrie Bazaar
                  </h3>
                  <p className="text-xs text-[#8C7A6B]">
                    Spend your earned cowrie shells on power-ups and streak boosts.
                  </p>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#EFF6FF] border border-[#BFDBFE] rounded-xl font-mono-num font-bold text-sm text-[#2563EB]">
                  <Gem className="w-4 h-4 text-[#3B82F6]" />
                  <span>{cowries} Cowries</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border-2 border-[#E5DEC9] bg-[#FAF7F0] space-y-3">
                  <div className="text-2xl">❤️</div>
                  <h4 className="font-bold text-sm text-[#1F1915]">
                    Full Heart Refill
                  </h4>
                  <p className="text-xs text-[#6B5E52]">
                    Restore your Chi life energy back to 5/5 so you never miss a lesson.
                  </p>
                  <button
                    onClick={handleRefillHearts}
                    className="w-full py-2 bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs font-bold rounded-lg transition-colors"
                  >
                    Refill Now (Free)
                  </button>
                </div>

                <div className="p-4 rounded-xl border-2 border-[#E5DEC9] bg-[#FAF7F0] space-y-3">
                  <div className="text-2xl">🧊</div>
                  <h4 className="font-bold text-sm text-[#1F1915]">
                    Streak Freeze Amulet
                  </h4>
                  <p className="text-xs text-[#6B5E52]">
                    Protects your daily learning streak if you take a day off.
                  </p>
                  <button
                    disabled
                    className="w-full py-2 bg-[#E5DEC9] text-[#8C7A6B] text-xs font-bold rounded-lg cursor-not-allowed"
                  >
                    Equipped ✓
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* RIGHT COLUMN: 7-DAY SPEAKING STRIP & PROGRESS WIDGETS */}
        <aside className="lg:col-span-3 space-y-5">
          {/* 7-Day Speaking Goal Card */}
          <div className="bg-white border-2 border-[#E5DEC9] rounded-2xl p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#C84B24]">
                7-Day Fluency Goal
              </span>
              <span className="text-xs font-mono-num font-bold text-[#1B6B4A]">
                Day 1 of 7
              </span>
            </div>
            <h4 className="font-bold text-sm text-[#1F1915]">
              Speak Everyday Phrases in 1 Week
            </h4>
            <div className="bg-[#FAF7F0] border border-[#E5DEC9] rounded-xl p-3 space-y-1.5">
              <p className="text-xs font-bold text-[#1B6B4A]">
                "Shanti, ndeko! Yo Dienga oni."
              </p>
              <p className="text-[11px] text-[#6B5E52]">
                Peace, friend! I am Dienga.
              </p>
              <button
                onClick={() =>
                  playSageloPhrase('Shanti, ndeko! Yo Dienga oni.', {
                    useVoice: false,
                  })
                }
                className="flex items-center gap-1.5 text-xs text-[#C84B24] font-bold hover:underline pt-1"
              >
                <Volume2 className="w-3.5 h-3.5" />
                Listen with African Tone
              </button>
            </div>
          </div>

          {/* Quick Stats Summary */}
          <div className="bg-white border-2 border-[#E5DEC9] rounded-2xl p-4 shadow-xs space-y-3">
            <h4 className="font-bold text-sm text-[#1F1915]">Your Stats</h4>
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="p-2.5 bg-[#FAF7F0] rounded-xl border border-[#E5DEC9]">
                <p className="text-lg font-mono-num font-extrabold text-[#D97706]">
                  {user.streakDays}
                </p>
                <p className="text-[10px] font-bold uppercase text-[#8C7A6B]">
                  Day Streak
                </p>
              </div>
              <div className="p-2.5 bg-[#FAF7F0] rounded-xl border border-[#E5DEC9]">
                <p className="text-lg font-mono-num font-extrabold text-[#1B6B4A]">
                  {user.xp}
                </p>
                <p className="text-[10px] font-bold uppercase text-[#8C7A6B]">
                  Total XP
                </p>
              </div>
              <div className="p-2.5 bg-[#FAF7F0] rounded-xl border border-[#E5DEC9]">
                <p className="text-lg font-mono-num font-extrabold text-[#2563EB]">
                  {user.completedLessons.length}
                </p>
                <p className="text-[10px] font-bold uppercase text-[#8C7A6B]">
                  Lessons Done
                </p>
              </div>
              <div className="p-2.5 bg-[#FAF7F0] rounded-xl border border-[#E5DEC9]">
                <p className="text-lg font-mono-num font-extrabold text-[#7C3AED]">
                  {user.masteredWords.length}
                </p>
                <p className="text-[10px] font-bold uppercase text-[#8C7A6B]">
                  Roots Mastered
                </p>
              </div>
            </div>
          </div>

          {/* Comparison Modal / Option Switch Card */}
          <div className="bg-[#FAF7F0] border-2 border-[#E5DEC9] rounded-2xl p-4 space-y-2.5">
            <div className="flex items-center gap-2">
              <span className="text-base">⚖️</span>
              <h4 className="font-bold text-xs text-[#1F1915] uppercase tracking-wider">
                Compare Experiences
              </h4>
            </div>
            <p className="text-xs text-[#6B5E52] leading-relaxed">
              <strong>Option A:</strong> Gamified Duolingo (Path, Match Madness, Leagues).<br />
              <strong>Option B:</strong> Sasagu Sanctuary (Acoustic Tone Lab, Script Studio, Stories).
            </p>
            <button
              onClick={onSwitchToOptionB}
              className="w-full py-2 bg-[#1B6B4A] hover:bg-[#145237] text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
            >
              Switch to Option B
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
};
