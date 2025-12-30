import type { Command } from '../patterns/Command';
import type WaveSurfer from 'wavesurfer.js';
import type { Region } from 'wavesurfer.js/dist/plugins/regions';

// Type for regions plugin
type RegionsPlugin = {
  clearRegions: () => void;
  addRegion: (options: RegionState) => Region;
};

/**
 * Region state for undo/redo
 */
interface RegionState {
  id: string;
  start: number;
  end: number;
  color?: string;
  drag?: boolean;
  resize?: boolean;
}

/**
 * Command to add a trim region to the waveform
 */
export class AddTrimRegionCommand implements Command {
  private region: Region | null = null;
  private regionState: RegionState;
  private regionsPlugin: RegionsPlugin;

  constructor(
    _wavesurfer: WaveSurfer,
    regionsPlugin: RegionsPlugin,
    start: number,
    end: number
  ) {
    this.regionsPlugin = regionsPlugin;
    this.regionState = {
      id: `trim-region-${Date.now()}`,
      start,
      end,
      color: 'rgba(147, 51, 234, 0.2)',
      drag: true,
      resize: true,
    };
  }

  async execute(): Promise<void> {
    // Remove any existing regions first
    this.regionsPlugin.clearRegions();

    // Add new region
    this.region = this.regionsPlugin.addRegion({
      id: this.regionState.id,
      start: this.regionState.start,
      end: this.regionState.end,
      color: this.regionState.color,
      drag: this.regionState.drag,
      resize: this.regionState.resize,
    });
  }

  async undo(): Promise<void> {
    if (this.region) {
      this.region.remove();
      this.region = null;
    }
  }

  getDescription(): string {
    return `Add trim region (${this.regionState.start.toFixed(2)}s - ${this.regionState.end.toFixed(2)}s)`;
  }
}

/**
 * Command to remove a trim region
 */
export class RemoveTrimRegionCommand implements Command {
  private regionState: RegionState | null = null;
  private regionsPlugin: RegionsPlugin;
  private region: Region;

  constructor(
    _wavesurfer: WaveSurfer,
    regionsPlugin: RegionsPlugin,
    region: Region
  ) {
    this.regionsPlugin = regionsPlugin;
    this.region = region;
    // Store region state for undo
    this.regionState = {
      id: region.id,
      start: region.start,
      end: region.end,
      color: region.color,
      drag: region.drag,
      resize: region.resize,
    };
  }

  async execute(): Promise<void> {
    this.region.remove();
  }

  async undo(): Promise<void> {
    if (this.regionState) {
      this.regionsPlugin.addRegion({
        id: this.regionState.id,
        start: this.regionState.start,
        end: this.regionState.end,
        color: this.regionState.color,
        drag: this.regionState.drag,
        resize: this.regionState.resize,
      });
    }
  }

  getDescription(): string {
    return 'Remove trim region';
  }
}

/**
 * Command to update region boundaries
 */
export class UpdateRegionCommand implements Command {
  private oldStart: number;
  private oldEnd: number;
  private region: Region;
  private newStart: number;
  private newEnd: number;

  constructor(
    region: Region,
    newStart: number,
    newEnd: number
  ) {
    this.region = region;
    this.newStart = newStart;
    this.newEnd = newEnd;
    this.oldStart = region.start;
    this.oldEnd = region.end;
  }

  async execute(): Promise<void> {
    this.region.setOptions({
      start: this.newStart,
      end: this.newEnd,
    });
  }

  async undo(): Promise<void> {
    this.region.setOptions({
      start: this.oldStart,
      end: this.oldEnd,
    });
  }

  getDescription(): string {
    return `Update region (${this.newStart.toFixed(2)}s - ${this.newEnd.toFixed(2)}s)`;
  }
}

/**
 * Command to change playback speed
 */
export class ChangePlaybackSpeedCommand implements Command {
  private oldSpeed: number;
  private wavesurfer: WaveSurfer;
  private newSpeed: number;

  constructor(
    wavesurfer: WaveSurfer,
    newSpeed: number
  ) {
    this.wavesurfer = wavesurfer;
    this.newSpeed = newSpeed;
    this.oldSpeed = wavesurfer.getPlaybackRate();
  }

  async execute(): Promise<void> {
    this.wavesurfer.setPlaybackRate(this.newSpeed);
  }

  async undo(): Promise<void> {
    this.wavesurfer.setPlaybackRate(this.oldSpeed);
  }

  getDescription(): string {
    return `Change playback speed to ${this.newSpeed}x`;
  }
}

/**
 * Command to change volume
 */
export class ChangeVolumeCommand implements Command {
  private oldVolume: number;
  private wavesurfer: WaveSurfer;
  private newVolume: number;

  constructor(
    wavesurfer: WaveSurfer,
    newVolume: number
  ) {
    this.wavesurfer = wavesurfer;
    this.newVolume = newVolume;
    this.oldVolume = wavesurfer.getVolume();
  }

  async execute(): Promise<void> {
    this.wavesurfer.setVolume(this.newVolume);
  }

  async undo(): Promise<void> {
    this.wavesurfer.setVolume(this.oldVolume);
  }

  getDescription(): string {
    return `Change volume to ${Math.round(this.newVolume * 100)}%`;
  }
}

/**
 * Macro command to execute multiple commands as one
 */
export class MacroCommand implements Command {
  private commands: Command[];
  private description: string;

  constructor(
    commands: Command[],
    description: string = 'Macro command'
  ) {
    this.commands = commands;
    this.description = description;
  }

  async execute(): Promise<void> {
    for (const command of this.commands) {
      await command.execute();
    }
  }

  async undo(): Promise<void> {
    // Undo in reverse order
    for (let i = this.commands.length - 1; i >= 0; i--) {
      await this.commands[i].undo();
    }
  }

  getDescription(): string {
    return this.description;
  }
}
