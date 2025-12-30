import { useEffect, useRef, useState, useCallback } from 'react';
import WaveSurfer from 'wavesurfer.js';
import RegionsPlugin from 'wavesurfer.js/dist/plugins/regions';
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
  enableRegionSelection: () => void;
  disableRegionSelection: () => void;
  getActiveRegion: () => { start: number; end: number } | null;
  clearRegions: () => void;
}

export const useWaveSurfer = (
  containerRef: React.RefObject<HTMLDivElement | null>,
  config?: WaveSurferConfig
): UseWaveSurferReturn => {
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const regionsPluginRef = useRef<RegionsPlugin | null>(null);
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

    // Note: WaveSurfer creates its own audio context internally

    const ws = WaveSurfer.create({
      container: containerRef.current,
      ...defaultConfig,
    });

    // Initialize regions plugin
    const regions = ws.registerPlugin(RegionsPlugin.create());
    regionsPluginRef.current = regions;

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
      try {
        // Safely destroy WaveSurfer instance
        // WaveSurfer.destroy() is safe to call multiple times in v7.x
        if (ws) {
          ws.destroy();
        }
      } catch (error) {
        console.error('Error destroying WaveSurfer:', error);
      } finally {
        wavesurferRef.current = null;
        regionsPluginRef.current = null;
      }
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
    if (!regionsPluginRef.current || !wavesurferRef.current) return;

    regionsPluginRef.current.clearRegions();

    if (enable) {
      const duration = wavesurferRef.current.getDuration();
      // Add a default region covering 80% of the track
      regionsPluginRef.current.addRegion({
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
    regionsPluginRef.current = null;
    setIsReady(false);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
  }, []);

  // Region selection controls
  const enableRegionSelection = useCallback(() => {
    if (!regionsPluginRef.current) return;

    // Clear any existing regions first
    regionsPluginRef.current.clearRegions();

    // Enable drag selection on the waveform
    regionsPluginRef.current.enableDragSelection({
      color: 'rgba(139, 92, 246, 0.3)',
    });

    // Listen for region-created event to ensure only one region exists
    regionsPluginRef.current.on('region-created', () => {
      const regions = regionsPluginRef.current?.getRegions() || [];
      // If more than one region exists, keep only the most recent one
      if (regions.length > 1) {
        // Remove all but the last region
        for (let i = 0; i < regions.length - 1; i++) {
          regions[i].remove();
        }
      }
    });
  }, []);

  const disableRegionSelection = useCallback(() => {
    if (!regionsPluginRef.current) return;

    // Disable drag selection
    regionsPluginRef.current.enableDragSelection({
      color: 'rgba(139, 92, 246, 0.3)',
    });
    // Note: WaveSurfer doesn't have a direct disable method,
    // so we clear regions instead when exiting trim mode
  }, []);

  const getActiveRegion = useCallback(() => {
    if (!regionsPluginRef.current) return null;

    const regions = regionsPluginRef.current.getRegions();
    if (regions.length === 0) return null;

    // Get the first/most recent region
    const region = regions[0];
    return {
      start: region.start,
      end: region.end,
    };
  }, []);

  const clearRegions = useCallback(() => {
    if (!regionsPluginRef.current) return;

    regionsPluginRef.current.clearRegions();
  }, []);

  return {
    wavesurfer: wavesurferRef.current,
    regions: regionsPluginRef.current,
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
    enableRegionSelection,
    disableRegionSelection,
    getActiveRegion,
    clearRegions,
  };
};
