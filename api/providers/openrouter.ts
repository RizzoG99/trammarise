import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { generateText } from 'ai';
import type { TextPart, ImagePart } from 'ai';
import type { AIProvider, SummarizeParams, ChatParams, TranscribeParams } from './base';
import { getSummarizationPrompt } from '../../src/utils/transcription-prompts';
import { getLanguagePrompts } from '../../src/utils/language-prompts';
import type { ContentType } from '../../src/types/content-types';

export class OpenRouterProvider implements AIProvider {
  name = 'OpenRouter';

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async transcribe(_params: TranscribeParams): Promise<string> {
    throw new Error('Transcription not supported by OpenRouter provider yet.');
  }

  async summarize(params: SummarizeParams): Promise<string> {
    const { transcript, contentType, apiKey, model, context, language } = params;

    if (!model) {
      throw new Error('Model is required for OpenRouter provider');
    }

    const openrouter = createOpenRouter({
      apiKey,
    });

    // Use centralized prompt system with language support
    const systemPrompt = getSummarizationPrompt(
      (contentType || 'other') as ContentType,
      language,
      context?.noiseProfile
    );

    const userContent: (TextPart | ImagePart)[] = [
      { type: 'text', text: `Transcript:\\n${transcript}` },
    ];

    if (context) {
      if (context.text) {
        userContent.push({
          type: 'text',
          text: `\n\nAdditional Context from Documents:\n${context.text}`,
        });
      }

      if (context.images && context.images.length > 0) {
        context.images.forEach((img) => {
          userContent.push({
            type: 'image',
            image: `data:${img.type};base64,${img.data}` as `data:${string}`,
          });
        });
      }
    }

    const { text } = await generateText({
      model: openrouter(model),
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userContent },
      ],
    });

    return text;
  }

  async chat(params: ChatParams): Promise<string> {
    const { transcript, summary, message, history, apiKey, model, language } = params;

    if (!model) {
      throw new Error('Model is required for OpenRouter provider');
    }

    const openrouter = createOpenRouter({
      apiKey,
    });

    // Get language-specific chat prompt (defaults to English if not supported)
    const languageCode = language || 'en';
    const langPrompts = getLanguagePrompts(languageCode);

    const systemPrompt = `${langPrompts.chatSystemPrompt}

Transcript:
${transcript}

Summary:
${summary}

Answer questions about the content, provide insights, or help refine the summary.`;

    const messages = [
      { role: 'system' as const, content: systemPrompt },
      ...history.map((msg) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })),
      { role: 'user' as const, content: message },
    ];

    const { text } = await generateText({
      model: openrouter(model),
      messages,
    });

    return text;
  }

  async validateApiKey(apiKey: string): Promise<boolean> {
    try {
      const openrouter = createOpenRouter({
        apiKey,
      });

      // Test with a minimal request using a cheap model
      await generateText({
        model: openrouter('openai/gpt-3.5-turbo'),
        prompt: 'Hi',
      });

      return true;
    } catch (error) {
      console.error('OpenRouter API key validation failed:', error);
      return false;
    }
  }
}
