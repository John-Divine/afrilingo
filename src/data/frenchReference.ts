export interface FrenchDictionaryEntry {
  root: string; // The French word / expression
  meaning: string;
  category:
    | 'Greetings and Basics'
    | 'Food and Sustenance'
    | 'Family and People'
    | 'Nature and the World'
    | 'Travel and Transit'
    | 'Common Verbs'
    | 'Adjectives and Qualities'
    | 'Shopping and Numbers'
    | 'Wisdom and Proverbs';
  gender?: 'm' | 'f' | 'pl' | 'inv';
  pronunciation?: string;
  exampleSagelo?: string; // French example
  exampleEnglish?: string; // English translation
}

export const FRENCH_DICTIONARY: FrenchDictionaryEntry[] = [
  // Greetings and Basics
  {
    root: 'Bonjour',
    meaning: 'Hello / Good morning',
    category: 'Greetings and Basics',
    pronunciation: 'boh(n)-zhoor',
    exampleSagelo: 'Bonjour, comment allez-vous ?',
    exampleEnglish: 'Hello, how are you doing?',
  },
  {
    root: 'Salut',
    meaning: 'Hi / Bye (informal)',
    category: 'Greetings and Basics',
    pronunciation: 'sah-loo',
    exampleSagelo: 'Salut Marc, ça va ?',
    exampleEnglish: 'Hi Marc, how\'s it going?',
  },
  {
    root: 'Merci',
    meaning: 'Thank you',
    category: 'Greetings and Basics',
    pronunciation: 'mehr-see',
    exampleSagelo: 'Merci beaucoup pour votre aide !',
    exampleEnglish: 'Thank you very much for your help!',
  },
  {
    root: 'S\'il vous plaît',
    meaning: 'Please (formal / plural)',
    category: 'Greetings and Basics',
    pronunciation: 'seel voo pleh',
    exampleSagelo: 'Un café, s\'il vous plaît.',
    exampleEnglish: 'A coffee, please.',
  },
  {
    root: 'Au revoir',
    meaning: 'Goodbye',
    category: 'Greetings and Basics',
    pronunciation: 'oh ruh-vwahr',
    exampleSagelo: 'Bonne journée et au revoir !',
    exampleEnglish: 'Have a good day and goodbye!',
  },
  {
    root: 'Enchanté',
    meaning: 'Pleased to meet you',
    category: 'Greetings and Basics',
    pronunciation: 'ahn-shahn-tay',
    exampleSagelo: 'Je m\'appelle Sophie, enchantée !',
    exampleEnglish: 'My name is Sophie, nice to meet you!',
  },

  // Food and Sustenance
  {
    root: 'Le café',
    meaning: 'Coffee / Café',
    category: 'Food and Sustenance',
    gender: 'm',
    pronunciation: 'luh kah-fay',
    exampleSagelo: 'Je voudrais un café au comptoir.',
    exampleEnglish: 'I would like a coffee at the counter.',
  },
  {
    root: 'Le croissant',
    meaning: 'Croissant (buttery crescent pastry)',
    category: 'Food and Sustenance',
    gender: 'm',
    pronunciation: 'luh krwah-sahn',
    exampleSagelo: 'Le croissant est chaud et croustillant.',
    exampleEnglish: 'The croissant is warm and crispy.',
  },
  {
    root: 'La baguette',
    meaning: 'Baguette (traditional French bread)',
    category: 'Food and Sustenance',
    gender: 'f',
    pronunciation: 'lah bah-geht',
    exampleSagelo: 'Une baguette tradition, s\'il vous plaît.',
    exampleEnglish: 'A traditional baguette, please.',
  },
  {
    root: 'Le fromage',
    meaning: 'Cheese',
    category: 'Food and Sustenance',
    gender: 'm',
    pronunciation: 'luh froh-mahzh',
    exampleSagelo: 'J\'adore le fromage de chèvre.',
    exampleEnglish: 'I love goat cheese.',
  },
  {
    root: 'L\'eau',
    meaning: 'Water',
    category: 'Food and Sustenance',
    gender: 'f',
    pronunciation: 'loh',
    exampleSagelo: 'Une carafe d\'eau fraîche, s\'il vous plaît.',
    exampleEnglish: 'A jug of fresh tap water, please.',
  },
  {
    root: 'L\'addition',
    meaning: 'The bill / check',
    category: 'Food and Sustenance',
    gender: 'f',
    pronunciation: 'lah-dee-syohn',
    exampleSagelo: 'L\'addition, s\'il vous plaît monsieur.',
    exampleEnglish: 'The bill, please sir.',
  },

  // Travel and Transit
  {
    root: 'La gare',
    meaning: 'Train station',
    category: 'Travel and Transit',
    gender: 'f',
    pronunciation: 'lah gahr',
    exampleSagelo: 'Le train part de la Gare de Lyon.',
    exampleEnglish: 'The train departs from Gare de Lyon.',
  },
  {
    root: 'Le métro',
    meaning: 'Subway / Metro',
    category: 'Travel and Transit',
    gender: 'm',
    pronunciation: 'luh may-troh',
    exampleSagelo: 'Où est la station de métro la plus proche ?',
    exampleEnglish: 'Where is the nearest metro station?',
  },
  {
    root: 'Le billet',
    meaning: 'Ticket (train, event, plane)',
    category: 'Travel and Transit',
    gender: 'm',
    pronunciation: 'luh bee-yeh',
    exampleSagelo: 'Un billet aller-retour pour Paris.',
    exampleEnglish: 'A round-trip ticket for Paris.',
  },
  {
    root: 'À gauche',
    meaning: 'To the left',
    category: 'Travel and Transit',
    pronunciation: 'ah gohsh',
    exampleSagelo: 'Tournez à gauche après le musée.',
    exampleEnglish: 'Turn left after the museum.',
  },
  {
    root: 'À droite',
    meaning: 'To the right',
    category: 'Travel and Transit',
    pronunciation: 'ah drwaht',
    exampleSagelo: 'L\'hôtel est juste à droite.',
    exampleEnglish: 'The hotel is right on the right.',
  },
  {
    root: 'Tout droit',
    meaning: 'Straight ahead',
    category: 'Travel and Transit',
    pronunciation: 'too drwah',
    exampleSagelo: 'Continuez tout droit pendant cinq minutes.',
    exampleEnglish: 'Continue straight ahead for five minutes.',
  },

  // Family and People
  {
    root: 'La famille',
    meaning: 'Family',
    category: 'Family and People',
    gender: 'f',
    pronunciation: 'lah fah-mee-yuh',
    exampleSagelo: 'Ma famille habite en France.',
    exampleEnglish: 'My family lives in France.',
  },
  {
    root: 'Le père / La mère',
    meaning: 'Father / Mother',
    category: 'Family and People',
    gender: 'm',
    pronunciation: 'luh pehr / lah mehr',
    exampleSagelo: 'Mon père et ma mère sont heureux.',
    exampleEnglish: 'My father and my mother are happy.',
  },
  {
    root: 'Le frère / La sœur',
    meaning: 'Brother / Sister',
    category: 'Family and People',
    gender: 'm',
    pronunciation: 'luh frehr / lah suhr',
    exampleSagelo: 'J\'ai un frère et une sœur.',
    exampleEnglish: 'I have one brother and one sister.',
  },

  // Common Verbs
  {
    root: 'Être',
    meaning: 'To be',
    category: 'Common Verbs',
    pronunciation: 'eh-truh',
    exampleSagelo: 'Je suis ravi d\'être ici avec vous.',
    exampleEnglish: 'I am delighted to be here with you.',
  },
  {
    root: 'Avoir',
    meaning: 'To have',
    category: 'Common Verbs',
    pronunciation: 'ah-vwahr',
    exampleSagelo: 'J\'ai faim et j\'ai soif !',
    exampleEnglish: 'I am hungry and thirsty (lit. I have hunger/thirst)!',
  },
  {
    root: 'Aller',
    meaning: 'To go',
    category: 'Common Verbs',
    pronunciation: 'ah-lay',
    exampleSagelo: 'Comment allez-vous ? Je vais très bien.',
    exampleEnglish: 'How are you? I am doing very well.',
  },
  {
    root: 'Manger',
    meaning: 'To eat',
    category: 'Common Verbs',
    pronunciation: 'mahn-zhay',
    exampleSagelo: 'Nous mangeons ensemble ce soir.',
    exampleEnglish: 'We are eating together tonight.',
  },
  {
    root: 'Boire',
    meaning: 'To drink',
    category: 'Common Verbs',
    pronunciation: 'bwahr',
    exampleSagelo: 'Il boit un grand verre d\'eau.',
    exampleEnglish: 'He is drinking a large glass of water.',
  },

  // Wisdom and Proverbs
  {
    root: 'C\'est la vie',
    meaning: 'That\'s life (philosophical acceptance)',
    category: 'Wisdom and Proverbs',
    pronunciation: 'seh lah vee',
    exampleSagelo: 'Ce n\'est pas grave, c\'est la vie !',
    exampleEnglish: 'It\'s not a big deal, that\'s life!',
  },
  {
    root: 'Joie de vivre',
    meaning: 'Joy of living / exuberant enjoyment of life',
    category: 'Wisdom and Proverbs',
    pronunciation: 'zhwah duh vee-vruh',
    exampleSagelo: 'Paris rayonne d\'une immense joie de vivre.',
    exampleEnglish: 'Paris radiates an immense joy of living.',
  },
  {
    root: 'Vouloir, c\'est pouvoir',
    meaning: 'Where there is a will, there is a way',
    category: 'Wisdom and Proverbs',
    pronunciation: 'voo-lwahr seh poo-vwahr',
    exampleSagelo: 'Persévère ! Vouloir, c\'est pouvoir.',
    exampleEnglish: 'Persevere! Where there is a will, there is a way.',
  },
];

export interface FrenchPhrasebookChapter {
  id: string;
  chapterNumber: number;
  title: string;
  subtitle: string;
  phrases: Array<{
    sagelo: string; // The French phrase
    english: string;
  }>;
}

export const FRENCH_PHRASEBOOK_CHAPTERS: FrenchPhrasebookChapter[] = [
  {
    id: 'fr-pb-1',
    chapterNumber: 1,
    title: 'Salutations & Présentations',
    subtitle: 'Meeting people and social politeness',
    phrases: [
      { sagelo: 'Bonjour ! Comment vous appelez-vous ?', english: 'Hello! What is your name? (polite)' },
      { sagelo: 'Je m\'appelle Thomas, enchanté !', english: 'My name is Thomas, pleased to meet you!' },
      { sagelo: 'Comment allez-vous aujourd\'hui ?', english: 'How are you doing today?' },
      { sagelo: 'Ça va très bien, merci, et vous ?', english: 'I\'m doing very well, thank you, and you?' },
    ],
  },
  {
    id: 'fr-pb-2',
    chapterNumber: 2,
    title: 'Au Café & Restaurant',
    subtitle: 'Ordering food and drinks with French poise',
    phrases: [
      { sagelo: 'Une table pour deux personnes, s\'il vous plaît.', english: 'A table for two people, please.' },
      { sagelo: 'Je voudrais un café crème et un croissant.', english: 'I would like a coffee with cream and a croissant.' },
      { sagelo: 'Une carafe d\'eau et du pain, s\'il vous plaît.', english: 'A jug of tap water and bread, please.' },
      { sagelo: 'L\'addition, s\'il vous plaît.', english: 'The bill, please.' },
      { sagelo: 'C\'était absolument délicieux !', english: 'It was absolutely delicious!' },
    ],
  },
  {
    id: 'fr-pb-3',
    chapterNumber: 3,
    title: 'Transports & Demander son Chemin',
    subtitle: 'Navigating Paris, metros, and streets',
    phrases: [
      { sagelo: 'Pardon, où est la station de métro la plus proche ?', english: 'Excuse me, where is the nearest metro station?' },
      { sagelo: 'Prenez la ligne 1, direction La Défense.', english: 'Take Line 1 towards La Défense.' },
      { sagelo: 'C\'est tout droit, puis la deuxième rue à droite.', english: 'It is straight ahead, then the second street on the right.' },
      { sagelo: 'Est-ce que c\'est près d\'ici ou loin ?', english: 'Is it near here or far?' },
    ],
  },
  {
    id: 'fr-pb-4',
    chapterNumber: 4,
    title: 'Shopping & Achats',
    subtitle: 'Buying souvenirs, clothes, and asking prices',
    phrases: [
      { sagelo: 'Combien ça coûte, s\'il vous plaît ?', english: 'How much does this cost, please?' },
      { sagelo: 'Vous acceptez la carte bancaire ?', english: 'Do you accept credit card?' },
      { sagelo: 'Avez-vous une taille au-dessus ?', english: 'Do you have a size up?' },
      { sagelo: 'C\'est une très belle qualité.', english: 'It is very fine quality.' },
    ],
  },
  {
    id: 'fr-pb-5',
    chapterNumber: 5,
    title: 'Proverbes & Sagesse Populaire',
    subtitle: 'Timeless French idioms and cultural proverbs',
    phrases: [
      { sagelo: 'Petit à petit, l\'oiseau fait son nid.', english: 'Little by little, the bird builds its nest (patience brings success).' },
      { sagelo: 'Vouloir, c\'est pouvoir.', english: 'Where there is a will, there is a way.' },
      { sagelo: 'C\'est la vie !', english: 'That\'s life (graceful acceptance).' },
      { sagelo: 'Après la pluie, le beau temps.', english: 'After the rain comes sunshine (hope after hardship).' },
    ],
  },
];

export const FRENCH_PROVERBS = [
  {
    sagelo: 'Petit à petit, l\'oiseau fait son nid.',
    english: 'Little by little, the bird builds its nest.',
    literal: 'little by little, bird makes its nest (celebrating small daily progress)',
  },
  {
    sagelo: 'Vouloir, c\'est pouvoir.',
    english: 'Where there is a will, there is a way.',
    literal: 'to want is to be able',
  },
  {
    sagelo: 'C\'est la vie !',
    english: 'That\'s life!',
    literal: 'it is the life (embracing reality with poise)',
  },
  {
    sagelo: 'Après la pluie, le beau temps.',
    english: 'After the rain comes sunshine.',
    literal: 'after the rain, the fine weather',
  },
  {
    sagelo: 'Il n\'y a pas de fumée sans feu.',
    english: 'There is no smoke without fire.',
    literal: 'there is no smoke without fire',
  },
];
