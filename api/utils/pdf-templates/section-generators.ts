/**
 * Section rendering functions for PDF generation
 * Each function handles a specific section of the PDF
 */

import type PDFDocument from 'pdfkit';
import type { ContentType } from '../../types';
import { PDF_COLORS, PDF_FONTS, PDF_LAYOUT } from './pdf-styles';
import {
  formatContentType,
  extractActionItems,
  extractKeyPoints,
  extractTopics,
  getTemplateForContentType,
} from './content-type-handlers';
import { parseMarkdown } from '../markdown-parser';
import { renderTable } from './table-renderer';

interface SectionContext {
  doc: typeof PDFDocument.prototype;
  contentType: ContentType;
  fileName: string;
  summary: string;
  transcript: string;
  aiConfig?: {
    provider: string;
    model: string;
    transcriptionModel?: string;
  };
}

/**
 * Generate cover page with branding and metadata
 */
export function generateCoverPage(ctx: SectionContext): void {
  const { doc, contentType, fileName } = ctx;

  // Title
  doc
    .fontSize(PDF_FONTS.h1)
    .fillColor(PDF_COLORS.primary)
    .font('Helvetica-Bold')
    .text('Trammarise', PDF_LAYOUT.margin.left, 150, { align: 'center' });

  // Document title
  doc
    .moveDown(2)
    .fontSize(PDF_FONTS.h2)
    .fillColor(PDF_COLORS.text)
    .font('Helvetica')
    .text(fileName || 'Transcription', { align: 'center' });

  // Content type badge
  const contentTypeLabel = formatContentType(contentType);
  doc
    .moveDown(1)
    .fontSize(PDF_FONTS.body)
    .fillColor(PDF_COLORS.textLight)
    .text(contentTypeLabel.toUpperCase(), { align: 'center' });

  // Generation date
  const dateStr = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  doc
    .moveDown(4)
    .fontSize(PDF_FONTS.caption)
    .fillColor(PDF_COLORS.textLight)
    .text(`Generated on ${dateStr}`, { align: 'center' });

  // New page for content
  doc.addPage();
}

/**
 * Generate table of contents with page numbers
 */
export function generateTableOfContents(ctx: SectionContext): { [section: string]: number } {
  const { doc } = ctx;
  const template = getTemplateForContentType(ctx.contentType);

  doc
    .fontSize(PDF_FONTS.h2)
    .fillColor(PDF_COLORS.primary)
    .font('Helvetica-Bold')
    .text('Table of Contents', PDF_LAYOUT.margin.left, PDF_LAYOUT.margin.top);

  doc.moveDown(1);

  // Track page numbers for each section (estimated)
  const pageMap: { [section: string]: number } = {
    summary: 3,
    keyPoints: 3,
    actionItems: 4,
    topics: 4,
    transcript: 5,
    details: 999, // Last page
  };

  const entries: Array<[string, number]> = [['Summary', pageMap.summary]];

  if (template.includeKeyPoints) {
    entries.push(['Key Points', pageMap.keyPoints]);
  }
  if (template.includeActionItems) {
    entries.push(['Action Items', pageMap.actionItems]);
  }
  if (template.includeTopics) {
    entries.push(['Topics Covered', pageMap.topics]);
  }

  entries.push(['Full Transcript', pageMap.transcript]);
  entries.push(['Processing Details', pageMap.details]);

  // Render TOC entries
  doc.fontSize(PDF_FONTS.body).fillColor(PDF_COLORS.text).font('Helvetica');

  entries.forEach(([title]) => {
    doc.text(`• ${title}`, { continued: false });
    doc.moveDown(0.5);
  });

  doc.addPage();

  return pageMap;
}

/**
 * Generate summary section with markdown support
 */
export function generateSummarySection(ctx: SectionContext): void {
  const { doc, summary } = ctx;

  doc
    .fontSize(PDF_FONTS.h2)
    .fillColor(PDF_COLORS.primary)
    .font('Helvetica-Bold')
    .text('Summary', PDF_LAYOUT.margin.left, PDF_LAYOUT.margin.top);

  doc.moveDown(1);

  // Parse markdown into blocks
  const blocks = parseMarkdown(summary);

  for (const block of blocks) {
    // Check if we need a new page (leave space for content)
    if (doc.y > PDF_LAYOUT.pageHeight - PDF_LAYOUT.margin.bottom - 100) {
      doc.addPage();
    }

    switch (block.type) {
      case 'table': {
        const tableWidth = PDF_LAYOUT.pageWidth - PDF_LAYOUT.margin.left - PDF_LAYOUT.margin.right;
        const newY = renderTable(doc, block, PDF_LAYOUT.margin.left, doc.y, tableWidth);
        doc.y = newY + 20; // Add spacing after table
        break;
      }

      case 'heading': {
        const fontSize =
          block.level === 1 ? PDF_FONTS.h2 : block.level === 2 ? PDF_FONTS.h3 : PDF_FONTS.body;
        doc
          .fontSize(fontSize)
          .fillColor(PDF_COLORS.primary)
          .font('Helvetica-Bold')
          .text(block.content, { continued: false });
        doc.moveDown(0.5);
        break;
      }

      case 'list': {
        doc.fontSize(PDF_FONTS.body).fillColor(PDF_COLORS.text).font('Helvetica');

        block.items.forEach((item, index) => {
          const prefix = block.ordered ? `${index + 1}. ` : '• ';
          doc.text(prefix + item, {
            indent: 20,
            continued: false,
          });
          doc.moveDown(0.3);
        });
        doc.moveDown(0.5);
        break;
      }

      case 'paragraph': {
        doc
          .fontSize(PDF_FONTS.body)
          .fillColor(PDF_COLORS.text)
          .font('Helvetica')
          .text(block.content, {
            align: 'left',
            lineGap: PDF_LAYOUT.lineHeight,
            continued: false,
          });
        doc.moveDown(1);
        break;
      }
    }
  }

  doc.moveDown(2);
}

/**
 * Generate key points section
 */
export function generateKeyPointsSection(ctx: SectionContext): void {
  const { doc, summary } = ctx;
  const keyPoints = extractKeyPoints(summary);

  if (keyPoints.length === 0) return;

  doc
    .fontSize(PDF_FONTS.h2)
    .fillColor(PDF_COLORS.primary)
    .font('Helvetica-Bold')
    .text('Key Points', { continued: false });

  doc.moveDown(1);

  doc.fontSize(PDF_FONTS.body).fillColor(PDF_COLORS.text).font('Helvetica');

  keyPoints.forEach((point: string, index: number) => {
    doc.text(`${index + 1}. ${point}`, {
      indent: 20,
      continued: false,
    });
    doc.moveDown(0.5);
  });

  doc.moveDown(2);
}

/**
 * Generate action items section
 */
export function generateActionItemsSection(ctx: SectionContext): void {
  const { doc, summary } = ctx;
  const actionItems = extractActionItems(summary);

  if (actionItems.length === 0) return;

  doc
    .fontSize(PDF_FONTS.h2)
    .fillColor(PDF_COLORS.primary)
    .font('Helvetica-Bold')
    .text('Action Items', { continued: false });

  doc.moveDown(1);

  doc.fontSize(PDF_FONTS.body).fillColor(PDF_COLORS.text).font('Helvetica');

  actionItems.forEach((item: string, index: number) => {
    doc.text(`${index + 1}. ${item}`, {
      indent: 20,
      continued: false,
    });
    doc.moveDown(0.5);
  });

  doc.moveDown(2);
}

/**
 * Generate topics section
 */
export function generateTopicsSection(ctx: SectionContext): void {
  const { doc, summary } = ctx;
  const topics = extractTopics(summary);

  if (topics.length === 0) return;

  doc
    .fontSize(PDF_FONTS.h2)
    .fillColor(PDF_COLORS.primary)
    .font('Helvetica-Bold')
    .text('Topics Covered', { continued: false });

  doc.moveDown(1);

  doc.fontSize(PDF_FONTS.body).fillColor(PDF_COLORS.text).font('Helvetica');

  topics.forEach((topic: string) => {
    doc.text(`• ${topic}`, {
      indent: 20,
      continued: false,
    });
    doc.moveDown(0.5);
  });

  doc.moveDown(2);
}

/**
 * Generate transcript section with timestamps
 */
export function generateTranscriptSection(ctx: SectionContext): void {
  const { doc, transcript } = ctx;

  // Check if we need a new page
  if (doc.y > PDF_LAYOUT.pageHeight - 200) {
    doc.addPage();
  }

  doc
    .fontSize(PDF_FONTS.h2)
    .fillColor(PDF_COLORS.primary)
    .font('Helvetica-Bold')
    .text('Full Transcript', PDF_LAYOUT.margin.left, doc.y);

  doc.moveDown(1);

  // Split transcript into paragraphs
  const paragraphs = transcript.split(/\n\n+/).filter((p) => p.trim().length > 0);

  doc.fontSize(PDF_FONTS.body).fillColor(PDF_COLORS.text).font('Helvetica');

  paragraphs.forEach((paragraph) => {
    const trimmed = paragraph.trim();

    // Check if we need a new page (leave space for at least 3 lines)
    if (doc.y > PDF_LAYOUT.pageHeight - PDF_LAYOUT.margin.bottom - 60) {
      doc.addPage();
    }

    doc.text(trimmed, {
      align: 'left',
      lineGap: PDF_LAYOUT.lineHeight,
    });

    doc.moveDown(1);
  });

  doc.moveDown(2);
}

/**
 * Generate processing details section
 */
export function generateProcessingDetails(ctx: SectionContext): void {
  const { doc, aiConfig } = ctx;

  // Ensure we're on a new page
  doc.addPage();

  doc
    .fontSize(PDF_FONTS.h2)
    .fillColor(PDF_COLORS.primary)
    .font('Helvetica-Bold')
    .text('Processing Details', PDF_LAYOUT.margin.left, PDF_LAYOUT.margin.top);

  doc.moveDown(1);

  doc.fontSize(PDF_FONTS.body).fillColor(PDF_COLORS.text).font('Helvetica');

  if (aiConfig) {
    doc.text(`AI Provider: ${aiConfig.provider}`, { continued: false });
    doc.moveDown(0.5);
    doc.text(`Summary Model: ${aiConfig.model}`, { continued: false });
    doc.moveDown(0.5);
    if (aiConfig.transcriptionModel) {
      doc.text(`Transcription Model: ${aiConfig.transcriptionModel}`, { continued: false });
    }
  } else {
    doc.text('AI Configuration: Not available', { continued: false });
  }

  doc.moveDown(1);

  doc.fontSize(PDF_FONTS.caption).fillColor(PDF_COLORS.textLight);
  doc.text('Generated by Trammarise - Audio Transcription & Summarization', {
    align: 'center',
  });
}

/**
 * Add page footer with page number and branding
 */
export function addPageFooter(doc: typeof PDFDocument.prototype, pageNumber: number): void {
  const bottomY = PDF_LAYOUT.pageHeight - PDF_LAYOUT.margin.bottom + 20;

  doc
    .fontSize(PDF_FONTS.caption)
    .fillColor(PDF_COLORS.textLight)
    .text(`Page ${pageNumber}`, PDF_LAYOUT.margin.left, bottomY, {
      align: 'center',
      width: PDF_LAYOUT.pageWidth - PDF_LAYOUT.margin.left - PDF_LAYOUT.margin.right,
    });
}

/**
 * Add disclaimer section if needed
 */
export function addDisclaimer(doc: typeof PDFDocument.prototype, disclaimerText: string): void {
  doc.moveDown(2);

  doc
    .fontSize(PDF_FONTS.small)
    .fillColor(PDF_COLORS.textLight)
    .font('Helvetica-Oblique')
    .text(disclaimerText, {
      align: 'center',
      lineGap: 2,
    });
}
