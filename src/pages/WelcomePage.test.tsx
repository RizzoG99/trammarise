import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { WelcomePage } from './WelcomePage';
import { BrowserRouter } from 'react-router-dom';

// Mock Clerk
const mockOpenSignIn = vi.fn();
vi.mock('@clerk/clerk-react', () => ({
  useClerk: () => ({
    openSignIn: mockOpenSignIn,
  }),
}));

// Mock Lucide icons to avoid ESM issues in tests if any
vi.mock('lucide-react', () => ({
  ArrowRight: () => <div data-testid="arrow-right" />,
  Mic: () => <div data-testid="mic" />,
  Zap: () => <div data-testid="zap" />,
  Shield: () => <div data-testid="shield" />,
  Github: () => <div data-testid="github" />,
  Linkedin: () => <div data-testid="linkedin" />,
  Twitter: () => <div data-testid="twitter" />,
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
    expect(screen.getByText(/Advanced Audio Intelligence/i)).toBeInTheDocument();
    expect(screen.getByText(/Transform your meetings/i)).toBeInTheDocument();
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

  it('renders the team section', () => {
    render(
      <BrowserRouter>
        <WelcomePage />
      </BrowserRouter>
    );

    expect(screen.getByText('Our Team')).toBeInTheDocument();
    expect(screen.getByText('Meet the Minds Behind Trammarise')).toBeInTheDocument();
    expect(screen.getByText('Alex Chen')).toBeInTheDocument();
    expect(screen.getByText('Sarah Johnson')).toBeInTheDocument();
    expect(screen.getByText('Michael Brown')).toBeInTheDocument();
    expect(screen.getByText('Emily Davis')).toBeInTheDocument();
  });

  it('calls openSignIn when "Get Started" is clicked', () => {
    render(
      <BrowserRouter>
        <WelcomePage />
      </BrowserRouter>
    );

    const buttons = screen.getAllByText('Get Started');
    fireEvent.click(buttons[0]); // Click the hero button

    expect(mockOpenSignIn).toHaveBeenCalledWith({
      afterSignInUrl: '/',
      afterSignUpUrl: '/',
    });
  });

  it('renders navigation links in footer', () => {
    render(
      <BrowserRouter>
        <WelcomePage />
      </BrowserRouter>
    );

    expect(screen.getByText('Privacy')).toBeInTheDocument();
    expect(screen.getByText('Terms')).toBeInTheDocument();
    expect(screen.getByText('Contact')).toBeInTheDocument();
  });
});
