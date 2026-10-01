export const DEFAULT_SOUND_DESIGN_PROMPT = `A young mother in her late twenties speaking natural Taiwanese Mandarin, the everyday Mandarin spoken in Taiwan. Read all Chinese text using Taiwanese Mandarin word pronunciations and Mandarin lexical tones. Use the relaxed conversational phrasing of a Taiwanese woman speaking privately to her family. Articulate retroflex consonants lightly while keeping every syllable clear.

Deliver the text as ordinary spoken dialogue, with natural Mandarin intonation, normal syllable lengths, and brief pauses at punctuation. Do not sing, chant, hum, sustain vowels, or follow a musical rhythm.

Her voice is in a naturally low female register: rich, mellow, rounded, and full-bodied, with warm chest resonance. Maintain clear, supported voicing and a solid vocal core at a gentle volume. Keep her voice youthful and feminine, with minimal breathiness and clear sentence endings.

She is physically weak and tired. Express her fatigue through a slightly slower conversational pace, short phrases, and occasional pauses to rest. Her voice remains full and intelligible. Avoid whispering, raspiness, gasping, or exaggerated trembling.

Her tone is tender, sincere, and reassuring. She is sharing her hopes and asking someone close to her for support. Convey quiet joy when imagining bringing her child home, affection when learning to care for him, and vulnerable honesty when asking for help. End with gentle hope and relief at the thought of resting peacefully.

The overall performance is intimate Taiwanese Mandarin conversation: a low, warm, full-bodied young female voice, softly expressive and quietly tired. Keep the emotional changes subtle and natural.`;

export interface SoundDesignPreset {
  id: string;
  titleZh: string;
  titleEn: string;
  recommendedVoice: string;
  descriptionZh: string;
  prompt: string;
}

export const SOUND_DESIGN_PRESETS: SoundDesignPreset[] = [
  {
    id: 'young-mother-fatigued',
    titleZh: '年輕母親 · 溫柔疲倦台灣腔 (預設)',
    titleEn: 'Young Mother · Tender & Tired Taiwanese (Default)',
    recommendedVoice: 'Kore',
    descriptionZh: '二十多歲年輕新手母親，語調低沉圓潤、身體虛弱略顯疲倦，但充滿溫柔真摯與期待。',
    prompt: DEFAULT_SOUND_DESIGN_PROMPT,
  },
  {
    id: 'night-cafe-intimate',
    titleZh: '深夜老友 · 暖心微醺私語',
    titleEn: 'Late-Night Intimate Conversation',
    recommendedVoice: 'Puck',
    descriptionZh: '台北深夜小酒館裡，低聲誠懇與多年好友交心，語調輕鬆柔和、平舌親切。',
    prompt: `A Taiwanese man in his early thirties speaking intimate Taiwanese Mandarin in a quiet, relaxed setting. Speak in a gentle, warm baritone register with soft Taiwanese conversational cadence and natural particles. Keep the pace relaxed, reflective, and completely unhurried, as if whispering late-night thoughts across a low-lit table to a trusted lifelong friend.`,
  },
  {
    id: 'elderly-storyteller',
    titleZh: '長者回憶 · 慈祥溫潤說古',
    titleEn: 'Gentle Elder · Nostalgic Memory',
    recommendedVoice: 'Charon',
    descriptionZh: '溫暖慈祥的台灣長者，在老街騎樓下緩緩講述舊時代的往事，語速緩慢沉穩。',
    prompt: `An elderly Taiwanese person in their late sixties narrating nostalgic memories. The tone is deeply gentle, grandfatherly, warm, and comforting. Speak in authentic Taiwanese Mandarin with gentle intonation, unhurried pacing, relaxed natural pauses between memories, and rich emotional warmth.`,
  },
];
