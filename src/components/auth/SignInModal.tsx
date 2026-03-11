// src/components/auth/SignInModal.tsx
import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import type { Provider } from '@supabase/supabase-js';
import { supabaseClient } from '@/lib/supabase/client';
import { GlassCard, Heading, Text, Button } from '@/lib';

interface SignInModalProps {
  onClose: () => void;
}

function getCallbackUrl() {
  return `${window.location.origin}/auth/callback`;
}

export function SignInModal({ onClose }: SignInModalProps) {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  // Document-level Escape listener (works regardless of which element is focused)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Focus trap — keep Tab/Shift+Tab inside the modal (WCAG 2.1 AA)
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const focusable = Array.from(
      dialog.querySelectorAll<HTMLElement>(
        'button:not([disabled]), input:not([disabled]), [href], [tabindex]:not([tabindex="-1"])'
      )
    );
    if (focusable.length) focusable[0].focus();

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', handleTab);
    return () => document.removeEventListener('keydown', handleTab);
  }, [sent]); // re-run when view switches (sent state changes focusable elements)

  const handleMagicLink = async () => {
    if (!email.trim()) return;
    setIsLoading(true);
    setError('');
    const { error: err } = await supabaseClient.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: getCallbackUrl() },
    });
    setIsLoading(false);
    if (err) {
      setError(err.message);
    } else {
      setSent(true);
    }
  };

  const handleOAuth = async (provider: Provider) => {
    const { error: err } = await supabaseClient.auth.signInWithOAuth({
      provider,
      options: { redirectTo: getCallbackUrl() },
    });
    if (err) {
      setError(err.message);
    }
  };

  return (
    <div
      ref={dialogRef}
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
              <button
                type="button"
                onClick={() => handleOAuth('google')}
                className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl border border-border bg-bg-surface/30 hover:bg-bg-surface/60 text-sm text-text-primary transition-colors duration-150 cursor-pointer"
              >
                {/* Google icon */}
                <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                {t('auth.signIn.google', 'Google')}
              </button>

              <button
                type="button"
                onClick={() => handleOAuth('github')}
                className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl border border-border bg-bg-surface/30 hover:bg-bg-surface/60 text-sm text-text-primary transition-colors duration-150 cursor-pointer"
              >
                {/* GitHub icon */}
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
                {t('auth.signIn.github', 'GitHub')}
              </button>

              {/* TODO: enable Apple sign-in once Apple Developer account is set up
              <button
                type="button"
                onClick={() => handleOAuth('apple')}
                className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl border border-border bg-bg-surface/30 hover:bg-bg-surface/60 text-sm text-text-primary transition-colors duration-150 cursor-pointer"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
                {t('auth.signIn.apple', 'Apple')}
              </button>
              */}
            </div>
          </div>
        )}
      </GlassCard>
    </div>
  );
}
