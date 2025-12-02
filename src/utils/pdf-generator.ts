import { jsPDF } from 'jspdf';
import type { AIConfiguration } from '../types/audio';

export function generatePDF(
  summary: string,
  transcript: string,
  config: AIConfiguration
): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y = 20;

  // Helper to add text and advance Y
  const addText = (text: string, fontSize: number, isBold = false) => {
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', isBold ? 'bold' : 'normal');
    
    const lines = doc.splitTextToSize(text, contentWidth);
    doc.text(lines, margin, y);
    y += lines.length * (fontSize * 0.5) + 5;

    // Check for new page
    if (y > doc.internal.pageSize.getHeight() - margin) {
      doc.addPage();
      y = margin;
    }
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
  doc.save(`trammarise-summary-${Date.now()}.pdf`);
}
