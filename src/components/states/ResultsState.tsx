import React, { useState, useMemo } from 'react';
import { Modal, ChatInterface, Snackbar, AILoadingOrb, Text } from '@/lib';
import { chatWithAI, generatePDF } from '../../utils/api';
import type { ProcessingResult, ChatMessage, AudioFile, AIConfiguration } from '../../types/audio';
import { ResultsLayout } from '../../features/results/components/ResultsLayout';
import { AudioPlayerBar } from '../../features/results/components/AudioPlayerBar';
import { SummaryPanel } from '../../features/results/components/SummaryPanel';
import { SearchableTranscript } from '../../features/results/components/SearchableTranscript';
import { FloatingChatButton } from '../../features/results/components/FloatingChatButton';
import { AppHeader } from '../layout/AppHeader';
import { useAudioPlayer } from '../../features/results/hooks/useAudioPlayer';
import { parseTranscriptToSegments } from '../../features/results/utils/transcriptParser';

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
  onBack: () => void;
  onUpdateResult: (result: ProcessingResult) => void;
}

export const ResultsState: React.FC<ResultsStateProps> = ({
  audioName,
  audioFile,
  result,
  onUpdateResult,
}) => {
  const [isLoadingChat, setIsLoadingChat] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [pdfSuccess, setPdfSuccess] = useState(false);
  // Initialize fileName without extension
  const [fileName, setFileName] = useState(() => audioName.replace(/\.[^/.]+$/, ''));

  // Audio player state (shared between AudioPlayerBar and SearchableTranscript)
  const audioPlayer = useAudioPlayer(audioFile);

  // Parse transcript into segments (memoized)
  const transcriptSegments = useMemo(
    () => parseTranscriptToSegments(result.transcript),
    [result.transcript]
  );

  // Find active segment based on current audio time
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

  const handleSendMessage = async (message: string) => {
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
        result.configuration.model
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

  const handleDownloadPDF = async () => {
    console.log('📥 Starting PDF generation...');

    setIsPdfGenerating(true);
    setPdfError(null);
    setPdfSuccess(false);

    try {
      // Prepare AI configuration metadata (optional)
      const aiConfig = {
        provider: result.configuration.provider,
        model: result.configuration.model,
        transcriptionModel: 'whisper-1',
      };

      const pdfBlob = await generatePDF(
        result.transcript,
        result.summary,
        result.configuration.contentType,
        fileName,
        aiConfig
      );

      // Create download link
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${fileName}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      // Small timeout to ensure download started before revoking
      setTimeout(() => URL.revokeObjectURL(url), 100);

      console.log('✅ PDF downloaded successfully');
      setPdfSuccess(true);

      // Auto-dismiss success message after 3 seconds
      setTimeout(() => setPdfSuccess(false), 3000);
    } catch (error) {
      console.error('❌ PDF generation error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setPdfError(`Failed to generate PDF: ${errorMessage}`);
    } finally {
      setIsPdfGenerating(false);
    }
  };

  return (
    <>
      <ResultsLayout
        header={
          <AppHeader
            fileName={fileName}
            onFileNameChange={setFileName}
            onExport={handleDownloadPDF}
          />
        }
        audioPlayer={<AudioPlayerBar audioFile={audioFile} audioPlayer={audioPlayer} />}
        summaryPanel={<SummaryPanel summary={result.summary} />}
        transcriptPanel={
          <SearchableTranscript
            transcript={result.transcript}
            activeSegmentId={activeSegmentId}
            onTimestampClick={handleTimestampClick}
          />
        }
        floatingChatButton={
          <FloatingChatButton
            onClick={() => setIsChatOpen(true)}
            isOpen={isChatOpen}
            hasNewMessages={false}
          />
        }
        chatModal={
          isChatOpen && (
            <Modal
              isOpen={isChatOpen}
              onClose={() => setIsChatOpen(false)}
              title="Refine with Chat"
            >
              <div className="h-[600px]">
                <ChatInterface
                  onSendMessage={handleSendMessage}
                  isLoading={isLoadingChat}
                  chatHistory={result.chatHistory}
                />
              </div>
            </Modal>
          )
        }
      />

      {/* PDF Generation Loading Modal */}
      <Modal
        isOpen={isPdfGenerating}
        onClose={() => {}}
        title="Generating PDF"
        disableBackdropClick={true}
      >
        <div className="flex flex-col items-center justify-center py-8 gap-6">
          <AILoadingOrb size={120} />
          <Text variant="body" className="text-center text-text-secondary">
            Creating your professional PDF document...
          </Text>
        </div>
      </Modal>

      {/* Success Snackbar */}
      <Snackbar
        isOpen={pdfSuccess}
        onClose={() => setPdfSuccess(false)}
        message="PDF downloaded successfully!"
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
