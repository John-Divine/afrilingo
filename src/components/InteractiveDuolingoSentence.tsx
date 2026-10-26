import React, { useState, useRef, useEffect } from 'react';
import { Volume2, Sparkles } from 'lucide-react';
import { playSageloPhrase } from '../utils/sageloAudio';
import { getWordHint, WordHint } from '../utils/sageloWordHints';

interface InteractiveDuolingoSentenceProps {
  sentence: string;
  size?: 'sm' | 'md' | 'lg';
  showSpeakers?: boolean;
  className?: string;
  onWordClick?: (word: string) => void;
}

export const InteractiveDuolingoSentence: React.FC<InteractiveDuolingoSentenceProps> = ({
  sentence,
  size = 'md',
  showSpeakers = true,
  className = '',
  onWordClick,
}) => {
  const [activeHint, setActiveHint] = useState<{
    hint: WordHint;
    rect: DOMRect;
  } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Close hint when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setActiveHint(null);
      }
    };
    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleWordClick = (rawWord: string, e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    const cleanWord = rawWord.replace(/[.,!?;:"'“”()—]/g, '').trim();
    if (!cleanWord) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const hint = getWordHint(cleanWord);

    // If already active on this word, close it
    if (activeHint?.hint.clean === hint.clean) {
      setActiveHint(null);
    } else {
      setActiveHint({ hint, rect });
      playSageloPhrase(cleanWord);
      onWordClick?.(cleanWord);
    }
  };

  const handlePlayNormal = (e: React.MouseEvent) => {
    e.stopPropagation();
    playSageloPhrase(sentence, { rate: 0.88 });
  };

  const handlePlayTurtle = (e: React.MouseEvent) => {
    e.stopPropagation();
    playSageloPhrase(sentence, { rate: 0.62 });
  };

  // Split sentence into words and punctuation
  const tokens = sentence.split(/(\s+|[.,!?;:"'“”()—]+)/).filter(Boolean);

  const fontSizeClass =
    size === 'lg'
      ? 'text-xl sm:text-2xl'
      : size === 'sm'
      ? 'text-sm sm:text-base'
      : 'text-base sm:text-lg';

  return (
    <div ref={containerRef} className={`relative flex items-center gap-3 flex-wrap ${className}`}>
      {/* Audio speaker buttons (Duolingo style: Normal and Slow Turtle) */}
      {showSpeakers && (
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handlePlayNormal}
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-[#0D9488] hover:bg-[#14B8A6] active:bg-[#0F766E] border-b-4 border-[#0F766E] text-white flex items-center justify-center shrink-0 active:translate-y-1 transition-all shadow-xs"
            title="Listen to full phrase (Normal speed)"
            aria-label="Listen at normal speed"
          >
            <Volume2 className="w-5 h-5 stroke-[2.5]" />
          </button>

          <button
            type="button"
            onClick={handlePlayTurtle}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#241710] hover:bg-[#2C1D14] active:bg-[#1E130D] border-2 border-b-4 border-[#3D2619] hover:border-[#14B8A6] text-[#14B8A6] flex items-center justify-center shrink-0 active:translate-y-0.5 transition-all text-sm font-black shadow-2xs"
            title="Listen slowly (Turtle speed)"
            aria-label="Listen at turtle slow speed"
          >
            🐢
          </button>
        </div>
      )}

      {/* Interactive Word Tokens */}
      <div className={`flex items-baseline flex-wrap gap-x-1.5 gap-y-1 font-black ${fontSizeClass} text-[#FEF3C7]`}>
        {tokens.map((token, i) => {
          const isWord = /[a-zA-ZáéíóúÁÉÍÓÚ]/.test(token);
          if (!isWord) {
            return (
              <span key={i} className="text-[#D4A373] select-none">
                {token}
              </span>
            );
          }

          const isActive = activeHint?.hint.clean === token.toLowerCase().replace(/[^a-z]/g, '');

          return (
            <button
              key={i}
              type="button"
              onClick={(e) => handleWordClick(token, e)}
              className={`relative cursor-pointer transition-all border-b-2 border-dotted rounded-sm px-0.5 ${
                isActive
                  ? 'border-[#10B981] text-[#10B981] bg-[#064E3B]'
                  : 'border-[#A38260] hover:border-[#10B981] hover:text-[#10B981]'
              }`}
              title={`Tap to see meaning and hear "${token}"`}
            >
              {token}
            </button>
          );
        })}
      </div>

      {/* Floating Duolingo Word Hint Tooltip Card */}
      {activeHint && (
        <div
          className="absolute z-50 bg-[#241710] border-2 border-b-4 border-[#10B981] rounded-2xl p-3.5 shadow-xl text-left animate-in fade-in zoom-in-95 duration-150 min-w-[210px] max-w-[280px]"
          style={{
            top: '100%',
            left: '0',
            marginTop: '8px',
          }}
        >
          {/* Duolingo Carrot Pointer */}
          <div className="absolute -top-2 left-6 w-3.5 h-3.5 bg-[#241710] border-t-2 border-l-2 border-[#10B981] rotate-45" />

          <div className="space-y-1.5 relative z-10">
            <div className="flex items-center justify-between gap-2 border-b border-[#3D2619] pb-1.5">
              <span className="text-sm font-black text-[#10B981]">{activeHint.hint.word}</span>
              <span className="font-mono text-[10px] font-bold text-[#14B8A6] bg-[#0F2D28] px-1.5 py-0.5 rounded border border-[#0D9488]/40">
                {activeHint.hint.ipa}
              </span>
              <button
                type="button"
                onClick={() => playSageloPhrase(activeHint.hint.clean)}
                className="w-6 h-6 rounded-lg bg-[#0D9488] hover:bg-[#14B8A6] text-white flex items-center justify-center shrink-0 active:scale-95 transition-all"
                title="Hear word audio"
              >
                <Volume2 className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="text-xs font-black text-[#FEF3C7] leading-snug">
              {activeHint.hint.translation}
            </div>

            {activeHint.hint.grammaticalRole && (
              <div className="text-[10px] font-bold text-[#D4A373] uppercase tracking-wider">
                {activeHint.hint.grammaticalRole}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
