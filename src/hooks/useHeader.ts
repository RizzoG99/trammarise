import { useContext, useEffect } from 'react';
import { HeaderContext } from '../context/HeaderContext';

export const useHeader = () => {
  const context = useContext(HeaderContext);
  if (context === undefined) {
    throw new Error('useHeader must be used within a HeaderProvider');
  }
  return context;
};

/**
 * Helper hook for pages to easily register their header configuration.
 * Automatically cleans up (resets) when the component unmounts.
 */
export const useHeaderConfig = (config: {
  initialFileName?: string;
  onFileNameChange?: (name: string) => void; // Optional: if you want to sync back to local state
  onExport?: () => void;
}) => {
  const { setFileName, setOnExport } = useHeader();

  // Effect to set initial values and cleanup on unmount
  useEffect(() => {
    if (config.initialFileName) {
      setFileName(config.initialFileName);
    }
    if (config.onExport) {
      setOnExport(config.onExport);
    }

    return () => {
      setFileName('');
      setOnExport(undefined);
    };
  }, [config.initialFileName, config.onExport, setFileName, setOnExport]);

  return { setFileName };
};
