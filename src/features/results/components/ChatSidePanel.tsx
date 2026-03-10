import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ChatInterface } from '@/lib';
import type { ChatMessage } from '../../../types/audio';

export interface ChatSidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  isLoading: boolean;
  chatHistory: ChatMessage[];
  onSendMessage: (message: string) => Promise<void>;
}

export function ChatSidePanel({
  isOpen,
  onClose,
  isLoading,
  chatHistory,
  onSendMessage,
}: ChatSidePanelProps) {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <>
      {/* Mobile Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50 lg:hidden transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        className={`
          fixed inset-x-0 bottom-0 z-50 h-[80vh] w-full rounded-t-2xl
          lg:static lg:h-[calc(100vh-[var(--header-height)]-80px)] lg:w-full lg:rounded-xl lg:z-auto
          bg-bg-primary overflow-hidden shadow-2xl lg:shadow-glass lg:border lg:border-border-subtle
          flex flex-col transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-y-0 lg:translate-x-0 lg:translate-y-0' : 'translate-y-full lg:translate-x-full lg:hidden'}
        `}
        role="dialog"
        aria-label={t('chatModal.title', 'Refine with AI')}
      >
        {/* Header (with mobile drag handle hint) */}
        <div className="flex flex-col border-b border-border bg-bg-secondary/50">
          <div className="w-12 h-1.5 bg-border rounded-full mx-auto mt-3 mb-1 lg:hidden" />
          <div className="flex items-center justify-between px-4 pb-3 lg:py-4">
            <h2 className="text-lg font-semibold text-text-primary">
              {t('chatModal.title', 'Refine with AI')}
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-text-muted hover:text-text-primary rounded-lg hover:bg-bg-tertiary transition-colors"
              aria-label={t('common.close', 'Close')}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden min-h-[400px]">
          <ChatInterface
            onSendMessage={onSendMessage}
            isLoading={isLoading}
            chatHistory={chatHistory}
          />
        </div>
      </div>
    </>
  );
}
