import React, { createContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';

interface HeaderContextType {
  /** Current file name displayed in the header */
  fileName: string;
  /** Function to update the file name */
  setFileName: (name: string) => void;
  /** Action handler for the export button. If undefined, button is hidden. */
  onExport?: () => void;
  /** Set the export action handler. Pass undefined to hide the button. */
  setOnExport: (callback: (() => void) | undefined) => void;
}

const HeaderContext = createContext<HeaderContextType | undefined>(undefined);

export function HeaderProvider({ children }: { children: ReactNode }) {
  const [fileName, setFileName] = useState('');
  const [onExport, setOnExportState] = useState<(() => void) | undefined>(undefined);

  const setOnExport = useCallback((callback: (() => void) | undefined) => {
    setOnExportState(() => callback);
  }, []);

  const value = React.useMemo(
    () => ({ fileName, setFileName, onExport, setOnExport }),
    [fileName, onExport, setOnExport]
  );

  return <HeaderContext.Provider value={value}>{children}</HeaderContext.Provider>;
}

// Hooks moved to src/hooks/useHeader.ts to comply with Fast Refresh rules
export { HeaderContext };
