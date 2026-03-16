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
    expect(screen.queryByRole('button', { name: /meeting/i })).not.toBeInTheDocument();
  });

  it('renders pill chips for all content types when open', () => {
    render(<HistoryFilterPanel {...defaultProps} />);
    expect(screen.getByRole('button', { name: /^all$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^meeting$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^lecture$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^interview$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^podcast$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^voice memo$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^other$/i })).toBeInTheDocument();
  });

  it('calls onContentTypeChange with correct value when chip clicked', async () => {
    const user = userEvent.setup();
    const onContentTypeChange = vi.fn();
    render(<HistoryFilterPanel {...defaultProps} onContentTypeChange={onContentTypeChange} />);
    await user.click(screen.getByRole('button', { name: /^meeting$/i }));
    expect(onContentTypeChange).toHaveBeenCalledWith('meeting');
  });

  it('active content type chip has bg-primary styling', () => {
    render(<HistoryFilterPanel {...defaultProps} contentTypeFilter="meeting" />);
    const meetingButton = screen.getByRole('button', { name: /^meeting$/i });
    expect(meetingButton.className).toMatch(/bg-primary/);
  });

  it('renders pill chips for sort options', () => {
    render(<HistoryFilterPanel {...defaultProps} />);
    expect(screen.getByRole('button', { name: /newest first/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /oldest first/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /name \(a-z\)/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /name \(z-a\)/i })).toBeInTheDocument();
  });

  it('calls onSortChange with correct value when sort chip clicked', async () => {
    const user = userEvent.setup();
    const onSortChange = vi.fn();
    render(<HistoryFilterPanel {...defaultProps} onSortChange={onSortChange} />);
    await user.click(screen.getByRole('button', { name: /oldest first/i }));
    expect(onSortChange).toHaveBeenCalledWith('oldest');
  });

  it('calls onClose when close button clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<HistoryFilterPanel {...defaultProps} onClose={onClose} />);
    await user.click(screen.getByRole('button', { name: /clear all/i }));
    expect(onClose).toHaveBeenCalled();
  });
});
