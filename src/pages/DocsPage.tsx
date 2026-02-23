import { useState, lazy, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ChevronDown,
  ChevronUp,
  HelpCircle,
  BookOpen,
  AlertCircle,
  Play,
  Settings,
  MessageSquare,
} from 'lucide-react';
import { GlassCard, Heading, Text } from '@/lib';

const SEO = lazy(() =>
  import('@/lib/components/common/SEO').then((module) => ({ default: module.SEO }))
);

export function DocsPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col font-sans text-text-primary">
      <Suspense fallback={null}>
        <SEO
          title={t('docs.title')}
          description={t('docs.description')}
          canonical="https://trammarise.app/docs"
        />
      </Suspense>

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-8 lg:px-8">
        <div className="flex flex-col gap-8">
          {/* Header Section */}
          <div className="text-center mb-4">
            <Heading level="h1" className="text-3xl md:text-4xl font-black mb-4">
              {t('docs.title')}
            </Heading>
            <Text variant="body" className="text-text-secondary max-w-2xl mx-auto">
              {t('docs.description')}
            </Text>
          </div>

          {/* Getting Started Section */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <BookOpen className="w-6 h-6" />
              </div>
              <Heading level="h2" className="text-2xl font-bold">
                {t('docs.gettingStarted.title')}
              </Heading>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <GlassCard
                variant="light"
                className="p-6 flex flex-col items-center text-center gap-4 h-full"
              >
                <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <Play className="w-6 h-6 ml-1" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">{t('docs.gettingStarted.step1.title')}</h3>
                  <p className="text-sm text-text-secondary">
                    {t('docs.gettingStarted.step1.text')}
                  </p>
                </div>
              </GlassCard>

              <GlassCard
                variant="light"
                className="p-6 flex flex-col items-center text-center gap-4 h-full"
              >
                <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
                  <Settings className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">{t('docs.gettingStarted.step2.title')}</h3>
                  <p className="text-sm text-text-secondary">
                    {t('docs.gettingStarted.step2.text')}
                  </p>
                </div>
              </GlassCard>

              <GlassCard
                variant="light"
                className="p-6 flex flex-col items-center text-center gap-4 h-full"
              >
                <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">{t('docs.gettingStarted.step3.title')}</h3>
                  <p className="text-sm text-text-secondary">
                    {t('docs.gettingStarted.step3.text')}
                  </p>
                </div>
              </GlassCard>
            </div>
          </section>

          {/* FAQ Section */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <HelpCircle className="w-6 h-6" />
              </div>
              <Heading level="h2" className="text-2xl font-bold">
                {t('docs.faq.title')}
              </Heading>
            </div>

            <GlassCard variant="light" className="divide-y divide-border">
              {(
                t('docs.faq.items', { returnObjects: true }) as Array<{
                  question: string;
                  answer: string;
                }>
              ).map((item, index) => (
                <AccordionItem key={index} title={item.question}>
                  {item.answer}
                </AccordionItem>
              ))}
            </GlassCard>
          </section>

          {/* Troubleshooting Section */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400">
                <AlertCircle className="w-6 h-6" />
              </div>
              <Heading level="h2" className="text-2xl font-bold">
                {t('docs.troubleshooting.title')}
              </Heading>
            </div>

            <GlassCard variant="light" className="p-6 border-l-4 border-l-red-500">
              <h3 className="font-bold text-lg mb-2">Transcription Issues</h3>
              <p className="text-text-secondary">{t('docs.troubleshooting.transcriptionFailed')}</p>
            </GlassCard>
          </section>
        </div>
      </main>
    </div>
  );
}

function AccordionItem({ title, children }: { title: string; children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 md:p-6 text-left hover:bg-surface-secondary/50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
        aria-expanded={isOpen}
      >
        <span className="font-semibold text-lg">{title}</span>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-text-tertiary flex-shrink-0" />
        ) : (
          <ChevronDown className="w-5 h-5 text-text-tertiary flex-shrink-0" />
        )}
      </button>

      <div
        className={`transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="p-4 md:p-6 pt-0 text-text-secondary leading-relaxed border-t border-border/50">
          {children}
        </div>
      </div>
    </div>
  );
}
