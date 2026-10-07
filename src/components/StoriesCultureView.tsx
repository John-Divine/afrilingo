import React, { useState } from 'react';
import {
  Volume2,
  BookOpen,
  Sparkles,
  Music,
  CheckCircle2,
  AlertCircle,
  Globe,
} from 'lucide-react';
import {
  GRADED_READER_PASSAGES,
  SAGELO_PROVERBS,
  SAGELO_MANTRAS,
  CULTURAL_ESSAYS,
} from '../data/sageloReference';
import { playSageloPhrase, playChime } from '../utils/sageloAudio';
import { CeremonialWordRenderer } from './CeremonialScriptGlyph';

interface StoriesCultureViewProps {
  onEarnBonusXp: (xp: number) => void;
}

export const StoriesCultureView: React.FC<StoriesCultureViewProps> = ({
  onEarnBonusXp,
}) => {
  const [section, setSection] = useState<'reader' | 'proverbs' | 'mantras' | 'essays'>('reader');
  const [selectedPassageId, setSelectedPassageId] = useState(
    GRADED_READER_PASSAGES[0].id
  );
  const [showEnglish, setShowEnglish] = useState(true);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [completedQuizzes, setCompletedQuizzes] = useState<string[]>([]);

  const activePassage =
    GRADED_READER_PASSAGES.find(p => p.id === selectedPassageId) ||
    GRADED_READER_PASSAGES[0];

  const handleAnswerSelect = (
    qIdx: number,
    optIdx: number,
    correctIdx: number
  ) => {
    const key = `${activePassage.id}-${qIdx}`;
    setQuizAnswers(prev => ({ ...prev, [key]: optIdx }));
    if (optIdx === correctIdx) {
      playChime('correct');
      if (!completedQuizzes.includes(key)) {
        setCompletedQuizzes(prev => [...prev, key]);
        onEarnBonusXp(15);
      }
    } else {
      playChime('wrong');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#E6DFD3] pb-6">
        <div className="space-y-1">
          <div className="text-xs text-[#5C4D43]">
            Parts IV & VII · Graded Reader, Folktale, Proverbs, Mantras & Culture
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-semibold text-[#1C1613]">
            Sagelo Stories, Oral Wisdom & Graded Reader
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-1 p-1.5 bg-[#F3EFE6] border border-[#E6DFD3] rounded-xl">
          <button
            onClick={() => setSection('reader')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors inline-flex items-center gap-1.5 whitespace-nowrap ${
              section === 'reader'
                ? 'bg-[#C84B24] text-white'
                : 'text-[#5C4D43] hover:text-[#1C1613]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Graded Stories (5)</span>
          </button>
          <button
            onClick={() => setSection('proverbs')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors inline-flex items-center gap-1.5 whitespace-nowrap ${
              section === 'proverbs'
                ? 'bg-[#C84B24] text-white'
                : 'text-[#5C4D43] hover:text-[#1C1613]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Proverbs (Chapter A)</span>
          </button>
          <button
            onClick={() => setSection('mantras')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors inline-flex items-center gap-1.5 whitespace-nowrap ${
              section === 'mantras'
                ? 'bg-[#C84B24] text-white'
                : 'text-[#5C4D43] hover:text-[#1C1613]'
            }`}
          >
            <Music className="w-3.5 h-3.5" />
            <span>Songs & Mantras (Chapter C)</span>
          </button>
          <button
            onClick={() => setSection('essays')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors inline-flex items-center gap-1.5 whitespace-nowrap ${
              section === 'essays'
                ? 'bg-[#C84B24] text-white'
                : 'text-[#5C4D43] hover:text-[#1C1613]'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Circle of Sages Essays</span>
          </button>
        </div>
      </div>

      {section === 'reader' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-4 space-y-3">
            <div className="text-xs font-semibold text-[#5C4D43] px-1">
              Select a Story or Graded Passage:
            </div>
            {GRADED_READER_PASSAGES.map(p => {
              const isSelected = p.id === activePassage.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setSelectedPassageId(p.id)}
                  className={`w-full p-4 rounded-xl border text-left transition-colors ${
                    isSelected
                      ? 'bg-white border-[#C84B24]'
                      : 'bg-[#F3EFE6]/70 border-[#E6DFD3] hover:bg-white'
                  }`}
                >
                  <div className="text-xs text-[#C84B24] font-semibold">
                    {p.level} · {p.lessonsCovered}
                  </div>
                  <div className="text-base font-display font-semibold text-[#1C1613] mt-0.5">
                    {p.title}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="lg:col-span-8 bg-white border border-[#E6DFD3] rounded-2xl overflow-hidden">
            {/* Artistic vector header for the story */}
            <div className="relative h-44 sm:h-52 w-full bg-gradient-to-r from-[#312E81] via-[#1C1613] to-[#8F2D10] overflow-hidden flex flex-col justify-end p-6">
              <div className="text-xs text-[#D99B26] font-mono-num">
                {activePassage.level} · {activePassage.lessonsCovered}
              </div>
              <h2 className="text-2xl sm:text-3xl font-display font-semibold text-white">
                {activePassage.title}
              </h2>
            </div>

            <div className="p-6 sm:p-8 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#E6DFD3]">
                <button
                  onClick={() =>
                    playSageloPhrase(activePassage.sageloParagraphs.join(' '))
                  }
                  className="px-4 py-2 rounded-lg bg-[#C84B24] hover:bg-[#8F2D10] text-white text-xs font-semibold inline-flex items-center gap-2 whitespace-nowrap"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>Read Entire Passage Aloud</span>
                </button>

                <button
                  onClick={() => setShowEnglish(s => !s)}
                  className="px-3.5 py-2 rounded-lg border border-[#E6DFD3] text-xs font-medium text-[#5C4D43] hover:text-[#1C1613] whitespace-nowrap"
                >
                  {showEnglish
                    ? 'Hide English Translation (Immersion Mode)'
                    : 'Show Side-by-Side English'}
                </button>
              </div>

              <div className="space-y-4">
                {activePassage.sageloParagraphs.map((para, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-[#FBF9F5] border border-[#E6DFD3] space-y-2"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-lg font-display font-medium text-[#1C1613] leading-relaxed">
                        {para}
                      </p>
                      <button
                        onClick={() => playSageloPhrase(para)}
                        className="p-2 rounded-lg bg-[#F3EFE6] hover:bg-[#C84B24] text-[#1C1613] hover:text-white transition-colors shrink-0"
                        aria-label="Listen to paragraph"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>
                    {showEnglish && activePassage.englishParagraphs[idx] && (
                      <p className="text-sm text-[#5C4D43] leading-relaxed border-t border-[#E6DFD3]/70 pt-2">
                        {activePassage.englishParagraphs[idx]}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-xl bg-[#F3EFE6] border border-[#E6DFD3] space-y-2">
                <div className="text-xs font-semibold text-[#8F2D10]">
                  Vocabulary & Grammar Spotlight:
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs">
                  {activePassage.newWords.map(nw => (
                    <span key={nw.word} className="text-[#1C1613]">
                      <strong className="font-mono-num text-[#C84B24]">
                        {nw.word}
                      </strong>{' '}
                      = {nw.meaning}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-[#5C4D43] pt-1">
                  {activePassage.grammarNotes}
                </p>
              </div>

              <div className="space-y-4 pt-4 border-t border-[#E6DFD3]">
                <div className="text-sm font-semibold text-[#1C1613]">
                  Reading Comprehension Check (+15 XP per correct answer):
                </div>

                {activePassage.comprehensionQuestions.map((q, qIdx) => {
                  const key = `${activePassage.id}-${qIdx}`;
                  const chosen = quizAnswers[key];
                  const isAnswered = chosen !== undefined;
                  const isCorrect = chosen === q.correctIndex;

                  return (
                    <div
                      key={qIdx}
                      className="p-4 rounded-xl bg-[#FBF9F5] border border-[#E6DFD3] space-y-3"
                    >
                      <div className="text-sm font-semibold text-[#1C1613]">
                        {qIdx + 1}. {q.question}
                      </div>
                      <div className="space-y-2">
                        {q.options.map((opt, oIdx) => (
                          <button
                            key={oIdx}
                            onClick={() =>
                              handleAnswerSelect(qIdx, oIdx, q.correctIndex)
                            }
                            className={`w-full p-3 rounded-lg border text-left text-xs font-medium transition-colors ${
                              chosen === oIdx
                                ? isCorrect
                                  ? 'bg-[#1B6B4A]/15 border-[#1B6B4A] text-[#1C1613]'
                                  : 'bg-[#B91C1C]/15 border-[#B91C1C] text-[#1C1613]'
                                : 'bg-white border-[#E6DFD3] text-[#1C1613] hover:bg-[#F3EFE6]'
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                      {isAnswered && (
                        <div className="flex items-start gap-2 text-xs pt-1">
                          {isCorrect ? (
                            <CheckCircle2 className="w-4 h-4 text-[#1B6B4A] shrink-0 mt-0.5" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-[#B91C1C] shrink-0 mt-0.5" />
                          )}
                          <span className="text-[#5C4D43]">{q.explanation}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {section === 'proverbs' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {SAGELO_PROVERBS.map((prov, idx) => (
            <div
              key={idx}
              className="bg-white border border-[#E6DFD3] rounded-2xl p-6 space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-xl font-display font-semibold text-[#1C1613]">
                    “{prov.sagelo}”
                  </h3>
                  <button
                    onClick={() => playSageloPhrase(prov.sagelo)}
                    className="p-2 rounded-lg bg-[#F3EFE6] hover:bg-[#C84B24] text-[#1C1613] hover:text-white transition-colors shrink-0"
                    aria-label="Listen to proverb"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-base font-medium text-[#C84B24]">
                  {prov.english}
                </p>
                <p className="text-xs text-[#5C4D43]">
                  Literal structure: {prov.literal}
                </p>
              </div>
              <div className="pt-3 border-t border-[#E6DFD3]">
                <CeremonialWordRenderer text={prov.sagelo} size={42} />
              </div>
            </div>
          ))}
        </div>
      )}

      {section === 'mantras' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {SAGELO_MANTRAS.map((mantra, idx) => (
            <div
              key={idx}
              className="bg-white border border-[#E6DFD3] rounded-2xl p-6 space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="text-xs text-[#C84B24] font-semibold">
                  Part IV · Chapter C Mantra
                </div>
                <h3 className="text-xl font-display font-semibold text-[#1C1613]">
                  {mantra.title}
                </h3>
                <p className="text-xs text-[#5C4D43]">{mantra.occasion}</p>

                <div className="space-y-3 pt-2">
                  {mantra.lines.map((line, lIdx) => (
                    <div
                      key={lIdx}
                      className="p-3 rounded-xl bg-[#FBF9F5] border border-[#E6DFD3]"
                    >
                      <div className="font-display font-semibold text-base text-[#1C1613]">
                        {line.sagelo}
                      </div>
                      <div className="text-xs text-[#5C4D43]">{line.english}</div>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() =>
                  playSageloPhrase(mantra.lines.map(l => l.sagelo).join(' '))
                }
                className="w-full py-2.5 rounded-lg bg-[#C84B24] hover:bg-[#8F2D10] text-white text-xs font-semibold inline-flex items-center justify-center gap-2 transition-colors whitespace-nowrap"
              >
                <Volume2 className="w-4 h-4" />
                <span>Chant Mantra Aloud</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {section === 'essays' && (
        <div className="grid grid-cols-1 gap-6 max-w-4xl">
          {CULTURAL_ESSAYS.map((essay, idx) => (
            <article
              key={idx}
              className="bg-white border border-[#E6DFD3] rounded-2xl p-6 sm:p-8 space-y-3"
            >
              <div className="text-xs font-mono-num text-[#C84B24] font-semibold">
                Part IV · Chapter D Essay {idx + 1} · {essay.sageloQuote}
              </div>
              <h3 className="text-2xl font-display font-semibold text-[#1C1613]">
                {essay.title}
              </h3>
              <p className="text-base text-[#1C1613]/90 leading-relaxed">
                {essay.body}
              </p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};
