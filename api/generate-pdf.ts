import type { VercelRequest, VercelResponse } from '@vercel/node';
import PDFDocument from 'pdfkit';
import { ProviderFactory, type ProviderType } from './providers/factory';
import { getSummarizationModelForLevel, type PerformanceLevel } from '../src/types/performance-levels';

export const config = {
  api: {
    bodyParser: true,
  },
};

interface PDFGenerationRequest {
  transcript: string;
  summary: string;
  contentType: string;
  provider: ProviderType;
  apiKey: string;
  model?: string;
  language?: string;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('📄 PDF Generation API called');
    
    const {
      transcript,
      summary,
      contentType,
      provider,
      apiKey,
      model,
      language
    } = req.body as PDFGenerationRequest;

    // Validate inputs
    if (!transcript || !summary) {
      return res.status(400).json({ error: 'Transcript and summary are required' });
    }

    if (!provider || !apiKey) {
      return res.status(400).json({ error: 'Provider and API key are required' });
    }

    console.log('🤖 Asking AI to format PDF content...');
    
    // Use AI to format the content beautifully
    const aiProvider = ProviderFactory.getProvider(provider);
    
    const formattingMessage = `You are a professional document formatter. Format the following content into a well-structured document.

Content Type: ${contentType || 'general'}
Language: ${language || 'English'}

Create a professional document structure with:
1. A clear title based on the content
2. Executive Summary section (concise overview)
3. Key Points/Highlights (bullet points of main takeaways)
4. Full Transcript (organized with proper paragraphs)
5. If applicable: Action Items, Conclusions, or Recommendations

Format your response as clean, readable text with clear section headers (use "===" for main sections).
Make it professional and easy to read. DO NOT use markdown formatting.`;

    // Map performance level to actual model name
    const actualModel = model
      ? getSummarizationModelForLevel(model as PerformanceLevel)
      : undefined;

    const formattedContent = await aiProvider.chat({
      transcript,
      summary,
      message: formattingMessage,
      history: [],
      apiKey,
      model: actualModel,
    });

    console.log('📝 Generating PDF from AI-formatted content...');

    // Create PDF
    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 50, bottom: 50, left: 50, right: 50 }
    });

    // Set response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="trammarise-${Date.now()}.pdf"`);

    // Pipe PDF to response
    doc.pipe(res);

    // Add Trammarise branding
    doc.fontSize(24)
       .fillColor('#8B5CF6')
       .text('Trammarise', { align: 'center' });
    
    doc.moveDown(0.5);
    doc.fontSize(10)
       .fillColor('#666666')
       .text(`Generated on ${new Date().toLocaleDateString()}`, { align: 'center' });
    
    doc.moveDown(2);

    // Parse and add AI-formatted content
    const sections = formattedContent.split('===').map(s => s.trim()).filter(Boolean);
    
    doc.fillColor('#000000');
    
    for (const section of sections) {
      const lines = section.split('\n');
      const title = lines[0];
      const content = lines.slice(1).join('\n').trim();

      // Section title
      doc.fontSize(16)
         .fillColor('#8B5CF6')
         .text(title, { continued: false });
      
      doc.moveDown(0.5);

      // Section content
      doc.fontSize(11)
         .fillColor('#000000')
         .text(content, {
           align: 'left',
           lineGap: 2
         });

      doc.moveDown(1.5);

      // Add new page if needed (check if we're near the bottom)
      if (doc.y > 700) {
        doc.addPage();
      }
    }

    // Finalize PDF
    doc.end();
    
    console.log('✅ PDF generated and sent successfully');

  } catch (error: any) {
    console.error('❌ PDF generation error:', error);
    
    // If headers not sent yet, send error response
    if (!res.headersSent) {
      return res.status(500).json({
        error: 'PDF generation failed',
        message: error.message
      });
    }
  }
}
