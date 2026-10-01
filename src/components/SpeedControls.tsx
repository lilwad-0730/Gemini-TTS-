import React from 'react';
import { Gauge, FastForward } from 'lucide-react';
import { SpeedPaceKey } from '../types';

interface SpeedControlsProps {
  readingSpeed: SpeedPaceKey;
  onSelectReadingSpeed: (speed: SpeedPaceKey) => void;
  playbackRate: number;
  onChangePlaybackRate: (rate: number) => void;
  isZhMode?: boolean;
}

const PACE_PRESETS: {
  key: SpeedPaceKey;
  label: string;
  labelZh: string;
  desc: string;
  descZh: string;
  icon: string;
}[] = [
  {
    key: 'tw_natural',
    label: 'Natural Pace',
    labelZh: '自然標準語速',
    desc: 'Smooth Taiwanese tempo (~230 char/min)',
    descZh: '自然親切的台灣日常語速 (~230 字/分)',
    icon: '🎙️',
  },
  {
    key: 'tw_slow',
    label: 'Gentle & Relaxed',
    labelZh: '舒緩輕慢語速',
    desc: 'Spacious calm pauses (~170 char/min)',
    descZh: '氣定神閒、留白舒適 (~170 字/分)',
    icon: '☕',
  },
  {
    key: 'tw_brisk',
    label: 'Brisk & Crisp',
    labelZh: '明快流暢語速',
    desc: 'Lively fast cadence (~300 char/min)',
    descZh: '節奏俐落緊湊、充滿朝氣 (~300 字/分)',
    icon: '⚡',
  },
  {
    key: 'dynamic',
    label: 'Dynamic Prosody',
    labelZh: '抑揚頓挫情感',
    desc: 'Adaptive tempo shifting with mood',
    descZh: '根據標點與文意起伏自然變換節奏',
    icon: '🌊',
  },
];

const PLAYBACK_RATE_PRESETS = [0.75, 1.0, 1.25, 1.5, 1.75, 2.0];

export const SpeedControls: React.FC<SpeedControlsProps> = ({
  readingSpeed,
  onSelectReadingSpeed,
  playbackRate,
  onChangePlaybackRate,
  isZhMode = true,
}) => {
  return (
    <div className="space-y-4">
      {/* AI Speech Synthesis Cadence */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/20">
              <Gauge className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">
                {isZhMode ? '台灣華語朗讀語速與節奏' : 'Reading Speed & Cadence'}
              </h3>
              <p className="text-[11px] text-slate-400">
                {isZhMode
                  ? '指揮 Gemini Flash TTS 模型的換氣間隔、停頓節奏與發音快慢'
                  : 'Directs how Gemini Flash TTS models rhythm and natural breath pauses'}
              </p>
            </div>
          </div>
        </div>

        {/* 4 Pacing Presets */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {PACE_PRESETS.map((p) => {
            const isSelected = readingSpeed === p.key;
            return (
              <button
                key={p.key}
                type="button"
                onClick={() => onSelectReadingSpeed(p.key)}
                className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between ${
                  isSelected
                    ? 'bg-orange-500/15 border-orange-500/60 ring-2 ring-orange-500/20 text-white shadow-md'
                    : 'bg-slate-900/60 hover:bg-slate-800/80 border-slate-800 hover:border-slate-700 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-base">{p.icon}</span>
                  <span className="text-xs font-semibold">
                    {isZhMode ? p.labelZh : p.label}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 line-clamp-2">
                  {isZhMode ? p.descZh : p.desc}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Real-time Playback Rate Control */}
      <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-200">
            <FastForward className="w-3.5 h-3.5 text-amber-400" />
            <span>{isZhMode ? '播放器即時倍速調整：' : 'Interactive Playback Rate:'}</span>
            <span className="text-amber-400 font-bold ml-1">{playbackRate.toFixed(2)}x</span>
          </div>
          <span className="text-[11px] text-slate-400">
            {isZhMode ? '無需重新生成，立即變更播放速度' : 'Instant audio speedup / slowdown'}
          </span>
        </div>

        {/* Slider & Presets */}
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-slate-400 font-mono">0.5x</span>
          <input
            type="range"
            min={0.5}
            max={2.5}
            step={0.05}
            value={playbackRate}
            onChange={(e) => onChangePlaybackRate(parseFloat(e.target.value))}
            className="flex-1 accent-orange-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
          />
          <span className="text-[11px] text-slate-400 font-mono">2.5x</span>
        </div>

        <div className="flex items-center justify-between gap-1 pt-1">
          {PLAYBACK_RATE_PRESETS.map((rate) => (
            <button
              key={rate}
              type="button"
              onClick={() => onChangePlaybackRate(rate)}
              className={`px-2 py-0.5 rounded text-[11px] font-mono transition ${
                Math.abs(playbackRate - rate) < 0.02
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {rate.toFixed(2).replace(/\.00$/, '')}x
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
