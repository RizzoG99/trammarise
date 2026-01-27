/**
 * PDF table renderer using pdfkit
 * Renders markdown tables with proper formatting, borders, and pagination
 */

import type PDFDocument from 'pdfkit';
import { PDF_COLORS, PDF_FONTS, PDF_LAYOUT } from './pdf-styles';

export interface TableData {
  headers: string[];
  rows: string[][];
  alignments?: Array<'left' | 'center' | 'right'>;
}

export interface TableStyle {
  padding: number;
  minRowHeight: number;
  headerBackground: string;
  borderColor: string;
  borderWidth: number;
  headerFont: string;
  headerFontSize: number;
  bodyFont: string;
  bodyFontSize: number;
}

const DEFAULT_STYLE: TableStyle = {
  padding: 5,
  minRowHeight: 25,
  headerBackground: PDF_COLORS.backgroundLight,
  borderColor: PDF_COLORS.border,
  borderWidth: 0.5,
  headerFont: 'Helvetica-Bold',
  headerFontSize: PDF_FONTS.body,
  bodyFont: 'Helvetica',
  bodyFontSize: PDF_FONTS.body,
};

/**
 * Render a table in PDF format
 * @returns Y position after the table
 */
export function renderTable(
  doc: typeof PDFDocument.prototype,
  table: TableData,
  startX: number,
  startY: number,
  maxWidth: number,
  style: Partial<TableStyle> = {}
): number {
  const finalStyle = { ...DEFAULT_STYLE, ...style };
  const { headers, rows, alignments = [] } = table;

  if (headers.length === 0) {
    return startY;
  }

  // Calculate column widths (equal distribution)
  const columnWidth = maxWidth / headers.length;

  // Draw header row
  let currentY = startY;
  currentY = drawHeaderRow(doc, headers, startX, currentY, columnWidth, finalStyle);

  // Draw data rows
  for (const row of rows) {
    // Check if we need a new page
    if (currentY > PDF_LAYOUT.pageHeight - PDF_LAYOUT.margin.bottom - 60) {
      doc.addPage();
      currentY = PDF_LAYOUT.margin.top;

      // Redraw headers on new page
      currentY = drawHeaderRow(doc, headers, startX, currentY, columnWidth, finalStyle);
    }

    currentY = drawDataRow(doc, row, startX, currentY, columnWidth, alignments, finalStyle);
  }

  return currentY;
}

/**
 * Draw header row with background
 */
function drawHeaderRow(
  doc: typeof PDFDocument.prototype,
  headers: string[],
  startX: number,
  startY: number,
  columnWidth: number,
  style: TableStyle
): number {
  const rowHeight = calculateRowHeight(
    doc,
    headers,
    columnWidth,
    style.padding,
    style.headerFontSize
  );
  const finalRowHeight = Math.max(rowHeight, style.minRowHeight);

  // Draw background for header
  doc
    .rect(startX, startY, columnWidth * headers.length, finalRowHeight)
    .fillAndStroke(style.headerBackground, style.borderColor);

  // Draw header cells
  headers.forEach((header, i) => {
    const x = startX + i * columnWidth;

    // Draw cell border
    doc
      .rect(x, startY, columnWidth, finalRowHeight)
      .lineWidth(style.borderWidth)
      .stroke(style.borderColor);

    // Draw text
    doc
      .fontSize(style.headerFontSize)
      .fillColor(PDF_COLORS.text)
      .font(style.headerFont)
      .text(header, x + style.padding, startY + style.padding, {
        width: columnWidth - 2 * style.padding,
        height: finalRowHeight - 2 * style.padding,
        align: 'left',
        lineBreak: true,
        ellipsis: false,
      });
  });

  return startY + finalRowHeight;
}

/**
 * Draw data row
 */
function drawDataRow(
  doc: typeof PDFDocument.prototype,
  row: string[],
  startX: number,
  startY: number,
  columnWidth: number,
  alignments: Array<'left' | 'center' | 'right'>,
  style: TableStyle
): number {
  const rowHeight = calculateRowHeight(doc, row, columnWidth, style.padding, style.bodyFontSize);
  const finalRowHeight = Math.max(rowHeight, style.minRowHeight);

  // Draw cells
  row.forEach((cell, i) => {
    const x = startX + i * columnWidth;
    const alignment = alignments[i] || 'left';

    // Draw cell border
    doc
      .rect(x, startY, columnWidth, finalRowHeight)
      .lineWidth(style.borderWidth)
      .fillAndStroke(PDF_COLORS.background, style.borderColor);

    // Draw text
    doc
      .fontSize(style.bodyFontSize)
      .fillColor(PDF_COLORS.text)
      .font(style.bodyFont)
      .text(cell, x + style.padding, startY + style.padding, {
        width: columnWidth - 2 * style.padding,
        height: finalRowHeight - 2 * style.padding,
        align: alignment,
        lineBreak: true,
        ellipsis: false,
      });
  });

  return startY + finalRowHeight;
}

/**
 * Calculate row height based on content
 * Measures text height for all cells and returns the tallest
 */
function calculateRowHeight(
  doc: typeof PDFDocument.prototype,
  cells: string[],
  columnWidth: number,
  padding: number,
  fontSize: number
): number {
  let maxHeight = 0;

  cells.forEach((cell) => {
    const textWidth = columnWidth - 2 * padding;
    const lines = Math.ceil(doc.widthOfString(cell) / textWidth);
    const lineHeight = fontSize * 1.15; // Default line height
    const textHeight = lines * lineHeight;
    maxHeight = Math.max(maxHeight, textHeight);
  });

  return maxHeight + 2 * padding;
}
