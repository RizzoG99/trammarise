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

// api/transcribe.ts
var transcribe_exports = {};
__export(transcribe_exports, {
  config: () => config,
  default: () => handler
});
module.exports = __toCommonJS(transcribe_exports);
var import_busboy = __toESM(require("busboy"));

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
var WHISPER_STYLE_PROMPT = "The following is a clear, concise transcript of a dialogue between multiple speakers. Speaker 1 and Speaker 2 discuss the topic. It is grammatically correct and excludes filler words (ums, ahs) while preserving specific terminology.";
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

// api/_utils/job-manager.ts
var import_uuid = require("uuid");

// api/_types/job.ts
var JOB_SAFEGUARDS = {
  /** Maximum total retries across all chunks */
  MAX_TOTAL_RETRIES: 20,
  /** Maximum number of auto-splits allowed */
  MAX_SPLITS: 2,
  /** Maximum job age in milliseconds (2 hours) */
  MAX_JOB_AGE: 2 * 60 * 60 * 1e3,
  /** Job cleanup interval in milliseconds (5 minutes) */
  CLEANUP_INTERVAL: 5 * 60 * 1e3
};

// api/_utils/job-manager.ts
var JobManagerClass = class {
  jobs = /* @__PURE__ */ new Map();
  cleanupInterval = null;
  constructor() {
    this.startCleanup();
  }
  /**
   * Create a new transcription job
   */
  createJob(config2, metadata) {
    const jobId = (0, import_uuid.v4)();
    const job = {
      jobId,
      status: "pending",
      config: config2,
      metadata: {
        ...metadata,
        createdAt: /* @__PURE__ */ new Date()
      },
      chunks: [],
      chunkStatuses: [],
      progress: 0,
      completedChunks: 0,
      totalRetries: 0,
      chunkingSplits: 0,
      lastUpdated: /* @__PURE__ */ new Date(),
      userId: config2.userId
      // Store userId for ownership validation
    };
    this.jobs.set(jobId, job);
    console.log(
      `[Job Manager] Created job ${jobId} (mode: ${config2.mode}, duration: ${metadata.duration.toFixed(2)}s, userId: ${config2.userId || "none"})`
    );
    return job;
  }
  /**
   * Initialize chunks for a job
   */
  initializeChunks(jobId, chunks) {
    const job = this.jobs.get(jobId);
    if (!job) {
      throw new Error(`Job ${jobId} not found`);
    }
    job.chunks = chunks;
    job.metadata.totalChunks = chunks.length;
    job.chunkStatuses = chunks.map(() => ({
      status: "pending",
      retryCount: 0,
      wasSplit: false,
      lastUpdated: /* @__PURE__ */ new Date()
    }));
    job.lastUpdated = /* @__PURE__ */ new Date();
    console.log(`[Job Manager] Initialized ${chunks.length} chunks for job ${jobId}`);
  }
  /**
   * Get a job by ID
   */
  getJob(jobId) {
    return this.jobs.get(jobId);
  }
  /**
   * Update job status
   */
  updateJobStatus(jobId, status, error) {
    const job = this.jobs.get(jobId);
    if (!job) {
      throw new Error(`Job ${jobId} not found`);
    }
    job.status = status;
    job.lastUpdated = /* @__PURE__ */ new Date();
    if (error) {
      job.error = error;
    }
    if (status === "completed" || status === "failed") {
      job.metadata.completedAt = /* @__PURE__ */ new Date();
      job.metadata.processingTime = job.metadata.completedAt.getTime() - job.metadata.createdAt.getTime();
      console.log(
        `[Job Manager] Job ${jobId} ${status} (processing time: ${(job.metadata.processingTime / 1e3).toFixed(2)}s)`
      );
    }
  }
  /**
   * Update chunk status
   */
  updateChunkStatus(jobId, chunkIndex, updates) {
    const job = this.jobs.get(jobId);
    if (!job) {
      throw new Error(`Job ${jobId} not found`);
    }
    if (chunkIndex < 0 || chunkIndex >= job.chunkStatuses.length) {
      throw new Error(`Invalid chunk index ${chunkIndex} for job ${jobId}`);
    }
    const chunkStatus = job.chunkStatuses[chunkIndex];
    Object.assign(chunkStatus, updates);
    chunkStatus.lastUpdated = /* @__PURE__ */ new Date();
    job.completedChunks = job.chunkStatuses.filter((cs) => cs.status === "completed").length;
    job.progress = Math.floor(job.completedChunks / job.metadata.totalChunks * 100);
    job.lastUpdated = /* @__PURE__ */ new Date();
  }
  /**
   * Set job transcript
   */
  setJobTranscript(jobId, transcript) {
    const job = this.jobs.get(jobId);
    if (!job) {
      throw new Error(`Job ${jobId} not found`);
    }
    job.transcript = transcript;
    job.lastUpdated = /* @__PURE__ */ new Date();
  }
  /**
   * Set job utterances (for speaker diarization)
   */
  setJobUtterances(jobId, utterances) {
    const job = this.jobs.get(jobId);
    if (!job) {
      throw new Error(`Job ${jobId} not found`);
    }
    job.utterances = utterances;
    job.lastUpdated = /* @__PURE__ */ new Date();
  }
  /**
   * Set job segments (Whisper API segments for accurate syncing)
   */
  setJobSegments(jobId, segments) {
    const job = this.jobs.get(jobId);
    if (!job) {
      throw new Error(`Job ${jobId} not found`);
    }
    job.segments = segments;
    job.lastUpdated = /* @__PURE__ */ new Date();
  }
  /**
   * Delete a job
   */
  deleteJob(jobId) {
    this.jobs.delete(jobId);
    console.log(`[Job Manager] Deleted job ${jobId}`);
  }
  /**
   * Get all jobs (for debugging)
   */
  getAllJobs() {
    return Array.from(this.jobs.values());
  }
  /**
   * Get job status response for API
   */
  getJobStatusResponse(jobId) {
    const job = this.jobs.get(jobId);
    if (!job) {
      return null;
    }
    const response = {
      jobId: job.jobId,
      status: job.status,
      progress: job.progress,
      completedChunks: job.completedChunks,
      totalChunks: job.metadata.totalChunks,
      metadata: {
        filename: job.metadata.filename,
        duration: job.metadata.duration,
        mode: job.config.mode,
        createdAt: job.metadata.createdAt,
        completedAt: job.metadata.completedAt
      }
    };
    if (job.transcript) {
      response.transcript = job.transcript;
    }
    if (job.utterances) {
      response.utterances = job.utterances;
    }
    if (job.segments) {
      response.segments = job.segments;
    }
    if (job.error) {
      response.error = job.error;
    }
    if (job.status === "transcribing" && job.completedChunks > 0) {
      const elapsed = Date.now() - job.metadata.createdAt.getTime();
      const avgTimePerChunk = elapsed / job.completedChunks;
      const remainingChunks = job.metadata.totalChunks - job.completedChunks;
      response.estimatedTimeRemaining = Math.ceil(avgTimePerChunk * remainingChunks / 1e3);
    }
    return response;
  }
  /**
   * Start cleanup interval to remove old jobs
   */
  startCleanup() {
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, JOB_SAFEGUARDS.CLEANUP_INTERVAL);
  }
  /**
   * Clean up old jobs
   */
  cleanup() {
    const now = Date.now();
    const jobsToDelete = [];
    for (const [jobId, job] of this.jobs.entries()) {
      const age = now - job.metadata.createdAt.getTime();
      if (age > JOB_SAFEGUARDS.MAX_JOB_AGE) {
        jobsToDelete.push(jobId);
      }
    }
    if (jobsToDelete.length > 0) {
      console.log(`[Job Manager] Cleaning up ${jobsToDelete.length} old jobs`);
      for (const jobId of jobsToDelete) {
        this.deleteJob(jobId);
      }
    }
  }
  /**
   * Stop cleanup interval (for testing)
   */
  stopCleanup() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }
  /**
   * Restart cleanup interval (for testing - needed when switching timer modes)
   */
  restartCleanup() {
    this.stopCleanup();
    this.startCleanup();
  }
  /**
   * Clear all jobs (for testing)
   */
  clearAllJobs() {
    this.jobs.clear();
  }
  /**
   * Get job count
   */
  getJobCount() {
    return this.jobs.size;
  }
  /**
   * Validate that a user owns a job
   *
   * @param jobId - Job ID to check
   * @param userId - User ID to validate
   * @returns true if user owns the job, false otherwise
   */
  validateOwnership(jobId, userId) {
    const job = this.jobs.get(jobId);
    if (!job) {
      return false;
    }
    if (!job.userId) {
      return true;
    }
    return job.userId === userId;
  }
};
var JobManager = new JobManagerClass();

// api/_utils/audio-chunker.ts
var import_fs = require("fs");
var path3 = __toESM(require("path"));
var crypto = __toESM(require("crypto"));

// api/_utils/ffmpeg-setup.ts
var import_child_process = require("child_process");
var import_util = require("util");
var ffmpegInstaller = __toESM(require("@ffmpeg-installer/ffmpeg"));
var ffprobeInstaller = __toESM(require("@ffprobe-installer/ffprobe"));
var execFileAsync = (0, import_util.promisify)(import_child_process.execFile);
var isSetup = false;
var configuredFFmpegPath = "";
var configuredFFprobePath = "";
function setupFFmpeg() {
  if (isSetup) {
    return;
  }
  configuredFFmpegPath = getFFmpegPath();
  configuredFFprobePath = getFFprobePath();
  console.log("[FFmpeg Setup] Configured FFmpeg binary:", configuredFFmpegPath);
  console.log("[FFmpeg Setup] Configured FFprobe binary:", configuredFFprobePath);
  isSetup = true;
}
function getFFmpegPath() {
  const path5 = ffmpegInstaller.path;
  if (!path5) {
    throw new Error("FFmpeg binary path not found. Ensure @ffmpeg-installer/ffmpeg is installed.");
  }
  return path5;
}
function getFFprobePath() {
  const path5 = ffprobeInstaller.path;
  if (!path5) {
    throw new Error(
      "FFprobe binary path not found. Ensure @ffprobe-installer/ffprobe is installed."
    );
  }
  return path5;
}
async function ffprobeDuration(filePath) {
  setupFFmpeg();
  const args = [
    "-v",
    "error",
    "-show_entries",
    "format=duration",
    "-of",
    "default=noprint_wrappers=1:nokey=1",
    filePath
  ];
  const { stdout } = await execFileAsync(configuredFFprobePath, args);
  const duration = parseFloat(stdout.trim());
  if (isNaN(duration)) {
    throw new Error("Could not determine audio duration");
  }
  return duration;
}
async function extractFFmpegChunk(inputPath, startTime, duration, outputPath) {
  setupFFmpeg();
  const args = [
    "-i",
    inputPath,
    "-ss",
    startTime.toString(),
    "-t",
    duration.toString(),
    "-acodec",
    "libmp3lame",
    "-ab",
    "64k",
    "-ac",
    "1",
    "-ar",
    "16000",
    "-y",
    outputPath
  ];
  await execFileAsync(configuredFFmpegPath, args);
}

// api/_types/chunking.ts
var CHUNKING_CONFIGS = {
  balanced: {
    chunkDuration: 180,
    // 3 minutes
    overlapDuration: 0,
    maxConcurrency: 4,
    maxRetries: 3,
    backoffStrategy: "exponential"
  },
  best_quality: {
    chunkDuration: 600,
    // 10 minutes
    overlapDuration: 15,
    // 15 seconds
    maxConcurrency: 1,
    maxRetries: 2,
    backoffStrategy: "linear"
  }
};
var AUDIO_CONSTANTS2 = {
  /** FFmpeg output codec */
  CODEC: "libmp3lame",
  /** Output bitrate */
  BITRATE: "128k",
  /** Audio channels (mono) */
  CHANNELS: 1,
  /** Sample rate in Hz */
  SAMPLE_RATE: 16e3,
  /** Maximum file size for OpenAI Whisper (25MB, using 24MB to be safe) */
  MAX_WHISPER_SIZE: 24 * 1024 * 1024
};
var AUTO_SPLIT_CONFIG = {
  /** Sub-chunk duration for Balanced mode (90 seconds) */
  BALANCED_SUBCHUNK_DURATION: 90,
  /** Sub-chunk duration for Best Quality mode (5 minutes) */
  BEST_QUALITY_SUBCHUNK_DURATION: 300
};

// api/_utils/audio-chunker.ts
async function chunkAudio(audioBuffer, filename, mode) {
  setupFFmpeg();
  const tempDir = "/tmp";
  const inputPath = path3.join(tempDir, `input_${Date.now()}_${filename}`);
  try {
    await import_fs.promises.writeFile(inputPath, audioBuffer);
    const duration = await getAudioDuration(inputPath);
    console.log(`[Audio Chunker] Audio duration: ${duration.toFixed(2)}s, mode: ${mode}`);
    const config2 = CHUNKING_CONFIGS[mode];
    const { chunkDuration, overlapDuration } = config2;
    const chunks = [];
    let currentStart = 0;
    let chunkIndex = 0;
    while (currentStart < duration) {
      const currentEnd = Math.min(currentStart + chunkDuration, duration);
      const actualDuration = currentEnd - currentStart;
      const chunkFilename = `chunk_${chunkIndex}_${Date.now()}.mp3`;
      const chunkPath = path3.join(tempDir, chunkFilename);
      await extractChunk(inputPath, currentStart, actualDuration, chunkPath);
      const hash = await computeChunkHash(chunkPath);
      const hasOverlap = mode === "best_quality" && currentEnd < duration;
      const overlapStartTime = hasOverlap ? currentEnd - overlapDuration : void 0;
      chunks.push({
        index: chunkIndex,
        startTime: currentStart,
        endTime: currentEnd,
        duration: actualDuration,
        hash,
        hasOverlap,
        overlapStartTime,
        filePath: chunkPath
      });
      console.log(
        `[Audio Chunker] Created chunk ${chunkIndex}: ${currentStart.toFixed(2)}s - ${currentEnd.toFixed(2)}s (${actualDuration.toFixed(2)}s)${hasOverlap ? ` [overlap from ${overlapStartTime.toFixed(2)}s]` : ""}`
      );
      currentStart = currentEnd - (hasOverlap ? overlapDuration : 0);
      chunkIndex++;
    }
    return {
      chunks,
      totalDuration: duration,
      mode,
      totalChunks: chunks.length
    };
  } finally {
    try {
      await import_fs.promises.unlink(inputPath);
    } catch (error) {
      console.warn("[Audio Chunker] Failed to delete input file:", error);
    }
  }
}
async function getAudioDuration(filePath) {
  return ffprobeDuration(filePath);
}
async function extractChunk(inputPath, startTime, duration, outputPath) {
  await extractFFmpegChunk(inputPath, startTime, duration, outputPath);
}
async function computeChunkHash(filePath) {
  const fileBuffer = await import_fs.promises.readFile(filePath);
  const hash = crypto.createHash("sha256");
  hash.update(fileBuffer);
  return hash.digest("hex");
}
async function cleanupChunks(chunks) {
  await Promise.all(
    chunks.map(async (chunk) => {
      try {
        await import_fs.promises.unlink(chunk.filePath);
      } catch (error) {
        console.warn(`[Audio Chunker] Failed to delete chunk ${chunk.index}:`, error);
      }
    })
  );
}

// api/_types/rate-limiting.ts
var BACKOFF_CONFIGS = {
  balanced: {
    baseDelay: 2e3,
    // Start at 2 seconds
    maxDelay: 1e4,
    // Cap at 10 seconds
    multiplier: 2.5,
    // Exponential: 2s -> 5s -> 10s
    jitter: 0.3,
    // ±30% randomization
    maxRetries: 5
    // Maximum 5 retry attempts
  },
  best_quality: {
    baseDelay: 5e3,
    // Start at 5 seconds
    maxDelay: 1e4,
    // Cap at 10 seconds
    multiplier: 1,
    // Linear: 5s -> 10s
    jitter: 0.2,
    // ±20% randomization
    maxRetries: 3
    // Maximum 3 retry attempts
  }
};
var DEGRADED_MODE_CONFIG = {
  /** Threshold: activate if >30% of recent requests are rate limited */
  ACTIVATION_THRESHOLD: 0.3,
  /** Sample size for calculating rate limit percentage */
  SAMPLE_SIZE: 20,
  /** Exit threshold: deactivate if <10% rate limited */
  EXIT_THRESHOLD: 0.1,
  /** Concurrency reduction: divide by this factor */
  CONCURRENCY_REDUCTION_FACTOR: 2,
  /** Minimum time to stay in degraded mode (ms) */
  MIN_DEGRADED_DURATION: 3e4
  // 30 seconds
};

// api/_utils/rate-limit-governor.ts
var RateLimitGovernor = class {
  state;
  constructor(mode) {
    const config2 = CHUNKING_CONFIGS[mode];
    this.state = {
      maxConcurrency: config2.maxConcurrency,
      currentConcurrency: 0,
      queue: [],
      inFlight: /* @__PURE__ */ new Map(),
      degradedMode: false,
      normalConcurrency: config2.maxConcurrency,
      mode,
      recentOutcomes: [],
      stats: {
        totalRequests: 0,
        successfulRequests: 0,
        rateLimitedRequests: 0,
        failedRequests: 0,
        degradedModeTime: 0,
        degradedModeActivations: 0,
        averageRequestDuration: 0,
        peakConcurrency: 0
      }
    };
  }
  /**
   * Enqueue a request for execution
   */
  async enqueue(id, jobId, chunkIndex, execute, priority = 0) {
    return new Promise((resolve, reject) => {
      const request = {
        id,
        jobId,
        chunkIndex,
        priority,
        execute,
        attemptCount: 0,
        queuedAt: /* @__PURE__ */ new Date(),
        resolve,
        reject
      };
      this.state.queue.push(request);
      this.sortQueue();
      this.processQueue();
    });
  }
  /**
   * Process queued requests respecting concurrency limits
   */
  async processQueue() {
    while (this.state.queue.length > 0 && this.state.currentConcurrency < this.state.maxConcurrency) {
      const request = this.state.queue.shift();
      if (!request) break;
      this.executeRequest(request);
    }
  }
  /**
   * Execute a single request with error handling
   */
  async executeRequest(request) {
    this.state.currentConcurrency++;
    this.state.inFlight.set(request.id, request);
    if (this.state.currentConcurrency > this.state.stats.peakConcurrency) {
      this.state.stats.peakConcurrency = this.state.currentConcurrency;
    }
    request.attemptCount++;
    request.lastAttemptAt = /* @__PURE__ */ new Date();
    const startTime = Date.now();
    try {
      const job = JobManager.getJob(request.jobId);
      if (job?.status === "cancelled") {
        console.log(
          `[Rate Governor] Job ${request.jobId} cancelled, aborting request ${request.id}`
        );
        this.state.currentConcurrency--;
        this.state.inFlight.delete(request.id);
        request.reject(new Error("Job was cancelled by user"));
        this.processQueue();
        return;
      }
      const result = await request.execute();
      const duration = Date.now() - startTime;
      this.recordOutcome("success", duration);
      this.state.stats.successfulRequests++;
      this.state.currentConcurrency--;
      this.state.inFlight.delete(request.id);
      request.resolve(result);
      this.processQueue();
    } catch (error) {
      const duration = Date.now() - startTime;
      this.state.currentConcurrency--;
      this.state.inFlight.delete(request.id);
      if (this.isRateLimitError(error)) {
        this.recordOutcome("rate_limited", duration);
        this.state.stats.rateLimitedRequests++;
        const config2 = BACKOFF_CONFIGS[this.state.mode];
        console.warn(
          `[Rate Governor] Request ${request.id} rate limited (attempt ${request.attemptCount}/${config2.maxRetries})`
        );
        if (request.attemptCount >= config2.maxRetries) {
          console.error(
            `[Rate Governor] Request ${request.id} exceeded max retries (${config2.maxRetries}), failing`
          );
          request.reject(
            new Error(`Rate limit retry limit exceeded after ${request.attemptCount} attempts`)
          );
          this.checkDegradedMode();
          return;
        }
        const backoff = this.calculateBackoff(request.attemptCount);
        console.log(`[Rate Governor] Retrying after ${backoff}ms`);
        setTimeout(() => {
          request.priority += 10;
          this.state.queue.unshift(request);
          this.sortQueue();
          this.processQueue();
        }, backoff);
        this.checkDegradedMode();
      } else {
        this.recordOutcome("failed", duration);
        this.state.stats.failedRequests++;
        console.error(`[Rate Governor] Request ${request.id} failed:`, error);
        request.reject(error);
      }
      this.processQueue();
    }
  }
  /**
   * Calculate backoff delay based on retry count and mode
   */
  calculateBackoff(retryCount) {
    const config2 = BACKOFF_CONFIGS[this.state.mode];
    let delay;
    if (config2.multiplier > 1) {
      delay = Math.min(
        config2.baseDelay * Math.pow(config2.multiplier, retryCount - 1),
        config2.maxDelay
      );
    } else {
      delay = Math.min(config2.baseDelay * retryCount, config2.maxDelay);
    }
    const jitter = delay * config2.jitter * (Math.random() * 2 - 1);
    return Math.max(0, Math.floor(delay + jitter));
  }
  /**
   * Check if error is a rate limit error (HTTP 429)
   */
  isRateLimitError(error) {
    if (!error || typeof error !== "object") {
      return false;
    }
    const err = error;
    if (err.name === "RateLimitError") {
      return true;
    }
    if (err.status === 429 || err.statusCode === 429) {
      return true;
    }
    if (typeof err.message === "string") {
      return err.message.includes("429") || err.message.toLowerCase().includes("rate limit");
    }
    return false;
  }
  /**
   * Record request outcome for degraded mode detection
   */
  recordOutcome(outcome, duration) {
    this.state.recentOutcomes.push(outcome);
    if (this.state.recentOutcomes.length > DEGRADED_MODE_CONFIG.SAMPLE_SIZE) {
      this.state.recentOutcomes.shift();
    }
    this.state.stats.totalRequests++;
    const totalDuration = this.state.stats.averageRequestDuration * (this.state.stats.totalRequests - 1) + duration;
    this.state.stats.averageRequestDuration = totalDuration / this.state.stats.totalRequests;
  }
  /**
   * Check if degraded mode should be activated
   */
  checkDegradedMode() {
    if (this.state.recentOutcomes.length < DEGRADED_MODE_CONFIG.SAMPLE_SIZE) {
      return;
    }
    const rateLimitedCount = this.state.recentOutcomes.filter((o) => o === "rate_limited").length;
    const rateLimitedPercentage = rateLimitedCount / this.state.recentOutcomes.length;
    if (!this.state.degradedMode && rateLimitedPercentage >= DEGRADED_MODE_CONFIG.ACTIVATION_THRESHOLD) {
      this.enterDegradedMode();
    } else if (this.state.degradedMode && rateLimitedPercentage < DEGRADED_MODE_CONFIG.EXIT_THRESHOLD) {
      this.exitDegradedMode();
    }
  }
  /**
   * Enter degraded mode: reduce concurrency
   */
  enterDegradedMode() {
    if (this.state.degradedMode) return;
    console.warn("[Rate Governor] Entering degraded mode (sustained rate limiting detected)");
    this.state.degradedMode = true;
    this.state.lastDegradedModeAt = /* @__PURE__ */ new Date();
    this.state.stats.degradedModeActivations++;
    this.state.maxConcurrency = Math.max(
      1,
      Math.floor(this.state.normalConcurrency / DEGRADED_MODE_CONFIG.CONCURRENCY_REDUCTION_FACTOR)
    );
    console.log(
      `[Rate Governor] Reduced concurrency from ${this.state.normalConcurrency} to ${this.state.maxConcurrency}`
    );
  }
  /**
   * Exit degraded mode: restore normal concurrency
   */
  exitDegradedMode() {
    if (!this.state.degradedMode) return;
    const degradedDuration = Date.now() - (this.state.lastDegradedModeAt?.getTime() || 0);
    if (degradedDuration < DEGRADED_MODE_CONFIG.MIN_DEGRADED_DURATION) {
      return;
    }
    console.log("[Rate Governor] Exiting degraded mode (rate limiting subsided)");
    this.state.stats.degradedModeTime += degradedDuration;
    this.state.degradedMode = false;
    this.state.maxConcurrency = this.state.normalConcurrency;
    console.log(`[Rate Governor] Restored concurrency to ${this.state.maxConcurrency}`);
    this.processQueue();
  }
  /**
   * Sort queue by priority (higher priority first)
   */
  sortQueue() {
    this.state.queue.sort((a, b) => b.priority - a.priority);
  }
  /**
   * Get current state (for debugging)
   */
  getState() {
    return { ...this.state };
  }
  /**
   * Get statistics
   */
  getStats() {
    return { ...this.state.stats };
  }
  getMaxConcurrency() {
    return this.state.maxConcurrency;
  }
  /**
   * Get queue length
   */
  getQueueLength() {
    return this.state.queue.length;
  }
  /**
   * Get current concurrency
   */
  getCurrentConcurrency() {
    return this.state.currentConcurrency;
  }
  /**
   * Check if in degraded mode
   */
  isInDegradedMode() {
    return this.state.degradedMode;
  }
};

// api/_utils/chunk-processor.ts
var import_fs2 = require("fs");
async function processChunk(chunk, job, governor, provider, apiKey) {
  const config2 = CHUNKING_CONFIGS[job.config.mode];
  if (!chunk) {
    throw new Error("Chunk is undefined");
  }
  const chunkStatus = job.chunkStatuses?.[chunk.index];
  console.log(`[Chunk Processor] Processing chunk ${chunk.index} (${chunk.duration.toFixed(2)}s)`);
  if (!chunkStatus) {
    throw new Error(`Chunk status not found for index ${chunk.index} in job ${job.jobId}`);
  }
  for (let attempt = 1; attempt <= config2.maxRetries; attempt++) {
    if (job.status === "cancelled") {
      console.log(`[Chunk Processor] Job ${job.jobId} cancelled, aborting chunk ${chunk.index}`);
      throw new Error("Job was cancelled by user");
    }
    try {
      chunkStatus.status = attempt === 1 ? "in_progress" : "retrying";
      chunkStatus.retryCount = attempt - 1;
      chunkStatus.lastUpdated = /* @__PURE__ */ new Date();
      console.log(
        `[Chunk Processor] Attempt ${attempt}/${config2.maxRetries} for chunk ${chunk.index}`
      );
      const transcript = await governor.enqueue(
        `chunk_${job.jobId}_${chunk.index}_${attempt}`,
        job.jobId,
        chunk.index,
        () => provider.transcribe({
          filePath: chunk.filePath,
          apiKey,
          model: job.config.model,
          language: job.config.language,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ...job.config || {}
        }),
        chunk.index
        // Priority based on chunk order
      );
      if (job.status === "cancelled") {
        console.log(
          `[Chunk Processor] Job ${job.jobId} cancelled during transcription of chunk ${chunk.index}`
        );
        throw new Error("Job was cancelled by user");
      }
      console.log(`[Chunk Processor] Successfully transcribed chunk ${chunk.index}`);
      return transcript;
    } catch (error) {
      const err = error;
      console.warn(
        `[Chunk Processor] Attempt ${attempt} failed for chunk ${chunk.index}:`,
        err.message
      );
      if (attempt === config2.maxRetries) {
        console.warn(
          `[Chunk Processor] All retries exhausted for chunk ${chunk.index}, attempting auto-split`
        );
        break;
      }
      continue;
    }
  }
  return await autoSplitAndProcess(chunk, job, governor, provider, apiKey);
}
async function autoSplitAndProcess(chunk, job, governor, provider, apiKey) {
  if (job.chunkingSplits >= JOB_SAFEGUARDS.MAX_SPLITS) {
    throw new Error(
      `Job ${job.jobId}: Maximum splits (${JOB_SAFEGUARDS.MAX_SPLITS}) exceeded. Aborting.`
    );
  }
  if (job.totalRetries >= JOB_SAFEGUARDS.MAX_TOTAL_RETRIES) {
    throw new Error(
      `Job ${job.jobId}: Maximum total retries (${JOB_SAFEGUARDS.MAX_TOTAL_RETRIES}) exceeded. Aborting.`
    );
  }
  console.log(
    `[Chunk Processor] Auto-splitting chunk ${chunk.index} (${chunk.duration.toFixed(2)}s)`
  );
  const chunkStatus = job.chunkStatuses[chunk.index];
  chunkStatus.status = "splitting";
  chunkStatus.wasSplit = true;
  chunkStatus.lastUpdated = /* @__PURE__ */ new Date();
  job.chunkingSplits++;
  const subChunkDuration = job.config.mode === "balanced" ? AUTO_SPLIT_CONFIG.BALANCED_SUBCHUNK_DURATION : AUTO_SPLIT_CONFIG.BEST_QUALITY_SUBCHUNK_DURATION;
  const subChunks = [];
  const numSubChunks = Math.ceil(chunk.duration / subChunkDuration);
  for (let i = 0; i < numSubChunks; i++) {
    const subStart = chunk.startTime + i * subChunkDuration;
    const subEnd = Math.min(subStart + subChunkDuration, chunk.endTime);
    const subDuration = subEnd - subStart;
    const subChunkPath = `/tmp/subchunk_${job.jobId}_${chunk.index}_${i}_${Date.now()}.mp3`;
    await extractChunk(
      chunk.filePath,
      i * subChunkDuration,
      // Relative to chunk start
      subDuration,
      subChunkPath
    );
    const hash = await computeChunkHash(subChunkPath);
    subChunks.push({
      index: i,
      startTime: subStart,
      endTime: subEnd,
      duration: subDuration,
      hash,
      hasOverlap: false,
      filePath: subChunkPath
    });
    console.log(
      `[Chunk Processor] Created sub-chunk ${i}/${numSubChunks - 1}: ${subStart.toFixed(2)}s - ${subEnd.toFixed(2)}s`
    );
  }
  const subTranscripts = [];
  for (const subChunk of subChunks) {
    if (job.status === "cancelled") {
      console.log(`[Chunk Processor] Job ${job.jobId} cancelled, aborting sub-chunk processing`);
      await cleanupSubChunks(subChunks);
      throw new Error("Job was cancelled by user");
    }
    try {
      const transcript = await governor.enqueue(
        `subchunk_${job.jobId}_${chunk.index}_${subChunk.index}`,
        job.jobId,
        chunk.index,
        () => provider.transcribe({
          filePath: subChunk.filePath,
          apiKey,
          model: job.config.model,
          language: job.config.language,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ...job.config || {}
        }),
        1e3 + chunk.index
        // Higher priority for sub-chunks
      );
      subTranscripts.push(transcript);
      job.totalRetries++;
      console.log(`[Chunk Processor] Sub-chunk ${subChunk.index} transcribed successfully`);
    } catch (error) {
      const err = error;
      console.error(`[Chunk Processor] Sub-chunk ${subChunk.index} failed:`, err.message);
      await cleanupSubChunks(subChunks);
      throw new Error(
        `Failed to transcribe sub-chunk ${subChunk.index} of chunk ${chunk.index}: ${err.message}`
      );
    }
  }
  await cleanupSubChunks(subChunks);
  const mergedTranscript = subTranscripts.join(" ");
  console.log(
    `[Chunk Processor] Successfully processed chunk ${chunk.index} via auto-split (${subChunks.length} sub-chunks)`
  );
  return mergedTranscript;
}
async function cleanupSubChunks(subChunks) {
  await Promise.all(
    subChunks.map(async (subChunk) => {
      try {
        await import_fs2.promises.unlink(subChunk.filePath);
      } catch (error) {
        console.warn(`[Chunk Processor] Failed to delete sub-chunk ${subChunk.index}:`, error);
      }
    })
  );
}

// api/_providers/openai.ts
var fs3 = __toESM(require("fs"));
var import_openai = require("openai");
var OpenAIProvider = class {
  name = "OpenAI";
  async transcribe(params) {
    const openai = new import_openai.OpenAI({ baseURL: "https://api.openai.com/v1", apiKey: params.apiKey });
    const modelToUse = params.model || "whisper-1";
    console.log(`[OpenAI] Transcribing with model=${modelToUse}`);
    const completion = await openai.audio.transcriptions.create({
      file: fs3.createReadStream(params.filePath),
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

// api/_providers/openai-transcription-adapter.ts
var fs4 = __toESM(require("fs"));
var os = __toESM(require("os"));
var path4 = __toESM(require("path"));
var import_openai2 = require("openai");
var OpenAITranscriptionAdapter = class {
  apiKey;
  constructor(apiKey) {
    this.apiKey = apiKey || process.env.OPENAI_API_KEY || "";
    if (!this.apiKey) {
      throw new Error("OpenAI API key is required");
    }
  }
  /**
   * Transcribe audio using OpenAI Whisper
   */
  async transcribe(request) {
    const tempFilePath = path4.join(
      os.tmpdir(),
      `audio-${Date.now()}-${Math.random().toString(36).substring(7)}.mp3`
    );
    try {
      await fs4.promises.writeFile(tempFilePath, request.audioFile);
      const openai = new import_openai2.OpenAI({
        baseURL: "https://api.openai.com/v1",
        apiKey: this.apiKey
      });
      const completion = await openai.audio.transcriptions.create({
        file: fs4.createReadStream(tempFilePath),
        model: request.model || "whisper-1",
        language: request.language,
        prompt: request.prompt,
        response_format: "verbose_json"
        // Get duration and language
      });
      await fs4.promises.unlink(tempFilePath);
      if (request.enableSpeakerDiarization) {
        console.warn(
          "Speaker diarization requested but OpenAI Whisper does not support it. Use AssemblyAI provider for speaker diarization."
        );
      }
      const verboseCompletion = completion;
      return {
        text: verboseCompletion.text,
        duration: verboseCompletion.duration,
        language: verboseCompletion.language,
        // Extract segments from verbose_json response for accurate syncing
        segments: verboseCompletion.segments?.map((seg, index) => ({
          text: seg.text,
          start: seg.start,
          // already in seconds
          end: seg.end,
          id: seg.id ?? index
        })),
        metadata: {
          provider: "OpenAI",
          model: "whisper-1"
        }
      };
    } catch (error) {
      try {
        await fs4.promises.unlink(tempFilePath);
      } catch {
      }
      throw error;
    }
  }
  /**
   * Get provider name
   */
  getProviderName() {
    return "OpenAI";
  }
  /**
   * Check if provider supports speaker diarization
   */
  supportsSpeakerDiarization() {
    return false;
  }
};

// api/_providers/assemblyai.ts
var import_axios = __toESM(require("axios"));
var AssemblyAIProvider = class {
  apiKey;
  baseUrl = "https://api.assemblyai.com/v2";
  maxPollingAttempts;
  pollingInterval;
  constructor(options) {
    this.apiKey = options?.apiKey || process.env.ASSEMBLYAI_API_KEY || "";
    if (!this.apiKey) {
      throw new Error("AssemblyAI API key is required");
    }
    this.maxPollingAttempts = options?.maxPollingAttempts || 60;
    this.pollingInterval = options?.pollingInterval || 5e3;
  }
  /**
   * Upload audio file to AssemblyAI
   */
  async uploadAudio(audioBuffer) {
    const response = await import_axios.default.post(`${this.baseUrl}/upload`, audioBuffer, {
      headers: {
        authorization: this.apiKey,
        "content-type": "application/octet-stream"
      }
    });
    return response.data.upload_url;
  }
  /**
   * Submit transcription job
   */
  async submitTranscription(audioUrl, options) {
    const requestBody = {
      audio_url: audioUrl,
      speaker_labels: options.enableSpeakerDiarization || false
    };
    if (options.language) {
      requestBody.language_code = options.language;
    }
    if (options.speakersExpected) {
      requestBody.speakers_expected = options.speakersExpected;
    } else if (options.speakerOptions) {
      requestBody.speaker_options = {
        min_speakers_expected: options.speakerOptions.minSpeakers,
        max_speakers_expected: options.speakerOptions.maxSpeakers
      };
    }
    if (options.knownSpeakers && options.knownSpeakers.length > 0) {
      requestBody.speech_understanding = {
        request: {
          speaker_identification: {
            speaker_type: "name",
            known_values: options.knownSpeakers
          }
        }
      };
    }
    const response = await import_axios.default.post(`${this.baseUrl}/transcript`, requestBody, {
      headers: {
        authorization: this.apiKey,
        "content-type": "application/json"
      }
    });
    return response.data.id;
  }
  /**
   * Poll for transcription completion
   */
  async pollTranscription(transcriptId) {
    let attempts = 0;
    while (attempts < this.maxPollingAttempts) {
      const response = await import_axios.default.get(`${this.baseUrl}/transcript/${transcriptId}`, {
        headers: {
          authorization: this.apiKey
        }
      });
      const result = response.data;
      if (result.status === "completed") {
        const transcriptionResponse = {
          text: result.text,
          duration: result.audio_duration,
          language: result.language_code,
          metadata: {
            transcriptId: result.id,
            provider: "AssemblyAI"
          }
        };
        if (result.utterances && result.utterances.length > 0) {
          transcriptionResponse.utterances = result.utterances.map(
            (utterance) => ({
              speaker: utterance.speaker,
              text: utterance.text,
              start: utterance.start,
              end: utterance.end,
              confidence: utterance.confidence,
              words: utterance.words
            })
          );
        }
        return transcriptionResponse;
      } else if (result.status === "error") {
        throw new Error(result.error || "Transcription failed");
      }
      await new Promise((resolve) => setTimeout(resolve, this.pollingInterval));
      attempts++;
    }
    throw new Error("Transcription timeout after " + this.maxPollingAttempts + " attempts");
  }
  /**
   * Transcribe audio with optional speaker diarization
   */
  async transcribe(request) {
    try {
      const audioUrl = await this.uploadAudio(request.audioFile);
      const transcriptId = await this.submitTranscription(audioUrl, request);
      const result = await this.pollTranscription(transcriptId);
      return result;
    } catch (error) {
      console.error("AssemblyAI transcription error:", error);
      throw error;
    }
  }
  /**
   * Get provider name
   */
  getProviderName() {
    return "AssemblyAI";
  }
  /**
   * Check if provider supports speaker diarization
   */
  supportsSpeakerDiarization() {
    return true;
  }
};

// api/_providers/factory.ts
var TranscriptionProviderFactory = class {
  /**
   * Create a transcription provider instance
   */
  static create(config2) {
    switch (config2.provider) {
      case "openai":
        return new OpenAITranscriptionAdapter(config2.apiKey);
      case "assemblyai":
        if (config2.enableSpeakerDiarization) {
          return new AssemblyAIProvider({ apiKey: config2.apiKey });
        }
        console.warn(
          "[ProviderFactory] assemblyai requested without speaker diarization \u2014 falling back to OpenAI for cost efficiency"
        );
        return new OpenAITranscriptionAdapter(config2.apiKey);
      default:
        throw new Error(`Unknown provider: ${config2.provider}`);
    }
  }
  /**
   * Get default provider based on requirements
   */
  static getDefaultProvider(enableSpeakerDiarization) {
    return enableSpeakerDiarization ? "assemblyai" : "openai";
  }
  /**
   * Check if provider supports speaker diarization
   */
  static supportsSpeakerDiarization(provider) {
    switch (provider) {
      case "assemblyai":
        return true;
      case "openai":
        return false;
      default:
        return false;
    }
  }
  /**
   * Get list of available providers
   */
  static getAvailableProviders() {
    return [
      {
        type: "openai",
        name: "OpenAI Whisper",
        supportsSpeakerDiarization: false
      },
      {
        type: "assemblyai",
        name: "AssemblyAI",
        supportsSpeakerDiarization: true
      }
    ];
  }
};

// api/_utils/transcript-assembler.ts
async function assembleTranscript(chunks, transcripts, mode) {
  if (chunks.length !== transcripts.length) {
    throw new Error(
      `Chunk count mismatch: ${chunks.length} chunks but ${transcripts.length} transcripts`
    );
  }
  if (chunks.length === 0) {
    return "";
  }
  if (chunks.length === 1) {
    return normalizeSentences(transcripts[0]);
  }
  console.log(`[Transcript Assembler] Assembling ${chunks.length} chunks (mode: ${mode})`);
  if (mode === "best_quality") {
    return await removeOverlaps(chunks, transcripts);
  } else {
    const assembled = transcripts.join(" ");
    return normalizeSentences(assembled);
  }
}
async function removeOverlaps(chunks, transcripts) {
  const deduplicatedTranscripts = [transcripts[0]];
  for (let i = 1; i < chunks.length; i++) {
    const previousChunk = chunks[i - 1];
    const currentChunk = chunks[i];
    const currentTranscript = transcripts[i];
    if (!previousChunk.hasOverlap) {
      deduplicatedTranscripts.push(currentTranscript);
      continue;
    }
    console.log(`[Transcript Assembler] Removing overlap between chunk ${i - 1} and ${i}`);
    const previousTranscript = transcripts[i - 1];
    const previousChunkEnd = previousChunk.startTime + previousChunk.duration;
    const overlapDuration = previousChunkEnd - currentChunk.startTime;
    const estimatedByDuration = Math.max(1, Math.ceil(overlapDuration / 60 * 150));
    const previousWords = previousTranscript.split(/\s+/).filter((w) => w.length > 0);
    const maxOverlapWords = Math.floor(previousWords.length * 0.5);
    const estimatedOverlapWords = Math.min(estimatedByDuration, maxOverlapWords);
    const overlapWords = previousWords.slice(-estimatedOverlapWords).join(" ");
    const currentWords = currentTranscript.split(/\s+/);
    const searchWindowSize = Math.ceil(currentWords.length * 0.5);
    const searchWindow = currentWords.slice(0, searchWindowSize).join(" ");
    let matchPosition = findOverlapMatch(
      overlapWords,
      searchWindow,
      0.7
      // 70% similarity threshold
    );
    if (matchPosition === -1) {
      matchPosition = findOverlapMatch(overlapWords, currentTranscript, 0.7);
    }
    if (matchPosition === -1) {
      const overlapWordsArray = overlapWords.split(/\s+/);
      const minMatchLength = Math.floor(overlapWordsArray.length * 0.6);
      for (let startIdx = 0; startIdx < overlapWordsArray.length - minMatchLength + 1; startIdx++) {
        const phraseToFind = overlapWordsArray.slice(startIdx, startIdx + minMatchLength).join(" ");
        const lowerCurrentTranscript = currentTranscript.toLowerCase();
        const index = lowerCurrentTranscript.indexOf(phraseToFind.toLowerCase());
        if (index !== -1) {
          const beforeMatch = lowerCurrentTranscript.substring(0, index);
          const wordsBeforeMatch = beforeMatch.split(/\s+/).filter((w) => w.length > 0).length;
          matchPosition = wordsBeforeMatch + minMatchLength;
          break;
        }
      }
    }
    if (matchPosition !== -1) {
      const wordsToRemove = matchPosition;
      const deduplicated = currentWords.slice(wordsToRemove).join(" ");
      console.log(
        `[Transcript Assembler] Removed ${wordsToRemove} overlapping words from chunk ${i}`
      );
      deduplicatedTranscripts.push(deduplicated);
    } else {
      console.warn(
        `[Transcript Assembler] Could not find overlap match for chunk ${i}, preserving full transcript`
      );
      deduplicatedTranscripts.push(currentTranscript);
    }
  }
  const assembled = deduplicatedTranscripts.join(" ");
  return normalizeSentences(assembled);
}
function findOverlapMatch(overlapText, searchText, threshold) {
  const overlapWords = overlapText.toLowerCase().split(/\s+/);
  const searchWords = searchText.toLowerCase().split(/\s+/);
  let bestMatchPosition = -1;
  let bestMatchScore = 0;
  const windowSize = overlapWords.length;
  for (let i = 0; i <= searchWords.length - windowSize; i++) {
    const windowWords = searchWords.slice(i, i + windowSize);
    const score = calculateSimilarity(overlapWords, windowWords);
    if (score > bestMatchScore) {
      bestMatchScore = score;
      bestMatchPosition = i + windowSize;
    }
  }
  if (bestMatchScore >= threshold) {
    return bestMatchPosition;
  }
  return -1;
}
function calculateSimilarity(words1, words2) {
  if (words1.length !== words2.length) {
    return 0;
  }
  let matches = 0;
  for (let i = 0; i < words1.length; i++) {
    if (words1[i] === words2[i]) {
      matches++;
    } else if (isSimilarWord(words1[i], words2[i])) {
      matches += 0.5;
    }
  }
  return matches / words1.length;
}
function isSimilarWord(word1, word2) {
  const distance = levenshteinDistance(word1, word2);
  const maxLength = Math.max(word1.length, word2.length);
  return distance / maxLength <= 0.2;
}
function levenshteinDistance(str1, str2) {
  const len1 = str1.length;
  const len2 = str2.length;
  const matrix = [];
  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        // Deletion
        matrix[i][j - 1] + 1,
        // Insertion
        matrix[i - 1][j - 1] + cost
        // Substitution
      );
    }
  }
  return matrix[len1][len2];
}
function normalizeSentences(text) {
  let normalized = text.replace(/\s+/g, " ").trim();
  normalized = normalized.replace(/\s+([!?;:])/g, "$1");
  normalized = normalized.replace(/([!?;:])(?!\s)/g, "$1 ");
  normalized = normalized.replace(/(\.)([A-Za-z])/g, "$1 $2");
  normalized = normalized.replace(/([.!?])\s+([a-z])/g, (_match, p1, p2) => {
    return p1 + " " + p2.toUpperCase();
  });
  if (normalized.length > 0) {
    normalized = normalized.charAt(0).toUpperCase() + normalized.slice(1);
  }
  normalized = normalized.trim();
  return normalized;
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
async function rateLimit(req, config2) {
  const key = config2.keyGenerator ? config2.keyGenerator(req) : getDefaultKey(req);
  const now = Date.now();
  cleanupExpired(now);
  const record = requestCounts.get(key);
  if (!record || now > record.resetAt) {
    requestCounts.set(key, {
      count: 1,
      resetAt: now + config2.windowMs
    });
    return;
  }
  if (record.count >= config2.maxRequests) {
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

// api/_middleware/usage-tracking.ts
var TIER_MINUTES = {
  free: 60,
  pro: 500,
  team: 2e3
};
async function trackUsage(userId, operationType, durationSeconds, mode = "with_quota_deduction") {
  try {
    const { data: subscription, error: subError } = await supabaseAdmin.from("subscriptions").select("id, tier, minutes_used").eq("user_id", userId).single();
    if (subError && subError.code === "PGRST116") {
      return;
    }
    if (!subscription) {
      return;
    }
    const minutesUsed = Math.ceil(durationSeconds / 60);
    const now = /* @__PURE__ */ new Date();
    const billingPeriod = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const { error: insertError } = await supabaseAdmin.from("usage_events").insert({
      user_id: userId,
      event_type: operationType,
      audio_duration_seconds: durationSeconds,
      minutes_consumed: minutesUsed,
      provider: "system",
      billing_period: billingPeriod,
      created_at: now.toISOString()
    });
    if (insertError) {
      console.error("Failed to insert usage event:", insertError);
      return;
    }
    if (mode === "with_quota_deduction") {
      const { error: rpcError } = await supabaseAdmin.rpc("increment_minutes_used", {
        sub_id: subscription.id,
        minutes: minutesUsed
      });
      if (rpcError) {
        console.error("Failed to increment minutes_used:", rpcError);
      }
    } else {
      console.log(
        `[Usage Tracking] Analytics-only mode: tracked ${minutesUsed} minutes for user ${userId} (no quota deduction)`
      );
    }
  } catch (error) {
    console.error("Error tracking usage:", error);
  }
}
async function checkQuota(userId, requiredMinutes, options = {}) {
  try {
    const { data: subscription, error: subError } = await supabaseAdmin.from("subscriptions").select("tier, minutes_used, credits_balance").eq("user_id", userId).single();
    if (subError && subError.code === "PGRST116") {
      if (options.allowByok) {
        return {
          allowed: true,
          minutesRemaining: Infinity,
          minutesRequired: requiredMinutes,
          isByok: true
        };
      }
      return {
        allowed: false,
        minutesRemaining: 0,
        minutesRequired: requiredMinutes,
        reason: "No subscription"
      };
    }
    if (!subscription) {
      return {
        allowed: false,
        minutesRemaining: 0,
        minutesRequired: requiredMinutes,
        reason: "Subscription not found"
      };
    }
    const minutesIncluded = TIER_MINUTES[subscription.tier] || 0;
    const minutesRemaining = minutesIncluded - (subscription.minutes_used || 0);
    if (minutesRemaining >= requiredMinutes) {
      return {
        allowed: true,
        minutesRemaining,
        minutesRequired: requiredMinutes
      };
    }
    const creditsBalance = subscription.credits_balance || 0;
    if (creditsBalance >= requiredMinutes) {
      return {
        allowed: true,
        minutesRemaining,
        minutesRequired: requiredMinutes,
        usingCredits: true,
        creditsRemaining: creditsBalance
      };
    }
    return {
      allowed: false,
      minutesRemaining,
      minutesRequired: requiredMinutes,
      reason: "Quota exceeded"
    };
  } catch (error) {
    console.error("Error checking quota:", error);
    return {
      allowed: false,
      minutesRemaining: 0,
      minutesRequired: requiredMinutes,
      reason: "Error checking quota"
    };
  }
}

// api/_utils/file-validator.ts
var fs5 = __toESM(require("fs/promises"));
var FILE_SIGNATURES = {
  "audio/mpeg": [
    { bytes: [255, 251], offset: 0 },
    // MP3 frame sync
    { bytes: [73, 68, 51], offset: 0 }
    // ID3 tag
  ],
  "audio/wav": [{ bytes: [82, 73, 70, 70], offset: 0 }],
  // RIFF header
  "audio/webm": [{ bytes: [26, 69, 223, 163], offset: 0 }],
  // EBML header
  "audio/ogg": [{ bytes: [79, 103, 103, 83], offset: 0 }],
  // OggS
  "audio/mp4": [{ bytes: [102, 116, 121, 112], offset: 4 }],
  // ftyp (MP4 container)
  "audio/x-m4a": [{ bytes: [102, 116, 121, 112], offset: 4 }]
  // ftyp (M4A)
};
async function validateAudioFile(buffer, declaredMimeType, maxDurationSeconds = 7200) {
  if (!validateMagicBytes(buffer, declaredMimeType)) {
    return {
      valid: false,
      error: "File signature does not match declared type. Possible file type mismatch or corruption."
    };
  }
  try {
    setupFFmpeg();
    const tempPath = `/tmp/validate_${Date.now()}_${Math.random().toString(36).substring(7)}.tmp`;
    await fs5.writeFile(tempPath, buffer);
    const duration = await getAudioDuration2(tempPath);
    await fs5.unlink(tempPath).catch(() => {
    });
    if (duration > maxDurationSeconds) {
      return {
        valid: false,
        error: `Audio duration (${Math.round(duration)}s) exceeds maximum allowed duration (${maxDurationSeconds}s)`,
        duration
      };
    }
    return { valid: true, duration };
  } catch (error) {
    const err = error;
    return {
      valid: false,
      error: `Failed to validate audio file: ${err.message || "Unknown error"}`
    };
  }
}
function validateMagicBytes(buffer, mimeType) {
  const signatures = FILE_SIGNATURES[mimeType];
  if (!signatures) {
    console.warn(`[File Validator] No magic byte signatures defined for ${mimeType}`);
    return true;
  }
  return signatures.some((sig) => matchesSignature(buffer, sig.bytes, sig.offset));
}
function matchesSignature(buffer, signature, offset) {
  if (buffer.length < offset + signature.length) {
    return false;
  }
  return signature.every((byte, index) => buffer[offset + index] === byte);
}
async function getAudioDuration2(filePath) {
  return ffprobeDuration(filePath);
}

// api/transcribe.ts
var config = {
  api: {
    bodyParser: false
  }
};
var { MAX_FILE_SIZE, MAX_FILES, MAX_FIELDS } = API_VALIDATION;
async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  try {
    const { userId } = await requireAuth(req);
    await rateLimit(req, {
      ...RATE_LIMITS.TRANSCRIBE,
      keyGenerator: () => `user:${userId}`
    });
    const bb = (0, import_busboy.default)({
      headers: req.headers,
      limits: {
        fileSize: MAX_FILE_SIZE,
        files: MAX_FILES,
        fields: MAX_FIELDS
      }
    });
    let audioData = null;
    const audioChunks = [];
    let language = void 0;
    let performanceLevel = void 0;
    let enableSpeakerDiarization = false;
    let speakersExpected = void 0;
    let uploadedFilename = "audio.webm";
    let fileSizeExceeded = false;
    let apiKey = null;
    const parsePromise = new Promise((resolve, reject) => {
      bb.on("file", (_fieldname, file, info) => {
        const { filename, mimeType: mimeType2 } = info;
        uploadedFilename = filename || "audio.webm";
        if (!mimeType2.startsWith("audio/")) {
          file.resume();
          reject(new Error("Invalid file type. Audio files only."));
          return;
        }
        file.on("data", (chunk) => {
          audioChunks.push(chunk);
        });
        file.on("limit", () => {
          fileSizeExceeded = true;
          file.resume();
        });
        file.on("end", () => {
          if (fileSizeExceeded) {
            reject(new Error("File size exceeds limit"));
          } else {
            audioData = Buffer.concat(audioChunks);
          }
        });
      });
      bb.on("field", (fieldname, value) => {
        if (fieldname === "apiKey") {
          apiKey = value || null;
        } else if (fieldname === "language") {
          language = value || void 0;
        } else if (fieldname === "performanceLevel") {
          performanceLevel = value || void 0;
        } else if (fieldname === "enableSpeakerDiarization") {
          enableSpeakerDiarization = value === "true";
        } else if (fieldname === "speakersExpected") {
          const parsed = parseInt(value, 10);
          speakersExpected = !isNaN(parsed) ? parsed : void 0;
        }
      });
      bb.on("finish", () => {
        resolve();
      });
      bb.on("error", (error) => {
        reject(error);
      });
    });
    req.pipe(bb);
    await parsePromise;
    if (!audioData) {
      return res.status(400).json({ error: "No audio file found in request" });
    }
    const audioBuffer = audioData;
    const mimeType = req.headers["content-type"]?.split(";")[0] || "audio/webm";
    const validation = await validateAudioFile(audioBuffer, mimeType, 7200);
    if (!validation.valid) {
      return res.status(400).json({
        error: "File validation failed",
        message: validation.error
      });
    }
    let finalApiKey;
    let shouldTrackQuota = false;
    if (apiKey) {
      finalApiKey = apiKey;
      shouldTrackQuota = false;
      console.log(`[Transcribe] User ${userId} using BYOK mode`);
    } else {
      const { data: subscription } = await supabaseAdmin.from("subscriptions").select("tier").eq("user_id", userId).single();
      if (!subscription || subscription.tier === "free") {
        return res.status(403).json({
          error: "API key required",
          message: "Free tier users must provide their own OpenAI API key. Configure it in Settings or upgrade to Pro.",
          upgradeUrl: "/pricing",
          requiresApiKey: true
          // Flag for frontend to show API key setup modal
        });
      }
      const estimatedMinutes = Math.ceil((validation.duration || 0) / 60);
      const quotaCheck = await checkQuota(userId, estimatedMinutes);
      if (!quotaCheck.allowed) {
        return res.status(429).json({
          error: "Quota exceeded",
          minutesRemaining: quotaCheck.minutesRemaining,
          minutesRequired: quotaCheck.minutesRequired,
          message: "Insufficient quota. Please upgrade your plan or purchase additional credits.",
          upgradeUrl: "/pricing"
        });
      }
      finalApiKey = process.env.OPENAI_API_KEY;
      shouldTrackQuota = true;
      console.log(
        `[Transcribe] User ${userId} (${subscription.tier}) using platform API with quota tracking`
      );
    }
    const mode = performanceLevel === "best_quality" || performanceLevel === "advanced" ? "best_quality" : "balanced";
    const transcriptionModel = "whisper-1";
    const transcriptionLanguage = language === "auto" ? void 0 : language;
    console.log(
      `[Transcribe API] Job configuration: model=${transcriptionModel}, mode=${mode}, language=${transcriptionLanguage || "auto"}`
    );
    const jobConfig = {
      apiKey: finalApiKey,
      mode,
      model: transcriptionModel,
      language: transcriptionLanguage,
      prompt: WHISPER_STYLE_PROMPT,
      // Use style prompt for clean transcription
      enableSpeakerDiarization,
      speakersExpected,
      userId,
      // Store userId for ownership validation
      shouldTrackQuota
      // Track mode (with/without quota deduction)
    };
    const job = JobManager.createJob(jobConfig, {
      filename: uploadedFilename,
      fileSize: audioBuffer.length,
      duration: validation.duration || 0,
      // Use validated duration
      totalChunks: 0
    });
    console.log(
      `[Transcribe API] Created job ${job.jobId} (mode: ${mode}, size: ${audioBuffer.length}B)`
    );
    const statusUrl = `/api/transcribe-job/${job.jobId}/status`;
    res.status(202).json({
      jobId: job.jobId,
      statusUrl,
      message: "Transcription job created"
    });
    processJobInBackground(job.jobId, audioBuffer, uploadedFilename).catch((error) => {
      console.error(`[Transcribe API] Background processing failed for job ${job.jobId}:`, error);
      JobManager.updateJobStatus(job.jobId, "failed", error.message);
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    if (error instanceof RateLimitError) {
      res.setHeader("Retry-After", error.retryAfter.toString());
      return res.status(429).json({
        error: "Rate limit exceeded",
        retryAfter: error.retryAfter
      });
    }
    const err = error;
    console.error("[Transcribe API] Error:", error);
    const status = err.message?.includes("File size") ? 413 : err.message?.includes("Invalid file type") ? 415 : err.message?.includes("validation") ? 400 : 500;
    return res.status(status).json({
      error: "Failed to create transcription job",
      message: err.message || "Unknown error"
    });
  }
}
async function processJobInBackground(jobId, audioBuffer, filename) {
  const job = JobManager.getJob(jobId);
  if (!job) {
    throw new Error(`Job ${jobId} not found`);
  }
  try {
    if (job.config.enableSpeakerDiarization) {
      console.log(`[Job ${jobId}] Starting speaker diarization transcription...`);
      JobManager.updateJobStatus(jobId, "transcribing");
      const provider2 = TranscriptionProviderFactory.create({
        provider: "assemblyai",
        apiKey: job.config.apiKey,
        enableSpeakerDiarization: true
      });
      const result = await provider2.transcribe({
        audioFile: audioBuffer,
        language: job.config.language,
        enableSpeakerDiarization: true,
        speakersExpected: job.config.speakersExpected
      });
      JobManager.setJobTranscript(jobId, result.text);
      if (result.utterances) {
        JobManager.setJobUtterances(jobId, result.utterances);
      }
      if (result.segments) {
        JobManager.setJobSegments(jobId, result.segments);
      }
      JobManager.updateJobStatus(jobId, "completed");
      console.log(
        `[Job ${jobId}] \u2705 Completed with speaker diarization (${result.text.length} chars, ${result.utterances?.length || 0} utterances)`
      );
      if (job.config.userId) {
        const durationSeconds = job.metadata.duration || 0;
        const mode = job.config.shouldTrackQuota ? "with_quota_deduction" : "analytics_only";
        await trackUsage(job.config.userId, "transcription", durationSeconds, mode);
      }
      return;
    }
    JobManager.updateJobStatus(jobId, "chunking");
    console.log(`[Job ${jobId}] Starting audio chunking...`);
    const chunkingResult = await chunkAudio(audioBuffer, filename, job.config.mode);
    JobManager.initializeChunks(jobId, chunkingResult.chunks);
    const updatedJob = JobManager.getJob(jobId);
    updatedJob.metadata.duration = chunkingResult.totalDuration;
    console.log(
      `[Job ${jobId}] Created ${chunkingResult.totalChunks} chunks (${chunkingResult.totalDuration.toFixed(2)}s total)`
    );
    JobManager.updateJobStatus(jobId, "transcribing");
    const governor = new RateLimitGovernor(job.config.mode);
    const provider = new OpenAIProvider();
    console.log(`[Job ${jobId}] Processing chunks with rate governor...`);
    const transcripts = [];
    for (const chunk of chunkingResult.chunks) {
      const currentJob = JobManager.getJob(jobId);
      if (currentJob?.status === "cancelled") {
        console.log(`[Job ${jobId}] Job cancelled, stopping chunk processing`);
        throw new Error("Job was cancelled by user");
      }
      try {
        const transcript = await processChunk(
          chunk,
          updatedJob,
          governor,
          provider,
          job.config.apiKey
        );
        transcripts.push(transcript);
        JobManager.updateChunkStatus(jobId, chunk.index, {
          status: "completed",
          transcript
        });
        console.log(
          `[Job ${jobId}] Completed chunk ${chunk.index + 1}/${chunkingResult.totalChunks} (${updatedJob.progress}%)`
        );
      } catch (error) {
        const err = error;
        console.error(`[Job ${jobId}] Failed to process chunk ${chunk.index}:`, error);
        JobManager.updateChunkStatus(jobId, chunk.index, {
          status: "failed",
          error: err.message || "Unknown error"
        });
        throw new Error(`Chunk ${chunk.index} failed: ${err.message || "Unknown error"}`);
      }
    }
    console.log(`[Job ${jobId}] Assembling final transcript...`);
    JobManager.updateJobStatus(jobId, "assembling");
    const finalTranscript = await assembleTranscript(
      chunkingResult.chunks,
      transcripts,
      job.config.mode
    );
    JobManager.setJobTranscript(jobId, finalTranscript);
    await cleanupChunks(chunkingResult.chunks);
    JobManager.updateJobStatus(jobId, "completed");
    console.log(
      `[Job ${jobId}] \u2705 Completed successfully (${finalTranscript.length} chars, ${governor.getStats().totalRequests} API calls)`
    );
    const stats = governor.getStats();
    console.log(`[Job ${jobId}] Stats:`, {
      totalRequests: stats.totalRequests,
      successRate: `${(stats.successfulRequests / stats.totalRequests * 100).toFixed(1)}%`,
      rateLimited: stats.rateLimitedRequests,
      degradedModeActivations: stats.degradedModeActivations,
      peakConcurrency: stats.peakConcurrency
    });
    if (job.config.userId) {
      const durationSeconds = updatedJob.metadata.duration || 0;
      const mode = job.config.shouldTrackQuota ? "with_quota_deduction" : "analytics_only";
      await trackUsage(job.config.userId, "transcription", durationSeconds, mode);
    }
  } catch (error) {
    const err = error;
    console.error(`[Job ${jobId}] \u274C Failed:`, error);
    JobManager.updateJobStatus(jobId, "failed", err.message || "Unknown error");
    const failedJob = JobManager.getJob(jobId);
    if (failedJob && failedJob.chunks.length > 0) {
      try {
        await cleanupChunks(failedJob.chunks);
      } catch (cleanupError) {
        console.warn(`[Job ${jobId}] Failed to clean up chunks:`, cleanupError);
      }
    }
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  config
});
