import { GlassCard, Heading, Text } from '../../../lib';
import ReactMarkdown from 'react-markdown';
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
        <div className="prose prose-sm dark:prose-invert max-w-none">
          {structuredSummary ? (
            // Phase 4: Structured summary (not yet implemented)
            <div>
              <Text variant="body" color="secondary">
                {t('results.summary.phase4Placeholder')}
              </Text>
            </div>
          ) : (
            // Phase 1: Markdown rendering
            <ReactMarkdown>{summary}</ReactMarkdown>
          )}
        </div>
      </div>
    </GlassCard>
  );
}
