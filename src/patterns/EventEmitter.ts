/**
 * Generic event listener type
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type EventListener<T = any> = (data: T) => void;

/**
 * Event emitter for implementing the Observer pattern
 * Allows components to subscribe to events and receive notifications
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class EventEmitter<EventMap extends Record<string, any> = Record<string, any>> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private listeners: Map<keyof EventMap, Set<EventListener<any>>> = new Map();

  /**
   * Subscribe to an event
   * @param event - Event name to subscribe to
   * @param listener - Callback function to invoke when event is emitted
   * @returns Unsubscribe function
   */
  on<K extends keyof EventMap>(event: K, listener: EventListener<EventMap[K]>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(listener);

    // Return unsubscribe function
    return () => this.off(event, listener);
  }

  /**
   * Subscribe to an event once (automatically unsubscribes after first emission)
   * @param event - Event name to subscribe to
   * @param listener - Callback function to invoke when event is emitted
   * @returns Unsubscribe function
   */
  once<K extends keyof EventMap>(event: K, listener: EventListener<EventMap[K]>): () => void {
    const wrappedListener = (data: EventMap[K]) => {
      listener(data);
      this.off(event, wrappedListener);
    };
    return this.on(event, wrappedListener);
  }

  /**
   * Unsubscribe from an event
   * @param event - Event name to unsubscribe from
   * @param listener - Listener function to remove
   */
  off<K extends keyof EventMap>(event: K, listener: EventListener<EventMap[K]>): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.delete(listener);
      if (eventListeners.size === 0) {
        this.listeners.delete(event);
      }
    }
  }

  /**
   * Emit an event to all subscribers
   * @param event - Event name to emit
   * @param data - Data to pass to listeners
   */
  emit<K extends keyof EventMap>(event: K, data: EventMap[K]): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach((listener) => {
        try {
          listener(data);
        } catch (error) {
          console.error(`Error in event listener for "${String(event)}":`, error);
        }
      });
    }
  }

  /**
   * Remove all listeners for a specific event, or all listeners if no event specified
   * @param event - Optional event name to clear listeners for
   */
  removeAllListeners<K extends keyof EventMap>(event?: K): void {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
  }

  /**
   * Get the number of listeners for an event
   * @param event - Event name
   * @returns Number of listeners
   */
  listenerCount<K extends keyof EventMap>(event: K): number {
    return this.listeners.get(event)?.size || 0;
  }

  /**
   * Get all event names that have listeners
   * @returns Array of event names
   */
  eventNames(): (keyof EventMap)[] {
    return Array.from(this.listeners.keys());
  }
}
