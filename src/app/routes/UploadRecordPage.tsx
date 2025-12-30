import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { LanguageCode } from '../../types/languages';
import type { ContentType } from '../../types/content-types';
import type { ProcessingMode } from '../../features/configuration/components/ProcessingModeSelector';
import { SlidersHorizontal } from 'lucide-react';
import { Heading } from '../../components/ui/Heading';
import { Text } from '../../components/ui/Text';
import { GlassCard } from '../../components/ui/GlassCard';
import { AppHeader } from '../../components/layout/AppHeader';
import { UploadPanel } from '../../features/upload/components/UploadPanel';
import { RecordPanel } from '../../features/upload/components/RecordPanel';
import { ContextUploadArea } from '../../features/upload/components/ContextUploadArea';
import { LanguageSelector } from '../../features/configuration/components/LanguageSelector';
import { ContentTypeSelector } from '../../features/configuration/components/ContentTypeSelector';
import { ProcessingModeSelector } from '../../features/configuration/components/ProcessingModeSelector';
import { ProcessAudioButton } from '../../features/upload/components/ProcessAudioButton';
import { generateSessionId, saveSession } from '../../utils/session-manager';
import { buildRoutePath, ROUTES } from '../../types/routing';

export function UploadRecordPage() {
  const navigate = useNavigate();
  const [audioFile] = useState<File | Blob | null>(null);
  const [contextFiles, setContextFiles] = useState<File[]>([]);
  const [language, setLanguage] = useState<LanguageCode>('en');
  const [contentType, setContentType] = useState<ContentType>('meeting');
  const [processingMode, setProcessingMode] = useState<ProcessingMode>('balanced');

  const handleFileUpload = async (file: File) => {
    // Create new session
    const sessionId = generateSessionId();

    // Save session data
    saveSession(sessionId, {
      audioFile: {
        name: file.name,
        blob: file,
        file: file,
      },
      contextFiles,
      sessionId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Navigate to audio editing page
    const path = buildRoutePath(ROUTES.AUDIO, { sessionId });
    navigate(path);
  };

  const handleRecordingComplete = async (blob: Blob) => {
    // Create new session
    const sessionId = generateSessionId();

    // Save session data
    saveSession(sessionId, {
      audioFile: {
        name: 'recording.webm',
        blob: blob,
        file: new File([blob], 'recording.webm', { type: 'audio/webm' }),
      },
      contextFiles,
      sessionId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Navigate to audio editing page
    const path = buildRoutePath(ROUTES.AUDIO, { sessionId });
    navigate(path);
  };

  const handleProcessAudio = () => {
    if (!audioFile) return;

    // If user wants to skip audio editing and go directly to processing
    // This could navigate to a configuration or processing page
    // For now, we'll just show an alert
    alert('Process Audio clicked! This would navigate to processing.');
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)]">
      {/* Header */}
      <AppHeader />

      <main className="mx-auto px-6 py-6 max-w-[1400px]">
        {/* Page Title */}
        <div className="mb-8">
          <Heading level="h1">New Session</Heading>
          <Text variant="body" color="secondary">
            Configure your audio transcription settings
          </Text>
        </div>

        {/* Upload/Record Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <UploadPanel onFileUpload={handleFileUpload} />
          <RecordPanel onRecordingComplete={handleRecordingComplete} />
        </div>

        {/* Configuration Section (3-column grid) */}
        <GlassCard variant="light" className="p-6 mb-8">
          <div className="flex items-center gap-2 mb-6">
            <SlidersHorizontal 
              size={20} 
              className="text-gray-500" 
            />
            <Heading level="h3">Configuration</Heading>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Column 1: Context Upload */}
            <ContextUploadArea
              files={contextFiles}
              onFilesChange={setContextFiles}
            />

            {/* Column 2: Language + Content Type */}
            <div className="space-y-4">
              <LanguageSelector
                value={language}
                onChange={setLanguage}
              />
              <ContentTypeSelector
                value={contentType}
                onChange={setContentType}
              />
            </div>

            {/* Column 3: Processing Mode */}
            <ProcessingModeSelector
              value={processingMode}
              onChange={(val) => setProcessingMode(val as ProcessingMode)}
            />
          </div>
        </GlassCard>

        {/* Process Audio Button */}
        <ProcessAudioButton
          disabled={!audioFile}
          onProcess={handleProcessAudio}
        />
      </main>
    </div>
  );
}
