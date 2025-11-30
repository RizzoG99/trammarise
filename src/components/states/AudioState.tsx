import React, { useState, useRef } from 'react';
import { WaveformPlayer } from '../audio/WaveformPlayer';
import { PlaybackControls } from '../audio/PlaybackControls';
import { Button } from '../ui/Button';
import './AudioState.css';

interface AudioStateProps {
  audioFile: File | Blob;
  audioName: string;
  onReset: () => void;
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
    setShowTrim(!showTrim);
  };

  const handleApplyTrim = () => {
    // Simplified trim - just trim to 50%
    const duration = wavesurferRef.current?.getDuration() || 0;
    alert(`Trim would keep first 50% of audio (0 to ${(duration * 0.5).toFixed(1)}s)`);
    setShowTrim(false);
  };

  const handleProcess = () => {
    alert('Audio processing will be implemented in the next phase.\\n\\nThis will transcribe and summarize the audio.');
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
            Audio duration: {duration.toFixed(1)}s. Trim keeps first 50% by default.
          </p>
          <div className="trim-buttons">
            <Button variant="success" onClick={handleApplyTrim}>
              Apply Trim
            </Button>
            <Button variant="outline" onClick={() => setShowTrim(false)}>
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
