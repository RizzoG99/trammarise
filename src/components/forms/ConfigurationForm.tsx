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
  const [contextFiles, setContextFiles] = useState<File[]>([]);

  const handleContextFiles = (files: File[]) => {
    const validFiles: File[] = [];
    let totalSize = contextFiles.reduce((acc, f) => acc + f.size, 0);
    const MAX_TOTAL_SIZE = 4.5 * 1024 * 1024; // 4.5MB limit (Vercel serverless limit)

    for (const file of files) {
      // Validate type
      if (!file.type.startsWith('image/') && file.type !== 'application/pdf' && file.type !== 'text/plain') {
        setErrors(prev => ({ ...prev, contextFiles: 'Only images, PDF, and TXT files are allowed' }));
        return;
      }

      // Validate size
      if (totalSize + file.size > MAX_TOTAL_SIZE) {
        setErrors(prev => ({ ...prev, contextFiles: 'Total file size cannot exceed 4.5MB' }));
        return;
      }

      totalSize += file.size;
      validFiles.push(file);
    }

    setContextFiles(prev => [...prev, ...validFiles]);
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.contextFiles;
      return newErrors;
    });
  };

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
        contextFiles,
      };

      onSubmit(config);
    } catch (error) {
      setErrors({ openaiKey: 'Failed to validate API keys. Please try again.' });
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <form className="w-full max-w-[600px] mx-auto" onSubmit={handleSubmit} noValidate>

      {/* Language Selection */}
      <div className="mb-8">
        <label className="block mb-3 font-semibold text-slate-900 dark:text-white text-base">
          Audio Language
          <span className="text-red-500 ml-1">*</span>
        </label>
        <select
          className="w-full p-3 text-base border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white cursor-pointer transition-all hover:border-indigo-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
        >
          {LANGUAGES.map((lang) => (
            <option key={lang.value} value={lang.value} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white p-2">
              {lang.label}
            </option>
          ))}
        </select>
      </div>

      {/* Content Type */}
      <div className="mb-8">
        <label className="block mb-3 font-semibold text-slate-900 dark:text-white text-base">
          Content Type
          <span className="text-red-500 ml-1">*</span>
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
        {errors.contentType && <span className="block mt-2 text-red-500 text-sm">{errors.contentType}</span>}

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
            <label className="block mb-3 font-semibold text-slate-900 dark:text-white text-base">
              Performance Level
              <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="flex flex-col gap-3">
              {SIMPLE_MODELS.map((model) => (
                <label key={model.value} className="flex items-start gap-3 p-4 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-lg cursor-pointer transition-all hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-indigo-300 has-[:checked]:border-indigo-600 has-[:checked]:bg-indigo-50 dark:has-[:checked]:bg-indigo-900/20 has-[:checked]:shadow-sm">
                  <input
                    type="radio"
                    name="simpleModel"
                    value={model.value}
                    checked={simpleModel === model.value}
                    onChange={(e) => setSimpleModel(e.target.value)}
                    className="mt-1 cursor-pointer w-[18px] h-[18px] flex-shrink-0 accent-indigo-600"
                  />
                  <div className="flex flex-col gap-1 flex-1">
                    <strong className="text-base text-slate-900 dark:text-white">{model.label}</strong>
                    <span className="text-sm text-slate-600 dark:text-slate-400">{model.description}</span>
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

          <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg mt-4">
            <strong className="block mb-2 text-indigo-900 dark:text-indigo-100">ℹ️ What's included:</strong>
            <ul className="m-0 pl-6 text-indigo-800 dark:text-indigo-200">
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
            <label className="block mb-3 font-semibold text-slate-900 dark:text-white text-base">
              AI Model
              <span className="text-red-500 ml-1">*</span>
            </label>
            <select
              className="w-full p-3 text-base border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white cursor-pointer transition-all hover:border-indigo-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20"
              value={advancedModel}
              onChange={(e) => setAdvancedModel(e.target.value)}
            >
              {CURATED_MODELS.map((m) => (
                <option key={m.id} value={m.id} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white p-2">
                  {m.name} - {m.provider} ({m.description})
                </option>
              ))}
            </select>
            {errors.advancedModel && <span className="block mt-2 text-red-500 text-sm">{errors.advancedModel}</span>}
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

      {/* Context Files Upload */}
      <div className="mb-8">
        <label className="block mb-3 font-semibold text-slate-900 dark:text-white text-base">
          Context Files (Optional)
          <span className="ml-2 text-xs font-normal text-slate-500 dark:text-slate-400">
            Images, PDF, or TXT (Max 4.5MB total)
          </span>
        </label>
        
        <div 
          className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-6 text-center transition-colors hover:border-indigo-400 dark:hover:border-indigo-500 bg-slate-50 dark:bg-slate-800/50 cursor-pointer"
          onClick={() => document.getElementById('context-file-upload')?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const files = Array.from(e.dataTransfer.files);
            handleContextFiles(files);
          }}
        >
          <input
            id="context-file-upload"
            type="file"
            multiple
            accept="image/*,.pdf,.txt"
            className="hidden"
            onChange={(e) => {
              if (e.target.files) {
                handleContextFiles(Array.from(e.target.files));
              }
            }}
          />
          <div className="flex flex-col items-center gap-2">
            <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Click or drag files here to upload
            </p>
          </div>
        </div>

        {contextFiles.length > 0 && (
          <div className="mt-4 space-y-2">
            {contextFiles.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg animate-[fadeIn_0.2s_ease-out]">
                <div className="flex items-center gap-3 overflow-hidden">
                  <span className="text-xl">
                    {file.type.startsWith('image/') ? '🖼️' : file.type === 'application/pdf' ? '📄' : '📝'}
                  </span>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-medium text-slate-900 dark:text-white truncate">{file.name}</span>
                    <span className="text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setContextFiles(prev => prev.filter((_, i) => i !== index))}
                  className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                  aria-label="Remove file"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
        {errors.contextFiles && <span className="block mt-2 text-red-500 text-sm">{errors.contextFiles}</span>}
      </div>

      <div className="flex gap-4 mt-8 pt-8 border-t border-slate-200 dark:border-slate-700 flex-col-reverse sm:flex-row">
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
