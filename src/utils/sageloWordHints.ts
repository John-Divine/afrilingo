import { getWordPhonetic } from './sageloPhonetics';

export interface WordHint {
  word: string;
  clean: string;
  translation: string;
  grammaticalRole?: string;
  ipa: string;
}

const COMMON_HINTS: Record<string, { translation: string; role?: string }> = {
  // Pronouns
  yo: { translation: 'I / me', role: '1st person singular pronoun' },
  yu: { translation: 'you', role: '2nd person singular pronoun' },
  ye: { translation: 'he / she / it', role: '3rd person singular pronoun' },
  yoyu: { translation: 'we (you and I)', role: '1st person inclusive pronoun' },
  'yo hu': { translation: 'we (exclusive: not you)', role: '1st person exclusive pronoun' },
  'yu hu': { translation: 'you all / you plural', role: '2nd person plural pronoun' },
  'ye hu': { translation: 'they / them', role: '3rd person plural pronoun' },

  // Core Verb
  oni: { translation: 'to be (am / is / are / was / were)', role: 'Copula verb' },

  // Case & Syntactic Particles
  ta: { translation: '[Direct Object Marker]', role: 'Marks the recipient of the action' },
  wa: { translation: 'of (possessive)', role: 'Possessive marker' },
  ndo: { translation: 'at / in (location)', role: 'Locative marker' },
  doa: { translation: 'at / when (time)', role: 'Temporal marker' },
  ku: { translation: 'to / for (dative/benefactive)', role: 'Dative marker' },
  vi: { translation: 'with / by means of (manner/tool)', role: 'Instrumental marker' },
  hu: { translation: '[Plural Marker]', role: 'Makes the preceding noun plural' },

  // Tense & Aspect
  pa: { translation: '[Past Tense Marker]', role: 'Places action in the past' },
  fu: { translation: '[Future Tense Marker]', role: 'Places action in the future' },
  le: { translation: '[Progressive Aspect -ing]', role: 'Ongoing action' },
  ko: { translation: '[Perfect Aspect - has/had done]', role: 'Completed action' },

  // Negation & Polite Command
  sim: { translation: 'not / does not / no', role: 'Negation particle' },
  no: { translation: 'please (polite request)', role: 'Polite imperative particle' },

  // Questions
  ni: { translation: '[Question Marker: ?]', role: 'Turns statement into a yes/no question' },
  sowa: { translation: 'who?', role: 'Interrogative pronoun' },
  sowe: { translation: 'what?', role: 'Interrogative pronoun' },
  sondo: { translation: 'where?', role: 'Interrogative locative' },
  sodoa: { translation: 'when?', role: 'Interrogative temporal' },
  sodeka: { translation: 'why?', role: 'Interrogative causal' },
  sovi: { translation: 'how?', role: 'Interrogative manner' },

  // Logic & Connectives
  e: { translation: 'and / also', role: 'Conjunction (both true)' },
  o: { translation: 'or (inclusive)', role: 'Conjunction (at least one true)' },
  oxo: { translation: 'either...or (exclusive)', role: 'Conjunction (strictly one true)' },
  ju: { translation: 'if', role: 'Conditional antecedent' },
  juta: { translation: 'then', role: 'Conditional consequent' },
  kwe: { translation: 'if and only if (iff)', role: 'Biconditional connective' },
  deka: { translation: 'because', role: 'Causal conjunction' },
  lonje: { translation: 'therefore / thus', role: 'Logical conclusion' },
  cho: { translation: 'all / every (∀)', role: 'Universal quantifier' },
  mo: { translation: 'some / there exists (∃)', role: 'Existential quantifier' },

  // Evidentiality
  ha: { translation: '[Witnessed: I know firsthand]', role: 'Direct evidential marker' },
  ra: { translation: '[Inferred: It appears/seems]', role: 'Inference evidential marker' },
  si: { translation: '[Hearsay: So I was told]', role: 'Reported evidential marker' },

  // Comparison
  mori: { translation: 'more / greater', role: 'Comparative' },
  mini: { translation: 'less / lesser', role: 'Comparative' },
  sama: { translation: 'equal to / as ... as', role: 'Equative' },
  kem: { translation: 'than', role: 'Comparison pivot' },

  // Reflexives & Relative
  sofa: { translation: 'self (-self)', role: 'Reflexive object' },
  dira: { translation: 'each other / one another', role: 'Reciprocal object' },
  kel: { translation: 'who / which / that', role: 'Relative clause marker' },

  // Greetings & Core Philosophical Loans
  shanti: { translation: 'peace (greeting & blessing)', role: 'Greeting & philosophical loan' },
  satya: { translation: 'truth / integrity', role: 'Philosophical loan' },
  dharma: { translation: 'natural law / duty', role: 'Philosophical loan' },
  karma: { translation: 'action and consequence', role: 'Philosophical loan' },
  tao: { translation: 'the path / the way', role: 'Philosophical loan' },
  chi: { translation: 'life-energy / breath', role: 'Philosophical loan' },
  zen: { translation: 'meditative stillness / calm', role: 'Philosophical loan' },
  mana: { translation: 'spiritual power', role: 'Philosophical loan' },
  ndoto: { translation: 'dream', role: 'Loanword' },

  // Family & Kinship
  mwana: { translation: 'child', role: 'Noun' },
  mimwana: { translation: 'a child (people-class)', role: 'Noun (mi- class)' },
  ndeko: { translation: 'friend / sibling / companion', role: 'Kinship noun' },
  mpaka: { translation: 'elder / leader', role: 'Kinship noun' },
  tata: { translation: 'father', role: 'Kinship noun' },
  nyango: { translation: 'mother', role: 'Kinship noun' },
  saga: { translation: 'a sage / teacher', role: 'Noun' },
  misaga: { translation: 'a sage (person-class)', role: 'Noun (mi- class)' },
  sage: { translation: 'wise / healthy / well', role: 'Adjective' },
  sagi: { translation: 'to know / understand / reason', role: 'Verb' },
  sago: { translation: 'wisdom / understanding (abstract)', role: 'Abstract noun' },
  sagu: { translation: 'place of learning / sanctuary', role: 'Locative noun' },
  sasagu: { translation: 'a sanctuary of wisdom (place-class)', role: 'Noun (sa- class)' },
  wesagi: { translation: 'the act of reasoning (action-class)', role: 'Noun (we- class)' },

  // Nature Roots
  wai: { translation: 'water', role: 'Root' },
  waia: { translation: 'a body of water / stream', role: 'Noun' },
  waie: { translation: 'watery / fluid', role: 'Adjective' },
  waii: { translation: 'to flow / to water', role: 'Verb' },
  waio: { translation: 'fluidity / wateriness', role: 'Abstract noun' },
  waiu: { translation: 'a wetland / wet place', role: 'Locative noun' },

  jua: { translation: 'sun / solar energy', role: 'Root' },
  juaa: { translation: 'a sun / light source', role: 'Noun' },
  juae: { translation: 'sunny / solar', role: 'Adjective' },
  juai: { translation: 'to illuminate / shine like sun', role: 'Verb' },
  tajua: { translation: 'a year (sun cycle)', role: 'Noun (ta- class)' },

  mwe: { translation: 'moon', role: 'Root' },
  tamwe: { translation: 'a month (moon cycle)', role: 'Noun (ta- class)' },

  mun: { translation: 'world / earth', role: 'Root' },
  muna: { translation: 'the world / earth', role: 'Noun' },
  mune: { translation: 'worldly / earthy', role: 'Adjective' },

  fon: { translation: 'wind / breeze', role: 'Root' },
  fona: { translation: 'a wind / breeze', role: 'Noun' },
  fone: { translation: 'windy', role: 'Adjective' },
  foni: { translation: 'to storm / blow', role: 'Verb' },

  sil: { translation: 'tree / forest', role: 'Root' },
  sila: { translation: 'a tree', role: 'Noun' },
  sile: { translation: 'arboreal / woody', role: 'Adjective' },
  sili: { translation: 'to take root', role: 'Verb' },
  silu: { translation: 'a forest / grove', role: 'Locative noun' },

  lum: { translation: 'light / brightness', role: 'Root' },
  luma: { translation: 'a light / lamp', role: 'Noun' },
  kiluma: { translation: 'a lamp / lantern (tool-class)', role: 'Noun (ki- class)' },
  lume: { translation: 'bright / luminous', role: 'Adjective' },
  lumi: { translation: 'to shine / glow', role: 'Verb' },
  lumo: { translation: 'luminosity / brightness', role: 'Abstract noun' },
  lumu: { translation: 'a bright place', role: 'Locative noun' },

  kor: { translation: 'heart / feeling', role: 'Root' },
  kora: { translation: 'a heart / feeling', role: 'Noun' },
  lukora: { translation: 'a feeling / emotion (idea-class)', role: 'Noun (lu- class)' },
  kore: { translation: 'heartfelt / warm / caring', role: 'Adjective' },
  kori: { translation: 'to feel / sense emotionally', role: 'Verb' },
  koro: { translation: 'feeling / emotion concept', role: 'Abstract noun' },
  koru: { translation: 'a place of intimacy', role: 'Locative noun' },

  // Common Verbs
  voli: { translation: 'to want / wish / desire', role: 'Verb' },
  doni: { translation: 'to give / grant', role: 'Verb' },
  veni: { translation: 'to see / look', role: 'Verb' },
  loni: { translation: 'to speak / say', role: 'Verb' },
  wendi: { translation: 'to go', role: 'Verb' },
  kandi: { translation: 'to come / arrive', role: 'Verb' },
  kari: { translation: 'to love / care for', role: 'Verb' },
  pensi: { translation: 'to think / reflect', role: 'Verb' },
  fasi: { translation: 'to make / do', role: 'Verb' },
  lerni: { translation: 'to learn / study', role: 'Verb' },
  montri: { translation: 'to show / teach', role: 'Verb' },
  bori: { translation: 'to stay / remain', role: 'Verb' },
  doti: { translation: 'to sleep / rest', role: 'Verb' },
  jendi: { translation: 'to wake up', role: 'Verb' },
  masi: { translation: 'to eat', role: 'Verb' },
  biva: { translation: 'to drink', role: 'Verb' },
  fina: { translation: 'to finish / end', role: 'Verb' },
  sarta: { translation: 'to start / begin', role: 'Verb' },
  purda: { translation: 'to lose', role: 'Verb' },
  trovi: { translation: 'to find / discover', role: 'Verb' },
  kambi: { translation: 'to change / transform', role: 'Verb' },
  vinci: { translation: 'to win / overcome', role: 'Verb' },

  // Adjectives
  grande: { translation: 'large / great / major', role: 'Adjective' },
  mikre: { translation: 'small / tiny / minor', role: 'Adjective' },
  nove: { translation: 'new / fresh', role: 'Adjective' },
  vece: { translation: 'old / previous (of things)', role: 'Adjective' },
  rapide: { translation: 'fast / quick', role: 'Adjective' },
  lente: { translation: 'slow / gentle', role: 'Adjective' },
  forte: { translation: 'strong / powerful', role: 'Adjective' },
  debile: { translation: 'weak / gentle', role: 'Adjective' },
  bela: { translation: 'beautiful', role: 'Adjective' },
  vera: { translation: 'true / real', role: 'Adjective' },
  justa: { translation: 'fair / just', role: 'Adjective' },
  libe: { translation: 'free / liberated', role: 'Adjective' },

  // Adverbs (Adjective + vi)
  'sage vi': { translation: 'wisely / skillfully', role: 'Adverb' },
  'kore vi': { translation: 'warmly / heartfeltly', role: 'Adverb' },
  'lente vi': { translation: 'slowly / gently', role: 'Adverb' },
  'rapide vi': { translation: 'quickly / rapidly', role: 'Adverb' },
  'forte vi': { translation: 'strongly / firmly', role: 'Adverb' },

  // Numbers & Math
  nul: { translation: 'zero (0)', role: 'Numeral' },
  un: { translation: 'one (1)', role: 'Numeral' },
  du: { translation: 'two (2)', role: 'Numeral' },
  tri: { translation: 'three (3)', role: 'Numeral' },
  kwa: { translation: 'four (4)', role: 'Numeral' },
  pen: { translation: 'five (5)', role: 'Numeral' },
  sek: { translation: 'six (6)', role: 'Numeral' },
  sep: { translation: 'seven (7)', role: 'Numeral' },
  ok: { translation: 'eight (8)', role: 'Numeral' },
  nov: { translation: 'nine (9)', role: 'Numeral' },
  dek: { translation: 'ten (10)', role: 'Numeral' },
  'dek-un': { translation: 'eleven (11)', role: 'Numeral' },
  'du-dek': { translation: 'twenty (20)', role: 'Numeral' },
  cent: { translation: 'one hundred (100)', role: 'Numeral' },
  mil: { translation: 'one thousand (1000)', role: 'Numeral' },
  plus: { translation: 'plus (+)', role: 'Math operation' },
  minus: { translation: 'minus (-)', role: 'Math operation' },
  multi: { translation: 'multiplied by (×)', role: 'Math operation' },
  divi: { translation: 'divided by (÷)', role: 'Math operation' },

  // Time & Places
  tawinya: { translation: 'a day / daytime', role: 'Noun (ta- class)' },
  tanoc: { translation: 'a night / nighttime', role: 'Noun (ta- class)' },
  tere: { translation: 'mountain', role: 'Noun' },
  dovu: { translation: 'river', role: 'Noun' },
  sata: { translation: 'stone', role: 'Noun' },
  sátá: { translation: 'a strike / blow (high tone)', role: 'Noun' },
  wina: { translation: 'a song', role: 'Noun' },
  wíná: { translation: 'to sing right now (high tone)', role: 'Verb' },
  dola: { translation: 'goods / wares / wares for sale', role: 'Noun' },
  pila: { translation: 'price / cost', role: 'Noun' },
  ma: { translation: 'but / however', role: 'Conjunction' },
  nemwa: { translation: 'stranger / guest', role: 'Noun' },
};

/**
 * Retrieves an interactive hint for any Sagelo word token.
 */
export function getWordHint(rawWord: string): WordHint {
  const clean = rawWord
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z]/g, '');

  const phon = getWordPhonetic(rawWord);

  if (COMMON_HINTS[clean]) {
    return {
      word: rawWord,
      clean,
      translation: COMMON_HINTS[clean].translation,
      grammaticalRole: COMMON_HINTS[clean].role,
      ipa: phon.display,
    };
  }

  // Check with prefixes
  const prefixes = [
    { p: 'mi', name: 'people class' },
    { p: 'ki', name: 'tools & objects class' },
    { p: 'lu', name: 'ideas & emotions class' },
    { p: 'sa', name: 'places & sanctuaries class' },
    { p: 'ta', name: 'time & natural cycles class' },
    { p: 'na', name: 'numbers & logic class' },
    { p: 'we', name: 'actions & processes class' },
  ];

  for (const { p, name } of prefixes) {
    if (clean.startsWith(p) && clean.length > p.length + 1) {
      const rest = clean.slice(p.length);
      if (COMMON_HINTS[rest]) {
        return {
          word: rawWord,
          clean,
          translation: `${COMMON_HINTS[rest].translation} (${name})`,
          grammaticalRole: `Noun (${p}- class)`,
          ipa: phon.display,
        };
      }
    }
  }

  // Check ending heuristics
  if (clean.endsWith('ari')) {
    return {
      word: rawWord,
      clean,
      translation: 'one who does this (agentive role)',
      grammaticalRole: 'Agent noun (-ari)',
      ipa: phon.display,
    };
  }
  if (clean.endsWith('a')) {
    return {
      word: rawWord,
      clean,
      translation: 'concrete noun',
      grammaticalRole: 'Noun (-a)',
      ipa: phon.display,
    };
  }
  if (clean.endsWith('e')) {
    return {
      word: rawWord,
      clean,
      translation: 'descriptive quality / adjective',
      grammaticalRole: 'Adjective (-e)',
      ipa: phon.display,
    };
  }
  if (clean.endsWith('i')) {
    return {
      word: rawWord,
      clean,
      translation: 'action / verb',
      grammaticalRole: 'Verb (-i)',
      ipa: phon.display,
    };
  }
  if (clean.endsWith('o')) {
    return {
      word: rawWord,
      clean,
      translation: 'abstract concept / essence',
      grammaticalRole: 'Abstract noun (-o)',
      ipa: phon.display,
    };
  }
  if (clean.endsWith('u')) {
    return {
      word: rawWord,
      clean,
      translation: 'place / environment of',
      grammaticalRole: 'Place noun (-u)',
      ipa: phon.display,
    };
  }

  return {
    word: rawWord,
    clean,
    translation: 'Sagelo vocabulary word',
    ipa: phon.display,
  };
}
