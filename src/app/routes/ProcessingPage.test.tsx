import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { ProcessingPage } from './ProcessingPage';

// Mock dependencies
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: vi.fn(() => vi.fn()),
    useParams: vi.fn(() => ({ sessionId: 'test-session-id' })),
    Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
      <a href={to}>{children}</a>
    ),
  };
});

vi.mock('../../hooks/useSessionStorage', () => ({
  useSessionStorage: vi.fn(),
}));

vi.mock('../../hooks/useRouteState', () => ({
  useRouteState: vi.fn(),
}));

// Mock useAudioProcessing
const mockStartProcessing = vi.fn();
const mockCancel = vi.fn();
const mockUseAudioProcessing = vi.fn();

vi.mock('../../hooks/useAudioProcessing', () => ({
  useAudioProcessing: (options: {
    onProgress?: (step: string, progress: number) => void;
    onComplete?: (result: unknown) => void;
    onError?: (error: Error) => void;
  }) => mockUseAudioProcessing(options),
}));

vi.mock('../../components/layout/PageLayout', () => ({
  PageLayout: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="page-layout">{children}</div>
  ),
}));

// Mock config-helper to bypass API key validation in tests
vi.mock('../../utils/config-helper', () => ({
  validateEnvironmentConfiguration: vi.fn(),
  buildDefaultConfiguration: vi.fn(() => ({
    provider: 'openai',
    model: 'gpt-4',
    openaiApiKey: 'test-key',
    contentType: 'meeting',
  })),
}));

import { useParams } from 'react-router-dom';
import { useSessionStorage } from '../../hooks/useSessionStorage';
import { useRouteState } from '../../hooks/useRouteState';

describe('ProcessingPage', () => {
  const mockGoToResults = vi.fn();
  const mockGoToConfigure = vi.fn();
  const mockGoToAudio = vi.fn();

  const mockSession = {
    sessionId: 'test-session-id',
    audioFile: {
      name: 'test-audio.mp3',
      blob: new Blob(),
      file: new File([], 'test-audio.mp3'),
    },
    contextFiles: [],
    language: 'en' as const,
    contentType: 'meeting' as const,
    processingMode: 'balanced' as const,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  beforeEach(() => {
    vi.useFakeTimers();
    vi.mocked(useParams).mockReturnValue({ sessionId: 'test-session-id' });
    vi.mocked(useSessionStorage).mockReturnValue({
      session: mockSession,
      isLoading: false,
      updateSession: vi.fn(),
      clearSession: vi.fn(),
    });
    vi.mocked(useRouteState).mockReturnValue({
      sessionId: 'test-session-id',
      goToResults: mockGoToResults,
      goToConfigure: mockGoToConfigure,
      goToAudio: mockGoToAudio,
      goToProcessing: vi.fn(),
      goToHome: vi.fn(),
      navigateToRoute: vi.fn(),
    });

    // Default mock implementation for useAudioProcessing
    mockUseAudioProcessing.mockReturnValue({
      startProcessing: mockStartProcessing,
      cancel: mockCancel,
      isProcessing: false,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  describe('Initial Render', () => {
    it('renders PageLayout', () => {
      render(<ProcessingPage />);
      expect(screen.getByTestId('page-layout')).toBeInTheDocument();
    });

    it('renders ProgressCircle at 0%', () => {
      render(<ProcessingPage />);
      expect(screen.getByText('0%')).toBeInTheDocument();
    });

    it('renders StepChecklist with 4 steps', () => {
      render(<ProcessingPage />);
      expect(screen.getByText('Processing Steps')).toBeInTheDocument();
      expect(screen.getByText(/Uploading Audio/)).toBeInTheDocument();
      expect(screen.getByText(/Transcribing Speech/)).toBeInTheDocument();
      expect(screen.getByText(/Analyzing Context/)).toBeInTheDocument();
      expect(screen.getByText(/Summarizing Key Points/)).toBeInTheDocument();
    });

    it('renders Cancel button', () => {
      render(<ProcessingPage />);
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    });

    it('starts processing on mount', () => {
      render(<ProcessingPage />);
      expect(mockStartProcessing).toHaveBeenCalledWith(mockSession, expect.anything());
    });
  });

  describe('Progress Updates', () => {
    it('updates progress when onProgress is called', () => {
      render(<ProcessingPage />);

      // Get the callbacks passed to useAudioProcessing
      const { onProgress } = mockUseAudioProcessing.mock.calls[0][0];

      act(() => {
        onProgress('uploading', 10);
      });

      expect(screen.getByText('10%')).toBeInTheDocument();
    });

    it('updates steps based on progress', () => {
      render(<ProcessingPage />);
      const { onProgress } = mockUseAudioProcessing.mock.calls[0][0];

      // 0%: uploading
      expect(screen.getByText(/Uploading Audio/)).toBeInTheDocument();

      // 30%: transcribing
      act(() => {
        onProgress('transcribing', 30);
      });
      expect(screen.getByText(/Transcribing Speech/)).toBeInTheDocument();

      // 70%: analyzing
      act(() => {
        onProgress('analyzing', 70);
      });
      expect(screen.getByText(/Analyzing Context/)).toBeInTheDocument();

      // 80%: summarizing
      act(() => {
        onProgress('summarizing', 80);
      });
      expect(screen.getByText(/Summarizing Key Points/)).toBeInTheDocument();
    });

    it('updates time estimate based on progress', () => {
      render(<ProcessingPage />);
      const { onProgress } = mockUseAudioProcessing.mock.calls[0][0];

      // < 30%: "2-3 min"
      expect(screen.getByText(/2-3 min/)).toBeInTheDocument();

      // 30-69%: "1-2 min"
      act(() => {
        onProgress('transcribing', 40);
      });
      expect(screen.getByText(/1-2 min/)).toBeInTheDocument();

      // >= 70%: "Almost done" -> "processing.almostDone"
      act(() => {
        onProgress('analyzing', 75);
      });
      expect(screen.getByText('Estimated time: Almost done')).toBeInTheDocument();
    });
  });

  describe('Completion Navigation', () => {
    it('navigates to results page when onComplete is called', async () => {
      render(<ProcessingPage />);
      const { onComplete } = mockUseAudioProcessing.mock.calls[0][0];

      await act(async () => {
        await onComplete({ summary: 'test' });
      });

      // Advance timers for the navigation delay
      act(() => {
        vi.advanceTimersByTime(500);
      });

      expect(mockGoToResults).toHaveBeenCalledTimes(1);
    });
  });

  describe('Cancel Button', () => {
    it('calls cancel and navigates to audio when clicked', () => {
      render(<ProcessingPage />);
      const cancelButton = screen.getByRole('button', { name: 'Cancel' });

      cancelButton.click();

      expect(mockCancel).toHaveBeenCalledTimes(1);
      expect(mockGoToAudio).toHaveBeenCalledTimes(1);
    });

    it('is enabled when progress is less than 100%', () => {
      render(<ProcessingPage />);
      const cancelButton = screen.getByRole('button', { name: 'Cancel' });

      expect(cancelButton).not.toBeDisabled();
    });

    it('is disabled when progress reaches 100%', () => {
      render(<ProcessingPage />);
      const { onProgress } = mockUseAudioProcessing.mock.calls[0][0];

      act(() => {
        onProgress('summarizing', 100);
      });

      const cancelButton = screen.getByRole('button', { name: 'Cancel' });
      expect(cancelButton).toBeDisabled();
    });
  });

  describe('Error Handling', () => {
    it('displays error message when onError is called', () => {
      render(<ProcessingPage />);
      const { onError } = mockUseAudioProcessing.mock.calls[0][0];

      act(() => {
        onError(new Error('Test processing error'));
      });

      expect(screen.getByText('An error occurred')).toBeInTheDocument();
      expect(screen.getByText('Test processing error')).toBeInTheDocument();
    });

    it('offers button to go back to audio on error', () => {
      render(<ProcessingPage />);
      const { onError } = mockUseAudioProcessing.mock.calls[0][0];

      act(() => {
        onError(new Error('Test error'));
      });

      const backButton = screen.getByRole('button', { name: 'Back' });
      backButton.click();

      expect(mockGoToAudio).toHaveBeenCalled();
    });
  });

  describe('Session Loading', () => {
    it('shows loading state when session is loading', () => {
      vi.mocked(useSessionStorage).mockReturnValue({
        session: null,
        isLoading: true,
        updateSession: vi.fn(),
        clearSession: vi.fn(),
      });

      render(<ProcessingPage />);
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles missing sessionId parameter', () => {
      vi.mocked(useParams).mockReturnValue({ sessionId: undefined });

      render(<ProcessingPage />);
      expect(useSessionStorage).toHaveBeenCalledWith(null);
    });
  });
});
