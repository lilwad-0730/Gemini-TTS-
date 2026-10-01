import React from 'react';
import { Mic2, Check, Sparkles } from 'lucide-react';
import { VoiceProfile } from '../types';

export const PREBUILT_VOICES: VoiceProfile[] = [
  {
    id: 'Kore',
    name: 'Kore (柯爾)',
    gender: 'Female',
    personality: 'Warm & Melodious',
    personalityZh: '溫暖甜美 · 治癒系女聲',
    description: 'Natural, welcoming, and expressive. Ideal for Taiwanese audiobooks, guides, and conversational reads.',
    descriptionZh: '語調溫柔親和、自然流暢，極適合台灣故事說書、生活散文與有聲書朗讀。',
    samplePitch: '中高音 · 溫暖柔和',
  },
  {
    id: 'Puck',
    name: 'Puck (帕克)',
    gender: 'Male',
    personality: 'Youthful & Dynamic',
    personalityZh: '陽光活力 · 親切少年感',
    description: 'Bright, lively, and articulate. Great for conversational Taiwanese podcasts and tutorials.',
    descriptionZh: '年輕富有活力，咬字清爽自然，非常適合熱門 Podcast、生活對話與休閒介紹。',
    samplePitch: '中高音 · 活潑明亮',
  },
  {
    id: 'Charon',
    name: 'Charon (卡隆)',
    gender: 'Male',
    personality: 'Deep & Resonant',
    personalityZh: '沉穩磁性 · 專業男中音',
    description: 'Calm, grounded, and authoritative. Superb for documentaries, business, and essays.',
    descriptionZh: '聲音低沉醇厚，帶有權威與安心感，特別適合財經商業報導、科技趨勢與紀錄片。',
    samplePitch: '低沉男中低音 · 沉穩深邃',
  },
  {
    id: 'Zephyr',
    name: 'Zephyr (澤菲爾)',
    gender: 'Female',
    personality: 'Gentle & Serene',
    personalityZh: '輕柔空靈 · 冥想助眠',
    description: 'Soft, calming, and soothing. Perfect for mindfulness, meditation, and relaxed prose.',
    descriptionZh: '氣音柔美舒緩，語調輕慢，宛如耳邊私語，是睡眠放鬆、正念靜心與溫柔散文的首選。',
    samplePitch: '柔和輕音 · 寧靜舒緩',
  },
  {
    id: 'Fenrir',
    name: 'Fenrir (芬里爾)',
    gender: 'Male',
    personality: 'Bold & Confident',
    personalityZh: '剛健清晰 · 洪亮自信',
    description: 'Crisp, powerful, and commanding. Great for announcements, dramatic reads, and news.',
    descriptionZh: '穿透力強，咬字堅定俐落，適合舞台感獨白、重要公眾廣播與高張力戲劇敘事。',
    samplePitch: '中低音 · 堅實有力',
  },
  {
    id: 'Aoede',
    name: 'Aoede (奧伊迪)',
    gender: 'Female',
    personality: 'Expressive & Refined',
    personalityZh: '優雅文藝 · 氣質女聲',
    description: 'Poised, artistic, and lyrical. Superb for literary fiction, poetry, and elegance.',
    descriptionZh: '端莊典雅，韻律如歌，非常適合捷運與展覽導覽、現代詩集與精緻品牌旁白。',
    samplePitch: '高音 · 純淨清澈',
  },
];

interface VoiceSelectorProps {
  selectedVoice: string;
  onSelectVoice: (voiceId: string) => void;
  isZhMode?: boolean;
}

export const VoiceSelector: React.FC<VoiceSelectorProps> = ({
  selectedVoice,
  onSelectVoice,
  isZhMode = true,
}) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/20">
            <Mic2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">
              {isZhMode ? '台灣華語發音人 (Neural Voice)' : 'Voice Persona Selection'}
            </h3>
            <p className="text-[11px] text-slate-400">
              {isZhMode
                ? '選擇最適合您文本的 Gemini 神經網絡語音音色'
                : 'Select a prebuilt neural voice configured for Taiwanese Mandarin'}
            </p>
          </div>
        </div>
        <span className="text-xs font-medium text-amber-400/90 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
          {selectedVoice} {isZhMode ? '使用中' : 'Active'}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {PREBUILT_VOICES.map((v) => {
          const isSelected = selectedVoice === v.id;
          return (
            <button
              key={v.id}
              type="button"
              onClick={() => onSelectVoice(v.id)}
              className={`text-left p-3 rounded-xl border transition-all relative flex flex-col justify-between group ${
                isSelected
                  ? 'bg-gradient-to-b from-orange-500/15 to-amber-500/10 border-orange-500/60 ring-2 ring-orange-500/30 shadow-lg shadow-orange-950/40'
                  : 'bg-slate-900/60 hover:bg-slate-800/80 border-slate-800 hover:border-slate-700'
              }`}
            >
              {isSelected && (
                <div className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full bg-orange-500 flex items-center justify-center text-white shadow-sm">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </div>
              )}

              <div>
                <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                  <span className="font-semibold text-sm text-white group-hover:text-amber-300 transition">
                    {v.name}
                  </span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded font-medium ${
                      v.gender === 'Female'
                        ? 'bg-purple-500/15 text-purple-300 border border-purple-500/30'
                        : 'bg-blue-500/15 text-blue-300 border border-blue-500/30'
                    }`}
                  >
                    {isZhMode ? (v.gender === 'Female' ? '女聲' : '男聲') : v.gender}
                  </span>
                </div>

                <div className="text-[11px] font-medium text-amber-400/90 mb-1 flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5 shrink-0" />
                  <span className="truncate">{isZhMode ? v.personalityZh : v.personality}</span>
                </div>

                <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                  {isZhMode ? v.descriptionZh : v.description}
                </p>
              </div>

              <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400">
                <span>{v.samplePitch}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
