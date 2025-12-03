import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { ActionButtons } from '../results/ActionButtons';
import { ChatInterface } from '../results/ChatInterface';
import { Button } from '../ui/Button';
import { chatWithAI } from '../../utils/api';
import type { ProcessingResult, ChatMessage } from '../../types/audio';

interface ResultsStateProps {
  audioName: string;
  result: ProcessingResult;
  onBack: () => void;
  onUpdateResult: (result: ProcessingResult) => void;
}

export const ResultsState: React.FC<ResultsStateProps> = ({
  audioName,
  result,
  onBack,
  onUpdateResult,
}) => {
  const [isLoadingChat, setIsLoadingChat] = useState(false);

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
      // Call chat API with configuration
      const apiKey = result.configuration.mode === 'simple' 
        ? result.configuration.openaiKey 
        : result.configuration.openrouterKey!;
      
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
    } catch (error: any) {
      console.error('Chat error:', error);
      // Add error message to chat
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
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
    const { generatePDF } = await import('../../utils/pdf-generator');
    generatePDF(result.summary, result.transcript, result.configuration);
  };

  return (
    <div className="flex flex-col h-screen bg-transparent">
      <div className="bg-bg-surface border-b border-border-glass px-6 py-4 flex items-center gap-4 backdrop-blur-md">
        <div className="flex items-center gap-4 flex-1">
          <Button variant="outline" onClick={onBack} className="px-4 py-2 text-sm">
            ← Back
          </Button>
          <div className="flex flex-col">
            <h2 className="m-0 text-xl font-semibold text-text-primary">Summary & Chat</h2>
            <span className="text-xs text-text-secondary">{audioName}</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={handleDownloadPDF}>
            📄 Download PDF
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-8">
        <div className="max-w-[800px] mx-auto px-6 py-8">
          {/* Transcript Section */}
          <section className="bg-bg-surface border border-border-glass rounded-xl p-6 mb-6 backdrop-blur-md">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-text-primary mb-4">
              <span className="text-xl">📝</span>
              Transcript
            </h2>
            <div className="bg-black/20 border border-border-glass rounded-lg p-5 mb-4">
              <p className="font-mono text-[0.9375rem] leading-relaxed text-text-secondary m-0 whitespace-pre-wrap">{result.transcript}</p>
            </div>
            <ActionButtons text={result.transcript} />
          </section>

          {/* Summary Section */}
          <section className="bg-bg-surface border border-border-glass rounded-xl p-6 mb-6 backdrop-blur-md">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-text-primary mb-4">
              <span className="text-xl">✨</span>
              AI Summary
            </h2>
            <div className="bg-black/20 border border-border-glass rounded-lg p-5 mb-4 text-[0.9375rem] leading-relaxed text-text-secondary prose prose-invert max-w-none prose-p:my-3 prose-p:first:mt-0 prose-p:last:mb-0 prose-headings:text-text-primary prose-headings:font-semibold prose-h2:text-lg prose-h2:mt-6 prose-h2:mb-3 prose-h2:first:mt-0 prose-ul:my-3 prose-ul:pl-6 prose-li:my-2">
              <ReactMarkdown>
                {result.summary}
              </ReactMarkdown>
            </div>
            <ActionButtons text={result.summary} />
          </section>

          {/* Chat History */}
          {result.chatHistory.length > 0 && (
            <section className="bg-bg-surface border border-border-glass rounded-xl p-6 mb-6 backdrop-blur-md">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-text-primary mb-4">
                <span className="text-xl">💬</span>
                Conversation
              </h2>
              <div className="flex flex-col gap-4">
                {result.chatHistory.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[80%] px-[1.125rem] py-[0.875rem] rounded-xl ${
                      msg.role === 'user' 
                        ? 'bg-primary text-white' 
                        : 'bg-white/10 text-text-primary border border-border-glass prose prose-invert max-w-none prose-p:my-0 prose-p:text-text-primary'
                    }`}>
                      {msg.role === 'assistant' ? (
                        <ReactMarkdown>
                          {msg.content}
                        </ReactMarkdown>
                      ) : (
                        <p className="m-0 text-white">{msg.content}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>

      <ChatInterface
        onSendMessage={handleSendMessage}
        isLoading={isLoadingChat}
        chatHistory={result.chatHistory}
      />
    </div>
  );
};
