import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Text } from './Text';

describe('Text', () => {
  describe('Rendering', () => {
    it('renders children content', () => {
      render(<Text>Test Content</Text>);
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('renders as paragraph by default', () => {
      const { container } = render(<Text>Content</Text>);
      const element = container.querySelector('p');
      expect(element).toBeInTheDocument();
      expect(element).toHaveTextContent('Content');
    });

    it('renders as span when specified', () => {
      const { container } = render(<Text as="span">Content</Text>);
      const element = container.querySelector('span');
      expect(element).toBeInTheDocument();
    });

    it('renders as div when specified', () => {
      const { container } = render(<Text as="div">Content</Text>);
      const element = container.querySelector('div');
      expect(element).toBeInTheDocument();
    });
  });

  describe('Variant Classes', () => {
    it('applies body variant by default', () => {
      const { container } = render(<Text>Content</Text>);
      const element = container.firstChild as HTMLElement;
      expect(element).toHaveClass('text-[var(--font-size-body)]');
      expect(element).toHaveClass('leading-relaxed');
    });

    it('applies caption variant classes', () => {
      const { container } = render(<Text variant="caption">Content</Text>);
      const element = container.firstChild as HTMLElement;
      expect(element).toHaveClass('text-[var(--font-size-caption)]');
      expect(element).toHaveClass('leading-normal');
    });

    it('applies small variant classes', () => {
      const { container } = render(<Text variant="small">Content</Text>);
      const element = container.firstChild as HTMLElement;
      expect(element).toHaveClass('text-[var(--font-size-small)]');
      expect(element).toHaveClass('leading-normal');
    });
  });

  describe('Color Classes', () => {
    it('applies primary color by default', () => {
      const { container } = render(<Text>Content</Text>);
      const element = container.firstChild as HTMLElement;
      expect(element).toHaveClass('text-text-primary');
    });

    it('applies secondary color classes', () => {
      const { container } = render(<Text color="secondary">Content</Text>);
      const element = container.firstChild as HTMLElement;
      expect(element).toHaveClass('text-text-secondary');
    });

    it('applies tertiary color classes', () => {
      const { container } = render(<Text color="tertiary">Content</Text>);
      const element = container.firstChild as HTMLElement;
      expect(element).toHaveClass('text-text-tertiary');
    });
  });

  describe('Combined Variants', () => {
    it('combines body variant with primary color', () => {
      const { container } = render(<Text variant="body" color="primary">Content</Text>);
      const element = container.firstChild as HTMLElement;
      expect(element).toHaveClass('text-[var(--font-size-body)]');
      expect(element).toHaveClass('text-text-primary');
    });

    it('combines caption variant with secondary color', () => {
      const { container } = render(<Text variant="caption" color="secondary">Content</Text>);
      const element = container.firstChild as HTMLElement;
      expect(element).toHaveClass('text-[var(--font-size-caption)]');
      expect(element).toHaveClass('text-text-secondary');
    });

    it('combines small variant with tertiary color', () => {
      const { container } = render(<Text variant="small" color="tertiary">Content</Text>);
      const element = container.firstChild as HTMLElement;
      expect(element).toHaveClass('text-[var(--font-size-small)]');
      expect(element).toHaveClass('text-text-tertiary');
    });
  });

  describe('Custom Styling', () => {
    it('merges custom className with default classes', () => {
      const { container } = render(<Text className="custom-class">Content</Text>);
      const element = container.firstChild as HTMLElement;
      expect(element).toHaveClass('custom-class');
      expect(element).toHaveClass('text-[var(--font-size-body)]'); // Still has default classes
    });

    it('applies inline styles', () => {
      const { container } = render(
        <Text style={{ marginTop: '1rem', fontWeight: 'bold' }}>Content</Text>
      );
      const element = container.firstChild as HTMLElement;
      expect(element).toHaveStyle({ marginTop: '1rem', fontWeight: 'bold' });
    });

    it('applies title attribute', () => {
      const { container } = render(<Text title="Tooltip text">Content</Text>);
      const element = container.firstChild as HTMLElement;
      expect(element).toHaveAttribute('title', 'Tooltip text');
    });

    it('combines all custom props', () => {
      const { container } = render(
        <Text 
          variant="caption" 
          color="secondary"
          className="font-bold"
          style={{ margin: '1rem' }}
          title="Info"
        >
          Content
        </Text>
      );
      const element = container.firstChild as HTMLElement;
      expect(element).toHaveClass('text-[var(--font-size-caption)]');
      expect(element).toHaveClass('text-text-secondary');
      expect(element).toHaveClass('font-bold');
      expect(element).toHaveStyle({ margin: '1rem' });
      expect(element).toHaveAttribute('title', 'Info');
    });
  });

  describe('Content', () => {
    it('renders text content', () => {
      render(<Text>Simple text content</Text>);
      expect(screen.getByText('Simple text content')).toBeInTheDocument();
    });

    it('renders JSX children', () => {
      render(
        <Text>
          Text with <strong>bold</strong> and <em>italic</em>
        </Text>
      );
      expect(screen.getByText(/Text with/)).toBeInTheDocument();
      expect(screen.getByText('bold').tagName).toBe('STRONG');
      expect(screen.getByText('italic').tagName).toBe('EM');
    });

    it('renders with special characters', () => {
      render(<Text>Special: @ # $ % & * ( ) - + = </Text>);
      expect(screen.getByText(/Special:/)).toBeInTheDocument();
    });

    it('renders with line breaks', () => {
      render(
        <Text>
          Line 1{'\n'}Line 2{'\n'}Line 3
        </Text>
      );
      expect(screen.getByText(/Line 1/)).toBeInTheDocument();
    });
  });

  describe('Semantic HTML', () => {
    it('renders paragraph for block text', () => {
      const { container } = render(<Text as="p">Block text</Text>);
      expect(container.querySelector('p')).toBeInTheDocument();
    });

    it('renders span for inline text', () => {
      const { container } = render(<Text as="span">Inline text</Text>);
      expect(container.querySelector('span')).toBeInTheDocument();
    });

    it('renders div for container text', () => {
      const { container } = render(<Text as="div">Container text</Text>);
      expect(container.querySelector('div')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles empty children gracefully', () => {
      const { container } = render(<Text>{null}</Text>);
      const element = container.firstChild as HTMLElement;
      expect(element).toBeInTheDocument();
      expect(element).toBeEmptyDOMElement();
    });

    it('handles undefined className', () => {
      const { container } = render(<Text className={undefined}>Content</Text>);
      const element = container.firstChild as HTMLElement;
      expect(element).toBeInTheDocument();
    });

    it('handles empty className string', () => {
      const { container } = render(<Text className="">Content</Text>);
      const element = container.firstChild as HTMLElement;
      expect(element).toBeInTheDocument();
      expect(element).toHaveClass('text-[var(--font-size-body)]'); // Still has default classes
    });

    it('handles undefined style', () => {
      const { container } = render(<Text style={undefined}>Content</Text>);
      const element = container.firstChild as HTMLElement;
      expect(element).toBeInTheDocument();
    });

    it('handles undefined title', () => {
      const { container } = render(<Text title={undefined}>Content</Text>);
      const element = container.firstChild as HTMLElement;
      expect(element).toBeInTheDocument();
      expect(element).not.toHaveAttribute('title');
    });

    it('handles very long content', () => {
      const longText = 'A'.repeat(10000);
      render(<Text>{longText}</Text>);
      expect(screen.getByText(longText)).toBeInTheDocument();
    });
  });

  describe('All Variant Combinations', () => {
    const variants: Array<'body' | 'caption' | 'small'> = ['body', 'caption', 'small'];
    const colors: Array<'primary' | 'secondary' | 'tertiary'> = ['primary', 'secondary', 'tertiary'];

    variants.forEach((variant) => {
      colors.forEach((color) => {
        it(`renders ${variant} variant with ${color} color`, () => {
          const { container } = render(
            <Text variant={variant} color={color}>
              Content
            </Text>
          );
          const element = container.firstChild as HTMLElement;
          expect(element).toBeInTheDocument();
          expect(element).toHaveTextContent('Content');
        });
      });
    });
  });

  describe('All HTML Elements', () => {
    const elements: Array<'p' | 'span' | 'div'> = ['p', 'span', 'div'];

    elements.forEach((as) => {
      it(`renders as ${as} element`, () => {
        const { container } = render(<Text as={as}>Content</Text>);
        const element = container.querySelector(as);
        expect(element).toBeInTheDocument();
        expect(element).toHaveTextContent('Content');
      });
    });
  });
});
