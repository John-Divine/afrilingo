import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Volume2,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  X,
  Award,
  RotateCcw,
  Heart,
  Flame,
  Sparkles,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Check,
} from 'lucide-react';
import { CurriculumLesson, LessonExercise } from '../data/sageloCurriculum';
import { playSageloPhrase, playEnglishPhrase, isEnglishText } from '../utils/sageloAudio';
import { getWordPhonetic, getPhrasePhoneticDisplay } from '../utils/sageloPhonetics';
import { CartoonCharacter } from './CartoonCharacters';
import { InteractiveDuolingoSentence } from './InteractiveDuolingoSentence';

interface LessonSessionModalProps {
  lesson: CurriculumLesson;
  onClose: () => void;
  onComplete: (result: {
    lessonId: string;
    score: number;
    xpEarned: number;
    newWords: string[];
  }) => void;
}

export const LessonSessionModal: React.FC<LessonSessionModalProps> = ({
  lesson,
  onClose,
  onComplete,
}) => {
  // Phase: start directly in interactive practice or quick intro
  const [phase, setPhase] = useState<'intro' | 'practice' | 'summary'>('intro');
  const [exerciseIdx, setExerciseIdx] = useState(0);

  // Review queue for Duolingo spaced repetition inside the lesson
  const [reviewQueue, setReviewQueue] = useState<LessonExercise[]>([]);
  const [isReviewPhase, setIsReviewPhase] = useState(false);

  // Practice state
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [bankSelected, setBankSelected] = useState<string[]>([]);
  const [blankAnswer, setBlankAnswer] = useState<string>('');

  // Match Pairs state
  const [matchedPairs, setMatchedPairs] = useState<string[]>([]);
  const [selectedPairLeft, setSelectedPairLeft] = useState<string | null>(null);
  const [selectedPairRight, setSelectedPairRight] = useState<string | null>(null);
  const [pairError, setPairError] = useState<boolean>(false);

  // Selected Picture Choice card ID
  const [selectedPictureId, setSelectedPictureId] = useState<string | null>(null);

  const [feedback, setFeedback] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [hearts, setHearts] = useState<number>(5);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [comboStreak, setComboStreak] = useState<number>(0);
  const [showRulesDrawer, setShowRulesDrawer] = useState<boolean>(false);

  // Current active exercise pool
  const currentPool = isReviewPhase ? reviewQueue : lesson.exercises;
  const currentExercise = currentPool[exerciseIdx];

  // Play audio chime via Web Audio API
  const playChime = (type: 'correct' | 'wrong' | 'complete' | 'streak' | 'match') => {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      if (type === 'correct') {
        // Cheerful Duolingo ascending chime: C5 -> E5 -> G5
        const now = ctx.currentTime;
        [523.25, 659.25, 783.99].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.08);
          gain.gain.setValueAtTime(0.2, now + idx * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.25);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.08);
          osc.stop(now + idx * 0.08 + 0.3);
        });
      } else if (type === 'match') {
        const now = ctx.currentTime;
        [587.33, 880.0].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.06);
          gain.gain.setValueAtTime(0.22, now + idx * 0.06);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.22);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.06);
          osc.stop(now + idx * 0.06 + 0.25);
        });
      } else if (type === 'streak') {
        const now = ctx.currentTime;
        [659.25, 783.99, 1046.5].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + idx * 0.06);
          gain.gain.setValueAtTime(0.2, now + idx * 0.06);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.3);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.06);
          osc.stop(now + idx * 0.06 + 0.35);
        });
      } else if (type === 'wrong') {
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.exponentialRampToValueAtTime(110, now + 0.25);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.32);
      } else if (type === 'complete') {
        const now = ctx.currentTime;
        [523.25, 659.25, 783.99, 1046.5].forEach((freq) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now);
          gain.gain.setValueAtTime(0.2, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.85);
        });
      }
    } catch {}
  };

  // Reset exercise choices upon exercise change
  useEffect(() => {
    setSelectedOption(null);
    setBankSelected([]);
    setBlankAnswer('');
    setMatchedPairs([]);
    setSelectedPairLeft(null);
    setSelectedPairRight(null);
    setSelectedPictureId(null);
    setFeedback('idle');
    setShowRulesDrawer(false);

    // If listening exercise, pronounce the audio prompt automatically
    if (currentExercise && (currentExercise.type === 'listen_tap' || currentExercise.sageloAudioText)) {
      const audioToPlay = currentExercise.sageloAudioText || currentExercise.correctAnswer;
      if (audioToPlay && currentExercise.type === 'listen_tap') {
        setTimeout(() => {
          playSageloPhrase(audioToPlay);
        }, 300);
      }
    }
  }, [exerciseIdx, isReviewPhase, currentExercise]);

  // Shuffled left and right items for match_pairs
  const matchingPairsData = useMemo(() => {
    if (!currentExercise?.matchingPairs) return { left: [], right: [] };
    const pairs = currentExercise.matchingPairs;
    const left = [...pairs].map((p) => ({ id: p.sagelo, text: p.sagelo }));
    const right = [...pairs]
      .sort(() => Math.random() - 0.5)
      .map((p) => ({ id: p.sagelo, text: p.english }));
    return { left, right };
  }, [currentExercise]);

  const handleMatchSelect = (side: 'left' | 'right', id: string, spokenText?: string) => {
    if (side === 'left') {
      setSelectedPairLeft(id);
      playSageloPhrase(id, { lang: 'sagelo' });
      if (selectedPairRight) {
        checkPair(id, selectedPairRight);
      }
    } else {
      setSelectedPairRight(id);
      // It is the English translation side: pronounce with natural, proper English!
      if (spokenText) {
        playEnglishPhrase(spokenText);
      }
      if (selectedPairLeft) {
        checkPair(selectedPairLeft, id);
      }
    }
  };

  const checkPair = (leftId: string, rightId: string) => {
    if (leftId === rightId) {
      playChime('match');
      const updated = [...matchedPairs, leftId];
      setMatchedPairs(updated);
      setSelectedPairLeft(null);
      setSelectedPairRight(null);

      // Check if all matched
      if (currentExercise?.matchingPairs && updated.length >= currentExercise.matchingPairs.length) {
        playChime('correct');
        setFeedback('correct');
        setCorrectCount((c) => c + 1);
        setComboStreak((s) => s + 1);
      }
    } else {
      playChime('wrong');
      setPairError(true);
      setTimeout(() => {
        setPairError(false);
        setSelectedPairLeft(null);
        setSelectedPairRight(null);
      }, 500);
    }
  };

  const getAssembledAnswer = (): string => {
    if (!currentExercise) return '';
    if (currentExercise.type === 'multiple_choice' || currentExercise.type === 'root_morph') {
      return selectedOption || '';
    }
    if (currentExercise.type === 'picture_choice') {
      return selectedPictureId || '';
    }
    if (currentExercise.type === 'word_bank' || currentExercise.type === 'listen_tap') {
      return bankSelected.join(' ');
    }
    if (currentExercise.type === 'fill_blank') {
      return blankAnswer.trim();
    }
    return '';
  };

  const handleCheckAnswer = () => {
    if (!currentExercise || feedback !== 'idle') return;
    if (currentExercise.type === 'match_pairs') return; // match_pairs checks automatically

    const ans = getAssembledAnswer();
    const normalize = (s: string) =>
      s
        .toLowerCase()
        .replace(/[.,!?;:"]/g, '')
        .trim();

    const isMatch = normalize(ans) === normalize(currentExercise.correctAnswer);

    if (isMatch) {
      playChime(comboStreak >= 2 ? 'streak' : 'correct');
      setFeedback('correct');
      setCorrectCount((c) => c + 1);
      setComboStreak((s) => s + 1);

      // Pronounce the word / phrase after correct answer in its proper language
      const targetAudio = currentExercise.sageloAudioText;
      const candidate = currentExercise.correctAnswer;

      if (targetAudio) {
        setTimeout(() => {
          playSageloPhrase(targetAudio, { lang: 'sagelo' });
        }, 220);
      } else if (candidate) {
        const cleanPortion = candidate.split(/[—–\-:]/)[0].trim();
        setTimeout(() => {
          if (isEnglishText(cleanPortion)) {
            // It is English: read properly as English!
            playEnglishPhrase(candidate);
          } else {
            // It is Sagelo: read with authentic Sagelo phonetics!
            playSageloPhrase(cleanPortion, { lang: 'sagelo' });
          }
        }, 220);
      }
    } else {
      playChime('wrong');
      setFeedback('wrong');
      setComboStreak(0);
      setHearts((h) => Math.max(0, h - 1));

      // Add to review queue if not already queued
      if (!isReviewPhase && !reviewQueue.some((ex) => ex.id === currentExercise.id)) {
        setReviewQueue((prev) => [...prev, currentExercise]);
      }
    }
  };

  const handleNextStep = () => {
    if (exerciseIdx + 1 < currentPool.length) {
      setExerciseIdx((i) => i + 1);
    } else if (!isReviewPhase && reviewQueue.length > 0) {
      // Enter mistake review phase!
      setIsReviewPhase(true);
      setExerciseIdx(0);
      playChime('streak');
    } else {
      playChime('complete');
      setPhase('summary');
    }
  };

  const handleFinishLesson = () => {
    const score = Math.round((correctCount / lesson.exercises.length) * 100);
    onComplete({
      lessonId: lesson.id,
      score,
      xpEarned: lesson.xpReward,
      newWords: lesson.wordsIntroduced,
    });
  };

  // Keyboard shortcut listener (1-4, Enter, Backspace)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (phase !== 'practice') return;

      if (e.key === 'Enter') {
        e.preventDefault();
        if (feedback === 'idle') {
          handleCheckAnswer();
        } else {
          handleNextStep();
        }
      }

      if (feedback === 'idle') {
        if (['1', '2', '3', '4'].includes(e.key)) {
          const optIdx = parseInt(e.key, 10) - 1;
          if (
            (currentExercise?.type === 'multiple_choice' || currentExercise?.type === 'root_morph') &&
            currentExercise.options &&
            currentExercise.options[optIdx]
          ) {
            setSelectedOption(currentExercise.options[optIdx]);
          } else if (
            currentExercise?.type === 'picture_choice' &&
            currentExercise.pictureCards &&
            currentExercise.pictureCards[optIdx]
          ) {
            setSelectedPictureId(currentExercise.pictureCards[optIdx].sagelo);
          }
        }

        if (e.key === 'Backspace' && bankSelected.length > 0) {
          setBankSelected((prev) => prev.slice(0, -1));
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [feedback, phase, currentExercise, bankSelected]);

  // Overall lesson progress percentage
  const totalSteps = lesson.exercises.length + reviewQueue.length;
  const currentStep = isReviewPhase
    ? lesson.exercises.length + exerciseIdx + (feedback !== 'idle' ? 1 : 0)
    : exerciseIdx + (feedback !== 'idle' ? 1 : 0);
  const progressPercent = Math.min(100, Math.round((currentStep / totalSteps) * 100));

  const characterForExercise = currentExercise?.speaker || 'duo';

  return (
    <div className="fixed inset-0 z-50 bg-[#3C3C3C]/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-6 overflow-y-auto">
      <div className="bg-white border-2 border-b-6 border-[#E5E5E5] rounded-3xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[94vh] shadow-2xl relative">
        {/* DUOLINGO TOP STATUS BAR */}
        <div className="px-5 py-4 border-b-2 border-[#E5E5E5] flex items-center justify-between gap-4 bg-white shrink-0">
          {/* Close X */}
          <button
            onClick={onClose}
            className="text-[#AFAFAF] hover:text-[#3C3C3C] font-black text-xl p-1 transition-colors"
            aria-label="Exit lesson"
          >
            <X className="w-6 h-6 stroke-[3]" />
          </button>

          {/* Duolingo Rounded Progress Bar */}
          <div className="flex-1 mx-2 sm:mx-6 h-4 bg-[#E5E5E5] rounded-full overflow-hidden p-0.5 relative">
            <div
              className={`h-full rounded-full transition-all duration-300 relative shadow-inner ${
                isReviewPhase ? 'bg-[#FF9600]' : 'bg-[#58CC02]'
              }`}
              style={{ width: `${Math.max(5, progressPercent)}%` }}
            >
              <div className="absolute top-0.5 left-2 right-2 h-1 bg-white/30 rounded-full" />
            </div>
          </div>

          {/* Lesson Rules Drawer Toggle & Hearts */}
          <div className="flex items-center gap-3 shrink-0">
            {phase === 'practice' && (
              <button
                onClick={() => setShowRulesDrawer(!showRulesDrawer)}
                className={`px-3 py-1.5 rounded-xl border-2 font-black text-xs flex items-center gap-1.5 transition-all ${
                  showRulesDrawer
                    ? 'bg-[#FEF08A] border-[#EAB308] text-[#854D0E]'
                    : 'bg-[#F7F7F7] border-[#E5E5E5] text-[#777777] hover:bg-[#FFFBEB] hover:border-[#FDE68A] hover:text-[#B45309]'
                }`}
                title="View lesson formulas & grammar guide"
              >
                <Lightbulb className="w-4 h-4 text-[#EAB308]" />
                <span className="hidden sm:inline">Tip</span>
                {showRulesDrawer ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            )}

            {comboStreak > 1 && (
              <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 bg-[#FFF4E5] border border-[#FFD8A8] rounded-xl text-xs font-black text-[#EA580C] animate-pulse">
                <Flame className="w-4 h-4 fill-[#EA580C] text-[#EA580C]" />
                <span>{comboStreak}</span>
              </div>
            )}

            <div className="flex items-center gap-1.5 font-mono-num font-black text-base text-[#FF4B4B]">
              <Heart className="w-6 h-6 fill-[#FF4B4B] text-[#FF4B4B] animate-pulse" />
              <span>{hearts}</span>
            </div>
          </div>
        </div>

        {/* CONTENT VIEWPORT */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-6 flex flex-col justify-between">
          {/* 1. DUOLINGO INTRO HERO CARD (Bite-sized, engaging start) */}
          {phase === 'intro' && (
            <div className="space-y-6 flex-1 flex flex-col justify-center max-w-xl mx-auto w-full">
              <div className="text-center space-y-2">
                <div className="w-20 h-20 mx-auto rounded-3xl bg-[#58CC02]/15 text-[#58CC02] flex items-center justify-center text-4xl shadow-sm mb-2">
                  <CartoonCharacter character="duo" mood="speaking" size="md" animate={true} />
                </div>
                <span className="text-xs font-black uppercase tracking-wider text-[#1CB0F6]">
                  {lesson.numberLabel} • Lesson Kickoff
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-[#3C3C3C]">
                  {lesson.title}
                </h2>
                <p className="text-sm font-bold text-[#777777]">
                  {lesson.subtitle}
                </p>
              </div>

              {/* Introduced Words Card */}
              {lesson.wordsIntroduced.length > 0 && (
                <div className="bg-[#F7F7F7] border-2 border-[#E5E5E5] rounded-3xl p-5 space-y-3 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase text-[#AFAFAF] tracking-wider">
                      Key Vocabulary to Learn:
                    </span>
                    <span className="text-[10px] font-bold text-[#0284C7] bg-[#E0F2FE] px-2 py-0.5 rounded-md border border-[#BAE6FD]">
                      Tap to Pronounce
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {lesson.wordsIntroduced.map((word, idx) => {
                      const phon = getWordPhonetic(word);
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => playSageloPhrase(word)}
                          className="px-3.5 py-2 bg-white hover:bg-[#F0FDF4] border-2 border-b-4 border-[#E5E5E5] hover:border-[#58CC02] rounded-2xl text-xs font-black text-[#3C3C3C] flex items-center gap-2 transition-all active:translate-y-0.5 shadow-2xs group"
                          title={`Listen to "${word}" in IPA (${phon.display})`}
                        >
                          <span className="text-sm">{word}</span>
                          <span className="font-mono text-[10px] font-bold text-[#0284C7] bg-[#E0F2FE] px-1.5 py-0.5 rounded border border-[#BAE6FD]">
                            {phon.display}
                          </span>
                          <Volume2 className="w-3.5 h-3.5 text-[#AFAFAF] group-hover:text-[#58CC02]" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Mentor Wisdom Tip */}
              {lesson.teachingSlides[0]?.mentorTip && (
                <div className="p-4 rounded-2xl bg-[#FFFBEB] border-2 border-[#FDE68A] flex items-center gap-3">
                  <span className="text-2xl">💡</span>
                  <p className="text-xs sm:text-sm font-bold text-[#92400E] leading-relaxed">
                    {lesson.teachingSlides[0].mentorTip.text}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* 2. DUOLINGO INTERACTIVE PRACTICE PHASE */}
          {phase === 'practice' && currentExercise && (
            <div className="space-y-6 flex-1">
              {/* Spaced Repetition Review Header if in review mode */}
              {isReviewPhase && (
                <div className="p-3.5 rounded-2xl bg-[#FFF4E5] border-2 border-[#FFD8A8] flex items-center gap-3 animate-pulse">
                  <span className="text-xl">🔁</span>
                  <div>
                    <h4 className="text-xs font-black uppercase text-[#EA580C] tracking-wider">
                      Reviewing Mistakes ({exerciseIdx + 1}/{reviewQueue.length})
                    </h4>
                    <p className="text-xs font-bold text-[#9A3412]">
                      Let's practice this one again to master it!
                    </p>
                  </div>
                </div>
              )}

              {/* Question Header & Character Prompt */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <CartoonCharacter
                    character={characterForExercise}
                    mood={
                      feedback === 'correct'
                        ? 'celebrating'
                        : feedback === 'wrong'
                        ? 'encouraging'
                        : 'speaking'
                    }
                    size="md"
                    animate={true}
                  />

                  <div className="flex-1 space-y-1">
                    <span className="text-[11px] font-black uppercase tracking-wider text-[#AFAFAF]">
                      Question {exerciseIdx + 1} of {currentPool.length}
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black text-[#3C3C3C] leading-snug">
                      {currentExercise.prompt}
                    </h3>
                  </div>
                </div>
              </div>

              {/* Collapsible Rules Drawer */}
              {showRulesDrawer && (
                <div className="p-4 rounded-2xl bg-[#FFFBEB] border-2 border-[#FDE68A] text-[#78350F] space-y-3 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5 font-mono">
                      <Lightbulb className="w-4 h-4 text-[#D97706]" />
                      Lesson {lesson.numberLabel} Rules & Notes
                    </span>
                  </div>
                  {lesson.teachingSlides.map((slide, sIdx) => (
                    <div
                      key={sIdx}
                      className="space-y-2 text-xs sm:text-sm bg-white/70 p-3 rounded-xl border border-[#FDE68A]"
                    >
                      <div className="font-black text-[#92400E]">{slide.title}</div>
                      <p className="text-[#78350F] leading-relaxed">{slide.body}</p>
                      {slide.mentorTip && (
                        <div className="italic text-[12px] text-[#B45309] font-medium bg-[#FEF3C7] px-2.5 py-1.5 rounded-lg">
                          💡 Tip: {slide.mentorTip.text}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* INTERACTIVE PROMPT CARD (WITH DUOLINGO WORD HINTS) */}
              {currentExercise.sageloAudioText && currentExercise.type !== 'listen_tap' && (
                <div className="p-4 rounded-3xl bg-[#F7F7F7] border-2 border-[#E5E5E5] space-y-2 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-[#AFAFAF] tracking-wider">
                      Tap any word for translation & IPA hint:
                    </span>
                    <span className="text-[10px] font-mono text-[#0284C7] bg-[#E0F2FE] px-2 py-0.5 rounded-md border border-[#BAE6FD]">
                      {getPhrasePhoneticDisplay(currentExercise.sageloAudioText)}
                    </span>
                  </div>

                  <InteractiveDuolingoSentence
                    sentence={currentExercise.sageloAudioText}
                    size="lg"
                    showSpeakers={true}
                  />
                </div>
              )}

              {/* LISTENING EXERCISE PROMPT CARD */}
              {currentExercise.type === 'listen_tap' && (
                <div className="p-6 rounded-3xl bg-[#F0F9FF] border-2 border-[#BAE6FD] text-center space-y-3 shadow-xs">
                  <span className="text-xs font-black uppercase tracking-wider text-[#0284C7]">
                    Tap speaker to listen to the phrase:
                  </span>
                  <div className="flex items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        playSageloPhrase(
                          currentExercise.sageloAudioText || currentExercise.correctAnswer,
                          { rate: 0.88 }
                        )
                      }
                      className="w-16 h-16 rounded-3xl bg-[#1CB0F6] hover:bg-[#20BEFF] active:bg-[#1899D6] border-b-6 border-[#1580B8] text-white flex items-center justify-center active:translate-y-1 transition-all shadow-md"
                      title="Normal speed"
                    >
                      <Volume2 className="w-8 h-8 stroke-[2.5]" />
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        playSageloPhrase(
                          currentExercise.sageloAudioText || currentExercise.correctAnswer,
                          { rate: 0.62 }
                        )
                      }
                      className="w-12 h-12 rounded-2xl bg-white hover:bg-[#F7F7F7] active:bg-[#E5E5E5] border-2 border-b-4 border-[#BAE6FD] text-[#0284C7] flex items-center justify-center active:translate-y-0.5 transition-all text-xl font-black shadow-xs"
                      title="Turtle slow speed"
                    >
                      🐢
                    </button>
                  </div>
                </div>
              )}

              {/* ROOT MORPH BASE CARD */}
              {currentExercise.type === 'root_morph' && currentExercise.rootBase && (
                <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-[#F0FDF4] border-2 border-[#BBF7D0]">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-[#58CC02] text-white flex items-center justify-center shrink-0 shadow-xs border-b-4 border-[#46A302] text-xl font-black">
                      🌱
                    </div>
                    <div>
                      <span className="text-[11px] font-black uppercase text-[#166534] tracking-wider block">
                        Base Root to Transform:
                      </span>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-lg font-black text-[#14532D]">
                          "{currentExercise.rootBase}"
                        </span>
                        <span className="font-mono text-xs font-bold text-[#166534] bg-white px-2 py-0.5 rounded-lg border border-[#86EFAC]">
                          {getWordPhonetic(currentExercise.rootBase).display}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-[#166534] mt-0.5">
                        Select the correct suffix below to build the target word
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => playSageloPhrase(currentExercise.rootBase!)}
                    className="px-3.5 py-2 rounded-xl bg-white border-2 border-[#86EFAC] text-[#166534] hover:bg-[#DCFCE7] active:translate-y-0.5 transition-all flex items-center gap-1.5 font-black text-xs shrink-0"
                    title="Hear base root phonetically"
                  >
                    <Volume2 className="w-4 h-4" />
                    <span className="hidden sm:inline">Hear Root</span>
                  </button>
                </div>
              )}

              {/* PICTURE CHOICE (DUOLINGO 3-CARD VISUAL SELECTOR) */}
              {currentExercise.type === 'picture_choice' && currentExercise.pictureCards && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {currentExercise.pictureCards.map((card, idx) => {
                    const isSelected = selectedPictureId === card.sagelo;
                    const phon = getWordPhonetic(card.sagelo);
                    return (
                      <button
                        key={card.id || idx}
                        type="button"
                        onClick={() => {
                          if (feedback !== 'idle') return;
                          setSelectedPictureId(card.sagelo);
                          playSageloPhrase(card.sagelo);
                        }}
                        disabled={feedback !== 'idle'}
                        className={`p-4 rounded-3xl border-2 border-b-6 transition-all flex flex-col items-center justify-between text-center gap-3 relative cursor-pointer active:translate-y-1 ${
                          isSelected
                            ? 'bg-[#DDF4FF] border-[#1CB0F6] text-[#1CB0F6]'
                            : 'bg-white border-[#E5E5E5] hover:bg-[#F7F7F7] text-[#3C3C3C]'
                        }`}
                      >
                        <span className="text-5xl my-2">{card.emoji}</span>
                        <div className="space-y-0.5">
                          <span className="text-lg font-black block">{card.sagelo}</span>
                          <span className="font-mono text-[10px] font-bold text-[#0284C7] bg-[#E0F2FE] px-2 py-0.5 rounded-md border border-[#BAE6FD] inline-block">
                            {phon.display}
                          </span>
                          <span className="text-xs font-bold text-[#777777] block mt-1">
                            {card.english}
                          </span>
                        </div>
                        <div
                          className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center text-xs font-black shrink-0 ${
                            isSelected
                              ? 'border-[#1CB0F6] bg-[#1CB0F6] text-white'
                              : 'border-[#E5E5E5] text-[#AFAFAF]'
                          }`}
                        >
                          {isSelected ? '✓' : idx + 1}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* MATCH PAIRS (DUOLINGO CLASSIC MATCHING) */}
              {currentExercise.type === 'match_pairs' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase text-[#AFAFAF] tracking-wider">
                      Tap a Sagelo word and its matching translation:
                    </span>
                    <span className="text-xs font-black text-[#58CC02]">
                      {matchedPairs.length} / {currentExercise.matchingPairs?.length || 0} matched
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {/* Left Column (Sagelo Words) */}
                    <div className="space-y-2.5">
                      {matchingPairsData.left.map((item) => {
                        const isMatched = matchedPairs.includes(item.id);
                        const isSelected = selectedPairLeft === item.id;
                        const phon = getWordPhonetic(item.text);

                        return (
                          <button
                            key={`left-${item.id}`}
                            type="button"
                            onClick={() => !isMatched && handleMatchSelect('left', item.id)}
                            disabled={isMatched}
                            className={`w-full p-3.5 rounded-2xl border-2 border-b-4 font-black text-left flex items-center justify-between gap-2 transition-all ${
                              isMatched
                                ? 'bg-[#DCFCE7] border-[#86EFAC] text-[#166534] opacity-70 cursor-default'
                                : isSelected
                                ? 'bg-[#DDF4FF] border-[#1CB0F6] text-[#1CB0F6] scale-102'
                                : pairError && isSelected
                                ? 'bg-[#FEE2E2] border-[#EF4444] text-[#991B1B]'
                                : 'bg-white border-[#E5E5E5] hover:bg-[#F7F7F7] text-[#3C3C3C]'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span>{item.text}</span>
                              <span className="font-mono text-[10px] font-bold text-[#0284C7] bg-[#E0F2FE] px-1.5 py-0.2 rounded border border-[#BAE6FD]">
                                {phon.display}
                              </span>
                            </div>
                            {isMatched && <Check className="w-4 h-4 text-[#166534]" />}
                          </button>
                        );
                      })}
                    </div>

                    {/* Right Column (English Translations) */}
                    <div className="space-y-2.5">
                      {matchingPairsData.right.map((item) => {
                        const isMatched = matchedPairs.includes(item.id);
                        const isSelected = selectedPairRight === item.id;

                        return (
                          <button
                            key={`right-${item.id}`}
                            type="button"
                            onClick={() => !isMatched && handleMatchSelect('right', item.id, item.text)}
                            disabled={isMatched}
                            className={`w-full p-3.5 rounded-2xl border-2 border-b-4 font-black text-left flex items-center justify-between gap-2 transition-all ${
                              isMatched
                                ? 'bg-[#DCFCE7] border-[#86EFAC] text-[#166534] opacity-70 cursor-default'
                                : isSelected
                                ? 'bg-[#DDF4FF] border-[#1CB0F6] text-[#1CB0F6] scale-102'
                                : pairError && isSelected
                                ? 'bg-[#FEE2E2] border-[#EF4444] text-[#991B1B]'
                                : 'bg-white border-[#E5E5E5] hover:bg-[#F7F7F7] text-[#3C3C3C]'
                            }`}
                          >
                            <span>{item.text}</span>
                            {isMatched && <Check className="w-4 h-4 text-[#166534]" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* MULTIPLE CHOICE & ROOT MORPH OPTIONS */}
              {(currentExercise.type === 'multiple_choice' || currentExercise.type === 'root_morph') &&
                currentExercise.options && (
                  <div className="grid grid-cols-1 gap-2.5">
                    {currentExercise.options.map((opt, idx) => {
                      const isSelected = selectedOption === opt;
                      const letter = ['A', 'B', 'C', 'D'][idx] || idx + 1;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            if (feedback !== 'idle') return;
                            setSelectedOption(opt);
                          }}
                          disabled={feedback !== 'idle'}
                          className={`p-4 rounded-2xl border-2 border-b-4 text-left transition-all flex items-center justify-between gap-4 font-black active:translate-y-0.5 cursor-pointer ${
                            isSelected
                              ? 'bg-[#DDF4FF] border-[#1CB0F6] text-[#1CB0F6]'
                              : 'bg-white border-[#E5E5E5] hover:bg-[#F7F7F7] text-[#3C3C3C]'
                          }`}
                        >
                          <span className="text-sm sm:text-base leading-snug">{opt}</span>
                          <span
                            className={`w-7 h-7 rounded-xl border-2 flex items-center justify-center text-xs font-black shrink-0 ${
                              isSelected
                                ? 'border-[#1CB0F6] bg-[#1CB0F6] text-white'
                                : 'border-[#E5E5E5] text-[#AFAFAF]'
                            }`}
                          >
                            {isSelected ? '✓' : letter}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}

              {/* WORD BANK TILES (TRANSLATE OR LISTEN & TAP) */}
              {(currentExercise.type === 'word_bank' || currentExercise.type === 'listen_tap') && (
                <div className="space-y-4">
                  {/* Selected Answer Slot */}
                  <div className="min-h-[64px] p-3 rounded-2xl border-2 border-dashed border-[#AFAFAF] bg-[#F7F7F7] flex flex-wrap items-center gap-2">
                    {bankSelected.length === 0 ? (
                      <span className="text-xs font-bold text-[#AFAFAF] italic px-2">
                        Tap words below to arrange your sentence...
                      </span>
                    ) : (
                      bankSelected.map((word, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            if (feedback !== 'idle') return;
                            setBankSelected((prev) => prev.filter((_, i) => i !== idx));
                          }}
                          className="px-4 py-2 bg-white border-2 border-b-4 border-[#1CB0F6] text-[#1CB0F6] font-black text-sm rounded-xl active:translate-y-1 transition-all"
                        >
                          {word}
                        </button>
                      ))
                    )}
                  </div>

                  {/* Word Bank Pool */}
                  <div className="flex flex-wrap gap-2 pt-1">
                    {currentExercise.wordBankTiles?.map((word, idx) => {
                      const countInAnswer = bankSelected.filter((w) => w === word).length;
                      const countInPool = currentExercise.wordBankTiles!.filter((w) => w === word).length;
                      const isExhausted = countInAnswer >= countInPool;

                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            if (feedback !== 'idle' || isExhausted) return;
                            setBankSelected((prev) => [...prev, word]);
                            playSageloPhrase(word);
                          }}
                          disabled={isExhausted || feedback !== 'idle'}
                          className={`px-3.5 py-2 rounded-xl border-2 border-b-4 font-black text-sm transition-all flex items-center gap-2 active:translate-y-1 ${
                            isExhausted
                              ? 'bg-[#E5E5E5] border-[#D0D0D0] text-[#AFAFAF] cursor-default'
                              : 'bg-white border-[#E5E5E5] hover:bg-[#F7F7F7] text-[#3C3C3C]'
                          }`}
                        >
                          <span>{word}</span>
                          <span className="font-mono text-[10px] font-bold text-[#0284C7] bg-[#E0F2FE] px-1 py-0.2 rounded border border-[#BAE6FD]">
                            {getWordPhonetic(word).display}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* FILL IN THE BLANK */}
              {currentExercise.type === 'fill_blank' && (
                <div className="space-y-4">
                  {currentExercise.options && currentExercise.options.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {currentExercise.options.map((opt, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            if (feedback !== 'idle') return;
                            setBlankAnswer(opt);
                            playSageloPhrase(opt);
                          }}
                          className={`p-3.5 rounded-2xl border-2 border-b-4 font-black text-center text-sm transition-all active:translate-y-0.5 ${
                            blankAnswer === opt
                              ? 'bg-[#DDF4FF] border-[#1CB0F6] text-[#1CB0F6]'
                              : 'bg-white border-[#E5E5E5] text-[#3C3C3C]'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <input
                      type="text"
                      value={blankAnswer}
                      onChange={(e) => setBlankAnswer(e.target.value)}
                      placeholder="Type the Sagelo particle or root..."
                      disabled={feedback !== 'idle'}
                      className="w-full p-4 rounded-2xl border-2 border-b-4 border-[#E5E5E5] focus:border-[#1CB0F6] outline-hidden text-lg font-black text-[#3C3C3C] bg-white transition-all"
                    />
                  )}
                </div>
              )}
            </div>
          )}

          {/* 3. LESSON SUMMARY VICTORY SCREEN */}
          {phase === 'summary' && (
            <div className="py-6 text-center space-y-6 flex-1 flex flex-col items-center justify-center">
              <div className="relative">
                <CartoonCharacter character="duo" mood="celebrating" size="lg" animate={true} />
                <div className="absolute -top-3 -right-3 text-4xl animate-bounce">
                  🎉
                </div>
              </div>

              <div className="space-y-1 max-w-md">
                <span className="text-xs font-black uppercase tracking-wider text-[#58CC02]">
                  LESSON COMPLETE!
                </span>
                <h3 className="text-3xl font-black text-[#3C3C3C]">
                  Shanti, Champion!
                </h3>
                <p className="text-xs sm:text-sm font-bold text-[#777777]">
                  You successfully mastered {lesson.title}!
                </p>
              </div>

              {/* Stats Tally */}
              <div className="grid grid-cols-3 gap-3 max-w-sm w-full">
                <div className="p-3.5 bg-[#FFFBEB] border-2 border-[#FDE68A] rounded-2xl text-center">
                  <div className="text-xs font-black uppercase text-[#92400E]">XP Earned</div>
                  <div className="text-2xl font-black text-[#D97706] mt-0.5">+{lesson.xpReward}</div>
                </div>

                <div className="p-3.5 bg-[#DCFCE7] border-2 border-[#86EFAC] rounded-2xl text-center">
                  <div className="text-xs font-black uppercase text-[#166534]">Accuracy</div>
                  <div className="text-2xl font-black text-[#15803D] mt-0.5">
                    {Math.round((correctCount / lesson.exercises.length) * 100)}%
                  </div>
                </div>

                <div className="p-3.5 bg-[#DDF4FF] border-2 border-[#BAE6FD] rounded-2xl text-center">
                  <div className="text-xs font-black uppercase text-[#0369A1]">Streak</div>
                  <div className="text-2xl font-black text-[#0284C7] mt-0.5">
                    {comboStreak > 0 ? `${comboStreak} 🔥` : 'Active'}
                  </div>
                </div>
              </div>

              {/* Introduced Words Badge List */}
              {lesson.wordsIntroduced.length > 0 && (
                <div className="max-w-md w-full bg-[#F7F7F7] p-3 rounded-2xl border-2 border-[#E5E5E5] text-left">
                  <div className="text-[11px] font-black uppercase text-[#AFAFAF] tracking-wider mb-1.5">
                    New Roots Added to Memory:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {lesson.wordsIntroduced.map((w, idx) => {
                      const phon = getWordPhonetic(w);
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => playSageloPhrase(w)}
                          className="px-3 py-1.5 bg-white border-2 border-[#E5E5E5] hover:border-[#1CB0F6] rounded-xl text-xs font-black text-[#3C3C3C] flex items-center gap-2 transition-all shadow-2xs group cursor-pointer active:translate-y-0.5"
                          title={`Pronounce "${w}" phonetically (${phon.display})`}
                        >
                          <span>{w}</span>
                          <span className="font-mono text-[10px] font-bold text-[#0284C7] bg-[#E0F2FE] px-1.5 py-0.2 rounded border border-[#BAE6FD]">
                            {phon.display}
                          </span>
                          <Volume2 className="w-3.5 h-3.5 text-[#AFAFAF] group-hover:text-[#1CB0F6]" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* DUOLINGO BOTTOM ACTION BAR */}
          <div className="pt-4 border-t-2 border-[#E5E5E5] shrink-0">
            {phase === 'intro' && (
              <div className="flex items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={() => setShowRulesDrawer(!showRulesDrawer)}
                  className="text-xs font-black uppercase text-[#AFAFAF] hover:text-[#3C3C3C] tracking-wider transition-colors flex items-center gap-1.5"
                >
                  <Lightbulb className="w-4 h-4 text-[#EAB308]" />
                  <span>View Lesson Notes</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPhase('practice')}
                  className="px-8 py-3.5 bg-[#58CC02] hover:bg-[#61E002] border-b-6 border-[#46A302] text-white font-black uppercase text-sm rounded-2xl active:translate-y-1 transition-all shadow-md flex items-center gap-2"
                >
                  <span>Start Exercises</span>
                  <ArrowRight className="w-4 h-4 stroke-[3]" />
                </button>
              </div>
            )}

            {phase === 'practice' && (
              <>
                {feedback === 'idle' ? (
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleCheckAnswer}
                      disabled={
                        currentExercise?.type === 'match_pairs' ||
                        ((currentExercise?.type === 'word_bank' || currentExercise?.type === 'listen_tap') &&
                          bankSelected.length === 0) ||
                        ((currentExercise?.type === 'multiple_choice' || currentExercise?.type === 'root_morph') &&
                          !selectedOption) ||
                        (currentExercise?.type === 'picture_choice' && !selectedPictureId) ||
                        (currentExercise?.type === 'fill_blank' && !blankAnswer.trim())
                      }
                      className="w-full sm:w-auto px-8 py-3.5 bg-[#58CC02] hover:bg-[#61E002] active:bg-[#46A302] border-b-4 border-[#46A302] text-white font-black uppercase text-sm rounded-2xl active:translate-y-1 transition-all shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Check Answer
                    </button>
                  </div>
                ) : feedback === 'correct' ? (
                  <div className="p-4 rounded-2xl bg-[#D7FFB8] border-2 border-[#58CC02] flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in duration-200">
                    <div className="flex items-center gap-3 text-left w-full sm:w-auto">
                      <div className="w-10 h-10 rounded-2xl bg-[#58CC02] text-white flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-6 h-6 stroke-[3]" />
                      </div>
                      <div className="flex-1">
                        <div className="text-base font-black text-[#166534] flex items-center gap-2 flex-wrap">
                          <span>Awesome! Shanti!</span>
                          {(() => {
                            const sageloTarget = currentExercise?.sageloAudioText;
                            const candidate = currentExercise?.correctAnswer || '';
                            const cleanPortion = candidate.split(/[—–\-:]/)[0].trim();
                            const isSagelo = Boolean(sageloTarget || (!isEnglishText(cleanPortion) && cleanPortion));
                            const phraseToSpeak = sageloTarget || (isSagelo ? cleanPortion : candidate);

                            if (!phraseToSpeak) return null;

                            if (isSagelo) {
                              const phonetic = getPhrasePhoneticDisplay(phraseToSpeak);
                              return (
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="font-mono text-xs font-black text-[#166534] bg-white px-2 py-0.5 rounded-lg border border-[#86EFAC]">
                                    {phonetic}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => playSageloPhrase(phraseToSpeak, { lang: 'sagelo' })}
                                    className="px-2.5 py-1 rounded-xl bg-white border border-[#86EFAC] text-[#166534] font-black text-xs flex items-center gap-1 hover:bg-[#F0FDF4] active:translate-y-0.5 transition-all shadow-2xs cursor-pointer"
                                    title="Hear authentic Sagelo pronunciation"
                                  >
                                    <Volume2 className="w-3.5 h-3.5" />
                                    <span>Listen (Sagelo)</span>
                                  </button>
                                </div>
                              );
                            } else {
                              return (
                                <button
                                  type="button"
                                  onClick={() => playEnglishPhrase(phraseToSpeak)}
                                  className="px-2.5 py-1 rounded-xl bg-white border border-[#86EFAC] text-[#166534] font-black text-xs flex items-center gap-1 hover:bg-[#F0FDF4] active:translate-y-0.5 transition-all shadow-2xs cursor-pointer"
                                  title="Read solution in proper English"
                                >
                                  <Volume2 className="w-3.5 h-3.5" />
                                  <span>Listen (English)</span>
                                </button>
                              );
                            }
                          })()}
                        </div>
                        <div className="text-xs font-bold text-[#15803D] flex items-center gap-2">
                          <span>{currentExercise?.explanation}</span>
                          {currentExercise?.explanation && (
                            <button
                              type="button"
                              onClick={() => playEnglishPhrase(currentExercise.explanation)}
                              className="text-[#166534] hover:text-[#15803D] p-0.5 rounded hover:bg-white/50 transition-all shrink-0 cursor-pointer"
                              title="Read explanation in English"
                            >
                              <Volume2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleNextStep}
                      className="w-full sm:w-auto px-8 py-3 bg-[#58CC02] hover:bg-[#61E002] border-b-4 border-[#46A302] text-white font-black uppercase text-sm rounded-2xl active:translate-y-1 transition-all shadow-sm"
                    >
                      Continue
                    </button>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-[#FFDFE0] border-2 border-[#FF4B4B] flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in duration-200">
                    <div className="flex items-center gap-3 text-left w-full sm:w-auto">
                      <div className="w-10 h-10 rounded-2xl bg-[#FF4B4B] text-white flex items-center justify-center shrink-0">
                        <AlertCircle className="w-6 h-6 stroke-[3]" />
                      </div>
                      <div className="flex-1">
                        <div className="text-base font-black text-[#991B1B] flex items-center gap-2 flex-wrap">
                          <span>Correct solution: {currentExercise?.correctAnswer}</span>
                          {(() => {
                            const sageloTarget = currentExercise?.sageloAudioText;
                            const candidate = currentExercise?.correctAnswer || '';
                            const cleanPortion = candidate.split(/[—–\-:]/)[0].trim();
                            const isSagelo = Boolean(sageloTarget || (!isEnglishText(cleanPortion) && cleanPortion));
                            const phraseToSpeak = sageloTarget || (isSagelo ? cleanPortion : candidate);

                            if (!phraseToSpeak) return null;

                            if (isSagelo) {
                              const phonetic = getPhrasePhoneticDisplay(phraseToSpeak);
                              return (
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="font-mono text-xs font-black text-[#991B1B] bg-white px-2 py-0.5 rounded-lg border border-[#FCA5A5]">
                                    {phonetic}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => playSageloPhrase(phraseToSpeak, { lang: 'sagelo' })}
                                    className="px-2.5 py-1 rounded-xl bg-white border border-[#FCA5A5] text-[#991B1B] font-black text-xs flex items-center gap-1 hover:bg-[#FFF1F2] active:translate-y-0.5 transition-all shadow-2xs cursor-pointer"
                                    title="Hear authentic Sagelo pronunciation"
                                  >
                                    <Volume2 className="w-3.5 h-3.5" />
                                    <span>Listen (Sagelo)</span>
                                  </button>
                                </div>
                              );
                            } else {
                              return (
                                <button
                                  type="button"
                                  onClick={() => playEnglishPhrase(phraseToSpeak)}
                                  className="px-2.5 py-1 rounded-xl bg-white border border-[#FCA5A5] text-[#991B1B] font-black text-xs flex items-center gap-1 hover:bg-[#FFF1F2] active:translate-y-0.5 transition-all shadow-2xs cursor-pointer"
                                  title="Read solution in proper English"
                                >
                                  <Volume2 className="w-3.5 h-3.5" />
                                  <span>Listen (English)</span>
                                </button>
                              );
                            }
                          })()}
                        </div>
                        <div className="text-xs font-bold text-[#B91C1C]">
                          {currentExercise?.explanation}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleNextStep}
                      className="w-full sm:w-auto px-8 py-3 bg-[#FF4B4B] hover:bg-[#FF6666] border-b-4 border-[#CC3B3B] text-white font-black uppercase text-sm rounded-2xl active:translate-y-1 transition-all shadow-sm"
                    >
                      Got It
                    </button>
                  </div>
                )}
              </>
            )}

            {phase === 'summary' && (
              <button
                type="button"
                onClick={handleFinishLesson}
                className="w-full py-4 bg-[#58CC02] hover:bg-[#61E002] border-b-6 border-[#46A302] text-white font-black uppercase text-sm rounded-2xl active:translate-y-1 transition-all shadow-md"
              >
                Complete Lesson & Return to Path
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
