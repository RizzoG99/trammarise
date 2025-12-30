import React, { useRef, useEffect } from 'react';
import { useWaveSurfer } from '../../hooks/useWaveSurfer';
import WaveSurfer from 'wavesurfer.js';
import RegionsPlugin from 'wavesurfer.js/dist/plugins/regions.esm.js';

export interface WaveformPlayerRef {
  wavesurfer: WaveSurfer;
  regions: RegionsPlugin | null;
  enableRegions: (enable: boolean) => void;
  enableRegionSelection: () => void;
  disableRegionSelection: () => void;
  getActiveRegion: () => { start: number; end: number } | null;
  clearRegions: () => void;
}

interface WaveformPlayerProps {
  audioFile: File | Blob | null;
  onWaveSurferReady?: (player: WaveformPlayerRef) => void;
  onPlaybackChange?: (isPlaying: boolean) => void;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
}

export const WaveformPlayer: React.FC<WaveformPlayerProps> = ({
  audioFile,
  onWaveSurferReady,
  onPlaybackChange,
  onTimeUpdate,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const waveSurferInstance = useWaveSurfer(containerRef);
  const {
    wavesurfer,
    isPlaying,
    currentTime,
    duration,
    loadAudio,
    enableRegionSelection,
    disableRegionSelection,
    getActiveRegion,
    clearRegions,
  } = waveSurferInstance;

  // Load audio when file changes
  useEffect(() => {
    if (audioFile) {
      loadAudio(audioFile);
    }
  }, [audioFile, loadAudio]);

  // Notify parent of wavesurfer instance with region methods
  useEffect(() => {
    if (wavesurfer && waveSurferInstance.regions && onWaveSurferReady) {
      const playerRef: WaveformPlayerRef = {
        wavesurfer,
        regions: waveSurferInstance.regions,
        enableRegions: waveSurferInstance.enableRegions,
        enableRegionSelection,
        disableRegionSelection,
        getActiveRegion,
        clearRegions,
      };
      onWaveSurferReady(playerRef);
    }
  }, [wavesurfer, waveSurferInstance.regions, waveSurferInstance.enableRegions, onWaveSurferReady, enableRegionSelection, disableRegionSelection, getActiveRegion, clearRegions]);

  // Notify parent of playback changes
  useEffect(() => {
    if (onPlaybackChange) {
      onPlaybackChange(isPlaying);
    }
  }, [isPlaying, onPlaybackChange]);

  // Notify parent of time updates
  useEffect(() => {
    if (onTimeUpdate) {
      onTimeUpdate(currentTime, duration);
    }
  }, [currentTime, duration, onTimeUpdate]);

  return (
    <div className="bg-bg-glass backdrop-blur-md border border-primary/20 rounded-xl p-6 mb-6 shadow-lg lg:p-8">
      <div ref={containerRef} className="min-h-[128px] md:min-h-[160px]" />
    </div>
  );
};
