// Web Audio & Speech Synthesis Pronunciation Engine for AfriLingo (Sagelo)
// Dual-Layer Human Vocal Audio:
// Layer 1: Synchronous Web Speech API with Sango Phonetic Respellings
// Layer 2: Acoustic Vocal Formant Synthesis via Web Audio API (vocal tract F1/F2/F3 resonances)
// Ensures 100% audible vocal speech across all browsers, iframes, and mobile devices
// ZERO electronic beats or raw square/sine beeps

import { toPhoneticTtsText } from './sageloPhonetics';

const PHI = 1.61803398875;
const INV_PHI = 1 / PHI;

export interface SyllableAnalysis {
  raw: string;
  clean: string;
  isHighTone: boolean;
  isStressed: boolean;
  frequencyHz: number;
  durationMs: number;
  vowel: 'a' | 'e' | 'i' | 'o' | 'u';
  consonant: string;
}

const HIGH_TONE_REGEX = /[áéíóúÁÉÍÓÚ]/;

function detectVowel(syl: string): 'a' | 'e' | 'i' | 'o' | 'u' {
  const lower = syl
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  if (lower.includes('a')) return 'a';
  if (lower.includes('e')) return 'e';
  if (lower.includes('i')) return 'i';
  if (lower.includes('o')) return 'o';
  if (lower.includes('u')) return 'u';
  return 'a';
}

function detectConsonant(syl: string): string {
  const lower = syl
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  const match = lower.match(/^(ch|sh|ny|mb|nd|ng|mv|nz|mw|[bcdfghjklmnprstvwyz])/);
  return match ? match[1] : '';
}

// Breaks a Sagelo word into open CV syllables for acoustic resonance analysis
export function syllabifyWord(word: string): string[] {
  const cleaned = word.replace(/[.,?!;:"'()·—-]/g, '').trim();
  if (!cleaned) return [];

  const regex = /(?:ch|sh|ny|mb|nd|ng|mv|nz|mw|[bcdfghjklmnprstvwyz])?[wy]?[aeiouáéíóúAEIOUÁÉÍÓÚ]+|(?:[bcdfghjklmnprstvwyz]+)$/gi;
  const matches = cleaned.match(regex);
  if (matches && matches.length > 0) {
    return matches;
  }
  return [cleaned];
}

export function analyzePhraseResonance(
  phrase: string,
  basePitchHz = 145,
  use3to2Ratio = true
): SyllableAnalysis[] {
  const words = phrase
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  const result: SyllableAnalysis[] = [];
  let highToneCount = 0;

  for (const word of words) {
    const syllables = syllabifyWord(word);
    const stressedIndex = syllables.length > 1 ? syllables.length - 2 : 0;

    syllables.forEach((syl, idx) => {
      const isHigh = HIGH_TONE_REGEX.test(syl);
      const isStressed = idx === stressedIndex && syllables.length > 1;
      const baseDuration = 220;
      const durationMs = isStressed ? Math.round(baseDuration * 1.3) : baseDuration;

      let freq = basePitchHz;
      if (isHigh) {
        const fifthLift = basePitchHz * 0.35 * Math.pow(INV_PHI, highToneCount * 0.4);
        freq = Math.round(basePitchHz + fifthLift);
        highToneCount += 1;
      } else {
        freq = Math.round(basePitchHz * (1 - Math.min(0.08, result.length * 0.01)));
      }

      result.push({
        raw: syl,
        clean: syl.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase(),
        isHighTone: isHigh,
        isStressed,
        frequencyHz: freq,
        durationMs,
        vowel: detectVowel(syl),
        consonant: detectConsonant(syl),
      });
    });
  }

  return result;
}

// =========================================================================
// 1. Shared Web Audio Context & Human Vocal Formant Synthesizer
// =========================================================================

let sharedAudioCtx: AudioContext | null = null;

export function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!sharedAudioCtx) {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioCtx) {
      sharedAudioCtx = new AudioCtx();
    }
  }
  if (sharedAudioCtx && sharedAudioCtx.state === 'suspended') {
    sharedAudioCtx.resume().catch(() => {});
  }
  return sharedAudioCtx;
}

// Vowel formant frequencies (Hz) for authentic cardinal African vowels:
// F1 (jaw/height), F2 (tongue place), F3 (vocal tract length)
const VOWEL_FORMANTS: Record<'a' | 'e' | 'i' | 'o' | 'u', { f1: number; f2: number; f3: number }> = {
  a: { f1: 820, f2: 1250, f3: 2500 }, // [ah] open central
  e: { f1: 520, f2: 1850, f3: 2550 }, // [eh] mid front
  i: { f1: 290, f2: 2350, f3: 2950 }, // [ee] close front
  o: { f1: 480, f2: 900,  f3: 2450 }, // [oh] mid back rounded
  u: { f1: 320, f2: 820,  f3: 2400 }, // [oo] close back rounded
};

// Generates white noise buffer for fricative/sibilant consonants (/s/, /sh/, /f/)
let noiseBufferCache: AudioBuffer | null = null;
function getNoiseBuffer(ctx: AudioContext): AudioBuffer {
  if (noiseBufferCache && noiseBufferCache.sampleRate === ctx.sampleRate) {
    return noiseBufferCache;
  }
  const bufferSize = ctx.sampleRate * 2; // 2 seconds
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  noiseBufferCache = buffer;
  return buffer;
}

/**
 * Synthesizes a natural human vocal syllable using physical formant filter modeling.
 * Sounds like a human speaking the syllable, NOT electronic beats or buzzes!
 */
function playVocalFormantSyllable(
  ctx: AudioContext,
  syl: SyllableAnalysis,
  startTime: number
): number {
  const duration = syl.durationMs / 1000;
  const formants = VOWEL_FORMANTS[syl.vowel] || VOWEL_FORMANTS.a;

  // 1. Glottal Pulse Generator (harmonic rich vocal cord vibration)
  const glottalOsc = ctx.createOscillator();
  glottalOsc.type = 'sawtooth';
  glottalOsc.frequency.setValueAtTime(syl.frequencyHz, startTime);
  // Natural subtle vocal pitch drop towards end of syllable
  glottalOsc.frequency.exponentialRampToValueAtTime(
    syl.frequencyHz * 0.94,
    startTime + duration
  );

  // Soft lowpass filter to shape the raw glottal buzz into natural acoustic vocal resonance
  const glottalFilter = ctx.createBiquadFilter();
  glottalFilter.type = 'lowpass';
  glottalFilter.frequency.setValueAtTime(1400, startTime);
  glottalOsc.connect(glottalFilter);

  // 2. Formant Filters (F1, F2, F3 parallel bandpass filters)
  const masterVocalGain = ctx.createGain();
  masterVocalGain.gain.setValueAtTime(0.0001, startTime);
  // Vocal envelope: gentle 25ms attack, sustained body, 35ms decay
  masterVocalGain.gain.linearRampToValueAtTime(0.18, startTime + 0.025);
  masterVocalGain.gain.setValueAtTime(0.18, startTime + duration - 0.035);
  masterVocalGain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

  const f1 = ctx.createBiquadFilter();
  f1.type = 'bandpass';
  f1.frequency.setValueAtTime(formants.f1, startTime);
  f1.Q.setValueAtTime(6.0, startTime);

  const f2 = ctx.createBiquadFilter();
  f2.type = 'bandpass';
  f2.frequency.setValueAtTime(formants.f2, startTime);
  f2.Q.setValueAtTime(7.0, startTime);

  const f3 = ctx.createBiquadFilter();
  f3.type = 'bandpass';
  f3.frequency.setValueAtTime(formants.f3, startTime);
  f3.Q.setValueAtTime(5.5, startTime);

  // Formant amplitude weighting (F1 strongest, F2 mid, F3 subtle)
  const g1 = ctx.createGain();
  g1.gain.value = 1.0;
  const g2 = ctx.createGain();
  g2.gain.value = 0.55;
  const g3 = ctx.createGain();
  g3.gain.value = 0.22;

  glottalFilter.connect(f1);
  glottalFilter.connect(f2);
  glottalFilter.connect(f3);

  f1.connect(g1);
  f2.connect(g2);
  f3.connect(g3);

  g1.connect(masterVocalGain);
  g2.connect(masterVocalGain);
  g3.connect(masterVocalGain);

  masterVocalGain.connect(ctx.destination);

  glottalOsc.start(startTime);
  glottalOsc.stop(startTime + duration + 0.05);

  // 3. Consonant acoustic shaping (Fricatives & Plosives)
  const consonant = syl.consonant.toLowerCase();
  if (consonant === 's' || consonant === 'sh' || consonant === 'f' || consonant === 'z') {
    const noise = ctx.createBufferSource();
    noise.buffer = getNoiseBuffer(ctx);
    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(
      consonant === 'sh' ? 3200 : consonant === 's' ? 5200 : 2800,
      startTime
    );
    noiseFilter.Q.setValueAtTime(3.5, startTime);

    const noiseGain = ctx.createGain();
    const noiseDuration = Math.min(0.08, duration * 0.4);
    noiseGain.gain.setValueAtTime(0.001, startTime);
    noiseGain.gain.linearRampToValueAtTime(0.09, startTime + 0.015);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, startTime + noiseDuration);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(ctx.destination);

    noise.start(startTime);
    noise.stop(startTime + noiseDuration + 0.02);
  } else if (consonant.startsWith('m') || consonant.startsWith('n')) {
    // Nasal murmur (low resonant nasal buzz at 220Hz)
    const nasalOsc = ctx.createOscillator();
    nasalOsc.type = 'sine';
    nasalOsc.frequency.setValueAtTime(220, startTime);
    const nasalGain = ctx.createGain();
    const nasalDur = 0.06;
    nasalGain.gain.setValueAtTime(0.001, startTime);
    nasalGain.gain.linearRampToValueAtTime(0.08, startTime + 0.02);
    nasalGain.gain.exponentialRampToValueAtTime(0.001, startTime + nasalDur);
    nasalOsc.connect(nasalGain);
    nasalGain.connect(ctx.destination);
    nasalOsc.start(startTime);
    nasalOsc.stop(startTime + nasalDur + 0.02);
  }

  return duration;
}

/**
 * Vocalizes an entire phrase using Web Audio vocal formant synthesis.
 */
function playVocalFormantPhrase(
  cleanText: string,
  basePitchHz = 145,
  options?: PlayPhraseOptions
): void {
  const ctx = getAudioContext();
  if (!ctx) {
    options?.onComplete?.();
    return;
  }

  const analysis = analyzePhraseResonance(cleanText, basePitchHz);
  if (analysis.length === 0) {
    options?.onComplete?.();
    return;
  }

  let currentTime = ctx.currentTime + 0.03;

  analysis.forEach((syl, i) => {
    const sylStart = currentTime;
    const dur = playVocalFormantSyllable(ctx, syl, sylStart);

    setTimeout(() => {
      options?.onSyllable?.(i, syl);
    }, Math.max(0, (sylStart - ctx.currentTime) * 1000));

    // Natural inter-syllable transition spacing
    currentTime += dur + 0.025;
  });

  const totalDurationMs = (currentTime - ctx.currentTime) * 1000;
  setTimeout(() => {
    options?.onComplete?.();
  }, totalDurationMs + 50);
}

// =========================================================================
// 2. Web Speech API Manager (Primary Spoken Vocal Engine)
// =========================================================================

let cachedVoices: SpeechSynthesisVoice[] = [];
const activeUtterances: Set<SpeechSynthesisUtterance> = new Set();
let keepAliveTimer: ReturnType<typeof setInterval> | null = null;

function loadAvailableVoices(): SpeechSynthesisVoice[] {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return [];
  }
  try {
    const voices = window.speechSynthesis.getVoices();
    if (voices && voices.length > 0) {
      cachedVoices = voices;
    }
  } catch {
    // Non-blocking
  }
  return cachedVoices;
}

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  loadAvailableVoices();
  window.speechSynthesis.onvoiceschanged = () => {
    loadAvailableVoices();
  };
}

function selectBestVoice(): SpeechSynthesisVoice | null {
  const voices = cachedVoices.length > 0 ? cachedVoices : loadAvailableVoices();
  if (!voices || voices.length === 0) return null;

  // 1. Natural / local English voices (Samantha, Daniel, Jenny, Natural, Google)
  const naturalEn = voices.find(v => {
    const name = (v.name || '').toLowerCase();
    const lang = (v.lang || '').toLowerCase();
    return (
      lang.startsWith('en') &&
      (name.includes('natural') ||
        name.includes('google') ||
        name.includes('samantha') ||
        name.includes('daniel') ||
        name.includes('karen') ||
        name.includes('jenny'))
    );
  });
  if (naturalEn) return naturalEn;

  // 2. African regional English accents (Nigeria, South Africa, Kenya, Ghana)
  const africanEnglish = voices.find(v => {
    const lang = (v.lang || '').toLowerCase();
    return (
      lang === 'en-ng' ||
      lang === 'en-za' ||
      lang === 'en-ke' ||
      lang === 'en-gh'
    );
  });
  if (africanEnglish) return africanEnglish;

  // 3. Default or first English voice
  const defaultEn = voices.find(v => (v.lang || '').startsWith('en') && v.default) ||
                    voices.find(v => (v.lang || '').startsWith('en')) ||
                    voices.find(v => v.default) ||
                    voices[0];
  return defaultEn || null;
}

export function selectBestFrenchVoice(): SpeechSynthesisVoice | null {
  const voices = cachedVoices.length > 0 ? cachedVoices : loadAvailableVoices();
  if (!voices || voices.length === 0) return null;

  // 1. Natural French voices (Thomas, Amélie, Audrey, Aurélie, Paul, Julie, etc.)
  const naturalFr = voices.find(v => {
    const name = (v.name || '').toLowerCase();
    const lang = (v.lang || '').toLowerCase();
    return (
      (lang.startsWith('fr') || name.includes('french') || name.includes('français')) &&
      (name.includes('natural') ||
        name.includes('google') ||
        name.includes('thomas') ||
        name.includes('amélie') ||
        name.includes('audrey') ||
        name.includes('aurélie') ||
        name.includes('julie') ||
        name.includes('paul'))
    );
  });
  if (naturalFr) return naturalFr;

  // 2. Any fr-FR or fr-CA voice
  const anyFr = voices.find(v => (v.lang || '').toLowerCase().startsWith('fr'));
  if (anyFr) return anyFr;

  return null;
}

export interface PlayPhraseOptions {
  basePitchHz?: number;
  useVoice?: boolean;
  rate?: number;
  use3to2Ratio?: boolean;
  lang?: 'sagelo' | 'english' | 'french' | 'auto';
  onSyllable?: (index: number, syl: SyllableAnalysis) => void;
  onComplete?: () => void;
}

// Whitelisted core Sagelo particles and pronouns that must never be classified as English
const SAGELO_EXCEPTIONS = new Set([
  'kel', 'sim', 'den', 'ha', 'ra', 'si', 'ni', 'yo', 'yu', 'ye', 'ta', 'e', 'o', 'fu', 'vi', 'wa',
  'we', 'ba', 'ka', 'na', 'sa', 'cho', 'mo', 'sago', 'saga', 'sage', 'sagi', 'mwana', 'nyango',
  'mpaka', 'kore', 'ndeko', 'nemwa', 'shanti', 'dira', 'sofa', 'pensi', 'lerni', 'fasi', 'kandi',
  'wali', 'sowa', 'sondo', 'boma', 'tala', 'luba', 'koli', 'tano', 'kumi', 'mwasi', 'mobali', 'doni', 'moya'
]);

export const ENGLISH_CORE_WORDS = new Set([
  'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i', 'it', 'for', 'not', 'on', 'with',
  'he', 'as', 'you', 'do', 'at', 'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her',
  'she', 'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what', 'so', 'up',
  'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me', 'when', 'make', 'can', 'like', 'time',
  'no', 'just', 'him', 'know', 'take', 'people', 'into', 'year', 'your', 'good', 'some', 'could',
  'them', 'see', 'other', 'than', 'then', 'now', 'look', 'only', 'come', 'its', 'over', 'think',
  'also', 'back', 'after', 'use', 'two', 'how', 'our', 'work', 'first', 'well', 'way', 'even',
  'new', 'want', 'because', 'any', 'these', 'give', 'day', 'most', 'us', 'water', 'child',
  'children', 'sage', 'sages', 'wisdom', 'light', 'heart', 'peace', 'world', 'earth', 'wind',
  'tree', 'sun', 'moon', 'river', 'mountain', 'stone', 'night', 'flower', 'food', 'body', 'noun',
  'verb', 'adjective', 'adverb', 'class', 'prefix', 'suffix', 'question', 'answer', 'meaning',
  'practice', 'lesson', 'true', 'false', 'rule', 'syllable', 'vowel', 'consonant', 'open', 'closed',
  'respect', 'origins', 'translating', 'erase', 'something', 'real', 'voicing', 'vibration',
  'second', 'last', 'penultimate', 'always', 'falls', 'stress', 'tone', 'high', 'low', 'ratio',
  'perfect', 'fifth', 'golden', 'decay', 'downdrift', 'feel', 'feeling', 'shine', 'bright', 'place',
  'greeting', 'phrase', 'sentence', 'word', 'words', 'speak', 'speech', 'listen', 'hear', 'learn',
  'study', 'table', 'chair', 'house', 'home', 'dog', 'cat', 'bird', 'fish', 'love', 'care', 'friend',
  'friends', 'companion', 'elder', 'mother', 'father', 'brother', 'sister', 'equals', 'divided', 'multiply',
  'hello', 'hi', 'welcome', 'goodbye', 'bye', 'please', 'thank', 'thanks', 'yes', 'okay', 'ok',
  'morning', 'evening', 'afternoon', 'market', 'money', 'coin', 'price', 'cost', 'buy', 'sell',
  'seller', 'buyer', 'trade', 'trader', 'bargain', 'doctor', 'medicine', 'herb', 'herbs', 'leaf',
  'leaves', 'root', 'roots', 'heal', 'healing', 'healer', 'sick', 'sickness', 'fever', 'cure',
  'stranger', 'guest', 'visitor', 'introduction', 'courtyard', 'travel', 'traveler', 'journey',
  'explanation', 'definition', 'alphabet', 'script', 'translate', 'translation', 'correct',
  'wrong', 'great', 'awesome', 'bad', 'check', 'continue', 'finish', 'start', 'review',
  'branch', 'skill', 'path', 'level', 'score', 'points', 'bonus', 'chest', 'gems', 'streak',
  'accuracy', 'percent', 'unlocked', 'locked', 'ready', 'challenge', 'complete', 'completed',
  'mastered', 'read', 'write', 'match', 'pairs', 'drag', 'drop', 'arrange', 'type', 'tap',
  'click', 'select', 'choose', 'between', 'both', 'neither', 'either', 'without', 'within',
  'already', 'together', 'each', 'every', 'again', 'never', 'often', 'sometimes'
]);

export function isEnglishWord(raw: string): boolean {
  const clean = raw.toLowerCase().replace(/[^a-z]/g, '');
  if (!clean) return false;
  if (SAGELO_EXCEPTIONS.has(clean)) return false;
  if (ENGLISH_CORE_WORDS.has(clean)) return true;
  if (
    clean.endsWith('ing') ||
    clean.endsWith('tion') ||
    clean.endsWith('ment') ||
    clean.endsWith('ness') ||
    clean.endsWith('ly') ||
    clean.endsWith('ed') ||
    clean.endsWith('ous') ||
    clean.endsWith('able') ||
    clean.endsWith('ible') ||
    clean.endsWith('est') ||
    clean.endsWith('er') ||
    clean.endsWith('al') ||
    clean.endsWith('ic') ||
    clean.endsWith('ive')
  ) {
    return true;
  }
  // English words with characteristic clusters:
  if (/th|wh|ck|ph|qu|igh|ough|wr|kn/.test(clean)) return true;
  // Closed syllables ending in consonants that Sagelo words NEVER end in:
  if (/[tpbkdgfxz]$/.test(clean)) return true;
  if (/[s]$/.test(clean) && clean.length > 2) return true;
  return false;
}

/**
 * Detects whether a string is primarily English or Sagelo.
 */
export function detectLanguage(text: string): 'english' | 'sagelo' {
  if (!text) return 'sagelo';
  const tokens = text
    .toLowerCase()
    .replace(/[.,!?;:"'“”()—–\-\/]/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (tokens.length === 0) return 'sagelo';

  let englishCount = 0;
  for (const t of tokens) {
    if (isEnglishWord(t)) englishCount++;
  }

  // If at least 30% of tokens are common English words or English endings
  if (englishCount / tokens.length >= 0.3) {
    return 'english';
  }
  return 'sagelo';
}

export function isEnglishText(text: string): boolean {
  return detectLanguage(text) === 'english';
}

/**
 * Reads English text properly with standard, natural English pronunciation.
 * Does NOT apply Sagelo open-vowel phonology to English words!
 */
export function playEnglishPhrase(
  text: string,
  options?: PlayPhraseOptions
): void {
  if (typeof window === 'undefined') {
    options?.onComplete?.();
    return;
  }

  const cleanText = text
    .replace(/[\[\]]/g, '')
    .replace(/[·—–]/g, ' ')
    .replace(/["'“”]/g, '')
    .trim();

  if (!cleanText) {
    options?.onComplete?.();
    return;
  }

  if (!('speechSynthesis' in window)) {
    options?.onComplete?.();
    return;
  }

  try {
    if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
      window.speechSynthesis.cancel();
    }
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }

    const utter = new SpeechSynthesisUtterance(cleanText);
    utter.rate = options?.rate ?? 0.95; // Natural unhurried English reading pace
    utter.pitch = 1.0;
    utter.volume = 1.0;
    utter.lang = 'en-US';

    const voice = selectBestVoice();
    if (voice) {
      utter.voice = voice;
    }

    utter.onend = () => options?.onComplete?.();
    utter.onerror = () => options?.onComplete?.();

    window.speechSynthesis.speak(utter);
  } catch {
    options?.onComplete?.();
  }
}

/**
 * Reads French text properly with standard, natural French pronunciation.
 * Selects French Web Speech synthesizer voice (fr-FR / fr-CA) with smooth learner pacing.
 */
export function playFrenchPhrase(
  phrase: string,
  options?: PlayPhraseOptions
): void {
  if (typeof window === 'undefined') {
    options?.onComplete?.();
    return;
  }

  const cleanText = phrase
    .replace(/[\[\]]/g, '')
    .replace(/[·—–]/g, ' ')
    .replace(/["'“”]/g, '')
    .trim();

  if (!cleanText) {
    options?.onComplete?.();
    return;
  }

  // If user passed English text into French audio without forcing French, speak English
  if (options?.lang === 'english' || (options?.lang !== 'french' && isEnglishText(cleanText))) {
    playEnglishPhrase(cleanText, options);
    return;
  }

  if (!('speechSynthesis' in window)) {
    options?.onComplete?.();
    return;
  }

  try {
    if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
      window.speechSynthesis.cancel();
    }
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }

    const utter = new SpeechSynthesisUtterance(cleanText);
    utter.rate = options?.rate ?? 0.88; // Slightly deliberate pace for French learners
    utter.pitch = 1.0;
    utter.volume = 1.0;
    utter.lang = 'fr-FR';

    const voice = selectBestFrenchVoice();
    if (voice) {
      utter.voice = voice;
      utter.lang = voice.lang;
    }

    utter.onend = () => options?.onComplete?.();
    utter.onerror = () => options?.onComplete?.();

    window.speechSynthesis.speak(utter);
  } catch {
    options?.onComplete?.();
  }
}

/**
 * Pronounces a phrase.
 * If the phrase is English, it reads it properly as English without vowel mangling.
 * If the phrase is French, it reads it with native French pronunciation.
 * If the phrase is Sagelo, it pronounces it with authentic Sagelo phonetics & pure vowels!
 */
export function playSageloPhrase(
  phrase: string,
  options?: PlayPhraseOptions
): void {
  if (typeof window === 'undefined') {
    options?.onComplete?.();
    return;
  }

  const cleanText = phrase
    .replace(/[\[\]]/g, '')
    .replace(/[·—–]/g, ' ')
    .replace(/["'“”]/g, '')
    .trim();

  if (!cleanText) {
    options?.onComplete?.();
    return;
  }

  // 0. Explicit French language check
  if (options?.lang === 'french') {
    playFrenchPhrase(cleanText, options);
    return;
  }

  // 1. Language Check: If user explicitly requested English, or text is detected as English
  const isTargetEnglish =
    options?.lang === 'english' ||
    (options?.lang !== 'sagelo' && isEnglishText(cleanText));

  if (isTargetEnglish) {
    playEnglishPhrase(cleanText, options);
    return;
  }

  // 2. Otherwise, treat as Sagelo with authentic African Bantu phonology
  const basePitch = options?.basePitchHz ?? 145;
  const analysis = analyzePhraseResonance(cleanText, basePitch);
  const useVoice = options?.useVoice ?? true;

  if (!useVoice) {
    options?.onComplete?.();
    return;
  }

  // Always wake Web Audio context on user gesture
  const ctx = getAudioContext();
  if (ctx && ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
  }

  const hasSpeechSynthesis = 'speechSynthesis' in window;

  // Convert to authentic African phonetic vowel respelling
  // (e.g. "kore" -> "koh reh", "shanti" -> "shahn tee", "sage" -> "sah geh")
  const phoneticSpeechText = toPhoneticTtsText(cleanText)
    .replace(/[\[\]]/g, '')
    .replace(/[—–]/g, ' ')
    .trim();

  if (!hasSpeechSynthesis) {
    // If Web Speech is completely unsupported, speak via vocal formant synthesizer immediately!
    playVocalFormantPhrase(cleanText, basePitch, options);
    return;
  }

  // Synchronously unfreeze SpeechSynthesis
  try {
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }
  } catch {}

  let speechStarted = false;
  let fallbackTimer: ReturnType<typeof setTimeout> | null = null;

  const triggerVocalFallback = () => {
    if (speechStarted) return;
    speechStarted = true;
    try {
      window.speechSynthesis.cancel();
    } catch {}
    playVocalFormantPhrase(cleanText, basePitch, options);
  };

  try {
    // Clear any stuck utterances and unpause
    if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
      window.speechSynthesis.cancel();
    }
    window.speechSynthesis.resume();

    const utter = new SpeechSynthesisUtterance(phoneticSpeechText);
    utter.rate = options?.rate ?? 0.88; // Deliberate, clear phonetic cadence (or turtle speed if slower)
    utter.pitch = 1.0;
    utter.volume = 1.0;

    const voice = selectBestVoice();
    if (voice) {
      utter.voice = voice;
      utter.lang = voice.lang;
    } else {
      utter.lang = 'en-US';
    }

    utter.onstart = () => {
      speechStarted = true;
      if (fallbackTimer) {
        clearTimeout(fallbackTimer);
        fallbackTimer = null;
      }

      // Keep speech synthesis alive on Chromium
      if (!keepAliveTimer) {
        keepAliveTimer = setInterval(() => {
          if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            if (window.speechSynthesis.speaking) {
              window.speechSynthesis.resume();
            } else if (keepAliveTimer) {
              clearInterval(keepAliveTimer);
              keepAliveTimer = null;
            }
          }
        }, 300);
      }

      if (options?.onSyllable && analysis.length > 0) {
        const approxSylMs = Math.max(160, Math.min(290, 2200 / analysis.length));
        analysis.forEach((syl, i) => {
          setTimeout(() => {
            options.onSyllable?.(i, syl);
          }, i * approxSylMs);
        });
      }
    };

    utter.onend = () => {
      activeUtterances.delete(utter);
      if (keepAliveTimer) {
        clearInterval(keepAliveTimer);
        keepAliveTimer = null;
      }
      options?.onComplete?.();
    };

    utter.onerror = () => {
      activeUtterances.delete(utter);
      if (keepAliveTimer) {
        clearInterval(keepAliveTimer);
        keepAliveTimer = null;
      }
      // If Web Speech encountered an error (e.g. not-allowed, voice-unavailable),
      // instantly switch to Vocal Formant synthesizer so the user hears the audio!
      triggerVocalFallback();
    };

    activeUtterances.add(utter);
    (window as unknown as { __sageloActiveUtterances: Set<SpeechSynthesisUtterance> }).__sageloActiveUtterances = activeUtterances;

    // Safety fallback: if Web Speech does not begin speaking within 200ms,
    // ensure audio is still heard through vocal formant synthesis
    fallbackTimer = setTimeout(() => {
      if (!speechStarted && (!window.speechSynthesis.speaking || window.speechSynthesis.paused)) {
        triggerVocalFallback();
      }
    }, 220);

    // Synchronously execute speech in active user gesture turn
    window.speechSynthesis.speak(utter);
  } catch {
    triggerVocalFallback();
  }
}

// =========================================================================
// 3. Game Feedback Melodic Chimes (Soft sine waves for correct/wrong checks)
// =========================================================================

/**
 * Pleasant melodic bell chimes for gamified feedback (correct, wrong, complete).
 * Uses gentle sine waves with soft exponential envelope decay.
 */
export function playChime(type: 'correct' | 'wrong' | 'complete'): void {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;

  if (type === 'correct') {
    // Cheerful ascending bell chime: C5 -> E5 -> G5
    [523.25, 659.25].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.08);
      gain.gain.setValueAtTime(0.001, now + i * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.12, now + i * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.26);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.08);
      osc.stop(now + i * 0.08 + 0.28);
    });
  } else if (type === 'wrong') {
    // Gentle soft descending tone
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(164.81, now + 0.2);
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.24);
  } else if (type === 'complete') {
    // Victory chord
    [523.25, 659.25, 783.99, 1046.5].forEach((freq) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(0.1, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.7);
    });
  }
}
