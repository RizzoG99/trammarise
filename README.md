# Trammarise 🎙️

AI-powered audio transcription and summarization web application with interactive chat capabilities.

## ✨ Features

- 🎤 **Record or Upload** audio files
- 🌊 **Interactive Waveform** visualization
- ✂️ **Audio Trimming** - Select specific portions to process
- 🤖 **AI Transcription** - OpenAI Whisper speech-to-text
- 📝 **Smart Summarization** - GPT-4 generates structured summaries
- 💬 **Interactive Chat** - Refine summaries, ask questions, translate
- 🔊 **Text-to-Speech** - Read transcripts and summaries aloud
- 📋 **Copy to Clipboard** - Easy sharing

## 🚀 Tech Stack

- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **WaveSurfer.js** - Audio waveform visualization
- **OpenAI API** - Whisper (transcription) + GPT-4 (summarization)
- **Vercel Serverless** - Secure API endpoints
- **React Markdown** - Formatted summary rendering

## 📋 Prerequisites

- Node.js 20.19+ or 22.12+
- OpenAI API key ([Get one here](https://platform.openai.com/api-keys))
- Vercel CLI (for local development with API routes)

## 🛠️ Installation

### 1. Install dependencies

```bash
npm install
```

### 2. Set up OpenAI API Key

Create a `.env.local` file in the project root:

```bash
OPENAI_API_KEY=sk-your-actual-api-key-here
```

**Important:** Get your API key from https://platform.openai.com/api-keys

### 3. Install Vercel CLI

```bash
npm install -g vercel
```

### 4. Start the development server

**Use Vercel Dev (required for API routes):**

```bash
vercel dev
```

This will:
- Start Vite dev server on `http://localhost:3000`
- Enable serverless API routes at `/api/*`
- Load environment variables from `.env.local`

**Note:** Don't use `npm run dev` - it won't enable the API routes!

## 💡 Usage

1. **Upload or Record** audio
2. **Visualize** with interactive waveform
3. **Trim** (optional) - Click scissors icon, drag to select region
4. **Process** - Click "Process Audio" button
5. **View Results**:
   - Full transcript
   - AI-generated summary (with markdown formatting)
   - Interactive chat to refine or ask questions

### Interactive Chat Examples

- "Make this summary shorter"
- "What are the main action items?"
- "Translate to Spanish"
- "Extract key dates and deadlines"

## 📦 Available Commands

- `vercel dev` - Start development server with API routes (recommended)
- `npm run dev` - Start Vite dev server only (no API routes)
- `npm run build` - Build for production
- `npm run preview` - Preview the production build locally
- `npm run lint` - Run ESLint to check code quality

## 🚢 Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Import repository in [Vercel Dashboard](https://vercel.com)
3. Add environment variable:
   - Name: `OPENAI_API_KEY`
   - Value: `sk-your-actual-key`
4. Deploy!

### Manual Deployment

```bash
vercel --prod
```

Then add the API key in Vercel Dashboard → Settings → Environment Variables

## 🏗️ Project Structure

```
trammarise/
├── api/                          # Vercel serverless functions
│   ├── transcribe.ts            # OpenAI Whisper endpoint
│   ├── summarize.ts             # GPT-4 summarization
│   └── chat.ts                  # Interactive chat
│
├── src/
│   ├── components/
│   │   ├── states/              # Main app states
│   │   ├── audio/               # Audio components
│   │   ├── results/             # Results UI
│   │   ├── icons/               # SVG icons
│   │   └── ui/                  # Reusable UI components
│   │
│   ├── hooks/                   # Custom React hooks
│   ├── utils/                   # Utility functions
│   └── types/                   # TypeScript types
│
├── .env.local                   # API keys (create this, gitignored)
├── .env.example                 # Environment template
└── vercel.json                  # Vercel configuration
```

## 💰 Cost Estimation

Based on OpenAI pricing:

- **Whisper**: ~$0.006 per minute of audio
- **GPT-4**: ~$0.01-0.03 per summary
- **Chat**: ~$0.01-0.02 per message

**Example:** 5-minute audio → ~$0.04-0.08 total

## 🔒 Security

- ✅ API keys stored securely in serverless environment
- ✅ Never exposed to browser
- ✅ `.env.local` automatically gitignored
- ✅ CORS properly configured

## 🐛 Troubleshooting

### API Routes Return 404

**Problem:** `/api/*` endpoints not found

**Solution:** Use `vercel dev` instead of `npm run dev`

### Transcription Fails

**Solutions:**
1. Verify API key is correct in `.env.local`
2. Check OpenAI API quota and billing
3. Ensure audio format is supported (webm, mp3, wav, etc.)

### Chat Not Working

**Solutions:**
1. Check API key is set
2. Verify OpenAI account has credits
3. Check browser console for errors

## 📚 Documentation

- [OpenAI API Docs](https://platform.openai.com/docs)
- [Vercel Docs](https://vercel.com/docs)
- [WaveSurfer.js Docs](https://wavesurfer.xyz)
- [React Docs](https://react.dev)

## 📄 License

MIT

---

Built with ❤️ using React, TypeScript, and OpenAI

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
