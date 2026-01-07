import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FilePreview } from './FilePreview';

describe('FilePreview', () => {
  describe('Rendering with File', () => {
    it('renders file metadata correctly', () => {
      const file = new File(['test content'], 'test-audio.mp3', { type: 'audio/mpeg' });
      const onRemove = vi.fn();
      const onReplace = vi.fn();

      render(<FilePreview file={file} onRemove={onRemove} onReplace={onReplace} />);

      expect(screen.getByText('File uploaded successfully')).toBeInTheDocument();
      expect(screen.getByText('test-audio.mp3')).toBeInTheDocument();
      expect(screen.getByText(/audio\/mpeg/)).toBeInTheDocument();
    });

    it('displays formatted file size', () => {
      // Create a file with size ~5MB
      const fileSizeInBytes = 5 * 1024 * 1024;
      const file = new File([''], 'large-file.mp3', { type: 'audio/mpeg' });
      // Mock the file size property
      Object.defineProperty(file, 'size', { value: fileSizeInBytes, writable: false });

      const onRemove = vi.fn();
      const onReplace = vi.fn();

      render(<FilePreview file={file} onRemove={onRemove} onReplace={onReplace} />);

      // Should show file size in MB
      expect(screen.getByText(/MB/)).toBeInTheDocument();
    });

    it('truncates long filenames with CSS truncate class', () => {
      const longFilename = 'very-long-filename-that-should-be-truncated-with-ellipsis.mp3';
      const file = new File(['test'], longFilename, { type: 'audio/mpeg' });
      const onRemove = vi.fn();
      const onReplace = vi.fn();

      render(<FilePreview file={file} onRemove={onRemove} onReplace={onReplace} />);

      const filenameElement = screen.getByText(longFilename);
      // Check that the truncate class is applied
      expect(filenameElement).toHaveClass('truncate');
    });
  });

  describe('Rendering with Blob (Recording)', () => {
    it('renders with default recording name', () => {
      const blob = new Blob(['test content'], { type: 'audio/webm' });
      const onRemove = vi.fn();
      const onReplace = vi.fn();

      render(<FilePreview file={blob} onRemove={onRemove} onReplace={onReplace} />);

      expect(screen.getByText('Recording saved')).toBeInTheDocument();
      expect(screen.getByText('recording.webm')).toBeInTheDocument();
    });

    it('does not show file type for Blob', () => {
      const blob = new Blob(['test content'], { type: 'audio/webm' });
      const onRemove = vi.fn();
      const onReplace = vi.fn();

      render(<FilePreview file={blob} onRemove={onRemove} onReplace={onReplace} />);

      // Should not show "Unknown format" text
      expect(screen.queryByText(/audio\/webm/)).not.toBeInTheDocument();
    });
  });

  describe('File Size Formatting', () => {
    it('formats bytes correctly', () => {
      const file = new File([new Array(500).join('a')], 'small.mp3', { type: 'audio/mpeg' });
      const onRemove = vi.fn();
      const onReplace = vi.fn();

      render(<FilePreview file={file} onRemove={onRemove} onReplace={onReplace} />);

      expect(screen.getByText(/Bytes/)).toBeInTheDocument();
    });

    it('formats kilobytes correctly', () => {
      const file = new File([new Array(5 * 1024).join('a')], 'medium.mp3', { type: 'audio/mpeg' });
      const onRemove = vi.fn();
      const onReplace = vi.fn();

      render(<FilePreview file={file} onRemove={onRemove} onReplace={onReplace} />);

      expect(screen.getByText(/KB/)).toBeInTheDocument();
    });

    it('handles zero-sized files', () => {
      const file = new File([], 'empty.mp3', { type: 'audio/mpeg' });
      const onRemove = vi.fn();
      const onReplace = vi.fn();

      render(<FilePreview file={file} onRemove={onRemove} onReplace={onReplace} />);

      expect(screen.getByText('0 Bytes')).toBeInTheDocument();
    });
  });

  describe('Button Interactions', () => {
    it('calls onRemove when Remove button is clicked', () => {
      const file = new File(['test'], 'test.mp3', { type: 'audio/mpeg' });
      const onRemove = vi.fn();
      const onReplace = vi.fn();

      render(<FilePreview file={file} onRemove={onRemove} onReplace={onReplace} />);

      const removeButton = screen.getByText('Remove');
      fireEvent.click(removeButton);

      expect(onRemove).toHaveBeenCalledOnce();
      expect(onReplace).not.toHaveBeenCalled();
    });

    it('calls onReplace when Replace File button is clicked', () => {
      const file = new File(['test'], 'test.mp3', { type: 'audio/mpeg' });
      const onRemove = vi.fn();
      const onReplace = vi.fn();

      render(<FilePreview file={file} onRemove={onRemove} onReplace={onReplace} />);

      const replaceButton = screen.getByText('Replace File');
      fireEvent.click(replaceButton);

      expect(onReplace).toHaveBeenCalledOnce();
      expect(onRemove).not.toHaveBeenCalled();
    });

    it('buttons have cursor-pointer class for affordance', () => {
      const file = new File(['test'], 'test.mp3', { type: 'audio/mpeg' });
      const onRemove = vi.fn();
      const onReplace = vi.fn();

      render(<FilePreview file={file} onRemove={onRemove} onReplace={onReplace} />);

      const removeButton = screen.getByText('Remove').closest('button');
      const replaceButton = screen.getByText('Replace File').closest('button');

      expect(removeButton).toHaveClass('cursor-pointer');
      expect(replaceButton).toHaveClass('cursor-pointer');
    });
  });

  describe('Visual Elements', () => {
    it('displays success message with proper styling', () => {
      const file = new File(['test'], 'test.mp3', { type: 'audio/mpeg' });
      const onRemove = vi.fn();
      const onReplace = vi.fn();

      const { container } = render(<FilePreview file={file} onRemove={onRemove} onReplace={onReplace} />);

      // Success message is displayed
      const successMessage = screen.getByText('File uploaded successfully');
      expect(successMessage).toBeInTheDocument();

      // SVG icon (CheckCircle from lucide-react) should be present
      const svgIcons = container.querySelectorAll('svg');
      expect(svgIcons.length).toBeGreaterThan(0);
    });

    it('displays file information card', () => {
      const file = new File(['test'], 'test.mp3', { type: 'audio/mpeg' });
      const onRemove = vi.fn();
      const onReplace = vi.fn();

      const { container } = render(<FilePreview file={file} onRemove={onRemove} onReplace={onReplace} />);

      // File name is displayed
      expect(screen.getByText('test.mp3')).toBeInTheDocument();

      // SVG icons (Music, RefreshCw, Trash2 from lucide-react) should be present
      const svgIcons = container.querySelectorAll('svg');
      expect(svgIcons.length).toBeGreaterThan(2); // At least CheckCircle, Music, RefreshCw, Trash2
    });
  });

  describe('Edge Cases', () => {
    it('handles file with no type', () => {
      const file = new File(['test'], 'unknown.xyz', { type: '' });
      const onRemove = vi.fn();
      const onReplace = vi.fn();

      render(<FilePreview file={file} onRemove={onRemove} onReplace={onReplace} />);

      expect(screen.getByText('Unknown format')).toBeInTheDocument();
    });

    it('handles very large file sizes', () => {
      // Create a file with size > 1GB (mock the size property)
      const largeFile = new File([''], 'huge.mp3', { type: 'audio/mpeg' });
      const fileSizeInBytes = 1.5 * 1024 * 1024 * 1024; // 1.5 GB
      Object.defineProperty(largeFile, 'size', { value: fileSizeInBytes, writable: false });

      const onRemove = vi.fn();
      const onReplace = vi.fn();

      render(<FilePreview file={largeFile} onRemove={onRemove} onReplace={onReplace} />);

      expect(screen.getByText(/GB/)).toBeInTheDocument();
    });
  });
});
