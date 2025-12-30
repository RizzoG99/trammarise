import { MessageSquare } from 'lucide-react';

export interface FloatingChatButtonProps {
  onClick: () => void;
  hasNewMessages?: boolean;
}

export function FloatingChatButton({ onClick, hasNewMessages = false }: FloatingChatButtonProps) {
  return (
    <div className="fixed bottom-6 right-6 z-30">
      <button
        onClick={onClick}
        className="
          relative
          p-4 rounded-full
          bg-primary text-white
          shadow-lg shadow-primary/30
          hover:shadow-xl hover:shadow-primary/40
          hover:scale-110
          transition-all duration-[var(--transition-normal)]
          group
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
