import React, { useState, useEffect } from 'react';
import { ApiKeyInfo } from './ApiKeyInfo';
import { Button } from '../ui/Button';
import { validateApiKey } from '../../utils/api';
import { getApiConfig, saveApiConfig } from '../../utils/session-storage';
import type { AIConfiguration, ConfigMode } from '../../types/audio';
import { Input } from '../ui/Input';
import { SelectCard } from '../ui/SelectCard';
import { ToggleSwitch } from '../ui/ToggleSwitch';
import { CURATED_MODELS } from '../../constants/models';

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

const SIMPLE_MODELS = [
  { value: 'gpt-4o', label: 'Standard', description: 'Fast & cost-effective (GPT-4o)' },
  { value: 'o3-mini', label: 'High Performance', description: 'Advanced reasoning (GPT-o3 Mini)' },
];

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'it', label: 'Italian' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'pt', label: 'Portuguese' },
  { value: 'nl', label: 'Dutch' },
  { value: 'ja', label: 'Japanese' },
  { value: 'zh', label: 'Chinese' },
];

export const ConfigurationForm: React.FC<ConfigurationFormProps> = ({ onSubmit, onCancel }) => {
  const [mode, setMode] = useState<ConfigMode>('simple');
  const [contentType, setContentType] = useState('meeting');
  const [customContentType, setCustomContentType] = useState('');
  const [language, setLanguage] = useState('en');
  const [simpleModel, setSimpleModel] = useState('gpt-4o');
  const [advancedModel, setAdvancedModel] = useState(CURATED_MODELS[0].id);
  const [openaiKey, setOpenaiKey] = useState('');
  const [openrouterKey, setOpenrouterKey] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load saved config from session storage
  useEffect(() => {
    const saved = getApiConfig();
    if (saved) {
      setOpenaiKey(saved.openaiKey);
      if (saved.apiKey) {
        setOpenrouterKey(saved.apiKey);
      }
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

    if (!openaiKey.trim()) {
      newErrors.openaiKey = 'OpenAI API key is required';
    }

    if (mode === 'advanced') {
      if (!openrouterKey.trim()) {
        newErrors.openrouterKey = 'OpenRouter API key is required for Advanced mode';
      }
      if (!advancedModel) {
        newErrors.advancedModel = 'Please select a model';
      }
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
      // Validate OpenAI API key (always required)
      const isOpenAIValid = await validateApiKey('openai', openaiKey);
      if (!isOpenAIValid) {
        setErrors({ openaiKey: 'Invalid OpenAI API key. Please check and try again.' });
        setIsValidating(false);
        return;
      }

      // Validate OpenRouter key if in advanced mode
      if (mode === 'advanced') {
        const isOpenRouterValid = await validateApiKey('openrouter', openrouterKey);
        if (!isOpenRouterValid) {
          setErrors({ openrouterKey: 'Invalid OpenRouter API key. Please check and try again.' });
          setIsValidating(false);
          return;
        }
      }

      const finalContentType = contentType === 'other' ? customContentType : contentType;

      // Save to session storage
      if (mode === 'simple') {
        saveApiConfig('openai', openaiKey, openaiKey);
      } else {
        saveApiConfig('openrouter', openrouterKey, openaiKey);
      }

      // Submit configuration
      const config: AIConfiguration = {
        mode,
        provider: mode === 'simple' ? 'openai' : 'openrouter',
        model: mode === 'simple' ? simpleModel : advancedModel,
        openaiKey,
        openrouterKey: mode === 'advanced' ? openrouterKey : undefined,
        contentType: finalContentType,
        language,
      };

      onSubmit(config);
    } catch (error) {
      setErrors({ openaiKey: 'Failed to validate API keys. Please try again.' });
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <form className="w-full max-w-[600px] mx-auto" onSubmit={handleSubmit}>

      {/* Language Selection */}
      <div className="mb-8">
        <label className="block mb-3 font-semibold text-text-primary text-base">
          Audio Language
          <span className="text-accent-error ml-1">*</span>
        </label>
        <select
          className="w-full p-3 text-base border border-border-glass rounded-lg bg-bg-surface text-text-primary cursor-pointer transition-all hover:bg-bg-surface-hover hover:border-primary-light/30 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
        >
          {LANGUAGES.map((lang) => (
            <option key={lang.value} value={lang.value} className="bg-[#1a1a1a] text-white p-2">
              {lang.label}
            </option>
          ))}
        </select>
      </div>

      {/* Content Type */}
      <div className="mb-8">
        <label className="block mb-3 font-semibold text-text-primary text-base">
          Content Type
          <span className="text-accent-error ml-1">*</span>
        </label>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-3">
          {CONTENT_TYPES.map((type) => (
            <SelectCard
              key={type.value}
              value={type.value}
              label={type.label}
              icon={type.icon}
              selected={contentType === type.value}
              onClick={() => setContentType(type.value)}
            />
          ))}
        </div>
        {errors.contentType && <span className="block mt-2 text-accent-error text-sm">{errors.contentType}</span>}

        {contentType === 'other' && (
          <div className="mt-3 animate-[slideDown_0.2s_ease-out]">
            <Input
              placeholder="e.g., Data Science Lesson"
              value={customContentType}
              onChange={(e) => setCustomContentType(e.target.value)}
              error={errors.customContentType}
              fullWidth
            />
          </div>
        )}
      </div>

       {/* Mode Toggle */}
      <div className="mb-8">
        <ToggleSwitch
          label="Advanced mode"
          checked={mode === 'advanced'}
          onChange={(checked) => setMode(checked ? 'advanced' : 'simple')}
        />
      </div>

      {/* Simple Mode */}
      {mode === 'simple' && (
        <>
          <div className="mb-8">
            <label className="block mb-3 font-semibold text-text-primary text-base">
              Performance Level
              <span className="text-accent-error ml-1">*</span>
            </label>
            <div className="flex flex-col gap-3">
              {SIMPLE_MODELS.map((model) => (
                <label key={model.value} className="flex items-start gap-3 p-4 bg-bg-surface border-2 border-border-glass rounded-lg cursor-pointer transition-all hover:bg-white/10 hover:border-primary-light/30 has-[:checked]:border-primary has-[:checked]:bg-primary/10 has-[:checked]:shadow-[0_0_0_2px_rgba(139,92,246,0.2)]">
                  <input
                    type="radio"
                    name="simpleModel"
                    value={model.value}
                    checked={simpleModel === model.value}
                    onChange={(e) => setSimpleModel(e.target.value)}
                    className="mt-1 cursor-pointer w-[18px] h-[18px] flex-shrink-0 accent-primary"
                  />
                  <div className="flex flex-col gap-1 flex-1">
                    <strong className="text-base text-text-primary">{model.label}</strong>
                    <span className="text-sm text-text-secondary">{model.description}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="mb-8">
            <Input
              id="openai-key-simple"
              type="password"
              label="OpenAI API Key"
              placeholder="sk-..."
              value={openaiKey}
              onChange={(e) => setOpenaiKey(e.target.value)}
              error={errors.openaiKey}
              hint="Used for both transcription (Whisper) and summarization"
              required
              fullWidth
            />
          </div>

          <div className="p-4 bg-primary/10 border border-primary/30 rounded-lg mt-4">
            <strong className="block mb-2 text-text-primary">ℹ️ What's included:</strong>
            <ul className="m-0 pl-6 text-text-secondary">
              <li className="my-1 text-sm">Whisper transcription (industry-leading accuracy)</li>
              <li className="my-1 text-sm">{simpleModel === 'gpt-4o' ? 'GPT-4o' : 'GPT-o3 Mini'} summarization</li>
              <li className="my-1 text-sm">Single API key for simplicity</li>
            </ul>
          </div>

          <ApiKeyInfo provider="openai" />
        </>
      )}

      {/* Advanced Mode */}
      {mode === 'advanced' && (
        <>
          <div className="mb-8">
            <label className="block mb-3 font-semibold text-text-primary text-base">
              AI Model
              <span className="text-accent-error ml-1">*</span>
            </label>
            <select
              className="w-full p-3 text-base border border-border-glass rounded-lg bg-bg-surface text-text-primary cursor-pointer transition-all hover:bg-bg-surface-hover hover:border-primary-light/30 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              value={advancedModel}
              onChange={(e) => setAdvancedModel(e.target.value)}
            >
              {CURATED_MODELS.map((m) => (
                <option key={m.id} value={m.id} className="bg-[#1a1a1a] text-white p-2">
                  {m.name} - {m.provider} ({m.description})
                </option>
              ))}
            </select>
            {errors.advancedModel && <span className="block mt-2 text-accent-error text-sm">{errors.advancedModel}</span>}
          </div>

          <div className="mb-8">
            <Input
              id="openai-key-advanced"
              type="password"
              label="OpenAI API Key (for Whisper transcription)"
              placeholder="sk-..."
              value={openaiKey}
              onChange={(e) => setOpenaiKey(e.target.value)}
              error={errors.openaiKey}
              hint="Used only for audio transcription"
              required
              fullWidth
            />
          </div>

          <div className="mb-8">
            <Input
              id="openrouter-key"
              type="password"
              label="OpenRouter API Key (for summarization)"
              placeholder="sk-or-..."
              value={openrouterKey}
              onChange={(e) => setOpenrouterKey(e.target.value)}
              error={errors.openrouterKey}
              hint="Access to 100+ AI models through one key"
              required
              fullWidth
            />
          </div>

          <ApiKeyInfo provider="openrouter" />
        </>
      )}

      <div className="flex gap-4 mt-8 pt-8 border-t border-border-glass flex-col-reverse sm:flex-row">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isValidating} className="w-full sm:w-auto flex-1">
          Back
        </Button>
        <Button type="submit" variant="primary" disabled={isValidating} className="w-full sm:w-auto flex-1">
          {isValidating ? 'Validating...' : 'Validate & Continue'}
        </Button>
      </div>
    </form>
  );
};
