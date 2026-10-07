import React, { useState, useEffect } from 'react';
import {
  Volume2,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  X,
  BookOpen,
  Award,
  RotateCcw,
  Heart,
  Flame,
  Star,
  Sparkles,
} from 'lucide-react';
import { CurriculumLesson } from '../data/sageloCurriculum';
import { playSageloPhrase } from '../utils/sageloAudio';

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
  const [phase, setPhase] = useState<'teach' | 'practice' | 'summary'>('teach');
  const [slideIdx, setSlideIdx] = useState(0);
  const [exerciseIdx, setExerciseIdx] = useState(0);

  // Practice state
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [bankSelected, setBankSelected] = useState<string[]>([]);
  const [blankAnswer, setBlankAnswer] = useState<string>('');
  const [feedback, setFeedback] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [hearts, setHearts] = useState<number>(5);
  const [correctCount, setCorrectCount] = useState<number>(0);

  const currentExercise = lesson.exercises[exerciseIdx];

  // Play audio chime via Web Audio API
  const playChime = (type: 'correct' | 'wrong' | 'complete') => {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
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
      } else if (type === 'wrong') {
        // Soft low bonk
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
        // Fanfare chord
        const now = ctx.currentTime;
        [523.25, 659.25, 783.99, 1046.5].forEach(freq => {
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
    } catch {
      // AudioContext unavailable
    }
  };

  // Reset exercise choices upon exercise change
  useEffect(() => {
    setSelectedOption(null);
    setBankSelected([]);
    setBlankAnswer('');
    setFeedback('idle');
  }, [exerciseIdx]);

  // Autoplay prompt audio when exercise loads
  useEffect(() => {
    if (phase === 'practice' && currentExercise?.sageloAudioText) {
      const timer = setTimeout(() => {
        playSageloPhrase(currentExercise.sageloAudioText!, {
          useVoice: false,
        });
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [exerciseIdx, phase, currentExercise]);

  const getAssembledAnswer = (): string => {
    if (!currentExercise) return '';
    if (currentExercise.type === 'multiple_choice') {
      return selectedOption || '';
    }
    if (currentExercise.type === 'word_bank') {
      return bankSelected.join(' ');
    }
    if (currentExercise.type === 'fill_blank') {
      return blankAnswer.trim();
    }
    if (currentExercise.type === 'root_morph') {
      return selectedOption || '';
    }
    return '';
  };

  const handleCheckAnswer = () => {
    if (!currentExercise || feedback !== 'idle') return;
    const ans = getAssembledAnswer();
    const normalize = (s: string) =>
      s.toLowerCase().replace(/[.,!?;:"]/g, '').trim();

    const isMatch = normalize(ans) === normalize(currentExercise.correctAnswer);

    if (isMatch) {
      playChime('correct');
      setFeedback('correct');
      setCorrectCount(c => c + 1);
    } else {
      playChime('wrong');
      setFeedback('wrong');
      setHearts(h => Math.max(0, h - 1));
    }
  };

  const handleNextStep = () => {
    if (exerciseIdx + 1 < lesson.exercises.length) {
      setExerciseIdx(i => i + 1);
    } else {
      playChime('complete');
      setPhase('summary');
    }
  };

  const totalSteps = lesson.teachingSlides.length + lesson.exercises.length;
  const currentStepProgress =
    phase === 'teach'
      ? slideIdx + 1
      : phase === 'practice'
      ? lesson.teachingSlides.length + exerciseIdx + 1
      : totalSteps;
  const progressPercent = Math.round((currentStepProgress / totalSteps) * 100);

  return (
    <div className="fixed inset-0 z-50 bg-[#3C3C3C]/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-6 overflow-y-auto">
      <div className="bg-white border-2 border-b-6 border-[#E5E5E5] rounded-3xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[94vh] shadow-2xl">
        {/* DUOLINGO TOP STATUS BAR */}
        <div className="px-6 py-4 border-b-2 border-[#E5E5E5] flex items-center justify-between gap-4 bg-white shrink-0">
          {/* Close X */}
          <button
            onClick={onClose}
            className="text-[#AFAFAF] hover:text-[#3C3C3C] font-black text-xl p-1 transition-colors"
            aria-label="Exit lesson"
          >
            <X className="w-6 h-6 stroke-[3]" />
          </button>

          {/* Duolingo Thick Rounded Progress Bar */}
          <div className="flex-1 mx-2 sm:mx-6 h-4 bg-[#E5E5E5] rounded-full overflow-hidden p-0.5 relative">
            <div
              className="h-full bg-[#58CC02] rounded-full transition-all duration-300 relative shadow-inner"
              style={{ width: `${progressPercent}%` }}
            >
              <div className="absolute top-0.5 left-2 right-2 h-1 bg-white/30 rounded-full" />
            </div>
          </div>

          {/* Duolingo Chi / Hearts Counter */}
          <div className="flex items-center gap-1.5 font-mono-num font-black text-base text-[#FF4B4B] shrink-0">
            <Heart className="w-6 h-6 fill-[#FF4B4B] text-[#FF4B4B] animate-pulse" />
            <span>{hearts}</span>
          </div>
        </div>

        {/* CONTENT VIEWPORT */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
          {/* 1. TEACHING GUIDE SLIDES */}
          {phase === 'teach' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-black uppercase tracking-wider text-[#1CB0F6]">
                    {lesson.numberLabel} • Guidebook Slide {slideIdx + 1} of{' '}
                    {lesson.teachingSlides.length}
                  </span>
                  <h3 className="text-2xl font-black text-[#3C3C3C] mt-1">
                    {lesson.teachingSlides[slideIdx].title}
                  </h3>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-[#58CC02]/15 text-[#58CC02] flex items-center justify-center text-2xl font-black">
                  📖
                </div>
              </div>

              {/* Slide Explanatory Body */}
              <div className="text-base text-[#4B4B4B] leading-relaxed bg-[#F7F7F7] p-5 rounded-2xl border-2 border-[#E5E5E5]">
                {lesson.teachingSlides[slideIdx]?.body}
              </div>

              {/* Audio Examples Card */}
              {lesson.teachingSlides[slideIdx]?.examples &&
                lesson.teachingSlides[slideIdx].examples!.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-black uppercase text-[#AFAFAF] tracking-wider">
                    Tap to hear pronunciation with 3:2 tone interval:
                  </h4>
                  <div className="grid grid-cols-1 gap-2.5">
                    {lesson.teachingSlides[slideIdx].examples!.map((ex, i) => (
                      <button
                        key={i}
                        onClick={() =>
                          playSageloPhrase(ex.sagelo, { useVoice: false })
                        }
                        className="p-4 rounded-2xl bg-white border-2 border-b-4 border-[#E5E5E5] hover:border-[#1CB0F6] active:translate-y-1 text-left flex items-center justify-between gap-4 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-[#1CB0F6] text-white flex items-center justify-center shrink-0 shadow-sm border-b-2 border-[#1899D6]">
                            <Volume2 className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="text-base font-black text-[#3C3C3C]">
                              {ex.sagelo}
                            </div>
                            <div className="text-xs font-bold text-[#777777]">
                              {ex.english}
                            </div>
                          </div>
                        </div>
                        {ex.note && (
                          <span className="text-[11px] font-bold text-[#1CB0F6] bg-[#1CB0F6]/10 px-2.5 py-1 rounded-xl">
                            {ex.note}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Cultural Elder Insight */}
              {lesson.teachingSlides[slideIdx]?.mentorTip && (
                <div className="p-4 rounded-2xl bg-[#FFFBEB] border-2 border-[#FDE68A] flex items-start gap-3">
                  <span className="text-2xl select-none">💡</span>
                  <div className="space-y-0.5">
                    <div className="text-xs font-black uppercase text-[#92400E]">
                      Elder Tip ({lesson.teachingSlides[slideIdx].mentorTip.speaker})
                    </div>
                    <p className="text-xs font-bold text-[#78350F] leading-relaxed">
                      {lesson.teachingSlides[slideIdx].mentorTip.text}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 2. DUOLINGO INTERACTIVE PRACTICE PHASE */}
          {phase === 'practice' && currentExercise && (
            <div className="space-y-6">
              {/* Question Header */}
              <div className="space-y-2">
                <span className="text-xs font-black uppercase tracking-wider text-[#AFAFAF]">
                  Exercise {exerciseIdx + 1} of {lesson.exercises.length}
                </span>
                <h3 className="text-2xl font-black text-[#3C3C3C]">
                  {currentExercise.prompt}
                </h3>
              </div>

              {/* Dialogue Balloon / Speaker Card */}
              {currentExercise.sageloAudioText && (
                <div className="flex items-start gap-4 p-5 rounded-2xl bg-[#F7F7F7] border-2 border-[#E5E5E5]">
                  <button
                    onClick={() =>
                      playSageloPhrase(currentExercise.sageloAudioText!, {
                        useVoice: false,
                      })
                    }
                    className="w-14 h-14 rounded-2xl bg-[#1CB0F6] hover:bg-[#24B8FB] border-b-4 border-[#1899D6] text-white flex items-center justify-center shrink-0 active:translate-y-1 transition-all shadow-sm"
                    title="Play audio phrase"
                  >
                    <Volume2 className="w-7 h-7" />
                  </button>

                  <div className="space-y-1">
                    <p className="text-lg font-black text-[#3C3C3C]">
                      "{currentExercise.sageloAudioText}"
                    </p>
                    <p className="text-xs font-bold text-[#777777]">
                      Tap the blue speaker to repeat speech
                    </p>
                  </div>
                </div>
              )}

              {/* MULTIPLE CHOICE TILES */}
              {(currentExercise.type === 'multiple_choice' ||
                currentExercise.type === 'root_morph') &&
                currentExercise.options && (
                  <div className="grid grid-cols-1 gap-3">
                    {currentExercise.options.map((opt, idx) => {
                      const isSelected = selectedOption === opt;
                      const letter = ['A', 'B', 'C', 'D'][idx] || idx + 1;
                      return (
                        <button
                          key={idx}
                          onClick={() => {
                            if (feedback !== 'idle') return;
                            setSelectedOption(opt);
                            if (opt.length < 25) {
                              playSageloPhrase(opt, { useVoice: false });
                            }
                          }}
                          disabled={feedback !== 'idle'}
                          className={`p-4 rounded-2xl border-2 border-b-4 text-left transition-all flex items-center justify-between gap-4 font-black ${
                            isSelected
                              ? 'bg-[#DDF4FF] border-[#1CB0F6] text-[#1CB0F6]'
                              : 'bg-white border-[#E5E5E5] hover:bg-[#F7F7F7] text-[#3C3C3C]'
                          }`}
                        >
                          <span className="text-base">{opt}</span>
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

              {/* WORD BANK TILES */}
              {currentExercise.type === 'word_bank' && (
                <div className="space-y-5">
                  {/* Selected Answer Slot */}
                  <div className="min-h-[64px] p-3 rounded-2xl border-2 border-dashed border-[#AFAFAF] bg-[#F7F7F7] flex flex-wrap items-center gap-2">
                    {bankSelected.length === 0 ? (
                      <span className="text-xs font-bold text-[#AFAFAF] italic px-2">
                        Tap words below to arrange your translation...
                      </span>
                    ) : (
                      bankSelected.map((word, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            if (feedback !== 'idle') return;
                            setBankSelected(prev =>
                              prev.filter((_, i) => i !== idx)
                            );
                          }}
                          className="px-4 py-2 bg-white border-2 border-b-4 border-[#1CB0F6] text-[#1CB0F6] font-black text-sm rounded-xl active:translate-y-1 transition-all"
                        >
                          {word}
                        </button>
                      ))
                    )}
                  </div>

                  {/* Word Bank Pool */}
                  <div className="flex flex-wrap gap-2.5 pt-2">
                    {currentExercise.wordBankTiles?.map((word, idx) => {
                      const countInAnswer = bankSelected.filter(
                        w => w === word
                      ).length;
                      const countInPool = currentExercise.wordBankTiles!.filter(
                        w => w === word
                      ).length;
                      const isExhausted = countInAnswer >= countInPool;

                      return (
                        <button
                          key={idx}
                          onClick={() => {
                            if (feedback !== 'idle' || isExhausted) return;
                            setBankSelected(prev => [...prev, word]);
                            playSageloPhrase(word, { useVoice: false });
                          }}
                          disabled={isExhausted || feedback !== 'idle'}
                          className={`px-4 py-2.5 rounded-xl border-2 border-b-4 font-black text-sm transition-all ${
                            isExhausted
                              ? 'bg-[#E5E5E5] border-[#D0D0D0] text-[#AFAFAF] cursor-default'
                              : 'bg-white border-[#E5E5E5] hover:bg-[#F7F7F7] text-[#3C3C3C] active:translate-y-1'
                          }`}
                        >
                          {word}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* FILL IN THE BLANK */}
              {currentExercise.type === 'fill_blank' && (
                <div className="space-y-4">
                  <input
                    type="text"
                    value={blankAnswer}
                    onChange={e => setBlankAnswer(e.target.value)}
                    placeholder="Type the Sagelo root or word here..."
                    disabled={feedback !== 'idle'}
                    className="w-full p-4 rounded-2xl border-2 border-b-4 border-[#E5E5E5] focus:border-[#1CB0F6] outline-none text-lg font-black text-[#3C3C3C] bg-white transition-all"
                  />
                </div>
              )}
            </div>
          )}

          {/* 3. LESSON SUMMARY VICTORY SCREEN */}
          {phase === 'summary' && (
            <div className="py-8 text-center space-y-6">
              <div className="w-24 h-24 rounded-3xl bg-[#FFC800]/20 text-[#FFC800] border-4 border-[#FFC800] flex items-center justify-center mx-auto text-5xl shadow-md">
                🏆
              </div>

              <div className="space-y-2">
                <span className="text-xs font-black uppercase text-[#58CC02] tracking-wider">
                  ● LESSON COMPLETE!
                </span>
                <h3 className="text-3xl font-black text-[#3C3C3C]">
                  You finished {lesson.numberLabel}!
                </h3>
                <p className="text-sm font-bold text-[#777777]">
                  "{lesson.title}"
                </p>
              </div>

              {/* 3 Stats Badges */}
              <div className="grid grid-cols-3 gap-3 max-w-md mx-auto">
                <div className="p-4 rounded-2xl bg-white border-2 border-b-4 border-[#E5E5E5]">
                  <div className="text-[11px] font-black uppercase text-[#AFAFAF]">
                    TOTAL XP
                  </div>
                  <div className="text-2xl font-black text-[#FF9600]">
                    +{lesson.xpReward}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white border-2 border-b-4 border-[#E5E5E5]">
                  <div className="text-[11px] font-black uppercase text-[#AFAFAF]">
                    ACCURACY
                  </div>
                  <div className="text-2xl font-black text-[#58CC02]">
                    {Math.round(
                      (correctCount / Math.max(1, lesson.exercises.length)) * 100
                    )}
                    %
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white border-2 border-b-4 border-[#E5E5E5]">
                  <div className="text-[11px] font-black uppercase text-[#AFAFAF]">
                    ROOTS
                  </div>
                  <div className="text-2xl font-black text-[#1CB0F6]">
                    +{lesson.wordsIntroduced.length}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* DUOLINGO SIGNATURE BOTTOM ACTION SHELF */}
        <div
          className={`px-6 py-4 border-t-2 transition-all duration-150 shrink-0 ${
            feedback === 'correct'
              ? 'bg-[#D7FFB8] border-[#B8F28B]'
              : feedback === 'wrong'
              ? 'bg-[#FFDFE0] border-[#FFC1C3]'
              : 'bg-white border-[#E5E5E5]'
          }`}
        >
          {phase === 'teach' && (
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs font-bold text-[#777777]">
                Ready for exercises?
              </span>
              <button
                onClick={() => {
                  if (slideIdx + 1 < lesson.teachingSlides.length) {
                    setSlideIdx(i => i + 1);
                  } else {
                    setPhase('practice');
                  }
                }}
                className="bg-[#58CC02] hover:bg-[#61E002] border-b-4 border-[#46A302] text-white font-black uppercase text-sm px-8 py-3.5 rounded-2xl active:translate-y-1 transition-all flex items-center gap-2"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4 stroke-[3]" />
              </button>
            </div>
          )}

          {phase === 'practice' && (
            <div className="flex items-center justify-between gap-4">
              {feedback === 'idle' ? (
                <>
                  <button
                    onClick={() => setPhase('teach')}
                    className="text-xs font-bold text-[#AFAFAF] hover:text-[#3C3C3C] uppercase tracking-wider"
                  >
                    Review Guidebook
                  </button>

                  <button
                    onClick={handleCheckAnswer}
                    disabled={!getAssembledAnswer()}
                    className="bg-[#58CC02] hover:bg-[#61E002] disabled:opacity-40 disabled:cursor-not-allowed border-b-4 border-[#46A302] text-white font-black uppercase text-sm px-8 py-3.5 rounded-2xl active:translate-y-1 transition-all"
                  >
                    Check
                  </button>
                </>
              ) : feedback === 'correct' ? (
                <>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-white text-[#58CC02] flex items-center justify-center text-2xl font-black shadow-xs">
                      ✓
                    </div>
                    <div>
                      <h4 className="text-lg font-black text-[#58A700]">
                        Amazing!
                      </h4>
                      <p className="text-xs font-bold text-[#46A302]">
                        {currentExercise.explanation}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleNextStep}
                    className="bg-[#58CC02] hover:bg-[#61E002] border-b-4 border-[#46A302] text-white font-black uppercase text-sm px-8 py-3.5 rounded-2xl active:translate-y-1 transition-all"
                  >
                    Continue
                  </button>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-white text-[#FF4B4B] flex items-center justify-center text-2xl font-black shadow-xs">
                      ✕
                    </div>
                    <div>
                      <h4 className="text-lg font-black text-[#EA2B2B]">
                        Correct solution:
                      </h4>
                      <p className="text-xs font-bold text-[#B91C1C]">
                        {currentExercise.correctAnswer}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleNextStep}
                    className="bg-[#FF4B4B] hover:bg-[#EA2B2B] border-b-4 border-[#DC2626] text-white font-black uppercase text-sm px-8 py-3.5 rounded-2xl active:translate-y-1 transition-all"
                  >
                    Got It
                  </button>
                </>
              )}
            </div>
          )}

          {phase === 'summary' && (
            <button
              onClick={() =>
                onComplete({
                  lessonId: lesson.id,
                  score: Math.round(
                    (correctCount / Math.max(1, lesson.exercises.length)) * 100
                  ),
                  xpEarned: lesson.xpReward,
                  newWords: lesson.wordsIntroduced,
                })
              }
              className="w-full py-4 bg-[#58CC02] hover:bg-[#61E002] border-b-4 border-[#46A302] text-white font-black uppercase text-sm rounded-2xl active:translate-y-1 transition-all"
            >
              Continue
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
