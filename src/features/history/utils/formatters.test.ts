import { describe, it, expect, beforeEach, vi } from 'vitest';
import { formatDate, formatDuration, formatFileSize } from './formatters';

describe('formatters', () => {
  beforeEach(() => {
    // Set a fixed time for consistent testing
    vi.setSystemTime(new Date('2026-01-28T15:45:00Z'));
  });

  describe('formatDate', () => {
    it("should format today's date with time", () => {
      const now = Date.now();
      const result = formatDate(now);

      expect(result).toContain('Today');
      expect(result).toContain('at');
    });

    it("should format yesterday's date with time", () => {
      const yesterday = Date.now() - 1000 * 60 * 60 * 25; // 25 hours ago
      const result = formatDate(yesterday);

      expect(result).toContain('Yesterday');
      expect(result).toContain('at');
    });

    it('should format older dates with full date', () => {
      const oldDate = new Date('2026-01-15T10:30:00Z').getTime();
      const result = formatDate(oldDate);

      // Should contain month and day
      expect(result).toMatch(/Jan.*15/);
    });

    it('should handle null and undefined', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(formatDate(null as any)).toBe('');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(formatDate(undefined as any)).toBe('');
    });

    it('should handle invalid timestamps', () => {
      expect(formatDate(NaN)).toBe('');
      expect(formatDate(-1)).toBe('');
      expect(formatDate(0)).toBe('');
    });
  });

  describe('formatDuration', () => {
    it('should format seconds only', () => {
      expect(formatDuration(45)).toBe('45s');
    });

    it('should format minutes and seconds', () => {
      expect(formatDuration(204)).toBe('3m 24s');
      expect(formatDuration(90)).toBe('1m 30s');
    });

    it('should format hours, minutes, and seconds', () => {
      expect(formatDuration(4530)).toBe('1h 15m 30s');
      expect(formatDuration(3661)).toBe('1h 1m 1s');
    });

    it('should handle zero duration', () => {
      expect(formatDuration(0)).toBe('0s');
    });

    it('should handle null and undefined', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(formatDuration(null as any)).toBe('');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(formatDuration(undefined as any)).toBe('');
    });

    it('should handle negative values', () => {
      expect(formatDuration(-100)).toBe('');
    });

    it('should omit zero components in middle positions', () => {
      expect(formatDuration(3600)).toBe('1h 0m 0s');
      expect(formatDuration(3605)).toBe('1h 0m 5s');
    });
  });

  describe('formatFileSize', () => {
    it('should format bytes', () => {
      expect(formatFileSize(500)).toBe('500 B');
      expect(formatFileSize(1000)).toBe('1000 B');
    });

    it('should format kilobytes', () => {
      expect(formatFileSize(1024)).toBe('1.0 KB');
      expect(formatFileSize(250880)).toBe('245.0 KB');
    });

    it('should format megabytes', () => {
      expect(formatFileSize(5452595)).toBe('5.2 MB');
      expect(formatFileSize(1048576)).toBe('1.0 MB');
    });

    it('should format gigabytes', () => {
      expect(formatFileSize(1395864371)).toBe('1.3 GB');
      expect(formatFileSize(1073741824)).toBe('1.0 GB');
    });

    it('should handle zero size', () => {
      expect(formatFileSize(0)).toBe('0 B');
    });

    it('should handle null and undefined', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(formatFileSize(null as any)).toBe('');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(formatFileSize(undefined as any)).toBe('');
    });

    it('should handle negative values', () => {
      expect(formatFileSize(-1024)).toBe('');
    });

    it('should round to one decimal place', () => {
      expect(formatFileSize(1536)).toBe('1.5 KB');
      expect(formatFileSize(2621440)).toBe('2.5 MB');
    });
  });
});
