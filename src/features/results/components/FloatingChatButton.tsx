import { MessageSquare } from 'lucide-react';

export interface FloatingChatButtonProps {
  onClick: () => void;
  hasNewMessages?: boolean;
  isOpen?: boolean;
}

export function FloatingChatButton({ onClick, hasNewMessages = false, isOpen = false }: FloatingChatButtonProps) {
  // Hide button when chat is open
  if (isOpen) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <button
        onClick={onClick}
        className="
          relative
          p-4 rounded-full
          bg-[var(--color-primary)] text-white
          shadow-2xl shadow-black/50
          hover:shadow-2xl hover:shadow-primary/60
          hover:scale-110
          transition-all duration-[var(--transition-normal)]
          group
          border-2 border-white/20
        "
      >
        <MessageSquare className="w-6 h-6" />

        {/* Badge for new messages */}
        {hasNewMessages && (
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-accent-error rounded-full animate-pulse" />
        )}

        {/* Tooltip */}
        <span className="
          absolute bottom-full right-0 mb-2
          px-3 py-1 rounded-lg
          bg-[var(--color-bg-secondary)] border border-border
          text-sm text-text-primary whitespace-nowrap
          opacity-0 group-hover:opacity-100
          transition-opacity duration-[var(--transition-fast)]
          pointer-events-none
        ">
          Refine with Chat
        </span>
      </button>
    </div>
  );
}
