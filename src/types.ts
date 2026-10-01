export interface VoiceProfile {
  id: string;
  name: string;
  gender: 'Female' | 'Male';
  personality: string;
  personalityZh: string;
  description: string;
  descriptionZh: string;
  samplePitch: string;
}

export type ToneKey =
  // Taiwanese Mandarin Presets
  | 'tw_conversational'
  | 'tw_storyteller'
  | 'tw_professional'
  | 'tw_podcast'
  | 'tw_meditative'
  | 'tw_guide'
  // General Presets
  | 'conversational'
  | 'storyteller'
  | 'professional'
  | 'energetic'
  | 'meditative'
  | 'documentary'
  | 'dramatic'
  | 'custom';

export type SpeedPaceKey =
  | 'tw_slow'
  | 'tw_natural'
  | 'tw_brisk'
  | 'slow'
  | 'natural'
  | 'brisk'
  | 'dynamic';

export interface TTSRequestPayload {
  text: string;
  voiceName: string;
  model: 'gemini-3.8-flash-tts' | 'gemini-3.8-flash-lite-tts';
  tone: ToneKey;
  customTonePrompt?: string;
  soundDesignPrompt?: string;
  isSoundDesignActive?: boolean;
  readingSpeed: SpeedPaceKey;
  accent?: 'taiwanese' | 'standard';
}

export interface TTSResponseData {
  audioBase64: string;
  mimeType: string;
  wordCount: number;
  chineseChars?: number;
  hasChinese?: boolean;
  characterCount: number;
  estimatedSeconds: number;
  chunksProcessed: number;
  modelUsed: string;
  voiceUsed: string;
  toneUsed: string;
  speedUsed: string;
  accentUsed?: string;
  soundDesignUsed?: boolean;
  styleDirective: string;
}

export interface AudioHistoryItem {
  id: string;
  createdAt: number;
  textExcerpt: string;
  fullText: string;
  audioUrl: string;
  audioBase64: string;
  voiceName: string;
  tone: string;
  speedPace: string;
  accentUsed?: string;
  soundDesignUsed?: boolean;
  wordCount: number;
  chineseChars?: number;
  durationSeconds?: number;
}
