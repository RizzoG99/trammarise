import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ExportPDFDialog } from './ExportPDFDialog';
import type { AIConfiguration } from '../../../types/audio';

// PDFViewer requires a real browser / canvas — replace with a stub in jsdom
vi.mock('@react-pdf/renderer', () => ({
  PDFViewer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="pdf-viewer">{children}</div>
  ),
}));

vi.mock('./pdf/ResultPdfDocument', () => ({
  ResultPdfDocument: () => <div data-testid="result-pdf-document" />,
}));

const mockConfig: AIConfiguration = {
  mode: 'simple',
  provider: 'openai',
  model: 'standard',
  openaiKey: 'test-key',
  contentType: 'meeting',
  language: 'en',
};

const defaultProps = {
  isOpen: true,
  onClose: vi.fn(),
  initialFileName: 'my-transcript',
  onExport: vi.fn(),
  summary: 'Test summary',
  transcript: 'Test transcript',
  config: mockConfig,
};

describe('ExportPDFDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders nothing when closed', () => {
      render(<ExportPDFDialog {...defaultProps} isOpen={false} />);
      expect(screen.queryByText('Export PDF')).not.toBeInTheDocument();
    });

    it('renders the dialog title when open', () => {
      render(<ExportPDFDialog {...defaultProps} />);
      expect(screen.getByText('Export PDF')).toBeInTheDocument();
    });

    it('renders the PDF preview', () => {
      render(<ExportPDFDialog {...defaultProps} />);
      expect(screen.getByTestId('pdf-viewer')).toBeInTheDocument();
    });

    it('renders the filename input with initial value', () => {
      render(<ExportPDFDialog {...defaultProps} />);
      const input = screen.getByDisplayValue('my-transcript');
      expect(input).toBeInTheDocument();
    });

    it('renders the Download PDF button', () => {
      render(<ExportPDFDialog {...defaultProps} />);
      expect(screen.getByRole('button', { name: /download pdf/i })).toBeInTheDocument();
    });

    it('renders the Cancel button', () => {
      render(<ExportPDFDialog {...defaultProps} />);
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });
  });

  describe('Filename validation', () => {
    it('disables the Download button when filename is empty', () => {
      render(<ExportPDFDialog {...defaultProps} initialFileName="" />);
      expect(screen.getByRole('button', { name: /download pdf/i })).toBeDisabled();
    });

    it('enables the Download button when filename is non-empty', () => {
      render(<ExportPDFDialog {...defaultProps} />);
      expect(screen.getByRole('button', { name: /download pdf/i })).not.toBeDisabled();
    });

    it('disables the Download button when filename is cleared by the user', () => {
      render(<ExportPDFDialog {...defaultProps} />);
      const input = screen.getByDisplayValue('my-transcript');
      fireEvent.change(input, { target: { value: '' } });
      expect(screen.getByRole('button', { name: /download pdf/i })).toBeDisabled();
    });
  });

  describe('Export interaction', () => {
    it('calls onExport with trimmed filename on button click', () => {
      const onExport = vi.fn();
      render(<ExportPDFDialog {...defaultProps} onExport={onExport} />);
      const input = screen.getByDisplayValue('my-transcript');
      fireEvent.change(input, { target: { value: '  report  ' } });
      fireEvent.click(screen.getByRole('button', { name: /download pdf/i }));
      expect(onExport).toHaveBeenCalledWith('report');
    });

    it('calls onExport with Enter key in the filename input', () => {
      const onExport = vi.fn();
      render(<ExportPDFDialog {...defaultProps} onExport={onExport} />);
      const input = screen.getByDisplayValue('my-transcript');
      fireEvent.keyDown(input, { key: 'Enter' });
      expect(onExport).toHaveBeenCalledWith('my-transcript');
    });

    it('does not call onExport on Enter when filename is empty', () => {
      const onExport = vi.fn();
      render(<ExportPDFDialog {...defaultProps} initialFileName="" onExport={onExport} />);
      const input = screen.getByRole('textbox');
      fireEvent.keyDown(input, { key: 'Enter' });
      expect(onExport).not.toHaveBeenCalled();
    });
  });

  describe('Cancel interaction', () => {
    it('calls onClose when Cancel is clicked', () => {
      const onClose = vi.fn();
      render(<ExportPDFDialog {...defaultProps} onClose={onClose} />);
      fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Exporting state', () => {
    it('shows "Exporting..." text while isExporting', () => {
      render(<ExportPDFDialog {...defaultProps} isExporting />);
      expect(screen.getByRole('button', { name: /exporting/i })).toBeInTheDocument();
    });

    it('disables Download button while isExporting', () => {
      render(<ExportPDFDialog {...defaultProps} isExporting />);
      expect(screen.getByRole('button', { name: /exporting/i })).toBeDisabled();
    });

    it('disables Cancel button while isExporting', () => {
      render(<ExportPDFDialog {...defaultProps} isExporting />);
      expect(screen.getByRole('button', { name: /cancel/i })).toBeDisabled();
    });

    it('does not call onExport on click while isExporting', () => {
      const onExport = vi.fn();
      render(<ExportPDFDialog {...defaultProps} isExporting onExport={onExport} />);
      const btn = screen.getByRole('button', { name: /exporting/i });
      fireEvent.click(btn);
      expect(onExport).not.toHaveBeenCalled();
    });
  });
});
