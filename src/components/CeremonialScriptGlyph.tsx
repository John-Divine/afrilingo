import React from 'react';
import { syllabifyWord } from '../utils/sageloAudio';

interface SyllableParts {
  raw: string;
  consonant: string;
  glide: string;
  vowel: 'a' | 'e' | 'i' | 'o' | 'u';
  isHighTone: boolean;
}

export function parseSyllableForScript(syl: string): SyllableParts {
  const isHighTone = /[áéíóúÁÉÍÓÚ]/.test(syl);
  const clean = syl
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z]/g, '');

  let vowel: 'a' | 'e' | 'i' | 'o' | 'u' = 'a';
  for (const v of ['a', 'e', 'i', 'o', 'u'] as const) {
    if (clean.includes(v)) {
      vowel = v;
      break;
    }
  }

  const onset = clean.replace(/[aeiou]+/g, '');
  let consonant = '';
  let glide = '';

  if (onset.startsWith('ch') || onset.startsWith('sh') || onset.startsWith('ny')) {
    consonant = onset.slice(0, 2);
    glide = onset.slice(2);
  } else if (onset.length > 0) {
    if ((onset[0] === 'w' || onset[0] === 'y') && onset.length === 1) {
      glide = onset[0];
    } else {
      consonant = onset[0];
      glide = onset.slice(1);
    }
  }

  return {
    raw: syl,
    consonant,
    glide,
    vowel,
    isHighTone,
  };
}

interface GlyphBlockProps {
  syllable: string;
  size?: number;
  showLabel?: boolean;
  highlightPart?: 'all' | 'consonant' | 'vowel' | 'tone';
}

export const CeremonialSyllableBlock: React.FC<GlyphBlockProps> = ({
  syllable,
  size = 64,
  showLabel = true,
  highlightPart = 'all',
}) => {
  const parts = parseSyllableForScript(syllable);
  const c = parts.consonant;
  const g = parts.glide;
  const v = parts.vowel;

  const strokeMain = '#1C1613';
  const strokeConsonant = highlightPart === 'consonant' ? '#C84B24' : '#1C1613';
  const strokeVowel = highlightPart === 'vowel' ? '#1B6B4A' : '#8F2D10';
  const strokeTone = '#D99B26';

  return (
    <div className="inline-flex flex-col items-center gap-1">
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
        aria-label={`Sagelo ceremonial glyph for syllable ${syllable}`}
      >
        {parts.isHighTone && (
          <path
            d="M22 10 C28 3, 36 3, 42 10 M32 5 L32 2"
            stroke={strokeTone}
            strokeWidth="2.8"
            strokeLinecap="round"
          />
        )}

        <rect
          x="10"
          y="13"
          width="44"
          height="42"
          rx="11"
          fill="#FBF9F5"
          stroke={strokeMain}
          strokeWidth="2.4"
        />

        {g === 'w' && <path d="M10 26 L17 22 L17 30 Z" fill={strokeConsonant} />}
        {g === 'y' && <path d="M54 26 L47 22 L47 30 Z" fill={strokeConsonant} />}

        {c === 'm' && <circle cx="32" cy="22" r="2.8" fill={strokeConsonant} />}
        {c === 'n' && (
          <>
            <circle cx="27" cy="22" r="2.6" fill={strokeConsonant} />
            <circle cx="37" cy="22" r="2.6" fill={strokeConsonant} />
          </>
        )}
        {c === 'ny' && (
          <>
            <circle cx="23" cy="22" r="2.4" fill={strokeConsonant} />
            <circle cx="32" cy="22" r="2.4" fill={strokeConsonant} />
            <circle cx="41" cy="22" r="2.4" fill={strokeConsonant} />
          </>
        )}

        {(c === 'p' || c === 'b') && (
          <>
            <path d="M24 27 L34 19" stroke={strokeConsonant} strokeWidth="2.6" strokeLinecap="round" />
            {c === 'b' && <path d="M26 26 L29 30" stroke={strokeConsonant} strokeWidth="2.4" strokeLinecap="round" />}
          </>
        )}
        {(c === 't' || c === 'd') && (
          <>
            <path d="M25 27 L39 19" stroke={strokeConsonant} strokeWidth="2.6" strokeLinecap="round" />
            {c === 'd' && <path d="M31 24 L34 29" stroke={strokeConsonant} strokeWidth="2.4" strokeLinecap="round" />}
          </>
        )}
        {(c === 'k' || c === 'g') && (
          <>
            <path d="M23 19 L39 27" stroke={strokeConsonant} strokeWidth="2.6" strokeLinecap="round" />
            {c === 'g' && <path d="M35 25 L33 30" stroke={strokeConsonant} strokeWidth="2.4" strokeLinecap="round" />}
          </>
        )}

        {(c === 'f' || c === 'v') && (
          <>
            <path d="M24 26 L32 19 L40 26" stroke={strokeConsonant} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
            {c === 'v' && <path d="M32 23 L32 29" stroke={strokeConsonant} strokeWidth="2.2" strokeLinecap="round" />}
          </>
        )}
        {c === 's' && (
          <path
            d="M21 26 L26 19 L32 26 L38 19 L43 26"
            stroke={strokeConsonant}
            strokeWidth="2.3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
        {c === 'sh' && (
          <path
            d="M18 26 L22 19 L27 26 L32 19 L37 26 L42 19 L46 26"
            stroke={strokeConsonant}
            strokeWidth="2.1"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
        {c === 'h' && (
          <path d="M22 25 Q32 17 42 25" stroke={strokeConsonant} strokeWidth="2.4" strokeLinecap="round" />
        )}

        {(c === 'ch' || c === 'j') && (
          <>
            <path d="M24 19 L40 19" stroke={strokeConsonant} strokeWidth="2.3" strokeLinecap="round" />
            <path d="M23 26 L29 21 L35 26 L41 21" stroke={strokeConsonant} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            {c === 'j' && <path d="M32 25 L32 30" stroke={strokeConsonant} strokeWidth="2.2" strokeLinecap="round" />}
          </>
        )}

        {c === 'l' && (
          <path
            d="M37 27 C26 27, 23 19, 30 19 C35 19, 35 24, 29 25"
            stroke={strokeConsonant}
            strokeWidth="2.3"
            strokeLinecap="round"
          />
        )}
        {c === 'r' && (
          <path
            d="M27 27 C38 27, 41 19, 34 19 C29 19, 29 24, 35 25"
            stroke={strokeConsonant}
            strokeWidth="2.3"
            strokeLinecap="round"
          />
        )}

        {v === 'a' && (
          <line x1="16" y1="41" x2="48" y2="41" stroke={strokeVowel} strokeWidth="2.8" strokeLinecap="round" />
        )}
        {v === 'o' && <circle cx="32" cy="41" r="5.5" stroke={strokeVowel} strokeWidth="2.6" />}
        {v === 'i' && <circle cx="32" cy="41" r="3.4" fill={strokeVowel} />}
        {v === 'e' && (
          <line x1="23" y1="36" x2="41" y2="36" stroke={strokeVowel} strokeWidth="2.8" strokeLinecap="round" />
        )}
        {v === 'u' && (
          <line x1="23" y1="47" x2="41" y2="47" stroke={strokeVowel} strokeWidth="2.8" strokeLinecap="round" />
        )}
      </svg>
      {showLabel && (
        <span className="text-xs font-mono-num text-[#5C4D43] tracking-wide">
          {syllable}
        </span>
      )}
    </div>
  );
};

interface CeremonialWordRendererProps {
  text: string;
  size?: number;
  showLabels?: boolean;
}

export const CeremonialWordRenderer: React.FC<CeremonialWordRendererProps> = ({
  text,
  size = 56,
  showLabels = true,
}) => {
  const words = text.trim().split(/\s+/).filter(Boolean);
  return (
    <div className="flex flex-wrap items-center gap-4">
      {words.map((word, wIdx) => {
        const syllables = syllabifyWord(word);
        return (
          <div
            key={`${word}-${wIdx}`}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#F3EFE6]/70 border border-[#E6DFD3]"
          >
            {syllables.map((syl, sIdx) => (
              <CeremonialSyllableBlock
                key={`${syl}-${sIdx}`}
                syllable={syl}
                size={size}
                showLabel={showLabels}
              />
            ))}
          </div>
        );
      })}
    </div>
  );
};
