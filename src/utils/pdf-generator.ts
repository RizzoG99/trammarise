import { jsPDF } from 'jspdf';
import type { AIConfiguration } from '../types/audio';

export function generatePDF(
  summary: string,
  transcript: string,
  config: AIConfiguration
): void {
  try {
    console.log('📄 Starting PDF generation...');
    console.log('Summary length:', summary.length);
    console.log('Transcript length:', transcript.length);
    
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - margin * 2;
    let y = 20;

    // Helper to add text and advance Y
    const addText = (text: string, fontSize: number, isBold = false) => {
      doc.setFontSize(fontSize);
      doc.setFont('helvetica', isBold ? 'bold' : 'normal');
      
      if (!text || text.trim() === '') {
        console.warn('Empty text passed to addText');
        return;
      }
      
      const lines = doc.splitTextToSize(text, contentWidth);
      console.log(`Adding ${lines.length} lines at y=${y}, fontSize=${fontSize}`);
      
      // Add each line individually to ensure proper spacing
      for (let i = 0; i < lines.length; i++) {
        // Check if we need a new page before adding the line
        if (y > pageHeight - margin) {
          console.log('Adding new page...');
          doc.addPage();
          y = margin;
        }
        
        doc.text(lines[i], margin, y);
        // Use proper line height in points (fontSize * 1.15 is standard)
        // jsPDF uses points, so we need to convert to mm (1 pt ≈ 0.3527 mm)
        y += (fontSize * 0.3527 * 1.5); // 1.5 line spacing
      }
      
      // Add extra space after paragraph
      y += 5;
    };

    // Title
    addText('Trammarise Summary', 24, true);
    y += 5;

    // Metadata
    addText(`Date: ${new Date().toLocaleDateString()}`, 10);
    addText(`Type: ${config.contentType}`, 10);
    addText(`Model: ${config.model}`, 10);
    y += 10;

    // Summary Section
    addText('Summary', 16, true);
    addText(summary, 12);
    y += 10;

    // Transcript Section
    addText('Full Transcript', 16, true);
    addText(transcript, 10);

    // Save
    const filename = `trammarise-summary-${Date.now()}.pdf`;
    console.log('💾 Saving PDF as:', filename);
    doc.save(filename);
    console.log('✅ PDF generation completed successfully');
  } catch (error) {
    console.error('❌ Error generating PDF:', error);
    throw new Error(`Failed to generate PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
