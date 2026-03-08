import { MessageSquare } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export interface FloatingChatButtonProps {
  onClick: () => void;
  hasNewMessages?: boolean;
  isOpen?: boolean;
}

export function FloatingChatButton({
  onClick,
  hasNewMessages = false,
  isOpen = false,
}: FloatingChatButtonProps) {
  const { t } = useTranslation();
  // Hide button when chat is open
  if (isOpen) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="relative group">
        <button
          onClick={onClick}
          className="
            relative flex items-center gap-2
            px-4 py-2.5 rounded-xl
            bg-primary text-white text-sm font-medium
            shadow-lg shadow-primary/20
            hover:bg-primary-hover hover:shadow-xl hover:shadow-primary/30
            transition-all duration-200
            border border-white/10
            cursor-pointer
          "
        >
          <MessageSquare className="w-4 h-4" />
          <span>{t('results.chat.floatingButtonTooltip')}</span>

          {hasNewMessages && (
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-accent-error rounded-full" />
          )}
        </button>
      </div>
    </div>
  );
}
