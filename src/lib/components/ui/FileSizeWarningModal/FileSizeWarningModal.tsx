import React from 'react';
import { Modal } from '../Modal';
import type { FileSizeStatus } from '../../../../utils/fileSize';

/**
 * FileSizeWarningModal component properties
 */
export interface FileSizeWarningModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback when modal should close */
  onClose: () => void;
  /** File size status with formatted size and recommendations */
  fileSizeStatus: FileSizeStatus;
  /** Callback when user chooses to proceed without compression */
  onProceed: () => void;
  /** Callback when user chooses to compress the file */
  onCompress: () => void;
}

/**
 * Warning icon for large files
 */
const WarningIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    className="w-16 h-16 text-amber-500"
  >
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

/**
 * Error icon for files that are too large
 */
const ErrorIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    className="w-16 h-16 text-red-500"
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="15" y1="9" x2="9" y2="15" />
    <line x1="9" y1="9" x2="15" y2="15" />
  </svg>
);

/**
 * Modal dialog for warning users about large file sizes.
 *
 * Features:
 * - **Two states**: Warning (large file) and Error (file too large)
 * - **File info**: Displays formatted size and estimated processing time
 * - **Recommendations**: Provides compression recommendations
 * - **Benefits list**: Shows advantages of compression for large files
 * - **Action buttons**: Compress, Continue Anyway (warning only), Cancel
 * - **Dark mode**: Supports light and dark themes
 *
 * @example
 * ```tsx
 * <FileSizeWarningModal
 *   isOpen={showModal}
 *   onClose={() => setShowModal(false)}
 *   fileSizeStatus={{
 *     formattedSize: '28.5 MB',
 *     isTooLarge: false,
 *     estimatedTime: '~2 minutes',
 *     recommendation: 'We recommend compressing this file...'
 *   }}
 *   onProceed={handleProceed}
 *   onCompress={handleCompress}
 * />
 * ```
 *
 * @param props - FileSizeWarningModal properties
 * @param props.isOpen - Whether the modal is open
 * @param props.onClose - Callback when modal should close
 * @param props.fileSizeStatus - File size status with formatted size and recommendations
 * @param props.onProceed - Callback when user chooses to proceed without compression
 * @param props.onCompress - Callback when user chooses to compress the file
 *
 * @returns Modal dialog for file size warnings
 */
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
      <div className="text-center">
        <div className="flex justify-center mb-6">
          {isTooLarge ? <ErrorIcon /> : <WarningIcon />}
        </div>

        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700 last:border-0">
            <span className="font-medium text-gray-500 dark:text-gray-400 text-sm">File Size:</span>
            <span className="font-semibold text-gray-900 dark:text-gray-50 text-sm">{formattedSize}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700 last:border-0">
            <span className="font-medium text-gray-500 dark:text-gray-400 text-sm">Estimated Processing Time:</span>
            <span className="font-semibold text-gray-900 dark:text-gray-50 text-sm">{estimatedTime}</span>
          </div>
        </div>

        <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/40 border-l-4 border-amber-500 rounded text-left">
          <p className="m-0 font-medium text-amber-800 dark:text-amber-100">{recommendation}</p>
        </div>

        {!isTooLarge && (
          <div className="text-left bg-green-50 dark:bg-green-900/40 border-l-4 border-emerald-500 rounded p-4 mb-4">
            <h4 className="m-0 mb-3 text-emerald-800 dark:text-emerald-100 text-base">Benefits of Compression:</h4>
            <ul className="m-0 pl-6 text-emerald-700 dark:text-emerald-200 list-disc">
              <li className="my-2 text-sm">Faster transcription processing</li>
              <li className="my-2 text-sm">Lower memory usage during playback</li>
              <li className="my-2 text-sm">Optimized for Whisper AI (16kHz sample rate)</li>
              <li className="my-2 text-sm">No impact on transcription quality</li>
            </ul>
          </div>
        )}

        {isTooLarge && (
          <div className="text-left bg-red-50 dark:bg-red-900/40 border-l-4 border-red-500 rounded p-4 mb-4">
            <p className="m-0 text-red-800 dark:text-red-200 text-sm">
              <strong className="text-red-900 dark:text-red-100">Note:</strong> Files larger than 50MB must be compressed before processing
              to ensure optimal performance and prevent memory issues.
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
};
