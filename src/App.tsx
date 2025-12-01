import { useState, useEffect } from 'react';
import { InitialState } from './components/states/InitialState';
import { RecordingState } from './components/states/RecordingState';
import { AudioState } from './components/states/AudioState';
import { ConfigurationState } from './components/states/ConfigurationState';
import { ProcessingState } from './components/states/ProcessingState';
import { ResultsState } from './components/states/ResultsState';
import { useAudioRecorder } from './hooks/useAudioRecorder';
import { transcribeAudio, summarizeTranscript } from './utils/api';
import type { AppState, AudioFile, ProcessingResult, ProcessingStateData, AIConfiguration } from './types/audio';
import './App.css';

function App() {
  const [appState, setAppState] = useState<AppState>('initial');
  const [audioFile, setAudioFile] = useState<AudioFile | null>(null);
  const [processingData, setProcessingData] = useState<ProcessingStateData>({
    step: 'transcribing',
    progress: 0,
  });
  const [result, setResult] = useState<ProcessingResult | null>(null);
  const [aiConfiguration, setAiConfiguration] = useState<AIConfiguration | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { isRecording, duration, audioBlob, startRecording, stopRecording, error } =
    useAudioRecorder();

  // Handle recording completion
  useEffect(() => {
    if (audioBlob && !isRecording) {
      setAudioFile({
        name: 'Recorded Audio',
        blob: audioBlob,
      });
      setAppState('audio');
    }
  }, [audioBlob, isRecording]);

  // Show error messages
  useEffect(() => {
    if (error) {
      setErrorMessage(error);
      setTimeout(() => setErrorMessage(null), 4000);
    }
  }, [error]);

  const handleFileUpload = (file: File) => {
    setAudioFile({
      name: file.name,
      blob: file,
    });
    setAppState('audio');
  };



  const handleStartRecording = async () => {
    await startRecording();
    setAppState('recording');
  };

  const handleReset = () => {
    setAudioFile(null);
    setResult(null);
    setAiConfiguration(null);
    setAppState('initial');
  };

  const handleBackToAudio = () => {
    setAppState('audio');
  };

  const handleConfigure = async (config: AIConfiguration) => {
    if (!audioFile) {
      alert('Audio file not found. Please try again.');
      return;
    }

    setAiConfiguration(config);
    setAppState('processing');
    setProcessingData({ step: 'transcribing', progress: 0 });

    try {
      // Step 1: Transcribe audio with OpenAI Whisper
      const { transcript } = await transcribeAudio(audioFile.blob, config.openaiKey);

      setProcessingData({ step: 'transcribing', progress: 50 });

      // Step 2: Generate summary with selected AI provider
      setProcessingData({ step: 'summarizing', progress: 50 });

      const { summary } = await summarizeTranscript(
        transcript,
        config.contentType,
        config.provider,
        config.apiKey
      );

      setProcessingData({ step: 'summarizing', progress: 100 });

      // Complete processing
      setResult({
        transcript,
        summary,
        chatHistory: [],
        configuration: config,
      });
      setAppState('results');
    } catch (error: any) {
      console.error('Processing error:', error);
      alert(`Processing failed: ${error.message}\n\nPlease try again or check your API configuration.`);
      setAppState('configuration');
    }
  };

  return (
    <div className="container">
      <main className="main-content">
        {errorMessage && (
          <div className="error-message">
            {errorMessage}
          </div>
        )}

        {appState === 'initial' && (
          <InitialState
            onFileUpload={handleFileUpload}
            onStartRecording={handleStartRecording}
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
          <ProcessingState processingData={processingData} />
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

      <footer className="footer">
        <p>Trammarise &copy; 2025 - Audio Transcription & Summarization</p>
      </footer>
    </div>
  );
}

export default App;
