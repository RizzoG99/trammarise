import { useState, useEffect } from 'react';
import { InitialState } from './components/states/InitialState';
import { RecordingState } from './components/states/RecordingState';
import { AudioState } from './components/states/AudioState';
import { useAudioRecorder } from './hooks/useAudioRecorder';
import type { AppState, AudioFile } from './types/audio';
import './App.css';

function App() {
  const [appState, setAppState] = useState<AppState>('initial');
  const [audioFile, setAudioFile] = useState<AudioFile | null>(null);

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

  // Show error alerts
  useEffect(() => {
    if (error) {
      alert(error);
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
    setAppState('initial');
  };

  return (
    <div className="container">
      <main className="main-content">
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
