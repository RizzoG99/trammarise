import React, { useState, useRef } from 'react';
import { WaveformPlayer } from '../audio/WaveformPlayer';
import type { WaveformPlayerRef } from '../audio/WaveformPlayer';
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

type MessageType = 'success' | 'error' | 'info';

interface Message {
  text: string;
  type: MessageType;
}

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
  const [message, setMessage] = useState<Message | null>(null);
  const playerRef = useRef<WaveformPlayerRef | null>(null);

  const showMessage = (text: string, type: MessageType) => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 4000);
  };

  const handlePlayPause = () => {
    playerRef.current?.wavesurfer?.playPause();
  };

  const handleTrimClick = () => {
    const newShowTrim = !showTrim;
    setShowTrim(newShowTrim);

    if (newShowTrim) {
      // Enable region selection when entering trim mode
      playerRef.current?.enableRegions(true);
    } else {
      // Disable and clear regions when exiting trim mode
      playerRef.current?.enableRegions(false);
      playerRef.current?.clearRegions();
    }
  };

  const handleCancelTrim = () => {
    playerRef.current?.clearRegions();
    playerRef.current?.enableRegions(false);
    setShowTrim(false);
  };

  const handleApplyTrim = async () => {
    const regions = playerRef.current?.regions?.getRegions();
    
    if (regions && regions.length > 0) {
      const region = regions[0];
      const start = region.start;
      const end = region.end;
      
      try {
        const wavesurfer = playerRef.current?.wavesurfer;
        if (!wavesurfer) return;

        const audioBuffer = wavesurfer.getDecodedData();
        
        if (audioBuffer) {
          // Import the trim utility dynamically
          const { trimAudioBuffer, audioBufferToWav } = await import('../../utils/audio');
          const trimmedBuffer = await trimAudioBuffer(audioBuffer, start, end);
          const blob = audioBufferToWav(trimmedBuffer);
          
          await wavesurfer.loadBlob(blob);
          handleCancelTrim();

          showMessage('Audio trimmed successfully!', 'success');
        }
      } catch (error) {
        console.error('Error trimming audio:', error);
        showMessage('Failed to trim audio. Please try again.', 'error');
      }
    } else {
      showMessage('Please select a region to trim', 'info');
    }
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

      {message && (
        <div className={`message message-${message.type}`}>
          {message.text}
        </div>
      )}

      <WaveformPlayer
        audioFile={audioFile}
        onWaveSurferReady={(player) => (playerRef.current = player)}
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
        isTrimming={showTrim}
        onPlayPause={handlePlayPause}
        onTrimClick={handleTrimClick}
        onApplyTrim={handleApplyTrim}
        onCancelTrim={handleCancelTrim}
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
