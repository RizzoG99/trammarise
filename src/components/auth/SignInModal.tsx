// src/components/auth/SignInModal.tsx
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Provider } from '@supabase/supabase-js';
import { supabaseClient } from '@/lib/supabase/client';
import { GlassCard, Heading, Text, Button } from '@/lib';

interface SignInModalProps {
  onClose: () => void;
}

const CALLBACK_URL = `${window.location.origin}/auth/callback`;

export function SignInModal({ onClose }: SignInModalProps) {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleMagicLink = async () => {
    if (!email.trim()) return;
    setIsLoading(true);
    setError('');
    const { error: err } = await supabaseClient.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: CALLBACK_URL },
    });
    setIsLoading(false);
    if (err) {
      setError(err.message);
    } else {
      setSent(true);
    }
  };

  const handleOAuth = async (provider: Provider) => {
    await supabaseClient.auth.signInWithOAuth({
      provider,
      options: { redirectTo: CALLBACK_URL },
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t('auth.signIn.title', 'Sign in')}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <GlassCard variant="dark" className="w-full max-w-sm p-8">
        {sent ? (
          <div role="status" className="text-center space-y-3">
            <Heading level="h2">{t('auth.signIn.checkEmail', 'Check your email')}</Heading>
            <Text color="secondary">
              {t('auth.signIn.sentTo', 'We sent a magic link to')} <strong>{email}</strong>.
            </Text>
          </div>
        ) : (
          <div className="space-y-6">
            <Heading level="h2" className="text-center">
              {t('auth.signIn.title', 'Sign in to Trammarise')}
            </Heading>

            {/* Email magic link */}
            <div className="space-y-2">
              <label htmlFor="signin-email" className="text-sm font-medium text-text-secondary">
                {t('auth.signIn.email', 'Email')}
              </label>
              <input
                id="signin-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleMagicLink()}
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl bg-bg-surface/40 border border-border text-sm text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              {error && (
                <p role="alert" className="text-accent-error text-sm">
                  {error}
                </p>
              )}
              <Button
                variant="primary"
                onClick={handleMagicLink}
                disabled={isLoading || !email.trim()}
                className="w-full cursor-pointer"
              >
                {isLoading
                  ? t('auth.signIn.sending', 'Sending…')
                  : t('auth.signIn.magicLink', 'Send Magic Link')}
              </Button>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-text-tertiary">
                {t('auth.signIn.or', 'or continue with')}
              </span>
              <div className="flex-1 h-px bg-border" />
            </div>

            {/* OAuth providers */}
            <div className="space-y-2">
              {(
                [
                  { provider: 'google' as Provider, label: 'Google' },
                  { provider: 'github' as Provider, label: 'GitHub' },
                  { provider: 'apple' as Provider, label: 'Apple' },
                ] as const
              ).map(({ provider, label }) => (
                <button
                  key={provider}
                  type="button"
                  onClick={() => handleOAuth(provider)}
                  className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl border border-border bg-bg-surface/30 hover:bg-bg-surface/60 text-sm text-text-primary transition-colors duration-150 cursor-pointer"
                >
                  {t(`auth.signIn.${provider}`, label)}
                </button>
              ))}
            </div>
          </div>
        )}
      </GlassCard>
    </div>
  );
}
