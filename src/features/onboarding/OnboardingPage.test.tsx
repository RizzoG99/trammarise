import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { OnboardingPage } from './OnboardingPage';

// --- Mocks ---

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const map: Record<string, string> = {
        'onboarding.title': 'Welcome to Trammarise',
        'onboarding.subtitle': "Let's get you set up in a few steps",
        'onboarding.step1.title': 'How will you use Trammarise?',
        'onboarding.step1.subtitle': 'Choose your primary use case',
        'onboarding.step2.title': 'Choose your plan',
        'onboarding.step2.subtitle': 'Start free, upgrade anytime',
        'onboarding.step3.title': 'Connect your API key',
        'onboarding.step3.subtitle': 'Stored securely in your browser session',
        'onboarding.navigation.back': 'Back',
        'onboarding.navigation.next': 'Next',
        'onboarding.navigation.skip': 'Skip for now',
        'onboarding.navigation.finish': 'Get Started',
        'onboarding.steps.useCase': 'Use Case',
        'onboarding.steps.plan': 'Plan',
        'onboarding.steps.apiSetup': 'API Setup',
        'onboarding.step3.rememberKey': 'Remember my key across sessions',
        'onboarding.step3.errorFormat': 'API key must start with "sk-"',
        'onboarding.step3.errorInvalid': 'Invalid API key. Please check and try again.',
        'onboarding.step3.validating': 'Verifying…',
      };
      return map[key] ?? key;
    },
  }),
}));

const mockCompleteOnboarding = vi.fn();

const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock('@/context/OnboardingContext', () => ({
  useOnboarding: () => ({
    completeOnboarding: mockCompleteOnboarding,
    needsOnboarding: true,
    isCheckingOnboarding: false,
    isViewingPricing: false,
    setIsViewingPricing: vi.fn(),
  }),
}));

const mockSaveApiConfig = vi.fn();
vi.mock('@/utils/session-storage', () => ({
  saveApiConfig: (...args: unknown[]) => mockSaveApiConfig(...args),
}));

const mockValidateApiKey = vi.fn();
vi.mock('@/utils/api', () => ({
  validateApiKey: (...args: unknown[]) => mockValidateApiKey(...args),
}));

// Stub lib components to keep tests focused
vi.mock('@/lib', () => ({
  GlassCard: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={className}>{children}</div>
  ),
  Heading: ({ children, level }: { children: React.ReactNode; level?: string }) => (
    <h2 data-level={level}>{children}</h2>
  ),
  Text: ({ children }: { children: React.ReactNode }) => <p>{children}</p>,
  Button: ({
    children,
    onClick,
    disabled,
    variant,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    variant?: string;
  }) => (
    <button onClick={onClick} disabled={disabled} data-variant={variant}>
      {children}
    </button>
  ),
  StepIndicator: ({
    steps,
    currentStep,
  }: {
    steps: { id: number; label: string }[];
    currentStep: number;
  }) => (
    <nav aria-label="Progress">
      {steps.map((s) => (
        <span
          key={s.id}
          data-testid={`step-${s.id}`}
          aria-current={s.id === currentStep ? 'step' : undefined}
        >
          {s.label}
        </span>
      ))}
    </nav>
  ),
  PricingCard: ({
    plan,
    onSelect,
  }: {
    plan: { id: string; name: string };
    onSelect: () => void;
  }) => (
    <div data-testid={`pricing-card-${plan.id}`}>
      <span>{plan.name}</span>
      <button onClick={onSelect}>Select {plan.name}</button>
    </div>
  ),
}));

// --- Tests ---

describe('OnboardingPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockValidateApiKey.mockResolvedValue(true);
  });

  // Step 1
  describe('Step 1 — Use Case', () => {
    it('renders step 1 heading', () => {
      render(<OnboardingPage />);
      expect(screen.getByText('How will you use Trammarise?')).toBeInTheDocument();
    });

    it('shows StepIndicator with 3 steps', () => {
      render(<OnboardingPage />);
      expect(screen.getByLabelText('Progress')).toBeInTheDocument();
      expect(screen.getByTestId('step-1')).toHaveAttribute('aria-current', 'step');
      expect(screen.getByTestId('step-2')).not.toHaveAttribute('aria-current');
      expect(screen.getByTestId('step-3')).not.toHaveAttribute('aria-current');
    });

    it('does NOT show Back button on step 1', () => {
      render(<OnboardingPage />);
      expect(screen.queryByText('Back')).not.toBeInTheDocument();
    });

    it('shows Skip and Next buttons on step 1', () => {
      render(<OnboardingPage />);
      expect(screen.getByText('Skip for now')).toBeInTheDocument();
      expect(screen.getByText('Next')).toBeInTheDocument();
    });

    it('renders use case options', () => {
      render(<OnboardingPage />);
      expect(screen.getByText(/meeting/i)).toBeInTheDocument();
      expect(screen.getByText(/lecture/i)).toBeInTheDocument();
    });

    it('Skip calls completeOnboarding', () => {
      render(<OnboardingPage />);
      fireEvent.click(screen.getByText('Skip for now'));
      expect(mockCompleteOnboarding).toHaveBeenCalledTimes(1);
    });

    it('Next advances to step 2 (Plan)', () => {
      render(<OnboardingPage />);
      fireEvent.click(screen.getByText('Next'));
      expect(screen.getByText('Choose your plan')).toBeInTheDocument();
    });
  });

  // Step 2 — Plan
  describe('Step 2 — Plan', () => {
    const goToStep2 = () => {
      render(<OnboardingPage />);
      fireEvent.click(screen.getByText('Next'));
    };

    it('renders step 2 heading', () => {
      goToStep2();
      expect(screen.getByText('Choose your plan')).toBeInTheDocument();
    });

    it('step 2 is active in StepIndicator', () => {
      goToStep2();
      expect(screen.getByTestId('step-2')).toHaveAttribute('aria-current', 'step');
    });

    it('shows Back button on step 2', () => {
      goToStep2();
      expect(screen.getByText('Back')).toBeInTheDocument();
    });

    it('Back returns to step 1', () => {
      goToStep2();
      fireEvent.click(screen.getByText('Back'));
      expect(screen.getByText('How will you use Trammarise?')).toBeInTheDocument();
    });

    it('shows pricing cards', () => {
      goToStep2();
      expect(screen.getByTestId('pricing-card-free')).toBeInTheDocument();
      expect(screen.getByTestId('pricing-card-pro')).toBeInTheDocument();
    });

    it('does not show a footer Next button on step 2', () => {
      goToStep2();
      expect(screen.queryByText('Next')).not.toBeInTheDocument();
    });

    it('selecting Free plan advances to API key step', () => {
      goToStep2();
      fireEvent.click(screen.getByText('Select Free'));
      expect(screen.getByText('Connect your API key')).toBeInTheDocument();
    });

    it('selecting Pro plan calls completeOnboarding and navigates to account', () => {
      goToStep2();
      fireEvent.click(screen.getByText('Select Pro'));
      expect(mockCompleteOnboarding).toHaveBeenCalledTimes(1);
      expect(mockNavigate).toHaveBeenCalledWith('/account');
    });

    it('Skip on step 2 calls completeOnboarding', () => {
      goToStep2();
      fireEvent.click(screen.getByText('Skip for now'));
      expect(mockCompleteOnboarding).toHaveBeenCalledTimes(1);
    });
  });

  // Step 3 — API Setup (only reached by Free plan users)
  describe('Step 3 — API Setup', () => {
    const goToStep3 = () => {
      render(<OnboardingPage />);
      fireEvent.click(screen.getByText('Next')); // → step 2 Plan
      fireEvent.click(screen.getByText('Select Free')); // → step 3 API Key
    };

    it('renders step 3 heading', () => {
      goToStep3();
      expect(screen.getByText('Connect your API key')).toBeInTheDocument();
    });

    it('step 3 is active in StepIndicator', () => {
      goToStep3();
      expect(screen.getByTestId('step-3')).toHaveAttribute('aria-current', 'step');
    });

    it('shows Back button on step 3', () => {
      goToStep3();
      expect(screen.getByText('Back')).toBeInTheDocument();
    });

    it('Back returns to step 2 (Plan)', () => {
      goToStep3();
      fireEvent.click(screen.getByText('Back'));
      expect(screen.getByText('Choose your plan')).toBeInTheDocument();
    });

    it('shows API key input', () => {
      goToStep3();
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('shows validation error for invalid key format', () => {
      goToStep3();
      fireEvent.change(screen.getByRole('textbox'), { target: { value: 'invalid-key' } });
      fireEvent.click(screen.getByText('Get Started'));
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('does NOT complete on invalid key', () => {
      goToStep3();
      fireEvent.change(screen.getByRole('textbox'), { target: { value: 'bad' } });
      fireEvent.click(screen.getByText('Get Started'));
      expect(screen.getByText('Connect your API key')).toBeInTheDocument();
      expect(mockCompleteOnboarding).not.toHaveBeenCalled();
    });

    it('saves valid key and completes onboarding when checkbox is unchecked', async () => {
      goToStep3();
      fireEvent.change(screen.getByRole('textbox'), { target: { value: 'sk-validkey123' } });
      fireEvent.click(screen.getByText('Get Started'));
      await waitFor(() => expect(mockCompleteOnboarding).toHaveBeenCalledTimes(1));
      expect(mockSaveApiConfig).toHaveBeenCalledWith(
        'openai',
        'sk-validkey123',
        'sk-validkey123',
        false
      );
    });

    it('shows "Remember my key" checkbox', () => {
      goToStep3();
      expect(screen.getByRole('checkbox')).toBeInTheDocument();
      expect(screen.getByText('Remember my key across sessions')).toBeInTheDocument();
    });

    it('checkbox is unchecked by default', () => {
      goToStep3();
      expect(screen.getByRole('checkbox')).not.toBeChecked();
    });

    it('saves with persist=true when checkbox is checked', async () => {
      goToStep3();
      fireEvent.click(screen.getByRole('checkbox'));
      fireEvent.change(screen.getByRole('textbox'), { target: { value: 'sk-validkey123' } });
      fireEvent.click(screen.getByText('Get Started'));
      await waitFor(() =>
        expect(mockSaveApiConfig).toHaveBeenCalledWith(
          'openai',
          'sk-validkey123',
          'sk-validkey123',
          true
        )
      );
    });

    it('shows error when API key is rejected by server', async () => {
      mockValidateApiKey.mockResolvedValue(false);
      goToStep3();
      fireEvent.change(screen.getByRole('textbox'), { target: { value: 'sk-badkey' } });
      fireEvent.click(screen.getByText('Get Started'));
      await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument());
      expect(screen.getByText('Invalid API key. Please check and try again.')).toBeInTheDocument();
      expect(screen.getByText('Connect your API key')).toBeInTheDocument();
    });

    it('disables Get Started button and shows validating label during check', async () => {
      let resolve: (v: boolean) => void;
      mockValidateApiKey.mockReturnValue(
        new Promise((r) => {
          resolve = r;
        })
      );
      goToStep3();
      fireEvent.change(screen.getByRole('textbox'), { target: { value: 'sk-validkey123' } });
      fireEvent.click(screen.getByText('Get Started'));
      await waitFor(() => expect(screen.getByText('Verifying…')).toBeInTheDocument());
      expect(screen.getByText('Verifying…').closest('button')).toBeDisabled();
      resolve!(true);
      await waitFor(() => expect(mockCompleteOnboarding).toHaveBeenCalledTimes(1));
    });

    it('Skip on step 3 calls completeOnboarding', () => {
      goToStep3();
      fireEvent.click(screen.getByText('Skip for now'));
      expect(mockCompleteOnboarding).toHaveBeenCalledTimes(1);
    });
  });
});
