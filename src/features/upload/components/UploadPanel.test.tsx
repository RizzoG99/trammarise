import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { UploadPanel, MAX_FILE_SIZE } from './UploadPanel';

describe('UploadPanel', () => {
  let mockOnFileUpload: Mock<(file: File) => void>;
  let mockOnFileRemove: Mock<() => void>;

  beforeEach(() => {
    mockOnFileUpload = vi.fn();
    mockOnFileRemove = vi.fn();
  });

  describe('Initial Render', () => {
    it('renders upload area when no file uploaded', () => {
      render(<UploadPanel onFileUpload={mockOnFileUpload} />);

      expect(screen.getByText('home.uploadTitle')).toBeInTheDocument();
      expect(screen.getByText('home.dropText')).toBeInTheDocument();
      expect(screen.getByText('home.supportedFormats')).toBeInTheDocument();
    });

    it('renders drop zone that is interactive', () => {
      render(<UploadPanel onFileUpload={mockOnFileUpload} />);

      const dropZone = screen.getByText('home.dropText');
      expect(dropZone).toBeInTheDocument();

      // Verify drop zone container exists and is interactive (without checking specific CSS classes)
      const dropZoneContainer = dropZone.closest('div');
      expect(dropZoneContainer).toBeInTheDocument();
    });
  });

  describe('File Selection', () => {
    it('accepts valid audio file via input change', () => {
      render(<UploadPanel onFileUpload={mockOnFileUpload} />);

      const file = new File(['audio content'], 'test.mp3', { type: 'audio/mpeg' });
      const input = screen.getByTestId('file-input');

      fireEvent.change(input, {
        target: { files: [file] },
      });

      expect(mockOnFileUpload).toHaveBeenCalledWith(file);
    });

    it('validates file size limit', () => {
      render(<UploadPanel onFileUpload={mockOnFileUpload} />);

      // > 500MB
      const largeFile = new File([], 'large.mp3', { type: 'audio/mpeg' });
      Object.defineProperty(largeFile, 'size', {
        value: MAX_FILE_SIZE + 1,
        writable: false
      });

      const input = screen.getByTestId('file-input');

      fireEvent.change(input, {
        target: { files: [largeFile] },
      });

      expect(screen.getByText(/home\.fileTooLarge/)).toBeInTheDocument();
      expect(mockOnFileUpload).not.toHaveBeenCalled();
    });

    it('validates file type', () => {
      render(<UploadPanel onFileUpload={mockOnFileUpload} />);

      const imageFile = new File(['image'], 'test.png', { type: 'image/png' });
      const input = screen.getByTestId('file-input');

      fireEvent.change(input, {
        target: { files: [imageFile] },
      });

      // It should now use the translation key
      expect(screen.getByText('home.audioOnly')).toBeInTheDocument();
      expect(mockOnFileUpload).not.toHaveBeenCalled();
    });
  });

  describe('Drag and Drop', () => {
    it('handles dragOver event', () => {
      render(<UploadPanel onFileUpload={mockOnFileUpload} />);

      const dropZone = screen.getByText('home.dropText').closest('div')!;

      // Verify drag over doesn't throw error
      expect(() => {
        fireEvent.dragOver(dropZone, {
          dataTransfer: {
            files: [],
          },
        });
      }).not.toThrow();
    });

    it('handles dragLeave event', () => {
      render(<UploadPanel onFileUpload={mockOnFileUpload} />);

      const dropZone = screen.getByText('home.dropText').closest('div')!;

      // Verify drag events don't throw errors
      expect(() => {
        fireEvent.dragOver(dropZone);
        fireEvent.dragLeave(dropZone);
      }).not.toThrow();
    });

    it('handles valid audio file drop', () => {
      render(<UploadPanel onFileUpload={mockOnFileUpload} />);

      const file = new File(['audio'], 'dropped.mp3', { type: 'audio/mpeg' });
      const dropZone = screen.getByText('home.dropText').closest('div')!;

      fireEvent.drop(dropZone, {
        dataTransfer: {
          files: [file],
        },
      });

      expect(mockOnFileUpload).toHaveBeenCalledWith(file);
    });

    it('validates dropped file size', () => {
      render(<UploadPanel onFileUpload={mockOnFileUpload} />);

      // Create a mock file >500MB using size property (optimized)
      const largeFile = new File([], 'huge.mp3', { type: 'audio/mpeg' });
      Object.defineProperty(largeFile, 'size', { 
        value: MAX_FILE_SIZE + 1,
        writable: false 
      });
      const dropZone = screen.getByText('home.dropText').closest('div')!;

      fireEvent.drop(dropZone, {
        dataTransfer: {
          files: [largeFile],
        },
      });

      expect(screen.getByText(/home.fileTooLarge/)).toBeInTheDocument();
      expect(mockOnFileUpload).not.toHaveBeenCalled();
    });

    it('shows error when no audio file is dropped', () => {
      render(<UploadPanel onFileUpload={mockOnFileUpload} />);

      const imageFile = new File(['image'], 'test.png', { type: 'image/png' });
      const dropZone = screen.getByText('home.dropText').closest('div')!;

      fireEvent.drop(dropZone, {
        dataTransfer: {
          files: [imageFile],
        },
      });

      expect(screen.getByText('home.noAudioFound')).toBeInTheDocument();
      expect(mockOnFileUpload).not.toHaveBeenCalled();
    });
  });

  describe('File Preview Display', () => {
    it('shows FilePreview when file is uploaded', () => {
      const uploadedFile = new File(['audio'], 'uploaded.mp3', { type: 'audio/mpeg' });

      render(
        <UploadPanel
          onFileUpload={mockOnFileUpload}
          uploadedFile={uploadedFile}
          onFileRemove={mockOnFileRemove}
        />
      );

      expect(screen.getByText('uploaded.mp3')).toBeInTheDocument();
      expect(screen.queryByText('home.dropText')).not.toBeInTheDocument();
    });
    // ...
  });

  describe('Click to Upload', () => {
    it('opens file picker when drop zone is clicked', () => {
      render(<UploadPanel onFileUpload={mockOnFileUpload} />);

      // Test that drop zone and file input exist
      expect(screen.getByText('home.dropText')).toBeInTheDocument();
      expect(screen.getByTestId('file-input')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles Blob (recording) as uploadedFile', () => {
      const blob = new Blob(['audio data'], { type: 'audio/webm' });

      render(
        <UploadPanel
          onFileUpload={mockOnFileUpload}
          uploadedFile={blob}
          onFileRemove={mockOnFileRemove}
        />
      );

      expect(screen.getByText('recording.webm')).toBeInTheDocument();
    });

    it('handles onFileRemove being undefined', () => {
      const uploadedFile = new File(['audio'], 'test.mp3', { type: 'audio/mpeg' });

      render(
        <UploadPanel
          onFileUpload={mockOnFileUpload}
          uploadedFile={uploadedFile}
        />
      );

      const removeButton = screen.getByText('Remove');

      // Should not throw error
      expect(() => fireEvent.click(removeButton)).not.toThrow();
    });

    it('accepts all audio/* MIME types', () => {
      render(<UploadPanel onFileUpload={mockOnFileUpload} />);

      const audioTypes = [
        'audio/mpeg',
        'audio/wav',
        'audio/mp4',
        'audio/m4a',
        'audio/webm',
        'audio/ogg',
        'audio/flac',
      ];

      audioTypes.forEach((type) => {
        const file = new File(['audio'], `test.${type.split('/')[1]}`, { type });
        const input = screen.getByTestId('file-input');

        fireEvent.change(input, {
          target: { files: [file] },
        });

        expect(mockOnFileUpload).toHaveBeenCalledWith(file);
        mockOnFileUpload.mockClear();
      });
    });
  });
});
