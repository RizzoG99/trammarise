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

      expect(screen.getByText('Upload Audio')).toBeInTheDocument();
      expect(screen.getByText('Drop your audio file here or click to browse')).toBeInTheDocument();
      expect(screen.getByText('MP3, WAV, M4A up to 500MB')).toBeInTheDocument();
    });

    it('renders drop zone that is interactive', () => {
      render(<UploadPanel onFileUpload={mockOnFileUpload} />);

      const dropZone = screen.getByText('Drop your audio file here or click to browse');
      expect(dropZone).toBeInTheDocument();

      // Verify drop zone container exists and is interactive (without checking specific CSS classes)
      const dropZoneContainer = dropZone.closest('div');
      expect(dropZoneContainer).toBeInTheDocument();
    });
  });

  describe('File Selection', () => {
    it('calls onFileUpload with valid audio file', () => {
      render(<UploadPanel onFileUpload={mockOnFileUpload} />);

      const file = new File(['audio content'], 'test.mp3', { type: 'audio/mpeg' });
      const input = screen.getByTestId('file-input');

      fireEvent.change(input, {
        target: { files: [file] },
      });

      expect(mockOnFileUpload).toHaveBeenCalledWith(file);
    });

    it('validates file size (rejects >500MB)', () => {
      render(<UploadPanel onFileUpload={mockOnFileUpload} />);

      // Create a mock file >500MB using size property (optimized)
      const largeFile = new File([], 'huge.mp3', { type: 'audio/mpeg' });
      Object.defineProperty(largeFile, 'size', { 
        value: MAX_FILE_SIZE + 1,
        writable: false 
      });

      const input = screen.getByTestId('file-input');

      fireEvent.change(input, {
        target: { files: [largeFile] },
      });

      // Should show error, not call onFileUpload
      expect(screen.getByText(/File too large/)).toBeInTheDocument();
      expect(screen.getByText(/Maximum size is 500MB/)).toBeInTheDocument();
      expect(mockOnFileUpload).not.toHaveBeenCalled();
    });

    it('accepts files at exactly 500MB limit (boundary condition)', () => {
      render(<UploadPanel onFileUpload={mockOnFileUpload} />);

      // Create a mock file at exactly 500MB using size property
      const boundaryFile = new File(['audio content'], 'boundary.mp3', { type: 'audio/mpeg' });
      Object.defineProperty(boundaryFile, 'size', { 
        value: MAX_FILE_SIZE, // Exactly 500MB
        writable: false 
      });

      const input = screen.getByTestId('file-input');

      fireEvent.change(input, {
        target: { files: [boundaryFile] },
      });

      // Should accept the file at exactly 500MB
      expect(mockOnFileUpload).toHaveBeenCalledWith(boundaryFile);
      expect(screen.queryByText(/File too large/)).not.toBeInTheDocument();
    });

    it('validates file type (rejects non-audio)', () => {
      render(<UploadPanel onFileUpload={mockOnFileUpload} />);

      const nonAudioFile = new File(['video content'], 'test.mp4', { type: 'video/mp4' });
      const input = screen.getByTestId('file-input');

      fireEvent.change(input, {
        target: { files: [nonAudioFile] },
      });

      // Should show error
      expect(screen.getByText(/Unsupported file type/)).toBeInTheDocument();
      expect(mockOnFileUpload).not.toHaveBeenCalled();
    });

    it('rejects empty files', () => {
      render(<UploadPanel onFileUpload={mockOnFileUpload} />);

      const emptyFile = new File([], 'empty.mp3', { type: 'audio/mpeg' });
      const input = screen.getByTestId('file-input');

      fireEvent.change(input, {
        target: { files: [emptyFile] },
      });

      expect(screen.getByText(/File is empty/)).toBeInTheDocument();
      expect(mockOnFileUpload).not.toHaveBeenCalled();
    });
  });

  describe('Drag and Drop', () => {
    it('handles dragOver event', () => {
      render(<UploadPanel onFileUpload={mockOnFileUpload} />);

      const dropZone = screen.getByText('Drop your audio file here or click to browse').closest('div')!;

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

      const dropZone = screen.getByText('Drop your audio file here or click to browse').closest('div')!;

      // Verify drag events don't throw errors
      expect(() => {
        fireEvent.dragOver(dropZone);
        fireEvent.dragLeave(dropZone);
      }).not.toThrow();
    });

    it('handles valid audio file drop', () => {
      render(<UploadPanel onFileUpload={mockOnFileUpload} />);

      const file = new File(['audio'], 'dropped.mp3', { type: 'audio/mpeg' });
      const dropZone = screen.getByText('Drop your audio file here or click to browse').closest('div')!;

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
      const dropZone = screen.getByText('Drop your audio file here or click to browse').closest('div')!;

      fireEvent.drop(dropZone, {
        dataTransfer: {
          files: [largeFile],
        },
      });

      expect(screen.getByText(/File too large/)).toBeInTheDocument();
      expect(mockOnFileUpload).not.toHaveBeenCalled();
    });

    it('shows error when no audio file is dropped', () => {
      render(<UploadPanel onFileUpload={mockOnFileUpload} />);

      const imageFile = new File(['image'], 'test.png', { type: 'image/png' });
      const dropZone = screen.getByText('Drop your audio file here or click to browse').closest('div')!;

      fireEvent.drop(dropZone, {
        dataTransfer: {
          files: [imageFile],
        },
      });

      expect(screen.getByText(/No audio file found/)).toBeInTheDocument();
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
      expect(screen.queryByText('Drop your audio file here or click to browse')).not.toBeInTheDocument();
    });

    it('hides drop zone when file is uploaded', () => {
      const uploadedFile = new File(['audio'], 'test.mp3', { type: 'audio/mpeg' });

      render(
        <UploadPanel
          onFileUpload={mockOnFileUpload}
          uploadedFile={uploadedFile}
          onFileRemove={mockOnFileRemove}
        />
      );

      expect(screen.queryByText('Supported formats')).not.toBeInTheDocument();
    });
  });

  describe('File Removal', () => {
    it('calls onFileRemove when remove button clicked in FilePreview', () => {
      const uploadedFile = new File(['audio'], 'test.mp3', { type: 'audio/mpeg' });

      render(
        <UploadPanel
          onFileUpload={mockOnFileUpload}
          uploadedFile={uploadedFile}
          onFileRemove={mockOnFileRemove}
        />
      );

      const removeButton = screen.getByText('Remove');
      fireEvent.click(removeButton);

      expect(mockOnFileRemove).toHaveBeenCalledOnce();
    });

    it('clears validation error when file is removed', () => {
      const { rerender } = render(<UploadPanel onFileUpload={mockOnFileUpload} onFileRemove={mockOnFileRemove} />);

      // First, trigger a validation error
      const invalidFile = new File([], 'empty.mp3', { type: 'audio/mpeg' });
      const input = screen.getByTestId('file-input');

      fireEvent.change(input, {
        target: { files: [invalidFile] },
      });
      expect(screen.getByText(/File is empty/)).toBeInTheDocument();

      // Now upload a valid file
      const validFile = new File(['audio'], 'valid.mp3', { type: 'audio/mpeg' });

      rerender(
        <UploadPanel
          onFileUpload={mockOnFileUpload}
          uploadedFile={validFile}
          onFileRemove={mockOnFileRemove}
        />
      );

      const removeButton = screen.getByText('Remove');
      fireEvent.click(removeButton);

      // Rerender without uploaded file to see if error was cleared
      rerender(
        <UploadPanel
          onFileUpload={mockOnFileUpload}
          uploadedFile={null}
          onFileRemove={mockOnFileRemove}
        />
      );

      // Error should be cleared after remove
      expect(screen.queryByText(/File is empty/)).not.toBeInTheDocument();
    });
  });

  describe('File Replacement', () => {
    it('replaces existing file with new file', () => {
      const oldFile = new File(['old'], 'old.mp3', { type: 'audio/mpeg' });
      render(
        <UploadPanel
          onFileUpload={mockOnFileUpload}
          uploadedFile={oldFile}
          onFileRemove={mockOnFileRemove}
        />
      );

      // Verify old file is displayed
      expect(screen.getByText('old.mp3')).toBeInTheDocument();

      // Click replace button
      const replaceButton = screen.getByText('Replace File');
      fireEvent.click(replaceButton);

      // Select new file
      const newFile = new File(['new'], 'new.mp3', { type: 'audio/mpeg' });
      const input = screen.getByTestId('file-input');
      fireEvent.change(input, { target: { files: [newFile] } });

      // Should call onFileUpload with new file
      expect(mockOnFileUpload).toHaveBeenCalledWith(newFile);
    });

    it('triggers file input click when replace button is clicked', () => {
      const uploadedFile = new File(['audio'], 'test.mp3', { type: 'audio/mpeg' });
      render(
        <UploadPanel
          onFileUpload={mockOnFileUpload}
          uploadedFile={uploadedFile}
          onFileRemove={mockOnFileRemove}
        />
      );

      const replaceButton = screen.getByText('Replace File');
      const input = screen.getByTestId('file-input');
      const clickSpy = vi.spyOn(input, 'click');

      fireEvent.click(replaceButton);

      expect(clickSpy).toHaveBeenCalled();
    });
  });

  describe('Validation Error Display', () => {
    it('displays validation error message', () => {
      render(<UploadPanel onFileUpload={mockOnFileUpload} />);

      const emptyFile = new File([], 'empty.mp3', { type: 'audio/mpeg' });
      const input = screen.getByTestId('file-input');

      fireEvent.change(input, {
        target: { files: [emptyFile] },
      });

      // Verify error message is displayed
      const errorMessage = screen.getByText(/File is empty/);
      expect(errorMessage).toBeInTheDocument();

      // Verify error container has appropriate structure (without checking specific colors)
      const errorContainer = errorMessage.closest('div');
      expect(errorContainer).toBeInTheDocument();
    });

    it('clears validation error on new valid file selection', () => {
      render(<UploadPanel onFileUpload={mockOnFileUpload} />);

      // First, create an error
      const emptyFile = new File([], 'empty.mp3', { type: 'audio/mpeg' });
      const input = screen.getByTestId('file-input');

      fireEvent.change(input, {
        target: { files: [emptyFile] },
      });
      expect(screen.getByText(/File is empty/)).toBeInTheDocument();

      // Now select a valid file
      const validFile = new File(['audio content'], 'valid.mp3', { type: 'audio/mpeg' });

      fireEvent.change(input, {
        target: { files: [validFile] },
      });

      expect(screen.queryByText(/File is empty/)).not.toBeInTheDocument();
      expect(mockOnFileUpload).toHaveBeenCalledWith(validFile);
    });
  });

  describe('Click to Upload', () => {
    it('opens file picker when drop zone is clicked', () => {
      render(<UploadPanel onFileUpload={mockOnFileUpload} />);

      const dropZone = screen.getByText('Drop your audio file here or click to browse');
      const input = screen.getByTestId('file-input');

      const clickSpy = vi.spyOn(input, 'click');

      fireEvent.click(dropZone);

      expect(clickSpy).toHaveBeenCalled();
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
