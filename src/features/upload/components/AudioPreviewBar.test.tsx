import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AudioPreviewBar } from './AudioPreviewBar';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

// MiniAudioPlayer uses Audio constructor and URL APIs — stub them
global.URL.createObjectURL = vi.fn(() => 'blob:mock');
global.URL.revokeObjectURL = vi.fn();

const mockAudioInstance = {
  src: '',
  currentTime: 0,
  duration: NaN,
  paused: true,
  play: vi.fn().mockResolvedValue(undefined),
  pause: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal('Audio', function (this: unknown) {
    return mockAudioInstance;
  } as unknown as typeof Audio);
});

describe('AudioPreviewBar', () => {
  const mockFile = new File(['audio'], 'my-recording.mp3', { type: 'audio/mpeg' });
  const mockBlob = new Blob(['audio'], { type: 'audio/webm' });

  it('renders filename for a File', () => {
    render(<AudioPreviewBar file={mockFile} />);
    expect(screen.getByText('my-recording.mp3')).toBeInTheDocument();
  });

  it('renders fallback filename for a Blob', () => {
    render(<AudioPreviewBar file={mockBlob} />);
    expect(screen.getByText('recording.webm')).toBeInTheDocument();
  });

  it('renders a play button (from MiniAudioPlayer)', () => {
    render(<AudioPreviewBar file={mockFile} />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('renders a seek bar (from MiniAudioPlayer)', () => {
    render(<AudioPreviewBar file={mockFile} />);
    expect(screen.getByRole('slider')).toBeInTheDocument();
  });

  it('has lg:hidden class for mobile-only visibility', () => {
    const { container } = render(<AudioPreviewBar file={mockFile} />);
    const root = container.firstChild as HTMLElement;
    expect(root.className).toContain('lg:hidden');
  });

  it('applies animate-fade-up for slide-in animation', () => {
    const { container } = render(<AudioPreviewBar file={mockFile} />);
    const root = container.firstChild as HTMLElement;
    expect(root.className).toContain('animate-fade-up');
  });
});
