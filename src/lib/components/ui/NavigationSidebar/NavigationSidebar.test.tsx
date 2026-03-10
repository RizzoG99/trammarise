import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { NavigationSidebar } from './NavigationSidebar';

const items = [
  { id: 'profile', label: 'Profile', icon: undefined },
  { id: 'billing', label: 'Billing', icon: undefined },
  { id: 'api-keys', label: 'API Keys', icon: undefined },
];

describe('NavigationSidebar', () => {
  it('renders all items', () => {
    render(<NavigationSidebar items={items} activeId="profile" onSelect={vi.fn()} />);
    expect(screen.getByText('Profile')).toBeInTheDocument();
    expect(screen.getByText('Billing')).toBeInTheDocument();
    expect(screen.getByText('API Keys')).toBeInTheDocument();
  });

  it('marks active item with aria-current', () => {
    render(<NavigationSidebar items={items} activeId="billing" onSelect={vi.fn()} />);
    const activeItem = screen.getByText('Billing').closest('[aria-current]');
    expect(activeItem).toHaveAttribute('aria-current', 'page');
  });

  it('calls onSelect with item id when clicked', () => {
    const onSelect = vi.fn();
    render(<NavigationSidebar items={items} activeId="profile" onSelect={onSelect} />);
    fireEvent.click(screen.getByText('Billing'));
    expect(onSelect).toHaveBeenCalledWith('billing');
  });

  it('applies active styles to active item', () => {
    render(<NavigationSidebar items={items} activeId="api-keys" onSelect={vi.fn()} />);
    const activeButton = screen.getByText('API Keys').closest('button');
    expect(activeButton).toHaveClass('border-l-[var(--color-primary)]');
  });

  it('renders without icons when not provided', () => {
    render(<NavigationSidebar items={items} activeId="profile" onSelect={vi.fn()} />);
    expect(screen.getAllByRole('button')).toHaveLength(3);
  });
});
