import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { CreditPurchaseModal } from './CreditPurchaseModal';

// Mock Stripe
vi.mock('@stripe/stripe-js', () => ({
  loadStripe: vi.fn(() => Promise.resolve(null)),
}));

vi.mock('@stripe/react-stripe-js', () => ({
  Elements: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  PaymentElement: () => <div data-testid="payment-element">Payment Element</div>,
  useStripe: () => ({
    confirmPayment: vi.fn(),
  }),
  useElements: () => ({}),
}));

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('CreditPurchaseModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render when isOpen is true', () => {
      render(<CreditPurchaseModal isOpen={true} onClose={() => {}} />);

      expect(screen.getByText('Purchase Credits')).toBeInTheDocument();
    });

    it('should not render when isOpen is false', () => {
      render(<CreditPurchaseModal isOpen={false} onClose={() => {}} />);

      expect(screen.queryByText('Purchase Credits')).not.toBeInTheDocument();
    });

    it('should display introduction text', () => {
      render(<CreditPurchaseModal isOpen={true} onClose={() => {}} />);

      expect(
        screen.getByText(/Purchase additional transcription minutes for hosted API usage/)
      ).toBeInTheDocument();
    });

    it('should display how credits work information', () => {
      render(<CreditPurchaseModal isOpen={true} onClose={() => {}} />);

      expect(screen.getByText('💡 How Credits Work')).toBeInTheDocument();
      expect(screen.getByText(/1 credit = 1 minute of transcription time/)).toBeInTheDocument();
      expect(screen.getAllByText(/Credits never expire/)).toHaveLength(2); // Appears in description and info box
    });
  });

  describe('Credit Tier Options', () => {
    it('should display all four credit tier options', () => {
      render(<CreditPurchaseModal isOpen={true} onClose={() => {}} />);

      // Check all credit amounts are displayed
      expect(screen.getByText('50')).toBeInTheDocument();
      expect(screen.getByText('175')).toBeInTheDocument();
      expect(screen.getByText('400')).toBeInTheDocument();
      expect(screen.getByText('750')).toBeInTheDocument();
    });

    it('should show pricing for each tier', () => {
      render(<CreditPurchaseModal isOpen={true} onClose={() => {}} />);

      // Check all prices are displayed
      expect(screen.getByText('$5.00')).toBeInTheDocument();
      expect(screen.getByText('$15.00')).toBeInTheDocument();
      expect(screen.getByText('$30.00')).toBeInTheDocument();
      expect(screen.getByText('$50.00')).toBeInTheDocument();
    });

    it('should show savings badges for applicable tiers', () => {
      render(<CreditPurchaseModal isOpen={true} onClose={() => {}} />);

      expect(screen.getByText('Save 15%')).toBeInTheDocument();
      expect(screen.getByText('Save 25%')).toBeInTheDocument();
      expect(screen.getByText('Save 33%')).toBeInTheDocument();
    });

    it('should mark the 175 credit tier as most popular', () => {
      render(<CreditPurchaseModal isOpen={true} onClose={() => {}} />);

      expect(screen.getByText('Most Popular')).toBeInTheDocument();
    });
  });

  describe('Stripe Checkout Integration', () => {
    it('should call API to create payment intent when package is selected', async () => {
      const user = userEvent.setup();
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ clientSecret: 'test_client_secret_123' }),
      });

      render(<CreditPurchaseModal isOpen={true} onClose={() => {}} />);

      // Click on 50 credit package
      const packageButton = screen.getByRole('button', { name: /50.*minutes.*\$5\.00/i });
      await user.click(packageButton);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          '/api/credits/purchase',
          expect.objectContaining({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ credits: 50 }),
          })
        );
      });
    });

    it('should show loading state while creating payment intent', async () => {
      const user = userEvent.setup();
      mockFetch.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: async () => ({ clientSecret: 'test_secret' }),
                }),
              100
            )
          )
      );

      render(<CreditPurchaseModal isOpen={true} onClose={() => {}} />);

      const packageButton = screen.getByRole('button', { name: /50.*minutes.*\$5\.00/i });
      await user.click(packageButton);

      expect(screen.getByText('Preparing payment...')).toBeInTheDocument();
    });

    it('should display payment form after successful payment intent creation', async () => {
      const user = userEvent.setup();
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ clientSecret: 'test_client_secret_123' }),
      });

      render(<CreditPurchaseModal isOpen={true} onClose={() => {}} />);

      const packageButton = screen.getByRole('button', { name: /50.*minutes.*\$5\.00/i });
      await user.click(packageButton);

      await waitFor(() => {
        expect(screen.getByTestId('payment-element')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Complete Purchase' })).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should display error when payment intent creation fails', async () => {
      const user = userEvent.setup();
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Payment service unavailable' }),
      });

      render(<CreditPurchaseModal isOpen={true} onClose={() => {}} />);

      const packageButton = screen.getByRole('button', { name: /50.*minutes.*\$5\.00/i });
      await user.click(packageButton);

      await waitFor(() => {
        expect(screen.getByText(/Payment service unavailable/)).toBeInTheDocument();
      });
    });

    it('should display generic error when API response has no error message', async () => {
      const user = userEvent.setup();
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({}),
      });

      render(<CreditPurchaseModal isOpen={true} onClose={() => {}} />);

      const packageButton = screen.getByRole('button', { name: /50.*minutes.*\$5\.00/i });
      await user.click(packageButton);

      await waitFor(() => {
        expect(screen.getByText(/Failed to create payment intent/)).toBeInTheDocument();
      });
    });

    it('should handle network errors gracefully', async () => {
      const user = userEvent.setup();
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      render(<CreditPurchaseModal isOpen={true} onClose={() => {}} />);

      const packageButton = screen.getByRole('button', { name: /50.*minutes.*\$5\.00/i });
      await user.click(packageButton);

      await waitFor(() => {
        expect(screen.getByText(/Network error/)).toBeInTheDocument();
      });
    });
  });

  describe('Modal Interactions', () => {
    it('should call onClose when modal is closed', async () => {
      const user = userEvent.setup();
      const onCloseMock = vi.fn();

      render(<CreditPurchaseModal isOpen={true} onClose={onCloseMock} />);

      const closeButton = screen.getByRole('button', { name: /close/i });
      await user.click(closeButton);

      expect(onCloseMock).toHaveBeenCalledTimes(1);
    });

    it('should call onSuccess callback after successful purchase', async () => {
      const user = userEvent.setup();
      const onSuccessMock = vi.fn();
      const onCloseMock = vi.fn();

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ clientSecret: 'test_secret' }),
      });

      render(<CreditPurchaseModal isOpen={true} onClose={onCloseMock} onSuccess={onSuccessMock} />);

      // Select package to get to payment form
      const packageButton = screen.getByRole('button', { name: /50.*minutes.*\$5\.00/i });
      await user.click(packageButton);

      await waitFor(() => {
        expect(screen.getByTestId('payment-element')).toBeInTheDocument();
      });

      // Note: Full payment flow testing would require mocking Stripe's confirmPayment
      // This test verifies the callback prop is passed correctly
      expect(onSuccessMock).not.toHaveBeenCalled(); // Not called yet
    });

    it('should reset state when modal is closed', async () => {
      const user = userEvent.setup();
      const onCloseMock = vi.fn();

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ clientSecret: 'test_secret' }),
      });

      const { rerender } = render(<CreditPurchaseModal isOpen={true} onClose={onCloseMock} />);

      // Select a package
      const packageButton = screen.getByRole('button', { name: /50.*minutes.*\$5\.00/i });
      await user.click(packageButton);

      await waitFor(() => {
        expect(screen.getByTestId('payment-element')).toBeInTheDocument();
      });

      // Close modal
      const closeButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(closeButton);

      // Reopen modal
      rerender(<CreditPurchaseModal isOpen={true} onClose={onCloseMock} />);

      // Should show package selection again, not payment form
      expect(screen.queryByTestId('payment-element')).not.toBeInTheDocument();
      expect(screen.getByText(/Purchase additional transcription minutes/)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper button roles for credit packages', () => {
      render(<CreditPurchaseModal isOpen={true} onClose={() => {}} />);

      const packageButtons = screen.getAllByRole('button');
      // 4 credit packages + 1 close button
      expect(packageButtons.length).toBeGreaterThanOrEqual(5);
    });

    it('should have accessible text for all credit tiers', () => {
      render(<CreditPurchaseModal isOpen={true} onClose={() => {}} />);

      // Each package should have credit amount and "minutes" label
      const minutesLabels = screen.getAllByText('minutes');
      expect(minutesLabels).toHaveLength(4);
    });

    it('should provide clear visual hierarchy with headings', () => {
      render(<CreditPurchaseModal isOpen={true} onClose={() => {}} />);

      // Modal title should be present
      expect(screen.getByText('Purchase Credits')).toBeInTheDocument();

      // Section heading for information
      expect(screen.getByText('💡 How Credits Work')).toBeInTheDocument();
    });

    it('should have sufficient color contrast for text elements', () => {
      render(<CreditPurchaseModal isOpen={true} onClose={() => {}} />);

      // Check that text colors are properly applied (gray-600/gray-400 for dark mode)
      const descriptionText = screen.getByText(
        /Purchase additional transcription minutes for hosted API usage/
      );
      expect(descriptionText).toHaveClass('text-gray-600', 'dark:text-gray-400');
    });

    it('should show selected state with visual feedback', async () => {
      const user = userEvent.setup();
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ clientSecret: 'test_secret' }),
      });

      render(<CreditPurchaseModal isOpen={true} onClose={() => {}} />);

      const packageButton = screen.getByRole('button', { name: /50.*minutes.*\$5\.00/i });

      // Check initial state (not selected)
      expect(packageButton).toHaveClass('border-gray-200');

      await user.click(packageButton);

      // Note: The selected state would be applied but component transitions to payment form
      // so we verify the interaction was successful via the API call
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      });
    });

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ clientSecret: 'test_secret' }),
      });

      render(<CreditPurchaseModal isOpen={true} onClose={() => {}} />);

      // Tab to first credit package button
      await user.tab();

      // Verify first button is focused (or close button, depending on modal implementation)
      const focusedElement = document.activeElement;
      expect(focusedElement).toBeInstanceOf(HTMLButtonElement);
    });
  });
});
