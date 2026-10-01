import React, { useRef, useState } from 'react';
import {
  UploadCloud,
  FileText,
  X,
  Sparkles,
  Trash2,
  CheckCircle2,
  Clock,
  Type,
  FileCode,
  Wand2,
} from 'lucide-react';

interface FileUploadZoneProps {
  text: string;
  setText: (text: string) => void;
  readingSpeed: string;
  isZhMode?: boolean;
}

export const FileUploadZone: React.FC<FileUploadZoneProps> = ({
  text,
  setText,
  readingSpeed,
  isZhMode = true,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileProcess = (file: File) => {
    const validExtensions = [
      '.txt',
      '.md',
      '.markdown',
      '.json',
      '.csv',
      '.tsv',
      '.rtf',
      '.log',
    ];
    const isTextLike =
      file.type.startsWith('text/') ||
      validExtensions.some((ext) => file.name.toLowerCase().endsWith(ext));

    if (!isTextLike) {
      alert(
        isZhMode
          ? '請上傳文字格式檔案（.txt, .md, .csv, .json, .rtf, .log）。'
          : 'Please upload a text file (.txt, .md, .json, .csv, .rtf, .log).'
      );
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content) {
        setText(content);
        setFileName(file.name);
        setFileSize((file.size / 1024).toFixed(1) + ' KB');
      }
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleClear = () => {
    setText('');
    setFileName(null);
    setFileSize(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFormatText = () => {
    // Clean redundant spaces, standardize line breaks
    const cleaned = text
      .replace(/[ \t]+/g, ' ')
      .replace(/\n\s*\n\s*\n+/g, '\n\n')
      .trim();
    setText(cleaned);
  };

  const insertTag = (tag: string) => {
    setText(text + (text.endsWith(' ') ? '' : ' ') + tag + ' ');
  };

  // Accurate Mandarin Chinese & Latin metrics calculation
  const trimmed = text.trim();
  const hasChinese = /[\u4e00-\u9fa5\u3400-\u4dbf]/.test(trimmed);
  const chineseCharCount = (trimmed.match(/[\u4e00-\u9fa5\u3400-\u4dbf]/g) || []).length;
  const latinWordCount = trimmed
    .replace(/[\u4e00-\u9fa5\u3400-\u4dbf]/g, ' ')
    .split(/\s+/)
    .filter(Boolean).length;

  const totalWordsOrChars = hasChinese
    ? chineseCharCount + latinWordCount
    : trimmed
    ? trimmed.split(/\s+/).filter(Boolean).length
    : 0;

  const totalRawChars = text.length;

  // Duration calculation
  let cpm = 230; // Chinese characters per minute
  if (readingSpeed === 'tw_slow' || readingSpeed === 'slow') cpm = 170;
  else if (readingSpeed === 'tw_brisk' || readingSpeed === 'brisk') cpm = 300;

  let totalSeconds = 0;
  if (hasChinese) {
    totalSeconds = Math.round((chineseCharCount / cpm) * 60 + (latinWordCount / 140) * 60);
  } else {
    const wpm = readingSpeed === 'slow' ? 110 : readingSpeed === 'brisk' ? 175 : 140;
    totalSeconds = Math.round((totalWordsOrChars / wpm) * 60);
  }

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const formattedDuration = `${minutes}分 ${seconds.toString().padStart(2, '0')}秒`;

  return (
    <div className="flex flex-col h-full bg-slate-900/60 rounded-2xl border border-slate-800 p-4 sm:p-5 shadow-xl">
      {/* Top Header & File Upload Prompt */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/20">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">
              {isZhMode ? '華語文本輸入與文件上傳' : 'Document & Chinese Script'}
            </h2>
            <p className="text-[11px] text-slate-400">
              {isZhMode
                ? '支援繁體中文、簡體中文輸入或拖曳上傳 .txt / .md 文件'
                : 'Input Mandarin characters or upload files (.txt, .md, .csv)'}
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {text && (
            <>
              <button
                type="button"
                onClick={handleFormatText}
                className="flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition border border-slate-700/60"
                title="清除多餘空格與排版整理"
              >
                <Wand2 className="w-3 h-3 text-amber-400" />
                <span>{isZhMode ? '排版整理' : 'Format'}</span>
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg bg-slate-800/80 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition border border-rose-500/20"
                title="清空所有內容"
              >
                <Trash2 className="w-3 h-3" />
                <span>{isZhMode ? '清空' : 'Clear'}</span>
              </button>
            </>
          )}

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white transition shadow-sm"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>{isZhMode ? '上傳文字檔' : 'Upload File'}</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.md,.markdown,.json,.csv,.tsv,.rtf,.log"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                handleFileProcess(e.target.files[0]);
              }
            }}
          />
        </div>
      </div>

      {/* Active File Banner (if uploaded) */}
      {fileName && (
        <div className="mt-3 flex items-center justify-between px-3 py-2 rounded-xl bg-orange-500/10 border border-orange-500/20 text-xs">
          <div className="flex items-center gap-2 overflow-hidden">
            <CheckCircle2 className="w-4 h-4 text-orange-400 shrink-0" />
            <span className="font-medium text-slate-200 truncate">{fileName}</span>
            <span className="text-[10px] text-slate-400">({fileSize})</span>
          </div>
          <button
            onClick={() => {
              setFileName(null);
              setFileSize(null);
            }}
            className="text-slate-400 hover:text-slate-200 p-0.5 rounded transition"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Drag & Drop Overlay or Textarea Container */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`relative mt-3 flex-1 flex flex-col rounded-xl border transition-all ${
          isDragging
            ? 'border-dashed border-orange-400 bg-orange-500/10 ring-4 ring-orange-500/20'
            : 'border-slate-800 bg-slate-950/60 focus-within:border-orange-500/50'
        }`}
      >
        {isDragging ? (
          <div className="flex flex-col items-center justify-center h-64 text-center p-6">
            <UploadCloud className="w-12 h-12 text-orange-400 animate-bounce mb-3" />
            <p className="text-sm font-semibold text-white">
              {isZhMode ? '放開滑鼠以載入您的文字檔案' : 'Drop your text file here'}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              支援 .txt, .md, .markdown, .csv, .json, .rtf 格式
            </p>
          </div>
        ) : (
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={
              isZhMode
                ? `請在此輸入您想轉為台灣華語語音的中文字句、段落或有聲書稿件……

例如：
「午後的陽光穿透山嵐，灑在九份依山而建的石階上。老茶館裡茶香裊裊，窗外是蔚藍遼闊的太平洋……」

提示：Gemini Flash TTS 能理解標點符號（如逗號、頓號、省略號 ……）來產生自然道地的台灣腔調停頓與換氣。`
                : 'Type, paste, or drop your Mandarin script here...'
            }
            className="w-full flex-1 min-h-[260px] p-4 bg-transparent text-slate-200 placeholder-slate-500 text-sm leading-relaxed resize-none focus:outline-none font-sans"
            spellCheck="false"
          />
        )}

        {/* Vocal burst & Taiwan Expression Tags */}
        <div className="px-3 py-2 border-t border-slate-800/80 bg-slate-900/40 flex flex-wrap items-center gap-1.5 text-xs text-slate-400">
          <span className="text-[11px] text-slate-400 mr-1 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" />
            {isZhMode ? '語氣與呼吸標籤：' : 'Vocal tags:'}
          </span>
          {[
            { tag: '<breath>', label: isZhMode ? '自然深呼吸' : 'Breath' },
            { tag: '<laugh>', label: isZhMode ? '笑聲' : 'Laugh' },
            { tag: '<gasp>', label: isZhMode ? '驚嘆聲' : 'Gasp' },
            { tag: '|mhm|', label: '嗯嗯 |mhm|' },
            { tag: '|yeah|', label: '對啊 |yeah|' },
          ].map((item) => (
            <button
              key={item.tag}
              type="button"
              onClick={() => insertTag(item.tag)}
              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-300 text-[11px] font-mono border border-slate-700/60 transition"
              title={`插入 ${item.tag} 以增強情感表現力`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Script Metrics Footer */}
      <div className="mt-3 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2 pt-1">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <Type className="w-3.5 h-3.5 text-slate-400" />
            <span>
              {hasChinese ? (
                <>
                  中文 <strong className="text-slate-200 font-semibold">{chineseCharCount}</strong> 字
                  {latinWordCount > 0 && ` + 英文 ${latinWordCount} 詞`}
                </>
              ) : (
                <>
                  <strong className="text-slate-200 font-semibold">{totalWordsOrChars.toLocaleString()}</strong> words
                </>
              )}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <FileCode className="w-3.5 h-3.5 text-slate-400" />
            <span>
              總字元 <strong className="text-slate-200 font-semibold">{totalRawChars.toLocaleString()}</strong>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-amber-400/90 font-medium">
          <Clock className="w-3.5 h-3.5 text-amber-400" />
          <span>
            {isZhMode ? '預計朗讀時間：' : 'Est. Duration: '}
            <strong className="text-amber-300 font-semibold">{formattedDuration}</strong>
          </span>
        </div>
      </div>
    </div>
  );
};
