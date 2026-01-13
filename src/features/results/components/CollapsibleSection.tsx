import { type ReactNode, useId } from 'react';
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
 * - **Animated Expand/Collapse**: Smooth CSS transitions
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

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onToggle();
    }
  };

  return (
    <div className="border border-border rounded-lg overflow-hidden transition-colors">
      {/* Header */}
      <button
        type="button"
        className={`
          w-full flex items-center justify-between gap-3 p-4
          bg-surface hover:bg-surface-hover
          transition-colors cursor-pointer
          focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
          ${isExpanded ? 'border-b border-border' : ''}
        `}
        onClick={onToggle}
        onKeyDown={handleKeyDown}
        aria-expanded={isExpanded}
        aria-controls={contentId}
      >
        <div className="flex items-center gap-3">
          {icon && <span className="flex-shrink-0">{icon}</span>}
          <span className={`
            font-semibold text-left
            ${isExpanded ? 'text-primary' : 'text-text-primary'}
          `}>
            {title}
          </span>
        </div>

        <ChevronDown
          className={`
            w-5 h-5 text-text-secondary flex-shrink-0
            transition-transform duration-300
            ${isExpanded ? 'rotate-180' : 'rotate-0'}
          `}
          aria-hidden="true"
        />
      </button>

      {/* Content */}
      <div
        id={contentId}
        className={`
          overflow-hidden transition-all duration-300 ease-in-out
          ${isExpanded ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0'}
        `}
        aria-hidden={!isExpanded}
      >
        <div className="p-4 bg-surface">
          {children}
        </div>
      </div>
    </div>
  );
}
