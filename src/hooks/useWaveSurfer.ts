import { useEffect, useRef, useState, useCallback } from 'react';
import WaveSurfer from 'wavesurfer.js';
import RegionsPlugin from 'wavesurfer.js/dist/plugins/regions.esm.js';
import type { WaveSurferConfig } from '../types/audio';

interface UseWaveSurferReturn {
  wavesurfer: WaveSurfer | null;
  regions: RegionsPlugin | null;
  isReady: boolean;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  loadAudio: (file: File | Blob) => void;
  play: () => void;
  pause: () => void;
  playPause: () => void;
  enableRegions: (enable: boolean) => void;
  destroy: () => void;
}

export const useWaveSurfer = (
  containerRef: React.RefObject<HTMLDivElement | null>,
  config?: WaveSurferConfig
): UseWaveSurferReturn => {
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const regionsRef = useRef<RegionsPlugin | null>(null);
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

    // Initialize Regions Plugin
    const regions = RegionsPlugin.create();
    regionsRef.current = regions;

    // Create audio context for Safari compatibility
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

    const ws = WaveSurfer.create({
      container: containerRef.current,
      plugins: [regions],
      audioContext,
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

    // Resume audio context for Safari (required after user interaction)
    if (audioContext.state === 'suspended') {
      const resumeAudio = () => {
        audioContext.resume().catch(() => {
          // Silent catch - audio context may already be resumed
        });
        document.removeEventListener('click', resumeAudio);
      };
      document.addEventListener('click', resumeAudio);
    }

    wavesurferRef.current = ws;

    return () => {
      ws.destroy();
      wavesurferRef.current = null;
      regionsRef.current = null;
    };
  }, [containerRef, config]);

  // Load audio file
  const loadAudio = useCallback((file: File | Blob) => {
    if (!wavesurferRef.current) return;

    setIsReady(false);

    // Add error handler for debugging
    wavesurferRef.current.on('error', (error) => {
      console.error('WaveSurfer error:', error);
    });

    wavesurferRef.current.loadBlob(file).catch((error) => {
      console.error('Failed to load audio blob:', error, 'File type:', file.type);
    });
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

  const enableRegions = useCallback((enable: boolean) => {
    if (!regionsRef.current || !wavesurferRef.current) return;
    
    regionsRef.current.clearRegions();
    
    if (enable) {
      const duration = wavesurferRef.current.getDuration();
      // Add a default region covering 80% of the track
      regionsRef.current.addRegion({
        start: duration * 0.1,
        end: duration * 0.9,
        color: 'rgba(139, 92, 246, 0.3)',
        drag: true,
        resize: true,
      });
    }
  }, []);

  const destroy = useCallback(() => {
    wavesurferRef.current?.destroy();
    wavesurferRef.current = null;
    regionsRef.current = null;
    setIsReady(false);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
  }, []);

  return {
    wavesurfer: wavesurferRef.current,
    regions: regionsRef.current,
    isReady,
    isPlaying,
    currentTime,
    duration,
    loadAudio,
    play,
    pause,
    playPause,
    enableRegions,
    destroy,
  };
};
