import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSpeechSynthesis } from './useSpeechSynthesis';

// Declare global for Node.js test environment
declare const global: typeof globalThis & {
  SpeechSynthesisUtterance: typeof SpeechSynthesisUtterance;
  window: Window & typeof globalThis;
};

// Mock class interface for test access
interface MockUtterance {
  text: string;
  onstart: ((this: SpeechSynthesisUtterance, ev: SpeechSynthesisEvent) => void) | null;
  onend: ((this: SpeechSynthesisUtterance, ev: SpeechSynthesisEvent) => void) | null;
  onerror: ((this: SpeechSynthesisUtterance, ev: SpeechSynthesisErrorEvent) => void) | null;
}

// Module-level variable to capture last created utterance
let lastUtterance: MockUtterance | null = null;

describe('useSpeechSynthesis', () => {
  let mockSpeak: ReturnType<typeof vi.fn>;
  let mockCancel: ReturnType<typeof vi.fn>;
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    mockSpeak = vi.fn();
    mockCancel = vi.fn();
    lastUtterance = null;
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    // Mock SpeechSynthesisUtterance with properly typed event handlers
    class MockSpeechSynthesisUtterance {
      text: string;
      onstart: ((this: SpeechSynthesisUtterance, ev: SpeechSynthesisEvent) => void) | null = null;
      onend: ((this: SpeechSynthesisUtterance, ev: SpeechSynthesisEvent) => void) | null = null;
      onerror: ((this: SpeechSynthesisUtterance, ev: SpeechSynthesisErrorEvent) => void) | null = null;

      constructor(text: string) {
        this.text = text;

        // Store reference to last created utterance for test access
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        lastUtterance = this;
      }
    }

    // Strategic cast for global API augmentation (acceptable for Web API mocks)
    global.SpeechSynthesisUtterance = MockSpeechSynthesisUtterance as unknown as typeof SpeechSynthesisUtterance;

    // Mock window.speechSynthesis with proper typing
    global.window.speechSynthesis = {
      speak: mockSpeak,
      cancel: mockCancel,
      speaking: false,
      paused: false,
      pending: false,
      getVoices: vi.fn(() => []),
      pause: vi.fn(),
      resume: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(() => true),
      onvoiceschanged: null,
    } as SpeechSynthesis;
  });

  afterEach(() => {
    vi.clearAllMocks();
    consoleWarnSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  describe('Initialization', () => {
    it('initializes with isSpeaking as false', () => {
      const { result } = renderHook(() => useSpeechSynthesis());

      expect(result.current.isSpeaking).toBe(false);
    });

    it('returns speak function', () => {
      const { result } = renderHook(() => useSpeechSynthesis());

      expect(typeof result.current.speak).toBe('function');
    });

    it('returns stop function', () => {
      const { result } = renderHook(() => useSpeechSynthesis());

      expect(typeof result.current.stop).toBe('function');
    });
  });

  describe('Speech Functionality', () => {
    it('creates SpeechSynthesisUtterance with provided text', () => {
      const { result } = renderHook(() => useSpeechSynthesis());

      act(() => {
        result.current.speak('Hello world');
      });

      expect(lastUtterance!.text).toBe('Hello world');
    });

    it('calls speechSynthesis.speak with utterance', () => {
      const { result } = renderHook(() => useSpeechSynthesis());

      act(() => {
        result.current.speak('Test text');
      });

      expect(mockSpeak).toHaveBeenCalled();
      expect(lastUtterance!.text).toBe('Test text');
    });

    it('cancels any ongoing speech before speaking', () => {
      const { result } = renderHook(() => useSpeechSynthesis());

      act(() => {
        result.current.speak('First text');
      });

      mockCancel.mockClear();

      act(() => {
        result.current.speak('Second text');
      });

      expect(mockCancel).toHaveBeenCalledTimes(1);
    });

    it('sets isSpeaking to true when speech starts', () => {
      const { result } = renderHook(() => useSpeechSynthesis());

      act(() => {
        result.current.speak('Test');
      });

      // Simulate onstart event
      act(() => {
        lastUtterance!.onstart!.call(lastUtterance as unknown as SpeechSynthesisUtterance, {} as SpeechSynthesisEvent);
      });

      expect(result.current.isSpeaking).toBe(true);
    });

    it('sets isSpeaking to false when speech ends', () => {
      const { result } = renderHook(() => useSpeechSynthesis());

      act(() => {
        result.current.speak('Test');
        lastUtterance!.onstart!.call(lastUtterance as unknown as SpeechSynthesisUtterance, {} as SpeechSynthesisEvent);
      });

      expect(result.current.isSpeaking).toBe(true);

      act(() => {
        lastUtterance!.onend!.call(lastUtterance as unknown as SpeechSynthesisUtterance, {} as SpeechSynthesisEvent);
      });

      expect(result.current.isSpeaking).toBe(false);
    });

    it('handles empty text', () => {
      const { result } = renderHook(() => useSpeechSynthesis());

      act(() => {
        result.current.speak('');
      });

      expect(lastUtterance!.text).toBe('');
      expect(mockSpeak).toHaveBeenCalled();
    });

    it('handles very long text', () => {
      const { result } = renderHook(() => useSpeechSynthesis());
      const longText = 'A'.repeat(10000);

      act(() => {
        result.current.speak(longText);
      });

      expect(lastUtterance!.text).toBe(longText);
    });

    it('handles text with special characters', () => {
      const { result } = renderHook(() => useSpeechSynthesis());
      const specialText = 'Test @#$% & special <characters>!';

      act(() => {
        result.current.speak(specialText);
      });

      expect(lastUtterance!.text).toBe(specialText);
    });
  });

  describe('Stop Functionality', () => {
    it('calls speechSynthesis.cancel when stop is called', () => {
      const { result } = renderHook(() => useSpeechSynthesis());

      act(() => {
        result.current.stop();
      });

      expect(mockCancel).toHaveBeenCalledTimes(1);
    });

    it('sets isSpeaking to false when stop is called', () => {
      const { result } = renderHook(() => useSpeechSynthesis());

      // Start speaking
      act(() => {
        result.current.speak('Test');
        lastUtterance!.onstart!.call(lastUtterance as unknown as SpeechSynthesisUtterance, {} as SpeechSynthesisEvent);
      });

      expect(result.current.isSpeaking).toBe(true);

      // Stop speaking
      act(() => {
        result.current.stop();
      });

      expect(result.current.isSpeaking).toBe(false);
    });

    it('can be called multiple times safely', () => {
      const { result } = renderHook(() => useSpeechSynthesis());

      act(() => {
        result.current.stop();
        result.current.stop();
        result.current.stop();
      });

      expect(mockCancel).toHaveBeenCalledTimes(3);
      expect(result.current.isSpeaking).toBe(false);
    });

    it('works when called before any speech', () => {
      const { result } = renderHook(() => useSpeechSynthesis());

      expect(() => {
        act(() => {
          result.current.stop();
        });
      }).not.toThrow();

      expect(result.current.isSpeaking).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('logs error and sets isSpeaking to false on speech error', () => {
      const { result } = renderHook(() => useSpeechSynthesis());

      act(() => {
        result.current.speak('Test');
        lastUtterance!.onstart!.call(lastUtterance as unknown as SpeechSynthesisUtterance, {} as SpeechSynthesisEvent);
      });

      expect(result.current.isSpeaking).toBe(true);

      const errorEvent = { error: 'test-error' } as unknown as SpeechSynthesisErrorEvent;

      act(() => {
        lastUtterance!.onerror!.call(lastUtterance as unknown as SpeechSynthesisUtterance, errorEvent);
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith('Speech synthesis error:', errorEvent);
      expect(result.current.isSpeaking).toBe(false);
    });

    it('handles missing speechSynthesis API gracefully', () => {
      // Remove speechSynthesis from window
      Reflect.deleteProperty(global.window, 'speechSynthesis');

      const { result } = renderHook(() => useSpeechSynthesis());

      act(() => {
        result.current.speak('Test');
      });

      expect(consoleWarnSpy).toHaveBeenCalledWith('Speech synthesis not supported in this browser');
      expect(result.current.isSpeaking).toBe(false);
    });

    it('does not throw when stop is called without speechSynthesis API', () => {
      Reflect.deleteProperty(global.window, 'speechSynthesis');

      const { result } = renderHook(() => useSpeechSynthesis());

      expect(() => {
        act(() => {
          result.current.stop();
        });
      }).not.toThrow();
    });
  });

  describe('Rapid Interactions', () => {
    it('handles rapid speak calls', () => {
      const { result } = renderHook(() => useSpeechSynthesis());

      act(() => {
        result.current.speak('First');
        result.current.speak('Second');
        result.current.speak('Third');
      });

      // Should have cancelled 2 times (before second and third speak)
      expect(mockCancel).toHaveBeenCalledTimes(3);
      // Should have called speak 3 times
      expect(mockSpeak).toHaveBeenCalledTimes(3);
    });

    it('handles rapid speak and stop calls', () => {
      const { result } = renderHook(() => useSpeechSynthesis());

      act(() => {
        result.current.speak('Test');
        result.current.stop();
        result.current.speak('Test again');
        result.current.stop();
      });

      expect(result.current.isSpeaking).toBe(false);
    });

    it('handles stop during speech start', () => {
      const { result } = renderHook(() => useSpeechSynthesis());

      act(() => {
        result.current.speak('Test');
        lastUtterance!.onstart!.call(lastUtterance as unknown as SpeechSynthesisUtterance, {} as SpeechSynthesisEvent);
        result.current.stop();
      });

      expect(result.current.isSpeaking).toBe(false);
    });
  });

  describe('Function Stability', () => {
    it('speak function reference remains stable', () => {
      const { result, rerender } = renderHook(() => useSpeechSynthesis());

      const initialSpeak = result.current.speak;

      rerender();

      expect(result.current.speak).toBe(initialSpeak);
    });

    it('stop function reference remains stable', () => {
      const { result, rerender } = renderHook(() => useSpeechSynthesis());

      const initialStop = result.current.stop;

      rerender();

      expect(result.current.stop).toBe(initialStop);
    });
  });

  describe('State Management', () => {
    it('maintains isSpeaking state correctly through full cycle', () => {
      const { result } = renderHook(() => useSpeechSynthesis());

      // Initial state
      expect(result.current.isSpeaking).toBe(false);

      // Start speaking
      act(() => {
        result.current.speak('Test');
        lastUtterance!.onstart!.call(lastUtterance as unknown as SpeechSynthesisUtterance, {} as SpeechSynthesisEvent);
      });

      expect(result.current.isSpeaking).toBe(true);

      // End speaking
      act(() => {
        lastUtterance!.onend!.call(lastUtterance as unknown as SpeechSynthesisUtterance, {} as SpeechSynthesisEvent);
      });

      expect(result.current.isSpeaking).toBe(false);
    });

    it('updates isSpeaking when new speech interrupts ongoing speech', () => {
      const { result } = renderHook(() => useSpeechSynthesis());

      // Start first speech
      act(() => {
        result.current.speak('First');
        lastUtterance!.onstart!.call(lastUtterance as unknown as SpeechSynthesisUtterance, {} as SpeechSynthesisEvent);
      });

      expect(result.current.isSpeaking).toBe(true);

      // Start second speech (interrupts first)
      act(() => {
        result.current.speak('Second');
      });

      // Should still be true (new speech will start)
      act(() => {
        lastUtterance!.onstart!.call(lastUtterance as unknown as SpeechSynthesisUtterance, {} as SpeechSynthesisEvent);
      });

      expect(result.current.isSpeaking).toBe(true);
    });
  });

  describe('Return Value', () => {
    it('returns all expected properties', () => {
      const { result } = renderHook(() => useSpeechSynthesis());

      expect(result.current).toHaveProperty('speak');
      expect(result.current).toHaveProperty('stop');
      expect(result.current).toHaveProperty('isSpeaking');
    });

    it('returns boolean for isSpeaking', () => {
      const { result } = renderHook(() => useSpeechSynthesis());

      expect(typeof result.current.isSpeaking).toBe('boolean');
    });
  });
});
