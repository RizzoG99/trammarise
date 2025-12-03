# FFmpeg Setup

The app uses FFmpeg.wasm to process large audio files (compression and chunking).

## Local Files

For better performance and reliability, FFmpeg files are served locally from `public/ffmpeg/`:
- `ffmpeg-core.js` (112KB) - Committed to git
- `ffmpeg-core.wasm` (31MB) - **NOT** in git (too large)

## First Time Setup

After cloning the repository, download the FFmpeg files:

```bash
npm run setup:ffmpeg
```

Or manually:
```bash
./scripts/setup-ffmpeg.sh
```

This downloads:
- `https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.js`
- `https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.wasm`

## Fallback

If local files are missing, the app automatically falls back to CDN (unpkg.com).

## Why Local?

1. **Faster**: No CDN download needed
2. **Reliable**: Works offline
3. **No CORS issues**: Served from same origin
4. **Version locked**: Always uses 0.12.6
