import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SpeakerTranscriptView } from './SpeakerTranscriptView';
import type { Utterance } from '@/types/audio';

// Mock translation
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

// Mock scrollIntoView
Element.prototype.scrollIntoView = vi.fn();

const mockUtterances: Utterance[] = [
  {
    speaker: 'A',
    text: 'Hello world',
    start: 0,
    end: 1000,
    confidence: 0.9,
  },
  {
    speaker: 'B',
    text: 'Hi there',
    start: 1000,
    end: 2000,
    confidence: 0.85,
  },
];

describe('SpeakerTranscriptView', () => {
  it('renders utterances correctly', () => {
    render(<SpeakerTranscriptView utterances={mockUtterances} />);

    expect(screen.getByText('Hello world')).toBeInTheDocument();
    expect(screen.getByText('Hi there')).toBeInTheDocument();
    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('B')).toBeInTheDocument();
  });

  it('filters utterances based on search', () => {
    render(<SpeakerTranscriptView utterances={mockUtterances} />);

    const searchInput = screen.getByPlaceholderText('results.transcript.searchPlaceholder');
    fireEvent.change(searchInput, { target: { value: 'Hello' } });

    expect(screen.getByText('Hello world')).toBeInTheDocument();
    expect(screen.queryByText('Hi there')).not.toBeInTheDocument();
  });

  it('displays empty state when no results found', () => {
    render(<SpeakerTranscriptView utterances={mockUtterances} />);

    const searchInput = screen.getByPlaceholderText('results.transcript.searchPlaceholder');
    fireEvent.change(searchInput, { target: { value: 'NotFound' } });

    expect(screen.getByText('results.transcript.noResults')).toBeInTheDocument();
  });
});
