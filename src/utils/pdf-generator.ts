import { pdf } from '@react-pdf/renderer';
import { ResultPdfDocument } from '../features/results/components/pdf/ResultPdfDocument';
import type { AIConfiguration } from '../types/audio';

/**
 * Generates a PDF using @react-pdf/renderer.
 *
 * @param summary - Markdown summary content
 * @param transcript - Full transcript text
 * @param config - AI configuration metadata
 * @param fileName - Base filename for the PDF
 */
export async function generatePDF(
  summary: string,
  transcript: string,
  config: AIConfiguration,
  fileName: string
): Promise<void> {
  try {
    console.log('📄 Starting PDF generation with @react-pdf/renderer...');

    // Generate PDF blob from Document component
    const blob = await pdf(
      ResultPdfDocument({
        summary,
        transcript,
        config,
        fileName,
      })
    ).toBlob();

    // Create download link
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    // Clean up
    setTimeout(() => URL.revokeObjectURL(url), 100);

    console.log('✅ PDF generation completed successfully');
  } catch (error) {
    console.error('❌ Error generating PDF:', error);
    throw new Error(
      `Failed to generate PDF: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}
