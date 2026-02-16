import type { VercelRequest, VercelResponse } from '@vercel/node';
import { AIProviderFactory, type AIProviderType } from './providers/ai-factory';
import { API_VALIDATION, CONTENT_TYPES } from '../src/utils/constants';
import busboy from 'busboy';
import { extractPdfText } from './utils/pdf-extractor';
import {
  getSummarizationModelForLevel,
  type PerformanceLevel,
} from '../src/types/performance-levels';
import { chunkText, shouldUseMapReduce } from './utils/text-chunker';
import { requireAuth, AuthError } from './middleware/auth';
import { rateLimit, RateLimitError, RATE_LIMITS } from './middleware/rate-limit';
import { checkQuota, trackUsage } from './middleware/usage-tracking';
import { validatePdfFile } from './utils/file-validator';
import { supabaseAdmin } from './lib/supabase-admin';

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
    // 1. AUTHENTICATION - All users must authenticate
    const { userId } = await requireAuth(req);

    // 2. RATE LIMITING - Prevent abuse
    await rateLimit(req, {
      ...RATE_LIMITS.SUMMARIZE,
      keyGenerator: () => `user:${userId}`,
    });

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
            // 3. PDF VALIDATION - Magic bytes and size check
            const validation = validatePdfFile(buffer);
            if (!validation.valid) {
              console.error('PDF validation failed:', validation.error);
              // Note: We log but don't reject - PDF is optional context
              return;
            }

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

    // Validate provider
    if (!provider) {
      return res.status(400).json({ error: 'Provider is required' });
    }

    // 4. API KEY LOGIC - Tier-based enforcement
    const userProvidedKey = apiKey;
    let finalApiKey: string;
    let shouldTrackQuota = false;

    if (userProvidedKey) {
      // User provided their own API key - validate format and use it
      if (
        userProvidedKey.length < MIN_API_KEY_LENGTH ||
        userProvidedKey.length > MAX_API_KEY_LENGTH
      ) {
        return res.status(400).json({ error: 'Invalid API key format' });
      }
      finalApiKey = userProvidedKey;
      shouldTrackQuota = false; // Analytics only
      console.log(`[Summarize] User ${userId} using own API key`);
    } else {
      // No user key provided - check tier
      const { data: subscription, error: subError } = await supabaseAdmin
        .from('subscriptions')
        .select('tier')
        .eq('user_id', userId)
        .single();

      if (subError || !subscription || subscription.tier === 'free') {
        return res.status(403).json({
          error: 'API key required',
          message:
            'Free tier users must provide their own API key. Upgrade to Pro or Team to use platform infrastructure.',
          upgradeUrl: '/pricing',
        });
      }

      // Pro/Team user - check quota (estimate 1 minute for summarization)
      const quotaCheck = await checkQuota(userId, 1);
      if (!quotaCheck.allowed) {
        return res.status(429).json({
          error: 'Quota exceeded',
          minutesRemaining: quotaCheck.minutesRemaining,
          message: 'Insufficient quota. Please upgrade your plan or purchase additional credits.',
        });
      }

      // Use platform key (OpenAI for now)
      finalApiKey = process.env.OPENAI_API_KEY!;
      shouldTrackQuota = true;
      console.log(
        `[Summarize] User ${userId} (${subscription.tier}) using platform key with quota`
      );
    }

    // Validate OpenRouter-specific requirements
    if (provider === 'openrouter' && !model) {
      return res.status(400).json({ error: 'Model is required for OpenRouter' });
    }

    const aiProvider = AIProviderFactory.getProvider(provider as AIProviderType);

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
            apiKey: finalApiKey,
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
        apiKey: finalApiKey,
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
        apiKey: finalApiKey,
        model: actualModel,
        language,
        context: {
          text: contextText,
          images: contextImages,
          noiseProfile,
        },
      });
    }

    // 5. TRACK USAGE - After successful summarization
    const mode = shouldTrackQuota ? 'with_quota_deduction' : 'analytics_only';
    await trackUsage(userId, 'summarization', 60, mode); // Estimate 1 minute for summarization

    return res.status(200).json({ summary });
  } catch (error) {
    if (error instanceof AuthError) {
      return res.status(error.statusCode).json({ error: error.message });
    }

    if (error instanceof RateLimitError) {
      res.setHeader('Retry-After', error.retryAfter.toString());
      return res.status(429).json({
        error: 'Rate limit exceeded',
        retryAfter: error.retryAfter,
      });
    }

    const err = error as { message?: string };
    console.error('Summarization error:', error);
    return res.status(500).json({
      error: 'Summarization failed',
      message: err.message || 'Unknown error',
    });
  }
}
