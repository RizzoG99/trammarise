import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AudioPlayer } from './AudioPlayer';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: Record<string, unknown>) => {
      if (opts?.speed !== undefined) return `${opts.speed}x`;
      return key;
    },
  }),
}));

// Mock useAudioPlayer so uncontrolled mode doesn't need a real Audio element
vi.mock('../../../../features/results/hooks/useAudioPlayer', () => ({
  useAudioPlayer: vi.fn(),
}));
import { useAudioPlayer } from '../../../../features/results/hooks/useAudioPlayer';

const mockFile = new File(['audio'], 'test.mp3', { type: 'audio/mp3' });
const mockBlob = new Blob(['audio'], { type: 'audio/mp3' });

const createMockPlayer = (overrides: Record<string, unknown> = {}) => ({
  audioRef: { current: null as HTMLAudioElement | null },
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

describe('AudioPlayer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock for internal hook (uncontrolled mode)
    vi.mocked(useAudioPlayer).mockReturnValue(createMockPlayer());
  });

  describe('Uncontrolled mode (no audioPlayer prop)', () => {
    it('renders without crashing with a File', () => {
      expect(() => render(<AudioPlayer file={mockFile} />)).not.toThrow();
    });

    it('renders without crashing with a Blob', () => {
      expect(() => render(<AudioPlayer file={mockBlob} />)).not.toThrow();
    });

    it('renders play button', () => {
      render(<AudioPlayer file={mockFile} />);
      expect(screen.getByRole('button', { name: 'audioPlayer.play' })).toBeInTheDocument();
    });

    it('renders seek slider', () => {
      render(<AudioPlayer file={mockFile} />);
      expect(screen.getByRole('slider')).toBeInTheDocument();
    });

    it('renders time display', () => {
      render(<AudioPlayer file={mockFile} />);
      // mock player has currentTime=30 → "0:30", duration=120 → "2:00"
      expect(screen.getByText('0:30 / 2:00')).toBeInTheDocument();
    });

    it('does not render skip buttons by default', () => {
      render(<AudioPlayer file={mockFile} />);
      expect(
        screen.queryByRole('button', { name: 'audioPlayer.skipBack' })
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: 'audioPlayer.skipForward' })
      ).not.toBeInTheDocument();
    });

    it('does not render speed control by default', () => {
      render(<AudioPlayer file={mockFile} />);
      expect(screen.queryByText('1x')).not.toBeInTheDocument();
    });

    it('does not render fileName label by default', () => {
      render(<AudioPlayer file={mockFile} />);
      expect(screen.queryByText('test.mp3')).not.toBeInTheDocument();
    });
  });

  describe('Controlled mode (audioPlayer prop)', () => {
    let mockPlayer: ReturnType<typeof createMockPlayer>;

    beforeEach(() => {
      mockPlayer = createMockPlayer();
    });

    it('renders using external player state', () => {
      render(<AudioPlayer file={mockFile} audioPlayer={mockPlayer} />);
      // currentTime=30 → 0:30, duration=120 → 2:00
      expect(screen.getByText('0:30 / 2:00')).toBeInTheDocument();
    });

    it('calls external togglePlayPause on play click', () => {
      render(<AudioPlayer file={mockFile} audioPlayer={mockPlayer} />);
      fireEvent.click(screen.getByRole('button', { name: 'audioPlayer.play' }));
      expect(mockPlayer.togglePlayPause).toHaveBeenCalledTimes(1);
    });

    it('shows pause button when external player is playing', () => {
      mockPlayer = createMockPlayer({ state: { ...createMockPlayer().state, isPlaying: true } });
      render(<AudioPlayer file={mockFile} audioPlayer={mockPlayer} />);
      expect(screen.getByRole('button', { name: 'audioPlayer.pause' })).toBeInTheDocument();
    });

    it('calls external seek when slider changes', () => {
      render(<AudioPlayer file={mockFile} audioPlayer={mockPlayer} />);
      fireEvent.change(screen.getByRole('slider'), { target: { value: '60' } });
      expect(mockPlayer.seek).toHaveBeenCalledWith(60);
    });

    it('play button is disabled when external player is loading', () => {
      mockPlayer = createMockPlayer({ state: { ...createMockPlayer().state, isLoading: true } });
      render(<AudioPlayer file={mockFile} audioPlayer={mockPlayer} />);
      expect(screen.getByRole('button', { name: 'audioPlayer.play' })).toBeDisabled();
    });
  });

  describe('Feature flags', () => {
    let mockPlayer: ReturnType<typeof createMockPlayer>;

    beforeEach(() => {
      mockPlayer = createMockPlayer();
    });

    it('renders skip buttons when showSkipButtons=true', () => {
      render(<AudioPlayer file={mockFile} audioPlayer={mockPlayer} showSkipButtons />);
      expect(screen.getByRole('button', { name: 'audioPlayer.skipBack' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'audioPlayer.skipForward' })).toBeInTheDocument();
    });

    it('calls skipBy(-10) on skip back click', () => {
      render(<AudioPlayer file={mockFile} audioPlayer={mockPlayer} showSkipButtons />);
      fireEvent.click(screen.getByRole('button', { name: 'audioPlayer.skipBack' }));
      expect(mockPlayer.skipBy).toHaveBeenCalledWith(-10);
    });

    it('calls skipBy(10) on skip forward click', () => {
      render(<AudioPlayer file={mockFile} audioPlayer={mockPlayer} showSkipButtons />);
      fireEvent.click(screen.getByRole('button', { name: 'audioPlayer.skipForward' }));
      expect(mockPlayer.skipBy).toHaveBeenCalledWith(10);
    });

    it('renders speed control when showSpeedControl=true', () => {
      render(<AudioPlayer file={mockFile} audioPlayer={mockPlayer} showSpeedControl />);
      expect(screen.getByText('1x')).toBeInTheDocument();
    });

    it('calls cycleSpeed on speed button click', () => {
      render(<AudioPlayer file={mockFile} audioPlayer={mockPlayer} showSpeedControl />);
      fireEvent.click(screen.getByRole('button', { name: '1x' }));
      expect(mockPlayer.cycleSpeed).toHaveBeenCalledTimes(1);
    });

    it('shows updated speed label when playbackRate changes', () => {
      mockPlayer = createMockPlayer({
        state: { ...createMockPlayer().state, playbackRate: 1.5 },
      });
      render(<AudioPlayer file={mockFile} audioPlayer={mockPlayer} showSpeedControl />);
      expect(screen.getByText('1.5x')).toBeInTheDocument();
    });
  });

  describe('fileName prop', () => {
    it('renders label when fileName is provided', () => {
      render(<AudioPlayer file={mockFile} fileName="interview.mp3" />);
      expect(screen.getByText('interview.mp3')).toBeInTheDocument();
    });

    it('does not render label when fileName is omitted', () => {
      render(<AudioPlayer file={mockFile} />);
      expect(screen.queryByText('interview.mp3')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('seek slider has aria-label', () => {
      render(<AudioPlayer file={mockFile} />);
      expect(screen.getByRole('slider')).toHaveAttribute(
        'aria-label',
        'audioPreview.seekAriaLabel'
      );
    });

    it('seek slider aria-valuemin is 0', () => {
      render(<AudioPlayer file={mockFile} />);
      expect(screen.getByRole('slider')).toHaveAttribute('aria-valuemin', '0');
    });

    it('play button has accessible label', () => {
      render(<AudioPlayer file={mockFile} />);
      expect(screen.getByRole('button', { name: 'audioPlayer.play' })).toBeInTheDocument();
    });
  });

  describe('Edge cases', () => {
    it('seek slider max is 0 when duration is NaN', () => {
      const mockPlayer = createMockPlayer({
        state: { ...createMockPlayer().state, duration: NaN },
      });
      render(<AudioPlayer file={mockFile} audioPlayer={mockPlayer} />);
      expect(screen.getByRole('slider')).toHaveAttribute('max', '0');
    });

    it('renders without crashing when duration is Infinity', () => {
      const mockPlayer = createMockPlayer({
        state: { ...createMockPlayer().state, duration: Infinity },
      });
      expect(() => render(<AudioPlayer file={mockFile} audioPlayer={mockPlayer} />)).not.toThrow();
    });

    it('applies className prop to root element', () => {
      const { container } = render(<AudioPlayer file={mockFile} className="mt-3 custom" />);
      expect(container.firstChild).toHaveClass('mt-3', 'custom');
    });
  });
});
