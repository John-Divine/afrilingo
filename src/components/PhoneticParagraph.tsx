import React, { useState } from 'react';
import { Volume2, Sparkles, BookOpen } from 'lucide-react';
import { parsePhoneticTokens, PhoneticWordToken } from '../utils/sageloPhonetics';
import { playSageloPhrase } from '../utils/sageloAudio';

interface PhoneticParagraphProps {
  text: string;
  english?: string;
  className?: string;
  initialMode?: 'interactive' | 'phonetic_sub' | 'pure';
  allowToggle?: boolean;
}

export const PhoneticParagraph: React.FC<PhoneticParagraphProps> = ({
  text,
  english,
  className = '',
  initialMode = 'phonetic_sub',
  allowToggle = true,
}) => {
  const [mode, setMode] = useState<'interactive' | 'phonetic_sub' | 'pure'>(initialMode);
  const [activeWordIdx, setActiveWordIdx] = useState<number | null>(null);

  const tokens = parsePhoneticTokens(text);

  const handlePlayWord = (token: PhoneticWordToken, idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!token.isWord) return;
    setActiveWordIdx(idx);
    playSageloPhrase(token.original);
    setTimeout(() => {
      setActiveWordIdx(null);
    }, 700);
  };

  const handlePlayEntireParagraph = (e: React.MouseEvent) => {
    e.stopPropagation();
    playSageloPhrase(text);
  };

  return (
    <div className={`p-4 sm:p-5 rounded-2xl bg-white border-2 border-[#E5E5E5] space-y-3.5 shadow-xs transition-all ${className}`}>
      {/* Top Bar with Mode Controls & Play Paragraph Button */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pb-2.5 border-b border-[#F0F0F0]">
        <div className="flex items-center gap-2">
          <button
            onClick={handlePlayEntireParagraph}
            className="px-3 py-1.5 rounded-xl bg-[#1CB0F6] hover:bg-[#24B8FB] text-white font-black text-xs flex items-center gap-1.5 shadow-xs border-b-2 border-[#1899D6] active:translate-y-0.5 transition-all"
            title="Read entire passage with authentic phonetic pronunciation"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>Hear Paragraph</span>
          </button>

          <span className="text-[11px] font-bold text-[#AFAFAF] hidden sm:inline">
            Tap any word to hear it phonetically
          </span>
        </div>

        {allowToggle && (
          <div className="flex items-center gap-1 bg-[#F7F7F7] p-1 rounded-xl border border-[#E5E5E5]">
            <button
              onClick={() => setMode('phonetic_sub')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-black transition-all ${
                mode === 'phonetic_sub'
                  ? 'bg-white text-[#1CB0F6] shadow-2xs border border-[#BAE6FD]'
                  : 'text-[#777777] hover:text-[#3C3C3C]'
              }`}
              title="Show words with phonetic guides underneath"
            >
              Phonetics Under
            </button>
            <button
              onClick={() => setMode('interactive')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-black transition-all ${
                mode === 'interactive'
                  ? 'bg-white text-[#1CB0F6] shadow-2xs border border-[#BAE6FD]'
                  : 'text-[#777777] hover:text-[#3C3C3C]'
              }`}
              title="Standard text with click-to-hear word badges"
            >
              Clean Text
            </button>
            <button
              onClick={() => setMode('pure')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-black transition-all ${
                mode === 'pure'
                  ? 'bg-white text-[#1CB0F6] shadow-2xs border border-[#BAE6FD]'
                  : 'text-[#777777] hover:text-[#3C3C3C]'
              }`}
              title="Show phonetics directly in standard IPA notation"
            >
              IPA Phonetics
            </button>
          </div>
        )}
      </div>

      {/* Main Paragraph Body */}
      {mode === 'phonetic_sub' && (
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-3 leading-normal">
          {tokens.map((token, idx) => {
            if (!token.isWord) {
              return (
                <span key={idx} className="text-gray-400 font-bold self-start mt-1">
                  {token.original}
                </span>
              );
            }

            const isActive = activeWordIdx === idx;

            return (
              <button
                key={idx}
                onClick={(e) => handlePlayWord(token, idx, e)}
                className={`inline-flex flex-col items-center p-1.5 rounded-xl border transition-all text-center group cursor-pointer ${
                  isActive
                    ? 'bg-[#DDF4FF] border-[#1CB0F6] scale-105'
                    : 'bg-[#FBF9F5] hover:bg-[#F0FDF4] border-[#E8E2D8] hover:border-[#86EFAC]'
                }`}
                title={`Click to hear "${token.original}" pronounced phonetically as ${token.phoneticDisplay}`}
              >
                <div className="flex items-center gap-1">
                  <span className="text-base sm:text-lg font-black text-[#2D241E] group-hover:text-[#1CB0F6] transition-colors">
                    {token.original}
                  </span>
                  <Volume2 className="w-3 h-3 text-[#AFAFAF] group-hover:text-[#1CB0F6] opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <span className="font-mono text-[10px] font-extrabold text-[#0284C7] bg-[#E0F2FE] px-1.5 py-0.2 rounded-md border border-[#BAE6FD] mt-0.5 tracking-tight">
                  {token.phoneticDisplay}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {mode === 'interactive' && (
        <p className="text-base sm:text-lg text-[#2D241E] leading-relaxed">
          {tokens.map((token, idx) => {
            if (!token.isWord) {
              return <span key={idx}>{token.original}</span>;
            }

            const isActive = activeWordIdx === idx;

            return (
              <button
                key={idx}
                onClick={(e) => handlePlayWord(token, idx, e)}
                className={`inline font-black transition-all cursor-pointer underline decoration-[#BAE6FD] decoration-2 underline-offset-4 hover:decoration-[#1CB0F6] hover:text-[#1CB0F6] ${
                  isActive ? 'text-[#1CB0F6] scale-105' : ''
                }`}
                title={`Hear ${token.original} ${token.phoneticDisplay}`}
              >
                {token.original}
              </button>
            );
          })}
        </p>
      )}

      {mode === 'pure' && (
        <div className="p-3.5 rounded-xl bg-[#F0F9FF] border border-[#BAE6FD] space-y-1 font-mono">
          <div className="text-[10px] uppercase font-black text-[#0284C7] tracking-wider flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            <span>IPA Phonetic Stream:</span>
          </div>
          <p className="text-sm sm:text-base font-bold text-[#0369A1] leading-relaxed">
            {tokens.map((token, idx) => {
              if (!token.isWord) return <span key={idx}>{token.original}</span>;
              return (
                <button
                  key={idx}
                  onClick={(e) => handlePlayWord(token, idx, e)}
                  className="inline font-bold hover:underline hover:text-[#0284C7]"
                >
                  {token.phoneticIpa || token.phoneticDisplay?.replace(/[\/\[\]]/g, '') || token.original}
                </button>
              );
            })}
          </p>
        </div>
      )}

      {/* English translation if provided */}
      {english && (
        <div className="pt-2 border-t border-[#F0F0F0] text-xs sm:text-sm font-semibold text-[#777777] flex items-start gap-1.5">
          <BookOpen className="w-3.5 h-3.5 text-[#AFAFAF] shrink-0 mt-0.5" />
          <span>{english}</span>
        </div>
      )}
    </div>
  );
};
