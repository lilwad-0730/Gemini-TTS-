import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);

app.use(express.json({ limit: '20mb' }));

// Helper to initialize GoogleGenAI with proper telemetry headers
function getGenAIClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured on the server.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Function to chunk large text safely by sentences / paragraphs
function splitTextIntoChunks(text: string, maxChunkLength = 1200): string[] {
  const clean = text.trim();
  if (clean.length <= maxChunkLength) {
    return [clean];
  }

  // Split into paragraphs first
  const paragraphs = clean.split(/\n\s*\n/);
  const chunks: string[] = [];
  let currentChunk = '';

  for (const para of paragraphs) {
    const trimmedPara = para.trim();
    if (!trimmedPara) continue;

    if ((currentChunk + '\n\n' + trimmedPara).trim().length <= maxChunkLength) {
      currentChunk = currentChunk ? currentChunk + '\n\n' + trimmedPara : trimmedPara;
    } else {
      // If single paragraph is larger than maxChunkLength, split by sentences
      if (trimmedPara.length > maxChunkLength) {
        if (currentChunk) {
          chunks.push(currentChunk);
          currentChunk = '';
        }
        const sentences = trimmedPara.match(/[^.!?]+[.!?]+|\S+/g) || [trimmedPara];
        for (const sentence of sentences) {
          const s = sentence.trim();
          if (!s) continue;
          if ((currentChunk + ' ' + s).trim().length <= maxChunkLength) {
            currentChunk = currentChunk ? currentChunk + ' ' + s : s;
          } else {
            if (currentChunk) chunks.push(currentChunk);
            currentChunk = s;
          }
        }
      } else {
        if (currentChunk) chunks.push(currentChunk);
        currentChunk = trimmedPara;
      }
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk);
  }

  return chunks.length > 0 ? chunks : [clean];
}

// Helper to concatenate 24kHz mono 16-bit PCM WAV buffers with a correct single RIFF header
function concatWavBuffers(wavBuffers: Buffer[]): Buffer {
  if (wavBuffers.length === 0) return Buffer.alloc(0);
  if (wavBuffers.length === 1) return wavBuffers[0];

  const pcmList: Buffer[] = [];
  let totalPcmLength = 0;

  for (const buf of wavBuffers) {
    if (buf.length > 44 && buf.toString('ascii', 0, 4) === 'RIFF') {
      const pcm = buf.subarray(44);
      pcmList.push(pcm);
      totalPcmLength += pcm.length;
    } else {
      pcmList.push(buf);
      totalPcmLength += buf.length;
    }
  }

  // Build a 44-byte RIFF WAV header based on the first valid buffer
  const header = Buffer.alloc(44);
  wavBuffers[0].copy(header, 0, 0, 44);

  // Update ChunkSize (36 + data size)
  header.writeUInt32LE(36 + totalPcmLength, 4);
  // Update Subchunk2Size (data size)
  header.writeUInt32LE(totalPcmLength, 40);

  return Buffer.concat([header, ...pcmList]);
}

// Available voice profiles
const VOICES = [
  {
    id: 'Kore',
    name: 'Kore',
    gender: 'Female',
    personality: 'Warm & Melodious',
    description: 'Natural, inviting tone. Excellent for storytelling, guides, audiobooks, and general reading.',
    samplePitch: 'Medium Warm',
  },
  {
    id: 'Puck',
    name: 'Puck',
    gender: 'Male',
    personality: 'Youthful & Dynamic',
    description: 'Bright, lively, and articulate. Ideal for podcasts, modern tutorials, and conversational scripts.',
    samplePitch: 'Mid-High Energetic',
  },
  {
    id: 'Charon',
    name: 'Charon',
    gender: 'Male',
    personality: 'Deep & Resonant',
    description: 'Calm, grounded, and authoritative. Superb for documentaries, business reports, and formal essays.',
    samplePitch: 'Deep Baritone',
  },
  {
    id: 'Fenrir',
    name: 'Fenrir',
    gender: 'Male',
    personality: 'Bold & Confident',
    description: 'Strong, crisp, and commanding. Great for announcements, dramatic reads, and persuasive talks.',
    samplePitch: 'Mid-Deep Strong',
  },
  {
    id: 'Zephyr',
    name: 'Zephyr',
    gender: 'Female',
    personality: 'Gentle & Serene',
    description: 'Soft, soothing, and peaceful. Perfect for meditation, wellness guides, and relaxed bedtime reading.',
    samplePitch: 'Soft Warm',
  },
  {
    id: 'Aoede',
    name: 'Aoede',
    gender: 'Female',
    personality: 'Expressive & Refined',
    description: 'Lyrical, articulate, and poised. Great for literary fiction, poetry, and polished presentations.',
    samplePitch: 'Clear Soprano',
  },
];

// Tone presets mapping
const TONE_DIRECTIVES: Record<string, string> = {
  // English presets
  conversational: 'Deliver in a warm, natural, and engaging everyday conversational tone. Friendly, clear, and relatable.',
  professional: 'Deliver in a polished, confident, and professional executive tone. Crisp articulation and formal clarity.',
  storyteller: 'Deliver as an immersive, evocative audiobook storyteller. Expressive cadence, emotional depth, and vivid nuance.',
  energetic: 'Deliver with high vitality, enthusiasm, and upbeat energy. Bright, dynamic, and inspiring cadence.',
  meditative: 'Deliver with a gentle, serene, and calm demeanor. Soft-spoken, soothing, and mindful pacing.',
  documentary: 'Deliver with an authoritative, inquisitive, and measured documentary narration style.',
  dramatic: 'Deliver with theatrical intensity, dramatic suspense, and evocative pauses.',

  // Authentic Taiwanese Mandarin presets (台灣華語 / 台灣國語)
  tw_conversational: 'Speak in warm, friendly, natural everyday Taiwanese conversational Mandarin (台灣日常國語口音). Friendly, gentle, warm, and approachable like chatting with a close friend in Taiwan, with soft retroflex consonants and natural conversational softness.',
  tw_storyteller: 'Speak in warm, evocative Taiwanese storytelling Mandarin (台灣文藝廣播 / 暖心說書腔調). Rich emotional resonance, gentle poetic pauses, and comforting literary cadence.',
  tw_professional: 'Speak in professional Taiwanese broadcast Mandarin (台灣專業廣播與新聞主播腔調). Articulate, crisp, steady, authoritative yet warm, courteous, and clear.',
  tw_podcast: 'Speak in lively, energetic, and expressive Taiwanese podcast host Mandarin (台灣熱門 Podcast 活潑主持腔調). Bright, dynamic, smiling tone with engaging natural cadence.',
  tw_meditative: 'Speak in gentle, soothing, and serene Taiwanese mindfulness Mandarin (台灣療癒冥想 / 晚安語音腔調). Whisper-soft, peaceful, relaxed, and deeply calming.',
  tw_guide: 'Speak in elegant, melodic, and courteous Taiwanese audio guide Mandarin (台灣典雅導覽與捷運廣播風格). Polite, clear, and melodious.',
};

// Reading speed pace directives
const SPEED_PACE_DIRECTIVES: Record<string, string> = {
  slow: 'Pacing: Speak at a slow, measured, and deliberate pace with noticeable, calm pauses between sentences.',
  natural: 'Pacing: Speak at a natural, balanced, comfortable speaking tempo.',
  brisk: 'Pacing: Speak at a brisk, fast-paced, crisp and urgent cadence without lingering.',
  dynamic: 'Pacing: Vary speaking tempo dynamically according to the emotional gravity and rhythm of the phrases.',
  // Taiwanese Mandarin Pacing
  tw_slow: 'Pacing: Speak at a gentle, relaxed, and unhurried Taiwanese pace with pleasant breath pauses (約每分鐘 160-180 字).',
  tw_natural: 'Pacing: Speak at a natural, smooth, and standard Taiwanese speaking tempo (約每分鐘 220-250 字).',
  tw_brisk: 'Pacing: Speak at a brisk, lively, and crisp Taiwanese tempo (約每分鐘 280-320 字).',
};

// API: Voices list
app.get('/api/voices', (_req, res) => {
  res.json({ voices: VOICES });
});

// API: Health / Secret check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    modelSupported: ['gemini-3.8-flash-tts', 'gemini-3.8-flash-lite-tts'],
  });
});

// API: TTS Generation
app.post('/api/tts/generate', async (req, res) => {
  try {
    const {
      text,
      voiceName = 'Kore',
      model = 'gemini-3.8-flash-tts',
      tone = 'tw_conversational',
      customTonePrompt = '',
      soundDesignPrompt = '',
      isSoundDesignActive = false,
      readingSpeed = 'tw_natural',
      accent = 'taiwanese',
    } = req.body;

    if (!text || typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({ error: 'Text content is required.' });
    }

    const trimmedText = text.trim();
    if (trimmedText.length > 15000) {
      return res.status(400).json({
        error: 'Text length exceeds 15,000 characters. Please split or summarize your document.',
      });
    }

    const ai = getGenAIClient();

    // Check if text has Chinese characters
    const hasChinese = /[\u4e00-\u9fa5\u3400-\u4dbf]/.test(trimmedText);
    const isTaiwaneseRequested = accent === 'taiwanese' || tone.startsWith('tw_') || hasChinese;

    let combinedStyle = '';
    const hasCustomSoundDesign = Boolean(isSoundDesignActive && soundDesignPrompt?.trim());

    if (hasCustomSoundDesign) {
      // Use user's dedicated Sound Design prompt
      combinedStyle = soundDesignPrompt.trim();
    } else {
      // Taiwanese accent directive
      const taiwaneseAccentRule = isTaiwaneseRequested
        ? 'Speak in authentic, natural Taiwanese Mandarin (台灣華語 / 台灣國語). Pronounce with characteristic Taiwanese phonetics: soft and gentle retroflex consonants (自然平舌輕柔捲舌), polite tone sandhi, musical cadence, and warm approachable intonation.'
        : '';

      // Determine tone directive
      let baseToneDirective = TONE_DIRECTIVES[tone] || TONE_DIRECTIVES.tw_conversational || TONE_DIRECTIVES.conversational;
      if (tone === 'custom' && customTonePrompt?.trim()) {
        baseToneDirective = `Custom style: ${customTonePrompt.trim()}`;
      }

      // Determine speed pace directive
      const speedDirective = SPEED_PACE_DIRECTIVES[readingSpeed] || SPEED_PACE_DIRECTIVES.tw_natural || SPEED_PACE_DIRECTIVES.natural;
      combinedStyle = [taiwaneseAccentRule, baseToneDirective, speedDirective].filter(Boolean).join(' ');
    }

    // Select valid model: Gemini Flash TTS ('gemini-3.8-flash-tts') or Lite TTS ('gemini-3.8-flash-lite-tts')
    const selectedModel = model === 'gemini-3.8-flash-lite-tts' ? 'gemini-3.8-flash-lite-tts' : 'gemini-3.8-flash-tts';

    // Verify voice
    const validVoiceNames = ['Puck', 'Charon', 'Kore', 'Fenrir', 'Zephyr', 'Aoede'];
    const chosenVoice = validVoiceNames.includes(voiceName) ? voiceName : 'Kore';

    // Chunk text if needed (Chinese sentences split cleanly by punctuation)
    const chunks = splitTextIntoChunks(trimmedText, 1000);
    const wavBuffers: Buffer[] = [];

    for (let i = 0; i < chunks.length; i++) {
      const chunkText = chunks[i];

      const response = await ai.models.generateContent({
        model: selectedModel,
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: chunkText,
                speechMetadata: {
                  style: combinedStyle,
                },
              },
            ],
          },
        ],
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: chosenVoice },
            },
          },
        },
      });

      const audioBase64 = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (!audioBase64) {
        throw new Error(`The model did not return audio data for chunk ${i + 1} of ${chunks.length}.`);
      }

      wavBuffers.push(Buffer.from(audioBase64, 'base64'));
    }

    const finalWavBuffer = concatWavBuffers(wavBuffers);
    const chineseChars = (trimmedText.match(/[\u4e00-\u9fa5\u3400-\u4dbf]/g) || []).length;
    const latinWords = trimmedText.replace(/[\u4e00-\u9fa5\u3400-\u4dbf]/g, ' ').split(/\s+/).filter(Boolean).length;
    const wordCount = hasChinese ? chineseChars + latinWords : trimmedText.split(/\s+/).filter(Boolean).length;

    // Taiwanese speech pace ~ 230 characters per minute (~3.8 char/sec)
    const estimatedSeconds = hasChinese
      ? Math.max(1, Math.round(chineseChars / 3.8 + latinWords / 2.3))
      : Math.max(1, Math.round(wordCount / 2.3));

    return res.json({
      audioBase64: finalWavBuffer.toString('base64'),
      mimeType: 'audio/wav',
      wordCount,
      chineseChars,
      hasChinese,
      characterCount: trimmedText.length,
      estimatedSeconds,
      chunksProcessed: chunks.length,
      modelUsed: selectedModel,
      voiceUsed: chosenVoice,
      toneUsed: tone,
      speedUsed: readingSpeed,
      accentUsed: isTaiwaneseRequested ? 'Taiwanese Mandarin (台灣華語)' : 'Standard',
      soundDesignUsed: hasCustomSoundDesign,
      styleDirective: combinedStyle,
    });
  } catch (error: any) {
    console.error('TTS Generation error:', error);
    const errorMessage = error?.message || 'Failed to synthesize audio with Gemini Flash TTS.';
    return res.status(500).json({
      error: errorMessage,
      details: error?.statusText || error?.stack || undefined,
    });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Vocalis Gemini Flash TTS Server running at http://0.0.0.0:${port}`);
  });
}

startServer();
