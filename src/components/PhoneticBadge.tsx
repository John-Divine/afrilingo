import React from 'react';
import { Volume2 } from 'lucide-react';
import { getWordPhonetic, getPhrasePhoneticDisplay } from '../utils/sageloPhonetics';
import { playSageloPhrase } from '../utils/sageloAudio';

interface PhoneticBadgeProps {
  sagelo: string;
  english?: string;
  phoneticOverride?: string;
  size?: 'sm' | 'md' | 'lg';
  showSpeaker?: boolean;
  inline?: boolean;
  className?: string;
}

export const PhoneticBadge: React.FC<PhoneticBadgeProps> = ({
  sagelo,
  english,
  phoneticOverride,
  size = 'md',
  showSpeaker = true,
  inline = false,
  className = '',
}) => {
  const phonetic =
    phoneticOverride ||
    (sagelo.includes(' ')
      ? getPhrasePhoneticDisplay(sagelo)
      : getWordPhonetic(sagelo).display);

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    playSageloPhrase(sagelo);
  };

  if (inline) {
    return (
      <span className={`inline-flex items-center gap-1.5 align-middle ${className}`}>
        <span className="font-black text-[#3C3C3C]">{sagelo}</span>
        <span className="font-mono text-[11px] font-bold text-[#0284C7] bg-[#E0F2FE] px-1.5 py-0.5 rounded-md border border-[#BAE6FD]">
          {phonetic}
        </span>
        {showSpeaker && (
          <button
            onClick={handlePlay}
            className="p-1 rounded-lg text-[#0284C7] hover:bg-[#E0F2FE] active:scale-90 transition-all inline-flex items-center justify-center"
            title={`Pronounce "${sagelo}" phonetically`}
            aria-label={`Pronounce ${sagelo}`}
          >
            <Volume2 className="w-3.5 h-3.5" />
          </button>
        )}
      </span>
    );
  }

  return (
    <div
      onClick={showSpeaker ? handlePlay : undefined}
      className={`group cursor-pointer rounded-2xl bg-white border-2 border-b-4 border-[#E5E5E5] hover:border-[#1CB0F6] p-3 transition-all flex items-center justify-between gap-3 shadow-xs ${className}`}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`font-black text-[#3C3C3C] ${
              size === 'lg'
                ? 'text-xl'
                : size === 'md'
                ? 'text-base'
                : 'text-sm'
            }`}
          >
            {sagelo}
          </span>
          <span className="font-mono text-xs font-bold text-[#0284C7] bg-[#E0F2FE] px-2 py-0.5 rounded-lg border border-[#BAE6FD] tracking-wide">
            {phonetic}
          </span>
        </div>
        {english && (
          <div className="text-xs font-semibold text-[#777777] mt-0.5 truncate">
            {english}
          </div>
        )}
      </div>

      {showSpeaker && (
        <div className="w-8 h-8 rounded-xl bg-[#E0F2FE] group-hover:bg-[#1CB0F6] group-hover:text-white text-[#0284C7] flex items-center justify-center shrink-0 border border-[#BAE6FD] transition-all shadow-2xs">
          <Volume2 className="w-4 h-4" />
        </div>
      )}
    </div>
  );
};
