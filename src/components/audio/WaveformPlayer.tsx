import React, { useRef, useEffect } from 'react';
import { useWaveSurfer } from '../../hooks/useWaveSurfer';
import WaveSurfer from 'wavesurfer.js';
import RegionsPlugin from 'wavesurfer.js/dist/plugins/regions.esm.js';
import './WaveformPlayer.css';

export interface WaveformPlayerRef {
  wavesurfer: WaveSurfer;
  regions: RegionsPlugin | null;
  enableRegions: (enable: boolean) => void;
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
  const { wavesurfer, regions, enableRegions, isPlaying, currentTime, duration, loadAudio } =
    useWaveSurfer(containerRef);

  // Load audio when file changes
  useEffect(() => {
    if (audioFile) {
      loadAudio(audioFile);
    }
  }, [audioFile, loadAudio]);

  // Notify parent of wavesurfer instance and controls
  useEffect(() => {
    if (wavesurfer && onWaveSurferReady) {
      onWaveSurferReady({ 
        wavesurfer, 
        regions,
        enableRegions 
      });
    }
  }, [wavesurfer, regions, enableRegions, onWaveSurferReady]);

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
    <div className="waveform-container">
      <div ref={containerRef} className="waveform" />
    </div>
  );
};
