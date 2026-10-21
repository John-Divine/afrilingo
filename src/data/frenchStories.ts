export interface StoryDialogueLine {
  speaker: string;
  avatar: string;
  sagelo: string; // The target language dialogue (French in this course)
  english: string;
  isQuestion?: boolean;
  questionPrompt?: string;
  questionOptions?: string[];
  questionCorrect?: string;
}

export interface DuolingoStory {
  id: string;
  title: string;
  sageloTitle: string; // French title
  description: string;
  xpReward: number;
  coverEmoji: string;
  accentColor: string;
  lines: StoryDialogueLine[];
}

export const FRENCH_STORIES: DuolingoStory[] = [
  {
    id: 'fr-story-1',
    title: 'A Meeting at Café de Flore',
    sageloTitle: 'Une Rencontre au Café de Flore',
    description: 'Junior and Bea order croissants, espresso, and learn Parisian cafe etiquette.',
    xpReward: 30,
    coverEmoji: '☕',
    accentColor: '#1CB0F6',
    lines: [
      {
        speaker: 'Junior',
        avatar: '🧒',
        sagelo: 'Bonjour Bea ! Regarde cette belle terrasse au soleil.',
        english: 'Hello Bea! Look at this beautiful terrace in the sun.',
      },
      {
        speaker: 'Bea',
        avatar: '👩',
        sagelo: 'Oui Junior ! Asseyons-nous ici. C\'est le célèbre Café de Flore.',
        english: 'Yes Junior! Let\'s sit here. This is the famous Café de Flore.',
      },
      {
        speaker: 'Serveur',
        avatar: '🤵',
        sagelo: 'Bonjour messieurs-dames. Que désirez-vous prendre ?',
        english: 'Hello ladies and gentlemen. What would you like to have?',
      },
      {
        speaker: 'Junior',
        avatar: '🧒',
        sagelo: 'Je voudrais un chocolat chaud et deux croissants, s\'il vous plaît !',
        english: 'I would like a hot chocolate and two croissants, please!',
      },
      {
        speaker: 'System',
        avatar: '❓',
        sagelo: 'Question de compréhension',
        english: 'Comprehension check',
        isQuestion: true,
        questionPrompt: 'What did Junior politely ask to order?',
        questionOptions: [
          'A hot chocolate and two croissants',
          'A bottle of wine and cheese',
          'Only a glass of water',
        ],
        questionCorrect: 'A hot chocolate and two croissants',
      },
      {
        speaker: 'Bea',
        avatar: '👩',
        sagelo: 'Et pour moi, un café crème et une carafe d\'eau, s\'il vous plaît.',
        english: 'And for me, a coffee with cream and a jug of water, please.',
      },
      {
        speaker: 'Serveur',
        avatar: '🤵',
        sagelo: 'Très bien ! C\'est noté. Je vous apporte cela tout de suite.',
        english: 'Very well! Noted. I\'ll bring that to you right away.',
      },
      {
        speaker: 'Junior',
        avatar: '🧒',
        sagelo: 'Merci beaucoup monsieur ! C\'est magnifique ici.',
        english: 'Thank you very much sir! It\'s magnificent here.',
      },
    ],
  },
  {
    id: 'fr-story-2',
    title: 'The Lost Passport',
    sageloTitle: 'Le Passeport Perdu',
    description: 'Oscar is in a panic at Charles de Gaulle airport until Lin makes a discovery.',
    xpReward: 30,
    coverEmoji: '🛂',
    accentColor: '#FF9600',
    lines: [
      {
        speaker: 'Oscar',
        avatar: '👨‍🦰',
        sagelo: 'Lin, au secours ! C\'est une catastrophe !',
        english: 'Lin, help! It\'s a catastrophe!',
      },
      {
        speaker: 'Lin',
        avatar: '👧',
        sagelo: 'Qu\'est-ce qui se passe, Oscar ? Calme-toi !',
        english: 'What is happening, Oscar? Calm down!',
      },
      {
        speaker: 'Oscar',
        avatar: '👨‍🦰',
        sagelo: 'Mon passeport ! J\'ai perdu mon passeport français !',
        english: 'My passport! I lost my French passport!',
      },
      {
        speaker: 'System',
        avatar: '❓',
        sagelo: 'Vérification',
        english: 'Check',
        isQuestion: true,
        questionPrompt: 'Why is Oscar panicking at the airport?',
        questionOptions: [
          'He thinks he lost his passport',
          'He missed his flight to Paris',
          'His suitcase is too heavy',
        ],
        questionCorrect: 'He thinks he lost his passport',
      },
      {
        speaker: 'Lin',
        avatar: '👧',
        sagelo: 'Regarde dans tes poches de veste...',
        english: 'Look in your jacket pockets...',
      },
      {
        speaker: 'Oscar',
        avatar: '👨‍🦰',
        sagelo: 'Rien ! Il n\'est pas là. L\'avion part dans trente minutes !',
        english: 'Nothing! It\'s not there. The plane leaves in thirty minutes!',
      },
      {
        speaker: 'Lin',
        avatar: '👧',
        sagelo: 'Oscar... qu\'est-ce que tu tiens dans ta main droite ?',
        english: 'Oscar... what are you holding in your right hand?',
      },
      {
        speaker: 'Oscar',
        avatar: '👨‍🦰',
        sagelo: 'Oh ! C\'est... mon passeport ! Ah, quelle chance !',
        english: 'Oh! It is... my passport! Ah, what good luck!',
      },
      {
        speaker: 'Lin',
        avatar: '👧',
        sagelo: 'C\'est la vie, Oscar ! Allez, en route pour Paris !',
        english: 'That\'s life, Oscar! Come on, let\'s head to Paris!',
      },
    ],
  },
  {
    id: 'fr-story-3',
    title: 'Surprise Picnic by the Eiffel Tower',
    sageloTitle: 'Pique-Nique sous la Tour Eiffel',
    description: 'Lucie and Zari enjoy fresh baguettes, brie cheese, and twinkling golden lights.',
    xpReward: 35,
    coverEmoji: '🗼',
    accentColor: '#58CC02',
    lines: [
      {
        speaker: 'Lucie',
        avatar: '👵',
        sagelo: 'Zari, regarde le Champ-de-Mars ! Le soleil se couche.',
        english: 'Zari, look at the Champ-de-Mars! The sun is setting.',
      },
      {
        speaker: 'Zari',
        avatar: '👩',
        sagelo: 'C\'est magnifique, Lucie ! J\'ai acheté du pain frais et du fromage brie.',
        english: 'It\'s magnificent, Lucie! I bought fresh bread and brie cheese.',
      },
      {
        speaker: 'Lucie',
        avatar: '👵',
        sagelo: 'Et moi, j\'ai des fraises sucrées et de l\'eau pétillante.',
        english: 'And I have sweet strawberries and sparkling water.',
      },
      {
        speaker: 'System',
        avatar: '❓',
        sagelo: 'Question',
        english: 'Question',
        isQuestion: true,
        questionPrompt: 'Where are Lucie and Zari having their picnic?',
        questionOptions: [
          'Under the Eiffel Tower on the Champ-de-Mars',
          'Inside a train station',
          'At the grocery store checkout',
        ],
        questionCorrect: 'Under the Eiffel Tower on the Champ-de-Mars',
      },
      {
        speaker: 'Zari',
        avatar: '👩',
        sagelo: 'Regarde ! La Tour Eiffel commence à scintiller de mille feux !',
        english: 'Look! The Eiffel Tower is starting to sparkle with a thousand lights!',
      },
      {
        speaker: 'Lucie',
        avatar: '👵',
        sagelo: 'C\'est cela, la véritable joie de vivre française ! Santé !',
        english: 'That is truly the French joy of living! Cheers!',
      },
    ],
  },
];
