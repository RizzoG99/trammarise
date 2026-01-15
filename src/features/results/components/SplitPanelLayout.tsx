import type { ReactNode } from 'react';

export interface SplitPanelLayoutProps {
  summary: ReactNode;
  transcript: ReactNode;
  className?: string;
}

export function SplitPanelLayout({ summary, transcript, className = '' }: SplitPanelLayoutProps) {
  return (
    <div className={`w-full grid grid-cols-1 lg:grid-cols-12 gap-6 ${className}`}>
      {/* Summary Panel - 5 columns (40%) on large screens */}
      <div className="lg:col-span-5">
        {summary}
      </div>

      {/* Transcript Panel - 7 columns (60%) on large screens */}
      <div className="lg:col-span-7">
        {transcript}
      </div>
    </div>
  );
}
