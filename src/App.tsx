import { useState, useEffect, useRef } from 'react';
import { InitialState } from './components/states/InitialState';
import { RecordingState } from './components/states/RecordingState';
import { AudioState } from './components/states/AudioState';
import { ConfigurationState } from './components/states/ConfigurationState';
import { ProcessingState } from './components/states/ProcessingState';
import { ResultsState } from './components/states/ResultsState';
import { Snackbar } from './components/ui/Snackbar';
import { ThemeToggle } from './components/ui/ThemeToggle';
import { useAudioRecorder } from './hooks/useAudioRecorder';
import { transcribeAudio, summarizeTranscript } from './utils/api';
import type { AppState, AudioFile, ProcessingResult, ProcessingStateData, AIConfiguration } from './types/audio';

function App() {
  const [appState, setAppState] = useState<AppState>('initial');
  const [audioFile, setAudioFile] = useState<AudioFile | null>(null);
  const [processingData, setProcessingData] = useState<ProcessingStateData>({
    step: 'transcribing',
    progress: 0,
  });
  const [result, setResult] = useState<ProcessingResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);
  const [processingAbortController, setProcessingAbortController] = useState<AbortController | null>(null);

  const { isRecording, duration, audioBlob, startRecording, stopRecording, error, hasMicrophoneAccess, checkMicrophonePermission } =
    useAudioRecorder();

  // Track the last processed audioBlob to prevent race conditions
  const lastProcessedBlobRef = useRef<Blob | null>(null);

  // Check microphone permission on mount
  useEffect(() => {
    checkMicrophonePermission();
  }, [checkMicrophonePermission]);

  const handleStopRecording = (blob: Blob) => {
    const file = new File([blob], 'recording.wav', { type: 'audio/wav' });
    setAudioFile({
      name: `Recording ${new Date().toLocaleTimeString()}`,
      blob,
      file,
    });
    setAppState('audio');
  };

  // Handle recording completion - fixed race condition
  useEffect(() => {
    if (audioBlob && !isRecording && audioBlob !== lastProcessedBlobRef.current) {
      lastProcessedBlobRef.current = audioBlob;
      handleStopRecording(audioBlob);
    }
  }, [audioBlob, isRecording]);

  // Show error messages
  useEffect(() => {
    if (error) {
      setErrorMessage(error);
      setTimeout(() => setErrorMessage(null), 4000);
    }
  }, [error]);

  const handleFileUpload = async (file: File, shouldCompress: boolean) => {
    if (shouldCompress) {
      // Show processing state during compression
      setAppState('processing');
      setProcessingData({ step: 'compressing', progress: 0 });

      try {
        const { compressAudioFile } = await import('./utils/audioCompression');

        const compressedBlob = await compressAudioFile(file, (progress) => {
          setProcessingData({ step: 'compressing', progress });
        });

        // Create a File object from the compressed Blob
        const compressedFile = new File([compressedBlob], file.name, { type: compressedBlob.type || file.type });

        setAudioFile({
          name: file.name,
          blob: compressedBlob,
          file: compressedFile,
        });
        setAppState('audio');
      } catch (error: any) {
        console.error('Compression error:', error);
        setErrorMessage('Failed to compress audio. Loading original file...');
        // Fallback to original file
        setAudioFile({
          name: file.name,
          blob: file,
          file: file,
        });
        setAppState('audio');
      }
    } else {
      setAudioFile({
        name: file.name,
        blob: file,
        file: file,
      });
      setAppState('audio');
    }
  };



  const handleStartRecording = async () => {
    const success = await startRecording();
    // Only navigate to recording state if recording actually started successfully
    if (success) {
      setAppState('recording');
    }
  };

  const handleRecordingAttempt = () => {
    if (hasMicrophoneAccess === false) {
      setSnackbarMessage('Microphone access denied. Please grant permission in your browser settings.');
    }
  };

  const handleReset = () => {
    setAudioFile(null);
    setResult(null);
    lastProcessedBlobRef.current = null; // Clear tracked blob to allow new recordings
    setAppState('initial');
  };

  const handleBackToAudio = () => {
    setAppState('audio');
  };

  const handleCancelProcessing = () => {
    if (processingAbortController) {
      processingAbortController.abort();
      setSnackbarMessage('Processing cancelled');
      setAppState('configuration');
    }
  };

  const handleConfigure = async (config: AIConfiguration) => {
    if (!audioFile) {
      setSnackbarMessage('Audio file not found. Please try again.');
      setAppState('audio');
      return;
    }

    // Create abort controller for cancellable operations
    const abortController = new AbortController();
    setProcessingAbortController(abortController);

    setAppState('processing');
    setProcessingData({ step: 'loading', progress: 0 });

    try {
      // Check if aborted before starting
      if (abortController.signal.aborted) throw new Error('Processing cancelled');

      // Step 0: Process large audio (Compress & Chunk)
      // Dynamic import to avoid loading ffmpeg unless needed
      const { processLargeAudio } = await import('./utils/audio-processor');

      // Show loading state - FFmpeg will load here if needed
      setProcessingData({ step: 'transcribing', progress: 0 });

      const chunks = await processLargeAudio(audioFile.file, (step, progress) => {
        // Check if aborted during processing
        if (abortController.signal.aborted) throw new Error('Processing cancelled');

        if (step === 'compressing') {
          setProcessingData({ step: 'transcribing', progress: Math.round(progress * 0.2) }); // 0-20%
        } else if (step === 'chunking') {
          setProcessingData({ step: 'transcribing', progress: 20 + Math.round(progress * 0.1) }); // 20-30%
        }
      });

      // Check if aborted after chunking
      if (abortController.signal.aborted) throw new Error('Processing cancelled');

      // Step 1: Transcribe chunks sequentially
      let fullTranscript = '';

      for (let i = 0; i < chunks.length; i++) {
        // Check if aborted before each chunk
        if (abortController.signal.aborted) throw new Error('Processing cancelled');

        const chunk = chunks[i];
        const progressBase = 30 + Math.round((i / chunks.length) * 40); // 30-70%
        setProcessingData({ step: 'transcribing', progress: progressBase });

        // Determine filename: use original name if it's a File, otherwise generate chunk name (MP3)
        const chunkName = chunk instanceof File ? chunk.name : `chunk-${i}.mp3`;

        const { transcript } = await transcribeAudio(chunk, config.openaiKey, config.language, chunkName);
        fullTranscript += (fullTranscript ? '\n\n' : '') + transcript;
      }

      setProcessingData({ step: 'transcribing', progress: 70 });

      // Check if aborted after transcription
      if (abortController.signal.aborted) throw new Error('Processing cancelled');

      // Step 2: Generate summary with selected provider
      setProcessingData({ step: 'summarizing', progress: 70 });

      const apiKey = config.mode === 'simple' ? config.openaiKey : config.openrouterKey!;

      const { summary } = await summarizeTranscript(
        fullTranscript,
        config.contentType,
        config.provider,
        apiKey,
        config.model
      );

      setProcessingData({ step: 'summarizing', progress: 100 });

      // Complete processing
      setResult({
        transcript: fullTranscript,
        summary,
        chatHistory: [],
        configuration: config,
      });
      setAppState('results');
    } catch (error: any) {
      console.error('Processing error:', error);
      const errorMsg = error.message || 'Unknown error';

      // Check if this is an FFmpeg loading error
      if (errorMsg.includes('FFmpeg') || errorMsg.includes('CDN')) {
        // Check if we could potentially skip FFmpeg
        const isMP3 = audioFile.file.type === 'audio/mpeg';
        const isSmall = audioFile.file.size < 24 * 1024 * 1024; // 24MB

        if (isMP3 && isSmall) {
          setSnackbarMessage(
            `Audio processor failed to load (network issue). Your file is small enough to process without it. ` +
            `Refresh the page to retry or contact support if the issue persists.`
          );
        } else {
          setSnackbarMessage(
            `Audio processor failed to load from the network. This is needed for large files (>24MB). ` +
            `Please check your internet connection and try again. ` +
            `If the problem persists, try uploading a smaller MP3 file (<24MB).`
          );
        }
      } else {
        setSnackbarMessage(`Processing failed: ${errorMsg}. Please try again or check your API configuration.`);
      }

      setAppState('configuration');
    } finally {
      setProcessingAbortController(null);
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto p-4 md:p-8 min-h-screen flex flex-col relative">
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      <main className="flex-1 flex flex-col justify-center items-center py-8">
        {errorMessage && (
          <div className="w-full max-w-[800px] p-4 rounded-lg mb-4 text-sm bg-red-500/10 border border-red-500/30 text-red-400 backdrop-blur-md animate-[slideDown_0.3s_ease-out]">
            {errorMessage}
          </div>
        )}

        {appState === 'initial' && (
          <InitialState
            onFileUpload={handleFileUpload}
            onStartRecording={handleStartRecording}
            hasMicrophoneAccess={hasMicrophoneAccess}
            onRecordingAttempt={handleRecordingAttempt}
            onError={setSnackbarMessage}
          />
        )}

        {appState === 'recording' && (
          <RecordingState duration={duration} onStopRecording={stopRecording} />
        )}

        {appState === 'audio' && audioFile && (
          <AudioState
            audioFile={audioFile.blob}
            audioName={audioFile.name}
            onReset={handleReset}
            onProcessingStart={() => setAppState('configuration')}
          />
        )}

        {appState === 'configuration' && audioFile && (
          <ConfigurationState
            transcript="Click 'Validate & Continue' to start transcription and summarization"
            onConfigure={handleConfigure}
            onBack={handleBackToAudio}
          />
        )}

        {appState === 'processing' && (
          <ProcessingState processingData={processingData} onCancel={handleCancelProcessing} />
        )}

        {appState === 'results' && result && audioFile && (
          <ResultsState
            audioName={audioFile.name}
            result={result}
            onBack={handleBackToAudio}
            onUpdateResult={setResult}
          />
        )}
      </main>

      <Snackbar
        message={snackbarMessage || ''}
        variant="error"
        isOpen={!!snackbarMessage}
        onClose={() => setSnackbarMessage(null)}
      />

      <footer className="text-center py-8 text-text-tertiary text-sm border-t border-bg-tertiary mt-auto">
        <p className="m-0">Trammarise &copy; 2025 - Audio Transcription & Summarization</p>
      </footer>
    </div>
  );
}

export default App;
