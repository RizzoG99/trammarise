import React from 'react';
import { Modal } from './Modal';
import type { FileSizeStatus } from '../../utils/fileSize';
import './FileSizeWarningModal.css';

interface FileSizeWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileSizeStatus: FileSizeStatus;
  onProceed: () => void;
  onCompress: () => void;
}

const WarningIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    className="warning-icon"
  >
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const ErrorIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    className="error-icon"
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="15" y1="9" x2="9" y2="15" />
    <line x1="9" y1="9" x2="15" y2="15" />
  </svg>
);

export const FileSizeWarningModal: React.FC<FileSizeWarningModalProps> = ({
  isOpen,
  onClose,
  fileSizeStatus,
  onProceed,
  onCompress,
}) => {
  const { formattedSize, isTooLarge, estimatedTime, recommendation } = fileSizeStatus;

  const actions = isTooLarge
    ? [
        { label: 'Compress File', onClick: onCompress, variant: 'primary' as const },
        { label: 'Cancel', onClick: onClose, variant: 'outline' as const },
      ]
    : [
        { label: 'Compress & Continue', onClick: onCompress, variant: 'primary' as const },
        { label: 'Continue Anyway', onClick: onProceed, variant: 'outline' as const },
        { label: 'Cancel', onClick: onClose, variant: 'outline' as const },
      ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isTooLarge ? 'File Too Large' : 'Large File Detected'}
      actions={actions}
    >
      <div className="file-size-warning">
        <div className="warning-header">
          {isTooLarge ? <ErrorIcon /> : <WarningIcon />}
        </div>

        <div className="file-info">
          <div className="info-row">
            <span className="info-label">File Size:</span>
            <span className="info-value">{formattedSize}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Estimated Processing Time:</span>
            <span className="info-value">{estimatedTime}</span>
          </div>
        </div>

        <div className="recommendation">
          <p>{recommendation}</p>
        </div>

        {!isTooLarge && (
          <div className="compression-benefits">
            <h4>Benefits of Compression:</h4>
            <ul>
              <li>Faster transcription processing</li>
              <li>Lower memory usage during playback</li>
              <li>Optimized for Whisper AI (16kHz sample rate)</li>
              <li>No impact on transcription quality</li>
            </ul>
          </div>
        )}

        {isTooLarge && (
          <div className="error-note">
            <p>
              <strong>Note:</strong> Files larger than 50MB must be compressed before processing
              to ensure optimal performance and prevent memory issues.
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
};
