import { CheckCircle, Music, Trash2, RefreshCw } from 'lucide-react';
import { Text } from '../../../components/ui/Text';

export interface FilePreviewProps {
  file: File | Blob;
  onRemove: () => void;
  onReplace: () => void;
}

/**
 * Displays preview of uploaded audio file with metadata
 * Shows filename, size, duration (if available), and actions
 */
export function FilePreview({ file, onRemove, onReplace }: FilePreviewProps) {
  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  // Get file name (File has name property, Blob doesn't)
  const fileName = file instanceof File ? file.name : 'recording.webm';
  const fileSize = formatFileSize(file.size);

  return (
    <div className="space-y-4">
      {/* Success Message */}
      <div className="flex items-center gap-2 p-3 rounded-lg bg-[var(--color-accent-success)]/10 border border-[var(--color-accent-success)]/20">
        <CheckCircle className="w-5 h-5 text-[var(--color-accent-success)] flex-shrink-0" />
        <Text variant="caption" className="font-medium" style={{ color: 'var(--color-accent-success)' }}>
          {file instanceof File ? 'File uploaded successfully' : 'Recording saved'}
        </Text>
      </div>

      {/* File Information Card */}
      <div className="p-6 rounded-lg border border-border bg-[var(--color-bg-surface)]">
        <div className="flex items-start gap-4">
          {/* File Icon */}
          <div className="w-12 h-12 rounded-lg bg-[var(--color-primary-alpha-10)] flex items-center justify-center flex-shrink-0">
            <Music className="w-6 h-6 text-primary" />
          </div>

          {/* File Details */}
          <div className="flex-1 min-w-0">
            <Text 
              variant="body" 
              color="primary" 
              className="font-semibold mb-1 truncate"
              title={fileName}
            >
              {fileName}
            </Text>
            <div className="flex items-center gap-2 text-sm">
              <Text variant="caption" color="secondary">
                {fileSize}
              </Text>
              {file instanceof File && (
                <>
                  <span style={{ color: 'var(--color-text-tertiary)' }}>•</span>
                  <Text variant="caption" color="secondary">
                    {file.type || 'Unknown format'}
                  </Text>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={onReplace}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 border-border hover:border-primary hover:bg-[var(--color-primary-alpha-5)] transition-all cursor-pointer"
          style={{ 
            backgroundColor: 'var(--color-bg-surface)',
            color: 'var(--color-text-primary)'
          }}
        >
          <RefreshCw className="w-4 h-4" />
          <Text variant="caption" className="font-medium">
            Replace File
          </Text>
        </button>

        <button
          onClick={onRemove}
          className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all cursor-pointer"
          style={{ 
            backgroundColor: 'var(--color-bg-surface)',
            borderColor: 'var(--color-accent-error)',
            color: 'var(--color-accent-error)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--color-bg-surface)';
          }}
        >
          <Trash2 className="w-4 h-4" />
          <Text variant="caption" className="font-medium">
            Remove
          </Text>
        </button>
      </div>
    </div>
  );
}
