import { Sparkles } from 'lucide-react';

export interface ProcessAudioButtonProps {
  disabled: boolean;
  onProcess: () => void;
}

export function ProcessAudioButton({ disabled, onProcess }: ProcessAudioButtonProps) {
  return (
    <div className="mt-8 flex justify-end">
      <button
        onClick={onProcess}
        disabled={disabled}
        className="w-full sm:w-auto flex items-center justify-center gap-2
                   text-white font-bold py-4 px-10 rounded-xl shadow-lg
                   hover:shadow-xl transition-all disabled:opacity-50
                   disabled:cursor-not-allowed cursor-pointer group"
        style={{
          backgroundColor: disabled ? 'var(--color-text-tertiary)' : 'var(--color-primary)',
        }}
        onMouseEnter={(e) => {
          if (!disabled) {
            e.currentTarget.style.backgroundColor = 'var(--color-primary-hover)';
          }
        }}
        onMouseLeave={(e) => {
          if (!disabled) {
            e.currentTarget.style.backgroundColor = 'var(--color-primary)';
          }
        }}
      >
        Process Audio
        <Sparkles className="group-hover:animate-bounce" size={20} />
      </button>
    </div>
  );
}
