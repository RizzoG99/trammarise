import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CollapsibleSection } from './CollapsibleSection';

describe('CollapsibleSection', () => {
  const mockOnToggle = vi.fn();

  beforeEach(() => {
    mockOnToggle.mockClear();
  });

  describe('Rendering', () => {
    it('renders title', () => {
      render(
        <CollapsibleSection title="Test Section" isExpanded={false} onToggle={mockOnToggle}>
          <div>Content</div>
        </CollapsibleSection>
      );
      expect(screen.getByText('Test Section')).toBeInTheDocument();
    });

    it('renders children when expanded', () => {
      render(
        <CollapsibleSection title="Section" isExpanded={true} onToggle={mockOnToggle}>
          <div>Visible Content</div>
        </CollapsibleSection>
      );
      expect(screen.getByText('Visible Content')).toBeInTheDocument();
    });

    it('renders children when collapsed (with aria-hidden)', () => {
      render(
        <CollapsibleSection title="Section" isExpanded={false} onToggle={mockOnToggle}>
          <div>Hidden Content</div>
        </CollapsibleSection>
      );
      // Content is in DOM but hidden with aria-hidden
      expect(screen.getByText('Hidden Content')).toBeInTheDocument();
    });

    it('renders optional icon', () => {
      render(
        <CollapsibleSection
          title="Section"
          isExpanded={false}
          onToggle={mockOnToggle}
          icon={<span data-testid="custom-icon">📄</span>}
        >
          <div>Content</div>
        </CollapsibleSection>
      );
      expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
    });

    it('does not render icon when not provided', () => {
      render(
        <CollapsibleSection title="Section" isExpanded={false} onToggle={mockOnToggle}>
          <div>Content</div>
        </CollapsibleSection>
      );
      // Only the chevron icon should be present
      const { container } = render(
        <CollapsibleSection title="Section" isExpanded={false} onToggle={mockOnToggle}>
          <div>Content</div>
        </CollapsibleSection>
      );
      expect(container.querySelector('[data-testid="custom-icon"]')).not.toBeInTheDocument();
    });

    it('renders chevron icon', () => {
      const { container } = render(
        <CollapsibleSection title="Section" isExpanded={false} onToggle={mockOnToggle}>
          <div>Content</div>
        </CollapsibleSection>
      );
      // ChevronDown icon should be present
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('calls onToggle when header is clicked', () => {
      render(
        <CollapsibleSection title="Click Me" isExpanded={false} onToggle={mockOnToggle}>
          <div>Content</div>
        </CollapsibleSection>
      );
      const button = screen.getByRole('button', { name: /Click Me/i });
      fireEvent.click(button);
      expect(mockOnToggle).toHaveBeenCalledTimes(1);
    });

    it('calls onToggle when Enter key is pressed', () => {
      render(
        <CollapsibleSection title="Section" isExpanded={false} onToggle={mockOnToggle}>
          <div>Content</div>
        </CollapsibleSection>
      );
      const button = screen.getByRole('button');
      fireEvent.keyDown(button, { key: 'Enter' });
      expect(mockOnToggle).toHaveBeenCalledTimes(1);
    });

    it('calls onToggle when Space key is pressed', () => {
      render(
        <CollapsibleSection title="Section" isExpanded={false} onToggle={mockOnToggle}>
          <div>Content</div>
        </CollapsibleSection>
      );
      const button = screen.getByRole('button');
      fireEvent.keyDown(button, { key: ' ' });
      expect(mockOnToggle).toHaveBeenCalledTimes(1);
    });

    it('does not call onToggle for other keys', () => {
      render(
        <CollapsibleSection title="Section" isExpanded={false} onToggle={mockOnToggle}>
          <div>Content</div>
        </CollapsibleSection>
      );
      const button = screen.getByRole('button');
      fireEvent.keyDown(button, { key: 'Tab' });
      fireEvent.keyDown(button, { key: 'Escape' });
      fireEvent.keyDown(button, { key: 'a' });
      expect(mockOnToggle).not.toHaveBeenCalled();
    });

    it('prevents default behavior on Enter and Space keys', () => {
      render(
        <CollapsibleSection title="Section" isExpanded={false} onToggle={mockOnToggle}>
          <div>Content</div>
        </CollapsibleSection>
      );
      const button = screen.getByRole('button');
      const enterEvent = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true });
      const spaceEvent = new KeyboardEvent('keydown', { key: ' ', bubbles: true });
      const preventDefaultSpy = vi.spyOn(enterEvent, 'preventDefault');
      const preventDefaultSpy2 = vi.spyOn(spaceEvent, 'preventDefault');

      button.dispatchEvent(enterEvent);
      button.dispatchEvent(spaceEvent);

      expect(preventDefaultSpy).toHaveBeenCalled();
      expect(preventDefaultSpy2).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('has aria-expanded=false when collapsed', () => {
      render(
        <CollapsibleSection title="Section" isExpanded={false} onToggle={mockOnToggle}>
          <div>Content</div>
        </CollapsibleSection>
      );
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-expanded', 'false');
    });

    it('has aria-expanded=true when expanded', () => {
      render(
        <CollapsibleSection title="Section" isExpanded={true} onToggle={mockOnToggle}>
          <div>Content</div>
        </CollapsibleSection>
      );
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-expanded', 'true');
    });

    it('has aria-controls linking to content', () => {
      render(
        <CollapsibleSection title="Section" isExpanded={false} onToggle={mockOnToggle}>
          <div>Content</div>
        </CollapsibleSection>
      );
      const button = screen.getByRole('button');
      const contentId = button.getAttribute('aria-controls');
      expect(contentId).toBeTruthy();
      const content = document.getElementById(contentId!);
      expect(content).toBeInTheDocument();
    });

    it('content has aria-hidden=false when expanded', () => {
      const { container } = render(
        <CollapsibleSection title="Section" isExpanded={true} onToggle={mockOnToggle}>
          <div>Content</div>
        </CollapsibleSection>
      );
      const content = container.querySelector('[aria-hidden="false"]');
      expect(content).toBeInTheDocument();
    });

    it('content has aria-hidden=true when collapsed', () => {
      const { container } = render(
        <CollapsibleSection title="Section" isExpanded={false} onToggle={mockOnToggle}>
          <div>Content</div>
        </CollapsibleSection>
      );
      const content = container.querySelector('[aria-hidden="true"]');
      expect(content).toBeInTheDocument();
    });

    it('button has appropriate role', () => {
      render(
        <CollapsibleSection title="Section" isExpanded={false} onToggle={mockOnToggle}>
          <div>Content</div>
        </CollapsibleSection>
      );
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('chevron has aria-hidden', () => {
      const { container } = render(
        <CollapsibleSection title="Section" isExpanded={false} onToggle={mockOnToggle}>
          <div>Content</div>
        </CollapsibleSection>
      );
      const chevron = container.querySelector('svg[aria-hidden="true"]');
      expect(chevron).toBeInTheDocument();
    });
  });

  describe('Animations', () => {
    it('applies rotate-0 class to chevron when collapsed', () => {
      const { container } = render(
        <CollapsibleSection title="Section" isExpanded={false} onToggle={mockOnToggle}>
          <div>Content</div>
        </CollapsibleSection>
      );
      const chevron = container.querySelector('svg');
      expect(chevron).toHaveClass('rotate-0');
    });

    it('applies rotate-180 class to chevron when expanded', () => {
      const { container } = render(
        <CollapsibleSection title="Section" isExpanded={true} onToggle={mockOnToggle}>
          <div>Content</div>
        </CollapsibleSection>
      );
      const chevron = container.querySelector('svg');
      expect(chevron).toHaveClass('rotate-180');
    });

    it('applies transition classes to content', () => {
      const { container } = render(
        <CollapsibleSection title="Section" isExpanded={false} onToggle={mockOnToggle}>
          <div>Content</div>
        </CollapsibleSection>
      );
      const contentWrapper = container.querySelector('[class*="transition"]');
      expect(contentWrapper).toBeInTheDocument();
    });

    it('applies max-height classes based on expanded state', () => {
      const { container, rerender } = render(
        <CollapsibleSection title="Section" isExpanded={false} onToggle={mockOnToggle}>
          <div>Content</div>
        </CollapsibleSection>
      );
      let contentWrapper = container.querySelector('[class*="max-h-0"]');
      expect(contentWrapper).toBeInTheDocument();

      rerender(
        <CollapsibleSection title="Section" isExpanded={true} onToggle={mockOnToggle}>
          <div>Content</div>
        </CollapsibleSection>
      );
      contentWrapper = container.querySelector('[class*="max-h-"]');
      expect(contentWrapper).toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('applies primary color to title when expanded', () => {
      render(
        <CollapsibleSection title="Section" isExpanded={true} onToggle={mockOnToggle}>
          <div>Content</div>
        </CollapsibleSection>
      );
      const title = screen.getByText('Section');
      expect(title).toHaveClass('text-primary');
    });

    it('applies default color to title when collapsed', () => {
      render(
        <CollapsibleSection title="Section" isExpanded={false} onToggle={mockOnToggle}>
          <div>Content</div>
        </CollapsibleSection>
      );
      const title = screen.getByText('Section');
      expect(title).toHaveClass('text-text-primary');
    });

    it('applies border when expanded', () => {
      render(
        <CollapsibleSection title="Section" isExpanded={true} onToggle={mockOnToggle}>
          <div>Content</div>
        </CollapsibleSection>
      );
      const button = screen.getByRole('button');
      expect(button).toHaveClass('border-b');
    });

    it('does not apply border-b when collapsed', () => {
      render(
        <CollapsibleSection title="Section" isExpanded={false} onToggle={mockOnToggle}>
          <div>Content</div>
        </CollapsibleSection>
      );
      const button = screen.getByRole('button');
      expect(button).not.toHaveClass('border-b');
    });

    it('applies hover effect to header', () => {
      render(
        <CollapsibleSection title="Section" isExpanded={false} onToggle={mockOnToggle}>
          <div>Content</div>
        </CollapsibleSection>
      );
      const button = screen.getByRole('button');
      expect(button).toHaveClass('hover:bg-surface-hover');
    });

    it('has focus ring styles', () => {
      render(
        <CollapsibleSection title="Section" isExpanded={false} onToggle={mockOnToggle}>
          <div>Content</div>
        </CollapsibleSection>
      );
      const button = screen.getByRole('button');
      expect(button).toHaveClass('focus:ring-2', 'focus:ring-primary');
    });
  });

  describe('Edge Cases', () => {
    it('handles empty title', () => {
      render(
        <CollapsibleSection title="" isExpanded={false} onToggle={mockOnToggle}>
          <div>Content</div>
        </CollapsibleSection>
      );
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('handles null children', () => {
      render(
        <CollapsibleSection title="Section" isExpanded={false} onToggle={mockOnToggle}>
          {null}
        </CollapsibleSection>
      );
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('handles complex children with nested elements', () => {
      render(
        <CollapsibleSection title="Section" isExpanded={true} onToggle={mockOnToggle}>
          <div>
            <h3>Nested Heading</h3>
            <p>Paragraph</p>
            <ul>
              <li>Item 1</li>
              <li>Item 2</li>
            </ul>
          </div>
        </CollapsibleSection>
      );
      expect(screen.getByText('Nested Heading')).toBeInTheDocument();
      expect(screen.getByText('Paragraph')).toBeInTheDocument();
      expect(screen.getByText('Item 1')).toBeInTheDocument();
    });

    it('handles very long title text', () => {
      const longTitle = 'This is a very long title that should still render correctly without breaking the layout or causing issues';
      render(
        <CollapsibleSection title={longTitle} isExpanded={false} onToggle={mockOnToggle}>
          <div>Content</div>
        </CollapsibleSection>
      );
      expect(screen.getByText(longTitle)).toBeInTheDocument();
    });
  });

  describe('Dynamic Updates', () => {
    it('updates when isExpanded changes', () => {
      const { rerender } = render(
        <CollapsibleSection title="Section" isExpanded={false} onToggle={mockOnToggle}>
          <div>Content</div>
        </CollapsibleSection>
      );
      let button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-expanded', 'false');

      rerender(
        <CollapsibleSection title="Section" isExpanded={true} onToggle={mockOnToggle}>
          <div>Content</div>
        </CollapsibleSection>
      );
      button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-expanded', 'true');
    });

    it('updates when title changes', () => {
      const { rerender } = render(
        <CollapsibleSection title="Initial Title" isExpanded={false} onToggle={mockOnToggle}>
          <div>Content</div>
        </CollapsibleSection>
      );
      expect(screen.getByText('Initial Title')).toBeInTheDocument();

      rerender(
        <CollapsibleSection title="Updated Title" isExpanded={false} onToggle={mockOnToggle}>
          <div>Content</div>
        </CollapsibleSection>
      );
      expect(screen.getByText('Updated Title')).toBeInTheDocument();
      expect(screen.queryByText('Initial Title')).not.toBeInTheDocument();
    });

    it('updates when children change', () => {
      const { rerender } = render(
        <CollapsibleSection title="Section" isExpanded={true} onToggle={mockOnToggle}>
          <div>Initial Content</div>
        </CollapsibleSection>
      );
      expect(screen.getByText('Initial Content')).toBeInTheDocument();

      rerender(
        <CollapsibleSection title="Section" isExpanded={true} onToggle={mockOnToggle}>
          <div>Updated Content</div>
        </CollapsibleSection>
      );
      expect(screen.getByText('Updated Content')).toBeInTheDocument();
      expect(screen.queryByText('Initial Content')).not.toBeInTheDocument();
    });
  });
});
