import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Heading, Text, Button, GlassCard } from '@/lib';
import { ArrowRight, Mic, Zap, Shield, Check } from 'lucide-react';
import { AppFooter } from '@/components/layout/AppFooter';
import { SignInModal } from '@/components/auth/SignInModal';

export function WelcomePage() {
  const { t } = useTranslation();
  const [showSignIn, setShowSignIn] = useState(false);

  const handleGetStarted = () => setShowSignIn(true);

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary overflow-x-hidden selection:bg-primary/30">
      {showSignIn && <SignInModal onClose={() => setShowSignIn(false)} />}
      {/* Hero ─────────────────────────────────────────── */}
      <section className="relative pt-28 pb-24 md:pt-40 md:pb-32 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
            {/* Left — copy */}
            <div>
              <Heading
                level="h1"
                className="text-[2.5rem] md:text-[3.5rem] lg:text-[4.5rem] font-bold tracking-tighter leading-[1.06] mb-7"
              >
                <span className="text-text-primary">{t('welcome.hero.titlePart1')}</span>
                <br />
                <span className="text-primary">{t('welcome.hero.titlePart2')}</span>
              </Heading>

              <Text
                variant="body"
                color="secondary"
                className="text-base md:text-lg leading-[1.7] mb-9 max-w-lg"
              >
                {t('welcome.hero.description')}
              </Text>

              <Button
                variant="large"
                onClick={handleGetStarted}
                className="group bg-primary hover:bg-primary-hover text-white shadow-md shadow-primary/25 border-0 cursor-pointer focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary transition-colors duration-200"
              >
                <span className="flex items-center">
                  {t('welcome.hero.cta')}
                  <ArrowRight
                    className="w-5 h-5 ml-2 transition-transform duration-200 motion-safe:group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                </span>
              </Button>

              <ProofLine text={t('welcome.hero.proof')} />
            </div>

            {/* Right — static app mockup */}
            <AppMockup />
          </div>
        </div>
      </section>

      {/* Features ─────────────────────────────────────── */}
      <section id="features" className="py-28 md:py-32 border-t border-border/40">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-14">
            <Heading
              level="h2"
              className="text-3xl md:text-4xl font-bold tracking-tight mb-3 text-text-primary"
            >
              {t('welcome.features.title')}
            </Heading>
            <Text variant="body" color="secondary" className="max-w-md mx-auto">
              {t('welcome.features.subtitle')}
            </Text>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FeatureCard
              icon={<Mic className="w-5 h-5 text-blue-400" aria-hidden="true" />}
              iconBg="bg-blue-400/10"
              title={t('welcome.features.cards.transcription.title')}
              description={t('welcome.features.cards.transcription.description')}
            />
            <FeatureCard
              icon={<Zap className="w-5 h-5 text-amber-400" aria-hidden="true" />}
              iconBg="bg-amber-400/10"
              title={t('welcome.features.cards.summaries.title')}
              description={t('welcome.features.cards.summaries.description')}
            />
            <FeatureCard
              icon={<Shield className="w-5 h-5 text-emerald-400" aria-hidden="true" />}
              iconBg="bg-emerald-400/10"
              title={t('welcome.features.cards.security.title')}
              description={t('welcome.features.cards.security.description')}
            />
          </div>
        </div>
      </section>

      {/* BYOK ─────────────────────────────────────────── */}
      <section className="py-20 md:py-28 px-4 border-t border-border/40">
        <ByokSection onGetStarted={handleGetStarted} />
      </section>

      <AppFooter />
    </div>
  );
}

/** Breaks the proof line on `·` separators and renders each token distinctly. */
function ProofLine({ text }: { text: string }) {
  const parts = text
    .split('·')
    .map((p) => p.trim())
    .filter(Boolean);
  return (
    <p className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-text-tertiary">
      {parts.map((part, i) => (
        <span key={part} className="flex items-center gap-3">
          {i > 0 && (
            <span className="text-border" aria-hidden="true">
              ·
            </span>
          )}
          {part}
        </span>
      ))}
    </p>
  );
}

function AppMockup() {
  const { t } = useTranslation();
  return (
    <GlassCard
      variant="dark"
      className="p-0 border-border overflow-hidden shadow-xl shadow-black/30"
    >
      {/* Window chrome */}
      <div className="flex items-center gap-1.5 px-4 py-3 border-b border-border bg-bg-surface/60">
        <span className="w-2.5 h-2.5 rounded-full bg-red-400/70" aria-hidden="true" />
        <span className="w-2.5 h-2.5 rounded-full bg-yellow-400/70" aria-hidden="true" />
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/70" aria-hidden="true" />
        <span className="ml-auto font-mono text-[10px] text-text-tertiary tracking-wide">
          meeting-2026-03-05.mp3
        </span>
      </div>

      {/* Transcript */}
      <div className="p-5 space-y-3 mb-1">
        <TranscriptLine
          time="0:04"
          speaker={t('welcome.hero.mockup.speaker')}
          text="Let's start with a quick recap of last week's decisions."
        />
        <TranscriptLine
          time="0:18"
          speaker="Speaker 2"
          text="Sure — we finalized the API schema and unblocked the mobile team."
        />
      </div>

      {/* Summary panel */}
      <div className="px-5 pb-5 border-t border-border pt-4">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-text-tertiary mb-2.5">
          {t('welcome.hero.mockup.summaryLabel')}
        </p>
        <ul className="space-y-2">
          <BulletItem text={t('welcome.hero.mockup.bullet1')} />
          <BulletItem text={t('welcome.hero.mockup.bullet2')} />
        </ul>
      </div>
    </GlassCard>
  );
}

function TranscriptLine({ time, speaker, text }: { time: string; speaker: string; text: string }) {
  return (
    <div className="flex gap-3 items-start">
      <span className="text-[11px] text-primary font-mono shrink-0 mt-0.5 tabular-nums">
        {time}
      </span>
      <div>
        <span className="block text-[10px] text-text-tertiary font-medium mb-0.5">{speaker}</span>
        <p className="text-sm text-text-primary leading-snug">&ldquo;{text}&rdquo;</p>
      </div>
    </div>
  );
}

function BulletItem({ text }: { text: string }) {
  return (
    <li className="text-xs text-text-secondary flex gap-2 items-start">
      <Check className="w-3 h-3 text-accent-success shrink-0 mt-0.5" aria-hidden="true" />
      {text}
    </li>
  );
}

function FeatureCard({
  icon,
  iconBg,
  title,
  description,
}: {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  description: string;
}) {
  return (
    <GlassCard
      variant="dark"
      className="p-6 h-full border-border transition-colors duration-200 hover:border-primary/25"
    >
      <div className={`mb-5 p-2.5 ${iconBg} rounded-xl w-fit border border-border`}>{icon}</div>
      <Heading
        level="h3"
        className="mb-2.5 text-base font-semibold text-text-primary tracking-tight"
      >
        {title}
      </Heading>
      <Text variant="body" color="secondary" className="leading-[1.65] text-sm">
        {description}
      </Text>
    </GlassCard>
  );
}

function ByokSection({ onGetStarted }: { onGetStarted: () => void }) {
  const { t } = useTranslation();
  return (
    <div className="container mx-auto max-w-5xl">
      <GlassCard variant="dark" className="p-8 md:p-12 border-border">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          {/* Left — value prop */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-4">
              {t('welcome.byok.label')}
            </p>
            <Heading
              level="h2"
              className="text-2xl md:text-3xl font-bold tracking-tight text-text-primary mb-4 leading-snug"
            >
              {t('welcome.byok.title')}
            </Heading>
            <Text variant="body" color="secondary" className="mb-7 leading-[1.7]">
              {t('welcome.byok.description')}
            </Text>
            <Button
              variant="primary"
              onClick={onGetStarted}
              className="border-0 cursor-pointer focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-surface transition-colors duration-200"
            >
              {t('welcome.byok.cta')}
            </Button>
          </div>

          {/* Right — key input mockup */}
          <div className="space-y-3">
            <GlassCard variant="dark" className="p-4 border-border shadow-lg shadow-black/20">
              {/* Label */}
              <p className="text-[10px] font-medium text-text-tertiary mb-2 uppercase tracking-wider">
                OpenAI API Key
              </p>
              {/* Masked input */}
              <div className="flex items-center gap-0 px-3 py-2.5 rounded-lg bg-bg-surface border border-border font-mono text-sm text-text-tertiary">
                <span>{t('welcome.byok.mockup.placeholder')}</span>
                <span
                  className="ml-0.5 w-0.5 h-4 bg-primary motion-safe:animate-[blink_1s_step-end_infinite] rounded-sm"
                  aria-hidden="true"
                />
              </div>
              {/* Connected badge */}
              <div className="mt-3 flex items-center gap-2">
                <span
                  className="w-2 h-2 rounded-full bg-accent-success motion-safe:animate-pulse"
                  aria-hidden="true"
                />
                <span className="text-xs text-accent-success font-medium">
                  {t('welcome.byok.mockup.connected')}
                </span>
              </div>
            </GlassCard>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
