import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SplitCardLayout } from './SplitCardLayout';

describe('SplitCardLayout', () => {
  describe('Rendering', () => {
    it('renders left content', () => {
      render(
        <SplitCardLayout
          left={<div>Left Content</div>}
          right={<div>Right Content</div>}
        />
      );
      expect(screen.getByText('Left Content')).toBeInTheDocument();
    });

    it('renders right content', () => {
      render(
        <SplitCardLayout
          left={<div>Left Content</div>}
          right={<div>Right Content</div>}
        />
      );
      expect(screen.getByText('Right Content')).toBeInTheDocument();
    });

    it('renders both panels', () => {
      const { container } = render(
        <SplitCardLayout
          left={<div>Left</div>}
          right={<div>Right</div>}
        />
      );
      const panels = container.querySelectorAll('div > div');
      expect(panels.length).toBeGreaterThanOrEqual(2);
    });

    it('renders complex JSX in left panel', () => {
      render(
        <SplitCardLayout
          left={
            <div>
              <h1>Title</h1>
              <p>Description</p>
              <button>Action</button>
            </div>
          }
          right={<div>Right</div>}
        />
      );
      expect(screen.getByText('Title')).toBeInTheDocument();
      expect(screen.getByText('Description')).toBeInTheDocument();
      expect(screen.getByText('Action')).toBeInTheDocument();
    });

    it('renders complex JSX in right panel', () => {
      render(
        <SplitCardLayout
          left={<div>Left</div>}
          right={
            <div>
              <ul>
                <li>Item 1</li>
                <li>Item 2</li>
                <li>Item 3</li>
              </ul>
            </div>
          }
        />
      );
      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 2')).toBeInTheDocument();
      expect(screen.getByText('Item 3')).toBeInTheDocument();
    });
  });

  describe('Responsive Layout', () => {
    it('applies grid layout classes', () => {
      const { container } = render(
        <SplitCardLayout
          left={<div>Left</div>}
          right={<div>Right</div>}
        />
      );
      const gridContainer = container.firstChild;
      expect(gridContainer).toHaveClass('grid');
    });

    it('applies single column on mobile', () => {
      const { container } = render(
        <SplitCardLayout
          left={<div>Left</div>}
          right={<div>Right</div>}
        />
      );
      const gridContainer = container.firstChild;
      expect(gridContainer).toHaveClass('grid-cols-1');
    });

    it('applies two columns on large screens', () => {
      const { container } = render(
        <SplitCardLayout
          left={<div>Left</div>}
          right={<div>Right</div>}
        />
      );
      const gridContainer = container.firstChild;
      expect(gridContainer).toHaveClass('lg:grid-cols-2');
    });

    it('applies gap between panels', () => {
      const { container } = render(
        <SplitCardLayout
          left={<div>Left</div>}
          right={<div>Right</div>}
        />
      );
      const gridContainer = container.firstChild;
      expect(gridContainer).toHaveClass('gap-6');
    });

    it('applies full width', () => {
      const { container } = render(
        <SplitCardLayout
          left={<div>Left</div>}
          right={<div>Right</div>}
        />
      );
      const gridContainer = container.firstChild;
      expect(gridContainer).toHaveClass('w-full');
    });
  });

  describe('Panel Styling', () => {
    it('centers left panel content', () => {
      const { container } = render(
        <SplitCardLayout
          left={<div data-testid="left-content">Left</div>}
          right={<div>Right</div>}
        />
      );
      const leftPanel = screen.getByTestId('left-content').parentElement;
      expect(leftPanel).toHaveClass('flex', 'items-center', 'justify-center');
    });

    it('applies flex column to right panel', () => {
      const { container } = render(
        <SplitCardLayout
          left={<div>Left</div>}
          right={<div data-testid="right-content">Right</div>}
        />
      );
      const rightPanel = screen.getByTestId('right-content').parentElement;
      expect(rightPanel).toHaveClass('flex', 'flex-col');
    });
  });

  describe('Custom className', () => {
    it('applies custom className when provided', () => {
      const { container } = render(
        <SplitCardLayout
          left={<div>Left</div>}
          right={<div>Right</div>}
          className="custom-class"
        />
      );
      const gridContainer = container.firstChild;
      expect(gridContainer).toHaveClass('custom-class');
    });

    it('merges custom className with default classes', () => {
      const { container } = render(
        <SplitCardLayout
          left={<div>Left</div>}
          right={<div>Right</div>}
          className="my-custom-class"
        />
      );
      const gridContainer = container.firstChild;
      expect(gridContainer).toHaveClass('my-custom-class');
      expect(gridContainer).toHaveClass('grid');
      expect(gridContainer).toHaveClass('grid-cols-1');
      expect(gridContainer).toHaveClass('lg:grid-cols-2');
    });

    it('works without custom className', () => {
      const { container } = render(
        <SplitCardLayout
          left={<div>Left</div>}
          right={<div>Right</div>}
        />
      );
      const gridContainer = container.firstChild;
      expect(gridContainer).toHaveClass('grid');
    });

    it('handles empty string className', () => {
      const { container } = render(
        <SplitCardLayout
          left={<div>Left</div>}
          right={<div>Right</div>}
          className=""
        />
      );
      const gridContainer = container.firstChild;
      expect(gridContainer).toHaveClass('grid');
    });
  });

  describe('Edge Cases', () => {
    it('handles null left content', () => {
      render(
        <SplitCardLayout
          left={null}
          right={<div>Right Content</div>}
        />
      );
      expect(screen.getByText('Right Content')).toBeInTheDocument();
    });

    it('handles null right content', () => {
      render(
        <SplitCardLayout
          left={<div>Left Content</div>}
          right={null}
        />
      );
      expect(screen.getByText('Left Content')).toBeInTheDocument();
    });

    it('handles both panels with null content', () => {
      const { container } = render(
        <SplitCardLayout left={null} right={null} />
      );
      expect(container.firstChild).toBeInTheDocument();
    });

    it('handles empty fragment in left panel', () => {
      render(
        <SplitCardLayout
          left={<></>}
          right={<div>Right</div>}
        />
      );
      expect(screen.getByText('Right')).toBeInTheDocument();
    });

    it('handles empty fragment in right panel', () => {
      render(
        <SplitCardLayout
          left={<div>Left</div>}
          right={<></>}
        />
      );
      expect(screen.getByText('Left')).toBeInTheDocument();
    });

    it('handles very tall content in left panel', () => {
      render(
        <SplitCardLayout
          left={
            <div style={{ height: '2000px' }}>Very Tall Left Content</div>
          }
          right={<div>Right</div>}
        />
      );
      expect(screen.getByText('Very Tall Left Content')).toBeInTheDocument();
    });

    it('handles very tall content in right panel', () => {
      render(
        <SplitCardLayout
          left={<div>Left</div>}
          right={
            <div style={{ height: '2000px' }}>Very Tall Right Content</div>
          }
        />
      );
      expect(screen.getByText('Very Tall Right Content')).toBeInTheDocument();
    });

    it('handles content with special characters', () => {
      render(
        <SplitCardLayout
          left={<div>Left @#$%</div>}
          right={<div>Right &*()!</div>}
        />
      );
      expect(screen.getByText('Left @#$%')).toBeInTheDocument();
      expect(screen.getByText('Right &*()!')).toBeInTheDocument();
    });

    it('handles content with line breaks', () => {
      render(
        <SplitCardLayout
          left={<div>Left{'\n'}Content</div>}
          right={<div>Right{'\n'}Content</div>}
        />
      );
      expect(screen.getByText(/Left/)).toBeInTheDocument();
      expect(screen.getByText(/Right/)).toBeInTheDocument();
    });
  });

  describe('Dynamic Updates', () => {
    it('updates when left content changes', () => {
      const { rerender } = render(
        <SplitCardLayout
          left={<div>Initial Left</div>}
          right={<div>Right</div>}
        />
      );
      expect(screen.getByText('Initial Left')).toBeInTheDocument();

      rerender(
        <SplitCardLayout
          left={<div>Updated Left</div>}
          right={<div>Right</div>}
        />
      );
      expect(screen.getByText('Updated Left')).toBeInTheDocument();
      expect(screen.queryByText('Initial Left')).not.toBeInTheDocument();
    });

    it('updates when right content changes', () => {
      const { rerender } = render(
        <SplitCardLayout
          left={<div>Left</div>}
          right={<div>Initial Right</div>}
        />
      );
      expect(screen.getByText('Initial Right')).toBeInTheDocument();

      rerender(
        <SplitCardLayout
          left={<div>Left</div>}
          right={<div>Updated Right</div>}
        />
      );
      expect(screen.getByText('Updated Right')).toBeInTheDocument();
      expect(screen.queryByText('Initial Right')).not.toBeInTheDocument();
    });

    it('updates when className changes', () => {
      const { container, rerender } = render(
        <SplitCardLayout
          left={<div>Left</div>}
          right={<div>Right</div>}
          className="class-1"
        />
      );
      expect(container.firstChild).toHaveClass('class-1');

      rerender(
        <SplitCardLayout
          left={<div>Left</div>}
          right={<div>Right</div>}
          className="class-2"
        />
      );
      expect(container.firstChild).toHaveClass('class-2');
      expect(container.firstChild).not.toHaveClass('class-1');
    });

    it('updates both panels simultaneously', () => {
      const { rerender } = render(
        <SplitCardLayout
          left={<div>Left 1</div>}
          right={<div>Right 1</div>}
        />
      );
      expect(screen.getByText('Left 1')).toBeInTheDocument();
      expect(screen.getByText('Right 1')).toBeInTheDocument();

      rerender(
        <SplitCardLayout
          left={<div>Left 2</div>}
          right={<div>Right 2</div>}
        />
      );
      expect(screen.getByText('Left 2')).toBeInTheDocument();
      expect(screen.getByText('Right 2')).toBeInTheDocument();
      expect(screen.queryByText('Left 1')).not.toBeInTheDocument();
      expect(screen.queryByText('Right 1')).not.toBeInTheDocument();
    });
  });

  describe('Typical Usage', () => {
    it('renders with ProgressCircle-like content in left panel', () => {
      render(
        <SplitCardLayout
          left={
            <div className="flex flex-col items-center">
              <div className="text-4xl font-bold">75%</div>
              <div className="text-sm">Processing</div>
            </div>
          }
          right={<div>Steps</div>}
        />
      );
      expect(screen.getByText('75%')).toBeInTheDocument();
      expect(screen.getByText('Processing')).toBeInTheDocument();
      expect(screen.getByText('Steps')).toBeInTheDocument();
    });

    it('renders with StepChecklist-like content in right panel', () => {
      render(
        <SplitCardLayout
          left={<div>Progress</div>}
          right={
            <div>
              <h3>Steps</h3>
              <ul>
                <li>Step 1</li>
                <li>Step 2</li>
              </ul>
            </div>
          }
        />
      );
      expect(screen.getByText('Progress')).toBeInTheDocument();
      expect(screen.getByText('Steps')).toBeInTheDocument();
      expect(screen.getByText('Step 1')).toBeInTheDocument();
      expect(screen.getByText('Step 2')).toBeInTheDocument();
    });
  });
});
