import { MatchWordPair } from './matchMadnessPool';

export const FRENCH_MATCH_MADNESS_DICTIONARY: MatchWordPair[] = [
  // Greetings & Courtesies
  { id: 'fr-m1', sagelo: 'bonjour', english: 'hello / good morning', category: 'Greetings' },
  { id: 'fr-m2', sagelo: 'salut', english: 'hi / bye', category: 'Greetings' },
  { id: 'fr-m3', sagelo: 'merci', english: 'thank you', category: 'Courtesies' },
  { id: 'fr-m4', sagelo: 'au revoir', english: 'goodbye', category: 'Greetings' },
  { id: 'fr-m5', sagelo: 's\'il vous plaît', english: 'please', category: 'Courtesies' },
  { id: 'fr-m6', sagelo: 'enchanté', english: 'pleased to meet you', category: 'Courtesies' },
  { id: 'fr-m7', sagelo: 'pardon', english: 'excuse me / sorry', category: 'Courtesies' },
  { id: 'fr-m8', sagelo: 'bonne nuit', english: 'good night', category: 'Greetings' },
  { id: 'fr-m9', sagelo: 'à bientôt', english: 'see you soon', category: 'Greetings' },
  { id: 'fr-m10', sagelo: 'oui', english: 'yes', category: 'Basics' },
  { id: 'fr-m11', sagelo: 'non', english: 'no', category: 'Basics' },

  // Bistro & Food
  { id: 'fr-m12', sagelo: 'le café', english: 'coffee', category: 'Food' },
  { id: 'fr-m13', sagelo: 'le croissant', english: 'croissant', category: 'Food' },
  { id: 'fr-m14', sagelo: 'la baguette', english: 'baguette', category: 'Food' },
  { id: 'fr-m15', sagelo: 'l\'eau', english: 'water', category: 'Food' },
  { id: 'fr-m16', sagelo: 'le pain', english: 'bread', category: 'Food' },
  { id: 'fr-m17', sagelo: 'le fromage', english: 'cheese', category: 'Food' },
  { id: 'fr-m18', sagelo: 'le vin', english: 'wine', category: 'Food' },
  { id: 'fr-m19', sagelo: 'la pomme', english: 'apple', category: 'Food' },
  { id: 'fr-m20', sagelo: 'l\'addition', english: 'the bill / check', category: 'Food' },
  { id: 'fr-m21', sagelo: 'délicieux', english: 'delicious', category: 'Food' },

  // People & Family
  { id: 'fr-m22', sagelo: 'l\'homme', english: 'the man', category: 'People' },
  { id: 'fr-m23', sagelo: 'la femme', english: 'the woman', category: 'People' },
  { id: 'fr-m24', sagelo: 'le garçon', english: 'the boy', category: 'People' },
  { id: 'fr-m25', sagelo: 'la fille', english: 'the girl', category: 'People' },
  { id: 'fr-m26', sagelo: 'le père', english: 'the father', category: 'Family' },
  { id: 'fr-m27', sagelo: 'la mère', english: 'the mother', category: 'Family' },
  { id: 'fr-m28', sagelo: 'le frère', english: 'the brother', category: 'Family' },
  { id: 'fr-m29', sagelo: 'la sœur', english: 'the sister', category: 'Family' },
  { id: 'fr-m30', sagelo: 'l\'ami', english: 'the friend', category: 'People' },

  // Travel & City
  { id: 'fr-m31', sagelo: 'la gare', english: 'train station', category: 'Travel' },
  { id: 'fr-m32', sagelo: 'le métro', english: 'subway / metro', category: 'Travel' },
  { id: 'fr-m33', sagelo: 'le billet', english: 'ticket', category: 'Travel' },
  { id: 'fr-m34', sagelo: 'à gauche', english: 'to the left', category: 'Directions' },
  { id: 'fr-m35', sagelo: 'à droite', english: 'to the right', category: 'Directions' },
  { id: 'fr-m36', sagelo: 'tout droit', english: 'straight ahead', category: 'Directions' },
  { id: 'fr-m37', sagelo: 'la sortie', english: 'exit', category: 'Travel' },
  { id: 'fr-m38', sagelo: 'l\'hôtel', english: 'hotel', category: 'Travel' },
  { id: 'fr-m39', sagelo: 'l\'avion', english: 'airplane', category: 'Travel' },
  { id: 'fr-m40', sagelo: 'la valise', english: 'suitcase', category: 'Travel' },

  // Verbs & Actions
  { id: 'fr-m41', sagelo: 'manger', english: 'to eat', category: 'Verbs' },
  { id: 'fr-m42', sagelo: 'boire', english: 'to drink', category: 'Verbs' },
  { id: 'fr-m43', sagelo: 'parler', english: 'to speak', category: 'Verbs' },
  { id: 'fr-m44', sagelo: 'aimer', english: 'to like / love', category: 'Verbs' },
  { id: 'fr-m45', sagelo: 'adorer', english: 'to adore', category: 'Verbs' },
  { id: 'fr-m46', sagelo: 'habiter', english: 'to live (reside)', category: 'Verbs' },
  { id: 'fr-m47', sagelo: 'chercher', english: 'to look for', category: 'Verbs' },
  { id: 'fr-m48', sagelo: 'comprendre', english: 'to understand', category: 'Verbs' },
  { id: 'fr-m49', sagelo: 'acheter', english: 'to buy', category: 'Verbs' },
  { id: 'fr-m50', sagelo: 'visiter', english: 'to visit', category: 'Verbs' },

  // Qualities & Wisdom
  { id: 'fr-m51', sagelo: 'beau / belle', english: 'beautiful', category: 'Qualities' },
  { id: 'fr-m52', sagelo: 'grand', english: 'tall / big', category: 'Qualities' },
  { id: 'fr-m53', sagelo: 'petit', english: 'small', category: 'Qualities' },
  { id: 'fr-m54', sagelo: 'bon', english: 'good', category: 'Qualities' },
  { id: 'fr-m55', sagelo: 'cher', english: 'expensive', category: 'Shopping' },
  { id: 'fr-m56', sagelo: 'bon marché', english: 'cheap / inexpensive', category: 'Shopping' },
  { id: 'fr-m57', sagelo: 'c\'est la vie', english: 'that\'s life', category: 'Wisdom' },
  { id: 'fr-m58', sagelo: 'joie de vivre', english: 'joy of living', category: 'Wisdom' },
  { id: 'fr-m59', sagelo: 'magnifique', english: 'magnificent', category: 'Qualities' },
  { id: 'fr-m60', sagelo: 'formidable', english: 'wonderful / great', category: 'Qualities' },
];
