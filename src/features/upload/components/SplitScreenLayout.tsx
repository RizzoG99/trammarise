import type { ReactNode } from 'react';

export interface SplitScreenLayoutProps {
  left: ReactNode;
  right: ReactNode;
  className?: string;
}

export function SplitScreenLayout({ left, right, className = '' }: SplitScreenLayoutProps) {
  return (
    <div className={`w-full grid grid-cols-1 md:grid-cols-2 gap-6 ${className}`}>
      {/* Left Panel */}
      <div className="flex flex-col">
        {left}
      </div>

      {/* Right Panel */}
      <div className="flex flex-col">
        {right}
      </div>
    </div>
  );
}
