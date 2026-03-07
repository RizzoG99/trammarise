import { useParams } from 'react-router-dom';
import { useState, useRef, useEffect, useCallback, lazy, Suspense } from 'react';
import { ArrowRight } from 'lucide-react';
import { Heading, Text, GlassCard, WaveformPlayer, Button } from '@/lib';
import type { WaveformPlayerRef } from '@/lib';

const SEO = lazy(() =>
  import('@/lib/components/common/SEO').then((module) => ({ default: module.SEO }))
);
import { PageLayout } from '../../components/layout/PageLayout';
import { useSessionStorage } from '../../hooks/useSessionStorage';
import { useRouteState } from '../../hooks/useRouteState';
import { EnhancedPlaybackControls } from '../../features/audio-editing/components/EnhancedPlaybackControls';
import { AudioStatusBadges } from '../../features/audio-editing/components/AudioStatusBadges';
import { TimelineRuler } from '../../features/audio-editing/components/TimelineRuler';
import { TrimTimeInputs } from '../../features/audio-editing/components/TrimTimeInputs';
import { formatTime } from '../../utils/audio';
import { useTranslation } from 'react-i18next';

export function AudioEditingPage() {
  const { t } = useTranslation();
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

  // Setup region events + drag selection when WaveSurfer player is ready
  const handleWaveSurferReady = useCallback((player: WaveformPlayerRef) => {
    playerRef.current = player;

    const regionsPlugin = player.regions;
    if (!regionsPlugin) return;

    // Enable built-in drag-to-select (works because dragToSeek:false prevents pointer conflicts)
    regionsPlugin.enableDragSelection({ color: 'rgba(59, 130, 246, 0.15)' });

    // When a new region is created by drag, keep only the latest one
    regionsPlugin.on('region-created', (newRegion) => {
      regionsPlugin
        .getRegions()
        .filter((r) => r !== newRegion)
        .forEach((r) => r.remove());
      newRegion.setOptions({ drag: true, resize: true });
      setRegion({ start: newRegion.start, end: newRegion.end });
    });

    // Sync region state when WaveSurfer regions change (drag/resize of existing region)
    regionsPlugin.on('region-updated', () => {
      const r = regionsPlugin.getRegions()[0] ?? null;
      setRegion(r ? { start: r.start, end: r.end } : null);
    });

    regionsPlugin.on('region-removed', () => {
      if (regionsPlugin.getRegions().length === 0) setRegion(null);
    });
  }, []);

  const handleRegionChange = useCallback((start: number, end: number) => {
    setRegion({ start, end });
    // Reflect in WaveSurfer region visually
    const regionsPlugin = playerRef.current?.regions;
    if (regionsPlugin) {
      const existing = regionsPlugin.getRegions();
      if (existing.length > 0) {
        existing[0].setOptions({ start, end });
      } else {
        regionsPlugin.addRegion({
          start,
          end,
          color: 'rgba(59, 130, 246, 0.15)',
          drag: true,
          resize: true,
        });
      }
    }
  }, []);

  const handleRegionClear = useCallback(() => {
    playerRef.current?.clearRegions();
    setRegion(null);
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

        case 'KeyI': {
          // Set region in-point to current playhead
          e.preventDefault();
          const inPoint = ws.getCurrentTime();
          const existingEnd = region?.end ?? duration;
          if (inPoint < existingEnd) {
            handleRegionChange(inPoint, existingEnd);
          }
          break;
        }

        case 'KeyO': {
          // Set region out-point to current playhead
          e.preventDefault();
          const outPoint = ws.getCurrentTime();
          const existingStart = region?.start ?? 0;
          if (outPoint > existingStart) {
            handleRegionChange(existingStart, outPoint);
          }
          break;
        }

        case 'Escape': {
          // Clear region
          playerRef.current?.clearRegions();
          setRegion(null);
          break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [currentTime, duration, volume, region, handleRegionChange]);

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
  const handleProcessSelection = useCallback(
    async (selectedRegion: { start: number; end: number }) => {
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
    },
    [updateSession, goToProcessing]
  );

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
        <Text variant="body" color="secondary">
          {t('layout.loading')}
        </Text>
      </PageLayout>
    );
  }

  // Error state
  if (!session || !session.audioFile) {
    return (
      <PageLayout className="flex items-center justify-center">
        <div className="text-center">
          <Heading level="h2" className="mb-2">
            {t('layout.sessionNotFound.title')}
          </Heading>
          <Text variant="body" color="secondary">
            {t('layout.sessionNotFound.message')}
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
      <Suspense fallback={null}>
        <SEO
          title="Edit Audio"
          description="Edit and trim your audio recording before transcription. Select specific segments or process the entire recording."
          canonical="https://trammarise.app/audio-editing"
        />
      </Suspense>
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-6">
        <div className="flex flex-col gap-2">
          <Heading level="h1">{session.audioFile.name}</Heading>
          <Text variant="body" color="secondary">
            {t('audioEditing.instructions')}
          </Text>
        </div>
        <AudioStatusBadges totalDuration={duration} />
      </div>

      {/* Waveform Card */}
      <GlassCard
        variant="dark"
        className="flex flex-col mb-6 border rounded-xl shadow-glass overflow-hidden"
      >
        {/* Waveform hint — shown only when no region is set */}
        {!hasRegion && (
          <div className="px-4 pt-3 pb-1">
            <Text variant="small" color="tertiary">
              {t('audioEditing.regionHint')}
            </Text>
          </div>
        )}

        {/* Waveform Visualization */}
        <div className="p-6" style={{ cursor: 'crosshair' }}>
          <WaveformPlayer
            audioFile={session.audioFile.blob}
            onWaveSurferReady={handleWaveSurferReady}
            onPlaybackChange={setIsPlaying}
            onTimeUpdate={(time, dur) => {
              setCurrentTime(time);
              setDuration(dur);
            }}
            dragToSeek={false}
          />
        </div>

        {/* Timeline Ruler */}
        <TimelineRuler duration={duration} />

        {/* Trim Time Inputs — bidirectional sync with waveform region */}
        <TrimTimeInputs
          start={region?.start ?? null}
          end={region?.end ?? null}
          duration={duration}
          onChange={handleRegionChange}
          onClear={handleRegionClear}
        />

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
      <div
        className="flex flex-col sm:flex-row gap-4 border-t pt-4"
        style={{ borderColor: 'var(--color-border)' }}
      >
        {hasRegion ? (
          <>
            <Button
              variant="primary"
              onClick={() => region && handleProcessSelection(region)}
              className="flex-1 flex flex-col items-center justify-center py-4 group"
            >
              <span className="flex items-center gap-2">
                {t('audioEditing.actions.processSelection')}
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </span>
              <span className="text-xs font-normal mt-1 opacity-80">
                {t('audioEditing.actions.processSelectionHint', { duration: regionDuration })}
              </span>
            </Button>

            <Button
              variant="ghost"
              onClick={handleProcessFullAudio}
              className="flex-1 flex flex-col items-center justify-center py-4"
            >
              <span>{t('audioEditing.actions.processFullAudio')}</span>
              <span className="text-xs font-normal mt-1 opacity-60">
                {t('audioEditing.actions.processFullAudioHint', { duration: formatTime(duration) })}
              </span>
            </Button>
          </>
        ) : (
          <Button
            variant="primary"
            onClick={handleProcessFullAudio}
            className="flex-1 flex flex-col items-center justify-center py-4 group"
          >
            <span className="flex items-center gap-2">
              {t('audioEditing.actions.processFullAudio')}
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </span>
            <span className="text-xs font-normal mt-1 opacity-80">
              {t('audioEditing.actions.processFullAudioHint', { duration: formatTime(duration) })}
            </span>
          </Button>
        )}
      </div>

      {/* Keyboard Shortcuts Hint */}
      <div className="text-center mt-4 flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
        {[
          {
            key: t('audioEditing.keyboardHint.space'),
            label: t('audioEditing.keyboardHint.playPause'),
          },
          { key: '← →', label: t('audioEditing.keyboardHint.arrows') },
          {
            key: `${t('audioEditing.keyboardHint.iKey')} / ${t('audioEditing.keyboardHint.oKey')}`,
            label: t('audioEditing.keyboardHint.setInOut'),
          },
        ].map(({ key, label }) => (
          <Text
            key={key}
            variant="small"
            color="tertiary"
            className="opacity-60 flex items-center gap-1"
          >
            <kbd
              className="font-mono px-1.5 py-0.5 rounded text-[10px] border"
              style={{
                backgroundColor: 'var(--color-bg-tertiary)',
                borderColor: 'var(--color-border)',
              }}
            >
              {key}
            </kbd>
            {label}
          </Text>
        ))}
      </div>
    </PageLayout>
  );
}
