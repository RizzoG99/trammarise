import { render, screen, fireEvent } from '@testing-library/react';
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
        'onboarding.step2.title': 'Connect your API key',
        'onboarding.step2.subtitle': 'Stored securely in your browser session',
        'onboarding.step3.title': 'Choose your plan',
        'onboarding.step3.subtitle': 'Start free, upgrade anytime',
        'onboarding.navigation.back': 'Back',
        'onboarding.navigation.next': 'Next',
        'onboarding.navigation.skip': 'Skip for now',
        'onboarding.navigation.finish': 'Get Started',
        'onboarding.steps.useCase': 'Use Case',
        'onboarding.steps.apiSetup': 'API Setup',
        'onboarding.steps.plan': 'Plan',
        'onboarding.step2.rememberKey': 'Remember my key across sessions',
      };
      return map[key] ?? key;
    },
  }),
}));

const mockCompleteOnboarding = vi.fn();

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

    it('Next advances to step 2', () => {
      render(<OnboardingPage />);
      fireEvent.click(screen.getByText('Next'));
      expect(screen.getByText('Connect your API key')).toBeInTheDocument();
    });
  });

  // Step 2
  describe('Step 2 — API Setup', () => {
    const goToStep2 = () => {
      render(<OnboardingPage />);
      fireEvent.click(screen.getByText('Next'));
    };

    it('renders step 2 heading', () => {
      goToStep2();
      expect(screen.getByText('Connect your API key')).toBeInTheDocument();
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

    it('shows API key input', () => {
      goToStep2();
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('shows validation error for invalid key format', () => {
      goToStep2();
      fireEvent.change(screen.getByRole('textbox'), { target: { value: 'invalid-key' } });
      fireEvent.click(screen.getByText('Next'));
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('does NOT advance to step 3 on invalid key', () => {
      goToStep2();
      fireEvent.change(screen.getByRole('textbox'), { target: { value: 'bad' } });
      fireEvent.click(screen.getByText('Next'));
      expect(screen.getByText('Connect your API key')).toBeInTheDocument();
    });

    it('saves valid key without persistence when checkbox is unchecked', () => {
      goToStep2();
      fireEvent.change(screen.getByRole('textbox'), { target: { value: 'sk-validkey123' } });
      fireEvent.click(screen.getByText('Next'));
      expect(mockSaveApiConfig).toHaveBeenCalledWith(
        'openai',
        'sk-validkey123',
        'sk-validkey123',
        false
      );
      expect(screen.getByText('Choose your plan')).toBeInTheDocument();
    });

    it('shows "Remember my key" checkbox', () => {
      goToStep2();
      expect(screen.getByRole('checkbox')).toBeInTheDocument();
      expect(screen.getByText('Remember my key across sessions')).toBeInTheDocument();
    });

    it('checkbox is unchecked by default', () => {
      goToStep2();
      expect(screen.getByRole('checkbox')).not.toBeChecked();
    });

    it('saves with persist=true when checkbox is checked', () => {
      goToStep2();
      fireEvent.click(screen.getByRole('checkbox'));
      fireEvent.change(screen.getByRole('textbox'), { target: { value: 'sk-validkey123' } });
      fireEvent.click(screen.getByText('Next'));
      expect(mockSaveApiConfig).toHaveBeenCalledWith(
        'openai',
        'sk-validkey123',
        'sk-validkey123',
        true
      );
    });

    it('Skip on step 2 calls completeOnboarding', () => {
      goToStep2();
      fireEvent.click(screen.getByText('Skip for now'));
      expect(mockCompleteOnboarding).toHaveBeenCalledTimes(1);
    });
  });

  // Step 3
  describe('Step 3 — Plan', () => {
    const goToStep3 = () => {
      render(<OnboardingPage />);
      fireEvent.click(screen.getByText('Next'));
      fireEvent.change(screen.getByRole('textbox'), { target: { value: 'sk-validkey123' } });
      fireEvent.click(screen.getByText('Next'));
    };

    it('renders step 3 heading', () => {
      goToStep3();
      expect(screen.getByText('Choose your plan')).toBeInTheDocument();
    });

    it('step 3 is active in StepIndicator', () => {
      goToStep3();
      expect(screen.getByTestId('step-3')).toHaveAttribute('aria-current', 'step');
    });

    it('shows pricing cards', () => {
      goToStep3();
      expect(screen.getByTestId('pricing-card-free')).toBeInTheDocument();
      expect(screen.getByTestId('pricing-card-pro')).toBeInTheDocument();
    });

    it('shows Get Started button', () => {
      goToStep3();
      expect(screen.getByText('Get Started')).toBeInTheDocument();
    });

    it('Get Started calls completeOnboarding', () => {
      goToStep3();
      fireEvent.click(screen.getByText('Get Started'));
      expect(mockCompleteOnboarding).toHaveBeenCalledTimes(1);
    });

    it('Back returns to step 2', () => {
      goToStep3();
      fireEvent.click(screen.getByText('Back'));
      expect(screen.getByText('Connect your API key')).toBeInTheDocument();
    });
  });
});
