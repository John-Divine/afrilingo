import React from 'react';

export type CharacterId = 'duo' | 'mwana' | 'nyango' | 'mpaka';
export type CharacterMood = 'speaking' | 'celebrating' | 'thinking' | 'encouraging';

interface CartoonCharacterProps {
  character: CharacterId;
  mood?: CharacterMood;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  animate?: boolean;
}

export const CartoonCharacter: React.FC<CartoonCharacterProps> = ({
  character,
  mood = 'speaking',
  size = 'md',
  className = '',
  animate = true,
}) => {
  const sizeMap = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24 sm:w-28 sm:h-28',
    lg: 'w-36 h-36 sm:w-44 sm:h-44',
    xl: 'w-48 h-48 sm:w-60 sm:h-60',
  };

  const getAnimationClass = () => {
    if (!animate) return '';
    if (mood === 'celebrating') return 'animate-bounce';
    if (mood === 'speaking') return 'animate-pulse';
    return '';
  };

  return (
    <div
      className={`relative select-none shrink-0 ${sizeMap[size]} ${getAnimationClass()} ${className}`}
    >
      {/* 1. DUO KUKU: THE EMERALD AFRICAN TURACU / PARROT MASCOT */}
      {character === 'duo' && (
        <svg viewBox="0 0 160 160" className="w-full h-full drop-shadow-md">
          <defs>
            <linearGradient id="duoBodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#78E000" />
              <stop offset="60%" stopColor="#58CC02" />
              <stop offset="100%" stopColor="#46A302" />
            </linearGradient>
            <linearGradient id="duoBellyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#CCFF00" />
              <stop offset="100%" stopColor="#9EEA00" />
            </linearGradient>
            <linearGradient id="beakGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFC800" />
              <stop offset="100%" stopColor="#FF9600" />
            </linearGradient>
          </defs>

          {/* Celebratory Star Sparkles */}
          {mood === 'celebrating' && (
            <g className="text-[#FFC800]">
              <path d="M20 25 L23 15 L26 25 L36 28 L26 31 L23 41 L20 31 L10 28 Z" fill="#FFC800" />
              <path d="M135 25 L138 18 L141 25 L148 28 L141 31 L138 38 L135 31 L128 28 Z" fill="#FFC800" />
              <circle cx="80" cy="12" r="3" fill="#FF4B4B" />
              <circle cx="120" cy="18" r="2.5" fill="#1CB0F6" />
            </g>
          )}

          {/* Feathery Turaco Crest / Feathers on top */}
          <path
            d="M68 28 C64 12, 78 8, 82 22 C88 10, 100 12, 94 28 Z"
            fill="#46A302"
          />
          <path
            d="M74 24 C72 15, 84 14, 86 24 C89 16, 96 16, 92 26 Z"
            fill="#78E000"
          />

          {/* Main Rounded Chubby Body */}
          <ellipse cx="80" cy="90" rx="52" ry="56" fill="url(#duoBodyGrad)" />

          {/* Lime Green Belly */}
          <ellipse cx="80" cy="98" rx="34" ry="40" fill="url(#duoBellyGrad)" />

          {/* Pan-African Beaded Amber Necklace */}
          <g>
            <path d="M46 112 Q80 134 114 112" stroke="#854D0E" strokeWidth="2.5" fill="none" />
            <circle cx="56" cy="116" r="4.5" fill="#FF4B4B" />
            <circle cx="68" cy="121" r="5" fill="#FFC800" />
            <circle cx="80" cy="123" r="6" fill="#1CB0F6" stroke="#FFFFFF" strokeWidth="1" />
            <circle cx="92" cy="121" r="5" fill="#FFC800" />
            <circle cx="104" cy="116" r="4.5" fill="#FF4B4B" />
          </g>

          {/* Big Iconic Cartoon Eyes */}
          <ellipse cx="58" cy="65" rx="19" ry="22" fill="#FFFFFF" />
          <ellipse cx="102" cy="65" rx="19" ry="22" fill="#FFFFFF" />

          {/* Iris & Pupils based on Mood */}
          {mood === 'celebrating' ? (
            <>
              {/* Happy squinty crescent eyes */}
              <path d="M46 66 Q58 52 70 66" stroke="#2B2B2B" strokeWidth="6" strokeLinecap="round" fill="none" />
              <path d="M90 66 Q102 52 114 66" stroke="#2B2B2B" strokeWidth="6" strokeLinecap="round" fill="none" />
            </>
          ) : mood === 'thinking' ? (
            <>
              {/* Curious looking-up eyes */}
              <circle cx="62" cy="58" r="10" fill="#2B2B2B" />
              <circle cx="106" cy="58" r="10" fill="#2B2B2B" />
              <circle cx="64" cy="55" r="3.5" fill="#FFFFFF" />
              <circle cx="108" cy="55" r="3.5" fill="#FFFFFF" />
            </>
          ) : (
            <>
              {/* Bright friendly open eyes */}
              <circle cx="62" cy="66" r="10" fill="#2B2B2B" />
              <circle cx="98" cy="66" r="10" fill="#2B2B2B" />
              <circle cx="59" cy="62" r="3.5" fill="#FFFFFF" />
              <circle cx="95" cy="62" r="3.5" fill="#FFFFFF" />
            </>
          )}

          {/* Sweet Rosy Cheeks */}
          <ellipse cx="40" cy="82" rx="7" ry="4.5" fill="#FF8F8F" opacity="0.6" />
          <ellipse cx="120" cy="82" rx="7" ry="4.5" fill="#FF8F8F" opacity="0.6" />

          {/* Cute Orange Beak */}
          {mood === 'speaking' || mood === 'celebrating' ? (
            <g>
              {/* Open beak */}
              <path d="M68 76 Q80 72 92 76 Q80 96 68 76 Z" fill="url(#beakGrad)" />
              <path d="M72 82 Q80 92 88 82 Z" fill="#991B1B" />
              <path d="M74 85 Q80 90 86 85 Z" fill="#FF8F8F" />
            </g>
          ) : (
            <path d="M68 76 Q80 72 92 76 Q80 92 68 76 Z" fill="url(#beakGrad)" />
          )}

          {/* Wings */}
          {mood === 'celebrating' ? (
            <>
              {/* Wings high up in the air */}
              <path
                d="M32 78 C14 55, 12 36, 26 38 C38 42, 42 66, 38 86 Z"
                fill="#46A302"
              />
              <path
                d="M128 78 C146 55, 148 36, 134 38 C122 42, 118 66, 122 86 Z"
                fill="#46A302"
              />
            </>
          ) : mood === 'thinking' ? (
            <>
              {/* One wing scratching head */}
              <path
                d="M32 88 C18 92, 18 110, 32 118 C40 114, 42 98, 38 88 Z"
                fill="#46A302"
              />
              <path
                d="M126 84 C138 72, 134 50, 114 44 C110 52, 116 74, 120 86 Z"
                fill="#46A302"
              />
            </>
          ) : (
            <>
              {/* Friendly resting/gesturing wings */}
              <path
                d="M30 84 C16 92, 18 112, 32 120 C42 114, 42 96, 38 84 Z"
                fill="#46A302"
              />
              <path
                d="M130 84 C144 92, 142 112, 128 120 C118 114, 118 96, 122 84 Z"
                fill="#46A302"
              />
            </>
          )}

          {/* Cute Orange Feet */}
          <ellipse cx="64" cy="144" rx="12" ry="7" fill="#FF9600" />
          <ellipse cx="96" cy="144" rx="12" ry="7" fill="#FF9600" />
        </svg>
      )}

      {/* 2. MWANA KOFI: THE EAGER YOUNG LEARNER */}
      {character === 'mwana' && (
        <svg viewBox="0 0 160 160" className="w-full h-full drop-shadow-md">
          <defs>
            <linearGradient id="mwanaHoodie" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFC800" />
              <stop offset="100%" stopColor="#E59900" />
            </linearGradient>
            <linearGradient id="skinToneMwana" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#7C4B2A" />
              <stop offset="100%" stopColor="#63391C" />
            </linearGradient>
          </defs>

          {/* Yellow Hoodie Torso */}
          <path d="M38 128 C42 104, 118 104, 122 128 L126 156 L34 156 Z" fill="url(#mwanaHoodie)" />
          {/* Hoodie Collar & Drawstrings */}
          <path d="M60 114 Q80 128 100 114 Q80 136 60 114 Z" fill="#D98200" />
          <circle cx="72" cy="132" r="2" fill="#FFFFFF" />
          <circle cx="88" cy="132" r="2" fill="#FFFFFF" />

          {/* Head & Neck */}
          <ellipse cx="80" cy="104" rx="14" ry="12" fill="#63391C" />
          <ellipse cx="80" cy="74" rx="36" ry="38" fill="url(#skinToneMwana)" />

          {/* Cute Curly Puff Afro Fade Hair */}
          <g fill="#1F1510">
            <ellipse cx="80" cy="40" rx="34" ry="20" />
            <circle cx="52" cy="44" r="14" />
            <circle cx="68" cy="32" r="15" />
            <circle cx="92" cy="32" r="15" />
            <circle cx="108" cy="44" r="14" />
          </g>

          {/* Big Expressive Cartoon Eyes */}
          <ellipse cx="64" cy="72" rx="13" ry="15" fill="#FFFFFF" />
          <ellipse cx="96" cy="72" rx="13" ry="15" fill="#FFFFFF" />

          {mood === 'celebrating' ? (
            <>
              {/* Star Eyes */}
              <path d="M64 64 L66 70 L72 72 L66 74 L64 80 L62 74 L56 72 L62 70 Z" fill="#FFC800" />
              <path d="M96 64 L98 70 L104 72 L98 74 L96 80 L94 74 L88 72 L94 70 Z" fill="#FFC800" />
              {/* Big Laughing Open Mouth */}
              <path d="M68 90 Q80 108 92 90 Z" fill="#991B1B" />
              <path d="M72 90 Q80 94 88 90 Z" fill="#FFFFFF" />
            </>
          ) : (
            <>
              <circle cx="66" cy="73" r="7.5" fill="#1C1613" />
              <circle cx="94" cy="73" r="7.5" fill="#1C1613" />
              <circle cx="64" cy="70" r="2.8" fill="#FFFFFF" />
              <circle cx="92" cy="70" r="2.8" fill="#FFFFFF" />
              {/* Friendly Grin */}
              <path d="M70 92 Q80 102 90 92" stroke="#3D2012" strokeWidth="3" strokeLinecap="round" fill="none" />
            </>
          )}

          {/* Eyebrows */}
          <path d="M54 58 Q64 52 74 58" stroke="#1F1510" strokeWidth="3" strokeLinecap="round" fill="none" />
          <path d="M86 58 Q96 52 106 58" stroke="#1F1510" strokeWidth="3" strokeLinecap="round" fill="none" />

          {/* Cute Button Nose */}
          <path d="M78 80 Q80 84 82 80" stroke="#4A2B18" strokeWidth="2.5" strokeLinecap="round" fill="none" />

          {/* Ears */}
          <ellipse cx="43" cy="76" rx="5" ry="8" fill="#63391C" />
          <ellipse cx="117" cy="76" rx="5" ry="8" fill="#63391C" />

          {/* Cheering Hands if celebrating */}
          {mood === 'celebrating' && (
            <g fill="#7C4B2A">
              <circle cx="28" cy="80" r="9" />
              <circle cx="132" cy="80" r="9" />
            </g>
          )}
        </svg>
      )}

      {/* 3. NYANGO AMINA: THE SMART SCHOLAR LINGUIST */}
      {character === 'nyango' && (
        <svg viewBox="0 0 160 160" className="w-full h-full drop-shadow-md">
          <defs>
            <linearGradient id="nyangoSweater" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#C84B24" />
              <stop offset="100%" stopColor="#9E3516" />
            </linearGradient>
            <linearGradient id="skinToneNyango" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#6B4127" />
              <stop offset="100%" stopColor="#54311C" />
            </linearGradient>
          </defs>

          {/* Terracotta/Coral Sweater */}
          <path d="M36 128 C42 102, 118 102, 124 128 L128 156 L32 156 Z" fill="url(#nyangoSweater)" />
          {/* Gold Kente Trim on Neckline */}
          <path d="M62 114 Q80 126 98 114 Q80 132 62 114 Z" fill="#D99B26" />

          {/* Head & Neck */}
          <ellipse cx="80" cy="102" rx="12" ry="12" fill="#54311C" />
          <ellipse cx="80" cy="72" rx="34" ry="36" fill="url(#skinToneNyango)" />

          {/* Braided Topknot Bun Hair */}
          <g fill="#1F1510">
            <ellipse cx="80" cy="22" rx="20" ry="18" />
            {/* Brass Beads in Bun */}
            <circle cx="72" cy="22" r="3" fill="#D99B26" />
            <circle cx="88" cy="24" r="3" fill="#D99B26" />
            <path d="M48 62 C46 38, 114 38, 112 62 C106 46, 54 46, 48 62 Z" />
          </g>

          {/* Gold Glasses */}
          <circle cx="62" cy="70" r="14" fill="#FFFFFF" fillOpacity="0.85" stroke="#D99B26" strokeWidth="3" />
          <circle cx="98" cy="70" r="14" fill="#FFFFFF" fillOpacity="0.85" stroke="#D99B26" strokeWidth="3" />
          <line x1="76" y1="70" x2="84" y2="70" stroke="#D99B26" strokeWidth="3" strokeLinecap="round" />

          {/* Pupils behind glasses */}
          <circle cx="64" cy="70" r="6" fill="#1C1613" />
          <circle cx="96" cy="70" r="6" fill="#1C1613" />
          <circle cx="62" cy="68" r="2.2" fill="#FFFFFF" />
          <circle cx="94" cy="68" r="2.2" fill="#FFFFFF" />

          {/* Elegant Smile */}
          <path d="M70 88 Q80 96 90 88" stroke="#3D2012" strokeWidth="2.8" strokeLinecap="round" fill="none" />

          {/* Gold Hoop Earrings */}
          <ellipse cx="44" cy="76" rx="2" ry="6" stroke="#D99B26" strokeWidth="2" fill="none" />
          <ellipse cx="116" cy="76" rx="2" ry="6" stroke="#D99B26" strokeWidth="2" fill="none" />
        </svg>
      )}

      {/* 4. MPAKA KWESI: THE WISE ELDER SAGE GUIDE */}
      {character === 'mpaka' && (
        <svg viewBox="0 0 160 160" className="w-full h-full drop-shadow-md">
          <defs>
            <linearGradient id="mpakaRobe" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1E1B4B" />
              <stop offset="100%" stopColor="#0F172A" />
            </linearGradient>
            <linearGradient id="skinToneMpaka" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#5E3821" />
              <stop offset="100%" stopColor="#482915" />
            </linearGradient>
          </defs>

          {/* Indigo Royal Dashiki */}
          <path d="M34 126 C40 100, 120 100, 126 126 L130 156 L30 156 Z" fill="url(#mpakaRobe)" />
          {/* Gold Ceremonial Sash Across Robe */}
          <path d="M54 116 L88 156 L104 156 L70 116 Z" fill="#D99B26" />

          {/* Head & Neck */}
          <ellipse cx="80" cy="100" rx="14" ry="12" fill="#482915" />
          <ellipse cx="80" cy="68" rx="36" ry="38" fill="url(#skinToneMpaka)" />

          {/* Silver Crown Hair & Temples */}
          <path d="M46 54 C46 32, 114 32, 114 54 C108 38, 52 38, 46 54 Z" fill="#E2E8F0" />
          <circle cx="45" cy="58" r="6" fill="#CBD5E1" />
          <circle cx="115" cy="58" r="6" fill="#CBD5E1" />

          {/* Wise Crinkly Eyes with Warmth */}
          <ellipse cx="64" cy="66" rx="11" ry="12" fill="#FFFFFF" />
          <ellipse cx="96" cy="66" rx="11" ry="12" fill="#FFFFFF" />
          <circle cx="65" cy="67" r="5.5" fill="#1C1613" />
          <circle cx="95" cy="67" r="5.5" fill="#1C1613" />
          <circle cx="63" cy="65" r="2" fill="#FFFFFF" />
          <circle cx="93" cy="65" r="2" fill="#FFFFFF" />

          {/* Silver Eyebrows */}
          <path d="M52 54 Q64 48 74 54" stroke="#CBD5E1" strokeWidth="4" strokeLinecap="round" fill="none" />
          <path d="M86 54 Q96 48 108 54" stroke="#CBD5E1" strokeWidth="4" strokeLinecap="round" fill="none" />

          {/* Grandfatherly Laughing Smile */}
          <path d="M68 84 Q80 94 92 84" stroke="#2D170B" strokeWidth="3" strokeLinecap="round" fill="none" />

          {/* Majestic Silver-White Beard */}
          <path
            d="M60 86 C60 118, 100 118, 100 86 Q80 96 60 86 Z"
            fill="#E2E8F0"
          />

          {/* Walking Staff of Wisdom with Glowing Amber Crystal */}
          <g>
            <line x1="134" y1="50" x2="134" y2="156" stroke="#854D0E" strokeWidth="4" strokeLinecap="round" />
            <circle cx="134" cy="46" r="8" fill="#FFC800" stroke="#D97706" strokeWidth="2" />
            <circle cx="134" cy="46" r="4" fill="#FFFFFF" opacity="0.8" />
          </g>
        </svg>
      )}
    </div>
  );
};

interface CharacterSpeechBubbleProps {
  character?: CharacterId;
  speech: string;
  subtext?: string;
  mood?: CharacterMood;
  onAudioPlay?: () => void;
  audioText?: string;
  className?: string;
}

export const CharacterSpeechBubble: React.FC<CharacterSpeechBubbleProps> = ({
  character = 'duo',
  speech,
  subtext,
  mood = 'speaking',
  onAudioPlay,
  audioText,
  className = '',
}) => {
  return (
    <div className={`flex items-end gap-3 sm:gap-4 my-2 ${className}`}>
      {/* Cartoon Mascot */}
      <CartoonCharacter character={character} mood={mood} size="md" />

      {/* Comic Speech Bubble */}
      <div className="relative bg-white border-2 border-b-4 border-[#E5E5E5] rounded-3xl p-4 sm:p-5 shadow-sm max-w-lg flex-1">
        {/* Comic speech bubble pointer */}
        <div className="absolute -left-3 bottom-5 w-0 h-0 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent border-r-[12px] border-r-white z-10" />
        <div className="absolute -left-[15px] bottom-5 w-0 h-0 border-t-[9px] border-t-transparent border-b-[9px] border-b-transparent border-r-[14px] border-r-[#E5E5E5]" />

        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <p className="text-base sm:text-lg font-black text-[#3C3C3C] leading-snug">
              {speech}
            </p>
            {subtext && (
              <p className="text-xs font-bold text-[#777777]">
                {subtext}
              </p>
            )}
          </div>

          {onAudioPlay && (
            <button
              onClick={onAudioPlay}
              className="w-10 h-10 rounded-2xl bg-[#1CB0F6] hover:bg-[#24B8FB] border-b-3 border-[#1899D6] text-white flex items-center justify-center shrink-0 active:translate-y-0.5 shadow-xs transition-all"
              title="Listen to pronunciation"
            >
              <span className="text-base">🔊</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
