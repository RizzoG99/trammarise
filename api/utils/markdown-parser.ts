/**
 * Markdown parser for PDF generation
 * Parses markdown text into structured blocks for rendering
 */

export type MarkdownBlock =
  | { type: 'paragraph'; content: string }
  | { type: 'heading'; level: 1 | 2 | 3; content: string }
  | { type: 'list'; ordered: boolean; items: string[] }
  | {
      type: 'table';
      headers: string[];
      rows: string[][];
      alignments?: Array<'left' | 'center' | 'right'>;
    };

/**
 * Parse markdown text into structured blocks
 */
export function parseMarkdown(markdown: string): MarkdownBlock[] {
  if (!markdown || markdown.trim().length === 0) {
    return [];
  }

  const blocks: MarkdownBlock[] = [];
  const lines = markdown.split('\n');
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // Skip empty lines
    if (trimmed.length === 0) {
      i++;
      continue;
    }

    // Check for table (starts with |)
    if (trimmed.startsWith('|')) {
      const tableBlock = parseTable(lines, i);
      if (tableBlock) {
        blocks.push(tableBlock.block);
        i = tableBlock.nextIndex;
        continue;
      }
    }

    // Check for heading (starts with #)
    if (trimmed.startsWith('#')) {
      const headingBlock = parseHeading(trimmed);
      if (headingBlock) {
        blocks.push(headingBlock);
        i++;
        continue;
      }
    }

    // Check for unordered list (starts with - or *)
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      const listBlock = parseList(lines, i, false);
      if (listBlock) {
        blocks.push(listBlock.block);
        i = listBlock.nextIndex;
        continue;
      }
    }

    // Check for ordered list (starts with number.)
    if (/^\d+\.\s/.test(trimmed)) {
      const listBlock = parseList(lines, i, true);
      if (listBlock) {
        blocks.push(listBlock.block);
        i = listBlock.nextIndex;
        continue;
      }
    }

    // Default: paragraph
    const paragraphBlock = parseParagraph(lines, i);
    blocks.push(paragraphBlock.block);
    i = paragraphBlock.nextIndex;
  }

  return blocks;
}

/**
 * Parse a table block
 */
function parseTable(
  lines: string[],
  startIndex: number
): { block: MarkdownBlock; nextIndex: number } | null {
  let i = startIndex;
  const tableLines: string[] = [];

  // Collect all consecutive lines that are part of the table
  while (i < lines.length && lines[i].trim().startsWith('|')) {
    tableLines.push(lines[i].trim());
    i++;
  }

  if (tableLines.length < 2) {
    return null; // Not a valid table (need at least header + separator)
  }

  // Parse header row
  const headers = parseTableRow(tableLines[0]);

  // Check if second line is separator (contains only |, -, and :)
  const separatorLine = tableLines[1];
  // eslint-disable-next-line no-useless-escape
  if (!/^[\|\s\-:]+$/.test(separatorLine)) {
    return null; // Not a valid table
  }

  // Parse alignments from separator
  const alignments = parseTableAlignments(separatorLine);

  // Parse data rows
  const rows: string[][] = [];
  for (let j = 2; j < tableLines.length; j++) {
    const row = parseTableRow(tableLines[j]);
    rows.push(row);
  }

  return {
    block: {
      type: 'table',
      headers,
      rows,
      alignments,
    },
    nextIndex: i,
  };
}

/**
 * Parse a single table row
 */
function parseTableRow(line: string): string[] {
  // Remove leading and trailing pipes
  let content = line.trim();
  if (content.startsWith('|')) content = content.substring(1);
  if (content.endsWith('|')) content = content.substring(0, content.length - 1);

  // Split by pipes and trim each cell
  return content.split('|').map((cell) => cell.trim());
}

/**
 * Parse table column alignments from separator row
 */
function parseTableAlignments(separatorLine: string): Array<'left' | 'center' | 'right'> {
  const cells = parseTableRow(separatorLine);

  return cells.map((cell) => {
    const startsWithColon = cell.startsWith(':');
    const endsWithColon = cell.endsWith(':');

    if (startsWithColon && endsWithColon) return 'center';
    if (endsWithColon) return 'right';
    return 'left';
  });
}

/**
 * Parse a heading block
 */
function parseHeading(line: string): MarkdownBlock | null {
  const match = line.match(/^(#{1,3})\s+(.+)$/);
  if (!match) return null;

  const level = match[1].length as 1 | 2 | 3;
  const content = match[2].trim();

  return {
    type: 'heading',
    level,
    content: stripInlineFormatting(content),
  };
}

/**
 * Parse a list block
 */
function parseList(
  lines: string[],
  startIndex: number,
  ordered: boolean
): { block: MarkdownBlock; nextIndex: number } | null {
  let i = startIndex;
  const items: string[] = [];
  const pattern = ordered ? /^\d+\.\s+(.+)$/ : /^[-*]\s+(.+)$/;

  while (i < lines.length) {
    const line = lines[i].trim();
    if (line.length === 0) break;

    const match = line.match(pattern);
    if (!match) break;

    items.push(stripInlineFormatting(match[1].trim()));
    i++;
  }

  if (items.length === 0) return null;

  return {
    block: {
      type: 'list',
      ordered,
      items,
    },
    nextIndex: i,
  };
}

/**
 * Parse a paragraph block
 */
function parseParagraph(
  lines: string[],
  startIndex: number
): { block: MarkdownBlock; nextIndex: number } {
  let i = startIndex;
  const paragraphLines: string[] = [];

  while (i < lines.length) {
    const line = lines[i].trim();

    // Stop at empty line
    if (line.length === 0) break;

    // Stop at special block markers
    if (
      line.startsWith('#') ||
      line.startsWith('|') ||
      line.startsWith('- ') ||
      line.startsWith('* ') ||
      /^\d+\.\s/.test(line)
    ) {
      break;
    }

    paragraphLines.push(line);
    i++;
  }

  const content = paragraphLines.join(' ');

  return {
    block: {
      type: 'paragraph',
      content: stripInlineFormatting(content),
    },
    nextIndex: i,
  };
}

/**
 * Strip inline markdown formatting (bold, italic)
 * Converts **bold** and *italic* to plain text
 */
function stripInlineFormatting(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '$1') // Bold
    .replace(/\*(.+?)\*/g, '$1') // Italic
    .replace(/__(.+?)__/g, '$1') // Bold (alternative)
    .replace(/_(.+?)_/g, '$1') // Italic (alternative)
    .replace(/`(.+?)`/g, '$1'); // Code
}
