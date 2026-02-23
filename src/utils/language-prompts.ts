/**
 * Language-specific prompts for summarization
 *
 * Provides contextual prompts in the target language to improve
 * summary quality and ensure proper tone/style for each language.
 */

export interface LanguagePromptConfig {
  language: string;
  languageName: string;
  summarizationPrompt: string;
  chatSystemPrompt: string;
}

/**
 * Get language-specific prompts for AI operations
 */
export function getLanguagePrompts(languageCode: string): LanguagePromptConfig {
  const prompts = LANGUAGE_PROMPT_MAP[languageCode] || LANGUAGE_PROMPT_MAP['en'];

  return {
    language: languageCode,
    languageName: prompts.name,
    summarizationPrompt: prompts.summary,
    chatSystemPrompt: prompts.chat,
  };
}

/**
 * Language-specific prompt configurations
 */
const LANGUAGE_PROMPT_MAP: Record<string, { name: string; summary: string; chat: string }> = {
  // English
  en: {
    name: 'English',
    summary:
      'Please provide a concise summary of the following transcript in English. Include key points, action items, and important decisions.',
    chat: 'You are a helpful assistant analyzing an English transcript. Provide clear, concise answers based on the content.',
  },

  // Spanish
  es: {
    name: 'Spanish',
    summary:
      'Por favor, proporciona un resumen conciso de la siguiente transcripción en español. Incluye puntos clave, elementos de acción y decisiones importantes.',
    chat: 'Eres un asistente útil que analiza una transcripción en español. Proporciona respuestas claras y concisas basadas en el contenido.',
  },

  // French
  fr: {
    name: 'French',
    summary:
      'Veuillez fournir un résumé concis de la transcription suivante en français. Incluez les points clés, les actions à entreprendre et les décisions importantes.',
    chat: 'Vous êtes un assistant utile qui analyse une transcription en français. Fournissez des réponses claires et concises basées sur le contenu.',
  },

  // German
  de: {
    name: 'German',
    summary:
      'Bitte erstellen Sie eine prägnante Zusammenfassung des folgenden Transkripts auf Deutsch. Berücksichtigen Sie wichtige Punkte, Handlungsschritte und wichtige Entscheidungen.',
    chat: 'Sie sind ein hilfreicher Assistent, der ein deutsches Transkript analysiert. Geben Sie klare, präzise Antworten basierend auf dem Inhalt.',
  },

  // Italian
  it: {
    name: 'Italian',
    summary:
      'Per favore, fornisci un riepilogo conciso della seguente trascrizione in italiano. Includi punti chiave, azioni da intraprendere e decisioni importanti.',
    chat: 'Sei un assistente utile che analizza una trascrizione in italiano. Fornisci risposte chiare e concise basate sul contenuto.',
  },

  // Portuguese
  pt: {
    name: 'Portuguese',
    summary:
      'Por favor, forneça um resumo conciso da seguinte transcrição em português. Inclua pontos-chave, itens de ação e decisões importantes.',
    chat: 'Você é um assistente útil que analisa uma transcrição em português. Forneça respostas claras e concisas com base no conteúdo.',
  },

  // Portuguese (Brazil)
  'pt-BR': {
    name: 'Portuguese (Brazil)',
    summary:
      'Por favor, forneça um resumo conciso da seguinte transcrição em português brasileiro. Inclua pontos-chave, itens de ação e decisões importantes.',
    chat: 'Você é um assistente útil que analisa uma transcrição em português brasileiro. Forneça respostas claras e concisas com base no conteúdo.',
  },

  // Russian
  ru: {
    name: 'Russian',
    summary:
      'Пожалуйста, предоставьте краткое резюме следующей расшифровки на русском языке. Включите ключевые моменты, пункты действий и важные решения.',
    chat: 'Вы полезный ассистент, анализирующий расшифровку на русском языке. Предоставьте четкие и краткие ответы на основе содержания.',
  },

  // Chinese (Mandarin)
  zh: {
    name: 'Chinese',
    summary: '请用中文提供以下转录内容的简明摘要。包括关键点、行动项目和重要决定。',
    chat: '您是一位有用的助手，正在分析中文转录内容。请根据内容提供清晰、简洁的答案。',
  },

  // Japanese
  ja: {
    name: 'Japanese',
    summary:
      '以下の文字起こしの簡潔な要約を日本語で提供してください。重要なポイント、アクションアイテム、重要な決定を含めてください。',
    chat: 'あなたは日本語の文字起こしを分析する有用なアシスタントです。内容に基づいて明確で簡潔な回答を提供してください。',
  },

  // Korean
  ko: {
    name: 'Korean',
    summary:
      '다음 녹취록의 간결한 요약을 한국어로 제공해 주세요. 주요 사항, 실행 항목, 중요한 결정을 포함하세요.',
    chat: '당신은 한국어 녹취록을 분석하는 유용한 어시스턴트입니다. 내용을 기반으로 명확하고 간결한 답변을 제공하세요.',
  },

  // Arabic
  ar: {
    name: 'Arabic',
    summary:
      'يرجى تقديم ملخص موجز للنص المكتوب التالي باللغة العربية. قم بتضمين النقاط الرئيسية وعناصر الإجراءات والقرارات المهمة.',
    chat: 'أنت مساعد مفيد يحلل نصًا مكتوبًا بالعربية. قدم إجابات واضحة وموجزة بناءً على المحتوى.',
  },

  // Hindi
  hi: {
    name: 'Hindi',
    summary:
      'कृपया निम्नलिखित ट्रांसक्रिप्ट का संक्षिप्त सारांश हिंदी में प्रदान करें। मुख्य बिंदु, कार्रवाई आइटम और महत्वपूर्ण निर्णय शामिल करें।',
    chat: 'आप एक सहायक सहायक हैं जो हिंदी ट्रांसक्रिप्ट का विश्लेषण कर रहे हैं। सामग्री के आधार पर स्पष्ट, संक्षिप्त उत्तर प्रदान करें।',
  },

  // Dutch
  nl: {
    name: 'Dutch',
    summary:
      'Geef alstublieft een beknopte samenvatting van de volgende transcriptie in het Nederlands. Neem de belangrijkste punten, actiepunten en belangrijke beslissingen op.',
    chat: 'U bent een nuttige assistent die een Nederlandse transcriptie analyseert. Geef duidelijke, beknopte antwoorden op basis van de inhoud.',
  },

  // Polish
  pl: {
    name: 'Polish',
    summary:
      'Proszę podać zwięzłe podsumowanie następującej transkrypcji po polsku. Uwzględnij kluczowe punkty, elementy działania i ważne decyzje.',
    chat: 'Jesteś pomocnym asystentem analizującym transkrypcję w języku polskim. Udzielaj jasnych, zwięzłych odpowiedzi na podstawie treści.',
  },

  // Turkish
  tr: {
    name: 'Turkish',
    summary:
      'Lütfen aşağıdaki transkriptin Türkçe olarak özet bir özetini sağlayın. Önemli noktaları, eylem öğelerini ve önemli kararları içerin.',
    chat: 'Türkçe bir transkripti analiz eden yararlı bir asistansınız. İçeriğe dayalı olarak net, öz cevaplar sağlayın.',
  },

  // Swedish
  sv: {
    name: 'Swedish',
    summary:
      'Vänligen ge en kortfattad sammanfattning av följande transkription på svenska. Inkludera viktiga punkter, åtgärdspunkter och viktiga beslut.',
    chat: 'Du är en hjälpsam assistent som analyserar en svensk transkription. Ge tydliga, koncisa svar baserat på innehållet.',
  },

  // Norwegian
  no: {
    name: 'Norwegian',
    summary:
      'Vennligst gi et konsist sammendrag av følgende transkript på norsk. Inkluder viktige punkter, handlingselementer og viktige beslutninger.',
    chat: 'Du er en nyttig assistent som analyserer en norsk transkripsjon. Gi klare, kortfattede svar basert på innholdet.',
  },

  // Danish
  da: {
    name: 'Danish',
    summary:
      'Venligst giv et kort resumé af følgende transkription på dansk. Inkluder nøglepunkter, handlingspunkter og vigtige beslutninger.',
    chat: 'Du er en hjælpsom assistent, der analyserer en dansk transkription. Giv klare, kortfattede svar baseret på indholdet.',
  },

  // Auto-detect (use English as fallback)
  auto: {
    name: 'Auto-detect',
    summary:
      'Please provide a concise summary of the following transcript. Include key points, action items, and important decisions. Use the same language as the transcript.',
    chat: 'You are a helpful assistant analyzing a transcript. Provide clear, concise answers based on the content. Use the same language as the transcript.',
  },
};

/**
 * Get supported languages for prompts
 */
export function getSupportedPromptLanguages(): string[] {
  return Object.keys(LANGUAGE_PROMPT_MAP);
}

/**
 * Check if language has custom prompts
 */
export function hasCustomPrompts(languageCode: string): boolean {
  return languageCode in LANGUAGE_PROMPT_MAP;
}
