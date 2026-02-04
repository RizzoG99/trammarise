import { describe, it, expect, beforeEach, vi } from 'vitest';
import { groupSessionsByDate } from './sessionGrouping';
import type { HistorySession } from '../types/history';

describe('sessionGrouping', () => {
  beforeEach(() => {
    // Set a fixed time for consistent testing: noon on Jan 28, 2026 UTC
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

  // Calendar-day anchors (all at noon UTC to stay firmly within their day)
  // "Today" is Jan 28; midnight boundary is 2026-01-28T00:00:00Z
  const TODAY = new Date('2026-01-28T10:00:00Z').getTime(); // Jan 28, 10 AM
  const TODAY_EARLY = new Date('2026-01-28T01:00:00Z').getTime(); // Jan 28, 1 AM
  const YESTERDAY = new Date('2026-01-27T15:00:00Z').getTime(); // Jan 27, 3 PM
  const YESTERDAY_EARLY = new Date('2026-01-27T02:00:00Z').getTime(); // Jan 27, 2 AM
  const TWO_DAYS_AGO = new Date('2026-01-26T12:00:00Z').getTime(); // Jan 26
  const FIVE_DAYS_AGO = new Date('2026-01-23T12:00:00Z').getTime(); // Jan 23
  const SEVEN_DAYS_AGO = new Date('2026-01-21T12:00:00Z').getTime(); // Jan 21 (>= sevenDaysAgo = Jan 21)
  const EIGHT_DAYS_AGO = new Date('2026-01-20T12:00:00Z').getTime(); // Jan 20 (lastWeek)
  const TEN_DAYS_AGO = new Date('2026-01-18T12:00:00Z').getTime(); // Jan 18
  const FOURTEEN_DAYS_AGO = new Date('2026-01-14T12:00:00Z').getTime(); // Jan 14 (>= fourteenDaysAgo = Jan 14)

  describe('groupSessionsByDate', () => {
    it("should group today's sessions correctly (same calendar day)", () => {
      const sessions = [createSession(TODAY), createSession(TODAY_EARLY)];

      const result = groupSessionsByDate(sessions);

      expect(result.today).toHaveLength(2);
      expect(result.yesterday).toHaveLength(0);
    });

    it("should group yesterday's sessions (previous calendar day)", () => {
      const sessions = [createSession(YESTERDAY), createSession(YESTERDAY_EARLY)];

      const result = groupSessionsByDate(sessions);

      expect(result.today).toHaveLength(0);
      expect(result.yesterday).toHaveLength(2);
    });

    it("should group this week's sessions (2–7 calendar days ago)", () => {
      const sessions = [
        createSession(TWO_DAYS_AGO),
        createSession(FIVE_DAYS_AGO),
        createSession(SEVEN_DAYS_AGO),
      ];

      const result = groupSessionsByDate(sessions);

      expect(result.thisWeek).toHaveLength(3);
      expect(result.lastWeek).toHaveLength(0);
    });

    it("should group last week's sessions (8–14 calendar days ago)", () => {
      const sessions = [
        createSession(EIGHT_DAYS_AGO),
        createSession(TEN_DAYS_AGO),
        createSession(FOURTEEN_DAYS_AGO),
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
      const sessions = [
        createSession(TODAY),
        createSession(0), // Invalid timestamp
        createSession(-1), // Negative timestamp
        createSession(NaN), // NaN timestamp
      ];

      const result = groupSessionsByDate(sessions);

      // Should only process valid sessions
      expect(result.today).toHaveLength(1);
    });

    it('should sort within groups by newest first', () => {
      const oldest = new Date('2026-01-28T08:00:00Z').getTime();
      const middle = new Date('2026-01-28T09:00:00Z').getTime();
      const newest = new Date('2026-01-28T10:00:00Z').getTime();

      const sessions = [
        createSession(oldest, 'oldest.webm'),
        createSession(middle, 'middle.webm'),
        createSession(newest, 'newest.webm'),
      ];

      const result = groupSessionsByDate(sessions);

      expect(result.today[0].audioName).toBe('newest.webm');
      expect(result.today[1].audioName).toBe('middle.webm');
      expect(result.today[2].audioName).toBe('oldest.webm');
    });

    it('should handle sessions exactly at calendar-day boundaries', () => {
      // Exactly at midnight Jan 27 → that IS Jan 27's calendar day (yesterday)
      const exactlyYesterdayMidnight = new Date('2026-01-27T00:00:00Z').getTime();
      // Exactly at midnight Jan 26 → that IS Jan 26's calendar day (thisWeek)
      const exactlyTwoDaysAgoMidnight = new Date('2026-01-26T00:00:00Z').getTime();

      const sessions = [
        createSession(exactlyYesterdayMidnight, 'boundary-1.webm'),
        createSession(exactlyTwoDaysAgoMidnight, 'boundary-2.webm'),
      ];

      const result = groupSessionsByDate(sessions);

      expect(result.yesterday.find((s) => s.audioName === 'boundary-1.webm')).toBeDefined();
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
