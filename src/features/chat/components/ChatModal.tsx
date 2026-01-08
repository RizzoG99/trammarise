import { useState, useRef, useEffect } from 'react';
import { X, Send, Loader2 } from 'lucide-react';
import { GlassCard, Heading, Text } from '@/lib';
import { Button } from '../../../components/ui/Button';
import { TokenUsageMeter } from './TokenUsageMeter';
import { SuggestionChips } from './SuggestionChips';
import { useTokenTracking } from '../hooks/useTokenTracking';
import type { ChatMessage } from '../../../types/audio';

export interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendMessage: (message: string) => Promise<void>;
  messages: ChatMessage[];
  isLoading?: boolean;
}

export function ChatModal({ isOpen, onClose, onSendMessage, messages, isLoading = false }: ChatModalProps) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { tokenUsage, tokenLimit, percentage, isNearLimit, addMessage, isAtLimit } = useTokenTracking();

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading || isAtLimit) return;

    const message = input.trim();
    setInput('');
    addMessage(message);

    try {
      await onSendMessage(message);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <GlassCard variant="light" className="w-full max-w-2xl max-h-[80vh] flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-border flex items-center justify-between">
            <Heading level="h3">Refine with AI</Heading>
            <button
              onClick={onClose}
              className="p-2 hover:bg-[var(--color-bg-surface-hover)] rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Token Usage Meter */}
          <TokenUsageMeter
            tokenUsage={tokenUsage}
            tokenLimit={tokenLimit}
            percentage={percentage}
            isNearLimit={isNearLimit}
          />

          {/* Suggestion Chips */}
          {messages.length === 0 && (
            <SuggestionChips
              onSuggestionClick={handleSuggestionClick}
              disabled={isAtLimit}
            />
          )}

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-8">
                <Text variant="body" color="tertiary">
                  Ask me anything about your transcript or summary
                </Text>
              </div>
            ) : (
              messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`
                      max-w-[80%] p-3 rounded-lg
                      ${msg.role === 'user'
                        ? 'bg-primary text-white'
                        : 'bg-[var(--color-bg-surface)] border border-border text-text-primary'
                      }
                    `}
                  >
                    <Text variant="body" as="div" className={msg.role === 'user' ? 'text-white' : ''}>
                      {msg.content}
                    </Text>
                  </div>
                </div>
              ))
            )}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-[var(--color-bg-surface)] border border-border p-3 rounded-lg">
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-border">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={isAtLimit ? 'Token limit reached' : 'Type your message...'}
                disabled={isLoading || isAtLimit}
                className="
                  flex-1 px-4 py-2 rounded-lg
                  bg-[var(--color-bg-surface)] border border-border
                  text-text-primary placeholder:text-text-tertiary
                  focus:outline-none focus:border-primary
                  disabled:opacity-50 disabled:cursor-not-allowed
                "
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isLoading || isAtLimit}
                variant="primary"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </Button>
            </div>

            <Text variant="small" color="tertiary" className="mt-2 text-center">
              AI can make mistakes. Verify important information.
            </Text>
          </div>
        </GlassCard>
      </div>
    </>
  );
}
