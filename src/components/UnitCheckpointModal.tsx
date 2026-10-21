import React, { useState, useEffect } from 'react';
import {
  X,
  Volume2,
  CheckCircle2,
  AlertCircle,
  Award,
  Sparkles,
  ShieldCheck,
  RotateCcw,
  Star,
  Flame,
  Heart,
  ChevronRight,
  Download,
} from 'lucide-react';
import { UnitCheckpoint } from '../data/sageloCurriculum';
import { CartoonCharacter } from './CartoonCharacters';
import { playSageloPhrase, playEnglishPhrase, isEnglishText } from '../utils/sageloAudio';
import { getPhrasePhoneticDisplay } from '../utils/sageloPhonetics';
import { InteractiveDuolingoSentence } from './InteractiveDuolingoSentence';

interface UnitCheckpointModalProps {
  checkpoint: UnitCheckpoint;
  isOpen: boolean;
  onClose: () => void;
  onComplete: (checkpointId: string, xpEarned: number, isFinalGraduation?: boolean) => void;
  userName?: string;
  userSageloName?: string;
}

export const UnitCheckpointModal: React.FC<UnitCheckpointModalProps> = ({
  checkpoint,
  isOpen,
  onClose,
  onComplete,
  userName = 'Learner',
  userSageloName = 'Misaga Learner',
}) => {
  const isFrenchCourse =
    checkpoint.id.startsWith('cp-fr-') ||
    checkpoint.unitId.startsWith('fr-') ||
    checkpoint.unitId.includes('fr');
  const targetCourseLang: 'sagelo' | 'french' = isFrenchCourse ? 'french' : 'sagelo';

  const [phase, setPhase] = useState<'intro' | 'exam' | 'passed' | 'failed'>('intro');
  const [questionIdx, setQuestionIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [bankSelected, setBankSelected] = useState<string[]>([]);
  const [blankAnswer, setBlankAnswer] = useState<string>('');
  const [feedback, setFeedback] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [lives, setLives] = useState(3);
  const [correctCount, setCorrectCount] = useState(0);

  const currentQ = checkpoint.questions[questionIdx];

  // Play audio chime via Web Audio API
  const playChime = (type: 'correct' | 'wrong' | 'complete' | 'fanfare') => {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      if (type === 'correct') {
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
      } else if (type === 'fanfare') {
        // Regal Graduation Fanfare
        const now = ctx.currentTime;
        const notes = [392.0, 523.25, 659.25, 783.99, 1046.5];
        notes.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + i * 0.12);
          gain.gain.setValueAtTime(0.25, now + i * 0.12);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.9);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + i * 0.12);
          osc.stop(now + i * 0.12 + 1.0);
        });
      }
    } catch {
      // AudioContext unavailable
    }
  };

  useEffect(() => {
    if (isOpen) {
      setPhase('intro');
      setQuestionIdx(0);
      setSelectedOption(null);
      setBankSelected([]);
      setBlankAnswer('');
      setFeedback('idle');
      setLives(3);
      setCorrectCount(0);
    }
  }, [isOpen, checkpoint]);

  // Reset exercise choices upon next question
  useEffect(() => {
    setSelectedOption(null);
    setBankSelected([]);
    setBlankAnswer('');
    setFeedback('idle');
  }, [questionIdx]);

  if (!isOpen) return null;

  const getAssembledAnswer = (): string => {
    if (!currentQ) return '';
    if (currentQ.type === 'multiple_choice' || currentQ.type === 'root_morph') {
      return selectedOption || '';
    }
    if (currentQ.type === 'word_bank') {
      return bankSelected.join(' ');
    }
    if (currentQ.type === 'fill_blank') {
      return blankAnswer.trim();
    }
    return '';
  };

  const handleCheckAnswer = () => {
    if (!currentQ || feedback !== 'idle') return;
    const ans = getAssembledAnswer();
    const normalize = (s: string) => s.toLowerCase().replace(/[.,!?;:"]/g, '').trim();

    const isMatch = normalize(ans) === normalize(currentQ.correctAnswer);

    if (isMatch) {
      playChime('correct');
      setFeedback('correct');
      setCorrectCount((c) => c + 1);

      // Pronounce word / phrase only AFTER correct check in its proper language
      const targetAudio = currentQ.sageloAudioText;
      const candidate = currentQ.correctAnswer;

      if (targetAudio) {
        setTimeout(() => {
          playSageloPhrase(targetAudio, { lang: targetCourseLang });
        }, 220);
      } else if (candidate) {
        const cleanPortion = candidate.split(/[—–\-:]/)[0].trim();
        setTimeout(() => {
          if (isEnglishText(cleanPortion)) {
            playEnglishPhrase(candidate);
          } else {
            playSageloPhrase(cleanPortion, { lang: targetCourseLang });
          }
        }, 220);
      }
    } else {
      playChime('wrong');
      setFeedback('wrong');
      const nextLives = lives - 1;
      setLives(nextLives);
      if (nextLives <= 0) {
        setTimeout(() => {
          setPhase('failed');
        }, 1200);
      }
    }
  };

  const handleNextQuestion = () => {
    if (questionIdx + 1 < checkpoint.questions.length) {
      setQuestionIdx((i) => i + 1);
    } else {
      // Completed all questions!
      playChime(checkpoint.isFinalGraduation ? 'fanfare' : 'correct');
      setPhase('passed');
      onComplete(checkpoint.id, checkpoint.xpReward, checkpoint.isFinalGraduation);
    }
  };

  const handleStartExam = () => {
    setPhase('exam');
    setQuestionIdx(0);
    setLives(3);
    setCorrectCount(0);
  };

  const totalQuestions = checkpoint.questions.length;
  const progressPercent = Math.round(((questionIdx + (feedback !== 'idle' ? 1 : 0)) / totalQuestions) * 100);

  return (
    <div className="fixed inset-0 z-50 bg-[#3C3C3C]/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white border-2 border-b-6 border-[#E5E5E5] rounded-3xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh] shadow-2xl relative">
        {/* TOP STATUS BAR */}
        <div className="px-5 py-4 border-b-2 border-[#E5E5E5] flex items-center justify-between gap-4 bg-white shrink-0">
          <button
            onClick={onClose}
            className="text-[#AFAFAF] hover:text-[#3C3C3C] font-black text-xl p-1 transition-colors"
            aria-label="Exit checkpoint"
          >
            <X className="w-6 h-6 stroke-[3]" />
          </button>

          {/* Progress Bar in Exam Mode */}
          {phase === 'exam' && (
            <div className="flex-1 mx-3 sm:mx-6 h-4 bg-[#E5E5E5] rounded-full overflow-hidden p-0.5 relative">
              <div
                className="h-full bg-[#FF9600] rounded-full transition-all duration-300 relative shadow-inner"
                style={{ width: `${progressPercent}%` }}
              >
                <div className="absolute top-0.5 left-2 right-2 h-1 bg-white/30 rounded-full" />
              </div>
            </div>
          )}

          {/* Checkpoint Title Badge or Lives */}
          {phase === 'exam' ? (
            <div className="flex items-center gap-1.5 font-mono-num font-black text-sm text-[#FF4B4B] shrink-0">
              <Heart className="w-5 h-5 fill-[#FF4B4B] text-[#FF4B4B] animate-pulse" />
              <span>{lives} Lives</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 font-black text-xs uppercase tracking-wider text-[#FF9600]">
              <span>{checkpoint.badgeIcon}</span>
              <span>{checkpoint.isFinalGraduation ? 'Grand Graduation' : 'Unit Checkpoint'}</span>
            </div>
          )}
        </div>

        {/* 1. INTRO GATEWAY SCREEN */}
        {phase === 'intro' && (
          <div className="p-6 sm:p-8 space-y-6 overflow-y-auto text-center flex flex-col items-center">
            {/* Guardian Cartoon Character */}
            <div className="relative">
              <CartoonCharacter
                character={checkpoint.guardian}
                mood="speaking"
                size="lg"
                animate={true}
              />
              <div className="absolute -bottom-2 -right-2 w-12 h-12 rounded-2xl bg-[#FF9600] border-b-3 border-[#D97706] text-white flex items-center justify-center text-2xl shadow-md">
                {checkpoint.badgeIcon}
              </div>
            </div>

            <div className="space-y-2 max-w-md">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FFF4E5] border border-[#FFD8A8] rounded-full text-xs font-black uppercase text-[#D97706] tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{checkpoint.title}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-[#3C3C3C] tracking-tight">
                {checkpoint.isFinalGraduation
                  ? 'Grand Graduation Exam'
                  : 'Pass the Unit Gateway'}
              </h2>
              <p className="text-xs sm:text-sm font-bold text-[#777777] leading-relaxed">
                {checkpoint.subtitle}
              </p>
            </div>

            {/* Guardian Speech Bubble */}
            <div className="p-4 rounded-2xl bg-[#F7F7F7] border-2 border-[#E5E5E5] text-left max-w-md w-full relative">
              <div className="text-[11px] font-black uppercase text-[#AFAFAF] tracking-wider mb-1">
                Guardian Council Guidance:
              </div>
              <p className="text-xs sm:text-sm font-bold text-[#3C3C3C] leading-relaxed">
                "{checkpoint.guardianSpeech}"
              </p>
            </div>

            {/* Rewards Banner */}
            <div className="grid grid-cols-2 gap-3 max-w-md w-full">
              <div className="p-3 bg-[#FFFBEB] border-2 border-[#FDE68A] rounded-2xl flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#FFC800] text-white flex items-center justify-center text-lg font-black shadow-xs">
                  ⚡
                </div>
                <div className="text-left">
                  <div className="text-xs font-black text-[#3C3C3C]">+{checkpoint.xpReward} XP</div>
                  <div className="text-[10px] font-bold text-[#92400E]">Upon Completion</div>
                </div>
              </div>

              <div className="p-3 bg-[#DCFCE7] border-2 border-[#86EFAC] rounded-2xl flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#58CC02] text-white flex items-center justify-center text-lg font-black shadow-xs">
                  {checkpoint.badgeIcon}
                </div>
                <div className="text-left">
                  <div className="text-xs font-black text-[#166534] truncate">{checkpoint.badgeName}</div>
                  <div className="text-[10px] font-bold text-[#15803D]">Unlocked Badge</div>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={handleStartExam}
              className={`w-full max-w-md py-4 rounded-2xl font-black uppercase text-sm tracking-wider text-white shadow-lg active:translate-y-1 transition-all ${
                checkpoint.isFinalGraduation
                  ? 'bg-[#FF9600] hover:bg-[#FFA524] border-b-6 border-[#D97706]'
                  : 'bg-[#58CC02] hover:bg-[#61E002] border-b-6 border-[#46A302]'
              }`}
            >
              Start Checkpoint Challenge (5 Questions)
            </button>
          </div>
        )}

        {/* 2. EXAM INTERACTIVE QUESTIONS */}
        {phase === 'exam' && currentQ && (
          <div className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-6 flex flex-col justify-between">
            <div className="space-y-5">
              {/* Question Header & Character Guide */}
              <div className="flex items-center gap-3 sm:gap-4">
                <CartoonCharacter
                  character={currentQ.speaker || checkpoint.guardian}
                  mood={feedback === 'correct' ? 'celebrating' : feedback === 'wrong' ? 'encouraging' : 'speaking'}
                  size="sm"
                  animate={false}
                />
                <div className="flex-1">
                  <span className="text-[11px] font-black uppercase tracking-wider text-[#AFAFAF]">
                    Question {questionIdx + 1} of {totalQuestions}
                  </span>
                  <h3 className="text-lg sm:text-xl font-black text-[#3C3C3C] leading-snug">
                    {currentQ.prompt}
                  </h3>
                </div>
              </div>

              {/* Speech Audio Prompt */}
              {(() => {
                const isSecretAnswer = Boolean(
                  feedback === 'idle' &&
                  (
                    currentQ.type === 'root_morph' ||
                    currentQ.prompt.toLowerCase().includes('build') ||
                    currentQ.prompt.toLowerCase().includes('construct') ||
                    currentQ.prompt.toLowerCase().includes('which ending') ||
                    currentQ.prompt.toLowerCase().includes('how do you') ||
                    currentQ.prompt.toLowerCase().includes('adjective') ||
                    currentQ.prompt.toLowerCase().includes('adverb') ||
                    currentQ.prompt.toLowerCase().includes('what is the') ||
                    (currentQ.sageloAudioText &&
                      currentQ.correctAnswer.toLowerCase().includes(currentQ.sageloAudioText.toLowerCase()))
                  )
                );

                if (isSecretAnswer) {
                  return (
                    <div className="p-3.5 rounded-2xl bg-[#F0FDF4] border-2 border-[#BBF7D0] flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl">🌱</span>
                        <div>
                          <span className="text-[11px] font-black uppercase text-[#166534] tracking-wider block">
                            Checkpoint Challenge
                          </span>
                          <span className="text-sm font-black text-[#14532D]">
                            Demonstrate your root derivation mastery
                          </span>
                        </div>
                      </div>
                      {currentQ.sageloAudioText && (
                        <span className="text-[11px] font-bold text-[#166534] bg-white px-2.5 py-1 rounded-lg border border-[#86EFAC]">
                          Pick the correct ending below
                        </span>
                      )}
                    </div>
                  );
                }

                if (currentQ.sageloAudioText) {
                  return (
                    <div className="p-4 rounded-3xl bg-[#F7F7F7] border-2 border-[#E5E5E5] space-y-2 shadow-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase text-[#AFAFAF] tracking-wider">
                          Tap any word for translation & IPA hint:
                        </span>
                        <span className="text-[10px] font-mono text-[#0284C7] bg-[#E0F2FE] px-2 py-0.5 rounded-md border border-[#BAE6FD]">
                          {getPhrasePhoneticDisplay(currentQ.sageloAudioText)}
                        </span>
                      </div>
                      <InteractiveDuolingoSentence
                        sentence={currentQ.sageloAudioText}
                        size="lg"
                        showSpeakers={true}
                      />
                    </div>
                  );
                }

                return null;
              })()}

              {/* MULTIPLE CHOICE TILES */}
              {(currentQ.type === 'multiple_choice' || currentQ.type === 'root_morph') &&
                currentQ.options && (
                  <div className="grid grid-cols-1 gap-2.5">
                    {currentQ.options.map((opt, idx) => {
                      const isSelected = selectedOption === opt;
                      return (
                        <button
                          key={idx}
                          onClick={() => {
                            if (feedback !== 'idle') return;
                            setSelectedOption(opt);
                            // Do not play audio on select - no spoilers!
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
                            {isSelected ? '✓' : idx + 1}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}

              {/* WORD BANK TILES */}
              {currentQ.type === 'word_bank' && (
                <div className="space-y-4">
                  {/* Assembled Answer Slot */}
                  <div className="min-h-[64px] p-3 rounded-2xl border-2 border-dashed border-[#AFAFAF] bg-[#F7F7F7] flex flex-wrap items-center gap-2">
                    {bankSelected.length === 0 ? (
                      <span className="text-xs font-bold text-[#AFAFAF] italic px-2">
                        Tap words below in order to build the translation...
                      </span>
                    ) : (
                      bankSelected.map((word, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            if (feedback !== 'idle') return;
                            setBankSelected((prev) => prev.filter((_, i) => i !== idx));
                          }}
                          className="px-3.5 py-2 bg-white border-2 border-b-4 border-[#1CB0F6] text-[#1CB0F6] font-black text-sm rounded-xl active:translate-y-0.5 transition-all"
                        >
                          {word}
                        </button>
                      ))
                    )}
                  </div>

                  {/* Word Bank Pool */}
                  <div className="flex flex-wrap gap-2 pt-1">
                    {currentQ.wordBankTiles?.map((word, idx) => {
                      const countInAnswer = bankSelected.filter((w) => w === word).length;
                      const countInPool = currentQ.wordBankTiles!.filter((w) => w === word).length;
                      const isExhausted = countInAnswer >= countInPool;

                      return (
                        <button
                          key={idx}
                          onClick={() => {
                            if (feedback !== 'idle' || isExhausted) return;
                            setBankSelected((prev) => [...prev, word]);
                            playSageloPhrase(word, { lang: targetCourseLang });
                          }}
                          disabled={isExhausted || feedback !== 'idle'}
                          className={`px-4 py-2.5 rounded-xl border-2 border-b-4 font-black text-sm transition-all ${
                            isExhausted
                              ? 'bg-[#E5E5E5] border-[#D0D0D0] text-[#AFAFAF] cursor-default'
                              : 'bg-white border-[#E5E5E5] hover:bg-[#F7F7F7] text-[#3C3C3C] active:translate-y-0.5'
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
              {currentQ.type === 'fill_blank' && (
                <div className="space-y-4">
                  {currentQ.options && currentQ.options.length > 0 ? (
                    <div className="grid grid-cols-3 gap-3">
                      {currentQ.options.map((opt, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            if (feedback !== 'idle') return;
                            setBlankAnswer(opt);
                            playSageloPhrase(opt, { lang: targetCourseLang });
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
                      placeholder="Type the word here..."
                      disabled={feedback !== 'idle'}
                      className="w-full p-4 rounded-2xl border-2 border-b-4 border-[#E5E5E5] focus:border-[#1CB0F6] outline-hidden text-lg font-black text-[#3C3C3C] bg-white transition-all"
                    />
                  )}
                </div>
              )}
            </div>

            {/* DUOLINGO SLIDING BOTTOM FEEDBACK BAR */}
            <div className="pt-4 border-t-2 border-[#E5E5E5]">
              {feedback === 'idle' ? (
                <div className="flex justify-end">
                  <button
                    onClick={handleCheckAnswer}
                    disabled={
                      (currentQ.type === 'word_bank' && bankSelected.length === 0) ||
                      ((currentQ.type === 'multiple_choice' || currentQ.type === 'root_morph') && !selectedOption) ||
                      (currentQ.type === 'fill_blank' && !blankAnswer.trim())
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
                        <span>Excellent! Shanti!</span>
                        {(() => {
                          const sageloTarget = currentQ?.sageloAudioText;
                          const candidate = currentQ?.correctAnswer || '';
                          const cleanPortion = candidate.split(/[—–\-:]/)[0].trim();
                          const isSagelo = Boolean(sageloTarget || (!isEnglishText(cleanPortion) && cleanPortion));
                          const phraseToSpeak = sageloTarget || (isSagelo ? cleanPortion : candidate);

                          if (!phraseToSpeak) return null;

                            if (isSagelo) {
                              const phonetic = getPhrasePhoneticDisplay(phraseToSpeak);
                              return (
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  {!isFrenchCourse && (
                                    <span className="font-mono text-xs font-black text-[#166534] bg-white px-2 py-0.5 rounded-lg border border-[#86EFAC]">
                                      {phonetic}
                                    </span>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => playSageloPhrase(phraseToSpeak, { lang: targetCourseLang })}
                                    className="px-2.5 py-1 rounded-xl bg-white border border-[#86EFAC] text-[#166534] font-black text-xs flex items-center gap-1 hover:bg-[#F0FDF4] active:translate-y-0.5 transition-all shadow-2xs cursor-pointer"
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
                        <div className="text-xs font-bold text-[#15803D]">
                          {currentQ.explanation}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={handleNextQuestion}
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
                          <span>Correct solution: {currentQ.correctAnswer}</span>
                          {(() => {
                            const sageloTarget = currentQ?.sageloAudioText;
                            const candidate = currentQ?.correctAnswer || '';
                            const cleanPortion = candidate.split(/[—–\-:]/)[0].trim();
                            const isSagelo = Boolean(sageloTarget || (!isEnglishText(cleanPortion) && cleanPortion));
                            const phraseToSpeak = sageloTarget || (isSagelo ? cleanPortion : candidate);

                            if (!phraseToSpeak) return null;

                            if (isSagelo) {
                              const phonetic = getPhrasePhoneticDisplay(phraseToSpeak);
                              return (
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  {!isFrenchCourse && (
                                    <span className="font-mono text-xs font-black text-[#991B1B] bg-white px-2 py-0.5 rounded-lg border border-[#FCA5A5]">
                                      {phonetic}
                                    </span>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => playSageloPhrase(phraseToSpeak, { lang: targetCourseLang })}
                                    className="px-2.5 py-1 rounded-xl bg-white border border-[#FCA5A5] text-[#991B1B] font-black text-xs flex items-center gap-1 hover:bg-[#FFF1F2] active:translate-y-0.5 transition-all shadow-2xs cursor-pointer"
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
                        {currentQ.explanation}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handleNextQuestion}
                    className="w-full sm:w-auto px-8 py-3 bg-[#FF4B4B] hover:bg-[#FF6666] border-b-4 border-[#CC3B3B] text-white font-black uppercase text-sm rounded-2xl active:translate-y-1 transition-all shadow-sm"
                  >
                    Got It
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 3. FAILED SCREEN (LOST LIVES) */}
        {phase === 'failed' && (
          <div className="p-6 sm:p-8 space-y-6 text-center flex flex-col items-center overflow-y-auto">
            <CartoonCharacter character="duo" mood="encouraging" size="lg" />
            <div className="space-y-2 max-w-md">
              <h3 className="text-2xl font-black text-[#3C3C3C]">
                Don't Give Up!
              </h3>
              <p className="text-xs sm:text-sm font-bold text-[#777777] leading-relaxed">
                You scored {correctCount} of {totalQuestions} on this gateway exam. Take a deep breath, review the roots, and try again!
              </p>
            </div>

            <button
              onClick={handleStartExam}
              className="w-full max-w-xs py-3.5 bg-[#FF9600] hover:bg-[#FFA524] border-b-4 border-[#D97706] text-white font-black uppercase text-sm rounded-2xl active:translate-y-1 transition-all shadow-md flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4 stroke-[3]" />
              <span>Retry Checkpoint</span>
            </button>
          </div>
        )}

        {/* 4. PASSED SCREEN (CUP / DIPLOMA CELEBRATION) */}
        {phase === 'passed' && (
          <div className="p-6 sm:p-8 space-y-6 text-center flex flex-col items-center overflow-y-auto">
            {/* Mascot in Celebratory Pose */}
            <div className="relative">
              <CartoonCharacter
                character={checkpoint.isFinalGraduation ? 'mpaka' : checkpoint.guardian}
                mood="celebrating"
                size="lg"
                animate={true}
              />
              <div className="absolute -top-2 -right-2 text-4xl animate-bounce">
                🎉
              </div>
            </div>

            <div className="space-y-1 max-w-md">
              <span className="text-xs font-black uppercase tracking-wider text-[#58CC02]">
                GATEWAY CONQUERED!
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-[#3C3C3C]">
                {checkpoint.isFinalGraduation
                  ? 'Master of Sagelo Certified!'
                  : `${checkpoint.badgeName} Unlocked!`}
              </h2>
              <p className="text-xs sm:text-sm font-bold text-[#777777]">
                You scored {correctCount} / {totalQuestions} and passed the {checkpoint.title}!
              </p>
            </div>

            {/* GRAND FINAL GRADUATION DIPLOMA */}
            {checkpoint.isFinalGraduation ? (
              <div className="w-full max-w-lg p-6 rounded-3xl bg-[#FFFDF5] border-4 border-[#D99B26] shadow-xl text-center space-y-4 relative overflow-hidden">
                <div className="absolute top-2 left-2 text-[#D99B26] opacity-30 text-4xl font-serif">
                  ⚜️
                </div>
                <div className="absolute top-2 right-2 text-[#D99B26] opacity-30 text-4xl font-serif">
                  ⚜️
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#B45309]">
                    CIRCLE OF SAGES • OFFICIAL GRADUATION DIPLOMA
                  </span>
                  <h3 className="text-xl sm:text-2xl font-serif font-black text-[#451A03]">
                    Certificate of Supreme Sagelo Mastery
                  </h3>
                  <div className="h-0.5 w-24 bg-[#D99B26] mx-auto my-1" />
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-bold text-[#78350F]">
                    This certifies that the esteemed seeker:
                  </p>
                  <p className="text-xl sm:text-2xl font-black text-[#B45309] font-serif">
                    {userName} ({userSageloName})
                  </p>
                  <p className="text-xs font-bold text-[#78350F] max-w-md mx-auto leading-relaxed">
                    has successfully demonstrated complete command over all 9 Units of Sagelo, including Lonkundo Bantu root morphology, the 5-vowel system, the 4 truth evidentialities, numbers, and philosophical fluency.
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-[#FDE68A] text-[11px] font-black text-[#92400E]">
                  <div>
                    <span>Seal of Elder Mpaka</span>
                    <div className="text-[9px] text-[#AFAFAF] font-mono-num font-normal">
                      Verified via Firestore
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-[#D99B26] border-2 border-white text-white flex items-center justify-center text-xl shadow-md">
                    👑
                  </div>
                  <div>
                    <span>Date: {new Date().toLocaleDateString()}</span>
                    <div className="text-[9px] text-[#AFAFAF] font-mono-num font-normal">
                      Master Misaga
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Regular Unit Checkpoint Badge */
              <div className="p-5 rounded-2xl bg-[#FFFBEB] border-2 border-[#FDE68A] max-w-md w-full flex items-center gap-4 text-left">
                <div className="w-16 h-16 rounded-2xl bg-[#FF9600] border-b-4 border-[#D97706] text-white flex items-center justify-center text-3xl shrink-0 shadow-md">
                  {checkpoint.badgeIcon}
                </div>
                <div>
                  <div className="text-xs font-black uppercase text-[#D97706]">
                    Permanent Badge Earned
                  </div>
                  <div className="text-base font-black text-[#3C3C3C]">
                    {checkpoint.badgeName}
                  </div>
                  <div className="text-xs font-bold text-[#92400E]">
                    +{checkpoint.xpReward} XP Added to Your Streak!
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={onClose}
              className="w-full max-w-md py-4 bg-[#58CC02] hover:bg-[#61E002] border-b-6 border-[#46A302] text-white font-black uppercase text-sm tracking-wider rounded-2xl active:translate-y-1 transition-all shadow-lg"
            >
              Continue Learning Path
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
