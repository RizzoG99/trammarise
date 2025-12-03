import { OpenAI } from 'openai';
import type { AIProvider, SummarizeParams, ChatParams } from './base';

export class OpenAIProvider implements AIProvider {
  name = 'OpenAI';

  async summarize({ transcript, contentType, apiKey, model }: SummarizeParams & { model?: string }): Promise<string> {
    const openai = new OpenAI({ baseURL: 'https://api.openai.com/v1',  apiKey });

    const systemPrompt = this.buildSummarizePrompt(contentType || 'general');

    const completion = await openai.chat.completions.create({
      model: model || 'gpt-4o', // Default to gpt-4o if not specified
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Please summarize this transcript:\n\n${transcript}` }
      ],
      temperature: 0.7,
    });

    return completion.choices[0]?.message?.content || '';
  }

  async chat({ transcript, summary, message, history, apiKey, model }: ChatParams & { model?: string }): Promise<string> {
    const openai = new OpenAI({ baseURL: 'https://api.openai.com/v1', apiKey });

    const completion = await openai.chat.completions.create({
      model: model || 'gpt-4o',
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
      const openai = new OpenAI({ baseURL: 'https://api.openai.com/v1', apiKey });
      await openai.models.list();
      return true;
    } catch {
      return false;
    }
  }

  protected buildSummarizePrompt(contentType: string): string {
    const basePrompt = 'You are an expert AI assistant capable of summarizing audio transcripts with high accuracy.';
    
    switch (contentType) {
      case 'meeting':
        return `${basePrompt}
        
Please summarize the following meeting transcript. Structure your response as follows:
1. **Executive Summary**: A brief overview of the meeting's purpose and outcome.
2. **Key Discussion Points**: The main topics discussed.
3. **Decisions Made**: Any concrete decisions agreed upon.
4. **Action Items**: A list of tasks assigned to specific people (if any).
5. **Next Steps**: What happens next.

Focus on clarity and actionable information.`;

      case 'lecture':
        return `${basePrompt}
        
Please summarize the following lecture/class transcript. Structure your response as follows:
1. **Topic Overview**: What was the lecture about?
2. **Key Concepts**: Define and explain the main concepts covered.
3. **Important Details**: Dates, formulas, or specific examples mentioned.
4. **Exam/Study Notes**: Highlights of what might be important for testing.
5. **Summary**: A concluding paragraph.

Focus on educational value and clarity.`;

      case 'interview':
        return `${basePrompt}
        
Please summarize the following interview transcript. Structure your response as follows:
1. **Interviewee Profile**: Who was interviewed and their background (if mentioned).
2. **Key Insights**: The main takeaways from the interviewee's answers.
3. **Notable Quotes**: Impactful or important direct quotes.
4. **Conclusion**: The interviewer's final thoughts or the wrap-up.

Focus on capturing the interviewee's perspective and voice.`;

      case 'podcast':
        return `${basePrompt}
        
Please summarize the following podcast episode transcript. Structure your response as follows:
1. **Episode Theme**: The central topic of the episode.
2. **Guest(s)**: Who was on the show (if applicable).
3. **Key Takeaways**: The most interesting points or stories shared.
4. **Highlights**: Memorable moments or discussions.

Focus on engagement and the narrative flow.`;

      case 'voice-memo':
        return `${basePrompt}
        
Please summarize the following voice memo. Structure your response as follows:
1. **Main Idea**: The core message or thought recorded.
2. **Details**: Supporting points or context.
3. **Action/Follow-up**: Any tasks or reminders mentioned.

Keep it concise and personal.`;

      default:
        return `${basePrompt}
        
Please provide a comprehensive summary of the following transcript.
- Identify the main topic.
- List key points and details.
- Provide a clear conclusion.`;
    }
  }
}


