import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' })); // Support large audio file uploads

console.log('Starting API dev server...');

// Helper to wrap Express req/res to match Vercel's interface
function wrapHandler(handler) {
  return async (req, res) => {
    try {
      // Express already provides these, just call the handler
      await handler(req, res);
    } catch (error) {
      console.error('Handler error:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  };
}

// Dynamically import and wrap handlers
async function loadHandler(path) {
  const module = await import(path);
  return wrapHandler(module.default);
}

// Validate key endpoint
app.post('/api/validate-key', async (req, res) => {
  console.log('POST /api/validate-key');
  try {
    const handler = await loadHandler('./api/validate-key.ts');
    await handler(req, res);
  } catch (error) {
    console.error('Error in validate-key:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Transcribe endpoint
app.post('/api/transcribe', async (req, res) => {
  console.log('POST /api/transcribe');
  try {
    const handler = await loadHandler('./api/transcribe.ts');
    await handler(req, res);
  } catch (error) {
    console.error('Error in transcribe:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Summarize endpoint
app.post('/api/summarize', async (req, res) => {
  console.log('POST /api/summarize');
  try {
    const handler = await loadHandler('./api/summarize.ts');
    await handler(req, res);
  } catch (error) {
    console.error('Error in summarize:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Chat endpoint
app.post('/api/chat', async (req, res) => {
  console.log('POST /api/chat');
  try {
    const handler = await loadHandler('./api/chat.ts');
    await handler(req, res);
  } catch (error) {
    console.error('Error in chat:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Generate PDF endpoint
app.post('/api/generate-pdf', async (req, res) => {
  console.log('POST /api/generate-pdf');
  try {
    const handler = await loadHandler('./api/generate-pdf.ts');
    await handler(req, res);
  } catch (error) {
    console.error('Error in generate-pdf:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'API dev server is running' });
});

app.listen(PORT, () => {
  console.log(`\n✅ API dev server running on http://localhost:${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/api/health\n`);
});

// Keep the process alive
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down API dev server...');
  process.exit(0);
});
