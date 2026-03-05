import { useEffect, useLayoutEffect, useRef, useState } from 'react';

export interface WaveformVisualizationProps {
  isRecording: boolean;
  isPaused?: boolean;
}

type WavePhase = 'idle' | 'entering' | 'active' | 'exiting';

const BARS = [30, 60, 45, 75, 50, 80, 55, 70, 40, 85, 50, 65, 45, 70, 55, 75, 40, 60, 50, 70];

// Timings
const ENTER_MS = 300; // bars compress to animation start height + fade in
const DIM_MS = 180; // quick dim on stop (masks the height snap)
const SETTLE_MS = 450; // fade from dim back to idle opacity

export function WaveformVisualization({
  isRecording,
  isPaused = false,
}: WaveformVisualizationProps) {
  const reducedMotion =
    typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false;

  const [phase, setPhase] = useState<WavePhase>('idle');
  const phaseRef = useRef<WavePhase>('idle');
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  // Keep ref in sync so the isAnimating effect can read the latest phase
  // without adding phase to its dependency array.
  useLayoutEffect(() => {
    phaseRef.current = phase;
  });

  const isAnimating = isRecording && !isPaused;

  useEffect(() => {
    clearTimeout(timerRef.current);

    if (isAnimating) {
      if (reducedMotion) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setPhase('active');
      } else {
        // Step 1: compress all bars to animation start height + brighten
        setPhase('entering');
        // Step 2: start animation once bars have settled
        timerRef.current = setTimeout(() => setPhase('active'), ENTER_MS);
      }
    } else if (phaseRef.current === 'active' || phaseRef.current === 'entering') {
      if (reducedMotion) {
        setPhase('idle');
      } else {
        // Quickly dim to near-invisible (masks the height snap as animation stops),
        // then after bars settle at resting heights, fade back to idle opacity.
        setPhase('exiting');
        timerRef.current = setTimeout(() => setPhase('idle'), DIM_MS + SETTLE_MS);
      }
    }

    return () => clearTimeout(timerRef.current);
  }, [isAnimating]); // eslint-disable-line react-hooks/exhaustive-deps

  const getBarHeight = (restingHeight: number) => {
    // During entering/active the animation controls height (starts at 20%),
    // so set inline to 20% to avoid a jump when the animation kicks in.
    if (phase === 'entering' || phase === 'active') return '20%';
    return `${restingHeight}%`;
  };

  const getOpacity = () => {
    if (phase === 'idle') return 0.45;
    if (phase === 'exiting') return 0.08; // near-invisible → height snap is hidden
    return 1; // entering, active
  };

  const getTransition = () => {
    if (reducedMotion || phase === 'active') return 'none';
    if (phase === 'entering') return `height ${ENTER_MS}ms ease-in-out, opacity ${ENTER_MS}ms ease`;
    if (phase === 'exiting')
      // Height transition runs behind the dim (barely visible at opacity 0.08)
      return `opacity ${DIM_MS}ms ease, height ${DIM_MS + 100}ms ease`;
    if (phase === 'idle')
      // Reveal resting bars with a gentle fade-in
      return `opacity ${SETTLE_MS}ms ease`;
    return 'none';
  };

  return (
    <div className="flex items-center justify-center gap-1 h-24">
      {BARS.map((height, index) => (
        <div
          key={index}
          className={`w-1.5 rounded-full ${phase === 'active' ? 'waveform-bar' : ''}`}
          style={{
            height: getBarHeight(height),
            background: 'linear-gradient(to top, var(--color-primary), var(--color-primary-light))',
            animationDelay: `${index * 0.05}s`,
            opacity: getOpacity(),
            transition: getTransition(),
          }}
        />
      ))}
    </div>
  );
}
