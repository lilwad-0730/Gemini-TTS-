import React, { useEffect, useRef, useState } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Download,
  Sparkles,
  FastForward,
  Rewind,
  Music,
} from 'lucide-react';
import { TTSResponseData } from '../types';

interface AudioPlayerProps {
  currentResult: TTSResponseData;
  playbackRate: number;
  onPlaybackRateChange: (rate: number) => void;
  isZhMode?: boolean;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  currentResult,
  playbackRate,
  onPlaybackRateChange,
  isZhMode = true,
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  // Web Audio Context for visualizer
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);

  const audioSrc = `data:${currentResult.mimeType || 'audio/wav'};base64,${currentResult.audioBase64}`;

  // Handle Playback rate sync
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  // Handle Audio Context & Visualizer initialization
  useEffect(() => {
    const audioEl = audioRef.current;
    if (!audioEl) return;

    const setupAudioContext = () => {
      try {
        if (!audioCtxRef.current) {
          const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
          const ctx = new AudioContextClass();
          const analyser = ctx.createAnalyser();
          analyser.fftSize = 64;

          const source = ctx.createMediaElementSource(audioEl);
          source.connect(analyser);
          analyser.connect(ctx.destination);

          audioCtxRef.current = ctx;
          analyserRef.current = analyser;
          sourceNodeRef.current = source;
        }
      } catch (err) {
        console.warn('Web Audio Analyser setup note:', err);
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(audioEl.duration || currentResult.estimatedSeconds || 0);
      audioEl.playbackRate = playbackRate;
      // Auto play on new generation
      audioEl.play().catch(() => {});
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audioEl.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    const handlePlay = () => {
      setIsPlaying(true);
      if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    audioEl.addEventListener('loadedmetadata', handleLoadedMetadata);
    audioEl.addEventListener('timeupdate', handleTimeUpdate);
    audioEl.addEventListener('ended', handleEnded);
    audioEl.addEventListener('play', handlePlay);
    audioEl.addEventListener('pause', handlePause);

    // Initial setup
    setupAudioContext();

    return () => {
      audioEl.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audioEl.removeEventListener('timeupdate', handleTimeUpdate);
      audioEl.removeEventListener('ended', handleEnded);
      audioEl.removeEventListener('play', handlePlay);
      audioEl.removeEventListener('pause', handlePause);
    };
  }, [audioSrc, currentResult]);

  // Waveform canvas rendering loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      const analyser = analyserRef.current;
      let dataArray: Uint8Array;

      if (analyser && isPlaying) {
        dataArray = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(dataArray as any);
      } else {
        // Fallback procedural wave bars when paused or before context starts
        dataArray = new Uint8Array(32);
        for (let i = 0; i < 32; i++) {
          dataArray[i] = isPlaying
            ? Math.floor(Math.sin(Date.now() / 200 + i) * 50 + 80)
            : 20;
        }
      }

      const barCount = 36;
      const barWidth = width / barCount - 2;

      for (let i = 0; i < barCount; i++) {
        const val = dataArray[i % dataArray.length] || 10;
        const normalized = val / 255;
        const barHeight = Math.max(4, normalized * (height - 6));
        const x = i * (barWidth + 2);
        const y = (height - barHeight) / 2;

        // Gradient coloring
        const grad = ctx.createLinearGradient(0, y, 0, y + barHeight);
        if (isPlaying) {
          grad.addColorStop(0, '#f97316'); // orange-500
          grad.addColorStop(1, '#eab308'); // yellow-500
        } else {
          grad.addColorStop(0, '#475569'); // slate-600
          grad.addColorStop(1, '#334155'); // slate-700
        }

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, 2);
        ctx.fill();
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [isPlaying]);

  // Spacebar toggle shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.code === 'Space' &&
        document.activeElement?.tagName !== 'TEXTAREA' &&
        document.activeElement?.tagName !== 'INPUT'
      ) {
        e.preventDefault();
        togglePlay();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }
      audioRef.current.play().catch(console.error);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const skipTime = (offset: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = Math.max(0, Math.min(duration, audioRef.current.currentTime + offset));
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    audioRef.current.muted = nextMuted;
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (audioRef.current) {
      audioRef.current.volume = val;
      audioRef.current.muted = val === 0;
      setIsMuted(val === 0);
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = audioSrc;
    const safeVoice = currentResult.voiceUsed.toLowerCase();
    const safeTone = currentResult.toneUsed.toLowerCase();
    link.download = `vocalis-${safeVoice}-${safeTone}-${Date.now()}.wav`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950 rounded-2xl border border-orange-500/30 p-5 shadow-2xl shadow-orange-950/20 space-y-4">
      {/* Hidden native audio element */}
      <audio ref={audioRef} src={audioSrc} preload="auto" />

      {/* Header Info */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center border border-orange-500/30">
            <Music className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-sm text-white">
                {isZhMode ? '已生成台灣華語音訊' : 'Synthesized Audio Output'}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                🇹🇼 台灣華語
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-300 border border-orange-500/20">
                24kHz Mono WAV
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              發音人：<strong className="text-slate-200">{currentResult.voiceUsed}</strong> · 語氣：{' '}
              <strong className="text-slate-200">{currentResult.toneUsed}</strong> · 語速：{' '}
              <strong className="text-slate-200">{currentResult.speedUsed}</strong> ·{' '}
              {currentResult.hasChinese
                ? `共 ${currentResult.chineseChars || currentResult.wordCount} 字`
                : `${currentResult.wordCount} words`}
            </p>
          </div>
        </div>

        {/* Download Button */}
        <button
          onClick={handleDownload}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 transition"
          title="下載高品質 WAV 音訊檔案"
        >
          <Download className="w-3.5 h-3.5 text-amber-400" />
          <span>{isZhMode ? '下載 WAV 檔' : 'Download .WAV'}</span>
        </button>
      </div>

      {/* Audio Waveform Canvas Visualizer */}
      <div className="h-16 w-full bg-slate-950/80 rounded-xl border border-slate-800/80 overflow-hidden flex items-center justify-center px-4">
        <canvas
          ref={canvasRef}
          width={600}
          height={64}
          className="w-full h-full object-contain"
        />
      </div>

      {/* Seek Progress Bar & Timestamps */}
      <div className="space-y-1">
        <div className="relative">
          <input
            type="range"
            min={0}
            max={duration || 100}
            step={0.1}
            value={currentTime}
            onChange={handleSeek}
            className="w-full accent-orange-500 h-2 bg-slate-800 rounded-lg cursor-pointer appearance-none"
          />
        </div>
        <div className="flex justify-between text-[11px] text-slate-400 font-mono">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
        {/* Playback Buttons */}
        <div className="flex items-center gap-2">
          {/* Skip -10s */}
          <button
            onClick={() => skipTime(-10)}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
            title="Rewind 10 seconds"
          >
            <Rewind className="w-4 h-4" />
          </button>

          {/* Big Play / Pause Button */}
          <button
            onClick={togglePlay}
            className="w-12 h-12 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white flex items-center justify-center shadow-lg shadow-orange-500/30 transition transform active:scale-95"
            title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-white" />
            ) : (
              <Play className="w-5 h-5 fill-white ml-0.5" />
            )}
          </button>

          {/* Skip +10s */}
          <button
            onClick={() => skipTime(10)}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
            title="Fast forward 10 seconds"
          >
            <FastForward className="w-4 h-4" />
          </button>

          {/* Replay */}
          <button
            onClick={() => {
              if (audioRef.current) {
                audioRef.current.currentTime = 0;
                audioRef.current.play().catch(() => {});
              }
            }}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition ml-1"
            title="Replay from start"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Speed Adjustment Chips */}
        <div className="flex items-center gap-1 bg-slate-950/60 p-1 rounded-xl border border-slate-800">
          <span className="text-[10px] text-slate-400 px-1 font-medium">Speed:</span>
          {[0.75, 1.0, 1.25, 1.5, 2.0].map((rate) => (
            <button
              key={rate}
              onClick={() => onPlaybackRateChange(rate)}
              className={`px-2 py-0.5 rounded-lg text-xs font-mono transition ${
                Math.abs(playbackRate - rate) < 0.05
                  ? 'bg-orange-500 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {rate}x
            </button>
          ))}
        </div>

        {/* Volume Slider */}
        <div className="flex items-center gap-2 min-w-[120px]">
          <button
            onClick={toggleMute}
            className="text-slate-400 hover:text-slate-200 transition"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-4 h-4 text-rose-400" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className="w-20 accent-orange-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            title={`Volume: ${Math.round((isMuted ? 0 : volume) * 100)}%`}
          />
        </div>
      </div>
    </div>
  );
};
