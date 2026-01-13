/**
 * Parsed section from a markdown summary
 */
export interface ParsedSection {
  type: 'executive_summary' | 'key_takeaways' | 'regular';
  title: string;
  content: string;
  items?: string[];
}

/**
 * Parses a markdown summary into structured sections.
 *
 * Identifies special sections (EXECUTIVE SUMMARY, KEY TAKEAWAYS) and
 * extracts their content. Falls back to treating entire content as regular
 * markdown if no special sections are found.
 *
 * @param markdown - The markdown summary to parse
 * @returns Array of parsed sections
 *
 * @example
 * ```typescript
 * const summary = `
 * ## EXECUTIVE SUMMARY
 * This is the executive summary content.
 *
 * ## KEY TAKEAWAYS
 * - Point 1
 * - Point 2
 *
 * ## Other Section
 * Regular content here.
 * `;
 *
 * const sections = parseSummary(summary);
 * // Returns:
 * // [
 * //   { type: 'executive_summary', title: 'EXECUTIVE SUMMARY', content: '...', items: undefined },
 * //   { type: 'key_takeaways', title: 'KEY TAKEAWAYS', content: '...', items: ['Point 1', 'Point 2'] },
 * //   { type: 'regular', title: '', content: '## Other Section\nRegular content here.', items: undefined }
 * // ]
 * ```
 */
export function parseSummary(markdown: string): ParsedSection[] {
  // Handle empty input
  if (!markdown || markdown.trim() === '') {
    return [];
  }

  const sections: ParsedSection[] = [];

  // Regex patterns for special sections (case-insensitive)
  // Matches: ## EXECUTIVE SUMMARY or **EXECUTIVE SUMMARY**
  const executiveSummaryRegex = /(?:^|\n)(?:##\s*|\*\*)(EXECUTIVE\s+SUMMARY)(?:\*\*)?[\s\n]/i;
  const keyTakeawaysRegex = /(?:^|\n)(?:##\s*|\*\*)(KEY\s+TAKEAWAYS?)(?:\*\*)?[\s\n]/i;

  const hasExecutiveSummary = executiveSummaryRegex.test(markdown);
  const hasKeyTakeaways = keyTakeawaysRegex.test(markdown);

  // If no special sections found, return entire content as regular
  if (!hasExecutiveSummary && !hasKeyTakeaways) {
    return [{
      type: 'regular',
      title: '',
      content: markdown,
      items: undefined,
    }];
  }

  // Split markdown by heading patterns
  const allHeadingsRegex = /(?:^|\n)(##\s+[^\n]+|\*\*[A-Z\s]+\*\*)/g;
  const parts = markdown.split(allHeadingsRegex).filter(Boolean);

  let i = 0;
  while (i < parts.length) {
    const part = parts[i].trim();

    // Check if this is a heading
    const isHeading = /^(?:##\s+|\*\*[A-Z\s]+\*\*)/.test(part);

    if (isHeading) {
      // Extract heading text
      const headingText = part.replace(/^##\s+/, '').replace(/^\*\*/, '').replace(/\*\*$/, '').trim();
      const content = i + 1 < parts.length ? parts[i + 1].trim() : '';

      // Check if it's EXECUTIVE SUMMARY
      if (/^EXECUTIVE\s+SUMMARY$/i.test(headingText)) {
        sections.push({
          type: 'executive_summary',
          title: headingText,
          content,
          items: undefined,
        });
        i += 2;
        continue;
      }

      // Check if it's KEY TAKEAWAYS
      if (/^KEY\s+TAKEAWAYS?$/i.test(headingText)) {
        // Parse bullet points
        const items = extractBulletPoints(content);
        sections.push({
          type: 'key_takeaways',
          title: headingText,
          content,
          items: items.length > 0 ? items : undefined,
        });
        i += 2;
        continue;
      }

      // Regular section
      const sectionContent = part + (content ? '\n' + content : '');
      sections.push({
        type: 'regular',
        title: '',
        content: sectionContent,
        items: undefined,
      });
      i += 2;
    } else {
      // Non-heading content (regular)
      sections.push({
        type: 'regular',
        title: '',
        content: part,
        items: undefined,
      });
      i += 1;
    }
  }

  return sections;
}

/**
 * Extracts bullet points from markdown content.
 *
 * Supports both unordered lists (-,*, +) and numbered lists (1., 2., etc.)
 *
 * @param content - Markdown content to extract bullets from
 * @returns Array of bullet point text (without markers)
 */
function extractBulletPoints(content: string): string[] {
  const lines = content.split('\n');
  const items: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();

    // Match unordered list items: - item, * item, + item
    const unorderedMatch = trimmed.match(/^[-*+]\s+(.+)$/);
    if (unorderedMatch) {
      items.push(unorderedMatch[1].trim());
      continue;
    }

    // Match ordered list items: 1. item, 2. item, etc.
    const orderedMatch = trimmed.match(/^\d+\.\s+(.+)$/);
    if (orderedMatch) {
      items.push(orderedMatch[1].trim());
      continue;
    }
  }

  return items;
}
