import { GlassCard, Heading, Text } from '../../../lib';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useTranslation } from 'react-i18next';

interface SummaryPanelProps {
  summary: string;
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

export function SummaryPanel({ summary, structuredSummary }: SummaryPanelProps) {
  const { t } = useTranslation();

  // Clean XML tags and trailing horizontal rules added as AI padding
  const cleanSummary = summary
    .replace(/<summary\b[^>]*>|<\/summary>/gi, '')
    .replace(/\n---\s*$/, '')
    .replace(/\n\*\*\*\s*$/, '')
    .trim();

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
            onClick={() => {
              navigator.clipboard.writeText(cleanSummary).catch((err) => {
                console.warn('Clipboard write failed:', err);
              });
            }}
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
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ children }) => (
                  <Heading
                    level="h1"
                    className="mt-6 mb-4 border-b border-[var(--color-border)] pb-2 first:mt-0"
                  >
                    {children}
                  </Heading>
                ),
                h2: ({ children }) => (
                  <Heading level="h2" className="mt-5 mb-3">
                    {children}
                  </Heading>
                ),
                h3: ({ children }) => (
                  <Heading level="h3" className="mt-4 mb-2">
                    {children}
                  </Heading>
                ),
                p: ({ children }) => <Text className="mb-4">{children}</Text>,
                a: (props) => (
                  <a
                    href={props.href}
                    className="text-[var(--color-primary)] hover:underline transition-colors font-medium"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {props.children}
                  </a>
                ),
                ul: ({ children }) => (
                  <ul className="list-disc pl-5 mb-4 space-y-1 text-[var(--color-text-primary)]">
                    {children}
                  </ul>
                ),
                ol: (props) => (
                  <ol
                    className="list-decimal pl-5 mb-4 space-y-1 text-[var(--color-text-primary)]"
                    {...props}
                  >
                    {props.children}
                  </ol>
                ),
                li: (props) => (
                  <li className="pl-1" {...props}>
                    <Text as="span">{props.children}</Text>
                  </li>
                ),
                blockquote: (props) => (
                  <blockquote
                    className="border-l-4 border-[var(--color-primary)] pl-4 py-1 my-4 bg-[var(--color-bg-secondary)]/30 rounded-r italic"
                    {...props}
                  >
                    {props.children}
                  </blockquote>
                ),
                code: (props) => {
                  const match = /language-(\w+)/.exec(props.className || '');
                  if (!match) {
                    return (
                      <code
                        className="bg-[var(--color-bg-secondary)] px-1.5 py-0.5 rounded text-sm font-mono text-[var(--color-text-primary)] border border-[var(--color-border)]"
                        {...props}
                      >
                        {props.children}
                      </code>
                    );
                  }
                  return (
                    <code
                      className={`block bg-[var(--color-bg-tertiary)] p-3 rounded-lg overflow-x-auto text-sm font-mono border border-[var(--color-border)] ${props.className}`}
                      {...props}
                    >
                      {props.children}
                    </code>
                  );
                },
                table: (props) => (
                  <div className="overflow-x-auto my-4 rounded-lg border border-[var(--color-border)]">
                    <table
                      className="w-full border-collapse bg-transparent [&_tr:last-child_td]:border-b-0 [&_tr:nth-child(even)]:bg-[var(--color-bg-secondary)]/50"
                      {...props}
                    >
                      {props.children}
                    </table>
                  </div>
                ),
                th: (props) => (
                  <th
                    className="border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-4 py-2 text-left font-semibold text-[var(--color-text-primary)]"
                    {...props}
                  >
                    <Text variant="small" className="font-semibold">
                      {props.children}
                    </Text>
                  </th>
                ),
                td: (props) => (
                  <td
                    className="border-b border-[var(--color-border)] px-4 py-2 text-[var(--color-text-secondary)]"
                    {...props}
                  >
                    <Text variant="small">{props.children}</Text>
                  </td>
                ),
              }}
            >
              {cleanSummary}
            </ReactMarkdown>
          )}
        </div>
      </div>
    </GlassCard>
  );
}
