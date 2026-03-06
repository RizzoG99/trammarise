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
import { UploadRecordTabs } from '../../features/upload/components/UploadRecordTabs';
import { ContextUploadArea } from '../../features/upload/components/ContextUploadArea';
import { EnhancedLanguageSelector } from '../../features/configuration/components/EnhancedLanguageSelector';
import { ContentTypeSelector } from '../../features/configuration/components/ContentTypeSelector';
import { ProcessingModeSelector } from '../../features/configuration/components/ProcessingModeSelector';
import { NoiseProfileSelector } from '../../features/configuration/components/NoiseProfileSelector';
import { SpeakerDiarizationToggle } from '../../features/configuration/components/SpeakerDiarizationToggle';
import type { NoiseProfile } from '../../types/noise-profiles';
import { ProcessAudioButton } from '../../features/upload/components/ProcessAudioButton';
import { AudioPreviewBar } from '../../features/upload/components/AudioPreviewBar';
import { ApiKeySetupBanner } from '../../features/onboarding/ApiKeySetupBanner';
import { UpgradeModal } from '../../components/marketing/UpgradeModal';
import { generateSessionId, saveSession } from '../../utils/session-manager';
import { buildRoutePath, ROUTES } from '../../types/routing';
import { useSubscription } from '../../context/SubscriptionContext';
import { useFeatureGate } from '../../hooks/useFeatureGate';

export function UploadRecordPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { subscription } = useSubscription();
  const { hasAccess: isSpeakerIdPro } = useFeatureGate('speaker-diarization');
  const [showSpeakerUpgradeModal, setShowSpeakerUpgradeModal] = useState(false);
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

      // Navigate ONLY after successful save — skip audio editing, go straight to processing
      const path = buildRoutePath(ROUTES.PROCESSING, { sessionId });
      navigate(path);
    } catch (error) {
      console.error('Failed to save session:', error);
      setProcessingError(t('home.processingError', 'Failed to save session. Please try again.'));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTrimFirst = async () => {
    if (!audioFile) return;

    setProcessingError(null);
    setIsProcessing(true);

    try {
      const sessionId = generateSessionId();
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
          language,
          contentType,
          processingMode,
          noiseProfile,
          enableSpeakerDiarization,
          speakersExpected,
          sessionId,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        subscription?.tier
      );
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
      <ApiKeySetupBanner />

      {/* Page Title */}
      <div className="mb-8 animate-fade-up">
        <Heading level="hero">{t('home.title')}</Heading>
        <Text
          variant="body"
          color="secondary"
          className="font-light mt-1 animate-fade-up [animation-delay:80ms]"
        >
          {t('home.subtitle')}
        </Text>
      </div>

      {/* Mobile audio preview — shown above tabs when audio is ready */}
      {audioFile && <AudioPreviewBar file={audioFile} />}

      {/* Upload/Record Tabs (Mobile) & Split Grid (Desktop) */}
      <div className="mb-8">
        <UploadRecordTabs
          uploadPanel={
            <UploadPanel
              onFileUpload={handleFileUpload}
              uploadedFile={audioFile}
              onFileRemove={handleFileRemove}
            />
          }
          recordPanel={
            <RecordPanel
              ref={recordPanelRef}
              onRecordingComplete={handleRecordingComplete}
              onRecordingStart={handleRecordingStart}
            />
          }
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
              isProUser={isSpeakerIdPro}
              onUpgradeClick={() => setShowSpeakerUpgradeModal(true)}
            />
          </div>
        </div>

        {/* Error Display */}
        {processingError && (
          <div className="mt-6 p-3 rounded-lg bg-red-500/10 border border-red-500/30">
            <Text className="text-red-600 dark:text-red-400 text-sm">{processingError}</Text>
          </div>
        )}
      </GlassCard>

      {/* Process Audio Button — elevated, full-width, outside config card */}
      <div className="mb-8 flex flex-col gap-3">
        <ProcessAudioButton
          disabled={!audioFile || isProcessing}
          onProcess={handleProcessAudio}
          isLoading={isProcessing}
        />
        {audioFile && !isProcessing && (
          <button
            type="button"
            onClick={handleTrimFirst}
            className="text-sm cursor-pointer transition-colors duration-150 self-center"
            style={{ color: 'var(--color-text-tertiary)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--color-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--color-text-tertiary)';
            }}
          >
            {t('audioEditing.trimButtonLabel')} →
          </button>
        )}
      </div>

      <UpgradeModal
        isOpen={showSpeakerUpgradeModal}
        onClose={() => setShowSpeakerUpgradeModal(false)}
        trigger="speaker_diarization"
      />
    </PageLayout>
  );
}
