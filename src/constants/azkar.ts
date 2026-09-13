export interface AzkarItem {
  id: string;
  title: string;
  surahNumber?: string;
  sourceUrl?: string;
  arabic: string;
  transliteration: string;
  translation: string;
  audioUrl: string;
  duration: string;
  category: 'fatiha' | 'kursi' | 'duha' | 'ikhlas' | 'falaq' | 'nas';
}

export const DAILY_AZKAR: AzkarItem[] = [
  {
    id: '1',
    title: 'Surah Al-Fatiha (The Opening & Healing)',
    surahNumber: 'Surah 1 (Complete)',
    sourceUrl: 'https://quran.com/1',
    arabic: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ ۝ الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ ۝ الرَّحْمَٰنِ الرَّحِيمِ ۝ مَالِكِ يَوْمِ الدِّينِ ۝ إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ ۝ اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ ۝ صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ',
    transliteration: 'Bismillahir-Rahmanir-Rahim. Al-hamdu lillahi Rabbil-\'alamin. Ar-Rahmanir-Rahim. Maliki yawmid-din. Iyyaka na\'budu wa iyyaka nasta\'in. Ihdinas-siratal-mustaqim. Siratal-ladhina an\'amta \'alayhim, ghayril-maghdubi \'alayhim wa lad-dallin.',
    translation: 'In the name of Allah, the Entirely Merciful, the Especially Merciful. All praise is due to Allah, Lord of the worlds. The Entirely Merciful, the Especially Merciful. Sovereign of the Day of Recompense. It is You we worship and You we ask for help. Guide us to the straight path - The path of those upon whom You have bestowed favor, not of those who have evoked [Your] anger or of those who are astray.',
    audioUrl: 'https://server8.mp3quran.net/afs/001.mp3', // Full Surah 1 by Mishary Alafasy
    duration: '0:42',
    category: 'fatiha',
  },
  {
    id: '2',
    title: 'Ayat al-Kursi (The Throne Verse - Ultimate Protection)',
    surahNumber: 'Surah Al-Baqarah (2:255)',
    sourceUrl: 'https://quran.com/2/255',
    arabic: 'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَن ذَا الَّذِي يَشْفَعُ عِندَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ',
    transliteration: 'Allahu la ilaha illa Huwal-Hayyul-Qayyum. La ta\'khudhuhu sinatuw-wa la nawm. Lahu ma fis-samawati wa ma fil-ard. Man dhal-ladhi yashfa\'u \'indahu illa bi-idhnih. Ya\'lamu ma bayna aydihim wa ma khalfahum, wa la yuhituna bishay\'im-min \'ilmihi illa bima sha\'a. Wasi\'a kursiyyuhus-samawati wal-ard, wa la ya\'uduhu hifzuhuma, wa Huwal-\'Aliyyul-\'Azim.',
    translation: 'Allah! There is no deity except Him, the Ever-Living, the Sustainer of all existence. Neither drowsiness overtakes Him nor sleep. To Him belongs whatever is in the heavens and whatever is on the earth. Who is it that can intercede with Him except by His permission? He knows what is before them and what will be after them, and they encompass not a thing of His knowledge except for what He wills. His Kursi extends over the heavens and the earth, and their preservation tires Him not. And He is the Most High, the Most Great.',
    audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/262.mp3', // Ayat al-Kursi by Mishary Alafasy
    duration: '1:06',
    category: 'kursi',
  },
  {
    id: '3',
    title: 'Surah Ad-Duha (The Morning Brightness & Solace)',
    surahNumber: 'Surah 93 (Complete)',
    sourceUrl: 'https://quran.com/93',
    arabic: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ ۝ وَالضُّحَىٰ ۝ وَاللَّيْلِ إِذَا سَجَىٰ ۝ مَا وَدَّعَكَ رَبُّكَ وَمَا قَلَىٰ ۝ وَلَلْآخِرَةُ خَيْرٌ لَّكَ مِنَ الْأُولَىٰ ۝ وَلَسَوْفَ يُعْطِيكَ رَبُّكَ فَتَرْضَىٰ ۝ أَلَمْ يَجِدْكَ يَتِيمًا فَآوَىٰ ۝ وَوَجَدَكَ ضَالًّا فَهَدَىٰ ۝ وَوَجَدَكَ عَائِلًا فَأَغْنَىٰ ۝ فَأَمَّا الْيَتِيمَ فَلَا تَقْهَرْ ۝ وَأَمَّا السَّائِلَ فَلَا تَنْهَرْ ۝ وَأَمَّا بِنِعْمَةِ رَبِّكَ فَحَدِّثْ',
    transliteration: 'Bismillahir-Rahmanir-Rahim. Wad-duha. Wal-layli idha saja. Ma wadda\'aka Rabbuka wa ma qala. Wa lal-akhiratu khayrul-laka minal-ula. Wa la-sawfa yu\'tika Rabbuka fatarda. Alam yajidka yatiman fa-awa. Wa wajadaka dallan fahada. Wa wajadaka \'a\'ilan fa-aghna. Fa-ammal-yatima fala taqhar. Wa ammas-sa\'ila fala tanhar. Wa amma bi-ni\'mati Rabbika fahaddith.',
    translation: 'In the name of Allah, the Entirely Merciful, the Especially Merciful. By the morning brightness. And [by] the night when it covers with darkness. Your Lord has not taken leave of you, [O Muhammad], nor has He detested [you]. And the Hereafter is better for you than the first [life]. And your Lord is going to give you, and you will be satisfied. Did He not find you an orphan and give [you] refuge? And He found you lost and guided [you]. And He found you poor and made [you] self-sufficient. So as for the orphan, do not oppress [him]. And as for the petitioner, do not repel [him]. But as for the favor of your Lord, report [it].',
    audioUrl: 'https://server8.mp3quran.net/afs/093.mp3', // Full Surah 93 by Mishary Alafasy
    duration: '1:05',
    category: 'duha',
  },
  {
    id: '4',
    title: 'Surah Al-Ikhlas (Purity of Faith & Oneness)',
    surahNumber: 'Surah 112 (Complete)',
    sourceUrl: 'https://quran.com/112',
    arabic: 'قُلْ هُوَ اللَّهُ أَحَدٌ ۝ اللَّهُ الصَّمَدُ ۝ لَمْ يَلِدْ وَلَمْ يُولَدْ ۝ وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ',
    transliteration: 'Qul Huw-Allahu Ahad. Allahus-Samad. Lam yalid wa lam yulad. Wa lam yakun lahu kufuwan ahad.',
    translation: 'Say: He is Allah, [who is] One. Allah, the Eternal Refuge. He neither begets nor is born, Nor is there to Him any equivalent.',
    audioUrl: 'https://server8.mp3quran.net/afs/112.mp3', // Full Surah 112 by Mishary Alafasy
    duration: '0:22',
    category: 'ikhlas',
  },
  {
    id: '5',
    title: 'Surah Al-Falaq (Seeking Refuge from Harm)',
    surahNumber: 'Surah 113 (Complete)',
    sourceUrl: 'https://quran.com/113',
    arabic: 'قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ ۝ مِن شَرِّ مَا خَلَقَ ۝ وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ ۝ وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ ۝ وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ',
    transliteration: 'Qul a\'udhu bi-Rabbil-falaq. Min sharri ma khalaq. Wa min sharri ghasiqin idha waqab. Wa min sharrin-naffathati fil-\'uqad. Wa min sharri hasidin idha hasad.',
    translation: 'Say: I seek refuge in the Lord of daybreak. From the evil of that which He created. And from the evil of darkness when it settles. And from the evil of the blowers in knots. And from the evil of an envier when he envies.',
    audioUrl: 'https://server8.mp3quran.net/afs/113.mp3', // Full Surah 113 by Mishary Alafasy
    duration: '0:31',
    category: 'falaq',
  },
  {
    id: '6',
    title: 'Surah An-Nas (Seeking Refuge from Whispers & Doubts)',
    surahNumber: 'Surah 114 (Complete)',
    sourceUrl: 'https://quran.com/114',
    arabic: 'قُلْ أَعُوذُ بِرَبِّ النَّاسِ ۝ مَلِكِ النَّاسِ ۝ إِلَٰهِ النَّاسِ ۝ مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ ۝ الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ ۝ مِنَ الْجِنَّةِ وَالنَّاسِ',
    transliteration: 'Qul a\'udhu bi-Rabbin-nas. Malikin-nas. Ilahin-nas. Min sharril-waswasil-khannas. Alladhi yuwaswisu fi sudurin-nas. Minal-jinnati wan-nas.',
    translation: 'Say: I seek refuge in the Lord of mankind, The Sovereign of mankind. The God of mankind, From the evil of the retreating whisperer - Who whispers [evil] into the breasts of mankind - From among the jinn and mankind.',
    audioUrl: 'https://server8.mp3quran.net/afs/114.mp3', // Full Surah 114 by Mishary Alafasy
    duration: '0:38',
    category: 'nas',
  },
];

export const DAILY_AFFIRMATIONS = [
  "Take things one breath at a time. Allah is closer than your jugular vein.",
  "You don't have to carry every thought. Notice it, breathe, and let it pass gently.",
  "Small consistent steps are loved by Allah. Be kind to yourself today.",
  "Peace comes from trusting the journey. You are safe in this moment.",
  "Your heart deserves tranquility. Ease your mind and release tension."
];
