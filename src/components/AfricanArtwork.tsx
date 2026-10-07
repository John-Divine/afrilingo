import React from 'react';

export const CHARACTER_METADATA: Record<
  'mpaka' | 'nyango' | 'mwana',
  {
    name: string;
    sageloTitle: string;
    role: string;
    fallbackBg: string;
    accentColor: string;
  }
> = {
  mpaka: {
    name: 'Mpaka Kwesi',
    sageloTitle: 'Misaga Grande (Elder Sage)',
    role: 'Master of Grammar, Logic & Tone Resonance',
    fallbackBg: 'from-[#312E81] to-[#1E1B4B]',
    accentColor: '#D99B26',
  },
  nyango: {
    name: 'Nyango Amina',
    sageloTitle: 'Misaga wa Wina (Storyteller & Linguist)',
    role: 'Guide to Roots, Conversation & Ceremonial Script',
    fallbackBg: 'from-[#C84B24] to-[#8F2D10]',
    accentColor: '#C84B24',
  },
  mwana: {
    name: 'Mwana Kofi',
    sageloTitle: 'Mimwana Lume (Radiant Learner)',
    role: 'Fellow Seeker in the Circle of Sages',
    fallbackBg: 'from-[#1B6B4A] to-[#0F4C32]',
    accentColor: '#1B6B4A',
  },
};

interface CharacterAvatarProps {
  character: 'mpaka' | 'nyango' | 'mwana';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const CharacterAvatar: React.FC<CharacterAvatarProps> = ({
  character,
  size = 'md',
  className = '',
}) => {
  const meta = CHARACTER_METADATA[character] || CHARACTER_METADATA.mpaka;

  const sizeClasses = {
    sm: 'w-9 h-9',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-20 h-20',
  }[size];

  return (
    <div
      className={`relative rounded-full overflow-hidden shrink-0 border-2 border-[#D99B26] shadow-xs flex items-center justify-center ${sizeClasses} ${className}`}
    >
      {/* Handcrafted, culturally authentic Pan-African character vector SVGs */}
      {character === 'mpaka' && (
        <svg viewBox="0 0 80 80" className="w-full h-full bg-[#2A2438]">
          {/* Elder Mpaka: Kind elder sage, silver-bearded chin, kente indigo and gold sash */}
          <circle cx="40" cy="40" r="38" fill="#2E201B" />
          {/* Shoulders & Kente Sash */}
          <path d="M12 75 C18 56, 62 56, 68 75 Z" fill="#1E1B4B" />
          <path d="M22 60 L36 78 L44 78 L30 60 Z" fill="#D99B26" />
          <path d="M32 60 L46 78 L54 78 L40 60 Z" fill="#C84B24" />
          {/* Head & Neck */}
          <ellipse cx="40" cy="46" rx="9" ry="12" fill="#5A3825" />
          <ellipse cx="40" cy="35" rx="16" ry="19" fill="#6B432C" />
          {/* Silver hair & temples */}
          <path d="M24 32 C24 18, 56 18, 56 32 C56 22, 24 22, 24 32 Z" fill="#D1D5DB" />
          <circle cx="23" cy="34" r="3" fill="#D1D5DB" />
          <circle cx="57" cy="34" r="3" fill="#D1D5DB" />
          {/* Eyes & Warm Expression */}
          <circle cx="34" cy="33" r="2" fill="#1C1613" />
          <circle cx="46" cy="33" r="2" fill="#1C1613" />
          <path d="M31 29 Q34 27 37 29" stroke="#E5E7EB" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M43 29 Q46 27 49 29" stroke="#E5E7EB" strokeWidth="1.5" strokeLinecap="round" />
          {/* Nose & Smile */}
          <path d="M39 33 L38 38 L42 38" stroke="#4A2E1D" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M35 43 Q40 47 45 43" stroke="#3D2415" strokeWidth="1.8" strokeLinecap="round" />
          {/* Silver Beard */}
          <path d="M33 46 C33 58, 47 58, 47 46 Z" fill="#E5E7EB" />
        </svg>
      )}

      {character === 'nyango' && (
        <svg viewBox="0 0 80 80" className="w-full h-full bg-[#3B1F17]">
          {/* Mentor Nyango: Radiant African linguist with braided hair & brass ornaments */}
          <circle cx="40" cy="40" r="38" fill="#3D1D16" />
          {/* Shoulders & Terracotta Woven Attire */}
          <path d="M12 75 C18 56, 62 56, 68 75 Z" fill="#C84B24" />
          <path d="M34 62 L40 72 L46 62 Z" fill="#D99B26" />
          {/* Head & Neck */}
          <ellipse cx="40" cy="46" rx="8" ry="12" fill="#5C3623" />
          <ellipse cx="40" cy="35" rx="15" ry="18" fill="#6E422B" />
          {/* Braids & Brass Adornments */}
          <path d="M22 36 C20 18, 60 18, 58 36 C54 22, 26 22, 22 36 Z" fill="#1C1613" />
          <path d="M22 28 C18 36, 18 50, 21 54" stroke="#1C1613" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M58 28 C62 36, 62 50, 59 54" stroke="#1C1613" strokeWidth="3.5" strokeLinecap="round" />
          {/* Brass beads on braids */}
          <circle cx="20" cy="42" r="2.2" fill="#D99B26" />
          <circle cx="60" cy="42" r="2.2" fill="#D99B26" />
          <circle cx="21" cy="52" r="2" fill="#D99B26" />
          <circle cx="59" cy="52" r="2" fill="#D99B26" />
          {/* Eyes, Brows & Smile */}
          <circle cx="34" cy="34" r="2.2" fill="#1C1613" />
          <circle cx="46" cy="34" r="2.2" fill="#1C1613" />
          <path d="M31 29 Q34 26 37 29" stroke="#1C1613" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M43 29 Q46 26 49 29" stroke="#1C1613" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M39 34 L38 38 L42 38" stroke="#4A2E1D" strokeWidth="1.4" strokeLinecap="round" />
          <path d="M34 43 Q40 48 46 43" stroke="#991B1B" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      )}

      {character === 'mwana' && (
        <svg viewBox="0 0 80 80" className="w-full h-full bg-[#1A3328]">
          {/* Learner Mwana: Curious bright youth in emerald & gold patterned tunic */}
          <circle cx="40" cy="40" r="38" fill="#1C382B" />
          {/* Shoulders & Emerald Tunic */}
          <path d="M12 75 C18 56, 62 56, 68 75 Z" fill="#1B6B4A" />
          <path d="M36 60 L40 68 L44 60 Z" fill="#D99B26" />
          {/* Head & Neck */}
          <ellipse cx="40" cy="46" rx="8" ry="11" fill="#613B24" />
          <ellipse cx="40" cy="35" rx="15" ry="17" fill="#784B2E" />
          {/* Short Textured Hair */}
          <path d="M23 32 C23 18, 57 18, 57 32 Z" fill="#1C1613" />
          <circle cx="28" cy="22" r="4" fill="#1C1613" />
          <circle cx="40" cy="19" r="4.5" fill="#1C1613" />
          <circle cx="52" cy="22" r="4" fill="#1C1613" />
          {/* Big Bright Curious Eyes */}
          <ellipse cx="34" cy="34" rx="2.5" ry="3" fill="#FFFFFF" />
          <ellipse cx="46" cy="34" rx="2.5" ry="3" fill="#FFFFFF" />
          <circle cx="34.5" cy="34.5" r="1.6" fill="#1C1613" />
          <circle cx="46.5" cy="34.5" r="1.6" fill="#1C1613" />
          {/* Playful Smile */}
          <path d="M35 43 Q40 48 45 43" stroke="#3D2415" strokeWidth="2" strokeLinecap="round" />
        </svg>
      )}
    </div>
  );
};

export const AfricanSanctuaryHeroArt: React.FC = () => {
  return (
    <svg
      viewBox="0 0 1200 480"
      className="w-full h-full object-cover"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#431407" />
          <stop offset="45%" stopColor="#854D0E" />
          <stop offset="85%" stopColor="#D97706" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>
        <linearGradient id="riverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1E3A8A" />
          <stop offset="50%" stopColor="#0284C7" />
          <stop offset="100%" stopColor="#38BDF8" />
        </linearGradient>
      </defs>

      {/* Warm Golden Hour Savanna Sky */}
      <rect width="1200" height="480" fill="url(#skyGrad)" />

      {/* Sun on Horizon */}
      <circle cx="680" cy="240" r="110" fill="#FEF08A" opacity="0.85" />
      <circle cx="680" cy="240" r="160" fill="#FEF08A" opacity="0.3" />

      {/* Mountain Silhouettes */}
      <polygon points="-50,340 220,190 480,340" fill="#713F12" opacity="0.55" />
      <polygon points="340,340 600,160 880,340" fill="#581C87" opacity="0.45" />
      <polygon points="760,340 1020,180 1250,340" fill="#701A75" opacity="0.5" />

      {/* Earth Terraces & Mudcloth Sanctuary Walls */}
      <path d="M0 310 Q350 280 700 320 T1200 300 L1200 480 L0 480 Z" fill="#7C2D12" />
      <path d="M0 340 Q400 310 800 360 T1200 330 L1200 480 L0 480 Z" fill="#9A3412" />

      {/* Sanctuary Dwellings with Bogolan Geometric Patterns */}
      <rect x="740" y="270" width="160" height="90" rx="8" fill="#C2410C" />
      <polygon points="730,270 820,200 910,270" fill="#78350F" />
      <rect x="795" y="305" width="30" height="55" rx="14" fill="#451A03" />

      {/* Flowing River (Dovu) */}
      <path
        d="M200 480 C360 410, 480 370, 680 370 C850 370, 980 430, 1100 480 Z"
        fill="url(#riverGrad)"
        opacity="0.8"
      />

      {/* Majestic Ancient Baobab Tree */}
      <path d="M120 480 C130 380, 150 310, 190 280 C180 250, 140 230, 120 220 C170 210, 200 240, 220 260 C240 220, 280 210, 310 200 C290 230, 260 250, 250 280 C290 320, 310 390, 320 480 Z" fill="#3D1D16" />
      {/* Baobab Foliage */}
      <ellipse cx="140" cy="200" rx="65" ry="35" fill="#14532D" />
      <ellipse cx="230" cy="180" rx="85" ry="45" fill="#166534" />
      <ellipse cx="310" cy="195" rx="60" ry="32" fill="#15803D" />
      <ellipse cx="220" cy="155" rx="65" ry="35" fill="#16A34A" opacity="0.9" />
    </svg>
  );
};
