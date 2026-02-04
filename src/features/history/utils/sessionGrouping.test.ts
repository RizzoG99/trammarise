import { describe, it, expect, beforeEach, vi } from 'vitest';
import { groupSessionsByDate } from './sessionGrouping';
import type { HistorySession } from '../types/history';

describe('sessionGrouping', () => {
  beforeEach(() => {
    // Set a fixed time for consistent testing
    vi.setSystemTime(new Date('2026-01-28T12:00:00Z'));
  });

  const createSession = (createdAt: number, audioName = 'test.webm'): HistorySession => ({
    sessionId: `session-${createdAt}`,
    audioName,
    contentType: 'meeting',
    language: 'en',
    hasTranscript: true,
    hasSummary: true,
    createdAt,
    updatedAt: createdAt,
  });

  describe('groupSessionsByDate', () => {
    it("should group today's sessions correctly (within 24h)", () => {
      const now = Date.now();
      const sessions = [
        createSession(now),
        createSession(now - 1000 * 60 * 60), // 1 hour ago
        createSession(now - 1000 * 60 * 60 * 23), // 23 hours ago
      ];

      const result = groupSessionsByDate(sessions);

      expect(result.today).toHaveLength(3);
      expect(result.yesterday).toHaveLength(0);
    });

    it("should group yesterday's sessions (24-48h ago)", () => {
      const now = Date.now();
      const sessions = [
        createSession(now - 1000 * 60 * 60 * 25), // 25 hours ago
        createSession(now - 1000 * 60 * 60 * 36), // 36 hours ago
        createSession(now - 1000 * 60 * 60 * 47), // 47 hours ago
      ];

      const result = groupSessionsByDate(sessions);

      expect(result.today).toHaveLength(0);
      expect(result.yesterday).toHaveLength(3);
    });

    it("should group this week's sessions (2-7 days)", () => {
      const now = Date.now();
      const sessions = [
        createSession(now - 1000 * 60 * 60 * 24 * 2), // 2 days ago
        createSession(now - 1000 * 60 * 60 * 24 * 5), // 5 days ago
        createSession(now - 1000 * 60 * 60 * 24 * 7), // 7 days ago
      ];

      const result = groupSessionsByDate(sessions);

      expect(result.thisWeek).toHaveLength(3);
      expect(result.lastWeek).toHaveLength(0);
    });

    it("should group last week's sessions (8-14 days)", () => {
      const now = Date.now();
      const sessions = [
        createSession(now - 1000 * 60 * 60 * 24 * 8), // 8 days ago
        createSession(now - 1000 * 60 * 60 * 24 * 10), // 10 days ago
        createSession(now - 1000 * 60 * 60 * 24 * 14), // 14 days ago
      ];

      const result = groupSessionsByDate(sessions);

      expect(result.lastWeek).toHaveLength(3);
      expect(Object.keys(result.older)).toHaveLength(0);
    });

    it('should group older sessions by month', () => {
      const sessions = [
        createSession(new Date('2026-01-01T12:00:00Z').getTime(), 'jan-session.webm'),
        createSession(new Date('2025-12-20T12:00:00Z').getTime(), 'dec-session.webm'),
        createSession(new Date('2025-11-10T12:00:00Z').getTime(), 'nov-session.webm'),
      ];

      const result = groupSessionsByDate(sessions);

      expect(Object.keys(result.older)).toHaveLength(3);
      expect(result.older['January 2026']).toHaveLength(1);
      expect(result.older['December 2025']).toHaveLength(1);
      expect(result.older['November 2025']).toHaveLength(1);
    });

    it('should handle empty array input', () => {
      const result = groupSessionsByDate([]);

      expect(result.today).toHaveLength(0);
      expect(result.yesterday).toHaveLength(0);
      expect(result.thisWeek).toHaveLength(0);
      expect(result.lastWeek).toHaveLength(0);
      expect(Object.keys(result.older)).toHaveLength(0);
    });

    it('should handle sessions with invalid timestamps', () => {
      const now = Date.now();
      const sessions = [
        createSession(now),
        createSession(0), // Invalid timestamp
        createSession(-1), // Negative timestamp
        createSession(NaN), // NaN timestamp
      ];

      const result = groupSessionsByDate(sessions);

      // Should only process valid sessions
      expect(result.today).toHaveLength(1);
    });

    it('should sort within groups by newest first', () => {
      const now = Date.now();
      const sessions = [
        createSession(now - 1000 * 60 * 60, 'oldest.webm'),
        createSession(now - 1000 * 60 * 30, 'middle.webm'),
        createSession(now - 1000 * 60 * 10, 'newest.webm'),
      ];

      const result = groupSessionsByDate(sessions);

      expect(result.today[0].audioName).toBe('newest.webm');
      expect(result.today[1].audioName).toBe('middle.webm');
      expect(result.today[2].audioName).toBe('oldest.webm');
    });

    it('should handle sessions exactly at group boundaries', () => {
      const now = Date.now();
      const exactlyOneDayAgo = now - 1000 * 60 * 60 * 24;
      const exactlyTwoDaysAgo = now - 1000 * 60 * 60 * 24 * 2;

      const sessions = [
        createSession(exactlyOneDayAgo, 'boundary-1.webm'),
        createSession(exactlyTwoDaysAgo, 'boundary-2.webm'),
      ];

      const result = groupSessionsByDate(sessions);

      // First boundary should be in yesterday
      expect(result.yesterday.find((s) => s.audioName === 'boundary-1.webm')).toBeDefined();
      // Second boundary should be in thisWeek
      expect(result.thisWeek.find((s) => s.audioName === 'boundary-2.webm')).toBeDefined();
    });

    it('should handle multiple sessions in same month for older group', () => {
      const sessions = [
        createSession(new Date('2025-12-20T12:00:00Z').getTime(), 'dec-1.webm'),
        createSession(new Date('2025-12-15T12:00:00Z').getTime(), 'dec-2.webm'),
        createSession(new Date('2025-12-10T12:00:00Z').getTime(), 'dec-3.webm'),
      ];

      const result = groupSessionsByDate(sessions);

      expect(result.older['December 2025']).toHaveLength(3);
      // Should be sorted newest first within the month
      expect(result.older['December 2025'][0].audioName).toBe('dec-1.webm');
      expect(result.older['December 2025'][2].audioName).toBe('dec-3.webm');
    });
  });
});
