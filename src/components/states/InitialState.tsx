import React, { useRef, useState } from 'react';
import { Button } from '../ui/Button';
import { FileSizeWarningModal } from '../ui/FileSizeWarningModal';
import { getFileSizeStatus } from '../../utils/fileSize';
import type { FileSizeStatus } from '../../utils/fileSize';
import './InitialState.css';

interface InitialStateProps {
  onFileUpload: (file: File, shouldCompress: boolean) => void;
  onStartRecording: () => void;
  hasMicrophoneAccess: boolean | null;
  onRecordingAttempt: () => void;
  onError?: (message: string) => void;
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
  hasMicrophoneAccess,
  onRecordingAttempt,
  onError,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [fileSizeStatus, setFileSizeStatus] = useState<FileSizeStatus | null>(null);

  const handleFileValidation = (file: File) => {
    if (!file.type.startsWith('audio/')) {
      onError?.('Please select a valid audio file');
      return;
    }

    const status = getFileSizeStatus(file.size);
    setFileSizeStatus(status);
    setCurrentFile(file);

    if (status.isTooLarge) {
      // File is too large, must compress
      setShowWarningModal(true);
    } else if (status.needsWarning) {
      // File is large, show warning with option to compress or proceed
      setShowWarningModal(true);
    } else {
      // File size is acceptable, proceed directly
      onFileUpload(file, false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileValidation(file);
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
    if (file) {
      handleFileValidation(file);
    }
  };

  const handleProceedWithoutCompression = () => {
    if (currentFile) {
      onFileUpload(currentFile, false);
      setShowWarningModal(false);
      setCurrentFile(null);
    }
  };

  const handleCompressAndProceed = () => {
    if (currentFile) {
      onFileUpload(currentFile, true);
      setShowWarningModal(false);
      setCurrentFile(null);
    }
  };

  const handleCloseModal = () => {
    setShowWarningModal(false);
    setCurrentFile(null);
    setFileSizeStatus(null);
  };

  const handleRecordClick = () => {
    if (hasMicrophoneAccess === false) {
      onRecordingAttempt();
    } else {
      onStartRecording();
    }
  };

  return (
    <>
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

          <Button 
            variant="secondary" 
            icon={<RecordIcon />} 
            onClick={handleRecordClick}
            disabled={hasMicrophoneAccess === false}
          >
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

      {fileSizeStatus && (
        <FileSizeWarningModal
          isOpen={showWarningModal}
          onClose={handleCloseModal}
          fileSizeStatus={fileSizeStatus}
          onProceed={handleProceedWithoutCompression}
          onCompress={handleCompressAndProceed}
        />
      )}
    </>
  );
};
