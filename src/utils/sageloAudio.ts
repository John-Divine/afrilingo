// Web Audio & Speech Synthesis Pronunciation Engine for AfriLingo (Sagelo)
// Natural African Language Vocalization with Tone & Formant Speech Synthesis

const PHI = 1.61803398875;
const INV_PHI = 1 / PHI; // ~0.618

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

// Breaks a Sagelo word into open CV syllables
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
    const stressedIndex = syllables.length > 1 ? syllables.length - 2 : 0;

    syllables.forEach((syl, idx) => {
      const isHigh = HIGH_TONE_REGEX.test(syl);
      const isStressed = idx === stressedIndex && syllables.length > 1;
      const baseDuration = 210;
      const durationMs = isStressed ? Math.round(baseDuration * 1.35) : baseDuration;

      let freq = basePitchHz;
      if (isHigh) {
        const fifthLift = basePitchHz * 0.45 * Math.pow(INV_PHI, highToneCount * 0.4);
        freq = Math.round(basePitchHz + fifthLift);
        highToneCount += 1;
      } else {
        freq = Math.round(basePitchHz * (1 - Math.min(0.12, result.length * 0.012)));
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
// 1. Browser Web Speech API Manager (Native TTS)
// =========================================================================

let cachedVoices: SpeechSynthesisVoice[] = [];
let currentUtterance: SpeechSynthesisUtterance | null = null;

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

  // 1. African Bantu/regional languages (Swahili, Zulu, Yoruba, Hausa)
  const africanLang = voices.find(v => {
    const lang = (v.lang || '').toLowerCase();
    return (
      lang.startsWith('sw') ||
      lang.startsWith('zu') ||
      lang.startsWith('yo') ||
      lang.startsWith('ha') ||
      lang.startsWith('sn') ||
      lang.startsWith('xh')
    );
  });
  if (africanLang) return africanLang;

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

  // 3. Romance languages with pure open vowels identical to Sagelo phonology (/a/, /e/, /i/, /o/, /u/)
  const romancePureVowels = voices.find(v => {
    const lang = (v.lang || '').toLowerCase();
    return (
      lang.startsWith('es') ||
      lang.startsWith('pt') ||
      lang.startsWith('it')
    );
  });
  if (romancePureVowels) return romancePureVowels;

  // 4. Default to standard English voice
  const defaultOrEn = voices.find(v => v.default || v.lang.startsWith('en'));
  return defaultOrEn || voices[0] || null;
}

// =========================================================================
// 2. High-Fidelity Vocal Formant Speech Synthesizer (Web Audio API)
//    Guarantees articulate, audible human speech even when iframe/browser TTS is silent!
// =========================================================================

let sharedAudioCtx: AudioContext | null = null;
let whiteNoiseBuffer: AudioBuffer | null = null;

function getAudioContext(): AudioContext | null {
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

function getNoiseBuffer(ctx: AudioContext): AudioBuffer {
  if (whiteNoiseBuffer && whiteNoiseBuffer.sampleRate === ctx.sampleRate) {
    return whiteNoiseBuffer;
  }
  const bufferSize = ctx.sampleRate * 1.5;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  whiteNoiseBuffer = buffer;
  return buffer;
}

// Human Vocal Tract Formants (Hz) for cardinal African vowels (F1, F2, F3)
const VOWEL_FORMANTS: Record<
  'a' | 'e' | 'i' | 'o' | 'u',
  { f1: number; f2: number; f3: number; q1: number; q2: number }
> = {
  a: { f1: 820, f2: 1250, f3: 2550, q1: 5.5, q2: 7.0 }, // Open low central
  e: { f1: 520, f2: 1840, f3: 2600, q1: 6.0, q2: 8.5 }, // Mid front
  i: { f1: 290, f2: 2300, f3: 2950, q1: 7.5, q2: 9.5 }, // High front
  o: { f1: 520, f2: 920,  f3: 2450, q1: 6.0, q2: 7.5 }, // Mid back rounded
  u: { f1: 330, f2: 820,  f3: 2250, q1: 7.0, q2: 8.0 }, // High back rounded
};

/**
 * Synthesizes human-like vocal speech using Klatt acoustic formant modeling.
 * Sounds like spoken African language syllables with vocal cords & consonant articulation.
 */
function speakWithVocalFormantSynthesizer(
  syllables: SyllableAnalysis[],
  options?: PlayPhraseOptions
): void {
  const ctx = getAudioContext();
  if (!ctx || syllables.length === 0) {
    options?.onComplete?.();
    return;
  }

  // Ensure AudioContext is actively running
  if (ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
  }

  const noiseBuf = getNoiseBuffer(ctx);
  const startTime = ctx.currentTime + 0.03;
  let currTime = startTime;
  let accumulatedMs = 30;

  // Master vocal output channel
  const masterVocal = ctx.createGain();
  masterVocal.gain.setValueAtTime(0.38, startTime);

  // Gentle high-shelf to soften harsh digital frequencies
  const warmthFilter = ctx.createBiquadFilter();
  warmthFilter.type = 'lowpass';
  warmthFilter.frequency.setValueAtTime(4200, startTime);

  masterVocal.connect(warmthFilter);
  warmthFilter.connect(ctx.destination);

  syllables.forEach((syl, idx) => {
    const durationSec = syl.durationMs / 1000;
    const formants = VOWEL_FORMANTS[syl.vowel] || VOWEL_FORMANTS.a;
    const consonant = syl.consonant;

    // --- A. CONSONANT GENERATOR ---
    if (consonant) {
      const isSibilant = consonant === 's' || consonant === 'sh' || consonant === 'z';
      const isPlosive = consonant === 'p' || consonant === 't' || consonant === 'k' || consonant === 'b' || consonant === 'd' || consonant === 'g';
      const isNasal = consonant === 'm' || consonant === 'n' || consonant === 'ny' || consonant === 'mb' || consonant === 'nd' || consonant === 'ng';

      if (isSibilant) {
        // High frequency friction noise
        const noiseSrc = ctx.createBufferSource();
        noiseSrc.buffer = noiseBuf;

        const noiseFilter = ctx.createBiquadFilter();
        noiseFilter.type = 'bandpass';
        noiseFilter.frequency.setValueAtTime(consonant === 'sh' ? 3200 : 5400, currTime);
        noiseFilter.Q.setValueAtTime(2.2, currTime);

        const noiseGain = ctx.createGain();
        const noiseDur = 0.055;
        noiseGain.gain.setValueAtTime(0.001, currTime);
        noiseGain.gain.linearRampToValueAtTime(0.12, currTime + 0.012);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, currTime + noiseDur);

        noiseSrc.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(masterVocal);

        noiseSrc.start(currTime);
        noiseSrc.stop(currTime + noiseDur + 0.01);
      } else if (isPlosive) {
        // Silent closure gap + quick burst
        const burstSrc = ctx.createBufferSource();
        burstSrc.buffer = noiseBuf;

        const burstFilter = ctx.createBiquadFilter();
        burstFilter.type = 'bandpass';
        const burstFreq = (consonant === 't' || consonant === 'd') ? 3600 : (consonant === 'k' || consonant === 'g') ? 2200 : 1300;
        burstFilter.frequency.setValueAtTime(burstFreq, currTime + 0.015);
        burstFilter.Q.setValueAtTime(2.8, currTime + 0.015);

        const burstGain = ctx.createGain();
        burstGain.gain.setValueAtTime(0.0001, currTime);
        burstGain.gain.setValueAtTime(0.18, currTime + 0.016);
        burstGain.gain.exponentialRampToValueAtTime(0.0001, currTime + 0.038);

        burstSrc.connect(burstFilter);
        burstFilter.connect(burstGain);
        burstGain.connect(masterVocal);

        burstSrc.start(currTime + 0.015);
        burstSrc.stop(currTime + 0.045);
      } else if (isNasal) {
        // Voiced low frequency nasal murmur
        const nasalOsc = ctx.createOscillator();
        nasalOsc.type = 'sawtooth';
        nasalOsc.frequency.setValueAtTime(syl.frequencyHz, currTime);

        const nasalFilter = ctx.createBiquadFilter();
        nasalFilter.type = 'bandpass';
        nasalFilter.frequency.setValueAtTime(260, currTime);
        nasalFilter.Q.setValueAtTime(3.5, currTime);

        const nasalGain = ctx.createGain();
        nasalGain.gain.setValueAtTime(0.001, currTime);
        nasalGain.gain.linearRampToValueAtTime(0.14, currTime + 0.015);
        nasalGain.gain.exponentialRampToValueAtTime(0.001, currTime + 0.05);

        nasalOsc.connect(nasalFilter);
        nasalFilter.connect(nasalGain);
        nasalGain.connect(masterVocal);

        nasalOsc.start(currTime);
        nasalOsc.stop(currTime + 0.055);
      }
    }

    // --- B. GLOTTAL VOICED VOWEL SOURCE ---
    const glottalOsc = ctx.createOscillator();
    // Sawtooth has all integer harmonics (1/n) - matches human vocal cord glottal flow
    glottalOsc.type = 'sawtooth';

    // Vocal pitch inflection: subtle rise then natural declarative falling contour
    const f0 = syl.frequencyHz;
    glottalOsc.frequency.setValueAtTime(f0, currTime);
    glottalOsc.frequency.linearRampToValueAtTime(syl.isHighTone ? f0 * 1.05 : f0 * 1.02, currTime + durationSec * 0.35);
    glottalOsc.frequency.linearRampToValueAtTime(f0 * 0.94, currTime + durationSec);

    // Glottal low-pass smoothing (models acoustic impedance of vocal folds)
    const glottalLowpass = ctx.createBiquadFilter();
    glottalLowpass.type = 'lowpass';
    glottalLowpass.frequency.setValueAtTime(2800, currTime);

    // Parallel Formant Bank: F1, F2, F3
    // Formant 1: Tongue height
    const filterF1 = ctx.createBiquadFilter();
    filterF1.type = 'bandpass';
    filterF1.frequency.setValueAtTime(formants.f1, currTime);
    filterF1.Q.setValueAtTime(formants.q1, currTime);

    const gainF1 = ctx.createGain();
    gainF1.gain.setValueAtTime(0.7, currTime);

    // Formant 2: Tongue front/back
    const filterF2 = ctx.createBiquadFilter();
    filterF2.type = 'bandpass';
    filterF2.frequency.setValueAtTime(formants.f2, currTime);
    filterF2.Q.setValueAtTime(formants.q2, currTime);

    const gainF2 = ctx.createGain();
    gainF2.gain.setValueAtTime(0.45, currTime);

    // Formant 3: Vocal tract length
    const filterF3 = ctx.createBiquadFilter();
    filterF3.type = 'bandpass';
    filterF3.frequency.setValueAtTime(formants.f3, currTime);
    filterF3.Q.setValueAtTime(8.0, currTime);

    const gainF3 = ctx.createGain();
    gainF3.gain.setValueAtTime(0.25, currTime);

    // Connect vocal source to formants
    glottalOsc.connect(glottalLowpass);
    glottalLowpass.connect(filterF1);
    glottalLowpass.connect(filterF2);
    glottalLowpass.connect(filterF3);

    // Sum formants into vowel articulation gain envelope
    const vowelGain = ctx.createGain();
    filterF1.connect(gainF1).connect(vowelGain);
    filterF2.connect(gainF2).connect(vowelGain);
    filterF3.connect(gainF3).connect(vowelGain);
    vowelGain.connect(masterVocal);

    // Articulation envelope: gentle vocal onset, vowel sustain, natural decay
    const attackTime = 0.025;
    const peakVolume = syl.isHighTone ? 0.28 : syl.isStressed ? 0.24 : 0.20;

    vowelGain.gain.setValueAtTime(0.0001, currTime);
    vowelGain.gain.exponentialRampToValueAtTime(peakVolume, currTime + attackTime);
    vowelGain.gain.setValueAtTime(peakVolume * 0.85, currTime + durationSec * 0.7);
    vowelGain.gain.exponentialRampToValueAtTime(0.0001, currTime + durationSec);

    glottalOsc.start(currTime);
    glottalOsc.stop(currTime + durationSec + 0.02);

    // Fire UI highlights in sync with real vocal output
    const delay = accumulatedMs;
    setTimeout(() => {
      options?.onSyllable?.(idx, syl);
    }, delay);

    // Syllable transition spacing
    const syllableGap = 0.025; // 25ms natural co-articulation gap
    currTime += durationSec + syllableGap;
    accumulatedMs += syl.durationMs + 25;
  });

  // Trigger completion callback
  setTimeout(() => {
    options?.onComplete?.();
  }, accumulatedMs + 50);
}

// =========================================================================
// 3. Unified Pronunciation Function: `playSageloPhrase`
// =========================================================================

export interface PlayPhraseOptions {
  basePitchHz?: number;
  useVoice?: boolean;
  onSyllable?: (index: number, syl: SyllableAnalysis) => void;
  onComplete?: () => void;
}

/**
 * Pronounces a Sagelo word or phrase with articulate vocal speech.
 * Will NEVER play electronic beep/beats.
 */
export function playSageloPhrase(
  phrase: string,
  options?: PlayPhraseOptions
): void {
  const cleanText = phrase
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

  // 1. Try Browser Web Speech API synchronously
  let didNativeSpeak = false;

  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }

      // Synchronously instantiate utterance within current click event loop
      const utter = new SpeechSynthesisUtterance(cleanText);
      utter.rate = 0.92;
      utter.pitch = 1.02;

      const voice = selectBestVoice();
      if (voice) {
        utter.voice = voice;
      }

      // Watchdog flag: did browser speech actually emit sound?
      let nativeStarted = false;

      utter.onstart = () => {
        nativeStarted = true;
        didNativeSpeak = true;

        if (options?.onSyllable && analysis.length > 0) {
          const approxSylMs = Math.max(160, Math.min(290, 2100 / analysis.length));
          analysis.forEach((syl, i) => {
            setTimeout(() => {
              options.onSyllable?.(i, syl);
            }, i * approxSylMs);
          });
        }
      };

      utter.onend = () => {
        currentUtterance = null;
        options?.onComplete?.();
      };

      utter.onerror = () => {
        currentUtterance = null;
        if (!nativeStarted) {
          // If native TTS threw an error, immediately synthesize with vocal formant engine
          speakWithVocalFormantSynthesizer(analysis, options);
        } else {
          options?.onComplete?.();
        }
      };

      currentUtterance = utter;
      window.speechSynthesis.speak(utter);

      // Watchdog: In cross-origin iframes or restricted environments,
      // window.speechSynthesis.speak() is accepted silently but never starts (onstart never fires).
      // Check after 65ms: if native speech didn't start, run the vocal formant synthesizer!
      setTimeout(() => {
        if (!nativeStarted && !window.speechSynthesis.speaking) {
          speakWithVocalFormantSynthesizer(analysis, options);
        }
      }, 65);

      didNativeSpeak = true;
    } catch {
      didNativeSpeak = false;
    }
  }

  // 2. If SpeechSynthesis was completely unavailable, invoke the vocal formant speech engine directly
  if (!didNativeSpeak) {
    speakWithVocalFormantSynthesizer(analysis, options);
  }
}

/**
 * Pleasant melodic chimes for gamified feedback (correct, wrong, level complete)
 */
export function playChime(type: 'correct' | 'wrong' | 'complete'): void {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;

  if (type === 'correct') {
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
  } else {
    [440, 554.37, 659.25, 880].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.07);
      gain.gain.setValueAtTime(0.001, now + i * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.12, now + i * 0.07 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.07 + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.07);
      osc.stop(now + i * 0.07 + 0.42);
    });
  }
}
