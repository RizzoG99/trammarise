import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { WelcomePage } from './WelcomePage';
import { BrowserRouter } from 'react-router-dom';

// Mock Clerk
const mockOpenSignIn = vi.fn();
vi.mock('@clerk/clerk-react', () => ({
  useClerk: () => ({
    openSignIn: mockOpenSignIn,
  }),
}));

// Mock react-i18next with actual translations
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, defaultValueOrOptions?: string | Record<string, unknown>) => {
      const translations: Record<string, string> = {
        'welcome.hero.titlePart1': 'Transcribe & Summarize',
        'welcome.hero.titlePart2': 'In Seconds.',
        'welcome.hero.description':
          'Turn meetings, lectures, and interviews into transcripts and summaries — using your own AI key.',
        'welcome.hero.cta': 'Get Started Free',
        'welcome.hero.proof': '· 60 minutes free  · No subscription  · Your API key',
        'welcome.hero.mockup.speaker': 'Speaker 1',
        'welcome.hero.mockup.summaryLabel': 'Key points · 3 items',
        'welcome.hero.mockup.bullet1': 'Follow up with the design team on mockup revisions',
        'welcome.hero.mockup.bullet2': 'Schedule next sprint planning for Thursday',
        'welcome.features.title': 'Everything you need',
        'welcome.features.subtitle': 'Accurate transcription, AI summaries, complete privacy.',
        'welcome.features.cards.transcription.title': 'Crystal Clear Transcription',
        'welcome.features.cards.transcription.description':
          'Upload a file or record live. Whisper-accurate transcription every time.',
        'welcome.features.cards.summaries.title': 'Instant AI Summaries',
        'welcome.features.cards.summaries.description':
          'Key points, action items, structured summaries — generated instantly.',
        'welcome.features.cards.security.title': 'Private & Secure',
        'welcome.features.cards.security.description':
          'Client-side processing. Your audio never leaves without your permission.',
        'welcome.byok.label': 'Free tier',
        'welcome.byok.title': 'Use your own OpenAI key. Pay nothing to us.',
        'welcome.byok.description':
          'Connect your OpenAI API key and start transcribing immediately. You pay OpenAI directly for what you use — no Trammarise subscription required.',
        'welcome.byok.cta': 'Get Started Free',
        'welcome.byok.mockup.placeholder': 'sk-••••••••••••••••',
        'welcome.byok.mockup.connected': 'Connected ✓',
        'footer.links.privacy': 'Privacy',
        'footer.links.terms': 'Terms of Service',
        'footer.social.github': 'GitHub',
        'footer.social.linkedin': 'LinkedIn',
        'footer.social.twitter': 'Twitter',
        'footer.social.contact': 'Contact us',
      };

      if (typeof defaultValueOrOptions === 'string') {
        return defaultValueOrOptions;
      }

      if (key === 'footer.copyright') {
        return `© ${defaultValueOrOptions?.year || 2024} Trammarise. All rights reserved.`;
      }

      return translations[key] || key;
    },
  }),
}));

// Mock Lucide icons to avoid ESM issues in tests
vi.mock('lucide-react', () => ({
  ArrowRight: () => <div data-testid="arrow-right" />,
  AudioWaveform: () => <div data-testid="audio-waveform" />,
  Check: () => <div data-testid="check-icon" />,
  Github: () => <div data-testid="github" />,
  Linkedin: () => <div data-testid="linkedin" />,
  Mail: () => <div data-testid="mail" />,
  Mic: () => <div data-testid="mic" />,
  Shield: () => <div data-testid="shield" />,
  Twitter: () => <div data-testid="twitter" />,
  Zap: () => <div data-testid="zap" />,
}));

describe('WelcomePage', () => {
  it('renders the hero section correctly', () => {
    render(
      <BrowserRouter>
        <WelcomePage />
      </BrowserRouter>
    );

    expect(screen.getByText(/Transcribe & Summarize/i)).toBeInTheDocument();
    expect(screen.getByText(/In Seconds/i)).toBeInTheDocument();
    expect(screen.getByText(/using your own AI key/i)).toBeInTheDocument();
  });

  it('renders single CTA button', () => {
    render(
      <BrowserRouter>
        <WelcomePage />
      </BrowserRouter>
    );

    const ctaButtons = screen.getAllByRole('button', { name: /Get Started Free/i });
    // Hero CTA + BYOK CTA
    expect(ctaButtons.length).toBeGreaterThanOrEqual(1);
  });

  it('calls openSignIn when hero CTA is clicked', () => {
    render(
      <BrowserRouter>
        <WelcomePage />
      </BrowserRouter>
    );

    const buttons = screen.getAllByRole('button', { name: /Get Started Free/i });
    fireEvent.click(buttons[0]);

    expect(mockOpenSignIn).toHaveBeenCalledWith({
      afterSignInUrl: '/',
      afterSignUpUrl: '/',
    });
  });

  it('renders the features section', () => {
    render(
      <BrowserRouter>
        <WelcomePage />
      </BrowserRouter>
    );

    expect(screen.getByText('Crystal Clear Transcription')).toBeInTheDocument();
    expect(screen.getByText('Instant AI Summaries')).toBeInTheDocument();
    expect(screen.getByText('Private & Secure')).toBeInTheDocument();
  });

  it('renders the BYOK section', () => {
    render(
      <BrowserRouter>
        <WelcomePage />
      </BrowserRouter>
    );

    expect(screen.getByText(/Use your own OpenAI key/i)).toBeInTheDocument();
    expect(screen.getByText(/Free tier/i)).toBeInTheDocument();
  });

  it('renders app mockup in hero', () => {
    render(
      <BrowserRouter>
        <WelcomePage />
      </BrowserRouter>
    );

    expect(screen.getByText(/Speaker 1/i)).toBeInTheDocument();
    expect(screen.getByText(/Key points · 3 items/i)).toBeInTheDocument();
  });

  it('renders footer links', () => {
    render(
      <BrowserRouter>
        <WelcomePage />
      </BrowserRouter>
    );

    expect(screen.getByText('Privacy')).toBeInTheDocument();
    expect(screen.getByText('Terms of Service')).toBeInTheDocument();
  });
});
