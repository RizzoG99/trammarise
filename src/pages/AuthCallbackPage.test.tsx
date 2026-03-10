// src/pages/AuthCallbackPage.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { AuthCallbackPage } from './AuthCallbackPage';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({ useNavigate: () => mockNavigate }));

const mockExchange = vi.fn();
vi.mock('@/lib/supabase/client', () => ({
  supabaseClient: {
    auth: {
      exchangeCodeForSession: (...args: unknown[]) => mockExchange(...args),
    },
  },
}));

describe('AuthCallbackPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockExchange.mockResolvedValue({ error: null });
  });

  it('shows loading state initially', () => {
    render(<AuthCallbackPage />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('navigates to / after successful exchange', async () => {
    render(<AuthCallbackPage />);
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true }));
  });

  it('navigates to /?auth_error=1 when exchangeCodeForSession rejects', async () => {
    vi.stubGlobal('location', { ...window.location, search: '?code=test_code' });
    mockExchange.mockRejectedValue(new Error('expired'));
    render(<AuthCallbackPage />);
    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith('/?auth_error=1', { replace: true })
    );
    vi.unstubAllGlobals();
  });
});
