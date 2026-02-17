import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { GlassCard } from './GlassCard';

describe('GlassCard', () => {
  describe('Rendering', () => {
    it('renders children content', () => {
      render(<GlassCard>Test Content</GlassCard>);
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('renders with light variant by default', () => {
      const { container } = render(<GlassCard>Content</GlassCard>);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('bg-white/80');
      expect(card).toHaveClass('border-white/20');
    });

    it('renders with dark variant', () => {
      const { container } = render(<GlassCard variant="dark">Content</GlassCard>);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('bg-[var(--color-bg-surface)]');
    });

    it('renders with primary variant', () => {
      const { container } = render(<GlassCard variant="primary">Content</GlassCard>);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('bg-blue-500/10');
      expect(card).toHaveClass('border-blue-200/50');
    });

    it('renders with medium blur by default', () => {
      const { container } = render(<GlassCard>Content</GlassCard>);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('backdrop-blur-md');
    });

    it('renders with small blur', () => {
      const { container } = render(<GlassCard blur="sm">Content</GlassCard>);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('backdrop-blur-sm');
    });

    it('renders with large blur', () => {
      const { container } = render(<GlassCard blur="lg">Content</GlassCard>);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('backdrop-blur-lg');
    });
  });

  describe('Variants', () => {
    it('applies light variant classes correctly', () => {
      const { container } = render(<GlassCard variant="light">Content</GlassCard>);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('bg-white/80');
      expect(card).toHaveClass('border-white/20');
    });

    it('applies dark variant classes correctly', () => {
      const { container } = render(<GlassCard variant="dark">Content</GlassCard>);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('bg-[var(--color-bg-surface)]');
      expect(card).toHaveClass('border-[var(--color-border)]');
    });

    it('applies primary variant classes correctly', () => {
      const { container } = render(<GlassCard variant="primary">Content</GlassCard>);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('bg-blue-500/10');
      expect(card).toHaveClass('border-blue-200/50');
    });
  });

  describe('Blur Levels', () => {
    it('applies small blur correctly', () => {
      const { container } = render(<GlassCard blur="sm">Content</GlassCard>);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('backdrop-blur-sm');
    });

    it('applies medium blur correctly', () => {
      const { container } = render(<GlassCard blur="md">Content</GlassCard>);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('backdrop-blur-md');
    });

    it('applies large blur correctly', () => {
      const { container } = render(<GlassCard blur="lg">Content</GlassCard>);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('backdrop-blur-lg');
    });
  });

  describe('Common Classes', () => {
    it('always includes border class', () => {
      const { container } = render(<GlassCard>Content</GlassCard>);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('border');
    });

    it('always includes rounded corners', () => {
      const { container } = render(<GlassCard>Content</GlassCard>);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('rounded-[var(--radius-lg)]');
    });

    it('always includes glass shadow', () => {
      const { container } = render(<GlassCard>Content</GlassCard>);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('shadow-[var(--shadow-glass)]');
    });

    it('always includes transition classes', () => {
      const { container } = render(<GlassCard>Content</GlassCard>);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('transition-all');
      expect(card).toHaveClass('duration-[var(--transition-normal)]');
    });
  });

  describe('Custom Styling', () => {
    it('merges custom className with default classes', () => {
      const { container } = render(<GlassCard className="custom-class">Content</GlassCard>);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('custom-class');
      expect(card).toHaveClass('border'); // Still has default classes
    });

    it('applies inline styles', () => {
      const { container } = render(
        <GlassCard style={{ padding: '2rem', maxWidth: '500px' }}>Content</GlassCard>
      );
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveStyle({ padding: '2rem', maxWidth: '500px' });
    });

    it('combines className, style, variant, and blur', () => {
      const { container } = render(
        <GlassCard variant="primary" blur="lg" className="max-w-md" style={{ margin: '1rem' }}>
          Content
        </GlassCard>
      );
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('bg-blue-500/10');
      expect(card).toHaveClass('backdrop-blur-lg');
      expect(card).toHaveClass('max-w-md');
      expect(card).toHaveStyle({ margin: '1rem' });
    });
  });

  describe('Content Rendering', () => {
    it('renders text content', () => {
      render(<GlassCard>Simple text content</GlassCard>);
      expect(screen.getByText('Simple text content')).toBeInTheDocument();
    });

    it('renders complex children with JSX', () => {
      render(
        <GlassCard>
          <h3>Title</h3>
          <p>Paragraph</p>
          <button>Action</button>
        </GlassCard>
      );
      expect(screen.getByRole('heading', { name: 'Title' })).toBeInTheDocument();
      expect(screen.getByText('Paragraph')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument();
    });

    it('renders nested GlassCards', () => {
      render(
        <GlassCard variant="dark">
          <GlassCard variant="light">Inner Card</GlassCard>
        </GlassCard>
      );
      expect(screen.getByText('Inner Card')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles empty children gracefully', () => {
      const { container } = render(<GlassCard>{null}</GlassCard>);
      const card = container.firstChild as HTMLElement;
      expect(card).toBeInTheDocument();
      expect(card).toBeEmptyDOMElement();
    });

    it('handles undefined className', () => {
      const { container } = render(<GlassCard className={undefined}>Content</GlassCard>);
      const card = container.firstChild as HTMLElement;
      expect(card).toBeInTheDocument();
    });

    it('handles undefined style', () => {
      const { container } = render(<GlassCard style={undefined}>Content</GlassCard>);
      const card = container.firstChild as HTMLElement;
      expect(card).toBeInTheDocument();
    });

    it('handles empty className string', () => {
      const { container } = render(<GlassCard className="">Content</GlassCard>);
      const card = container.firstChild as HTMLElement;
      expect(card).toBeInTheDocument();
      expect(card).toHaveClass('border'); // Still has default classes
    });
  });

  describe('All Variant Combinations', () => {
    const variants: Array<'light' | 'dark' | 'primary'> = ['light', 'dark', 'primary'];
    const blurs: Array<'sm' | 'md' | 'lg'> = ['sm', 'md', 'lg'];

    variants.forEach((variant) => {
      blurs.forEach((blur) => {
        it(`renders ${variant} variant with ${blur} blur`, () => {
          const { container } = render(
            <GlassCard variant={variant} blur={blur}>
              Content
            </GlassCard>
          );
          const card = container.firstChild as HTMLElement;
          expect(card).toBeInTheDocument();
          expect(screen.getByText('Content')).toBeInTheDocument();
        });
      });
    });
  });
});
