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
import {
  FRENCH_DICTIONARY,
  FRENCH_PHRASEBOOK_CHAPTERS,
  FRENCH_PROVERBS,
  FrenchDictionaryEntry,
} from '../data/frenchReference';
import { playSageloPhrase } from '../utils/sageloAudio';
import { getWordPhonetic, getPhrasePhoneticDisplay } from '../utils/sageloPhonetics';
import { CeremonialWordRenderer } from './CeremonialScriptGlyph';

interface LexiconPhrasebookViewProps {
  masteredWords: string[];
  onSaveToNotebook: (sagelo: string, english: string) => void;
  activeCourse?: 'sagelo' | 'french';
}

export const LexiconPhrasebookView: React.FC<LexiconPhrasebookViewProps> = ({
  masteredWords,
  onSaveToNotebook,
  activeCourse = 'sagelo',
}) => {
  const isFrench = activeCourse === 'french';
  const targetLang = isFrench ? 'french' : 'sagelo';

  const [subTab, setSubTab] = useState<'dictionary' | 'phrasebook' | 'appendix'>('dictionary');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [expandedRoot, setExpandedRoot] = useState<string | null>(isFrench ? 'Bonjour' : 'sag');
  const [savedToast, setSavedToast] = useState<string | null>(null);
  const [speakingPhrase, setSpeakingPhrase] = useState<string | null>(null);

  const handleSpeakPhrase = (phrase: string) => {
    if (!phrase) return;
    setSpeakingPhrase(phrase);
    playSageloPhrase(phrase, {
      lang: targetLang,
      onComplete: () => {
        setSpeakingPhrase(prev => (prev === phrase ? null : prev));
      },
    });
  };

  const activeDict = isFrench ? (FRENCH_DICTIONARY as unknown as DictionaryEntry[]) : SAGELO_DICTIONARY;
  const activePhrasebook = isFrench ? FRENCH_PHRASEBOOK_CHAPTERS : PHRASEBOOK_CHAPTERS;

  const categories = useMemo(() => {
    const set = new Set<string>(['All']);
    activeDict.forEach(d => set.add(d.category));
    return Array.from(set);
  }, [activeDict]);

  const filteredDictionary = useMemo(() => {
    return activeDict.filter(entry => {
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
  }, [activeDict, searchQuery, selectedCategory]);

  const handleSavePhrase = (sagelo: string, english: string) => {
    onSaveToNotebook(sagelo, english);
    setSavedToast(sagelo);
    setTimeout(() => setSavedToast(null), 2200);
  };

  return (
    <div className="space-y-8 max-w-full overflow-x-hidden text-[#FEF3C7]">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#3D2619] pb-6">
        <div className="space-y-1">
          <div className="text-xs text-[#D4A373]">
            {isFrench
              ? 'Le Lexique et Guide Pratique de la Langue Française'
              : 'Parts III, V, VI & VIII · Living Reference & Practical Phrasebook'}
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-semibold text-[#FEF3C7]">
            {isFrench
              ? 'French Dictionary, Phrasebook & Grammar Guide 🥐'
              : 'Sagelo Dictionary, Phrasebook & Grammar Reference 🌍'}
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-[#1E130D] border border-[#3D2619] rounded-2xl">
          <button
            onClick={() => setSubTab('dictionary')}
            className={`px-3.5 py-2 text-xs font-black rounded-xl transition-colors inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              subTab === 'dictionary'
                ? 'bg-[#059669] text-[#FEF3C7] shadow-xs'
                : 'text-[#D4A373] hover:text-[#FEF3C7]'
            }`}
          >
            <BookMarked className="w-3.5 h-3.5" />
            <span>Vocabulary ({activeDict.length} Words)</span>
          </button>
          <button
            onClick={() => setSubTab('phrasebook')}
            className={`px-3.5 py-2 text-xs font-black rounded-xl transition-colors inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              subTab === 'phrasebook'
                ? 'bg-[#0D9488] text-[#FEF3C7] shadow-xs'
                : 'text-[#D4A373] hover:text-[#FEF3C7]'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Phrasebook ({activePhrasebook.length} Chapters)</span>
          </button>
          <button
            onClick={() => setSubTab('appendix')}
            className={`px-3.5 py-2 text-xs font-black rounded-xl transition-colors inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              subTab === 'appendix'
                ? 'bg-[#F59E0B] text-[#1E130D] shadow-xs'
                : 'text-[#D4A373] hover:text-[#FEF3C7]'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Grammar Essentials</span>
          </button>
        </div>
      </div>

      {subTab === 'dictionary' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#A38260] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search English or Sagelo root (e.g., wisdom, water, sag, nyango, peace)..."
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#1E130D] border-2 border-[#3D2619] text-sm text-[#FEF3C7] placeholder-[#8A6C53] focus:outline-hidden focus:border-[#059669]"
              />
            </div>

            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="px-4 py-2.5 rounded-2xl bg-[#1E130D] border-2 border-[#3D2619] text-sm text-[#FEF3C7] focus:outline-hidden focus:border-[#059669] cursor-pointer"
            >
              {categories.map(cat => (
                <option key={cat} value={cat} className="bg-[#1E130D] text-[#FEF3C7]">
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
                  className="bg-[#1E130D] border-2 border-b-4 border-[#3D2619] hover:border-[#059669] rounded-2xl p-5 flex flex-col justify-between gap-4 transition-all shadow-xs"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xl font-display font-semibold text-[#FEF3C7]">
                            {entry.root}
                          </span>
                          {isFrench ? (
                            (entry as unknown as FrenchDictionaryEntry).pronunciation && (
                              <span className="font-mono text-xs font-bold text-[#14B8A6] bg-[#241710] px-2 py-0.5 rounded-lg border border-[#0D9488]/40">
                                {(entry as unknown as FrenchDictionaryEntry).pronunciation}
                              </span>
                            )
                          ) : (
                            <span className="font-mono text-xs font-bold text-[#14B8A6] bg-[#241710] px-2 py-0.5 rounded-lg border border-[#0D9488]/40">
                              {getWordPhonetic(entry.root).display}
                            </span>
                          )}
                          <span className="text-xs text-[#8A6C53]" aria-hidden="true">
                            ·
                          </span>
                          <span className="text-sm font-black text-[#F59E0B]">
                            {entry.meaning}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5 text-xs text-[#D4A373] mt-1">
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
                              <span className="text-[#10B981] font-black">
                                ● Mastered
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => handleSpeakPhrase(entry.root)}
                          className={`p-2 rounded-xl transition-colors cursor-pointer ${
                            speakingPhrase === entry.root
                              ? 'bg-[#059669] text-[#FEF3C7] shadow-xs'
                              : 'bg-[#241710] hover:bg-[#059669] text-[#FEF3C7]'
                          }`}
                          aria-label={`Pronounce ${entry.root}`}
                        >
                          <Volume2 className={`w-4 h-4 ${speakingPhrase === entry.root ? 'animate-pulse' : ''}`} />
                        </button>
                        <button
                          onClick={() =>
                            setExpandedRoot(isExpanded ? null : entry.root)
                          }
                          className="px-3 py-1.5 rounded-xl border border-[#3D2619] bg-[#241710] text-xs font-bold text-[#D4A373] hover:text-[#FEF3C7] hover:border-[#0D9488] transition-colors whitespace-nowrap cursor-pointer"
                        >
                          {isExpanded ? 'Hide Forms' : 'Word Forms'}
                        </button>
                      </div>
                    </div>

                    {entry.exampleSagelo && (
                      <div className="pt-2 border-t border-[#3D2619] flex items-center justify-between gap-2 text-xs flex-wrap">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-semibold text-[#FEF3C7]">
                            “{entry.exampleSagelo}”
                          </span>
                          <span className="font-mono text-[10px] font-bold text-[#14B8A6] bg-[#241710] px-1.5 py-0.2 rounded border border-[#0D9488]/40">
                            {getPhrasePhoneticDisplay(entry.exampleSagelo)}
                          </span>
                          <span className="text-[#D4A373]">— {entry.exampleEnglish}</span>
                        </div>
                        <button
                          onClick={() => handleSpeakPhrase(entry.exampleSagelo || '')}
                          className="text-[#F59E0B] hover:underline font-bold shrink-0 flex items-center gap-1 cursor-pointer"
                        >
                          <Volume2 className="w-3 h-3" />
                          <span>{speakingPhrase === entry.exampleSagelo ? 'Speaking...' : 'Hear'}</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {isExpanded && (
                    <div className="pt-3 border-t border-[#3D2619] space-y-3 bg-[#170E08] -mx-5 -mb-5 p-5 rounded-b-2xl">
                      {isFrench ? (
                        <div className="space-y-2">
                          <div className="text-xs font-black uppercase text-[#D4A373]">
                            Exemple en Contexte :
                          </div>
                          <div className="p-3 bg-[#241710] rounded-xl border border-[#3D2619] flex items-center justify-between gap-3">
                            <div className="space-y-0.5">
                              <div className="text-sm font-black text-[#FEF3C7]">
                                {(entry as unknown as FrenchDictionaryEntry).exampleSagelo || entry.root}
                              </div>
                              <div className="text-xs text-[#D4A373]">
                                {(entry as unknown as FrenchDictionaryEntry).exampleEnglish || entry.meaning}
                              </div>
                            </div>
                            <button
                              onClick={() => handleSpeakPhrase((entry as unknown as FrenchDictionaryEntry).exampleSagelo || entry.root)}
                              className="px-3 py-1.5 rounded-xl bg-[#059669] border border-[#047857] text-[#FEF3C7] text-xs font-black flex items-center gap-1.5 hover:bg-[#047857] transition-all cursor-pointer"
                            >
                              <Volume2 className="w-3.5 h-3.5" />
                              <span>Écouter</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="text-xs font-black uppercase text-[#D4A373]">
                            {entry.isLoanword
                              ? 'Invariable Loanword (Kept whole out of respect for origin)'
                              : `All 5 Word-Building Endings + Agentive (-ari) for "${entry.root}":`}
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                            {[
                              { label: 'Noun (-a)', word: derived.noun },
                              { label: 'Adjective (-e)', word: derived.adjective },
                              { label: 'Verb (-i)', word: derived.verb },
                              { label: 'Abstract (-o)', word: derived.abstractNoun },
                              { label: 'Place (-u)', word: derived.place },
                              { label: 'Person (-ari)', word: derived.agentive },
                            ].map(item => (
                              <button
                                key={item.label}
                                onClick={() => handleSpeakPhrase(item.word)}
                                className="p-2.5 rounded-xl bg-[#241710] border border-[#3D2619] hover:border-[#059669] text-left transition-all group cursor-pointer shadow-2xs"
                              >
                                <span className="text-[#A38260] block text-[10px] uppercase font-bold">{item.label}</span>
                                <div className="flex items-center justify-between gap-1">
                                  <span className="font-mono-num font-black text-[#FEF3C7] group-hover:text-[#10B981]">
                                    {item.word}
                                  </span>
                                  <Volume2 className="w-3 h-3 text-[#A38260] group-hover:text-[#10B981] shrink-0" />
                                </div>
                                <span className="font-mono text-[9px] font-extrabold text-[#14B8A6] bg-[#1E130D] px-1 py-0.2 rounded border border-[#0D9488]/30 inline-block mt-0.5">
                                  {getWordPhonetic(item.word).display}
                                </span>
                              </button>
                            ))}
                          </div>
                          <div className="pt-1">
                            <CeremonialWordRenderer text={entry.root} size={44} />
                          </div>
                        </>
                      )}
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
            {activePhrasebook.map((chapter: any) => (
              <div
                key={chapter.id}
                className="bg-[#1E130D] border-2 border-b-6 border-[#3D2619] rounded-2xl p-6 space-y-4"
              >
                <div className="border-b border-[#3D2619] pb-3 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-mono-num text-[#F59E0B] font-black uppercase tracking-wider">
                      {isFrench ? 'Guide Pratique' : 'Part VI'} · Chapter {chapter.chapterNumber}
                    </div>
                    <h3 className="text-xl font-display font-semibold text-[#FEF3C7]">
                      {chapter.title}
                    </h3>
                    <p className="text-xs text-[#D4A373]">{chapter.subtitle}</p>
                  </div>
                </div>

                <div className="divide-y divide-[#3D2619]">
                  {chapter.phrases.map((p: any, idx: number) => {
                    const isJustSaved = savedToast === p.sagelo;
                    return (
                      <div
                        key={idx}
                        className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-base font-display font-semibold text-[#FEF3C7]">
                              {p.sagelo}
                            </span>
                            {!isFrench && (
                              <span className="font-mono text-xs font-bold text-[#14B8A6] bg-[#241710] px-2 py-0.5 rounded-lg border border-[#0D9488]/40">
                                {getPhrasePhoneticDisplay(p.sagelo)}
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-[#D4A373]">{p.english}</div>
                          {p.note && (
                            <div className="text-xs text-[#A38260] italic">
                              Note: {p.note}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => handleSpeakPhrase(p.sagelo)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-black inline-flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
                              speakingPhrase === p.sagelo
                                ? 'bg-[#059669] text-[#FEF3C7] shadow-xs'
                                : 'bg-[#241710] hover:bg-[#059669] text-[#FEF3C7]'
                            }`}
                          >
                            <Volume2 className={`w-3.5 h-3.5 ${speakingPhrase === p.sagelo ? 'animate-pulse' : ''}`} />
                            <span>{speakingPhrase === p.sagelo ? 'Speaking...' : 'Speak'}</span>
                          </button>
                          <button
                            onClick={() => handleSavePhrase(p.sagelo, p.english)}
                            className="px-3 py-1.5 rounded-xl border border-[#3D2619] bg-[#241710] hover:border-[#10B981] text-xs font-black text-[#D4A373] hover:text-[#10B981] inline-flex items-center gap-1 transition-colors whitespace-nowrap cursor-pointer"
                          >
                            {isJustSaved ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-[#10B981]" />
                                <span className="text-[#10B981]">Saved</span>
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
          <div className="bg-[#1E130D] border-2 border-b-6 border-[#3D2619] rounded-2xl p-6 space-y-4">
            <h3 className="text-xl font-display font-semibold text-[#FEF3C7]">
              Appendix 1: Complete Grammar Summary
            </h3>
            <div className="space-y-3 text-sm">
              <div className="p-3 rounded-2xl bg-[#241710] border border-[#3D2619]">
                <strong className="text-[#10B981]">Word-Building Endings:</strong>{' '}
                <span className="font-mono-num text-[#FEF3C7]">-a</span> concrete noun ·{' '}
                <span className="font-mono-num text-[#FEF3C7]">-e</span> adjective ·{' '}
                <span className="font-mono-num text-[#FEF3C7]">-i</span> verb ·{' '}
                <span className="font-mono-num text-[#FEF3C7]">-o</span> abstract noun ·{' '}
                <span className="font-mono-num text-[#FEF3C7]">-u</span> place ·{' '}
                <span className="font-mono-num text-[#FEF3C7]">-ari</span> agentive person
              </div>
              <div className="p-3 rounded-2xl bg-[#241710] border border-[#3D2619]">
                <strong className="text-[#14B8A6]">7 Noun Class Prefixes:</strong>{' '}
                <span className="font-mono-num text-[#FEF3C7]">mi-</span> people/beings ·{' '}
                <span className="font-mono-num text-[#FEF3C7]">ki-</span> tools/objects ·{' '}
                <span className="font-mono-num text-[#FEF3C7]">lu-</span> ideas/emotions ·{' '}
                <span className="font-mono-num text-[#FEF3C7]">sa-</span> places ·{' '}
                <span className="font-mono-num text-[#FEF3C7]">ta-</span> time/events ·{' '}
                <span className="font-mono-num text-[#FEF3C7]">na-</span> numbers/logic ·{' '}
                <span className="font-mono-num text-[#FEF3C7]">we-</span> actions/processes
              </div>
              <div className="p-3 rounded-2xl bg-[#241710] border border-[#3D2619]">
                <strong className="text-[#F59E0B]">Case Particles (after noun):</strong>{' '}
                (unmarked) subject · <span className="font-mono-num text-[#FEF3C7]">ta</span> direct object ·{' '}
                <span className="font-mono-num text-[#FEF3C7]">ku</span> to/for ·{' '}
                <span className="font-mono-num text-[#FEF3C7]">vi</span> with/by means of ·{' '}
                <span className="font-mono-num text-[#FEF3C7]">ndo</span> at/in ·{' '}
                <span className="font-mono-num text-[#FEF3C7]">doa</span> at/when ·{' '}
                <span className="font-mono-num text-[#FEF3C7]">wa</span> of
              </div>
              <div className="p-3 rounded-2xl bg-[#241710] border border-[#3D2619]">
                <strong className="text-[#10B981]">Verb Pre-Slot Order:</strong>{' '}
                Tense (<span className="font-mono-num text-[#FEF3C7]">pa</span> past, <span className="font-mono-num text-[#FEF3C7]">fu</span> future) → Negation (<span className="font-mono-num text-[#FEF3C7]">sim</span>) → Aspect (<span className="font-mono-num text-[#FEF3C7]">le</span> progressive, <span className="font-mono-num text-[#FEF3C7]">ko</span> perfect) → Verb
              </div>
              <div className="p-3 rounded-2xl bg-[#241710] border border-[#3D2619]">
                <strong className="text-[#14B8A6]">Logic & Quantifiers:</strong>{' '}
                <span className="font-mono-num text-[#FEF3C7]">e</span> AND ·{' '}
                <span className="font-mono-num text-[#FEF3C7]">o</span> OR ·{' '}
                <span className="font-mono-num text-[#FEF3C7]">ju...juta</span> if...then ·{' '}
                <span className="font-mono-num text-[#FEF3C7]">deka</span> because ·{' '}
                <span className="font-mono-num text-[#FEF3C7]">cho</span> all ·{' '}
                <span className="font-mono-num text-[#FEF3C7]">mo</span> some
              </div>
              <div className="p-3 rounded-2xl bg-[#241710] border border-[#3D2619]">
                <strong className="text-[#F59E0B]">Evidentiality (sentence-final):</strong>{' '}
                <span className="font-mono-num text-[#FEF3C7]">ha</span> direct witness ·{' '}
                <span className="font-mono-num text-[#FEF3C7]">ra</span> inference ·{' '}
                <span className="font-mono-num text-[#FEF3C7]">si</span> hearsay ·{' '}
                <span className="font-mono-num text-[#FEF3C7]">ni</span> question
              </div>
            </div>
          </div>

          <div className="bg-[#1E130D] border-2 border-b-6 border-[#3D2619] rounded-2xl p-6 space-y-4">
            <h3 className="text-xl font-display font-semibold text-[#FEF3C7]">
              Appendix 2: Invariable Loanwords
            </h3>
            <p className="text-xs text-[#D4A373]">
              Borrowed whole out of respect for origin traditions; used as-is without suffix alterations.
            </p>
            <div className="overflow-x-auto border border-[#3D2619] rounded-2xl">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-[#241710] border-b border-[#3D2619] text-[#D4A373]">
                    <th className="py-2.5 px-4 font-black">Loanword</th>
                    <th className="py-2.5 px-4 font-black">Meaning</th>
                    <th className="py-2.5 px-4 font-black">Origin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#3D2619]">
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
                    <tr key={word} className="hover:bg-[#241710]/50 transition-colors">
                      <td className="py-2 px-4 font-mono-num font-black text-[#F59E0B]">
                        {word}
                      </td>
                      <td className="py-2 px-4 text-[#FEF3C7]">{meaning}</td>
                      <td className="py-2 px-4 text-xs text-[#D4A373]">{source}</td>
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
