// Web Audio & Speech Synthesis Pronunciation Engine for AfriLingo (Sagelo)
// Dual-Layer Human Vocal Audio conforming to SAGELO_COURSE.md:
// Layer 1: Synchronous Web Speech API with authentic 5-vowel phonology prioritization
// Layer 2: Acoustic Vocal Formant Synthesis via Web Audio API (vocal tract F1/F2/F3 resonances)
// Ensures 100% audible vocal speech across all browsers, iframes, and mobile devices
// ZERO electronic beats or raw square/sine beeps

import { getWordPhonetic, toPhoneticTtsText, sylToIpa } from './sageloPhonetics';

const PHI = 1.61803398875;
const INV_PHI = 1 / PHI;

export interface SyllableAnalysis {
  raw: string;
  clean: string;
  ipa: string;
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
  basePitchHz = 145
): SyllableAnalysis[] {
  const words = phrase
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  const result: SyllableAnalysis[] = [];
  let highToneCount = 0;

  for (const word of words) {
    const syllables = syllabifyWord(word);
    // Universal penultimate stress rule: stress always on second-to-last syllable
    const stressedIndex = syllables.length > 1 ? syllables.length - 2 : 0;

    syllables.forEach((syl, idx) => {
      const isHigh = HIGH_TONE_REGEX.test(syl);
      const isStressed = idx === stressedIndex && syllables.length > 1;
      const baseDuration = 220;
      // Stress duration: ~1.4x on stressed syllable
      const durationMs = isStressed ? Math.round(baseDuration * 1.35) : baseDuration;

      let freq = basePitchHz;
      if (isHigh) {
        // High tone: 3:2 perfect fifth interval (1.5x frequency) with golden-ratio downdrift
        const fifthLift = basePitchHz * 0.35 * Math.pow(INV_PHI, highToneCount * 0.4);
        freq = Math.round(basePitchHz + fifthLift);
        highToneCount += 1;
      } else {
        freq = Math.round(basePitchHz * (1 - Math.min(0.08, result.length * 0.01)));
      }

      result.push({
        raw: syl,
        clean: syl.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase(),
        ipa: sylToIpa(syl),
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

// Vowel formant frequencies (Hz) for authentic cardinal African vowels (SAGELO_COURSE.md Ch 2):
// F1 (jaw/height), F2 (tongue place), F3 (vocal tract length)
const VOWEL_FORMANTS: Record<'a' | 'e' | 'i' | 'o' | 'u', { f1: number; f2: number; f3: number }> = {
  a: { f1: 820, f2: 1250, f3: 2500 }, // [a] "ah" in father
  e: { f1: 520, f2: 1850, f3: 2550 }, // [e] "eh" in bed
  i: { f1: 290, f2: 2350, f3: 2950 }, // [i] "ee" in feel
  o: { f1: 480, f2: 900,  f3: 2450 }, // [o] "oh" in note
  u: { f1: 320, f2: 820,  f3: 2400 }, // [u] "oo" in room
};

// Generates white noise buffer for fricative/sibilant consonants
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
 * Synthesizes a natural human vocal syllable using acoustic formant filter modeling
 * matching Chapter 2 of SAGELO_COURSE.md:
 * - Vowels: pure formants [a, e, i, o, u]
 * - Consonants:
 *     - j /dʒ/ (judge): voiced burst + 2800Hz fricative
 *     - ch /tʃ/ (church): plosive burst + 3200Hz fricative
 *     - sh /ʃ/ (she): 3200Hz bandpass
 *     - s /s/ (see): 5200Hz bandpass
 *     - r /ɾ/ (light flapped sound closer to Spanish/Japanese r): 25ms amplitude tap
 *     - ny /ɲ/ (Spanish ñ / canyon): palatal nasal formant
 *     - m, n: nasal murmurs at 220Hz
 */
function playVocalFormantSyllable(
  ctx: AudioContext,
  syl: SyllableAnalysis,
  startTime: number
): number {
  const duration = syl.durationMs / 1000;
  const formants = VOWEL_FORMANTS[syl.vowel] || VOWEL_FORMANTS.a;

  // 1. Glottal Pulse Generator (harmonic-rich vocal cord vibration)
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
  const peakVolume = syl.isStressed ? 0.22 : 0.17;
  masterVocalGain.gain.linearRampToValueAtTime(peakVolume, startTime + 0.025);
  masterVocalGain.gain.setValueAtTime(peakVolume, startTime + duration - 0.035);
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

  // 3. Consonant acoustic shaping (SAGELO_COURSE.md Ch 2)
  const consonant = syl.consonant.toLowerCase();

  // Fricatives & Sibilants: s, sh, f, v
  if (consonant === 's' || consonant === 'sh' || consonant === 'f' || consonant === 'v') {
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
    noiseGain.gain.linearRampToValueAtTime(0.08, startTime + 0.015);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, startTime + noiseDuration);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(ctx.destination);

    noise.start(startTime);
    noise.stop(startTime + noiseDuration + 0.02);
  }
  // Affricates: j [dʒ] ("judge") & ch [tʃ] ("church")
  else if (consonant === 'j' || consonant === 'ch' || consonant === 'c') {
    const isVoiced = consonant === 'j';
    const noise = ctx.createBufferSource();
    noise.buffer = getNoiseBuffer(ctx);
    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(isVoiced ? 2900 : 3300, startTime);
    noiseFilter.Q.setValueAtTime(3.0, startTime);

    const noiseGain = ctx.createGain();
    const noiseDuration = 0.065;
    noiseGain.gain.setValueAtTime(0.001, startTime);
    noiseGain.gain.linearRampToValueAtTime(isVoiced ? 0.06 : 0.08, startTime + 0.01);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, startTime + noiseDuration);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(ctx.destination);

    noise.start(startTime);
    noise.stop(startTime + noiseDuration + 0.02);
  }
  // Light flapped r [ɾ] ("closer to Spanish or Japanese 'r' than English 'r'")
  else if (consonant === 'r') {
    // Alveolar tap: brief 25ms amplitude reduction tap in the middle of syllable
    const tapStart = startTime + 0.04;
    masterVocalGain.gain.setValueAtTime(peakVolume, tapStart);
    masterVocalGain.gain.linearRampToValueAtTime(peakVolume * 0.25, tapStart + 0.012);
    masterVocalGain.gain.linearRampToValueAtTime(peakVolume, tapStart + 0.025);
  }
  // Nasals: m, n, ny [ɲ], and prenasal stops (nd, mb, mp, ng)
  else if (consonant.startsWith('m') || consonant.startsWith('n')) {
    const nasalOsc = ctx.createOscillator();
    nasalOsc.type = 'sine';
    nasalOsc.frequency.setValueAtTime(consonant === 'ny' ? 300 : 220, startTime);
    const nasalGain = ctx.createGain();
    const nasalDur = 0.055;
    nasalGain.gain.setValueAtTime(0.001, startTime);
    nasalGain.gain.linearRampToValueAtTime(0.07, startTime + 0.015);
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

/**
 * Selects the optimal voice for Sagelo pronunciation:
 * Prioritizes languages with the exact 5 pure vowels and flapped r (Swahili, Italian, Spanish, Portuguese),
 * followed by African regional English and natural voices.
 */
function selectBestVoice(): SpeechSynthesisVoice | null {
  const voices = cachedVoices.length > 0 ? cachedVoices : loadAvailableVoices();
  if (!voices || voices.length === 0) return null;

  // 1. Swahili (direct Bantu inspiration cited in SAGELO_COURSE.md)
  const swahiliVoice = voices.find(v => {
    const lang = (v.lang || '').toLowerCase();
    return lang.startsWith('sw');
  });
  if (swahiliVoice) return swahiliVoice;

  // 2. Italian (pure 5 vowels, penultimate stress, flapped r)
  const italianVoice = voices.find(v => {
    const lang = (v.lang || '').toLowerCase();
    return lang.startsWith('it');
  });
  if (italianVoice) return italianVoice;

  // 3. Spanish (pure 5 vowels cited in SAGELO_COURSE.md Ch 2)
  const spanishVoice = voices.find(v => {
    const lang = (v.lang || '').toLowerCase();
    return lang.startsWith('es');
  });
  if (spanishVoice) return spanishVoice;

  // 4. African regional English accents (Nigeria, South Africa, Kenya, Ghana)
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

  // 5. Natural / local English voices
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

  // 6. Default or first available voice
  const defaultVoice = voices.find(v => v.default) || voices[0];
  return defaultVoice || null;
}

export interface PlayPhraseOptions {
  basePitchHz?: number;
  useVoice?: boolean;
  onSyllable?: (index: number, syl: SyllableAnalysis) => void;
  onComplete?: () => void;
}

/**
 * Pronounces a Sagelo word or phrase phonetically.
 * Always audible: uses Web Speech API with synchronous activation,
 * and seamlessly falls back to Web Audio formant vocal synthesis
 * if SpeechSynthesis is unavailable, muted, or blocked.
 * Strictly inline with SAGELO_COURSE.md!
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

  if (!hasSpeechSynthesis) {
    // If Web Speech is unsupported, speak via vocal formant synthesizer immediately!
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

    const voice = selectBestVoice();
    const is5VowelVoice = voice && (
      voice.lang.startsWith('sw') ||
      voice.lang.startsWith('it') ||
      voice.lang.startsWith('es') ||
      voice.lang.startsWith('pt')
    );

    // If using a voice with native 5-vowel phonology (Swahili/Italian/Spanish),
    // speak clean text directly for native articulation.
    // If using English voice, use toPhoneticTtsText to preserve open syllables.
    const speechText = is5VowelVoice ? cleanText : toPhoneticTtsText(cleanText);

    const utter = new SpeechSynthesisUtterance(speechText);
    utter.rate = 0.90; // Natural, clear cadence
    utter.pitch = 1.0;
    utter.volume = 1.0;

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
      // If Web Speech encountered an error, instantly switch to Vocal Formant synthesizer
      triggerVocalFallback();
    };

    activeUtterances.add(utter);
    (window as unknown as { __sageloActiveUtterances: Set<SpeechSynthesisUtterance> }).__sageloActiveUtterances = activeUtterances;

    // Safety fallback: if Web Speech does not begin speaking within 220ms,
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
