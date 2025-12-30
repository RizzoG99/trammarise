import React from 'react';

/**
 * Theme mode options
 */
export type ThemeMode = 'system' | 'light' | 'dark';

/**
 * Theme toggle component properties
 */
export interface ThemeToggleProps {
  /** Current theme mode */
  theme: ThemeMode;
  /** Callback when theme should change */
  onThemeChange: (theme: ThemeMode) => void;
  /** Additional CSS classes */
  className?: string;
  /** Show theme label text */
  showLabel?: boolean;
}

/**
 * Sun icon for light mode
 */
const SunIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    className="w-5 h-5"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="5" />
    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
  </svg>
);

/**
 * Moon icon for dark mode
 */
const MoonIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    className="w-5 h-5"
    aria-hidden="true"
  >
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

/**
 * Monitor icon for system theme
 */
const SystemIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    className="w-5 h-5"
    aria-hidden="true"
  >
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
    <line x1="8" y1="21" x2="16" y2="21" />
    <line x1="12" y1="17" x2="12" y2="21" />
  </svg>
);

/**
 * A theme toggle button that cycles through system, light, and dark modes.
 *
 * Features:
 * - **3 theme modes**: System (auto), Light, and Dark
 * - **Visual icons**: Sun for light, Moon for dark, Monitor for system
 * - **Cycle behavior**: Clicks cycle through: System → Light → Dark → System
 * - **Dark mode support**: Styles adapt to current theme
 * - **Accessible**: Proper ARIA labels and title hints
 * - **Optional label**: Can show theme name text alongside icon
 *
 * @example
 * ```tsx
 * // Basic usage (icon only)
 * <ThemeToggle
 *   theme={currentTheme}
 *   onThemeChange={setTheme}
 * />
 *
 * // With label text
 * <ThemeToggle
 *   theme={currentTheme}
 *   onThemeChange={setTheme}
 *   showLabel={true}
 * />
 *
 * // With useTheme hook
 * const { theme, setTheme } = useTheme();
 * <ThemeToggle theme={theme} onThemeChange={setTheme} />
 * ```
 *
 * @param props - ThemeToggle properties
 * @param props.theme - Current active theme mode
 * @param props.onThemeChange - Callback when user cycles to next theme
 * @param props.className - Additional CSS classes to apply
 * @param props.showLabel - If true, displays theme name text next to icon
 *
 * @returns Theme toggle button element
 */
export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  theme,
  onThemeChange,
  className = '',
  showLabel = false,
}) => {
  /**
   * Cycles to the next theme in order: system → light → dark → system
   */
  const cycleTheme = () => {
    const themeOrder: ThemeMode[] = ['system', 'light', 'dark'];
    const currentIndex = themeOrder.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themeOrder.length;
    onThemeChange(themeOrder[nextIndex]);
  };

  /**
   * Gets the icon component for current theme
   */
  const getIcon = (): React.JSX.Element => {
    switch (theme) {
      case 'light':
        return <SunIcon />;
      case 'dark':
        return <MoonIcon />;
      case 'system':
      default:
        return <SystemIcon />;
    }
  };

  /**
   * Gets the display label for current theme
   */
  const getLabel = (): string => {
    switch (theme) {
      case 'light':
        return 'Light';
      case 'dark':
        return 'Dark';
      case 'system':
      default:
        return 'System';
    }
  };

  const baseStyles =
    'flex items-center justify-center gap-2 p-2.5 ' +
    'bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600 ' +
    'rounded-lg shadow-lg hover:bg-slate-50 dark:hover:bg-slate-700 ' +
    'transition-all';

  const classes = `${baseStyles} ${className}`.trim();
  const label = getLabel();

  return (
    <button
      onClick={cycleTheme}
      className={classes}
      title={`Current: ${label}. Click to cycle themes`}
      aria-label={`Switch theme (current: ${label})`}
      type="button"
    >
      <span className="text-slate-900 dark:text-white">{getIcon()}</span>
      {showLabel && (
        <span className="text-sm font-medium text-slate-900 dark:text-white">
          {label}
        </span>
      )}
    </button>
  );
};
