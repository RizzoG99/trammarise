import type { VercelRequest, VercelResponse } from '@vercel/node';
import { generatePDFDocument } from './utils/pdf-templates/base-template';
import type { ContentType } from './types';

export const config = {
  api: {
    bodyParser: true,
  },
  maxDuration: 60, // 60 second timeout
};

interface PDFGenerationRequest {
  transcript: string;
  summary: string;
  contentType: ContentType;
  fileName?: string;
  aiConfig?: {
    provider: string;
    model: string;
    transcriptionModel?: string;
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('📄 PDF Generation API called');

    const { transcript, summary, contentType, fileName, aiConfig } =
      req.body as PDFGenerationRequest;

    // Validate inputs
    if (!transcript || !summary) {
      return res.status(400).json({ error: 'Transcript and summary are required' });
    }

    if (!contentType) {
      return res.status(400).json({ error: 'Content type is required' });
    }

    console.log('📝 Generating PDF with template system...');

    // Generate PDF using template system (no AI call needed!)
    const pdfBuffer = await generatePDFDocument({
      transcript,
      summary,
      contentType,
      fileName,
      aiConfig,
    });

    console.log('✅ PDF generated successfully, size:', pdfBuffer.length, 'bytes');

    // Set response headers for PDF download
    const sanitizedFileName = (fileName || 'Trammarise-Transcript')
      .replace(/[^a-z0-9\-_\s]/gi, '')
      .replace(/\s+/g, '-');

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${sanitizedFileName}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);

    // Send PDF buffer
    res.status(200).send(pdfBuffer);

    console.log('✅ PDF generated and sent successfully');
  } catch (error) {
    const err = error as { message?: string };
    console.error('❌ PDF generation error:', error);

    // If headers not sent yet, send error response
    if (!res.headersSent) {
      return res.status(500).json({
        error: 'PDF generation failed',
        message: err.message || 'Unknown error occurred',
      });
    }
  }
}
