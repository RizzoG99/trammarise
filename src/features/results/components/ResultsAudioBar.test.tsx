import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ResultsAudioBar } from './ResultsAudioBar';
import type { AudioFile } from '../../../types/audio';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: Record<string, unknown>) => {
      if (opts?.speed !== undefined) return `${opts.speed}x`;
      return key;
    },
  }),
}));

const mockAudioFile: AudioFile = {
  name: 'interview.mp3',
  blob: new Blob(['audio'], { type: 'audio/mp3' }),
};

const createMockPlayer = (overrides: Record<string, unknown> = {}) => ({
  audioRef: { current: null },
  state: {
    isPlaying: false,
    currentTime: 30,
    duration: 120,
    playbackRate: 1.0,
    isLoading: false,
  },
  togglePlayPause: vi.fn(),
  skipBy: vi.fn(),
  cycleSpeed: vi.fn(),
  seek: vi.fn(),
  play: vi.fn(),
  pause: vi.fn(),
  setSpeed: vi.fn(),
  ...overrides,
});

describe('ResultsAudioBar', () => {
  let mockPlayer: ReturnType<typeof createMockPlayer>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockPlayer = createMockPlayer();
  });

  describe('Rendering', () => {
    it('renders the audio file name', () => {
      render(<ResultsAudioBar audioFile={mockAudioFile} audioPlayer={mockPlayer} />);
      expect(screen.getByText('interview.mp3')).toBeInTheDocument();
    });

    it('renders play button when not playing', () => {
      render(<ResultsAudioBar audioFile={mockAudioFile} audioPlayer={mockPlayer} />);
      expect(screen.getByRole('button', { name: 'audioPlayer.play' })).toBeInTheDocument();
    });

    it('renders pause button when playing', () => {
      mockPlayer = createMockPlayer({ state: { ...createMockPlayer().state, isPlaying: true } });
      render(<ResultsAudioBar audioFile={mockAudioFile} audioPlayer={mockPlayer} />);
      expect(screen.getByRole('button', { name: 'audioPlayer.pause' })).toBeInTheDocument();
    });

    it('renders skip back button', () => {
      render(<ResultsAudioBar audioFile={mockAudioFile} audioPlayer={mockPlayer} />);
      expect(screen.getByRole('button', { name: 'audioPlayer.skipBack' })).toBeInTheDocument();
    });

    it('renders skip forward button', () => {
      render(<ResultsAudioBar audioFile={mockAudioFile} audioPlayer={mockPlayer} />);
      expect(screen.getByRole('button', { name: 'audioPlayer.skipForward' })).toBeInTheDocument();
    });

    it('renders speed control button', () => {
      render(<ResultsAudioBar audioFile={mockAudioFile} audioPlayer={mockPlayer} />);
      // Should show current speed (1x)
      expect(screen.getByText('1x')).toBeInTheDocument();
    });

    it('renders time display with current and total time', () => {
      render(<ResultsAudioBar audioFile={mockAudioFile} audioPlayer={mockPlayer} />);
      // currentTime=30s → 0:30, duration=120s → 2:00
      expect(screen.getByText('0:30 / 2:00')).toBeInTheDocument();
    });

    it('renders seek slider', () => {
      render(<ResultsAudioBar audioFile={mockAudioFile} audioPlayer={mockPlayer} />);
      const slider = screen.getByRole('slider');
      expect(slider).toBeInTheDocument();
    });

    it('seek slider max matches duration', () => {
      render(<ResultsAudioBar audioFile={mockAudioFile} audioPlayer={mockPlayer} />);
      const slider = screen.getByRole('slider');
      expect(slider).toHaveAttribute('max', '120');
    });

    it('seek slider aria-valuenow matches currentTime', () => {
      render(<ResultsAudioBar audioFile={mockAudioFile} audioPlayer={mockPlayer} />);
      const slider = screen.getByRole('slider');
      expect(slider).toHaveAttribute('aria-valuenow', '30');
    });

    it('play button is disabled when loading', () => {
      mockPlayer = createMockPlayer({ state: { ...createMockPlayer().state, isLoading: true } });
      render(<ResultsAudioBar audioFile={mockAudioFile} audioPlayer={mockPlayer} />);
      const playButton = screen.getByRole('button', { name: 'audioPlayer.play' });
      expect(playButton).toBeDisabled();
    });

    it('shows updated speed when playbackRate changes', () => {
      mockPlayer = createMockPlayer({
        state: { ...createMockPlayer().state, playbackRate: 1.5 },
      });
      render(<ResultsAudioBar audioFile={mockAudioFile} audioPlayer={mockPlayer} />);
      expect(screen.getByText('1.5x')).toBeInTheDocument();
    });

    it('shows 0:00 / 0:00 when duration is not yet loaded', () => {
      mockPlayer = createMockPlayer({
        state: { ...createMockPlayer().state, currentTime: 0, duration: NaN },
      });
      render(<ResultsAudioBar audioFile={mockAudioFile} audioPlayer={mockPlayer} />);
      expect(screen.getByText('0:00 / 0:00')).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('calls togglePlayPause on play button click', () => {
      render(<ResultsAudioBar audioFile={mockAudioFile} audioPlayer={mockPlayer} />);
      fireEvent.click(screen.getByRole('button', { name: 'audioPlayer.play' }));
      expect(mockPlayer.togglePlayPause).toHaveBeenCalledTimes(1);
    });

    it('calls togglePlayPause on pause button click', () => {
      mockPlayer = createMockPlayer({ state: { ...createMockPlayer().state, isPlaying: true } });
      render(<ResultsAudioBar audioFile={mockAudioFile} audioPlayer={mockPlayer} />);
      fireEvent.click(screen.getByRole('button', { name: 'audioPlayer.pause' }));
      expect(mockPlayer.togglePlayPause).toHaveBeenCalledTimes(1);
    });

    it('calls skipBy(-10) on skip back click', () => {
      render(<ResultsAudioBar audioFile={mockAudioFile} audioPlayer={mockPlayer} />);
      fireEvent.click(screen.getByRole('button', { name: 'audioPlayer.skipBack' }));
      expect(mockPlayer.skipBy).toHaveBeenCalledWith(-10);
    });

    it('calls skipBy(10) on skip forward click', () => {
      render(<ResultsAudioBar audioFile={mockAudioFile} audioPlayer={mockPlayer} />);
      fireEvent.click(screen.getByRole('button', { name: 'audioPlayer.skipForward' }));
      expect(mockPlayer.skipBy).toHaveBeenCalledWith(10);
    });

    it('calls cycleSpeed on speed button click', () => {
      render(<ResultsAudioBar audioFile={mockAudioFile} audioPlayer={mockPlayer} />);
      // Speed button aria-label resolves to "1x" via the i18n mock
      const speedButton = screen.getByRole('button', { name: '1x' });
      fireEvent.click(speedButton);
      expect(mockPlayer.cycleSpeed).toHaveBeenCalledTimes(1);
    });

    it('calls seek with the new value when slider changes', () => {
      render(<ResultsAudioBar audioFile={mockAudioFile} audioPlayer={mockPlayer} />);
      const slider = screen.getByRole('slider');
      fireEvent.change(slider, { target: { value: '60' } });
      expect(mockPlayer.seek).toHaveBeenCalledWith(60);
    });
  });

  describe('Accessibility', () => {
    it('play button has aria-label', () => {
      render(<ResultsAudioBar audioFile={mockAudioFile} audioPlayer={mockPlayer} />);
      expect(screen.getByRole('button', { name: 'audioPlayer.play' })).toBeInTheDocument();
    });

    it('seek slider has aria-label', () => {
      render(<ResultsAudioBar audioFile={mockAudioFile} audioPlayer={mockPlayer} />);
      const slider = screen.getByRole('slider');
      expect(slider).toHaveAttribute('aria-label', 'audioPreview.seekAriaLabel');
    });

    it('seek slider has correct aria-valuemin', () => {
      render(<ResultsAudioBar audioFile={mockAudioFile} audioPlayer={mockPlayer} />);
      expect(screen.getByRole('slider')).toHaveAttribute('aria-valuemin', '0');
    });
  });

  describe('Edge Cases', () => {
    it('seek slider max is 0 when duration is NaN', () => {
      mockPlayer = createMockPlayer({
        state: { ...createMockPlayer().state, duration: NaN },
      });
      render(<ResultsAudioBar audioFile={mockAudioFile} audioPlayer={mockPlayer} />);
      expect(screen.getByRole('slider')).toHaveAttribute('max', '0');
    });

    it('renders without crashing when duration is Infinity', () => {
      mockPlayer = createMockPlayer({
        state: { ...createMockPlayer().state, duration: Infinity },
      });
      expect(() =>
        render(<ResultsAudioBar audioFile={mockAudioFile} audioPlayer={mockPlayer} />)
      ).not.toThrow();
    });

    it('handles file name with extension correctly', () => {
      const fileWithLongName: AudioFile = {
        name: 'my-long-recording-file-2024.wav',
        blob: new Blob(),
      };
      render(<ResultsAudioBar audioFile={fileWithLongName} audioPlayer={mockPlayer} />);
      expect(screen.getByText('my-long-recording-file-2024.wav')).toBeInTheDocument();
    });
  });
});
