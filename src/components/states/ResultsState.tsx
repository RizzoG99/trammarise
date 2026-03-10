import React, { useState, useMemo, useCallback } from 'react';
import { Modal, Snackbar, AILoadingOrb, Text, AudioPlayer } from '@/lib';
import { chatWithAI } from '../../utils/api';
import { useTranslation } from 'react-i18next';

import type { ProcessingResult, ChatMessage, AudioFile, AIConfiguration } from '../../types/audio';
import { ResultsLayout } from '../../features/results/components/ResultsLayout';
import { SummaryPanel } from '../../features/results/components/SummaryPanel';
import { SearchableTranscript } from '../../features/results/components/SearchableTranscript';
import { SpeakerTranscriptView } from '../../features/results/components/SpeakerTranscriptView';
import {
  TranscriptTabBar,
  type TranscriptTab,
} from '../../features/results/components/TranscriptTabBar';
import { ChatSidePanel } from '../../features/results/components/ChatSidePanel';
import { FloatingChatButton } from '../../features/results/components/FloatingChatButton';
import {
  ExportPDFDialog,
  type ExportOptions,
} from '../../features/results/components/ExportPDFDialog';
import { useAudioPlayer } from '../../features/results/hooks/useAudioPlayer';
import {
  parseTranscriptToSegments,
  parseSegmentsToTranscript,
} from '../../features/results/utils/transcriptParser';

/**
 * Safely extracts API key from configuration.
 * Throws error if OpenRouter key is missing in advanced mode.
 */
function getApiKey(config: AIConfiguration): string {
  if (config.mode === 'simple') {
    return config.openaiKey;
  }

  if (!config.openrouterKey) {
    throw new Error('OpenRouter API key is required for advanced mode');
  }

  return config.openrouterKey;
}

interface ResultsStateProps {
  audioName: string;
  audioFile: AudioFile;
  result: ProcessingResult;
  language?: string; // Language code for multi-language support
  onBack: () => void;
  onUpdateResult: (result: ProcessingResult) => void;
}

import { useSubscription } from '../../context/SubscriptionContext';
import { UpgradeModal, type UpgradeTrigger } from '../../components/marketing/UpgradeModal';

export const ResultsState: React.FC<ResultsStateProps> = ({
  audioName,
  audioFile,
  result,
  language,
  onUpdateResult,
}) => {
  const { t } = useTranslation();
  const [isLoadingChat, setIsLoadingChat] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [pdfSuccess, setPdfSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<TranscriptTab>('transcript');

  // Upgrade Modal State
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [upgradeTrigger, setUpgradeTrigger] = useState<UpgradeTrigger>('generic');

  const { subscription } = useSubscription();
  const userTier = subscription?.tier || 'free';

  // Derive base file name from audio name (strip extension)
  const baseFileName = audioName.replace(/\.[^/.]+$/, '');

  // Audio player state (shared between AudioPlayerBar and SearchableTranscript)
  const audioPlayer = useAudioPlayer(audioFile);

  // Detect if diarization was used (check if utterances exist)
  const hasDiarization = result.utterances && result.utterances.length > 0;

  // Parse transcript into segments (memoized)
  // Prefer real segments from Whisper API when available, otherwise use mock parsing
  const transcriptSegments = useMemo(() => {
    if (result.segments && result.segments.length > 0) {
      // Use real Whisper API segments for accurate syncing
      return parseSegmentsToTranscript(result.segments, hasDiarization);
    }
    // Fallback to mock parsing when real segments unavailable
    return parseTranscriptToSegments(result.transcript, hasDiarization);
  }, [result.transcript, result.segments, hasDiarization]);

  // Find active segment based on audio playback time
  const activeSegmentId = useMemo(() => {
    const currentTime = audioPlayer.state.currentTime;
    const activeSegment = transcriptSegments.find((seg, index, arr) => {
      const nextTime = arr[index + 1]?.timestampSeconds ?? Infinity;
      return currentTime >= seg.timestampSeconds && currentTime < nextTime;
    });
    return activeSegment?.id;
  }, [audioPlayer.state.currentTime, transcriptSegments]);

  // Handle timestamp click to seek audio
  const handleTimestampClick = (timestampSeconds: number) => {
    audioPlayer.seek(timestampSeconds);
    // Auto-play if not already playing
    if (!audioPlayer.state.isPlaying) {
      audioPlayer.play();
    }
  };

  const handleChatOpen = () => {
    if (userTier === 'free') {
      setUpgradeTrigger('chat_gate');
      setIsUpgradeModalOpen(true);
      return;
    }
    setIsChatOpen(true);
  };

  const handleSendMessage = async (message: string) => {
    // Double check gating although UI should prevent it
    if (userTier === 'free') {
      setUpgradeTrigger('chat_gate');
      setIsUpgradeModalOpen(true);
      return;
    }

    setIsLoadingChat(true);

    // Add user message to chat history
    const userMessage: ChatMessage = { role: 'user', content: message };
    const updatedHistory = [...result.chatHistory, userMessage];

    onUpdateResult({
      ...result,
      chatHistory: updatedHistory,
    });

    try {
      // Call chat API with configuration (safe API key extraction)
      const apiKey = getApiKey(result.configuration);

      const { response } = await chatWithAI(
        result.transcript,
        result.summary,
        message,
        result.chatHistory,
        result.configuration.provider,
        apiKey,
        result.configuration.model,
        language
      );
      // Add assistant response to chat history
      const assistantMessage: ChatMessage = { role: 'assistant', content: response };
      onUpdateResult({
        ...result,
        chatHistory: [...updatedHistory, assistantMessage],
      });
    } catch (error) {
      console.error('Chat error:', error);
      // Add error message to chat with specific error details
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content:
          error instanceof Error
            ? error.message
            : 'Sorry, I encountered an error. Please try again.',
      };
      onUpdateResult({
        ...result,
        chatHistory: [...updatedHistory, errorMessage],
      });
    } finally {
      setIsLoadingChat(false);
    }
  };

  const handleDownloadPDF = useCallback(
    async (fileNameOverride?: string, options?: ExportOptions) => {
      setIsPdfGenerating(true);
      setPdfError(null);
      setPdfSuccess(false);

      try {
        // Use client-side PDF generation with @react-pdf/renderer
        // Dynamically import to reduce bundle size (1.6MB+)
        const { generatePDF } = await import('../../utils/pdf-generator');
        const effectiveFileName = fileNameOverride ?? baseFileName;
        await generatePDF(
          result.summary,
          result.transcript,
          result.configuration,
          effectiveFileName,
          userTier,
          options
        );

        setPdfSuccess(true);

        // Auto-dismiss success message after 3 seconds
        setTimeout(() => setPdfSuccess(false), 3000);

        // For free users, show upgrade modal to remove watermark
        if (userTier === 'free') {
          setTimeout(() => {
            setUpgradeTrigger('watermark_remove');
            setIsUpgradeModalOpen(true);
          }, 2000);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        setPdfError(
          t('pdfModal.error', 'Failed to generate PDF: {{message}}', { message: errorMessage })
        );
      } finally {
        setIsPdfGenerating(false);
      }
    },
    [result.summary, result.transcript, result.configuration, baseFileName, userTier, t]
  );

  const handleOpenExportDialog = useCallback(() => setIsExportDialogOpen(true), []);

  return (
    <>
      <ResultsLayout
        audioPlayer={
          <div className="w-full bg-bg-glass backdrop-blur-md border-b border-border shadow-[0_4px_24px_rgba(0,0,0,0.12)]">
            <div className="max-w-[1400px] mx-auto px-6 py-3">
              <AudioPlayer
                file={audioFile.blob}
                audioPlayer={audioPlayer}
                showSkipButtons
                showSpeedControl
                fileName={audioFile.name}
              />
            </div>
          </div>
        }
        summaryPanel={<SummaryPanel summary={result.summary} onExport={handleOpenExportDialog} />}
        transcriptPanel={
          <div className="flex flex-col h-full">
            {hasDiarization && (
              <TranscriptTabBar
                activeTab={activeTab}
                onTabChange={setActiveTab}
                hasDiarization={hasDiarization}
              />
            )}
            {activeTab === 'diarization' && result.utterances && result.utterances.length > 0 ? (
              <SpeakerTranscriptView
                utterances={result.utterances}
                currentTime={audioPlayer.state.currentTime}
                onTimestampClick={handleTimestampClick}
              />
            ) : (
              <SearchableTranscript
                transcript={result.transcript}
                activeSegmentId={activeSegmentId}
                onTimestampClick={handleTimestampClick}
                includeSpeakers={hasDiarization}
              />
            )}
          </div>
        }
        floatingChatButton={
          <FloatingChatButton onClick={handleChatOpen} isOpen={isChatOpen} hasNewMessages={false} />
        }
        isChatOpen={isChatOpen}
        chatPanel={
          <ChatSidePanel
            isOpen={isChatOpen}
            onClose={() => setIsChatOpen(false)}
            isLoading={isLoadingChat}
            chatHistory={result.chatHistory}
            onSendMessage={handleSendMessage}
          />
        }
      />

      {/* Export PDF Dialog */}
      <ExportPDFDialog
        isOpen={isExportDialogOpen}
        onClose={() => setIsExportDialogOpen(false)}
        initialFileName={baseFileName}
        onExport={(name, options) => {
          setIsExportDialogOpen(false);
          void handleDownloadPDF(name, options);
        }}
        isExporting={isPdfGenerating}
        summary={result.summary}
        transcript={result.transcript}
        config={result.configuration}
      />

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        trigger={upgradeTrigger}
      />

      {/* PDF Generation Loading Modal */}
      <Modal
        isOpen={isPdfGenerating}
        onClose={() => {}}
        title={t('pdfModal.generating', 'Generating PDF')}
        disableBackdropClick={true}
        role="status"
        aria-busy="true"
      >
        <div className="flex flex-col items-center justify-center py-8 gap-6">
          <AILoadingOrb size={120} />
          <Text variant="body" className="text-center text-text-secondary">
            {t('pdfModal.description', 'Creating your professional PDF document...')}
          </Text>
        </div>
      </Modal>

      {/* Success Snackbar */}
      <Snackbar
        isOpen={pdfSuccess}
        onClose={() => setPdfSuccess(false)}
        message={t('pdfModal.success', 'PDF downloaded successfully!')}
        variant="success"
        duration={3000}
      />

      {/* Error Snackbar */}
      <Snackbar
        isOpen={!!pdfError}
        onClose={() => setPdfError(null)}
        message={pdfError || ''}
        variant="error"
      />
    </>
  );
};
