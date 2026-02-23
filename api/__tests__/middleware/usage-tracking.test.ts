import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Supabase admin
const mockSupabaseFrom = vi.fn();
const mockSupabaseSelect = vi.fn();
const mockSupabaseEq = vi.fn();
const mockSupabaseSingle = vi.fn();
const mockSupabaseInsert = vi.fn();
const mockSupabaseRpc = vi.fn();

vi.mock('../../lib/supabase-admin', () => ({
  supabaseAdmin: {
    from: mockSupabaseFrom,
    rpc: mockSupabaseRpc,
  },
}));

describe('Usage Tracking Middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('trackUsage', () => {
    it('should track transcription usage in minutes', async () => {
      // Arrange
      const { trackUsage } = await import('../../middleware/usage-tracking');
      const userId = 'user-uuid-123';
      const durationSeconds = 300; // 5 minutes
      const operationType = 'transcription';

      // Mock subscription check
      mockSupabaseFrom.mockReturnValueOnce({
        select: mockSupabaseSelect,
      });
      mockSupabaseSelect.mockReturnValueOnce({
        eq: mockSupabaseEq,
      });
      mockSupabaseEq.mockReturnValueOnce({
        single: mockSupabaseSingle,
      });
      mockSupabaseSingle.mockResolvedValueOnce({
        data: {
          id: 'sub-123',
          tier: 'pro',
          minutes_used: 100,
        },
        error: null,
      });

      // Mock usage insert
      mockSupabaseFrom.mockReturnValueOnce({
        insert: mockSupabaseInsert,
      });
      mockSupabaseInsert.mockResolvedValueOnce({
        data: { id: 'usage-123' },
        error: null,
      });

      // Mock subscription update (increment minutes_used)
      mockSupabaseRpc.mockResolvedValueOnce({
        data: null,
        error: null,
      });

      // Act
      await trackUsage(userId, operationType, durationSeconds);

      // Assert - Usage record created
      expect(mockSupabaseInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: userId,
          operation_type: operationType,
          duration_seconds: durationSeconds,
          minutes_used: 5, // Rounded up from 300 seconds
        })
      );

      // Assert - Subscription minutes incremented
      expect(mockSupabaseRpc).toHaveBeenCalledWith('increment_minutes_used', {
        sub_id: 'sub-123',
        minutes: 5,
      });
    });

    it('should round up partial minutes', async () => {
      // Arrange
      const { trackUsage } = await import('../../middleware/usage-tracking');
      const userId = 'user-uuid-123';
      const durationSeconds = 61; // 1 minute 1 second = 2 minutes (rounded up)

      mockSupabaseFrom.mockReturnValueOnce({
        select: mockSupabaseSelect,
      });
      mockSupabaseSelect.mockReturnValueOnce({
        eq: mockSupabaseEq,
      });
      mockSupabaseEq.mockReturnValueOnce({
        single: mockSupabaseSingle,
      });
      mockSupabaseSingle.mockResolvedValueOnce({
        data: { id: 'sub-123', tier: 'pro', minutes_used: 0 },
        error: null,
      });

      mockSupabaseFrom.mockReturnValueOnce({
        insert: mockSupabaseInsert,
      });
      mockSupabaseInsert.mockResolvedValueOnce({
        data: { id: 'usage-123' },
        error: null,
      });

      mockSupabaseRpc.mockResolvedValueOnce({
        data: null,
        error: null,
      });

      // Act
      await trackUsage(userId, 'transcription', durationSeconds);

      // Assert
      expect(mockSupabaseInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          minutes_used: 2, // 61 seconds rounded up to 2 minutes
        })
      );
    });

    it('should not track usage for free tier users', async () => {
      // Arrange
      const { trackUsage } = await import('../../middleware/usage-tracking');
      const userId = 'user-uuid-123';

      mockSupabaseFrom.mockReturnValueOnce({
        select: mockSupabaseSelect,
      });
      mockSupabaseSelect.mockReturnValueOnce({
        eq: mockSupabaseEq,
      });
      mockSupabaseEq.mockReturnValueOnce({
        single: mockSupabaseSingle,
      });
      mockSupabaseSingle.mockResolvedValueOnce({
        data: null, // No subscription = free tier
        error: { code: 'PGRST116' }, // Not found
      });

      // Act
      await trackUsage(userId, 'transcription', 300);

      // Assert - Should not insert usage or update subscription
      expect(mockSupabaseInsert).not.toHaveBeenCalled();
      expect(mockSupabaseRpc).not.toHaveBeenCalled();
    });

    it('should handle database errors gracefully', async () => {
      // Arrange
      const { trackUsage } = await import('../../middleware/usage-tracking');
      const userId = 'user-uuid-123';

      mockSupabaseFrom.mockReturnValueOnce({
        select: mockSupabaseSelect,
      });
      mockSupabaseSelect.mockReturnValueOnce({
        eq: mockSupabaseEq,
      });
      mockSupabaseEq.mockReturnValueOnce({
        single: mockSupabaseSingle,
      });
      mockSupabaseSingle.mockResolvedValueOnce({
        data: { id: 'sub-123', tier: 'pro', minutes_used: 0 },
        error: null,
      });

      mockSupabaseFrom.mockReturnValueOnce({
        insert: mockSupabaseInsert,
      });
      mockSupabaseInsert.mockResolvedValueOnce({
        data: null,
        error: { message: 'Database error' },
      });

      // Act & Assert - Should not throw
      await expect(trackUsage(userId, 'transcription', 300)).resolves.not.toThrow();
    });
  });

  describe('checkQuota', () => {
    it('should return true if user has remaining minutes', async () => {
      // Arrange
      const { checkQuota } = await import('../../middleware/usage-tracking');
      const userId = 'user-uuid-123';
      const requiredMinutes = 10;

      mockSupabaseFrom.mockReturnValueOnce({
        select: mockSupabaseSelect,
      });
      mockSupabaseSelect.mockReturnValueOnce({
        eq: mockSupabaseEq,
      });
      mockSupabaseEq.mockReturnValueOnce({
        single: mockSupabaseSingle,
      });
      mockSupabaseSingle.mockResolvedValueOnce({
        data: {
          tier: 'pro',
          minutes_used: 100,
          // Pro tier has 500 minutes, so 400 remaining
        },
        error: null,
      });

      // Act
      const result = await checkQuota(userId, requiredMinutes);

      // Assert
      expect(result.allowed).toBe(true);
      expect(result.minutesRemaining).toBe(400);
      expect(result.minutesRequired).toBe(10);
    });

    it('should return false if user exceeds quota', async () => {
      // Arrange
      const { checkQuota } = await import('../../middleware/usage-tracking');
      const userId = 'user-uuid-123';
      const requiredMinutes = 100;

      mockSupabaseFrom.mockReturnValueOnce({
        select: mockSupabaseSelect,
      });
      mockSupabaseSelect.mockReturnValueOnce({
        eq: mockSupabaseEq,
      });
      mockSupabaseEq.mockReturnValueOnce({
        single: mockSupabaseSingle,
      });
      mockSupabaseSingle.mockResolvedValueOnce({
        data: {
          tier: 'pro',
          minutes_used: 495,
          // Pro tier has 500 minutes, only 5 remaining
        },
        error: null,
      });

      // Act
      const result = await checkQuota(userId, requiredMinutes);

      // Assert
      expect(result.allowed).toBe(false);
      expect(result.minutesRemaining).toBe(5);
      expect(result.minutesRequired).toBe(100);
      expect(result.reason).toBe('Quota exceeded');
    });

    it('should allow unlimited usage for free tier with BYOK', async () => {
      // Arrange
      const { checkQuota } = await import('../../middleware/usage-tracking');
      const userId = 'user-uuid-123';
      const requiredMinutes = 1000;

      mockSupabaseFrom.mockReturnValueOnce({
        select: mockSupabaseSelect,
      });
      mockSupabaseSelect.mockReturnValueOnce({
        eq: mockSupabaseEq,
      });
      mockSupabaseEq.mockReturnValueOnce({
        single: mockSupabaseSingle,
      });
      mockSupabaseSingle.mockResolvedValueOnce({
        data: null, // No subscription = free tier
        error: { code: 'PGRST116' },
      });

      // Act
      const result = await checkQuota(userId, requiredMinutes, { allowByok: true });

      // Assert
      expect(result.allowed).toBe(true);
      expect(result.isByok).toBe(true);
    });

    it('should check credits balance if available', async () => {
      // Arrange
      const { checkQuota } = await import('../../middleware/usage-tracking');
      const userId = 'user-uuid-123';
      const requiredMinutes = 10;

      mockSupabaseFrom.mockReturnValueOnce({
        select: mockSupabaseSelect,
      });
      mockSupabaseSelect.mockReturnValueOnce({
        eq: mockSupabaseEq,
      });
      mockSupabaseEq.mockReturnValueOnce({
        single: mockSupabaseSingle,
      });
      mockSupabaseSingle.mockResolvedValueOnce({
        data: {
          tier: 'pro',
          minutes_used: 500, // Quota exhausted
          credits_balance: 100, // But has credits
        },
        error: null,
      });

      // Act
      const result = await checkQuota(userId, requiredMinutes);

      // Assert
      expect(result.allowed).toBe(true); // Allowed via credits
      expect(result.usingCredits).toBe(true);
      expect(result.creditsRemaining).toBe(100);
    });
  });
});
