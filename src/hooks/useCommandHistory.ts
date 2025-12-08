import { useState, useCallback, useRef, useEffect } from 'react';
import { CommandHistory } from '../patterns/Command';
import type { Command } from '../patterns/Command';

/**
 * React hook for command history (undo/redo functionality)
 * Provides a convenient way to use the Command pattern in React components
 */
export function useCommandHistory(maxHistorySize: number = 50) {
  const historyRef = useRef(new CommandHistory());
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [undoDescription, setUndoDescription] = useState<string | null>(null);
  const [redoDescription, setRedoDescription] = useState<string | null>(null);

  // Update state based on history
  const updateState = useCallback(() => {
    const history = historyRef.current;
    setCanUndo(history.canUndo());
    setCanRedo(history.canRedo());
    setUndoDescription(history.getUndoDescription());
    setRedoDescription(history.getRedoDescription());
  }, []);

  // Set max history size
  useEffect(() => {
    historyRef.current.setMaxHistorySize(maxHistorySize);
  }, [maxHistorySize]);

  /**
   * Execute a command and add it to history
   */
  const execute = useCallback(async (command: Command) => {
    await historyRef.current.execute(command);
    updateState();
  }, [updateState]);

  /**
   * Undo the last command
   */
  const undo = useCallback(async () => {
    const success = await historyRef.current.undo();
    updateState();
    return success;
  }, [updateState]);

  /**
   * Redo the next command
   */
  const redo = useCallback(async () => {
    const success = await historyRef.current.redo();
    updateState();
    return success;
  }, [updateState]);

  /**
   * Clear all history
   */
  const clear = useCallback(() => {
    historyRef.current.clear();
    updateState();
  }, [updateState]);

  /**
   * Get history size
   */
  const size = useCallback(() => {
    return historyRef.current.size();
  }, []);

  return {
    execute,
    undo,
    redo,
    clear,
    size,
    canUndo,
    canRedo,
    undoDescription,
    redoDescription,
  };
}
