import type { VercelRequest, VercelResponse } from '@vercel/node';
import { OpenAI } from 'openai';
import busboy from 'busboy';
import { API_VALIDATION } from '../src/utils/constants';

export const config = {
  api: {
    bodyParser: false,
  },
};

const { MAX_FILE_SIZE, MAX_FILES, MAX_FIELDS } = API_VALIDATION;
const TRANSCRIBE_TIMEOUT = 300000; // 5 minutes - matches frontend timeout

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Set request timeout to 5 minutes for large audio files
  const timeoutId = setTimeout(() => {
    if (!res.headersSent) {
      res.status(408).json({ error: 'Request timeout - audio file took too long to transcribe' });
    }
  }, TRANSCRIBE_TIMEOUT);

  try {
    // Parse multipart form data with busboy
    const bb = busboy({
      headers: req.headers,
      limits: {
        fileSize: MAX_FILE_SIZE,
        files: MAX_FILES,
        fields: MAX_FIELDS,
      }
    });

    let audioData: Buffer | null = null;
    let audioChunks: Buffer[] = [];
    let apiKey: string | null = null;
    let language: string | undefined = undefined;
    let uploadedFilename: string = 'audio.webm'; // Default fallback
    let fileSizeExceeded = false;

    const parsePromise = new Promise<void>((resolve, reject) => {
      bb.on('file', (fieldname, file, info) => {
        const { filename, mimeType } = info;
        uploadedFilename = filename || 'audio.webm';

        // Validate file type
        if (!mimeType.startsWith('audio/')) {
          file.resume(); // Drain the stream
          reject(new Error('Invalid file type. Audio files only.'));
          return;
        }

        file.on('data', (chunk) => {
          audioChunks.push(chunk);
        });

        file.on('limit', () => {
          fileSizeExceeded = true;
          file.resume(); // Drain the stream
        });

        file.on('end', () => {
          if (fileSizeExceeded) {
            reject(new Error('File size exceeds limit'));
          } else {
            audioData = Buffer.concat(audioChunks);
          }
        });
      });

      bb.on('field', (fieldname, value) => {
        if (fieldname === 'apiKey') {
          apiKey = value;
        } else if (fieldname === 'language') {
          language = value || undefined;
        }
      });

      bb.on('finish', () => {
        resolve();
      });

      bb.on('error', (error) => {
        reject(error);
      });
    });

    req.pipe(bb);
    await parsePromise;

    clearTimeout(timeoutId);

    if (!audioData) {
      return res.status(400).json({ error: 'No audio file found in request' });
    }

    if (!apiKey) {
      return res.status(400).json({ error: 'API key is required' });
    }

    const openai = new OpenAI({ baseURL: 'https://api.openai.com/v1', apiKey });

    // Create a File-like object for OpenAI using the SDK's helper if available, or just pass the buffer with name
    // The OpenAI SDK accepts a File object (from web API) or a ReadStream (from fs).
    // Since we have a buffer, we can use the 'openai/uploads' helper or construct a File if available.
    // However, to be safe in Node environment:
    const file = await OpenAI.toFile(audioData, uploadedFilename);

    // Call Whisper API
    try {
      const transcription = await openai.audio.transcriptions.create({
        file,
        model: 'whisper-1',
        language,
      });

      return res.status(200).json({
        transcript: transcription.text,
      });
    } catch (apiError: any) {
      console.error('OpenAI transcription error:', apiError);

      // Provide specific error messages based on OpenAI API response
      let errorMessage = 'Transcription failed';
      let statusCode = 500;

      if (apiError.status === 401) {
        errorMessage = 'Invalid OpenAI API key';
        statusCode = 401;
      } else if (apiError.status === 429) {
        errorMessage = 'OpenAI rate limit exceeded. Please try again later.';
        statusCode = 429;
      } else if (apiError.status === 413) {
        errorMessage = 'Audio file too large for OpenAI API';
        statusCode = 413;
      } else if (apiError.status === 400) {
        errorMessage = 'Invalid audio file format or corrupted file';
        statusCode = 400;
      }

      return res.status(statusCode).json({
        error: errorMessage,
        message: apiError.message
      });
    }
  } catch (error: any) {
    clearTimeout(timeoutId);
    console.error('Transcription error:', error);

    // Return appropriate error status based on error type
    const status = error.message?.includes('File size') ? 413 :
                   error.message?.includes('Invalid file type') ? 415 :
                   error.message?.includes('API key') ? 401 : 500;

    return res.status(status).json({
      error: 'Transcription failed',
      message: error.message || 'Unknown error'
    });
  }
}
