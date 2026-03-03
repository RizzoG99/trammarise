import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SpeakerDiarizationToggle } from './SpeakerDiarizationToggle';

const defaultProps = {
  enabled: false,
  onEnabledChange: vi.fn(),
  onSpeakersExpectedChange: vi.fn(),
};

describe('SpeakerDiarizationToggle', () => {
  describe('Pro user (default)', () => {
    it('renders the toggle', () => {
      render(<SpeakerDiarizationToggle {...defaultProps} />);
      expect(screen.getByRole('switch')).toBeInTheDocument();
    });

    it('toggle is not aria-disabled by default', () => {
      render(<SpeakerDiarizationToggle {...defaultProps} />);
      expect(screen.getByRole('switch')).not.toHaveAttribute('aria-disabled', 'true');
    });

    it('does not render Pro badge', () => {
      render(<SpeakerDiarizationToggle {...defaultProps} isProUser={true} />);
      expect(screen.queryByText('Pro')).not.toBeInTheDocument();
    });

    it('shows speaker count input when enabled', () => {
      render(<SpeakerDiarizationToggle {...defaultProps} enabled={true} isProUser={true} />);
      expect(screen.getByRole('spinbutton')).toBeInTheDocument();
    });
  });

  describe('Free user (isProUser=false)', () => {
    it('renders Pro badge', () => {
      render(<SpeakerDiarizationToggle {...defaultProps} isProUser={false} />);
      expect(screen.getByText('Pro')).toBeInTheDocument();
    });

    it('toggle is aria-disabled', () => {
      render(<SpeakerDiarizationToggle {...defaultProps} isProUser={false} />);
      expect(screen.getByRole('switch')).toHaveAttribute('aria-disabled', 'true');
    });

    it('does not show speaker count input even when enabled=true', () => {
      render(<SpeakerDiarizationToggle {...defaultProps} enabled={true} isProUser={false} />);
      expect(screen.queryByRole('spinbutton')).not.toBeInTheDocument();
    });

    it('calls onUpgradeClick when row is clicked', () => {
      const onUpgradeClick = vi.fn();
      render(
        <SpeakerDiarizationToggle
          {...defaultProps}
          isProUser={false}
          onUpgradeClick={onUpgradeClick}
        />
      );
      fireEvent.click(screen.getByRole('button'));
      expect(onUpgradeClick).toHaveBeenCalledTimes(1);
    });

    it('does not call onEnabledChange when locked row is clicked', () => {
      const onEnabledChange = vi.fn();
      render(
        <SpeakerDiarizationToggle
          {...defaultProps}
          isProUser={false}
          onEnabledChange={onEnabledChange}
        />
      );
      fireEvent.click(screen.getByRole('button'));
      expect(onEnabledChange).not.toHaveBeenCalled();
    });
  });
});
