import type { VercelRequest, VercelResponse } from '@vercel/node';
import { OpenAI } from 'openai';
import { Readable } from 'stream';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Parse multipart form data
    const chunks: Buffer[] = [];
    await new Promise<void>((resolve, reject) => {
      req.on('data', (chunk) => chunks.push(chunk));
      req.on('end', () => resolve());
      req.on('error', reject);
    });

    const buffer = Buffer.concat(chunks);

    // Extract the audio file and API key from multipart data
    const boundary = req.headers['content-type']?.split('boundary=')[1];
    if (!boundary) {
      return res.status(400).json({ error: 'Invalid content type' });
    }

    // Simple multipart parser - extract file data and API key
    const parts = buffer.toString('binary').split(`--${boundary}`);
    let audioData: Buffer | null = null;
    let apiKey: string | null = null;
    let language: string | undefined = undefined;

    for (const part of parts) {
      if (part.includes('Content-Disposition')) {
        if (part.includes('filename')) {
          // Extract audio file
          const headerEnd = part.indexOf('\r\n\r\n');
          if (headerEnd !== -1) {
            const fileContent = part.substring(headerEnd + 4);
            const endMarker = fileContent.lastIndexOf('\r\n');
            const actualContent = endMarker !== -1
              ? fileContent.substring(0, endMarker)
              : fileContent;
            audioData = Buffer.from(actualContent, 'binary');
          }
        } else if (part.includes('name="apiKey"')) {
          // Extract API key
          const headerEnd = part.indexOf('\r\n\r\n');
          if (headerEnd !== -1) {
            const content = part.substring(headerEnd + 4);
            const endMarker = content.indexOf('\r\n');
            apiKey = endMarker !== -1 ? content.substring(0, endMarker) : content.trim();
          }
        } else if (part.includes('name="language"')) {
          // Extract language
          const headerEnd = part.indexOf('\r\n\r\n');
          if (headerEnd !== -1) {
            const content = part.substring(headerEnd + 4);
            const endMarker = content.indexOf('\r\n');
            language = endMarker !== -1 ? content.substring(0, endMarker) : content.trim();
          }
        }
      }
    }

    if (!audioData) {
      return res.status(400).json({ error: 'No audio file found in request' });
    }

    if (!apiKey) {
      return res.status(400).json({ error: 'API key is required' });
    }

    const openai = new OpenAI({ apiKey });

    // Create a File-like object for OpenAI using the SDK's helper if available, or just pass the buffer with name
    // The OpenAI SDK accepts a File object (from web API) or a ReadStream (from fs).
    // Since we have a buffer, we can use the 'openai/uploads' helper or construct a File if available.
    // However, to be safe in Node environment:
    const file = await OpenAI.toFile(audioData, 'audio.webm');

    // Call Whisper API
    const transcription = await openai.audio.transcriptions.create({
      file,
      model: 'whisper-1',
      language,
    });

    return res.status(200).json({
      transcript: transcription.text,
    });
  } catch (error: any) {
    console.error('Transcription error:', error);
    return res.status(500).json({
      error: 'Transcription failed',
      message: error.message
    });
  }
}
