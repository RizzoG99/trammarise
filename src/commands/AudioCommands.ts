import type { Command } from '../patterns/Command';
import type WaveSurfer from 'wavesurfer.js';
import type { Region } from 'wavesurfer.js/dist/plugins/regions';

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

  constructor(
    private wavesurfer: WaveSurfer,
    private regionsPlugin: any,
    start: number,
    end: number
  ) {
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

  constructor(
    private wavesurfer: WaveSurfer,
    private regionsPlugin: any,
    private region: Region
  ) {
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

  constructor(
    private region: Region,
    private newStart: number,
    private newEnd: number
  ) {
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

  constructor(
    private wavesurfer: WaveSurfer,
    private newSpeed: number
  ) {
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

  constructor(
    private wavesurfer: WaveSurfer,
    private newVolume: number
  ) {
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
  constructor(
    private commands: Command[],
    private description: string = 'Macro command'
  ) {}

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
