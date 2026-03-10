// src/components/auth/SignInModal.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { SignInModal } from './SignInModal';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k: string, fallback?: string) => fallback ?? k }),
}));

const mockSignInWithOtp = vi.fn().mockResolvedValue({ error: null });
const mockSignInWithOAuth = vi.fn().mockResolvedValue({ error: null });

vi.mock('@/lib/supabase/client', () => ({
  supabaseClient: {
    auth: {
      signInWithOtp: (...args: unknown[]) => mockSignInWithOtp(...args),
      signInWithOAuth: (...args: unknown[]) => mockSignInWithOAuth(...args),
    },
  },
}));

describe('SignInModal', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders email input and submit button', () => {
    render(<SignInModal onClose={() => {}} />);
    expect(screen.getByRole('textbox', { name: /email/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /magic link/i })).toBeInTheDocument();
  });

  it('renders OAuth provider buttons', () => {
    render(<SignInModal onClose={() => {}} />);
    expect(screen.getByRole('button', { name: /google/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /github/i })).toBeInTheDocument();
    // Apple sign-in is disabled pending Apple Developer account setup
    expect(screen.queryByRole('button', { name: /apple/i })).not.toBeInTheDocument();
  });

  it('calls signInWithOtp on email submit', async () => {
    render(<SignInModal onClose={() => {}} />);
    fireEvent.change(screen.getByRole('textbox', { name: /email/i }), {
      target: { value: 'test@example.com' },
    });
    fireEvent.click(screen.getByRole('button', { name: /magic link/i }));
    await waitFor(() =>
      expect(mockSignInWithOtp).toHaveBeenCalledWith({
        email: 'test@example.com',
        options: { emailRedirectTo: expect.stringContaining('/auth/callback') },
      })
    );
  });

  it('shows confirmation message after email submit', async () => {
    render(<SignInModal onClose={() => {}} />);
    fireEvent.change(screen.getByRole('textbox', { name: /email/i }), {
      target: { value: 'test@example.com' },
    });
    fireEvent.click(screen.getByRole('button', { name: /magic link/i }));
    await waitFor(() => expect(screen.getByRole('status')).toBeInTheDocument());
  });

  it('calls signInWithOAuth for Google', async () => {
    render(<SignInModal onClose={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: /google/i }));
    await waitFor(() =>
      expect(mockSignInWithOAuth).toHaveBeenCalledWith({
        provider: 'google',
        options: { redirectTo: expect.stringContaining('/auth/callback') },
      })
    );
  });
});
