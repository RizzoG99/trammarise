const fs = require('fs');
const path = require('path');

const locales = ['en', 'it', 'de', 'es'];
const basePath = path.join(__dirname, 'src/locales');

const translations = {
  en: {
    'upgrade.includes': 'Upgrade unlocks:',
    'upgrade.limitReached': {
      title: "You've reached your free limit",
      desc: "Free users are limited to 60 minutes of processing per month. Upgrade to Pro for 500 minutes!"
    },
    'upgrade.chatGate': {
      title: "Unlock AI Chat",
      desc: "Chatting with your transcript is a Pro feature. Upgrade to ask questions and get insights instantly."
    },
    'upgrade.watermark': {
      title: "Remove Watermark",
      desc: "Professional documents require a professional look. Upgrade to remove the Trammarise watermark."
    },
    'upgrade.history': {
      title: "Unlock Your Full History",
      desc: "Free users can only access their last 5 recordings. Upgrade to access your entire archive."
    },
    'upgrade.generic': {
      title: "Upgrade to Pro",
      desc: "Unlock the full power of Trammarise with a Pro subscription."
    },
    'upgrade.cta': "View Plans & Upgrade",
    'upgrade.features': {
      minutes: "500 Minutes / Month",
      watermark: "No Watermarks",
      chat: "AI Chat Support",
      unlimitedChat: "Unlimited AI Chat",
      advancedAnalysis: "Advanced Analysis",
      prioritySupport: "Priority Support",
      cleanPdf: "Clean PDF Exports",
      branding: "Custom Branding",
      priorityProcessing: "Priority Processing",
      unlimitedHistory: "Unlimited History",
      cloudBackup: "Cloud Backup",
      sync: "Cross-Device Sync",
      higherLimits: "Higher Limits",
      advancedFeatures: "Advanced Features"
    },
    'common.maybeLater': 'Maybe Later',
    'pricing.pro.name': 'Pro',
    'pricing.pro.desc': 'Best for individuals and professionals',
    'pricing.pro.features.minutes': '500 minutes/month included',
    'pricing.pro.features.noKeys': 'No API keys needed',
    'pricing.pro.features.sync': 'Cross-device sync',
    'pricing.pro.features.chat': 'Chat with transcripts',
    'pricing.pro.features.support': 'Priority processing & support',
    'pricing.annualPricing': 'Annual Billing',
    'home.tabs.upload': 'Upload File',
    'home.tabs.record': 'Record Audio',
    'home.tabs.ariaLabel': 'Upload or Record Audio',
    'configuration.meetingType.tooltip': 'Select the type of content for optimizations',
    'configuration.processingMode.tooltip': 'Select how your audio will be processed for optimal results'
  },
  it: {
    'upgrade.includes': 'L\'Upgrade sblocca:',
    'upgrade.limitReached': {
      title: "Hai raggiunto il limite gratuito",
      desc: "Gli utenti gratuiti hanno a disposizione 60 minuti al mese. Passa a Pro per 500 minuti!"
    },
    'upgrade.chatGate': {
      title: "Sblocca la Chat AI",
      desc: "Chattare con la trascrizione è una funzione Pro. Passa a Pro per avere risposte immediate."
    },
    'upgrade.watermark': {
      title: "Rimuovi Filigrana",
      desc: "I documenti professionali richiedono un aspetto professionale. Passa a Pro per rimuovere la filigrana di Trammarise."
    },
    'upgrade.history': {
      title: "Sblocca la Cronologia",
      desc: "Gli utenti gratuiti possono accedere solo alle ultime 5 registrazioni. Passa a Pro per lo storico completo."
    },
    'upgrade.generic': {
      title: "Passa a Pro",
      desc: "Sblocca tutto il potenziale di Trammarise con un abbonamento Pro."
    },
    'upgrade.cta': "Vedi i Piani e Passa a Pro",
    'upgrade.features': {
      minutes: "500 Minuti / Mese",
      watermark: "Nessuna filigrana",
      chat: "Supporto Chat AI",
      unlimitedChat: "Chat AI Illimitata",
      advancedAnalysis: "Analisi Avanzata",
      prioritySupport: "Supporto Prioritario",
      cleanPdf: "Esportazione PDF Pulita",
      branding: "Branding Personalizzato",
      priorityProcessing: "Elaborazione Prioritaria",
      unlimitedHistory: "Cronologia Illimitata",
      cloudBackup: "Backup in Cloud",
      sync: "Sincronizzazione",
      higherLimits: "Limiti più ampi",
      advancedFeatures: "Funzionalità Avanzate"
    },
    'common.maybeLater': 'Forse più tardi',
    'pricing.pro.name': 'Pro',
    'pricing.pro.desc': 'Ideale per individui e professionisti',
    'pricing.pro.features.minutes': '500 minuti/mese inclusi',
    'pricing.pro.features.noKeys': 'Nessuna chiave API necessaria',
    'pricing.pro.features.sync': 'Sincronizzazione tra dispositivi',
    'pricing.pro.features.chat': 'Chatta con le trascrizioni',
    'pricing.pro.features.support': 'Elaborazione e supporto prioritari',
    'pricing.annualPricing': 'Fatturazione Annuale',
    'home.tabs.upload': 'Carica File',
    'home.tabs.record': 'Registra Audio',
    'home.tabs.ariaLabel': 'Carica o Registra Audio',
    'configuration.meetingType.tooltip': 'Seleziona il tipo di contenuto per le ottimizzazioni',
    'configuration.processingMode.tooltip': 'Seleziona come verrà elaborato il tuo audio per risultati ottimali'
  },
  de: {
    'upgrade.includes': 'Upgrade schaltet frei:',
    'upgrade.limitReached': {
      title: "Sie haben Ihr kostenloses Limit erreicht",
      desc: "Kostenlose Nutzer sind auf 60 Minuten pro Monat beschränkt. Upgraden Sie auf Pro für 500 Minuten!"
    },
    'upgrade.chatGate': {
      title: "KI-Chat freischalten",
      desc: "Der Chat mit dem Transkript ist eine Pro-Funktion. Führen Sie ein Upgrade durch, um sofort Antworten zu erhalten."
    },
    'upgrade.watermark': {
      title: "Wasserzeichen entfernen",
      desc: "Professionelle Dokumente erfordern einen professionellen Look. Upgraden Sie, um das Trammarise-Wasserzeichen zu entfernen."
    },
    'upgrade.history': {
      title: "Vollständigen Verlauf freischalten",
      desc: "Kostenlose Nutzer haben nur Zugriff auf die letzten 5 Aufnahmen. Upgraden Sie für das komplette Archiv."
    },
    'upgrade.generic': {
      title: "Upgrade auf Pro",
      desc: "Schalten Sie die volle Leistung von Trammarise mit einem Pro-Abo frei."
    },
    'upgrade.cta': "Pläne ansehen & upgraden",
    'upgrade.features': {
      minutes: "500 Minuten / Monat",
      watermark: "Keine Wasserzeichen",
      chat: "KI-Chat-Support",
      unlimitedChat: "Unbegrenzter KI-Chat",
      advancedAnalysis: "Erweiterte Analyse",
      prioritySupport: "Bevorzugter Support",
      cleanPdf: "Saubere PDF-Exporte",
      branding: "Eigenes Branding",
      priorityProcessing: "Bevorzugte Verarbeitung",
      unlimitedHistory: "Unbegrenzter Verlauf",
      cloudBackup: "Cloud-Backup",
      sync: "Geräteübergreifende Synchronisierung",
      higherLimits: "Höhere Limits",
      advancedFeatures: "Erweiterte Funktionen"
    },
    'common.maybeLater': 'Vielleicht später',
    'pricing.pro.name': 'Pro',
    'pricing.pro.desc': 'Am besten für Einzelpersonen und Profis',
    'pricing.pro.features.minutes': '500 Minuten/Monat inklusive',
    'pricing.pro.features.noKeys': 'Keine API-Schlüssel erforderlich',
    'pricing.pro.features.sync': 'Geräteübergreifende Synchronisierung',
    'pricing.pro.features.chat': 'Mit Transkripten chatten',
    'pricing.pro.features.support': 'Priorisierte Verarbeitung & Support',
    'pricing.annualPricing': 'Jährliche Abrechnung',
    'home.tabs.upload': 'Datei hochladen',
    'home.tabs.record': 'Audio aufnehmen',
    'home.tabs.ariaLabel': 'Audio hochladen oder aufnehmen',
    'configuration.meetingType.tooltip': 'Wählen Sie die Art des Inhalts für Optimierungen',
    'configuration.processingMode.tooltip': 'Wählen Sie aus, wie Ihr Audio für optimale Ergebnisse verarbeitet werden soll'
  },
  es: {
    'upgrade.includes': 'La actualización desbloquea:',
    'upgrade.limitReached': {
      title: "Has alcanzado tu límite gratuito",
      desc: "Los usuarios gratuitos tienen 60 minutos al mes. ¡Actualízate a Pro para tener 500 minutos!"
    },
    'upgrade.chatGate': {
      title: "Desbloquear Chat de IA",
      desc: "Chatear con tu transcripción es una función Pro. Actualízate para obtener información al instante."
    },
    'upgrade.watermark': {
      title: "Quitar Marca de Agua",
      desc: "Los documentos profesionales requieren un aspecto profesional. Actualízate para quitar la marca."
    },
    'upgrade.history': {
      title: "Desbloquea tu Historial Completo",
      desc: "Solo puedes acceder a las últimas 5 grabaciones. Actualízate para acceder a tu historial completo."
    },
    'upgrade.generic': {
      title: "Actualízate a Pro",
      desc: "Desbloquea todo el poder de Trammarise con una suscripción Pro."
    },
    'upgrade.cta': "Ver Planes y Actualizar",
    'upgrade.features': {
      minutes: "500 Minutos / Mes",
      watermark: "Sin marca de agua",
      chat: "Soporte Chat IA",
      unlimitedChat: "Chat IA Ilimitado",
      advancedAnalysis: "Análisis Avanzado",
      prioritySupport: "Soporte Prioritario",
      cleanPdf: "Exportación PDF Limpia",
      branding: "Marca Personalizada",
      priorityProcessing: "Procesamiento Prioritario",
      unlimitedHistory: "Historial Ilimitado",
      cloudBackup: "Respaldo en la Nube",
      sync: "Sincronización en dispositivos",
      higherLimits: "Límites Mayores",
      advancedFeatures: "Funciones Avanzadas"
    },
    'common.maybeLater': 'Tal vez más tarde',
    'pricing.pro.name': 'Pro',
    'pricing.pro.desc': 'Ideal para individuos y profesionales',
    'pricing.pro.features.minutes': '500 minutos/mes incluidos',
    'pricing.pro.features.noKeys': 'No se necesitan claves API',
    'pricing.pro.features.sync': 'Sincronización entre dispositivos',
    'pricing.pro.features.chat': 'Chatea con transcripciones',
    'pricing.pro.features.support': 'Procesamiento y soporte prioritario',
    'pricing.annualPricing': 'Facturación Anual',
    'home.tabs.upload': 'Subir archivo',
    'home.tabs.record': 'Grabar Audio',
    'home.tabs.ariaLabel': 'Subir o Grabar Audio',
    'configuration.meetingType.tooltip': 'Selecciona el tipo de contenido para optimizaciones',
    'configuration.processingMode.tooltip': 'Selecciona cómo se procesará tu audio para obtener resultados óptimos'
  }
};

function setDeep(obj, path, value) {
  const keys = path.split('.');
  let current = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    if (!current[keys[i]]) current[keys[i]] = {};
    current = current[keys[i]];
  }
  current[keys[keys.length - 1]] = value;
}

locales.forEach(loc => {
  const file = path.join(basePath, loc, 'translation.json');
  if (fs.existsSync(file)) {
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    
    if (translations[loc]) {
      for (const [key, value] of Object.entries(translations[loc])) {
        if (typeof value === 'object' && value !== null) {
          // If value is object, let's deep merge or set properties
          for (const [subk, subv] of Object.entries(value)) {
            setDeep(data, `${key}.${subk}`, subv);
          }
        } else {
          setDeep(data, key, value);
        }
      }
    }
    
    fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n');
  }
});

console.log('Translations inserted.');
