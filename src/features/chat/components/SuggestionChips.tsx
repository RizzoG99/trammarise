import { Sparkles, ListChecks, FileText } from 'lucide-react';

export interface SuggestionChipsProps {
  onSuggestionClick: (suggestion: string) => void;
  disabled?: boolean;
}

const SUGGESTIONS = [
  { text: 'Summarize in bullets', icon: ListChecks },
  { text: 'Extract action items', icon: FileText },
  { text: 'Fix grammar', icon: Sparkles },
];

export function SuggestionChips({ onSuggestionClick, disabled = false }: SuggestionChipsProps) {
  return (
    <div className="flex flex-wrap gap-2 p-4 border-b border-border">
      {SUGGESTIONS.map((suggestion) => {
        const Icon = suggestion.icon;
        return (
          <button
            key={suggestion.text}
            onClick={() => onSuggestionClick(suggestion.text)}
            disabled={disabled}
            className={`
              inline-flex items-center gap-2 px-3 py-1.5 rounded-full
              bg-[var(--color-bg-surface)] border border-border
              text-sm text-text-secondary
              hover:bg-[var(--color-primary-alpha-10)] hover:border-primary hover:text-primary
              transition-all duration-[var(--transition-fast)]
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
          >
            <Icon className="w-3.5 h-3.5" />
            {suggestion.text}
          </button>
        );
      })}
    </div>
  );
}
