import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2, Send } from 'lucide-react';
import type { ChatMessage } from '../../../../types/audio';

interface ChatInterfaceProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  chatHistory: ChatMessage[];
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  onSendMessage,
  isLoading,
  chatHistory,
}) => {
  const { t } = useTranslation();
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const examplePrompts = [
    t('chat.examplePrompts.shorter'),
    t('chat.examplePrompts.actionItems'),
    t('chat.examplePrompts.translate'),
  ];

  const handleExampleClick = (prompt: string) => {
    if (!isLoading) {
      onSendMessage(prompt);
    }
  };

  return (
    <div className="sticky bottom-0 bg-bg-surface border-t border-border-glass p-6 backdrop-blur-md">
      {chatHistory.length === 0 && (
        <div className="mb-4">
          <p className="text-sm text-text-secondary mb-3">{t('chat.tryAsking')}</p>
          {examplePrompts.map((prompt, index) => (
            <button
              key={index}
              className="inline-block mr-2 mb-2 px-4 py-2 bg-white/10 border border-border-glass rounded-full text-text-primary text-sm cursor-pointer transition-all hover:bg-white/15 hover:border-primary-light/30 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => handleExampleClick(prompt)}
              disabled={isLoading}
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex gap-3 items-center">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={t('chat.placeholder')}
          className="flex-1 px-4 py-3 border-2 border-border-glass rounded-xl text-[0.9375rem] bg-black/20 text-text-primary transition-colors focus:outline-none focus:border-primary disabled:bg-white/5 disabled:cursor-not-allowed"
          disabled={isLoading}
        />
        <button
          type="submit"
          className="w-11 h-11 flex items-center justify-center bg-primary border-none rounded-xl text-white cursor-pointer transition-all hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!message.trim() || isLoading}
          aria-label={t('chat.sendButton')}
        >
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
        </button>
      </form>
    </div>
  );
};
