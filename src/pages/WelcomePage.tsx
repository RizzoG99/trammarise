import { useClerk } from '@clerk/clerk-react';
import { useTranslation } from 'react-i18next';
import { Heading, Text, Button, GlassCard } from '@/lib';
import { ArrowRight, Mic, Zap, Shield, Check, Key } from 'lucide-react';
import { TeamSection } from '@/components/sections/TeamSection';

export function WelcomePage() {
  const { openSignIn } = useClerk();
  const { t } = useTranslation();

  const handleGetStarted = () => {
    openSignIn({
      afterSignInUrl: '/',
      afterSignUpUrl: '/',
    });
  };

  const handleViewPricing = () => {
    document.getElementById('pricing')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary overflow-x-hidden selection:bg-primary/30">
      {/* Decorative Orbs & Mesh Gradients */}
      <div className="fixed top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-primary/20 blur-[120px] pointer-events-none animate-[pulse_8s_ease-in-out_infinite]" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-500/20 blur-[100px] pointer-events-none animate-[pulse_10s_ease-in-out_infinite_reverse]" />
      <div className="fixed top-[40%] left-[30%] w-[30%] h-[30%] rounded-full bg-blue-400/10 blur-[80px] pointer-events-none" />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-4">
        <div className="container mx-auto max-w-5xl text-center relative z-10">
          <div className="flex flex-col items-center">
            <GlassCard variant="glow" className="mb-8 rounded-full px-4 py-1.5 border-primary/30">
              <span className="text-sm font-medium bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                {t('welcome.hero.newBadge')}
              </span>
            </GlassCard>

            <Heading
              level="h1"
              className="text-5xl md:text-7xl lg:text-8xl font-bold mb-8 tracking-tight"
            >
              <span className="bg-clip-text text-transparent bg-gradient-to-b from-white to-white/70">
                {t('welcome.hero.titlePart1')}
              </span>
              <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 animate-gradient-x">
                {t('welcome.hero.titlePart2')}
              </span>
            </Heading>

            <Text
              variant="body"
              color="secondary"
              className="text-xl md:text-2xl mb-12 max-w-2xl mx-auto leading-relaxed text-slate-400"
            >
              {t(
                'welcome.hero.description',
                'Transform your meetings, lectures, and interviews into actionable insights. Start with 60 free minutes, upgrade for unlimited access.'
              )}
            </Text>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center w-full sm:w-auto">
              <Button
                variant="large"
                onClick={handleGetStarted}
                className="group bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white shadow-lg shadow-blue-500/25 min-w-[200px] border-0 hover:-translate-y-0.5 hover:shadow-xl"
              >
                <span className="flex items-center justify-center">
                  {t('welcome.hero.cta.primary', 'Start Free Trial')}
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </span>
              </Button>

              <Button
                variant="outline"
                className="px-8 py-4 text-lg min-w-[200px] border-white/10 hover:bg-white/5 backdrop-blur-sm transition-all hover:border-white/20 text-slate-300"
                onClick={handleViewPricing}
              >
                {t('welcome.hero.cta.secondary', 'View Pricing')}
              </Button>
            </div>

            <Text variant="small" color="tertiary" className="mt-4 text-slate-500">
              {t('welcome.hero.noCreditCard', 'No credit card required')}
            </Text>

            {/* Floating UI Mockup/Preview could go here */}
            <div className="mt-20 w-full max-w-4xl mx-auto opacity-90 hover:opacity-100 transition-opacity duration-700 delay-200">
              <div className="relative rounded-xl overflow-hidden border border-white/10 shadow-2xl shadow-blue-900/20 bg-slate-900/50 backdrop-blur-sm aspect-video group">
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 to-purple-500/10" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-slate-500 font-mono text-sm">
                    {t('welcome.hero.cta.appPreview')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-32 relative">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-16">
            <Heading level="h2" className="text-3xl md:text-4xl font-bold mb-4 text-white">
              {t('welcome.features.title')}
            </Heading>
            <p className="text-slate-400 text-lg">{t('welcome.features.subtitle')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Mic className="w-8 h-8 text-blue-400" />}
              title={t('welcome.features.cards.transcription.title')}
              description={t('welcome.features.cards.transcription.description')}
            />
            <FeatureCard
              icon={<Zap className="w-8 h-8 text-amber-400" />}
              title={t('welcome.features.cards.summaries.title')}
              description={t('welcome.features.cards.summaries.description')}
            />
            <FeatureCard
              icon={<Shield className="w-8 h-8 text-emerald-400" />}
              title={t('welcome.features.cards.security.title')}
              description={t('welcome.features.cards.security.description')}
            />
          </div>
        </div>
      </section>

      {/* Pricing Preview Section */}
      <section id="pricing" className="py-32 relative">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-16">
            <Heading level="h2" className="text-3xl md:text-4xl font-bold mb-4 text-white">
              {t('welcome.pricing.title', 'Simple, Transparent Pricing')}
            </Heading>
            <p className="text-slate-400 text-lg">
              {t('welcome.pricing.subtitle', 'Choose the plan that fits your needs')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Free Tier */}
            <PricingCard
              name={t('welcome.pricing.free.name', 'Free')}
              price={t('welcome.pricing.free.price', '$0')}
              interval={t('welcome.pricing.free.interval', '/month')}
              description={t('welcome.pricing.free.description', 'Try before you upgrade')}
              features={[
                '60 minutes included',
                'Basic transcription',
                'Standard AI models',
                'Local storage',
              ]}
              cta={t('welcome.pricing.free.cta', 'Start Free Trial')}
              onCTAClick={handleGetStarted}
            />

            {/* Pro Tier */}
            <PricingCard
              name={t('welcome.pricing.pro.name', 'Pro')}
              price={t('welcome.pricing.pro.price', '$19')}
              interval={t('welcome.pricing.pro.interval', '/month')}
              description={t('welcome.pricing.pro.description', 'For professionals')}
              badge={t('welcome.pricing.pro.badge', 'Most Popular')}
              features={[
                '500 minutes/month',
                'All features unlocked',
                'Cloud sync & chat',
                'Priority support',
              ]}
              cta={t('welcome.pricing.pro.cta', 'Upgrade to Pro')}
              onCTAClick={handleViewPricing}
              popular
            />

            {/* Team Tier */}
            <PricingCard
              name={t('welcome.pricing.team.name', 'Team')}
              price={t('welcome.pricing.team.price', '$49')}
              interval={t('welcome.pricing.team.interval', '/month')}
              description={t('welcome.pricing.team.description', 'For teams')}
              features={[
                '2000 minutes/month',
                'Team collaboration',
                'Shared workspaces',
                'Admin controls',
              ]}
              cta={t('welcome.pricing.team.cta', 'Contact Sales')}
              onCTAClick={handleViewPricing}
            />
          </div>

          <div className="text-center mt-12">
            <button
              onClick={handleViewPricing}
              className="text-blue-400 hover:text-blue-300 transition-colors text-lg font-medium inline-flex items-center gap-2"
            >
              {t('welcome.pricing.viewComparison', 'View detailed comparison')}
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <TeamSection />

      {/* CTA Section */}
      <section className="py-32 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-blue-900/20 pointer-events-none" />
        <div className="container mx-auto max-w-3xl relative z-10">
          <GlassCard variant="glow" className="p-12 md:p-16 border-white/10">
            <Heading level="h2" className="mb-6 text-4xl font-bold text-white">
              {t('welcome.cta.title', 'Ready to boost your productivity?')}
            </Heading>
            <Text variant="body" className="mb-10 text-xl text-slate-300 max-w-xl mx-auto">
              {t(
                'welcome.cta.description',
                'Join professionals who save hours every week with AI-powered transcription.'
              )}
            </Text>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                variant="large"
                onClick={handleGetStarted}
                className="w-full sm:w-auto bg-white text-blue-900 hover:bg-slate-100 border-0 shadow-xl shadow-white/10"
              >
                {t('welcome.cta.free', 'Start Free Trial (60 min)')}
              </Button>
              <Button
                variant="outline"
                onClick={handleViewPricing}
                className="w-full sm:w-auto border-white/20 hover:bg-white/5 text-white"
              >
                {t('welcome.cta.pro', 'Unlock Pro Features')} →
              </Button>
            </div>
            <Text variant="small" className="mt-6 text-slate-400">
              {t('welcome.hero.noCreditCard', 'No credit card required')}
            </Text>
          </GlassCard>
        </div>
      </section>

      {/* API Key Setup CTA */}
      <section className="py-20 px-4 bg-gradient-to-b from-transparent to-blue-900/10">
        <div className="container mx-auto max-w-4xl">
          <GlassCard variant="glow" className="p-8">
            <div className="flex items-start gap-6">
              <div className="p-4 bg-blue-500/10 rounded-full shrink-0">
                <Key className="w-8 h-8 text-blue-400" />
              </div>
              <div className="flex-1">
                <Heading level="h3" className="mb-3 text-white">
                  🔑 {t('welcome.byok.title', 'Free Tier: Bring Your Own API Key')}
                </Heading>
                <Text variant="body" className="mb-4 text-slate-300">
                  {t(
                    'welcome.byok.description',
                    'Get started for free by using your own OpenAI API key. No subscription required. Pay only for what you use directly to OpenAI.'
                  )}
                </Text>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    variant="primary"
                    onClick={handleGetStarted}
                    className="bg-blue-600 hover:bg-blue-500 text-white border-0"
                  >
                    {t('welcome.byok.cta.setup', 'Get Started Free')}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleViewPricing}
                    className="border-white/20 hover:bg-white/5 text-slate-300"
                  >
                    {t('welcome.byok.cta.upgrade', 'Or Upgrade to Pro')}
                  </Button>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5 bg-slate-950/30 backdrop-blur-lg">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-slate-500 text-sm">
            {t('welcome.footer.copyright', { year: new Date().getFullYear() })}
          </p>
          <div className="flex gap-8">
            <button
              onClick={handleViewPricing}
              className="text-slate-400 hover:text-white transition-colors text-sm font-medium"
            >
              {t('welcome.footer.links.pricing', 'Pricing')}
            </button>
            <a
              href="#"
              className="text-slate-400 hover:text-white transition-colors text-sm font-medium"
            >
              {t('welcome.footer.links.privacy')}
            </a>
            <a
              href="#"
              className="text-slate-400 hover:text-white transition-colors text-sm font-medium"
            >
              {t('welcome.footer.links.terms')}
            </a>
            <a
              href="#"
              className="text-slate-400 hover:text-white transition-colors text-sm font-medium"
            >
              {t('welcome.footer.links.contact')}
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <GlassCard
      variant="dark"
      className="p-8 h-full hover:bg-slate-800/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-900/20 border-white/5 group"
    >
      <div className="mb-6 p-4 bg-slate-900/50 rounded-2xl w-fit border border-white/5 group-hover:border-white/10 transition-colors">
        {icon}
      </div>
      <Heading
        level="h3"
        className="mb-4 text-xl font-semibold text-white group-hover:text-blue-200 transition-colors"
      >
        {title}
      </Heading>
      <Text
        variant="body"
        className="text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors"
      >
        {description}
      </Text>
    </GlassCard>
  );
}

function PricingCard({
  name,
  price,
  interval,
  description,
  badge,
  features,
  cta,
  onCTAClick,
  popular = false,
}: {
  name: string;
  price: string;
  interval: string;
  description: string;
  badge?: string;
  features: string[];
  cta: string;
  onCTAClick: () => void;
  popular?: boolean;
}) {
  return (
    <GlassCard
      variant={popular ? 'glow' : 'dark'}
      className={`p-8 h-full transition-all duration-300 hover:-translate-y-1 ${
        popular
          ? 'border-primary/50 scale-105 shadow-2xl shadow-primary/20'
          : 'border-white/5 hover:border-white/10'
      }`}
    >
      {badge && (
        <div className="mb-4">
          <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-primary to-indigo-600 px-3 py-1 text-sm font-semibold text-white">
            <Zap className="w-4 h-4" />
            {badge}
          </span>
        </div>
      )}

      <div className="mb-4">
        <Heading level="h3" className="text-2xl font-bold text-white mb-2">
          {name}
        </Heading>
        <Text variant="body" className="text-slate-400">
          {description}
        </Text>
      </div>

      <div className="mb-6">
        <div className="flex items-baseline">
          <span className="text-5xl font-bold text-white">{price}</span>
          <span className="text-slate-400 ml-2">{interval}</span>
        </div>
      </div>

      <Button
        variant={popular ? 'primary' : 'outline'}
        onClick={onCTAClick}
        className="w-full mb-6"
      >
        {cta}
      </Button>

      <ul className="space-y-3">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-3">
            <Check className="w-5 h-5 text-accent-success flex-shrink-0 mt-0.5" />
            <span className="text-sm text-slate-300">{feature}</span>
          </li>
        ))}
      </ul>
    </GlassCard>
  );
}
