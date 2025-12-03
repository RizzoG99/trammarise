import { useState, useRef, useCallback, useEffect } from 'react';
import { AUDIO_CONSTANTS } from '../utils/constants';

interface UseAudioRecorderReturn {
  isRecording: boolean;
  duration: number;
  audioBlob: Blob | null;
  startRecording: () => Promise<boolean>;
  stopRecording: () => void;
  error: string | null;
  hasMicrophoneAccess: boolean | null;
  checkMicrophonePermission: () => Promise<void>;
}

export const useAudioRecorder = (): UseAudioRecorderReturn => {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasMicrophoneAccess, setHasMicrophoneAccess] = useState<boolean | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const permissionStatusRef = useRef<PermissionStatus | null>(null);

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
    } catch (err) {
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

      // Start timer
      startTimeRef.current = Date.now();
      timerRef.current = window.setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
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

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  }, []);

  return {
    isRecording,
    duration,
    audioBlob,
    startRecording,
    stopRecording,
    error,
    hasMicrophoneAccess,
    checkMicrophonePermission,
  };
};
