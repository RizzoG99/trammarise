import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useHistoryFilters } from './useHistoryFilters';
import type { HistorySession } from '../types/history';

describe('useHistoryFilters', () => {
  const createSession = (
    audioName: string,
    contentType: 'meeting' | 'lecture' | 'interview' = 'meeting',
    createdAt: number = Date.now()
  ): HistorySession => ({
    sessionId: `session-${audioName}`,
    audioName,
    contentType,
    language: 'en',
    hasTranscript: true,
    hasSummary: true,
    createdAt,
    updatedAt: createdAt,
  });

  const mockSessions: HistorySession[] = [
    createSession('team-meeting.webm', 'meeting', Date.now()),
    createSession('physics-lecture.webm', 'lecture', Date.now() - 1000),
    createSession('interview-candidate.webm', 'interview', Date.now() - 2000),
    createSession('another-meeting.webm', 'meeting', Date.now() - 3000),
  ];

  it('should filter by search query (case-insensitive)', () => {
    const { result } = renderHook(() => useHistoryFilters(mockSessions));

    act(() => {
      result.current.setSearchQuery('meeting');
    });

    const filtered = result.current.filteredSessions;
    expect(filtered).toHaveLength(2);
    expect(filtered[0].audioName).toBe('team-meeting.webm');
    expect(filtered[1].audioName).toBe('another-meeting.webm');
  });

  it('should filter by search query with uppercase', () => {
    const { result } = renderHook(() => useHistoryFilters(mockSessions));

    act(() => {
      result.current.setSearchQuery('PHYSICS');
    });

    expect(result.current.filteredSessions).toHaveLength(1);
    expect(result.current.filteredSessions[0].audioName).toBe('physics-lecture.webm');
  });

  it('should filter by content type', () => {
    const { result } = renderHook(() => useHistoryFilters(mockSessions));

    act(() => {
      result.current.setContentTypeFilter('lecture');
    });

    expect(result.current.filteredSessions).toHaveLength(1);
    expect(result.current.filteredSessions[0].contentType).toBe('lecture');
  });

  it('should combine search and content type filter (AND logic)', () => {
    const { result } = renderHook(() => useHistoryFilters(mockSessions));

    act(() => {
      result.current.setSearchQuery('meeting');
      result.current.setContentTypeFilter('meeting');
    });

    expect(result.current.filteredSessions).toHaveLength(2);
    expect(result.current.filteredSessions.every((s) => s.contentType === 'meeting')).toBe(true);
  });

  it('should sort by newest first (default)', () => {
    const { result } = renderHook(() => useHistoryFilters(mockSessions));

    const sorted = result.current.filteredSessions;
    expect(sorted[0].audioName).toBe('team-meeting.webm');
    expect(sorted[3].audioName).toBe('another-meeting.webm');
  });

  it('should sort by oldest first', () => {
    const { result } = renderHook(() => useHistoryFilters(mockSessions));

    act(() => {
      result.current.setSortBy('oldest');
    });

    const sorted = result.current.filteredSessions;
    expect(sorted[0].audioName).toBe('another-meeting.webm');
    expect(sorted[3].audioName).toBe('team-meeting.webm');
  });

  it('should sort alphabetically A-Z', () => {
    const { result } = renderHook(() => useHistoryFilters(mockSessions));

    act(() => {
      result.current.setSortBy('a-z');
    });

    const sorted = result.current.filteredSessions;
    expect(sorted[0].audioName).toBe('another-meeting.webm');
    expect(sorted[1].audioName).toBe('interview-candidate.webm');
    expect(sorted[2].audioName).toBe('physics-lecture.webm');
    expect(sorted[3].audioName).toBe('team-meeting.webm');
  });

  it('should sort alphabetically Z-A', () => {
    const { result } = renderHook(() => useHistoryFilters(mockSessions));

    act(() => {
      result.current.setSortBy('z-a');
    });

    const sorted = result.current.filteredSessions;
    expect(sorted[0].audioName).toBe('team-meeting.webm');
    expect(sorted[3].audioName).toBe('another-meeting.webm');
  });

  it('should indicate active filters', () => {
    const { result } = renderHook(() => useHistoryFilters(mockSessions));

    expect(result.current.hasActiveFilters).toBe(false);

    act(() => {
      result.current.setSearchQuery('test');
    });

    expect(result.current.hasActiveFilters).toBe(true);
  });

  it('should indicate active content type filter', () => {
    const { result } = renderHook(() => useHistoryFilters(mockSessions));

    act(() => {
      result.current.setContentTypeFilter('meeting');
    });

    expect(result.current.hasActiveFilters).toBe(true);
  });

  it('should clear all filters', () => {
    const { result } = renderHook(() => useHistoryFilters(mockSessions));

    act(() => {
      result.current.setSearchQuery('test');
      result.current.setContentTypeFilter('meeting');
      result.current.setSortBy('a-z');
    });

    expect(result.current.hasActiveFilters).toBe(true);

    act(() => {
      result.current.clearFilters();
    });

    expect(result.current.searchQuery).toBe('');
    expect(result.current.contentTypeFilter).toBe('all');
    expect(result.current.sortBy).toBe('newest');
    expect(result.current.hasActiveFilters).toBe(false);
  });

  it('should show all sessions when search is empty', () => {
    const { result } = renderHook(() => useHistoryFilters(mockSessions));

    act(() => {
      result.current.setSearchQuery('');
    });

    expect(result.current.filteredSessions).toHaveLength(4);
  });

  it('should show all sessions when content type is "all"', () => {
    const { result } = renderHook(() => useHistoryFilters(mockSessions));

    act(() => {
      result.current.setContentTypeFilter('all');
    });

    expect(result.current.filteredSessions).toHaveLength(4);
  });

  it('should return empty array when no matches', () => {
    const { result } = renderHook(() => useHistoryFilters(mockSessions));

    act(() => {
      result.current.setSearchQuery('nonexistent');
    });

    expect(result.current.filteredSessions).toHaveLength(0);
  });

  it('should preserve sort order when filtering', () => {
    const { result } = renderHook(() => useHistoryFilters(mockSessions));

    act(() => {
      result.current.setSortBy('a-z');
      result.current.setSearchQuery('meeting');
    });

    const sorted = result.current.filteredSessions;
    expect(sorted[0].audioName).toBe('another-meeting.webm');
    expect(sorted[1].audioName).toBe('team-meeting.webm');
  });
});
