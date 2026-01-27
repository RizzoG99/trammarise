import { useState } from 'react';
import {
  Key,
  ExternalLink,
  Eye,
  EyeOff,
  Check,
  ShieldCheck,
  Zap,
  MousePointerClick,
  Monitor,
  Lock,
} from 'lucide-react';
import { useApiKey } from '../context/ApiKeyContext';
import { GlassCard, Button, Heading, Text, SEO } from '@/lib';
import { AppHeader } from '../components/layout/AppHeader';

export function ApiKeySetupPage() {
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
        setErrorMessage('Invalid API Key. Please check your key and try again.');
      }
    } catch (error) {
      console.error(error);
      setStatus('error');
      setErrorMessage('Connection failed. Please check your internet connection.');
    }
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col font-sans text-text-primary">
      <SEO
        title="Setup API Key"
        description="Configure your OpenAI API key to enable AI-powered transcription and summarization features in Trammarise."
        canonical="https://trammarise.app/setup"
      />
      {/* Reusing AppHeader for consistency */}
      <AppHeader />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Educational Content */}
          <div className="lg:col-span-7 flex flex-col gap-8">
            <div className="flex flex-col gap-4">
              <Heading
                level="h1"
                className="text-3xl md:text-4xl font-black leading-tight tracking-tight"
              >
                Unlock AI Transcription
              </Heading>
              <Text variant="body" className="max-w-2xl text-text-secondary text-base md:text-lg">
                Trammarise uses OpenAI's powerful models to transcribe and summarize your audio.
                Follow the guide below to get your personal API key.
              </Text>
            </div>

            <GlassCard variant="light" className="overflow-hidden border border-border p-0">
              <div className="px-6 py-5 border-b border-border bg-surface-secondary/30">
                <Heading level="h3" className="text-lg font-bold">
                  How to get your API Key
                </Heading>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-[auto_1fr] gap-x-6">
                  {/* Step 1 */}
                  <StepIndicator number={1} />
                  <div className="pb-10">
                    <h4 className="text-base font-semibold mb-1">Log in to OpenAI Platform</h4>
                    <p className="text-sm text-text-secondary mb-3">
                      Visit platform.openai.com and sign in with your account.
                    </p>
                    <a
                      href="https://platform.openai.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-primary text-sm font-medium hover:underline"
                    >
                      Open platform.openai.com
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>

                  {/* Step 2 */}
                  <StepIndicator number={2} />
                  <div className="pb-10">
                    <h4 className="text-base font-semibold mb-1">Navigate to API Keys</h4>
                    <p className="text-sm text-text-secondary mb-3">
                      Hover over the sidebar on the left and click on "API Keys" icon.
                    </p>
                    <div className="w-full h-32 md:h-48 rounded-lg overflow-hidden relative bg-surface-secondary border border-border">
                      {/* Placeholder for screenshot */}
                      <div className="absolute inset-0 flex items-center justify-center text-text-tertiary">
                        <Monitor className="w-12 h-12 opacity-20" />
                        <span className="sr-only">Screenshot of Dashboard</span>
                      </div>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <StepIndicator number={3} />
                  <div className="pb-10">
                    <h4 className="text-base font-semibold mb-1">Create new secret key</h4>
                    <p className="text-sm text-text-secondary mb-3">
                      Click "Create new secret key". Name it 'Trammarise' to easily identify it
                      later.
                    </p>
                    <div className="w-full h-24 rounded-lg overflow-hidden relative bg-surface-secondary border border-border">
                      {/* Placeholder for screenshot */}
                      <div className="absolute inset-0 flex items-center justify-center text-text-tertiary">
                        <Key className="w-10 h-10 opacity-20" />
                        <span className="sr-only">Screenshot of Modal</span>
                      </div>
                    </div>
                  </div>

                  {/* Step 4 */}
                  <StepIndicator number={4} isLast />
                  <div>
                    <h4 className="text-base font-semibold mb-1">Copy and paste</h4>
                    <p className="text-sm text-text-secondary mt-1">
                      Copy the key starting with{' '}
                      <code className="bg-surface-secondary px-1 py-0.5 rounded text-xs font-mono">
                        sk-...
                      </code>{' '}
                      immediately. You won't be able to view it again.
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
                  Connect OpenAI
                </Heading>
                <Text variant="small" className="text-text-secondary">
                  Enter your key below to enable transcription features.
                </Text>
              </div>

              {/* Privacy Note */}
              <div className="flex gap-3 bg-green-500/10 p-3 rounded-lg border border-green-500/20">
                <Lock className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                <p className="text-xs text-green-800 dark:text-green-300 font-medium leading-relaxed">
                  Your key is stored locally in your browser and is never sent to our servers.
                </p>
              </div>

              {/* Input Form */}
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <label htmlFor="api-key" className="text-sm font-semibold">
                    OpenAI API Key
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Key className="w-5 h-5 text-text-tertiary" />
                    </div>
                    <input
                      id="api-key"
                      type={isVisible ? 'text' : 'password'}
                      className="block w-full rounded-lg border-input py-3 pl-10 pr-10 bg-background text-text-primary shadow-sm focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm font-mono transition-all"
                      placeholder="sk-..."
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
                      Connection verified and saved!
                    </p>
                  )}
                </div>

                <Button
                  onClick={handleSave}
                  disabled={status === 'loading' || !inputValue}
                  className="w-full h-12 text-base font-bold shadow-sm gap-2"
                >
                  {status === 'loading' ? (
                    <>Connecting...</>
                  ) : status === 'success' ? (
                    <>
                      Saved <Check className="w-5 h-5" />
                    </>
                  ) : (
                    <>
                      Test & Save Connection <Zap className="w-5 h-5" />
                    </>
                  )}
                </Button>
              </div>

              <div className="border-t border-border pt-4 mt-2">
                <p className="text-xs text-center text-text-secondary">
                  Having trouble?{' '}
                  <a href="#" className="text-primary font-medium hover:underline">
                    Check our documentation
                  </a>
                  .
                </p>
              </div>
            </GlassCard>

            {/* Trust Indicators */}
            <div className="mt-6 flex justify-center gap-6 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-text-tertiary" />
                <span className="text-xs font-semibold text-text-secondary">Secure</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-text-tertiary" />
                <span className="text-xs font-semibold text-text-secondary">Fast</span>
              </div>
              <div className="flex items-center gap-2">
                <MousePointerClick className="w-5 h-5 text-text-tertiary" />
                <span className="text-xs font-semibold text-text-secondary">No Code</span>
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
