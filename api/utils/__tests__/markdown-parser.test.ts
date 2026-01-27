import { describe, it, expect } from 'vitest';
import { parseMarkdown } from '../markdown-parser';

describe('parseMarkdown', () => {
  it('should parse simple 2x2 table', () => {
    const markdown = `
| Header A | Header B |
|----------|----------|
| Value 1  | Value 2  |
| Value 3  | Value 4  |
    `.trim();

    const blocks = parseMarkdown(markdown);

    expect(blocks).toHaveLength(1);
    expect(blocks[0].type).toBe('table');

    if (blocks[0].type === 'table') {
      expect(blocks[0].headers).toEqual(['Header A', 'Header B']);
      expect(blocks[0].rows).toEqual([
        ['Value 1', 'Value 2'],
        ['Value 3', 'Value 4'],
      ]);
      expect(blocks[0].alignments).toEqual(['left', 'left']);
    }
  });

  it('should parse table with 5 columns', () => {
    const markdown = `
| Col1 | Col2 | Col3 | Col4 | Col5 |
|------|------|------|------|------|
| A    | B    | C    | D    | E    |
| F    | G    | H    | I    | J    |
    `.trim();

    const blocks = parseMarkdown(markdown);

    expect(blocks).toHaveLength(1);
    expect(blocks[0].type).toBe('table');

    if (blocks[0].type === 'table') {
      expect(blocks[0].headers).toHaveLength(5);
      expect(blocks[0].rows).toHaveLength(2);
      expect(blocks[0].rows[0]).toEqual(['A', 'B', 'C', 'D', 'E']);
    }
  });

  it('should parse table with empty cells', () => {
    const markdown = `
| Name | Value |
|------|-------|
| A    |       |
|      | B     |
    `.trim();

    const blocks = parseMarkdown(markdown);

    expect(blocks).toHaveLength(1);
    expect(blocks[0].type).toBe('table');

    if (blocks[0].type === 'table') {
      expect(blocks[0].rows).toEqual([
        ['A', ''],
        ['', 'B'],
      ]);
    }
  });

  it('should parse table with Italian special characters', () => {
    const markdown = `
| Decisione | Responsabile |
|-----------|--------------|
| Implementare Docker | Marco Rossi |
| Migliorare l'architettura | Giuseppe Verdi |
    `.trim();

    const blocks = parseMarkdown(markdown);

    expect(blocks).toHaveLength(1);
    expect(blocks[0].type === 'table' && blocks[0].rows[1][1]).toBe('Giuseppe Verdi');
  });

  it('should parse table alignments', () => {
    const markdown = `
| Left | Center | Right |
|:-----|:------:|------:|
| A    | B      | C     |
    `.trim();

    const blocks = parseMarkdown(markdown);

    expect(blocks).toHaveLength(1);
    expect(blocks[0].type).toBe('table');

    if (blocks[0].type === 'table') {
      expect(blocks[0].alignments).toEqual(['left', 'center', 'right']);
    }
  });

  it('should parse heading level 1', () => {
    const markdown = '# Main Title';
    const blocks = parseMarkdown(markdown);

    expect(blocks).toHaveLength(1);
    expect(blocks[0]).toEqual({
      type: 'heading',
      level: 1,
      content: 'Main Title',
    });
  });

  it('should parse heading level 2', () => {
    const markdown = '## Subtitle';
    const blocks = parseMarkdown(markdown);

    expect(blocks).toHaveLength(1);
    expect(blocks[0]).toEqual({
      type: 'heading',
      level: 2,
      content: 'Subtitle',
    });
  });

  it('should parse heading level 3', () => {
    const markdown = '### Section';
    const blocks = parseMarkdown(markdown);

    expect(blocks).toHaveLength(1);
    expect(blocks[0]).toEqual({
      type: 'heading',
      level: 3,
      content: 'Section',
    });
  });

  it('should parse unordered list', () => {
    const markdown = `
- Item 1
- Item 2
- Item 3
    `.trim();

    const blocks = parseMarkdown(markdown);

    expect(blocks).toHaveLength(1);
    expect(blocks[0]).toEqual({
      type: 'list',
      ordered: false,
      items: ['Item 1', 'Item 2', 'Item 3'],
    });
  });

  it('should parse ordered list', () => {
    const markdown = `
1. First
2. Second
3. Third
    `.trim();

    const blocks = parseMarkdown(markdown);

    expect(blocks).toHaveLength(1);
    expect(blocks[0]).toEqual({
      type: 'list',
      ordered: true,
      items: ['First', 'Second', 'Third'],
    });
  });

  it('should parse paragraph', () => {
    const markdown = 'This is a simple paragraph with some text.';
    const blocks = parseMarkdown(markdown);

    expect(blocks).toHaveLength(1);
    expect(blocks[0]).toEqual({
      type: 'paragraph',
      content: 'This is a simple paragraph with some text.',
    });
  });

  it('should parse mixed content', () => {
    const markdown = `
# Title

This is a paragraph.

| Col1 | Col2 |
|------|------|
| A    | B    |

- List item 1
- List item 2
    `.trim();

    const blocks = parseMarkdown(markdown);

    expect(blocks).toHaveLength(4);
    expect(blocks[0].type).toBe('heading');
    expect(blocks[1].type).toBe('paragraph');
    expect(blocks[2].type).toBe('table');
    expect(blocks[3].type).toBe('list');
  });

  it('should strip bold formatting', () => {
    const markdown = 'This is **bold** text.';
    const blocks = parseMarkdown(markdown);

    expect(blocks).toHaveLength(1);
    expect(blocks[0].type === 'paragraph' && blocks[0].content).toBe('This is bold text.');
  });

  it('should strip italic formatting', () => {
    const markdown = 'This is *italic* text.';
    const blocks = parseMarkdown(markdown);

    expect(blocks).toHaveLength(1);
    expect(blocks[0].type === 'paragraph' && blocks[0].content).toBe('This is italic text.');
  });

  it('should handle empty input', () => {
    expect(parseMarkdown('')).toEqual([]);
    expect(parseMarkdown('   ')).toEqual([]);
  });

  it('should parse multiple paragraphs', () => {
    const markdown = `
First paragraph.

Second paragraph.
    `.trim();

    const blocks = parseMarkdown(markdown);

    expect(blocks).toHaveLength(2);
    expect(blocks[0].type).toBe('paragraph');
    expect(blocks[1].type).toBe('paragraph');
  });

  it('should handle table with long text in cells', () => {
    const markdown = `
| Task | Description |
|------|-------------|
| Task 1 | This is a very long description that should be properly handled in the PDF renderer |
| Task 2 | Another description |
    `.trim();

    const blocks = parseMarkdown(markdown);

    expect(blocks).toHaveLength(1);
    expect(blocks[0].type).toBe('table');

    if (blocks[0].type === 'table') {
      expect(blocks[0].rows[0][1]).toContain('very long description');
    }
  });
});
