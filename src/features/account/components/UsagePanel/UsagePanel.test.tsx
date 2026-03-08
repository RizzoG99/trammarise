// src/features/account/components/UsagePanel/UsagePanel.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/i18n';
import { UsagePanel } from './UsagePanel';

// ─── Mocks ───────────────────────────────────────────────

const mockUseSubscription = vi.fn();
vi.mock('@/context/SubscriptionContext', () => ({
  useSubscription: () => mockUseSubscription(),
}));

const mockUseAuth = vi.fn(() => ({ getToken: vi.fn().mockResolvedValue('mock-token') }));
vi.mock('@clerk/react', () => ({ useAuth: () => mockUseAuth() }));

const mockFetchWithAuth = vi.fn();
vi.mock('@/utils/api', () => ({
  fetchWithAuth: (...args: unknown[]) => mockFetchWithAuth(...args),
}));

const mockGetApiConfig = vi.fn();
vi.mock('@/utils/session-storage', () => ({ getApiConfig: () => mockGetApiConfig() }));

// ─── Helpers ──────────────────────────────────────────────

function makeSubscription(overrides = {}) {
  return {
    id: 'sub_1',
    tier: 'free' as const,
    status: 'active' as const,
    currentPeriodStart: '2026-01-01T00:00:00Z',
    currentPeriodEnd: '2026-02-01T00:00:00Z',
    cancelAtPeriodEnd: false,
    minutesIncluded: 60,
    minutesUsed: 0,
    creditsBalance: 0,
    ...overrides,
  };
}

function makeUsageResponse(overrides = {}) {
  return {
    totalMinutes: 10,
    eventCount: 4,
    billingPeriod: '2026-01-01',
    tier: 'free' as const,
    limit: 60,
    remainingMinutes: 50,
    isOverLimit: false,
    ...overrides,
  };
}

function renderPanel() {
  return render(
    <MemoryRouter>
      <I18nextProvider i18n={i18n}>
        <UsagePanel />
      </I18nextProvider>
    </MemoryRouter>
  );
}

// ─── Tests ────────────────────────────────────────────────

describe('UsagePanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetApiConfig.mockReturnValue({
      provider: 'openai',
      apiKey: 'sk-test',
      openaiKey: 'sk-test',
      timestamp: Date.now(),
    });
    mockFetchWithAuth.mockResolvedValue(makeUsageResponse());
  });

  describe('loading state', () => {
    it('shows a loading skeleton while subscription is loading', () => {
      mockUseSubscription.mockReturnValue({ subscription: null, isLoading: true, error: null });
      renderPanel();
      expect(screen.getByRole('status')).toBeInTheDocument();
    });
  });

  describe('error state', () => {
    it('shows an error message when subscription fails', () => {
      mockUseSubscription.mockReturnValue({
        subscription: null,
        isLoading: false,
        error: 'Failed to load',
      });
      renderPanel();
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });

  describe('FreePlanPanel', () => {
    beforeEach(() => {
      mockUseSubscription.mockReturnValue({
        subscription: makeSubscription({ tier: 'free' }),
        isLoading: false,
        error: null,
      });
    });

    it('renders the free plan badge', async () => {
      renderPanel();
      expect(await screen.findByText(/free/i)).toBeInTheDocument();
    });

    it('shows transcription count from API', async () => {
      mockFetchWithAuth.mockResolvedValue(makeUsageResponse({ eventCount: 7 }));
      renderPanel();
      expect(await screen.findByText('7')).toBeInTheDocument();
    });

    it('shows BYOK status when API key is configured', async () => {
      renderPanel();
      expect(await screen.findByText(/byok/i)).toBeInTheDocument();
    });

    it('shows no-key warning when no API key is configured', async () => {
      mockGetApiConfig.mockReturnValue(null);
      renderPanel();
      expect(await screen.findByRole('link', { name: /set up/i })).toBeInTheDocument();
    });

    it('renders a link to the OpenAI billing dashboard', async () => {
      renderPanel();
      const link = await screen.findByRole('link', { name: /openai balance/i });
      expect(link).toHaveAttribute('href', 'https://platform.openai.com/usage');
    });

    it('renders 4 locked features', async () => {
      renderPanel();
      expect(await screen.findByText(/no api key needed/i)).toBeInTheDocument();
      expect(await screen.findByText(/ai chat on results/i)).toBeInTheDocument();
      expect(await screen.findByText(/speaker diarization/i)).toBeInTheDocument();
      expect(await screen.findByText(/cloud sync/i)).toBeInTheDocument();
    });

    it('renders upgrade CTA button linking to /pricing', async () => {
      renderPanel();
      const btns = await screen.findAllByRole('link', { name: /upgrade to pro/i });
      expect(btns.length).toBeGreaterThan(0);
      expect(btns[0]).toHaveAttribute('href', '/pricing');
    });
  });

  describe('ProPlanPanel', () => {
    beforeEach(() => {
      mockUseSubscription.mockReturnValue({
        subscription: makeSubscription({
          tier: 'pro',
          minutesIncluded: 500,
          minutesUsed: 320,
          currentPeriodEnd: '2026-02-01T00:00:00Z',
        }),
        isLoading: false,
        error: null,
      });
      mockFetchWithAuth.mockResolvedValue(makeUsageResponse({ eventCount: 12, tier: 'pro' }));
    });

    it('renders the pro plan badge', async () => {
      renderPanel();
      expect(await screen.findByText('Pro')).toBeInTheDocument();
    });

    it('shows no status badge in normal active state', async () => {
      renderPanel();
      await screen.findByText('Pro');
      expect(screen.queryByText(/cancels|payment failed|unpaid|canceled/i)).not.toBeInTheDocument();
    });

    it('shows the progress bar with correct aria attributes at 64%', async () => {
      renderPanel();
      const bar = await screen.findByRole('progressbar');
      expect(bar).toHaveAttribute('aria-valuenow', '64');
    });

    it('shows transcription count from API', async () => {
      renderPanel();
      expect(await screen.findByText('12')).toBeInTheDocument();
    });

    it('shows amber "Cancels" badge when cancelAtPeriodEnd is true', async () => {
      mockUseSubscription.mockReturnValue({
        subscription: makeSubscription({
          tier: 'pro',
          minutesIncluded: 500,
          minutesUsed: 100,
          cancelAtPeriodEnd: true,
        }),
        isLoading: false,
        error: null,
      });
      renderPanel();
      expect(await screen.findByText(/cancels/i)).toBeInTheDocument();
    });

    it('shows warning banner at ≥ 80% usage', async () => {
      mockUseSubscription.mockReturnValue({
        subscription: makeSubscription({ tier: 'pro', minutesIncluded: 500, minutesUsed: 410 }),
        isLoading: false,
        error: null,
      });
      renderPanel();
      expect(await screen.findByText(/running low/i)).toBeInTheDocument();
    });

    it('shows error banner and upgrade CTA at 100% usage', async () => {
      mockUseSubscription.mockReturnValue({
        subscription: makeSubscription({ tier: 'pro', minutesIncluded: 500, minutesUsed: 500 }),
        isLoading: false,
        error: null,
      });
      renderPanel();
      expect(await screen.findByText(/quota reached/i)).toBeInTheDocument();
      const upgradeLink = await screen.findByRole('link', { name: /upgrade for more/i });
      expect(upgradeLink).toHaveAttribute('href', '/pricing');
    });

    it('shows red "Payment failed" badge for past_due status', async () => {
      mockUseSubscription.mockReturnValue({
        subscription: makeSubscription({
          tier: 'pro',
          status: 'past_due',
          minutesIncluded: 500,
          minutesUsed: 100,
        }),
        isLoading: false,
        error: null,
      });
      renderPanel();
      expect(await screen.findByText(/payment failed/i)).toBeInTheDocument();
    });
  });
});
