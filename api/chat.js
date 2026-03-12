"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// api/chat.ts
var chat_exports = {};
__export(chat_exports, {
  default: () => handler
});
module.exports = __toCommonJS(chat_exports);

// api/_providers/openai.ts
var fs = __toESM(require("fs"));
var import_openai = require("openai");

// src/utils/language-prompts.ts
function getLanguagePrompts(languageCode) {
  const prompts = LANGUAGE_PROMPT_MAP[languageCode] || LANGUAGE_PROMPT_MAP["en"];
  return {
    language: languageCode,
    languageName: prompts.name,
    summarizationPrompt: prompts.summary,
    chatSystemPrompt: prompts.chat
  };
}
var LANGUAGE_PROMPT_MAP = {
  // English
  en: {
    name: "English",
    summary: "Please provide a concise summary of the following transcript in English. Include key points, action items, and important decisions.",
    chat: "You are a helpful assistant analyzing an English transcript. Provide clear, concise answers based on the content."
  },
  // Spanish
  es: {
    name: "Spanish",
    summary: "Por favor, proporciona un resumen conciso de la siguiente transcripci\xF3n en espa\xF1ol. Incluye puntos clave, elementos de acci\xF3n y decisiones importantes.",
    chat: "Eres un asistente \xFAtil que analiza una transcripci\xF3n en espa\xF1ol. Proporciona respuestas claras y concisas basadas en el contenido."
  },
  // French
  fr: {
    name: "French",
    summary: "Veuillez fournir un r\xE9sum\xE9 concis de la transcription suivante en fran\xE7ais. Incluez les points cl\xE9s, les actions \xE0 entreprendre et les d\xE9cisions importantes.",
    chat: "Vous \xEAtes un assistant utile qui analyse une transcription en fran\xE7ais. Fournissez des r\xE9ponses claires et concises bas\xE9es sur le contenu."
  },
  // German
  de: {
    name: "German",
    summary: "Bitte erstellen Sie eine pr\xE4gnante Zusammenfassung des folgenden Transkripts auf Deutsch. Ber\xFCcksichtigen Sie wichtige Punkte, Handlungsschritte und wichtige Entscheidungen.",
    chat: "Sie sind ein hilfreicher Assistent, der ein deutsches Transkript analysiert. Geben Sie klare, pr\xE4zise Antworten basierend auf dem Inhalt."
  },
  // Italian
  it: {
    name: "Italian",
    summary: "Per favore, fornisci un riepilogo conciso della seguente trascrizione in italiano. Includi punti chiave, azioni da intraprendere e decisioni importanti.",
    chat: "Sei un assistente utile che analizza una trascrizione in italiano. Fornisci risposte chiare e concise basate sul contenuto."
  },
  // Portuguese
  pt: {
    name: "Portuguese",
    summary: "Por favor, forne\xE7a um resumo conciso da seguinte transcri\xE7\xE3o em portugu\xEAs. Inclua pontos-chave, itens de a\xE7\xE3o e decis\xF5es importantes.",
    chat: "Voc\xEA \xE9 um assistente \xFAtil que analisa uma transcri\xE7\xE3o em portugu\xEAs. Forne\xE7a respostas claras e concisas com base no conte\xFAdo."
  },
  // Portuguese (Brazil)
  "pt-BR": {
    name: "Portuguese (Brazil)",
    summary: "Por favor, forne\xE7a um resumo conciso da seguinte transcri\xE7\xE3o em portugu\xEAs brasileiro. Inclua pontos-chave, itens de a\xE7\xE3o e decis\xF5es importantes.",
    chat: "Voc\xEA \xE9 um assistente \xFAtil que analisa uma transcri\xE7\xE3o em portugu\xEAs brasileiro. Forne\xE7a respostas claras e concisas com base no conte\xFAdo."
  },
  // Russian
  ru: {
    name: "Russian",
    summary: "\u041F\u043E\u0436\u0430\u043B\u0443\u0439\u0441\u0442\u0430, \u043F\u0440\u0435\u0434\u043E\u0441\u0442\u0430\u0432\u044C\u0442\u0435 \u043A\u0440\u0430\u0442\u043A\u043E\u0435 \u0440\u0435\u0437\u044E\u043C\u0435 \u0441\u043B\u0435\u0434\u0443\u044E\u0449\u0435\u0439 \u0440\u0430\u0441\u0448\u0438\u0444\u0440\u043E\u0432\u043A\u0438 \u043D\u0430 \u0440\u0443\u0441\u0441\u043A\u043E\u043C \u044F\u0437\u044B\u043A\u0435. \u0412\u043A\u043B\u044E\u0447\u0438\u0442\u0435 \u043A\u043B\u044E\u0447\u0435\u0432\u044B\u0435 \u043C\u043E\u043C\u0435\u043D\u0442\u044B, \u043F\u0443\u043D\u043A\u0442\u044B \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0439 \u0438 \u0432\u0430\u0436\u043D\u044B\u0435 \u0440\u0435\u0448\u0435\u043D\u0438\u044F.",
    chat: "\u0412\u044B \u043F\u043E\u043B\u0435\u0437\u043D\u044B\u0439 \u0430\u0441\u0441\u0438\u0441\u0442\u0435\u043D\u0442, \u0430\u043D\u0430\u043B\u0438\u0437\u0438\u0440\u0443\u044E\u0449\u0438\u0439 \u0440\u0430\u0441\u0448\u0438\u0444\u0440\u043E\u0432\u043A\u0443 \u043D\u0430 \u0440\u0443\u0441\u0441\u043A\u043E\u043C \u044F\u0437\u044B\u043A\u0435. \u041F\u0440\u0435\u0434\u043E\u0441\u0442\u0430\u0432\u044C\u0442\u0435 \u0447\u0435\u0442\u043A\u0438\u0435 \u0438 \u043A\u0440\u0430\u0442\u043A\u0438\u0435 \u043E\u0442\u0432\u0435\u0442\u044B \u043D\u0430 \u043E\u0441\u043D\u043E\u0432\u0435 \u0441\u043E\u0434\u0435\u0440\u0436\u0430\u043D\u0438\u044F."
  },
  // Chinese (Mandarin)
  zh: {
    name: "Chinese",
    summary: "\u8BF7\u7528\u4E2D\u6587\u63D0\u4F9B\u4EE5\u4E0B\u8F6C\u5F55\u5185\u5BB9\u7684\u7B80\u660E\u6458\u8981\u3002\u5305\u62EC\u5173\u952E\u70B9\u3001\u884C\u52A8\u9879\u76EE\u548C\u91CD\u8981\u51B3\u5B9A\u3002",
    chat: "\u60A8\u662F\u4E00\u4F4D\u6709\u7528\u7684\u52A9\u624B\uFF0C\u6B63\u5728\u5206\u6790\u4E2D\u6587\u8F6C\u5F55\u5185\u5BB9\u3002\u8BF7\u6839\u636E\u5185\u5BB9\u63D0\u4F9B\u6E05\u6670\u3001\u7B80\u6D01\u7684\u7B54\u6848\u3002"
  },
  // Japanese
  ja: {
    name: "Japanese",
    summary: "\u4EE5\u4E0B\u306E\u6587\u5B57\u8D77\u3053\u3057\u306E\u7C21\u6F54\u306A\u8981\u7D04\u3092\u65E5\u672C\u8A9E\u3067\u63D0\u4F9B\u3057\u3066\u304F\u3060\u3055\u3044\u3002\u91CD\u8981\u306A\u30DD\u30A4\u30F3\u30C8\u3001\u30A2\u30AF\u30B7\u30E7\u30F3\u30A2\u30A4\u30C6\u30E0\u3001\u91CD\u8981\u306A\u6C7A\u5B9A\u3092\u542B\u3081\u3066\u304F\u3060\u3055\u3044\u3002",
    chat: "\u3042\u306A\u305F\u306F\u65E5\u672C\u8A9E\u306E\u6587\u5B57\u8D77\u3053\u3057\u3092\u5206\u6790\u3059\u308B\u6709\u7528\u306A\u30A2\u30B7\u30B9\u30BF\u30F3\u30C8\u3067\u3059\u3002\u5185\u5BB9\u306B\u57FA\u3065\u3044\u3066\u660E\u78BA\u3067\u7C21\u6F54\u306A\u56DE\u7B54\u3092\u63D0\u4F9B\u3057\u3066\u304F\u3060\u3055\u3044\u3002"
  },
  // Korean
  ko: {
    name: "Korean",
    summary: "\uB2E4\uC74C \uB179\uCDE8\uB85D\uC758 \uAC04\uACB0\uD55C \uC694\uC57D\uC744 \uD55C\uAD6D\uC5B4\uB85C \uC81C\uACF5\uD574 \uC8FC\uC138\uC694. \uC8FC\uC694 \uC0AC\uD56D, \uC2E4\uD589 \uD56D\uBAA9, \uC911\uC694\uD55C \uACB0\uC815\uC744 \uD3EC\uD568\uD558\uC138\uC694.",
    chat: "\uB2F9\uC2E0\uC740 \uD55C\uAD6D\uC5B4 \uB179\uCDE8\uB85D\uC744 \uBD84\uC11D\uD558\uB294 \uC720\uC6A9\uD55C \uC5B4\uC2DC\uC2A4\uD134\uD2B8\uC785\uB2C8\uB2E4. \uB0B4\uC6A9\uC744 \uAE30\uBC18\uC73C\uB85C \uBA85\uD655\uD558\uACE0 \uAC04\uACB0\uD55C \uB2F5\uBCC0\uC744 \uC81C\uACF5\uD558\uC138\uC694."
  },
  // Arabic
  ar: {
    name: "Arabic",
    summary: "\u064A\u0631\u062C\u0649 \u062A\u0642\u062F\u064A\u0645 \u0645\u0644\u062E\u0635 \u0645\u0648\u062C\u0632 \u0644\u0644\u0646\u0635 \u0627\u0644\u0645\u0643\u062A\u0648\u0628 \u0627\u0644\u062A\u0627\u0644\u064A \u0628\u0627\u0644\u0644\u063A\u0629 \u0627\u0644\u0639\u0631\u0628\u064A\u0629. \u0642\u0645 \u0628\u062A\u0636\u0645\u064A\u0646 \u0627\u0644\u0646\u0642\u0627\u0637 \u0627\u0644\u0631\u0626\u064A\u0633\u064A\u0629 \u0648\u0639\u0646\u0627\u0635\u0631 \u0627\u0644\u0625\u062C\u0631\u0627\u0621\u0627\u062A \u0648\u0627\u0644\u0642\u0631\u0627\u0631\u0627\u062A \u0627\u0644\u0645\u0647\u0645\u0629.",
    chat: "\u0623\u0646\u062A \u0645\u0633\u0627\u0639\u062F \u0645\u0641\u064A\u062F \u064A\u062D\u0644\u0644 \u0646\u0635\u064B\u0627 \u0645\u0643\u062A\u0648\u0628\u064B\u0627 \u0628\u0627\u0644\u0639\u0631\u0628\u064A\u0629. \u0642\u062F\u0645 \u0625\u062C\u0627\u0628\u0627\u062A \u0648\u0627\u0636\u062D\u0629 \u0648\u0645\u0648\u062C\u0632\u0629 \u0628\u0646\u0627\u0621\u064B \u0639\u0644\u0649 \u0627\u0644\u0645\u062D\u062A\u0648\u0649."
  },
  // Hindi
  hi: {
    name: "Hindi",
    summary: "\u0915\u0943\u092A\u092F\u093E \u0928\u093F\u092E\u094D\u0928\u0932\u093F\u0916\u093F\u0924 \u091F\u094D\u0930\u093E\u0902\u0938\u0915\u094D\u0930\u093F\u092A\u094D\u091F \u0915\u093E \u0938\u0902\u0915\u094D\u0937\u093F\u092A\u094D\u0924 \u0938\u093E\u0930\u093E\u0902\u0936 \u0939\u093F\u0902\u0926\u0940 \u092E\u0947\u0902 \u092A\u094D\u0930\u0926\u093E\u0928 \u0915\u0930\u0947\u0902\u0964 \u092E\u0941\u0916\u094D\u092F \u092C\u093F\u0902\u0926\u0941, \u0915\u093E\u0930\u094D\u0930\u0935\u093E\u0908 \u0906\u0907\u091F\u092E \u0914\u0930 \u092E\u0939\u0924\u094D\u0935\u092A\u0942\u0930\u094D\u0923 \u0928\u093F\u0930\u094D\u0923\u092F \u0936\u093E\u092E\u093F\u0932 \u0915\u0930\u0947\u0902\u0964",
    chat: "\u0906\u092A \u090F\u0915 \u0938\u0939\u093E\u092F\u0915 \u0938\u0939\u093E\u092F\u0915 \u0939\u0948\u0902 \u091C\u094B \u0939\u093F\u0902\u0926\u0940 \u091F\u094D\u0930\u093E\u0902\u0938\u0915\u094D\u0930\u093F\u092A\u094D\u091F \u0915\u093E \u0935\u093F\u0936\u094D\u0932\u0947\u0937\u0923 \u0915\u0930 \u0930\u0939\u0947 \u0939\u0948\u0902\u0964 \u0938\u093E\u092E\u0917\u094D\u0930\u0940 \u0915\u0947 \u0906\u0927\u093E\u0930 \u092A\u0930 \u0938\u094D\u092A\u0937\u094D\u091F, \u0938\u0902\u0915\u094D\u0937\u093F\u092A\u094D\u0924 \u0909\u0924\u094D\u0924\u0930 \u092A\u094D\u0930\u0926\u093E\u0928 \u0915\u0930\u0947\u0902\u0964"
  },
  // Dutch
  nl: {
    name: "Dutch",
    summary: "Geef alstublieft een beknopte samenvatting van de volgende transcriptie in het Nederlands. Neem de belangrijkste punten, actiepunten en belangrijke beslissingen op.",
    chat: "U bent een nuttige assistent die een Nederlandse transcriptie analyseert. Geef duidelijke, beknopte antwoorden op basis van de inhoud."
  },
  // Polish
  pl: {
    name: "Polish",
    summary: "Prosz\u0119 poda\u0107 zwi\u0119z\u0142e podsumowanie nast\u0119puj\u0105cej transkrypcji po polsku. Uwzgl\u0119dnij kluczowe punkty, elementy dzia\u0142ania i wa\u017Cne decyzje.",
    chat: "Jeste\u015B pomocnym asystentem analizuj\u0105cym transkrypcj\u0119 w j\u0119zyku polskim. Udzielaj jasnych, zwi\u0119z\u0142ych odpowiedzi na podstawie tre\u015Bci."
  },
  // Turkish
  tr: {
    name: "Turkish",
    summary: "L\xFCtfen a\u015Fa\u011F\u0131daki transkriptin T\xFCrk\xE7e olarak \xF6zet bir \xF6zetini sa\u011Flay\u0131n. \xD6nemli noktalar\u0131, eylem \xF6\u011Felerini ve \xF6nemli kararlar\u0131 i\xE7erin.",
    chat: "T\xFCrk\xE7e bir transkripti analiz eden yararl\u0131 bir asistans\u0131n\u0131z. \u0130\xE7eri\u011Fe dayal\u0131 olarak net, \xF6z cevaplar sa\u011Flay\u0131n."
  },
  // Swedish
  sv: {
    name: "Swedish",
    summary: "V\xE4nligen ge en kortfattad sammanfattning av f\xF6ljande transkription p\xE5 svenska. Inkludera viktiga punkter, \xE5tg\xE4rdspunkter och viktiga beslut.",
    chat: "Du \xE4r en hj\xE4lpsam assistent som analyserar en svensk transkription. Ge tydliga, koncisa svar baserat p\xE5 inneh\xE5llet."
  },
  // Norwegian
  no: {
    name: "Norwegian",
    summary: "Vennligst gi et konsist sammendrag av f\xF8lgende transkript p\xE5 norsk. Inkluder viktige punkter, handlingselementer og viktige beslutninger.",
    chat: "Du er en nyttig assistent som analyserer en norsk transkripsjon. Gi klare, kortfattede svar basert p\xE5 innholdet."
  },
  // Danish
  da: {
    name: "Danish",
    summary: "Venligst giv et kort resum\xE9 af f\xF8lgende transkription p\xE5 dansk. Inkluder n\xF8glepunkter, handlingspunkter og vigtige beslutninger.",
    chat: "Du er en hj\xE6lpsom assistent, der analyserer en dansk transkription. Giv klare, kortfattede svar baseret p\xE5 indholdet."
  },
  // Auto-detect (use English as fallback)
  auto: {
    name: "Auto-detect",
    summary: "Please provide a concise summary of the following transcript. Include key points, action items, and important decisions. Use the same language as the transcript.",
    chat: "You are a helpful assistant analyzing a transcript. Provide clear, concise answers based on the content. Use the same language as the transcript."
  }
};

// src/utils/transcription-prompts.ts
var BASE_SYSTEM_PROMPT = `You are an expert AI assistant for "Trammarise," specializing in transforming raw transcripts into highly structured, professional summaries. 

CRITICAL INSTRUCTIONS:
1. **Chain of Thought**: First, analyze the transcript to identify key themes, participants, and structure. Then, write your summary following the exact format provided.
2. **Remove Filler**: Clean up any remaining filler words or grammatical errors without losing meaning.
3. **Use Markdown**: Format your output with proper headers, tables, and lists for maximum readability.
4. **Be Comprehensive**: Capture all important details, decisions, and action items.`;
var NOISE_WARNINGS = {
  cafe: "NOTE: This audio was recorded in a cafe environment. Be aware of potential background noise and phonetic errors. Rely on context to correct ambiguities.",
  outdoor: "NOTE: This audio was recorded outdoors. Be aware of wind noise, traffic, and potential phonetic errors. Rely on context to correct ambiguities.",
  meeting_room: "NOTE: This audio was recorded in a meeting room. Multiple speakers may overlap. Use context clues to distinguish speakers.",
  phone: "NOTE: This audio was recorded via phone/digital call. Audio compression may cause phonetic errors. Rely on context to correct ambiguities."
};
var SUMMARIZATION_TEMPLATES = {
  meeting: `You are an expert meeting analyst. Transform meeting transcripts into clear, actionable summaries that help teams stay aligned and productive.

STRUCTURE YOUR SUMMARY FOLLOWING THIS EXAMPLE:

**Example Meeting Summary:**

**Executive Summary**
The Q4 Marketing Strategy Review brought together key stakeholders to evaluate current campaign performance and plan initiatives for Q1 2026. The team celebrated the success of the recent social media campaign while identifying critical areas for improvement, particularly in SEO optimization and content strategy. A new product launch was confirmed for January 15, 2026, requiring coordinated efforts across marketing and product teams.

**Attendees & Roles**
- Sarah Chen (VP Marketing) - Meeting Chair, Budget Approver
- Emily White (Content Lead) - SEO Strategy Owner
- David Green (SEO Specialist) - Technical Implementation
- John Smith (Product Manager) - Product Launch Coordinator
- Marketing Team Members - Campaign Execution

**Key Decisions**

| Decision | Owner | Deadline | Budget Impact |
|----------|-------|----------|---------------|
| Allocate $15K for SEO content optimization | Sarah Chen | Q1 2026 | +$15,000 |
| Launch "Project Phoenix" on January 15 | John Smith | Jan 15, 2026 | TBD |
| Implement A/B testing on email campaigns | Emily White | Ongoing | Existing budget |
| Double down on Instagram & LinkedIn | Marketing Team | Q1 2026 | Reallocation |

**Action Items**

| Task | Owner | Deadline | Priority |
|------|-------|----------|----------|
| Develop comprehensive SEO content plan | Emily White | Dec 15 | High |
| Complete SEO audit with recommendations | David Green | Dec 10 | High |
| Provide final product messaging for Phoenix | John Smith | Dec 12 | Critical |
| Review and approve Q1 budget allocation | Sarah Chen | Dec 20 | High |
| Submit feedback on Project Phoenix launch plan | All Team | Dec 18 | Medium |

**Discussion Highlights**
- November social media campaign exceeded engagement targets by 30%, particularly on Instagram Stories
- Conversion rates from landing pages remain below industry benchmarks (2.1% vs 3.5% average)
- Brainstormed innovative content angles for Project Phoenix launch, focusing on sustainability messaging
- Discussed potential partnership opportunities with eco-friendly brands for Q1 co-marketing initiatives
- Identified need for UX improvements on product landing pages to boost conversion

**Strategic Logic Map**
- **Marketing Performance Review**
  - Social Media Success (+30% engagement)
    - Instagram Stories driving engagement
    - LinkedIn professional audience growth
  - Areas for Improvement
    - SEO organic traffic below targets
    - Landing page conversion rates (2.1% vs 3.5%)
- **Q1 Planning**
  - Project Phoenix Launch (Jan 15)
    - Sustainability-focused messaging
    - Cross-team coordination required
  - Budget Reallocation
    - $15K to SEO content
    - Shift from traditional to digital channels
- **Strategic Initiatives**
  - A/B Testing Framework
  - Partnership Exploration
  - UX Optimization

**Next Steps**
The team will reconvene on December 20 to review finalized plans and ensure alignment before the holiday break. Individual contributors will focus on their assigned deliverables, with check-ins scheduled as needed. The January 15 launch date is confirmed, pending final approval of marketing materials by January 8.

---

NOW: Analyze the provided transcript and create a summary following this exact structure and level of detail.`,
  lecture: `You are an expert educational content analyst. Transform lecture transcripts into comprehensive study guides that help students learn effectively and prepare for assessments.

STRUCTURE YOUR SUMMARY FOLLOWING THIS EXAMPLE:

**Example Lecture Summary:**

**Topic Overview**
This lecture covered the fundamentals of machine learning, focusing on supervised learning algorithms and their practical applications. Professor Anderson introduced three main classification algorithms\u2014Decision Trees, Support Vector Machines, and Neural Networks\u2014explaining their mathematical foundations, use cases, and trade-offs. The session emphasized hands-on understanding through real-world examples from healthcare, finance, and e-commerce domains.

**Core Concept**
**The Big Idea**: Machine learning enables computers to learn patterns from data without explicit programming. Supervised learning, the focus of this lecture, uses labeled training data to build models that can predict outcomes for new, unseen inputs. The key challenge is finding the right balance between model complexity and generalization ability.

**Detailed Study Notes**

### Supervised Learning Fundamentals
- **Definition**: Training models on labeled datasets where input-output pairs are known
- **Goal**: Learn patterns to predict outputs for new inputs
- **Key Distinction**: Unlike unsupervised learning (unlabeled data), supervised learning has ground truth labels
- **Applications**: Classification (discrete outputs) and Regression (continuous outputs)

### Decision Trees
- **How They Work**: Hierarchical models that make predictions by learning decision rules from features
- **Structure**: Tree-like graph with decision nodes (tests on features) and leaf nodes (predictions)
- **Advantages**:
  - Highly interpretable (can visualize decision path)
  - Handles non-linear relationships naturally
  - No feature scaling required
- **Disadvantages**:
  - Prone to overfitting without pruning
  - Can be unstable (small data changes \u2192 different tree)
- **Use Cases**: Medical diagnosis, credit approval, customer segmentation

### Support Vector Machines (SVM)
- **How They Work**: Find optimal hyperplane that separates classes with maximum margin
- **Key Concept**: Margin = distance between hyperplane and nearest data points (support vectors)
- **Kernel Trick**: Transform data to higher dimensions to handle non-linear boundaries
- **Advantages**:
  - Effective in high-dimensional spaces
  - Memory efficient (only uses support vectors)
  - Versatile (different kernel functions)
- **Disadvantages**:
  - Computationally expensive for large datasets
  - Requires careful parameter tuning
- **Use Cases**: Text classification, image recognition, bioinformatics

### Neural Networks
- **How They Work**: Computing systems inspired by biological neural networks
- **Structure**: Interconnected nodes (neurons) organized in layers (input, hidden, output)
- **Learning Process**: Backpropagation + Gradient Descent to minimize error
- **Advantages**:
  - Can learn extremely complex patterns
  - Scalable to massive datasets
  - State-of-the-art performance on many tasks
- **Disadvantages**:
  - "Black box" - difficult to interpret
  - Requires large amounts of training data
  - Computationally intensive
- **Use Cases**: Computer vision, natural language processing, game playing

### Overfitting vs. Underfitting
- **Overfitting**: Model memorizes training data but fails to generalize (high variance)
  - Symptoms: Perfect training accuracy, poor test accuracy
  - Solutions: Regularization, pruning, more training data
- **Underfitting**: Model too simple to capture underlying patterns (high bias)
  - Symptoms: Poor training and test accuracy
  - Solutions: Increase model complexity, add features
- **Sweet Spot**: Balance achieved through cross-validation and regularization

**Glossary of Terms**
- **Hyperplane**: Decision boundary in n-dimensional space that separates classes
- **Support Vectors**: Data points closest to the decision boundary that define the margin
- **Backpropagation**: Algorithm for computing gradients in neural networks
- **Gradient Descent**: Optimization algorithm that iteratively adjusts parameters to minimize loss
- **Regularization**: Technique to prevent overfitting by penalizing model complexity
- **Cross-Validation**: Method to assess model performance by splitting data into train/test sets
- **Kernel Function**: Mathematical function that transforms data to higher dimensions
- **Activation Function**: Non-linear function applied to neuron outputs (e.g., ReLU, Sigmoid)
- **Confusion Matrix**: Table showing true positives, false positives, true negatives, false negatives
- **Precision**: TP / (TP + FP) - Of predicted positives, how many are actually positive?

**Important Details & Exam Notes**
- \u26A0\uFE0F **CRITICAL FOR EXAM**: Understanding the bias-variance tradeoff is "absolutely critical" (Professor's words)
- \u{1F4DD} **Homework Assignment 3**: Implement Decision Tree classifier in Python using scikit-learn, due next Thursday
- \u{1F4C5} **Midterm Exam**: October 15, covers all supervised learning algorithms discussed so far
- \u{1F4CA} **Precision Formula**: TP / (TP + FP) - memorize this for the exam
- \u{1F4D6} **Recommended Reading**: Chapter 4 of "Pattern Recognition and Machine Learning" by Christopher Bishop
- \u{1F3AF} **Final Project**: Dataset will be released next week\u2014start thinking about problem domains of interest
- \u{1F4A1} **Professor's Tip**: Focus on understanding WHEN to use each algorithm, not just HOW they work

**Potential Quiz Questions**
1. **Compare and Contrast**: Explain the key differences between Decision Trees and SVMs. When would you choose one over the other?
2. **Mathematical Derivation**: Derive the SVM optimization problem from first principles (hint: maximize margin subject to correct classification)
3. **Practical Application**: Given a dataset with 100,000 samples and 50 features, which algorithm would you choose and why? Consider computational complexity and interpretability requirements.

**Study Strategy**
- Create a comparison table of all three algorithms showing: computational complexity, interpretability, typical use cases, and hyperparameters
- Practice implementing each algorithm in scikit-learn using the code examples from lecture
- Review cross-validation techniques\u2014essential for avoiding overfitting
- Work through the homework assignment early to identify gaps in understanding
- Form study groups to discuss the bias-variance tradeoff concept

---

NOW: Analyze the provided transcript and create a summary following this exact structure and level of detail.`,
  interview: `You are an expert interview analyst. Transform interview transcripts into engaging summaries that capture the interviewee's unique perspective, insights, and personality.

STRUCTURE YOUR SUMMARY FOLLOWING THIS EXAMPLE:

**Example Interview Summary:**

**Interviewee Profile**
Dr. Maria Rodriguez is a leading climate scientist and professor at Stanford University, specializing in ocean acidification and coral reef ecosystems. With over 20 years of research experience, she has published more than 50 peer-reviewed papers and advises multiple international climate organizations. She recently returned from a six-month research expedition to the Great Barrier Reef, which forms the basis of much of this discussion.

**Key Insights**
- **Ocean Acidification Crisis**: Accelerating faster than predicted\u2014pH levels have dropped 30% since pre-industrial times, posing an existential threat to coral reefs and the billion people who depend on them for food and livelihood
- **Tipping Point Approaching**: The "coral bleaching tipping point" may arrive sooner than 2050 projections. Dr. Rodriguez's recent data suggests catastrophic reef collapse could occur by 2035 without immediate intervention
- **Hope Through Innovation**: Coral restoration projects using heat-resistant coral species show promising results, with 60-70% survival rates in areas where natural corals have died
- **Individual Action Matters**: Reducing carbon footprints, supporting sustainable seafood, and advocating for policy change create cumulative impact. "Every half-degree matters" in limiting warming
- **Communication Gap**: The scientific community must improve public communication. Complex research must be translated into accessible narratives to drive action

**Notable Quotes**
> "When you swim through a bleached reef, it's like walking through a cemetery. These ecosystems that were vibrant cities of life just weeks ago are now ghostly white. It's heartbreaking, but it also fuels my determination."

> "We talk about 2050, 2100\u2014these abstract future dates. But this is happening now. I've watched reefs I've studied for fifteen years die in a single summer. We're out of time for incrementalism."

> "Hope isn't optimism. Hope is actionable. It's the coral fragments we're planting, the policies we're changing, the next generation of scientists we're training. Hope is work."

> "My daughter asked me, 'Will there be fish when I grow up?' That question haunts me. It's why I keep fighting."

**Thematic Analysis**

### Urgency & Timeline
- Immediate crisis, not future problem
- 2035 potential collapse vs. 2050 previous estimates
- Personal witness to 15-year reef degradation
- "Out of time for incrementalism"

### Scientific Evidence
- 30% pH drop since pre-industrial era
- Heat-resistant coral 60-70% survival rates
- Six-month Great Barrier Reef expedition data
- 50+ peer-reviewed publications

### Solutions & Hope
- Coral restoration technology
- Heat-resistant species cultivation
- Policy advocacy and change
- Next-generation scientist training
- Individual carbon reduction

### Personal Motivation
- Daughter's question about future fish populations
- 20 years of dedicated research
- Heartbreak transformed into determination
- Responsibility to future generations

**Conclusion**
Dr. Rodriguez's passion and urgency were palpable throughout the conversation. While she presented sobering data about the state of our oceans, she pushed back strongly against climate doomerism, emphasizing that meaningful action in the next 5-10 years can still preserve much of what we stand to lose. She ended with a powerful call to action: "Science gives us the roadmap. Now we need the collective will to follow it." Her work continues through her research lab, public advocacy, and mentorship of the next generation of marine scientists.

---

NOW: Analyze the provided transcript and create a summary following this exact structure and level of detail.`,
  podcast: `You are an expert podcast analyst. Transform podcast episode transcripts into engaging summaries that capture the episode's energy, key takeaways, and memorable moments.

STRUCTURE YOUR SUMMARY FOLLOWING THIS EXAMPLE:

**Example Podcast Summary:**

**Episode Theme**
This episode dives deep into the world of habit formation and behavioral change, exploring the science behind why we do what we do and practical strategies for building better habits. Host Sarah Chen interviews Dr. James Clear, author of "Atomic Habits," about the psychology of small changes that compound into remarkable results. The conversation ranges from neuroscience research to real-world case studies, examining how tiny improvements can transform lives, careers, and organizations.

**Guest Bio**
Dr. James Clear is a habit formation expert, speaker, and author whose work has been featured in the New York Times, Time magazine, and Entrepreneur. His book "Atomic Habits" has sold over 10 million copies worldwide and been translated into 50+ languages. He writes one of the most popular newsletters on the internet, with over 2 million subscribers learning about habits, decision-making, and continuous improvement.

**Key Takeaways**

### The 1% Rule
Improving by just 1% each day compounds to being 37 times better over a year. Conversely, declining 1% daily leads to near-zero progress. Small changes create exponential results over time.

### Identity-Based Habits
Instead of focusing on goals ("I want to lose 20 pounds"), focus on identity ("I am a healthy person"). Every action is a vote for the person you want to become. Ask "What would a healthy person do?" rather than "How do I achieve this outcome?"

### The Four Laws of Behavior Change
1. **Make it Obvious** - Design your environment for success
2. **Make it Attractive** - Pair habits with things you enjoy
3. **Make it Easy** - Reduce friction for good habits
4. **Make it Satisfying** - Create immediate rewards

### Environment Design Beats Willpower
Your physical space should make good habits automatic and bad habits difficult. James shared how he unplugged his TV and put it in a closet to reduce mindless watching\u2014each viewing required deliberate setup, dramatically cutting his consumption.

### The 2-Minute Rule
When starting a new habit, scale it down to something you can do in two minutes. "Read 30 pages" becomes "Read one page." This makes starting effortless and builds momentum. You can always do more once you've begun.

**Episode Highlights**
- \u{1F3C5} **Olympic Athletes vs. Beginners**: Fascinating discussion about how Olympic athletes use the exact same habit principles as complete beginners\u2014the fundamentals never change, only the context scales
- \u{1F4AA} **Personal Recovery Story**: James' journey recovering from a baseball accident that derailed his college career, and how tiny habits helped him rebuild his life and eventually write a bestselling book
- \u{1F3A8} **Creativity Debate**: Thoughtful discussion about whether habits reduce creativity or enhance it. James argues that automating basics frees mental space for innovation, citing famous artists with strict routines
- \u{1F36A} **Pandemic Confession**: Hilarious tangent about terrible habits James temporarily picked up during the pandemic, including eating an entire box of cookies while writing about discipline
- \u{1F9E0} **Neuroplasticity in Action**: Mind-blowing fact\u2014the brain exhibits measurable changes after just 21 days of consistent habit practice

**Strategic Logic Map**
- **Core Philosophy**
  - Small changes compound over time (1% rule)
  - Identity drives behavior more than goals
  - Systems beat motivation
- **Implementation Framework**
  - Four Laws of Behavior Change
    - Obvious \u2192 Environmental design
    - Attractive \u2192 Temptation bundling
    - Easy \u2192 Reduce friction
    - Satisfying \u2192 Immediate rewards
  - 2-Minute Rule for starting
  - Habit stacking for consistency
- **Common Obstacles**
  - Willpower is unreliable
  - Environment sabotages intentions
  - Starting too big leads to failure
- **Solutions**
  - Design environment for success
  - Make good habits automatic
  - Scale down to 2-minute versions

**Episode Wrap-Up**
This episode delivers both inspiration and practical tools for anyone looking to make positive changes. James Clear's approachable teaching style makes complex behavioral psychology feel actionable and achievable. Whether you're trying to build a workout routine, write daily, or break a bad habit, the frameworks discussed provide a clear roadmap. The conversation reinforces that transformation doesn't require massive willpower or dramatic overhauls\u2014just consistent, tiny improvements that compound over time.

---

NOW: Analyze the provided transcript and create a summary following this exact structure and level of detail.`,
  "voice-memo": `You are an expert at organizing personal voice memos. Transform voice recordings into clear, concise notes that capture the key message and any actionable items.

STRUCTURE YOUR SUMMARY FOLLOWING THIS EXAMPLE:

**Example Voice Memo Summary:**

**Main Idea**
Quick brainstorm for the product launch event\u2014thinking we should pivot from the original hotel ballroom concept to something more intimate and experiential. Customers have been asking for more hands-on interactions with our team, and a traditional venue doesn't fit that vibe. Considering warehouse space in the Arts District instead\u2014industrial aesthetic, more authentic to our brand story, and significantly lower cost.

**Details**
- Ballroom venue quote came in at $12K just for space rental, not including catering, AV, or decoration\u2014way over budget
- Arts District warehouse option is $3K for the weekend, giving us $9K to spend on experience design instead
- Could do product demo stations, interactive workshops, maybe even a small makers' market featuring local artisans who use our products
- Talked to Sarah who knows someone renting warehouse spaces\u2014she's making an introduction this week
- Target attendance is 150-200 people, warehouse can accommodate 250 comfortably
- Event date still locked for March 15th, so need to secure venue by end of this month to have time for planning

**Action Items**
- [ ] Follow up with Sarah by Thursday to connect with warehouse contact
- [ ] Schedule site visit for at least two warehouse options next week
- [ ] Sketch out interactive experience concepts and budget breakdown before the Friday team meeting
- [ ] Send calendar hold to the whole team for March 15th event
- [ ] Research permits needed for serving food/drinks in industrial space

---

NOW: Analyze the provided transcript and create a summary following this exact structure and level of detail.`,
  "daily-stand-up": `You are an expert at summarizing daily stand-up meetings. Create concise summaries that highlight progress, plans, and blockers.

**Example Daily Stand-Up Summary:**

**Progress (Yesterday)**
- Emily: Completed user authentication module, all tests passing
- David: Fixed critical bug in payment processing, deployed to staging
- Sarah: Finished design mockups for mobile app redesign

**The Plan (Today)**
- Emily: Start implementing password reset functionality
- David: Begin integration testing for payment gateway
- Sarah: Present mobile redesign to stakeholders at 2pm

**Blockers**
- \u{1F6A8} **CRITICAL**: David is blocked on payment gateway API credentials\u2014needs access from finance team ASAP
- \u26A0\uFE0F **WARNING**: Sarah waiting on feedback from product team to finalize color scheme

---

NOW: Analyze the provided transcript and create a summary following this exact structure.`,
  "focus-group": `You are an expert at summarizing focus group discussions. Create structured summaries that capture participant feedback, themes, and insights.

**Example Focus Group Summary:**

**Executive Summary**
Focus group of 8 participants (ages 25-45) discussed the new mobile app prototype. Overall reception was positive, with strong enthusiasm for the simplified navigation. Key concerns centered on the checkout process and lack of dark mode. Participants valued the personalization features but expressed privacy concerns about data collection.

**Key Themes**

### Positive Feedback
- Simplified navigation praised by all participants
- Personalization features seen as "game-changing"
- Visual design described as "modern" and "clean"

### Areas for Improvement
- Checkout process too many steps (average 5 clicks to complete)
- Missing dark mode option (requested by 6/8 participants)
- Privacy concerns about data collection for personalization

**Action Items**
- [ ] Streamline checkout to 3 steps maximum @UX-Team #Feb-15
- [ ] Implement dark mode toggle @Dev-Team #Mar-1
- [ ] Create transparent privacy policy explainer @Legal #Feb-20

**Next Steps**
Schedule follow-up session after implementing dark mode and checkout improvements to validate changes.

---

NOW: Analyze the provided transcript and create a summary following this exact structure.`,
  "sales-call": `You are an expert at analyzing sales calls. Create structured summaries that capture prospect pain points, budget signals, objections, and next steps.

**Example Sales Call Summary:**

**Prospect Profile**
- **Company**: TechCorp Inc.
- **Contact**: Jennifer Martinez, VP of Operations
- **Company Size**: 500 employees, $50M annual revenue
- **Industry**: SaaS / B2B Software
- **Current Solution**: Using legacy system from 2015, experiencing scaling issues

**Pain Points Identified**
- Current system crashes during peak usage (3-4 times per month)
- Manual data entry consuming 20+ hours per week across team
- No mobile access for remote workers (40% of workforce)
- Reporting takes 2-3 days to generate, needs to be real-time
- Integration with Salesforce is "clunky and unreliable"

**Budget & Authority Signals**
- \u2705 **Budget Confirmed**: "We've allocated $150K for this initiative in Q1"
- \u2705 **Decision Maker**: Jennifer has final approval for tools under $200K
- \u2705 **Timeline**: "Need to have something in place by end of Q2"
- \u26A0\uFE0F **Procurement**: Needs to go through IT security review (2-3 weeks)

**Objections Raised & Responses**

| Objection | How Addressed | Outcome |
|-----------|---------------|---------|
| "Concerned about migration complexity" | Shared case study of similar-sized company with 2-week migration | Satisfied, requested case study PDF |
| "Team might resist change" | Emphasized training program + dedicated onboarding specialist | Interested, asked about training timeline |
| "Pricing seems high compared to current solution" | Showed ROI calculator: 20hrs/week saved = $52K annually | Acknowledged value, wants to see detailed ROI |

**Next Steps**
- [ ] Send case study PDF and ROI calculator by EOD today
- [ ] Schedule technical demo with IT team next Tuesday at 2pm
- [ ] Prepare security documentation for IT review
- [ ] Follow up on Friday to confirm demo attendance

**Deal Health**: \u{1F7E2} **Strong** - Budget confirmed, clear pain points, engaged decision maker, timeline aligns with our sales cycle.

---

NOW: Analyze the provided transcript and create a summary following this exact structure.`,
  "medical-clinical": `You are an expert at summarizing medical clinical discussions. Create structured summaries following SOAP format where appropriate.

**Example Medical Clinical Summary:**

**Patient Information**
- Chief Complaint: Persistent headaches for 3 weeks
- Duration: 3 weeks, increasing in frequency

**Subjective**
Patient reports throbbing headaches, primarily in temporal region, occurring 4-5 times per week. Pain rated 6-7/10. Associated symptoms include light sensitivity and occasional nausea. No visual disturbances. Stress at work has increased recently.

**Objective**
- Vital Signs: BP 128/82, HR 76, Temp 98.6\xB0F
- Neurological exam: Normal
- No focal deficits noted

**Assessment**
Likely tension-type headaches, possibly migraine without aura. Stress appears to be contributing factor.

**Plan**
- Start ibuprofen 400mg as needed
- Recommend stress management techniques
- Follow-up in 2 weeks if symptoms persist
- Consider neurology referral if no improvement

---

NOW: Analyze the provided transcript and create a summary following appropriate clinical structure.`,
  legal: `You are an expert at summarizing legal discussions. Create structured summaries that capture key legal points, decisions, and action items.

**Example Legal Summary:**

**Matter**
Contract Review - Vendor Agreement with DataCorp Solutions

**Key Legal Issues**
- Indemnification clause overly broad, exposes company to unlimited liability
- Data privacy provisions don't comply with GDPR requirements
- Termination clause lacks mutual termination rights
- IP ownership ambiguous for jointly developed features

**Decisions Made**
- Reject current indemnification language, propose standard mutual indemnification
- Require GDPR compliance addendum before signing
- Negotiate for mutual 30-day termination clause
- Clarify IP ownership: company retains all rights to jointly developed features

**Action Items**
- [ ] Draft redlined version with proposed changes @Legal-Team #Jan-30
- [ ] Schedule call with DataCorp legal counsel @Business-Dev #Feb-2
- [ ] Prepare GDPR compliance checklist @Privacy-Officer #Jan-28

**Risk Assessment**
\u{1F534} **HIGH RISK** if signed as-is. Recommend significant revisions before execution.

---

NOW: Analyze the provided transcript and create a summary following this exact structure.`,
  other: `You are an expert at analyzing and summarizing audio content. Create comprehensive, well-structured summaries that capture the key information from transcripts.

**Example Summary:**

**Overview**
The recording discusses the implementation of a new customer feedback system designed to streamline how the company collects, analyzes, and responds to user input. The speaker outlines the current pain points with the existing process, proposes a new approach using automation and AI-powered sentiment analysis, and identifies key stakeholders who need to be involved in the rollout.

**Key Points**
- Current feedback system is fragmented across email, social media, support tickets, and surveys\u2014no centralized view
- Response time averages 5-7 days, with many customer comments falling through the cracks entirely
- Proposed solution involves integrating all feedback channels into a single dashboard with automated categorization
- AI sentiment analysis will flag urgent or negative feedback for immediate human review
- Early internal testing shows 70% reduction in response time and 90% improvement in feedback categorization accuracy
- Implementation timeline is 6 weeks, with phased rollout starting with support team, then product, then marketing

**Important Details**
- Budget approved at $45K for software licenses and implementation consulting
- Engineering team needs to build API integrations for Zendesk, Intercom, and social media platforms
- Privacy compliance officer must review before launch\u2014scheduled meeting for next Tuesday
- Training sessions planned for all customer-facing teams during week of implementation
- Success metrics: response time under 24 hours, 95% of feedback categorized correctly, 40% increase in actionable insights surfaced to product team

**Summary**
This initiative addresses a critical gap in how the organization understands and responds to customer needs. By centralizing feedback and leveraging AI, the company aims to become significantly more responsive and customer-centric. The project has executive sponsorship, clear success metrics, and a realistic timeline. If executed well, this could become a competitive advantage and major driver of customer satisfaction improvement.

---

NOW: Analyze the provided transcript and create a summary following this exact structure and level of detail.`
};
function getNoiseWarning(noiseProfile) {
  if (!noiseProfile || noiseProfile === "quiet") {
    return "";
  }
  return NOISE_WARNINGS[noiseProfile] || "";
}
function getSummarizationPrompt(contentType, language, noiseProfile) {
  const languageCode = language || "en";
  const langPrompts = getLanguagePrompts(languageCode);
  const languageInstruction = `

IMPORTANT: ${langPrompts.summarizationPrompt}`;
  const noiseWarning = getNoiseWarning(noiseProfile);
  const noiseInstruction = noiseWarning ? `

${noiseWarning}` : "";
  const template = SUMMARIZATION_TEMPLATES[contentType] || SUMMARIZATION_TEMPLATES["other"];
  return `${BASE_SYSTEM_PROMPT}${languageInstruction}${noiseInstruction}

${template}`;
}

// api/_providers/openai.ts
var OpenAIProvider = class {
  name = "OpenAI";
  async transcribe(params) {
    const openai = new import_openai.OpenAI({ baseURL: "https://api.openai.com/v1", apiKey: params.apiKey });
    const modelToUse = params.model || "whisper-1";
    console.log(`[OpenAI] Transcribing with model=${modelToUse}`);
    const completion = await openai.audio.transcriptions.create({
      file: fs.createReadStream(params.filePath),
      model: modelToUse,
      language: params.language,
      prompt: params.prompt,
      temperature: params.temperature
    });
    return completion.text;
  }
  async summarize({
    transcript,
    contentType,
    apiKey,
    model,
    context,
    language
  }) {
    const openai = new import_openai.OpenAI({ baseURL: "https://api.openai.com/v1", apiKey });
    const systemPrompt = getSummarizationPrompt(
      contentType || "other",
      language,
      context?.noiseProfile
    );
    const messages = [{ role: "system", content: systemPrompt }];
    const userContent = [
      { type: "text", text: `Please summarize this transcript:

${transcript}` }
    ];
    if (context) {
      if (context.text) {
        userContent.push({
          type: "text",
          text: `

Additional Context from Documents:
${context.text}`
        });
      }
      if (context.images && context.images.length > 0) {
        context.images.forEach((img) => {
          userContent.push({
            type: "image_url",
            image_url: {
              url: `data:${img.type};base64,${img.data}`
            }
          });
        });
      }
    }
    messages.push({ role: "user", content: userContent });
    const completion = await openai.chat.completions.create({
      model: model || "gpt-4o",
      // Default to gpt-4o if not specified
      messages,
      temperature: 0.7
    });
    return completion.choices[0]?.message?.content || "";
  }
  async chat({
    transcript,
    summary,
    message,
    history,
    apiKey,
    model,
    language
  }) {
    const openai = new import_openai.OpenAI({ baseURL: "https://api.openai.com/v1", apiKey });
    const languageCode = language || "en";
    const langPrompts = getLanguagePrompts(languageCode);
    const completion = await openai.chat.completions.create({
      model: model || "gpt-4o",
      messages: [
        {
          role: "system",
          content: `${langPrompts.chatSystemPrompt}

Transcript: ${transcript}

Current Summary: ${summary}

Respond concisely and use markdown formatting where appropriate.`
        },
        ...history,
        { role: "user", content: message }
      ],
      temperature: 0.7
    });
    return completion.choices[0]?.message?.content || "";
  }
  async validateApiKey(apiKey) {
    try {
      const openai = new import_openai.OpenAI({ baseURL: "https://api.openai.com/v1", apiKey });
      await openai.models.list();
      return true;
    } catch (error) {
      const err = error;
      console.error("OpenAI API key validation error:", {
        message: err?.message,
        status: err?.status,
        type: err?.type,
        code: err?.code
      });
      return false;
    }
  }
};

// api/_providers/openrouter.ts
var import_ai_sdk_provider = require("@openrouter/ai-sdk-provider");
var import_ai = require("ai");
var OpenRouterProvider = class {
  name = "OpenRouter";
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async transcribe(_params) {
    throw new Error("Transcription not supported by OpenRouter provider yet.");
  }
  async summarize(params) {
    const { transcript, contentType, apiKey, model, context, language } = params;
    if (!model) {
      throw new Error("Model is required for OpenRouter provider");
    }
    const openrouter = (0, import_ai_sdk_provider.createOpenRouter)({
      apiKey
    });
    const systemPrompt = getSummarizationPrompt(
      contentType || "other",
      language,
      context?.noiseProfile
    );
    const userContent = [
      { type: "text", text: `Transcript:\\n${transcript}` }
    ];
    if (context) {
      if (context.text) {
        userContent.push({
          type: "text",
          text: `

Additional Context from Documents:
${context.text}`
        });
      }
      if (context.images && context.images.length > 0) {
        context.images.forEach((img) => {
          userContent.push({
            type: "image",
            image: `data:${img.type};base64,${img.data}`
          });
        });
      }
    }
    const { text } = await (0, import_ai.generateText)({
      model: openrouter(model),
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userContent }
      ]
    });
    return text;
  }
  async chat(params) {
    const { transcript, summary, message, history, apiKey, model, language } = params;
    if (!model) {
      throw new Error("Model is required for OpenRouter provider");
    }
    const openrouter = (0, import_ai_sdk_provider.createOpenRouter)({
      apiKey
    });
    const languageCode = language || "en";
    const langPrompts = getLanguagePrompts(languageCode);
    const systemPrompt = `${langPrompts.chatSystemPrompt}

Transcript:
${transcript}

Summary:
${summary}

Answer questions about the content, provide insights, or help refine the summary.`;
    const messages = [
      { role: "system", content: systemPrompt },
      ...history.map((msg) => ({
        role: msg.role,
        content: msg.content
      })),
      { role: "user", content: message }
    ];
    const { text } = await (0, import_ai.generateText)({
      model: openrouter(model),
      messages
    });
    return text;
  }
  async validateApiKey(apiKey) {
    try {
      const openrouter = (0, import_ai_sdk_provider.createOpenRouter)({
        apiKey
      });
      await (0, import_ai.generateText)({
        model: openrouter("openai/gpt-3.5-turbo"),
        prompt: "Hi"
      });
      return true;
    } catch (error) {
      console.error("OpenRouter API key validation failed:", error);
      return false;
    }
  }
};

// api/_providers/ai-factory.ts
var AIProviderFactory = class {
  /**
   * Get an AI provider instance by type
   *
   * @param providerType - The type of AI provider ('openai' or 'openrouter')
   * @returns An instance of the requested AI provider
   * @throws Error if provider type is unknown
   */
  static getProvider(providerType) {
    switch (providerType) {
      case "openai":
        return new OpenAIProvider();
      case "openrouter":
        return new OpenRouterProvider();
      default:
        throw new Error(`Unknown AI provider: ${providerType}`);
    }
  }
};

// src/utils/constants.ts
var AUDIO_CONSTANTS = {
  // FFmpeg transcoding
  TRANSCODE_BITRATE: "128k",
  CHUNK_SIZE_LIMIT: 22 * 1024 * 1024,
  // 22MB (3MB safety margin below 25MB Whisper API limit, accounts for encoding overhead)
  SEGMENT_TIME_SECONDS: 20 * 60,
  // 20 minutes (1200s - safe for both models)
  // OpenAI Transcription API duration limits (informational)
  // These limits trigger API auto-retry with larger model, NOT frontend chunking
  // gpt-4o-mini-transcribe: 16K token context (~15 min safe duration)
  // gpt-4o-transcribe: Larger context (~23 min max duration)
  MAX_AUDIO_DURATION_MINI_MODEL: 15 * 60,
  // 900 seconds (15 minutes) - conservative for mini model
  MAX_AUDIO_DURATION_SECONDS: 1400,
  // Maximum duration for full model (23.3 minutes)
  SAFE_CHUNK_DURATION_SECONDS: 20 * 60,
  // 20 minutes - chunk duration for FFmpeg segmentation
  // Recording
  RECORDING_TIMER_INTERVAL: 100,
  // milliseconds
  // Trim validation
  MIN_TRIM_DURATION: 0.1
  // 0.1 seconds minimum trim duration
};
var API_VALIDATION = {
  // Transcript/Summary limits
  MAX_TRANSCRIPT_LENGTH: 5e5,
  // 500KB text limit
  MIN_TRANSCRIPT_LENGTH: 10,
  // Minimum 10 characters
  MAX_MESSAGE_LENGTH: 1e4,
  // 10KB message limit
  MAX_HISTORY_ITEMS: 50,
  // Limit conversation history
  MAX_TEXT_LENGTH: 5e5,
  // 500KB for transcript/summary
  // API Key validation
  MIN_API_KEY_LENGTH: 10,
  MAX_API_KEY_LENGTH: 200,
  // File size limits
  MAX_FILE_SIZE: 100 * 1024 * 1024,
  // 100MB limit for uploads
  MAX_FIELDS: 10,
  // Max form fields in multipart
  MAX_FILES: 1,
  // Max files in multipart
  // Timeouts
  REQUEST_TIMEOUT: 6e4,
  // 60 seconds
  VALIDATION_TIMEOUT: 3e4,
  // 30 seconds
  API_DEFAULT_TIMEOUT: 12e4,
  // 2 minutes
  TRANSCRIBE_TIMEOUT: 3e5
  // 5 minutes for large audio files
};

// src/types/performance-levels.ts
function getSummarizationModelForLevel(level) {
  return level === "advanced" ? "o3-mini" : "gpt-4o";
}

// api/_lib/supabase-admin.ts
var import_supabase_js = require("@supabase/supabase-js");
var supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
var supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.warn("Supabase admin credentials not found. Server-side operations will fail.");
}
var supabaseAdmin = (0, import_supabase_js.createClient)(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

// api/_middleware/auth.ts
var AuthError = class extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.name = "AuthError";
  }
};
async function requireAuth(req) {
  const authHeader = req.headers["authorization"];
  const raw = Array.isArray(authHeader) ? authHeader[0] : authHeader;
  const token = raw?.startsWith("Bearer ") ? raw.slice(7) : null;
  if (!token) {
    throw new AuthError("Missing authorization token", 401);
  }
  const {
    data: { user },
    error
  } = await supabaseAdmin.auth.getUser(token);
  if (error || !user) {
    throw new AuthError("Invalid or expired token", 401);
  }
  return { userId: user.id };
}

// api/_middleware/rate-limit.ts
var requestCounts = /* @__PURE__ */ new Map();
var RateLimitError = class extends Error {
  constructor(message, statusCode, retryAfter) {
    super(message);
    this.statusCode = statusCode;
    this.retryAfter = retryAfter;
    this.name = "RateLimitError";
  }
};
async function rateLimit(req, config) {
  const key = config.keyGenerator ? config.keyGenerator(req) : getDefaultKey(req);
  const now = Date.now();
  cleanupExpired(now);
  const record = requestCounts.get(key);
  if (!record || now > record.resetAt) {
    requestCounts.set(key, {
      count: 1,
      resetAt: now + config.windowMs
    });
    return;
  }
  if (record.count >= config.maxRequests) {
    const retryAfter = Math.ceil((record.resetAt - now) / 1e3);
    throw new RateLimitError("Too many requests", 429, retryAfter);
  }
  record.count++;
}
function getDefaultKey(req) {
  const forwarded = req.headers["x-forwarded-for"];
  const ip = typeof forwarded === "string" ? forwarded.split(",")[0].trim() : req.socket?.remoteAddress || "unknown";
  return `ip:${ip}`;
}
function cleanupExpired(now) {
  for (const [key, record] of requestCounts.entries()) {
    if (now > record.resetAt) {
      requestCounts.delete(key);
    }
  }
}
var RATE_LIMITS = {
  /** Strict rate limit for API key validation - prevents brute force attacks */
  VALIDATE_KEY: {
    windowMs: 15 * 60 * 1e3,
    // 15 minutes
    maxRequests: 10
  },
  /** Rate limit for transcription endpoint */
  TRANSCRIBE: {
    windowMs: 60 * 60 * 1e3,
    // 1 hour
    maxRequests: 20
  },
  /** Rate limit for summarization endpoint */
  SUMMARIZE: {
    windowMs: 60 * 60 * 1e3,
    // 1 hour
    maxRequests: 100
  },
  /** Rate limit for chat endpoint */
  CHAT: {
    windowMs: 60 * 1e3,
    // 1 minute
    maxRequests: 60
    // 60 messages per minute per user
  },
  /** Permissive rate limit for user preferences endpoint */
  PREFERENCES: {
    windowMs: 60 * 1e3,
    // 1 minute
    maxRequests: 60
  }
};

// api/chat.ts
var {
  MAX_MESSAGE_LENGTH,
  MAX_HISTORY_ITEMS,
  MAX_TEXT_LENGTH,
  MIN_API_KEY_LENGTH,
  MAX_API_KEY_LENGTH
} = API_VALIDATION;
async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  try {
    const { userId } = await requireAuth(req);
    await rateLimit(req, {
      ...RATE_LIMITS.CHAT,
      keyGenerator: () => `user:${userId}`
    });
    const { transcript, summary, message, history, provider, apiKey, model, language } = req.body;
    if (!transcript || typeof transcript !== "string") {
      return res.status(400).json({ error: "Transcript is required and must be a string" });
    }
    if (transcript.length > MAX_TEXT_LENGTH) {
      return res.status(400).json({ error: `Transcript too long. Maximum ${MAX_TEXT_LENGTH} characters allowed` });
    }
    if (!summary || typeof summary !== "string") {
      return res.status(400).json({ error: "Summary is required and must be a string" });
    }
    if (summary.length > MAX_TEXT_LENGTH) {
      return res.status(400).json({ error: `Summary too long. Maximum ${MAX_TEXT_LENGTH} characters allowed` });
    }
    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Message is required and must be a string" });
    }
    if (message.trim().length === 0) {
      return res.status(400).json({ error: "Message cannot be empty" });
    }
    if (message.length > MAX_MESSAGE_LENGTH) {
      return res.status(400).json({ error: `Message too long. Maximum ${MAX_MESSAGE_LENGTH} characters allowed` });
    }
    if (history && !Array.isArray(history)) {
      return res.status(400).json({ error: "History must be an array" });
    }
    if (history && history.length > MAX_HISTORY_ITEMS) {
      return res.status(400).json({ error: `History too long. Maximum ${MAX_HISTORY_ITEMS} items allowed` });
    }
    if (!provider || typeof provider !== "string") {
      return res.status(400).json({ error: "Provider is required and must be a string" });
    }
    if (!apiKey || typeof apiKey !== "string") {
      return res.status(400).json({ error: "API key is required and must be a string" });
    }
    if (apiKey.length < MIN_API_KEY_LENGTH || apiKey.length > MAX_API_KEY_LENGTH) {
      return res.status(400).json({ error: "Invalid API key format" });
    }
    if (provider === "openrouter" && (!model || typeof model !== "string")) {
      return res.status(400).json({ error: "Model is required for OpenRouter and must be a string" });
    }
    const aiProvider = AIProviderFactory.getProvider(provider);
    const actualModel = model ? getSummarizationModelForLevel(model) : void 0;
    const response = await aiProvider.chat({
      transcript,
      summary,
      message,
      history: Array.isArray(history) ? history : [],
      apiKey,
      model: actualModel,
      // Optional: only required for OpenRouter
      language
      // Optional: for language-specific chat prompts
    });
    return res.status(200).json({ response });
  } catch (error) {
    if (error instanceof AuthError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    if (error instanceof RateLimitError) {
      res.setHeader("Retry-After", error.retryAfter.toString());
      return res.status(429).json({
        error: "Too many requests",
        message: "Please wait before trying again",
        retryAfter: error.retryAfter
      });
    }
    const err = error;
    console.error("Chat error:", error);
    return res.status(500).json({
      error: "Chat failed",
      message: err.message
    });
  }
}
