/**
 * Main PDF orchestrator
 * Coordinates section generation and creates the final PDF document
 */

import PDFDocument from 'pdfkit';
import type { ContentType } from '../../types';
import { PDF_LAYOUT, PDF_METADATA } from './pdf-styles';
import { getTemplateForContentType } from './content-type-handlers';
import {
  generateCoverPage,
  generateTableOfContents,
  generateSummarySection,
  generateKeyPointsSection,
  generateActionItemsSection,
  generateTopicsSection,
  generateTranscriptSection,
  generateProcessingDetails,
  addDisclaimer,
} from './section-generators';

export interface PDFGenerationOptions {
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

/**
 * Generate PDF document using template system
 * @returns Buffer containing the PDF data
 */
export async function generatePDFDocument(options: PDFGenerationOptions): Promise<Buffer> {
  const { transcript, summary, contentType, fileName = 'Transcription', aiConfig } = options;

  // Create PDF document
  const doc = new PDFDocument({
    size: [PDF_LAYOUT.pageWidth, PDF_LAYOUT.pageHeight],
    margins: {
      top: PDF_LAYOUT.margin.top,
      bottom: PDF_LAYOUT.margin.bottom,
      left: PDF_LAYOUT.margin.left,
      right: PDF_LAYOUT.margin.right,
    },
    info: {
      Title: fileName,
      Author: PDF_METADATA.creator,
      Creator: PDF_METADATA.creator,
      Producer: PDF_METADATA.producer,
      Subject: PDF_METADATA.subject,
    },
  });

  // Collect PDF data in buffer
  const chunks: Buffer[] = [];
  doc.on('data', (chunk) => chunks.push(chunk));

  // Create context for section generators
  const ctx = {
    doc,
    contentType,
    fileName,
    summary,
    transcript,
    aiConfig,
  };

  // Get template configuration
  const template = getTemplateForContentType(contentType);

  // Generate sections
  generateCoverPage(ctx);
  generateTableOfContents(ctx);
  generateSummarySection(ctx);

  if (template.includeKeyPoints) {
    generateKeyPointsSection(ctx);
  }

  if (template.includeActionItems) {
    generateActionItemsSection(ctx);
  }

  if (template.includeTopics) {
    generateTopicsSection(ctx);
  }

  generateTranscriptSection(ctx);
  generateProcessingDetails(ctx);

  // Add disclaimer if specified
  if (template.disclaimerText) {
    addDisclaimer(doc, template.disclaimerText);
  }

  // Finalize PDF (page numbers are added during generation, not after)
  doc.end();

  // Wait for PDF generation to complete
  return new Promise((resolve, reject) => {
    doc.on('end', () => {
      const buffer = Buffer.concat(chunks);
      resolve(buffer);
    });
    doc.on('error', reject);
  });
}
