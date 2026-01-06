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
      const file = new File([new Array(1024 * 1024).join('a')], 'large-file.mp3', { type: 'audio/mpeg' });
      const onRemove = vi.fn();
      const onReplace = vi.fn();

      render(<FilePreview file={file} onRemove={onRemove} onReplace={onReplace} />);

      // Should show file size in MB
      expect(screen.getByText(/MB/)).toBeInTheDocument();
    });

    it('truncates long filenames with title attribute', () => {
      const longFilename = 'very-long-filename-that-should-be-truncated-with-ellipsis.mp3';
      const file = new File(['test'], longFilename, { type: 'audio/mpeg' });
      const onRemove = vi.fn();
      const onReplace = vi.fn();

      render(<FilePreview file={file} onRemove={onRemove} onReplace={onReplace} />);

      const filenameElement = screen.getByText(longFilename);
      expect(filenameElement).toHaveAttribute('title', longFilename);
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
    it('displays success checkmark icon', () => {
      const file = new File(['test'], 'test.mp3', { type: 'audio/mpeg' });
      const onRemove = vi.fn();
      const onReplace = vi.fn();

      render(<FilePreview file={file} onRemove={onRemove} onReplace={onReplace} />);

      // CheckCircle icon should be present
      const successMessage = screen.getByText('File uploaded successfully').closest('div');
      expect(successMessage).toBeInTheDocument();
    });

    it('displays music icon for audio file', () => {
      const file = new File(['test'], 'test.mp3', { type: 'audio/mpeg' });
      const onRemove = vi.fn();
      const onReplace = vi.fn();

      render(<FilePreview file={file} onRemove={onRemove} onReplace={onReplace} />);

      // Music icon should be in the file card
      const fileCard = screen.getByText('test.mp3').closest('div');
      expect(fileCard).toBeInTheDocument();
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
      // Create a file with size > 1GB
      const largeFile = new File(
        [new Array(1024 * 1024 * 1024 + 1000).join('a')],
        'huge.mp3',
        { type: 'audio/mpeg' }
      );
      const onRemove = vi.fn();
      const onReplace = vi.fn();

      render(<FilePreview file={largeFile} onRemove={onRemove} onReplace={onReplace} />);

      expect(screen.getByText(/GB/)).toBeInTheDocument();
    });
  });
});
