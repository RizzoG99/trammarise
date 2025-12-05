import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { generateText } from 'ai';
import type { AIProvider, SummarizeParams, ChatParams } from './base';

export class OpenRouterProvider implements AIProvider {
  name = 'OpenRouter';

  async summarize(params: SummarizeParams): Promise<string> {
    const { transcript, contentType, apiKey, model, context, language } = params;

    if (!model) {
      throw new Error('Model is required for OpenRouter provider');
    }

    const openrouter = createOpenRouter({
      apiKey,
    });

    const languageInstruction = language ? `\n\nIMPORTANT: Generate your summary in ${this.getLanguageName(language)}. Use natural, idiomatic section headers and content appropriate for ${this.getLanguageName(language)}. Follow the structure and quality shown in the example below, but adapt all text naturally to ${this.getLanguageName(language)}.` : '';

    const systemPrompt = `You are an expert at summarizing ${contentType || 'content'} with exceptional attention to detail and clarity.${languageInstruction}

STRUCTURE YOUR SUMMARY FOLLOWING THIS EXAMPLE:

**Example Summary:**

**Overview**
The Q4 strategy review covered key performance metrics, identified areas for improvement, and outlined initiatives for the upcoming quarter. The discussion balanced celebrating recent wins with addressing critical challenges, ultimately resulting in clear action items and commitments from all stakeholders.

**Key Points**
- Revenue exceeded targets by 12% in Q3, driven primarily by enterprise sales growth
- Customer churn rate remains above industry average at 8%, requiring immediate attention
- New product features scheduled for Q1 launch are on track, pending final security review
- Team capacity constraints identified in engineering—hiring 3 additional developers approved
- Partnership discussions with major industry player progressing well, expecting LOI next month

**Action Items**
- Sarah Chen: Lead customer retention task force, present findings by December 15
- John Smith: Finalize product roadmap and share with stakeholders by December 10
- All Department Heads: Submit Q1 budgets and headcount plans by end of week

**Next Steps**
The team will reconvene in two weeks to review progress on retention initiatives and finalize the Q1 launch plan. Individual contributors should focus on their assigned deliverables with regular check-ins scheduled as needed.

---

NOW: Analyze the transcript provided and create a summary following this structure and level of detail. Adapt the sections naturally to fit the ${contentType || 'content'} being summarized. Ensure your summary is comprehensive, well-organized, and professionally formatted.`;

    const userContent: any[] = [
      { type: 'text', text: `Transcript:\n${transcript}` }
    ];

    if (context) {
      if (context.text) {
        userContent.push({ 
          type: 'text', 
          text: `\n\nAdditional Context from Documents:\n${context.text}` 
        });
      }

      if (context.images && context.images.length > 0) {
        context.images.forEach(img => {
          userContent.push({
            type: 'image',
            image: `data:${img.type};base64,${img.data}`
          });
        });
      }
    }

    const { text } = await generateText({
      model: openrouter(model),
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userContent as any }
      ],
    });

    return text;
  }

  async chat(params: ChatParams): Promise<string> {
    const { transcript, summary, message, history, apiKey, model } = params;

    if (!model) {
      throw new Error('Model is required for OpenRouter provider');
    }

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

  private getLanguageName(code: string): string {
    const languages: Record<string, string> = {
      'en': 'English',
      'it': 'Italian',
      'es': 'Spanish',
      'fr': 'French',
      'de': 'German',
      'pt': 'Portuguese',
      'nl': 'Dutch',
      'ja': 'Japanese',
      'zh': 'Chinese',
    };
    return languages[code] || 'English';
  }
}
