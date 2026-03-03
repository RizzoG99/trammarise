import { render, screen, fireEvent } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { UpgradeModal } from './UpgradeModal';
import { BrowserRouter } from 'react-router-dom';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, defaultValueOrOptions?: string | Record<string, unknown>) => {
      if (typeof defaultValueOrOptions === 'string') {
        return defaultValueOrOptions;
      }
      return key;
    },
  }),
}));

describe('UpgradeModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    trigger: 'limit_reached' as const,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderModal = (props = {}) => {
    return render(
      <BrowserRouter>
        <UpgradeModal {...defaultProps} {...props} />
      </BrowserRouter>
    );
  };

  it('renders correctly when open', () => {
    renderModal();
    // Modal title from translations default value
    expect(screen.getByText("You've reached your free limit")).toBeInTheDocument();

    // Check if right column PricingCard contains "Pro"
    expect(screen.getByText('Pro')).toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    renderModal({ isOpen: false });
    expect(screen.queryByText("You've reached your free limit")).not.toBeInTheDocument();
  });

  it('calls onClose when Maybe Later is clicked', () => {
    renderModal();
    const closeButtons = screen.getAllByRole('button', { name: /Maybe Later|×/i });
    // Click the "Maybe Later" button
    const maybeLaterBtn = closeButtons.find((btn) => btn.textContent === 'Maybe Later');
    if (maybeLaterBtn) {
      fireEvent.click(maybeLaterBtn);
    }
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('navigates to /pricing when CTA is clicked', () => {
    renderModal();
    const upgradeButton = screen.getByRole('button', { name: /View Plans & Upgrade/i });
    fireEvent.click(upgradeButton);
    expect(defaultProps.onClose).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/pricing', { state: { from: 'results' } });
  });

  it('toggles billing period', () => {
    renderModal();
    const toggleSwitch = screen.getByRole('switch', { name: /Annual Billing/i });
    expect(toggleSwitch).toHaveAttribute('aria-checked', 'false'); // defaults to monthly

    fireEvent.click(toggleSwitch);
    expect(toggleSwitch).toHaveAttribute('aria-checked', 'true'); // now annual
  });

  describe('speaker_diarization trigger', () => {
    it('renders the transcript preview layout', () => {
      renderModal({ trigger: 'speaker_diarization' });
      // Preview utterances visible
      expect(screen.getByText(/Thanks everyone for joining/)).toBeInTheDocument();
      expect(screen.getByText(/Should we start with the roadmap/)).toBeInTheDocument();
    });

    it('does not render a billing toggle', () => {
      renderModal({ trigger: 'speaker_diarization' });
      expect(screen.queryByRole('switch', { name: /Annual Billing/i })).not.toBeInTheDocument();
    });

    it('renders "Unlock Speaker ID" CTA button', () => {
      renderModal({ trigger: 'speaker_diarization' });
      expect(screen.getByRole('button', { name: /Unlock Speaker ID/i })).toBeInTheDocument();
    });

    it('navigates to /pricing when CTA is clicked', () => {
      renderModal({ trigger: 'speaker_diarization' });
      fireEvent.click(screen.getByRole('button', { name: /Unlock Speaker ID/i }));
      expect(defaultProps.onClose).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/pricing', {
        state: { from: 'speaker_diarization' },
      });
    });

    it('calls onClose when Maybe Later is clicked', () => {
      renderModal({ trigger: 'speaker_diarization' });
      fireEvent.click(screen.getByRole('button', { name: /Maybe Later/i }));
      expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    });

    it('renders the annual hint link', () => {
      renderModal({ trigger: 'speaker_diarization' });
      expect(screen.getByText(/or pay annually and save 2 months/i)).toBeInTheDocument();
    });

    it('navigates to /pricing with annual billing when annual hint is clicked', () => {
      renderModal({ trigger: 'speaker_diarization' });
      fireEvent.click(screen.getByText(/or pay annually and save 2 months/i));
      expect(defaultProps.onClose).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/pricing', {
        state: { from: 'speaker_diarization', billingInterval: 'year' },
      });
    });
  });

  it('renders different content based on trigger', () => {
    const { rerender } = render(
      <BrowserRouter>
        <UpgradeModal {...defaultProps} trigger="chat_gate" />
      </BrowserRouter>
    );
    expect(screen.getByText('Unlock AI Chat')).toBeInTheDocument();

    rerender(
      <BrowserRouter>
        <UpgradeModal {...defaultProps} trigger="watermark_remove" />
      </BrowserRouter>
    );
    expect(screen.getByText('Remove Watermark')).toBeInTheDocument();

    rerender(
      <BrowserRouter>
        <UpgradeModal {...defaultProps} trigger="history_limit" />
      </BrowserRouter>
    );
    expect(screen.getByText('Unlock Your Full History')).toBeInTheDocument();

    rerender(
      <BrowserRouter>
        <UpgradeModal {...defaultProps} trigger="generic" />
      </BrowserRouter>
    );
    expect(screen.getByText('Upgrade to Pro')).toBeInTheDocument();
  });
});
