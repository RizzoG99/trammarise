import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Heading } from './Heading';

describe('Heading', () => {
  describe('Rendering', () => {
    it('renders children content', () => {
      render(<Heading level="h1">Test Heading</Heading>);
      expect(screen.getByText('Test Heading')).toBeInTheDocument();
    });

    it('renders hero level as h1 element', () => {
      render(<Heading level="hero">Hero Heading</Heading>);
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveTextContent('Hero Heading');
    });

    it('renders h1 level as h1 element', () => {
      render(<Heading level="h1">H1 Heading</Heading>);
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toBeInTheDocument();
    });

    it('renders h2 level as h2 element', () => {
      render(<Heading level="h2">H2 Heading</Heading>);
      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toBeInTheDocument();
    });

    it('renders h3 level as h3 element', () => {
      render(<Heading level="h3">H3 Heading</Heading>);
      const heading = screen.getByRole('heading', { level: 3 });
      expect(heading).toBeInTheDocument();
    });
  });

  describe('Base Classes', () => {
    it('always includes font-semibold class', () => {
      render(<Heading level="h1">Content</Heading>);
      const heading = screen.getByRole('heading');
      expect(heading).toHaveClass('font-semibold');
    });

    it('always includes text-text-primary class', () => {
      render(<Heading level="h2">Content</Heading>);
      const heading = screen.getByRole('heading');
      expect(heading).toHaveClass('text-text-primary');
    });
  });

  describe('Level-Specific Classes', () => {
    it('applies hero-specific classes', () => {
      render(<Heading level="hero">Hero</Heading>);
      const heading = screen.getByRole('heading');
      expect(heading).toHaveClass('text-[var(--font-size-hero)]');
      expect(heading).toHaveClass('leading-tight');
    });

    it('applies h1-specific classes', () => {
      render(<Heading level="h1">H1</Heading>);
      const heading = screen.getByRole('heading');
      expect(heading).toHaveClass('text-[var(--font-size-h1)]');
      expect(heading).toHaveClass('leading-tight');
    });

    it('applies h2-specific classes', () => {
      render(<Heading level="h2">H2</Heading>);
      const heading = screen.getByRole('heading');
      expect(heading).toHaveClass('text-[var(--font-size-h2)]');
      expect(heading).toHaveClass('leading-snug');
    });

    it('applies h3-specific classes', () => {
      render(<Heading level="h3">H3</Heading>);
      const heading = screen.getByRole('heading');
      expect(heading).toHaveClass('text-[var(--font-size-h3)]');
      expect(heading).toHaveClass('leading-normal');
    });
  });

  describe('Custom Styling', () => {
    it('merges custom className with default classes', () => {
      render(<Heading level="h1" className="custom-class">Content</Heading>);
      const heading = screen.getByRole('heading');
      expect(heading).toHaveClass('custom-class');
      expect(heading).toHaveClass('font-semibold'); // Still has default classes
    });

    it('allows color override via className', () => {
      render(<Heading level="h2" className="text-blue-600">Content</Heading>);
      const heading = screen.getByRole('heading');
      expect(heading).toHaveClass('text-blue-600');
    });

    it('allows size override via className', () => {
      render(<Heading level="h3" className="text-5xl">Content</Heading>);
      const heading = screen.getByRole('heading');
      expect(heading).toHaveClass('text-5xl');
    });
  });

  describe('Content', () => {
    it('renders text content', () => {
      render(<Heading level="h1">Simple text</Heading>);
      expect(screen.getByText('Simple text')).toBeInTheDocument();
    });

    it('renders JSX children', () => {
      render(
        <Heading level="h2">
          Welcome <strong>User</strong>
        </Heading>
      );
      expect(screen.getByRole('heading')).toHaveTextContent('Welcome User');
      expect(screen.getByText('User').tagName).toBe('STRONG');
    });

    it('renders with special characters', () => {
      render(<Heading level="h1">Q&A: FAQ's & Tips</Heading>);
      expect(screen.getByText("Q&A: FAQ's & Tips")).toBeInTheDocument();
    });

    it('renders with numbers', () => {
      render(<Heading level="h2">Top 10 Features</Heading>);
      expect(screen.getByText('Top 10 Features')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('maintains proper heading hierarchy', () => {
      render(
        <div>
          <Heading level="h1">Main Title</Heading>
          <Heading level="h2">Section</Heading>
          <Heading level="h3">Subsection</Heading>
        </div>
      );
      
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Main Title');
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Section');
      expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Subsection');
    });

    it('hero renders as h1 for accessibility', () => {
      render(<Heading level="hero">Hero Title</Heading>);
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles empty children gracefully', () => {
      render(<Heading level="h1">{null}</Heading>);
      const heading = screen.getByRole('heading');
      expect(heading).toBeInTheDocument();
      expect(heading).toBeEmptyDOMElement();
    });

    it('handles undefined className', () => {
      render(<Heading level="h2" className={undefined}>Content</Heading>);
      const heading = screen.getByRole('heading');
      expect(heading).toBeInTheDocument();
    });

    it('handles empty className string', () => {
      render(<Heading level="h3" className="">Content</Heading>);
      const heading = screen.getByRole('heading');
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveClass('font-semibold'); // Still has default classes
    });

    it('handles very long content', () => {
      const longText = 'A'.repeat(1000);
      render(<Heading level="h1">{longText}</Heading>);
      expect(screen.getByRole('heading')).toHaveTextContent(longText);
    });
  });

  describe('All Levels', () => {
    const levels: Array<'hero' | 'h1' | 'h2' | 'h3'> = ['hero', 'h1', 'h2', 'h3'];

    levels.forEach((level) => {
      it(`renders ${level} level correctly`, () => {
        render(<Heading level={level}>Content</Heading>);
        const heading = screen.getByRole('heading');
        expect(heading).toBeInTheDocument();
        expect(heading).toHaveTextContent('Content');
      });
    });
  });
});
