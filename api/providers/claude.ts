import Anthropic from '@anthropic-ai/sdk';
import type { AIProvider, SummarizeParams, ChatParams } from './base';

export class ClaudeProvider implements AIProvider {
  name = 'Claude';

  async summarize({ transcript, contentType, apiKey }: SummarizeParams): Promise<string> {
    const anthropic = new Anthropic({ apiKey });

    const systemPrompt = this.buildSummarizePrompt(contentType);

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: `Please summarize this transcript:\n\n${transcript}`
        }
      ],
    });

    return message.content[0]?.type === 'text' ? message.content[0].text : '';
  }

  async chat({ transcript, summary, message, history, apiKey }: ChatParams): Promise<string> {
    const anthropic = new Anthropic({ apiKey });

    const systemPrompt = `You are a helpful assistant with access to an audio transcript and its summary.

Transcript: ${transcript}

Current Summary: ${summary}

Respond concisely and use markdown formatting where appropriate.`;

    const claudeMessages = history.map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    claudeMessages.push({ role: 'user', content: message });

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
      system: systemPrompt,
      messages: claudeMessages,
    });

    return response.content[0]?.type === 'text' ? response.content[0].text : '';
  }

  async validateApiKey(apiKey: string): Promise<boolean> {
    try {
      const anthropic = new Anthropic({ apiKey });
      await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 10,
        messages: [{ role: 'user', content: 'test' }],
      });
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
