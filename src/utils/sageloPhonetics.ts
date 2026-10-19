// Sagelo / Sango Phonetic Transliteration & Pronunciation Engine
// African Bantu Cardinal Vowel (a=[ah], e=[eh], i=[ee], o=[oh], u=[oo]) & Prenasalized Consonant Engine

export interface PhoneticData {
  display: string; // Standard IPA phonetic transcription enclosed in slashes, e.g. "/ˈʃan.ti/", "/saˈɡe.lo/"
  ipa: string;     // Raw IPA symbols without boundary slashes, e.g. "ˈʃan.ti"
  tts: string;     // Phonetic speech respelling fed to audio engine, e.g. "shahn tee"
}

export interface PhoneticWordToken {
  original: string;
  clean: string;
  isWord: boolean;
  phoneticDisplay?: string; // Standard IPA format, e.g. "/ˈʃan.ti/"
  phoneticIpa?: string;     // Raw IPA symbols, e.g. "ˈʃan.ti"
  phoneticTts?: string;     // Spoken speech string, e.g. "shahn tee"
}

/**
 * Curated dictionary of authentic Sagelo roots, loanwords, and frequent phrases
 * Based on Sango / Central African Bantu vowel phonology
 */
export const SAGELO_PHONETIC_MAP: Record<string, PhoneticData> = {
  // Greetings & Core Philosophy
  'shanti': { display: '/ˈʃan.ti/', ipa: 'ˈʃan.ti', tts: 'shahn tee' },
  'shanti ye': { display: '/ˈʃan.ti je/', ipa: 'ˈʃan.ti je', tts: 'shahn tee yeh' },
  'shanti ndeko': { display: '/ˈʃan.ti ˈⁿde.ko/', ipa: 'ˈʃan.ti ˈⁿde.ko', tts: 'shahn tee en deh koh' },
  'oni': { display: '/ˈo.ni/', ipa: 'ˈo.ni', tts: 'oh nee' },
  'yo': { display: '/jo/', ipa: 'jo', tts: 'yoh' },
  'yu': { display: '/ju/', ipa: 'ju', tts: 'yoo' },
  'da': { display: '/da/', ipa: 'da', tts: 'dah' },
  'nu': { display: '/nu/', ipa: 'nu', tts: 'noo' },
  'mu': { display: '/mu/', ipa: 'mu', tts: 'moo' },
  'wa': { display: '/wa/', ipa: 'wa', tts: 'wah' },
  'ta': { display: '/ta/', ipa: 'ta', tts: 'tah' },
  'vi': { display: '/vi/', ipa: 'vi', tts: 'vee' },
  'sim': { display: '/sim/', ipa: 'sim', tts: 'seem' },
  'ni': { display: '/ni/', ipa: 'ni', tts: 'nee' },
  'ha': { display: '/ha/', ipa: 'ha', tts: 'hah' },
  'ra': { display: '/ra/', ipa: 'ra', tts: 'rah' },
  'si': { display: '/si/', ipa: 'si', tts: 'see' },
  'hu': { display: '/hu/', ipa: 'hu', tts: 'hoo' },
  'kel': { display: '/kel/', ipa: 'kel', tts: 'kehl' },
  'sofa': { display: '/ˈso.fa/', ipa: 'ˈso.fa', tts: 'soh fah' },
  'dira': { display: '/ˈdi.ra/', ipa: 'ˈdi.ra', tts: 'dee rah' },
  'cho': { display: '/tʃo/', ipa: 'tʃo', tts: 'choh' },
  'ndo': { display: '/ⁿdo/', ipa: 'ⁿdo', tts: 'en doh' },
  'doa': { display: '/ˈdo.a/', ipa: 'ˈdo.a', tts: 'doh ah' },
  'kura': { display: '/ˈku.ra/', ipa: 'ˈku.ra', tts: 'koo rah' },
  'bono': { display: '/ˈbo.no/', ipa: 'ˈbo.no', tts: 'boh noh' },
  'afrilingo': { display: '/af.riˈlin.ɡo/', ipa: 'af.riˈlin.ɡo', tts: 'ah free leen goh' },
  'sagelo': { display: '/saˈɡe.lo/', ipa: 'saˈɡe.lo', tts: 'sah geh loh' },
  'sango': { display: '/ˈsan.ɡo/', ipa: 'ˈsan.ɡo', tts: 'sahn goh' },
  'bantu': { display: '/ˈban.tu/', ipa: 'ˈban.tu', tts: 'bahn too' },
  'lingala': { display: '/linˈɡa.la/', ipa: 'linˈɡa.la', tts: 'leen gah lah' },
  'lonkundo': { display: '/lonˈkun.do/', ipa: 'lonˈkun.do', tts: 'lohn koon doh' },

  // Root sag (wisdom / know)
  'sag': { display: '/saɡ/', ipa: 'saɡ', tts: 'sahg' },
  'saga': { display: '/ˈsa.ɡa/', ipa: 'ˈsa.ɡa', tts: 'sah gah' },
  'sage': { display: '/ˈsa.ɡe/', ipa: 'ˈsa.ɡe', tts: 'sah geh' },
  'sagi': { display: '/ˈsa.ɡi/', ipa: 'ˈsa.ɡi', tts: 'sah gee' },
  'sago': { display: '/ˈsa.ɡo/', ipa: 'ˈsa.ɡo', tts: 'sah goh' },
  'sagu': { display: '/ˈsa.ɡu/', ipa: 'ˈsa.ɡu', tts: 'sah goo' },
  'sagari': { display: '/saˈɡa.ri/', ipa: 'saˈɡa.ri', tts: 'sah gah ree' },
  'sagem': { display: '/ˈsa.ɡem/', ipa: 'ˈsa.ɡem', tts: 'sah gehm' },
  'sage vi': { display: '/ˈsa.ɡe vi/', ipa: 'ˈsa.ɡe vi', tts: 'sah geh vee' },
  'sasagu': { display: '/saˈsa.ɡu/', ipa: 'saˈsa.ɡu', tts: 'sah sah goo' },
  'wesagi': { display: '/weˈsa.ɡi/', ipa: 'weˈsa.ɡi', tts: 'weh sah gee' },

  // Root lum (light / shine)
  'lum': { display: '/lum/', ipa: 'lum', tts: 'loom' },
  'luma': { display: '/ˈlu.ma/', ipa: 'ˈlu.ma', tts: 'loo mah' },
  'lume': { display: '/ˈlu.me/', ipa: 'ˈlu.me', tts: 'loo meh' },
  'lumi': { display: '/ˈlu.mi/', ipa: 'ˈlu.mi', tts: 'loo mee' },
  'lumo': { display: '/ˈlu.mo/', ipa: 'ˈlu.mo', tts: 'loo moh' },
  'lumu': { display: '/ˈlu.mu/', ipa: 'ˈlu.mu', tts: 'loo moo' },
  'kiluma': { display: '/kiˈlu.ma/', ipa: 'kiˈlu.ma', tts: 'kee loo mah' },

  // Root kor (heart / feeling)
  'kor': { display: '/kor/', ipa: 'kor', tts: 'kohr' },
  'kora': { display: '/ˈko.ra/', ipa: 'ˈko.ra', tts: 'koh rah' },
  'kore': { display: '/ˈko.re/', ipa: 'ˈko.re', tts: 'koh reh' },
  'kori': { display: '/ˈko.ri/', ipa: 'ˈko.ri', tts: 'koh ree' },
  'koro': { display: '/ˈko.ro/', ipa: 'ˈko.ro', tts: 'koh roh' },
  'koru': { display: '/ˈko.ru/', ipa: 'ˈko.ru', tts: 'koh roo' },
  'kore vi': { display: '/ˈko.re vi/', ipa: 'ˈko.re vi', tts: 'koh reh vee' },
  'lukora': { display: '/luˈko.ra/', ipa: 'luˈko.ra', tts: 'loo koh rah' },

  // Nature roots (wai, jua, mun, fon, sil)
  'wai': { display: '/ˈwa.i/', ipa: 'ˈwa.i', tts: 'wah ee' },
  'waia': { display: '/waˈi.a/', ipa: 'waˈi.a', tts: 'wah ee ah' },
  'waie': { display: '/waˈi.e/', ipa: 'waˈi.e', tts: 'wah ee eh' },
  'waii': { display: '/waˈi.i/', ipa: 'waˈi.i', tts: 'wah ee ee' },
  'waio': { display: '/waˈi.o/', ipa: 'waˈi.o', tts: 'wah ee oh' },
  'waiu': { display: '/waˈi.u/', ipa: 'waˈi.u', tts: 'wah ee oo' },

  'jua': { display: '/ˈʒu.a/', ipa: 'ˈʒu.a', tts: 'joo ah' },
  'juaa': { display: '/ʒuˈa.a/', ipa: 'ʒuˈa.a', tts: 'joo ah ah' },
  'juae': { display: '/ʒuˈa.e/', ipa: 'ʒuˈa.e', tts: 'joo ah eh' },
  'juai': { display: '/ʒuˈa.i/', ipa: 'ʒuˈa.i', tts: 'joo ah ee' },
  'juao': { display: '/ʒuˈa.o/', ipa: 'ʒuˈa.o', tts: 'joo ah oh' },
  'tajua': { display: '/taˈʒu.a/', ipa: 'taˈʒu.a', tts: 'tah joo ah' },

  'mun': { display: '/mun/', ipa: 'mun', tts: 'moon' },
  'muna': { display: '/ˈmu.na/', ipa: 'ˈmu.na', tts: 'moo nah' },
  'mune': { display: '/ˈmu.ne/', ipa: 'ˈmu.ne', tts: 'moo neh' },
  'muni': { display: '/ˈmu.ni/', ipa: 'ˈmu.ni', tts: 'moo nee' },

  'fon': { display: '/fon/', ipa: 'fon', tts: 'fohn' },
  'fona': { display: '/ˈfo.na/', ipa: 'ˈfo.na', tts: 'foh nah' },
  'fone': { display: '/ˈfo.ne/', ipa: 'ˈfo.ne', tts: 'foh neh' },
  'foni': { display: '/ˈfo.ni/', ipa: 'ˈfo.ni', tts: 'foh nee' },
  'fono': { display: '/ˈfo.no/', ipa: 'ˈfo.no', tts: 'foh noh' },
  'fonu': { display: '/ˈfo.nu/', ipa: 'ˈfo.nu', tts: 'foh noo' },

  'sil': { display: '/sil/', ipa: 'sil', tts: 'seel' },
  'sila': { display: '/ˈsi.la/', ipa: 'ˈsi.la', tts: 'see lah' },
  'sile': { display: '/ˈsi.le/', ipa: 'ˈsi.le', tts: 'see leh' },
  'sili': { display: '/ˈsi.li/', ipa: 'ˈsi.li', tts: 'see lee' },
  'silo': { display: '/ˈsi.lo/', ipa: 'ˈsi.lo', tts: 'see loh' },
  'silu': { display: '/ˈsi.lu/', ipa: 'ˈsi.lu', tts: 'see loo' },

  // Bantu Kinship Loanwords
  'mwana': { display: '/ˈmwa.na/', ipa: 'ˈmwa.na', tts: 'mwah nah' },
  'mimwana': { display: '/mimˈwa.na/', ipa: 'mimˈwa.na', tts: 'meem wah nah' },
  'ndeko': { display: '/ˈⁿde.ko/', ipa: 'ˈⁿde.ko', tts: 'en deh koh' },
  'mindeko': { display: '/minˈde.ko/', ipa: 'minˈde.ko', tts: 'meen deh koh' },
  'mpaka': { display: '/ᵐpaka/', ipa: 'ᵐpaka', tts: 'em pah kah' },
  'mimpaka': { display: '/mimˈpa.ka/', ipa: 'mimˈpa.ka', tts: 'meem pah kah' },
  'nyango': { display: '/ˈɲan.ɡo/', ipa: 'ˈɲan.ɡo', tts: 'nyahn goh' },
  'tata': { display: '/ˈta.ta/', ipa: 'ˈta.ta', tts: 'tah tah' },
  'nemwa': { display: '/ˈnem.wa/', ipa: 'ˈnem.wa', tts: 'nehm wah' },
  'dumwe': { display: '/ˈdum.we/', ipa: 'ˈdum.we', tts: 'doom weh' },

  // Common Verbs
  'voli': { display: '/ˈvo.li/', ipa: 'ˈvo.li', tts: 'voh lee' },
  'wendi': { display: '/ˈwen.di/', ipa: 'ˈwen.di', tts: 'wehn dee' },
  'kandi': { display: '/ˈkan.di/', ipa: 'ˈkan.di', tts: 'kahn dee' },
  'veni': { display: '/ˈve.ni/', ipa: 'ˈve.ni', tts: 'veh nee' },
  'doni': { display: '/ˈdo.ni/', ipa: 'ˈdo.ni', tts: 'doh nee' },
  'bori': { display: '/ˈbo.ri/', ipa: 'ˈbo.ri', tts: 'boh ree' },
  'fasi': { display: '/ˈfa.si/', ipa: 'ˈfa.si', tts: 'fah see' },
  'fasari': { display: '/faˈsa.ri/', ipa: 'faˈsa.ri', tts: 'fah sah ree' },
  'kari': { display: '/ˈka.ri/', ipa: 'ˈka.ri', tts: 'kah ree' },
  'audi': { display: '/aˈu.di/', ipa: 'aˈu.di', tts: 'ow dee' },
  'tanji': { display: '/ˈtan.ʒi/', ipa: 'ˈtan.ʒi', tts: 'tahn jee' },
  'ridi': { display: '/ˈri.di/', ipa: 'ˈri.di', tts: 'ree dee' },
  'pensi': { display: '/ˈpen.si/', ipa: 'ˈpen.si', tts: 'pehn see' },
  'pensari': { display: '/penˈsa.ri/', ipa: 'penˈsa.ri', tts: 'pehn sah ree' },
  'lerni': { display: '/ˈler.ni/', ipa: 'ˈler.ni', tts: 'lehr nee' },
  'loni': { display: '/ˈlo.ni/', ipa: 'ˈlo.ni', tts: 'loh nee' },
  'sani': { display: '/ˈsa.ni/', ipa: 'ˈsa.ni', tts: 'sah nee' },
  'sanari': { display: '/saˈna.ri/', ipa: 'saˈna.ri', tts: 'sah nah ree' },
  'dubi': { display: '/ˈdu.bi/', ipa: 'ˈdu.bi', tts: 'doo bee' },
  'skrivi': { display: '/ˈskri.vi/', ipa: 'ˈskri.vi', tts: 'skree vee' },
  'skrivari': { display: '/skriˈva.ri/', ipa: 'skriˈva.ri', tts: 'skree vah ree' },
  'mori': { display: '/ˈmo.ri/', ipa: 'ˈmo.ri', tts: 'moh ree' },

  // Qualities / Adjectives
  'grande': { display: '/ˈɡran.de/', ipa: 'ˈɡran.de', tts: 'grahn deh' },
  'mikre': { display: '/ˈmik.re/', ipa: 'ˈmik.re', tts: 'mee kreh' },
  'nove': { display: '/ˈno.ve/', ipa: 'ˈno.ve', tts: 'noh veh' },
  'vece': { display: '/ˈve.tʃe/', ipa: 'ˈve.tʃe', tts: 'veh cheh' },
  'rapide': { display: '/raˈpi.de/', ipa: 'raˈpi.de', tts: 'rah pee deh' },
  'lente': { display: '/ˈlen.te/', ipa: 'ˈlen.te', tts: 'lehn teh' },
  'forte': { display: '/ˈfor.te/', ipa: 'ˈfor.te', tts: 'fohr teh' },
  'debile': { display: '/deˈbi.le/', ipa: 'deˈbi.le', tts: 'deh bee leh' },
  'bela': { display: '/ˈbe.la/', ipa: 'ˈbe.la', tts: 'beh lah' },
  'vera': { display: '/ˈve.ra/', ipa: 'ˈve.ra', tts: 'veh rah' },
  'justa': { display: '/ˈʒus.ta/', ipa: 'ˈʒus.ta', tts: 'zhoos tah' },
  'libe': { display: '/ˈli.be/', ipa: 'ˈli.be', tts: 'lee beh' },
  'kalma': { display: '/ˈkal.ma/', ipa: 'ˈkal.ma', tts: 'kahl mah' },
  'profunda': { display: '/proˈfun.da/', ipa: 'proˈfun.da', tts: 'proh foon dah' },
  'alta': { display: '/ˈal.ta/', ipa: 'ˈal.ta', tts: 'ahl tah' },
  'basa': { display: '/ˈba.sa/', ipa: 'ˈba.sa', tts: 'bah sah' },
  'larga': { display: '/ˈlar.ɡa/', ipa: 'ˈlar.ɡa', tts: 'lahr gah' },
  'streta': { display: '/ˈstre.ta/', ipa: 'ˈstre.ta', tts: 'streh tah' },

  // Body Parts
  'moso': { display: '/ˈmo.so/', ipa: 'ˈmo.so', tts: 'moh soh' },
  'miso': { display: '/ˈmi.so/', ipa: 'ˈmi.so', tts: 'mee soh' },
  'mito': { display: '/ˈmi.to/', ipa: 'ˈmi.to', tts: 'mee toh' },
  'diko': { display: '/ˈdi.ko/', ipa: 'ˈdi.ko', tts: 'dee koh' },
  'kanda': { display: '/ˈkan.da/', ipa: 'ˈkan.da', tts: 'kahn dah' },
  'poda': { display: '/ˈpo.da/', ipa: 'ˈpo.da', tts: 'poh dah' },
  'tuka': { display: '/ˈtu.ka/', ipa: 'ˈtu.ka', tts: 'too kah' },
  'boho': { display: '/ˈbo.ho/', ipa: 'ˈbo.ho', tts: 'boh hoh' },
  'pema': { display: '/ˈpe.ma/', ipa: 'ˈpe.ma', tts: 'peh mah' },
  'nasa': { display: '/ˈna.sa/', ipa: 'ˈna.sa', tts: 'nah sah' },
  'boka': { display: '/ˈbo.ka/', ipa: 'ˈbo.ka', tts: 'boh kah' },

  // Home & Society
  'dombo': { display: '/ˈdom.bo/', ipa: 'ˈdom.bo', tts: 'dohm boh' },
  'dula': { display: '/ˈdu.la/', ipa: 'ˈdu.la', tts: 'doo lah' },
  'feka': { display: '/ˈfe.ka/', ipa: 'ˈfe.ka', tts: 'feh kah' },
  'sinda': { display: '/ˈsin.da/', ipa: 'ˈsin.da', tts: 'seen dah' },
  'biya': { display: '/ˈbi.ja/', ipa: 'ˈbi.ja', tts: 'bee yah' },
  'fura': { display: '/ˈfu.ra/', ipa: 'ˈfu.ra', tts: 'foo rah' },
  'cai': { display: '/ˈtʃa.i/', ipa: 'ˈtʃa.i', tts: 'chah ee' },
  'sowi': { display: '/ˈso.wi/', ipa: 'ˈso.wi', tts: 'soh wee' },
  'dulu': { display: '/ˈdu.lu/', ipa: 'ˈdu.lu', tts: 'doo loo' },
  'kova': { display: '/ˈko.va/', ipa: 'ˈko.va', tts: 'koh vah' },
  'rega': { display: '/ˈre.ɡa/', ipa: 'ˈre.ɡa', tts: 'reh gah' },
  'fide': { display: '/ˈfi.de/', ipa: 'ˈfi.de', tts: 'fee deh' },
  'komuna': { display: '/koˈmu.na/', ipa: 'koˈmu.na', tts: 'koh moo nah' },
  'konsilo': { display: '/konˈsi.lo/', ipa: 'konˈsi.lo', tts: 'kohn see loh' },
  'yowe': { display: '/ˈjo.we/', ipa: 'ˈjo.we', tts: 'yoh weh' },
  'tayo': { display: '/ˈta.jo/', ipa: 'ˈta.jo', tts: 'tah yoh' },
  'imazi': { display: '/iˈma.zi/', ipa: 'iˈma.zi', tts: 'ee mah zee' },
  'dolari': { display: '/doˈla.ri/', ipa: 'doˈla.ri', tts: 'doh lah ree' },

  // Nature & Elements
  'mwe': { display: '/mwe/', ipa: 'mwe', tts: 'mweh' },
  'tamwe': { display: '/ˈtam.we/', ipa: 'ˈtam.we', tts: 'tah mweh' },
  'seva': { display: '/ˈse.va/', ipa: 'ˈse.va', tts: 'seh vah' },
  'lira': { display: '/ˈli.ra/', ipa: 'ˈli.ra', tts: 'lee rah' },
  'tere': { display: '/ˈte.re/', ipa: 'ˈte.re', tts: 'teh reh' },
  'dovu': { display: '/ˈdo.vu/', ipa: 'ˈdo.vu', tts: 'doh voo' },
  'pota': { display: '/ˈpo.ta/', ipa: 'ˈpo.ta', tts: 'poh tah' },
  'tanoc': { display: '/ˈta.notʃ/', ipa: 'ˈta.notʃ', tts: 'tah nohch' },
  'tawinya': { display: '/taˈwin.ja/', ipa: 'taˈwin.ja', tts: 'tah ween yah' },
  'tondra': { display: '/ˈton.dra/', ipa: 'ˈton.dra', tts: 'tohn drah' },
  'aurora': { display: '/a.uˈro.ra/', ipa: 'a.uˈro.ra', tts: 'ow roh rah' },

  // Animals
  'ngbo': { display: '/ŋɡbo/', ipa: 'ŋɡbo', tts: 'eng boh' },
  'nyau': { display: '/ˈɲa.u/', ipa: 'ˈɲa.u', tts: 'nyah oo' },
  'koko': { display: '/ˈko.ko/', ipa: 'ˈko.ko', tts: 'koh koh' },
  'sisi': { display: '/ˈsi.si/', ipa: 'ˈsi.si', tts: 'see see' },
  'tembo': { display: '/ˈtem.bo/', ipa: 'ˈtem.bo', tts: 'tehm boh' },
  'mbo': { display: '/ᵐbo/', ipa: 'ᵐbo', tts: 'em boh' },
  'leona': { display: '/leˈo.na/', ipa: 'leˈo.na', tts: 'leh oh nah' },

  // Numbers & Arithmetic
  'nul': { display: '/nul/', ipa: 'nul', tts: 'nool' },
  'un': { display: '/un/', ipa: 'un', tts: 'oon' },
  'du': { display: '/du/', ipa: 'du', tts: 'doo' },
  'tri': { display: '/tri/', ipa: 'tri', tts: 'tree' },
  'kwa': { display: '/kwa/', ipa: 'kwa', tts: 'kwah' },
  'pen': { display: '/pen/', ipa: 'pen', tts: 'pehn' },
  'sek': { display: '/sek/', ipa: 'sek', tts: 'sehk' },
  'sep': { display: '/sep/', ipa: 'sep', tts: 'sehp' },
  'ok': { display: '/ok/', ipa: 'ok', tts: 'ohk' },
  'nov': { display: '/nov/', ipa: 'nov', tts: 'nohv' },
  'dek': { display: '/dek/', ipa: 'dek', tts: 'dehk' },
  'deka': { display: '/ˈde.ka/', ipa: 'ˈde.ka', tts: 'deh kah' },
  'cent': { display: '/tʃent/', ipa: 'tʃent', tts: 'sehnt' },
  'mil': { display: '/mil/', ipa: 'mil', tts: 'meel' },
  'plus': { display: '/plus/', ipa: 'plus', tts: 'ploos' },
  'minus': { display: '/ˈmi.nus/', ipa: 'ˈmi.nus', tts: 'mee noos' },
  'multi': { display: '/ˈmul.ti/', ipa: 'ˈmul.ti', tts: 'mool tee' },
  'divi': { display: '/ˈdi.vi/', ipa: 'ˈdi.vi', tts: 'dee vee' },
  'sama': { display: '/ˈsa.ma/', ipa: 'ˈsa.ma', tts: 'sah mah' },

  // Particles, Evidentials & Conjunctions
  'e': { display: '/e/', ipa: 'e', tts: 'eh' },
  'o': { display: '/o/', ipa: 'o', tts: 'oh' },
  'oxo': { display: '/oxo/', ipa: 'oxo', tts: 'ohk soh' },
  'ju': { display: '/ʒu/', ipa: 'ʒu', tts: 'joo' },
  'juta': { display: '/ˈʒu.ta/', ipa: 'ˈʒu.ta', tts: 'joo tah' },
  'ye': { display: '/je/', ipa: 'je', tts: 'yeh' },
  'yoyu': { display: '/ˈjo.ju/', ipa: 'ˈjo.ju', tts: 'yoh yoo' },
  'sowa': { display: '/ˈso.wa/', ipa: 'ˈso.wa', tts: 'soh wah' },
  'sowe': { display: '/ˈso.we/', ipa: 'ˈso.we', tts: 'soh weh' },
  'sondo': { display: '/ˈson.do/', ipa: 'ˈson.do', tts: 'sohn doh' },
  'sodoa': { display: '/soˈdo.a/', ipa: 'soˈdo.a', tts: 'soh doh ah' },
  'sodeka': { display: '/soˈde.ka/', ipa: 'soˈde.ka', tts: 'soh deh kah' },
  'sovi': { display: '/ˈso.vi/', ipa: 'ˈso.vi', tts: 'soh vee' },
  'pa': { display: '/pa/', ipa: 'pa', tts: 'pah' },
  'fu': { display: '/fu/', ipa: 'fu', tts: 'foo' },
  'le': { display: '/le/', ipa: 'le', tts: 'leh' },
  'ko': { display: '/ko/', ipa: 'ko', tts: 'koh' },
  'kem': { display: '/kem/', ipa: 'kem', tts: 'kehm' },
  'no': { display: '/no/', ipa: 'no', tts: 'noh' },
  'kwe': { display: '/kwe/', ipa: 'kwe', tts: 'kweh' },
  'lonje': { display: '/ˈlon.ʒe/', ipa: 'ˈlon.ʒe', tts: 'lohn jeh' },
  'mo': { display: '/mo/', ipa: 'mo', tts: 'moh' },
  'dola': { display: '/ˈdo.la/', ipa: 'ˈdo.la', tts: 'doh lah' },
  'pila': { display: '/ˈpi.la/', ipa: 'ˈpi.la', tts: 'pee lah' },
  'ma': { display: '/ma/', ipa: 'ma', tts: 'mah' },
  'sata': { display: '/ˈsa.ta/', ipa: 'ˈsa.ta', tts: 'sah tah' },
  'wina': { display: '/ˈwi.na/', ipa: 'ˈwi.na', tts: 'wee nah' },
  'natri': { display: '/ˈnat.ri/', ipa: 'ˈnat.ri', tts: 'nah tree' },
  'mini': { display: '/ˈmi.ni/', ipa: 'ˈmi.ni', tts: 'mee nee' },

  // Wisdom & Philosophy
  'tao': { display: '/ˈta.o/', ipa: 'ˈta.o', tts: 'tah oh' },
  'satya': { display: '/ˈsat.ja/', ipa: 'ˈsat.ja', tts: 'saht yah' },
  'karma': { display: '/ˈkar.ma/', ipa: 'ˈkar.ma', tts: 'kahr mah' },
  'chi': { display: '/tʃi/', ipa: 'tʃi', tts: 'chee' },
  'mana': { display: '/ˈma.na/', ipa: 'ˈma.na', tts: 'mah nah' },
  'zen': { display: '/zen/', ipa: 'zen', tts: 'zehn' },
  'joya': { display: '/ˈʒo.ja/', ipa: 'ˈʒo.ja', tts: 'joh yah' },
  'tresa': { display: '/ˈtre.sa/', ipa: 'ˈtre.sa', tts: 'treh sah' },
  'pavo': { display: '/ˈpa.vo/', ipa: 'ˈpa.vo', tts: 'pah voh' },
  'espa': { display: '/ˈes.pa/', ipa: 'ˈes.pa', tts: 'ehs pah' },
  'memo': { display: '/ˈme.mo/', ipa: 'ˈme.mo', tts: 'meh moh' },
  'klara': { display: '/ˈkla.ra/', ipa: 'ˈkla.ra', tts: 'klah rah' },
};

/**
 * Converts a raw syllable into standard IPA symbols.
 */
function sylToIpa(syl: string): string {
  let s = syl;
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
  else if (s.startsWith('j')) { onset = 'ʒ'; s = s.slice(1); }
  else if (s.startsWith('y')) { onset = 'j'; s = s.slice(1); }
  else if (s.startsWith('g')) { onset = 'ɡ'; s = s.slice(1); }
  else {
    const c = s.match(/^(?:skr|str|spr|mw|[bcdfghjklmnprstvwyz][rlw]?|[bcdfghjklmnprstvwyz])/);
    if (c) {
      onset = c[0].replace(/y/g, 'j').replace(/g/g, 'ɡ');
      s = s.slice(c[0].length);
    }
  }
  const rest = s
    .replace(/ng/g, 'ŋɡ')
    .replace(/g/g, 'ɡ')
    .replace(/y/g, 'j')
    .replace(/c$/g, 'tʃ');
  return onset + rest;
}

/**
 * Phonetically parses a single Sagelo word using standard International Phonetic Alphabet (IPA)
 * with authentic Central African Bantu phonology (cardinal vowels /a, e, i, o, u/ and prenasalized stops).
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

  // 2. Prefixed Bantu noun class checks (mi- for plural, ki- for tool, lu- for collection, sa- for field)
  const prefixes = [
    { p: 'mi', ipa: 'mi', soundTts: 'mee' },
    { p: 'ki', ipa: 'ki', soundTts: 'kee' },
    { p: 'lu', ipa: 'lu', soundTts: 'loo' },
    { p: 'sa', ipa: 'sa', soundTts: 'sah' },
  ];

  for (const { p, ipa: pIpa, soundTts } of prefixes) {
    if (clean.startsWith(p) && clean.length > p.length + 1) {
      const rest = clean.slice(p.length);
      if (SAGELO_PHONETIC_MAP[rest]) {
        const base = SAGELO_PHONETIC_MAP[rest];
        const rawBaseIpa = base.ipa || base.display.replace(/[\/\[\]]/g, '');
        const combinedIpa = `${pIpa}.${rawBaseIpa}`;
        return {
          display: `/${combinedIpa}/`,
          ipa: combinedIpa,
          tts: `${soundTts} ${base.tts}`,
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

  // Build IPA syllables and TTS phonetic respellings
  const vowelTtsMap: Record<string, string> = {
    'aa': 'ah-ah', 'ee': 'eh-eh', 'ii': 'ee-ee', 'oo': 'oh-oh', 'uu': 'oo-oo',
    'ai': 'ah-ee', 'au': 'ah-oo', 'oi': 'oh-ee', 'ua': 'oo-ah', 'ue': 'oo-eh',
    'ui': 'oo-ee', 'io': 'ee-oh', 'ia': 'ee-ah',
    'a': 'ah', 'e': 'eh', 'i': 'ee', 'o': 'oh', 'u': 'oo',
  };

  const ipaSyls = syllables.map(sylToIpa);
  const stressedIdx = ipaSyls.length > 1 ? ipaSyls.length - 2 : 0;

  let ipaFormatted = '';
  ipaSyls.forEach((s, idx) => {
    if (idx === stressedIdx && ipaSyls.length > 1) {
      ipaFormatted += 'ˈ' + s;
    } else if (idx > 0) {
      ipaFormatted += '.' + s;
    } else {
      ipaFormatted += s;
    }
  });

  const ttsParts = syllables.map((syl) => {
    let s = syl;
    let onset = '';
    if (s.startsWith('nd')) { onset = 'en-d'; s = s.slice(2); }
    else if (s.startsWith('mb')) { onset = 'em-b'; s = s.slice(2); }
    else if (s.startsWith('mp')) { onset = 'em-p'; s = s.slice(2); }
    else if (s.startsWith('ng')) { onset = 'eng-'; s = s.slice(2); }
    else if (s.startsWith('nz')) { onset = 'en-z'; s = s.slice(2); }
    else if (s.startsWith('mv')) { onset = 'em-v'; s = s.slice(2); }
    else if (s.startsWith('ch')) { onset = 'ch'; s = s.slice(2); }
    else if (s.startsWith('c')) { onset = 'ch'; s = s.slice(1); }
    else if (s.startsWith('j')) { onset = 'zh'; s = s.slice(1); }
    else {
      const cons = s.match(/^(?:skr|str|spr|sh|ny|mw|[bcdfghjklmnprstvwyz][rlw]?|[bcdfghjklmnprstvwyz])/);
      if (cons) {
        onset = cons[0];
        s = s.slice(onset.length);
      }
    }
    const convertedVowels = s.replace(/aa|ee|ii|oo|uu|ai|au|oi|ua|ue|ui|io|ia|[aeiou]/gi, (m) => vowelTtsMap[m.toLowerCase()] || m);
    return onset + convertedVowels;
  });

  return {
    display: `/${ipaFormatted}/`,
    ipa: ipaFormatted,
    tts: ttsParts.join(' ').replace(/-/g, ' '),
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
 * Converts a Sagelo phrase into phonetic text specifically optimized for SpeechSynthesis TTS engines.
 * This guarantees that even English-accented system voices speak with African pure open vowels
 * instead of English silent 'e's and diphthongs!
 *
 * Example: "kore" -> "koh reh"
 * Example: "sage" -> "sah geh"
 * Example: "sila" -> "see lah"
 * Example: "waii" -> "wah ee ee"
 * Example: "ndeko" -> "en deh koh"
 */
export function toPhoneticTtsText(phrase: string): string {
  if (!phrase) return '';
  const words = phrase.trim().split(/\s+/);
  const ttsWords = words.map((w) => {
    const punct = w.match(/[.,!?;:"]+$/)?.[0] || '';
    const cleanWord = w.replace(/[.,!?;:"'“”]/g, '').trim();
    if (!cleanWord) return w;
    const p = getWordPhonetic(cleanWord);
    return p.tts + punct;
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
