import { useState, useRef, useCallback, useEffect } from 'react';
import { AUDIO_CONSTANTS } from '../utils/constants';

interface UseAudioRecorderReturn {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  audioBlob: Blob | null;
  startRecording: () => Promise<boolean>;
  pauseRecording: () => void;
  resumeRecording: () => void;
  stopRecording: () => void;
  resetRecording: () => void;
  error: string | null;
  hasMicrophoneAccess: boolean | null;
  checkMicrophonePermission: () => Promise<void>;
}

export const useAudioRecorder = (): UseAudioRecorderReturn => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasMicrophoneAccess, setHasMicrophoneAccess] = useState<boolean | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const durationRef = useRef<number>(0);
  const permissionStatusRef = useRef<PermissionStatus | null>(null);
  const shouldProcessResultRef = useRef<boolean>(true);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (mediaRecorderRef.current?.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      // Clean up permission listener
      if (permissionStatusRef.current) {
        permissionStatusRef.current.onchange = null;
      }
    };
  }, []);

  const checkMicrophonePermission = useCallback(async () => {
    try {
      const permissionStatus = await navigator.permissions.query({ name: 'microphone' as PermissionName });
      // Store reference for cleanup
      permissionStatusRef.current = permissionStatus;

      // Only set to false if explicitly denied, not if it's "prompt"
      setHasMicrophoneAccess(permissionStatus.state === 'denied' ? false : null);

      // Remove previous listener if any
      permissionStatus.onchange = null;

      // Listen for permission changes
      permissionStatus.onchange = () => {
        setHasMicrophoneAccess(permissionStatus.state === 'denied' ? false : null);
      };
    } catch {
      // Fallback: if Permissions API is unavailable, assume permission needs to be requested
      setHasMicrophoneAccess(null);
    }
  }, []);

  const startRecording = useCallback(async (): Promise<boolean> => {
    try {
      setError(null);

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Determine the best audio format based on browser support
      let mimeType = 'audio/webm';
      const options = { mimeType };

      // Check for Safari and use appropriate format
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        // Fallback to audio/mp4 for Safari
        if (MediaRecorder.isTypeSupported('audio/mp4')) {
          mimeType = 'audio/mp4';
        } else {
          // Final fallback without specifying mime type (browser default)
          delete (options as Partial<MediaRecorderOptions>).mimeType;
        }
      }

      const mediaRecorder = new MediaRecorder(stream, options);
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        // Check if we should process the result (not a forced stop/reset)
        if (!shouldProcessResultRef.current) {
          shouldProcessResultRef.current = true; // Reset flag for next recording
          // Stop all tracks
          stream.getTracks().forEach((track) => track.stop());
          return; // Don't process the blob
        }

        const blob = new Blob(chunksRef.current, { type: mimeType });
        setAudioBlob(blob);
        setIsRecording(false);

        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop());

        // Clear timer
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
      setAudioBlob(null);
      shouldProcessResultRef.current = true; // Ensure we process the result for normal recordings

      // Start timer
      startTimeRef.current = Date.now();
      durationRef.current = 0;
      timerRef.current = window.setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        durationRef.current = elapsed;
        setDuration(elapsed);
        // Request data periodically for better Safari support
        if (mediaRecorder.state === 'recording') {
          mediaRecorder.requestData();
        }
      }, AUDIO_CONSTANTS.RECORDING_TIMER_INTERVAL);
      
      return true; // Success
    } catch (err) {
      console.error('Error accessing microphone:', err);
      // Update permission state if access was denied
      setHasMicrophoneAccess(false);
      setError('Microphone access denied. Please grant permission in your browser settings.');
      return false; // Failure
    }
  }, []);

  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      
      // Pause timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, []);

  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === 'paused') {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      
      // Resume timer using the ref value
      const pausedDuration = durationRef.current;
      startTimeRef.current = Date.now() - (pausedDuration * 1000);
      timerRef.current = window.setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        durationRef.current = elapsed;
        setDuration(elapsed);
        if (mediaRecorderRef.current?.state === 'recording') {
          mediaRecorderRef.current.requestData();
        }
      }, AUDIO_CONSTANTS.RECORDING_TIMER_INTERVAL);
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === 'recording' || mediaRecorderRef.current?.state === 'paused') {
      mediaRecorderRef.current.stop();
      setIsPaused(false);
    }
  }, []);

  const resetRecording = useCallback(() => {
    // Set flag to prevent processing the result
    shouldProcessResultRef.current = false;

    // Get the stream before stopping (for cleanup)
    const stream = mediaRecorderRef.current?.stream;

    // Stop recording if active
    if (mediaRecorderRef.current?.state === 'recording' || mediaRecorderRef.current?.state === 'paused') {
      mediaRecorderRef.current.stop();
    }

    // Always stop MediaStream tracks immediately to prevent memory leak
    // Even if MediaRecorder is in unexpected state or onstop doesn't run
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }

    // Clear timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // Reset all state
    setIsRecording(false);
    setIsPaused(false);
    setDuration(0);
    setAudioBlob(null);
    durationRef.current = 0;
    startTimeRef.current = 0;
    chunksRef.current = [];
  }, []);

  return {
    isRecording,
    isPaused,
    duration,
    audioBlob,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    resetRecording,
    error,
    hasMicrophoneAccess,
    checkMicrophonePermission,
  };
};
