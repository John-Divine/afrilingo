// Web Audio & Speech Synthesis Pronunciation Engine for AfriLingo (Sagelo)
// Natural African Language Vocalization with Tone & Phrasing Guidance

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

// Web Speech API Voice Management & Selection
let cachedVoices: SpeechSynthesisVoice[] = [];
let isVoiceListLoaded = false;
let currentUtterance: SpeechSynthesisUtterance | null = null;

function loadAvailableVoices(): SpeechSynthesisVoice[] {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return [];
  }
  try {
    const voices = window.speechSynthesis.getVoices();
    if (voices && voices.length > 0) {
      cachedVoices = voices;
      isVoiceListLoaded = true;
    }
  } catch {
    // Non-blocking
  }
  return cachedVoices;
}

// Initialize voices listener early
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  loadAvailableVoices();
  window.speechSynthesis.onvoiceschanged = () => {
    loadAvailableVoices();
  };
}

function selectBestVoice(): SpeechSynthesisVoice | null {
  const voices = isVoiceListLoaded && cachedVoices.length > 0
    ? cachedVoices
    : loadAvailableVoices();

  if (!voices || voices.length === 0) return null;

  // 1. Try African Bantu/regional languages (Swahili, Zulu, Yoruba, Hausa)
  const africanLang = voices.find(v => {
    const lang = (v.lang || '').toLowerCase();
    return (
      lang.startsWith('sw') || // Swahili
      lang.startsWith('zu') || // Zulu
      lang.startsWith('yo') || // Yoruba
      lang.startsWith('ha') || // Hausa
      lang.startsWith('sn') || // Shona
      lang.startsWith('xh')    // Xhosa
    );
  });
  if (africanLang) return africanLang;

  // 2. Try African regional English accents (Nigeria, South Africa, Kenya, Ghana)
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

  // 3. Try Romance pure-vowel languages (Spanish, Portuguese, Italian).
  // Bantu & Sagelo phonology uses identical 5 cardinal vowels: /a/, /e/, /i/, /o/, /u/.
  const romancePureVowels = voices.find(v => {
    const lang = (v.lang || '').toLowerCase();
    return (
      lang.startsWith('es') ||
      lang.startsWith('pt') ||
      lang.startsWith('it')
    );
  });
  if (romancePureVowels) return romancePureVowels;

  // 4. Default to any clear standard voice
  const defaultOrEn = voices.find(v => v.default || v.lang.startsWith('en'));
  return defaultOrEn || voices[0] || null;
}

let sharedAudioCtx: AudioContext | null = null;

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

export interface PlayPhraseOptions {
  basePitchHz?: number;
  useVoice?: boolean;
  playToneResonance?: boolean; // Only for acoustic pitch experiments, NEVER for normal speech
  onSyllable?: (index: number, syl: SyllableAnalysis) => void;
  onComplete?: () => void;
}

/**
 * Plays a Sagelo phrase using natural human-like voice synthesis.
 * Does NOT play electronic beats.
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

  const basePitch = options?.basePitchHz ?? 220;
  const analysis = analyzePhraseResonance(cleanText, basePitch);
  const useVoice = options?.useVoice ?? true;
  const playTones = options?.playToneResonance ?? false;

  let speechStarted = false;

  if (useVoice && typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      // Resume if browser suspended audio or speech
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
      if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
        window.speechSynthesis.cancel();
      }

      // Small delay prevents Chrome from canceling the new utterance immediately
      setTimeout(() => {
        try {
          const utter = new SpeechSynthesisUtterance(cleanText);
          utter.rate = 0.92; // Natural, articulately paced
          utter.pitch = 1.0;  // Natural vocal pitch

          const voice = selectBestVoice();
          if (voice) {
            utter.voice = voice;
          }

          let syllableTimer: ReturnType<typeof setTimeout> | null = null;

          utter.onstart = () => {
            // Trigger visual syllable highlights during speech
            if (options?.onSyllable && analysis.length > 0) {
              const approxSylMs = Math.max(180, Math.min(320, 2200 / analysis.length));
              analysis.forEach((syl, i) => {
                setTimeout(() => {
                  options.onSyllable?.(i, syl);
                }, i * approxSylMs);
              });
            }
          };

          utter.onend = () => {
            if (syllableTimer) clearTimeout(syllableTimer);
            currentUtterance = null;
            options?.onComplete?.();
          };

          utter.onerror = (e) => {
            // Ignore interruption errors when user quickly clicks multiple phrases
            if (e.error !== 'interrupted' && e.error !== 'canceled') {
              console.warn('Speech synthesis notice:', e.error);
            }
            currentUtterance = null;
            options?.onComplete?.();
          };

          // Store reference globally to prevent Chrome garbage collector cancellation
          currentUtterance = utter;
          window.speechSynthesis.speak(utter);
          speechStarted = true;
        } catch (err) {
          console.warn('Speech synthesis invocation error:', err);
          options?.onComplete?.();
        }
      }, 25);
    } catch {
      speechStarted = false;
    }
  }

  // ONLY play musical pitch resonance tones if explicitly requested (e.g. in acoustic resonance lab)
  if (playTones && analysis.length > 0) {
    const ctx = getAudioContext();
    if (ctx) {
      let currentTime = ctx.currentTime + 0.05;
      let accumulatedMs = 50;

      analysis.forEach((syl, idx) => {
        const durSec = syl.durationMs / 1000;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine'; // Smooth, pure sine tone instead of harsh beats
        osc.frequency.setValueAtTime(syl.frequencyHz, currentTime);

        const peakGain = syl.isHighTone ? 0.08 : 0.05;
        gain.gain.setValueAtTime(0.0001, currentTime);
        gain.gain.exponentialRampToValueAtTime(peakGain, currentTime + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, currentTime + durSec);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(currentTime);
        osc.stop(currentTime + durSec + 0.02);

        if (!speechStarted) {
          setTimeout(() => {
            options?.onSyllable?.(idx, syl);
          }, accumulatedMs);
        }

        currentTime += durSec + 0.05;
        accumulatedMs += syl.durationMs + 50;
      });

      if (!speechStarted) {
        setTimeout(() => {
          options?.onComplete?.();
        }, accumulatedMs + 50);
      }
    }
  } else if (!speechStarted && !useVoice) {
    // If voice was explicitly turned off and no tones requested, just finish cleanly
    options?.onComplete?.();
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
    // Uplifting pentatonic major third chime
    [523.25, 659.25].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.08);
      gain.gain.setValueAtTime(0.001, now + i * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.15, now + i * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.28);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.08);
      osc.stop(now + i * 0.08 + 0.3);
    });
  } else if (type === 'wrong') {
    // Gentle soft descending warning chime
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(164.81, now + 0.22);
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.25);
  } else {
    // Celebratory African fanfare chord progression
    [440, 554.37, 659.25, 880].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.07);
      gain.gain.setValueAtTime(0.001, now + i * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.14, now + i * 0.07 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.07 + 0.45);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.07);
      osc.stop(now + i * 0.07 + 0.48);
    });
  }
}
