import React from 'react';
import {
  MessageSquare,
  Briefcase,
  BookOpen,
  Zap,
  Heart,
  Compass,
  Edit3,
  Sliders,
  Sparkles,
  Radio,
  Tv,
} from 'lucide-react';
import { ToneKey } from '../types';

interface ToneOption {
  key: ToneKey;
  label: string;
  labelZh: string;
  subtitle: string;
  subtitleZh: string;
  group: 'taiwan' | 'standard';
  icon: React.ReactNode;
}

const TONE_OPTIONS: ToneOption[] = [
  // Taiwanese Mandarin Presets
  {
    key: 'tw_conversational',
    label: '親切日常',
    labelZh: '親切日常',
    subtitle: '台灣日常口音，溫柔親和',
    subtitleZh: '台灣日常國語，溫柔親切又自然',
    group: 'taiwan',
    icon: <MessageSquare className="w-3.5 h-3.5" />,
  },
  {
    key: 'tw_storyteller',
    label: '文藝說書',
    labelZh: '文藝說書',
    subtitle: '感性暖心說書，富畫面感',
    subtitleZh: '如夜間廣播說書人，溫暖深刻',
    group: 'taiwan',
    icon: <BookOpen className="w-3.5 h-3.5" />,
  },
  {
    key: 'tw_podcast',
    label: '活潑 Podcast',
    labelZh: '活潑 Podcast',
    subtitle: '熱門節目主持，生動元氣',
    subtitleZh: '生動熱情，自帶笑容感染力',
    group: 'taiwan',
    icon: <Radio className="w-3.5 h-3.5" />,
  },
  {
    key: 'tw_professional',
    label: '專業主播',
    labelZh: '專業主播',
    subtitle: '台灣新聞廣播，端莊清晰',
    subtitleZh: '端莊清晰，專業商務與簡報',
    group: 'taiwan',
    icon: <Tv className="w-3.5 h-3.5" />,
  },
  {
    key: 'tw_meditative',
    label: '舒緩療癒',
    labelZh: '舒緩療癒',
    subtitle: '晚安冥想，柔和撫慰心靈',
    subtitleZh: '輕柔放鬆，安定心神撫慰身心',
    group: 'taiwan',
    icon: <Heart className="w-3.5 h-3.5" />,
  },
  {
    key: 'tw_guide',
    label: '典雅導覽',
    labelZh: '典雅導覽',
    subtitle: '捷運與景點導覽，溫潤客氣',
    subtitleZh: '捷運站廣播與美術館語音導覽',
    group: 'taiwan',
    icon: <Compass className="w-3.5 h-3.5" />,
  },
  // English / Global Presets
  {
    key: 'conversational',
    label: 'Natural English',
    labelZh: '自然英文對話',
    subtitle: 'Everyday fluent conversational',
    subtitleZh: '自然流利的日常英文對話',
    group: 'standard',
    icon: <MessageSquare className="w-3.5 h-3.5" />,
  },
  {
    key: 'custom',
    label: '自訂口吻',
    labelZh: '自訂口吻',
    subtitle: '自由輸入自訂提示詞風格',
    subtitleZh: '自由客製化說話風格與人設',
    group: 'standard',
    icon: <Edit3 className="w-3.5 h-3.5" />,
  },
];

interface ToneSelectorProps {
  selectedTone: ToneKey;
  onSelectTone: (tone: ToneKey) => void;
  customTonePrompt: string;
  onCustomToneChange: (prompt: string) => void;
  isZhMode?: boolean;
}

export const ToneSelector: React.FC<ToneSelectorProps> = ({
  selectedTone,
  onSelectTone,
  customTonePrompt,
  onCustomToneChange,
  isZhMode = true,
}) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/20">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">
              {isZhMode ? '台灣華語語氣與口吻風格' : 'Voice Tone & Accent Style'}
            </h3>
            <p className="text-[11px] text-slate-400">
              {isZhMode
                ? '設定台灣國語自然腔調、日常親切、文藝說書或專業主播風格'
                : 'Direct Taiwanese conversational warmth, storytelling, or broadcast tone'}
            </p>
          </div>
        </div>
      </div>

      {/* Tone Preset Chips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {TONE_OPTIONS.map((opt) => {
          const isSelected = selectedTone === opt.key;
          return (
            <button
              key={opt.key}
              type="button"
              onClick={() => onSelectTone(opt.key)}
              className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between ${
                isSelected
                  ? 'bg-orange-500/15 border-orange-500/60 ring-2 ring-orange-500/20 text-white shadow-md'
                  : 'bg-slate-900/60 hover:bg-slate-800/80 border-slate-800 hover:border-slate-700 text-slate-300'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`p-1 rounded-md ${
                    isSelected ? 'bg-orange-500 text-white' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {opt.icon}
                </span>
                <span className="text-xs font-semibold">
                  {isZhMode ? opt.labelZh : opt.label}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 line-clamp-1">
                {isZhMode ? opt.subtitleZh : opt.subtitle}
              </p>
            </button>
          );
        })}
      </div>

      {/* Custom Prompt Input if "Custom" is selected */}
      {selectedTone === 'custom' && (
        <div className="p-3 rounded-xl bg-slate-950/70 border border-orange-500/30 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-orange-400 font-medium">
              {isZhMode ? '自訂說話口吻指令 (Prompt Directive):' : 'Custom Voice Direction Prompt:'}
            </span>
            <span className="text-[11px] text-slate-400">
              {isZhMode ? '將傳入 speechMetadata.style' : 'Fed to speechMetadata.style'}
            </span>
          </div>
          <input
            type="text"
            value={customTonePrompt}
            onChange={(e) => onCustomToneChange(e.target.value)}
            placeholder={
              isZhMode
                ? '例如：以道地親切的台灣國語，像巷口早餐店阿姨一樣溫暖熱情'
                : 'e.g. Speak in friendly Taiwanese Mandarin with gentle tone particles like la, ou, ne'
            }
            className="w-full px-3 py-2 text-xs rounded-lg bg-slate-900 border border-slate-700 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-orange-500"
          />
          <div className="flex flex-wrap gap-1.5 pt-1">
            <span className="text-[10px] text-slate-400">
              {isZhMode ? '快速推薦靈感：' : 'Quick ideas:'}
            </span>
            {[
              '自然親切的台灣國語腔調',
              '台北捷運優雅廣播風格',
              '台灣深夜文藝廣播DJ',
              '熱情親切的台灣在地導遊',
            ].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => onCustomToneChange(preset)}
                className="text-[10px] px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-300 border border-slate-700/60 transition"
              >
                + {preset}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
