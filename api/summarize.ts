import type { VercelRequest, VercelResponse } from '@vercel/node';
import { ProviderFactory, type ProviderType } from './providers/factory';
import { API_VALIDATION, CONTENT_TYPES } from '../src/utils/constants';
import busboy from 'busboy';
import { extractPdfText } from './utils/pdf-extractor';
import {
  getSummarizationModelForLevel,
  type PerformanceLevel,
} from '../src/types/performance-levels';
import { chunkText, shouldUseMapReduce } from './utils/text-chunker';

export const config = {
  api: {
    bodyParser: false,
  },
};

const { MAX_TRANSCRIPT_LENGTH, MIN_TRANSCRIPT_LENGTH, MIN_API_KEY_LENGTH, MAX_API_KEY_LENGTH } =
  API_VALIDATION;

interface ContextImage {
  type: string;
  data: string; // base64
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Summarize API called');
    const bb = busboy({ headers: req.headers });

    const fields: Record<string, string> = {};
    const contextImages: ContextImage[] = [];
    let contextText = '';

    const parsePromise = new Promise<void>((resolve, reject) => {
      bb.on('field', (name, val) => {
        fields[name] = val;
      });

      bb.on('file', (_name, file, info) => {
        const { mimeType } = info;
        const chunks: Buffer[] = [];

        file.on('data', (chunk) => chunks.push(chunk));

        file.on('end', async () => {
          const buffer = Buffer.concat(chunks);

          if (mimeType === 'application/pdf') {
            try {
              const pdfText = await extractPdfText(buffer);
              contextText += `\n\n[Document Context: ${info.filename}]\n${pdfText}\n`;
            } catch (e) {
              console.error('Error parsing PDF:', e);
            }
          } else if (mimeType === 'text/plain') {
            contextText += `\n\n[Document Context: ${info.filename}]\n${buffer.toString('utf-8')}\n`;
          } else if (mimeType.startsWith('image/')) {
            contextImages.push({
              type: mimeType,
              data: buffer.toString('base64'),
            });
          }
        });
      });

      bb.on('finish', resolve);
      bb.on('error', reject);
    });

    req.pipe(bb);
    await parsePromise;

    const { transcript, contentType, provider, apiKey, model, language, noiseProfile } = fields;

    // Validate transcript
    if (!transcript) {
      return res.status(400).json({ error: 'Transcript is required' });
    }

    if (transcript.length < MIN_TRANSCRIPT_LENGTH) {
      return res.status(400).json({
        error: `Transcript too short. Minimum ${MIN_TRANSCRIPT_LENGTH} characters required`,
      });
    }

    if (transcript.length > MAX_TRANSCRIPT_LENGTH) {
      return res.status(400).json({
        error: `Transcript too long. Maximum ${MAX_TRANSCRIPT_LENGTH} characters allowed`,
      });
    }

    // Validate contentType
    if (contentType && !CONTENT_TYPES.includes(contentType as never)) {
      return res.status(400).json({
        error: `Invalid content type. Must be one of: ${CONTENT_TYPES.join(', ')}`,
      });
    }

    // Validate provider and API key
    if (!provider) {
      return res.status(400).json({ error: 'Provider is required' });
    }

    if (!apiKey) {
      return res.status(400).json({ error: 'API key is required' });
    }

    if (apiKey.length < MIN_API_KEY_LENGTH || apiKey.length > MAX_API_KEY_LENGTH) {
      return res.status(400).json({ error: 'Invalid API key format' });
    }

    // Validate OpenRouter-specific requirements
    if (provider === 'openrouter' && !model) {
      return res.status(400).json({ error: 'Model is required for OpenRouter' });
    }

    const aiProvider = ProviderFactory.getProvider(provider as ProviderType);

    // Map performance level to actual model name
    const actualModel = model
      ? getSummarizationModelForLevel(model as PerformanceLevel)
      : undefined;

    // Cost Optimization: Use MapReduce for long transcripts
    let summary: string;

    if (shouldUseMapReduce(transcript)) {
      console.log(`[Summarize] Using MapReduce for long transcript (${transcript.length} chars)`);

      // Split transcript into chunks
      const chunks = chunkText(transcript, 10000);
      console.log(`[Summarize] Split into ${chunks.length} chunks`);

      // Map: Summarize each chunk in parallel
      const partialSummaries = await Promise.all(
        chunks.map((chunk, index) => {
          console.log(`[Summarize] Processing chunk ${index + 1}/${chunks.length}`);
          return aiProvider.summarize({
            transcript: chunk,
            contentType: 'other', // Use generic for partial summaries
            apiKey,
            model: actualModel,
            language,
            context: {
              text: `This is part ${index + 1} of ${chunks.length} from a larger transcript. Provide a concise summary of the key points in this section.`,
              images: [],
            },
          });
        })
      );

      // Reduce: Combine partial summaries into final summary
      console.log('[Summarize] Combining partial summaries');
      const combinedPartials = partialSummaries
        .map((s, i) => `**Part ${i + 1}:**\n${s}`)
        .join('\n\n');

      summary = await aiProvider.summarize({
        transcript: combinedPartials,
        contentType,
        apiKey,
        model: actualModel,
        language,
        context: {
          text: contextText,
          images: contextImages,
          noiseProfile,
        },
      });
    } else {
      // Normal summarization for shorter transcripts
      summary = await aiProvider.summarize({
        transcript,
        contentType,
        apiKey,
        model: actualModel,
        language,
        context: {
          text: contextText,
          images: contextImages,
          noiseProfile,
        },
      });
    }

    return res.status(200).json({ summary });
  } catch (error) {
    const err = error as { message?: string };
    console.error('Summarization error:', error);
    return res.status(500).json({
      error: 'Summarization failed',
      message: err.message || 'Unknown error',
    });
  }
}
