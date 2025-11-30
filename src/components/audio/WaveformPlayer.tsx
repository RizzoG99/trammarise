import React, { useRef, useEffect } from 'react';
import { useWaveSurfer } from '../../hooks/useWaveSurfer';
import './WaveformPlayer.css';

interface WaveformPlayerProps {
  audioFile: File | Blob | null;
  onWaveSurferReady?: (ws: any) => void;
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
  const { wavesurfer, isPlaying, currentTime, duration, loadAudio } =
    useWaveSurfer(containerRef);

  // Load audio when file changes
  useEffect(() => {
    if (audioFile) {
      loadAudio(audioFile);
    }
  }, [audioFile, loadAudio]);

  // Notify parent of wavesurfer instance
  useEffect(() => {
    if (wavesurfer && onWaveSurferReady) {
      onWaveSurferReady(wavesurfer);
    }
  }, [wavesurfer, onWaveSurferReady]);

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
