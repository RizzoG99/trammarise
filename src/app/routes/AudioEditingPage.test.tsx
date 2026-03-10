import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { AudioEditingPage } from './AudioEditingPage';
import type { WaveformPlayerRef } from '@/lib';
import WaveSurfer from 'wavesurfer.js';

// ─── Router ──────────────────────────────────────────────────────────────────
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: vi.fn(() => ({ sessionId: 'test-session' })),
    useNavigate: vi.fn(() => vi.fn()),
  };
});

// ─── Hooks ───────────────────────────────────────────────────────────────────
vi.mock('../../hooks/useSessionStorage', () => ({ useSessionStorage: vi.fn() }));
vi.mock('../../hooks/useRouteState', () => ({
  useRouteState: vi.fn(() => ({ goToProcessing: vi.fn() })),
}));

// ─── Layout / SEO ────────────────────────────────────────────────────────────
vi.mock('../../components/layout/PageLayout', () => ({
  PageLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// SEO is lazy-loaded; mock the module so Suspense resolves immediately
vi.mock('@/lib/components/common/SEO', () => ({ SEO: () => null }));

// ─── Audio-editing sub-components (not under test here) ──────────────────────
vi.mock('../../features/audio-editing/components/EnhancedPlaybackControls', () => ({
  EnhancedPlaybackControls: () => null,
}));
vi.mock('../../features/audio-editing/components/AudioStatusBadges', () => ({
  AudioStatusBadges: () => null,
}));
vi.mock('../../features/audio-editing/components/TimelineRuler', () => ({
  TimelineRuler: () => null,
}));

// ─── @/lib: stub UI components; capture WaveformPlayer props ─────────────────
// TrimTimeInputs is NOT mocked — we render it for real so we can assert
// that the time inputs show the region values after region-created fires.
let capturedOnWaveSurferReady: ((player: WaveformPlayerRef) => void) | undefined;
let capturedDragToSeek: boolean | undefined;

vi.mock('@/lib', async () => {
  const actual = await vi.importActual<typeof import('@/lib')>('@/lib');
  return {
    ...actual,
    // Lightweight stubs for layout primitives
    Heading: ({ children }: { children: React.ReactNode }) => <h1>{children}</h1>,
    Text: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
    GlassCard: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    Button: ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => (
      <button onClick={onClick}>{children}</button>
    ),
    // Controlled WaveformPlayer mock: capture props for assertions
    WaveformPlayer: vi.fn(
      ({
        onWaveSurferReady,
        dragToSeek,
      }: {
        onWaveSurferReady?: (p: WaveformPlayerRef) => void;
        dragToSeek?: boolean;
      }) => {
        capturedOnWaveSurferReady = onWaveSurferReady;
        capturedDragToSeek = dragToSeek;
        return <div data-testid="waveform-player" />;
      }
    ),
  };
});

// ─── Helpers ─────────────────────────────────────────────────────────────────
import { useSessionStorage } from '../../hooks/useSessionStorage';

const mockSession = {
  sessionId: 'test-session',
  audioFile: {
    name: 'interview.mp3',
    blob: new Blob(['audio'], { type: 'audio/mp3' }),
    file: new File([], 'interview.mp3'),
  },
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

/**
 * Build a mock WaveformPlayerRef whose RegionsPlugin captures event handlers
 * so tests can trigger `region-created`, `region-updated`, etc.
 */
function makePlayer() {
  const handlers: Record<string, Array<(...args: unknown[]) => void>> = {};

  const regions = {
    enableDragSelection: vi.fn(),
    getRegions: vi.fn(
      () =>
        [] as Array<{
          start: number;
          end: number;
          remove: () => void;
          setOptions: (o: unknown) => void;
        }>
    ),
    on: vi.fn((event: string, handler: (...args: unknown[]) => void) => {
      handlers[event] = handlers[event] ?? [];
      handlers[event].push(handler);
    }),
    /** Fire an event, calling all registered handlers */
    emit(event: string, ...args: unknown[]) {
      handlers[event]?.forEach((h) => h(...args));
    },
  };

  const player = {
    wavesurfer: {} as WaveSurfer,
    regions,
    enableRegions: vi.fn(),
    enableRegionSelection: vi.fn(),
    disableRegionSelection: vi.fn(),
    getActiveRegion: vi.fn(() => null),
    clearRegions: vi.fn(),
  } satisfies WaveformPlayerRef;

  return { player, regions };
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('AudioEditingPage — waveform region regression', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    capturedOnWaveSurferReady = undefined;
    capturedDragToSeek = undefined;

    vi.mocked(useSessionStorage).mockReturnValue({
      session: mockSession,
      isLoading: false,
      updateSession: vi.fn(),
      clearSession: vi.fn(),
    });
  });

  // ── Regression 1 ────────────────────────────────────────────────────────
  // Root cause: if dragToSeek is true (default), WaveSurfer's internal drag
  // stream calls preventDefault on pointermove, which RegionsPlugin checks
  // and silently bails, so no region is ever created.
  it('passes dragToSeek={false} to WaveformPlayer', () => {
    render(<AudioEditingPage />);
    expect(capturedDragToSeek).toBe(false);
  });

  // ── Regression 2 ────────────────────────────────────────────────────────
  // Root cause: without calling enableDragSelection the user can never drag
  // to create a region, regardless of dragToSeek.
  it('calls enableDragSelection on the regions plugin when wavesurfer is ready', () => {
    render(<AudioEditingPage />);

    const { player, regions } = makePlayer();
    act(() => {
      capturedOnWaveSurferReady!(player);
    });

    expect(regions.enableDragSelection).toHaveBeenCalledWith(
      expect.objectContaining({ color: expect.any(String) })
    );
  });

  // ── Regression 3 ────────────────────────────────────────────────────────
  // Root cause: if region-created doesn't update React state, the TrimTimeInputs
  // remain empty and the action buttons never switch to "Process selection".
  it('syncs region state to TrimTimeInputs when region-created fires', async () => {
    render(<AudioEditingPage />);

    const { player, regions } = makePlayer();

    // Simulate wavesurfer becoming ready
    act(() => {
      capturedOnWaveSurferReady!(player);
    });

    // Build a fake region with start=10s, end=30s
    const fakeRegion = {
      start: 10,
      end: 30,
      remove: vi.fn(),
      setOptions: vi.fn(),
    };
    regions.getRegions.mockReturnValue([fakeRegion]);

    // Simulate WaveSurfer firing region-created
    act(() => {
      regions.emit('region-created', fakeRegion);
    });

    // TrimTimeInputs renders the times as "M:SS" in the Start/End inputs
    const [startInput, endInput] = screen.getAllByRole('textbox');
    expect(startInput).toHaveValue('0:10');
    expect(endInput).toHaveValue('0:30');
  });

  // ── Regression 4 ────────────────────────────────────────────────────────
  // Drag-resize of an existing region must also keep React state in sync.
  it('syncs region state to TrimTimeInputs when region-updated fires', () => {
    render(<AudioEditingPage />);

    const { player, regions } = makePlayer();
    act(() => {
      capturedOnWaveSurferReady!(player);
    });

    // Create the initial region
    const fakeRegion = { start: 10, end: 30, remove: vi.fn(), setOptions: vi.fn() };
    regions.getRegions.mockReturnValue([fakeRegion]);
    act(() => {
      regions.emit('region-created', fakeRegion);
    });

    // Resize: user drags end handle to 45s
    fakeRegion.end = 45;
    act(() => {
      regions.emit('region-updated');
    });

    const [startInput, endInput] = screen.getAllByRole('textbox');
    expect(startInput).toHaveValue('0:10');
    expect(endInput).toHaveValue('0:45');
  });

  // ── Regression 5 ────────────────────────────────────────────────────────
  // Clearing the region must reset the TrimTimeInputs back to empty.
  it('clears TrimTimeInputs when region-removed fires', () => {
    render(<AudioEditingPage />);

    const { player, regions } = makePlayer();
    act(() => {
      capturedOnWaveSurferReady!(player);
    });

    // Create then remove the region
    const fakeRegion = { start: 10, end: 30, remove: vi.fn(), setOptions: vi.fn() };
    regions.getRegions.mockReturnValue([fakeRegion]);
    act(() => {
      regions.emit('region-created', fakeRegion);
    });

    regions.getRegions.mockReturnValue([]);
    act(() => {
      regions.emit('region-removed');
    });

    const [startInput, endInput] = screen.getAllByRole('textbox');
    expect(startInput).toHaveValue('');
    expect(endInput).toHaveValue('');
  });
});
