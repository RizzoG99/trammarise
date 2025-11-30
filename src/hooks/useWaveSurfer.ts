import { useEffect, useRef, useState, useCallback } from 'react';
import WaveSurfer from 'wavesurfer.js';
import type { WaveSurferConfig } from '../types/audio';

interface UseWaveSurferReturn {
  wavesurfer: WaveSurfer | null;
  isReady: boolean;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  loadAudio: (file: File | Blob) => void;
  play: () => void;
  pause: () => void;
  playPause: () => void;
  destroy: () => void;
}

export const useWaveSurfer = (
  containerRef: React.RefObject<HTMLDivElement | null>,
  config?: WaveSurferConfig
): UseWaveSurferReturn => {
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Initialize WaveSurfer
  useEffect(() => {
    if (!containerRef.current || wavesurferRef.current) return;

    const defaultConfig: WaveSurferConfig = {
      waveColor: 'rgba(99, 102, 241, 0.3)',
      progressColor: 'rgba(99, 102, 241, 0.8)',
      cursorColor: '#8b5cf6',
      barWidth: 3,
      barRadius: 3,
      cursorWidth: 2,
      height: 128,
      barGap: 2,
      responsive: true,
      normalize: true,
      ...config,
    };

    const ws = WaveSurfer.create({
      container: containerRef.current,
      ...defaultConfig,
    });

    // Event listeners
    ws.on('ready', () => {
      setIsReady(true);
      setDuration(ws.getDuration());
    });

    ws.on('play', () => setIsPlaying(true));
    ws.on('pause', () => setIsPlaying(false));
    ws.on('finish', () => setIsPlaying(false));

    ws.on('audioprocess', () => {
      setCurrentTime(ws.getCurrentTime());
    });

    ws.on('seeking', () => {
      setCurrentTime(ws.getCurrentTime());
    });

    wavesurferRef.current = ws;

    return () => {
      ws.destroy();
      wavesurferRef.current = null;
    };
  }, [containerRef, config]);

  // Load audio file
  const loadAudio = useCallback((file: File | Blob) => {
    if (!wavesurferRef.current) return;

    setIsReady(false);
    wavesurferRef.current.loadBlob(file);
  }, []);

  // Playback controls
  const play = useCallback(() => {
    wavesurferRef.current?.play();
  }, []);

  const pause = useCallback(() => {
    wavesurferRef.current?.pause();
  }, []);

  const playPause = useCallback(() => {
    wavesurferRef.current?.playPause();
  }, []);

  const destroy = useCallback(() => {
    wavesurferRef.current?.destroy();
    wavesurferRef.current = null;
    setIsReady(false);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
  }, []);

  return {
    wavesurfer: wavesurferRef.current,
    isReady,
    isPlaying,
    currentTime,
    duration,
    loadAudio,
    play,
    pause,
    playPause,
    destroy,
  };
};
