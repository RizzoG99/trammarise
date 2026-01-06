import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useAudioRecorder } from './useAudioRecorder';

// Mock MediaRecorder
class MockMediaRecorder {
  state: 'inactive' | 'recording' | 'paused' = 'inactive';
  stream: MediaStream;
  ondataavailable: ((event: { data: Blob }) => void) | null = null;
  onstop: (() => void) | null = null;
  onerror: ((event: Event) => void) | null = null;

  constructor(stream: MediaStream, _options?: MediaRecorderOptions) {
    this.stream = stream;
  }

  start() {
    this.state = 'recording';
  }

  stop() {
    this.state = 'inactive';
    if (this.onstop) {
      setTimeout(() => {
        this.onstop!();
      }, 0);
    }
  }

  pause() {
    this.state = 'paused';
  }

  resume() {
    this.state = 'recording';
  }

  requestData() {
    if (this.ondataavailable) {
      const blob = new Blob(['audio data'], { type: 'audio/webm' });
      this.ondataavailable({ data: blob });
    }
  }

  static isTypeSupported(_type: string) {
    return true;
  }
}

// Mock MediaStream
class MockMediaStream {
  tracks: MediaStreamTrack[] = [];

  getTracks() {
    return this.tracks;
  }

  addTrack(track: MediaStreamTrack) {
    this.tracks.push(track);
  }
}

// Mock MediaStreamTrack
class MockMediaStreamTrack {
  kind = 'audio';
  id = 'mock-track-id';
  label = 'Mock Audio Track';
  enabled = true;
  muted = false;
  readyState: 'live' | 'ended' = 'live';

  stop() {
    this.readyState = 'ended';
  }
}

describe('useAudioRecorder', () => {
  let mockGetUserMedia: ReturnType<typeof vi.fn>;
  let mockMediaStream: MockMediaStream;
  let mockMediaTrack: MockMediaStreamTrack;

  beforeEach(() => {
    // Setup mocks
    mockMediaTrack = new MockMediaStreamTrack();
    mockMediaStream = new MockMediaStream();
    mockMediaStream.addTrack(mockMediaTrack as any);

    mockGetUserMedia = vi.fn().mockResolvedValue(mockMediaStream);

    // Mock navigator.mediaDevices
    Object.defineProperty(global.navigator, 'mediaDevices', {
      writable: true,
      value: {
        getUserMedia: mockGetUserMedia,
      },
    });

    // Mock MediaRecorder
    global.MediaRecorder = MockMediaRecorder as any;

    // Mock permissions API
    Object.defineProperty(global.navigator, 'permissions', {
      writable: true,
      value: {
        query: vi.fn().mockResolvedValue({
          state: 'prompt',
          onchange: null,
        }),
      },
    });

    // Mock timers
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const { result } = renderHook(() => useAudioRecorder());

      expect(result.current.isRecording).toBe(false);
      expect(result.current.isPaused).toBe(false);
      expect(result.current.duration).toBe(0);
      expect(result.current.audioBlob).toBeNull();
      expect(result.current.error).toBeNull();
      expect(result.current.hasMicrophoneAccess).toBeNull();
    });
  });

  describe('Recording', () => {
    it('should start recording successfully', async () => {
      const { result } = renderHook(() => useAudioRecorder());

      let recordingStarted = false;
      await act(async () => {
        recordingStarted = await result.current.startRecording();
      });

      expect(recordingStarted).toBe(true);
      expect(result.current.isRecording).toBe(true);
      expect(result.current.isPaused).toBe(false);
      expect(mockGetUserMedia).toHaveBeenCalledWith({ audio: true });
    });

    it('should increment duration while recording', async () => {
      const { result } = renderHook(() => useAudioRecorder());

      await act(async () => {
        await result.current.startRecording();
      });

      // Advance timer by 1 second
      await act(async () => {
        vi.advanceTimersByTime(1000);
      });

      expect(result.current.duration).toBe(1);

      // Advance by another 2 seconds
      await act(async () => {
        vi.advanceTimersByTime(2000);
      });

      expect(result.current.duration).toBe(3);
    });

    it('should pause recording', async () => {
      const { result } = renderHook(() => useAudioRecorder());

      await act(async () => {
        await result.current.startRecording();
      });

      act(() => {
        result.current.pauseRecording();
      });

      expect(result.current.isPaused).toBe(true);
      expect(result.current.isRecording).toBe(true);
    });

    it('should resume recording', async () => {
      const { result } = renderHook(() => useAudioRecorder());

      await act(async () => {
        await result.current.startRecording();
      });

      act(() => {
        result.current.pauseRecording();
      });

      act(() => {
        result.current.resumeRecording();
      });

      expect(result.current.isPaused).toBe(false);
      expect(result.current.isRecording).toBe(true);
    });

    it('should stop recording and create audio blob', async () => {
      const { result } = renderHook(() => useAudioRecorder());

      await act(async () => {
        await result.current.startRecording();
      });

      await act(async () => {
        result.current.stopRecording();
        // Wait for onstop to be called
        await vi.runAllTimersAsync();
      });

      await waitFor(() => {
        expect(result.current.isRecording).toBe(false);
        expect(result.current.audioBlob).not.toBeNull();
      });
    });

    it('should handle microphone access denial', async () => {
      mockGetUserMedia.mockRejectedValueOnce(new Error('Permission denied'));

      const { result } = renderHook(() => useAudioRecorder());

      let recordingStarted = false;
      await act(async () => {
        recordingStarted = await result.current.startRecording();
      });

      expect(recordingStarted).toBe(false);
      expect(result.current.error).toContain('Microphone access denied');
      expect(result.current.isRecording).toBe(false);
      expect(result.current.hasMicrophoneAccess).toBe(false);
    });
  });

  describe('Reset Recording', () => {
    it('should stop recording when reset is called', async () => {
      const { result } = renderHook(() => useAudioRecorder());

      await act(async () => {
        await result.current.startRecording();
      });

      expect(result.current.isRecording).toBe(true);

      act(() => {
        result.current.resetRecording();
      });

      expect(result.current.isRecording).toBe(false);
    });

    it('should clear all state when reset is called', async () => {
      const { result } = renderHook(() => useAudioRecorder());

      await act(async () => {
        await result.current.startRecording();
      });

      // Advance time to create some duration
      await act(async () => {
        vi.advanceTimersByTime(5000);
      });

      expect(result.current.duration).toBe(5);

      act(() => {
        result.current.resetRecording();
      });

      expect(result.current.duration).toBe(0);
      expect(result.current.isPaused).toBe(false);
      expect(result.current.audioBlob).toBeNull();
    });

    it('should stop MediaStream tracks when reset is called', async () => {
      const { result } = renderHook(() => useAudioRecorder());

      await act(async () => {
        await result.current.startRecording();
      });

      const stopSpy = vi.spyOn(mockMediaTrack, 'stop');

      act(() => {
        result.current.resetRecording();
      });

      // Tracks should be stopped immediately
      expect(stopSpy).toHaveBeenCalled();
    });

    it('should not create audio blob when reset is called (memory leak prevention)', async () => {
      const { result } = renderHook(() => useAudioRecorder());

      await act(async () => {
        await result.current.startRecording();
      });

      act(() => {
        result.current.resetRecording();
      });

      // Wait for onstop to complete
      await act(async () => {
        await vi.runAllTimersAsync();
      });

      // Audio blob should remain null
      expect(result.current.audioBlob).toBeNull();
    });

    it('should clear timer when reset is called', async () => {
      const { result } = renderHook(() => useAudioRecorder());

      await act(async () => {
        await result.current.startRecording();
      });

      act(() => {
        result.current.resetRecording();
      });

      // Advance timer - duration should not change
      await act(async () => {
        vi.advanceTimersByTime(5000);
      });

      expect(result.current.duration).toBe(0);
    });
  });

  describe('Duration Tracking', () => {
    it('should maintain duration when paused', async () => {
      const { result } = renderHook(() => useAudioRecorder());

      await act(async () => {
        await result.current.startRecording();
      });

      await act(async () => {
        vi.advanceTimersByTime(3000);
      });

      expect(result.current.duration).toBe(3);

      act(() => {
        result.current.pauseRecording();
      });

      // Advance timer while paused
      await act(async () => {
        vi.advanceTimersByTime(2000);
      });

      // Duration should not change while paused
      expect(result.current.duration).toBe(3);
    });

    it('should continue from previous duration when resumed', async () => {
      const { result } = renderHook(() => useAudioRecorder());

      await act(async () => {
        await result.current.startRecording();
      });

      await act(async () => {
        vi.advanceTimersByTime(3000);
      });

      act(() => {
        result.current.pauseRecording();
      });

      act(() => {
        result.current.resumeRecording();
      });

      await act(async () => {
        vi.advanceTimersByTime(2000);
      });

      expect(result.current.duration).toBe(5);
    });
  });

  describe('Microphone Permissions', () => {
    it('should check microphone permission', async () => {
      const { result } = renderHook(() => useAudioRecorder());

      await act(async () => {
        await result.current.checkMicrophonePermission();
      });

      expect(navigator.permissions.query).toHaveBeenCalledWith({
        name: 'microphone',
      });
    });

    it('should set hasMicrophoneAccess to false when permission is denied', async () => {
      const mockQuery = vi.fn().mockResolvedValue({
        state: 'denied',
        onchange: null,
      });

      Object.defineProperty(navigator, 'permissions', {
        writable: true,
        value: { query: mockQuery },
      });

      const { result } = renderHook(() => useAudioRecorder());

      await act(async () => {
        await result.current.checkMicrophonePermission();
      });

      expect(result.current.hasMicrophoneAccess).toBe(false);
    });
  });

  describe('Cleanup', () => {
    it('should cleanup on unmount', async () => {
      const { result, unmount } = renderHook(() => useAudioRecorder());

      await act(async () => {
        await result.current.startRecording();
      });

      const stopSpy = vi.spyOn(mockMediaTrack, 'stop');

      unmount();

      // Tracks should be stopped on unmount
      await waitFor(() => {
        expect(stopSpy).toHaveBeenCalled();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should not start recording if already recording', async () => {
      const { result } = renderHook(() => useAudioRecorder());

      await act(async () => {
        await result.current.startRecording();
      });

      const firstCallCount = mockGetUserMedia.mock.calls.length;

      await act(async () => {
        await result.current.startRecording();
      });

      // getUserMedia should not be called again
      expect(mockGetUserMedia.mock.calls.length).toBe(firstCallCount);
    });

    it('should handle reset when not recording', () => {
      const { result } = renderHook(() => useAudioRecorder());

      expect(() => {
        act(() => {
          result.current.resetRecording();
        });
      }).not.toThrow();

      expect(result.current.duration).toBe(0);
    });

    it('should handle pause when not recording', () => {
      const { result } = renderHook(() => useAudioRecorder());

      expect(() => {
        act(() => {
          result.current.pauseRecording();
        });
      }).not.toThrow();
    });

    it('should handle resume when not paused', async () => {
      const { result } = renderHook(() => useAudioRecorder());

      await act(async () => {
        await result.current.startRecording();
      });

      expect(() => {
        act(() => {
          result.current.resumeRecording();
        });
      }).not.toThrow();
    });
  });
});
