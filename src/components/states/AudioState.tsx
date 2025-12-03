import React, { useState, useRef } from 'react';
import { WaveformPlayer } from '../audio/WaveformPlayer';
import type { WaveformPlayerRef } from '../audio/WaveformPlayer';
import { PlaybackControls } from '../audio/PlaybackControls';
import { Button } from '../ui/Button';
import { AUDIO_CONSTANTS } from '../../utils/constants';
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

    if (!regions || regions.length === 0) {
      showMessage('Please select a region to trim', 'info');
      return;
    }

    const region = regions[0];
    const start = region.start;
    const end = region.end;

    // Validate region bounds
    if (start >= end) {
      showMessage('Invalid trim region: start must be before end', 'error');
      return;
    }

    if (start < 0 || end < 0) {
      showMessage('Invalid trim region: negative time values', 'error');
      return;
    }

    if (end - start < AUDIO_CONSTANTS.MIN_TRIM_DURATION) {
      showMessage(`Trim region too short: minimum ${AUDIO_CONSTANTS.MIN_TRIM_DURATION} seconds required`, 'error');
      return;
    }

    try {
      const wavesurfer = playerRef.current?.wavesurfer;
      if (!wavesurfer) {
        showMessage('Audio player not ready', 'error');
        return;
      }

      const audioBuffer = wavesurfer.getDecodedData();

      if (!audioBuffer) {
        showMessage('Audio data not loaded', 'error');
        return;
      }

      // Import the trim utility dynamically with timeout
      const importPromise = import('../../utils/audio');
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Import timeout')), 5000)
      );

      const { trimAudioBuffer, audioBufferToWav } = await Promise.race([
        importPromise,
        timeoutPromise
      ]);

      const trimmedBuffer = await trimAudioBuffer(audioBuffer, start, end);
      const blob = audioBufferToWav(trimmedBuffer);

      await wavesurfer.loadBlob(blob);
      handleCancelTrim();

      showMessage('Audio trimmed successfully!', 'success');
    } catch (error) {
      console.error('Error trimming audio:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      showMessage(`Failed to trim audio: ${errorMessage}`, 'error');
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
