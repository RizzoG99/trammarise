import { useState, useCallback } from 'react';

export function useAudioPreview() {
  const [isPlaying, setIsPlaying] = useState(false);

  // This is a placeholder. In a real implementation we would fetch the blob from IndexedDB
  // and play the first 10-30 seconds.
  const playPreview = useCallback(() => {
    setIsPlaying(true);
    // Mock play
    setTimeout(() => {
      setIsPlaying(false);
    }, 3000);
  }, []);

  return { isPlaying, playPreview };
}
