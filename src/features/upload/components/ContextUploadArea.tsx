import { useRef, useState } from 'react';
import type { DragEvent } from 'react';
import { Paperclip, X } from 'lucide-react';
import { Text } from '../../../components/ui/Text';

export interface ContextUploadAreaProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
}

export function ContextUploadArea({ files, onFilesChange }: ContextUploadAreaProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

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

    const droppedFiles = Array.from(e.dataTransfer.files);
    const validFiles = droppedFiles.filter(file =>
      file.type.includes('pdf') ||
      file.type.startsWith('image/') ||
      file.type.includes('text')
    );

    onFilesChange([...files, ...validFiles]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    onFilesChange([...files, ...selectedFiles]);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    onFilesChange(newFiles);
  };

  return (
    <div>
      <Text variant="body" color="primary" className="font-medium mb-1">
        Context (Optional)
      </Text>
      <Text variant="caption" color="tertiary" className="mb-3">
        Upload Agenda or Slides to improve accuracy
      </Text>

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        className={`
          border-2 border-dashed rounded-lg p-6
          flex flex-col items-center justify-center
          cursor-pointer transition-all
          ${
            isDragging
              ? 'border-primary bg-[var(--color-primary-alpha-10)]'
              : 'border-border hover:border-primary hover:bg-[var(--color-primary-alpha-5)]'
          }
        `}
      >
        <Paperclip className="w-8 h-8 text-text-tertiary mb-2" />
        <Text variant="caption" color="secondary">
          Attach Files
        </Text>
        <Text variant="caption" color="tertiary" className="mt-1">
          PDF, JPG, PNG
        </Text>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,image/*,.txt"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* File List */}
      {files.length > 0 && (
        <div className="mt-3 space-y-2">
          {files.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-2 rounded-lg bg-[var(--color-bg-surface)] border border-border"
            >
              <Text variant="caption" color="secondary" className="truncate flex-1">
                {file.name}
              </Text>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveFile(index);
                }}
                className="p-1 hover:bg-[var(--color-bg-surface-hover)] rounded transition-colors"
                aria-label={`Remove ${file.name}`}
              >
                <X className="w-4 h-4 text-text-tertiary" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
