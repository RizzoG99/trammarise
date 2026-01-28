import { PDFViewer } from '@react-pdf/renderer';
import { ResultPdfDocument } from '../../features/results/components/pdf/ResultPdfDocument';
import { PageLayout } from '../../components/layout/PageLayout';

// Mock data for testing
const mockSummary = `# Meeting Summary

## Executive Summary

This is a **test summary** with various markdown elements to verify PDF rendering.

## Key Points

- First important point with *italic* text
- Second point with \`inline code\`
- Third point with **bold** text

### Detailed Breakdown

1. Numbered item one
2. Numbered item two
3. Numbered item three

## Data Table

| Feature | Status | Priority |
|---------|--------|----------|
| PDF Export | Complete | High |
| Markdown Support | In Progress | High |
| Table Rendering | Testing | Medium |

## Code Example

\`\`\`javascript
function example() {
  return "Hello PDF!";
}
\`\`\`

## Conclusion

This document demonstrates the PDF rendering capabilities with full markdown support.
`;

const mockTranscript = `[00:00] Speaker 1: Welcome to the meeting.
[00:15] Speaker 2: Thank you for having me.
[00:30] Speaker 1: Let's discuss the project status.
[01:00] Speaker 2: We've made significant progress on the PDF export feature.
[01:30] Speaker 1: That's great to hear. What about markdown support?
[02:00] Speaker 2: We're implementing full markdown rendering including tables.`;

const mockConfig = {
  contentType: 'Meeting',
  model: 'gpt-4',
  provider: 'openai' as const,
  mode: 'simple' as const,
  openaiKey: 'test-key',
  language: 'en' as const,
};

/**
 * Debug page for previewing PDF output.
 * Accessible at /debug/pdf for rapid iteration on PDF layout.
 */
export function PdfPreviewPage() {
  return (
    <PageLayout>
      <div className="min-h-screen bg-[var(--color-background)] p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-4 text-[var(--color-text-primary)]">
            PDF Preview (Debug)
          </h1>
          <p className="text-[var(--color-text-secondary)] mb-6">
            This page allows you to preview the PDF output without processing audio files. Edit the
            mock data in <code>PdfPreviewPage.tsx</code> to test different scenarios.
          </p>

          <div className="w-full h-[800px] border border-[var(--color-border)] rounded-lg overflow-hidden">
            <PDFViewer width="100%" height="100%">
              <ResultPdfDocument
                summary={mockSummary}
                transcript={mockTranscript}
                config={mockConfig}
                fileName="Test Document"
              />
            </PDFViewer>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
