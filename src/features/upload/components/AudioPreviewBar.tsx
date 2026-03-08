import { Music } from 'lucide-react';
import { GlassCard, AudioPlayer } from '@/lib';

export interface AudioPreviewBarProps {
  file: File | Blob;
}

export function AudioPreviewBar({ file }: AudioPreviewBarProps) {
  const fileName = file instanceof File ? file.name : 'recording.webm';

  return (
    <div className="lg:hidden animate-fade-up mb-4">
      <GlassCard variant="dark" className="p-3 rounded-xl border border-border">
        <div className="flex items-center gap-3">
          {/* Filename */}
          <div className="flex items-center gap-2 flex-shrink-0 max-w-[40%] min-w-0">
            <Music size={16} style={{ color: 'var(--color-primary)' }} aria-hidden="true" />
            <span
              className="text-sm font-medium truncate"
              style={{ color: 'var(--color-text-primary)' }}
              title={fileName}
            >
              {fileName}
            </span>
          </div>

          {/* Player */}
          <AudioPlayer file={file} className="flex-1 min-w-0" />
        </div>
      </GlassCard>
    </div>
  );
}
