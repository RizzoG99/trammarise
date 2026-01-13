import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SearchableTranscript } from './SearchableTranscript';

// Mock the useTranscriptSearch hook
vi.mock('../hooks/useTranscriptSearch', () => ({
  useTranscriptSearch: vi.fn(),
}));

import { useTranscriptSearch, type SearchMatch } from '../hooks/useTranscriptSearch';

describe('SearchableTranscript', () => {
  const mockTranscript = 'This is a test transcript. It contains test data for testing purposes.';
  const mockSetSearchQuery = vi.fn();
  const mockGoToNextMatch = vi.fn();
  const mockGoToPreviousMatch = vi.fn();
  const mockClearSearch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock implementation
    vi.mocked(useTranscriptSearch).mockReturnValue({
      searchQuery: '',
      setSearchQuery: mockSetSearchQuery,
      matches: [],
      currentMatchIndex: 0,
      currentMatch: undefined as SearchMatch | undefined,
      totalMatches: 0,
      goToNextMatch: mockGoToNextMatch,
      goToPreviousMatch: mockGoToPreviousMatch,
      clearSearch: mockClearSearch,
      hasMatches: false,
    });
  });

  describe('Rendering', () => {
    it('renders transcript content', () => {
      render(<SearchableTranscript transcript={mockTranscript} />);
      expect(screen.getByText(mockTranscript)).toBeInTheDocument();
    });

    it('renders heading', () => {
      render(<SearchableTranscript transcript={mockTranscript} />);
      expect(screen.getByText('Transcript')).toBeInTheDocument();
    });

    it('renders search input', () => {
      render(<SearchableTranscript transcript={mockTranscript} />);
      const searchInput = screen.getByPlaceholderText('Search transcript...');
      expect(searchInput).toBeInTheDocument();
    });

    it('renders search icon', () => {
      const { container } = render(<SearchableTranscript transcript={mockTranscript} />);
      // Search icon (lucide-react renders as SVG)
      const searchIcon = container.querySelector('svg');
      expect(searchIcon).toBeInTheDocument();
    });

    it('does not render navigation buttons when no matches', () => {
      const { container } = render(<SearchableTranscript transcript={mockTranscript} />);
      const buttons = container.querySelectorAll('button');
      // Should have no buttons when search query is empty
      expect(buttons.length).toBe(0);
    });

    it('does not render match counter when no matches', () => {
      render(<SearchableTranscript transcript={mockTranscript} />);
      expect(screen.queryByText(/of.*matches/)).not.toBeInTheDocument();
    });
  });

  describe('Search Functionality', () => {
    it('updates search query when typing', () => {
      render(<SearchableTranscript transcript={mockTranscript} />);
      const searchInput = screen.getByPlaceholderText('Search transcript...');

      fireEvent.change(searchInput, { target: { value: 'test' } });

      expect(mockSetSearchQuery).toHaveBeenCalledWith('test');
    });

    it('displays search query value', () => {
      vi.mocked(useTranscriptSearch).mockReturnValue({
        searchQuery: 'test',
        setSearchQuery: mockSetSearchQuery,
        matches: [],
        currentMatchIndex: 0,
        currentMatch: undefined,
        totalMatches: 0,
        goToNextMatch: mockGoToNextMatch,
        goToPreviousMatch: mockGoToPreviousMatch,
        clearSearch: mockClearSearch,
        hasMatches: false,
      });

      render(<SearchableTranscript transcript={mockTranscript} />);
      const searchInput = screen.getByPlaceholderText('Search transcript...') as HTMLInputElement;

      expect(searchInput.value).toBe('test');
    });

    it('shows clear button when search query exists', () => {
      vi.mocked(useTranscriptSearch).mockReturnValue({
        searchQuery: 'test',
        setSearchQuery: mockSetSearchQuery,
        matches: [],
        currentMatchIndex: 0,
        currentMatch: undefined,
        totalMatches: 0,
        goToNextMatch: mockGoToNextMatch,
        goToPreviousMatch: mockGoToPreviousMatch,
        clearSearch: mockClearSearch,
        hasMatches: false,
      });

      render(<SearchableTranscript transcript={mockTranscript} />);
      const clearButton = screen.getByRole('button');
      expect(clearButton).toBeInTheDocument();
    });

    it('calls clearSearch when clear button is clicked', () => {
      vi.mocked(useTranscriptSearch).mockReturnValue({
        searchQuery: 'test',
        setSearchQuery: mockSetSearchQuery,
        matches: [],
        currentMatchIndex: 0,
        currentMatch: undefined,
        totalMatches: 0,
        goToNextMatch: mockGoToNextMatch,
        goToPreviousMatch: mockGoToPreviousMatch,
        clearSearch: mockClearSearch,
        hasMatches: false,
      });

      render(<SearchableTranscript transcript={mockTranscript} />);
      const clearButton = screen.getByRole('button');

      fireEvent.click(clearButton);

      expect(mockClearSearch).toHaveBeenCalledTimes(1);
    });
  });

  describe('Search Highlights', () => {
    it('highlights matches in transcript', () => {
      vi.mocked(useTranscriptSearch).mockReturnValue({
        searchQuery: 'test',
        setSearchQuery: mockSetSearchQuery,
        matches: [
          { index: 0, text: 'test', position: 10 }, // "test" in "a test transcript"
          { index: 1, text: 'test', position: 37 }, // "test" in "test data"
          { index: 2, text: 'test', position: 53 }, // "test" in "testing"
        ],
        currentMatchIndex: 0,
        currentMatch: { index: 0, text: 'test', position: 10 },
        totalMatches: 3,
        goToNextMatch: mockGoToNextMatch,
        goToPreviousMatch: mockGoToPreviousMatch,
        clearSearch: mockClearSearch,
        hasMatches: true,
      });

      const { container } = render(<SearchableTranscript transcript={mockTranscript} />);
      const marks = container.querySelectorAll('mark');

      expect(marks.length).toBe(3);
    });

    it('highlights current match differently', () => {
      vi.mocked(useTranscriptSearch).mockReturnValue({
        searchQuery: 'test',
        setSearchQuery: mockSetSearchQuery,
        matches: [
          { index: 0, text: 'test', position: 10 },
          { index: 1, text: 'test', position: 37 },
        ],
        currentMatchIndex: 0,
        currentMatch: { index: 0, text: 'test', position: 10 },
        totalMatches: 2,
        goToNextMatch: mockGoToNextMatch,
        goToPreviousMatch: mockGoToPreviousMatch,
        clearSearch: mockClearSearch,
        hasMatches: true,
      });

      const { container } = render(<SearchableTranscript transcript={mockTranscript} />);
      const marks = container.querySelectorAll('mark');

      // First match (current) should have bg-primary class
      expect(marks[0]).toHaveClass('bg-primary');
      // Other matches should have bg-yellow-300 class
      expect(marks[1]).toHaveClass('bg-yellow-300');
    });

    it('shows no highlights when search is empty', () => {
      render(<SearchableTranscript transcript={mockTranscript} />);
      const { container } = render(<SearchableTranscript transcript={mockTranscript} />);
      const marks = container.querySelectorAll('mark');

      expect(marks.length).toBe(0);
    });
  });

  describe('Match Counter', () => {
    it('displays match counter when matches exist', () => {
      vi.mocked(useTranscriptSearch).mockReturnValue({
        searchQuery: 'test',
        setSearchQuery: mockSetSearchQuery,
        matches: [{ index: 0, text: 'test', position: 10 }, { index: 1, text: 'test', position: 37 }],
        currentMatchIndex: 0,
        currentMatch: { index: 0, text: 'test', position: 10 },
        totalMatches: 2,
        goToNextMatch: mockGoToNextMatch,
        goToPreviousMatch: mockGoToPreviousMatch,
        clearSearch: mockClearSearch,
        hasMatches: true,
      });

      render(<SearchableTranscript transcript={mockTranscript} />);
      expect(screen.getByText('1 of 2 matches')).toBeInTheDocument();
    });

    it('updates counter when navigating matches', () => {
      vi.mocked(useTranscriptSearch).mockReturnValue({
        searchQuery: 'test',
        setSearchQuery: mockSetSearchQuery,
        matches: [{ index: 0, text: 'test', position: 10 }, { index: 1, text: 'test', position: 37 }],
        currentMatchIndex: 1,
        currentMatch: { index: 1, text: 'test', position: 37 },
        totalMatches: 2,
        goToNextMatch: mockGoToNextMatch,
        goToPreviousMatch: mockGoToPreviousMatch,
        clearSearch: mockClearSearch,
        hasMatches: true,
      });

      render(<SearchableTranscript transcript={mockTranscript} />);
      expect(screen.getByText('2 of 2 matches')).toBeInTheDocument();
    });

    it('displays correct counter for single match', () => {
      vi.mocked(useTranscriptSearch).mockReturnValue({
        searchQuery: 'transcript',
        setSearchQuery: mockSetSearchQuery,
        matches: [{ index: 0, text: 'transcript', position: 15 }],
        currentMatchIndex: 0,
        currentMatch: { index: 0, text: 'transcript', position: 15 },
        totalMatches: 1,
        goToNextMatch: mockGoToNextMatch,
        goToPreviousMatch: mockGoToPreviousMatch,
        clearSearch: mockClearSearch,
        hasMatches: true,
      });

      render(<SearchableTranscript transcript={mockTranscript} />);
      expect(screen.getByText('1 of 1 matches')).toBeInTheDocument();
    });
  });

  describe('Navigation Buttons', () => {
    it('renders navigation buttons when matches exist', () => {
      vi.mocked(useTranscriptSearch).mockReturnValue({
        searchQuery: 'test',
        setSearchQuery: mockSetSearchQuery,
        matches: [{ index: 0, text: 'test', position: 10 }, { index: 1, text: 'test', position: 37 }],
        currentMatchIndex: 0,
        currentMatch: { index: 0, text: 'test', position: 10 },
        totalMatches: 2,
        goToNextMatch: mockGoToNextMatch,
        goToPreviousMatch: mockGoToPreviousMatch,
        clearSearch: mockClearSearch,
        hasMatches: true,
      });

      render(<SearchableTranscript transcript={mockTranscript} />);
      const buttons = screen.getAllByRole('button');

      // Should have: clear button + previous button + next button = 3 buttons
      expect(buttons.length).toBe(3);
    });

    it('calls goToPreviousMatch when previous button clicked', () => {
      vi.mocked(useTranscriptSearch).mockReturnValue({
        searchQuery: 'test',
        setSearchQuery: mockSetSearchQuery,
        matches: [{ index: 0, text: 'test', position: 10 }, { index: 1, text: 'test', position: 37 }],
        currentMatchIndex: 1,
        currentMatch: { index: 1, text: 'test', position: 37 },
        totalMatches: 2,
        goToNextMatch: mockGoToNextMatch,
        goToPreviousMatch: mockGoToPreviousMatch,
        clearSearch: mockClearSearch,
        hasMatches: true,
      });

      render(<SearchableTranscript transcript={mockTranscript} />);
      // Previous button is the first button in the navigation group
      const buttons = screen.getAllByRole('button');
      const previousButton = buttons[buttons.length - 2]; // Second to last button

      fireEvent.click(previousButton);

      expect(mockGoToPreviousMatch).toHaveBeenCalledTimes(1);
    });

    it('calls goToNextMatch when next button clicked', () => {
      vi.mocked(useTranscriptSearch).mockReturnValue({
        searchQuery: 'test',
        setSearchQuery: mockSetSearchQuery,
        matches: [{ index: 0, text: 'test', position: 10 }, { index: 1, text: 'test', position: 37 }],
        currentMatchIndex: 0,
        currentMatch: { index: 0, text: 'test', position: 10 },
        totalMatches: 2,
        goToNextMatch: mockGoToNextMatch,
        goToPreviousMatch: mockGoToPreviousMatch,
        clearSearch: mockClearSearch,
        hasMatches: true,
      });

      render(<SearchableTranscript transcript={mockTranscript} />);
      const buttons = screen.getAllByRole('button');
      const nextButton = buttons[buttons.length - 1]; // Last button

      fireEvent.click(nextButton);

      expect(mockGoToNextMatch).toHaveBeenCalledTimes(1);
    });
  });

  describe('Edge Cases', () => {
    it('handles empty transcript', () => {
      render(<SearchableTranscript transcript="" />);
      expect(screen.getByText('Transcript')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Search transcript...')).toBeInTheDocument();
    });

    it('handles very long transcript', () => {
      const longTranscript = 'A'.repeat(10000);
      render(<SearchableTranscript transcript={longTranscript} />);
      expect(screen.getByText(longTranscript)).toBeInTheDocument();
    });

    it('handles transcript with special characters', () => {
      const specialTranscript = 'Test with @#$% special & characters!';
      render(<SearchableTranscript transcript={specialTranscript} />);
      expect(screen.getByText(specialTranscript)).toBeInTheDocument();
    });

    it('handles transcript with line breaks', () => {
      const multilineTranscript = 'Line 1\nLine 2\nLine 3';
      const { container } = render(<SearchableTranscript transcript={multilineTranscript} />);
      const transcriptDiv = container.querySelector('.whitespace-pre-wrap');
      expect(transcriptDiv?.textContent).toBe(multilineTranscript);
    });

    it('handles no matches found for search query', () => {
      vi.mocked(useTranscriptSearch).mockReturnValue({
        searchQuery: 'xyz',
        setSearchQuery: mockSetSearchQuery,
        matches: [],
        currentMatchIndex: 0,
        currentMatch: undefined,
        totalMatches: 0,
        goToNextMatch: mockGoToNextMatch,
        goToPreviousMatch: mockGoToPreviousMatch,
        clearSearch: mockClearSearch,
        hasMatches: false,
      });

      render(<SearchableTranscript transcript={mockTranscript} />);
      expect(screen.queryByText(/matches/)).not.toBeInTheDocument();
      expect(screen.getAllByRole('button').length).toBe(1); // Only clear button
    });

    it('handles search query with only whitespace', () => {
      vi.mocked(useTranscriptSearch).mockReturnValue({
        searchQuery: '   ',
        setSearchQuery: mockSetSearchQuery,
        matches: [],
        currentMatchIndex: 0,
        currentMatch: undefined,
        totalMatches: 0,
        goToNextMatch: mockGoToNextMatch,
        goToPreviousMatch: mockGoToPreviousMatch,
        clearSearch: mockClearSearch,
        hasMatches: false,
      });

      render(<SearchableTranscript transcript={mockTranscript} />);
      // Should display original transcript without highlights
      expect(screen.getByText(mockTranscript)).toBeInTheDocument();
    });
  });

  describe('Integration with useTranscriptSearch', () => {
    it('passes transcript to useTranscriptSearch hook', () => {
      render(<SearchableTranscript transcript={mockTranscript} />);
      expect(useTranscriptSearch).toHaveBeenCalledWith(mockTranscript);
    });

    it('uses all values from useTranscriptSearch hook', () => {
      const hookReturnValue = {
        searchQuery: 'test',
        setSearchQuery: mockSetSearchQuery,
        matches: [{ index: 0, text: 'test', position: 10 }],
        currentMatchIndex: 0,
        currentMatch: { index: 0, text: 'test', position: 10 },
        totalMatches: 1,
        goToNextMatch: mockGoToNextMatch,
        goToPreviousMatch: mockGoToPreviousMatch,
        clearSearch: mockClearSearch,
        hasMatches: true,
      };

      vi.mocked(useTranscriptSearch).mockReturnValue(hookReturnValue);

      render(<SearchableTranscript transcript={mockTranscript} />);

      // Verify all hook values are being used
      const searchInput = screen.getByPlaceholderText('Search transcript...') as HTMLInputElement;
      expect(searchInput.value).toBe('test');
      expect(screen.getByText('1 of 1 matches')).toBeInTheDocument();
      expect(screen.getAllByRole('button').length).toBe(3); // Clear + Previous + Next
    });
  });

  describe('Styling', () => {
    it('applies whitespace-pre-wrap to preserve line breaks', () => {
      const { container } = render(<SearchableTranscript transcript="Line 1\nLine 2" />);
      const transcriptDiv = container.querySelector('.whitespace-pre-wrap');
      expect(transcriptDiv).toBeInTheDocument();
    });

    it('applies hover effect to clear button', () => {
      vi.mocked(useTranscriptSearch).mockReturnValue({
        searchQuery: 'test',
        setSearchQuery: mockSetSearchQuery,
        matches: [],
        currentMatchIndex: 0,
        currentMatch: undefined,
        totalMatches: 0,
        goToNextMatch: mockGoToNextMatch,
        goToPreviousMatch: mockGoToPreviousMatch,
        clearSearch: mockClearSearch,
        hasMatches: false,
      });

      render(<SearchableTranscript transcript={mockTranscript} />);
      const clearButton = screen.getByRole('button');
      expect(clearButton).toHaveClass('hover:text-text-primary');
    });

    it('applies focus border to search input', () => {
      render(<SearchableTranscript transcript={mockTranscript} />);
      const searchInput = screen.getByPlaceholderText('Search transcript...');
      expect(searchInput).toHaveClass('focus:border-primary');
    });
  });
});
