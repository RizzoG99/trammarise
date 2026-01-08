import React, { useState, useRef } from 'react';
import { WaveformPlayer } from '../audio/WaveformPlayer';
import type { WaveformPlayerRef } from '../audio/WaveformPlayer';
import { PlaybackControls } from '../audio/PlaybackControls';
import { Button } from '@/lib';
import { AUDIO_CONSTANTS } from '../../utils/constants';

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

  const getMessageClasses = (type: MessageType) => {
    const baseClasses = "p-4 rounded-lg mb-4 text-sm animate-[fadeIn_0.3s_ease-out] backdrop-blur-md";
    switch (type) {
      case 'success':
        return `${baseClasses} bg-green-500/10 border border-green-500/30 text-green-400`;
      case 'error':
        return `${baseClasses} bg-red-500/10 border border-red-500/30 text-red-400`;
      case 'info':
        return `${baseClasses} bg-primary/10 border border-primary/30 text-primary-light`;
    }
  };

  return (
    <div className="w-full max-w-[800px] animate-[fadeIn_0.3s_ease-out]">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold mb-1">{audioName}</h2>
        <p className="text-base text-text-secondary">Visualize and trim your audio below</p>
      </div>

      {message && (
        <div className={getMessageClasses(message.type)}>
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

      <div className="flex flex-col gap-4 mt-8 sm:flex-row">
        <Button variant="primary" icon={<ProcessIcon />} onClick={handleProcess} className="w-full sm:flex-[2]">
          Process Audio
        </Button>
        <Button variant="outline" onClick={onReset} className="w-full sm:flex-1">
          Start Over
        </Button>
      </div>
    </div>
  );
};
