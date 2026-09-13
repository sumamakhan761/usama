export interface AzkarItem {
  id: string;
  title: string;
  surahNumber?: string;
  sourceUrl?: string;
  arabic: string;
  translation: string;
  audioUrl: string;
  duration: string;
  category: 'fatiha' | 'ikhlas' | 'falaq' | 'nas' | 'kursi' | 'duha' | 'rahman';
}

export const DAILY_AZKAR: AzkarItem[] = [
  // 1. Surah Al-Fatiha
  {
    id: '1',
    title: 'Surah Al-Fatiha (The Opening & Healing)',
    surahNumber: 'Surah 1 (Complete)',
    arabic: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ ۝ الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ ۝ الرَّحْمَٰنِ الرَّحِيمِ ۝ مَالِكِ يَوْمِ الدِّينِ ۝ إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ ۝ اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ ۝ صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ',
    translation: 'In the name of Allah, the Entirely Merciful, the Especially Merciful. All praise is due to Allah, Lord of the worlds. The Entirely Merciful, the Especially Merciful. Sovereign of the Day of Recompense. It is You we worship and You we ask for help. Guide us to the straight path - The path of those upon whom You have bestowed favor, not of those who have evoked [Your] anger or of those who are astray.',
    audioUrl: 'https://server8.mp3quran.net/afs/001.mp3', // Full Surah 1 by Mishary Alafasy
    duration: '0:42',
    category: 'fatiha',
  },
  // 2. Surah Al-Ikhlas
  {
    id: '2',
    title: 'Surah Al-Ikhlas (Purity of Faith & Oneness)',
    surahNumber: 'Surah 112 (Complete)',
    arabic: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ ۝ قُلْ هُوَ اللَّهُ أَحَدٌ ۝ اللَّهُ الصَّمَدُ ۝ لَمْ يَلِدْ وَلَمْ يُولَدْ ۝ وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ',
    translation: 'In the name of Allah, the Entirely Merciful, the Especially Merciful. Say: He is Allah, [who is] One. Allah, the Eternal Refuge. He neither begets nor is born, Nor is there to Him any equivalent.',
    audioUrl: 'https://server8.mp3quran.net/afs/112.mp3', // Full Surah 112 by Mishary Alafasy
    duration: '0:22',
    category: 'ikhlas',
  },
  // 3. Surah Al-Falaq
  {
    id: '3',
    title: 'Surah Al-Falaq (Seeking Refuge from Harm)',
    surahNumber: 'Surah 113 (Complete)',
    arabic: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ ۝ قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ ۝ مِن شَرِّ مَا خَلَقَ ۝ وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ ۝ وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ ۝ وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ',
    translation: 'In the name of Allah, the Entirely Merciful, the Especially Merciful. Say: I seek refuge in the Lord of daybreak. From the evil of that which He created. And from the evil of darkness when it settles. And from the evil of the blowers in knots. And from the evil of an envier when he envies.',
    audioUrl: 'https://server8.mp3quran.net/afs/113.mp3', // Full Surah 113 by Mishary Alafasy
    duration: '0:31',
    category: 'falaq',
  },
  // 4. Surah An-Nas
  {
    id: '4',
    title: 'Surah An-Nas (Seeking Refuge from Whispers & Doubts)',
    surahNumber: 'Surah 114 (Complete)',
    arabic: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ ۝ قُلْ أَعُوذُ بِرَبِّ النَّاسِ ۝ مَلِكِ النَّاسِ ۝ إِلَٰهِ النَّاسِ ۝ مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ ۝ الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ ۝ مِنَ الْجِنَّةِ وَالنَّاسِ',
    translation: 'In the name of Allah, the Entirely Merciful, the Especially Merciful. Say: I seek refuge in the Lord of mankind, The Sovereign of mankind. The God of mankind, From the evil of the retreating whisperer - Who whispers [evil] into the breasts of mankind - From among the jinn and mankind.',
    audioUrl: 'https://server8.mp3quran.net/afs/114.mp3', // Full Surah 114 by Mishary Alafasy
    duration: '0:38',
    category: 'nas',
  },
  // 5. Ayat al-Kursi
  {
    id: '5',
    title: 'Ayat al-Kursi (The Throne Verse - Ultimate Protection)',
    surahNumber: 'Surah Al-Baqarah (2:255)',
    arabic: 'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَن ذَا الَّذِي يَشْفَعُ عِندَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ',
    translation: 'Allah! There is no deity except Him, the Ever-Living, the Sustainer of all existence. Neither drowsiness overtakes Him nor sleep. To Him belongs whatever is in the heavens and whatever is on the earth. Who is it that can intercede with Him except by His permission? He knows what is before them and what will be after them, and they encompass not a thing of His knowledge except for what He wills. His Kursi extends over the heavens and the earth, and their preservation tires Him not. And He is the Most High, the Most Great.',
    audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/262.mp3', // Ayat al-Kursi by Mishary Alafasy
    duration: '1:06',
    category: 'kursi',
  },
  // 6. Surah Ad-Duha
  {
    id: '6',
    title: 'Surah Ad-Duha (The Morning Brightness & Solace)',
    surahNumber: 'Surah 93 (Complete)',
    arabic: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ ۝ وَالضُّحَىٰ ۝ وَاللَّيْلِ إِذَا سَجَىٰ ۝ مَا وَدَّعَكَ رَبُّكَ وَمَا قَلَىٰ ۝ وَلَلْآخِرَةُ خَيْرٌ لَّكَ مِنَ الْأُولَىٰ ۝ وَلَسَوْفَ يُعْطِيكَ رَبُّكَ فَتَرْضَىٰ ۝ أَلَمْ يَجِدْكَ يَتِيمًا فَآوَىٰ ۝ وَوَجَدَكَ ضَالًّا فَهَدَىٰ ۝ وَوَجَدَكَ عَائِلًا فَأَغْنَىٰ ۝ فَأَمَّا الْيَتِيمَ فَلَا تَقْهَرْ ۝ وَأَمَّا السَّائِلَ فَلَا تَنْهَرْ ۝ وَأَمَّا بِنِعْمَةِ رَبِّكَ فَحَدِّثْ',
    translation: 'In the name of Allah, the Entirely Merciful, the Especially Merciful. By the morning brightness. And [by] the night when it covers with darkness. Your Lord has not taken leave of you, [O Muhammad], nor has He detested [you]. And the Hereafter is better for you than the first [life]. And your Lord is going to give you, and you will be satisfied. Did He not find you an orphan and give [you] refuge? And He found you lost and guided [you]. And He found you poor and made [you] self-sufficient. So as for the orphan, do not oppress [him]. And as for the petitioner, do not repel [him]. But as for the favor of your Lord, report [it].',
    audioUrl: 'https://server8.mp3quran.net/afs/093.mp3', // Full Surah 93 by Mishary Alafasy
    duration: '1:05',
    category: 'duha',
  },
  // 7. Surah Ar-Rahman
  {
    id: '7',
    title: 'Surah Ar-Rahman (The Most Merciful & Divine Favors)',
    surahNumber: 'Surah 55 (Complete)',
    arabic: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ ۝ الرَّحْمَٰنُ ۝ عَلَّمَ الْقُرْآنَ ۝ خَلَقَ الْإِنسَانَ ۝ عَلَّمَهُ الْبَيَانَ ۝ الشَّمْسُ وَالْقَمَرُ بِحُسْبَانٍ ۝ وَالنَّجْمُ وَالشَّجَرُ يَسْجُدَانِ ۝ وَالسَّمَاءَ رَفَعَهَا وَوَضَعَ الْمِيزَانَ ۝ أَلَّا تَطْغَوْا فِي الْمِيزَانِ ۝ وَأَقِيمُوا الْوَزْنَ بِالْقِسْطِ وَلَا تُخْسِرُوا الْمِيزَانَ ۝ وَالْأَرْضَ وَضَعَهَا لِلْأَنَامِ ۝ فِيهَا فَاكِهَةٌ وَالنَّخْلُ ذَاتُ الْأَكْمَامِ ۝ وَالْحَبُّ ذُو الْعَصْفِ وَالرَّيْحَانُ ۝ فَبِأَيِّ آلَاءِ رَبِّكُمَا تُكَذِّبَانِ ۝ خَلَقَ الْإِنسَانَ مِن صَلْصَالٍ كَالْفَخَّارِ ۝ وَخَلَقَ الْجَانَّ مِن مَّارِجٍ مِّن نَّارٍ ۝ فَبِأَيِّ آلَاءِ رَبِّكُمَا تُكَذِّبَانِ ۝ رَبُّ الْمَشْرِقَيْنِ وَرَبُّ الْمَغْرِبَيْنِ ۝ فَبِأَيِّ آلَاءِ رَبِّكُمَا تُكَذِّبَانِ ۝ مَرَجَ الْبَحْرَيْنِ يَلْتَقِيَانِ ۝ بَيْنَهُمَا بَرْزَخٌ لَّا يَبْغِيَانِ ۝ فَبِأَيِّ آلَاءِ رَبِّكُمَا تُكَذِّبَانِ ۝ يَخْرُجُ مِنْهُمَا اللُّؤْلُؤُ وَالْمَرْجَانُ ۝ فَبِأَيِّ آلَاءِ رَبِّكُمَا تُكَذِّبَانِ ۝ وَلَهُ الْجَوَارِ الْمُنشَآتُ فِي الْبَحْرِ كَالْأَعْلَامِ ۝ فَبِأَيِّ آلَاءِ رَبِّكُمَا تُكَذِّبَانِ ۝ كُلُّ مَنْ عَلَيْهَا فَانٍ ۝ وَيَبْقَىٰ وَجْهُ رَبِّكَ ذُو الْجَلَالِ وَالْإِكْرَامِ ۝ فَبِأَيِّ آلَاءِ رَبِّكُمَا تُكَذِّبَانِ ۝ يَسْأَلُهُ مَن فِي السَّمَاوَاتِ وَالْأَرْضِ ۚ كُلَّ يَوْمٍ هُوَ فِي شَأْنٍ ۝ فَبِأَيِّ آلَاءِ رَبِّكُمَا تُكَذِّبَانِ ۝ سَنَفْرُغُ لَكُمْ أَيُّهَ الثَّقَلَانِ ۝ فَبِأَيِّ آلَاءِ رَبِّكُمَا تُكَذِّبَانِ ۝ يَا مَعْشَرَ الْجِنِّ وَالْإِنسِ إِنِ اسْتَطَعْتُمْ أَن تَنفُذُوا مِنْ أَقْطَارِ السَّمَاوَاتِ وَالْأَرْضِ فَانفُذُوا ۚ لَا تَنفُذُونَ إِلَّا بِسُلْطَانٍ ۝ فَبِأَيِّ آلَاءِ رَبِّكُمَا تُكَذِّبَانِ ۝ يُرْسَلُ عَلَيْكُمَا شُوَاظٌ مِّن نَّارٍ وَنُحَاسٌ فَلَا تَنتَصِرَانِ ۝ فَبِأَيِّ آلَاءِ رَبِّكُمَا تُكَذِّبَانِ ۝ فَإِذَا انشَقَّتِ السَّمَاءُ فَكَانَتْ وَرْدَةً كَالدِّهَانِ ۝ فَبِأَيِّ آلَاءِ رَبِّكُمَا تُكَذِّبَانِ ۝ فَيَوْمَئِذٍ لَّا يُسْأَلُ عَن ذَنبِهِ إِنسٌ وَلَا جَانٌّ ۝ فَبِأَيِّ آلَاءِ رَبِّكُمَا تُكَذِّبَانِ ۝ يُعْرَفُ الْمُجْرِمُونَ بِسِيمَاهُمْ فَيُؤْخَذُ بِالنَّوَاصِي وَالْأَقْدَامِ ۝ فَبِأَيِّ آلَاءِ رَبِّكُمَا تُكَذِّبَانِ ۝ هَٰذِهِ جَهَنَّمُ الَّتِي يُكَذِّبُ بِهَا الْمُجْرِمُونَ ۝ يَطُوفُونَ بَيْنَهَا وَبَيْنَ حَمِيمٍ آنٍ ۝ فَبِأَيِّ آلَاءِ رَبِّكُمَا تُكَذِّبَانِ ۝ وَلِمَنْ خَافَ مَقَامَ رَبِّهِ جَنَّتَانِ ۝ فَبِأَيِّ آلَاءِ رَبِّكُمَا تُكَذِّبَانِ ۝ ذَوَاتَا أَفْنَانٍ ۝ فَبِأَيِّ آلَاءِ رَبِّكُمَا تُكَذِّبَانِ ۝ فِيهِمَا عَيْنَانِ تَجْرِيَانِ ۝ فَبِأَيِّ آلَاءِ رَبِّكُمَا تُكَذِّبَانِ ۝ فِيهِمَا مِن كُلِّ فَاكِهَةٍ زَوْجَانِ ۝ فَبِأَيِّ آلَاءِ رَبِّكُمَا تُكَذِّبَانِ ۝ مُتَّكِئِينَ عَلَىٰ فُرُشٍ بَطَائِنُهَا مِنْ إِسْتَبْرَقٍ ۚ وَجَنَى الْجَنَّتَيْنِ دَانٍ ۝ فَبِأَيِّ آلَاءِ رَبِّكُمَا تُكَذِّبَانِ ۝ فِيهِنَّ قَاصِرَاتُ الطَّرْفِ لَمْ يَطْمِثْهُنَّ إِنسٌ قَبْلَهُمْ وَلَا جَانٌّ ۝ فَبِأَيِّ آلَاءِ رَبِّكُمَا تُكَذِّبَانِ ۝ كَأَنَّهُنَّ الْيَاقُوتُ وَالْمَرْجَانُ ۝ فَبِأَيِّ آلَاءِ رَبِّكُمَا تُكَذِّبَانِ ۝ هَلْ جَزَاءُ الْإِحْسَانِ إِلَّا الْإِحْسَانُ ۝ فَبِأَيِّ آلَاءِ رَبِّكُمَا تُكَذِّبَانِ ۝ وَمِن دُونِهِمَا جَنَّتَانِ ۝ فَبِأَيِّ آلَاءِ رَبِّكُمَا تُكَذِّبَانِ ۝ مُدْهَامَّتَانِ ۝ فَبِأَيِّ آلَاءِ رَبِّكُمَا تُكَذِّبَانِ ۝ فِيهِمَا عَيْنَانِ نَضَّاخَتَانِ ۝ فَبِأَيِّ آلَاءِ رَبِّكُمَا تُكَذِّبَانِ ۝ فِيهِمَا فَاكِهَةٌ وَنَخْلٌ وَرُمَّانٌ ۝ فَبِأَيِّ آلَاءِ رَبِّكُمَا تُكَذِّبَانِ ۝ فِيهِنَّ خَيْرَاتٌ حِسَانٌ ۝ فَبِأَيِّ آلَاءِ رَبِّكُمَا تُكَذِّبَانِ ۝ حُورٌ مَّقْصُورَاتٌ فِي الْخِيَامِ ۝ فَبِأَيِّ آلَاءِ رَبِّكُمَا تُكَذِّبَانِ ۝ لَمْ يَطْمِثْهُنَّ إِنسٌ قَبْلَهُمْ وَلَا جَانٌّ ۝ فَبِأَيِّ آلَاءِ رَبِّكُمَا تُكَذِّبَانِ ۝ مُتَّكِئِينَ عَلَىٰ رَفْرَفٍ خُضْرٍ وَعَبْقَرِيٍّ حِسَانٍ ۝ فَبِأَيِّ آلَاءِ رَبِّكُمَا تُكَذِّبَانِ ۝ تَبَارَكَ اسْمُ رَبِّكَ ذِي الْجَلَالِ وَالْإِكْرَامِ',
    translation: 'In the name of Allah, the Entirely Merciful, the Especially Merciful. The Most Merciful. Taught the Qur\'an, Created man, [And] taught him eloquence. The sun and the moon [move] by precise calculation, And the stars and trees prostrate. And the heaven He raised and imposed the balance, That you not transgress within the balance. And establish weight in justice and do not make deficient the balance. And the earth He laid [out] for the creatures. Therein is fruit and palm trees having sheaths [of dates], And grain having husks and scented plants. So which of the favors of your Lord would you deny? He created man from clay like that of pottery. And He created the jinn from a smokeless flame of fire. So which of the favors of your Lord would you deny? [He is] Lord of the two sunrises and Lord of the two sunsets. So which of the favors of your Lord would you deny? He released the two seas, meeting [side by side]; Between them is a barrier [so] neither of them transgresses. So which of the favors of your Lord would you deny? From both of them emerge pearl and coral. So which of the favors of your Lord would you deny? And to Him belong the ships elevated in the sea like mountains. So which of the favors of your Lord would you deny? Everyone upon the earth will perish, And there will remain the Face of your Lord, Owner of Majesty and Honor. So which of the favors of your Lord would you deny? Whoever is in the heavens and earth asks Him; every day He is bringing about a matter. So which of the favors of your Lord would you deny? We will attend to you, O prominent beings. So which of the favors of your Lord would you deny? O company of jinn and mankind, if you are able to pass beyond the regions of the heavens and the earth, then pass. You will not pass except by authority. So which of the favors of your Lord would you deny? There will be sent upon you a flame of fire and smoke, and you will not defend yourselves. So which of the favors of your Lord would you deny? And when the heaven is split open and becomes rose-colored like oil. So which of the favors of your Lord would you deny? Then on that Day none will be asked about his sin among men or jinn. So which of the favors of your Lord would you deny? The criminals will be known by their marks, and they will be seized by the forelocks and the feet. So which of the favors of your Lord would you deny? This is Hell, which the criminals deny. They will go around between it and scalding water, heated [to the utmost degree]. So which of the favors of your Lord would you deny? But for he who has feared the position of his Lord are two gardens - So which of the favors of your Lord would you deny? Having [spreading] branches. So which of the favors of your Lord would you deny? In both of them are two springs, flowing. So which of the favors of your Lord would you deny? In both of them are of every fruit two kinds. So which of the favors of your Lord would you deny? [They are] reclining on beds whose linings are of silk brocade, and the fruit of the two gardens is hanging low. So which of the favors of your Lord would you deny? In them are women limiting [their] glances, untouched before them by man or jinni - So which of the favors of your Lord would you deny? As if they were rubies and coral. So which of the favors of your Lord would you deny? Is the reward for good [anything] but good? So which of the favors of your Lord would you deny? And below them both are two [other] gardens - So which of the favors of your Lord would you deny? Dark green [in color]. So which of the favors of your Lord would you deny? In both of them are two springs, spouting. So which of the favors of your Lord would you deny? In both of them are fruit and palm trees and pomegranates. So which of the favors of your Lord would you deny? In them are good and beautiful women - So which of the favors of your Lord would you deny? Fair ones reserved in pavilions - So which of the favors of your Lord would you deny? Untouched before them by man or jinni - So which of the favors of your Lord would you deny? Reclining on green cushions and beautiful fine carpets. So which of the favors of your Lord would you deny? Blessed is the name of your Lord, Owner of Majesty and Honor.',
    audioUrl: 'https://server8.mp3quran.net/afs/055.mp3', // Full Surah 55 by Mishary Alafasy
    duration: '16:03',
    category: 'rahman',
  },
];

export const DAILY_AFFIRMATIONS = [
  "Take things one breath at a time. Allah is closer than your jugular vein.",
  "You don't have to carry every thought. Notice it, breathe, and let it pass gently.",
  "Small consistent steps are loved by Allah. Be kind to yourself today.",
  "Peace comes from trusting the journey. You are safe in this moment.",
  "Your heart deserves tranquility. Ease your mind and release tension."
];
