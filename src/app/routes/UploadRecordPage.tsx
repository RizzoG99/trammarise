import { useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { LanguageCode } from '../../types/languages';
import type { ContentType } from '../../types/content-types';
import type { ProcessingMode } from '../../features/configuration/components/ProcessingModeSelector';
import { SlidersHorizontal } from 'lucide-react';
import { Heading, Text, GlassCard, SEO } from '@/lib';
import { PageLayout } from '../../components/layout/PageLayout';
import { UploadPanel } from '../../features/upload/components/UploadPanel';
import { RecordPanel, type RecordPanelRef } from '../../features/upload/components/RecordPanel';
import { ContextUploadArea } from '../../features/upload/components/ContextUploadArea';
import { LanguageSelector } from '../../features/configuration/components/LanguageSelector';
import { ContentTypeSelector } from '../../features/configuration/components/ContentTypeSelector';
import { ProcessingModeSelector } from '../../features/configuration/components/ProcessingModeSelector';
import { NoiseProfileSelector } from '../../features/configuration/components/NoiseProfileSelector';
import type { NoiseProfile } from '../../types/noise-profiles';
import { ProcessAudioButton } from '../../features/upload/components/ProcessAudioButton';
import { generateSessionId, saveSession } from '../../utils/session-manager';
import { buildRoutePath, ROUTES } from '../../types/routing';

export function UploadRecordPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const recordPanelRef = useRef<RecordPanelRef>(null);
  const [audioFile, setAudioFile] = useState<File | Blob | null>(null);
  const [contextFiles, setContextFiles] = useState<File[]>([]);
  const [language, setLanguage] = useState<LanguageCode>('en');
  const [contentType, setContentType] = useState<ContentType>('meeting');
  const [processingMode, setProcessingMode] = useState<ProcessingMode>('balanced');
  const [noiseProfile, setNoiseProfile] = useState<NoiseProfile>('quiet');

  const handleFileUpload = async (file: File) => {
    // Stop any active recording when uploading a file
    recordPanelRef.current?.reset();

    // Only update state - DO NOT navigate
    setAudioFile(file);
  };

  const handleRecordingComplete = useCallback(async (blob: Blob) => {
    // Convert to File for consistency, using the blob's actual type
    // (Safari uses audio/mp4, others use audio/webm)
    const fileExtension = blob.type.split('/')[1] || 'webm';
    const recordingFile = new File([blob], `recording.${fileExtension}`, { type: blob.type });

    // Only update state - DO NOT navigate
    setAudioFile(recordingFile);
  }, []);

  const handleFileRemove = () => {
    setAudioFile(null);
    // Reset the recording panel when file is removed
    recordPanelRef.current?.reset();
  };

  const handleRecordingStart = () => {
    // Clear any uploaded file when recording starts
    setAudioFile(null);
  };

  const handleProcessAudio = async () => {
    if (!audioFile) {
      console.warn('No audio file available');
      return;
    }

    // Create session ID
    const sessionId = generateSessionId();

    try {
      // Save complete session with ALL configuration
      await saveSession(sessionId, {
        audioFile: {
          name: audioFile instanceof File ? audioFile.name : 'recording.webm',
          blob: audioFile,
          file:
            audioFile instanceof File
              ? audioFile
              : new File([audioFile], 'recording.webm', { type: 'audio/webm' }),
        },
        contextFiles,
        language, // Save user configuration
        contentType, // Save user configuration
        processingMode, // Save user configuration
        noiseProfile, // Save noise profile
        sessionId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      // Navigate ONLY after successful save
      const path = buildRoutePath(ROUTES.AUDIO, { sessionId });
      navigate(path);
    } catch (error) {
      console.error('Failed to save session:', error);
      // TODO: Show error toast/notification to user
    }
  };

  return (
    <PageLayout>
      <SEO
        title="Trammarise - AI Audio Transcription & Summarization"
        description="Transform your audio recordings into accurate transcripts and intelligent summaries. Upload or record audio, get AI-powered transcription with OpenAI Whisper, and generate comprehensive summaries."
        canonical="https://trammarise.app/"
      />
      {/* Page Title */}
      <div className="mb-8">
        <Heading level="h1">{t('home.title')}</Heading>
        <Text variant="body" color="secondary">
          {t('home.subtitle')}
        </Text>
      </div>

      {/* Upload/Record Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <UploadPanel
          onFileUpload={handleFileUpload}
          uploadedFile={audioFile}
          onFileRemove={handleFileRemove}
        />
        <RecordPanel
          ref={recordPanelRef}
          onRecordingComplete={handleRecordingComplete}
          onRecordingStart={handleRecordingStart}
        />
      </div>

      {/* Configuration Section (3-column grid) */}
      <GlassCard
        variant="light"
        className="p-6 mb-8 border rounded-xl shadow-lg"
        style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}
      >
        <div className="flex items-center gap-2 mb-6">
          <SlidersHorizontal size={20} className="text-gray-500" />
          <Heading level="h3">{t('nav.configure')}</Heading>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Column 1: Context Upload */}
          <ContextUploadArea files={contextFiles} onFilesChange={setContextFiles} />

          {/* Column 2: Language + Content Type */}
          <div className="space-y-4">
            <LanguageSelector value={language} onChange={setLanguage} />
            <ContentTypeSelector value={contentType} onChange={setContentType} />
            <NoiseProfileSelector value={noiseProfile} onChange={setNoiseProfile} />
          </div>

          {/* Column 3: Processing Mode + Noise Profile */}
          <div className="space-y-4">
            <ProcessingModeSelector
              value={processingMode}
              onChange={(val) => setProcessingMode(val)}
            />
          </div>
        </div>
      </GlassCard>

      {/* Process Audio Button */}
      <ProcessAudioButton disabled={!audioFile} onProcess={handleProcessAudio} />
    </PageLayout>
  );
}
