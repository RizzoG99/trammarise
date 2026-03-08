import type { ReactNode } from 'react';

/**
 * Props for ResultsLayout component
 */
interface ResultsLayoutProps {
  /** Sticky audio player bar */
  audioPlayer: ReactNode;
  /** Summary panel content (left, 40%) */
  summaryPanel: ReactNode;
  /** Transcript panel content (right, 60%) */
  transcriptPanel: ReactNode;
  /** Floating chat button */
  floatingChatButton: ReactNode;
  /** Chat side panel (conditional) */
  chatPanel?: ReactNode;
  /** Whether the chat panel is currently open */
  isChatOpen?: boolean;
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
  audioPlayer,
  summaryPanel,
  transcriptPanel,
  floatingChatButton,
  chatPanel,
  isChatOpen = false,
}: ResultsLayoutProps) {
  return (
    <div className="flex flex-col bg-bg-primary overflow-x-hidden">
      {/* Header is now handled by AppLayout/HeaderContext */}

      {/* Audio Player Bar — sticky so it stays visible while transcript scrolls */}
      <div className="sticky top-0 z-40">{audioPlayer}</div>

      {/* Main Content: Split Panel Layout */}
      <div className="flex-1 w-full max-w-[1600px] mx-auto p-4 lg:p-6 transition-all duration-300">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative items-start">
          {/* Summary Panel - 4 cols when chat open, 5 cols when chat closed */}
          <div
            className={`transition-all duration-300 ${isChatOpen ? 'lg:col-span-4 hidden lg:block' : 'lg:col-span-5'}`}
          >
            {summaryPanel}
          </div>

          {/* Transcript Panel - 5 cols when chat open, 7 cols when chat closed */}
          <div
            className={`transition-all duration-300 ${isChatOpen ? 'lg:col-span-5' : 'lg:col-span-7'}`}
          >
            {transcriptPanel}
          </div>

          {/* Chat Panel - 3 cols when chat open */}
          {isChatOpen && <div className="lg:col-span-3 hidden lg:block h-full">{chatPanel}</div>}
        </div>
      </div>

      {/* Mobile Chat render outside the grid for proper fixed positioning overlay */}
      <div className="lg:hidden">{isChatOpen && chatPanel}</div>

      {/* Floating Chat Button (bottom-right) */}
      {!isChatOpen && floatingChatButton}
    </div>
  );
}
