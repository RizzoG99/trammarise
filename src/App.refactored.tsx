import { useState, useEffect, useRef } from 'react';
import { InitialState } from './components/states/InitialState';
import { RecordingState } from './components/states/RecordingState';
import { AudioState } from './components/states/AudioState';
import { ConfigurationState } from './components/states/ConfigurationState';
import { ProcessingState } from './components/states/ProcessingState';
import { ResultsState } from './components/states/ResultsState';
import { Snackbar, ThemeToggle } from '@/lib';
import type { ThemeMode } from '@/lib';
import { useAudioRecorder } from './hooks/useAudioRecorder';
import type { AppState, AudioFile, ProcessingResult, ProcessingStateData, AIConfiguration } from './types/audio';

// Import new patterns
import { appStateMachine } from './state/AppStateMachine';
import { processingEventEmitter } from './patterns/ProcessingEventEmitter';
import { audioRepository } from './repositories/AudioRepository';
import { audioAdapterRegistry } from './adapters/AudioAdapterRegistry';

function App() {
  const [appState, setAppState] = useState<AppState>('initial');
  const [audioFile, setAudioFile] = useState<AudioFile | null>(null);
  const [contextFiles, setContextFiles] = useState<File[]>([]);
  const [processingData, setProcessingData] = useState<ProcessingStateData>({
    step: 'transcribing',
    progress: 0,
  });
  const [result, setResult] = useState<ProcessingResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);
  const [processingAbortController, setProcessingAbortController] = useState<AbortController | null>(null);
  const [theme, setTheme] = useState<ThemeMode>('system');

  const { isRecording, duration, audioBlob, startRecording, stopRecording, error, hasMicrophoneAccess, checkMicrophonePermission } =
    useAudioRecorder();

  // Track the last processed audioBlob to prevent race conditions
  const lastProcessedBlobRef = useRef<Blob | null>(null);

  // Initialize state machine
  useEffect(() => {
    // Subscribe to state machine events
    const unsubscribe = appStateMachine.on('state-change', ({ to }) => {
      setAppState(to);
    });

    const unsubscribeError = appStateMachine.on('transition-error', ({ error }) => {
      console.error('State transition error:', error);
      setSnackbarMessage(`State transition error: ${error.message}`);
    });

    return () => {
      unsubscribe();
      unsubscribeError();
    };
  }, []);

  // Subscribe to processing events
  useEffect(() => {
    const unsubProgress = processingEventEmitter.on('progress', ({ step, progress, message }) => {
      setProcessingData({ step, progress, transcript: message });
    });

    const unsubStepChange = processingEventEmitter.on('step-change', ({ currentStep }) => {
      setProcessingData(prev => ({ ...prev, step: currentStep, progress: 0 }));
    });

    const unsubComplete = processingEventEmitter.on('complete', ({ transcript, summary }) => {
      setResult({
        transcript,
        summary,
        chatHistory: [],
        configuration: result?.configuration || {} as AIConfiguration,
      });
      appStateMachine.transition('results');
    });

    const unsubError = processingEventEmitter.on('error', ({ error, step }) => {
      console.error(`Processing error at ${step}:`, error);
      setSnackbarMessage(`Processing failed: ${error.message}`);
      appStateMachine.transition('configuration');
    });

    const unsubCancel = processingEventEmitter.on('cancel', ({ reason }) => {
      setSnackbarMessage(reason || 'Processing cancelled');
      appStateMachine.transition('configuration');
    });

    return () => {
      unsubProgress();
      unsubStepChange();
      unsubComplete();
      unsubError();
      unsubCancel();
    };
  }, [result]);

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
    appStateMachine.transition('audio');
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
    try {
      // Use audio adapter to validate and process file
      const processedBlob = await audioAdapterRegistry.processFile(file);

      if (shouldCompress) {
        // Show processing state during compression
        appStateMachine.transition('processing');
        setProcessingData({ step: 'compressing', progress: 0 });

        try {
          const { compressAudioFile } = await import('./utils/audioCompression');

          const compressedBlob = await compressAudioFile(processedBlob as File, (progress) => {
            setProcessingData({ step: 'compressing', progress });
          });

          // Create a File object from the compressed Blob
          const compressedFile = new File([compressedBlob], file.name, { type: compressedBlob.type || file.type });

          setAudioFile({
            name: file.name,
            blob: compressedBlob,
            file: compressedFile,
          });
          appStateMachine.transition('audio');
        } catch (error) {
          console.error('Compression error:', error);
          setErrorMessage('Failed to compress audio. Loading original file...');
          // Fallback to original file
          setAudioFile({
            name: file.name,
            blob: processedBlob,
            file: file,
          });
          appStateMachine.transition('audio');
        }
      } else {
        setAudioFile({
          name: file.name,
          blob: processedBlob,
          file: file,
        });
        appStateMachine.transition('audio');
      }
    } catch (error) {
      const err = error as { message?: string };
      setSnackbarMessage(err.message || 'An error occurred');
    }
  };

  const handleStartRecording = async () => {
    const success = await startRecording();
    // Only navigate to recording state if recording actually started successfully
    if (success) {
      appStateMachine.transition('recording');
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
    appStateMachine.reset();
  };

  const handleBackToAudio = () => {
    appStateMachine.transition('audio');
  };

  const handleCancelProcessing = () => {
    if (processingAbortController) {
      processingAbortController.abort();
      processingEventEmitter.cancel('User cancelled processing');
    }
  };

  const handleConfigure = async (config: AIConfiguration) => {
    if (!audioFile) {
      setSnackbarMessage('Audio file not found. Please try again.');
      appStateMachine.transition('audio');
      return;
    }

    // Create abort controller for cancellable operations
    const abortController = new AbortController();
    setProcessingAbortController(abortController);

    appStateMachine.transition('processing');
    processingEventEmitter.start();
    processingEventEmitter.changeStep('loading');

    try {
      // Check if aborted before starting
      if (abortController.signal.aborted) throw new Error('Processing cancelled');

      // Step 0: Process large audio (Compress & Chunk)
      const { processLargeAudio } = await import('./utils/audio-processor');

      processingEventEmitter.changeStep('transcribing');

      const chunks = await processLargeAudio(audioFile.file, (step, progress) => {
        // Check if aborted during processing
        if (abortController.signal.aborted) throw new Error('Processing cancelled');

        if (step === 'compressing') {
          processingEventEmitter.updateProgress(Math.round(progress * 0.2)); // 0-20%
        } else if (step === 'chunking') {
          processingEventEmitter.updateProgress(20 + Math.round(progress * 0.1)); // 20-30%
        }
      });

      // Check if aborted after chunking
      if (abortController.signal.aborted) throw new Error('Processing cancelled');

      // Step 1: Transcribe chunks sequentially using Repository
      let fullTranscript = '';

      for (let i = 0; i < chunks.length; i++) {
        // Check if aborted before each chunk
        if (abortController.signal.aborted) throw new Error('Processing cancelled');

        const chunk = chunks[i];
        const progressBase = 30 + Math.round((i / chunks.length) * 40); // 30-70%
        processingEventEmitter.updateProgress(progressBase);

        // Determine filename: use original name if it's a File, otherwise generate chunk name (MP3)
        const chunkName = chunk instanceof File ? chunk.name : `chunk-${i}.mp3`;

        const { transcript } = await audioRepository.transcribe({
          audioBlob: chunk,
          apiKey: config.openaiKey,
          language: config.language,
          filename: chunkName,
        });

        fullTranscript += (fullTranscript ? '\n\n' : '') + transcript;
      }

      processingEventEmitter.updateProgress(70);

      // Check if aborted after transcription
      if (abortController.signal.aborted) throw new Error('Processing cancelled');

      // Step 2: Summarize with context files using Repository
      processingEventEmitter.changeStep('summarizing');
      processingEventEmitter.updateProgress(50);

      const { summary } = await audioRepository.summarize({
        transcript: fullTranscript,
        contentType: config.contentType,
        provider: config.provider,
        apiKey: config.provider === 'openai' ? config.openaiKey : config.openrouterKey!,
        model: config.model,
        contextFiles: config.contextFiles,
        language: config.language,
      });

      processingEventEmitter.updateProgress(100);

      // Complete processing
      setResult({
        transcript: fullTranscript,
        summary,
        chatHistory: [],
        configuration: config,
      });

      processingEventEmitter.complete(fullTranscript, summary);
    } catch (error) {
      const err = error as { message?: string };
      console.error('Processing error:', error);
      const errorMsg = err.message || 'Unknown error';

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

      processingEventEmitter.error(new Error(errorMsg), false);
    } finally {
      setProcessingAbortController(null);
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto min-h-screen flex flex-col relative">
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle theme={theme} onThemeChange={setTheme} />
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
            contextFiles={contextFiles}
            onContextFilesChange={setContextFiles}
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
            onProcessingStart={() => appStateMachine.transition('configuration')}
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
