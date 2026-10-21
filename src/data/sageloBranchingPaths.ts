import { CurriculumLesson } from './sageloCurriculum';

export interface SkillBranch {
  id: string;
  title: string;
  tagline: string;
  category: 'conversational' | 'business' | 'philosophy' | 'healing';
  icon: string;
  themeColor: string;
  accentBorder: string;
  bgGradient: string;
  badgeEmoji: string;
  unlockRequirement: {
    unitId: string;
    unitNumber: number;
    unitName: string;
    requiredCompletedCount: number;
    description: string;
  };
  lessons: CurriculumLesson[];
}

export const SKILL_BRANCHES: SkillBranch[] = [
  // 1. CONVERSATIONAL SAGELO (Unlocked after Unit 1)
  {
    id: 'branch-conversational',
    title: 'Conversational Sagelo',
    tagline: 'Courtyard dialogues, warm hospitality, travel greetings, and daily community life.',
    category: 'conversational',
    icon: '🗣️',
    badgeEmoji: '💬',
    themeColor: '#0284C7',
    accentBorder: 'border-[#0284C7]',
    bgGradient: 'from-[#E0F2FE] via-[#BAE6FD] to-[#7DD3FC]',
    unlockRequirement: {
      unitId: 'unit-1',
      unitNumber: 1,
      unitName: 'Unit 1: The Word-Building Engine & Core Sentences',
      requiredCompletedCount: 3,
      description: 'Complete at least 3 lessons in Unit 1 to unlock conversational dialogues.',
    },
    lessons: [
      {
        id: 'branch-conv-1',
        unitId: 'branch-conversational',
        numberLabel: 'Conv. 1',
        title: 'Meeting Travelers & Courtyard Greetings',
        subtitle: 'Ask origins, introduce yourself, and share the traditional parting blessing.',
        xpReward: 35,
        wordsIntroduced: ['nemwa', 'dumwe', 'yowe'],
        teachingSlides: [
          {
            title: 'Courtyard Greetings & Welcoming Guests',
            body: 'When greeting a stranger (nemwa) or neighbor (dumwe), Sagelo speakers exchange questions of identity and origin before discussing news. The sacred parting phrase is "Shanti kandi vi yu" (Peace come with you).',
            examples: [
              { sagelo: 'Shanti, ye. Sowa yu oni?', english: 'Peace, friend. Who are you?' },
              { sagelo: 'Yo Dienga oni. Sondo yu wa oni?', english: 'I am Dienga. Where are you from?' },
              { sagelo: 'Shanti kandi vi yu.', english: 'Peace come with you (parting blessing).' },
            ],
            mentorTip: {
              speaker: 'nyango',
              text: 'Remember: "wa" marks possession and origin. "Sondo yu wa oni?" literally asks "Where is your place?"',
            },
          },
        ],
        exercises: [
          {
            id: 'bconv1-ex1',
            type: 'picture_choice',
            speaker: 'duo',
            prompt: 'Which of these words means "stranger / guest"?',
            pictureCards: [
              { id: 'pic-nemwa', sagelo: 'nemwa', english: 'stranger / guest', emoji: '🧳' },
              { id: 'pic-ndeko', sagelo: 'ndeko', english: 'friend / sibling', emoji: '🤝' },
              { id: 'pic-mpaka', sagelo: 'mpaka', english: 'elder / leader', emoji: '👑' },
            ],
            correctAnswer: 'nemwa',
            explanation: '"nemwa" is the Sagelo root for stranger, guest, or traveling visitor.',
          },
          {
            id: 'bconv1-ex2',
            type: 'match_pairs',
            speaker: 'nyango',
            prompt: 'Match the conversational greetings with their English meanings:',
            matchingPairs: [
              { sagelo: 'Sowa yu oni?', english: 'Who are you?' },
              { sagelo: 'Sondo yu wa oni?', english: 'Where are you from?' },
              { sagelo: 'Shanti kandi vi yu.', english: 'Peace come with you.' },
              { sagelo: 'Fu veni yu.', english: 'I will see you again.' },
            ],
            correctAnswer: 'Sowa yu oni? Sondo yu wa oni? Shanti kandi vi yu. Fu veni yu.',
            explanation: 'These phrases form the core of polite everyday Sagelo introductions.',
          },
          {
            id: 'bconv1-ex3',
            type: 'listen_tap',
            speaker: 'duo',
            prompt: 'Listen and assemble the parting blessing:',
            sageloAudioText: 'Shanti kandi vi yu',
            wordBankTiles: ['Shanti', 'kandi', 'vi', 'yu', 'sago', 'oni'],
            correctAnswer: 'Shanti kandi vi yu',
            explanation: '"Shanti kandi vi yu" = Peace come with you.',
          },
          {
            id: 'bconv1-ex4',
            type: 'word_bank',
            speaker: 'mwana',
            prompt: 'Translate into Sagelo: "Who are you?"',
            sageloAudioText: 'Sowa yu oni',
            wordBankTiles: ['Sowa', 'yu', 'oni', 'sowe', 'sondo'],
            correctAnswer: 'Sowa yu oni',
            explanation: 'Sowa (who) + yu (you) + oni (are).',
          },
        ],
      },
      {
        id: 'branch-conv-2',
        unitId: 'branch-conversational',
        numberLabel: 'Conv. 2',
        title: 'Hospitality, Tea & Courtyard Rest',
        subtitle: 'Offer warm drinks (cai, kafi) and ask after someone’s sound state.',
        xpReward: 40,
        wordsIntroduced: ['cai', 'kafi', 'dulu', 'kalma'],
        teachingSlides: [
          {
            title: 'Serving Guests: Warm Drinks & Stillness',
            body: 'Offering "cai" (tea) or "kafi" (coffee) with "dulu" (sweetness) is an ancient ritual of courtyard welcome. Asking "Yu sage oni ni?" literally asks if you are wise, sound, and in a wholesome state.',
            examples: [
              { sagelo: 'Yu ta cai voli ni?', english: 'Do you want tea?' },
              { sagelo: 'E, yo ta cai vi dulu voli.', english: 'Yes, I want tea with sweetness.' },
              { sagelo: 'Tanoc kore, kalma bori.', english: 'The night is warm, calm remains.' },
            ],
            mentorTip: {
              speaker: 'mpaka',
              text: 'In Sagelo culture, sharing cai is a shared pause in the day to cultivate "kalma" (calm).',
            },
          },
        ],
        exercises: [
          {
            id: 'bconv2-ex1',
            type: 'picture_choice',
            speaker: 'duo',
            prompt: 'Which of these is "tea / warm brew"?',
            pictureCards: [
              { id: 'pic-cai', sagelo: 'cai', english: 'tea / warm drink', emoji: '🍵' },
              { id: 'pic-kafi', sagelo: 'kafi', english: 'coffee', emoji: '☕' },
              { id: 'pic-wai', sagelo: 'wai', english: 'water', emoji: '💧' },
            ],
            correctAnswer: 'cai',
            explanation: '"cai" echoes Pan-Asian and Swahili "cha/chai" for tea or warm brew.',
          },
          {
            id: 'bconv2-ex2',
            type: 'word_bank',
            speaker: 'nyango',
            prompt: 'Translate into Sagelo: "Do you want tea?"',
            sageloAudioText: 'Yu ta cai voli ni',
            wordBankTiles: ['Yu', 'ta', 'cai', 'voli', 'ni', 'kafi'],
            correctAnswer: 'Yu ta cai voli ni',
            explanation: 'Yu + ta cai (object) + voli (want) + ni (question marker).',
          },
          {
            id: 'bconv2-ex3',
            type: 'match_pairs',
            speaker: 'mwana',
            prompt: 'Match hospitality words with their meanings:',
            matchingPairs: [
              { sagelo: 'cai', english: 'tea' },
              { sagelo: 'kafi', english: 'coffee' },
              { sagelo: 'dulu', english: 'sweetness / sugar' },
              { sagelo: 'kalma', english: 'calm / stillness' },
            ],
            correctAnswer: 'cai kafi dulu kalma',
            explanation: 'These roots represent courtyard refreshments and tranquility.',
          },
        ],
      },
    ],
  },

  // 2. BUSINESS & TRADE SAGELO (Unlocked after Unit 3: Numbers & Possession)
  {
    id: 'branch-business',
    title: 'Business & Trade Sagelo',
    tagline: 'Marketplace pricing, goods, transactions, contracts, and barter accounting.',
    category: 'business',
    icon: '🪙',
    badgeEmoji: '⚖️',
    themeColor: '#D97706',
    accentBorder: 'border-[#D97706]',
    bgGradient: 'from-[#FEF3C7] via-[#FDE68A] to-[#FCD34D]',
    unlockRequirement: {
      unitId: 'unit-3',
      unitNumber: 3,
      unitName: 'Unit 3: Numbers, Math, Possession, Place & Time',
      requiredCompletedCount: 3,
      description: 'Master numbers, math, and possession in Unit 3 to unlock the marketplace trade path.',
    },
    lessons: [
      {
        id: 'branch-biz-1',
        unitId: 'branch-business',
        numberLabel: 'Biz. 1',
        title: 'Market Wares & Inquiring Price',
        subtitle: 'Negotiate purchases, ask for prices, and tally goods (dola, pila).',
        xpReward: 40,
        wordsIntroduced: ['dola', 'pila', 'dolari', 'biya'],
        teachingSlides: [
          {
            title: 'Marketplace Inquiries: "Sowe pila oni?"',
            body: 'At a trade post or market, "dola" refers to goods/wares and "pila" is price/cost. A merchant is a "dolari" (wares + -ari agentive). Use exact numeral compounding from Lesson 13 to state prices.',
            examples: [
              { sagelo: 'Sowe pila oni?', english: 'What is the price?' },
              { sagelo: 'Pila oni dek.', english: 'The price is ten.' },
              { sagelo: 'Yo ta biya voli; pila du.', english: 'I want bread; it costs two.' },
              { sagelo: 'Dolari ta dola montri.', english: 'The merchant shows the wares.' },
            ],
            mentorTip: {
              speaker: 'mpaka',
              text: 'In Sagelo markets, stating "Pila sama dek" or "Pila oni dek" are both valid and clear.',
            },
          },
        ],
        exercises: [
          {
            id: 'bbiz1-ex1',
            type: 'match_pairs',
            speaker: 'duo',
            prompt: 'Match trade vocabulary with their definitions:',
            matchingPairs: [
              { sagelo: 'dola', english: 'goods / wares / inventory' },
              { sagelo: 'pila', english: 'price / cost' },
              { sagelo: 'dolari', english: 'merchant / trader' },
              { sagelo: 'biya', english: 'grain / bread staple' },
            ],
            correctAnswer: 'dola pila dolari biya',
            explanation: 'Trade terms derive from root + affix patterns: dola (wares) -> dolari (merchant).',
          },
          {
            id: 'bbiz1-ex2',
            type: 'word_bank',
            speaker: 'nyango',
            prompt: 'Ask the merchant: "What is the price?"',
            sageloAudioText: 'Sowe pila oni',
            wordBankTiles: ['Sowe', 'pila', 'oni', 'sowa', 'dola'],
            correctAnswer: 'Sowe pila oni',
            explanation: '"Sowe pila oni?" = What is the price?',
          },
          {
            id: 'bbiz1-ex3',
            type: 'listen_tap',
            speaker: 'duo',
            prompt: 'Listen and assemble the transaction statement:',
            sageloAudioText: 'Wai pila du',
            wordBankTiles: ['Wai', 'pila', 'du', 'tri', 'dek'],
            correctAnswer: 'Wai pila du',
            explanation: '"Wai pila du" = Water costs two.',
          },
          {
            id: 'bbiz1-ex4',
            type: 'multiple_choice',
            speaker: 'mpaka',
            prompt: 'Using the -ari agentive suffix from Part VIII, what is the word for "merchant/trader"?',
            options: ['dolari', 'fasari', 'sanari'],
            correctAnswer: 'dolari',
            explanation: 'dola (wares) + -ari (one who does) = dolari ("merchant / trader").',
          },
        ],
      },
      {
        id: 'branch-biz-2',
        unitId: 'branch-business',
        numberLabel: 'Biz. 2',
        title: 'Agreements, Fairness & Exchange',
        subtitle: 'Establish fair prices (justa), write trade rules (rega), and make deals.',
        xpReward: 45,
        wordsIntroduced: ['rega', 'justa', 'funda', 'libe'],
        teachingSlides: [
          {
            title: 'Fair Exchange: "Justa" and Commercial Law',
            body: 'Fairness ("justa") is foundational to trade in the Sagelo world. Commercial agreements use "rega" (rule/regulation) and "funda" (foundation).',
            examples: [
              { sagelo: 'Pila justa oni.', english: 'The price is fair.' },
              { sagelo: 'Rega wa dolari sagi.', english: 'Know the rule of the merchant.' },
              { sagelo: 'Funda wa dola vera oni.', english: 'The foundation of the trade is true.' },
            ],
            mentorTip: {
              speaker: 'nyango',
              text: 'Combine "justa" with "sama" to assert an equitable trade: "Pila sama justa oni"!',
            },
          },
        ],
        exercises: [
          {
            id: 'bbiz2-ex1',
            type: 'multiple_choice',
            speaker: 'mpaka',
            prompt: 'How do you say "The price is fair" in Sagelo?',
            sageloAudioText: 'Pila justa oni',
            options: ['Pila justa oni', 'Dola grande oni', 'Rega vece oni'],
            correctAnswer: 'Pila justa oni',
            explanation: 'Pila (price) + justa (fair) + oni (is).',
          },
          {
            id: 'bbiz2-ex2',
            type: 'match_pairs',
            speaker: 'mwana',
            prompt: 'Match governance and trade principles:',
            matchingPairs: [
              { sagelo: 'justa', english: 'fair / just' },
              { sagelo: 'rega', english: 'rule / regulation' },
              { sagelo: 'funda', english: 'foundation / basis' },
              { sagelo: 'libe', english: 'free / open' },
            ],
            correctAnswer: 'justa rega funda libe',
            explanation: 'These Latin-echoed roots structure ethical agreements in Sagelo.',
          },
        ],
      },
    ],
  },

  // 3. PHILOSOPHY & SAGE REASONING (Unlocked after Unit 5: Formal Logic)
  {
    id: 'branch-philosophy',
    title: 'Philosophical & Sage Reasoning',
    tagline: 'Deep epistemology, Sanskrit & Taoist concepts, formal proof, and meditative paradoxes.',
    category: 'philosophy',
    icon: '🔮',
    badgeEmoji: '🧘',
    themeColor: '#7C3AED',
    accentBorder: 'border-[#7C3AED]',
    bgGradient: 'from-[#EDE9FE] via-[#DDD6FE] to-[#C4B5FD]',
    unlockRequirement: {
      unitId: 'unit-5',
      unitNumber: 5,
      unitName: 'Unit 5: Formal Logic, Conditionals, Quantifiers & Evidentiality',
      requiredCompletedCount: 3,
      description: 'Master if/then conditionals, connectives, and evidentials in Unit 5 to enter the Sage Circle.',
    },
    lessons: [
      {
        id: 'branch-phil-1',
        unitId: 'branch-philosophy',
        numberLabel: 'Phil. 1',
        title: 'The Great Loans: Dharma, Karma & Tao',
        subtitle: 'Honor untranslatable concepts borrowed whole from world wisdom traditions.',
        xpReward: 45,
        wordsIntroduced: ['dharma', 'karma', 'tao', 'chi', 'zen', 'satya'],
        teachingSlides: [
          {
            title: 'Why Certain Words Are Never Translated',
            body: 'As taught in Chapter 1 and Appendix 2, Sagelo deliberately preserves a sacred constellation of loans unmodified: dharma, karma, tao, chi, zen, satya, and shanti. Translating them into artificial roots would erase thousands of years of human thought.',
            examples: [
              { sagelo: 'Tao oni wai kel waii.', english: 'The Tao is the water that flows.' },
              { sagelo: 'Karma fasi sowe kora pensi.', english: 'Karma makes what the heart reflects upon.' },
              { sagelo: 'Satya sim purda.', english: 'Truth is never lost.' },
            ],
            mentorTip: {
              speaker: 'mpaka',
              text: 'These words are invariable loans: they do not take -a, -e, -i, -o, -u endings, and stand proud in their authentic power.',
            },
          },
        ],
        exercises: [
          {
            id: 'bphil1-ex1',
            type: 'match_pairs',
            speaker: 'mpaka',
            prompt: 'Match each unchanged philosophical loan with its deep heritage:',
            matchingPairs: [
              { sagelo: 'dharma', english: 'natural law / sacred duty (Sanskrit)' },
              { sagelo: 'karma', english: 'action and consequence (Sanskrit)' },
              { sagelo: 'tao', english: 'the flowing path / the way (Chinese)' },
              { sagelo: 'zen', english: 'meditative stillness (Japanese)' },
              { sagelo: 'satya', english: 'truth and integrity (Sanskrit)' },
            ],
            correctAnswer: 'dharma karma tao zen satya',
            explanation: 'Sagelo borrows these global wisdom roots whole and intact out of deep respect.',
          },
          {
            id: 'bphil1-ex2',
            type: 'listen_tap',
            speaker: 'nyango',
            prompt: 'Listen and assemble the ancient sage proverb:',
            sageloAudioText: 'Satya sim purda',
            wordBankTiles: ['Satya', 'sim', 'purda', 'karma', 'shanti'],
            correctAnswer: 'Satya sim purda',
            explanation: '"Satya sim purda" = Truth is never lost.',
          },
          {
            id: 'bphil1-ex3',
            type: 'multiple_choice',
            speaker: 'mwana',
            prompt: 'Why do loanwords like "zen" and "mana" not take Sagelo’s five-vowel ending system?',
            options: [
              'Out of respect for their origin traditions, preserving their historical identity',
              'Because they are abbreviations',
              'Because they can only be used at midnight',
            ],
            correctAnswer: 'Out of respect for their origin traditions, preserving their historical identity',
            explanation: 'Chapter 1 & Appendix 2: Sagelo honors these heritage concepts without artificial alteration.',
          },
        ],
      },
      {
        id: 'branch-phil-2',
        unitId: 'branch-philosophy',
        numberLabel: 'Phil. 2',
        title: 'The Sage and the River Paradox',
        subtitle: 'Explore the difference between moving from place to place and continuous flowing.',
        xpReward: 50,
        wordsIntroduced: ['waii', 'wendi', 'bori', 'kambi'],
        teachingSlides: [
          {
            title: 'Waii oni mori kem wendi',
            body: 'In Part IV’s famous folktale, the child asks where the river is going. The elder answers: "Dovu sim wendi. Dovu waii." (The river does not go. The river flows.) Flowing is being everywhere without losing yourself.',
            examples: [
              { sagelo: 'Waii oni mori kem wendi.', english: 'Flowing is greater than going.' },
              { sagelo: 'Wai kel waii, sim purda sondo oni.', english: 'Water that flows never loses its way.' },
              { sagelo: 'Sago kel yo sim sagi, fu yo kambi.', english: 'The wisdom I do not know will transform me.' },
            ],
            mentorTip: {
              speaker: 'mpaka',
              text: 'Contemplate this when you feel rushed: "Dovu sim wendi. Dovu waii." Flow with purpose.',
            },
          },
        ],
        exercises: [
          {
            id: 'bphil2-ex1',
            type: 'word_bank',
            speaker: 'mpaka',
            prompt: 'Translate the sage folktale quote: "The river does not go."',
            sageloAudioText: 'Dovu sim wendi',
            wordBankTiles: ['Dovu', 'sim', 'wendi', 'waii', 'bori'],
            correctAnswer: 'Dovu sim wendi',
            explanation: 'Dovu (river) + sim (not) + wendi (go).',
          },
          {
            id: 'bphil2-ex2',
            type: 'word_bank',
            speaker: 'nyango',
            prompt: 'Translate: "Flowing is greater than going."',
            sageloAudioText: 'Waii oni mori kem wendi',
            wordBankTiles: ['Waii', 'oni', 'mori', 'kem', 'wendi', 'mini'],
            correctAnswer: 'Waii oni mori kem wendi',
            explanation: 'Waii (flowing) + oni (is) + mori kem (more than) + wendi (going).',
          },
        ],
      },
    ],
  },

  // 4. THE HEALER'S CIRCLE & MEDICAL CARE (Unlocked after Unit 2 or Unit 4)
  {
    id: 'branch-healing',
    title: "The Healer's Circle",
    tagline: 'Anatomy, medicinal teas, emergency requests, empathy, and holistic care.',
    category: 'healing',
    icon: '🌿',
    badgeEmoji: '🩺',
    themeColor: '#059669',
    accentBorder: 'border-[#059669]',
    bgGradient: 'from-[#D1FAE5] via-[#A7F3D0] to-[#6EE7B7]',
    unlockRequirement: {
      unitId: 'unit-2',
      unitNumber: 2,
      unitName: 'Unit 2: Objects, Descriptions, Plurals & Questions',
      requiredCompletedCount: 4,
      description: 'Complete Unit 2 to master the descriptions and imperatives used in healer care.',
    },
    lessons: [
      {
        id: 'branch-heal-1',
        unitId: 'branch-healing',
        numberLabel: 'Heal. 1',
        title: 'Anatomy & Physical Vitality',
        subtitle: 'Name the head, heart, breath, blood, and bones in Sagelo.',
        xpReward: 40,
        wordsIntroduced: ['moso', 'pema', 'tuka', 'boho', 'nyama', 'sanari'],
        teachingSlides: [
          {
            title: 'The Vessel of Life: Sagelo Body Roots',
            body: 'Healers ("sanari", from sani = heal + -ari) inspect the sacred elements of the body: moso (head), pema (breath), tuka (blood), boho (bone), and nyama (flesh/body).',
            examples: [
              { sagelo: 'Pema kore oni.', english: 'The breath is warm.' },
              { sagelo: 'Tuka waii lente.', english: 'The blood flows gently.' },
              { sagelo: 'Sanari ta mwana sani.', english: 'The healer heals the child.' },
            ],
            mentorTip: {
              speaker: 'nyango',
              text: 'Notice that "pema" is breath, life-spirit, and respiration — breathe deep when you learn!',
            },
          },
        ],
        exercises: [
          {
            id: 'bheal1-ex1',
            type: 'picture_choice',
            speaker: 'duo',
            prompt: 'Which of these is the root for "head"?',
            pictureCards: [
              { id: 'pic-moso', sagelo: 'moso', english: 'head', emoji: '🗣️' },
              { id: 'pic-kora', sagelo: 'kora', english: 'heart', emoji: '❤️' },
              { id: 'pic-poda', sagelo: 'poda', english: 'foot', emoji: '🦶' },
            ],
            correctAnswer: 'moso',
            explanation: '"moso" is the head in Sagelo anatomy.',
          },
          {
            id: 'bheal1-ex2',
            type: 'match_pairs',
            speaker: 'mpaka',
            prompt: 'Match anatomical roots with their English translations:',
            matchingPairs: [
              { sagelo: 'pema', english: 'breath / respiration' },
              { sagelo: 'tuka', english: 'blood' },
              { sagelo: 'boho', english: 'bone / structure' },
              { sagelo: 'nyama', english: 'flesh / physical body' },
              { sagelo: 'sanari', english: 'healer / physician' },
            ],
            correctAnswer: 'pema tuka boho nyama sanari',
            explanation: 'These roots form the core vocabulary of Sagelo healers.',
          },
          {
            id: 'bheal1-ex3',
            type: 'word_bank',
            speaker: 'nyango',
            prompt: 'Translate into Sagelo: "The breath is warm."',
            sageloAudioText: 'Pema kore oni',
            wordBankTiles: ['Pema', 'kore', 'oni', 'tuka', 'boho'],
            correctAnswer: 'Pema kore oni',
            explanation: 'Pema (breath) + kore (warm) + oni (is).',
          },
        ],
      },
      {
        id: 'branch-heal-2',
        unitId: 'branch-healing',
        numberLabel: 'Heal. 2',
        title: 'Emergency Calls & Patient Compassion',
        subtitle: 'Call for help ("No kandi!"), comfort the ailing, and guide them to sanctuary.',
        xpReward: 45,
        wordsIntroduced: ['pavo', 'sanari', 'korazi'],
        teachingSlides: [
          {
            title: 'Urgent Care & Reassurance',
            body: 'When urgent assistance is needed, use the polite request marker "No" with "kandi" (come): "No kandi! Ye sim sage oni" (Please come! He/she is unwell). Offer reassurance with "Yo ta yu kari; yo fu bori" (I care for you; I will stay).',
            examples: [
              { sagelo: 'No kandi! Yo pavo kori!', english: 'Come, please! I feel afraid!' },
              { sagelo: 'Ye sim sage oni.', english: 'He/she is not well.' },
              { sagelo: 'Yo ta yu kari; yo fu bori.', english: 'I care for you; I will stay.' },
            ],
            mentorTip: {
              speaker: 'nyango',
              text: 'Notice how "No" turns a command into a sincere, compassionate request.',
            },
          },
        ],
        exercises: [
          {
            id: 'bheal2-ex1',
            type: 'word_bank',
            speaker: 'mwana',
            prompt: 'Translate the comforting pledge: "I care for you; I will stay."',
            sageloAudioText: 'Yo ta yu kari yo fu bori',
            wordBankTiles: ['Yo', 'ta', 'yu', 'kari', 'yo', 'fu', 'bori', 'wendi'],
            correctAnswer: 'Yo ta yu kari yo fu bori',
            explanation: 'Part VI Phrasebook Chapter 6: A classic pledge of compassionate care.',
          },
          {
            id: 'bheal2-ex2',
            type: 'multiple_choice',
            speaker: 'mpaka',
            prompt: 'How do you say "Please come!" in urgent Sagelo polite imperative?',
            sageloAudioText: 'No kandi',
            options: ['No kandi!', 'Sim wendi!', 'Sagi!'],
            correctAnswer: 'No kandi!',
            explanation: '"No" (please) + "kandi" (come) = "No kandi!" ("Please come!").',
          },
        ],
      },
    ],
  },
];

/**
 * Checks if a skill branch is currently unlocked for a given user.
 */
export function isBranchUnlocked(
  branch: SkillBranch,
  completedLessonIds: string[]
): {
  isUnlocked: boolean;
  completedCount: number;
  requiredCount: number;
  progressPercent: number;
  remainingCount: number;
} {
  // Find which lessons in the requirement unit have been completed
  const req = branch.unlockRequirement;
  const completedInUnit = completedLessonIds.filter((id) => {
    // If it's unit-1, matches lesson-1, lesson-2, etc.
    if (req.unitId === 'unit-1') {
      return ['lesson-1', 'lesson-2', 'lesson-3', 'lesson-4', 'lesson-5'].includes(id);
    }
    if (req.unitId === 'unit-2') {
      return ['lesson-6', 'lesson-7', 'lesson-8', 'lesson-9', 'lesson-10', 'lesson-11'].includes(id);
    }
    if (req.unitId === 'unit-3') {
      return ['lesson-12', 'lesson-13', 'lesson-14', 'lesson-15', 'lesson-16'].includes(id);
    }
    if (req.unitId === 'unit-4') {
      return ['lesson-17', 'lesson-18', 'lesson-19', 'lesson-20'].includes(id);
    }
    if (req.unitId === 'unit-5') {
      return ['lesson-21', 'lesson-22', 'lesson-23', 'lesson-24'].includes(id);
    }
    if (req.unitId === 'unit-6') {
      return ['lesson-25', 'lesson-26', 'lesson-27', 'lesson-28', 'lesson-29', 'lesson-30'].includes(id);
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

/**
 * Returns all lessons from all skill branches flat.
 */
export const ALL_BRANCH_LESSONS: CurriculumLesson[] = SKILL_BRANCHES.flatMap(
  (b) => b.lessons
);
