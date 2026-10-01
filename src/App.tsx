/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Sparkles,
  AlertCircle,
  Loader2,
  CheckCircle,
  Sliders,
  RotateCcw,
  SlidersHorizontal,
  ChevronRight,
} from 'lucide-react';
import { Header } from './components/Header';
import { FileUploadZone } from './components/FileUploadZone';
import { VoiceSelector } from './components/VoiceSelector';
import { ToneSelector } from './components/ToneSelector';
import { SpeedControls } from './components/SpeedControls';
import { AudioPlayer } from './components/AudioPlayer';
import { HistoryList } from './components/HistoryList';
import { SoundDesignModal } from './components/SoundDesignModal';
import { SAMPLE_SCRIPTS, SampleScript } from './constants/samples';
import { DEFAULT_SOUND_DESIGN_PROMPT } from './constants/soundDesign';
import {
  ToneKey,
  SpeedPaceKey,
  TTSResponseData,
  AudioHistoryItem,
} from './types';

export default function App() {
  // Language mode: true = 繁體中文, false = English
  const [isZhMode, setIsZhMode] = useState<boolean>(true);

  // Sound Design State
  const [soundDesignPrompt, setSoundDesignPrompt] = useState<string>(
    DEFAULT_SOUND_DESIGN_PROMPT
  );
  const [isSoundDesignActive, setIsSoundDesignActive] = useState<boolean>(true);
  const [isSoundDesignModalOpen, setIsSoundDesignModalOpen] = useState<boolean>(false);

  // Studio State
  const [text, setText] = useState<string>(SAMPLE_SCRIPTS[0].text);
  const [voiceName, setVoiceName] = useState<string>('Kore');
  const [model, setModel] = useState<'gemini-3.8-flash-tts' | 'gemini-3.8-flash-lite-tts'>(
    'gemini-3.8-flash-tts'
  );
  const [tone, setTone] = useState<ToneKey>('tw_conversational');
  const [customTonePrompt, setCustomTonePrompt] = useState<string>('');
  const [readingSpeed, setReadingSpeed] = useState<SpeedPaceKey>('tw_slow');
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingStage, setLoadingStage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const [currentResult, setCurrentResult] = useState<TTSResponseData | null>(null);
  const [currentAudioId, setCurrentAudioId] = useState<string | null>(null);
  const [history, setHistory] = useState<AudioHistoryItem[]>([]);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Quick sample loader
  const handleSelectSample = (sample: SampleScript) => {
    setText(sample.text);
    if (sample.recommendedVoice) setVoiceName(sample.recommendedVoice);
    if (sample.recommendedTone) setTone(sample.recommendedTone as ToneKey);
    if (sample.recommendedSpeed) setReadingSpeed(sample.recommendedSpeed as SpeedPaceKey);

    setSuccessToast(
      isZhMode
        ? `已載入示範文稿：「${sample.title}」`
        : `Loaded sample: "${sample.title}"`
    );
    setTimeout(() => setSuccessToast(null), 3500);
  };

  // Companion script loader for default sound design (Young Mother)
  const handleLoadCompanionScript = () => {
    const motherSample = SAMPLE_SCRIPTS.find((s) => s.id === 'tw-young-mother') || SAMPLE_SCRIPTS[0];
    handleSelectSample(motherSample);
  };

  // Main synthesis trigger
  const handleGenerate = async () => {
    if (!text.trim()) {
      setError(
        isZhMode
          ? '請輸入中文字元或上傳文字檔案以合成語音。'
          : 'Please provide text or upload a document to convert into speech.'
      );
      return;
    }

    setIsLoading(true);
    setError(null);
    setLoadingStage(
      isZhMode
        ? isSoundDesignActive
          ? '正在套用自訂聲音設計 (Sound Design) 與台灣華語語意……'
          : '正在分析中文語意與標點節奏……'
        : 'Analyzing text and preparing prosody direction...'
    );

    try {
      setLoadingStage(
        isZhMode
          ? `正在使用 Gemini Flash TTS 生成台灣華語 (${voiceName})……`
          : `Synthesizing Taiwanese Mandarin with ${model === 'gemini-3.8-flash-tts' ? 'Gemini Flash TTS' : 'Gemini Lite TTS'} (${voiceName})...`
      );

      const response = await fetch('/api/tts/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          voiceName,
          model,
          tone,
          customTonePrompt: tone === 'custom' ? customTonePrompt : undefined,
          soundDesignPrompt,
          isSoundDesignActive,
          readingSpeed,
          accent: 'taiwanese',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to synthesize audio with Gemini.');
      }

      setLoadingStage(
        isZhMode
          ? '正在處理 24kHz 高解析度音訊波形……'
          : 'Processing 24kHz audio waveform...'
      );
      const newAudioId = 'take-' + Date.now();

      setCurrentResult(data);
      setCurrentAudioId(newAudioId);

      // Add to session history
      const historyItem: AudioHistoryItem = {
        id: newAudioId,
        createdAt: Date.now(),
        textExcerpt: text.trim().slice(0, 80) + (text.length > 80 ? '……' : ''),
        fullText: text,
        audioUrl: `data:${data.mimeType};base64,${data.audioBase64}`,
        audioBase64: data.audioBase64,
        voiceName: data.voiceUsed,
        tone: isSoundDesignActive ? '聲音設計 (Sound Design)' : data.toneUsed,
        speedPace: data.speedUsed,
        accentUsed: data.accentUsed,
        soundDesignUsed: Boolean(data.soundDesignUsed),
        wordCount: data.wordCount,
        chineseChars: data.chineseChars,
        durationSeconds: data.estimatedSeconds,
      };

      setHistory((prev) => [historyItem, ...prev.slice(0, 19)]);
      setSuccessToast(
        isZhMode
          ? isSoundDesignActive
            ? `成功根據自訂聲音設計生成台灣華語！發音人：${voiceName}`
            : `成功合成台灣華語語音！發音人：${voiceName}（${data.chineseChars || data.wordCount} 字）`
          : `Generated Taiwanese Mandarin speech with ${voiceName} (${data.wordCount} words)`
      );
      setTimeout(() => setSuccessToast(null), 4000);
    } catch (err: any) {
      console.error('Synthesis error:', err);
      setError(
        err?.message ||
          (isZhMode
            ? '生成音訊時發生錯誤，請檢查您的文字內容後重試。'
            : 'An error occurred while generating audio. Please check your text.')
      );
    } finally {
      setIsLoading(false);
      setLoadingStage('');
    }
  };

  // Select historical take
  const handleSelectHistoryItem = (item: AudioHistoryItem) => {
    setCurrentAudioId(item.id);
    setCurrentResult({
      audioBase64: item.audioBase64,
      mimeType: 'audio/wav',
      wordCount: item.wordCount,
      chineseChars: item.chineseChars,
      hasChinese: Boolean(item.chineseChars),
      characterCount: item.fullText.length,
      estimatedSeconds: item.durationSeconds || Math.round(item.wordCount / 2.3),
      chunksProcessed: 1,
      modelUsed: model,
      voiceUsed: item.voiceName,
      toneUsed: item.tone,
      speedUsed: item.speedPace,
      accentUsed: item.accentUsed || 'Taiwanese Mandarin (台灣華語)',
      soundDesignUsed: item.soundDesignUsed,
      styleDirective: `Historical take: ${item.tone}`,
    });
  };

  const handleClearHistory = () => {
    setHistory([]);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-orange-500 selection:text-white">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl bg-orange-500 text-white shadow-xl shadow-orange-950/50 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span className="text-xs font-semibold">{successToast}</span>
        </div>
      )}

      {/* Top Navbar with Sound Design in the Top Right Corner */}
      <Header
        model={model}
        setModel={setModel}
        onSelectSample={handleSelectSample}
        isZhMode={isZhMode}
        setIsZhMode={setIsZhMode}
        onOpenSoundDesign={() => setIsSoundDesignModalOpen(true)}
        isSoundDesignActive={isSoundDesignActive}
      />

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Sound Design Active Callout Banner */}
        <div
          className={`px-4 py-3.5 rounded-2xl border transition-all flex flex-wrap items-center justify-between gap-3 text-xs ${
            isSoundDesignActive
              ? 'bg-gradient-to-r from-orange-500/15 via-amber-500/10 to-slate-900 border-orange-500/40 ring-1 ring-orange-500/30'
              : 'bg-slate-900/60 border-slate-800'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-xl flex items-center justify-center ${
                isSoundDesignActive
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/30'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-sm">
                  {isZhMode ? '聲音設計模式 (Sound Design Mode)' : 'Sound Design Mode'}
                </span>
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    isSoundDesignActive
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}
                >
                  {isSoundDesignActive
                    ? isZhMode
                      ? '● 啟用中：年輕母親台灣腔預設'
                      : '● Active: Young Mother Preset'
                    : isZhMode
                    ? '未啟用'
                    : 'Disabled'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                {isSoundDesignActive
                  ? soundDesignPrompt.slice(0, 140) + '...'
                  : isZhMode
                  ? '點選右上方「聲音設計」可隨時編輯您的客製化語氣人設 Prompt'
                  : 'Click "Sound Design" in the top-right corner to customize your persona prompt'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsSoundDesignActive(!isSoundDesignActive)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                isSoundDesignActive
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                  : 'bg-orange-500 hover:bg-orange-600 text-white border-transparent'
              }`}
            >
              {isSoundDesignActive
                ? isZhMode
                  ? '切換為一般預設'
                  : 'Switch to Standard'
                : isZhMode
                ? '啟用聲音設計'
                : 'Enable Sound Design'}
            </button>
            <button
              type="button"
              onClick={() => setIsSoundDesignModalOpen(true)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 border border-orange-500/40 text-xs font-semibold transition"
            >
              <span>{isZhMode ? '編輯聲音設計' : 'Edit Sound Design'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-200 animate-in fade-in duration-150">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1 text-xs">
              <span className="font-semibold block text-rose-300">
                {isZhMode ? '語音生成發生問題' : 'Synthesis Error'}
              </span>
              <span>{error}</span>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-rose-400 hover:text-rose-200 text-xs px-2 py-1 rounded"
            >
              {isZhMode ? '關閉' : 'Dismiss'}
            </button>
          </div>
        )}

        {/* Studio Grid: Document on Left, Voice Direction on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Script Editor & Uploader (6 cols) */}
          <div className="lg:col-span-6 flex flex-col">
            <FileUploadZone
              text={text}
              setText={setText}
              readingSpeed={readingSpeed}
              isZhMode={isZhMode}
            />
          </div>

          {/* Right Column: Voice & Audio Tuning (6 cols) */}
          <div className="lg:col-span-6 space-y-5 flex flex-col justify-between">
            {/* 1. Voice Selector */}
            <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-4 sm:p-5 shadow-xl">
              <VoiceSelector
                selectedVoice={voiceName}
                onSelectVoice={setVoiceName}
                isZhMode={isZhMode}
              />
            </div>

            {/* 2. Tone Selector (or Sound Design Override view) */}
            <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-4 sm:p-5 shadow-xl space-y-3">
              {isSoundDesignActive ? (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-orange-500/20 text-orange-400 border border-orange-500/30">
                        <Sliders className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                          <span>{isZhMode ? '聲音設計指令 (已啟用優先)' : 'Sound Design Directive (Active)'}</span>
                          <span className="text-[10px] font-normal px-2 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            Overriding Standard Tones
                          </span>
                        </h3>
                        <p className="text-[11px] text-slate-400">
                          {isZhMode
                            ? '正在以多維度設定指導發音人年齡、胸腔低音、疲倦微喘與台灣母語親切語調'
                            : 'Directing persona, fatigue pacing, low chest resonance & Taiwanese intonation'}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsSoundDesignModalOpen(true)}
                      className="text-xs text-amber-400 hover:text-amber-300 font-medium underline"
                    >
                      {isZhMode ? '開啟編輯' : 'Edit Prompt'}
                    </button>
                  </div>

                  <div
                    onClick={() => setIsSoundDesignModalOpen(true)}
                    className="p-3 rounded-xl bg-slate-950/80 border border-orange-500/30 hover:border-orange-500/60 transition cursor-pointer text-slate-300 text-xs leading-relaxed font-mono line-clamp-4 select-none"
                    title="點擊以在對話框中查看或修改完整聲音設計 Prompt"
                  >
                    {soundDesignPrompt}
                  </div>
                </div>
              ) : (
                <ToneSelector
                  selectedTone={tone}
                  onSelectTone={setTone}
                  customTonePrompt={customTonePrompt}
                  onCustomToneChange={setCustomTonePrompt}
                  isZhMode={isZhMode}
                />
              )}
            </div>

            {/* 3. Speed & Prosody Controls */}
            <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-4 sm:p-5 shadow-xl">
              <SpeedControls
                readingSpeed={readingSpeed}
                onSelectReadingSpeed={setReadingSpeed}
                playbackRate={playbackRate}
                onChangePlaybackRate={setPlaybackRate}
                isZhMode={isZhMode}
              />
            </div>

            {/* Generate Action Button */}
            <button
              type="button"
              disabled={isLoading || !text.trim()}
              onClick={handleGenerate}
              className={`w-full py-4 px-6 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2.5 shadow-xl ${
                isLoading || !text.trim()
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/60'
                  : 'bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-orange-500/25 ring-2 ring-orange-500/30 transform active:scale-[0.99]'
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-white" />
                  <span>
                    {loadingStage ||
                      (isZhMode
                        ? '正在合成台灣華語語音……'
                        : 'Generating Speech with Gemini Flash...')}
                  </span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 fill-white/20" />
                  <span>
                    {isZhMode
                      ? isSoundDesignActive
                        ? '套用聲音設計生成台灣華語 (Gemini Flash TTS)'
                        : '開始生成台灣華語語音 (Gemini Flash TTS)'
                      : 'Synthesize Taiwanese Mandarin with Gemini Flash'}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Active Audio Player Section */}
        {currentResult && (
          <div className="animate-in fade-in slide-in-from-top-4 duration-300">
            <AudioPlayer
              currentResult={currentResult}
              playbackRate={playbackRate}
              onPlaybackRateChange={setPlaybackRate}
              isZhMode={isZhMode}
            />
          </div>
        )}

        {/* Generation History List */}
        <HistoryList
          history={history}
          onSelectHistoryItem={handleSelectHistoryItem}
          onClearHistory={handleClearHistory}
          currentAudioId={currentAudioId || undefined}
          isZhMode={isZhMode}
        />
      </main>

      {/* Sound Design Studio Modal */}
      <SoundDesignModal
        isOpen={isSoundDesignModalOpen}
        onClose={() => setIsSoundDesignModalOpen(false)}
        soundDesignPrompt={soundDesignPrompt}
        setSoundDesignPrompt={setSoundDesignPrompt}
        isSoundDesignActive={isSoundDesignActive}
        setIsSoundDesignActive={setIsSoundDesignActive}
        onLoadCompanionScript={handleLoadCompanionScript}
        isZhMode={isZhMode}
      />

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-4 mt-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span>Powered by</span>
            <span className="font-semibold text-slate-200">Gemini 3.8 Flash TTS</span>
            <span>· 台灣華語 (Taiwanese Mandarin) 24kHz Studio Audio</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>自訂聲音設計 (Sound Design)</span>
            <span>·</span>
            <span>6 款神經網絡音色</span>
            <span>·</span>
            <span>繁體中文智慧排版</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
