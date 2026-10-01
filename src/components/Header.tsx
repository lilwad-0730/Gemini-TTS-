import React from 'react';
import { Volume2, Sparkles, BookOpen, Layers, Globe, Sliders } from 'lucide-react';
import { SAMPLE_SCRIPTS, SampleScript } from '../constants/samples';

interface HeaderProps {
  model: 'gemini-3.8-flash-tts' | 'gemini-3.8-flash-lite-tts';
  setModel: (m: 'gemini-3.8-flash-tts' | 'gemini-3.8-flash-lite-tts') => void;
  onSelectSample: (sample: SampleScript) => void;
  isZhMode: boolean;
  setIsZhMode: (v: boolean) => void;
  onOpenSoundDesign: () => void;
  isSoundDesignActive: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  model,
  setModel,
  onSelectSample,
  isZhMode,
  setIsZhMode,
  onOpenSoundDesign,
  isSoundDesignActive,
}) => {
  const [showSamples, setShowSamples] = React.useState(false);

  return (
    <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-500 flex items-center justify-center shadow-lg shadow-orange-500/20 ring-1 ring-white/10">
            <Volume2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-lg tracking-tight text-white">Vocalis</span>
              <span className="text-[10px] font-semibold tracking-wider px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-orange-500/30 text-amber-300">
                Gemini Flash TTS
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 hidden sm:inline-flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                台灣華語 (Taiwanese Mandarin)
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden md:block">
              {isZhMode
                ? '繁體中文 / 台灣國語音色與語氣朗讀工作室'
                : 'Taiwanese Mandarin & Multilingual Neural Voice Studio'}
            </p>
          </div>
        </div>

        {/* Right Tools: Sound Design (右上角聲音設計), Sample Picker, Language, Model Selector */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Sound Design (聲音設計) Button in the Top Right Corner */}
          <button
            type="button"
            onClick={onOpenSoundDesign}
            className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition shadow-md ${
              isSoundDesignActive
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-orange-500/25 ring-2 ring-orange-500/40 animate-pulse-subtle'
                : 'bg-slate-800 hover:bg-slate-700 text-amber-300 hover:text-white border border-orange-500/30'
            }`}
            title="開啟聲音設計工作室，自訂細緻的人設語氣、年齡、共鳴與情緒 Prompt"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>{isZhMode ? '聲音設計' : 'Sound Design'}</span>
            {isSoundDesignActive && (
              <span className="text-[9px] uppercase px-1 py-0.2 rounded bg-black/30 text-white font-mono">
                ON
              </span>
            )}
          </button>

          {/* Sample Scripts Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowSamples(!showSamples)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
              title="載入示範文稿 / Load sample script"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">{isZhMode ? '示範稿件' : 'Samples'}</span>
            </button>

            {showSamples && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowSamples(false)}
                />
                <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-slate-800/95 border border-slate-700 shadow-2xl p-2 z-50 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3 py-2 border-b border-slate-700/60 mb-1 flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      {isZhMode ? '精選台灣華語示範稿件' : 'Curated Sample Scripts'}
                    </span>
                    <span className="text-[10px] text-slate-400">1-click load</span>
                  </div>
                  <div className="space-y-1 max-h-80 overflow-y-auto">
                    {SAMPLE_SCRIPTS.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => {
                          onSelectSample(s);
                          setShowSamples(false);
                        }}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-700/80 transition group"
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs font-medium text-white group-hover:text-amber-300 transition truncate">
                            {s.title}
                          </span>
                          <span className="text-[10px] text-slate-400 px-1.5 py-0.5 rounded bg-slate-900/60 shrink-0">
                            {isZhMode ? s.categoryZh : s.category}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                          推薦發音：{s.recommendedVoice} · {s.recommendedTone}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Language Toggle: 繁中 / EN */}
          <button
            onClick={() => setIsZhMode(!isZhMode)}
            className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            title="切換介面語言 / Switch Interface Language"
          >
            <Globe className="w-3.5 h-3.5 text-orange-400" />
            <span>{isZhMode ? '繁中' : 'EN'}</span>
          </button>

          {/* Model Switcher */}
          <div className="flex items-center bg-slate-800/90 p-0.5 rounded-lg border border-slate-700 text-xs">
            <button
              onClick={() => setModel('gemini-3.8-flash-tts')}
              className={`px-2 py-1 rounded-md transition font-medium flex items-center gap-1 ${
                model === 'gemini-3.8-flash-tts'
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="旗艦聲音模型：情感細膩、音色豐沛、支援台灣國語聲調與聲音設計"
            >
              <Sparkles className="w-3 h-3" />
              <span>Flash TTS</span>
            </button>
            <button
              onClick={() => setModel('gemini-3.8-flash-lite-tts')}
              className={`px-2 py-1 rounded-md transition font-medium flex items-center gap-1 ${
                model === 'gemini-3.8-flash-lite-tts'
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="輕量高效率模型：極低延遲、快速合成"
            >
              <Layers className="w-3 h-3" />
              <span>Lite</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
