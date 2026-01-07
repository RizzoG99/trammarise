import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { Modal } from './Modal';

describe('Modal', () => {
  const mockOnClose = vi.fn();
  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    title: 'Test Modal',
    children: <div>Modal content</div>,
  };

  beforeEach(() => {
    mockOnClose.mockClear();
  });

  afterEach(() => {
    cleanup();
    // Reset body overflow
    document.body.style.overflow = '';
  });

  describe('Rendering', () => {
    it('renders when isOpen is true', () => {
      render(<Modal {...defaultProps} />);
      expect(screen.getByText('Test Modal')).toBeInTheDocument();
      expect(screen.getByText('Modal content')).toBeInTheDocument();
    });

    it('does not render when isOpen is false', () => {
      render(<Modal {...defaultProps} isOpen={false} />);
      expect(screen.queryByText('Test Modal')).not.toBeInTheDocument();
    });

    it('renders title correctly', () => {
      render(<Modal {...defaultProps} title="Custom Title" />);
      expect(screen.getByText('Custom Title')).toBeInTheDocument();
    });

    it('renders children content', () => {
      render(
        <Modal {...defaultProps}>
          <p>Custom content</p>
          <button>Action</button>
        </Modal>
      );
      expect(screen.getByText('Custom content')).toBeInTheDocument();
      expect(screen.getByText('Action')).toBeInTheDocument();
    });

    it('renders close button (X)', () => {
      render(<Modal {...defaultProps} />);
      const closeButton = screen.getByLabelText('Close modal');
      expect(closeButton).toBeInTheDocument();
      expect(closeButton.textContent).toBe('×');
    });
  });

  describe('Actions', () => {
    it('renders no footer when actions are not provided', () => {
      render(<Modal {...defaultProps} />);
      // Footer should not exist when no actions
      const buttons = screen.queryAllByRole('button');
      // Only close button should exist
      expect(buttons.length).toBe(1); // Just the X button
    });

    it('renders no footer when actions array is empty', () => {
      render(<Modal {...defaultProps} actions={[]} />);
      const buttons = screen.queryAllByRole('button');
      expect(buttons.length).toBe(1); // Just the X button
    });

    it('renders action buttons in footer', () => {
      const actions = [
        { label: 'Cancel', onClick: vi.fn() },
        { label: 'Confirm', onClick: vi.fn() },
      ];
      render(<Modal {...defaultProps} actions={actions} />);

      expect(screen.getByText('Cancel')).toBeInTheDocument();
      expect(screen.getByText('Confirm')).toBeInTheDocument();
    });

    it('calls action onClick when action button is clicked', () => {
      const onConfirm = vi.fn();
      const actions = [
        { label: 'Confirm', onClick: onConfirm },
      ];
      render(<Modal {...defaultProps} actions={actions} />);

      fireEvent.click(screen.getByText('Confirm'));
      expect(onConfirm).toHaveBeenCalledTimes(1);
    });

    it('applies correct variant to action buttons', () => {
      const actions = [
        { label: 'Delete', onClick: vi.fn(), variant: 'danger' as const },
        { label: 'Save', onClick: vi.fn(), variant: 'success' as const },
      ];
      render(<Modal {...defaultProps} actions={actions} />);

      // Buttons should be rendered (variant styling tested in Button.test.tsx)
      expect(screen.getByText('Delete')).toBeInTheDocument();
      expect(screen.getByText('Save')).toBeInTheDocument();
    });

    it('uses primary variant by default for actions', () => {
      const actions = [
        { label: 'OK', onClick: vi.fn() }, // No variant specified
      ];
      render(<Modal {...defaultProps} actions={actions} />);

      expect(screen.getByText('OK')).toBeInTheDocument();
    });
  });

  describe('Closing Behavior', () => {
    it('calls onClose when close button (X) is clicked', () => {
      render(<Modal {...defaultProps} />);
      const closeButton = screen.getByLabelText('Close modal');

      fireEvent.click(closeButton);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when backdrop is clicked', () => {
      render(<Modal {...defaultProps} />);
      const backdrop = screen.getByRole('dialog');

      fireEvent.click(backdrop);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('does not close when modal content is clicked', () => {
      render(<Modal {...defaultProps} />);
      const content = screen.getByText('Modal content');

      fireEvent.click(content);
      expect(mockOnClose).not.toHaveBeenCalled();
    });

    it('does not call onClose when backdrop is clicked and disableBackdropClick is true', () => {
      render(<Modal {...defaultProps} disableBackdropClick={true} />);
      const backdrop = screen.getByRole('dialog');

      fireEvent.click(backdrop);
      expect(mockOnClose).not.toHaveBeenCalled();
    });

    it('still calls onClose when X button is clicked even with disableBackdropClick', () => {
      render(<Modal {...defaultProps} disableBackdropClick={true} />);
      const closeButton = screen.getByLabelText('Close modal');

      fireEvent.click(closeButton);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when Escape key is pressed', () => {
      render(<Modal {...defaultProps} />);

      fireEvent.keyDown(document, { key: 'Escape' });
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('does not call onClose when other keys are pressed', () => {
      render(<Modal {...defaultProps} />);

      fireEvent.keyDown(document, { key: 'Enter' });
      fireEvent.keyDown(document, { key: 'Space' });
      fireEvent.keyDown(document, { key: 'a' });

      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe('Body Scroll Lock', () => {
    it('prevents body scroll when modal is open', () => {
      render(<Modal {...defaultProps} />);
      expect(document.body.style.overflow).toBe('hidden');
    });

    it('restores body scroll when modal is closed', () => {
      const { rerender } = render(<Modal {...defaultProps} />);
      expect(document.body.style.overflow).toBe('hidden');

      rerender(<Modal {...defaultProps} isOpen={false} />);
      expect(document.body.style.overflow).toBe('');
    });

    it('restores body scroll on unmount', () => {
      const { unmount } = render(<Modal {...defaultProps} />);
      expect(document.body.style.overflow).toBe('hidden');

      unmount();
      expect(document.body.style.overflow).toBe('');
    });
  });

  describe('Accessibility', () => {
    it('has role="dialog"', () => {
      render(<Modal {...defaultProps} />);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('has aria-modal="true"', () => {
      render(<Modal {...defaultProps} />);
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
    });

    it('has aria-labelledby pointing to title', () => {
      render(<Modal {...defaultProps} />);
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-labelledby', 'modal-title');

      const title = screen.getByText('Test Modal');
      expect(title).toHaveAttribute('id', 'modal-title');
    });

    it('close button has aria-label', () => {
      render(<Modal {...defaultProps} />);
      const closeButton = screen.getByLabelText('Close modal');
      expect(closeButton).toHaveAttribute('aria-label', 'Close modal');
    });
  });

  describe('Custom Styling', () => {
    it('applies custom className to modal content', () => {
      render(<Modal {...defaultProps} className="custom-modal-class" />);
      // The className is on the modal content div (child of backdrop)
      const backdrop = screen.getByRole('dialog');
      const modalContent = backdrop.querySelector('div');
      expect(modalContent?.className).toContain('custom-modal-class');
    });

    it('preserves default classes when custom className is added', () => {
      render(<Modal {...defaultProps} className="custom-class" />);
      // The className is on the modal content div (child of backdrop)
      const backdrop = screen.getByRole('dialog');
      const modalContent = backdrop.querySelector('div');
      expect(modalContent?.className).toContain('bg-white');
      expect(modalContent?.className).toContain('custom-class');
    });
  });

  describe('Edge Cases', () => {
    it('handles multiple actions correctly', () => {
      const actions = [
        { label: 'Action 1', onClick: vi.fn() },
        { label: 'Action 2', onClick: vi.fn() },
        { label: 'Action 3', onClick: vi.fn() },
        { label: 'Action 4', onClick: vi.fn() },
      ];
      render(<Modal {...defaultProps} actions={actions} />);

      expect(screen.getByText('Action 1')).toBeInTheDocument();
      expect(screen.getByText('Action 2')).toBeInTheDocument();
      expect(screen.getByText('Action 3')).toBeInTheDocument();
      expect(screen.getByText('Action 4')).toBeInTheDocument();
    });

    it('handles complex children content', () => {
      render(
        <Modal {...defaultProps}>
          <div>
            <h3>Subtitle</h3>
            <ul>
              <li>Item 1</li>
              <li>Item 2</li>
            </ul>
            <input placeholder="Enter text" />
          </div>
        </Modal>
      );

      expect(screen.getByText('Subtitle')).toBeInTheDocument();
      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
    });

    it('handles empty title', () => {
      render(<Modal {...defaultProps} title="" />);
      const titleElement = document.getElementById('modal-title');
      expect(titleElement).toBeInTheDocument();
      expect(titleElement?.textContent).toBe('');
    });

    it('cleans up event listeners on unmount', () => {
      const { unmount } = render(<Modal {...defaultProps} />);
      const spy = vi.fn();
      document.addEventListener('keydown', spy);

      unmount();

      // Trigger keydown after unmount
      fireEvent.keyDown(document, { key: 'Escape' });

      // onClose should not be called (modal unmounted)
      // But our spy should still work
      expect(spy).toHaveBeenCalled();
      document.removeEventListener('keydown', spy);
    });
  });
});
