/**
 * Integration tests for usage tracking integration
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { trackUsage, checkQuota } from '../../middleware/usage-tracking';
import { supabaseAdmin } from '../../lib/supabase-admin';

// Mock Supabase
vi.mock('../../lib/supabase-admin', () => ({
  supabaseAdmin: {
    from: vi.fn(),
    rpc: vi.fn(),
  },
}));

describe('Usage Tracking Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Dual-Mode Tracking', () => {
    it('should track with quota deduction for paid users with platform key', async () => {
      // Mock subscription fetch
      vi.mocked(supabaseAdmin.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: 'sub-123', tier: 'pro', minutes_used: 50 },
              error: null,
            }),
          }),
        }),
        insert: vi.fn().mockResolvedValue({ error: null }),
      } as unknown as ReturnType<typeof supabaseAdmin.from>);

      // Mock RPC call for quota deduction
      vi.mocked(supabaseAdmin.rpc).mockResolvedValue({ error: null });

      await trackUsage('user-123', 'transcription', 120, 'with_quota_deduction');

      // Should insert usage event
      expect(supabaseAdmin.from).toHaveBeenCalledWith('subscriptions');
      expect(supabaseAdmin.from).toHaveBeenCalledWith('usage_events');

      // Should call RPC to increment quota
      expect(supabaseAdmin.rpc).toHaveBeenCalledWith('increment_minutes_used', {
        sub_id: 'sub-123',
        minutes: 2, // 120 seconds = 2 minutes
      });
    });

    it('should track analytics only without quota deduction for users with own key', async () => {
      // Mock subscription fetch
      vi.mocked(supabaseAdmin.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: 'sub-456', tier: 'free', minutes_used: 0 },
              error: null,
            }),
          }),
        }),
        insert: vi.fn().mockResolvedValue({ error: null }),
      } as unknown as ReturnType<typeof supabaseAdmin.from>);

      await trackUsage('user-456', 'transcription', 120, 'analytics_only');

      // Should insert usage event for analytics
      expect(supabaseAdmin.from).toHaveBeenCalledWith('usage_events');

      // Should NOT call RPC to increment quota
      expect(supabaseAdmin.rpc).not.toHaveBeenCalled();
    });
  });

  describe('Quota Checking', () => {
    it('should allow operation when quota is sufficient', async () => {
      vi.mocked(supabaseAdmin.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { tier: 'pro', minutes_used: 100, credits_balance: 0 },
              error: null,
            }),
          }),
        }),
      } as unknown as ReturnType<typeof supabaseAdmin.from>);

      const result = await checkQuota('user-123', 10);

      expect(result.allowed).toBe(true);
      expect(result.minutesRemaining).toBe(400); // 500 (pro tier) - 100 (used)
      expect(result.minutesRequired).toBe(10);
    });

    it('should reject operation when quota is exhausted', async () => {
      vi.mocked(supabaseAdmin.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { tier: 'pro', minutes_used: 500, credits_balance: 0 },
              error: null,
            }),
          }),
        }),
      } as unknown as ReturnType<typeof supabaseAdmin.from>);

      const result = await checkQuota('user-123', 10);

      expect(result.allowed).toBe(false);
      expect(result.minutesRemaining).toBe(0);
      expect(result.reason).toBe('Quota exceeded');
    });
  });
});
