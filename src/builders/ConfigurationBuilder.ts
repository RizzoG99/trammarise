import type { AIConfiguration, AIProvider, ConfigMode } from '../types/audio';

/**
 * Validation errors for configuration building
 */
export class ConfigurationValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConfigurationValidationError';
  }
}

/**
 * Builder for creating AIConfiguration objects with validation
 * Provides a fluent interface for constructing complex configuration objects
 */
export class ConfigurationBuilder {
  private config: Partial<AIConfiguration> = {
    mode: 'simple', // Default mode
    contentType: 'other', // Default content type
    language: 'en', // Default language
  };

  /**
   * Set the configuration mode
   */
  withMode(mode: ConfigMode): this {
    this.config.mode = mode;
    return this;
  }

  /**
   * Set the AI provider
   */
  withProvider(provider: AIProvider): this {
    this.config.provider = provider;
    return this;
  }

  /**
   * Set the model to use
   */
  withModel(model: string): this {
    if (!model || model.trim() === '') {
      throw new ConfigurationValidationError('Model cannot be empty');
    }
    this.config.model = model.trim();
    return this;
  }

  /**
   * Set the OpenAI API key (required for all configurations)
   */
  withOpenAIKey(key: string): this {
    if (!key || key.trim() === '') {
      throw new ConfigurationValidationError('OpenAI API key cannot be empty');
    }
    this.config.openaiKey = key.trim();
    return this;
  }

  /**
   * Set the OpenRouter API key (required for advanced mode)
   */
  withOpenRouterKey(key: string): this {
    if (!key || key.trim() === '') {
      throw new ConfigurationValidationError('OpenRouter API key cannot be empty');
    }
    this.config.openrouterKey = key.trim();
    return this;
  }

  /**
   * Set the content type
   */
  withContentType(contentType: string): this {
    if (!contentType || contentType.trim() === '') {
      throw new ConfigurationValidationError('Content type cannot be empty');
    }
    this.config.contentType = contentType.trim().toLowerCase();
    return this;
  }

  /**
   * Set the language
   */
  withLanguage(language: string): this {
    if (!language || language.trim() === '') {
      throw new ConfigurationValidationError('Language cannot be empty');
    }
    this.config.language = language.trim();
    return this;
  }

  /**
   * Set context files for additional context
   */
  withContextFiles(files: File[]): this {
    this.config.contextFiles = files;
    return this;
  }

  /**
   * Add a single context file
   */
  addContextFile(file: File): this {
    if (!this.config.contextFiles) {
      this.config.contextFiles = [];
    }
    this.config.contextFiles.push(file);
    return this;
  }

  /**
   * Create a simple mode configuration
   */
  asSimpleMode(provider: AIProvider, model: string, openaiKey: string): this {
    this.config.mode = 'simple';
    this.config.provider = provider;
    this.config.model = model;
    this.config.openaiKey = openaiKey;
    return this;
  }

  /**
   * Create an advanced mode configuration
   */
  asAdvancedMode(model: string, openaiKey: string, openrouterKey: string): this {
    this.config.mode = 'advanced';
    this.config.provider = 'openrouter';
    this.config.model = model;
    this.config.openaiKey = openaiKey;
    this.config.openrouterKey = openrouterKey;
    return this;
  }

  /**
   * Validate the current configuration
   */
  private validate(): void {
    const errors: string[] = [];

    // Check required fields
    if (!this.config.mode) {
      errors.push('Mode is required');
    }

    if (!this.config.provider) {
      errors.push('Provider is required');
    }

    if (!this.config.model) {
      errors.push('Model is required');
    }

    if (!this.config.openaiKey) {
      errors.push('OpenAI API key is required (for Whisper transcription)');
    }

    if (!this.config.contentType) {
      errors.push('Content type is required');
    }

    if (!this.config.language) {
      errors.push('Language is required');
    }

    // Advanced mode specific validation
    if (this.config.mode === 'advanced') {
      if (this.config.provider !== 'openrouter') {
        errors.push('Advanced mode requires OpenRouter provider');
      }
      if (!this.config.openrouterKey) {
        errors.push('OpenRouter API key is required for advanced mode');
      }
    }

    // Simple mode specific validation
    if (this.config.mode === 'simple') {
      if (!['openai', 'openrouter'].includes(this.config.provider || '')) {
        errors.push('Simple mode requires OpenAI or OpenRouter provider');
      }
    }

    if (errors.length > 0) {
      throw new ConfigurationValidationError(
        `Configuration validation failed:\n${errors.map(e => `  - ${e}`).join('\n')}`
      );
    }
  }

  /**
   * Build and return the validated AIConfiguration
   */
  build(): AIConfiguration {
    this.validate();
    return this.config as AIConfiguration;
  }

  /**
   * Reset the builder to start fresh
   */
  reset(): this {
    this.config = {
      mode: 'simple',
      contentType: 'other',
      language: 'en',
    };
    return this;
  }

  /**
   * Create a copy of the current configuration
   */
  clone(): ConfigurationBuilder {
    const builder = new ConfigurationBuilder();
    builder.config = { ...this.config };
    if (this.config.contextFiles) {
      builder.config.contextFiles = [...this.config.contextFiles];
    }
    return builder;
  }

  /**
   * Create a builder from an existing configuration
   */
  static fromConfiguration(config: AIConfiguration): ConfigurationBuilder {
    const builder = new ConfigurationBuilder();
    builder.config = { ...config };
    if (config.contextFiles) {
      builder.config.contextFiles = [...config.contextFiles];
    }
    return builder;
  }
}

/**
 * Helper function to create a new configuration builder
 */
export function createConfigurationBuilder(): ConfigurationBuilder {
  return new ConfigurationBuilder();
}
