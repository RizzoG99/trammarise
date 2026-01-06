export type ProcessingMode = 'balanced' | 'quality';

export interface ProcessingModeSelectorProps {
  value: ProcessingMode;
  onChange: (mode: ProcessingMode) => void;
}

export function ProcessingModeSelector({ value, onChange }: ProcessingModeSelectorProps) {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>
        Processing Mode
      </label>

      <div className="flex flex-col gap-3">
        {/* Balanced Mode */}
        <label
          className={`relative flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${
            value === 'balanced'
              ? 'bg-primary/5'
              : 'hover:bg-gray-100/30'
          }`}
          style={{
            borderColor: value === 'balanced' ? 'var(--color-primary)' : 'var(--color-border)',
          }}
        >
          <input
            type="radio"
            name="mode"
            value="balanced"
            checked={value === 'balanced'}
            onChange={(e) => onChange(e.target.value as ProcessingMode)}
            className="h-4 w-4 border-gray-300 focus:ring-2 focus:ring-offset-0"
            style={{
              accentColor: 'var(--color-primary)',
            }}
          />
          <div className="ml-3 flex-1">
            <div className="flex justify-between">
              <span className="block text-sm font-medium text-[var(--color-text-primary)]">
                Balanced
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium" style={{ backgroundColor: 'var(--color-primary-alpha-10)', color: 'var(--color-primary)' }}>
                ~10 credits
              </span>
            </div>
            <span className="block text-xs text-[var(--color-text-secondary)]">
              Standard accuracy, faster processing.
            </span>
          </div>
        </label>

        {/* Quality Mode */}
        <label
          className={`relative flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${
            value === 'quality'
              ? 'bg-primary/5'
              : 'hover:bg-gray-100/30'
          }`}
          style={{
            borderColor: value === 'quality' ? 'var(--color-primary)' : 'var(--color-border)',
          }}
        >
          <input
            type="radio"
            name="mode"
            value="quality"
            checked={value === 'quality'}
            onChange={(e) => onChange(e.target.value as ProcessingMode)}
            className="h-4 w-4 border-gray-300 focus:ring-2 focus:ring-offset-0"
            style={{
              accentColor: 'var(--color-primary)',
            }}
          />
          <div className="ml-3 flex-1">
            <div className="flex justify-between">
              <span className="block text-sm font-medium text-[var(--color-text-primary)]">
                Quality
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium" style={{ backgroundColor: 'rgba(168, 85, 247, 0.1)', color: '#a855f7' }}>
                ~25 credits
              </span>
            </div>
            <span className="block text-xs text-[var(--color-text-secondary)]">
              GPT-4 enhanced analysis & summary.
            </span>
          </div>
        </label>
      </div>
    </div>
  );
}
