import { useState, useRef, useCallback, useEffect } from 'react';

interface UseAudioRecorderReturn {
  isRecording: boolean;
  duration: number;
  audioBlob: Blob | null;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  error: string | null;
}

export const useAudioRecorder = (): UseAudioRecorderReturn => {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (mediaRecorderRef.current?.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const startRecording = useCallback(async () => {
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
      }, 100);
    } catch (err) {
      console.error('Error accessing microphone:', err);
      setError('Unable to access microphone. Please grant permission and try again.');
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
  };
};
