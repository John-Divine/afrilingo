import React, { useState, useEffect, useRef } from 'react';
import {
  Zap,
  Flame,
  Volume2,
  RotateCcw,
  Award,
  Sparkles,
  Trophy,
  CheckCircle2,
  Clock,
  Shuffle,
} from 'lucide-react';
import {
  MATCH_MADNESS_DICTIONARY,
  MatchWordPair,
} from '../data/matchMadnessPool';
import { playSageloPhrase, playChime } from '../utils/sageloAudio';
import { getWordPhonetic } from '../utils/sageloPhonetics';

interface MatchMadnessGameProps {
  onEarnXp: (xp: number) => void;
  accentColor?: string;
}

interface ActiveTile {
  uid: string; // unique instance ID for animations
  pairId: string;
  type: 'sagelo' | 'english';
  text: string;
  category: string;
}

export const MatchMadnessGame: React.FC<MatchMadnessGameProps> = ({
  onEarnXp,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(45);
  const [score, setScore] = useState<number>(0);
  const [matchesCount, setMatchesCount] = useState<number>(0);
  const [comboStreak, setComboStreak] = useState<number>(0);
  const [maxStreak, setMaxStreak] = useState<number>(0);
  const [roundCompleted, setRoundCompleted] = useState<boolean>(false);

  // Pool management
  const remainingPoolRef = useRef<MatchWordPair[]>([]);
  const [leftTiles, setLeftTiles] = useState<ActiveTile[]>([]);
  const [rightTiles, setRightTiles] = useState<ActiveTile[]>([]);

  // Selection state
  const [selectedLeft, setSelectedLeft] = useState<ActiveTile | null>(null);
  const [selectedRight, setSelectedRight] = useState<ActiveTile | null>(null);
  const [mismatchedPair, setMismatchedPair] = useState<{
    leftUid?: string;
    rightUid?: string;
  } | null>(null);
  const [matchedPairUids, setMatchedPairUids] = useState<string[]>([]);

  // Timer interval ref
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Start new randomized round
  const startNewGame = () => {
    // 1. Shuffle entire 128-word pool
    const shuffledPool = [...MATCH_MADNESS_DICTIONARY].sort(
      () => Math.random() - 0.5
    );

    // Take initial 5 pairs for board
    const initialPairs = shuffledPool.slice(0, 5);
    remainingPoolRef.current = shuffledPool.slice(5);

    // Create left (Sagelo) and right (English) tiles, shuffled independently
    const left: ActiveTile[] = initialPairs.map(p => ({
      uid: `left-${p.id}-${Date.now()}-${Math.random()}`,
      pairId: p.id,
      type: 'sagelo' as const,
      text: p.sagelo,
      category: p.category,
    })).sort(() => Math.random() - 0.5);

    const right: ActiveTile[] = initialPairs.map(p => ({
      uid: `right-${p.id}-${Date.now()}-${Math.random()}`,
      pairId: p.id,
      type: 'english' as const,
      text: p.english,
      category: p.category,
    })).sort(() => Math.random() - 0.5);

    setLeftTiles(left);
    setRightTiles(right);
    setSelectedLeft(null);
    setSelectedRight(null);
    setMismatchedPair(null);
    setMatchedPairUids([]);
    setScore(0);
    setMatchesCount(0);
    setComboStreak(0);
    setMaxStreak(0);
    setTimeLeft(45);
    setRoundCompleted(false);
    setIsPlaying(true);
  };

  // Timer effect
  useEffect(() => {
    if (!isPlaying) return;

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          setIsPlaying(false);
          setRoundCompleted(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying]);

  // When round completes, award XP
  useEffect(() => {
    if (roundCompleted && matchesCount > 0) {
      const earnedXp = Math.max(15, Math.round(matchesCount * 4 + maxStreak * 2));
      onEarnXp(earnedXp);
      playChime('complete');
    }
  }, [roundCompleted]);

  // Check match logic whenever both left and right are selected
  const checkMatch = (left: ActiveTile, right: ActiveTile) => {
    if (left.pairId === right.pairId) {
      // MATCH SUCCESS!
      playChime('correct');
      playSageloPhrase(left.text);

      const nextStreak = comboStreak + 1;
      setComboStreak(nextStreak);
      if (nextStreak > maxStreak) setMaxStreak(nextStreak);

      const streakBonus = nextStreak >= 5 ? 20 : nextStreak >= 3 ? 15 : 10;
      setScore(prev => prev + streakBonus);
      setMatchesCount(prev => prev + 1);

      // Flash matched tiles
      setMatchedPairUids([left.uid, right.uid]);

      // Renew tiles: pull a new pair from remaining pool
      setTimeout(() => {
        let nextPair: MatchWordPair | null = null;
        if (remainingPoolRef.current.length > 0) {
          nextPair = remainingPoolRef.current.shift()!;
        } else {
          // Re-populate from dictionary if depleted
          const reShuffled = [...MATCH_MADNESS_DICTIONARY].sort(
            () => Math.random() - 0.5
          );
          nextPair = reShuffled[0];
          remainingPoolRef.current = reShuffled.slice(1);
        }

        if (nextPair) {
          const newLeft: ActiveTile = {
            uid: `left-${nextPair.id}-${Date.now()}-${Math.random()}`,
            pairId: nextPair.id,
            type: 'sagelo' as const,
            text: nextPair.sagelo,
            category: nextPair.category,
          };

          const newRight: ActiveTile = {
            uid: `right-${nextPair.id}-${Date.now()}-${Math.random()}`,
            pairId: nextPair.id,
            type: 'english' as const,
            text: nextPair.english,
            category: nextPair.category,
          };

          setLeftTiles(prev =>
            prev.map(t => (t.uid === left.uid ? newLeft : t))
          );
          setRightTiles(prev =>
            prev.map(t => (t.uid === right.uid ? newRight : t))
          );
        }

        setSelectedLeft(null);
        setSelectedRight(null);
        setMatchedPairUids([]);
      }, 260);
    } else {
      // MISMATCH!
      playChime('wrong');
      setComboStreak(0);
      setMismatchedPair({ leftUid: left.uid, rightUid: right.uid });

      setTimeout(() => {
        setSelectedLeft(null);
        setSelectedRight(null);
        setMismatchedPair(null);
      }, 400);
    }
  };

  const handleTileClick = (tile: ActiveTile) => {
    if (!isPlaying) return;
    if (matchedPairUids.includes(tile.uid)) return;

    if (tile.type === 'sagelo') {
      // If tapping left
      if (selectedLeft?.uid === tile.uid) {
        setSelectedLeft(null);
        return;
      }
      setSelectedLeft(tile);
      playSageloPhrase(tile.text);

      if (selectedRight) {
        checkMatch(tile, selectedRight);
      }
    } else {
      // If tapping right
      if (selectedRight?.uid === tile.uid) {
        setSelectedRight(null);
        return;
      }
      setSelectedRight(tile);

      if (selectedLeft) {
        checkMatch(selectedLeft, tile);
      }
    }
  };

  return (
    <div className="bg-white rounded-3xl border-2 border-[#E5E5E5] p-5 sm:p-6 shadow-sm space-y-6">
      {/* Header Info Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b-2 border-[#F0F0F0]">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg bg-[#58CC02]/15 text-[#58CC02] text-xs font-black uppercase tracking-wider flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 fill-[#58CC02]" />
              Rapid Recall
            </span>
            <span className="text-xs font-bold text-[#AFAFAF]">
              {MATCH_MADNESS_DICTIONARY.length} Authentic Words in Pool
            </span>
          </div>
          <h2 className="text-2xl font-black text-[#3C3C3C] mt-1 flex items-center gap-2">
            Match Madness • Sagelo Speed Run
          </h2>
          <p className="text-sm font-semibold text-[#777777]">
            Match Sagelo words to their English translations before time runs out.
            Tiles refresh continuously!
          </p>
        </div>

        {/* Live HUD: Timer & Score */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="px-4 py-2 rounded-2xl bg-[#FFF4D0] border-2 border-[#FFD900] text-[#B88700] font-black text-sm flex items-center gap-1.5 shadow-xs">
            <Clock className="w-4 h-4" />
            <span className="text-lg">{timeLeft}s</span>
          </div>

          <div className="px-4 py-2 rounded-2xl bg-[#E8F8FE] border-2 border-[#1CB0F6] text-[#1CB0F6] font-black text-sm flex items-center gap-1.5 shadow-xs">
            <Trophy className="w-4 h-4" />
            <span className="text-lg">{score} pts</span>
          </div>

          {comboStreak >= 2 && (
            <div className="px-3 py-2 rounded-2xl bg-[#FF4B4B]/10 border-2 border-[#FF4B4B] text-[#FF4B4B] font-black text-xs flex items-center gap-1 animate-bounce">
              <Flame className="w-4 h-4 fill-[#FF4B4B]" />
              <span>{comboStreak}x Streak!</span>
            </div>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      {isPlaying && (
        <div className="w-full bg-[#E5E5E5] h-2.5 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-1000 ${
              timeLeft > 15
                ? 'bg-[#58CC02]'
                : timeLeft > 7
                ? 'bg-[#FF9600]'
                : 'bg-[#FF4B4B]'
            }`}
            style={{ width: `${(timeLeft / 45) * 100}%` }}
          />
        </div>
      )}

      {/* Pre-Game Start Screen */}
      {!isPlaying && !roundCompleted && (
        <div className="text-center py-10 px-4 space-y-4 bg-[#F7F7F7] rounded-3xl border-2 border-dashed border-[#D0D0D0]">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-[#58CC02] text-white flex items-center justify-center text-3xl font-black shadow-md border-b-4 border-[#46A302]">
            ⚡
          </div>
          <div className="max-w-md mx-auto">
            <h3 className="text-xl font-black text-[#3C3C3C]">
              Ready for the 45-Second Challenge?
            </h3>
            <p className="text-sm font-semibold text-[#777777] mt-1">
              Words are drawn at random from 120+ Sagelo roots, verbs, qualities,
              and phrases. Matches clear instantly and renew with fresh tiles!
            </p>
          </div>
          <button
            onClick={startNewGame}
            className="px-8 py-3.5 rounded-2xl bg-[#58CC02] hover:bg-[#61E002] border-b-4 border-[#46A302] text-white font-black text-base uppercase tracking-wider shadow-md active:translate-y-1 transition-all"
          >
            Start Match Round
          </button>
        </div>
      )}

      {/* Game Playing Board (5 Left vs 5 Right) */}
      {isPlaying && (
        <div className="grid grid-cols-2 gap-4 sm:gap-6">
          {/* Left Column: Sagelo Words */}
          <div className="space-y-3">
            <div className="text-xs font-black uppercase tracking-wider text-[#AFAFAF] px-1 flex items-center justify-between">
              <span>Sagelo Words</span>
              <span className="text-[10px] text-[#1CB0F6]">Tap to hear</span>
            </div>
            {leftTiles.map(tile => {
              const isSelected = selectedLeft?.uid === tile.uid;
              const isMatched = matchedPairUids.includes(tile.uid);
              const isMismatched = mismatchedPair?.leftUid === tile.uid;

              return (
                <button
                  key={tile.uid}
                  onClick={() => handleTileClick(tile)}
                  className={`w-full min-h-[58px] p-3 rounded-2xl border-2 border-b-4 text-left font-black transition-all flex items-center justify-between gap-2 shadow-xs ${
                    isMatched
                      ? 'bg-[#58CC02] border-[#46A302] text-white scale-95 opacity-80'
                      : isMismatched
                      ? 'bg-[#FF4B4B] border-[#D32F2F] text-white animate-shake'
                      : isSelected
                      ? 'bg-[#DDF4FF] border-[#1CB0F6] text-[#1CB0F6] scale-102 translate-x-1'
                      : 'bg-white border-[#E5E5E5] hover:bg-[#F7F7F7] text-[#3C3C3C] active:translate-y-1'
                  }`}
                >
                  <div className="truncate flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-base sm:text-lg block capitalize">
                        {tile.text}
                      </span>
                      <span className={`font-mono text-[10px] font-black px-1.5 py-0.5 rounded-md border tracking-tight ${
                        isSelected || isMatched || isMismatched
                          ? 'bg-white/20 border-white/40 text-white'
                          : 'bg-[#E0F2FE] border-[#BAE6FD] text-[#0284C7]'
                      }`}>
                        {getWordPhonetic(tile.text).display}
                      </span>
                    </div>
                    <span className={`text-[10px] uppercase font-bold ${
                      isSelected || isMatched || isMismatched ? 'text-white/80' : 'text-[#AFAFAF]'
                    }`}>
                      {tile.category}
                    </span>
                  </div>
                  <Volume2 className={`w-4 h-4 shrink-0 ${
                    isSelected || isMatched || isMismatched ? 'text-white' : 'text-[#1CB0F6]'
                  }`} />
                </button>
              );
            })}
          </div>

          {/* Right Column: English Translations (Shuffled independently) */}
          <div className="space-y-3">
            <div className="text-xs font-black uppercase tracking-wider text-[#AFAFAF] px-1">
              <span>English Meanings</span>
            </div>
            {rightTiles.map(tile => {
              const isSelected = selectedRight?.uid === tile.uid;
              const isMatched = matchedPairUids.includes(tile.uid);
              const isMismatched = mismatchedPair?.rightUid === tile.uid;

              return (
                <button
                  key={tile.uid}
                  onClick={() => handleTileClick(tile)}
                  className={`w-full min-h-[58px] p-3 rounded-2xl border-2 border-b-4 text-left font-black transition-all flex items-center justify-between gap-2 shadow-xs ${
                    isMatched
                      ? 'bg-[#58CC02] border-[#46A302] text-white scale-95 opacity-80'
                      : isMismatched
                      ? 'bg-[#FF4B4B] border-[#D32F2F] text-white animate-shake'
                      : isSelected
                      ? 'bg-[#DDF4FF] border-[#1CB0F6] text-[#1CB0F6] scale-102 -translate-x-1'
                      : 'bg-white border-[#E5E5E5] hover:bg-[#F7F7F7] text-[#3C3C3C] active:translate-y-1'
                  }`}
                >
                  <div className="truncate">
                    <span className="text-sm sm:text-base block leading-snug">
                      {tile.text}
                    </span>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center text-[10px] shrink-0 ${
                      isSelected
                        ? 'border-[#1CB0F6] bg-[#1CB0F6] text-white'
                        : 'border-[#E5E5E5] text-[#AFAFAF]'
                    }`}
                  >
                    {isSelected ? '✓' : ''}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Round Completed Screen */}
      {roundCompleted && (
        <div className="text-center py-8 px-4 space-y-6 bg-[#F7F7F7] rounded-3xl border-2 border-[#E5E5E5]">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-[#FFD900] text-white flex items-center justify-center text-4xl shadow-lg border-b-4 border-[#CCA800] animate-bounce">
            🏆
          </div>

          <div className="max-w-md mx-auto space-y-2">
            <span className="px-3 py-1 rounded-full bg-[#58CC02]/20 text-[#58CC02] text-xs font-black uppercase tracking-wider">
              Round Complete!
            </span>
            <h3 className="text-3xl font-black text-[#3C3C3C]">
              Madness Conquered!
            </h3>
            <p className="text-sm font-semibold text-[#777777]">
              You matched {matchesCount} words against the clock with rapid recall!
            </p>
          </div>

          {/* Stats Badges */}
          <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto">
            <div className="p-3 bg-white rounded-2xl border-2 border-[#E5E5E5] shadow-xs">
              <span className="text-xs font-black uppercase text-[#AFAFAF] block">
                Matches
              </span>
              <span className="text-2xl font-black text-[#58CC02]">
                {matchesCount}
              </span>
            </div>
            <div className="p-3 bg-white rounded-2xl border-2 border-[#E5E5E5] shadow-xs">
              <span className="text-xs font-black uppercase text-[#AFAFAF] block">
                Top Streak
              </span>
              <span className="text-2xl font-black text-[#FF9600]">
                {maxStreak}x
              </span>
            </div>
            <div className="p-3 bg-white rounded-2xl border-2 border-[#E5E5E5] shadow-xs">
              <span className="text-xs font-black uppercase text-[#AFAFAF] block">
                Points
              </span>
              <span className="text-2xl font-black text-[#1CB0F6]">
                +{score}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={startNewGame}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-[#58CC02] hover:bg-[#61E002] border-b-4 border-[#46A302] text-white font-black text-sm uppercase tracking-wider shadow-md active:translate-y-1 transition-all flex items-center justify-center gap-2"
            >
              <Shuffle className="w-4 h-4" />
              Play Again (Fresh Random Words)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
