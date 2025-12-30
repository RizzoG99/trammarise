import type { ReactNode } from 'react';

export interface SplitPanelLayoutProps {
  summary: ReactNode;
  transcript: ReactNode;
  className?: string;
}

export function SplitPanelLayout({ summary, transcript, className = '' }: SplitPanelLayoutProps) {
  return (
    <div className={`w-full grid grid-cols-1 lg:grid-cols-12 gap-6 ${className}`}>
      {/* Summary Panel - 4 columns on large screens */}
      <div className="lg:col-span-4">
        {summary}
      </div>

      {/* Transcript Panel - 8 columns on large screens */}
      <div className="lg:col-span-8">
        {transcript}
      </div>
    </div>
  );
}
