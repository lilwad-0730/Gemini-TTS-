import React from 'react';
import { History, Play, Download, Trash2, Clock, Volume2 } from 'lucide-react';
import { AudioHistoryItem } from '../types';

interface HistoryListProps {
  history: AudioHistoryItem[];
  onSelectHistoryItem: (item: AudioHistoryItem) => void;
  onClearHistory: () => void;
  currentAudioId?: string;
  isZhMode?: boolean;
}

export const HistoryList: React.FC<HistoryListProps> = ({
  history,
  onSelectHistoryItem,
  onClearHistory,
  currentAudioId,
  isZhMode = true,
}) => {
  if (history.length === 0) return null;

  return (
    <div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-4 sm:p-5 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/20">
            <History className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">
              {isZhMode ? '語音生成記錄與版本對比' : 'Audio Take History'}
            </h3>
            <p className="text-[11px] text-slate-400">
              {isZhMode
                ? '回放、比較不同發音人、口吻或語速的台灣華語生成成果'
                : 'Compare audio generations with different voice styles & speeds'}
            </p>
          </div>
        </div>

        <button
          onClick={onClearHistory}
          className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-rose-400 transition"
        >
          <Trash2 className="w-3 h-3" />
          <span>{isZhMode ? '清空記錄' : 'Clear History'}</span>
        </button>
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
        {history.map((item) => {
          const isCurrent = currentAudioId === item.id;
          const timeStr = new Date(item.createdAt).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          });

          return (
            <div
              key={item.id}
              className={`p-3 rounded-xl border transition flex items-center justify-between gap-3 ${
                isCurrent
                  ? 'bg-orange-500/10 border-orange-500/40 ring-1 ring-orange-500/30'
                  : 'bg-slate-950/40 hover:bg-slate-800/60 border-slate-800/80'
              }`}
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="font-semibold text-xs text-white flex items-center gap-1">
                    <Volume2 className="w-3 h-3 text-orange-400" />
                    {item.voiceName}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                    {item.tone}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                    {item.speedPace}
                  </span>
                  {item.chineseChars ? (
                    <span className="text-[10px] text-amber-400/90 bg-amber-500/10 px-1.5 py-0.2 rounded-full border border-amber-500/20">
                      {item.chineseChars} 字
                    </span>
                  ) : null}
                  <span className="text-[10px] text-slate-400 flex items-center gap-1 ml-auto">
                    <Clock className="w-2.5 h-2.5" />
                    {timeStr}
                  </span>
                </div>
                <p className="text-xs text-slate-400 truncate font-sans">
                  「{item.textExcerpt}」
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => onSelectHistoryItem(item)}
                  className={`p-2 rounded-lg text-xs font-medium transition flex items-center gap-1 ${
                    isCurrent
                      ? 'bg-orange-500 text-white shadow-sm'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                  }`}
                  title="回放此版本"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span className="hidden sm:inline">{isZhMode ? '播放' : 'Play'}</span>
                </button>
                <a
                  href={`data:audio/wav;base64,${item.audioBase64}`}
                  download={`tw-vocal-${item.voiceName.toLowerCase()}-${item.tone}-${Date.now()}.wav`}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
                  title="下載 WAV 檔案"
                >
                  <Download className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
