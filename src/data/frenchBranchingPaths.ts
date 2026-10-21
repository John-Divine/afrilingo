import { CurriculumLesson } from './sageloCurriculum';
import { SkillBranch } from './sageloBranchingPaths';

export const FRENCH_SKILL_BRANCHES: SkillBranch[] = [
  // 1. FRENCH CAFÉ & BISTRO CULTURE (Unlocked after Unit 1)
  {
    id: 'branch-fr-cafe',
    title: 'French Café & Bistro Culture',
    tagline: 'Order fine wines, artisanal cheeses, pastries, and master the art of dining out.',
    category: 'conversational',
    icon: '☕',
    badgeEmoji: '🥐',
    themeColor: '#0284C7',
    accentBorder: 'border-[#0284C7]',
    bgGradient: 'from-[#E0F2FE] via-[#BAE6FD] to-[#7DD3FC]',
    unlockRequirement: {
      unitId: 'fr-unit-1',
      unitNumber: 1,
      unitName: 'Unit 1: Premières Salutations & Présentations',
      requiredCompletedCount: 2,
      description: 'Complete at least 2 lessons in Unit 1 to unlock French Café Culture.',
    },
    lessons: [
      {
        id: 'branch-fr-cafe-1',
        unitId: 'branch-fr-cafe',
        numberLabel: 'Café 1',
        title: 'Commander au Comptoir vs En Terrasse',
        subtitle: 'Learn the difference between ordering at the counter and sitting on the terrace.',
        xpReward: 35,
        wordsIntroduced: ['terrasse', 'comptoir', 'un verre', 'carafe', 'serveur'],
        teachingSlides: [
          {
            title: 'Terrasse vs. Comptoir in Paris',
            body: 'Did you know? In Paris cafés, a coffee at the counter ("au comptoir") is often half the price of drinking it on the sunny street terrace ("en terrasse")! Servers take pride in table service.',
            examples: [
              { sagelo: 'Un café au comptoir, s\'il vous plaît !', english: 'A coffee at the counter, please!' },
              { sagelo: 'Une table pour deux en terrasse ?', english: 'A table for two on the terrace?' },
              { sagelo: 'Une carafe d\'eau, s\'il vous plaît.', english: 'A jug of tap water, please.' },
            ],
            mentorTip: {
              speaker: 'nyango',
              text: 'A "carafe d\'eau" is completely free by French law in every restaurant! Don\'t buy expensive bottled water unless you prefer sparkling.',
            },
          },
        ],
        exercises: [
          {
            id: 'fr-bc1-ex1',
            type: 'multiple_choice',
            speaker: 'duo',
            prompt: 'How do you ask for a table for two on the terrace?',
            options: [
              'Une table pour deux en terrasse, s\'il vous plaît.',
              'Une table pour dix au comptoir.',
              'Un café pour deux dans la gare.',
            ],
            correctAnswer: 'Une table pour deux en terrasse, s\'il vous plaît.',
            explanation: '"Une table pour deux en terrasse" is polite and clear.',
          },
          {
            id: 'fr-bc1-ex2',
            type: 'word_bank',
            speaker: 'mpaka',
            prompt: 'Translate: "A coffee at the counter, please!"',
            promptTranslation: 'Un café au comptoir s\'il vous plaît !',
            wordBankTiles: ['Un', 'café', 'au', 'comptoir,', 's\'il', 'vous', 'plaît', '!', 'terrasse'],
            correctAnswer: 'Un café au comptoir, s\'il vous plaît !',
            explanation: '"Un café au comptoir, s\'il vous plaît !" is the true Parisian morning ritual.',
          },
        ],
      },
    ],
  },

  // 2. PARIS MÉTRO & TRAVEL NAVIGATION (Unlocked after Unit 2)
  {
    id: 'branch-fr-metro',
    title: 'Paris Métro & City Navigation',
    tagline: 'Read RATP maps, change lines effortlessly, and master airport and taxi journeys.',
    category: 'business',
    icon: '🚇',
    badgeEmoji: '🗺️',
    themeColor: '#16A34A',
    accentBorder: 'border-[#16A34A]',
    bgGradient: 'from-[#DCFCE7] via-[#BBF7D0] to-[#86EFAC]',
    unlockRequirement: {
      unitId: 'fr-unit-2',
      unitNumber: 2,
      unitName: 'Unit 2: Au Café & Gastronomie Parisienne',
      requiredCompletedCount: 2,
      description: 'Complete at least 2 lessons in Unit 2 to unlock Paris Métro Navigation.',
    },
    lessons: [
      {
        id: 'branch-fr-metro-1',
        unitId: 'branch-fr-metro',
        numberLabel: 'Métro 1',
        title: 'Naviguer les Lignes & Changements',
        subtitle: 'Understand line termini (direction) to catch the train going the right way.',
        xpReward: 35,
        wordsIntroduced: ['direction', 'terminus', 'plan', 'navigo', 'valider'],
        teachingSlides: [
          {
            title: 'How to Choose Your Platform in Paris',
            body: 'Paris metro lines are designated by their end station ("Direction"). For example, Line 1 goes towards "La Défense" in the west or "Château de Vincennes" in the east.',
            examples: [
              { sagelo: 'Prenez la ligne 1, direction La Défense.', english: 'Take Line 1, towards La Défense.' },
              { sagelo: 'Changez à la station Châtelet.', english: 'Transfer at Châtelet station.' },
            ],
            mentorTip: {
              speaker: 'mwana',
              text: 'Always validate your Navigo pass or ticket at the gate turnstile ("validez votre ticket") before heading to the platform!',
            },
          },
        ],
        exercises: [
          {
            id: 'fr-bm1-ex1',
            type: 'multiple_choice',
            speaker: 'duo',
            prompt: 'In the Paris metro, how do you know which platform goes towards your destination?',
            options: [
              'Check the "Direction" marked by the end-of-line station.',
              'Ask every driver as the train arrives.',
              'All trains go in circles.',
            ],
            correctAnswer: 'Check the "Direction" marked by the end-of-line station.',
            explanation: 'Signs always state "Direction: [End Station]".',
          },
        ],
      },
    ],
  },

  // 3. BUSINESS FRENCH & PROFESSIONAL ETIQUETTE (Unlocked after Unit 3)
  {
    id: 'branch-fr-business',
    title: 'Business French & Professional Etiquette',
    tagline: 'Formal email salutations, polite meetings, negotiations, and corporate vocabulary.',
    category: 'business',
    icon: '💼',
    badgeEmoji: '🤝',
    themeColor: '#D97706',
    accentBorder: 'border-[#D97706]',
    bgGradient: 'from-[#FEF3C7] via-[#FDE68A] to-[#FCD34D]',
    unlockRequirement: {
      unitId: 'fr-unit-3',
      unitNumber: 3,
      unitName: 'Unit 3: En Voyage & La Ville de Paris',
      requiredCompletedCount: 2,
      description: 'Complete at least 2 lessons in Unit 3 to unlock Business French.',
    },
    lessons: [
      {
        id: 'branch-fr-biz-1',
        unitId: 'branch-fr-business',
        numberLabel: 'Biz. 1',
        title: 'Le Vouvoiement Professionnel & Courriel',
        subtitle: 'Formal greetings, sign-offs, and polite requests in corporate Francophone settings.',
        xpReward: 35,
        wordsIntroduced: ['cordialement', 'reunion', 'projet', 'collaborateur', 'bien a vous'],
        teachingSlides: [
          {
            title: 'Professional French Sign-Offs',
            body: 'In Francophone business emails, sign-offs carry significant nuance. "Cordialement" is the universal, modern, and polite standard for emails.',
            examples: [
              { sagelo: 'Bien cordialement,', english: 'Kind regards,' },
              { sagelo: 'Je reste à votre disposition.', english: 'I remain at your disposal.' },
            ],
            mentorTip: {
              speaker: 'mpaka',
              text: 'Always use "vous" with colleagues and clients until they explicitly invite you to "se tutoyer" (use "tu")!',
            },
          },
        ],
        exercises: [
          {
            id: 'fr-bb1-ex1',
            type: 'multiple_choice',
            speaker: 'duo',
            prompt: 'What is the most standard, respectful sign-off for a French business email?',
            options: ['Cordialement,', 'Bisous !', 'Salut mon pote !'],
            correctAnswer: 'Cordialement,',
            explanation: '"Cordialement," means "Kind regards" and is professional.',
          },
        ],
      },
    ],
  },

  // 4. FRENCH SLANG, IDIOMS & L'ARGOT / VERLAN (Unlocked after Unit 5)
  {
    id: 'branch-fr-slang',
    title: 'French Slang, Idioms & L\'Argot / Verlan',
    tagline: 'Decode everyday Parisian slang: "ouf", "chelou", "du coup", and colloquial banter.',
    category: 'philosophy',
    icon: '🎭',
    badgeEmoji: '⚡',
    themeColor: '#7C3AED',
    accentBorder: 'border-[#7C3AED]',
    bgGradient: 'from-[#EDE9FE] via-[#DDD6FE] to-[#C4B5FD]',
    unlockRequirement: {
      unitId: 'fr-unit-5',
      unitNumber: 5,
      unitName: 'Unit 5: Loisirs, Shopping & Marché',
      requiredCompletedCount: 1,
      description: 'Complete Unit 5 to unlock French Slang, Verlan and Pop Culture.',
    },
    lessons: [
      {
        id: 'branch-fr-slang-1',
        unitId: 'branch-fr-slang',
        numberLabel: 'Slang 1',
        title: 'Le Verlan Décrypté: Ouf, Chelou & Meuf',
        subtitle: 'Inverted syllable slang widely used in French cinema, music, and casual youth culture.',
        xpReward: 35,
        wordsIntroduced: ['ouf', 'chelou', 'meuf', 'mec', 'du coup'],
        teachingSlides: [
          {
            title: 'What is "Verlan"? (L\'envers)',
            body: '"Verlan" is French back-slang where syllables are reversed! "Verlan" itself comes from "l\'envers" (the reverse). It is heard daily throughout France and Francophone media.',
            table: {
              headers: ['Verlan Word', 'Original Word', 'English Meaning'],
              rows: [
                ['Ouf', 'Fou (crazy)', 'Crazy / unbelievable ("C\'est un truc de ouf !")'],
                ['Chelou', 'Louche (sketchy/weird)', 'Weird / suspicious'],
                ['Meuf', 'Femme (woman)', 'Girl / girlfriend / woman (casual)'],
                ['Mec', 'Mecquereau', 'Guy / dude / boyfriend'],
                ['Du coup', 'Speech filler', '"So / therefore" (used in almost every sentence!)'],
              ],
            },
            examples: [
              { sagelo: 'C\'est un truc de ouf !', english: 'That is totally crazy / insane!' },
              { sagelo: 'Ce film est un peu chelou, non ?', english: 'This movie is a bit weird, right?' },
            ],
            mentorTip: {
              speaker: 'nyango',
              text: 'You will hear "Du coup" dozens of times a day in France — it is the French equivalent of "So...", used to start or link sentences smoothly!',
            },
          },
        ],
        exercises: [
          {
            id: 'fr-bs1-ex1',
            type: 'multiple_choice',
            speaker: 'duo',
            prompt: 'In French Verlan slang, what does "un truc de ouf" mean?',
            options: ['Something crazy or awesome', 'A piece of bread', 'A train ticket'],
            correctAnswer: 'Something crazy or awesome',
            explanation: '"Ouf" is the reverse of "fou" (crazy). "Un truc de ouf" = something insane!',
          },
        ],
      },
    ],
  },
];

export function isFrenchBranchUnlocked(
  branch: SkillBranch,
  completedLessonIds: string[]
): {
  isUnlocked: boolean;
  completedCount: number;
  requiredCount: number;
  progressPercent: number;
  remainingCount: number;
} {
  const req = branch.unlockRequirement;
  const completedInUnit = completedLessonIds.filter((id) => {
    if (req.unitId === 'fr-unit-1') {
      return ['fr-unit1-l1', 'fr-unit1-l2', 'fr-unit1-l3'].includes(id);
    }
    if (req.unitId === 'fr-unit-2') {
      return ['fr-unit2-l1', 'fr-unit2-l2', 'fr-unit2-l3'].includes(id);
    }
    if (req.unitId === 'fr-unit-3') {
      return ['fr-unit3-l1', 'fr-unit3-l2'].includes(id);
    }
    if (req.unitId === 'fr-unit-4') {
      return ['fr-unit4-l1', 'fr-unit4-l2'].includes(id);
    }
    if (req.unitId === 'fr-unit-5') {
      return ['fr-unit5-l1'].includes(id);
    }
    if (req.unitId === 'fr-unit-6') {
      return ['fr-unit6-l1'].includes(id);
    }
    return false;
  }).length;

  const requiredCount = req.requiredCompletedCount;
  const isUnlocked = completedInUnit >= requiredCount;
  const progressPercent = Math.min(100, Math.round((completedInUnit / requiredCount) * 100));
  const remainingCount = Math.max(0, requiredCount - completedInUnit);

  return {
    isUnlocked,
    completedCount: completedInUnit,
    requiredCount,
    progressPercent,
    remainingCount,
  };
}

export const ALL_FRENCH_BRANCH_LESSONS: CurriculumLesson[] = FRENCH_SKILL_BRANCHES.flatMap(
  (b) => b.lessons
);
