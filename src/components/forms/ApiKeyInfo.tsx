import React, { useState } from 'react';
import type { AIProvider } from '../../types/audio';

interface ApiKeyInfoProps {
  provider: AIProvider;
}

const InfoIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 flex-shrink-0">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 16v-4M12 8h.01" />
  </svg>
);

export const ApiKeyInfo: React.FC<ApiKeyInfoProps> = ({ provider }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  interface ProviderDetails {
    name: string;
    url: string;
    models: string;
    pricing: string;
    steps: string[];
    note?: string;
  }

  const providerInfo: Record<AIProvider, ProviderDetails> = {
    openrouter: {
      name: 'OpenRouter',
      url: 'https://openrouter.ai/keys',
      models: 'Access to 100+ models (GPT-4, Claude, Gemini, Llama, etc.)',
      pricing: 'Varies by model - often cheaper than direct API access',
      note: 'Single API key for multiple AI providers',
      steps: [
        'Go to OpenRouter',
        'Sign in with Google or GitHub',
        'Navigate to "Keys" section',
        'Click "Create Key"',
        'Copy your API key (starts with sk-or-...)',
        'Add credits to your account if needed'
      ]
    },
    openai: {
      name: 'OpenAI (for Whisper transcription)',
      url: 'https://platform.openai.com/api-keys',
      models: 'Whisper (audio transcription)',
      pricing: '~$0.006/min transcription',
      steps: [
        'Go to OpenAI Platform',
        'Sign in or create an account',
        'Click "Create new secret key"',
        'Copy and save your key (it won\'t be shown again)',
        'Add billing information if needed'
      ]
    },
  };

  const info = providerInfo[provider];

  return (
    <div className="mt-4 border border-border-glass rounded-lg overflow-hidden">
      <button
        className="w-full flex items-center gap-3 p-4 bg-bg-surface-hover border-none cursor-pointer text-sm font-medium text-text-primary transition-colors hover:bg-white/15"
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
      >
        <InfoIcon />
        <span className="flex-1 text-left">How to get your {info.name} API key</span>
        <span className={`text-xs transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>▼</span>
      </button>

      {isExpanded && (
        <div className="p-6 bg-bg-surface border-t border-border-glass animate-[slideDown_0.2s_ease-out]">
          <div className="mb-6 last:mb-0">
            <h4 className="mb-3 text-base font-semibold text-text-primary">Getting Started</h4>
            <ol className="m-0 pl-6 text-text-secondary leading-relaxed">
              {info.steps.map((step, index) => (
                <li key={index} className="mb-2">{step}</li>
              ))}
            </ol>
            <a
              href={info.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-3 text-primary no-underline font-medium transition-colors hover:text-primary-hover hover:underline"
            >
              Visit {info.name} Platform →
            </a>
          </div>

          <div className="mb-6 last:mb-0">
            <h4 className="mb-3 text-base font-semibold text-text-primary">Models Used</h4>
            <p className="m-0 text-text-secondary leading-relaxed">{info.models}</p>
          </div>

          {info.note && (
            <div className="mb-6 last:mb-0 p-4 bg-yellow-500/10 border-l-4 border-yellow-500 rounded text-text-secondary">
              <strong className="text-yellow-500">Note:</strong> {info.note}
            </div>
          )}

          <div className="mb-6 last:mb-0">
            <h4 className="mb-3 text-base font-semibold text-text-primary">Pricing</h4>
            <p className="m-0 text-text-secondary leading-relaxed">{info.pricing}</p>
          </div>

          <div className="mb-6 last:mb-0 p-4 bg-blue-500/10 border-l-4 border-blue-500 rounded">
            <h4 className="mb-3 text-base font-semibold text-text-primary">Security Notes</h4>
            <ul className="m-0 pl-5 text-text-secondary leading-relaxed">
              <li className="mb-1 text-sm">Keys are stored only in your browser session</li>
              <li className="mb-1 text-sm">Never saved to disk or cloud</li>
              <li className="mb-1 text-sm">Cleared when you close the tab</li>
              <li className="mb-1 text-sm">We recommend using API keys with spending limits</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
