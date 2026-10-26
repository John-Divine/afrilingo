import React, { useState } from 'react';
import { Volume2, Play, Sparkles, Sliders, Hash, Feather } from 'lucide-react';
import {
  analyzePhraseResonance,
  playSageloPhrase,
  SyllableAnalysis,
} from '../utils/sageloAudio';
import {
  CeremonialWordRenderer,
  CeremonialSyllableBlock,
} from './CeremonialScriptGlyph';
import { numberToSagelo } from '../data/sageloReference';
import { getWordPhonetic } from '../utils/sageloPhonetics';

const CORE_ROOTS = [
  { root: 'sag', meaning: 'wisdom / know', defaultPrefix: 'mi-' },
  { root: 'lum', meaning: 'light / shine', defaultPrefix: 'ki-' },
  { root: 'kor', meaning: 'heart / feeling', defaultPrefix: 'lu-' },
  { root: 'wai', meaning: 'water / flow', defaultPrefix: 'sa-' },
  { root: 'jua', meaning: 'sun / illuminate', defaultPrefix: 'ta-' },
  { root: 'fon', meaning: 'wind / blow', defaultPrefix: 'sa-' },
  { root: 'sil', meaning: 'tree / forest', defaultPrefix: 'sa-' },
  { root: 'pensi', meaning: 'think / reason', defaultPrefix: 'we-' },
  { root: 'fasi', meaning: 'make / build', defaultPrefix: 'mi-' },
  { root: 'sani', meaning: 'heal / restore', defaultPrefix: 'mi-' },
];

const NOUN_CLASSES = [
  { prefix: '', label: 'None (Everyday)', meaning: 'Unmarked everyday form' },
  { prefix: 'mi-', label: 'mi- (People/Beings)', meaning: 'Living person or being' },
  { prefix: 'ki-', label: 'ki- (Tools/Objects)', meaning: 'Physical tool or vessel' },
  { prefix: 'lu-', label: 'lu- (Ideas/Emotions)', meaning: 'Inner feeling or concept' },
  { prefix: 'sa-', label: 'sa- (Places)', meaning: 'Sanctuary, land, or location' },
  { prefix: 'ta-', label: 'ta- (Time/Cycles)', meaning: 'Day, season, or event' },
  { prefix: 'na-', label: 'na- (Numbers/Logic)', meaning: 'Counted group or pattern' },
  { prefix: 'we-', label: 'we- (Actions)', meaning: 'Process or act in motion' },
];

const ENDINGS = [
  { ending: 'a', label: '-a (Concrete Noun)', pattern: 'a/an ___' },
  { ending: 'e', label: '-e (Adjective)', pattern: '___-like / quality' },
  { ending: 'i', label: '-i (Verb)', pattern: 'to ___' },
  { ending: 'o', label: '-o (Abstract Noun)', pattern: '___-ness / concept' },
  { ending: 'u', label: '-u (Place)', pattern: 'place/sanctuary of ___' },
  { ending: 'ari', label: '-ari (Agentive Person)', pattern: 'one who does ___ (Part VIII)' },
];

const SAMPLE_RESONANCE_PHRASES = [
  {
    sagelo: 'Yó sági, yó ságe, yó óni.',
    english: 'I know, I am wise, I am. (Multiple high tones showing 1/φ golden-ratio downdrift)',
  },
  {
    sagelo: 'sata · sátá',
    english: 'Minimal pair: sata (low tone = a stone) vs. sátá (high tone 3:2 fifth = a strike/blow)',
  },
  {
    sagelo: 'wina · wíná',
    english: 'Minimal pair: wina (low tone = a song) vs. wíná (high tone = to sing urgently right now)',
  },
  {
    sagelo: 'Ságo kándi. Lúmi, kóra lúmi.',
    english: 'Wisdom comes. Shine, let the heart shine.',
  },
];

export const PracticeLabView: React.FC = () => {
  const [activeLab, setActiveLab] = useState<'morph' | 'resonance' | 'script' | 'numbers'>('morph');

  const [selectedRoot, setSelectedRoot] = useState(CORE_ROOTS[0]);
  const [selectedPrefix, setSelectedPrefix] = useState(NOUN_CLASSES[0]);
  const [selectedEnding, setSelectedEnding] = useState(ENDINGS[0]);
  const [isPlural, setIsPlural] = useState(false);

  const [resonanceText, setResonanceText] = useState(SAMPLE_RESONANCE_PHRASES[0].sagelo);
  const [basePitchHz, setBasePitchHz] = useState(220);
  const [activeSyllableIdx, setActiveSyllableIdx] = useState<number | null>(null);

  const [scriptInput, setScriptInput] = useState('Shanti Misaga Africa');
  const [vowelDrillConsonant, setVowelDrillConsonant] = useState('s');

  const [numberVal, setNumberVal] = useState(68);

  const cleanRootBase =
    selectedRoot.root.length > 3 && /[aeiou]$/.test(selectedRoot.root)
      ? selectedRoot.root.slice(0, -1)
      : selectedRoot.root;
  const rawPrefix = selectedPrefix.prefix.replace('-', '');
  const dottedWord = rawPrefix
    ? `${rawPrefix}·${cleanRootBase}${selectedEnding.ending}${isPlural ? ' hu' : ''}`
    : `${cleanRootBase}${selectedEnding.ending}${isPlural ? ' hu' : ''}`;
  const fluentWord = dottedWord.replace('·', '');

  const [use3to2Ratio, setUse3to2Ratio] = useState(true); // 3:2 ratio restored by default

  const resonanceSyllables: SyllableAnalysis[] = analyzePhraseResonance(
    resonanceText,
    basePitchHz,
    use3to2Ratio
  );

  const numberConversion = numberToSagelo(numberVal);

  return (
    <div className="space-y-8 max-w-full overflow-x-hidden text-[#FEF3C7]">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#3D2619] pb-6">
        <div className="space-y-1">
          <div className="text-xs text-[#D4A373]">
            Interactive Linguistic Sandboxes · Parts I, II, V & VIII
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-semibold text-[#FEF3C7]">
            Sagelo Interactive Practice Labs
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-1 p-1.5 bg-[#1E130D] border border-[#3D2619] rounded-xl">
          <button
            onClick={() => setActiveLab('morph')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeLab === 'morph'
                ? 'bg-[#059669] text-[#FEF3C7]'
                : 'text-[#D4A373] hover:text-[#FEF3C7]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Root-Builder Engine</span>
          </button>
          <button
            onClick={() => setActiveLab('resonance')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeLab === 'resonance'
                ? 'bg-[#0D9488] text-[#FEF3C7]'
                : 'text-[#D4A373] hover:text-[#FEF3C7]'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>3:2 Tone & φ Resonance</span>
          </button>
          <button
            onClick={() => setActiveLab('script')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeLab === 'script'
                ? 'bg-[#F59E0B] text-[#150E09]'
                : 'text-[#D4A373] hover:text-[#FEF3C7]'
            }`}
          >
            <Feather className="w-3.5 h-3.5" />
            <span>Ceremonial Script Studio</span>
          </button>
          <button
            onClick={() => setActiveLab('numbers')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeLab === 'numbers'
                ? 'bg-[#059669] text-[#FEF3C7]'
                : 'text-[#D4A373] hover:text-[#FEF3C7]'
            }`}
          >
            <Hash className="w-3.5 h-3.5" />
            <span>Number & Math Lab</span>
          </button>
        </div>
      </div>

      {activeLab === 'morph' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 bg-[#1E130D] border-2 border-[#3D2619] rounded-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div className="text-xs text-[#D4A373]">
                Live Morphological Synthesis · Lessons 1, 3, 8 & Part VIII
              </div>
              <span className="text-xs font-mono-num text-[#10B981] font-semibold">
                ● ACTIVE MORPHOLOGY STAGE
              </span>
            </div>

            <div className="p-6 rounded-xl bg-[#241710] border-2 border-[#3D2619] text-center space-y-4">
              <div className="text-xs font-mono-num text-[#D4A373]">
                Learner Dotted Form: <span className="text-[#F59E0B] font-semibold">{dottedWord}</span>
              </div>

              <div className="space-y-2">
                <div className="text-4xl sm:text-5xl font-display font-semibold text-[#FEF3C7] tracking-tight">
                  {fluentWord}
                </div>
                <div className="font-mono text-sm font-bold text-[#14B8A6] bg-[#0F2D28] px-3 py-1 rounded-xl border border-[#0D9488]/40 inline-block tracking-wide">
                  {getWordPhonetic(fluentWord).display}
                </div>
              </div>

              <div className="text-sm text-[#D4A373] max-w-md mx-auto">
                Meaning: <strong className="text-[#FEF3C7]">{selectedEnding.pattern.replace('___', selectedRoot.meaning)}</strong>
                {selectedPrefix.prefix && ` · Class: ${selectedPrefix.meaning}`}
                {isPlural && ' · Plural (more than one)'}
              </div>

              <div className="pt-2 flex justify-center">
                <button
                  onClick={() => playSageloPhrase(fluentWord)}
                  className="px-5 py-2.5 rounded-xl bg-[#059669] hover:bg-[#10B981] text-[#FEF3C7] text-sm font-black transition-all shadow-xs active:translate-y-0.5 inline-flex items-center gap-2 whitespace-nowrap cursor-pointer"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>Pronounce “{fluentWord}” ({getWordPhonetic(fluentWord).display})</span>
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-semibold text-[#D4A373]">
                Chapter 5 Ceremonial Script Syllabary Representation:
              </div>
              <div className="p-4 rounded-xl bg-[#241710] border-2 border-[#3D2619]">
                <CeremonialWordRenderer text={fluentWord} size={58} />
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-semibold text-[#D4A373]">
                All 6 Derived Forms of Root “{selectedRoot.root}” ({selectedRoot.meaning}):
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {ENDINGS.map(end => {
                  const word = `${cleanRootBase}${end.ending}`;
                  const isCurrent = selectedEnding.ending === end.ending;
                  const phon = getWordPhonetic(word);
                  return (
                    <button
                      key={end.ending}
                      onClick={() => {
                        setSelectedEnding(end);
                        playSageloPhrase(word);
                      }}
                      className={`p-3 rounded-xl border text-left transition-colors cursor-pointer ${
                        isCurrent
                          ? 'bg-[#064E3B] border-[#059669] text-[#10B981]'
                          : 'bg-[#241710] border-[#3D2619] hover:bg-[#2C1D14] text-[#FEF3C7]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <div className="font-mono-num font-black text-sm text-[#FEF3C7]">
                          {word}
                        </div>
                        <Volume2 className="w-3.5 h-3.5 text-[#D4A373] shrink-0" />
                      </div>
                      <div className="font-mono text-[10px] font-bold text-[#14B8A6] bg-[#0F2D28] px-1.5 py-0.2 rounded border border-[#0D9488]/40 inline-block my-0.5">
                        {phon.display}
                      </div>
                      <div className="text-xs text-[#D4A373] truncate">{end.label}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 bg-[#1E130D] border-2 border-[#3D2619] rounded-2xl p-6 space-y-6">
            <div>
              <h3 className="text-lg font-display font-semibold text-[#FEF3C7]">
                Morphology Control Deck
              </h3>
              <p className="text-xs text-[#D4A373]">
                Select a root, attach a Bantu-inspired noun class prefix, and choose a grammatical vowel ending.
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-[#FEF3C7]">
                1. Core Root ({selectedRoot.root} = {selectedRoot.meaning})
              </label>
              <div className="grid grid-cols-2 gap-2">
                {CORE_ROOTS.map(r => (
                  <button
                    key={r.root}
                    onClick={() => setSelectedRoot(r)}
                    className={`px-3 py-2 rounded-lg text-xs font-medium border text-left transition-colors truncate cursor-pointer ${
                      selectedRoot.root === r.root
                        ? 'bg-[#059669] text-[#FEF3C7] border-[#059669]'
                        : 'bg-[#241710] text-[#FEF3C7] border-[#3D2619] hover:border-[#10B981]'
                    }`}
                  >
                    <span className="font-mono-num font-semibold">{r.root}</span> · {r.meaning.split('/')[0]}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-[#FEF3C7]">
                2. Semantic Class Prefix (Lesson 3)
              </label>
              <div className="grid grid-cols-2 gap-2">
                {NOUN_CLASSES.map(nc => (
                  <button
                    key={nc.label}
                    onClick={() => setSelectedPrefix(nc)}
                    className={`px-3 py-2 rounded-lg text-xs font-medium border text-left transition-colors truncate cursor-pointer ${
                      selectedPrefix.label === nc.label
                        ? 'bg-[#0D9488] text-[#FEF3C7] border-[#0D9488]'
                        : 'bg-[#241710] text-[#FEF3C7] border-[#3D2619] hover:border-[#14B8A6]'
                    }`}
                  >
                    {nc.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-[#3D2619] flex items-center justify-between">
              <span className="text-xs font-semibold text-[#FEF3C7]">
                3. Universal Plural Particle “hu” (Lesson 8)
              </span>
              <button
                onClick={() => setIsPlural(p => !p)}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                  isPlural
                    ? 'bg-[#F59E0B] text-[#150E09]'
                    : 'bg-[#241710] border border-[#3D2619] text-[#D4A373]'
                }`}
              >
                {isPlural ? '● Plural (+ hu)' : 'Singular'}
              </button>
            </div>
          </div>
        </div>
      )}

      {activeLab === 'resonance' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 bg-[#1E130D] border-2 border-[#3D2619] rounded-2xl p-6 sm:p-8 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-xs text-[#D4A373]">
                Resonance Pitch Modulation · 3:2 Fifth vs. Flat Natural Cadence
              </div>
              <button
                onClick={() => setUse3to2Ratio(!use3to2Ratio)}
                className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 border cursor-pointer ${
                  use3to2Ratio
                    ? 'bg-[#059669] text-white border-[#047857]'
                    : 'bg-[#241710] text-[#D4A373] border-[#3D2619] hover:bg-[#2C1D14]'
                }`}
                title="Toggle 3:2 perfect fifth tone lift"
              >
                <span>3:2 Ratio:</span>
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono-num font-bold ${
                  use3to2Ratio ? 'bg-[#047857] text-white' : 'bg-[#150E09] text-[#D4A373]'
                }`}>
                  {use3to2Ratio ? 'ON (1.50× Fifth Lift)' : 'OFF (Natural Cadence)'}
                </span>
              </button>
            </div>

            <div className="p-5 rounded-xl bg-[#150E09] border border-[#3D2619] text-[#FEF3C7] space-y-4">
              <div className="flex items-center justify-between text-xs text-[#D4A373] font-mono-num flex-wrap gap-2">
                <span>Base Hum: {basePitchHz} Hz</span>
                <span>
                  Tone Lift:{' '}
                  {use3to2Ratio ? (
                    <strong className="text-[#F59E0B]">3:2 Fifth ({Math.round(basePitchHz * 1.5)} Hz)</strong>
                  ) : (
                    <strong className="text-[#10B981]">OFF (Smooth {basePitchHz} Hz)</strong>
                  )}
                </span>
                <span>φ Stress: 1.62×</span>
              </div>

              <div className="h-48 flex items-end gap-2 pt-6 pb-2 px-2 overflow-x-auto border-b border-[#3D2619]">
                {resonanceSyllables.map((syl, idx) => {
                  const minHz = basePitchHz * 0.85;
                  const maxHz = basePitchHz * (use3to2Ratio ? 1.6 : 1.15);
                  const heightPct = Math.max(
                    22,
                    Math.min(100, Math.round(((syl.frequencyHz - minHz) / (maxHz - minHz)) * 85 + 15))
                  );
                  const isPlayingNow = activeSyllableIdx === idx;

                  return (
                    <button
                      key={`${syl.raw}-${idx}`}
                      onClick={() => playSageloPhrase(syl.raw, { basePitchHz, use3to2Ratio })}
                      className="flex-1 min-w-[44px] flex flex-col items-center justify-end h-full group focus:outline-none cursor-pointer"
                    >
                      <span className="text-[11px] font-mono-num text-[#F59E0B] mb-1">
                        {syl.frequencyHz}Hz
                      </span>
                      <div
                        className={`w-full rounded-t-lg transition-transform duration-150 ${
                          isPlayingNow
                            ? 'bg-[#F59E0B] scale-105'
                            : syl.isHighTone
                            ? (use3to2Ratio ? 'bg-[#0D9488]' : 'bg-[#F59E0B]')
                            : syl.isStressed
                            ? 'bg-[#059669]'
                            : 'bg-[#3D2619] group-hover:bg-[#5A3825]'
                        }`}
                        style={{ height: `${heightPct}%` }}
                      />
                      <span className="mt-2 text-xs font-mono-num font-semibold text-[#FEF3C7]">
                        {syl.raw}
                      </span>
                      <span className="text-[10px] text-[#D4A373]">
                        {syl.isHighTone ? (use3to2Ratio ? '▲ HIGH (3:2)' : '▲ HIGH (OFF)') : syl.isStressed ? '● φ STRESS' : 'LOW'}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center justify-between gap-4 pt-1 flex-wrap">
                <div className="text-xs text-[#D4A373]">
                  Cadence: <span className="font-mono-num text-[#FEF3C7]">{use3to2Ratio ? '3:2 Perfect Fifth Jump' : 'Natural Smooth Pitch (3:2 OFF)'}</span>
                </div>
                <button
                  onClick={() => {
                    setActiveSyllableIdx(0);
                    playSageloPhrase(resonanceText, {
                      basePitchHz,
                      useVoice: true,
                      use3to2Ratio,
                      onSyllable: idx => setActiveSyllableIdx(idx),
                      onComplete: () => setActiveSyllableIdx(null),
                    });
                  }}
                  className="px-4 py-2 rounded-lg bg-[#059669] hover:bg-[#10B981] text-[#FEF3C7] text-xs font-semibold inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Play Phrase Resonance</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-[#241710] border border-[#3D2619]">
                <div className="font-semibold text-[#F59E0B] mb-1">
                  {use3to2Ratio ? '▲ 3:2 Ratio (Active)' : '▲ 3:2 Ratio (Turned Off)'}
                </div>
                <p className="text-[#D4A373]">
                  {use3to2Ratio
                    ? 'High tone (á, é, í, ó, ú) rises by a 3:2 acoustic fifth interval above resting pitch.'
                    : 'Currently turned OFF: pitch stays at natural conversational baseline without musical fifth jumps.'}
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-[#241710] border border-[#3D2619]">
                <div className="font-semibold text-[#10B981] mb-1">● Natural Downdrift</div>
                <p className="text-[#D4A373]">
                  Successive syllables taper naturally across the breath group for relaxed vocal flow.
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-[#241710] border border-[#3D2619]">
                <div className="font-semibold text-[#14B8A6] mb-1">◆ φ Penultimate Stress</div>
                <p className="text-[#D4A373]">
                  The second-to-last syllable maintains steady duration (~1.35×) for clear syllable recognition.
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 bg-[#1E130D] border-2 border-[#3D2619] rounded-2xl p-6 space-y-6">
            <div>
              <h3 className="text-lg font-display font-semibold text-[#FEF3C7]">
                Personal Pitch & Phrase Selector
              </h3>
              <p className="text-xs text-[#D4A373]">
                Chapter 3: Tune to your own natural resting hum rather than a rigid external standard.
              </p>
            </div>

            <div className="space-y-2 bg-[#241710] p-4 rounded-xl border border-[#3D2619]">
              <div className="flex items-center justify-between text-xs font-semibold text-[#FEF3C7]">
                <label htmlFor="pitch-slider">Personal Resting Hum Pitch</label>
                <span className="font-mono-num text-[#F59E0B]">
                  {basePitchHz} Hz (Fifth: {Math.round(basePitchHz * 1.5)} Hz)
                </span>
              </div>
              <input
                id="pitch-slider"
                type="range"
                min={150}
                max={300}
                step={5}
                value={basePitchHz}
                onChange={e => setBasePitchHz(Number(e.target.value))}
                className="w-full accent-[#059669]"
              />
              <div className="flex justify-between text-[11px] font-mono-num text-[#D4A373]">
                <span>150 Hz (Deep Voice)</span>
                <span>220 Hz (A3 Standard)</span>
                <span>300 Hz (Bright Voice)</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-[#FEF3C7]">
                Test Any Sagelo Sentence (Use á, é, í, ó, ú for High Tone):
              </label>
              <input
                type="text"
                value={resonanceText}
                onChange={e => setResonanceText(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#241710] border border-[#3D2619] text-sm text-[#FEF3C7] focus:outline-none focus:border-[#10B981]"
              />
            </div>

            <div className="space-y-2">
              <div className="text-xs font-semibold text-[#FEF3C7]">
                Chapter 3 Minimal Pairs & Mantra Contours:
              </div>
              <div className="space-y-2">
                {SAMPLE_RESONANCE_PHRASES.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setResonanceText(item.sagelo);
                      playSageloPhrase(item.sagelo, { basePitchHz });
                    }}
                    className={`w-full p-3 rounded-xl border text-left transition-colors cursor-pointer ${
                      resonanceText === item.sagelo
                        ? 'bg-[#2C1D14] border-[#F59E0B]'
                        : 'bg-[#241710] border-[#3D2619] hover:bg-[#2C1D14]'
                    }`}
                  >
                    <div className="text-sm font-semibold text-[#FEF3C7]">{item.sagelo}</div>
                    <div className="text-xs text-[#D4A373]">{item.english}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeLab === 'script' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 bg-[#1E130D] border-2 border-[#3D2619] rounded-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div className="text-xs text-[#D4A373]">
                Chapter 5 Featural Syllabary · One Rounded Vessel Block Per Syllable
              </div>
              <button
                onClick={() => playSageloPhrase(scriptInput)}
                className="px-3.5 py-1.5 rounded-lg bg-[#059669] hover:bg-[#10B981] text-[#FEF3C7] text-xs font-semibold inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Chant Inscription</span>
              </button>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-[#D4A373]">
                Type Your Name or Any Sagelo Mantra to Inscribe in Ceremonial Vessels:
              </label>
              <input
                type="text"
                value={scriptInput}
                onChange={e => setScriptInput(e.target.value)}
                placeholder="e.g. Shanti, yo sagi ha"
                className="w-full px-4 py-3 rounded-xl bg-[#241710] border border-[#3D2619] text-base font-medium text-[#FEF3C7] focus:outline-none focus:border-[#10B981]"
              />
            </div>

            <div className="p-6 rounded-xl bg-[#241710] border border-[#3D2619] min-h-[150px] flex items-center justify-center">
              <CeremonialWordRenderer text={scriptInput || 'Sagelo'} size={68} />
            </div>

            <div className="space-y-3 pt-2 border-t border-[#3D2619]">
              <div className="flex items-center justify-between">
                <div className="text-xs font-semibold text-[#FEF3C7]">
                  Drill 2.1 — Interactive Open-Syllable Vowel Ladder (Click to pronounce & view glyph)
                </div>
                <div className="flex flex-wrap gap-1">
                  {['b', 'd', 'g', 'h', 'k', 'l', 'm', 'n', 'ny', 'p', 'r', 's', 'sh', 't', 'v', 'w', 'y'].map(c => (
                    <button
                      key={c}
                      onClick={() => setVowelDrillConsonant(c)}
                      className={`px-2 py-1 rounded text-xs font-mono-num font-semibold cursor-pointer ${
                        vowelDrillConsonant === c
                          ? 'bg-[#059669] text-[#FEF3C7]'
                          : 'bg-[#241710] text-[#D4A373] hover:text-[#FEF3C7]'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-5 gap-3">
                {(['a', 'e', 'i', 'o', 'u'] as const).map(v => {
                  const syl = `${vowelDrillConsonant}${v}`;
                  return (
                    <button
                      key={syl}
                      onClick={() => playSageloPhrase(syl)}
                      className="p-3 rounded-xl bg-[#241710] border border-[#3D2619] hover:border-[#10B981] flex flex-col items-center gap-1 transition-colors cursor-pointer"
                    >
                      <CeremonialSyllableBlock syllable={syl} size={52} showLabel={false} />
                      <span className="text-sm font-mono-num font-semibold text-[#FEF3C7]">
                        {syl}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 bg-[#1E130D] border-2 border-[#3D2619] rounded-2xl p-6 space-y-4">
            <h3 className="text-lg font-display font-semibold text-[#FEF3C7]">
              How to Read a Ceremonial Vessel Block
            </h3>
            <p className="text-xs text-[#D4A373] leading-relaxed">
              Just like Korean Hangul, Sagelo’s ceremonial script teaches its own phonetics through stroke families:
            </p>
            <div className="space-y-2.5 text-xs">
              <div className="p-3 rounded-xl bg-[#241710] border border-[#3D2619]">
                <strong className="text-[#FEF3C7]">1. Nasals (m, n, ny):</strong> 1 dot for <em>m</em>, 2 dots for <em>n</em>, 3 dots for <em>ny</em> at the top of the vessel (more dots = further back in the mouth).
              </div>
              <div className="p-3 rounded-xl bg-[#241710] border border-[#3D2619]">
                <strong className="text-[#FEF3C7]">2. Stops (p, t, k / b, d, g):</strong> A diagonal bar. Voiced stops (<em>b, d, g</em>) add a small voicing tick at the bottom for vocal vibration.
              </div>
              <div className="p-3 rounded-xl bg-[#241710] border border-[#3D2619]">
                <strong className="text-[#FEF3C7]">3. Fricatives (f, v, s, sh, h):</strong> Zigzag of breath — 1 peak for <em>f</em>, 2 for <em>s</em>, 3 for <em>sh</em>; soft curve for <em>h</em>.
              </div>
              <div className="p-3 rounded-xl bg-[#241710] border border-[#3D2619]">
                <strong className="text-[#FEF3C7]">4. Liquids & Glides (l, r / w, y):</strong> Open loop curling left (<em>l</em>) or right (<em>r</em>); side flag for glides (<em>w, y</em>).
              </div>
              <div className="p-3 rounded-xl bg-[#241710] border border-[#3D2619]">
                <strong className="text-[#FEF3C7]">5. Five Vowels (a, o, i, e, u):</strong> Full center line (<em>a</em>), circle (<em>o</em>), center dot (<em>i</em>), high short line (<em>e</em>), low mirror line (<em>u</em>).
              </div>
            </div>
          </div>
        </div>
      )}

      {activeLab === 'numbers' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 bg-[#1E130D] border-2 border-[#3D2619] rounded-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div className="text-xs text-[#D4A373]">
                Lessons 12–13 & Appendix 3 · Transparent Numeral Compounding
              </div>
              <span className="text-xs font-mono-num text-[#10B981] font-semibold">
                ● ZERO IRREGULARITIES
              </span>
            </div>

            <div className="p-6 rounded-xl bg-[#241710] border border-[#3D2619] text-center space-y-3">
              <div className="text-xs font-mono-num text-[#D4A373]">
                Mathematical Structure: {numberConversion.breakdown}
              </div>
              <div className="text-4xl sm:text-5xl font-display font-semibold text-[#FEF3C7]">
                {numberConversion.sagelo}
              </div>
              <div className="text-sm font-mono-num text-[#F59E0B]">
                Group Noun (na- class): na·{numberConversion.sagelo} (“a group of {numberVal}”)
              </div>
              <div className="pt-2">
                <button
                  onClick={() =>
                    playSageloPhrase(numberConversion.sagelo.replace(/-/g, ' '))
                  }
                  className="px-5 py-2.5 rounded-lg bg-[#059669] hover:bg-[#10B981] text-[#FEF3C7] text-sm font-semibold inline-flex items-center gap-2 whitespace-nowrap cursor-pointer"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>Hear Number in Sagelo</span>
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold text-[#FEF3C7]">
                <label htmlFor="num-slider">Select Any Number (0 – 9999)</label>
                <span className="font-mono-num text-base text-[#F59E0B]">{numberVal}</span>
              </div>
              <input
                id="num-slider"
                type="range"
                min={0}
                max={1000}
                value={Math.min(1000, numberVal)}
                onChange={e => setNumberVal(Number(e.target.value))}
                className="w-full accent-[#059669]"
              />
              <div className="flex flex-wrap items-center gap-2 pt-2">
                {[0, 3, 7, 10, 11, 20, 25, 47, 68, 100, 365, 1000].map(preset => (
                  <button
                    key={preset}
                    onClick={() => setNumberVal(preset)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono-num font-semibold border cursor-pointer ${
                      numberVal === preset
                        ? 'bg-[#059669] text-[#FEF3C7] border-[#059669]'
                        : 'bg-[#241710] text-[#FEF3C7] border-[#3D2619] hover:bg-[#2C1D14]'
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 bg-[#1E130D] border-2 border-[#3D2619] rounded-2xl p-6 space-y-4">
            <h3 className="text-lg font-display font-semibold text-[#FEF3C7]">
              Sagelo Mathematical Operators
            </h3>
            <div className="space-y-2.5">
              {[
                { eq: 'Du plus tri sama pen.', eng: '2 + 3 = 5 (plus = add, sama = equals)' },
                { eq: 'Dek minus kwa sama sek.', eng: '10 − 4 = 6 (minus = subtract)' },
                { eq: 'Tri multi kwa sama dek-du.', eng: '3 × 4 = 12 (multi = multiply)' },
                { eq: 'Dek divi du sama pen.', eng: '10 ÷ 2 = 5 (divi = divide)' },
                { eq: 'Dek mori pen.', eng: '10 > 5 (mori = greater than)' },
                { eq: 'Du plus tri mini kem dek.', eng: '2 + 3 < 10 (mini kem = less than)' },
              ].map((item, i) => (
                <div
                  key={i}
                  className="p-3.5 rounded-xl bg-[#241710] border border-[#3D2619] flex items-center justify-between gap-3"
                >
                  <div>
                    <div className="text-sm font-semibold text-[#FEF3C7]">{item.eq}</div>
                    <div className="text-xs text-[#D4A373] font-mono-num">{item.eng}</div>
                  </div>
                  <button
                    onClick={() => playSageloPhrase(item.eq)}
                    className="p-2 rounded-lg bg-[#1E130D] hover:bg-[#059669] text-[#FEF3C7] transition-colors shrink-0 cursor-pointer"
                    aria-label={`Listen to ${item.eq}`}
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
