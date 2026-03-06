import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { MiniAudioPlayer } from './MiniAudioPlayer';

// Mock i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

// Mock URL.createObjectURL / revokeObjectURL
const mockObjectUrl = 'blob:http://localhost/mock-audio';
global.URL.createObjectURL = vi.fn(() => mockObjectUrl);
global.URL.revokeObjectURL = vi.fn();

// Build a minimal HTMLMediaElement mock
function mockAudioElement() {
  const listeners: Record<string, EventListener[]> = {};
  const audio = {
    src: '',
    currentTime: 0,
    duration: NaN,
    paused: true,
    play: vi.fn().mockResolvedValue(undefined),
    pause: vi.fn(),
    addEventListener: vi.fn((event: string, cb: EventListener) => {
      if (!listeners[event]) listeners[event] = [];
      listeners[event].push(cb);
    }),
    removeEventListener: vi.fn((event: string, cb: EventListener) => {
      if (listeners[event]) {
        listeners[event] = listeners[event].filter((l) => l !== cb);
      }
    }),
    _trigger: (event: string, props: Partial<typeof audio> = {}) => {
      Object.assign(audio, props);
      (listeners[event] ?? []).forEach((cb) => cb(new Event(event)));
    },
  };
  return audio;
}

describe('MiniAudioPlayer', () => {
  let audioMock: ReturnType<typeof mockAudioElement>;
  const mockFile = new File(['audio'], 'test.mp3', { type: 'audio/mpeg' });

  beforeEach(() => {
    audioMock = mockAudioElement();
    vi.clearAllMocks();
    global.URL.createObjectURL = vi.fn(() => mockObjectUrl);
    // Mock Audio constructor — must be a regular function (not arrow) to support `new`
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.stubGlobal('Audio', function (this: unknown) {
      return audioMock;
    } as any);
  });

  it('renders play button and seek bar', () => {
    render(<MiniAudioPlayer file={mockFile} />);
    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByRole('slider')).toBeInTheDocument();
  });

  it('shows 0:00 / 0:00 initially when duration is unknown', () => {
    render(<MiniAudioPlayer file={mockFile} />);
    expect(screen.getByText('0:00 / 0:00')).toBeInTheDocument();
  });

  it('creates an object URL from the file', () => {
    render(<MiniAudioPlayer file={mockFile} />);
    expect(URL.createObjectURL).toHaveBeenCalledWith(mockFile);
  });

  it('revokes the object URL on unmount', () => {
    const { unmount } = render(<MiniAudioPlayer file={mockFile} />);
    unmount();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith(mockObjectUrl);
  });

  it('calls audio.play when play button is clicked', async () => {
    render(<MiniAudioPlayer file={mockFile} />);
    await act(async () => {
      fireEvent.click(screen.getByRole('button'));
    });
    expect(audioMock.play).toHaveBeenCalled();
  });

  it('calls audio.pause when paused after playing', async () => {
    render(<MiniAudioPlayer file={mockFile} />);
    // Start playing
    await act(async () => {
      fireEvent.click(screen.getByRole('button'));
    });
    // Simulate playing state
    act(() => {
      audioMock._trigger('play', { paused: false });
    });
    // Pause
    act(() => {
      fireEvent.click(screen.getByRole('button'));
    });
    expect(audioMock.pause).toHaveBeenCalled();
  });

  it('displays formatted duration after durationchange', () => {
    render(<MiniAudioPlayer file={mockFile} />);
    act(() => {
      audioMock._trigger('durationchange', { duration: 134 });
    });
    expect(screen.getByText('0:00 / 2:14')).toBeInTheDocument();
  });

  it('displays formatted current time after timeupdate', () => {
    render(<MiniAudioPlayer file={mockFile} />);
    act(() => {
      audioMock._trigger('durationchange', { duration: 134 });
      audioMock._trigger('timeupdate', { currentTime: 23 });
    });
    expect(screen.getByText('0:23 / 2:14')).toBeInTheDocument();
  });

  it('resets to paused on ended event', () => {
    render(<MiniAudioPlayer file={mockFile} />);
    act(() => {
      audioMock._trigger('play', { paused: false });
      audioMock._trigger('ended', { paused: true, currentTime: 0 });
    });
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('has accessible aria-labels on play button and seek bar', () => {
    render(<MiniAudioPlayer file={mockFile} />);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label');
    const slider = screen.getByRole('slider');
    expect(slider).toHaveAttribute('aria-label');
  });

  it('seek bar updates audio currentTime on change', () => {
    render(<MiniAudioPlayer file={mockFile} />);
    act(() => {
      audioMock._trigger('durationchange', { duration: 60 });
    });
    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: '30' } });
    expect(audioMock.currentTime).toBe(30);
  });
});
