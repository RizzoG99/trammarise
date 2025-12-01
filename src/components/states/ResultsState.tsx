import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { ActionButtons } from '../results/ActionButtons';
import { ChatInterface } from '../results/ChatInterface';
import { chatWithAI } from '../../utils/api';
import type { ProcessingResult, ChatMessage } from '../../types/audio';
import './ResultsState.css';

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
      const { response } = await chatWithAI(
        result.transcript,
        result.summary,
        message,
        result.chatHistory,
        result.configuration.provider,
        result.configuration.apiKey
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

  return (
    <div className="results-state">
      <header className="results-header">
        <button className="back-button" onClick={onBack} aria-label="Back to audio">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <h1 className="results-title">{audioName}</h1>
      </header>

      <div className="results-container">
        <div className="results-content">
          {/* Transcript Section */}
          <section className="result-section">
            <h2 className="section-title">
              <span className="section-icon">📝</span>
              Transcript
            </h2>
            <div className="transcript-box">
              <p className="transcript-text">{result.transcript}</p>
            </div>
            <ActionButtons text={result.transcript} />
          </section>

          {/* Summary Section */}
          <section className="result-section">
            <h2 className="section-title">
              <span className="section-icon">✨</span>
              AI Summary
            </h2>
            <div className="summary-box markdown-content">
              <ReactMarkdown>
                {result.summary}
              </ReactMarkdown>
            </div>
            <ActionButtons text={result.summary} />
          </section>

          {/* Chat History */}
          {result.chatHistory.length > 0 && (
            <section className="result-section">
              <h2 className="section-title">
                <span className="section-icon">💬</span>
                Conversation
              </h2>
              <div className="chat-history">
                {result.chatHistory.map((msg, index) => (
                  <div
                    key={index}
                    className={`chat-message ${msg.role === 'user' ? 'user-message' : 'assistant-message'}`}
                  >
                    <div className={`message-content ${msg.role === 'assistant' ? 'markdown-content' : ''}`}>
                      {msg.role === 'assistant' ? (
                        <ReactMarkdown>
                          {msg.content}
                        </ReactMarkdown>
                      ) : (
                        <p>{msg.content}</p>
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
