import { type ReactNode, useId, useRef, useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';

export interface CollapsibleSectionProps {
  title: string;
  isExpanded: boolean;
  onToggle: () => void;
  children: ReactNode;
  icon?: ReactNode;
}

/**
 * CollapsibleSection - Expandable section with animated transitions
 *
 * Features:
 * - **Animated Expand/Collapse**: Smooth height transitions via scrollHeight measurement
 * - **Keyboard Accessible**: Enter/Space to toggle
 * - **ARIA Support**: Proper accessibility attributes
 * - **Rotating Chevron**: Visual indicator of state
 * - **Dark Mode**: Full dark mode support
 *
 * @example
 * ```tsx
 * const [isExpanded, setIsExpanded] = useState(true);
 *
 * <CollapsibleSection
 *   title="Executive Summary"
 *   isExpanded={isExpanded}
 *   onToggle={() => setIsExpanded(!isExpanded)}
 * >
 *   <p>Content goes here...</p>
 * </CollapsibleSection>
 * ```
 *
 * @param props - CollapsibleSection properties
 * @param props.title - Section title displayed in header
 * @param props.isExpanded - Whether section is expanded
 * @param props.onToggle - Callback when section is toggled
 * @param props.children - Content to show when expanded
 * @param props.icon - Optional icon to show in header
 */
export function CollapsibleSection({
  title,
  isExpanded,
  onToggle,
  children,
  icon,
}: CollapsibleSectionProps) {
  const contentId = useId();
  const innerRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState(0);

  // Measure and track content height so the animation always fits the real content.
  useEffect(() => {
    if (!innerRef.current) return;
    const el = innerRef.current;
    const update = () => setContentHeight(el.scrollHeight);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onToggle();
    }
  };

  return (
    <div
      className={`
        rounded-xl overflow-hidden transition-all duration-200
        border shadow-sm
        ${isExpanded ? 'border-primary/30 shadow-primary/5' : 'border-border hover:border-border-hover'}
      `}
    >
      {/* Header */}
      <button
        type="button"
        className={`
          w-full flex items-center justify-between gap-3 px-4 py-3
          transition-all duration-200 cursor-pointer
          focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-inset
          ${isExpanded ? 'bg-primary/8 border-b border-primary/20' : 'bg-bg-surface hover:bg-bg-surface-hover'}
        `}
        onClick={onToggle}
        onKeyDown={handleKeyDown}
        aria-expanded={isExpanded}
        aria-controls={contentId}
      >
        <div className="flex items-center gap-2.5">
          {icon && <span className="flex-shrink-0">{icon}</span>}
          <span
            className={`
              text-sm font-semibold text-left tracking-wide
              ${isExpanded ? 'text-primary' : 'text-text-secondary'}
            `}
          >
            {title}
          </span>
        </div>

        <div
          className={`
          flex items-center justify-center w-5 h-5 rounded-full flex-shrink-0
          transition-all duration-300
          ${isExpanded ? 'bg-primary/15 text-primary' : 'text-text-tertiary'}
        `}
        >
          <ChevronDown
            className={`
              w-3.5 h-3.5
              transition-transform duration-300
              ${isExpanded ? 'rotate-180' : 'rotate-0'}
            `}
            aria-hidden="true"
          />
        </div>
      </button>

      {/* Content — height animated via measured scrollHeight so all content is always visible. */}
      <div
        id={contentId}
        style={{
          height: isExpanded ? contentHeight : 0,
          overflow: 'hidden',
          opacity: isExpanded ? 1 : 0,
          transition: 'height 300ms ease-in-out, opacity 300ms ease-in-out',
        }}
        aria-hidden={!isExpanded}
      >
        <div ref={innerRef} className="p-4">
          {children}
        </div>
      </div>
    </div>
  );
}
