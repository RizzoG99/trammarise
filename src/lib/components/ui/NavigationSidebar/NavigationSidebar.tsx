import type { ReactNode } from 'react';
import { GlassCard } from '../GlassCard';

export interface NavItem {
  id: string;
  label: string;
  icon?: ReactNode;
}

export interface NavigationSidebarProps {
  items: NavItem[];
  activeId: string;
  onSelect: (id: string) => void;
  className?: string;
}

/**
 * NavigationSidebar - Vertical navigation list using GlassCard dark variant.
 * Active item highlighted with left border using --color-primary.
 */
export function NavigationSidebar({
  items,
  activeId,
  onSelect,
  className = '',
}: NavigationSidebarProps) {
  return (
    <GlassCard variant="dark" className={`p-2 ${className}`}>
      <nav aria-label="Settings navigation">
        <ul className="space-y-1">
          {items.map((item) => {
            const isActive = item.id === activeId;
            return (
              <li key={item.id}>
                <button
                  onClick={() => onSelect(item.id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={[
                    'w-full flex items-center gap-3 px-4 py-3 rounded-[var(--radius-md)]',
                    'text-left transition-all duration-[var(--transition-fast)]',
                    'border-l-2',
                    isActive
                      ? 'border-l-[var(--color-primary)] bg-[var(--color-primary)]/10 text-[var(--color-text-primary)]'
                      : 'border-l-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-white/5',
                  ].join(' ')}
                >
                  {item.icon && (
                    <span className="w-5 h-5 shrink-0" aria-hidden="true">
                      {item.icon}
                    </span>
                  )}
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </GlassCard>
  );
}
