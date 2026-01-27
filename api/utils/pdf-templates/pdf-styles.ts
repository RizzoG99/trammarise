/**
 * Design tokens for PDF generation
 * Defines colors, typography, and layout constants
 */

export const PDF_COLORS = {
  primary: '#0a47c2',
  text: '#0f172a',
  textLight: '#64748b',
  border: '#e2e8f0',
  background: '#ffffff',
  backgroundLight: '#f8fafc',
} as const;

export const PDF_FONTS = {
  h1: 24,
  h2: 18,
  h3: 14,
  body: 11,
  caption: 9,
  small: 8,
} as const;

export const PDF_LAYOUT = {
  pageWidth: 595.28, // A4 width in points
  pageHeight: 841.89, // A4 height in points
  margin: {
    top: 60,
    right: 60,
    bottom: 50,
    left: 60,
  },
  lineHeight: 1.6,
  paragraphSpacing: 12,
  sectionSpacing: 24,
} as const;

export const PDF_METADATA = {
  creator: 'Trammarise',
  producer: 'Trammarise Audio Transcription',
  subject: 'Audio Transcription and Summary',
} as const;
