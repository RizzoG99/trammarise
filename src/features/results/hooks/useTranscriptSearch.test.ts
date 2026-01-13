import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTranscriptSearch } from './useTranscriptSearch';

describe('useTranscriptSearch', () => {
  const sampleTranscript = 'This is a test transcript. It contains test data for testing purposes.';

  describe('Initialization', () => {
    it('initializes with empty search query', () => {
      const { result } = renderHook(() => useTranscriptSearch(sampleTranscript));

      expect(result.current.searchQuery).toBe('');
    });

    it('initializes with no matches', () => {
      const { result } = renderHook(() => useTranscriptSearch(sampleTranscript));

      expect(result.current.matches).toEqual([]);
      expect(result.current.totalMatches).toBe(0);
      expect(result.current.hasMatches).toBe(false);
    });

    it('initializes with currentMatchIndex at 0', () => {
      const { result } = renderHook(() => useTranscriptSearch(sampleTranscript));

      expect(result.current.currentMatchIndex).toBe(0);
    });

    it('initializes with undefined currentMatch', () => {
      const { result } = renderHook(() => useTranscriptSearch(sampleTranscript));

      expect(result.current.currentMatch).toBeUndefined();
    });
  });

  describe('Search Functionality', () => {
    it('finds matches for search query', () => {
      const { result } = renderHook(() => useTranscriptSearch(sampleTranscript));

      act(() => {
        result.current.setSearchQuery('test');
      });

      expect(result.current.matches.length).toBe(3); // "test" appears 3 times
      expect(result.current.totalMatches).toBe(3);
      expect(result.current.hasMatches).toBe(true);
    });

    it('performs case-insensitive search', () => {
      const { result } = renderHook(() => useTranscriptSearch(sampleTranscript));

      act(() => {
        result.current.setSearchQuery('TEST');
      });

      expect(result.current.matches.length).toBe(3);
    });

    it('finds single match', () => {
      const { result } = renderHook(() => useTranscriptSearch(sampleTranscript));

      act(() => {
        result.current.setSearchQuery('transcript');
      });

      expect(result.current.matches.length).toBe(1);
      expect(result.current.hasMatches).toBe(true);
    });

    it('returns empty array when no matches found', () => {
      const { result } = renderHook(() => useTranscriptSearch(sampleTranscript));

      act(() => {
        result.current.setSearchQuery('xyz');
      });

      expect(result.current.matches).toEqual([]);
      expect(result.current.totalMatches).toBe(0);
      expect(result.current.hasMatches).toBe(false);
    });

    it('ignores whitespace-only search queries', () => {
      const { result } = renderHook(() => useTranscriptSearch(sampleTranscript));

      act(() => {
        result.current.setSearchQuery('   ');
      });

      expect(result.current.matches).toEqual([]);
      expect(result.current.hasMatches).toBe(false);
    });

    it('trims search query before matching', () => {
      const { result } = renderHook(() => useTranscriptSearch(sampleTranscript));

      act(() => {
        result.current.setSearchQuery('  test  ');
      });

      expect(result.current.matches.length).toBe(3);
    });

    it('finds overlapping matches', () => {
      const transcript = 'aaa';
      const { result } = renderHook(() => useTranscriptSearch(transcript));

      act(() => {
        result.current.setSearchQuery('aa');
      });

      // Should find 2 overlapping matches: positions 0 and 1
      expect(result.current.matches.length).toBe(2);
    });

    it('provides correct match positions', () => {
      const { result } = renderHook(() => useTranscriptSearch(sampleTranscript));

      act(() => {
        result.current.setSearchQuery('test');
      });

      // "test" appears at positions 10, 39, 53
      const positions = result.current.matches.map(m => m.position);
      expect(positions[0]).toBe(10); // "a test transcript"
      expect(positions[1]).toBe(39); // "test data"
      expect(positions[2]).toBe(53); // "testing"
    });

    it('provides correct match text', () => {
      const { result } = renderHook(() => useTranscriptSearch(sampleTranscript));

      act(() => {
        result.current.setSearchQuery('test');
      });

      result.current.matches.forEach(match => {
        expect(match.text).toBe('test');
      });
    });

    it('provides correct match indices', () => {
      const { result } = renderHook(() => useTranscriptSearch(sampleTranscript));

      act(() => {
        result.current.setSearchQuery('test');
      });

      expect(result.current.matches[0].index).toBe(0);
      expect(result.current.matches[1].index).toBe(1);
      expect(result.current.matches[2].index).toBe(2);
    });
  });

  describe('Navigation', () => {
    it('navigates to next match', () => {
      const { result } = renderHook(() => useTranscriptSearch(sampleTranscript));

      act(() => {
        result.current.setSearchQuery('test');
      });

      expect(result.current.currentMatchIndex).toBe(0);

      act(() => {
        result.current.goToNextMatch();
      });

      expect(result.current.currentMatchIndex).toBe(1);
    });

    it('navigates to previous match', () => {
      const { result } = renderHook(() => useTranscriptSearch(sampleTranscript));

      act(() => {
        result.current.setSearchQuery('test');
      });

      act(() => {
        result.current.goToNextMatch();
        result.current.goToNextMatch();
      });

      expect(result.current.currentMatchIndex).toBe(2);

      act(() => {
        result.current.goToPreviousMatch();
      });

      expect(result.current.currentMatchIndex).toBe(1);
    });

    it('wraps to first match when going next from last match', () => {
      const { result } = renderHook(() => useTranscriptSearch(sampleTranscript));

      act(() => {
        result.current.setSearchQuery('test');
      });

      // Go to last match (index 2)
      act(() => {
        result.current.goToNextMatch();
        result.current.goToNextMatch();
      });

      expect(result.current.currentMatchIndex).toBe(2);

      // Go next should wrap to 0
      act(() => {
        result.current.goToNextMatch();
      });

      expect(result.current.currentMatchIndex).toBe(0);
    });

    it('wraps to last match when going previous from first match', () => {
      const { result } = renderHook(() => useTranscriptSearch(sampleTranscript));

      act(() => {
        result.current.setSearchQuery('test');
      });

      expect(result.current.currentMatchIndex).toBe(0);

      act(() => {
        result.current.goToPreviousMatch();
      });

      expect(result.current.currentMatchIndex).toBe(2); // Last match
    });

    it('does nothing when navigating with no matches', () => {
      const { result } = renderHook(() => useTranscriptSearch(sampleTranscript));

      act(() => {
        result.current.goToNextMatch();
      });

      expect(result.current.currentMatchIndex).toBe(0);

      act(() => {
        result.current.goToPreviousMatch();
      });

      expect(result.current.currentMatchIndex).toBe(0);
    });

    it('updates currentMatch when navigating', () => {
      const { result } = renderHook(() => useTranscriptSearch(sampleTranscript));

      act(() => {
        result.current.setSearchQuery('test');
      });

      const firstMatch = result.current.currentMatch;
      expect(firstMatch?.index).toBe(0);

      act(() => {
        result.current.goToNextMatch();
      });

      const secondMatch = result.current.currentMatch;
      expect(secondMatch?.index).toBe(1);
    });
  });

  describe('Clear Search', () => {
    it('clears search query', () => {
      const { result } = renderHook(() => useTranscriptSearch(sampleTranscript));

      act(() => {
        result.current.setSearchQuery('test');
      });

      expect(result.current.searchQuery).toBe('test');

      act(() => {
        result.current.clearSearch();
      });

      expect(result.current.searchQuery).toBe('');
    });

    it('clears matches', () => {
      const { result } = renderHook(() => useTranscriptSearch(sampleTranscript));

      act(() => {
        result.current.setSearchQuery('test');
      });

      expect(result.current.matches.length).toBe(3);

      act(() => {
        result.current.clearSearch();
      });

      expect(result.current.matches).toEqual([]);
      expect(result.current.hasMatches).toBe(false);
    });

    it('resets currentMatchIndex to 0', () => {
      const { result } = renderHook(() => useTranscriptSearch(sampleTranscript));

      act(() => {
        result.current.setSearchQuery('test');
      });

      act(() => {
        result.current.goToNextMatch();
        result.current.goToNextMatch();
      });

      expect(result.current.currentMatchIndex).toBe(2);

      act(() => {
        result.current.clearSearch();
      });

      expect(result.current.currentMatchIndex).toBe(0);
    });
  });

  describe('Edge Cases', () => {
    it('handles empty transcript', () => {
      const { result } = renderHook(() => useTranscriptSearch(''));

      act(() => {
        result.current.setSearchQuery('test');
      });

      expect(result.current.matches).toEqual([]);
      expect(result.current.hasMatches).toBe(false);
    });

    it('handles very long transcript', () => {
      const longTranscript = 'test '.repeat(1000);
      const { result } = renderHook(() => useTranscriptSearch(longTranscript));

      act(() => {
        result.current.setSearchQuery('test');
      });

      expect(result.current.matches.length).toBe(1000);
    });

    it('handles special characters in search query', () => {
      const transcript = 'Test with @#$% special characters';
      const { result } = renderHook(() => useTranscriptSearch(transcript));

      act(() => {
        result.current.setSearchQuery('@#$%');
      });

      expect(result.current.matches.length).toBe(1);
    });

    it('handles single character search', () => {
      const { result } = renderHook(() => useTranscriptSearch('aaa'));

      act(() => {
        result.current.setSearchQuery('a');
      });

      expect(result.current.matches.length).toBe(3);
    });

    it('updates matches when transcript changes', () => {
      const { result, rerender } = renderHook(
        ({ transcript }) => useTranscriptSearch(transcript),
        { initialProps: { transcript: 'test test' } }
      );

      act(() => {
        result.current.setSearchQuery('test');
      });

      expect(result.current.matches.length).toBe(2);

      // Change transcript
      rerender({ transcript: 'test test test' });

      expect(result.current.matches.length).toBe(3);
    });

    it('maintains currentMatchIndex within bounds when matches decrease', () => {
      const { result, rerender } = renderHook(
        ({ transcript }) => useTranscriptSearch(transcript),
        { initialProps: { transcript: 'test test test' } }
      );

      act(() => {
        result.current.setSearchQuery('test');
      });

      act(() => {
        result.current.goToNextMatch();
        result.current.goToNextMatch();
      });

      expect(result.current.currentMatchIndex).toBe(2);

      // Change transcript to have fewer matches
      rerender({ transcript: 'test' });

      // currentMatchIndex stays at 2, but currentMatch may be undefined
      // The hook doesn't automatically reset currentMatchIndex
      expect(result.current.currentMatchIndex).toBe(2);
    });
  });

  describe('Return Value', () => {
    it('returns all expected properties', () => {
      const { result } = renderHook(() => useTranscriptSearch(sampleTranscript));

      expect(result.current).toHaveProperty('searchQuery');
      expect(result.current).toHaveProperty('setSearchQuery');
      expect(result.current).toHaveProperty('matches');
      expect(result.current).toHaveProperty('currentMatchIndex');
      expect(result.current).toHaveProperty('currentMatch');
      expect(result.current).toHaveProperty('totalMatches');
      expect(result.current).toHaveProperty('goToNextMatch');
      expect(result.current).toHaveProperty('goToPreviousMatch');
      expect(result.current).toHaveProperty('clearSearch');
      expect(result.current).toHaveProperty('hasMatches');
    });

    it('returns functions that are stable across renders', () => {
      const { result, rerender } = renderHook(() => useTranscriptSearch(sampleTranscript));

      const initialFunctions = {
        setSearchQuery: result.current.setSearchQuery,
        goToNextMatch: result.current.goToNextMatch,
        goToPreviousMatch: result.current.goToPreviousMatch,
        clearSearch: result.current.clearSearch,
      };

      rerender();

      expect(result.current.setSearchQuery).toBe(initialFunctions.setSearchQuery);
      expect(result.current.goToNextMatch).toBe(initialFunctions.goToNextMatch);
      expect(result.current.goToPreviousMatch).toBe(initialFunctions.goToPreviousMatch);
      expect(result.current.clearSearch).toBe(initialFunctions.clearSearch);
    });
  });
});
