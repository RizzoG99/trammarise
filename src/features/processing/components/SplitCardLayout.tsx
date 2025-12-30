import type { ReactNode } from 'react';

export interface SplitCardLayoutProps {
  left: ReactNode;
  right: ReactNode;
  className?: string;
}

export function SplitCardLayout({ left, right, className = '' }: SplitCardLayoutProps) {
  return (
    <div className={`w-full grid grid-cols-1 lg:grid-cols-2 gap-6 ${className}`}>
      {/* Left Panel - Progress Circle */}
      <div className="flex items-center justify-center">
        {left}
      </div>

      {/* Right Panel - Step Checklist */}
      <div className="flex flex-col">
        {right}
      </div>
    </div>
  );
}
