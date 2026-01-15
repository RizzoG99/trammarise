import React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { Button } from '../Button/Button';

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
        return <Sun className="w-5 h-5" fill="currentColor" />;
      case 'dark':
        return <Moon className="w-5 h-5" fill="currentColor" />;
      case 'system':
      default:
        return <Monitor className="w-5 h-5" fill="currentColor" />;
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

  const label = getLabel();

  return (
    <Button
      variant="ghost"
      onClick={cycleTheme}
      className={className}
      title={`Current: ${label}. Click to cycle themes`}
      aria-label={`Switch theme (current: ${label})`}
      icon={getIcon()}
    >
      {showLabel && label}
    </Button>
  );
};
