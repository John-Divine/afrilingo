export interface DictionaryEntry {
  root: string;
  meaning: string;
  category:
    | 'The Body'
    | 'Family and People'
    | 'Nature and the World'
    | 'Food and Sustenance'
    | 'Society and Abstract Concepts'
    | 'Emotions and Inner Life'
    | 'Science, Number, and Technology'
    | 'Common Verbs'
    | 'Adjectives'
    | 'Colors'
    | 'Animals'
    | 'Household and Daily Objects'
    | 'Professions and Roles'
    | 'Weather and Seasons';
  originNote?: string;
  isLoanword?: boolean;
  exampleSagelo?: string;
  exampleEnglish?: string;
}

export function deriveRootForms(entry: DictionaryEntry): {
  noun: string;
  adjective: string;
  verb: string;
  abstractNoun: string;
  place: string;
  agentive: string;
} {
  if (entry.isLoanword) {
    return {
      noun: `${entry.root} (invariable loan)`,
      adjective: `${entry.root} (invariable loan)`,
      verb: `${entry.root} oni`,
      abstractNoun: `${entry.root} (invariable loan)`,
      place: `sa·${entry.root}`,
      agentive: `mi·${entry.root}`,
    };
  }

  const raw = entry.root.trim();
  const base = raw.length > 3 && /[aeiou]$/.test(raw) ? raw.slice(0, -1) : raw;

  return {
    noun: `${base}a`,
    adjective: `${base}e`,
    verb: `${base}i`,
    abstractNoun: `${base}o`,
    place: `${base}u`,
    agentive: `${base}ari`,
  };
}

export const SAGELO_DICTIONARY: DictionaryEntry[] = [
  { root: 'sag', meaning: 'wisdom / sage / know', category: 'Society and Abstract Concepts', originNote: 'English "sage"', exampleSagelo: 'Saga sage ta sago sagi.', exampleEnglish: 'The wise sage knows wisdom.' },
  { root: 'lum', meaning: 'light / bright / shine', category: 'Nature and the World', originNote: 'Latin lumen', exampleSagelo: 'Kiluma lume ndo tanoc lumi.', exampleEnglish: 'The bright lamp shines in the night.' },
  { root: 'moso', meaning: 'head', category: 'The Body', exampleSagelo: 'Moso wa saga.', exampleEnglish: 'The head of the sage.' },
  { root: 'miso', meaning: 'eye', category: 'The Body', exampleSagelo: 'Yo miso hu vi veni.', exampleEnglish: 'I see with my eyes.' },
  { root: 'mito', meaning: 'ear', category: 'The Body', exampleSagelo: 'Mito hu ta wina sagi.', exampleEnglish: 'The ears understand the song.' },
  { root: 'diko', meaning: 'tongue', category: 'The Body', exampleSagelo: 'Diko kore vi loni.', exampleEnglish: 'The tongue speaks warmly.' },
  { root: 'kanda', meaning: 'hand', category: 'The Body', exampleSagelo: 'Kanda hu fasi.', exampleEnglish: 'Hands build/make.' },
  { root: 'poda', meaning: 'foot', category: 'The Body', exampleSagelo: 'Poda hu lente wendi.', exampleEnglish: 'The feet walk slowly.' },
  { root: 'nyama', meaning: 'flesh / body (also meat)', category: 'The Body', originNote: 'Echoes Bantu nyama', exampleSagelo: 'Nyama forte oni.', exampleEnglish: 'The body is strong.' },
  { root: 'boho', meaning: 'bone', category: 'The Body' },
  { root: 'tuka', meaning: 'blood', category: 'The Body', exampleSagelo: 'Tuka waii.', exampleEnglish: 'Blood flows.' },
  { root: 'pema', meaning: 'breath', category: 'The Body', exampleSagelo: 'Pema lente e kalma oni.', exampleEnglish: 'The breath is slow and calm.' },
  { root: 'kor', meaning: 'heart / feeling', category: 'The Body', originNote: 'Lesson 1 core root', exampleSagelo: 'Kora wa yo joya kori.', exampleEnglish: 'My heart feels joy.' },
  { root: 'mwana', meaning: 'child', category: 'Family and People', originNote: 'Bantu-family kinship loan', isLoanword: true, exampleSagelo: 'Mimwana kel pensi, saga fu oni.', exampleEnglish: 'The child who thinks will become a sage.' },
  { root: 'tata', meaning: 'father', category: 'Family and People', originNote: 'Bantu-family kinship loan', isLoanword: true, exampleSagelo: 'Tata ta mimwana kari.', exampleEnglish: 'The father loves the child.' },
  { root: 'nyango', meaning: 'mother', category: 'Family and People', originNote: 'Bantu-family kinship loan', isLoanword: true, exampleSagelo: 'Nyango ta mimwana wai doni.', exampleEnglish: 'The mother gives the child water.' },
  { root: 'ndeko', meaning: 'friend / sibling / companion', category: 'Family and People', originNote: 'Bantu-family kinship loan', isLoanword: true, exampleSagelo: 'Shanti, ndeko wa yo!', exampleEnglish: 'Peace, my friend!' },
  { root: 'mpaka', meaning: 'elder / leader', category: 'Family and People', originNote: 'Bantu-family kinship loan', isLoanword: true, exampleSagelo: 'Mpaka sasagu ndo oni.', exampleEnglish: 'The elder is at the sanctuary.' },
  { root: 'nemwa', meaning: 'stranger / guest', category: 'Family and People', exampleSagelo: 'Nemwa ta wai voli.', exampleEnglish: 'The guest wants water.' },
  { root: 'dumwe', meaning: 'neighbor', category: 'Family and People', exampleSagelo: 'Dumwe hu ta dira kari.', exampleEnglish: 'The neighbors care for each other.' },
  { root: 'yowe', meaning: 'self / individual', category: 'Family and People', exampleSagelo: 'Waii oni ta yowe sim purda.', exampleEnglish: 'Flowing is never losing oneself.' },
  { root: 'wai', meaning: 'water', category: 'Nature and the World', originNote: 'Polynesian wai', exampleSagelo: 'Wai kel waii, kore oni.', exampleEnglish: 'The water that flows is warm.' },
  { root: 'jua', meaning: 'sun', category: 'Nature and the World', originNote: 'Swahili jua', exampleSagelo: 'Jua lumi.', exampleEnglish: 'The sun shines.' },
  { root: 'mwe', meaning: 'moon', category: 'Nature and the World', originNote: 'Swahili mwezi', exampleSagelo: 'Tamwe wa mwe lume.', exampleEnglish: 'The month of the bright moon.' },
  { root: 'mun', meaning: 'world / earth', category: 'Nature and the World', originNote: 'Latin mundus', exampleSagelo: 'Cho sil ndo mun.', exampleEnglish: 'Every tree in the world.' },
  { root: 'fon', meaning: 'wind', category: 'Nature and the World', exampleSagelo: 'Fona fone le foni.', exampleEnglish: 'The windy breeze is blowing.' },
  { root: 'sil', meaning: 'tree / forest', category: 'Nature and the World', exampleSagelo: 'Sila grande mori kem mimwana.', exampleEnglish: 'The tree is larger than the child.' },
  { root: 'seva', meaning: 'sky', category: 'Nature and the World', exampleSagelo: 'Seva blaa oni.', exampleEnglish: 'The sky is blue.' },
  { root: 'tere', meaning: 'mountain', category: 'Nature and the World', exampleSagelo: 'Wendi ndo tere.', exampleEnglish: 'Go toward the mountain.' },
  { root: 'dovu', meaning: 'river', category: 'Nature and the World', exampleSagelo: 'Dovu sim wendi; dovu waii.', exampleEnglish: 'The river does not go; the river flows.' },
  { root: 'pota', meaning: 'rain (or vessel in ki- class)', category: 'Nature and the World', exampleSagelo: 'Pota waii.', exampleEnglish: 'The rain falls/flows.' },
  { root: 'nige', meaning: 'snow / frost', category: 'Nature and the World' },
  { root: 'sata', meaning: 'stone (low tone) vs. sátá (strike, high tone)', category: 'Nature and the World', originNote: 'Chapter 3 minimal pair' },
  { root: 'tanoc', meaning: 'night', category: 'Nature and the World', exampleSagelo: 'Tanoc doa, lira le lumi cho.', exampleEnglish: 'In the night, the stars shine for everyone.' },
  { root: 'lira', meaning: 'star', category: 'Nature and the World' },
  { root: 'shiro', meaning: 'cloud', category: 'Nature and the World' },
  { root: 'biya', meaning: 'grain / bread staple', category: 'Food and Sustenance', exampleSagelo: 'Yo ta biya voli.', exampleEnglish: 'I want bread/grain.' },
  { root: 'fura', meaning: 'fruit', category: 'Food and Sustenance', exampleSagelo: 'Fura dulu oni.', exampleEnglish: 'The fruit is sweet.' },
  { root: 'sowi', meaning: 'salt', category: 'Food and Sustenance' },
  { root: 'dulu', meaning: 'sweetness / sugar', category: 'Food and Sustenance' },
  { root: 'cai', meaning: 'tea / warm drink', category: 'Food and Sustenance', originNote: 'East Asian / Swahili chai' },
  { root: 'kafi', meaning: 'coffee', category: 'Food and Sustenance', originNote: 'International loan' },
  { root: 'log', meaning: 'reason / logic / word', category: 'Society and Abstract Concepts', originNote: 'Greek logos', exampleSagelo: 'Kor sim log; log sim kor.', exampleEnglish: 'The heart is not logic; logic is not the heart.' },
  { root: 'shanti', meaning: 'peace (greeting & blessing)', category: 'Society and Abstract Concepts', originNote: 'Sanskrit (whole loanword)', isLoanword: true, exampleSagelo: 'Shanti kandi vi yu.', exampleEnglish: 'Peace come with you.' },
  { root: 'satya', meaning: 'truth', category: 'Society and Abstract Concepts', originNote: 'Sanskrit (whole loanword)', isLoanword: true, exampleSagelo: 'Satya lume oni.', exampleEnglish: 'Truth is radiant.' },
  { root: 'dharma', meaning: 'natural law / right duty', category: 'Society and Abstract Concepts', originNote: 'Sanskrit (whole loanword)', isLoanword: true },
  { root: 'karma', meaning: 'action and consequence', category: 'Society and Abstract Concepts', originNote: 'Sanskrit (whole loanword)', isLoanword: true },
  { root: 'tao', meaning: 'the path / the way', category: 'Society and Abstract Concepts', originNote: 'Chinese 道 (whole loanword)', isLoanword: true },
  { root: 'chi', meaning: 'life-energy', category: 'Society and Abstract Concepts', originNote: 'Chinese 氣 (whole loanword)', isLoanword: true },
  { root: 'zen', meaning: 'still, meditative calm', category: 'Society and Abstract Concepts', originNote: 'Japanese 禅 (whole loanword)', isLoanword: true },
  { root: 'mana', meaning: 'spiritual power', category: 'Society and Abstract Concepts', originNote: 'Polynesian (whole loanword)', isLoanword: true },
  { root: 'ndoto', meaning: 'dream', category: 'Society and Abstract Concepts', originNote: 'Swahili (whole loanword)', isLoanword: true },
  { root: 'dola', meaning: 'goods / wares / wealth', category: 'Society and Abstract Concepts' },
  { root: 'pila', meaning: 'price / cost', category: 'Society and Abstract Concepts', exampleSagelo: 'Wai pila du.', exampleEnglish: 'Water costs two.' },
  { root: 'rega', meaning: 'law / rule', category: 'Society and Abstract Concepts' },
  { root: 'funda', meaning: 'foundation / basis', category: 'Society and Abstract Concepts' },
  { root: 'libe', meaning: 'freedom / free', category: 'Society and Abstract Concepts' },
  { root: 'justa', meaning: 'fairness / justice / fair', category: 'Society and Abstract Concepts', originNote: 'Latin iustus' },
  { root: 'joya', meaning: 'joy', category: 'Emotions and Inner Life', originNote: 'Romance joie/gioia' },
  { root: 'tresa', meaning: 'sorrow', category: 'Emotions and Inner Life' },
  { root: 'pavo', meaning: 'fear', category: 'Emotions and Inner Life', originNote: 'Latin pavor', exampleSagelo: 'Yo pavo kori.', exampleEnglish: 'I feel fear.' },
  { root: 'espa', meaning: 'hope', category: 'Emotions and Inner Life', originNote: 'Romance esper-' },
  { root: 'kolo', meaning: 'anger', category: 'Emotions and Inner Life' },
  { root: 'shama', meaning: 'shame', category: 'Emotions and Inner Life' },
  { root: 'fide', meaning: 'trust / faith', category: 'Emotions and Inner Life', originNote: 'Latin fides' },
  { root: 'desi', meaning: 'desire', category: 'Emotions and Inner Life', originNote: 'Latin desiderium' },
  { root: 'kalma', meaning: 'calm', category: 'Emotions and Inner Life' },
  { root: 'paci', meaning: 'patience', category: 'Emotions and Inner Life' },
  { root: 'humi', meaning: 'humility', category: 'Emotions and Inner Life' },
  { root: 'korazi', meaning: 'courage (from kor, heart)', category: 'Emotions and Inner Life' },
  { root: 'duta', meaning: 'doubt', category: 'Emotions and Inner Life' },
  { root: 'certa', meaning: 'certainty', category: 'Emotions and Inner Life' },
  { root: 'skema', meaning: 'pattern / structure', category: 'Science, Number, and Technology', originNote: 'Echoes schema' },
  { root: 'dato', meaning: 'data / fact', category: 'Science, Number, and Technology' },
  { root: 'masha', meaning: 'machine', category: 'Science, Number, and Technology' },
  { root: 'koda', meaning: 'code / pattern-instruction', category: 'Science, Number, and Technology' },
  { root: 'velo', meaning: 'speed', category: 'Science, Number, and Technology', originNote: 'Latin velox' },
  { root: 'enera', meaning: 'energy', category: 'Science, Number, and Technology' },
  { root: 'mesu', meaning: 'measure', category: 'Science, Number, and Technology' },
  { root: 'provi', meaning: 'to test / prove', category: 'Science, Number, and Technology', originNote: 'Latin probare' },
  { root: 'reto', meaning: 'network', category: 'Science, Number, and Technology', originNote: 'Romance rete' },
  { root: 'skrino', meaning: 'screen', category: 'Science, Number, and Technology' },
  { root: 'sonari', meaning: 'communicator device / sound-maker', category: 'Science, Number, and Technology' },
  { root: 'oni', meaning: 'to be (am / is / are)', category: 'Common Verbs', exampleSagelo: 'Yo saga oni.', exampleEnglish: 'I am a sage.' },
  { root: 'veni', meaning: 'to see / look', category: 'Common Verbs', originNote: 'Latin videre', exampleSagelo: 'Yo ta saga kel sagi veni.', exampleEnglish: 'I see the sage who teaches.' },
  { root: 'loni', meaning: 'to speak / say', category: 'Common Verbs', exampleSagelo: 'Mimwana kore vi loni.', exampleEnglish: 'The child speaks warmly.' },
  { root: 'wendi', meaning: 'to go', category: 'Common Verbs', exampleSagelo: 'No sim wendi.', exampleEnglish: 'Please do not go.' },
  { root: 'kandi', meaning: 'to come', category: 'Common Verbs', exampleSagelo: 'Sago kandi.', exampleEnglish: 'Wisdom comes.' },
  { root: 'kari', meaning: 'to love / care for', category: 'Common Verbs', exampleSagelo: 'Ye hu ta dira kari.', exampleEnglish: 'They love each other.' },
  { root: 'doni', meaning: 'to give', category: 'Common Verbs', originNote: 'Italian donare', exampleSagelo: 'No doni yo ta wai.', exampleEnglish: 'Please give me water.' },
  { root: 'voli', meaning: 'to want / wish', category: 'Common Verbs', originNote: 'Italian volere', exampleSagelo: 'Yo ta wai voli.', exampleEnglish: 'I want water.' },
  { root: 'pensi', meaning: 'to think', category: 'Common Verbs', originNote: 'Romance pensare', exampleSagelo: 'Ju yu pensi juta yu sagi.', exampleEnglish: 'If you think, then you understand.' },
  { root: 'fasi', meaning: 'to make / do', category: 'Common Verbs', originNote: 'Latin facere' },
  { root: 'lerni', meaning: 'to learn / study', category: 'Common Verbs', originNote: 'Esperanto loan', exampleSagelo: 'Yo sagi deka yo pa lerni.', exampleEnglish: 'I understand because I studied.' },
  { root: 'montri', meaning: 'to show / teach', category: 'Common Verbs', originNote: 'Esperanto loan', exampleSagelo: 'Yu ta yo montri ni?', exampleEnglish: 'Will you teach me?' },
  { root: 'bori', meaning: 'to stay / remain', category: 'Common Verbs', exampleSagelo: 'Yo ta yu kari; yo fu bori.', exampleEnglish: 'I care for you; I will stay.' },
  { root: 'doti', meaning: 'to sleep', category: 'Common Verbs', exampleSagelo: 'Doti, doti, kora doti.', exampleEnglish: 'Sleep, sleep, let the heart sleep.' },
  { root: 'jendi', meaning: 'to wake', category: 'Common Verbs', exampleSagelo: 'Jua lumi. Mimwana jendi.', exampleEnglish: 'The sun shines. The child wakes.' },
  { root: 'masi', meaning: 'to eat', category: 'Common Verbs', exampleSagelo: 'Mimwana masi e biva.', exampleEnglish: 'The child eats and drinks.' },
  { root: 'biva', meaning: 'to drink', category: 'Common Verbs' },
  { root: 'fina', meaning: 'to finish / end', category: 'Common Verbs', originNote: 'Latin finis' },
  { root: 'sarta', meaning: 'to begin', category: 'Common Verbs' },
  { root: 'purda', meaning: 'to lose', category: 'Common Verbs', exampleSagelo: 'Yo purda sondo oni.', exampleEnglish: 'I have lost where I am (I am lost).' },
  { root: 'trovi', meaning: 'to find', category: 'Common Verbs', originNote: 'Romance trovare' },
  { root: 'kambi', meaning: 'to change', category: 'Common Verbs', originNote: 'Romance cambiare' },
  { root: 'vinci', meaning: 'to win / overcome', category: 'Common Verbs', originNote: 'Latin vincere' },
  { root: 'grande', meaning: 'large / great', category: 'Adjectives', exampleSagelo: 'Sila grande.', exampleEnglish: 'A large tree.' },
  { root: 'mikre', meaning: 'small', category: 'Adjectives', originNote: 'Greek mikros' },
  { root: 'nove', meaning: 'new', category: 'Adjectives', exampleSagelo: 'Sago nove.', exampleEnglish: 'A new idea/wisdom.' },
  { root: 'vece', meaning: 'old (of things/time)', category: 'Adjectives', originNote: 'Latin vetus' },
  { root: 'rapide', meaning: 'fast', category: 'Adjectives', originNote: 'Latin rapidus' },
  { root: 'lente', meaning: 'slow', category: 'Adjectives', originNote: 'Latin lentus' },
  { root: 'forte', meaning: 'strong', category: 'Adjectives', originNote: 'Latin fortis' },
  { root: 'debile', meaning: 'weak', category: 'Adjectives', originNote: 'Latin debilis' },
  { root: 'bela', meaning: 'beautiful', category: 'Adjectives', originNote: 'Romance bella' },
  { root: 'vera', meaning: 'true', category: 'Adjectives', originNote: 'Latin verus' },
  { root: 'rosha', meaning: 'red', category: 'Colors' },
  { root: 'blaa', meaning: 'blue', category: 'Colors' },
  { root: 'verda', meaning: 'green', category: 'Colors', originNote: 'Romance verde' },
  { root: 'sola', meaning: 'yellow / golden', category: 'Colors', originNote: 'Sun-colored (sol)' },
  { root: 'nira', meaning: 'black', category: 'Colors' },
  { root: 'bianca', meaning: 'white', category: 'Colors', originNote: 'Italian bianca' },
  { root: 'ngbo', meaning: 'dog', category: 'Animals', originNote: 'Bantu-area echo' },
  { root: 'nyau', meaning: 'cat', category: 'Animals', originNote: 'Sound-symbolic' },
  { root: 'koko', meaning: 'bird', category: 'Animals', originNote: 'Sound-symbolic' },
  { root: 'sisi', meaning: 'fish', category: 'Animals' },
  { root: 'tembo', meaning: 'elephant / large animal', category: 'Animals', originNote: 'Swahili tembo' },
  { root: 'mbo', meaning: 'goat / livestock', category: 'Animals', originNote: 'Bantu-area echo' },
  { root: 'dombo', meaning: 'house / home', category: 'Household and Daily Objects' },
  { root: 'dula', meaning: 'door', category: 'Household and Daily Objects' },
  { root: 'feka', meaning: 'table', category: 'Household and Daily Objects' },
  { root: 'sinda', meaning: 'chair / seat', category: 'Household and Daily Objects' },
  { root: 'kova', meaning: 'cloth / clothing', category: 'Household and Daily Objects' },
  { root: 'lampu', meaning: 'lamp (alongside native kiluma)', category: 'Household and Daily Objects' },
  { root: 'shefu', meaning: 'key', category: 'Household and Daily Objects' },
  { root: 'sanari', meaning: 'healer (from sani + -ari agentive)', category: 'Professions and Roles' },
  { root: 'fasari', meaning: 'builder / maker (fasi + -ari)', category: 'Professions and Roles', exampleSagelo: 'Fasari wa sasagu.', exampleEnglish: 'Builder of the sanctuary.' },
  { root: 'dolari', meaning: 'trader / merchant (dola + -ari)', category: 'Professions and Roles' },
  { root: 'cantari', meaning: 'singer / musician', category: 'Professions and Roles' },
  { root: 'skrivari', meaning: 'writer', category: 'Professions and Roles' },
  { root: 'pensari', meaning: 'thinker (pensi + -ari)', category: 'Professions and Roles' },
  { root: 'varme', meaning: 'heat / summer-quality', category: 'Weather and Seasons' },
  { root: 'frije', meaning: 'cold / winter-quality', category: 'Weather and Seasons' },
  { root: 'primavera', meaning: 'spring', category: 'Weather and Seasons', isLoanword: true, originNote: 'Romance loan kept whole for its music' },
];

export interface PhrasebookChapter {
  id: string;
  chapterNumber: number;
  title: string;
  subtitle: string;
  phrases: Array<{
    sagelo: string;
    english: string;
    note?: string;
  }>;
}

export const PHRASEBOOK_CHAPTERS: PhrasebookChapter[] = [
  {
    id: 'pb-1',
    chapterNumber: 1,
    title: 'Greetings and Introductions',
    subtitle: 'Meeting people in the Circle of Sages',
    phrases: [
      { sagelo: 'Shanti.', english: 'Peace.', note: 'General greeting, any time of day' },
      { sagelo: 'Shanti, ye.', english: 'Peace, friend.' },
      { sagelo: 'Sowa yu oni?', english: 'Who are you?' },
      { sagelo: 'Yo Dienga oni.', english: 'I am Dienga.' },
      { sagelo: 'Sondo yu wa oni?', english: 'Where are you from?', note: 'Literally: "Where is your place?"' },
      { sagelo: 'Yo Buea wa oni.', english: 'I am from Buea.' },
      { sagelo: 'Shanti kandi vi yu.', english: 'Peace come with you.', note: 'Parting blessing' },
      { sagelo: 'Fu veni yu.', english: 'I will see you [again].' },
    ],
  },
  {
    id: 'pb-2',
    chapterNumber: 2,
    title: 'Wellbeing and Small Talk',
    subtitle: 'Checking in on health, sleep, and daily learning',
    phrases: [
      { sagelo: 'Yu sage oni ni?', english: 'Are you well?', note: 'sage extends naturally from "wise" to "in a good, sound state"' },
      { sagelo: 'E, yo sage oni.', english: 'Yes, I am well.' },
      { sagelo: 'Yo pa lente doti.', english: 'I slept poorly (literally "slowly").' },
      { sagelo: 'Tawinya sage oni ha.', english: 'It is a good day, I can tell for certain.' },
      { sagelo: 'Sowe yu pa fasi tawinya?', english: 'What did you do today?' },
      { sagelo: 'Yo pa lerni e pa sagi.', english: 'I studied and I understood.' },
    ],
  },
  {
    id: 'pb-3',
    chapterNumber: 3,
    title: 'Needs and Requests',
    subtitle: 'Asking politely with no and expressing needs',
    phrases: [
      { sagelo: 'Yo ta wai voli.', english: 'I want water.' },
      { sagelo: 'Yo ta biya voli.', english: 'I want bread/grain.' },
      { sagelo: 'No doni yo ta wai.', english: 'Please give me water.' },
      { sagelo: 'Sondo wai oni?', english: 'Where is [the] water?' },
      { sagelo: 'Yo pavo kori.', english: 'I feel fear.' },
      { sagelo: 'No montri yo.', english: 'Please show me.' },
      { sagelo: 'Yo sim sagi. No montri lente.', english: 'I do not understand. Please show [me] slowly.' },
    ],
  },
  {
    id: 'pb-4',
    chapterNumber: 4,
    title: 'Numbers in Daily Use',
    subtitle: 'Prices, quantities, time, and dates',
    phrases: [
      { sagelo: 'Sowe pila oni?', english: 'What is the price?' },
      { sagelo: 'Pila oni dek.', english: 'The price is ten.' },
      { sagelo: 'Yo ta du voli.', english: 'I want two [of them].' },
      { sagelo: 'Sowe kem oni?', english: 'What time is it?', note: 'Literally: "what hour/measure is it"' },
      { sagelo: 'Tawinya du-dek-pen wa mun oni.', english: "It is the world's 25th day.", note: 'Date construction: number + wa + noun' },
    ],
  },
  {
    id: 'pb-5',
    chapterNumber: 5,
    title: 'Directions and Movement',
    subtitle: 'Navigating between mountains, rivers, and sanctuaries',
    phrases: [
      { sagelo: 'Sondo sasagu oni?', english: 'Where is the sanctuary/place of learning?' },
      { sagelo: 'Wendi ndo tere.', english: 'Go toward the mountain.' },
      { sagelo: 'Ye dovu ndo oni.', english: 'It is at/by the river.' },
      { sagelo: 'No wendi lente.', english: 'Please go slowly.' },
      { sagelo: 'Yo purda sondo oni.', english: 'I am lost.', note: 'Literally: "I have lost where I am"' },
    ],
  },
  {
    id: 'pb-6',
    chapterNumber: 6,
    title: 'Emergencies and Care',
    subtitle: 'Offering comfort, presence, and elder guidance',
    phrases: [
      { sagelo: 'No kandi! Yo pavo kori!', english: 'Come, please! I am afraid!' },
      { sagelo: 'Ye sim sage oni.', english: 'He/she is not well.' },
      { sagelo: 'No montri sasagu — mo mpaka ndo oni.', english: 'Please show [me] the sanctuary — an elder is there.' },
      { sagelo: 'Yo ta yu kari; yo fu bori.', english: 'I care for you; I will stay.' },
    ],
  },
  {
    id: 'pb-7',
    chapterNumber: 7,
    title: 'Learning and Teaching',
    subtitle: 'Stepping into the role of a Saga',
    phrases: [
      { sagelo: 'Yu ta yo montri ni?', english: 'Will you teach me?' },
      { sagelo: 'E, yo ta yu montri.', english: 'Yes, I will teach you.' },
      { sagelo: 'Sowe sago yu voli?', english: 'What wisdom/knowledge do you want [to learn]?' },
      { sagelo: 'Yo lente lerni, e sage lerni.', english: 'I learn slowly, and I learn well.' },
    ],
  },
];

export const SAGELO_PROVERBS = [
  {
    sagelo: 'Sago sim doni; sago sagu.',
    english: 'Wisdom is not given; wisdom is grown.',
    literal: 'wisdom not give; wisdom grow-place/cultivate',
  },
  {
    sagelo: 'Mimwana kel pensi, saga fu oni.',
    english: 'The child who thinks will become a sage.',
    literal: 'child who thinks, sage future is',
  },
  {
    sagelo: 'Wai kel waii, sim purda sondo oni.',
    english: 'Water that flows never loses its way.',
    literal: 'water that flows, not lose where is (a saying about persistence and natural direction)',
  },
  {
    sagelo: 'Cho mimwana sage oni, ju mo saga ta kari.',
    english: 'Every child becomes wise, if some sage loves them.',
    literal: 'all child wise is, if some sage [obj] love',
  },
  {
    sagelo: 'Tanoc doa, lira le lumi cho.',
    english: 'In the night, the stars shine for everyone.',
    literal: 'night at-time, star [prog] shine all',
  },
  {
    sagelo: 'Kor sim log; log sim kor.',
    english: 'The heart is not logic; logic is not the heart.',
    literal: 'heart not logic; logic not heart (each has its place)',
  },
];

export const SAGELO_MANTRAS = [
  {
    title: 'A Mantra for Beginning',
    occasion: 'Chanted on a relaxed exhale (4–6 seconds per line) before study',
    lines: [
      { sagelo: 'Sago kandi. Sago kandi.', english: 'Wisdom comes. Wisdom comes.' },
      { sagelo: 'Lumi, lumi, kora lumi.', english: 'Shine, shine, let the heart shine.' },
      { sagelo: 'Yo sagi, yo sage, yo oni.', english: 'I know, I am wise, I am.' },
    ],
  },
  {
    title: 'A Mantra for Rest',
    occasion: 'Soft descending downdrift contour for evening reflection',
    lines: [
      { sagelo: 'Tanoc kore. Tanoc shanti.', english: 'The night is warm. The night is peace.' },
      { sagelo: 'Doti, doti, kora doti.', english: 'Sleep, sleep, let the heart sleep.' },
      { sagelo: 'Fu jendi, fu lume, fu sage.', english: 'I will wake, I will shine, I will be wise.' },
    ],
  },
  {
    title: 'A Mantra for Understanding',
    occasion: 'Built on Lesson 22 logical conditionals (ju ... juta)',
    lines: [
      { sagelo: 'Ju pensi, juta sagi.', english: 'If I think, then I understand.' },
      { sagelo: 'Ju sagi, juta kari.', english: 'If I understand, then I love.' },
      { sagelo: 'Ju kari, juta shanti.', english: 'If I love, then there is peace.' },
    ],
  },
];

export interface GradedPassage {
  id: string;
  title: string;
  level: string;
  lessonsCovered: string;
  sageloParagraphs: string[];
  englishParagraphs: string[];
  newWords: Array<{ word: string; meaning: string }>;
  grammarNotes: string;
  comprehensionQuestions: Array<{
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }>;
}

export const GRADED_READER_PASSAGES: GradedPassage[] = [
  {
    id: 'folktale-river',
    title: 'The Sage and the River (Folktale)',
    level: 'Cultural Folktale · Part IV Chapter B',
    lessonsCovered: 'Lessons 1–26 in miniature',
    sageloParagraphs: [
      'Mo saga pa bori dovu ndo. Mo mwana pa kandi, e ta saga sodeka sondo dovu wendi loni.',
      'Saga pa loni: "Dovu sim wendi. Dovu waii."',
      'Mwana pa sim sagi, e ta saga sodeka wa loni: "Sowe kem oni, ju wendi sim oni?"',
      'Saga pa loni: "Waii oni mori kem wendi. Wendi oni ta sasu kandi e ta sasu wendi. Waii oni ta cho sasu, ta yowe sim purda."',
      'Mwana pa pensi lente, e pa sagi ha.',
    ],
    englishParagraphs: [
      'A sage once stayed by a river. A child came and asked the sage why the river went where it went.',
      'The sage said: "The river does not go. The river flows."',
      'The child did not understand, and asked the sage further: "What is the difference, if going is not [flowing]?"',
      'The sage said: "Flowing is greater than going. Going is leaving one place and arriving at another. Flowing is being at every place, without ever losing yourself."',
      'The child thought slowly, and understood, for certain.',
    ],
    newWords: [
      { word: 'dovu', meaning: 'river' },
      { word: 'waii', meaning: 'to flow' },
      { word: 'sasu', meaning: 'place (sa- + -u)' },
      { word: 'yowe', meaning: 'oneself / individual' },
    ],
    grammarNotes: 'Uses past tense (pa), question word (sodeka), comparison (mori kem), and closes with direct evidentiality (ha).',
    comprehensionQuestions: [
      {
        question: 'Why does the sage say "Dovu sim wendi. Dovu waii"?',
        options: [
          'Because flowing means being at every place without losing oneself, unlike merely leaving one place for another.',
          'Because the river is frozen in winter.',
          'Because the child forgot the word for water.',
        ],
        correctIndex: 0,
        explanation: 'The sage contrasts wendi (leaving one place and arriving at another) with waii (being at every place without losing oneself: ta yowe sim purda).',
      },
      {
        question: 'What does the final particle "ha" in "e pa sagi ha" tell us?',
        options: [
          'The child was asking a question.',
          'The child understood with direct, firsthand certainty.',
          'The child only heard a rumor about the river.',
        ],
        correctIndex: 1,
        explanation: 'Lesson 24: "ha" marks direct, witnessed/experienced knowledge and certainty.',
      },
    ],
  },
  {
    id: 'passage-1',
    title: "Passage 1: A Child's Morning",
    level: 'Beginner · Part VII',
    lessonsCovered: 'Lessons 1–11 only',
    sageloParagraphs: [
      'Jua lumi. Mimwana jendi. Ye ta wai voli. Nyango ta mimwana wai doni. Mimwana masi e biva. Ye sage oni.',
    ],
    englishParagraphs: [
      'The sun shines. The child wakes. He/she wants water. The mother gives the child water. The child eats and drinks. He/she is well.',
    ],
    newWords: [
      { word: 'jendi', meaning: 'to wake' },
      { word: 'masi', meaning: 'to eat' },
      { word: 'biva', meaning: 'to drink' },
    ],
    grammarNotes: 'Demonstrates Subject–Object–Verb order with the object marker "ta" (Ye ta wai voli) and everyday extension of "sage" to mean "well/sound".',
    comprehensionQuestions: [
      {
        question: 'Who gives water to the child in Passage 1?',
        options: ['Mpaka (the elder)', 'Nyango (the mother)', 'Tata (the father)'],
        correctIndex: 1,
        explanation: '"Nyango ta mimwana wai doni" means "The mother gives the child water."',
      },
    ],
  },
  {
    id: 'passage-2',
    title: 'Passage 2: The Old Tree',
    level: 'Early Intermediate · Part VII',
    lessonsCovered: 'Adds Lessons 12–20',
    sageloParagraphs: [
      'Mo sila vece pa oni sasagu ndo. Sila grande oni, e sila vece mori kem cho sil ndo mun. Mimwana hu pa kandi tawinya doa, e ta sila veni. Mo mwana pa loni: "Sowe kem sila oni?" Mpaka pa loni: "Sila kel yu veni, sila wa cho saga oni."',
    ],
    englishParagraphs: [
      'An old tree stood at the sanctuary. The tree was large, and older than every tree in the world. The children came one day, and saw the tree. One child said: "What is this tree?" The elder said: "The tree you see is the tree of every sage."',
    ],
    newWords: [
      { word: 'vece', meaning: 'old (of things/time)' },
      { word: 'cho', meaning: 'all / every' },
    ],
    grammarNotes: 'Combines location (sasagu ndo), comparative (vece mori kem), plural (mimwana hu), and possession (sila wa cho saga).',
    comprehensionQuestions: [
      {
        question: 'How does the passage describe the age of the tree at the sanctuary?',
        options: [
          'It was planted yesterday.',
          'It is older than every tree in the world (vece mori kem cho sil ndo mun).',
          'It is smaller than the children.',
        ],
        correctIndex: 1,
        explanation: '"sila vece mori kem cho sil ndo mun" uses Lesson 19 comparison (mori kem) + quantifier (cho).',
      },
    ],
  },
  {
    id: 'passage-3',
    title: 'Passage 3: A Debate on Wisdom',
    level: 'Intermediate · Part VII',
    lessonsCovered: 'Adds Lessons 21–26',
    sageloParagraphs: [
      'Du saga pa loni. Un saga pa loni: "Sago oni ju yu lerni." Un saga oxo pa loni: "Sim! Sago oni ju yu kori." Mimwana kel pa veni pa loni: "Ju yu lerni e yu kori, juta yu sage oni." Du saga pa sim loni sowe mori — deka mimwana pa vera loni ha.',
    ],
    englishParagraphs: [
      'Two sages spoke. One sage said: "Wisdom is if you study." The other sage said: "No! Wisdom is if you feel." A child who was watching said: "If you study and you feel, then you are wise." The two sages said nothing more — because the child had spoken truly, without doubt.',
    ],
    newWords: [
      { word: 'vera', meaning: 'true / truly' },
      { word: 'oxo', meaning: 'exclusive OR (either/or, not both)' },
    ],
    grammarNotes: 'Highlights the philosophical contrast between oxo (exclusive either/or) and e (inclusive AND).',
    comprehensionQuestions: [
      {
        question: 'Which particle marks the two sages’ initial disagreement as an exclusive either/or before the child resolves it?',
        options: ['oxo (exclusive OR)', 'e (inclusive AND)', 'ndo (location)'],
        correctIndex: 0,
        explanation: 'Practice VII.1 Question 1: "oxo" in "Un saga oxo pa loni" frames the second sage in exclusive opposition before the child unites study and feeling with "e".',
      },
    ],
  },
  {
    id: 'passage-4',
    title: "Passage 4: The Sage's Question",
    level: 'Advanced · Part VII',
    lessonsCovered: 'Full Sagelo Grammar (Lessons 1–30)',
    sageloParagraphs: [
      'Mo saga, kel pa lerni cho tajua wa sago, mo tawinya pa sondo tere wendi. Ndo tere, mo mwana nemwa pa ye ku loni: "Sowe yu voli, saga kel cho sago sagi?"',
      'Saga pa le pensi lente, juta pa loni: "Yo voli ta sowe yo sim sagi. Deka sago kel yo ko sagi, sim fu kambi. Sago kel yo sim sagi, fu yo kambi — e lonje, fu yo grande oni mori kem yo pa oni."',
      'Mwana pa sim sagi cho — ma pa kori ha juta pa sagi si tawinya, ju ye ta sila grande veni.',
    ],
    englishParagraphs: [
      'A sage, who had studied wisdom for every year [of their life], one day went toward a mountain. At the mountain, a stranger child said to him: "What do you want, sage who knows all wisdom?"',
      'The sage thought slowly for a while, then said: "I want that which I do not know. Because the wisdom I have already understood will not change me. The wisdom I do not yet know will change me — and therefore, I will become greater than I was."',
      'The child did not fully understand — but felt it for certain, and understood [it fully], he was later told, on the day he saw the great tree himself.',
    ],
    newWords: [
      { word: 'ma', meaning: 'but' },
      { word: 'kambi', meaning: 'to change' },
    ],
    grammarNotes: 'Uses progressive aspect (pa le pensi), perfect aspect (ko sagi), future (fu kambi), logical consequence (lonje), and dual evidentiality markers (kori ha vs. sagi si).',
    comprehensionQuestions: [
      {
        question: 'Why does the sage want "that which I do not know" (ta sowe yo sim sagi)?',
        options: [
          'Because unknown wisdom will change them and make them greater than they were.',
          'Because the sage forgot everything they studied.',
          'Because the mountain is too high.',
        ],
        correctIndex: 0,
        explanation: '"Sago kel yo sim sagi, fu yo kambi — e lonje, fu yo grande oni mori kem yo pa oni."',
      },
      {
        question: 'How do the evidentiality markers "ha" and "si" work in the final sentence?',
        options: [
          '"ha" shows the child felt it firsthand for certain right then, while "si" shows it was later reported/confirmed that he understood it fully on the day he saw the great tree.',
          'Both mean the sentence is a question.',
          'They indicate plural nouns.',
        ],
        correctIndex: 0,
        explanation: 'Practice VII.1 Question 2: The passage moves from direct firsthand conviction (kori ha) to reported confirmation of eventual understanding (pa sagi si).',
      },
    ],
  },
];

export const CULTURAL_ESSAYS = [
  {
    title: 'On the Circle of Sages',
    sageloQuote: 'Misaga — wisdom as a human action, not a pedestal.',
    body: 'In the spirit that gave Sagelo its name, imagine a loose, informal tradition — the Circle of Sages — with no single founder, headquarters, or hierarchy, only a shared practice: anyone who teaches another person even one true, useful thing has, in that moment, acted as a saga. Under this tradition, wisdom is not a title held by the few, but a role anyone can step into, however briefly, however small the lesson. This is why saga takes the mi- (person) class prefix like any ordinary person-word, rather than some special, elevated class of its own: wisdom is not a separate category of being, but something any person can do.',
  },
  {
    title: 'On Marking Time (Tajua & Tamwe)',
    sageloQuote: 'Tajua (the sun’s turning) · Tamwe (the moon’s cycle)',
    body: 'A Sagelo-speaking community marks the year not by a single arbitrary moment but by tajua — the sun’s full turning — and the month by tamwe, the moon’s. On the night the moon is fullest, speakers gather and converse only in evidentiality-marked sentences — every claim honestly tagged ha (direct witness), ra (inference), or si (hearsay) — as a shared practice in intellectual honesty. Language itself becomes the discipline.',
  },
  {
    title: 'On Why the Heart Has Its Own Root',
    sageloQuote: 'Kor sim log; log sim kor.',
    body: 'Notice that kor (heart/feeling) was one of the very first roots taught in Lesson 1, right alongside sag (wisdom). A language built deliberately for reasoning could easily have tipped into treating feeling as something lesser, something to be optimized away. Sagelo resists that on purpose. Wisdom, in the philosophy behind this language, was never meant to be reasoning instead of feeling — only reasoning alongside it, each doing what the other cannot.',
  },
];

const DIGITS = ['nul', 'un', 'du', 'tri', 'kwa', 'pen', 'sek', 'sep', 'ok', 'nov'];

export function numberToSagelo(n: number): { sagelo: string; breakdown: string } {
  const num = Math.max(0, Math.min(9999, Math.floor(n)));
  if (num === 0) return { sagelo: 'nul', breakdown: '0 (nul)' };
  if (num === 10) return { sagelo: 'dek', breakdown: '10 (dek)' };
  if (num === 100) return { sagelo: 'cent', breakdown: '100 (cent)' };
  if (num === 1000) return { sagelo: 'mil', breakdown: '1000 (mil)' };

  const parts: string[] = [];
  const exp: string[] = [];

  const thousands = Math.floor(num / 1000);
  const rem1000 = num % 1000;
  const hundreds = Math.floor(rem1000 / 100);
  const rem100 = rem1000 % 100;
  const tens = Math.floor(rem100 / 10);
  const units = rem100 % 10;

  if (thousands > 0) {
    parts.push(thousands === 1 ? 'mil' : `${DIGITS[thousands]}-mil`);
    exp.push(thousands === 1 ? '1000' : `${thousands}×1000`);
  }
  if (hundreds > 0) {
    parts.push(hundreds === 1 ? 'cent' : `${DIGITS[hundreds]}-cent`);
    exp.push(hundreds === 1 ? '100' : `${hundreds}×100`);
  }
  if (tens > 0) {
    parts.push(tens === 1 ? 'dek' : `${DIGITS[tens]}-dek`);
    exp.push(tens === 1 ? '10' : `${tens}×10`);
  }
  if (units > 0) {
    parts.push(DIGITS[units]);
    exp.push(`${units}`);
  }

  return {
    sagelo: parts.join('-'),
    breakdown: exp.join(' + '),
  };
}
