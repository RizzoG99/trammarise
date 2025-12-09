import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LoadingSpinner } from './LoadingSpinner';

describe('LoadingSpinner', () => {
  describe('Rendering', () => {
    it('renders without crashing', () => {
      const { container } = render(<LoadingSpinner />);
      expect(container.firstChild).toBeInTheDocument();
    });

    it('renders with loading status role', () => {
      render(<LoadingSpinner />);
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('includes accessible label', () => {
      render(<LoadingSpinner />);
      expect(screen.getByLabelText('Loading')).toBeInTheDocument();
    });

    it('includes sr-only text for screen readers', () => {
      render(<LoadingSpinner />);
      expect(screen.getByText('Loading...')).toBeInTheDocument();
      expect(screen.getByText('Loading...')).toHaveClass('sr-only');
    });
  });

  describe('Size Variants', () => {
    it('renders small size', () => {
      render(<LoadingSpinner size="sm" />);
      const spinner = screen.getByRole('status');
      expect(spinner).toHaveClass('w-8');
      expect(spinner).toHaveClass('h-8');
      expect(spinner).toHaveClass('border-2');
    });

    it('renders medium size by default', () => {
      render(<LoadingSpinner />);
      const spinner = screen.getByRole('status');
      expect(spinner).toHaveClass('w-12');
      expect(spinner).toHaveClass('h-12');
      expect(spinner).toHaveClass('border-4');
    });

    it('renders medium size explicitly', () => {
      render(<LoadingSpinner size="md" />);
      const spinner = screen.getByRole('status');
      expect(spinner).toHaveClass('w-12');
      expect(spinner).toHaveClass('h-12');
    });

    it('renders large size', () => {
      render(<LoadingSpinner size="lg" />);
      const spinner = screen.getByRole('status');
      expect(spinner).toHaveClass('w-16');
      expect(spinner).toHaveClass('h-16');
      expect(spinner).toHaveClass('border-4');
    });

    it('renders extra large size', () => {
      render(<LoadingSpinner size="xl" />);
      const spinner = screen.getByRole('status');
      expect(spinner).toHaveClass('w-20');
      expect(spinner).toHaveClass('h-20');
    });
  });

  describe('Animation', () => {
    it('has animate-spin class', () => {
      render(<LoadingSpinner />);
      const spinner = screen.getByRole('status');
      expect(spinner).toHaveClass('animate-spin');
    });

    it('has rounded-full class for circular shape', () => {
      render(<LoadingSpinner />);
      const spinner = screen.getByRole('status');
      expect(spinner).toHaveClass('rounded-full');
    });
  });

  describe('Styling', () => {
    it('has border colors for spinner effect', () => {
      render(<LoadingSpinner />);
      const spinner = screen.getByRole('status');
      expect(spinner).toHaveClass('border-primary/10');
      expect(spinner).toHaveClass('border-t-primary');
    });

    it('has centered container', () => {
      const { container } = render(<LoadingSpinner />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('flex');
      expect(wrapper).toHaveClass('justify-center');
      expect(wrapper).toHaveClass('items-center');
    });

    it('has default padding', () => {
      const { container } = render(<LoadingSpinner />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('p-8');
    });
  });

  describe('Custom Classes', () => {
    it('merges custom className with container', () => {
      const { container } = render(<LoadingSpinner className="my-custom-class" />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('my-custom-class');
      expect(wrapper).toHaveClass('flex'); // Original class preserved
    });

    it('merges custom spinnerClassName with spinner', () => {
      render(<LoadingSpinner spinnerClassName="custom-spinner" />);
      const spinner = screen.getByRole('status');
      expect(spinner).toHaveClass('custom-spinner');
      expect(spinner).toHaveClass('animate-spin'); // Original class preserved
    });

    it('supports both className and spinnerClassName', () => {
      const { container } = render(
        <LoadingSpinner className="container-class" spinnerClassName="spinner-class" />
      );
      const wrapper = container.firstChild as HTMLElement;
      const spinner = screen.getByRole('status');

      expect(wrapper).toHaveClass('container-class');
      expect(spinner).toHaveClass('spinner-class');
    });
  });

  describe('Props Combination', () => {
    it('works with size and custom classes', () => {
      render(
        <LoadingSpinner
          size="lg"
          className="custom-container"
          spinnerClassName="custom-spinner"
        />
      );
      const spinner = screen.getByRole('status');
      expect(spinner).toHaveClass('w-16'); // Size
      expect(spinner).toHaveClass('custom-spinner'); // Custom class
    });
  });

  describe('Accessibility', () => {
    it('is accessible via role="status"', () => {
      render(<LoadingSpinner />);
      const spinner = screen.getByRole('status');
      expect(spinner).toBeInTheDocument();
    });

    it('has aria-label for assistive technologies', () => {
      render(<LoadingSpinner />);
      const spinner = screen.getByLabelText('Loading');
      expect(spinner).toBeInTheDocument();
    });

    it('includes screen reader only text', () => {
      render(<LoadingSpinner />);
      const srText = screen.getByText('Loading...');
      expect(srText).toHaveClass('sr-only');
    });
  });
});
