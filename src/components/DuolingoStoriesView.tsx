import React, { useState } from 'react';
import {
  Volume2,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  BookOpen,
  Award,
  Play,
  RotateCcw,
} from 'lucide-react';
import { playSageloPhrase } from '../utils/sageloAudio';
import { getPhrasePhoneticDisplay } from '../utils/sageloPhonetics';
import { FRENCH_STORIES } from '../data/frenchStories';

interface StoryDialogueLine {
  speaker: string;
  avatar: string;
  sagelo: string;
  english: string;
  isQuestion?: boolean;
  questionPrompt?: string;
  questionOptions?: string[];
  questionCorrect?: string;
}

interface DuolingoStory {
  id: string;
  title: string;
  sageloTitle: string;
  description: string;
  xpReward: number;
  coverEmoji: string;
  accentColor: string;
  lines: StoryDialogueLine[];
}

export const DUOLINGO_STORIES: DuolingoStory[] = [
  {
    id: 'story-1',
    title: 'The Traveler at the Riverbank',
    sageloTitle: 'Mondo ndo Dovu',
    description: 'A thirsty young traveler meets an elder sage by the flowing waters of the Baobab grove.',
    xpReward: 24,
    coverEmoji: '🌊',
    accentColor: '#1CB0F6',
    lines: [
      {
        speaker: 'Traveler Mwana',
        avatar: '🎒',
        sagelo: 'Shanti, misaga! Yo mondo oni. Yo ta wai voli.',
        english: 'Peace, elder! I am a traveler. I want water.',
      },
      {
        speaker: 'Elder Mpaka',
        avatar: '👴🏾',
        sagelo: 'Shanti, mwana! Dovu doa wai doni ha.',
        english: 'Peace, child! This river gives water — for certain.',
      },
      {
        speaker: 'System',
        avatar: '💡',
        sagelo: '',
        english: '',
        isQuestion: true,
        questionPrompt: 'What did the traveler ask for?',
        questionOptions: ['Bread / Grain', 'Water', 'Gold / Coins', 'A boat'],
        questionCorrect: 'Water',
      },
      {
        speaker: 'Traveler Mwana',
        avatar: '🎒',
        sagelo: 'Wai doa bono oni! Sondo yu go? Yu sago jua oni ni?',
        english: 'This water is good! Where are you going? Are you a person of wisdom?',
      },
      {
        speaker: 'Elder Mpaka',
        avatar: '👴🏾',
        sagelo: 'Yo ta sago sim oni; sago sagu ha.',
        english: 'I am not wisdom itself; wisdom is grown firsthand.',
      },
      {
        speaker: 'System',
        avatar: '💡',
        sagelo: '',
        english: '',
        isQuestion: true,
        questionPrompt: 'What evidential particle did Elder Mpaka use to express firsthand truth?',
        questionOptions: ['ha (firsthand observation)', 'ra (reported hearsay)', 'si (inferred logic)', 'ni (question marker)'],
        questionCorrect: 'ha (firsthand observation)',
      },
      {
        speaker: 'Traveler Mwana',
        avatar: '🎒',
        sagelo: 'Tu ta yo lerni! Yo sagi fu.',
        english: 'Please teach me! I will understand.',
      },
      {
        speaker: 'Elder Mpaka',
        avatar: '👴🏾',
        sagelo: 'No kani yo ndo sasagu. Shanti kandi vi yu.',
        english: 'Walk with me to the sanctuary. Peace be with you.',
      },
    ],
  },
  {
    id: 'story-2',
    title: 'A Surprise at the Market',
    sageloTitle: 'Surprisa ndo Bazari',
    description: 'Amina visits the bustling African market to buy mangoes and sweet honey.',
    xpReward: 26,
    coverEmoji: '🥭',
    accentColor: '#FF9600',
    lines: [
      {
        speaker: 'Nyango Amina',
        avatar: '🧺',
        sagelo: 'Shanti, ndeko! Sowe fruta doa pila oni?',
        english: 'Peace, friend! What does this fruit cost?',
      },
      {
        speaker: 'Vendor Kwame',
        avatar: '🏪',
        sagelo: 'Mango doa pila tri cowrie oni.',
        english: 'This mango costs three cowries.',
      },
      {
        speaker: 'System',
        avatar: '💡',
        sagelo: '',
        english: '',
        isQuestion: true,
        questionPrompt: 'How many cowries does the mango cost?',
        questionOptions: ['One (uno)', 'Two (du)', 'Three (tri)', 'Four (kwa)'],
        questionCorrect: 'Three (tri)',
      },
      {
        speaker: 'Nyango Amina',
        avatar: '🧺',
        sagelo: 'Tri pila? No doni du! Yo ta meli voli.',
        english: 'Three? Please give two! I also want honey.',
      },
      {
        speaker: 'Vendor Kwame',
        avatar: '🏪',
        sagelo: 'E, bono! Du pila fru mango, e uno fru meli.',
        english: 'Yes, good! Two for mango, and one for honey.',
      },
      {
        speaker: 'Nyango Amina',
        avatar: '🧺',
        sagelo: 'Gratia, ndeko! Shanti kandi vi yu!',
        english: 'Thank you, friend! Peace be with you!',
      },
    ],
  },
  {
    id: 'story-3',
    title: 'The Stargazers in the Savannah',
    sageloTitle: 'Astronoma ndo Savana',
    description: 'Two learners study the constellation of the Great Baobab beneath the night sky.',
    xpReward: 28,
    coverEmoji: '✨',
    accentColor: '#CE82FF',
    lines: [
      {
        speaker: 'Learner Kofi',
        avatar: '🔭',
        sagelo: 'Mwana, mira ndo heva! Mun lume brili ha.',
        english: 'Learner, look at the sky! The moon shines brightly.',
      },
      {
        speaker: 'Learner Nia',
        avatar: '⭐',
        sagelo: 'Astra multi oni. Yo ta Baobab astra mira.',
        english: 'There are many stars. I see the Baobab constellation.',
      },
      {
        speaker: 'System',
        avatar: '💡',
        sagelo: '',
        english: '',
        isQuestion: true,
        questionPrompt: 'What shines brightly in the sky?',
        questionOptions: ['The sun (jua)', 'The moon (mun)', 'A lantern (lampa)', 'A fire (faya)'],
        questionCorrect: 'The moon (mun)',
      },
      {
        speaker: 'Learner Kofi',
        avatar: '🔭',
        sagelo: 'Sago astra doa dona. Ju yu mira, yu sagi.',
        english: 'These stars grant wisdom. If you look, you understand.',
      },
      {
        speaker: 'Learner Nia',
        avatar: '⭐',
        sagelo: 'Shanti ndo mun. Yo sagi ha!',
        english: 'Peace under the moon. I understand firsthand!',
      },
    ],
  },
];

interface DuolingoStoriesViewProps {
  onCompleteStory: (storyId: string, xp: number) => void;
  activeCourse?: 'sagelo' | 'french';
  completedStoryIds?: string[];
}

export const DuolingoStoriesView: React.FC<DuolingoStoriesViewProps> = ({
  onCompleteStory,
  activeCourse = 'sagelo',
  completedStoryIds = [],
}) => {
  const isFrench = activeCourse === 'french';
  const targetLang = isFrench ? 'french' : 'sagelo';
  const storiesList = isFrench ? FRENCH_STORIES : DUOLINGO_STORIES;

  const [activeStory, setActiveStory] = useState<DuolingoStory | null>(null);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [questionFeedback, setQuestionFeedback] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [storyFinished, setStoryFinished] = useState(false);

  const isCurrentStoryRepeat = Boolean(activeStory && completedStoryIds.includes(activeStory.id));

  const handleStartStory = (story: DuolingoStory) => {
    setActiveStory(story);
    setCurrentLineIndex(0);
    setSelectedAnswer(null);
    setQuestionFeedback('idle');
    setStoryFinished(false);

    // Play first line
    const first = story.lines[0];
    if (first && first.sagelo) {
      playSageloPhrase(first.sagelo, { lang: targetLang });
    }
  };

  const handleNextLine = () => {
    if (!activeStory) return;

    if (currentLineIndex + 1 < activeStory.lines.length) {
      const nextIdx = currentLineIndex + 1;
      setCurrentLineIndex(nextIdx);
      setSelectedAnswer(null);
      setQuestionFeedback('idle');

      const nextLine = activeStory.lines[nextIdx];
      if (nextLine && nextLine.sagelo && !nextLine.isQuestion) {
        playSageloPhrase(nextLine.sagelo, { lang: targetLang });
      }
    } else {
      setStoryFinished(true);
      // Only award points on the first completion; repeats give 0 XP
      const xpToAward = isCurrentStoryRepeat ? 0 : activeStory.xpReward;
      onCompleteStory(activeStory.id, xpToAward);
    }
  };

  const handleAnswerQuestion = (ans: string) => {
    if (!activeStory) return;
    const currentLine = activeStory.lines[currentLineIndex];
    setSelectedAnswer(ans);

    if (ans === currentLine.questionCorrect) {
      setQuestionFeedback('correct');
    } else {
      setQuestionFeedback('wrong');
    }
  };

  if (!activeStory) {
    return (
      <div className="max-w-2xl w-full mx-auto py-6 space-y-6 overflow-x-hidden text-[#FEF3C7]">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#0D9488]/20 text-[#14B8A6] border border-[#0D9488]/40 rounded-full font-black text-xs uppercase tracking-wider">
            <BookOpen className="w-4 h-4" /> Duolingo Stories
          </div>
          <h2 className="text-3xl font-black text-[#FEF3C7]">
            {isFrench ? 'Histoires Interactives en Français 🥐' : 'Interactive Sagelo Tales 🌍'}
          </h2>
          <p className="text-sm font-bold text-[#D4A373] max-w-md mx-auto">
            {isFrench
              ? 'Listen to lively French dialogues, learn conversational expressions, and answer comprehension checks along the way!'
              : 'Listen to lively African dialogues, tap to reveal words, and answer comprehension checks along the way!'}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {storiesList.map((story) => (
            <div
              key={story.id}
              className="bg-[#1E130D] border-2 border-b-4 border-[#3D2619] hover:border-[#F59E0B] rounded-2xl p-5 flex items-center justify-between gap-4 transition-all hover:scale-[1.01] shadow-xs cursor-pointer"
              onClick={() => handleStartStory(story)}
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-inner border-2 border-[#3D2619] bg-[#241710]"
                >
                  {story.coverEmoji}
                </div>
                <div>
                  <span className="text-[11px] font-black uppercase text-[#14B8A6] tracking-wider">
                    {story.sageloTitle}
                  </span>
                  <h3 className="text-lg font-black text-[#FEF3C7]">
                    {story.title}
                  </h3>
                  <p className="text-xs font-bold text-[#D4A373] line-clamp-1 mt-0.5">
                    {story.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className="font-mono-num font-black text-sm text-[#F59E0B]">
                  {completedStoryIds.includes(story.id) ? 'Review (0 XP)' : `+${story.xpReward} XP`}
                </span>
                <button
                  className="w-10 h-10 rounded-xl bg-[#059669] border-b-4 border-[#047857] text-[#FEF3C7] flex items-center justify-center hover:bg-[#047857] active:translate-y-1 transition-all cursor-pointer"
                  aria-label="Start story"
                >
                  <Play className="w-5 h-5 fill-[#FEF3C7] ml-0.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const currentLine = activeStory.lines[currentLineIndex];
  const progressPercent = Math.round(
    ((currentLineIndex + 1) / activeStory.lines.length) * 100
  );

  return (
    <div className="max-w-2xl w-full mx-auto py-6 space-y-6 overflow-x-hidden text-[#FEF3C7]">
      {/* Top Bar with Duolingo Progress Bar */}
      <div className="flex items-center justify-between gap-4 bg-[#1E130D] p-3 rounded-2xl border-2 border-[#3D2619]">
        <button
          onClick={() => setActiveStory(null)}
          className="text-[#D4A373] hover:text-[#FEF3C7] font-black text-lg p-2 cursor-pointer"
        >
          ✕
        </button>

        <div className="flex-1 h-3.5 bg-[#150E09] border border-[#3D2619] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#059669] transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <span className="text-xs font-mono-num font-black text-[#F59E0B]">
          +{activeStory.xpReward} XP
        </span>
      </div>

      {!storyFinished ? (
        <div className="bg-[#1E130D] border-2 border-b-6 border-[#3D2619] rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
          {/* Previous Dialogue Lines History */}
          <div className="space-y-4 max-h-[340px] overflow-y-auto pr-2">
            {activeStory.lines
              .slice(0, currentLineIndex + 1)
              .map((line, idx) => {
                if (line.isQuestion) return null;
                const isLatest = idx === currentLineIndex;
                return (
                  <div
                    key={idx}
                    className={`flex items-start gap-3 transition-opacity ${
                      isLatest ? 'opacity-100' : 'opacity-70'
                    }`}
                  >
                    <span className="text-2xl select-none">{line.avatar}</span>
                    <div className="space-y-1">
                      <div className="text-[11px] font-black uppercase text-[#D4A373]">
                        {line.speaker}
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          onClick={() => playSageloPhrase(line.sagelo, { lang: targetLang })}
                          className="w-7 h-7 rounded-full bg-[#0D9488]/20 hover:bg-[#0D9488]/35 text-[#14B8A6] flex items-center justify-center shrink-0 active:scale-95 transition-transform cursor-pointer"
                          title={`Listen to ${isFrench ? 'French' : 'Sagelo'} audio`}
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                        <p className="text-base font-extrabold text-[#FEF3C7]">
                          {line.sagelo}
                        </p>
                        {!isFrench && (
                          <span className="font-mono text-xs font-bold text-[#14B8A6] bg-[#241710] px-2 py-0.5 rounded-lg border border-[#0D9488]/40">
                            {getPhrasePhoneticDisplay(line.sagelo)}
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-bold text-[#D4A373] pl-9">
                        {line.english}
                      </p>
                    </div>
                  </div>
                );
              })}
          </div>

          {/* Current Question If Applicable */}
          {currentLine.isQuestion && (
            <div className="pt-4 border-t-2 border-[#3D2619] space-y-4">
              <div className="flex items-center gap-2 text-sm font-black text-[#14B8A6]">
                <Sparkles className="w-4 h-4 text-[#F59E0B]" />
                <span>Story Comprehension Check:</span>
              </div>
              <h4 className="text-lg font-black text-[#FEF3C7]">
                {currentLine.questionPrompt}
              </h4>

              <div className="grid grid-cols-1 gap-2.5">
                {currentLine.questionOptions?.map(opt => {
                  const isSelected = selectedAnswer === opt;
                  return (
                    <button
                      key={opt}
                      onClick={() => handleAnswerQuestion(opt)}
                      disabled={questionFeedback === 'correct'}
                      className={`p-4 rounded-2xl border-2 border-b-4 font-black text-sm text-left transition-all cursor-pointer ${
                        isSelected
                          ? questionFeedback === 'correct'
                            ? 'bg-[#059669]/25 border-[#059669] text-[#10B981]'
                            : 'bg-[#381B1B] border-[#7F1D1D] text-[#FCA5A5]'
                          : 'bg-[#241710] border-[#3D2619] hover:bg-[#2C1D14] text-[#FEF3C7]'
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Bottom Action Button */}
          <div className="pt-4 border-t-2 border-[#3D2619] flex justify-end">
            <button
              onClick={handleNextLine}
              disabled={currentLine.isQuestion && questionFeedback !== 'correct'}
              className="bg-[#059669] hover:bg-[#047857] disabled:opacity-40 border-b-4 border-[#065F46] text-[#FEF3C7] font-black uppercase text-sm px-8 py-3.5 rounded-2xl active:translate-y-1 transition-all flex items-center gap-2 cursor-pointer shadow-md"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </button>
          </div>
        </div>
      ) : (
        /* STORY FINISHED CELEBRATION */
        <div className="bg-[#1E130D] border-2 border-b-6 border-[#3D2619] rounded-3xl p-8 text-center space-y-6 shadow-sm">
          <div className="w-20 h-20 rounded-full bg-[#F59E0B]/20 text-4xl flex items-center justify-center mx-auto border-2 border-[#F59E0B]">
            🎉
          </div>
          <div>
            <h3 className="text-2xl font-black text-[#FEF3C7]">
              Story Completed!
            </h3>
            <p className="text-sm font-bold text-[#D4A373] mt-1">
              You practiced listening and understood natural spoken dialogue.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 px-6 py-3 bg-[#241710] border-2 border-[#F59E0B] rounded-2xl font-black text-base text-[#F59E0B]">
            <span>{isCurrentStoryRepeat ? '+0 XP (Repeat Review • Points earned once)' : `+${activeStory.xpReward} XP Earned!`}</span>
          </div>

          <div>
            <button
              onClick={() => setActiveStory(null)}
              className="w-full py-4 bg-[#059669] hover:bg-[#047857] border-b-4 border-[#065F46] text-[#FEF3C7] font-black uppercase text-sm rounded-2xl active:translate-y-1 transition-all cursor-pointer shadow-md"
            >
              Continue to Stories
            </button>
          </div>
        </div>
      )}
    </div>
  );
};


