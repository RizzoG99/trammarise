import { OpenAI } from 'openai';
import type { AIProvider, SummarizeParams, ChatParams } from './base';

export class DeepseekProvider implements AIProvider {
  name = 'Deepseek';

  async summarize({ transcript, contentType, apiKey }: SummarizeParams): Promise<string> {
    const deepseek = new OpenAI({
      apiKey,
      baseURL: 'https://api.deepseek.com',
    });

    const systemPrompt = this.buildSummarizePrompt(contentType);

    const completion = await deepseek.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Please summarize this transcript:\n\n${transcript}` }
      ],
      temperature: 0.7,
    });

    return completion.choices[0]?.message?.content || '';
  }

  async chat({ transcript, summary, message, history, apiKey }: ChatParams): Promise<string> {
    const deepseek = new OpenAI({
      apiKey,
      baseURL: 'https://api.deepseek.com',
    });

    const completion = await deepseek.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: `You are a helpful assistant with access to an audio transcript and its summary.

Transcript: ${transcript}

Current Summary: ${summary}

Respond concisely and use markdown formatting where appropriate.`
        },
        ...history,
        { role: 'user', content: message }
      ],
      temperature: 0.7,
    });

    return completion.choices[0]?.message?.content || '';
  }

  async validateApiKey(apiKey: string): Promise<boolean> {
    try {
      const deepseek = new OpenAI({
        apiKey,
        baseURL: 'https://api.deepseek.com',
      });
      await deepseek.models.list();
      return true;
    } catch {
      return false;
    }
  }

  private buildSummarizePrompt(contentType?: string): string {
    const basePrompt = 'You are a helpful assistant that creates concise, well-structured summaries of audio transcripts. Use markdown formatting with headings (##) and bullet points (•) to organize information clearly. Focus on key points, main ideas, and important details.';

    const typeSpecificGuidance: Record<string, string> = {
      meeting: 'Focus on: key decisions, action items, participants, and next steps.',
      lecture: 'Focus on: main topics, key concepts, important examples, and takeaways.',
      interview: 'Focus on: main questions, key responses, insights, and quotes.',
      podcast: 'Focus on: main topics discussed, key points, interesting anecdotes.',
      'voice-memo': 'Focus on: core message, important details, and any reminders.',
    };

    const guidance = contentType && typeSpecificGuidance[contentType];

    return guidance ? `${basePrompt}\n\n${guidance}` : basePrompt;
  }
}
