import { useRef, useState, useEffect, useCallback } from 'react';
import type { AudioFile } from '../../../types/audio';

/**
 * Audio playback state
 */
export interface AudioPlaybackState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  playbackRate: number;
  isLoading: boolean;
}

/**
 * Custom hook for audio playback management.
 *
 * Provides complete control over audio playback including:
 * - Play/pause functionality
 * - Seeking to specific timestamps
 * - Skip forward/backward
 * - Playback speed control
 * - Real-time progress tracking
 *
 * @param audioFile - Audio file from session storage
 * @returns Audio control functions and current state
 */
export function useAudioPlayer(audioFile: AudioFile) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [state, setState] = useState<AudioPlaybackState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    playbackRate: 1.0,
    isLoading: true,
  });

  // Initialize audio element and setup blob URL
  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;

    // Create blob URL from audio file
    const blobUrl = URL.createObjectURL(audioFile.blob);
    audio.src = blobUrl;

    // Event listeners
    const handleLoadedMetadata = () => {
      setState((prev) => ({
        ...prev,
        duration: audio.duration,
        isLoading: false,
      }));
    };

    const handleTimeUpdate = () => {
      setState((prev) => ({
        ...prev,
        currentTime: audio.currentTime,
      }));
    };

    const handleEnded = () => {
      setState((prev) => ({
        ...prev,
        isPlaying: false,
        currentTime: 0,
      }));
      audio.currentTime = 0;
    };

    const handlePlay = () => {
      setState((prev) => ({ ...prev, isPlaying: true }));
    };

    const handlePause = () => {
      setState((prev) => ({ ...prev, isPlaying: false }));
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    // Cleanup
    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.pause();
      URL.revokeObjectURL(blobUrl);
      audioRef.current = null;
    };
  }, [audioFile]);

  // Play audio
  const play = useCallback(async () => {
    if (audioRef.current) {
      try {
        await audioRef.current.play();
      } catch (error) {
        console.error('Play error:', error);
      }
    }
  }, []);

  // Pause audio
  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
  }, []);

  // Toggle play/pause
  const togglePlayPause = useCallback(() => {
    if (state.isPlaying) {
      pause();
    } else {
      play();
    }
  }, [state.isPlaying, play, pause]);

  // Seek to specific time
  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(0, Math.min(time, state.duration));
    }
  }, [state.duration]);

  // Skip by offset (positive for forward, negative for backward)
  const skipBy = useCallback((seconds: number) => {
    if (audioRef.current) {
      const newTime = audioRef.current.currentTime + seconds;
      seek(newTime);
    }
  }, [seek]);

  // Set playback speed
  const setSpeed = useCallback((rate: number) => {
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
      setState((prev) => ({ ...prev, playbackRate: rate }));
    }
  }, []);

  // Cycle through speeds: 1x → 1.5x → 2x → 1x
  const cycleSpeed = useCallback(() => {
    const speeds = [1.0, 1.5, 2.0];
    const currentIndex = speeds.indexOf(state.playbackRate);
    const nextIndex = (currentIndex + 1) % speeds.length;
    setSpeed(speeds[nextIndex]);
  }, [state.playbackRate, setSpeed]);

  return {
    audioRef,
    state,
    play,
    pause,
    togglePlayPause,
    seek,
    skipBy,
    setSpeed,
    cycleSpeed,
  };
}
