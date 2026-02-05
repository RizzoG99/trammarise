import { Play, Copy, Check, Download } from 'lucide-react';
import { useState } from 'react';

interface HistoryQuickActionsProps {
  onPlay?: () => void;
  onCopySummary?: () => Promise<void>;
  onDownload?: () => void;
}

export function HistoryQuickActions({
  onPlay,
  onCopySummary,
  onDownload,
}: HistoryQuickActionsProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onCopySummary) {
      await onCopySummary();
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    onPlay?.();
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDownload?.();
  };

  return (
    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white/90 dark:bg-black/90 rounded-full px-2 py-1 shadow-sm backdrop-blur-sm border border-border/50">
      {onPlay && (
        <button
          onClick={handlePlay}
          className="p-1.5 rounded-full hover:bg-primary/10 text-text-secondary hover:text-primary transition-colors"
          title="Play Preview"
        >
          <Play className="w-4 h-4" />
        </button>
      )}

      {onCopySummary && (
        <button
          onClick={handleCopy}
          className="p-1.5 rounded-full hover:bg-primary/10 text-text-secondary hover:text-primary transition-colors"
          title="Copy Summary"
        >
          {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
        </button>
      )}

      {onDownload && (
        <button
          onClick={handleDownload}
          className="p-1.5 rounded-full hover:bg-primary/10 text-text-secondary hover:text-primary transition-colors"
          title="Download"
        >
          <Download className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
