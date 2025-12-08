import type { AppState } from '../types/audio';
import { EventEmitter } from '../patterns/EventEmitter';

/**
 * State transition definition
 */
export interface StateTransition {
  from: AppState;
  to: AppState;
  guard?: () => boolean | Promise<boolean>; // Optional condition
  onTransition?: () => void | Promise<void>; // Optional callback
}

/**
 * State machine events
 */
export interface StateMachineEvents {
  'state-change': StateChangeEvent;
  'transition-error': TransitionErrorEvent;
}

export interface StateChangeEvent {
  from: AppState;
  to: AppState;
}

export interface TransitionErrorEvent {
  from: AppState;
  to: AppState;
  error: Error;
}

/**
 * Application state machine
 * Manages state transitions with validation and event emission
 */
export class AppStateMachine extends EventEmitter<StateMachineEvents> {
  private currentState: AppState;
  private transitions: Map<string, StateTransition> = new Map();
  private stateHistory: AppState[] = [];

  constructor(initialState: AppState = 'initial') {
    super();
    this.currentState = initialState;
    this.stateHistory.push(initialState);
    this.defineTransitions();
  }

  /**
   * Define all valid state transitions
   */
  private defineTransitions(): void {
    // From initial
    this.addTransition({ from: 'initial', to: 'recording' });
    this.addTransition({ from: 'initial', to: 'audio' });

    // From recording
    this.addTransition({ from: 'recording', to: 'audio' });
    this.addTransition({ from: 'recording', to: 'initial' });

    // From audio
    this.addTransition({ from: 'audio', to: 'configuration' });
    this.addTransition({ from: 'audio', to: 'initial' });

    // From configuration
    this.addTransition({ from: 'configuration', to: 'processing' });
    this.addTransition({ from: 'configuration', to: 'audio' });

    // From processing
    this.addTransition({ from: 'processing', to: 'results' });
    this.addTransition({ from: 'processing', to: 'configuration' }); // On error
    this.addTransition({ from: 'processing', to: 'initial' }); // On cancel

    // From results
    this.addTransition({ from: 'results', to: 'audio' });
    this.addTransition({ from: 'results', to: 'initial' });
  }

  /**
   * Add a state transition
   */
  addTransition(transition: StateTransition): void {
    const key = this.getTransitionKey(transition.from, transition.to);
    this.transitions.set(key, transition);
  }

  /**
   * Get transition key
   */
  private getTransitionKey(from: AppState, to: AppState): string {
    return `${from}->${to}`;
  }

  /**
   * Check if a transition is valid
   */
  canTransition(to: AppState): boolean {
    const key = this.getTransitionKey(this.currentState, to);
    return this.transitions.has(key);
  }

  /**
   * Transition to a new state
   */
  async transition(to: AppState): Promise<boolean> {
    const from = this.currentState;

    // Check if transition is valid
    if (!this.canTransition(to)) {
      const error = new Error(
        `Invalid state transition: ${from} -> ${to}. ` +
        `Valid transitions from ${from}: ${this.getValidTransitions().join(', ')}`
      );
      this.emit('transition-error', { from, to, error });
      throw error;
    }

    const key = this.getTransitionKey(from, to);
    const transition = this.transitions.get(key)!;

    // Check guard condition if present
    if (transition.guard) {
      const canTransition = await transition.guard();
      if (!canTransition) {
        const error = new Error(`Transition guard failed for ${from} -> ${to}`);
        this.emit('transition-error', { from, to, error });
        return false;
      }
    }

    // Execute transition callback if present
    if (transition.onTransition) {
      try {
        await transition.onTransition();
      } catch (error) {
        this.emit('transition-error', { from, to, error: error as Error });
        throw error;
      }
    }

    // Update state
    this.currentState = to;
    this.stateHistory.push(to);

    // Emit state change event
    this.emit('state-change', { from, to });

    return true;
  }

  /**
   * Get current state
   */
  getState(): AppState {
    return this.currentState;
  }

  /**
   * Get valid transitions from current state
   */
  getValidTransitions(): AppState[] {
    const validTransitions: AppState[] = [];
    for (const [key, transition] of this.transitions.entries()) {
      if (transition.from === this.currentState) {
        validTransitions.push(transition.to);
      }
    }
    return validTransitions;
  }

  /**
   * Check if currently in a specific state
   */
  isInState(state: AppState): boolean {
    return this.currentState === state;
  }

  /**
   * Get state history
   */
  getHistory(): AppState[] {
    return [...this.stateHistory];
  }

  /**
   * Get previous state
   */
  getPreviousState(): AppState | null {
    return this.stateHistory.length > 1
      ? this.stateHistory[this.stateHistory.length - 2]
      : null;
  }

  /**
   * Reset to initial state
   */
  reset(): void {
    const from = this.currentState;
    this.currentState = 'initial';
    this.stateHistory = ['initial'];
    this.emit('state-change', { from, to: 'initial' });
  }

  /**
   * Get a visual representation of the state machine
   */
  visualize(): string {
    const lines: string[] = ['State Machine Diagram:', ''];
    const states = new Set<AppState>();

    // Collect all states
    for (const transition of this.transitions.values()) {
      states.add(transition.from);
      states.add(transition.to);
    }

    // Show current state
    lines.push(`Current: ${this.currentState}`);
    lines.push('');

    // Show transitions
    lines.push('Transitions:');
    for (const [key, transition] of this.transitions.entries()) {
      const isCurrent = transition.from === this.currentState;
      const prefix = isCurrent ? '→ ' : '  ';
      lines.push(`${prefix}${transition.from} → ${transition.to}`);
    }

    return lines.join('\n');
  }
}

// Export singleton instance
export const appStateMachine = new AppStateMachine();
