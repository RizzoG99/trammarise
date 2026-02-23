import { useState, lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ROUTES } from '../types/routing';
import {
  Key,
  ExternalLink,
  Eye,
  EyeOff,
  Check,
  ShieldCheck,
  Zap,
  MousePointerClick,
  Lock,
} from 'lucide-react';
import { useApiKey } from '../context/ApiKeyContext';
import { GlassCard, Button, Heading, Text } from '@/lib';

const SEO = lazy(() =>
  import('@/lib/components/common/SEO').then((module) => ({ default: module.SEO }))
);

export function ApiKeySetupPage() {
  const { t } = useTranslation();
  const { apiKey, setApiKey, testConnection } = useApiKey();
  const [inputValue, setInputValue] = useState(apiKey || '');
  const [isVisible, setIsVisible] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSave = async () => {
    if (!inputValue.trim()) return;

    setStatus('loading');
    setErrorMessage('');

    try {
      const isValid = await testConnection(inputValue.trim());

      if (isValid) {
        setApiKey(inputValue.trim());
        setStatus('success');
      } else {
        setStatus('error');
        setErrorMessage(t('apiKey.form.errors.invalid'));
      }
    } catch (error) {
      console.error(error);
      setStatus('error');
      setErrorMessage(t('apiKey.form.errors.connection'));
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col font-sans text-text-primary">
      <Suspense fallback={null}>
        <SEO
          title={t('apiKey.title')}
          description={t('apiKey.metaDescription')}
          canonical="https://trammarise.app/setup"
        />
      </Suspense>

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Educational Content */}
          <div className="lg:col-span-7 flex flex-col gap-8">
            <div className="flex flex-col gap-4">
              <Heading
                level="h1"
                className="text-3xl md:text-4xl font-black leading-tight tracking-tight"
              >
                {t('apiKey.heading')}
              </Heading>
              <Text variant="body" className="max-w-2xl text-text-secondary text-base md:text-lg">
                {t('apiKey.description')}
              </Text>
            </div>

            <GlassCard variant="light" className="overflow-hidden border border-border p-0">
              <div className="px-6 py-5 border-b border-border bg-surface-secondary/30">
                <Heading level="h3" className="text-lg font-bold">
                  {t('apiKey.guide.title')}
                </Heading>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-[auto_1fr] gap-x-6">
                  {/* Step 1 */}
                  <StepIndicator number={1} />
                  <div className="pb-10">
                    <h4 className="text-base font-semibold mb-1">
                      {t('apiKey.guide.step1.title')}
                    </h4>
                    <p className="text-sm text-text-secondary mb-3">
                      {t('apiKey.guide.step1.text')}
                    </p>
                    <a
                      href="https://platform.openai.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-primary text-sm font-medium hover:underline"
                    >
                      {t('apiKey.guide.step1.linkText')}
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>

                  {/* Step 2 */}
                  <StepIndicator number={2} />
                  <div className="pb-10">
                    <h4 className="text-base font-semibold mb-1">
                      {t('apiKey.guide.step2.title')}
                    </h4>
                    <p className="text-sm text-text-secondary mb-3">
                      {t('apiKey.guide.step2.text')}
                    </p>
                    <div className="w-full rounded-lg overflow-hidden relative border border-border shadow-sm">
                      <img
                        src="/images/openai-guide-dashboard.png"
                        alt="OpenAI Dashboard showing API Keys section"
                        className="w-full h-auto object-cover transition-transform duration-500 hover:scale-105"
                      />
                    </div>
                  </div>

                  {/* Step 3 */}
                  <StepIndicator number={3} />
                  <div className="pb-10">
                    <h4 className="text-base font-semibold mb-1">
                      {t('apiKey.guide.step3.title')}
                    </h4>
                    <p className="text-sm text-text-secondary mb-3">
                      {t('apiKey.guide.step3.text')}
                    </p>
                    <div className="w-full rounded-lg overflow-hidden relative border border-border shadow-sm">
                      <img
                        src="/images/openai-guide-modal.png"
                        alt="Create new secret key modal"
                        className="w-full h-auto object-cover transition-transform duration-500 hover:scale-105"
                      />
                    </div>
                  </div>

                  {/* Step 4 */}
                  <StepIndicator number={4} isLast />
                  <div>
                    <h4 className="text-base font-semibold mb-1">
                      {t('apiKey.guide.step4.title')}
                    </h4>
                    <p className="text-sm text-text-secondary mt-1">
                      {t('apiKey.guide.step4.text')}
                    </p>
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>

          {/* Right Column: Action Panel (Sticky) */}
          <div className="lg:col-span-5 lg:sticky lg:top-24">
            <GlassCard
              variant="light"
              className="p-6 md:p-8 flex flex-col gap-6 shadow-xl border-border"
            >
              <div>
                <Heading level="h2" className="text-xl font-bold mb-2">
                  {t('apiKey.form.title')}
                </Heading>
                <Text variant="small" className="text-text-secondary">
                  {t('apiKey.form.subtitle')}
                </Text>
              </div>

              {/* Privacy Note */}
              <div className="flex gap-3 bg-green-100 dark:bg-green-900/20 p-3 rounded-lg border border-green-200 dark:border-green-900/30">
                <Lock className="w-5 h-5 text-green-700 dark:text-green-400 shrink-0 mt-0.5" />
                <p className="text-xs text-green-800 dark:text-green-300 font-medium leading-relaxed">
                  {t('apiKey.form.securityNote')}
                </p>
              </div>

              {/* Input Form */}
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <label htmlFor="api-key" className="text-sm font-semibold">
                    {t('apiKey.form.label')}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Key className="w-5 h-5 text-text-tertiary" />
                    </div>
                    <input
                      id="api-key"
                      type={isVisible ? 'text' : 'password'}
                      className="block w-full rounded-lg border-input py-3 pl-10 pr-10 bg-bg-surface text-text-primary placeholder-text-tertiary shadow-sm focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm font-mono transition-all"
                      placeholder={t('apiKey.form.placeholder')}
                      value={inputValue}
                      onChange={(e) => {
                        setInputValue(e.target.value);
                        if (status === 'error') setStatus('idle');
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setIsVisible(!isVisible)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer text-text-tertiary hover:text-text-primary transition-colors"
                    >
                      {isVisible ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {status === 'error' && (
                    <p className="text-xs text-red-500 font-medium animate-in slide-in-from-top-1">
                      {errorMessage}
                    </p>
                  )}
                  {status === 'success' && (
                    <p className="text-xs text-green-500 font-medium animate-in slide-in-from-top-1">
                      {t('apiKey.form.success')}
                    </p>
                  )}
                </div>

                <Button
                  onClick={handleSave}
                  disabled={status === 'loading' || !inputValue}
                  className="w-full h-12 text-base font-bold shadow-sm gap-2"
                  icon={
                    status === 'success' ? (
                      <Check className="w-5 h-5" />
                    ) : status === 'loading' ? undefined : (
                      <Zap className="w-5 h-5" />
                    )
                  }
                >
                  {status === 'loading'
                    ? t('apiKey.form.buttons.connecting')
                    : status === 'success'
                      ? t('apiKey.form.buttons.saved')
                      : t('apiKey.form.buttons.connect')}
                </Button>
              </div>

              <div className="border-t border-border pt-4 mt-2">
                <p className="text-xs text-center text-text-secondary">
                  {t('apiKey.form.help')}{' '}
                  <Link
                    to={ROUTES.DOCS}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary font-medium hover:underline"
                  >
                    {t('apiKey.form.docsLink')}
                  </Link>
                  .
                </p>
              </div>
            </GlassCard>

            {/* Trust Indicators */}
            <div className="mt-6 flex justify-center gap-6 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-text-tertiary" />
                <span className="text-xs font-semibold text-text-secondary">
                  {t('apiKey.form.privacy.secure')}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-text-tertiary" />
                <span className="text-xs font-semibold text-text-secondary">
                  {t('apiKey.form.privacy.fast')}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <MousePointerClick className="w-5 h-5 text-text-tertiary" />
                <span className="text-xs font-semibold text-text-secondary">
                  {t('apiKey.form.privacy.noCode')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function StepIndicator({ number, isLast }: { number: number; isLast?: boolean }) {
  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
        {number}
      </div>
      {!isLast && <div className="w-[2px] bg-border h-full my-2"></div>}
    </div>
  );
}
