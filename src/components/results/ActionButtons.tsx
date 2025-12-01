import React, { useState } from 'react';
import { useSpeechSynthesis } from '../../hooks/useSpeechSynthesis';
import { copyToClipboard } from '../../utils/api';
import './ActionButtons.css';

interface ActionButtonsProps {
  text: string;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({ text }) => {
  const { speak, stop, isSpeaking } = useSpeechSynthesis();
  const [copied, setCopied] = useState(false);

  const handleReadAloud = () => {
    if (isSpeaking) {
      stop();
    } else {
      speak(text);
    }
  };

  const handleCopy = async () => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="action-buttons">
      <button
        className="action-btn"
        onClick={handleReadAloud}
        aria-label={isSpeaking ? 'Stop reading' : 'Read aloud'}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          {isSpeaking ? (
            <path d="M11 5L6 9H2v6h4l5 4V5zM15.54 8.46a5 5 0 010 7.07M19.07 4.93a10 10 0 010 14.14" />
          ) : (
            <path d="M11 5L6 9H2v6h4l5 4V5z" />
          )}
        </svg>
        {isSpeaking ? 'Stop' : 'Read Aloud'}
      </button>

      <button
        className="action-btn"
        onClick={handleCopy}
        aria-label="Copy to clipboard"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          {copied ? (
            <path d="M20 6L9 17l-5-5" />
          ) : (
            <path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2M9 2h6a1 1 0 011 1v2a1 1 0 01-1 1H9a1 1 0 01-1-1V3a1 1 0 011-1z" />
          )}
        </svg>
        {copied ? 'Copied!' : 'Copy'}
      </button>
    </div>
  );
};
