import * as fs from 'fs';
import { OpenAI } from 'openai';
import type {
  ChatCompletionMessageParam,
  ChatCompletionContentPart,
} from 'openai/resources/chat/completions';
import type { AIProvider, SummarizeParams, ChatParams, TranscribeParams } from './base';
import { getSummarizationPrompt } from '../../src/utils/transcription-prompts';
import type { ContentType } from '../../src/types/content-types';

export class OpenAIProvider implements AIProvider {
  name = 'OpenAI';

  async transcribe(params: TranscribeParams): Promise<string> {
    const openai = new OpenAI({ baseURL: 'https://api.openai.com/v1', apiKey: params.apiKey });

    const completion = await openai.audio.transcriptions.create({
      file: fs.createReadStream(params.filePath),
      model: params.model || 'whisper-1',
      language: params.language,
      prompt: params.prompt,
      temperature: params.temperature,
    });

    return completion.text;
  }

  async summarize({
    transcript,
    contentType,
    apiKey,
    model,
    context,
    language,
  }: SummarizeParams & { model?: string; noiseProfile?: string }): Promise<string> {
    const openai = new OpenAI({ baseURL: 'https://api.openai.com/v1', apiKey });

    // Use centralized prompt system with noise profile support
    const systemPrompt = getSummarizationPrompt(
      (contentType || 'other') as ContentType,
      language,
      context?.noiseProfile
    );

    const messages: ChatCompletionMessageParam[] = [{ role: 'system', content: systemPrompt }];

    const userContent: ChatCompletionContentPart[] = [
      { type: 'text', text: `Please summarize this transcript:\n\n${transcript}` },
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
            type: 'image_url',
            image_url: {
              url: `data:${img.type};base64,${img.data}`,
            },
          });
        });
      }
    }

    messages.push({ role: 'user', content: userContent });

    const completion = await openai.chat.completions.create({
      model: model || 'gpt-4o', // Default to gpt-4o if not specified
      messages: messages,
      temperature: 0.7,
    });

    return completion.choices[0]?.message?.content || '';
  }

  async chat({
    transcript,
    summary,
    message,
    history,
    apiKey,
    model,
  }: ChatParams & { model?: string }): Promise<string> {
    const openai = new OpenAI({ baseURL: 'https://api.openai.com/v1', apiKey });

    const completion = await openai.chat.completions.create({
      model: model || 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are a helpful assistant with access to an audio transcript and its summary.

Transcript: ${transcript}

Current Summary: ${summary}

Respond concisely and use markdown formatting where appropriate.`,
        },
        ...history,
        { role: 'user', content: message },
      ],
      temperature: 0.7,
    });

    return completion.choices[0]?.message?.content || '';
  }

  async validateApiKey(apiKey: string): Promise<boolean> {
    try {
      const openai = new OpenAI({ baseURL: 'https://api.openai.com/v1', apiKey });
      await openai.models.list();
      return true;
    } catch (error) {
      const err = error as { message?: string; status?: number; type?: string; code?: string };
      console.error('OpenAI API key validation error:', {
        message: err?.message,
        status: err?.status,
        type: err?.type,
        code: err?.code,
      });
      return false;
    }
  }
}
