# Local Development Setup

## Running the Application Locally

This app uses a local Express server to handle API routes during development, with Vite serving the frontend.

### Quick Start

```bash
# Start both frontend and backend servers
npm run dev
```

The app will be available at **http://localhost:5173/**

The API server runs on **http://localhost:3001/** (proxied by Vite)

### What `npm run dev` Does

The dev command runs two servers concurrently:
1. **Vite dev server** (port 5173) - Serves the React frontend
2. **Express API server** (port 3001) - Handles `/api/*` routes

Vite automatically proxies all `/api/*` requests to the Express server, so you just use http://localhost:5173 for everything.

### API Key Validation

To test API key validation locally:
1. Get an OpenAI API key from https://platform.openai.com/api-keys
2. Run `npm run dev`
3. Open http://localhost:5173 in your browser
4. Upload an audio file
5. Click "Process Audio"
6. Enter your API key in the configuration form
7. The app will validate your key by making a real API call to OpenAI

### Troubleshooting

**Issue:** "404 Not Found" when validating API keys
- **Solution:** Make sure both servers are running. Check the terminal output for both [0] (API) and [1] (Vite)

**Issue:** "Invalid API key" error
- **Solution:**
  - Check your API key is correct (starts with `sk-proj-` or `sk-`)
  - Ensure your OpenAI account has API access enabled
  - Check you have billing set up on your OpenAI account
  - **IMPORTANT**: Revoke any keys you accidentally committed to git!

**Issue:** Port already in use
- **Solution:** Kill any processes using ports 5173 or 3001:
  ```bash
  lsof -ti:5173 | xargs kill -9
  lsof -ti:3001 | xargs kill -9
  ```

### Alternative: Vercel CLI

You can also use Vercel CLI for a production-like environment:

```bash
npm run dev:vercel
```

This may require additional setup (linking to Vercel account).

## Development vs Production

- **Development** (`npm run dev`): Local Express server + Vite dev server
- **Production**: Deployed to Vercel where serverless functions handle API routes

Both use the same API code from the `/api` folder - no changes needed!
