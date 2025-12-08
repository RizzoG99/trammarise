/**
 * Base command interface
 * All commands must implement execute and undo methods
 */
export interface Command {
  execute(): void | Promise<void>;
  undo(): void | Promise<void>;
  getDescription(): string;
}

/**
 * Command history manager for undo/redo functionality
 */
export class CommandHistory {
  private history: Command[] = [];
  private currentIndex: number = -1;
  private maxHistorySize: number = 50;

  /**
   * Execute a command and add it to history
   */
  async execute(command: Command): Promise<void> {
    // Remove any commands after current index (branching)
    this.history = this.history.slice(0, this.currentIndex + 1);

    // Execute the command
    await command.execute();

    // Add to history
    this.history.push(command);
    this.currentIndex++;

    // Maintain max history size
    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
      this.currentIndex--;
    }
  }

  /**
   * Undo the last command
   */
  async undo(): Promise<boolean> {
    if (!this.canUndo()) {
      return false;
    }

    const command = this.history[this.currentIndex];
    await command.undo();
    this.currentIndex--;
    return true;
  }

  /**
   * Redo the next command
   */
  async redo(): Promise<boolean> {
    if (!this.canRedo()) {
      return false;
    }

    this.currentIndex++;
    const command = this.history[this.currentIndex];
    await command.execute();
    return true;
  }

  /**
   * Check if undo is available
   */
  canUndo(): boolean {
    return this.currentIndex >= 0;
  }

  /**
   * Check if redo is available
   */
  canRedo(): boolean {
    return this.currentIndex < this.history.length - 1;
  }

  /**
   * Get description of command that would be undone
   */
  getUndoDescription(): string | null {
    if (!this.canUndo()) {
      return null;
    }
    return this.history[this.currentIndex].getDescription();
  }

  /**
   * Get description of command that would be redone
   */
  getRedoDescription(): string | null {
    if (!this.canRedo()) {
      return null;
    }
    return this.history[this.currentIndex + 1].getDescription();
  }

  /**
   * Clear all history
   */
  clear(): void {
    this.history = [];
    this.currentIndex = -1;
  }

  /**
   * Get the current history size
   */
  size(): number {
    return this.history.length;
  }

  /**
   * Set maximum history size
   */
  setMaxHistorySize(size: number): void {
    this.maxHistorySize = Math.max(1, size);

    // Trim history if needed
    if (this.history.length > this.maxHistorySize) {
      const excess = this.history.length - this.maxHistorySize;
      this.history.splice(0, excess);
      this.currentIndex -= excess;
    }
  }
}
