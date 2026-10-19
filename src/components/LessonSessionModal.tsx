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
  Lightbulb,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { CurriculumLesson } from '../data/sageloCurriculum';
import { playSageloPhrase } from '../utils/sageloAudio';
import { getWordPhonetic, getPhrasePhoneticDisplay } from '../utils/sageloPhonetics';
import { CartoonCharacter, CharacterSpeechBubble } from './CartoonCharacters';

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
  const [comboStreak, setComboStreak] = useState<number>(0);
  const [showRulesDrawer, setShowRulesDrawer] = useState<boolean>(false);

  const currentExercise = lesson.exercises[exerciseIdx];

  // Play audio chime via Web Audio API
  const playChime = (type: 'correct' | 'wrong' | 'complete' | 'streak') => {
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
      } else if (type === 'streak') {
        // High sparkle chime
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
    setShowRulesDrawer(false);
  }, [exerciseIdx]);

  const getAssembledAnswer = (): string => {
    if (!currentExercise) return '';
    if (currentExercise.type === 'multiple_choice' || currentExercise.type === 'root_morph') {
      return selectedOption || '';
    }
    if (currentExercise.type === 'word_bank') {
      return bankSelected.join(' ');
    }
    if (currentExercise.type === 'fill_blank') {
      return blankAnswer.trim();
    }
    return '';
  };

  const handleCheckAnswer = () => {
    if (!currentExercise || feedback !== 'idle') return;
    const ans = getAssembledAnswer();
    const normalize = (s: string) => s.toLowerCase().replace(/[.,!?;:"]/g, '').trim();

    const isMatch = normalize(ans) === normalize(currentExercise.correctAnswer);

    if (isMatch) {
      playChime(comboStreak >= 2 ? 'streak' : 'correct');
      setFeedback('correct');
      setCorrectCount((c) => c + 1);
      setComboStreak((s) => s + 1);

      // Pronounce the word only AFTER the user picks correctly!
      const wordToPronounce =
        currentExercise.sageloAudioText ||
        (currentExercise.options?.some((o) => o === currentExercise.correctAnswer)
          ? currentExercise.correctAnswer
          : null);

      if (wordToPronounce) {
        setTimeout(() => {
          const cleanSagelo = wordToPronounce.split('—')[0].split('-')[0].trim();
          playSageloPhrase(cleanSagelo);
        }, 220);
      }
    } else {
      playChime('wrong');
      setFeedback('wrong');
      setComboStreak(0);
      setHearts((h) => Math.max(0, h - 1));
    }
  };

  const handleNextStep = () => {
    if (exerciseIdx + 1 < lesson.exercises.length) {
      setExerciseIdx((i) => i + 1);
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

  const totalSteps = lesson.teachingSlides.length + lesson.exercises.length;
  const currentStepProgress =
    phase === 'teach'
      ? slideIdx + 1
      : phase === 'practice'
      ? lesson.teachingSlides.length + exerciseIdx + (feedback !== 'idle' ? 1 : 0)
      : totalSteps;
  const progressPercent = Math.round((currentStepProgress / totalSteps) * 100);

  const characterForSlide = lesson.teachingSlides[slideIdx]?.mentorTip?.speaker || 'duo';
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

          {/* Duolingo Thick Rounded Progress Bar */}
          <div className="flex-1 mx-2 sm:mx-6 h-4 bg-[#E5E5E5] rounded-full overflow-hidden p-0.5 relative">
            <div
              className="h-full bg-[#58CC02] rounded-full transition-all duration-300 relative shadow-inner"
              style={{ width: `${progressPercent}%` }}
            >
              <div className="absolute top-0.5 left-2 right-2 h-1 bg-white/30 rounded-full" />
            </div>
          </div>

          {/* Combo Streak & Hearts */}
          <div className="flex items-center gap-3 shrink-0">
            {comboStreak > 1 && (
              <div className="flex items-center gap-1 px-2.5 py-1 bg-[#FFF4E5] border border-[#FFD8A8] rounded-xl text-xs font-black text-[#EA580C] animate-pulse">
                <Flame className="w-4 h-4 fill-[#EA580C] text-[#EA580C]" />
                <span>{comboStreak} combo!</span>
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
          {/* 1. TEACHING GUIDE SLIDES (DUOLINGO CHARACTER INTRO) */}
          {phase === 'teach' && (
            <div className="space-y-6 flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-black uppercase tracking-wider text-[#1CB0F6]">
                    {lesson.numberLabel} • Lesson Intro ({slideIdx + 1}/{lesson.teachingSlides.length})
                  </span>
                  <h3 className="text-2xl font-black text-[#3C3C3C] mt-0.5">
                    {lesson.teachingSlides[slideIdx]?.title}
                  </h3>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-[#58CC02]/15 text-[#58CC02] flex items-center justify-center text-2xl font-black shadow-xs">
                  🦜
                </div>
              </div>

              {/* Character Speech Bubble Intro */}
              <CharacterSpeechBubble
                character={characterForSlide}
                mood="speaking"
                speech={lesson.teachingSlides[slideIdx]?.mentorTip?.text || lesson.teachingSlides[slideIdx]?.body}
                subtext={`Lesson Mentor: ${characterForSlide.toUpperCase()}`}
              />

              {/* Explanatory Body Card */}
              <div className="text-sm sm:text-base text-[#4B4B4B] leading-relaxed bg-[#F7F7F7] p-5 rounded-2xl border-2 border-[#E5E5E5]">
                {lesson.teachingSlides[slideIdx]?.body}
              </div>

              {/* Interactive Audio Examples */}
              {lesson.teachingSlides[slideIdx]?.examples &&
                lesson.teachingSlides[slideIdx].examples!.length > 0 && (
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black uppercase text-[#AFAFAF] tracking-wider">
                        Tap words to hear authentic phonetic pronunciation:
                      </h4>
                      <span className="text-[10px] font-bold text-[#0284C7] bg-[#E0F2FE] px-2 py-0.5 rounded-md border border-[#BAE6FD]">
                        Bantu Phonetics
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {lesson.teachingSlides[slideIdx].examples!.map((ex, i) => (
                        <button
                          key={i}
                          onClick={() => playSageloPhrase(ex.sagelo)}
                          className="p-3.5 rounded-2xl bg-white border-2 border-b-4 border-[#E5E5E5] hover:border-[#1CB0F6] active:translate-y-1 text-left flex items-center justify-between gap-3 transition-all group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-[#1CB0F6] group-hover:bg-[#0284C7] text-white flex items-center justify-center shrink-0 shadow-xs border-b-2 border-[#1899D6] transition-colors">
                              <Volume2 className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm font-black text-[#3C3C3C]">
                                  {ex.sagelo}
                                </span>
                                <span className="font-mono text-[11px] font-bold text-[#0284C7] bg-[#E0F2FE] px-1.5 py-0.5 rounded-md border border-[#BAE6FD]">
                                  {getPhrasePhoneticDisplay(ex.sagelo)}
                                </span>
                              </div>
                              <div className="text-xs font-bold text-[#777777] mt-0.5">
                                {ex.english}
                              </div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          )}

          {/* 2. DUOLINGO INTERACTIVE PRACTICE PHASE */}
          {phase === 'practice' && currentExercise && (() => {
            const isAnswerWordSecret = Boolean(
              feedback === 'idle' &&
              (
                currentExercise.type === 'root_morph' ||
                currentExercise.prompt.toLowerCase().includes('build') ||
                currentExercise.prompt.toLowerCase().includes('construct') ||
                currentExercise.prompt.toLowerCase().includes('form') ||
                currentExercise.prompt.toLowerCase().includes('what is the') ||
                currentExercise.prompt.toLowerCase().includes('how do you') ||
                currentExercise.prompt.toLowerCase().includes('adjective') ||
                currentExercise.prompt.toLowerCase().includes('adverb') ||
                currentExercise.prompt.toLowerCase().includes('verb') ||
                (currentExercise.sageloAudioText &&
                  currentExercise.correctAnswer.toLowerCase().includes(currentExercise.sageloAudioText.toLowerCase()))
              )
            );

            return (
              <div className="space-y-6 flex-1">
                {/* Question Header & Character Prompt */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <CartoonCharacter
                      character={characterForExercise}
                      mood={feedback === 'correct' ? 'celebrating' : feedback === 'wrong' ? 'encouraging' : 'speaking'}
                      size="md"
                      animate={true}
                    />

                    <div className="flex-1 space-y-1">
                      <span className="text-[11px] font-black uppercase tracking-wider text-[#AFAFAF]">
                        Question {exerciseIdx + 1} of {lesson.exercises.length}
                      </span>
                      <h3 className="text-xl sm:text-2xl font-black text-[#3C3C3C] leading-snug">
                        {currentExercise.prompt}
                      </h3>
                    </div>
                  </div>

                  {/* Lesson Rule Drawer Toggle */}
                  <button
                    onClick={() => setShowRulesDrawer(!showRulesDrawer)}
                    className={`px-3 py-1.5 rounded-xl border-2 font-black text-xs flex items-center gap-1.5 transition-all shrink-0 ${
                      showRulesDrawer
                        ? 'bg-[#FEF08A] border-[#EAB308] text-[#854D0E]'
                        : 'bg-[#F7F7F7] border-[#E5E5E5] text-[#777777] hover:bg-[#FFFBEB] hover:border-[#FDE68A] hover:text-[#B45309]'
                    }`}
                    title="View lesson formulas & notes"
                  >
                    <Lightbulb className="w-4 h-4 text-[#EAB308]" />
                    <span className="hidden sm:inline">{showRulesDrawer ? 'Hide Rules' : 'Lesson Tip'}</span>
                    {showRulesDrawer ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {/* Collapsible Rules Drawer */}
                {showRulesDrawer && (
                  <div className="p-4 rounded-2xl bg-[#FFFBEB] border-2 border-[#FDE68A] text-[#78350F] space-y-3 animate-in fade-in duration-150">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                        <Lightbulb className="w-4 h-4 text-[#D97706]" />
                        Lesson {lesson.numberLabel} Rules & Formulas
                      </span>
                    </div>
                    {lesson.teachingSlides.map((slide, sIdx) => (
                      <div key={sIdx} className="space-y-2 text-xs sm:text-sm bg-white/70 p-3 rounded-xl border border-[#FDE68A]">
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

                {/* PROMPT CARD:
                    If the exercise asks to construct or pick a target word, DO NOT reveal its spelling before picking!
                    Show the base root if available, without the spoiler ending! */}
                {isAnswerWordSecret ? (
                  currentExercise.rootBase ? (
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
                            Select the correct ending below to construct the target word
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => playSageloPhrase(currentExercise.rootBase!)}
                        className="px-3.5 py-2 rounded-xl bg-white border-2 border-[#86EFAC] text-[#166534] hover:bg-[#DCFCE7] active:translate-y-0.5 transition-all flex items-center gap-1.5 font-black text-xs shrink-0"
                        title="Hear base root phonetically"
                      >
                        <Volume2 className="w-4 h-4" />
                        <span className="hidden sm:inline">Hear Root</span>
                      </button>
                    </div>
                  ) : (
                    <div className="p-3.5 rounded-2xl bg-[#F7F7F7] border-2 border-[#E5E5E5] flex items-center gap-3 text-xs font-bold text-[#777777]">
                      <span className="text-lg">🎯</span>
                      <span>Apply the grammatical vowel suffix (-a, -e, -i, -o, -u) or adverb rule taught in the lesson slides.</span>
                    </div>
                  )
                ) : (
                  /* Non-spoiler audio prompt (e.g. translating a given Sagelo sentence) */
                  currentExercise.sageloAudioText && (
                    <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-[#F7F7F7] border-2 border-[#E5E5E5]">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => playSageloPhrase(currentExercise.sageloAudioText!)}
                          className="w-12 h-12 rounded-2xl bg-[#1CB0F6] hover:bg-[#24B8FB] border-b-4 border-[#1899D6] text-white flex items-center justify-center shrink-0 active:translate-y-1 transition-all shadow-sm"
                          title="Play audio phrase phonetically"
                        >
                          <Volume2 className="w-6 h-6" />
                        </button>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-lg font-black text-[#3C3C3C]">
                              "{currentExercise.sageloAudioText}"
                            </span>
                            <span className="font-mono text-xs font-bold text-[#0284C7] bg-[#E0F2FE] px-2 py-0.5 rounded-lg border border-[#BAE6FD]">
                              {getPhrasePhoneticDisplay(currentExercise.sageloAudioText)}
                            </span>
                          </div>
                          <p className="text-xs font-bold text-[#777777] mt-0.5">
                            Tap speaker to repeat phonetic speech
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                )}

                {/* MULTIPLE CHOICE & ROOT MORPH TILES */}
                {(currentExercise.type === 'multiple_choice' || currentExercise.type === 'root_morph') &&
                  currentExercise.options && (
                    <div className="grid grid-cols-1 gap-2.5">
                      {currentExercise.options.map((opt, idx) => {
                        const isSelected = selectedOption === opt;
                        const letter = ['A', 'B', 'C', 'D'][idx] || idx + 1;
                        return (
                          <button
                            key={idx}
                            onClick={() => {
                              if (feedback !== 'idle') return;
                              setSelectedOption(opt);
                              // Do NOT speak before checking - no spoilers!
                            }}
                            disabled={feedback !== 'idle'}
                            className={`p-4 rounded-2xl border-2 border-b-4 text-left transition-all flex items-center justify-between gap-4 font-black ${
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

                {/* WORD BANK TILES */}
                {currentExercise.type === 'word_bank' && (
                <div className="space-y-4">
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
                          onClick={() => {
                            if (feedback !== 'idle' || isExhausted) return;
                            setBankSelected((prev) => [...prev, word]);
                            playSageloPhrase(word);
                          }}
                          disabled={isExhausted || feedback !== 'idle'}
                          className={`px-3.5 py-2 rounded-xl border-2 border-b-4 font-black text-sm transition-all flex items-center gap-2 ${
                            isExhausted
                              ? 'bg-[#E5E5E5] border-[#D0D0D0] text-[#AFAFAF] cursor-default'
                              : 'bg-white border-[#E5E5E5] hover:bg-[#F7F7F7] text-[#3C3C3C] active:translate-y-1'
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
                    <div className="grid grid-cols-3 gap-3">
                      {currentExercise.options.map((opt, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            if (feedback !== 'idle') return;
                            setBlankAnswer(opt);
                            playSageloPhrase(opt);
                          }}
                          className={`p-3.5 rounded-2xl border-2 border-b-4 font-black text-center text-sm transition-all ${
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
                      placeholder="Type the Sagelo root or word here..."
                      disabled={feedback !== 'idle'}
                      className="w-full p-4 rounded-2xl border-2 border-b-4 border-[#E5E5E5] focus:border-[#1CB0F6] outline-hidden text-lg font-black text-[#3C3C3C] bg-white transition-all"
                    />
                  )}
                </div>
              )}
            </div>
            );
          })()}

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
            {phase === 'teach' && (
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setPhase('practice')}
                  className="text-xs font-black uppercase text-[#AFAFAF] hover:text-[#3C3C3C] tracking-wider transition-colors"
                >
                  Skip Guide
                </button>
                <button
                  onClick={() => {
                    if (slideIdx + 1 < lesson.teachingSlides.length) {
                      setSlideIdx((s) => s + 1);
                    } else {
                      setPhase('practice');
                    }
                  }}
                  className="px-8 py-3.5 bg-[#58CC02] hover:bg-[#61E002] border-b-4 border-[#46A302] text-white font-black uppercase text-sm rounded-2xl active:translate-y-1 transition-all shadow-md flex items-center gap-2"
                >
                  <span>{slideIdx + 1 < lesson.teachingSlides.length ? 'Next Guide Slide' : 'Start Practice'}</span>
                  <ArrowRight className="w-4 h-4 stroke-[3]" />
                </button>
              </div>
            )}

            {phase === 'practice' && (
              <>
                {feedback === 'idle' ? (
                  <div className="flex justify-end">
                    <button
                      onClick={handleCheckAnswer}
                      disabled={
                        (currentExercise?.type === 'word_bank' && bankSelected.length === 0) ||
                        ((currentExercise?.type === 'multiple_choice' || currentExercise?.type === 'root_morph') && !selectedOption) ||
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
                          <span>Great job! Shanti!</span>
                          {(currentExercise?.sageloAudioText || currentExercise?.correctAnswer) && (() => {
                            const word = (currentExercise.sageloAudioText || currentExercise.correctAnswer).split('—')[0].split('-')[0].trim();
                            const phonetic = getPhrasePhoneticDisplay(word);
                            return (
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-mono text-xs font-black text-[#166534] bg-white px-2 py-0.5 rounded-lg border border-[#86EFAC]">
                                  {phonetic}
                                </span>
                                <button
                                  onClick={() => playSageloPhrase(word)}
                                  className="px-2.5 py-1 rounded-xl bg-white border border-[#86EFAC] text-[#166534] font-black text-xs flex items-center gap-1 hover:bg-[#F0FDF4] active:translate-y-0.5 transition-all shadow-2xs"
                                  title="Hear pronunciation again"
                                >
                                  <Volume2 className="w-3.5 h-3.5" />
                                  <span>Listen</span>
                                </button>
                              </div>
                            );
                          })()}
                        </div>
                        <div className="text-xs font-bold text-[#15803D]">
                          {currentExercise?.explanation}
                        </div>
                      </div>
                    </div>
                    <button
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
                          {(currentExercise?.sageloAudioText || currentExercise?.correctAnswer) && (() => {
                            const word = (currentExercise.sageloAudioText || currentExercise.correctAnswer).split('—')[0].split('-')[0].trim();
                            const phonetic = getPhrasePhoneticDisplay(word);
                            return (
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-mono text-xs font-black text-[#991B1B] bg-white px-2 py-0.5 rounded-lg border border-[#FCA5A5]">
                                  {phonetic}
                                </span>
                                <button
                                  onClick={() => playSageloPhrase(word)}
                                  className="px-2.5 py-1 rounded-xl bg-white border border-[#FCA5A5] text-[#991B1B] font-black text-xs flex items-center gap-1 hover:bg-[#FFF1F2] active:translate-y-0.5 transition-all shadow-2xs"
                                  title="Hear correct pronunciation"
                                >
                                  <Volume2 className="w-3.5 h-3.5" />
                                  <span>Listen</span>
                                </button>
                              </div>
                            );
                          })()}
                        </div>
                        <div className="text-xs font-bold text-[#B91C1C]">
                          {currentExercise?.explanation}
                        </div>
                      </div>
                    </div>
                    <button
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
