import { useParams } from 'react-router-dom';
import { useState, useRef, useEffect, useCallback } from 'react';
import { ArrowRight } from 'lucide-react';
import { Heading, Text, GlassCard, WaveformPlayer } from '@/lib';
import type { WaveformPlayerRef } from '@/lib';
import { PageLayout } from '../../components/layout/PageLayout';
import { useSessionStorage } from '../../hooks/useSessionStorage';
import { useRouteState } from '../../hooks/useRouteState';
import { EnhancedPlaybackControls } from '../../features/audio-editing/components/EnhancedPlaybackControls';
import { RegionTimeDisplay } from '../../features/audio-editing/components/RegionTimeDisplay';
import { AudioStatusBadges } from '../../features/audio-editing/components/AudioStatusBadges';
import { TimelineRuler } from '../../features/audio-editing/components/TimelineRuler';
import { formatTime } from '../../utils/audio';

export function AudioEditingPage() {
  const { sessionId } = useParams();
  const { session, isLoading, updateSession } = useSessionStorage(sessionId || null);
  const { goToProcessing } = useRouteState();

  // State management
  const [region, setRegion] = useState<{ start: number; end: number } | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [volume, setVolume] = useState(0.75);
  const playerRef = useRef<WaveformPlayerRef | null>(null);

  // Setup region selection when WaveSurfer player is ready
  const handleWaveSurferReady = useCallback((player: WaveformPlayerRef) => {
    playerRef.current = player;
    
    // Enable drag selection
    player.enableRegionSelection();

    // Listen for region changes
    const regionsPlugin = player.regions;

    if (regionsPlugin) {
      const handleRegionCreated = () => {
        const activeRegion = playerRef.current?.getActiveRegion();
        setRegion(activeRegion ?? null);
      };

      const handleRegionUpdated = () => {
        const activeRegion = playerRef.current?.getActiveRegion();
        setRegion(activeRegion ?? null);
      };

      const handleRegionRemoved = () => {
        setRegion(null);
      };

      regionsPlugin.on('region-created', handleRegionCreated);
      regionsPlugin.on('region-updated', handleRegionUpdated);
      regionsPlugin.on('region-removed', handleRegionRemoved);
    }
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in input fields
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }

      const ws = playerRef.current?.wavesurfer;
      if (!ws) return;

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          ws.playPause();
          break;

        case 'ArrowRight': {
          e.preventDefault();
          const seekForward = e.shiftKey ? 10 : 5;
          ws.setTime(Math.min(duration, currentTime + seekForward));
          break;
        }

        case 'ArrowLeft': {
          e.preventDefault();
          const seekBack = e.shiftKey ? 10 : 5;
          ws.setTime(Math.max(0, currentTime - seekBack));
          break;
        }

        case 'ArrowUp': {
          e.preventDefault();
          const newVolumeUp = Math.min(1, volume + 0.1);
          setVolume(newVolumeUp);
          ws.setVolume(newVolumeUp);
          break;
        }

        case 'ArrowDown': {
          e.preventDefault();
          const newVolumeDown = Math.max(0, volume - 0.1);
          setVolume(newVolumeDown);
          ws.setVolume(newVolumeDown);
          break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [currentTime, duration, volume]);

  // Playback handlers
  const handlePlayPause = useCallback(() => {
    playerRef.current?.wavesurfer?.playPause();
  }, []);

  const handleSpeedChange = useCallback((speed: number) => {
    setPlaybackSpeed(speed);
    playerRef.current?.wavesurfer?.setPlaybackRate(speed);
  }, []);

  const handleSkipBack = useCallback(() => {
    const newTime = Math.max(0, currentTime - 10);
    playerRef.current?.wavesurfer?.setTime(newTime);
  }, [currentTime]);

  const handleSkipForward = useCallback(() => {
    const newTime = Math.min(duration, currentTime + 10);
    playerRef.current?.wavesurfer?.setTime(newTime);
  }, [currentTime, duration]);

  const handleVolumeChange = useCallback((newVolume: number) => {
    setVolume(newVolume);
    playerRef.current?.wavesurfer?.setVolume(newVolume);
  }, []);

  // Processing handlers
  const handleProcessSelection = useCallback(async (selectedRegion: { start: number; end: number }) => {
    if (!updateSession) return;

    try {
      await updateSession({
        selectionMode: 'selection',
        regionStart: selectedRegion.start,
        regionEnd: selectedRegion.end,
      });
      goToProcessing();
    } catch (error) {
      console.error('Failed to update session:', error);
      alert('Failed to save selection. Please try again.');
    }
  }, [updateSession, goToProcessing]);

  const handleProcessFullAudio = useCallback(async () => {
    if (!updateSession) return;

    try {
      await updateSession({
        selectionMode: 'full',
      });
      goToProcessing();
    } catch (error) {
      console.error('Failed to update session:', error);
      alert('Failed to save settings. Please try again.');
    }
  }, [updateSession, goToProcessing]);

  // Loading state
  if (isLoading) {
    return (
      <PageLayout className="flex items-center justify-center">
        <Text variant="body" color="secondary">Loading session...</Text>
      </PageLayout>
    );
  }

  // Error state
  if (!session || !session.audioFile) {
    return (
      <PageLayout className="flex items-center justify-center">
        <div className="text-center">
          <Heading level="h2" className="mb-2">Session Not Found</Heading>
          <Text variant="body" color="secondary">
            The requested audio session could not be found.
          </Text>
        </div>
      </PageLayout>
    );
  }

  // Determine which button is primary based on region state
  const hasRegion = region !== null;
  const regionDuration = hasRegion ? formatTime(region.end - region.start) : null;

  return (
    <PageLayout>
        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-6">
          <div className="flex flex-col gap-2">
            <Heading level="h1">{session.audioFile.name}</Heading>
            <Text variant="body" color="secondary">
              Select a segment to summarize or transcribe the full recording.
            </Text>
          </div>
          <AudioStatusBadges
            totalDuration={duration}
          />
        </div>

        {/* Waveform Card */}
        <GlassCard variant="light" className="flex flex-col mb-6 border rounded-xl shadow-lg overflow-hidden" style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}>
          {/* Toolbar */}
          <div className="flex flex-wrap items-center justify-end gap-4 p-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
            {/* Region Time Display */}
            <RegionTimeDisplay
              startTime={region?.start ?? null}
              endTime={region?.end ?? null}
            />
          </div>

          {/* Waveform Visualization */}
          <div className="p-6">
            <WaveformPlayer
              audioFile={session.audioFile.blob}
              onWaveSurferReady={handleWaveSurferReady}
              onPlaybackChange={setIsPlaying}
              onTimeUpdate={(time, dur) => {
                setCurrentTime(time);
                setDuration(dur);
              }}
            />
          </div>

          {/* Timeline Ruler */}
          <TimelineRuler duration={duration} />

          {/* Playback Controls */}
          <EnhancedPlaybackControls
            isPlaying={isPlaying}
            playbackSpeed={playbackSpeed}
            volume={volume}
            onPlayPause={handlePlayPause}
            onSpeedChange={handleSpeedChange}
            onSkipBack={handleSkipBack}
            onSkipForward={handleSkipForward}
            onVolumeChange={handleVolumeChange}
          />
        </GlassCard>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 border-t pt-4" style={{ borderColor: 'var(--color-border)' }}>
          {hasRegion ? (
            <>
              {/* Primary: Process Selection */}
              <button
                onClick={() => region && handleProcessSelection(region)}
                className="flex-1 flex flex-col items-center justify-center py-4 px-6 rounded-xl bg-blue-500 hover:bg-blue-600 text-white shadow-lg transition-all transform active:scale-[0.99] group"
              >
                <span className="text-lg font-bold flex items-center gap-2">
                  Process Selection
                  <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
                </span>
                <span className="text-blue-100 text-sm font-medium opacity-90 mt-1">
                  Summarize {regionDuration} segment
                </span>
              </button>

              {/* Secondary: Process Full Audio */}
              <button
                onClick={handleProcessFullAudio}
                className="flex-1 flex flex-col items-center justify-center py-4 px-6 rounded-xl border-2 transition-all transform active:scale-[0.99]"
                style={{ 
                  backgroundColor: 'var(--color-bg-secondary)', 
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text-primary)'
                }}
              >
                <span className="text-lg font-bold flex items-center gap-2">
                  Process Full Audio
                </span>
                <span className="text-sm font-medium mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                  Transcribe all {formatTime(duration)}
                </span>
              </button>
            </>
          ) : (
            <>
              {/* Primary: Process Full Audio (when no region) */}
              <button
                onClick={handleProcessFullAudio}
                className="flex-1 flex flex-col items-center justify-center py-4 px-6 rounded-xl bg-blue-500 hover:bg-blue-600 text-white shadow-lg transition-all transform active:scale-[0.99] group"
              >
                <span className="text-lg font-bold flex items-center gap-2">
                  Process Full Audio
                  <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
                </span>
                <span className="text-blue-100 text-sm font-medium opacity-90 mt-1">
                  Transcribe all {formatTime(duration)}
                </span>
              </button>
            </>
          )}
        </div>

        {/* Keyboard Shortcuts Hint */}
        <div className="text-center mt-4">
          <Text variant="small" color="tertiary" className="opacity-60">
            <span className="font-mono px-1.5 py-0.5 rounded text-[10px] border" style={{ backgroundColor: 'var(--color-bg-tertiary)', borderColor: 'var(--color-border)' }}>SPACE</span>
            {' '}to play/pause · {' '}
            <span className="font-mono px-1.5 py-0.5 rounded text-[10px] border" style={{ backgroundColor: 'var(--color-bg-tertiary)', borderColor: 'var(--color-border)' }}>←</span>
            {' '}
            <span className="font-mono px-1.5 py-0.5 rounded text-[10px] border" style={{ backgroundColor: 'var(--color-bg-tertiary)', borderColor: 'var(--color-border)' }}>→</span>
            {' '}to seek
          </Text>
        </div>
    </PageLayout>
  );
}
