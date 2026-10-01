export interface SampleScript {
  id: string;
  title: string;
  titleEn?: string;
  category: string;
  categoryZh: string;
  recommendedVoice: string;
  recommendedTone: string;
  recommendedSpeed: string;
  language: 'zh-TW' | 'en';
  text: string;
}

export const SAMPLE_SCRIPTS: SampleScript[] = [
  {
    id: 'tw-young-mother',
    title: '新手媽媽的溫柔私語 (搭配聲音設計預設)',
    titleEn: 'Young Mother Whispers (Matches Sound Design)',
    category: 'Sound Design Demo',
    categoryZh: '聲音設計示範',
    recommendedVoice: 'Kore',
    recommendedTone: 'tw_conversational',
    recommendedSpeed: 'tw_slow',
    language: 'zh-TW',
    text: `老公……你回來啦。今天醫生看過寶寶了，說他的體重有慢慢增加，如果這幾天都順利的話，下週我們就可以帶他回家了喔。

想到可以把他抱在懷裡、回到我們自己的家，心裡真的覺得好踏實…… 可是，我現在身體還是覺得好累、好沒有力氣。這幾天半夜餵奶跟換尿布，可能真的需要你多幫我分擔一些了。

等一下……我想先閉上眼睛休息一下下。有你在身邊陪著，我就覺得安心多了……`,
  },
  {
    id: 'tw-jiufen',
    title: '九份山城的雨後茶香',
    titleEn: 'Rainy Afternoon in Jiufen Mountain Town',
    category: 'Taiwanese Literary Story',
    categoryZh: '台灣文藝說書',
    recommendedVoice: 'Kore',
    recommendedTone: 'tw_storyteller',
    recommendedSpeed: 'tw_natural',
    language: 'zh-TW',
    text: `午後的一場陣雨剛停，山嵐輕柔地籠罩在九份依山而建的紅磚石階上。

沿著豎崎路慢慢拾級而上，木造老茶館裡飄散著炭焙烏龍的醇厚香氣。推開吱呀作響的木窗，遠方的基隆嶼隱沒在薄霧與湛藍的海面之間。老闆笑著端上一壺剛沖泡好的東方美人茶，輕聲說道：「下雨天喝這壺剛剛好，回甘特別甜喔。」`,
  },
  {
    id: 'tw-cafe-podcast',
    title: '台北巷弄裡的療癒咖啡廳',
    titleEn: 'Taipei Alleyway Cafe Chat',
    category: 'Taiwanese Casual Podcast',
    categoryZh: '親切日常 Podcast',
    recommendedVoice: 'Puck',
    recommendedTone: 'tw_podcast',
    recommendedSpeed: 'tw_natural',
    language: 'zh-TW',
    text: `哈囉大家！歡迎收聽今天的隨心漫步。你們週末通常都去哪裡放鬆呢？

今天我想跟大家分享一家藏在台北赤峰街巷子裡的私房咖啡店。一走進去，店裡播著低調溫柔的爵士樂，撲鼻而來的是現磨淺焙咖啡豆的花果香。點了一塊剛烤出爐的焦糖肉桂捲，外酥內軟，配上微苦的冰美式，真的超級享受的啦！大家有機會一定要去坐坐看喔！`,
  },
  {
    id: 'tw-tech-news',
    title: '台灣半導體與全球AI新浪潮',
    titleEn: 'Taiwan Semiconductor & AI Outlook',
    category: 'Taiwanese Professional Broadcast',
    categoryZh: '專業財經新聞',
    recommendedVoice: 'Charon',
    recommendedTone: 'tw_professional',
    recommendedSpeed: 'tw_natural',
    language: 'zh-TW',
    text: `早安，歡迎收聽晨間全球產業觀點。

隨著新一代生成式人工智慧與大型語言模型在邊緣運算裝置的快速普及，台灣先進晶圓代工與先進封裝生態鏈，持續展現無可取代的關鍵優勢。根據最新產業研調數據，高效能運算晶片的市場需求在第四季依舊強勁，為下半年的科技供應鏈注入了穩健的成長動能。`,
  },
  {
    id: 'tw-meditation',
    title: '晚安靜心：溫柔放下一整天的疲憊',
    titleEn: 'Evening Calm & Mindful Breathing',
    category: 'Taiwanese Mindfulness & Healing',
    categoryZh: '溫暖療癒冥想',
    recommendedVoice: 'Zephyr',
    recommendedTone: 'tw_meditative',
    recommendedSpeed: 'tw_slow',
    language: 'zh-TW',
    text: `現在，請輕輕地閉上雙眼，找一個最舒適放鬆的姿勢坐著或躺著。

深深地吸一口氣…… 感受微涼的空氣緩緩流入胸口，讓肩膀自然地沉下來。接著，慢慢地吐氣，把今天所有的忙碌、焦慮與奔波，都隨著氣息輕輕釋放。

你今天已經做得很棒了。在此刻，留給自己這片全然安靜、放鬆的溫柔時光。`,
  },
  {
    id: 'tw-transit',
    title: '台鐵花東海岸列車廣播',
    titleEn: 'Taiwan Railway Coastal Scenic Guide',
    category: 'Taiwanese Scenic Guide',
    categoryZh: '典雅景點廣播',
    recommendedVoice: 'Aoede',
    recommendedTone: 'tw_guide',
    recommendedSpeed: 'tw_natural',
    language: 'zh-TW',
    text: `各位旅客您好，歡迎搭乘本班鳴日號觀光列車。

列車即將通過花蓮和平路段。此時請往列車左側車窗眺望，這片蔚藍深邃的大海，正是雄偉的太平洋；而右側則是連綿起伏的中央山脈。祝您擁有一段溫暖愜意的美好旅程，謝謝。`,
  },
  {
    id: 'en-story',
    title: 'The Whispering Lighthouse',
    category: 'Audiobook Fiction',
    categoryZh: '英文小說朗讀',
    recommendedVoice: 'Kore',
    recommendedTone: 'storyteller',
    recommendedSpeed: 'slow',
    language: 'en',
    text: `High atop the craggy bluffs of Cape Veridian, the old lighthouse stood like a solitary sentinel against the gathering twilight. For over seventy years, Captain Silas had climbed the winding spiral of cast-iron stairs, his oil lantern casting elongated shadows against whitewashed granite. 

Tonight, the wind hummed a peculiar melody through the copper vents—not the hollow howl of an incoming gale, but a rhythmic whisper, as though the ocean itself was reciting an ancient memory forgotten by time.`,
  },
];
