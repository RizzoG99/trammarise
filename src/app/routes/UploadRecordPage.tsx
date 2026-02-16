import { useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { ContentType } from '../../types/content-types';
import type { ProcessingMode } from '../../features/configuration/components/ProcessingModeSelector';
import { SlidersHorizontal } from 'lucide-react';
import { Heading, Text, GlassCard, SEO } from '@/lib';
import { PageLayout } from '../../components/layout/PageLayout';
import { UploadPanel } from '../../features/upload/components/UploadPanel';
import { RecordPanel, type RecordPanelRef } from '../../features/upload/components/RecordPanel';
import { ContextUploadArea } from '../../features/upload/components/ContextUploadArea';
import { EnhancedLanguageSelector } from '../../features/configuration/components/EnhancedLanguageSelector';
import { ContentTypeSelector } from '../../features/configuration/components/ContentTypeSelector';
import { ProcessingModeSelector } from '../../features/configuration/components/ProcessingModeSelector';
import { NoiseProfileSelector } from '../../features/configuration/components/NoiseProfileSelector';
import { SpeakerDiarizationToggle } from '../../features/configuration/components/SpeakerDiarizationToggle';
import type { NoiseProfile } from '../../types/noise-profiles';
import { ProcessAudioButton } from '../../features/upload/components/ProcessAudioButton';
import { generateSessionId, saveSession } from '../../utils/session-manager';
import { buildRoutePath, ROUTES } from '../../types/routing';
import { useSubscription } from '../../context/SubscriptionContext';

export function UploadRecordPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { subscription } = useSubscription();
  const recordPanelRef = useRef<RecordPanelRef>(null);
  const [audioFile, setAudioFile] = useState<File | Blob | null>(null);
  const [contextFiles, setContextFiles] = useState<File[]>([]);
  const [language, setLanguage] = useState<string>('auto');
  const [contentType, setContentType] = useState<ContentType>('meeting');
  const [processingMode, setProcessingMode] = useState<ProcessingMode>('balanced');
  const [noiseProfile, setNoiseProfile] = useState<NoiseProfile>('quiet');
  const [enableSpeakerDiarization, setEnableSpeakerDiarization] = useState<boolean>(false);
  const [speakersExpected, setSpeakersExpected] = useState<number | undefined>(undefined);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processingError, setProcessingError] = useState<string | null>(null);

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

    setProcessingError(null);
    setIsProcessing(true);

    try {
      // Create session ID
      const sessionId = generateSessionId();

      // Save complete session with ALL configuration
      // Pass subscription tier for hybrid storage strategy
      await saveSession(
        sessionId,
        {
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
          enableSpeakerDiarization, // Save speaker diarization config
          speakersExpected, // Save expected speaker count
          sessionId,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        subscription?.tier
      );

      // Navigate ONLY after successful save
      const path = buildRoutePath(ROUTES.AUDIO, { sessionId });
      navigate(path);
    } catch (error) {
      console.error('Failed to save session:', error);
      setProcessingError(t('home.processingError', 'Failed to save session. Please try again.'));
    } finally {
      setIsProcessing(false);
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
      <GlassCard variant="dark" className="p-6 mb-8 border rounded-xl shadow-glass">
        <div className="flex items-center gap-2 mb-6">
          <SlidersHorizontal size={20} className="text-gray-400" />
          <Heading level="h3">{t('nav.configure')}</Heading>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Column 1: Context Upload */}
          <ContextUploadArea files={contextFiles} onFilesChange={setContextFiles} />

          {/* Column 2: Language + Content Type */}
          <div className="space-y-4">
            <EnhancedLanguageSelector value={language} onChange={setLanguage} />
            <ContentTypeSelector value={contentType} onChange={setContentType} />
            <NoiseProfileSelector value={noiseProfile} onChange={setNoiseProfile} />
          </div>

          {/* Column 3: Processing Mode + Speaker Diarization */}
          <div className="space-y-4">
            <ProcessingModeSelector
              value={processingMode}
              onChange={(val) => setProcessingMode(val)}
            />
            <SpeakerDiarizationToggle
              enabled={enableSpeakerDiarization}
              speakersExpected={speakersExpected}
              onEnabledChange={setEnableSpeakerDiarization}
              onSpeakersExpectedChange={setSpeakersExpected}
            />
          </div>
        </div>
      </GlassCard>

      {/* Error Display */}
      {processingError && (
        <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30">
          <Text className="text-red-600 dark:text-red-400 text-sm">{processingError}</Text>
        </div>
      )}

      {/* Process Audio Button */}
      <ProcessAudioButton
        disabled={!audioFile || isProcessing}
        onProcess={handleProcessAudio}
        isLoading={isProcessing}
      />
    </PageLayout>
  );
}
