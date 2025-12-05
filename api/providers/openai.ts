import { OpenAI } from 'openai';
import type { AIProvider, SummarizeParams, ChatParams } from './base';

export class OpenAIProvider implements AIProvider {
  name = 'OpenAI';

  async summarize({ transcript, contentType, apiKey, model, context, language }: SummarizeParams & { model?: string }): Promise<string> {
    const openai = new OpenAI({ baseURL: 'https://api.openai.com/v1',  apiKey });

    const systemPrompt = this.buildSummarizePrompt(contentType || 'general', language);

    const messages: any[] = [
      { role: 'system', content: systemPrompt }
    ];

    const userContent: any[] = [
      { type: 'text', text: `Please summarize this transcript:\n\n${transcript}` }
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
            type: 'image_url',
            image_url: {
              url: `data:${img.type};base64,${img.data}`
            }
          });
        });
      }
    }

    messages.push({ role: 'user', content: userContent });

    const completion = await openai.chat.completions.create({
      model: model || 'gpt-4o', // Default to gpt-4o if not specified
      messages: messages as any,
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

  protected buildSummarizePrompt(contentType: string, language?: string): string {
    const basePrompt = 'You are an expert AI assistant capable of summarizing audio transcripts with high accuracy and attention to detail.';
    const languageInstruction = language 
      ? `\n\nIMPORTANT: Generate your summary in ${this.getLanguageName(language)}. Use natural, idiomatic section headers and content appropriate for ${this.getLanguageName(language)}. Follow the structure and quality shown in the example below, but adapt all text naturally to ${this.getLanguageName(language)}.` 
      : '';
    
    switch (contentType) {
      case 'meeting':
        return `${basePrompt}${languageInstruction}

You are an expert meeting analyst. Your task is to transform meeting transcripts into clear, actionable summaries that help teams stay aligned and productive.

STRUCTURE YOUR SUMMARY FOLLOWING THIS EXAMPLE:

**Example Meeting Summary:**

**Summary**
The Q4 Marketing Strategy Review brought together key stakeholders to evaluate current campaign performance and plan initiatives for Q1 2026. The team celebrated the success of the recent social media campaign while identifying critical areas for improvement, particularly in SEO optimization and content strategy. A new product launch was confirmed for January 15, 2026, requiring coordinated efforts across marketing and product teams.

**Key Decisions**
- Allocate additional $15,000 budget for SEO content optimization, targeting 15% improvement in organic traffic by end of Q1
- Launch "Project Phoenix" product on January 15, 2026, with all marketing assets finalized by January 8
- Implement A/B testing on email subject lines to improve open rates by 10% next quarter
- Double down on Instagram and LinkedIn engagement with goal of 20% follower growth across both platforms

**Action Items**
- Emily White: Develop comprehensive SEO content plan including keyword research and editorial calendar — Due: December 15
- David Green: Complete SEO audit of existing content with specific optimization recommendations — Due: December 10
- John Smith: Provide final product messaging and key selling points for Project Phoenix — Due: December 12
- Sarah Chen: Review and approve Q1 budget allocation and SEO content strategy — Due: December 20
- All Team Members: Review Project Phoenix launch plan and submit feedback — Due: December 18

**Discussion Highlights**
- November social media campaign exceeded engagement targets by 30%, particularly on Instagram Stories
- Conversion rates from landing pages remain below industry benchmarks, indicating need for UX improvements
- Brainstormed innovative content angles for Project Phoenix launch, focusing on sustainability messaging
- Discussed potential partnership opportunities with eco-friendly brands for Q1 co-marketing initiatives

**Next Steps**
The team will reconvene on December 20 to review finalized plans and ensure alignment before the holiday break. Individual contributors will focus on their assigned deliverables, with check-ins scheduled as needed. The January 15 launch date is confirmed, pending final approval of marketing materials by January 8.

---

NOW: Analyze the transcript provided and create a summary following this structure and level of detail. Ensure your summary is comprehensive, actionable, and professionally formatted.`;

      case 'lecture':
        return `${basePrompt}${languageInstruction}

You are an expert educational content analyst. Your task is to transform lecture transcripts into comprehensive study guides that help students learn effectively and prepare for assessments.

STRUCTURE YOUR SUMMARY FOLLOWING THIS EXAMPLE:

**Example Lecture Summary:**

**Topic Overview**
This lecture covered the fundamentals of machine learning, focusing on supervised learning algorithms and their practical applications. Professor Anderson introduced three main classification algorithms—Decision Trees, Support Vector Machines, and Neural Networks—explaining their mathematical foundations, use cases, and trade-offs. The session emphasized hands-on understanding through real-world examples from healthcare, finance, and e-commerce domains.

**Key Concepts**
- **Supervised Learning**: Training models on labeled datasets where input-output pairs are known. The model learns patterns to predict outputs for new inputs. Distinguished from unsupervised learning which works with unlabeled data.
- **Decision Trees**: Hierarchical models that make predictions by learning decision rules from features. Advantages include interpretability and handling non-linear relationships. Prone to overfitting without pruning.
- **Support Vector Machines (SVM)**: Algorithms that find optimal hyperplanes to separate classes with maximum margin. Effective in high-dimensional spaces. Kernel trick allows handling non-linear boundaries.
- **Neural Networks**: Computing systems inspired by biological neural networks. Consist of interconnected nodes (neurons) organized in layers. Can learn complex patterns through backpropagation and gradient descent.
- **Overfitting vs. Underfitting**: Overfitting occurs when models memorize training data but fail to generalize. Underfitting happens when models are too simple to capture underlying patterns. Balance achieved through proper model complexity and regularization.

**Important Details**
- Homework Assignment 3 due next Thursday focuses on implementing a Decision Tree classifier in Python using scikit-learn
- Midterm exam scheduled for October 15 will cover all supervised learning algorithms discussed so far
- The confusion matrix formula for precision: TP / (TP + FP), where TP=True Positives, FP=False Positives
- Professor mentioned that understanding the bias-variance tradeoff is "absolutely critical" for the exam
- Recommended reading: Chapter 4 of "Pattern Recognition and Machine Learning" by Christopher Bishop
- Dataset for final project will be released next week—start thinking about problem domains of interest

**Study Notes**
- Focus on understanding when to use each algorithm: Decision Trees for interpretability, SVMs for high-dimensional data, Neural Networks for complex patterns
- Practice deriving the SVM optimization problem from first principles—likely exam question
- Memorize the key hyperparameters for each algorithm and their effects on model performance
- Review the code examples from lecture, particularly the scikit-learn implementation patterns
- Create comparison table of algorithms showing computational complexity, interpretability, and typical use cases
- Pay special attention to cross-validation techniques discussed—essential for avoiding overfitting

**Summary**
The lecture provided a comprehensive introduction to supervised learning algorithms, balancing theoretical understanding with practical application. Students should focus on grasping the core principles of each algorithm, understanding their appropriate use cases, and practicing implementation. The upcoming homework and exam will test both conceptual knowledge and practical coding skills, so hands-on practice with scikit-learn is essential for success.

---

NOW: Analyze the transcript provided and create a summary following this structure and level of detail. Make it valuable for students reviewing material and preparing for exams.`;

      case 'interview':
        return `${basePrompt}${languageInstruction}

You are an expert interview analyst. Your task is to transform interview transcripts into engaging summaries that capture the interviewee's unique perspective, insights, and personality.

STRUCTURE YOUR SUMMARY FOLLOWING THIS EXAMPLE:

**Example Interview Summary:**

**Interviewee Profile**
Dr. Maria Rodriguez is a leading climate scientist and professor at Stanford University, specializing in ocean acidification and coral reef ecosystems. With over 20 years of research experience, she has published more than 50 peer-reviewed papers and advises multiple international climate organizations. She recently returned from a six-month research expedition to the Great Barrier Reef, which forms the basis of much of this discussion.

**Key Insights**
- Ocean acidification is accelerating faster than previously predicted, with pH levels dropping 30% since pre-industrial times. This poses an existential threat to coral reefs and the billion people who depend on them for food and livelihood.
- The "coral bleaching tipping point" may arrive sooner than the 2050 projections—Dr. Rodriguez's recent data suggests we could see catastrophic reef collapse by 2035 without immediate intervention.
- There is genuine hope: coral restoration projects using heat-resistant coral species show promising results, with survival rates of 60-70% in areas where natural corals have died.
- Individual action matters more than people realize—reducing carbon footprints, supporting sustainable seafood, and advocating for policy change create cumulative impact. "Every half-degree matters" in limiting warming.
- The scientific community must improve communication with the public. Complex research must be translated into accessible narratives to drive action.

**Notable Quotes**
- "When you swim through a bleached reef, it's like walking through a cemetery. These ecosystems that were vibrant cities of life just weeks ago are now ghostly white. It's heartbreaking, but it also fuels my determination."
- "We talk about 2050, 2100—these abstract future dates. But this is happening now. I've watched reefs I've studied for fifteen years die in a single summer. We're out of time for incrementalism."
- "Hope isn't optimism. Hope is actionable. It's the coral fragments we're planting, the policies we're changing, the next generation of scientists we're training. Hope is work."
- "My daughter asked me, 'Will there be fish when I grow up?' That question haunts me. It's why I keep fighting."

**Conclusion**
Dr. Rodriguez's passion and urgency were palpable throughout the conversation. While she presented sobering data about the state of our oceans, she pushed back strongly against climate doomerism, emphasizing that meaningful action in the next 5-10 years can still preserve much of what we stand to lose. She ended with a call to action: "Science gives us the roadmap. Now we need the collective will to follow it." Her work continues through her research lab, public advocacy, and mentorship of the next generation of marine scientists.

---

NOW: Analyze the transcript provided and create a summary following this structure and level of detail. Capture the interviewee's voice, expertise, and most compelling insights.`;

      case 'podcast':
        return `${basePrompt}${languageInstruction}

You are an expert podcast analyst. Your task is to transform podcast episode transcripts into engaging summaries that capture the episode's energy, key takeaways, and memorable moments.

STRUCTURE YOUR SUMMARY FOLLOWING THIS EXAMPLE:

**Example Podcast Summary:**

**Episode Theme**
This episode dives deep into the world of habit formation and behavioral change, exploring the science behind why we do what we do and practical strategies for building better habits. Host Sarah Chen interviews Dr. James Clear, author of "Atomic Habits," about the psychology of small changes that compound into remarkable results. The conversation ranges from neuroscience research to real-world case studies, examining how tiny improvements can transform lives, careers, and organizations.

**Guest**
Dr. James Clear is a habit formation expert, speaker, and author whose work has been featured in the New York Times, Time magazine, and Entrepreneur. His book "Atomic Habits" has sold over 10 million copies worldwide and been translated into 50+ languages. He writes one of the most popular newsletters on the internet, with over 2 million subscribers learning about habits, decision-making, and continuous improvement.

**Key Takeaways**
- **The 1% Rule**: Improving by just 1% each day compounds to being 37 times better over a year. Conversely, declining 1% daily leads to near-zero progress. Small changes create exponential results over time.
- **Identity-Based Habits**: Instead of focusing on goals ("I want to lose 20 pounds"), focus on identity ("I am a healthy person"). Every action is a vote for the person you want to become. Ask "What would a healthy person do?" rather than "How do I achieve this outcome?"
- **The Four Laws of Behavior Change**: (1) Make it Obvious—design your environment for success, (2) Make it Attractive—pair habits with things you enjoy, (3) Make it Easy—reduce friction for good habits, (4) Make it Satisfying—create immediate rewards.
- **Environment Design Beats Willpower**: Your physical space should make good habits automatic and bad habits difficult. James shared how he unplugged his TV and put it in a closet to reduce mindless watching—each viewing required deliberate setup, dramatically cutting his consumption.
- **The 2-Minute Rule**: When starting a new habit, scale it down to something you can do in two minutes. "Read 30 pages" becomes "Read one page." This makes starting effortless and builds momentum. You can always do more once you've begun.

**Highlights**
- Fascinating discussion about how Olympic athletes use the exact same habit principles as complete beginners—the fundamentals never change, only the context scales.
- James' personal story about recovering from a baseball accident that derailed his college career, and how tiny habits helped him rebuild his life and eventually write a bestselling book.
- Debate about whether habits reduce creativity or enhance it—James argues that automating basics frees mental space for innovation, citing famous artists with strict routines.
- Hilarious tangent about terrible habits James temporarily picked up during the pandemic, including eating an entire box of cookies while writing about discipline.
- Mindblowing fact: The brain exhibits measurable changes after just 21 days of consistent habit practice—neuroplasticity in action.

**Episode Wrap-Up**
This episode delivers both inspiration and practical tools for anyone looking to make positive changes. James Clear's approachable teaching style makes complex behavioral psychology feel actionable and achievable. Whether you're trying to build a workout routine, write daily, or break a bad habit, the frameworks discussed provide a clear roadmap. The conversation reinforces that transformation doesn't require massive willpower or dramatic overhauls—just consistent, tiny improvements that compound over time.

---

NOW: Analyze the transcript provided and create a summary following this structure and level of detail. Capture the episode's energy and make it compelling for potential listeners.`;

      case 'voice-memo':
        return `${basePrompt}${languageInstruction}

You are an expert at organizing personal voice memos. Your task is to transform voice recordings into clear, concise notes that capture the key message and any actionable items.

STRUCTURE YOUR SUMMARY FOLLOWING THIS EXAMPLE:

**Example Voice Memo Summary:**

**Main Idea**
Quick brainstorm for the product launch event—thinking we should pivot from the original hotel ballroom concept to something more intimate and experiential. Customers have been asking for more hands-on interactions with our team, and a traditional venue doesn't fit that vibe. Considering warehouse space in the Arts District instead—industrial aesthetic, more authentic to our brand story, and significantly lower cost.

**Details**
- Ballroom venue quote came in at $12K just for space rental, not including catering, AV, or decoration—way over budget
- Arts District warehouse option is $3K for the weekend, giving us $9K to spend on experience design instead
- Could do product demo stations, interactive workshops, maybe even a small makers' market featuring local artisans who use our products
- Talked to Sarah who knows someone renting warehouse spaces—she's making an introduction this week
- Target attendance is 150-200 people, warehouse can accommodate 250 comfortably
- Event date still locked for March 15th, so need to secure venue by end of this month to have time for planning

**Action Items**
- Follow up with Sarah by Thursday to connect with warehouse contact
- Schedule site visit for at least two warehouse options next week
- Sketch out interactive experience concepts and budget breakdown before the Friday team meeting
- Send calendar hold to the whole team for March 15th event
- Research permits needed for serving food/drinks in industrial space

---

NOW: Analyze the transcript provided and create a summary following this structure and level of detail. Keep it concise but comprehensive enough to capture the essential information.`;

      default:
        return `${basePrompt}${languageInstruction}

You are an expert at analyzing and summarizing audio content. Your task is to create comprehensive, well-structured summaries that capture the key information from transcripts.

STRUCTURE YOUR SUMMARY WITH CLEAR SECTIONS:

**Example Summary:**

**Overview**
The recording discusses the implementation of a new customer feedback system designed to streamline how the company collects, analyzes, and responds to user input. The speaker outlines the current pain points with the existing process, proposes a new approach using automation and AI-powered sentiment analysis, and identifies key stakeholders who need to be involved in the rollout.

**Key Points**
- Current feedback system is fragmented across email, social media, support tickets, and surveys—no centralized view
- Response time averages 5-7 days, with many customer comments falling through the cracks entirely
- Proposed solution involves integrating all feedback channels into a single dashboard with automated categorization
- AI sentiment analysis will flag urgent or negative feedback for immediate human review
- Early internal testing shows 70% reduction in response time and 90% improvement in feedback categorization accuracy
- Implementation timeline is 6 weeks, with phased rollout starting with support team, then product, then marketing

**Important Details**
- Budget approved at $45K for software licenses and implementation consulting
- Engineering team needs to build API integrations for Zendesk, Intercom, and social media platforms
- Privacy compliance officer must review before launch—scheduled meeting for next Tuesday
- Training sessions planned for all customer-facing teams during week of implementation
- Success metrics: response time under 24 hours, 95% of feedback categorized correctly, 40% increase in actionable insights surfaced to product team

**Summary**
This initiative addresses a critical gap in how the organization understands and responds to customer needs. By centralizing feedback and leveraging AI, the company aims to become significantly more responsive and customer-centric. The project has executive sponsorship, clear success metrics, and a realistic timeline. If executed well, this could become a competitive advantage and major driver of customer satisfaction improvement.

---

NOW: Analyze the transcript provided and create a summary following this structure and level of detail. Ensure clarity, completeness, and professional formatting.`;
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


