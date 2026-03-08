import { GlassCard, Button } from '../../../lib';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useTranslation } from 'react-i18next';
import { FileDown, Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface SummaryPanelProps {
  summary: string;
  onExport?: () => void;
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

export function SummaryPanel({ summary, onExport, structuredSummary }: SummaryPanelProps) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const cleanSummary = summary
    .replace(/<summary\b[^>]*>|<\/summary>/gi, '')
    .replace(/\n---\s*$/, '')
    .replace(/\n\*\*\*\s*$/, '')
    .trim();

  const handleCopy = () => {
    navigator.clipboard.writeText(cleanSummary).catch((err) => {
      console.warn('Clipboard write failed:', err);
    });
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isCodeBlock = (className?: string) => /language-(\w+)/.test(className || '');

  return (
    <GlassCard variant="dark" className="overflow-hidden">
      {/* Accent top bar */}
      <div className="h-px bg-gradient-to-r from-primary/60 via-primary/20 to-transparent" />

      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-semibold tracking-widest uppercase bg-primary/10 text-primary border border-primary/20">
              AI
            </span>
            <h3 className="text-sm font-semibold tracking-tight text-text-primary">
              {t('results.summary.title')}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              aria-label={t('results.summary.copyAll')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-text-tertiary hover:text-text-primary hover:bg-white/5 transition-colors duration-150 cursor-pointer"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-green-400" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
              {copied ? t('common.copied', 'Copied') : t('results.summary.copyAll')}
            </button>

            {onExport && (
              <Button
                variant="secondary"
                icon={<FileDown className="w-3.5 h-3.5" />}
                onClick={onExport}
                className="px-3 py-1.5 text-xs"
              >
                {t('header.export')}
              </Button>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-border mb-5" />

        {/* Content */}
        <div className="prose prose-sm dark:prose-invert max-w-none text-[15px] leading-[1.75]">
          {structuredSummary ? (
            <div className="text-text-secondary text-sm">
              {t('results.summary.phase4Placeholder')}
            </div>
          ) : (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ children }) => (
                  <h1 className="text-base font-semibold text-text-primary mt-6 mb-3 pb-2 border-b border-border first:mt-0 tracking-tight">
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-[13px] font-semibold text-text-tertiary mt-5 mb-2 uppercase tracking-widest">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-sm font-semibold text-text-primary mt-4 mb-2">{children}</h3>
                ),
                p: ({ children }) => (
                  <p className="text-text-secondary leading-[1.75] mb-4 last:mb-0">{children}</p>
                ),
                a: (props) => (
                  <a
                    href={props.href}
                    className="text-primary hover:text-primary-hover underline underline-offset-2 transition-colors font-medium"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {props.children}
                  </a>
                ),
                ul: ({ children }) => (
                  <ul className="space-y-1.5 mb-4 pl-0 list-none">{children}</ul>
                ),
                ol: ({ children, ...props }) => (
                  <ol className="space-y-1.5 mb-4 pl-5 list-decimal text-text-secondary" {...props}>
                    {children}
                  </ol>
                ),
                li: ({ children }) => (
                  <li className="flex gap-2.5 text-text-secondary leading-[1.7]">
                    <span className="mt-[7px] w-1 h-1 rounded-full bg-primary/60 shrink-0" />
                    <span>{children}</span>
                  </li>
                ),
                blockquote: ({ children, ...props }) => (
                  <blockquote
                    className="border-l-2 border-primary/50 pl-4 py-1 my-4 bg-primary/5 rounded-r-lg italic text-text-secondary"
                    {...props}
                  >
                    {children}
                  </blockquote>
                ),
                code: ({ children, className, ...props }) => {
                  if (isCodeBlock(className)) {
                    return (
                      <code
                        className={`block bg-bg-tertiary p-3 rounded-lg overflow-x-auto text-[13px] font-mono border border-border ${className}`}
                        {...props}
                      >
                        {children}
                      </code>
                    );
                  }
                  return (
                    <code
                      className="bg-bg-tertiary px-1.5 py-0.5 rounded text-[13px] font-mono text-text-primary border border-border"
                      {...props}
                    >
                      {children}
                    </code>
                  );
                },
                strong: ({ children }) => (
                  <strong className="font-semibold text-text-primary">{children}</strong>
                ),
                table: ({ children, ...props }) => (
                  <div className="overflow-x-auto my-4 rounded-xl border border-border">
                    <table
                      className="w-full border-collapse bg-transparent [&_tr:last-child_td]:border-b-0 [&_tr:nth-child(even)]:bg-white/[0.02]"
                      {...props}
                    >
                      {children}
                    </table>
                  </div>
                ),
                th: ({ children, ...props }) => (
                  <th
                    className="border-b border-border bg-bg-surface px-4 py-2 text-left text-xs font-semibold text-text-primary uppercase tracking-wider"
                    {...props}
                  >
                    {children}
                  </th>
                ),
                td: ({ children, ...props }) => (
                  <td
                    className="border-b border-border px-4 py-2.5 text-sm text-text-secondary"
                    {...props}
                  >
                    {children}
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
