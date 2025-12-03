import React, { useState } from 'react';
import type { ChatMessage } from '../../types/audio';

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
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const examplePrompts = [
    'Make this summary shorter',
    'What are the main action items?',
    'Translate to Spanish',
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
          <p className="text-sm text-text-secondary mb-3">Try asking:</p>
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
          placeholder="Ask AI to refine or explain..."
          className="flex-1 px-4 py-3 border-2 border-border-glass rounded-xl text-[0.9375rem] bg-black/20 text-text-primary transition-colors focus:outline-none focus:border-primary disabled:bg-white/5 disabled:cursor-not-allowed"
          disabled={isLoading}
        />
        <button
          type="submit"
          className="w-11 h-11 flex items-center justify-center bg-primary border-none rounded-xl text-white cursor-pointer transition-all hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!message.trim() || isLoading}
          aria-label="Send message"
        >
          {isLoading ? (
            <svg className="animate-spin" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity="0.25" />
              <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" opacity="0.75" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
              <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
            </svg>
          )}
        </button>
      </form>
    </div>
  );
};
