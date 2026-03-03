import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { AccountBillingPage } from './AccountBillingPage';

// --- Mocks ---

const mockNavigate = vi.fn();
let mockSearchParams = new URLSearchParams();

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useSearchParams: () => [mockSearchParams],
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const map: Record<string, string> = {
        'account.title': 'Account Settings',
        'account.back': 'Back to app',
        'account.nav.profile': 'Profile',
        'account.nav.apiKeys': 'API Keys',
        'account.nav.plan': 'Plan & Usage',
      };
      return map[key] ?? key;
    },
  }),
}));

vi.mock('@/lib', () => ({
  GlassCard: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={className}>{children}</div>
  ),
  Heading: ({ children, level }: { children: React.ReactNode; level?: string }) => (
    <h1 data-level={level}>{children}</h1>
  ),
}));

vi.mock('../user-menu/components/ProfileTab', () => ({
  ProfileTab: () => <div data-testid="profile-tab">Profile Content</div>,
}));

vi.mock('../user-menu/components/ApiKeysTab', () => ({
  ApiKeysTab: () => <div data-testid="apikeys-tab">API Keys Content</div>,
}));

vi.mock('../user-menu/components/UsageTab', () => ({
  UsageTab: () => <div data-testid="usage-tab">Plan & Usage Content</div>,
}));

// --- Tests ---

describe('AccountBillingPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams = new URLSearchParams();
  });

  it('renders profile section by default', () => {
    render(<AccountBillingPage />);
    expect(screen.getByTestId('profile-tab')).toBeInTheDocument();
    expect(screen.queryByTestId('apikeys-tab')).not.toBeInTheDocument();
    expect(screen.queryByTestId('usage-tab')).not.toBeInTheDocument();
  });

  it('renders sidebar navigation items', () => {
    render(<AccountBillingPage />);
    expect(screen.getByText('Profile')).toBeInTheDocument();
    expect(screen.getByText('API Keys')).toBeInTheDocument();
    expect(screen.getByText('Plan & Usage')).toBeInTheDocument();
  });

  it('switches to API Keys section when clicking sidebar nav', () => {
    render(<AccountBillingPage />);
    fireEvent.click(screen.getByText('API Keys'));
    expect(screen.getByTestId('apikeys-tab')).toBeInTheDocument();
    expect(screen.queryByTestId('profile-tab')).not.toBeInTheDocument();
  });

  it('switches to Plan section when clicking sidebar nav', () => {
    render(<AccountBillingPage />);
    fireEvent.click(screen.getByText('Plan & Usage'));
    expect(screen.getByTestId('usage-tab')).toBeInTheDocument();
    expect(screen.queryByTestId('profile-tab')).not.toBeInTheDocument();
  });

  it('auto-selects API Keys section from ?section=apiKeys query param', () => {
    mockSearchParams = new URLSearchParams('section=apiKeys');
    render(<AccountBillingPage />);
    expect(screen.getByTestId('apikeys-tab')).toBeInTheDocument();
    expect(screen.queryByTestId('profile-tab')).not.toBeInTheDocument();
  });

  it('auto-selects plan section from ?section=plan query param', () => {
    mockSearchParams = new URLSearchParams('section=plan');
    render(<AccountBillingPage />);
    expect(screen.getByTestId('usage-tab')).toBeInTheDocument();
    expect(screen.queryByTestId('profile-tab')).not.toBeInTheDocument();
  });

  it('falls back to profile for unknown ?section param', () => {
    mockSearchParams = new URLSearchParams('section=unknown');
    render(<AccountBillingPage />);
    expect(screen.getByTestId('profile-tab')).toBeInTheDocument();
  });

  it('renders back button', () => {
    render(<AccountBillingPage />);
    expect(screen.getByRole('button', { name: 'Back to app' })).toBeInTheDocument();
  });

  it('back button calls navigate(-1)', () => {
    render(<AccountBillingPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Back to app' }));
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  it('active section button has aria-current="page"', () => {
    render(<AccountBillingPage />);
    const profileBtn = screen.getAllByRole('button').find((b) => b.textContent === 'Profile');
    expect(profileBtn).toHaveAttribute('aria-current', 'page');
  });

  it('inactive section buttons do not have aria-current', () => {
    render(<AccountBillingPage />);
    const apiKeysBtn = screen.getAllByRole('button').find((b) => b.textContent === 'API Keys');
    expect(apiKeysBtn).not.toHaveAttribute('aria-current');
  });
});
