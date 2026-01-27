import { GlassCard, Heading, Text } from '../../../lib';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useTranslation } from 'react-i18next';

/**
 * Props for SummaryPanel component
 */
interface SummaryPanelProps {
  /** Summary markdown content */
  summary: string;
  /** Optional: Structured summary (Phase 4) */
  structuredSummary?: {
    executive: string;
    takeaways: Array<{
      id: string;
      title: string;
      description: string;
      priority?: 'high' | 'medium' | 'low';
    }>;
  };
}

/**
 * Summary Panel component for Results Page.
 *
 * **Phase 1**: Basic markdown rendering
 * **Phase 4**: Structured summary with:
 * - Executive Summary card
 * - Numbered Key Takeaways accordion
 * - Priority badges (high/medium/low)
 *
 * Left panel (40% width) in split layout.
 */
export function SummaryPanel({ summary, structuredSummary }: SummaryPanelProps) {
  const { t } = useTranslation();
  return (
    <GlassCard variant="light">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <Heading level="h3" className="font-semibold">
            {t('results.summary.title')}
          </Heading>
          <button
            className="text-sm text-[var(--color-primary)] hover:underline"
            onClick={() => navigator.clipboard.writeText(summary)}
            aria-label={t('results.summary.copyAll')}
          >
            {t('results.summary.copyAll')}
          </button>
        </div>

        {/* Content */}
        <div className="prose prose-sm dark:prose-invert max-w-none markdown-tables">
          {structuredSummary ? (
            // Phase 4: Structured summary (not yet implemented)
            <div>
              <Text variant="body" color="secondary">
                {t('results.summary.phase4Placeholder')}
              </Text>
            </div>
          ) : (
            // Phase 1: Markdown rendering with GitHub Flavored Markdown support
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{summary}</ReactMarkdown>
          )}
        </div>

        <style>{`
          .markdown-tables table {
            width: 100%;
            border-collapse: collapse;
            margin: 1rem 0;
          }

          .markdown-tables th,
          .markdown-tables td {
            border: 1px solid var(--color-border, #e5e7eb);
            padding: 0.5rem 0.75rem;
            text-align: left;
          }

          .markdown-tables th {
            background-color: var(--color-background-secondary, #f9fafb);
            font-weight: 600;
          }

          .dark .markdown-tables th {
            background-color: var(--color-background-tertiary, #1f2937);
          }

          .dark .markdown-tables th,
          .dark .markdown-tables td {
            border-color: var(--color-border, #374151);
          }
        `}</style>
      </div>
    </GlassCard>
  );
}
