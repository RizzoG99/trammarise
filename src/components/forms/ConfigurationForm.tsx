import React, { useState, useEffect } from 'react';
import { ApiKeyInfo } from './ApiKeyInfo';
import { Button } from '../ui/Button';
import { validateApiKey } from '../../utils/api';
import { getApiConfig, saveApiConfig } from '../../utils/session-storage';
import type { AIProvider, AIConfiguration } from '../../types/audio';
import './ConfigurationForm.css';

interface ConfigurationFormProps {
  onSubmit: (config: AIConfiguration) => void;
  onCancel: () => void;
}

interface PredefinedContentType {
  value: string;
  label: string;
  icon: string;
}

const CONTENT_TYPES: PredefinedContentType[] = [
  { value: 'meeting', label: 'Meeting Notes', icon: '📝' },
  { value: 'lecture', label: 'Lecture/Class', icon: '🎓' },
  { value: 'interview', label: 'Interview', icon: '🎤' },
  { value: 'podcast', label: 'Podcast Episode', icon: '🎙️' },
  { value: 'voice-memo', label: 'Voice Memo', icon: '🗣️' },
  { value: 'other', label: 'Other (specify)', icon: '✏️' },
];

export const ConfigurationForm: React.FC<ConfigurationFormProps> = ({ onSubmit, onCancel }) => {
  const [contentType, setContentType] = useState('meeting');
  const [customContentType, setCustomContentType] = useState('');
  const [provider, setProvider] = useState<AIProvider>('openai');
  const [apiKey, setApiKey] = useState('');
  const [openaiKey, setOpenaiKey] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load saved config from session storage
  useEffect(() => {
    const saved = getApiConfig();
    if (saved) {
      setProvider(saved.provider as AIProvider);
      setApiKey(saved.apiKey);
      setOpenaiKey(saved.openaiKey);
    }
  }, []);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!contentType) {
      newErrors.contentType = 'Please select a content type';
    }

    if (contentType === 'other' && !customContentType.trim()) {
      newErrors.customContentType = 'Please specify the content type';
    }

    if (!provider) {
      newErrors.provider = 'Please select an AI provider';
    }

    if (!apiKey.trim()) {
      newErrors.apiKey = 'API key is required';
    }

    if (provider !== 'openai' && !openaiKey.trim()) {
      newErrors.openaiKey = 'OpenAI API key is required for transcription';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsValidating(true);
    setErrors({});

    try {
      // Validate the selected provider's API key
      const isValid = await validateApiKey(provider, apiKey);

      if (!isValid) {
        setErrors({ apiKey: 'Invalid API key. Please check and try again.' });
        setIsValidating(false);
        return;
      }

      // If using Claude or Deepseek, also validate OpenAI key for transcription
      if (provider !== 'openai') {
        const isOpenAIValid = await validateApiKey('openai', openaiKey);
        if (!isOpenAIValid) {
          setErrors({ openaiKey: 'Invalid OpenAI API key. Required for transcription.' });
          setIsValidating(false);
          return;
        }
      }

      const finalContentType = contentType === 'other' ? customContentType : contentType;
      const finalOpenAIKey = provider === 'openai' ? apiKey : openaiKey;

      // Save to session storage
      saveApiConfig(provider, apiKey, finalOpenAIKey);

      // Submit configuration
      onSubmit({
        provider,
        apiKey,
        openaiKey: finalOpenAIKey,
        contentType: finalContentType,
      });
    } catch (error) {
      setErrors({ apiKey: 'Failed to validate API key. Please try again.' });
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <form className="configuration-form" onSubmit={handleSubmit}>
      <div className="form-section">
        <label className="form-label">
          Content Type
          <span className="required">*</span>
        </label>
        <div className="content-type-grid">
          {CONTENT_TYPES.map((type) => (
            <button
              key={type.value}
              type="button"
              className={`content-type-button ${contentType === type.value ? 'selected' : ''}`}
              onClick={() => setContentType(type.value)}
            >
              <span className="content-type-icon">{type.icon}</span>
              <span className="content-type-label">{type.label}</span>
            </button>
          ))}
        </div>
        {errors.contentType && <span className="error-message">{errors.contentType}</span>}

        {contentType === 'other' && (
          <div className="custom-content-type">
            <input
              type="text"
              className="form-input"
              placeholder="e.g., Data Science Lesson"
              value={customContentType}
              onChange={(e) => setCustomContentType(e.target.value)}
            />
            {errors.customContentType && <span className="error-message">{errors.customContentType}</span>}
          </div>
        )}
      </div>

      <div className="form-section">
        <label className="form-label">
          AI Provider
          <span className="required">*</span>
        </label>
        <div className="provider-options">
          <label className="provider-option">
            <input
              type="radio"
              name="provider"
              value="openai"
              checked={provider === 'openai'}
              onChange={(e) => setProvider(e.target.value as AIProvider)}
            />
            <span className="provider-label">
              <strong>ChatGPT</strong> (OpenAI)
              <span className="provider-note">All-in-one: transcription + summarization</span>
            </span>
          </label>

          <label className="provider-option">
            <input
              type="radio"
              name="provider"
              value="claude"
              checked={provider === 'claude'}
              onChange={(e) => setProvider(e.target.value as AIProvider)}
            />
            <span className="provider-label">
              <strong>Claude</strong> (Anthropic)
              <span className="provider-note">Requires OpenAI key for transcription</span>
            </span>
          </label>

          <label className="provider-option">
            <input
              type="radio"
              name="provider"
              value="deepseek"
              checked={provider === 'deepseek'}
              onChange={(e) => setProvider(e.target.value as AIProvider)}
            />
            <span className="provider-label">
              <strong>Deepseek</strong>
              <span className="provider-note">Lower cost - Requires OpenAI key for transcription</span>
            </span>
          </label>
        </div>
        {errors.provider && <span className="error-message">{errors.provider}</span>}
      </div>

      {provider !== 'openai' && (
        <div className="form-section">
          <label className="form-label" htmlFor="openai-key">
            OpenAI API Key (for transcription)
            <span className="required">*</span>
          </label>
          <input
            id="openai-key"
            type="password"
            className={`form-input ${errors.openaiKey ? 'error' : ''}`}
            placeholder="sk-..."
            value={openaiKey}
            onChange={(e) => setOpenaiKey(e.target.value)}
          />
          {errors.openaiKey && <span className="error-message">{errors.openaiKey}</span>}
        </div>
      )}

      <div className="form-section">
        <label className="form-label" htmlFor="api-key">
          {provider === 'openai' ? 'OpenAI' : provider === 'claude' ? 'Claude' : 'Deepseek'} API Key
          <span className="required">*</span>
        </label>
        <input
          id="api-key"
          type="password"
          className={`form-input ${errors.apiKey ? 'error' : ''}`}
          placeholder={provider === 'openai' ? 'sk-...' : provider === 'claude' ? 'sk-ant-...' : 'sk-...'}
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
        />
        {errors.apiKey && <span className="error-message">{errors.apiKey}</span>}
        <p className="field-hint">
          Your API key is only stored in your browser session and cleared when you close the tab.
        </p>
      </div>

      <ApiKeyInfo provider={provider} />

      <div className="form-actions">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isValidating}>
          Back
        </Button>
        <Button type="submit" variant="primary" disabled={isValidating}>
          {isValidating ? 'Validating...' : 'Validate & Continue'}
        </Button>
      </div>
    </form>
  );
};
