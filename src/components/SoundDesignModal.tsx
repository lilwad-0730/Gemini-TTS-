import React, { useState } from 'react';
import {
  Sliders,
  Sparkles,
  RotateCcw,
  Check,
  Copy,
  X,
  FileText,
  Volume2,
  Info,
  HeartHandshake,
} from 'lucide-react';
import {
  DEFAULT_SOUND_DESIGN_PROMPT,
  SOUND_DESIGN_PRESETS,
  SoundDesignPreset,
} from '../constants/soundDesign';

interface SoundDesignModalProps {
  isOpen: boolean;
  onClose: () => void;
  soundDesignPrompt: string;
  setSoundDesignPrompt: (prompt: string) => void;
  isSoundDesignActive: boolean;
  setIsSoundDesignActive: (active: boolean) => void;
  onLoadCompanionScript?: () => void;
  isZhMode?: boolean;
}

export const SoundDesignModal: React.FC<SoundDesignModalProps> = ({
  isOpen,
  onClose,
  soundDesignPrompt,
  setSoundDesignPrompt,
  isSoundDesignActive,
  setIsSoundDesignActive,
  onLoadCompanionScript,
  isZhMode = true,
}) => {
  const [copied, setCopied] = useState(false);
  const [activePresetId, setActivePresetId] = useState<string>('young-mother-fatigued');

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(soundDesignPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleResetToDefault = () => {
    setSoundDesignPrompt(DEFAULT_SOUND_DESIGN_PROMPT);
    setActivePresetId('young-mother-fatigued');
  };

  const handleSelectPreset = (preset: SoundDesignPreset) => {
    setSoundDesignPrompt(preset.prompt);
    setActivePresetId(preset.id);
  };

  const wordCount = soundDesignPrompt.trim().split(/\s+/).filter(Boolean).length;
  const charCount = soundDesignPrompt.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="fixed inset-0"
        onClick={onClose}
      />
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-slate-900 border border-orange-500/40 rounded-2xl shadow-2xl shadow-orange-950/40 flex flex-col z-10 overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white shadow-md shadow-orange-500/20">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  {isZhMode ? '聲音設計工作室 (Sound Design Studio)' : 'Sound Design Studio'}
                </h3>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-orange-500/15 text-orange-300 border border-orange-500/30">
                  Gemini Flash TTS
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {isZhMode
                  ? '自訂多維度人設立體音色、語氣、呼吸節奏與心境細節'
                  : 'Craft your custom multi-paragraph voice persona & performance directives'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          {/* Active Switcher & Status Banner */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsSoundDesignActive(!isSoundDesignActive)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  isSoundDesignActive ? 'bg-orange-500' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    isSoundDesignActive ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
              <div>
                <span className="font-semibold text-white block">
                  {isSoundDesignActive
                    ? isZhMode
                      ? '已啟用自訂聲音設計 (Active)'
                      : 'Custom Sound Design Active'
                    : isZhMode
                    ? '自訂聲音設計未啟用 (Disabled)'
                    : 'Custom Sound Design Disabled'}
                </span>
                <span className="text-[11px] text-slate-400">
                  {isSoundDesignActive
                    ? isZhMode
                      ? '生成語音時將優先套用下方完整的聲音設計描述'
                      : 'Will override tone presets with your custom sound design prompt'
                    : isZhMode
                    ? '目前使用一般語氣預設設定；開啟開關即可啟用下方設計'
                    : 'Currently using standard tone presets; toggle on to activate'}
                </span>
              </div>
            </div>

            {/* Quick Load Matching Sample Script */}
            {onLoadCompanionScript && (
              <button
                type="button"
                onClick={() => {
                  setIsSoundDesignActive(true);
                  onLoadCompanionScript();
                  onClose();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-500/10 hover:bg-orange-500/20 text-orange-300 border border-orange-500/30 transition text-xs font-medium"
                title="載入與預設聲音設計完美搭配的新手媽媽示範台詞"
              >
                <HeartHandshake className="w-3.5 h-3.5 text-orange-400" />
                <span>{isZhMode ? '套用新手媽媽示範台詞' : 'Load Matching Sample'}</span>
              </button>
            )}
          </div>

          {/* Preset Buttons */}
          <div className="space-y-1.5">
            <span className="text-slate-400 font-medium text-[11px] flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              {isZhMode ? '聲音設計範本預設：' : 'Sound Design Presets:'}
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {SOUND_DESIGN_PRESETS.map((preset) => {
                const isSelected = activePresetId === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between ${
                      isSelected
                        ? 'bg-orange-500/15 border-orange-500/60 ring-1 ring-orange-500/30 text-white'
                        : 'bg-slate-950/40 hover:bg-slate-800/60 border-slate-800 text-slate-300'
                    }`}
                  >
                    <span className="font-semibold text-xs text-white mb-0.5 truncate">
                      {isZhMode ? preset.titleZh : preset.titleEn}
                    </span>
                    <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">
                      {preset.descriptionZh}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Textarea Editor */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-300 font-medium flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-orange-400" />
                {isZhMode ? '聲音設計指令內容 (Prompt)：' : 'Sound Design Prompt Directive:'}
              </span>
              <div className="flex items-center gap-3 text-slate-400 font-mono">
                <span>{wordCount} words</span>
                <span>{charCount} chars</span>
              </div>
            </div>

            <div className="relative rounded-xl border border-slate-700/80 bg-slate-950/70 focus-within:border-orange-500/60 transition">
              <textarea
                value={soundDesignPrompt}
                onChange={(e) => setSoundDesignPrompt(e.target.value)}
                placeholder="Write your custom voice character, emotion, pacing, tone, and accent directives here..."
                rows={10}
                className="w-full p-3.5 bg-transparent text-slate-200 placeholder-slate-500 text-xs leading-relaxed resize-none focus:outline-none font-mono"
                spellCheck="false"
              />

              {/* Action Toolbar on bottom-right of textarea */}
              <div className="p-2 border-t border-slate-800/80 bg-slate-900/60 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                  <Info className="w-3 h-3 text-amber-400 shrink-0" />
                  <span>
                    {isZhMode
                      ? 'Gemini Flash TTS 能理解年齡、胸腔共鳴、疲倦節奏與台灣華語日常說話腔調'
                      : 'Flash TTS accurately follows chest resonance, age, fatigue, and phrasing'}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] border border-slate-700/60 transition"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? '已複製' : '複製'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleResetToDefault}
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-300 text-[11px] border border-slate-700/60 transition"
                    title="重設為使用者預設的年輕母親台灣腔設定"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>{isZhMode ? '重設為預設設定' : 'Reset to Default'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between gap-3">
          <div className="text-slate-400 text-[11px]">
            {isSoundDesignActive ? (
              <span className="text-emerald-400 font-medium">✓ 已設為啟用狀態，生成時將自動套用</span>
            ) : (
              <span className="text-slate-400">未啟用狀態（將使用右側一般預設語氣）</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
            >
              {isZhMode ? '取消' : 'Cancel'}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsSoundDesignActive(true);
                onClose();
              }}
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-lg shadow-orange-500/25 transition"
            >
              {isZhMode ? '啟用並套用設定' : 'Enable & Apply'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
