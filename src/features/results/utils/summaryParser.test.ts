import { describe, it, expect } from 'vitest';
import { parseSummary } from './summaryParser';

describe('summaryParser', () => {
  describe('Section Parsing', () => {
    it('parses EXECUTIVE SUMMARY section with ## heading', () => {
      const markdown = `
## EXECUTIVE SUMMARY
This is the executive summary content.
Some more details here.
      `;
      const result = parseSummary(markdown);
      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('executive_summary');
      expect(result[0].title).toBe('EXECUTIVE SUMMARY');
      expect(result[0].content).toContain('This is the executive summary content');
    });

    it('parses EXECUTIVE SUMMARY section with ** heading', () => {
      const markdown = `
**EXECUTIVE SUMMARY**
This is the executive summary content.
      `;
      const result = parseSummary(markdown);
      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('executive_summary');
      expect(result[0].title).toBe('EXECUTIVE SUMMARY');
    });

    it('parses KEY TAKEAWAYS section with ## heading', () => {
      const markdown = `
## KEY TAKEAWAYS
- Point 1
- Point 2
- Point 3
      `;
      const result = parseSummary(markdown);
      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('key_takeaways');
      expect(result[0].title).toBe('KEY TAKEAWAYS');
    });

    it('parses KEY TAKEAWAY section (singular)', () => {
      const markdown = `
## KEY TAKEAWAY
- Single important point
      `;
      const result = parseSummary(markdown);
      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('key_takeaways');
    });

    it('handles both EXECUTIVE SUMMARY and KEY TAKEAWAYS', () => {
      const markdown = `
## EXECUTIVE SUMMARY
Summary content here.

## KEY TAKEAWAYS
- Point 1
- Point 2
      `;
      const result = parseSummary(markdown);
      expect(result).toHaveLength(2);
      expect(result[0].type).toBe('executive_summary');
      expect(result[1].type).toBe('key_takeaways');
    });

    it('parses regular sections without special headings', () => {
      const markdown = `
## Introduction
Regular content here.

## Details
More regular content.
      `;
      const result = parseSummary(markdown);
      // When no special sections exist, returns entire content as one regular section
      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('regular');
      expect(result[0].content).toBe(markdown);
    });

    it('returns all as regular when no special sections found', () => {
      const markdown = `
This is plain markdown without any special sections.
Just regular content.
      `;
      const result = parseSummary(markdown);
      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('regular');
      expect(result[0].title).toBe('');
      expect(result[0].content).toBe(markdown);
    });
  });

  describe('Format Variations', () => {
    it('handles case-insensitive EXECUTIVE SUMMARY', () => {
      const variations = [
        '## EXECUTIVE SUMMARY\nContent',
        '## Executive Summary\nContent',
        '## executive summary\nContent',
        '**EXECUTIVE SUMMARY**\nContent',
      ];

      variations.forEach((markdown) => {
        const result = parseSummary(markdown);
        expect(result[0].type).toBe('executive_summary');
      });
    });

    it('handles case-insensitive KEY TAKEAWAYS', () => {
      const variations = [
        '## KEY TAKEAWAYS',
        '## Key Takeaways',
        '## key takeaways',
        '**KEY TAKEAWAYS**',
      ];

      variations.forEach((heading) => {
        const markdown = `${heading}\n- Item`;
        const result = parseSummary(markdown);
        expect(result[0].type).toBe('key_takeaways');
      });
    });

    it('handles EXECUTIVE SUMMARY with extra whitespace', () => {
      const markdown = '##  EXECUTIVE SUMMARY  \nContent';
      const result = parseSummary(markdown);
      expect(result[0].type).toBe('executive_summary');
    });

    it('handles KEY TAKEAWAYS with extra whitespace after ##', () => {
      const markdown = '##  KEY TAKEAWAYS  \nContent';
      const result = parseSummary(markdown);
      // Extra whitespace after ## is handled by \s* in regex
      expect(result[0].type).toBe('key_takeaways');
    });
  });

  describe('KEY TAKEAWAYS Items', () => {
    it('extracts bullet points from KEY TAKEAWAYS', () => {
      const markdown = `
## KEY TAKEAWAYS
- First point
- Second point
- Third point
      `;
      const result = parseSummary(markdown);
      expect(result[0].items).toEqual(['First point', 'Second point', 'Third point']);
    });

    it('handles asterisk bullets', () => {
      const markdown = `
## KEY TAKEAWAYS
* Point with asterisk
* Another point
      `;
      const result = parseSummary(markdown);
      expect(result[0].items).toEqual(['Point with asterisk', 'Another point']);
    });

    it('handles plus sign bullets', () => {
      const markdown = `
## KEY TAKEAWAYS
+ Point with plus
+ Another point
      `;
      const result = parseSummary(markdown);
      expect(result[0].items).toEqual(['Point with plus', 'Another point']);
    });

    it('handles numbered lists', () => {
      const markdown = `
## KEY TAKEAWAYS
1. First numbered item
2. Second numbered item
3. Third numbered item
      `;
      const result = parseSummary(markdown);
      expect(result[0].items).toEqual([
        'First numbered item',
        'Second numbered item',
        'Third numbered item',
      ]);
    });

    it('handles mixed bullet types', () => {
      const markdown = `
## KEY TAKEAWAYS
- Hyphen bullet
* Asterisk bullet
+ Plus bullet
1. Numbered item
      `;
      const result = parseSummary(markdown);
      expect(result[0].items).toHaveLength(4);
    });

    it('returns undefined items when no bullet points', () => {
      const markdown = `
## KEY TAKEAWAYS
This section has no bullet points.
Just plain text.
      `;
      const result = parseSummary(markdown);
      expect(result[0].items).toBeUndefined();
    });

    it('trims whitespace from bullet point text', () => {
      const markdown = `
## KEY TAKEAWAYS
-   Point with extra spaces
*    Another with tabs
      `;
      const result = parseSummary(markdown);
      expect(result[0].items![0]).toBe('Point with extra spaces');
      expect(result[0].items![1]).toBe('Another with tabs');
    });

    it('handles bullet points with special characters', () => {
      const markdown = `
## KEY TAKEAWAYS
- Point with @symbols #hashtag
- Point with $money & ampersand
      `;
      const result = parseSummary(markdown);
      expect(result[0].items).toEqual([
        'Point with @symbols #hashtag',
        'Point with $money & ampersand',
      ]);
    });
  });

  describe('Edge Cases', () => {
    it('handles empty string', () => {
      const result = parseSummary('');
      expect(result).toEqual([]);
    });

    it('handles whitespace-only string', () => {
      const result = parseSummary('   \n  \n   ');
      expect(result).toEqual([]);
    });

    it('handles multiple EXECUTIVE SUMMARY sections (takes first)', () => {
      const markdown = `
## EXECUTIVE SUMMARY
First summary

## EXECUTIVE SUMMARY
Second summary
      `;
      const result = parseSummary(markdown);
      // Should find both, as they are separate sections
      const executiveSections = result.filter(s => s.type === 'executive_summary');
      expect(executiveSections.length).toBeGreaterThan(0);
    });

    it('handles EXECUTIVE SUMMARY without content', () => {
      const markdown = '## EXECUTIVE SUMMARY\n';
      const result = parseSummary(markdown);
      expect(result[0].type).toBe('executive_summary');
      expect(result[0].content).toBe('');
    });

    it('handles KEY TAKEAWAYS without content', () => {
      const markdown = '## KEY TAKEAWAYS\n';
      const result = parseSummary(markdown);
      expect(result[0].type).toBe('key_takeaways');
    });

    it('handles content with no headings', () => {
      const markdown = 'Just plain text without any headings.';
      const result = parseSummary(markdown);
      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('regular');
      expect(result[0].content).toBe(markdown);
    });

    it('handles very long content', () => {
      const longContent = 'A'.repeat(10000);
      const markdown = `## EXECUTIVE SUMMARY\n${longContent}`;
      const result = parseSummary(markdown);
      expect(result[0].content).toContain(longContent);
    });

    it('handles content with code blocks', () => {
      const markdown = `
## EXECUTIVE SUMMARY
Summary with code:
\`\`\`javascript
const foo = 'bar';
\`\`\`
      `;
      const result = parseSummary(markdown);
      expect(result[0].content).toContain('```javascript');
      expect(result[0].content).toContain('const foo');
    });

    it('handles content with inline markdown', () => {
      const markdown = `
## EXECUTIVE SUMMARY
Summary with **bold** and *italic* text.
      `;
      const result = parseSummary(markdown);
      expect(result[0].content).toContain('**bold**');
      expect(result[0].content).toContain('*italic*');
    });
  });

  describe('Real-World Examples', () => {
    it('parses typical AI-generated summary', () => {
      const markdown = `
## EXECUTIVE SUMMARY
This meeting covered project updates and team assignments. Key decisions were made regarding the Q4 roadmap.

## KEY TAKEAWAYS
- Project deadline moved to December 15th
- New team members joining next week
- Budget approved for additional resources
- Next meeting scheduled for November 10th

## DETAILED NOTES
Additional context and discussion points...
      `;
      const result = parseSummary(markdown);
      expect(result).toHaveLength(3);
      expect(result[0].type).toBe('executive_summary');
      expect(result[1].type).toBe('key_takeaways');
      expect(result[1].items).toHaveLength(4);
      expect(result[2].type).toBe('regular');
    });

    it('handles summary with only EXECUTIVE SUMMARY', () => {
      const markdown = `
**EXECUTIVE SUMMARY**
The presentation covered sales performance for Q3 2024. Overall revenue increased by 15% compared to Q2.
Key growth areas included enterprise sales and international markets.
      `;
      const result = parseSummary(markdown);
      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('executive_summary');
    });

    it('handles summary with only KEY TAKEAWAYS', () => {
      const markdown = `
## KEY TAKEAWAYS
1. Revenue up 15% quarter-over-quarter
2. New product launch scheduled for December
3. Hiring 5 new engineers
4. Expanding to APAC region
      `;
      const result = parseSummary(markdown);
      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('key_takeaways');
      expect(result[0].items).toHaveLength(4);
    });

    it('handles complex multi-section summary', () => {
      const markdown = `
## EXECUTIVE SUMMARY
Overview of the technical architecture review.

## KEY TAKEAWAYS
- Microservices architecture approved
- Migration timeline: 6 months
- Budget: $500K

## TECHNICAL DETAILS
Database schema design...

## NEXT STEPS
Action items for the team...
      `;
      const result = parseSummary(markdown);
      expect(result).toHaveLength(4);
      expect(result[0].type).toBe('executive_summary');
      expect(result[1].type).toBe('key_takeaways');
      expect(result[2].type).toBe('regular');
      expect(result[3].type).toBe('regular');
    });
  });

  describe('Content Structure', () => {
    it('preserves line breaks in content', () => {
      const markdown = `
## EXECUTIVE SUMMARY
Line 1
Line 2
Line 3
      `;
      const result = parseSummary(markdown);
      expect(result[0].content).toContain('Line 1');
      expect(result[0].content).toContain('Line 2');
      expect(result[0].content).toContain('Line 3');
    });

    it('preserves paragraphs in content', () => {
      const markdown = `
## EXECUTIVE SUMMARY
First paragraph here.

Second paragraph here.
      `;
      const result = parseSummary(markdown);
      expect(result[0].content).toContain('First paragraph');
      expect(result[0].content).toContain('Second paragraph');
    });

    it('handles nested lists in KEY TAKEAWAYS', () => {
      const markdown = `
## KEY TAKEAWAYS
- Main point 1
  - Sub-point A
  - Sub-point B
- Main point 2
      `;
      const result = parseSummary(markdown);
      // Should extract top-level points
      expect(result[0].items).toBeDefined();
      expect(result[0].items!.some(item => item.includes('Main point'))).toBe(true);
    });
  });

  describe('Type Safety', () => {
    it('returns array of ParsedSection objects', () => {
      const markdown = '## EXECUTIVE SUMMARY\nContent';
      const result = parseSummary(markdown);
      expect(Array.isArray(result)).toBe(true);
      expect(result[0]).toHaveProperty('type');
      expect(result[0]).toHaveProperty('title');
      expect(result[0]).toHaveProperty('content');
    });

    it('returns correct type for EXECUTIVE SUMMARY', () => {
      const markdown = '## EXECUTIVE SUMMARY\nContent';
      const result = parseSummary(markdown);
      expect(result[0].type).toBe('executive_summary');
    });

    it('returns correct type for KEY TAKEAWAYS', () => {
      const markdown = '## KEY TAKEAWAYS\n- Item';
      const result = parseSummary(markdown);
      expect(result[0].type).toBe('key_takeaways');
    });

    it('returns correct type for regular sections', () => {
      const markdown = '## Regular Section\nContent';
      const result = parseSummary(markdown);
      expect(result[0].type).toBe('regular');
    });
  });
});
