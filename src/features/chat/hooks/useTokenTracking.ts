import { useState, useCallback } from 'react';

const DEFAULT_TOKEN_LIMIT = 500;

export function useTokenTracking(limit: number = DEFAULT_TOKEN_LIMIT) {
  const [tokenUsage, setTokenUsage] = useState(0);

  const addTokens = useCallback((tokens: number) => {
    setTokenUsage(prev => Math.min(prev + tokens, limit));
  }, [limit]);

  const estimateMessageTokens = useCallback((message: string): number => {
    // Simple estimation: ~4 characters per token
    return Math.ceil(message.length / 4);
  }, []);

  const addMessage = useCallback((message: string) => {
    const tokens = estimateMessageTokens(message);
    addTokens(tokens);
  }, [estimateMessageTokens, addTokens]);

  const resetTokens = useCallback(() => {
    setTokenUsage(0);
  }, []);

  const isNearLimit = tokenUsage > limit * 0.8;
  const isAtLimit = tokenUsage >= limit;
  const percentage = Math.min((tokenUsage / limit) * 100, 100);

  return {
    tokenUsage,
    tokenLimit: limit,
    percentage,
    isNearLimit,
    isAtLimit,
    addTokens,
    addMessage,
    resetTokens,
    estimateMessageTokens,
  };
}
