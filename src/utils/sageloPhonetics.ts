// Sagelo Phonetic IPA Transliteration & Pronunciation Engine
// Fully conforming to SAGELO: The Complete Self-Teaching Course (SAGELO_COURSE.md by Sage Enigma)
//
// Chapter 2 & 3 Phonology Specifications:
// - Five Cardinal Vowels: a=[a] ("father"), e=[e] ("bed"), i=[i] ("feel"), o=[o] ("note"), u=[u] ("room")
// - Consonants:
//     p=[p], b=[b], t=[t], d=[d], k=[k], g=[ɡ] (always hard g)
//     m=[m], n=[n], ny=[ɲ] (Spanish ñ / canyon)
//     f=[f], v=[v], s=[s], sh=[ʃ] ("see", "she")
//     ch=[tʃ], j=[dʒ] ("church", "judge")
//     h=[h], l=[l], r=[ɾ] (light flapped sound closer to Spanish/Japanese r)
//     w=[w], y=[j]
// - Syllable shape: always open (C)(w/y)V; loanwords like shanti [ʃan.ti], ndeko [ⁿde.ko], nyango [ɲaŋ.ɡo]
// - Two Tones: High tone (á, é, í, ó, ú) with 3:2 perfect fifth interval & 1/φ downdrift; Low tone unmarked
// - Stress: Always on the second-to-last (penultimate) syllable of a word (marked with 'ˈ' in IPA)

export interface PhoneticData {
  display: string; // Standard IPA format enclosed in slashes, e.g. "/ˈʃan.ti/", "/saˈɡe.lo/"
  ipa: string;     // Raw IPA symbols, e.g. "ˈʃan.ti", "saˈɡe.lo"
  tts: string;     // Phonetic pronunciation string optimized for speech synthesis engine
}

export interface PhoneticWordToken {
  original: string;
  clean: string;
  isWord: boolean;
  phoneticDisplay?: string; // Standard IPA format, e.g. "/ˈʃan.ti/"
  phoneticIpa?: string;     // Raw IPA symbols, e.g. "ˈʃan.ti"
  phoneticTts?: string;     // Engine speech string
}

/**
 * Curated IPA dictionary of authentic Sagelo roots, loanwords, and frequent phrases
 * Strictly adhering to Chapter 2 & Chapter 3 of SAGELO_COURSE.md
 */
export const SAGELO_PHONETIC_MAP: Record<string, PhoneticData> = {
  // Greetings & Core Philosophy
  'shanti': { display: '/ˈʃan.ti/', ipa: 'ˈʃan.ti', tts: 'shanti' },
  'shanti ye': { display: '/ˈʃan.ti je/', ipa: 'ˈʃan.ti je', tts: 'shanti ye' },
  'shanti ndeko': { display: '/ˈʃan.ti ˈⁿde.ko/', ipa: 'ˈʃan.ti ˈⁿde.ko', tts: 'shanti ndeko' },
  'oni': { display: '/ˈo.ni/', ipa: 'ˈo.ni', tts: 'oni' },
  'yo': { display: '/jo/', ipa: 'jo', tts: 'yo' },
  'yu': { display: '/ju/', ipa: 'ju', tts: 'yu' },
  'da': { display: '/da/', ipa: 'da', tts: 'da' },
  'nu': { display: '/nu/', ipa: 'nu', tts: 'nu' },
  'mu': { display: '/mu/', ipa: 'mu', tts: 'mu' },
  'wa': { display: '/wa/', ipa: 'wa', tts: 'wa' },
  'ta': { display: '/ta/', ipa: 'ta', tts: 'ta' },
  'vi': { display: '/vi/', ipa: 'vi', tts: 'vi' },
  'sim': { display: '/sim/', ipa: 'sim', tts: 'sim' },
  'ni': { display: '/ni/', ipa: 'ni', tts: 'ni' },
  'ha': { display: '/ha/', ipa: 'ha', tts: 'ha' },
  'ra': { display: '/ɾa/', ipa: 'ɾa', tts: 'ra' },
  'si': { display: '/si/', ipa: 'si', tts: 'si' },
  'hu': { display: '/hu/', ipa: 'hu', tts: 'hu' },
  'kel': { display: '/kel/', ipa: 'kel', tts: 'kel' },
  'sofa': { display: '/ˈso.fa/', ipa: 'ˈso.fa', tts: 'sofa' },
  'dira': { display: '/ˈdi.ɾa/', ipa: 'ˈdi.ɾa', tts: 'dira' },
  'cho': { display: '/tʃo/', ipa: 'tʃo', tts: 'cho' },
  'ndo': { display: '/ⁿdo/', ipa: 'ⁿdo', tts: 'ndo' },
  'doa': { display: '/ˈdo.a/', ipa: 'ˈdo.a', tts: 'doa' },
  'kura': { display: '/ˈku.ɾa/', ipa: 'ˈku.ɾa', tts: 'kura' },
  'bono': { display: '/ˈbo.no/', ipa: 'ˈbo.no', tts: 'bono' },
  'afrilingo': { display: '/af.ɾiˈliŋ.ɡo/', ipa: 'af.ɾiˈliŋ.ɡo', tts: 'afrilingo' },
  'sagelo': { display: '/saˈɡe.lo/', ipa: 'saˈɡe.lo', tts: 'sagelo' },
  'sango': { display: '/ˈsaŋ.ɡo/', ipa: 'ˈsaŋ.ɡo', tts: 'sango' },
  'bantu': { display: '/ˈban.tu/', ipa: 'ˈban.tu', tts: 'bantu' },
  'lingala': { display: '/liŋˈɡa.la/', ipa: 'liŋˈɡa.la', tts: 'lingala' },
  'lonkundo': { display: '/loŋˈkun.do/', ipa: 'loŋˈkun.do', tts: 'lonkundo' },

  // Root sag (wisdom / know) - stress strictly penultimate
  'sag': { display: '/saɡ/', ipa: 'saɡ', tts: 'sag' },
  'saga': { display: '/ˈsa.ɡa/', ipa: 'ˈsa.ɡa', tts: 'saga' },
  'sage': { display: '/ˈsa.ɡe/', ipa: 'ˈsa.ɡe', tts: 'sage' },
  'sagi': { display: '/ˈsa.ɡi/', ipa: 'ˈsa.ɡi', tts: 'sagi' },
  'sago': { display: '/ˈsa.ɡo/', ipa: 'ˈsa.ɡo', tts: 'sago' },
  'sagu': { display: '/ˈsa.ɡu/', ipa: 'ˈsa.ɡu', tts: 'sagu' },
  'sagari': { display: '/saˈɡa.ɾi/', ipa: 'saˈɡa.ɾi', tts: 'sagari' },
  'sagem': { display: '/ˈsa.ɡem/', ipa: 'ˈsa.ɡem', tts: 'sagem' },
  'sage vi': { display: '/ˈsa.ɡe vi/', ipa: 'ˈsa.ɡe vi', tts: 'sage vi' },
  'sasagu': { display: '/saˈsa.ɡu/', ipa: 'saˈsa.ɡu', tts: 'sasagu' },
  'wesagi': { display: '/weˈsa.ɡi/', ipa: 'weˈsa.ɡi', tts: 'wesagi' },

  // Root lum (light / shine)
  'lum': { display: '/lum/', ipa: 'lum', tts: 'lum' },
  'luma': { display: '/ˈlu.ma/', ipa: 'ˈlu.ma', tts: 'luma' },
  'lume': { display: '/ˈlu.me/', ipa: 'ˈlu.me', tts: 'lume' },
  'lumi': { display: '/ˈlu.mi/', ipa: 'ˈlu.mi', tts: 'lumi' },
  'lumo': { display: '/ˈlu.mo/', ipa: 'ˈlu.mo', tts: 'lumo' },
  'lumu': { display: '/ˈlu.mu/', ipa: 'ˈlu.mu', tts: 'lumu' },
  'kiluma': { display: '/kiˈlu.ma/', ipa: 'kiˈlu.ma', tts: 'kiluma' },

  // Root kor (heart / feeling) - flapped [ɾ]
  'kor': { display: '/koɾ/', ipa: 'koɾ', tts: 'kor' },
  'kora': { display: '/ˈko.ɾa/', ipa: 'ˈko.ɾa', tts: 'kora' },
  'kore': { display: '/ˈko.ɾe/', ipa: 'ˈko.ɾe', tts: 'kore' },
  'kori': { display: '/ˈko.ɾi/', ipa: 'ˈko.ɾi', tts: 'kori' },
  'koro': { display: '/ˈko.ɾo/', ipa: 'ˈko.ɾo', tts: 'koro' },
  'koru': { display: '/ˈko.ɾu/', ipa: 'ˈko.ɾu', tts: 'koru' },
  'kore vi': { display: '/ˈko.ɾe vi/', ipa: 'ˈko.ɾe vi', tts: 'kore vi' },
  'lukora': { display: '/luˈko.ɾa/', ipa: 'luˈko.ɾa', tts: 'lukora' },

  // Nature roots (wai, jua, mun, fon, sil)
  'wai': { display: '/ˈwa.i/', ipa: 'ˈwa.i', tts: 'wai' },
  'waia': { display: '/waˈi.a/', ipa: 'waˈi.a', tts: 'waia' },
  'waie': { display: '/waˈi.e/', ipa: 'waˈi.e', tts: 'waie' },
  'waii': { display: '/waˈi.i/', ipa: 'waˈi.i', tts: 'waii' },
  'waio': { display: '/waˈi.o/', ipa: 'waˈi.o', tts: 'waio' },
  'waiu': { display: '/waˈi.u/', ipa: 'waˈi.u', tts: 'waiu' },

  // j is [dʒ] as in church/judge (SAGELO_COURSE.md Chapter 2)
  'jua': { display: '/ˈdʒu.a/', ipa: 'ˈdʒu.a', tts: 'jua' },
  'juaa': { display: '/dʒuˈa.a/', ipa: 'dʒuˈa.a', tts: 'juaa' },
  'juae': { display: '/dʒuˈa.e/', ipa: 'dʒuˈa.e', tts: 'juae' },
  'juai': { display: '/dʒuˈa.i/', ipa: 'dʒuˈa.i', tts: 'juai' },
  'juao': { display: '/dʒuˈa.o/', ipa: 'dʒuˈa.o', tts: 'juao' },
  'tajua': { display: '/taˈdʒu.a/', ipa: 'taˈdʒu.a', tts: 'tajua' },

  'mun': { display: '/mun/', ipa: 'mun', tts: 'mun' },
  'muna': { display: '/ˈmu.na/', ipa: 'ˈmu.na', tts: 'muna' },
  'mune': { display: '/ˈmu.ne/', ipa: 'ˈmu.ne', tts: 'mune' },
  'muni': { display: '/ˈmu.ni/', ipa: 'ˈmu.ni', tts: 'muni' },

  'fon': { display: '/fon/', ipa: 'fon', tts: 'fon' },
  'fona': { display: '/ˈfo.na/', ipa: 'ˈfo.na', tts: 'fona' },
  'fone': { display: '/ˈfo.ne/', ipa: 'ˈfo.ne', tts: 'fone' },
  'foni': { display: '/ˈfo.ni/', ipa: 'ˈfo.ni', tts: 'foni' },
  'fono': { display: '/ˈfo.no/', ipa: 'ˈfo.no', tts: 'fono' },
  'fonu': { display: '/ˈfo.nu/', ipa: 'ˈfo.nu', tts: 'fonu' },

  'sil': { display: '/sil/', ipa: 'sil', tts: 'sil' },
  'sila': { display: '/ˈsi.la/', ipa: 'ˈsi.la', tts: 'sila' },
  'sile': { display: '/ˈsi.le/', ipa: 'ˈsi.le', tts: 'sile' },
  'sili': { display: '/ˈsi.li/', ipa: 'ˈsi.li', tts: 'sili' },
  'silo': { display: '/ˈsi.lo/', ipa: 'ˈsi.lo', tts: 'silo' },
  'silu': { display: '/ˈsi.lu/', ipa: 'ˈsi.lu', tts: 'silu' },

  // Bantu Kinship Loans (SAGELO_COURSE.md lines 109-110)
  'mwana': { display: '/ˈmwa.na/', ipa: 'ˈmwa.na', tts: 'mwana' },
  'mimwana': { display: '/mimˈwa.na/', ipa: 'mimˈwa.na', tts: 'mimwana' },
  'ndeko': { display: '/ˈⁿde.ko/', ipa: 'ˈⁿde.ko', tts: 'ndeko' },
  'mindeko': { display: '/minˈde.ko/', ipa: 'minˈde.ko', tts: 'mindeko' },
  'mpaka': { display: '/ˈᵐpa.ka/', ipa: 'ˈᵐpa.ka', tts: 'mpaka' },
  'mimpaka': { display: '/mimˈpa.ka/', ipa: 'mimˈpa.ka', tts: 'mimpaka' },
  'nyango': { display: '/ˈɲaŋ.ɡo/', ipa: 'ˈɲaŋ.ɡo', tts: 'nyango' },
  'tata': { display: '/ˈta.ta/', ipa: 'ˈta.ta', tts: 'tata' },
  'nemwa': { display: '/ˈnem.wa/', ipa: 'ˈnem.wa', tts: 'nemwa' },
  'dumwe': { display: '/ˈdum.we/', ipa: 'ˈdum.we', tts: 'dumwe' },

  // Common Verbs
  'voli': { display: '/ˈvo.li/', ipa: 'ˈvo.li', tts: 'voli' },
  'wendi': { display: '/ˈwen.di/', ipa: 'ˈwen.di', tts: 'wendi' },
  'kandi': { display: '/ˈkan.di/', ipa: 'ˈkan.di', tts: 'kandi' },
  'veni': { display: '/ˈve.ni/', ipa: 'ˈve.ni', tts: 'veni' },
  'doni': { display: '/ˈdo.ni/', ipa: 'ˈdo.ni', tts: 'doni' },
  'bori': { display: '/ˈbo.ɾi/', ipa: 'ˈbo.ɾi', tts: 'bori' },
  'fasi': { display: '/ˈfa.si/', ipa: 'ˈfa.si', tts: 'fasi' },
  'fasari': { display: '/faˈsa.ɾi/', ipa: 'faˈsa.ɾi', tts: 'fasari' },
  'kari': { display: '/ˈka.ɾi/', ipa: 'ˈka.ɾi', tts: 'kari' },
  'audi': { display: '/ˈa.u.di/', ipa: 'ˈa.u.di', tts: 'audi' },
  'tanji': { display: '/ˈtan.dʒi/', ipa: 'ˈtan.dʒi', tts: 'tanji' },
  'ridi': { display: '/ˈɾi.di/', ipa: 'ˈɾi.di', tts: 'ridi' },
  'pensi': { display: '/ˈpen.si/', ipa: 'ˈpen.si', tts: 'pensi' },
  'pensari': { display: '/penˈsa.ɾi/', ipa: 'penˈsa.ɾi', tts: 'pensari' },
  'lerni': { display: '/ˈleɾ.ni/', ipa: 'ˈleɾ.ni', tts: 'lerni' },
  'loni': { display: '/ˈlo.ni/', ipa: 'ˈlo.ni', tts: 'loni' },
  'sani': { display: '/ˈsa.ni/', ipa: 'ˈsa.ni', tts: 'sani' },
  'sanari': { display: '/saˈna.ɾi/', ipa: 'saˈna.ɾi', tts: 'sanari' },
  'dubi': { display: '/ˈdu.bi/', ipa: 'ˈdu.bi', tts: 'dubi' },
  'skrivi': { display: '/ˈskɾi.vi/', ipa: 'ˈskɾi.vi', tts: 'skrivi' },
  'skrivari': { display: '/skɾiˈva.ɾi/', ipa: 'skɾiˈva.ɾi', tts: 'skrivari' },
  'mori': { display: '/ˈmo.ɾi/', ipa: 'ˈmo.ɾi', tts: 'mori' },

  // Qualities / Adjectives
  'grande': { display: '/ˈɡɾan.de/', ipa: 'ˈɡɾan.de', tts: 'grande' },
  'mikre': { display: '/ˈmik.ɾe/', ipa: 'ˈmik.ɾe', tts: 'mikre' },
  'nove': { display: '/ˈno.ve/', ipa: 'ˈno.ve', tts: 'nove' },
  'vece': { display: '/ˈve.tʃe/', ipa: 'ˈve.tʃe', tts: 'vece' },
  'rapide': { display: '/ɾaˈpi.de/', ipa: 'ɾaˈpi.de', tts: 'rapide' },
  'lente': { display: '/ˈlen.te/', ipa: 'ˈlen.te', tts: 'lente' },
  'forte': { display: '/ˈfoɾ.te/', ipa: 'ˈfoɾ.te', tts: 'forte' },
  'debile': { display: '/deˈbi.le/', ipa: 'deˈbi.le', tts: 'debile' },
  'bela': { display: '/ˈbe.la/', ipa: 'ˈbe.la', tts: 'bela' },
  'vera': { display: '/ˈve.ɾa/', ipa: 'ˈve.ɾa', tts: 'vera' },
  'justa': { display: '/ˈdʒus.ta/', ipa: 'ˈdʒus.ta', tts: 'justa' },
  'libe': { display: '/ˈli.be/', ipa: 'ˈli.be', tts: 'libe' },
  'kalma': { display: '/ˈkal.ma/', ipa: 'ˈkal.ma', tts: 'kalma' },
  'profunda': { display: '/pɾoˈfun.da/', ipa: 'pɾoˈfun.da', tts: 'profunda' },
  'alta': { display: '/ˈal.ta/', ipa: 'ˈal.ta', tts: 'alta' },
  'basa': { display: '/ˈba.sa/', ipa: 'ˈba.sa', tts: 'basa' },
  'larga': { display: '/ˈlaɾ.ɡa/', ipa: 'ˈlaɾ.ɡa', tts: 'larga' },
  'streta': { display: '/ˈstɾe.ta/', ipa: 'ˈstɾe.ta', tts: 'streta' },

  // Body Parts
  'moso': { display: '/ˈmo.so/', ipa: 'ˈmo.so', tts: 'moso' },
  'miso': { display: '/ˈmi.so/', ipa: 'ˈmi.so', tts: 'miso' },
  'mito': { display: '/ˈmi.to/', ipa: 'ˈmi.to', tts: 'mito' },
  'diko': { display: '/ˈdi.ko/', ipa: 'ˈdi.ko', tts: 'diko' },
  'kanda': { display: '/ˈkan.da/', ipa: 'ˈkan.da', tts: 'kanda' },
  'poda': { display: '/ˈpo.da/', ipa: 'ˈpo.da', tts: 'poda' },
  'tuka': { display: '/ˈtu.ka/', ipa: 'ˈtu.ka', tts: 'tuka' },
  'boho': { display: '/ˈbo.ho/', ipa: 'ˈbo.ho', tts: 'boho' },
  'pema': { display: '/ˈpe.ma/', ipa: 'ˈpe.ma', tts: 'pema' },
  'nasa': { display: '/ˈna.sa/', ipa: 'ˈna.sa', tts: 'nasa' },
  'boka': { display: '/ˈbo.ka/', ipa: 'ˈbo.ka', tts: 'boka' },

  // Home & Society
  'dombo': { display: '/ˈdom.bo/', ipa: 'ˈdom.bo', tts: 'dombo' },
  'dula': { display: '/ˈdu.la/', ipa: 'ˈdu.la', tts: 'dula' },
  'feka': { display: '/ˈfe.ka/', ipa: 'ˈfe.ka', tts: 'feka' },
  'sinda': { display: '/ˈsin.da/', ipa: 'ˈsin.da', tts: 'sinda' },
  'biya': { display: '/ˈbi.ja/', ipa: 'ˈbi.ja', tts: 'biya' },
  'fura': { display: '/ˈfu.ɾa/', ipa: 'ˈfu.ɾa', tts: 'fura' },
  'cai': { display: '/ˈtʃa.i/', ipa: 'ˈtʃa.i', tts: 'cai' },
  'sowi': { display: '/ˈso.wi/', ipa: 'ˈso.wi', tts: 'sowi' },
  'dulu': { display: '/ˈdu.lu/', ipa: 'ˈdu.lu', tts: 'dulu' },
  'kova': { display: '/ˈko.va/', ipa: 'ˈko.va', tts: 'kova' },
  'rega': { display: '/ˈɾe.ɡa/', ipa: 'ˈɾe.ɡa', tts: 'rega' },
  'fide': { display: '/ˈfi.de/', ipa: 'ˈfi.de', tts: 'fide' },
  'komuna': { display: '/koˈmu.na/', ipa: 'koˈmu.na', tts: 'komuna' },
  'konsilo': { display: '/konˈsi.lo/', ipa: 'konˈsi.lo', tts: 'konsilo' },
  'yowe': { display: '/ˈjo.we/', ipa: 'ˈjo.we', tts: 'yowe' },
  'tayo': { display: '/ˈta.jo/', ipa: 'ˈta.jo', tts: 'tayo' },
  'imazi': { display: '/iˈma.zi/', ipa: 'iˈma.zi', tts: 'imazi' },
  'dolari': { display: '/doˈla.ɾi/', ipa: 'doˈla.ɾi', tts: 'dolari' },

  // Nature & Elements
  'mwe': { display: '/mwe/', ipa: 'mwe', tts: 'mwe' },
  'tamwe': { display: '/ˈtam.we/', ipa: 'ˈtam.we', tts: 'tamwe' },
  'seva': { display: '/ˈse.va/', ipa: 'ˈse.va', tts: 'seva' },
  'lira': { display: '/ˈli.ɾa/', ipa: 'ˈli.ɾa', tts: 'lira' },
  'tere': { display: '/ˈte.ɾe/', ipa: 'ˈte.ɾe', tts: 'tere' },
  'dovu': { display: '/ˈdo.vu/', ipa: 'ˈdo.vu', tts: 'dovu' },
  'pota': { display: '/ˈpo.ta/', ipa: 'ˈpo.ta', tts: 'pota' },
  'tanoc': { display: '/ˈta.notʃ/', ipa: 'ˈta.notʃ', tts: 'tanoc' },
  'tawinya': { display: '/taˈwi.ɲa/', ipa: 'taˈwi.ɲa', tts: 'tawinya' },
  'tondra': { display: '/ˈton.dɾa/', ipa: 'ˈton.dɾa', tts: 'tondra' },
  'aurora': { display: '/a.uˈɾo.ɾa/', ipa: 'a.uˈɾo.ɾa', tts: 'aurora' },

  // Animals
  'ngbo': { display: '/ŋ͡ɡbo/', ipa: 'ŋ͡ɡbo', tts: 'ngbo' },
  'nyau': { display: '/ˈɲa.u/', ipa: 'ˈɲa.u', tts: 'nyau' },
  'koko': { display: '/ˈko.ko/', ipa: 'ˈko.ko', tts: 'koko' },
  'sisi': { display: '/ˈsi.si/', ipa: 'ˈsi.si', tts: 'sisi' },
  'tembo': { display: '/ˈtem.bo/', ipa: 'ˈtem.bo', tts: 'tembo' },
  'mbo': { display: '/ᵐbo/', ipa: 'ᵐbo', tts: 'mbo' },
  'leona': { display: '/leˈo.na/', ipa: 'leˈo.na', tts: 'leona' },

  // Numbers & Math
  'nul': { display: '/nul/', ipa: 'nul', tts: 'nul' },
  'un': { display: '/un/', ipa: 'un', tts: 'un' },
  'du': { display: '/du/', ipa: 'du', tts: 'du' },
  'tri': { display: '/tɾi/', ipa: 'tɾi', tts: 'tri' },
  'kwa': { display: '/kwa/', ipa: 'kwa', tts: 'kwa' },
  'pen': { display: '/pen/', ipa: 'pen', tts: 'pen' },
  'sek': { display: '/sek/', ipa: 'sek', tts: 'sek' },
  'sep': { display: '/sep/', ipa: 'sep', tts: 'sep' },
  'ok': { display: '/ok/', ipa: 'ok', tts: 'ok' },
  'nov': { display: '/nov/', ipa: 'nov', tts: 'nov' },
  'dek': { display: '/dek/', ipa: 'dek', tts: 'dek' },
  'deka': { display: '/ˈde.ka/', ipa: 'ˈde.ka', tts: 'deka' },
  'cent': { display: '/tʃent/', ipa: 'tʃent', tts: 'cent' },
  'mil': { display: '/mil/', ipa: 'mil', tts: 'mil' },
  'plus': { display: '/plus/', ipa: 'plus', tts: 'plus' },
  'minus': { display: '/ˈmi.nus/', ipa: 'ˈmi.nus', tts: 'minus' },
  'multi': { display: '/ˈmul.ti/', ipa: 'ˈmul.ti', tts: 'multi' },
  'divi': { display: '/ˈdi.vi/', ipa: 'ˈdi.vi', tts: 'divi' },
  'sama': { display: '/ˈsa.ma/', ipa: 'ˈsa.ma', tts: 'sama' },

  // Particles, Evidentials & Conjunctions
  'e': { display: '/e/', ipa: 'e', tts: 'e' },
  'o': { display: '/o/', ipa: 'o', tts: 'o' },
  'oxo': { display: '/ˈo.kso/', ipa: 'ˈo.kso', tts: 'oxo' },
  'ju': { display: '/dʒu/', ipa: 'dʒu', tts: 'ju' },
  'juta': { display: '/ˈdʒu.ta/', ipa: 'ˈdʒu.ta', tts: 'juta' },
  'ye': { display: '/je/', ipa: 'je', tts: 'ye' },
  'yoyu': { display: '/ˈjo.ju/', ipa: 'ˈjo.ju', tts: 'yoyu' },
  'sowa': { display: '/ˈso.wa/', ipa: 'ˈso.wa', tts: 'sowa' },
  'sowe': { display: '/ˈso.we/', ipa: 'ˈso.we', tts: 'sowe' },
  'sondo': { display: '/ˈson.do/', ipa: 'ˈson.do', tts: 'sondo' },
  'sodoa': { display: '/soˈdo.a/', ipa: 'soˈdo.a', tts: 'sodoa' },
  'sodeka': { display: '/soˈde.ka/', ipa: 'soˈde.ka', tts: 'sodeka' },
  'sovi': { display: '/ˈso.vi/', ipa: 'ˈso.vi', tts: 'sovi' },
  'pa': { display: '/pa/', ipa: 'pa', tts: 'pa' },
  'fu': { display: '/fu/', ipa: 'fu', tts: 'fu' },
  'le': { display: '/le/', ipa: 'le', tts: 'le' },
  'ko': { display: '/ko/', ipa: 'ko', tts: 'ko' },
  'kem': { display: '/kem/', ipa: 'kem', tts: 'kem' },
  'no': { display: '/no/', ipa: 'no', tts: 'no' },
  'kwe': { display: '/kwe/', ipa: 'kwe', tts: 'kwe' },
  'lonje': { display: '/ˈlon.dʒe/', ipa: 'ˈlon.dʒe', tts: 'lonje' },
  'mo': { display: '/mo/', ipa: 'mo', tts: 'mo' },
  'dola': { display: '/ˈdo.la/', ipa: 'ˈdo.la', tts: 'dola' },
  'pila': { display: '/ˈpi.la/', ipa: 'ˈpi.la', tts: 'pila' },
  'ma': { display: '/ma/', ipa: 'ma', tts: 'ma' },
  'sata': { display: '/ˈsa.ta/', ipa: 'ˈsa.ta', tts: 'sata' },
  'wina': { display: '/ˈwi.na/', ipa: 'ˈwi.na', tts: 'wina' },
  'natri': { display: '/ˈnat.ɾi/', ipa: 'ˈnat.ɾi', tts: 'natri' },
  'mini': { display: '/ˈmi.ni/', ipa: 'ˈmi.ni', tts: 'mini' },

  // Wisdom & Philosophy (Loanwords from Sanskrit/Chinese/Polynesian/Japanese)
  'tao': { display: '/ˈta.o/', ipa: 'ˈta.o', tts: 'tao' },
  'satya': { display: '/ˈsat.ja/', ipa: 'ˈsat.ja', tts: 'satya' },
  'karma': { display: '/ˈkaɾ.ma/', ipa: 'ˈkaɾ.ma', tts: 'karma' },
  'chi': { display: '/tʃi/', ipa: 'tʃi', tts: 'chi' },
  'mana': { display: '/ˈma.na/', ipa: 'ˈma.na', tts: 'mana' },
  'zen': { display: '/zen/', ipa: 'zen', tts: 'zen' },
  'joya': { display: '/ˈdʒo.ja/', ipa: 'ˈdʒo.ja', tts: 'joya' },
  'tresa': { display: '/ˈtɾe.sa/', ipa: 'ˈtɾe.sa', tts: 'tresa' },
  'pavo': { display: '/ˈpa.vo/', ipa: 'ˈpa.vo', tts: 'pavo' },
  'espa': { display: '/ˈes.pa/', ipa: 'ˈes.pa', tts: 'espa' },
  'memo': { display: '/ˈme.mo/', ipa: 'ˈme.mo', tts: 'memo' },
  'klara': { display: '/ˈkla.ɾa/', ipa: 'ˈkla.ɾa', tts: 'klara' },
};

/**
 * Converts a raw syllable into standard IPA symbols following SAGELO_COURSE.md:
 * - j -> /dʒ/ ("church, judge")
 * - ch, c -> /tʃ/
 * - sh -> /ʃ/
 * - ny -> /ɲ/ (Spanish ñ / canyon)
 * - r -> /ɾ/ (light flapped sound)
 * - g -> /ɡ/ (always hard g)
 * - y -> /j/
 * - prenasal stops nd -> /ⁿd/, mb -> /ᵐb/, mp -> /ᵐp/, ng -> /ŋɡ/
 */
export function sylToIpa(syl: string): string {
  let s = syl.toLowerCase();
  let onset = '';

  if (s.startsWith('nd')) { onset = 'ⁿd'; s = s.slice(2); }
  else if (s.startsWith('mb')) { onset = 'ᵐb'; s = s.slice(2); }
  else if (s.startsWith('mp')) { onset = 'ᵐp'; s = s.slice(2); }
  else if (s.startsWith('ng')) { onset = 'ŋɡ'; s = s.slice(2); }
  else if (s.startsWith('nz')) { onset = 'ⁿz'; s = s.slice(2); }
  else if (s.startsWith('mv')) { onset = 'ᶬv'; s = s.slice(2); }
  else if (s.startsWith('ch')) { onset = 'tʃ'; s = s.slice(2); }
  else if (s.startsWith('sh')) { onset = 'ʃ'; s = s.slice(2); }
  else if (s.startsWith('ny')) { onset = 'ɲ'; s = s.slice(2); }
  else if (s.startsWith('c')) { onset = 'tʃ'; s = s.slice(1); }
  else if (s.startsWith('j')) { onset = 'dʒ'; s = s.slice(1); }
  else if (s.startsWith('g')) { onset = 'ɡ'; s = s.slice(1); }
  else if (s.startsWith('r')) { onset = 'ɾ'; s = s.slice(1); }
  else if (s.startsWith('y')) { onset = 'j'; s = s.slice(1); }
  else {
    const c = s.match(/^(?:skr|str|spr|mw|[bcdfghjklmnprstvwyz][rlw]?|[bcdfghjklmnprstvwyz])/);
    if (c) {
      onset = c[0]
        .replace(/y/g, 'j')
        .replace(/g/g, 'ɡ')
        .replace(/r/g, 'ɾ')
        .replace(/c/g, 'tʃ');
      s = s.slice(c[0].length);
    }
  }

  const rest = s
    .replace(/ng/g, 'ŋɡ')
    .replace(/g/g, 'ɡ')
    .replace(/r/g, 'ɾ')
    .replace(/y/g, 'j')
    .replace(/c$/g, 'tʃ');

  return onset + rest;
}

/**
 * Phonetically parses a single Sagelo word using standard International Phonetic Alphabet (IPA).
 * Enforces the universal penultimate stress rule from Chapter 3:
 * "Stress (which syllable you say slightly louder and longer) always falls on the
 * second-to-last syllable of a word — a rule with no exceptions"
 */
export function getWordPhonetic(rawWord: string): PhoneticData {
  const clean = rawWord
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z]/g, '');

  if (!clean) {
    return { display: `/${rawWord}/`, ipa: rawWord, tts: rawWord };
  }

  // 1. Direct dictionary match
  if (SAGELO_PHONETIC_MAP[clean]) {
    return SAGELO_PHONETIC_MAP[clean];
  }

  // 2. Prefixed Bantu noun class checks (mi- for plural, ki- for tool, lu- for feeling, sa- for place, ta- for time, na- for numbers, we- for action)
  const prefixes = [
    { p: 'mi', ipa: 'mi' },
    { p: 'ki', ipa: 'ki' },
    { p: 'lu', ipa: 'lu' },
    { p: 'sa', ipa: 'sa' },
    { p: 'ta', ipa: 'ta' },
    { p: 'na', ipa: 'na' },
    { p: 'we', ipa: 'we' },
  ];

  for (const { p, ipa: pIpa } of prefixes) {
    if (clean.startsWith(p) && clean.length > p.length + 1) {
      const rest = clean.slice(p.length);
      if (SAGELO_PHONETIC_MAP[rest]) {
        const base = SAGELO_PHONETIC_MAP[rest];
        const rawBaseIpa = base.ipa.replace(/[ˈ.]/g, '');
        // When prefixed, compute penultimate stress on the whole compound:
        const combinedClean = clean;
        const syllRegex = /(?:ch|sh|ny|mb|nd|ng|mv|nz|mw|skr|str|spr|[bcdfghjklmnprstvwyz][rlw]?|[bcdfghjklmnprstvwyz])?(?:[aeiouáéíóú])(?:(?:m|n|r|l|k|t|s|p|d|c|g|z|f|b)(?=$|[^aeiouáéíóú]))?/gi;
        const matches = combinedClean.match(syllRegex) || [p, rest];
        const ipaSyls = matches.map(sylToIpa);
        const stressedIdx = ipaSyls.length > 1 ? ipaSyls.length - 2 : 0;
        let combinedIpa = '';
        ipaSyls.forEach((s, idx) => {
          if (idx === stressedIdx && ipaSyls.length > 1) {
            combinedIpa += (idx > 0 ? '.' : '') + 'ˈ' + s;
          } else if (idx > 0) {
            combinedIpa += '.' + s;
          } else {
            combinedIpa += s;
          }
        });
        return {
          display: `/${combinedIpa}/`,
          ipa: combinedIpa,
          tts: clean,
        };
      }
    }
  }

  // 3. Algorithmic Syllabification & IPA Transcription
  const syllRegex = /(?:ch|sh|ny|mb|nd|ng|mv|nz|mw|skr|str|spr|[bcdfghjklmnprstvwyz][rlw]?|[bcdfghjklmnprstvwyz])?(?:[aeiouáéíóú])(?:(?:m|n|r|l|k|t|s|p|d|c|g|z|f|b)(?=$|[^aeiouáéíóú]))?/gi;
  let matches = clean.match(syllRegex);
  if (!matches || matches.join('').length !== clean.length) {
    const broad = /(?:ch|sh|ny|mb|nd|ng|mv|nz|mw|skr|str|spr|[bcdfghjklmnprstvwyz][rlw]?|[bcdfghjklmnprstvwyz])?(?:[aeiouáéíóú]+)(?:(?:m|n|r|l|k|t|s|p|d|c|g|z|f|b)(?=$|[^aeiouáéíóú]))?/gi;
    matches = clean.match(broad);
  }
  const syllables = (matches && matches.join('').length === clean.length) ? matches : [clean];

  const ipaSyls = syllables.map(sylToIpa);
  const stressedIdx = ipaSyls.length > 1 ? ipaSyls.length - 2 : 0;

  let ipaFormatted = '';
  ipaSyls.forEach((s, idx) => {
    if (idx === stressedIdx && ipaSyls.length > 1) {
      ipaFormatted += (idx > 0 ? '.' : '') + 'ˈ' + s;
    } else if (idx > 0) {
      ipaFormatted += '.' + s;
    } else {
      ipaFormatted += s;
    }
  });

  return {
    display: `/${ipaFormatted}/`,
    ipa: ipaFormatted,
    tts: clean,
  };
}

/**
 * Returns the complete phrase transcribed in standard IPA notation.
 * Example: "Shanti, ndeko!" -> "/ˈʃan.ti, ˈⁿde.ko!/"
 */
export function getPhrasePhoneticDisplay(phrase: string): string {
  if (!phrase) return '';
  const tokens = phrase.trim().split(/\s+/);
  const ipaTokens = tokens.map((token) => {
    const punctBefore = token.match(/^[.,!?;:"'“”()—]+/)?.[0] || '';
    const punctAfter = token.match(/[.,!?;:"'“”()—]+$/)?.[0] || '';
    const cleanWord = token.replace(/^[.,!?;:"'“”()—]+|[.,!?;:"'“”()—]+$/g, '');
    if (!cleanWord) return token;
    const p = getWordPhonetic(cleanWord);
    const rawIpa = p.ipa || p.display.replace(/[\/\[\]]/g, '');
    return `${punctBefore}${rawIpa}${punctAfter}`;
  });
  return `/${ipaTokens.join(' ')}/`;
}

/**
 * Converts a Sagelo phrase into engine-ready phonetic speech text.
 * Passes clean words with hyphenated syllable boundaries for words ending in 'e'
 * so that English system voices do not swallow final open vowels, while preserving
 * authentic pronunciation for Swahili, Spanish, and Italian voices.
 */
export function toPhoneticTtsText(phrase: string): string {
  if (!phrase) return '';
  const words = phrase.trim().split(/\s+/);
  const ttsWords = words.map((w) => {
    const punct = w.match(/[.,!?;:"]+$/)?.[0] || '';
    const cleanWord = w.replace(/[.,!?;:"'“”]/g, '').trim();
    if (!cleanWord) return w;
    // For single syllable words or standard open words
    const p = getWordPhonetic(cleanWord);
    return (p.tts || cleanWord) + punct;
  });
  return ttsWords.join(' ');
}

/**
 * Tokenizes a paragraph or passage into word tokens and punctuation,
 * each with individual IPA phonetic annotations for interactive display & tap-to-speak.
 */
export function parsePhoneticTokens(text: string): PhoneticWordToken[] {
  if (!text) return [];
  const regex = /([a-zA-ZáéíóúÁÉÍÓÚ]+)|([^a-zA-ZáéíóúÁÉÍÓÚ\s]+)|(\s+)/g;
  const tokens: PhoneticWordToken[] = [];
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    const raw = match[0];
    if (match[1]) {
      // It is a word token
      const phon = getWordPhonetic(raw);
      tokens.push({
        original: raw,
        clean: raw.toLowerCase(),
        isWord: true,
        phoneticDisplay: phon.display,
        phoneticIpa: phon.ipa,
        phoneticTts: phon.tts,
      });
    } else {
      // Punctuation or whitespace
      tokens.push({
        original: raw,
        clean: '',
        isWord: false,
      });
    }
  }

  return tokens;
}
