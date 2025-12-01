# Quick Start Guide ⚡

Get Trammarise running in 3 minutes!

## Step 1: Install Dependencies (30 seconds)

```bash
npm install
npm install -g vercel
```

## Step 2: Get OpenAI API Key (1 minute)

1. Go to https://platform.openai.com/api-keys
2. Click "Create new secret key"
3. Copy the key (starts with `sk-`)

## Step 3: Create .env.local (10 seconds)

```bash
echo "OPENAI_API_KEY=sk-paste-your-key-here" > .env.local
```

**Replace `sk-paste-your-key-here` with your actual key!**

## Step 4: Start the App (10 seconds)

```bash
vercel dev
```

Wait for it to start, then open: **http://localhost:3000**

---

## ✅ You're Ready!

Try it out:
1. Click "Start Recording" or upload an audio file
2. Click "Process Audio"
3. See your transcript and AI summary!
4. Chat with AI to refine the summary

---

## Need Help?

### "Command not found: vercel"
```bash
npm install -g vercel
```

### "API key invalid"
- Check `.env.local` file
- Make sure key starts with `sk-`
- No quotes needed around the key

### "404 on /api/transcribe"
- Use `vercel dev`, not `npm run dev`
- Make sure Vercel CLI is installed

---

## Next Steps

- Check out [README.md](./README.md) for full documentation
- Read [SETUP.md](./SETUP.md) for deployment instructions
- Explore the codebase in `src/` directory

Happy transcribing! 🎉
