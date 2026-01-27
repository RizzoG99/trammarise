import React, { useRef, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, FileSizeWarningModal } from '@/lib';
import { AttachmentIcon } from '../icons';
import { getFileSizeStatus } from '../../utils/fileSize';
import type { FileSizeStatus } from '../../utils/fileSize';

interface InitialStateProps {
  onFileUpload: (file: File, shouldCompress: boolean) => void;
  onStartRecording: () => void;
  hasMicrophoneAccess: boolean | null;
  onRecordingAttempt: () => void;
  onError?: (message: string) => void;
  contextFiles: File[];
  onContextFilesChange: (files: File[]) => void;
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
  contextFiles,
  onContextFilesChange,
}) => {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [fileSizeStatus, setFileSizeStatus] = useState<FileSizeStatus | null>(null);
  const [contextErrors, setContextErrors] = useState<string>('');
  const [imagePreviewUrls, setImagePreviewUrls] = useState<Map<string, string>>(new Map());

  // Cleanup all Object URLs when component unmounts
  useEffect(() => {
    return () => {
      imagePreviewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [imagePreviewUrls]);

  const handleFileValidation = (file: File) => {
    if (!file.type.startsWith('audio/')) {
      onError?.(t('initialState.contextFiles.errors.invalidAudio'));
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
    const files = Array.from(e.target.files || []);

    // Separate audio from context files
    const audioFiles = files.filter((f) => f.type.startsWith('audio/'));
    const contextFilesNew = files.filter(
      (f) => f.type.startsWith('image/') || f.type === 'application/pdf' || f.type === 'text/plain'
    );

    // Handle audio file (only one allowed)
    if (audioFiles.length > 0) {
      handleFileValidation(audioFiles[0]);
    }

    // Handle context files (multiple allowed)
    if (contextFilesNew.length > 0) {
      handleContextFiles(contextFilesNew);
    }

    // Show error for invalid files
    const invalidFiles = files.filter(
      (f) =>
        !f.type.startsWith('audio/') &&
        !f.type.startsWith('image/') &&
        f.type !== 'application/pdf' &&
        f.type !== 'text/plain'
    );

    if (invalidFiles.length > 0) {
      onError?.(t('initialState.contextFiles.errors.someIgnored'));
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

    const files = Array.from(e.dataTransfer.files);

    // Separate audio from context files
    const audioFiles = files.filter((f) => f.type.startsWith('audio/'));
    const contextFilesNew = files.filter(
      (f) => f.type.startsWith('image/') || f.type === 'application/pdf' || f.type === 'text/plain'
    );

    // Handle audio file (only one allowed)
    if (audioFiles.length > 0) {
      handleFileValidation(audioFiles[0]);
    }

    // Handle context files (multiple allowed)
    if (contextFilesNew.length > 0) {
      handleContextFiles(contextFilesNew);
    }

    // Show error for invalid files
    const invalidFiles = files.filter(
      (f) =>
        !f.type.startsWith('audio/') &&
        !f.type.startsWith('image/') &&
        f.type !== 'application/pdf' &&
        f.type !== 'text/plain'
    );

    if (invalidFiles.length > 0) {
      onError?.(t('initialState.contextFiles.errors.someIgnored'));
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

  const handleContextFiles = (files: File[]) => {
    const validFiles: File[] = [];
    let totalSize = contextFiles.reduce((acc, f) => acc + f.size, 0);
    const MAX_TOTAL_SIZE = 24 * 1024 * 1024; // 24MB

    for (const file of files) {
      // Validate type
      if (
        !file.type.startsWith('image/') &&
        file.type !== 'application/pdf' &&
        file.type !== 'text/plain'
      ) {
        setContextErrors(t('initialState.contextFiles.errors.invalidType'));
        return;
      }

      // Validate size
      if (totalSize + file.size > MAX_TOTAL_SIZE) {
        setContextErrors(t('initialState.contextFiles.errors.sizeLimit'));
        return;
      }

      // Generate preview URL for images
      if (file.type.startsWith('image/')) {
        const previewUrl = URL.createObjectURL(file);
        setImagePreviewUrls((prev) => new Map(prev).set(file.name, previewUrl));
      }

      totalSize += file.size;
      validFiles.push(file);
    }

    onContextFilesChange([...contextFiles, ...validFiles]);
    setContextErrors('');
  };

  const removeContextFile = (index: number) => {
    const fileToRemove = contextFiles[index];

    // Revoke Object URL if it's an image
    if (fileToRemove.type.startsWith('image/')) {
      const previewUrl = imagePreviewUrls.get(fileToRemove.name);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setImagePreviewUrls((prev) => {
          const newMap = new Map(prev);
          newMap.delete(fileToRemove.name);
          return newMap;
        });
      }
    }

    onContextFilesChange(contextFiles.filter((_, i) => i !== index));
  };

  return (
    <>
      <div className="w-full max-w-[600px] animate-[fadeIn_0.3s_ease-out]">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-center mb-2 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent sm:text-5xl">
            {t('initialState.title')}
          </h1>
          <p className="text-lg text-text-secondary text-center font-light">
            {t('initialState.subtitle')}
          </p>
        </div>

        <div className="flex flex-col gap-4 w-full mb-8 sm:flex-row">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="audio/*,image/*,.pdf,.txt"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />

          <Button
            variant="primary"
            icon={<UploadIcon />}
            onClick={handleUploadClick}
            className="w-full sm:flex-1"
          >
            {t('initialState.uploadButton')}
          </Button>

          <Button
            variant="secondary"
            icon={<RecordIcon />}
            onClick={handleRecordClick}
            disabled={hasMicrophoneAccess === false}
            className="w-full sm:flex-1"
          >
            {t('initialState.recordButton')}
          </Button>
        </div>

        <div
          className={`mt-4 p-12 border-2 border-dashed rounded-xl text-center transition-all duration-300 bg-bg-glass backdrop-blur-md flex flex-col items-center justify-center cursor-pointer ${
            isDragging
              ? 'border-primary bg-primary/10 text-text-primary'
              : 'border-primary/30 text-text-tertiary'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleUploadClick}
        >
          <div className="w-12 h-12 mb-4 opacity-50">
            <DropIcon />
          </div>
          <p className="text-sm m-0 font-medium">{t('initialState.dropZone.main')}</p>
          <p className="text-xs mt-2">{t('initialState.dropZone.sub')}</p>
          <p className="text-xs mt-1 opacity-75">{t('initialState.dropZone.formats')}</p>
        </div>

        {/* Context Files Display */}
        {contextFiles.length > 0 && (
          <div className="mt-4">
            <p className="text-sm font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <AttachmentIcon className="w-4 h-4" />
              {t('initialState.contextFiles.title')} ({contextFiles.length})
            </p>
            <div className="space-y-2">
              {contextFiles.map((file, index) => {
                const isImage = file.type.startsWith('image/');
                const previewUrl = isImage ? imagePreviewUrls.get(file.name) : null;

                return (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg animate-[fadeIn_0.2s_ease-out]"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      {/* Image Preview or Icon */}
                      {isImage && previewUrl ? (
                        <img
                          src={previewUrl}
                          alt={file.name}
                          className="w-12 h-12 object-cover rounded border border-slate-300 dark:border-slate-600 flex-shrink-0"
                        />
                      ) : (
                        <span className="text-xl flex-shrink-0">
                          {file.type === 'application/pdf' ? '📄' : '📝'}
                        </span>
                      )}

                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-medium text-slate-900 dark:text-white truncate">
                          {file.name}
                        </span>
                        <span className="text-xs text-slate-500">
                          {(file.size / 1024).toFixed(1)} KB
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeContextFile(index)}
                      className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                      aria-label="Remove file"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Context Files Errors */}
        {contextErrors && <p className="mt-2 text-sm text-red-500">{contextErrors}</p>}
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
