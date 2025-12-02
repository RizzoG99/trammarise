import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { generateText } from 'ai';
import type { AIProvider, SummarizeParams, ChatParams } from './base';

export class OpenRouterProvider implements AIProvider {
  name = 'OpenRouter';

  async summarize(params: SummarizeParams & { model: string }): Promise<string> {
    const { transcript, contentType, apiKey, model } = params;

    const openrouter = createOpenRouter({
      apiKey,
    });

    const prompt = `You are an expert at summarizing ${contentType || 'content'}. 
Please provide a clear, well-structured summary of the following transcript.

Include:
- Main topics and key points
- Important details and insights
- Action items (if any)
- Conclusions or outcomes

Transcript:
${transcript}`;

    const { text } = await generateText({
      model: openrouter(model),
      prompt,
    });

    return text;
  }

  async chat(params: ChatParams & { model: string }): Promise<string> {
    const { transcript, summary, message, history, apiKey, model } = params;

    const openrouter = createOpenRouter({
      apiKey,
    });

    const systemPrompt = `You are a helpful AI assistant with access to a transcript and its summary.

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
