import { useTranslation } from 'react-i18next';

export type ProcessingMode = 'balanced' | 'quality';

export interface ProcessingModeSelectorProps {
  value: ProcessingMode;
  onChange: (mode: ProcessingMode) => void;
  disabled?: boolean; // Disable mode selection
}

export function ProcessingModeSelector({ value, onChange, disabled }: ProcessingModeSelectorProps) {
  const { t } = useTranslation();
  // Note: Both modes support audio up to ~23 minutes (1400s) per chunk
  // Audio files longer than this will be automatically chunked during processing

  return (
    <div className="space-y-3">
      <label
        className="block text-sm font-semibold mb-1"
        style={{ color: 'var(--color-text-primary)' }}
      >
        {t('configuration.processingMode.title')}
      </label>

      <div className="flex flex-col gap-3">
        {/* Balanced Mode */}
        <label
          className={`relative flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${
            disabled
              ? 'opacity-50 cursor-not-allowed bg-gray-100/10'
              : value === 'balanced'
                ? 'bg-primary/5'
                : 'hover:bg-gray-100/30'
          }`}
          style={{
            borderColor:
              value === 'balanced' && !disabled ? 'var(--color-primary)' : 'var(--color-border)',
          }}
        >
          <input
            type="radio"
            name="mode"
            value="balanced"
            checked={value === 'balanced'}
            onChange={(e) => !disabled && onChange(e.target.value as ProcessingMode)}
            disabled={disabled}
            className="h-4 w-4 border-gray-300 focus:ring-2 focus:ring-offset-0 disabled:cursor-not-allowed"
            style={{
              accentColor: 'var(--color-primary)',
            }}
          />
          <div className="ml-3 flex-1">
            <div className="flex justify-between">
              <span
                className={`block text-sm font-medium ${disabled ? 'text-gray-400' : 'text-[var(--color-text-primary)]'}`}
              >
                {t('configuration.processingMode.balanced.title')}
              </span>
              <span
                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                style={{
                  backgroundColor: 'var(--color-primary-alpha-10)',
                  color: 'var(--color-primary)',
                }}
              >
                {t('configuration.processingMode.balanced.credits')}
              </span>
            </div>
            <span
              className={`block text-xs ${disabled ? 'text-gray-400' : 'text-[var(--color-text-secondary)]'}`}
            >
              {t('configuration.processingMode.balanced.description')}
            </span>
          </div>
        </label>

        {/* Quality Mode */}
        <label
          className={`relative flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${
            disabled
              ? 'opacity-50 cursor-not-allowed bg-gray-100/10'
              : value === 'quality'
                ? 'bg-primary/5'
                : 'hover:bg-gray-100/30'
          }`}
          style={{
            borderColor:
              value === 'quality' && !disabled ? 'var(--color-primary)' : 'var(--color-border)',
          }}
        >
          <input
            type="radio"
            name="mode"
            value="quality"
            checked={value === 'quality'}
            onChange={(e) => !disabled && onChange(e.target.value as ProcessingMode)}
            disabled={disabled}
            className="h-4 w-4 border-gray-300 focus:ring-2 focus:ring-offset-0 disabled:cursor-not-allowed"
            style={{
              accentColor: 'var(--color-primary)',
            }}
          />
          <div className="ml-3 flex-1">
            <div className="flex justify-between">
              <span
                className={`block text-sm font-medium ${disabled ? 'text-gray-400' : 'text-[var(--color-text-primary)]'}`}
              >
                {t('configuration.processingMode.quality.title')}
              </span>
              <span
                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                style={{ backgroundColor: 'rgba(168, 85, 247, 0.1)', color: '#a855f7' }}
              >
                {t('configuration.processingMode.quality.credits')}
              </span>
            </div>
            <span
              className={`block text-xs ${disabled ? 'text-gray-400' : 'text-[var(--color-text-secondary)]'}`}
            >
              {t('configuration.processingMode.quality.description')}
            </span>
          </div>
        </label>
      </div>
    </div>
  );
}
