# Vocalis — Gemini TTS 語音工作室

以台灣華語為主要使用情境的文字轉語音網頁工具。輸入文稿、選擇音色與聲音風格，再透過伺服器呼叫 Google Gemini 生成音訊，於瀏覽器播放與下載。

> 本文件依目前原始碼整理。模型名稱、套件版本相容性及實際音訊生成／播放尚未完成端到端驗證。

## 功能

| 功能 | 說明 |
| --- | --- |
| 文稿編輯 | 貼上文字、拖曳或選取文字檔，清除內容、整理空白與換行 |
| 檔案匯入 | 支援文字 MIME 類型及 `.txt`、`.md`、`.markdown`、`.json`、`.csv`、`.tsv`、`.rtf`、`.log`；目前以純文字讀取 |
| 文稿統計 | 中文字數、英文單字數、字元數與預估朗讀時間 |
| 六款音色 | Kore、Puck、Charon、Fenrir、Zephyr、Aoede |
| 語氣設定 | 台灣日常對話、文藝說書、Podcast、專業主播、冥想、導覽，以及自訂提示詞 |
| 聲音設計 | 透過提示詞描述角色、音域、情緒與節奏；內建年輕母親、深夜老友、長者說故事預設 |
| 語速控制 | 生成時的朗讀節奏與播放時的 0.5～2.5 倍速分別調整 |
| 音訊播放器 | 播放／暫停、進度跳轉、音量、靜音、音訊視覺化與 `.wav` 下載 |
| 本次生成紀錄 | 保留最近 20 筆，可重新播放、下載或清空 |
| 範例與介面 | 七篇中英文範例文稿，繁體中文／英文介面切換 |

聲音設計預設為啟用狀態；啟用後，其提示詞會優先取代一般語氣與朗讀節奏指令。若要使用一般語氣選項，請先切換為一般預設。

## 技術架構

- 前端：React、TypeScript、Vite、Tailwind CSS、Lucide React。
- 後端：Express、dotenv、Google GenAI SDK（`@google/genai`）。
- 音訊：瀏覽器 HTML Audio 與 Web Audio API。
- 同一個 Express 服務提供 API；開發時整合 Vite，正式環境提供 `dist/` 靜態檔案。

```text
瀏覽器文稿與聲音設定
        ↓ POST /api/tts/generate
Express 後端（從環境變數讀取 API key）
        ↓ Google GenAI SDK
Google Gemini
        ↓ 音訊資料
後端回傳 Base64 → 瀏覽器播放、下載與本次生成紀錄
```

## 本機啟動

### 1. 準備環境

- 安裝與 `package.json` 中 Vite／其他套件相容的 Node.js 與 npm。
- 準備可使用目標 Gemini TTS 模型的 API key。
- 生成語音需要網路連線與可用 API 配額。

```sh
git clone https://github.com/lilwad-0730/Gemini-TTS-.git
cd Gemini-TTS-
npm install
```

目前未提交套件鎖定檔，實際安裝版本可能隨時間改變；若安裝失敗，請先確認套件版本與 Node.js 相容性。

### 2. 設定環境變數

將 `.env.example` 複製為 `.env`。

Windows PowerShell：

```powershell
Copy-Item .env.example .env
```

macOS／Linux：

```sh
cp .env.example .env
```

編輯 `.env`，填入自己的 key：

```dotenv
GEMINI_API_KEY=YOUR_GEMINI_API_KEY
```

| 變數 | 用途 |
| --- | --- |
| `GEMINI_API_KEY` | 語音生成必要，由後端讀取 |
| `PORT` | 選填，預設 `3000` |
| `NODE_ENV` | 設為 `production` 時提供正式建置檔案 |
| `DISABLE_HMR` | 設為 `true` 時停用開發 HMR 與檔案監看 |
| `APP_URL` | 範例環境檔保留的欄位，目前程式未使用 |

`.env` 已被 `.gitignore` 排除。請勿將真實 key 寫入程式、README 或前端環境變數。

### 3. 啟動開發服務

```sh
npm run dev
```

開啟 [http://localhost:3000](http://localhost:3000)。若設定了 `PORT`，請使用對應連接埠。

## 使用方式

1. 輸入文稿、匯入文字檔，或從頂端選取範例。
2. 選擇音色。
3. 編輯聲音設計提示詞；或停用聲音設計，改用一般語氣與朗讀節奏。
4. 按下生成，等待後端回傳音訊。
5. 使用播放器試聽、調整倍速，或下載音訊。

生成紀錄僅存於目前頁面的記憶體，重新整理或關閉頁面後會消失。需要保留的音訊請先下載。

## 建置與正式啟動

```sh
npm run build
```

macOS／Linux：

```sh
npm start
```

Windows PowerShell（現有 `npm start` 使用 POSIX 環境變數語法）：

```powershell
$env:NODE_ENV = "production"
npx tsx server.ts
```

正式服務仍需具備 Node.js、後端執行依賴與 `GEMINI_API_KEY`。`npm run preview` 只提供 Vite 靜態預覽，不會啟動 Express 的 TTS API。

## 指令

| 指令 | 用途 |
| --- | --- |
| `npm run dev` | 啟動 Express 與 Vite 開發服務 |
| `npm run build` | 建置前端至 `dist/` |
| `npm start` | 以 production 模式啟動 Express，適用支援 POSIX 語法的 shell |
| `npm run preview` | 預覽前端建置結果，不提供 TTS API |
| `npm run lint` | 執行 TypeScript 型別檢查（`tsc --noEmit`） |
| `npm run clean` | 刪除 `dist/` 與 `server.js`，需支援 `rm` 的 shell |

## API

| 方法與路徑 | 說明 |
| --- | --- |
| `GET /api/health` | 回傳服務狀態、是否設定 key 與程式中的模型名稱；不回傳 key，也不驗證 key 是否有效 |
| `GET /api/voices` | 回傳後端定義的六款音色 |
| `POST /api/tts/generate` | 接收文稿與聲音設定，回傳音訊 Base64 及生成資訊 |

生成請求範例：

```json
{
  "text": "你好，歡迎來到 Vocalis 語音工作室。",
  "voiceName": "Kore",
  "model": "gemini-3.8-flash-tts",
  "tone": "tw_conversational",
  "readingSpeed": "tw_natural",
  "accent": "taiwanese",
  "isSoundDesignActive": false
}
```

可選欄位包括 `customTonePrompt` 與 `soundDesignPrompt`。成功回應包含 `audioBase64`、`mimeType`、字數、預估時長、分段數與使用的聲音設定。

目前程式使用 `gemini-3.8-flash-tts` 與 `gemini-3.8-flash-lite-tts` 兩個模型字串。這些是原始碼中的設定，並非已驗證可用的模型清單。若 API 回報模型不存在或無權限，請依 [Google 官方 TTS 文件](https://ai.google.dev/gemini-api/docs/speech-generation)核對，並同步調整後端、前端模型選單與型別。

## 資料傳輸與部署注意事項

- 選取檔案時由瀏覽器讀取內容；按下生成後，文稿與聲音提示詞會傳至後端及 Google Gemini。請確認內容適合交給外部服務處理。
- 目前沒有資料庫或伺服器端文稿／音訊儲存功能；後端會輸出生成錯誤日誌，部署平台也可能保留日誌。
- API key 只由後端使用，但生成 API 目前沒有登入驗證、限流或使用者配額。公開部署前應補上存取與用量保護。
- 目前錯誤回應會包含原始錯誤訊息及可能的 stack trace。公開部署前應改為固定對外訊息，並避免將敏感內容寫入日誌。
- 伺服器監聽 `0.0.0.0`，可達範圍取決於防火牆與部署網路設定。公開服務應使用 HTTPS 與 production 模式。

## 目前限制

- 每次文稿上限為 15,000 字元。
- 有文字分段與音訊串接邏輯，但中文長句及無標點長文未必能維持預期的分段長度。
- 匯入檔案以純文字讀取，不包含 PDF／Word 解析；RTF、JSON、CSV 也不會轉換為整理過的朗讀內容。
- 聲音角色、口音、語速與情緒是提示詞指導，實際效果取決於模型回應。
- 程式將回應標示為 `audio/wav`，串接邏輯假設特定 WAV 標頭格式；尚未驗證模型實際回傳的音訊格式與播放相容性。
- 未提供自動化測試套件；`npm run lint` 是型別檢查，不代表 API 與音訊流程已通過實測。

## 目錄

```text
server.ts                  Express API、Gemini 呼叫、文字分段與音訊串接
src/App.tsx                生成流程、設定與本次生成紀錄
src/components/            文稿編輯、音色／語氣選單、播放器與聲音設計視窗
src/constants/samples.ts   範例文稿
src/constants/soundDesign.ts 聲音設計提示詞
src/types.ts               請求、回應與生成紀錄型別
vite.config.ts             前端建置與開發設定
.env.example               環境變數範例
```
