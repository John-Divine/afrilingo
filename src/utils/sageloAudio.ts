// Web Audio API Synthesizer & Pronunciation Engine for Sagelo
// Implements Chapter 3:
// - 3:2 Perfect Fifth interval for High Tone (á, é, í, ó, ú)
// - Golden Ratio (1/φ ≈ 0.618) downdrift decay across successive high tones
// - Penultimate syllable stress duration (φ ≈ 1.618x length)

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

// Breaks a Sagelo word into open CV syllables
export function syllabifyWord(word: string): string[] {
  const cleaned = word.replace(/[.,?!;:"'()·—-]/g, '').trim();
  if (!cleaned) return [];

  const regex = /(?:ch|sh|ny|[bcdfghjklmnprstvwy])?[wy]?[aeiouáéíóúAEIOUÁÉÍÓÚ]+|(?:[bcdfghjklmnprstvwy]+)$/gi;
  const matches = cleaned.match(regex);
  if (matches && matches.length > 0) {
    return matches;
  }
  return [cleaned];
}

export function analyzePhraseResonance(
  phrase: string,
  basePitchHz = 220
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
      const durationMs = isStressed ? Math.round(baseDuration * PHI) : baseDuration;

      let freq = basePitchHz;
      if (isHigh) {
        const fifthLift = basePitchHz * 0.5 * Math.pow(INV_PHI, highToneCount * 0.45);
        freq = Math.round(basePitchHz + fifthLift);
        highToneCount += 1;
      } else {
        freq = Math.round(basePitchHz * (1 - Math.min(0.12, result.length * 0.01)));
      }

      result.push({
        raw: syl,
        clean: syl.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase(),
        isHighTone: isHigh,
        isStressed,
        frequencyHz: freq,
        durationMs,
        vowel: detectVowel(syl),
      });
    });
  }

  return result;
}

let sharedAudioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!sharedAudioCtx) {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioCtx) {
      sharedAudioCtx = new AudioCtx();
    }
  }
  if (sharedAudioCtx && sharedAudioCtx.state === 'suspended') {
    sharedAudioCtx.resume();
  }
  return sharedAudioCtx;
}

const VOWEL_FORMANTS: Record<'a' | 'e' | 'i' | 'o' | 'u', [number, number]> = {
  a: [730, 1090],
  e: [530, 1840],
  i: [270, 2290],
  o: [570, 840],
  u: [300, 870],
};

export function playSageloPhrase(
  phrase: string,
  options?: {
    basePitchHz?: number;
    useVoice?: boolean;
    onSyllable?: (index: number, syl: SyllableAnalysis) => void;
    onComplete?: () => void;
  }
): void {
  const basePitch = options?.basePitchHz ?? 220;
  const useVoice = options?.useVoice ?? true;
  const analysis = analyzePhraseResonance(phrase, basePitch);

  if (useVoice && typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(phrase.replace(/·/g, ''));
      utter.rate = 0.88;
      utter.pitch = 1.05;
      const voices = window.speechSynthesis.getVoices();
      const preferred = voices.find(
        v => v.lang.startsWith('sw') || v.lang.startsWith('es') || v.lang.startsWith('it') || v.lang.startsWith('en')
      );
      if (preferred) utter.voice = preferred;
      window.speechSynthesis.speak(utter);
    } catch {
      // Fallback
    }
  }

  const ctx = getAudioContext();
  if (!ctx || analysis.length === 0) {
    options?.onComplete?.();
    return;
  }

  let currentTime = ctx.currentTime + 0.04;
  let accumulatedMs = 40;

  analysis.forEach((syl, idx) => {
    const durSec = syl.durationMs / 1000;
    const osc = ctx.createOscillator();
    const subOsc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(syl.frequencyHz, currentTime);

    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(syl.frequencyHz * 1.5, currentTime);

    const [f1] = VOWEL_FORMANTS[syl.vowel] || [700, 1100];
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(f1, currentTime);
    filter.Q.setValueAtTime(2.2, currentTime);

    const peakGain = syl.isHighTone ? 0.24 : syl.isStressed ? 0.19 : 0.14;
    gain.gain.setValueAtTime(0.001, currentTime);
    gain.gain.exponentialRampToValueAtTime(peakGain, currentTime + 0.025);
    gain.gain.exponentialRampToValueAtTime(0.001, currentTime + durSec);

    osc.connect(filter);
    subOsc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(currentTime);
    subOsc.start(currentTime);
    osc.stop(currentTime + durSec + 0.02);
    subOsc.stop(currentTime + durSec + 0.02);

    const triggerDelay = accumulatedMs;
    setTimeout(() => {
      options?.onSyllable?.(idx, syl);
    }, triggerDelay);

    const gapSec = 0.045;
    currentTime += durSec + gapSec;
    accumulatedMs += syl.durationMs + 45;
  });

  setTimeout(() => {
    options?.onComplete?.();
  }, accumulatedMs + 60);
}

export function playChime(type: 'correct' | 'wrong' | 'complete'): void {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;

  if (type === 'correct') {
    [264, 396].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.09);
      gain.gain.setValueAtTime(0.001, now + i * 0.09);
      gain.gain.exponentialRampToValueAtTime(0.18, now + i * 0.09 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.09 + 0.28);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.09);
      osc.stop(now + i * 0.09 + 0.3);
    });
  } else if (type === 'wrong') {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.linearRampToValueAtTime(140, now + 0.22);
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.25);
  } else {
    [264, 330, 396, 528].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + i * 0.08);
      gain.gain.setValueAtTime(0.001, now + i * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.2, now + i * 0.08 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.45);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.08);
      osc.stop(now + i * 0.08 + 0.48);
    });
  }
}
