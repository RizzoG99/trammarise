import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { ApiKeySetupBanner } from './ApiKeySetupBanner';

// --- Mocks ---

const mockNavigate = vi.fn();

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const map: Record<string, string> = {
        'onboarding.setupBanner.message': 'No API key configured — add yours to start transcribing',
        'onboarding.setupBanner.cta': 'Set up API key',
        'onboarding.setupBanner.dismiss': 'Dismiss',
      };
      return map[key] ?? key;
    },
  }),
}));

// Default: no key in storage
const mockGetApiConfig = vi.fn(() => null);
vi.mock('@/utils/session-storage', () => ({
  getApiConfig: () => mockGetApiConfig(),
}));

const mockSubscription = vi.fn(() => ({ isSubscribed: false }));
const mockOnboarding = vi.fn(() => ({ needsOnboarding: false, isCheckingOnboarding: false }));

vi.mock('@/context/SubscriptionContext', () => ({
  useSubscription: () => mockSubscription(),
}));

vi.mock('@/context/OnboardingContext', () => ({
  useOnboarding: () => mockOnboarding(),
}));

vi.mock('@/types/routing', () => ({
  ROUTES: { ACCOUNT: '/account' },
}));

// --- Tests ---

describe('ApiKeySetupBanner', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetApiConfig.mockReturnValue(null);
    mockSubscription.mockReturnValue({ isSubscribed: false });
    mockOnboarding.mockReturnValue({ needsOnboarding: false, isCheckingOnboarding: false });
  });

  it('renders when free + no key + onboarding done', () => {
    render(<ApiKeySetupBanner />);
    expect(
      screen.getByText('No API key configured — add yours to start transcribing')
    ).toBeInTheDocument();
  });

  it('does not render when API key is present in session storage', () => {
    mockGetApiConfig.mockReturnValue({
      openaiKey: 'sk-abc123',
      provider: 'openai',
      apiKey: 'sk-abc123',
      timestamp: 0,
    });
    render(<ApiKeySetupBanner />);
    expect(
      screen.queryByText('No API key configured — add yours to start transcribing')
    ).not.toBeInTheDocument();
  });

  it('does not render when user is subscribed', () => {
    mockSubscription.mockReturnValue({ isSubscribed: true });
    render(<ApiKeySetupBanner />);
    expect(
      screen.queryByText('No API key configured — add yours to start transcribing')
    ).not.toBeInTheDocument();
  });

  it('does not render while checking onboarding', () => {
    mockOnboarding.mockReturnValue({ needsOnboarding: false, isCheckingOnboarding: true });
    render(<ApiKeySetupBanner />);
    expect(
      screen.queryByText('No API key configured — add yours to start transcribing')
    ).not.toBeInTheDocument();
  });

  it('does not render when needsOnboarding is true', () => {
    mockOnboarding.mockReturnValue({ needsOnboarding: true, isCheckingOnboarding: false });
    render(<ApiKeySetupBanner />);
    expect(
      screen.queryByText('No API key configured — add yours to start transcribing')
    ).not.toBeInTheDocument();
  });

  it('dismiss button hides the banner', () => {
    render(<ApiKeySetupBanner />);
    fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }));
    expect(
      screen.queryByText('No API key configured — add yours to start transcribing')
    ).not.toBeInTheDocument();
  });

  it('CTA button navigates to /account?section=apiKeys', () => {
    render(<ApiKeySetupBanner />);
    fireEvent.click(screen.getByText('Set up API key'));
    expect(mockNavigate).toHaveBeenCalledWith('/account?section=apiKeys');
  });

  it('has role="alert" for accessibility', () => {
    render(<ApiKeySetupBanner />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });
});
