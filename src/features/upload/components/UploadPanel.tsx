import { useState, useRef } from 'react';
import type { DragEvent } from 'react';
import { Upload, AlertCircle } from 'lucide-react';
import { GlassCard, Heading, Text } from '@/lib';
import { FilePreview } from './FilePreview';
import { useTranslation } from 'react-i18next';

// File validation constants
const SUPPORTED_AUDIO_TYPES = [
  'audio/mpeg',
  'audio/wav',
  'audio/mp4',
  'audio/m4a',
  'audio/webm',
  'audio/ogg',
  'audio/flac',
];
export const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB

interface FileValidationResult {
  valid: boolean;
  error?: string;
}

export interface UploadPanelProps {
  onFileUpload: (file: File) => void;
  uploadedFile?: File | Blob | null;
  onFileRemove?: () => void;
}

export function UploadPanel({ onFileUpload, uploadedFile, onFileRemove }: UploadPanelProps) {
  const { t } = useTranslation();
  const [isDragging, setIsDragging] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): FileValidationResult => {
    // Check file type
    if (!file.type.startsWith('audio/') && !SUPPORTED_AUDIO_TYPES.includes(file.type)) {
      return { valid: false, error: t('home.audioOnly') };
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      const sizeMB = Math.round(file.size / (1024 * 1024));
      return {
        valid: false,
        error: `${t('home.fileTooLarge')} (${sizeMB}MB). ${t('home.maxSize')} 500MB.`,
      };
    }

    // Check for empty file
    if (file.size === 0) {
      return { valid: false, error: t('home.emptyFile') };
    }

    return { valid: true };
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setValidationError(null);

    const files = Array.from(e.dataTransfer.files);
    const audioFile = files.find((file) => file.type.startsWith('audio/'));

    if (!audioFile) {
      setValidationError(t('home.noAudioFound'));
      return;
    }

    const validation = validateFile(audioFile);
    if (!validation.valid) {
      setValidationError(validation.error || t('home.invalidFile'));
      return;
    }

    onFileUpload(audioFile);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setValidationError(null);

    if (!file) return;

    const validation = validateFile(file);
    if (!validation.valid) {
      setValidationError(validation.error || t('home.invalidFile'));
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    onFileUpload(file);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemove = () => {
    if (onFileRemove) {
      onFileRemove();
    }
    // Clear validation error
    setValidationError(null);
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleReplace = () => {
    fileInputRef.current?.click();
  };

  return (
    <GlassCard variant="dark" className="p-6 h-full flex flex-col justify-between">
      <Heading level="h3" className="mb-4">
        {t('home.uploadTitle')}
      </Heading>

      {/* Validation Error Message */}
      {validationError && (
        <div
          className="mb-4 p-3 rounded-lg border flex items-start gap-2"
          style={{
            backgroundColor: 'var(--color-accent-error-alpha-10)',
            borderColor: 'rgba(239, 68, 68, 0.2)',
          }}
        >
          <AlertCircle
            className="w-5 h-5 flex-shrink-0 mt-0.5"
            style={{ color: 'var(--color-accent-error)' }}
          />
          <Text
            variant="caption"
            className="font-medium"
            style={{ color: 'var(--color-accent-error)' }}
          >
            {validationError}
          </Text>
        </div>
      )}

      {/* Show FilePreview if file is uploaded, otherwise show drop zone */}
      {uploadedFile ? (
        <FilePreview file={uploadedFile} onRemove={handleRemove} onReplace={handleReplace} />
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClick}
          className={`
            border-2 border-dashed rounded-lg p-8
            flex flex-col items-center justify-center
            min-h-[300px] cursor-pointer
            transition-all duration-200
            ${
              isDragging
                ? 'border-primary bg-[var(--color-primary-alpha-10)]'
                : 'border-border hover:border-primary hover:bg-[var(--color-primary-alpha-5)]'
            }
          `}
        >
          <div className="w-16 h-16 rounded-full bg-[var(--color-primary-alpha-10)] flex items-center justify-center mb-4">
            <Upload className="w-8 h-8 text-primary" />
          </div>

          <Text variant="body" color="primary" className="font-medium mb-2">
            {t('home.dropText')}
          </Text>

          <Text variant="caption" color="tertiary" className="mb-4">
            {t('uploadFormats.label')}
          </Text>

          <div className="inline-flex px-4 py-2 rounded-full bg-[var(--color-bg-surface)] border border-border">
            <Text variant="caption" color="secondary">
              {t('home.supportedFormats')}
            </Text>
          </div>
        </div>
      )}

      {/* Hidden file input (always present) */}
      <input
        ref={fileInputRef}
        type="file"
        id="audio-file-upload"
        name="audio-file"
        accept="audio/*"
        onChange={handleFileSelect}
        className="hidden"
        aria-label="Upload audio file (drag and drop or click to browse)"
        data-testid="file-input"
      />
    </GlassCard>
  );
}
