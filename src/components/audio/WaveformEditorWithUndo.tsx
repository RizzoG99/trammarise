import { useEffect, useRef, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';
import RegionsPlugin from 'wavesurfer.js/dist/plugins/regions';
import { Button } from '@/lib';
import { useCommandHistory } from '../../hooks/useCommandHistory';
import {
  AddTrimRegionCommand,
  RemoveTrimRegionCommand,
  ChangePlaybackSpeedCommand,
  ChangeVolumeCommand,
} from '../../commands/AudioCommands';

/**
 * Example component demonstrating Command Pattern usage
 * Waveform editor with undo/redo functionality
 */
interface WaveformEditorWithUndoProps {
  audioFile: Blob;
  onTrimRegionChange?: (start: number, end: number) => void;
}

export function WaveformEditorWithUndo({ audioFile, onTrimRegionChange }: WaveformEditorWithUndoProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const regionsPluginRef = useRef<RegionsPlugin | null>(null);

  const [isReady, setIsReady] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [volume, setVolume] = useState(1);

  // Use command history for undo/redo
  const {
    execute,
    undo,
    redo,
    canUndo,
    canRedo,
    undoDescription,
    redoDescription,
  } = useCommandHistory(50);

  // Initialize WaveSurfer
  useEffect(() => {
    if (!containerRef.current) return;

    // Create regions plugin
    const regions = RegionsPlugin.create();
    regionsPluginRef.current = regions;

    // Create WaveSurfer instance
    const wavesurfer = WaveSurfer.create({
      container: containerRef.current,
      waveColor: '#a78bfa',
      progressColor: '#7c3aed',
      cursorColor: '#7c3aed',
      barWidth: 2,
      barRadius: 3,
      cursorWidth: 2,
      height: 100,
      barGap: 2,
      plugins: [regions],
    });

    wavesurferRef.current = wavesurfer;

    // Load audio
    wavesurfer.loadBlob(audioFile);

    wavesurfer.on('ready', () => {
      setIsReady(true);
    });

    // Listen for region updates
    regions.on('region-updated', (region) => {
      if (onTrimRegionChange) {
        onTrimRegionChange(region.start, region.end);
      }
    });

    return () => {
      wavesurfer.destroy();
    };
  }, [audioFile, onTrimRegionChange]);

  // Handle adding trim region with undo/redo
  const handleAddTrimRegion = async () => {
    if (!wavesurferRef.current || !regionsPluginRef.current) return;

    const duration = wavesurferRef.current.getDuration();
    const start = duration * 0.2;
    const end = duration * 0.8;

    const command = new AddTrimRegionCommand(
      wavesurferRef.current,
      regionsPluginRef.current,
      start,
      end
    );

    await execute(command);
  };

  // Handle removing trim region with undo/redo
  const handleRemoveTrimRegion = async () => {
    if (!regionsPluginRef.current) return;

    const regions = regionsPluginRef.current.getRegions();
    if (regions.length === 0) return;

    const region = regions[0];
    const command = new RemoveTrimRegionCommand(
      wavesurferRef.current!,
      regionsPluginRef.current,
      region
    );

    await execute(command);
  };

  // Handle playback speed change with undo/redo
  const handleSpeedChange = async (newSpeed: number) => {
    if (!wavesurferRef.current) return;

    const command = new ChangePlaybackSpeedCommand(
      wavesurferRef.current,
      newSpeed
    );

    await execute(command);
    setPlaybackSpeed(newSpeed);
  };

  // Handle volume change with undo/redo
  const handleVolumeChange = async (newVolume: number) => {
    if (!wavesurferRef.current) return;

    const command = new ChangeVolumeCommand(
      wavesurferRef.current,
      newVolume
    );

    await execute(command);
    setVolume(newVolume);
  };

  return (
    <div className="space-y-4">
      {/* Waveform container */}
      <div ref={containerRef} className="w-full bg-bg-secondary rounded-lg p-4" />

      {/* Controls */}
      <div className="flex flex-wrap gap-2">
        <Button
          onClick={() => wavesurferRef.current?.playPause()}
          disabled={!isReady}
          variant="primary"
        >
          Play/Pause
        </Button>

        <Button
          onClick={handleAddTrimRegion}
          disabled={!isReady}
          variant="secondary"
        >
          Add Trim Region
        </Button>

        <Button
          onClick={handleRemoveTrimRegion}
          disabled={!isReady}
          variant="secondary"
        >
          Remove Trim Region
        </Button>
      </div>

      {/* Playback speed controls */}
      <div className="space-y-2">
        <label className="text-sm text-text-secondary">
          Playback Speed: {playbackSpeed}x
        </label>
        <div className="flex gap-2">
          {[0.5, 0.75, 1, 1.25, 1.5, 2].map((speed) => (
            <Button
              key={speed}
              onClick={() => handleSpeedChange(speed)}
              variant={playbackSpeed === speed ? 'primary' : 'outline'}
              disabled={!isReady}
            >
              {speed}x
            </Button>
          ))}
        </div>
      </div>

      {/* Volume controls */}
      <div className="space-y-2">
        <label className="text-sm text-text-secondary">
          Volume: {Math.round(volume * 100)}%
        </label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={volume}
          onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
          disabled={!isReady}
          className="w-full"
        />
      </div>

      {/* Undo/Redo controls */}
      <div className="flex gap-2 pt-4 border-t border-bg-tertiary">
        <Button
          onClick={undo}
          disabled={!canUndo}
          variant="outline"
          title={undoDescription || undefined}
        >
          ⟲ Undo {undoDescription && `(${undoDescription})`}
        </Button>

        <Button
          onClick={redo}
          disabled={!canRedo}
          variant="outline"
          title={redoDescription || undefined}
        >
          ⟳ Redo {redoDescription && `(${redoDescription})`}
        </Button>
      </div>
    </div>
  );
}
