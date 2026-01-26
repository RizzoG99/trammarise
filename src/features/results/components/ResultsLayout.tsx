import type { ReactNode } from 'react';

/**
 * Props for ResultsLayout component
 */
interface ResultsLayoutProps {
  /** Header with title and export functionality */
  header: ReactNode;
  /** Sticky audio player bar */
  audioPlayer: ReactNode;
  /** Summary panel content (left, 40%) */
  summaryPanel: ReactNode;
  /** Transcript panel content (right, 60%) */
  transcriptPanel: ReactNode;
  /** Floating chat button */
  floatingChatButton: ReactNode;
  /** Chat modal (conditional) */
  chatModal?: ReactNode;
}

/**
 * Main layout orchestrator for Results Page.
 *
 * Implements mockup design with:
 * - Sticky audio player at top
 * - Two-column split: Summary (40%) | Transcript (60%)
 * - Floating chat button (bottom-right)
 * - Chat modal (conditional)
 *
 * Responsive:
 * - Mobile (<1024px): Vertical stack
 * - Desktop (≥1024px): Side-by-side split
 */
export function ResultsLayout({
  header,
  audioPlayer,
  summaryPanel,
  transcriptPanel,
  floatingChatButton,
  chatModal,
}: ResultsLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-background)]">
      {/* Header: Editable title + Export button */}
      {header}

      {/* Audio Player Bar */}
      <div className="z-40">{audioPlayer}</div>

      {/* Main Content: Split Panel Layout */}
      <div className="flex-1 w-full max-w-[1400px] mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Summary Panel - 5 columns (40%) on large screens */}
          <div className="lg:col-span-5 h-fit">{summaryPanel}</div>

          {/* Transcript Panel - 7 columns (60%) on large screens */}
          <div className="lg:col-span-7 h-fit">{transcriptPanel}</div>
        </div>
      </div>

      {/* Floating Chat Button (bottom-right) */}
      {floatingChatButton}

      {/* Chat Modal (conditional) */}
      {chatModal}
    </div>
  );
}
