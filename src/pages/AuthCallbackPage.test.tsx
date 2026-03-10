// src/pages/AuthCallbackPage.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { AuthCallbackPage } from './AuthCallbackPage';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({ useNavigate: () => mockNavigate }));

vi.mock('@/lib/supabase/client', () => ({
  supabaseClient: {
    auth: {
      exchangeCodeForSession: vi.fn().mockResolvedValue({ error: null }),
    },
  },
}));

describe('AuthCallbackPage', () => {
  it('shows loading state initially', () => {
    render(<AuthCallbackPage />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('navigates to / after successful exchange', async () => {
    render(<AuthCallbackPage />);
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true }));
  });
});
