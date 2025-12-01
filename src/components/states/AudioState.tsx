import React, { useState, useRef } from 'react';
import { WaveformPlayer } from '../audio/WaveformPlayer';
import { PlaybackControls } from '../audio/PlaybackControls';
import { Button } from '../ui/Button';
import './AudioState.css';

interface AudioStateProps {
  audioFile: File | Blob;
  audioName: string;
  onReset: () => void;
  onProcessingStart: () => void;
}

const ProcessIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
  </svg>
);

export const AudioState: React.FC<AudioStateProps> = ({
  audioFile,
  audioName,
  onReset,
  onProcessingStart,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showTrim, setShowTrim] = useState(false);
  const wavesurferRef = useRef<any>(null);

  const handlePlayPause = () => {
    wavesurferRef.current?.playPause();
  };

  const handleTrimClick = () => {
    const newShowTrim = !showTrim;
    setShowTrim(newShowTrim);

    if (newShowTrim) {
      // Enable region selection when entering trim mode
      wavesurferRef.current?.enableRegionSelection?.();
    } else {
      // Disable and clear regions when exiting trim mode
      wavesurferRef.current?.disableRegionSelection?.();
      wavesurferRef.current?.clearRegions?.();
    }
  };

  const handleApplyTrim = () => {
    const region = wavesurferRef.current?.getActiveRegion?.();

    if (!region) {
      alert('Please select a region on the waveform by clicking and dragging.');
      return;
    }

    alert(
      `Trim applied!\n\nSelected region: ${region.start.toFixed(2)}s to ${region.end.toFixed(2)}s\n\nThis will be implemented to actually trim the audio in the next phase.`
    );

    // Clear region and exit trim mode
    wavesurferRef.current?.clearRegions?.();
    wavesurferRef.current?.disableRegionSelection?.();
    setShowTrim(false);
  };

  const handleProcess = () => {
    // Trigger configuration state
    onProcessingStart();
  };

  return (
    <div className="audio-state">
      <div className="audio-info">
        <h2 className="audio-title">{audioName}</h2>
        <p className="audio-subtitle">Visualize and trim your audio below</p>
      </div>

      <WaveformPlayer
        audioFile={audioFile}
        onWaveSurferReady={(ws) => (wavesurferRef.current = ws)}
        onPlaybackChange={setIsPlaying}
        onTimeUpdate={(time, dur) => {
          setCurrentTime(time);
          setDuration(dur);
        }}
      />

      <PlaybackControls
        isPlaying={isPlaying}
        currentTime={currentTime}
        duration={duration}
        onPlayPause={handlePlayPause}
        onTrimClick={handleTrimClick}
      />

      {showTrim && (
        <div className="trim-controls">
          <p className="trim-instruction">
            Click and drag on the waveform to select the portion of audio you want to keep.
          </p>
          <div className="trim-buttons">
            <Button variant="success" onClick={handleApplyTrim}>
              Apply Trim
            </Button>
            <Button variant="outline" onClick={handleTrimClick}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      <div className="action-buttons">
        <Button variant="large" icon={<ProcessIcon />} onClick={handleProcess}>
          Process Audio
        </Button>
        <Button variant="outline" onClick={onReset}>
          Start Over
        </Button>
      </div>
    </div>
  );
};
