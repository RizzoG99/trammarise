// Load environment variables from .env.local FIRST before any other imports
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3001;

// Configure CORS to allow credentials (cookies) from frontend
app.use(cors({
  origin: 'http://localhost:5173', // Vite dev server
  credentials: true // Allow cookies and auth headers
}));
app.use(express.json({ limit: '50mb' })); // Support large audio file uploads

console.log('Starting API dev server...');

// Helper to wrap Express req/res to match Vercel's interface
function wrapHandler(handler) {
  return async (req, res) => {
    try {
      // Map Express params to Vercel query format
      // In Vercel: /api/foo/[id] -> req.query.id
      // In Express: /api/foo/:id -> req.params.id
      if (req.params && Object.keys(req.params).length > 0) {
        const mergedQuery = { ...req.query, ...req.params };
        Object.defineProperty(req, 'query', {
          value: mergedQuery,
          writable: true,
          enumerable: true,
          configurable: true
        });
      }

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

// Session management endpoints
app.post('/api/sessions/create', async (req, res) => {
  console.log('POST /api/sessions/create');
  try {
    const handler = await loadHandler('./api/sessions/create.ts');
    await handler(req, res);
  } catch (error) {
    console.error('Error in sessions/create:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/sessions/upsert', async (req, res) => {
  console.log('POST /api/sessions/upsert');
  try {
    const handler = await loadHandler('./api/sessions/upsert.ts');
    await handler(req, res);
  } catch (error) {
    console.error('Error in sessions/upsert:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/sessions/list', async (req, res) => {
  console.log('GET /api/sessions/list');
  try {
    const handler = await loadHandler('./api/sessions/list.ts');
    await handler(req, res);
  } catch (error) {
    console.error('Error in sessions/list:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/sessions/import', async (req, res) => {
  console.log('POST /api/sessions/import');
  try {
    const handler = await loadHandler('./api/sessions/import.ts');
    await handler(req, res);
  } catch (error) {
    console.error('Error in sessions/import:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Session CRUD (GET/PATCH/DELETE) - uses app.all() for multiple methods
app.all('/api/sessions/:id', async (req, res) => {
  console.log(`${req.method} /api/sessions/${req.params.id}`);
  try {
    const handler = await loadHandler('./api/sessions/[id].ts');
    await handler(req, res);
  } catch (error) {
    console.error('Error in sessions/:id:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Job status endpoint
app.get('/api/transcribe-job/:jobId/status', async (req, res) => {
  console.log(`GET /api/transcribe-job/${req.params.jobId}/status`);
  try {
    const handler = await loadHandler('./api/transcribe-job/[jobId]/status.ts');
    await handler(req, res);
  } catch (error) {
    console.error('Error in job status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Job cancel endpoint
app.post('/api/transcribe-job/:jobId/cancel', async (req, res) => {
  console.log(`POST /api/transcribe-job/${req.params.jobId}/cancel`);
  try {
    const handler = await loadHandler('./api/transcribe-job/[jobId]/cancel.ts');
    await handler(req, res);
  } catch (error) {
    console.error('Error in job cancel:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Stripe checkout session endpoint
app.post('/api/stripe/create-checkout-session', async (req, res) => {
  console.log('POST /api/stripe/create-checkout-session');
  try {
    const handler = await loadHandler('./api/stripe/create-checkout-session.ts');
    await handler(req, res);
  } catch (error) {
    console.error('Error in create-checkout-session:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Subscriptions endpoint
app.get('/api/subscriptions/current', async (req, res) => {
  console.log('GET /api/subscriptions/current');
  try {
    const handler = await loadHandler('./api/subscriptions/current.ts');
    await handler(req, res);
  } catch (error) {
    console.error('Error in subscriptions/current:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// User settings - API key management
app.post('/api/user-settings/api-key', async (req, res) => {
  console.log('POST /api/user-settings/api-key');
  try {
    const handler = await loadHandler('./api/user-settings/api-key.ts');
    await handler(req, res);
  } catch (error) {
    console.error('Error in user-settings/api-key:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/user-settings/api-key', async (req, res) => {
  console.log('GET /api/user-settings/api-key');
  try {
    const handler = await loadHandler('./api/user-settings/api-key.ts');
    await handler(req, res);
  } catch (error) {
    console.error('Error in user-settings/api-key:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/user-settings/api-key', async (req, res) => {
  console.log('DELETE /api/user-settings/api-key');
  try {
    const handler = await loadHandler('./api/user-settings/api-key.ts');
    await handler(req, res);
  } catch (error) {
    console.error('Error in user-settings/api-key:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Audio endpoint
app.get('/api/audio/:sessionId', async (req, res) => {
  console.log(`GET /api/audio/${req.params.sessionId}`);
  try {
    const handler = await loadHandler('./api/audio/[sessionId].ts');
    await handler(req, res);
  } catch (error) {
    console.error('Error in audio endpoint:', error);
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
