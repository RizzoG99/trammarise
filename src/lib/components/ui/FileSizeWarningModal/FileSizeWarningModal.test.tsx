import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { FileSizeWarningModal } from './FileSizeWarningModal';
import type { FileSizeStatus } from '../../../../utils/fileSize';

const mockFileSizeStatusWarning: FileSizeStatus = {
  size: 28.5 * 1024 * 1024,
  formattedSize: '28.5 MB',
  isOptimal: false,
  needsWarning: true,
  isTooLarge: false,
  estimatedTime: '~2 minutes',
  recommendation: 'We recommend compressing this file for faster processing.',
};

const mockFileSizeStatusError: FileSizeStatus = {
  size: 65.2 * 1024 * 1024,
  formattedSize: '65.2 MB',
  isOptimal: false,
  needsWarning: true,
  isTooLarge: true,
  estimatedTime: '~5 minutes',
  recommendation: 'This file exceeds the 50MB limit and must be compressed.',
};

describe('FileSizeWarningModal', () => {
  describe('Rendering - Warning State', () => {
    it('renders when isOpen is true', () => {
      render(
        <FileSizeWarningModal
          isOpen={true}
          onClose={() => {}}
          fileSizeStatus={mockFileSizeStatusWarning}
          onProceed={() => {}}
          onCompress={() => {}}
        />
      );
      expect(screen.getByText('Large File Detected')).toBeInTheDocument();
    });

    it('does not render when isOpen is false', () => {
      render(
        <FileSizeWarningModal
          isOpen={false}
          onClose={() => {}}
          fileSizeStatus={mockFileSizeStatusWarning}
          onProceed={() => {}}
          onCompress={() => {}}
        />
      );
      expect(screen.queryByText('Large File Detected')).not.toBeInTheDocument();
    });

    it('displays warning title for non-too-large files', () => {
      render(
        <FileSizeWarningModal
          isOpen={true}
          onClose={() => {}}
          fileSizeStatus={mockFileSizeStatusWarning}
          onProceed={() => {}}
          onCompress={() => {}}
        />
      );
      expect(screen.getByText('Large File Detected')).toBeInTheDocument();
    });

    it('displays file size', () => {
      render(
        <FileSizeWarningModal
          isOpen={true}
          onClose={() => {}}
          fileSizeStatus={mockFileSizeStatusWarning}
          onProceed={() => {}}
          onCompress={() => {}}
        />
      );
      expect(screen.getByText('28.5 MB')).toBeInTheDocument();
    });

    it('displays estimated time', () => {
      render(
        <FileSizeWarningModal
          isOpen={true}
          onClose={() => {}}
          fileSizeStatus={mockFileSizeStatusWarning}
          onProceed={() => {}}
          onCompress={() => {}}
        />
      );
      expect(screen.getByText('~2 minutes')).toBeInTheDocument();
    });

    it('displays recommendation text', () => {
      render(
        <FileSizeWarningModal
          isOpen={true}
          onClose={() => {}}
          fileSizeStatus={mockFileSizeStatusWarning}
          onProceed={() => {}}
          onCompress={() => {}}
        />
      );
      expect(
        screen.getByText('We recommend compressing this file for faster processing.')
      ).toBeInTheDocument();
    });

    it('shows benefits of compression for warning state', () => {
      render(
        <FileSizeWarningModal
          isOpen={true}
          onClose={() => {}}
          fileSizeStatus={mockFileSizeStatusWarning}
          onProceed={() => {}}
          onCompress={() => {}}
        />
      );
      expect(screen.getByText('Benefits of Compression:')).toBeInTheDocument();
      expect(screen.getByText('Faster transcription processing')).toBeInTheDocument();
      expect(screen.getByText('Lower memory usage during playback')).toBeInTheDocument();
    });

    it('shows warning icon for warning state', () => {
      render(
        <FileSizeWarningModal
          isOpen={true}
          onClose={() => {}}
          fileSizeStatus={mockFileSizeStatusWarning}
          onProceed={() => {}}
          onCompress={() => {}}
        />
      );
      expect(screen.getByTestId('warning-icon')).toBeInTheDocument();
    });
  });

  describe('Rendering - Error State', () => {
    it('displays error title for too-large files', () => {
      render(
        <FileSizeWarningModal
          isOpen={true}
          onClose={() => {}}
          fileSizeStatus={mockFileSizeStatusError}
          onProceed={() => {}}
          onCompress={() => {}}
        />
      );
      expect(screen.getByText('File Too Large')).toBeInTheDocument();
    });

    it('displays file size for error state', () => {
      render(
        <FileSizeWarningModal
          isOpen={true}
          onClose={() => {}}
          fileSizeStatus={mockFileSizeStatusError}
          onProceed={() => {}}
          onCompress={() => {}}
        />
      );
      expect(screen.getByText('65.2 MB')).toBeInTheDocument();
    });

    it('shows error message for too-large files', () => {
      render(
        <FileSizeWarningModal
          isOpen={true}
          onClose={() => {}}
          fileSizeStatus={mockFileSizeStatusError}
          onProceed={() => {}}
          onCompress={() => {}}
        />
      );
      expect(screen.getByText(/Files larger than 50MB must be compressed/)).toBeInTheDocument();
    });

    it('does not show benefits list for error state', () => {
      render(
        <FileSizeWarningModal
          isOpen={true}
          onClose={() => {}}
          fileSizeStatus={mockFileSizeStatusError}
          onProceed={() => {}}
          onCompress={() => {}}
        />
      );
      expect(screen.queryByText('Benefits of Compression:')).not.toBeInTheDocument();
    });

    it('shows error icon for error state', () => {
      render(
        <FileSizeWarningModal
          isOpen={true}
          onClose={() => {}}
          fileSizeStatus={mockFileSizeStatusError}
          onProceed={() => {}}
          onCompress={() => {}}
        />
      );
      expect(screen.getByTestId('error-icon')).toBeInTheDocument();
    });
  });

  describe('Action Buttons - Warning State', () => {
    it('shows all three buttons for warning state', () => {
      render(
        <FileSizeWarningModal
          isOpen={true}
          onClose={() => {}}
          fileSizeStatus={mockFileSizeStatusWarning}
          onProceed={() => {}}
          onCompress={() => {}}
        />
      );
      expect(screen.getByText('Compress & Continue')).toBeInTheDocument();
      expect(screen.getByText('Continue Anyway')).toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });

    it('calls onCompress when Compress button is clicked', async () => {
      const user = userEvent.setup();
      const handleCompress = vi.fn();
      render(
        <FileSizeWarningModal
          isOpen={true}
          onClose={() => {}}
          fileSizeStatus={mockFileSizeStatusWarning}
          onProceed={() => {}}
          onCompress={handleCompress}
        />
      );

      await user.click(screen.getByText('Compress & Continue'));
      expect(handleCompress).toHaveBeenCalledTimes(1);
    });

    it('calls onProceed when Continue Anyway is clicked', async () => {
      const user = userEvent.setup();
      const handleProceed = vi.fn();
      render(
        <FileSizeWarningModal
          isOpen={true}
          onClose={() => {}}
          fileSizeStatus={mockFileSizeStatusWarning}
          onProceed={handleProceed}
          onCompress={() => {}}
        />
      );

      await user.click(screen.getByText('Continue Anyway'));
      expect(handleProceed).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when Cancel is clicked', async () => {
      const user = userEvent.setup();
      const handleClose = vi.fn();
      render(
        <FileSizeWarningModal
          isOpen={true}
          onClose={handleClose}
          fileSizeStatus={mockFileSizeStatusWarning}
          onProceed={() => {}}
          onCompress={() => {}}
        />
      );

      await user.click(screen.getByText('Cancel'));
      expect(handleClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Action Buttons - Error State', () => {
    it('shows only two buttons for error state', () => {
      render(
        <FileSizeWarningModal
          isOpen={true}
          onClose={() => {}}
          fileSizeStatus={mockFileSizeStatusError}
          onProceed={() => {}}
          onCompress={() => {}}
        />
      );
      expect(screen.getByText('Compress File')).toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeInTheDocument();
      expect(screen.queryByText('Continue Anyway')).not.toBeInTheDocument();
    });

    it('calls onCompress when Compress File is clicked', async () => {
      const user = userEvent.setup();
      const handleCompress = vi.fn();
      render(
        <FileSizeWarningModal
          isOpen={true}
          onClose={() => {}}
          fileSizeStatus={mockFileSizeStatusError}
          onProceed={() => {}}
          onCompress={handleCompress}
        />
      );

      await user.click(screen.getByText('Compress File'));
      expect(handleCompress).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when Cancel is clicked', async () => {
      const user = userEvent.setup();
      const handleClose = vi.fn();
      render(
        <FileSizeWarningModal
          isOpen={true}
          onClose={handleClose}
          fileSizeStatus={mockFileSizeStatusError}
          onProceed={() => {}}
          onCompress={() => {}}
        />
      );

      await user.click(screen.getByText('Cancel'));
      expect(handleClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Edge Cases', () => {
    it('handles very large file sizes', () => {
      const largeFileStatus: FileSizeStatus = {
        size: 1.5 * 1024 * 1024 * 1024,
        formattedSize: '1.5 GB',
        isOptimal: false,
        needsWarning: true,
        isTooLarge: true,
        estimatedTime: '~20 minutes',
        recommendation: 'This file is extremely large.',
      };

      render(
        <FileSizeWarningModal
          isOpen={true}
          onClose={() => {}}
          fileSizeStatus={largeFileStatus}
          onProceed={() => {}}
          onCompress={() => {}}
        />
      );
      expect(screen.getByText('1.5 GB')).toBeInTheDocument();
    });

    it('handles custom recommendation text', () => {
      const customStatus: FileSizeStatus = {
        ...mockFileSizeStatusWarning,
        recommendation: 'Custom recommendation message for this specific file.',
      };

      render(
        <FileSizeWarningModal
          isOpen={true}
          onClose={() => {}}
          fileSizeStatus={customStatus}
          onProceed={() => {}}
          onCompress={() => {}}
        />
      );
      expect(
        screen.getByText('Custom recommendation message for this specific file.')
      ).toBeInTheDocument();
    });
  });
});
