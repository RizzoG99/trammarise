import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { WaveformPlayer } from './WaveformPlayer';
import type { WaveformPlayerRef } from './WaveformPlayer';

// ─── Mock useWaveSurfer ──────────────────────────────────────────────────────
// We isolate WaveformPlayer from the real WaveSurfer DOM/audio APIs.

const mockLoadAudio = vi.fn();
const mockEnableRegions = vi.fn();
const mockEnableRegionSelection = vi.fn();
const mockDisableRegionSelection = vi.fn();
const mockGetActiveRegion = vi.fn(() => null);
const mockClearRegions = vi.fn();

const baseReturn = {
  wavesurfer: null as WaveformPlayerRef['wavesurfer'] | null,
  regions: null as WaveformPlayerRef['regions'] | null,
  isReady: false,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  loadAudio: mockLoadAudio,
  play: vi.fn(),
  pause: vi.fn(),
  playPause: vi.fn(),
  enableRegions: mockEnableRegions,
  destroy: vi.fn(),
  enableRegionSelection: mockEnableRegionSelection,
  disableRegionSelection: mockDisableRegionSelection,
  getActiveRegion: mockGetActiveRegion,
  clearRegions: mockClearRegions,
};

const mockUseWaveSurfer = vi.fn(() => ({ ...baseReturn }));

vi.mock('../../../../hooks/useWaveSurfer', () => ({
  useWaveSurfer: (...args: unknown[]) => mockUseWaveSurfer(...args),
}));

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('WaveformPlayer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseWaveSurfer.mockImplementation(() => ({ ...baseReturn }));
  });

  describe('dragToSeek prop forwarding', () => {
    it('passes dragToSeek:false to useWaveSurfer when prop is false', () => {
      render(<WaveformPlayer audioFile={null} dragToSeek={false} />);
      expect(mockUseWaveSurfer).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ dragToSeek: false })
      );
    });

    it('passes dragToSeek:true to useWaveSurfer by default', () => {
      render(<WaveformPlayer audioFile={null} />);
      expect(mockUseWaveSurfer).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ dragToSeek: true })
      );
    });
  });

  describe('onWaveSurferReady callback', () => {
    const mockWaveSurfer = {} as WaveformPlayerRef['wavesurfer'];
    const mockRegions = {} as WaveformPlayerRef['regions'];

    it('calls onWaveSurferReady with wavesurfer and regions when both are available', () => {
      mockUseWaveSurfer.mockImplementation(() => ({
        ...baseReturn,
        wavesurfer: mockWaveSurfer,
        regions: mockRegions,
      }));

      const onReady = vi.fn();
      render(<WaveformPlayer audioFile={null} onWaveSurferReady={onReady} />);

      expect(onReady).toHaveBeenCalledWith(
        expect.objectContaining({ wavesurfer: mockWaveSurfer, regions: mockRegions })
      );
    });

    it('does not call onWaveSurferReady when wavesurfer is null', () => {
      mockUseWaveSurfer.mockImplementation(() => ({
        ...baseReturn,
        wavesurfer: null,
        regions: mockRegions,
      }));

      const onReady = vi.fn();
      render(<WaveformPlayer audioFile={null} onWaveSurferReady={onReady} />);

      expect(onReady).not.toHaveBeenCalled();
    });

    it('does not call onWaveSurferReady when regions is null', () => {
      mockUseWaveSurfer.mockImplementation(() => ({
        ...baseReturn,
        wavesurfer: mockWaveSurfer,
        regions: null,
      }));

      const onReady = vi.fn();
      render(<WaveformPlayer audioFile={null} onWaveSurferReady={onReady} />);

      expect(onReady).not.toHaveBeenCalled();
    });
  });

  describe('audio loading', () => {
    it('calls loadAudio when audioFile is provided', () => {
      const blob = new Blob(['audio'], { type: 'audio/mp3' });
      render(<WaveformPlayer audioFile={blob} />);
      expect(mockLoadAudio).toHaveBeenCalledWith(blob);
    });

    it('does not call loadAudio when audioFile is null', () => {
      render(<WaveformPlayer audioFile={null} />);
      expect(mockLoadAudio).not.toHaveBeenCalled();
    });
  });
});
