import React, { useRef } from 'react';
import { Button } from '../ui/Button';
import './InitialState.css';

interface InitialStateProps {
  onFileUpload: (file: File) => void;
  onStartRecording: () => void;
}

const UploadIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
  </svg>
);

const RecordIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="4" fill="currentColor" />
  </svg>
);

const DropIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
  </svg>
);

export const InitialState: React.FC<InitialStateProps> = ({
  onFileUpload,
  onStartRecording,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = React.useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('audio/')) {
      onFileUpload(file);
    } else if (file) {
      alert('Please select a valid audio file');
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('audio/')) {
      onFileUpload(file);
    } else if (file) {
      alert('Please select a valid audio file');
    }
  };

  return (
    <div className="initial-state">
      <div className="welcome-text">
        <h1 className="title">Transform Your Audio</h1>
        <p className="subtitle">
          Upload an audio file or start recording to transcribe and summarize
        </p>
      </div>

      <div className="action-buttons">
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />

        <Button variant="primary" icon={<UploadIcon />} onClick={handleUploadClick}>
          Upload Audio
        </Button>

        <Button variant="secondary" icon={<RecordIcon />} onClick={onStartRecording}>
          Start Recording
        </Button>
      </div>

      <div
        className={`drop-zone ${isDragging ? 'drag-over' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <DropIcon />
        <p>or drag and drop audio file here</p>
      </div>
    </div>
  );
};
