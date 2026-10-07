import React, { useState, useMemo } from 'react';
import {
  Search,
  Volume2,
  BookMarked,
  Compass,
  FileText,
  PlusCircle,
  Check,
} from 'lucide-react';
import {
  SAGELO_DICTIONARY,
  PHRASEBOOK_CHAPTERS,
  deriveRootForms,
  DictionaryEntry,
} from '../data/sageloReference';
import { playSageloPhrase } from '../utils/sageloAudio';
import { CeremonialWordRenderer } from './CeremonialScriptGlyph';

interface LexiconPhrasebookViewProps {
  masteredWords: string[];
  onSaveToNotebook: (sagelo: string, english: string) => void;
}

export const LexiconPhrasebookView: React.FC<LexiconPhrasebookViewProps> = ({
  masteredWords,
  onSaveToNotebook,
}) => {
  const [subTab, setSubTab] = useState<'dictionary' | 'phrasebook' | 'appendix'>('dictionary');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [expandedRoot, setExpandedRoot] = useState<string | null>('sag');
  const [savedToast, setSavedToast] = useState<string | null>(null);

  const categories = useMemo(() => {
    const set = new Set<string>(['All']);
    SAGELO_DICTIONARY.forEach(d => set.add(d.category));
    return Array.from(set);
  }, []);

  const filteredDictionary = useMemo(() => {
    return SAGELO_DICTIONARY.filter(entry => {
      const matchesCat =
        selectedCategory === 'All' || entry.category === selectedCategory;
      const q = searchQuery.trim().toLowerCase();
      if (!q) return matchesCat;
      return (
        matchesCat &&
        (entry.root.toLowerCase().includes(q) ||
          entry.meaning.toLowerCase().includes(q) ||
          (entry.originNote && entry.originNote.toLowerCase().includes(q)))
      );
    });
  }, [searchQuery, selectedCategory]);

  const handleSavePhrase = (sagelo: string, english: string) => {
    onSaveToNotebook(sagelo, english);
    setSavedToast(sagelo);
    setTimeout(() => setSavedToast(null), 2200);
  };

  return (
    <div className="space-y-8 max-w-full overflow-x-hidden">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#E6DFD3] pb-6">
        <div className="space-y-1">
          <div className="text-xs text-[#5C4D43]">
            Parts III, V, VI & VIII · Living Reference & Practical Phrasebook
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-semibold text-[#1C1613]">
            Sagelo Dictionary, Phrasebook & Grammar Reference
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-1 p-1.5 bg-[#F3EFE6] border border-[#E6DFD3] rounded-xl">
          <button
            onClick={() => setSubTab('dictionary')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors inline-flex items-center gap-1.5 whitespace-nowrap ${
              subTab === 'dictionary'
                ? 'bg-[#C84B24] text-white'
                : 'text-[#5C4D43] hover:text-[#1C1613]'
            }`}
          >
            <BookMarked className="w-3.5 h-3.5" />
            <span>Root Dictionary ({SAGELO_DICTIONARY.length} Roots)</span>
          </button>
          <button
            onClick={() => setSubTab('phrasebook')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors inline-flex items-center gap-1.5 whitespace-nowrap ${
              subTab === 'phrasebook'
                ? 'bg-[#C84B24] text-white'
                : 'text-[#5C4D43] hover:text-[#1C1613]'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Practical Phrasebook (7 Chapters)</span>
          </button>
          <button
            onClick={() => setSubTab('appendix')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors inline-flex items-center gap-1.5 whitespace-nowrap ${
              subTab === 'appendix'
                ? 'bg-[#C84B24] text-white'
                : 'text-[#5C4D43] hover:text-[#1C1613]'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Grammar Appendices (Part V)</span>
          </button>
        </div>
      </div>

      {subTab === 'dictionary' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#8C7A6B] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search English or Sagelo root (e.g., wisdom, water, sag, nyango, peace)..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[#E6DFD3] text-sm text-[#1C1613] focus:outline-none focus:border-[#C84B24]"
              />
            </div>

            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="px-4 py-2.5 rounded-xl bg-white border border-[#E6DFD3] text-sm text-[#1C1613] focus:outline-none focus:border-[#C84B24]"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat === 'All' ? 'All Semantic Themes' : cat}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredDictionary.map((entry: DictionaryEntry) => {
              const isMastered = masteredWords.includes(entry.root);
              const isExpanded = expandedRoot === entry.root;
              const derived = deriveRootForms(entry);

              return (
                <div
                  key={`${entry.root}-${entry.category}`}
                  className="bg-white border border-[#E6DFD3] rounded-2xl p-5 flex flex-col justify-between gap-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xl font-display font-semibold text-[#1C1613]">
                            {entry.root}
                          </span>
                          <span className="text-xs text-[#8C7A6B]" aria-hidden="true">
                            ·
                          </span>
                          <span className="text-sm font-medium text-[#C84B24]">
                            {entry.meaning}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5 text-xs text-[#5C4D43] mt-1">
                          <span>{entry.category}</span>
                          {entry.originNote && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span>{entry.originNote}</span>
                            </>
                          )}
                          {isMastered && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="text-[#1B6B4A] font-semibold">
                                ● Mastered
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => playSageloPhrase(entry.root)}
                          className="p-2 rounded-lg bg-[#F3EFE6] hover:bg-[#C84B24] text-[#1C1613] hover:text-white transition-colors"
                          aria-label={`Pronounce ${entry.root}`}
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            setExpandedRoot(isExpanded ? null : entry.root)
                          }
                          className="px-3 py-1.5 rounded-lg border border-[#E6DFD3] text-xs font-medium text-[#5C4D43] hover:text-[#1C1613] transition-colors whitespace-nowrap"
                        >
                          {isExpanded ? 'Hide 5 Forms' : '5 Word Forms'}
                        </button>
                      </div>
                    </div>

                    {entry.exampleSagelo && (
                      <div className="pt-2 border-t border-[#E6DFD3]/70 flex items-center justify-between gap-2 text-xs">
                        <div>
                          <span className="font-semibold text-[#1C1613]">
                            “{entry.exampleSagelo}”
                          </span>{' '}
                          — <span className="text-[#5C4D43]">{entry.exampleEnglish}</span>
                        </div>
                        <button
                          onClick={() => playSageloPhrase(entry.exampleSagelo || '')}
                          className="text-[#C84B24] hover:underline font-medium shrink-0"
                        >
                          Hear
                        </button>
                      </div>
                    )}
                  </div>

                  {isExpanded && (
                    <div className="pt-3 border-t border-[#E6DFD3] space-y-3 bg-[#FBF9F5] -mx-5 -mb-5 p-5 rounded-b-2xl">
                      <div className="text-xs font-semibold text-[#5C4D43]">
                        {entry.isLoanword
                          ? 'Invariable Loanword (Kept whole out of respect for origin)'
                          : `All 5 Word-Building Endings + Agentive (-ari) for "${entry.root}":`}
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                        <div className="p-2 rounded-lg bg-white border border-[#E6DFD3]">
                          <span className="text-[#8C7A6B] block">Noun (-a)</span>
                          <span className="font-mono-num font-semibold text-[#1C1613]">
                            {derived.noun}
                          </span>
                        </div>
                        <div className="p-2 rounded-lg bg-white border border-[#E6DFD3]">
                          <span className="text-[#8C7A6B] block">Adjective (-e)</span>
                          <span className="font-mono-num font-semibold text-[#1C1613]">
                            {derived.adjective}
                          </span>
                        </div>
                        <div className="p-2 rounded-lg bg-white border border-[#E6DFD3]">
                          <span className="text-[#8C7A6B] block">Verb (-i)</span>
                          <span className="font-mono-num font-semibold text-[#1C1613]">
                            {derived.verb}
                          </span>
                        </div>
                        <div className="p-2 rounded-lg bg-white border border-[#E6DFD3]">
                          <span className="text-[#8C7A6B] block">Abstract (-o)</span>
                          <span className="font-mono-num font-semibold text-[#1C1613]">
                            {derived.abstractNoun}
                          </span>
                        </div>
                        <div className="p-2 rounded-lg bg-white border border-[#E6DFD3]">
                          <span className="text-[#8C7A6B] block">Place (-u)</span>
                          <span className="font-mono-num font-semibold text-[#1C1613]">
                            {derived.place}
                          </span>
                        </div>
                        <div className="p-2 rounded-lg bg-white border border-[#E6DFD3]">
                          <span className="text-[#8C7A6B] block">Person (-ari)</span>
                          <span className="font-mono-num font-semibold text-[#1C1613]">
                            {derived.agentive}
                          </span>
                        </div>
                      </div>
                      <div className="pt-1">
                        <CeremonialWordRenderer text={entry.root} size={44} />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {subTab === 'phrasebook' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            {PHRASEBOOK_CHAPTERS.map(chapter => (
              <div
                key={chapter.id}
                className="bg-white border border-[#E6DFD3] rounded-2xl p-6 space-y-4"
              >
                <div className="border-b border-[#E6DFD3] pb-3 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-mono-num text-[#C84B24] font-semibold">
                      Part VI · Chapter {chapter.chapterNumber}
                    </div>
                    <h3 className="text-xl font-display font-semibold text-[#1C1613]">
                      {chapter.title}
                    </h3>
                    <p className="text-xs text-[#5C4D43]">{chapter.subtitle}</p>
                  </div>
                </div>

                <div className="divide-y divide-[#E6DFD3]">
                  {chapter.phrases.map((p, idx) => {
                    const isJustSaved = savedToast === p.sagelo;
                    return (
                      <div
                        key={idx}
                        className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="space-y-0.5">
                          <div className="text-base font-display font-semibold text-[#1C1613]">
                            {p.sagelo}
                          </div>
                          <div className="text-sm text-[#5C4D43]">{p.english}</div>
                          {p.note && (
                            <div className="text-xs text-[#8C7A6B] italic">
                              Note: {p.note}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => playSageloPhrase(p.sagelo)}
                            className="px-3 py-1.5 rounded-lg bg-[#F3EFE6] hover:bg-[#C84B24] text-[#1C1613] hover:text-white text-xs font-medium inline-flex items-center gap-1.5 transition-colors whitespace-nowrap"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                            <span>Speak</span>
                          </button>
                          <button
                            onClick={() => handleSavePhrase(p.sagelo, p.english)}
                            className="px-3 py-1.5 rounded-lg border border-[#E6DFD3] hover:border-[#1B6B4A] text-xs font-medium text-[#5C4D43] hover:text-[#1B6B4A] inline-flex items-center gap-1 transition-colors whitespace-nowrap"
                          >
                            {isJustSaved ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-[#1B6B4A]" />
                                <span className="text-[#1B6B4A]">Saved</span>
                              </>
                            ) : (
                              <>
                                <PlusCircle className="w-3.5 h-3.5" />
                                <span>Add to Notebook</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {subTab === 'appendix' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white border border-[#E6DFD3] rounded-2xl p-6 space-y-4">
            <h3 className="text-xl font-display font-semibold text-[#1C1613]">
              Appendix 1: Complete Grammar Summary
            </h3>
            <div className="space-y-3 text-sm">
              <div className="p-3 rounded-xl bg-[#FBF9F5] border border-[#E6DFD3]">
                <strong className="text-[#C84B24]">Word-Building Endings:</strong>{' '}
                <span className="font-mono-num">-a</span> concrete noun ·{' '}
                <span className="font-mono-num">-e</span> adjective ·{' '}
                <span className="font-mono-num">-i</span> verb ·{' '}
                <span className="font-mono-num">-o</span> abstract noun ·{' '}
                <span className="font-mono-num">-u</span> place ·{' '}
                <span className="font-mono-num">-ari</span> agentive person
              </div>
              <div className="p-3 rounded-xl bg-[#FBF9F5] border border-[#E6DFD3]">
                <strong className="text-[#C84B24]">7 Noun Class Prefixes:</strong>{' '}
                <span className="font-mono-num">mi-</span> people/beings ·{' '}
                <span className="font-mono-num">ki-</span> tools/objects ·{' '}
                <span className="font-mono-num">lu-</span> ideas/emotions ·{' '}
                <span className="font-mono-num">sa-</span> places ·{' '}
                <span className="font-mono-num">ta-</span> time/events ·{' '}
                <span className="font-mono-num">na-</span> numbers/logic ·{' '}
                <span className="font-mono-num">we-</span> actions/processes
              </div>
              <div className="p-3 rounded-xl bg-[#FBF9F5] border border-[#E6DFD3]">
                <strong className="text-[#C84B24]">Case Particles (after noun):</strong>{' '}
                (unmarked) subject · <span className="font-mono-num">ta</span> direct object ·{' '}
                <span className="font-mono-num">ku</span> to/for ·{' '}
                <span className="font-mono-num">vi</span> with/by means of (also adverb marker) ·{' '}
                <span className="font-mono-num">ndo</span> at/in (place) ·{' '}
                <span className="font-mono-num">doa</span> at/when (time) ·{' '}
                <span className="font-mono-num">wa</span> of (possession)
              </div>
              <div className="p-3 rounded-xl bg-[#FBF9F5] border border-[#E6DFD3]">
                <strong className="text-[#C84B24]">Verb Pre-Slot Order:</strong>{' '}
                Tense (<span className="font-mono-num">pa</span> past, <span className="font-mono-num">fu</span> future) → Negation (<span className="font-mono-num">sim</span>) → Aspect (<span className="font-mono-num">le</span> progressive, <span className="font-mono-num">ko</span> perfect) → Verb
              </div>
              <div className="p-3 rounded-xl bg-[#FBF9F5] border border-[#E6DFD3]">
                <strong className="text-[#C84B24]">Logic & Quantifiers:</strong>{' '}
                <span className="font-mono-num">e</span> AND ·{' '}
                <span className="font-mono-num">o</span> OR (incl.) ·{' '}
                <span className="font-mono-num">oxo</span> XOR (excl.) ·{' '}
                <span className="font-mono-num">ju...juta</span> if...then ·{' '}
                <span className="font-mono-num">kwe</span> if-and-only-if ·{' '}
                <span className="font-mono-num">deka</span> because ·{' '}
                <span className="font-mono-num">lonje</span> therefore ·{' '}
                <span className="font-mono-num">cho</span> all (∀) ·{' '}
                <span className="font-mono-num">mo</span> some (∃)
              </div>
              <div className="p-3 rounded-xl bg-[#FBF9F5] border border-[#E6DFD3]">
                <strong className="text-[#C84B24]">Evidentiality (sentence-final):</strong>{' '}
                <span className="font-mono-num">ha</span> direct witness ·{' '}
                <span className="font-mono-num">ra</span> inference ·{' '}
                <span className="font-mono-num">si</span> hearsay ·{' '}
                <span className="font-mono-num">ni</span> uncertain/question
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#E6DFD3] rounded-2xl p-6 space-y-4">
            <h3 className="text-xl font-display font-semibold text-[#1C1613]">
              Appendix 2: All Invariable Loanwords
            </h3>
            <p className="text-xs text-[#5C4D43]">
              Borrowed whole out of respect for the traditions that named them; used as-is without -a/-e/-i/-o/-u changes.
            </p>
            <div className="overflow-x-auto border border-[#E6DFD3] rounded-xl">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-[#F3EFE6] border-b border-[#E6DFD3]">
                    <th className="py-2.5 px-4 font-semibold">Loanword</th>
                    <th className="py-2.5 px-4 font-semibold">Meaning</th>
                    <th className="py-2.5 px-4 font-semibold">Origin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E6DFD3]">
                  {[
                    ['shanti', 'peace', 'Sanskrit'],
                    ['satya', 'truth', 'Sanskrit'],
                    ['dharma', 'natural law / duty', 'Sanskrit'],
                    ['karma', 'action / consequence', 'Sanskrit'],
                    ['tao', 'the way / path', 'Chinese'],
                    ['chi', 'life-energy', 'Chinese'],
                    ['zen', 'meditative stillness', 'Japanese'],
                    ['mana', 'spiritual power', 'Polynesian'],
                    ['ndoto', 'dream', 'Swahili'],
                    ['mwana / nyango / tata / ndeko / mpaka', 'kinship terms', 'Bantu Family'],
                  ].map(([word, meaning, source]) => (
                    <tr key={word}>
                      <td className="py-2 px-4 font-mono-num font-semibold text-[#C84B24]">
                        {word}
                      </td>
                      <td className="py-2 px-4 text-[#1C1613]">{meaning}</td>
                      <td className="py-2 px-4 text-xs text-[#5C4D43]">{source}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
