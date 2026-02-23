import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Tooltip } from './Tooltip';

describe('Tooltip', () => {
  it('renders children', () => {
    render(
      <Tooltip content="Help text">
        <button>Hover me</button>
      </Tooltip>
    );
    expect(screen.getByText('Hover me')).toBeInTheDocument();
  });

  it('shows tooltip content on mouse enter', () => {
    render(
      <Tooltip content="Helpful tooltip">
        <button>Trigger</button>
      </Tooltip>
    );
    fireEvent.mouseEnter(screen.getByText('Trigger'));
    expect(screen.getByRole('tooltip')).toHaveTextContent('Helpful tooltip');
  });

  it('hides tooltip on mouse leave', () => {
    render(
      <Tooltip content="Helpful tooltip">
        <button>Trigger</button>
      </Tooltip>
    );
    const trigger = screen.getByText('Trigger');
    fireEvent.mouseEnter(trigger);
    fireEvent.mouseLeave(trigger);
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('shows tooltip on focus', () => {
    render(
      <Tooltip content="Focus tooltip">
        <button>Trigger</button>
      </Tooltip>
    );
    fireEvent.focus(screen.getByText('Trigger'));
    expect(screen.getByRole('tooltip')).toHaveTextContent('Focus tooltip');
  });

  it('hides tooltip on blur', () => {
    render(
      <Tooltip content="Focus tooltip">
        <button>Trigger</button>
      </Tooltip>
    );
    const trigger = screen.getByText('Trigger');
    fireEvent.focus(trigger);
    fireEvent.blur(trigger);
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('accepts placement prop', () => {
    render(
      <Tooltip content="Bottom tooltip" placement="bottom">
        <button>Trigger</button>
      </Tooltip>
    );
    fireEvent.mouseEnter(screen.getByText('Trigger'));
    const tooltip = screen.getByRole('tooltip');
    expect(tooltip).toBeInTheDocument();
  });
});
