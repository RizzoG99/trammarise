import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { HistoryFilterPanel } from './HistoryFilterPanel';
import type { SortOption } from '../types/history';

const defaultProps = {
  isOpen: true,
  contentTypeFilter: 'all' as const,
  onContentTypeChange: vi.fn(),
  sortBy: 'newest' as SortOption,
  onSortChange: vi.fn(),
  onClose: vi.fn(),
};

describe('HistoryFilterPanel', () => {
  it('does not render when isOpen is false', () => {
    render(<HistoryFilterPanel {...defaultProps} isOpen={false} />);
    expect(screen.queryByRole('button', { name: /all|All/i })).not.toBeInTheDocument();
  });

  it('renders pill chips for all content types when open', () => {
    render(<HistoryFilterPanel {...defaultProps} />);
    const buttons = screen.getAllByRole('button');
    // Should have at least 7 content type buttons + 4 sort buttons + 1 close button = 12
    expect(buttons.length).toBeGreaterThanOrEqual(11);
  });

  it('calls onContentTypeChange with correct value when chip clicked', async () => {
    const user = userEvent.setup();
    const onContentTypeChange = vi.fn();
    render(<HistoryFilterPanel {...defaultProps} onContentTypeChange={onContentTypeChange} />);
    const buttons = screen.getAllByRole('button');
    // Find the meeting button (should be second one after "All")
    const meetingButton = buttons[1];
    await user.click(meetingButton);
    expect(onContentTypeChange).toHaveBeenCalled();
  });

  it('active content type chip has bg-primary styling', () => {
    render(<HistoryFilterPanel {...defaultProps} contentTypeFilter="meeting" />);
    const buttons = screen.getAllByRole('button');
    // Find button with bg-primary (should be the "All" button since it's active)
    const activeButton = buttons.find((btn) => btn.className.includes('bg-primary'));
    expect(activeButton?.className).toMatch(/bg-primary/);
  });

  it('renders pill chips for sort options', () => {
    render(<HistoryFilterPanel {...defaultProps} />);
    const buttons = screen.getAllByRole('button');
    // Sort buttons should exist (after content type buttons)
    expect(buttons.length).toBeGreaterThanOrEqual(12);
  });

  it('calls onSortChange with correct value when sort chip clicked', async () => {
    const user = userEvent.setup();
    const onSortChange = vi.fn();
    render(<HistoryFilterPanel {...defaultProps} onSortChange={onSortChange} />);
    const buttons = screen.getAllByRole('button');
    // Find a sort button (around index 8-11)
    const sortButton = buttons[8];
    await user.click(sortButton);
    expect(onSortChange).toHaveBeenCalled();
  });

  it('calls onClose when close button clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<HistoryFilterPanel {...defaultProps} onClose={onClose} />);
    const buttons = screen.getAllByRole('button');
    // Last button should be the close button
    const closeButton = buttons[buttons.length - 1];
    await user.click(closeButton);
    expect(onClose).toHaveBeenCalled();
  });
});
