import { Copy, Check, Download } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface HistoryQuickActionsProps {
  onCopySummary?: () => Promise<void>;
  onDownload?: () => void;
}

export function HistoryQuickActions({ onCopySummary, onDownload }: HistoryQuickActionsProps) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const [copying, setCopying] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onCopySummary && !copying) {
      setCopying(true);
      await onCopySummary();
      setCopied(true);
      setCopying(false);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDownload?.();
  };

  return (
    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-bg-surface/80 rounded-full px-2 py-1 backdrop-blur-sm border border-border/50">
      {onCopySummary && (
        <button
          onClick={handleCopy}
          disabled={copying}
          className="p-1.5 rounded-full hover:bg-primary/10 text-text-secondary hover:text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title={t('history.quickActions.copy')}
        >
          {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
        </button>
      )}

      {onDownload && (
        <button
          onClick={handleDownload}
          className="p-1.5 rounded-full hover:bg-primary/10 text-text-secondary hover:text-primary transition-colors"
          title={t('history.quickActions.download')}
        >
          <Download className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
