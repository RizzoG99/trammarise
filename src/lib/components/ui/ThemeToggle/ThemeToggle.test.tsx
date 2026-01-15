import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeToggle } from './ThemeToggle';
import type { ThemeMode } from './ThemeToggle';

describe('ThemeToggle', () => {
  const mockOnThemeChange = vi.fn();

  const defaultProps = {
    theme: 'system' as ThemeMode,
    onThemeChange: mockOnThemeChange,
  };

  beforeEach(() => {
    mockOnThemeChange.mockClear();
  });

  describe('Rendering', () => {
    it('renders button element', () => {
      render(<ThemeToggle {...defaultProps} />);
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('renders without label by default', () => {
      render(<ThemeToggle {...defaultProps} />);
      expect(screen.queryByText('System')).not.toBeInTheDocument();
    });

    it('renders with label when showLabel is true', () => {
      render(<ThemeToggle {...defaultProps} showLabel={true} />);
      expect(screen.getByText('System')).toBeInTheDocument();
    });
  });

  describe('Icons', () => {
    it('shows system icon when theme is system', () => {
      render(<ThemeToggle {...defaultProps} theme="system" />);
      const button = screen.getByRole('button');
      // lucide-react icons render as SVG
      const svg = button.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('shows sun icon when theme is light', () => {
      render(<ThemeToggle {...defaultProps} theme="light" />);
      const button = screen.getByRole('button');
      // lucide-react icons render as SVG
      const svg = button.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('shows moon icon when theme is dark', () => {
      render(<ThemeToggle {...defaultProps} theme="dark" />);
      const button = screen.getByRole('button');
      // lucide-react icons render as SVG
      const svg = button.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });
  });

  describe('Labels', () => {
    it('shows "System" label when theme is system', () => {
      render(<ThemeToggle {...defaultProps} theme="system" showLabel={true} />);
      expect(screen.getByText('System')).toBeInTheDocument();
    });

    it('shows "Light" label when theme is light', () => {
      render(<ThemeToggle {...defaultProps} theme="light" showLabel={true} />);
      expect(screen.getByText('Light')).toBeInTheDocument();
    });

    it('shows "Dark" label when theme is dark', () => {
      render(<ThemeToggle {...defaultProps} theme="dark" showLabel={true} />);
      expect(screen.getByText('Dark')).toBeInTheDocument();
    });
  });

  describe('Theme Cycling', () => {
    it('cycles from system to light', () => {
      render(<ThemeToggle {...defaultProps} theme="system" />);
      const button = screen.getByRole('button');

      fireEvent.click(button);

      expect(mockOnThemeChange).toHaveBeenCalledWith('light');
      expect(mockOnThemeChange).toHaveBeenCalledTimes(1);
    });

    it('cycles from light to dark', () => {
      render(<ThemeToggle {...defaultProps} theme="light" />);
      const button = screen.getByRole('button');

      fireEvent.click(button);

      expect(mockOnThemeChange).toHaveBeenCalledWith('dark');
      expect(mockOnThemeChange).toHaveBeenCalledTimes(1);
    });

    it('cycles from dark to system', () => {
      render(<ThemeToggle {...defaultProps} theme="dark" />);
      const button = screen.getByRole('button');

      fireEvent.click(button);

      expect(mockOnThemeChange).toHaveBeenCalledWith('system');
      expect(mockOnThemeChange).toHaveBeenCalledTimes(1);
    });

    it('cycles through all themes in order', () => {
      const { rerender } = render(<ThemeToggle {...defaultProps} theme="system" />);
      const button = screen.getByRole('button');

      // System → Light
      fireEvent.click(button);
      expect(mockOnThemeChange).toHaveBeenCalledWith('light');

      // Simulate theme change
      rerender(<ThemeToggle {...defaultProps} theme="light" />);

      // Light → Dark
      fireEvent.click(button);
      expect(mockOnThemeChange).toHaveBeenCalledWith('dark');

      // Simulate theme change
      rerender(<ThemeToggle {...defaultProps} theme="dark" />);

      // Dark → System
      fireEvent.click(button);
      expect(mockOnThemeChange).toHaveBeenCalledWith('system');

      expect(mockOnThemeChange).toHaveBeenCalledTimes(3);
    });
  });

  describe('Accessibility', () => {
    it('has proper aria-label for system theme', () => {
      render(<ThemeToggle {...defaultProps} theme="system" />);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute(
        'aria-label',
        'Switch theme (current: System)'
      );
    });

    it('has proper aria-label for light theme', () => {
      render(<ThemeToggle {...defaultProps} theme="light" />);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute(
        'aria-label',
        'Switch theme (current: Light)'
      );
    });

    it('has proper aria-label for dark theme', () => {
      render(<ThemeToggle {...defaultProps} theme="dark" />);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute(
        'aria-label',
        'Switch theme (current: Dark)'
      );
    });

    it('has title attribute with hint text for system', () => {
      render(<ThemeToggle {...defaultProps} theme="system" />);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute(
        'title',
        'Current: System. Click to cycle themes'
      );
    });

    it('has title attribute with hint text for light', () => {
      render(<ThemeToggle {...defaultProps} theme="light" />);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute(
        'title',
        'Current: Light. Click to cycle themes'
      );
    });

    it('has title attribute with hint text for dark', () => {
      render(<ThemeToggle {...defaultProps} theme="dark" />);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute(
        'title',
        'Current: Dark. Click to cycle themes'
      );
    });

    it('has type="button"', () => {
      render(<ThemeToggle {...defaultProps} />);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'button');
    });

    it('SVG icons have aria-hidden="true"', () => {
      render(<ThemeToggle {...defaultProps} />);
      const svg = document.querySelector('svg');
      expect(svg).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('Custom Styling', () => {
    it('applies custom className', () => {
      render(<ThemeToggle {...defaultProps} className="custom-toggle" />);
      const button = screen.getByRole('button');
      expect(button.className).toContain('custom-toggle');
    });

    it('preserves default classes with custom className', () => {
      render(<ThemeToggle {...defaultProps} className="custom-class" />);
      const button = screen.getByRole('button');
      expect(button.className).toContain('flex');
      expect(button.className).toContain('custom-class');
    });
  });

  describe('Edge Cases', () => {
    it('handles multiple rapid clicks', () => {
      const { rerender } = render(<ThemeToggle {...defaultProps} theme="system" />);
      const button = screen.getByRole('button');

      // First click: system → light
      fireEvent.click(button);
      expect(mockOnThemeChange).toHaveBeenNthCalledWith(1, 'light');

      // Simulate parent updating theme
      rerender(<ThemeToggle {...defaultProps} theme="light" />);

      // Second click: light → dark
      fireEvent.click(button);
      expect(mockOnThemeChange).toHaveBeenNthCalledWith(2, 'dark');

      // Simulate parent updating theme
      rerender(<ThemeToggle {...defaultProps} theme="dark" />);

      // Third click: dark → system
      fireEvent.click(button);
      expect(mockOnThemeChange).toHaveBeenNthCalledWith(3, 'system');

      // Simulate parent updating theme
      rerender(<ThemeToggle {...defaultProps} theme="system" />);

      // Fourth click: system → light
      fireEvent.click(button);
      expect(mockOnThemeChange).toHaveBeenNthCalledWith(4, 'light');

      expect(mockOnThemeChange).toHaveBeenCalledTimes(4);
      // Last call should be 'light' (full cycle + 1)
      expect(mockOnThemeChange).toHaveBeenLastCalledWith('light');
    });

    it('works with showLabel and className together', () => {
      render(
        <ThemeToggle
          {...defaultProps}
          theme="light"
          showLabel={true}
          className="custom-class"
        />
      );

      expect(screen.getByText('Light')).toBeInTheDocument();
      const button = screen.getByRole('button');
      expect(button.className).toContain('custom-class');
    });

    it('updates aria-label when theme changes', () => {
      const { rerender } = render(<ThemeToggle {...defaultProps} theme="system" />);
      let button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Switch theme (current: System)');

      rerender(<ThemeToggle {...defaultProps} theme="light" />);
      button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Switch theme (current: Light)');

      rerender(<ThemeToggle {...defaultProps} theme="dark" />);
      button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Switch theme (current: Dark)');
    });

    it('updates icon when theme changes', () => {
      const { rerender } = render(<ThemeToggle {...defaultProps} theme="light" />);
      let svg = document.querySelector('svg');
      expect(svg).toBeInTheDocument();

      rerender(<ThemeToggle {...defaultProps} theme="dark" />);
      svg = document.querySelector('svg');
      expect(svg).toBeInTheDocument();

      rerender(<ThemeToggle {...defaultProps} theme="system" />);
      svg = document.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('updates label text when theme changes and showLabel is true', () => {
      const { rerender } = render(
        <ThemeToggle {...defaultProps} theme="system" showLabel={true} />
      );
      expect(screen.getByText('System')).toBeInTheDocument();

      rerender(<ThemeToggle {...defaultProps} theme="light" showLabel={true} />);
      expect(screen.getByText('Light')).toBeInTheDocument();
      expect(screen.queryByText('System')).not.toBeInTheDocument();

      rerender(<ThemeToggle {...defaultProps} theme="dark" showLabel={true} />);
      expect(screen.getByText('Dark')).toBeInTheDocument();
      expect(screen.queryByText('Light')).not.toBeInTheDocument();
    });
  });

  describe('Integration', () => {
    it('simulates full theme cycle interaction', () => {
      const { rerender } = render(<ThemeToggle {...defaultProps} theme="system" showLabel={true} />);

      // Initial state
      expect(screen.getByText('System')).toBeInTheDocument();

      // Click to cycle to light
      const button = screen.getByRole('button');
      fireEvent.click(button);
      expect(mockOnThemeChange).toHaveBeenCalledWith('light');

      // Simulate app updating theme
      rerender(<ThemeToggle {...defaultProps} theme="light" showLabel={true} />);
      expect(screen.getByText('Light')).toBeInTheDocument();

      // Click to cycle to dark
      fireEvent.click(button);
      expect(mockOnThemeChange).toHaveBeenCalledWith('dark');

      // Simulate app updating theme
      rerender(<ThemeToggle {...defaultProps} theme="dark" showLabel={true} />);
      expect(screen.getByText('Dark')).toBeInTheDocument();

      // Click to cycle back to system
      fireEvent.click(button);
      expect(mockOnThemeChange).toHaveBeenCalledWith('system');

      expect(mockOnThemeChange).toHaveBeenCalledTimes(3);
    });
  });
});
