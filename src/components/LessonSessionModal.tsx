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
  const isFrenchCourse =
    lesson.id.startsWith('fr-') ||
    lesson.unitId.startsWith('fr-') ||
    lesson.unitId.includes('fr');
  const targetCourseLang: 'sagelo' | 'french' = isFrenchCourse ? 'french' : 'sagelo';

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
          playSageloPhrase(audioToPlay, { lang: targetCourseLang });
        }, 300);
      }
    }
  }, [exerciseIdx, isReviewPhase, currentExercise, targetCourseLang]);

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
      playSageloPhrase(id, { lang: targetCourseLang });
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
          playSageloPhrase(targetAudio, { lang: targetCourseLang });
        }, 220);
      } else if (candidate) {
        const cleanPortion = candidate.split(/[—–\-:]/)[0].trim();
        setTimeout(() => {
          if (isEnglishText(cleanPortion)) {
            // It is English: read properly as English!
            playEnglishPhrase(candidate);
          } else {
            // Target language: read with authentic pronunciation (French or Sagelo)!
            playSageloPhrase(cleanPortion, { lang: targetCourseLang });
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
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-6 overflow-y-auto">
      <div className="bg-[#1E130D] border-2 border-b-6 border-[#3D2619] rounded-3xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[94vh] shadow-2xl relative text-[#FEF3C7]">
        {/* DUOLINGO TOP STATUS BAR */}
        <div className="px-5 py-4 border-b-2 border-[#3D2619] flex items-center justify-between gap-4 bg-[#1E130D] shrink-0">
          {/* Close X */}
          <button
            onClick={onClose}
            className="text-[#D4A373] hover:text-[#FEF3C7] font-black text-xl p-1 transition-colors"
            aria-label="Exit lesson"
          >
            <X className="w-6 h-6 stroke-[3]" />
          </button>

          {/* Duolingo Rounded Progress Bar */}
          <div className="flex-1 mx-2 sm:mx-6 h-4 bg-[#241710] border border-[#3D2619] rounded-full overflow-hidden p-0.5 relative">
            <div
              className={`h-full rounded-full transition-all duration-300 relative shadow-inner ${
                isReviewPhase ? 'bg-[#F59E0B]' : 'bg-[#059669]'
              }`}
              style={{ width: `${Math.max(5, progressPercent)}%` }}
            >
              <div className="absolute top-0.5 left-2 right-2 h-1 bg-white/20 rounded-full" />
            </div>
          </div>

          {/* Lesson Rules Drawer Toggle & Hearts */}
          <div className="flex items-center gap-3 shrink-0">
            {phase === 'practice' && (
              <button
                onClick={() => setShowRulesDrawer(!showRulesDrawer)}
                className={`px-3 py-1.5 rounded-xl border-2 font-black text-xs flex items-center gap-1.5 transition-all ${
                  showRulesDrawer
                    ? 'bg-[#F59E0B]/20 border-[#F59E0B] text-[#F59E0B]'
                    : 'bg-[#241710] border-[#3D2619] text-[#D4A373] hover:border-[#F59E0B] hover:text-[#FEF3C7]'
                }`}
                title="View lesson formulas & grammar guide"
              >
                <Lightbulb className="w-4 h-4 text-[#F59E0B]" />
                <span className="hidden sm:inline">Tip</span>
                {showRulesDrawer ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            )}

            {comboStreak > 1 && (
              <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 bg-[#241710] border border-[#F59E0B]/60 rounded-xl text-xs font-black text-[#F59E0B] animate-pulse">
                <Flame className="w-4 h-4 fill-[#F59E0B] text-[#F59E0B]" />
                <span>{comboStreak}</span>
              </div>
            )}

            <div className="flex items-center gap-1.5 font-mono-num font-black text-base text-[#EF4444]">
              <Heart className="w-6 h-6 fill-[#EF4444] text-[#EF4444] animate-pulse" />
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
                <div className="w-20 h-20 mx-auto rounded-3xl bg-[#059669]/20 text-[#10B981] flex items-center justify-center text-4xl shadow-sm mb-2 border border-[#059669]/40">
                  <CartoonCharacter character="duo" mood="speaking" size="md" animate={true} />
                </div>
                <span className="text-xs font-black uppercase tracking-wider text-[#14B8A6]">
                  {lesson.numberLabel} • Lesson Kickoff
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-[#FEF3C7]">
                  {lesson.title}
                </h2>
                <p className="text-sm font-bold text-[#D4A373]">
                  {lesson.subtitle}
                </p>
              </div>

              {/* Introduced Words Card */}
              {lesson.wordsIntroduced.length > 0 && (
                <div className="bg-[#241710] border-2 border-[#3D2619] rounded-3xl p-5 space-y-3 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase text-[#D4A373] tracking-wider">
                      Key Vocabulary to Learn:
                    </span>
                    <span className="text-[10px] font-bold text-[#14B8A6] bg-[#0F2D28] px-2 py-0.5 rounded-md border border-[#0D9488]/40">
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
                          onClick={() => playSageloPhrase(word, { lang: targetCourseLang })}
                          className="px-3.5 py-2 bg-[#1E130D] hover:bg-[#2C1D14] border-2 border-b-4 border-[#3D2619] hover:border-[#10B981] rounded-2xl text-xs font-black text-[#FEF3C7] flex items-center gap-2 transition-all active:translate-y-0.5 shadow-2xs group cursor-pointer"
                          title={isFrenchCourse ? `Pronounce "${word}" in French` : `Listen to "${word}" in IPA (${phon.display})`}
                        >
                          <span className="text-sm">{word}</span>
                          <span className="font-mono text-[10px] font-bold text-[#14B8A6] bg-[#0F2D28] px-1.5 py-0.5 rounded border border-[#0D9488]/40">
                            {phon.display}
                          </span>
                          <Volume2 className="w-3.5 h-3.5 text-[#D4A373] group-hover:text-[#10B981]" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Mentor Wisdom Tip */}
              {lesson.teachingSlides[0]?.mentorTip && (
                <div className="p-4 rounded-2xl bg-[#241710] border-2 border-[#F59E0B]/40 flex items-center gap-3">
                  <span className="text-2xl">💡</span>
                  <p className="text-xs sm:text-sm font-bold text-[#FEF3C7] leading-relaxed">
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
                <div className="p-3.5 rounded-2xl bg-[#241710] border-2 border-[#F59E0B]/60 flex items-center gap-3 animate-pulse">
                  <span className="text-xl">🔁</span>
                  <div>
                    <h4 className="text-xs font-black uppercase text-[#F59E0B] tracking-wider">
                      Reviewing Mistakes ({exerciseIdx + 1}/{reviewQueue.length})
                    </h4>
                    <p className="text-xs font-bold text-[#D4A373]">
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
                    <span className="text-[11px] font-black uppercase tracking-wider text-[#D4A373]">
                      Question {exerciseIdx + 1} of {currentPool.length}
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black text-[#FEF3C7] leading-snug">
                      {currentExercise.prompt}
                    </h3>
                  </div>
                </div>
              </div>

              {/* Collapsible Rules Drawer */}
              {showRulesDrawer && (
                <div className="p-4 rounded-2xl bg-[#241710] border-2 border-[#F59E0B]/50 text-[#FEF3C7] space-y-3 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5 font-mono text-[#F59E0B]">
                      <Lightbulb className="w-4 h-4 text-[#F59E0B]" />
                      Lesson {lesson.numberLabel} Rules & Notes
                    </span>
                  </div>
                  {lesson.teachingSlides.map((slide, sIdx) => (
                    <div
                      key={sIdx}
                      className="space-y-2 text-xs sm:text-sm bg-[#1E130D] p-3 rounded-xl border border-[#3D2619]"
                    >
                      <div className="font-black text-[#F59E0B]">{slide.title}</div>
                      <p className="text-[#FEF3C7] leading-relaxed">{slide.body}</p>
                      {slide.mentorTip && (
                        <div className="italic text-[12px] text-[#FEF3C7] font-medium bg-[#2C1D14] px-2.5 py-1.5 rounded-lg border border-[#F59E0B]/40">
                          💡 Tip: {slide.mentorTip.text}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* INTERACTIVE PROMPT CARD (WITH DUOLINGO WORD HINTS) */}
              {currentExercise.sageloAudioText && currentExercise.type !== 'listen_tap' && (
                <div className="p-4 rounded-3xl bg-[#241710] border-2 border-[#3D2619] space-y-2 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-[#D4A373] tracking-wider">
                      Tap any word for translation & IPA hint:
                    </span>
                    <span className="text-[10px] font-mono text-[#14B8A6] bg-[#0F2D28] px-2 py-0.5 rounded-md border border-[#0D9488]/40">
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
                <div className="p-6 rounded-3xl bg-[#241710] border-2 border-[#0D9488]/40 text-center space-y-3 shadow-xs">
                  <span className="text-xs font-black uppercase tracking-wider text-[#14B8A6]">
                    Tap speaker to listen to the phrase:
                  </span>
                  <div className="flex items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        playSageloPhrase(
                          currentExercise.sageloAudioText || currentExercise.correctAnswer,
                          { rate: 0.88, lang: targetCourseLang }
                        )
                      }
                      className="w-16 h-16 rounded-3xl bg-[#0D9488] hover:bg-[#14B8A6] active:bg-[#0F766E] border-b-6 border-[#0F766E] text-white flex items-center justify-center active:translate-y-1 transition-all shadow-md cursor-pointer"
                      title="Normal speed"
                    >
                      <Volume2 className="w-8 h-8 stroke-[2.5]" />
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        playSageloPhrase(
                          currentExercise.sageloAudioText || currentExercise.correctAnswer,
                          { rate: 0.62, lang: targetCourseLang }
                        )
                      }
                      className="w-12 h-12 rounded-2xl bg-[#1E130D] hover:bg-[#2C1D14] active:bg-[#150E09] border-2 border-b-4 border-[#3D2619] hover:border-[#14B8A6] text-[#14B8A6] flex items-center justify-center active:translate-y-0.5 transition-all text-xl font-black shadow-xs cursor-pointer"
                      title="Turtle slow speed"
                    >
                      🐢
                    </button>
                  </div>
                </div>
              )}

              {/* ROOT MORPH BASE CARD */}
              {currentExercise.type === 'root_morph' && currentExercise.rootBase && (
                <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-[#241710] border-2 border-[#059669]/40">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-[#059669] text-white flex items-center justify-center shrink-0 shadow-xs border-b-4 border-[#047857] text-xl font-black">
                      🌱
                    </div>
                    <div>
                      <span className="text-[11px] font-black uppercase text-[#10B981] tracking-wider block">
                        Base Root to Transform:
                      </span>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-lg font-black text-[#FEF3C7]">
                          "{currentExercise.rootBase}"
                        </span>
                        <span className="font-mono text-xs font-bold text-[#10B981] bg-[#064E3B] px-2 py-0.5 rounded-lg border border-[#059669]/60">
                          {getWordPhonetic(currentExercise.rootBase).display}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-[#D4A373] mt-0.5">
                        Select the correct suffix below to build the target word
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => playSageloPhrase(currentExercise.rootBase!)}
                    className="px-3.5 py-2 rounded-xl bg-[#1E130D] border-2 border-[#059669] text-[#10B981] hover:bg-[#064E3B] active:translate-y-0.5 transition-all flex items-center gap-1.5 font-black text-xs shrink-0 cursor-pointer"
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
                          playSageloPhrase(card.sagelo, { lang: targetCourseLang });
                        }}
                        disabled={feedback !== 'idle'}
                        className={`p-4 rounded-3xl border-2 border-b-6 transition-all flex flex-col items-center justify-between text-center gap-3 relative cursor-pointer active:translate-y-1 ${
                          isSelected
                            ? 'bg-[#0D382E] border-[#10B981] text-[#FEF3C7]'
                            : 'bg-[#241710] border-[#3D2619] hover:bg-[#2C1D14] text-[#FEF3C7]'
                        }`}
                      >
                        <span className="text-5xl my-2">{card.emoji}</span>
                        <div className="space-y-0.5">
                          <span className="text-lg font-black block">{card.sagelo}</span>
                          {!isFrenchCourse && (
                            <span className="font-mono text-[10px] font-bold text-[#14B8A6] bg-[#0F2D28] px-2 py-0.5 rounded-md border border-[#0D9488]/40 inline-block">
                              {phon.display}
                            </span>
                          )}
                          <span className="text-xs font-bold text-[#D4A373] block mt-1">
                            {card.english}
                          </span>
                        </div>
                        <div
                          className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center text-xs font-black shrink-0 ${
                            isSelected
                              ? 'border-[#10B981] bg-[#10B981] text-[#150E09]'
                              : 'border-[#3D2619] text-[#D4A373]'
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
                    <span className="text-xs font-black uppercase text-[#D4A373] tracking-wider">
                      Tap a Sagelo word and its matching translation:
                    </span>
                    <span className="text-xs font-black text-[#10B981]">
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
                            className={`w-full p-3.5 rounded-2xl border-2 border-b-4 font-black text-left flex items-center justify-between gap-2 transition-all cursor-pointer ${
                              isMatched
                                ? 'bg-[#064E3B] border-[#059669] text-[#10B981] opacity-80 cursor-default'
                                : isSelected
                                ? 'bg-[#0D382E] border-[#14B8A6] text-[#FEF3C7] scale-102'
                                : pairError && isSelected
                                ? 'bg-[#3D1414] border-[#EF4444] text-[#FCA5A5]'
                                : 'bg-[#241710] border-[#3D2619] hover:bg-[#2C1D14] text-[#FEF3C7]'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span>{item.text}</span>
                              <span className="font-mono text-[10px] font-bold text-[#14B8A6] bg-[#0F2D28] px-1.5 py-0.2 rounded border border-[#0D9488]/40">
                                {phon.display}
                              </span>
                            </div>
                            {isMatched && <Check className="w-4 h-4 text-[#10B981]" />}
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
                            className={`w-full p-3.5 rounded-2xl border-2 border-b-4 font-black text-left flex items-center justify-between gap-2 transition-all cursor-pointer ${
                              isMatched
                                ? 'bg-[#064E3B] border-[#059669] text-[#10B981] opacity-80 cursor-default'
                                : isSelected
                                ? 'bg-[#0D382E] border-[#14B8A6] text-[#FEF3C7] scale-102'
                                : pairError && isSelected
                                ? 'bg-[#3D1414] border-[#EF4444] text-[#FCA5A5]'
                                : 'bg-[#241710] border-[#3D2619] hover:bg-[#2C1D14] text-[#FEF3C7]'
                            }`}
                          >
                            <span>{item.text}</span>
                            {isMatched && <Check className="w-4 h-4 text-[#10B981]" />}
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
                              ? 'bg-[#0D382E] border-[#10B981] text-[#FEF3C7]'
                              : 'bg-[#241710] border-[#3D2619] hover:bg-[#2C1D14] text-[#FEF3C7]'
                          }`}
                        >
                          <span className="text-sm sm:text-base leading-snug">{opt}</span>
                          <span
                            className={`w-7 h-7 rounded-xl border-2 flex items-center justify-center text-xs font-black shrink-0 ${
                              isSelected
                                ? 'border-[#10B981] bg-[#10B981] text-[#150E09]'
                                : 'border-[#3D2619] text-[#D4A373]'
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
                  <div className="min-h-[64px] p-3 rounded-2xl border-2 border-dashed border-[#5A3825] bg-[#150E09] flex flex-wrap items-center gap-2">
                    {bankSelected.length === 0 ? (
                      <span className="text-xs font-bold text-[#D4A373] italic px-2">
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
                          className="px-4 py-2 bg-[#059669] border-2 border-b-4 border-[#047857] text-[#FEF3C7] font-black text-sm rounded-xl active:translate-y-1 transition-all cursor-pointer"
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

                      const isWordEng = isEnglishText(word);

                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            if (feedback !== 'idle' || isExhausted) return;
                            setBankSelected((prev) => [...prev, word]);
                            if (isWordEng) {
                              playEnglishPhrase(word);
                            } else {
                              playSageloPhrase(word, { lang: targetCourseLang });
                            }
                          }}
                          disabled={isExhausted || feedback !== 'idle'}
                          className={`px-3.5 py-2 rounded-xl border-2 border-b-4 font-black text-sm transition-all flex items-center gap-2 active:translate-y-1 cursor-pointer ${
                            isExhausted
                              ? 'bg-[#150E09] border-[#2A1810] text-[#5A3825] cursor-default'
                              : 'bg-[#241710] border-[#3D2619] hover:bg-[#2C1D14] hover:border-[#10B981] text-[#FEF3C7]'
                          }`}
                        >
                          <span>{word}</span>
                          {!isWordEng && !isFrenchCourse && (
                            <span className="font-mono text-[10px] font-bold text-[#14B8A6] bg-[#0F2D28] px-1 py-0.2 rounded border border-[#0D9488]/40">
                              {getWordPhonetic(word).display}
                            </span>
                          )}
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
                            playSageloPhrase(opt, { lang: targetCourseLang });
                          }}
                          className={`p-3.5 rounded-2xl border-2 border-b-4 font-black text-center text-sm transition-all active:translate-y-0.5 cursor-pointer ${
                            blankAnswer === opt
                              ? 'bg-[#0D382E] border-[#10B981] text-[#FEF3C7]'
                              : 'bg-[#241710] border-[#3D2619] hover:bg-[#2C1D14] text-[#FEF3C7]'
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
                      className="w-full p-4 rounded-2xl border-2 border-b-4 border-[#3D2619] focus:border-[#10B981] outline-hidden text-lg font-black text-[#FEF3C7] bg-[#241710] placeholder:text-[#A38260] transition-all"
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
                <span className="text-xs font-black uppercase tracking-wider text-[#10B981]">
                  LESSON COMPLETE!
                </span>
                <h3 className="text-3xl font-black text-[#FEF3C7]">
                  Shanti, Champion!
                </h3>
                <p className="text-xs sm:text-sm font-bold text-[#D4A373]">
                  You successfully mastered {lesson.title}!
                </p>
              </div>

              {/* Stats Tally */}
              <div className="grid grid-cols-3 gap-3 max-w-sm w-full">
                <div className="p-3.5 bg-[#241710] border-2 border-[#F59E0B]/60 rounded-2xl text-center">
                  <div className="text-xs font-black uppercase text-[#F59E0B]">XP Earned</div>
                  <div className="text-2xl font-black text-[#FEF3C7] mt-0.5">+{lesson.xpReward}</div>
                </div>

                <div className="p-3.5 bg-[#241710] border-2 border-[#059669]/60 rounded-2xl text-center">
                  <div className="text-xs font-black uppercase text-[#10B981]">Accuracy</div>
                  <div className="text-2xl font-black text-[#FEF3C7] mt-0.5">
                    {Math.round((correctCount / lesson.exercises.length) * 100)}%
                  </div>
                </div>

                <div className="p-3.5 bg-[#241710] border-2 border-[#0D9488]/60 rounded-2xl text-center">
                  <div className="text-xs font-black uppercase text-[#14B8A6]">Streak</div>
                  <div className="text-2xl font-black text-[#FEF3C7] mt-0.5">
                    {comboStreak > 0 ? `${comboStreak} 🔥` : 'Active'}
                  </div>
                </div>
              </div>

              {/* Introduced Words Badge List */}
              {lesson.wordsIntroduced.length > 0 && (
                <div className="max-w-md w-full bg-[#241710] p-3.5 rounded-2xl border-2 border-[#3D2619] text-left">
                  <div className="text-[11px] font-black uppercase text-[#D4A373] tracking-wider mb-1.5">
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
                          className="px-3 py-1.5 bg-[#1E130D] border-2 border-[#3D2619] hover:border-[#10B981] rounded-xl text-xs font-black text-[#FEF3C7] flex items-center gap-2 transition-all shadow-2xs group cursor-pointer active:translate-y-0.5"
                          title={`Pronounce "${w}" phonetically (${phon.display})`}
                        >
                          <span>{w}</span>
                          <span className="font-mono text-[10px] font-bold text-[#14B8A6] bg-[#0F2D28] px-1.5 py-0.2 rounded border border-[#0D9488]/40">
                            {phon.display}
                          </span>
                          <Volume2 className="w-3.5 h-3.5 text-[#D4A373] group-hover:text-[#10B981]" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* DUOLINGO BOTTOM ACTION BAR */}
          <div className="pt-4 border-t-2 border-[#3D2619] shrink-0">
            {phase === 'intro' && (
              <div className="flex items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={() => setShowRulesDrawer(!showRulesDrawer)}
                  className="text-xs font-black uppercase text-[#D4A373] hover:text-[#FEF3C7] tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Lightbulb className="w-4 h-4 text-[#F59E0B]" />
                  <span>View Lesson Notes</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPhase('practice')}
                  className="px-8 py-3.5 bg-[#059669] hover:bg-[#10B981] border-b-6 border-[#047857] text-[#FEF3C7] font-black uppercase text-sm rounded-2xl active:translate-y-1 transition-all shadow-md flex items-center gap-2 cursor-pointer"
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
                      className="w-full sm:w-auto px-8 py-3.5 bg-[#059669] hover:bg-[#10B981] active:bg-[#047857] border-b-4 border-[#047857] text-[#FEF3C7] font-black uppercase text-sm rounded-2xl active:translate-y-1 transition-all shadow-md disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      Check Answer
                    </button>
                  </div>
                ) : feedback === 'correct' ? (
                  <div className="p-4 rounded-2xl bg-[#064E3B] border-2 border-[#059669] flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in duration-200">
                    <div className="flex items-center gap-3 text-left w-full sm:w-auto">
                      <div className="w-10 h-10 rounded-2xl bg-[#059669] text-white flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-6 h-6 stroke-[3]" />
                      </div>
                      <div className="flex-1">
                        <div className="text-base font-black text-[#FEF3C7] flex items-center gap-2 flex-wrap">
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
                                  {!isFrenchCourse && (
                                    <span className="font-mono text-xs font-black text-[#10B981] bg-[#0F2D28] px-2 py-0.5 rounded-lg border border-[#059669]">
                                      {phonetic}
                                    </span>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => playSageloPhrase(phraseToSpeak, { lang: targetCourseLang })}
                                    className="px-2.5 py-1 rounded-xl bg-[#1E130D] border border-[#059669] text-[#10B981] font-black text-xs flex items-center gap-1 hover:bg-[#2C1D14] active:translate-y-0.5 transition-all shadow-2xs cursor-pointer"
                                    title={`Hear authentic ${isFrenchCourse ? 'French' : 'Sagelo'} pronunciation`}
                                  >
                                    <Volume2 className="w-3.5 h-3.5" />
                                    <span>Listen ({isFrenchCourse ? 'French' : 'Sagelo'})</span>
                                  </button>
                                </div>
                              );
                            } else {
                              return (
                                <button
                                  type="button"
                                  onClick={() => playEnglishPhrase(phraseToSpeak)}
                                  className="px-2.5 py-1 rounded-xl bg-[#1E130D] border border-[#059669] text-[#10B981] font-black text-xs flex items-center gap-1 hover:bg-[#2C1D14] active:translate-y-0.5 transition-all shadow-2xs cursor-pointer"
                                  title="Read solution in proper English"
                                >
                                  <Volume2 className="w-3.5 h-3.5" />
                                  <span>Listen (English)</span>
                                </button>
                              );
                            }
                          })()}
                        </div>
                        <div className="text-xs font-bold text-[#A7F3D0] flex items-center gap-2">
                          <span>{currentExercise?.explanation}</span>
                          {currentExercise?.explanation && (
                            <button
                              type="button"
                              onClick={() => playEnglishPhrase(currentExercise.explanation)}
                              className="text-[#10B981] hover:text-[#A7F3D0] p-0.5 rounded transition-all shrink-0 cursor-pointer"
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
                      className="w-full sm:w-auto px-8 py-3 bg-[#059669] hover:bg-[#10B981] border-b-4 border-[#047857] text-[#FEF3C7] font-black uppercase text-sm rounded-2xl active:translate-y-1 transition-all shadow-sm cursor-pointer"
                    >
                      Continue
                    </button>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-[#3D1414] border-2 border-[#DC2626] flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in duration-200">
                    <div className="flex items-center gap-3 text-left w-full sm:w-auto">
                      <div className="w-10 h-10 rounded-2xl bg-[#DC2626] text-white flex items-center justify-center shrink-0">
                        <AlertCircle className="w-6 h-6 stroke-[3]" />
                      </div>
                      <div className="flex-1">
                        <div className="text-base font-black text-[#FEF3C7] flex items-center gap-2 flex-wrap">
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
                                  {!isFrenchCourse && (
                                    <span className="font-mono text-xs font-black text-[#FCA5A5] bg-[#2A0E0E] px-2 py-0.5 rounded-lg border border-[#DC2626]">
                                      {phonetic}
                                    </span>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => playSageloPhrase(phraseToSpeak, { lang: targetCourseLang })}
                                    className="px-2.5 py-1 rounded-xl bg-[#241710] border border-[#DC2626] text-[#FCA5A5] font-black text-xs flex items-center gap-1 hover:bg-[#2C1D14] active:translate-y-0.5 transition-all shadow-2xs cursor-pointer"
                                    title={`Hear authentic ${isFrenchCourse ? 'French' : 'Sagelo'} pronunciation`}
                                  >
                                    <Volume2 className="w-3.5 h-3.5" />
                                    <span>Listen ({isFrenchCourse ? 'French' : 'Sagelo'})</span>
                                  </button>
                                </div>
                              );
                            } else {
                              return (
                                <button
                                  type="button"
                                  onClick={() => playEnglishPhrase(phraseToSpeak)}
                                  className="px-2.5 py-1 rounded-xl bg-[#241710] border border-[#DC2626] text-[#FCA5A5] font-black text-xs flex items-center gap-1 hover:bg-[#2C1D14] active:translate-y-0.5 transition-all shadow-2xs cursor-pointer"
                                  title="Read solution in proper English"
                                >
                                  <Volume2 className="w-3.5 h-3.5" />
                                  <span>Listen (English)</span>
                                </button>
                              );
                            }
                          })()}
                        </div>
                        <div className="text-xs font-bold text-[#FCA5A5]">
                          {currentExercise?.explanation}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleNextStep}
                      className="w-full sm:w-auto px-8 py-3 bg-[#DC2626] hover:bg-[#EF4444] border-b-4 border-[#991B1B] text-white font-black uppercase text-sm rounded-2xl active:translate-y-1 transition-all shadow-sm cursor-pointer"
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
                className="w-full py-4 bg-[#059669] hover:bg-[#10B981] border-b-6 border-[#047857] text-[#FEF3C7] font-black uppercase text-sm rounded-2xl active:translate-y-1 transition-all shadow-md cursor-pointer"
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
