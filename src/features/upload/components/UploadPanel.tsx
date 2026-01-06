import { useState, useRef } from 'react';
import type { DragEvent } from 'react';
import { Upload } from 'lucide-react';
import { GlassCard } from '../../../components/ui/GlassCard';
import { Heading } from '../../../components/ui/Heading';
import { Text } from '../../../components/ui/Text';
import { FilePreview } from './FilePreview';

export interface UploadPanelProps {
  onFileUpload: (file: File) => void;
  uploadedFile?: File | Blob | null;
  onFileRemove?: () => void;
}

export function UploadPanel({ onFileUpload, uploadedFile, onFileRemove }: UploadPanelProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

    const files = Array.from(e.dataTransfer.files);
    const audioFile = files.find(file => file.type.startsWith('audio/'));

    if (audioFile) {
      onFileUpload(audioFile);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileUpload(file);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemove = () => {
    if (onFileRemove) {
      onFileRemove();
    }
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleReplace = () => {
    fileInputRef.current?.click();
  };

  return (
    <GlassCard variant="light" className="p-6">
      <Heading level="h3" className="mb-4">Upload Audio</Heading>

      {/* Show FilePreview if file is uploaded, otherwise show drop zone */}
      {uploadedFile ? (
        <FilePreview 
          file={uploadedFile} 
          onRemove={handleRemove}
          onReplace={handleReplace}
        />
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
            Drop your audio file here or click to browse
          </Text>

          <Text variant="caption" color="tertiary" className="mb-4">
            Supported formats
          </Text>

          <div className="inline-flex px-4 py-2 rounded-full bg-[var(--color-bg-surface)] border border-border">
            <Text variant="caption" color="secondary">
              MP3, WAV, M4A up to 500MB
            </Text>
          </div>
        </div>
      )}

      {/* Hidden file input (always present) */}
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </GlassCard>
  );
}
