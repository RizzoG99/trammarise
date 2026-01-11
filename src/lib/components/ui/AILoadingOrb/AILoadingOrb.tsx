import { useState } from 'react';
import './AILoadingOrb.css';

/**
 * AILoadingOrb component properties
 */
export interface AILoadingOrbProps {
  /** Size of the orb in pixels (default: 120) */
  size?: number;
}

/**
 * Animated AI loading orb with multi-layered blob effects.
 *
 * Features:
 * - **Multi-layer blobs**: 3 animated gradient layers with radial gradients
 * - **Floating particles**: 4 independent particles with unique animations
 * - **Glow effects**: SVG blur filters for depth and luminosity
 * - **Color animations**: Smooth transitions between purple, blue, pink, and cyan
 * - **Dark mode**: Adaptive glow intensity based on theme
 * - **Accessibility**: Respects `prefers-reduced-motion` setting
 * - **Responsive**: Configurable size for different use cases
 *
 * @example
 * ```tsx
 * // Default size (120px)
 * <AILoadingOrb />
 *
 * // Custom size
 * <AILoadingOrb size={160} />
 * ```
 *
 * @param props - AILoadingOrb properties
 * @param props.size - Size of the orb in pixels (default: 120)
 *
 * @returns Animated AI loading orb element
 */
export function AILoadingOrb({ size = 120 }: AILoadingOrbProps) {
  // Start animating immediately on mount
  const [isAnimating] = useState(true);

  return (
    <div
      className={`ai-loading-orb ${isAnimating ? 'animating' : ''}`}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ overflow: 'visible' }}
      >
        {/* Define gradients */}
        <defs>
          {/* Primary gradient - Purple to Blue */}
          <radialGradient id="gradient1" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.8">
              <animate
                attributeName="stop-color"
                values="#8b5cf6;#6366f1;#3b82f6;#8b5cf6"
                dur="4s"
                repeatCount="indefinite"
              />
            </stop>
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.4">
              <animate
                attributeName="stop-color"
                values="#3b82f6;#8b5cf6;#6366f1;#3b82f6"
                dur="4s"
                repeatCount="indefinite"
              />
            </stop>
          </radialGradient>

          {/* Secondary gradient - Pink to Purple */}
          <radialGradient id="gradient2" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ec4899" stopOpacity="0.6">
              <animate
                attributeName="stop-color"
                values="#ec4899;#a855f7;#8b5cf6;#ec4899"
                dur="3s"
                repeatCount="indefinite"
              />
            </stop>
            <stop offset="100%" stopColor="#a855f7" stopOpacity="0.3">
              <animate
                attributeName="stop-color"
                values="#a855f7;#ec4899;#8b5cf6;#a855f7"
                dur="3s"
                repeatCount="indefinite"
              />
            </stop>
          </radialGradient>

          {/* Tertiary gradient - Cyan to Blue */}
          <radialGradient id="gradient3" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.5">
              <animate
                attributeName="stop-color"
                values="#06b6d4;#3b82f6;#6366f1;#06b6d4"
                dur="5s"
                repeatCount="indefinite"
              />
            </stop>
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.2">
              <animate
                attributeName="stop-color"
                values="#3b82f6;#06b6d4;#8b5cf6;#3b82f6"
                dur="5s"
                repeatCount="indefinite"
              />
            </stop>
          </radialGradient>

          {/* Blur filter for glow effect */}
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background layer - largest blob */}
        <circle
          className="orb-layer orb-layer-1"
          cx="60"
          cy="60"
          r="35"
          fill="url(#gradient1)"
          filter="url(#glow)"
        >
          <animate
            attributeName="r"
            values="35;40;35"
            dur="3s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="0.6;0.8;0.6"
            dur="3s"
            repeatCount="indefinite"
          />
        </circle>

        {/* Middle layer - medium blob */}
        <ellipse
          className="orb-layer orb-layer-2"
          cx="60"
          cy="60"
          rx="28"
          ry="30"
          fill="url(#gradient2)"
          filter="url(#glow)"
        >
          <animate
            attributeName="rx"
            values="28;32;26;28"
            dur="4s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="ry"
            values="30;26;32;30"
            dur="4s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="0.7;0.9;0.7"
            dur="4s"
            repeatCount="indefinite"
          />
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 60 60"
            to="360 60 60"
            dur="10s"
            repeatCount="indefinite"
          />
        </ellipse>

        {/* Front layer - small blob */}
        <ellipse
          className="orb-layer orb-layer-3"
          cx="60"
          cy="60"
          rx="20"
          ry="22"
          fill="url(#gradient3)"
          filter="url(#glow)"
        >
          <animate
            attributeName="rx"
            values="20;24;18;20"
            dur="2.5s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="ry"
            values="22;18;24;22"
            dur="2.5s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="0.8;1;0.8"
            dur="2.5s"
            repeatCount="indefinite"
          />
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 60 60"
            to="-360 60 60"
            dur="8s"
            repeatCount="indefinite"
          />
        </ellipse>

        {/* Core glow - brightest center */}
        <circle
          className="orb-core"
          cx="60"
          cy="60"
          r="12"
          fill="white"
          opacity="0.6"
          filter="url(#glow)"
        >
          <animate
            attributeName="r"
            values="12;15;12"
            dur="2s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="0.6;0.9;0.6"
            dur="2s"
            repeatCount="indefinite"
          />
        </circle>

        {/* Particle effects - small floating dots */}
        <circle className="particle particle-1" cx="30" cy="40" r="2" fill="#8b5cf6" opacity="0.5">
          <animate
            attributeName="cy"
            values="40;35;40"
            dur="3s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="0.5;0.8;0.5"
            dur="3s"
            repeatCount="indefinite"
          />
        </circle>
        <circle className="particle particle-2" cx="90" cy="45" r="1.5" fill="#3b82f6" opacity="0.4">
          <animate
            attributeName="cy"
            values="45;50;45"
            dur="2.5s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="0.4;0.7;0.4"
            dur="2.5s"
            repeatCount="indefinite"
          />
        </circle>
        <circle className="particle particle-3" cx="40" cy="85" r="2.5" fill="#ec4899" opacity="0.3">
          <animate
            attributeName="cx"
            values="40;45;40"
            dur="4s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="0.3;0.6;0.3"
            dur="4s"
            repeatCount="indefinite"
          />
        </circle>
        <circle className="particle particle-4" cx="85" cy="80" r="1.8" fill="#06b6d4" opacity="0.4">
          <animate
            attributeName="cx"
            values="85;80;85"
            dur="3.5s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="cy"
            values="80;75;80"
            dur="3.5s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="0.4;0.7;0.4"
            dur="3.5s"
            repeatCount="indefinite"
          />
        </circle>
      </svg>
    </div>
  );
}
