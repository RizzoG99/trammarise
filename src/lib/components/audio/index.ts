/**
 * Audio Components
 *
 * Components for audio playback, visualization, and editing.
 */

// PlaybackControls
export { PlaybackControls } from './PlaybackControls';

// WaveformPlayer
export { WaveformPlayer } from './WaveformPlayer';
export type { WaveformPlayerRef } from './WaveformPlayer';

// WaveformEditorWithUndo (example component for Command Pattern)
export { WaveformEditorWithUndo } from './WaveformEditorWithUndo';

// VolumeControl
export { VolumeControl } from './VolumeControl';
export type { VolumeControlProps } from './VolumeControl';

// AudioPlayer (unified controlled/uncontrolled player)
export { AudioPlayer } from './AudioPlayer';
export type { AudioPlayerProps } from './AudioPlayer';
