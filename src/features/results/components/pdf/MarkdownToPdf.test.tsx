import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MarkdownToPdf } from './MarkdownToPdf';

// Mock @react-pdf/renderer components since they don't render to DOM normally
vi.mock('@react-pdf/renderer', () => ({
  Text: ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
    <div data-testid="pdf-text" style={style}>
      {children}
    </div>
  ),
  View: ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
    <div data-testid="pdf-view" style={style}>
      {children}
    </div>
  ),
  StyleSheet: { create: (styles: Record<string, unknown>) => styles },
}));

describe('MarkdownToPdf', () => {
  it('renders headings correctly', () => {
    const markdown = '# Heading 1\n## Heading 2';
    const { getAllByTestId } = render(<MarkdownToPdf content={markdown} />);

    const elements = getAllByTestId('pdf-text');
    // Check if texts are present (simplistic check as we mock components)
    expect(elements[0]).toHaveTextContent('Heading 1');
    expect(elements[1]).toHaveTextContent('Heading 2');
  });

  it('renders bold and italic text', () => {
    const markdown = '**Bold** and *Italic*';
    const { getAllByTestId } = render(<MarkdownToPdf content={markdown} />);

    const elements = getAllByTestId('pdf-text');
    // Verify content is rendered
    expect(elements[0]).toHaveTextContent('Bold');
    expect(elements[2]).toHaveTextContent('Italic');
  });

  it('renders lists', () => {
    const markdown = '- Item 1\n- Item 2';
    const { getAllByTestId } = render(<MarkdownToPdf content={markdown} />);

    const texts = getAllByTestId('pdf-text');
    // Bullets + content
    expect(texts.some((el) => el.textContent === '•')).toBe(true);
    expect(texts.some((el) => el.textContent === 'Item 1')).toBe(true);
    expect(texts.some((el) => el.textContent === 'Item 2')).toBe(true);
  });

  it('renders tables', () => {
    const markdown = '| Header 1 | Header 2 |\n| --- | --- |\n| Cell 1 | Cell 2 |';
    const { getAllByTestId } = render(<MarkdownToPdf content={markdown} />);

    const texts = getAllByTestId('pdf-text');
    expect(texts.some((el) => el.textContent === 'Header 1')).toBe(true);
    expect(texts.some((el) => el.textContent === 'Cell 1')).toBe(true);
  });
});
