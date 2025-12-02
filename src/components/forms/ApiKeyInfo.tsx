import React, { useState } from 'react';
import type { AIProvider } from '../../types/audio';
import './ApiKeyInfo.css';

interface ApiKeyInfoProps {
  provider: AIProvider;
}

const InfoIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 16v-4M12 8h.01" />
  </svg>
);

export const ApiKeyInfo: React.FC<ApiKeyInfoProps> = ({ provider }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const providerInfo = {
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
    <div className="api-key-info">
      <button
        className="info-toggle"
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
      >
        <InfoIcon />
        <span>How to get your {info.name} API key</span>
        <span className={`arrow ${isExpanded ? 'expanded' : ''}`}>▼</span>
      </button>

      {isExpanded && (
        <div className="info-content">
          <div className="info-section">
            <h4>Getting Started</h4>
            <ol>
              {info.steps.map((step, index) => (
                <li key={index}>{step}</li>
              ))}
            </ol>
            <a
              href={info.url}
              target="_blank"
              rel="noopener noreferrer"
              className="info-link"
            >
              Visit {info.name} Platform →
            </a>
          </div>

          <div className="info-section">
            <h4>Models Used</h4>
            <p>{info.models}</p>
          </div>

          {info.note && (
            <div className="info-section note">
              <strong>Note:</strong> {info.note}
            </div>
          )}

          <div className="info-section">
            <h4>Pricing</h4>
            <p>{info.pricing}</p>
          </div>

          <div className="info-section security">
            <h4>Security Notes</h4>
            <ul>
              <li>Keys are stored only in your browser session</li>
              <li>Never saved to disk or cloud</li>
              <li>Cleared when you close the tab</li>
              <li>We recommend using API keys with spending limits</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
