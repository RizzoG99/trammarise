import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { TranscriptTabBar } from './TranscriptTabBar';

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, fallback: string) => fallback,
  }),
}));

describe('TranscriptTabBar', () => {
  it('does not render if hasDiarization is false', () => {
    const { container } = render(
      <TranscriptTabBar activeTab="transcript" onTabChange={vi.fn()} hasDiarization={false} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders correctly when hasDiarization is true', () => {
    render(<TranscriptTabBar activeTab="transcript" onTabChange={vi.fn()} hasDiarization={true} />);

    expect(screen.getByRole('tab', { name: 'Transcript' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Diarization' })).toBeInTheDocument();
  });

  it('indicates active tab via aria-selected', () => {
    render(
      <TranscriptTabBar activeTab="diarization" onTabChange={vi.fn()} hasDiarization={true} />
    );

    expect(screen.getByRole('tab', { name: 'Diarization' })).toHaveAttribute(
      'aria-selected',
      'true'
    );
    expect(screen.getByRole('tab', { name: 'Transcript' })).toHaveAttribute(
      'aria-selected',
      'false'
    );
  });

  it('calls onTabChange when a tab is clicked', () => {
    const onTabChange = vi.fn();
    render(
      <TranscriptTabBar activeTab="transcript" onTabChange={onTabChange} hasDiarization={true} />
    );

    fireEvent.click(screen.getByRole('tab', { name: 'Diarization' }));
    expect(onTabChange).toHaveBeenCalledWith('diarization');
  });
});
