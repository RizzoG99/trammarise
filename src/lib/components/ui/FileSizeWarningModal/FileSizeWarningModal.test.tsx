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
      expect(screen.getByText('fileSizeWarning.titles.large')).toBeInTheDocument();
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
      expect(screen.queryByText('fileSizeWarning.titles.large')).not.toBeInTheDocument();
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
      expect(screen.getByText('fileSizeWarning.titles.large')).toBeInTheDocument();
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
      expect(screen.getByText('fileSizeWarning.benefits.title')).toBeInTheDocument();
      expect(screen.getByText('fileSizeWarning.benefits.faster')).toBeInTheDocument();
      expect(screen.getByText('fileSizeWarning.benefits.lowerMemory')).toBeInTheDocument();
    });

    it('shows warning icon for warning state', () => {
      const { container } = render(
        <FileSizeWarningModal
          isOpen={true}
          onClose={() => {}}
          fileSizeStatus={mockFileSizeStatusWarning}
          onProceed={() => {}}
          onCompress={() => {}}
        />
      );
      const icon = container.querySelector('.text-amber-500');
      expect(icon).toBeInTheDocument();
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
      expect(screen.getByText('fileSizeWarning.titles.tooLarge')).toBeInTheDocument();
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
      expect(screen.getByText('fileSizeWarning.note.text')).toBeInTheDocument();
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
      expect(screen.queryByText('fileSizeWarning.benefits.title')).not.toBeInTheDocument();
    });

    it('shows error icon for error state', () => {
      const { container } = render(
        <FileSizeWarningModal
          isOpen={true}
          onClose={() => {}}
          fileSizeStatus={mockFileSizeStatusError}
          onProceed={() => {}}
          onCompress={() => {}}
        />
      );
      const icon = container.querySelector('.text-red-500');
      expect(icon).toBeInTheDocument();
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
      expect(screen.getByText('fileSizeWarning.buttons.compressContinue')).toBeInTheDocument();
      expect(screen.getByText('fileSizeWarning.buttons.continueAnyway')).toBeInTheDocument();
      expect(screen.getByText('common.cancel')).toBeInTheDocument();
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

      await user.click(screen.getByText('fileSizeWarning.buttons.compressContinue'));
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

      await user.click(screen.getByText('fileSizeWarning.buttons.continueAnyway'));
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

      await user.click(screen.getByText('common.cancel'));
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
      expect(screen.getByText('fileSizeWarning.buttons.compress')).toBeInTheDocument();
      expect(screen.getByText('common.cancel')).toBeInTheDocument();
      expect(screen.queryByText('fileSizeWarning.buttons.continueAnyway')).not.toBeInTheDocument();
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

      await user.click(screen.getByText('fileSizeWarning.buttons.compress'));
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

      await user.click(screen.getByText('common.cancel'));
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
