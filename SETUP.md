# Trammarise - Setup Guide

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up OpenAI API Key

Create a `.env.local` file in the project root:

```bash
# Get your API key from: https://platform.openai.com/api-keys
OPENAI_API_KEY=sk-your-actual-api-key-here
```

**Important:** Never commit `.env.local` to git (already in `.gitignore`)

### 3. Install Vercel CLI

```bash
npm install -g vercel
```

### 4. Run Development Server

```bash
vercel dev
```

This will:
- Start Vite dev server (frontend)
- Enable serverless API routes at `/api/*`
- Load environment variables from `.env.local`

The app will be available at: `http://localhost:3000`

---

## Features

### Audio Processing Flow

1. **Upload or Record** audio file
2. **Visualize** with interactive waveform
3. **Trim** (optional) - Select portion to keep
4. **Process** - Click "Process Audio" button
5. **View Results**:
   - Full transcript
   - AI-generated summary
   - Interactive chat with AI

### AI Capabilities

- **Transcription**: OpenAI Whisper converts speech to text
- **Summarization**: GPT-4 creates structured summaries with markdown
- **Interactive Chat**: Ask AI to:
  - Make summary shorter/longer
  - Extract action items
  - Translate to other languages
  - Answer questions about content

### UI Features

- ✅ Read Aloud (text-to-speech)
- ✅ Copy to clipboard
- ✅ ChatGPT-style interface
- ✅ Markdown rendering
- ✅ Progress tracking
- ✅ Error handling

---

## Project Structure

```
trammarise/
├── api/                          # Vercel serverless functions
│   ├── transcribe.ts            # Whisper API endpoint
│   ├── summarize.ts             # GPT-4 summarization endpoint
│   └── chat.ts                  # Interactive chat endpoint
│
├── src/
│   ├── components/
│   │   ├── states/
│   │   │   ├── InitialState.tsx        # Upload/Record screen
│   │   │   ├── RecordingState.tsx      # Recording screen
│   │   │   ├── AudioState.tsx          # Audio playback & trim
│   │   │   ├── ProcessingState.tsx     # AI processing screen
│   │   │   └── ResultsState.tsx        # Results & chat interface
│   │   │
│   │   ├── audio/
│   │   │   ├── WaveformPlayer.tsx      # Audio visualization
│   │   │   └── PlaybackControls.tsx    # Play/pause/trim controls
│   │   │
│   │   ├── results/
│   │   │   ├── ActionButtons.tsx       # Read/Copy buttons
│   │   │   └── ChatInterface.tsx       # Interactive chat bar
│   │   │
│   │   └── ui/
│   │       ├── Button.tsx              # Reusable button
│   │       └── LoadingSpinner.tsx      # Loading animation
│   │
│   ├── hooks/
│   │   ├── useAudioRecorder.ts         # Recording logic
│   │   ├── useWaveSurfer.ts            # Waveform + region selection
│   │   └── useSpeechSynthesis.ts       # Text-to-speech
│   │
│   ├── utils/
│   │   ├── api.ts                      # API client functions
│   │   └── audio.ts                    # Audio utilities
│   │
│   └── types/
│       └── audio.ts                    # TypeScript interfaces
│
├── .env.local                   # OpenAI API key (create this)
├── .env.example                 # Environment template
├── vercel.json                  # Vercel configuration
└── package.json                 # Dependencies
```

---

## Deployment to Production

### Option 1: Vercel (Recommended)

1. Push code to GitHub
2. Import repository in [Vercel Dashboard](https://vercel.com)
3. Add environment variable:
   - Key: `OPENAI_API_KEY`
   - Value: `sk-your-actual-key`
4. Deploy!

### Option 2: Vercel CLI

```bash
vercel --prod
```

Then add the API key in Vercel Dashboard → Settings → Environment Variables

---

## Troubleshooting

### API Routes Not Working

**Problem:** 404 on `/api/*` endpoints

**Solution:** Make sure you're using `vercel dev`, not `npm run dev`

### Transcription Fails

**Problem:** "Transcription failed" error

**Solutions:**
1. Check API key is correct in `.env.local`
2. Verify audio format is supported (webm, mp3, wav, etc.)
3. Check OpenAI API quota/billing

### Chat Not Responding

**Problem:** Chat messages fail

**Solution:** Same as transcription - verify API key and quota

---

## Cost Estimation

Based on OpenAI pricing (as of 2025):

- **Whisper**: ~$0.006 per minute of audio
- **GPT-4**: ~$0.01-0.03 per summary
- **Chat**: ~$0.01-0.02 per message

Example: 5-minute audio → ~$0.04-0.08 total

---

## Development

### Run Tests
```bash
npm test
```

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

---

## Support

- OpenAI API Docs: https://platform.openai.com/docs
- Vercel Docs: https://vercel.com/docs
- WaveSurfer.js Docs: https://wavesurfer.xyz

---

## License

MIT
