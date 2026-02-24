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
  fileName: string,
  tier: 'free' | 'pro' | 'team' = 'free',
  options?: {
    includeSummary?: boolean;
    includeTranscript?: boolean;
    includeMetadata?: boolean;
    template?: AIConfiguration['contentType'];
  }
): Promise<void> {
  try {
    const effectiveSummary = options?.includeSummary === false ? '' : summary;
    const effectiveTranscript = options?.includeTranscript === false ? '' : transcript;
    const effectiveConfig = options?.template
      ? { ...config, contentType: options.template }
      : config;

    // Generate PDF blob from Document component
    const blob = await pdf(
      ResultPdfDocument({
        summary: effectiveSummary,
        transcript: effectiveTranscript,
        config: effectiveConfig,
        fileName,
        tier,
        includeMetadata: options?.includeMetadata ?? true,
      })
    ).toBlob();

    // Create download link
    const url = URL.createObjectURL(blob);

    // Sanitize filename to prevent directory traversal or invalid characters (allow unicode)
    // Remove only characters that are unsafe for filenames on Windows/Linux/Mac: < > : " / \ | ? *
    const sanitizedFileName = (fileName || 'Trammarise-Summary')
      .replace(/[<>:"/\\|?*]/g, '-')
      .trim()
      .replace(/\s+/g, '-');

    const a = document.createElement('a');
    a.href = url;
    a.download = `${sanitizedFileName}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    // Clean up after a short delay to ensure the download has started
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  } catch (error) {
    throw new Error(
      `Failed to generate PDF: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}
