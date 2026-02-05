import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { HistoryEmptyState } from './HistoryEmptyState';
import { MemoryRouter } from 'react-router-dom';

const renderWithRouter = (component: React.ReactElement) => {
  return render(<MemoryRouter>{component}</MemoryRouter>);
};

describe('HistoryEmptyState', () => {
  it('should render "No Recordings" title when no sessions', () => {
    renderWithRouter(<HistoryEmptyState hasFilters={false} onClearFilters={() => {}} />);

    expect(screen.getByText(/no recordings yet/i)).toBeInTheDocument();
  });

  it('should show "Create New Recording" CTA button', () => {
    renderWithRouter(<HistoryEmptyState hasFilters={false} onClearFilters={() => {}} />);

    const button = screen.getByRole('link', { name: /create new recording/i });
    expect(button).toBeInTheDocument();
  });

  it('should render "No Results" variant when hasFilters=true', () => {
    renderWithRouter(<HistoryEmptyState hasFilters={true} onClearFilters={() => {}} />);

    expect(screen.getByText(/no matching recordings/i)).toBeInTheDocument();
  });

  it('should show History icon', () => {
    const { container } = renderWithRouter(
      <HistoryEmptyState hasFilters={false} onClearFilters={() => {}} />
    );

    // Check for SVG icon
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('should call onClearFilters when "Clear Filters" clicked', async () => {
    const user = userEvent.setup();
    const onClearFilters = vi.fn();

    renderWithRouter(<HistoryEmptyState hasFilters={true} onClearFilters={onClearFilters} />);

    const button = screen.getByRole('button', { name: /clear filters/i });
    await user.click(button);

    expect(onClearFilters).toHaveBeenCalledOnce();
  });

  it('should have accessible keyboard navigation', async () => {
    const user = userEvent.setup();
    renderWithRouter(<HistoryEmptyState hasFilters={false} onClearFilters={() => {}} />);

    const button = screen.getByRole('link', { name: /create new recording/i });

    // Tab to button
    await user.tab();
    expect(button).toHaveFocus();
  });

  it('should announce title to screen readers', () => {
    renderWithRouter(<HistoryEmptyState hasFilters={false} onClearFilters={() => {}} />);

    const heading = screen.getByRole('heading', { name: /no recordings yet/i });
    expect(heading).toBeInTheDocument();
  });

  it('should not show "Clear Filters" button when hasFilters=false', () => {
    renderWithRouter(<HistoryEmptyState hasFilters={false} onClearFilters={() => {}} />);

    expect(screen.queryByRole('button', { name: /clear filters/i })).not.toBeInTheDocument();
  });
});
