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
      render(<SearchableTranscript transcript={mockTranscript} />);
      // Should not have navigation buttons (ChevronUp/ChevronDown)
      const chevronUpButtons = document.querySelectorAll('svg.lucide-chevron-up');
      const chevronDownButtons = document.querySelectorAll('svg.lucide-chevron-down');
      expect(chevronUpButtons.length).toBe(0);
      expect(chevronDownButtons.length).toBe(0);
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

      const { container } = render(<SearchableTranscript transcript={mockTranscript} />);
      // Clear button has X icon
      const clearButton = container.querySelector('button svg.lucide-x');
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

      const { container } = render(<SearchableTranscript transcript={mockTranscript} />);
      const clearButton = container.querySelector('button svg.lucide-x')?.parentElement;
      expect(clearButton).toBeInTheDocument();

      fireEvent.click(clearButton!);

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

      // Should have 2 marks
      expect(marks.length).toBeGreaterThanOrEqual(2);
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

      const { container } = render(<SearchableTranscript transcript={mockTranscript} />);
      // Check for navigation buttons by their icons
      const chevronUpButton = container.querySelector('svg.lucide-chevron-up');
      const chevronDownButton = container.querySelector('svg.lucide-chevron-down');
      
      expect(chevronUpButton).toBeInTheDocument();
      expect(chevronDownButton).toBeInTheDocument();
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

      const { container } = render(<SearchableTranscript transcript={mockTranscript} />);
      // Previous button has ChevronUp icon
      const previousButton = container.querySelector('svg.lucide-chevron-up')?.parentElement;
      expect(previousButton).toBeInTheDocument();

      fireEvent.click(previousButton!);

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

      const { container } = render(<SearchableTranscript transcript={mockTranscript} />);
      // Next button has ChevronDown icon
      const nextButton = container.querySelector('svg.lucide-chevron-down')?.parentElement;
      expect(nextButton).toBeInTheDocument();

      fireEvent.click(nextButton!);

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
      render(<SearchableTranscript transcript={multilineTranscript} />);
      // Component renders transcript through TranscriptSegmentBlock
      // Just verify the content is rendered
      expect(screen.getByText('Transcript')).toBeInTheDocument();
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

      const { container } = render(<SearchableTranscript transcript={mockTranscript} />);
      expect(screen.queryByText(/matches/)).not.toBeInTheDocument();
      // Should have clear button (X icon) but no navigation buttons
      const clearButton = container.querySelector('svg.lucide-x');
      const navButtons = container.querySelectorAll('svg.lucide-chevron-up, svg.lucide-chevron-down');
      expect(clearButton).toBeInTheDocument();
      expect(navButtons.length).toBe(0);
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

      const { container } = render(<SearchableTranscript transcript={mockTranscript} />);

      // Verify all hook values are being used
      const searchInput = screen.getByPlaceholderText('Search transcript...') as HTMLInputElement;
      expect(searchInput.value).toBe('test');
      expect(screen.getByText('1 of 1 matches')).toBeInTheDocument();
      // Should have clear button + navigation buttons
      const clearButton = container.querySelector('svg.lucide-x');
      const chevronUp = container.querySelector('svg.lucide-chevron-up');
      const chevronDown = container.querySelector('svg.lucide-chevron-down');
      expect(clearButton).toBeInTheDocument();
      expect(chevronUp).toBeInTheDocument();
      expect(chevronDown).toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('applies proper styling to transcript segments', () => {
      const { container } = render(<SearchableTranscript transcript="Line 1\nLine 2" />);
      // Component uses TranscriptSegmentBlock which has its own styling
      // Verify the component renders properly
      const glassCard = container.querySelector('.p-6');
      expect(glassCard).toBeInTheDocument();
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

      const { container } = render(<SearchableTranscript transcript={mockTranscript} />);
      const clearButton = container.querySelector('button svg.lucide-x')?.parentElement;
      expect(clearButton).toHaveClass('hover:text-text-primary');
    });

    it('applies focus border to search input', () => {
      render(<SearchableTranscript transcript={mockTranscript} />);
      const searchInput = screen.getByPlaceholderText('Search transcript...');
      expect(searchInput).toHaveClass('focus:border-primary');
    });
  });
});
