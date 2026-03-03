import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { SpeakerTranscriptPreview } from './SpeakerTranscriptPreview';

describe('SpeakerTranscriptPreview', () => {
  it('renders all 4 mock utterance rows', () => {
    render(<SpeakerTranscriptPreview />);
    expect(screen.getByText(/Thanks everyone for joining/)).toBeInTheDocument();
    expect(screen.getByText(/Should we start with the roadmap/)).toBeInTheDocument();
    expect(screen.getByText(/walk through Q2 milestones/)).toBeInTheDocument();
    expect(screen.getByText(/Engineering pushed the API deadline/)).toBeInTheDocument();
  });

  it('renders all 3 speaker chips', () => {
    render(<SpeakerTranscriptPreview />);
    const chips = screen.getAllByText(/Speaker \d/);
    const labels = chips.map((c) => c.textContent);
    expect(labels).toContain('Speaker 1');
    expect(labels).toContain('Speaker 2');
    expect(labels).toContain('Speaker 3');
  });

  it('renders timestamps in MM:SS format', () => {
    render(<SpeakerTranscriptPreview />);
    expect(screen.getByText('00:12')).toBeInTheDocument();
    expect(screen.getByText('00:28')).toBeInTheDocument();
    expect(screen.getByText('00:45')).toBeInTheDocument();
    expect(screen.getByText('01:02')).toBeInTheDocument();
  });

  it('renders the preview heading', () => {
    render(<SpeakerTranscriptPreview />);
    expect(screen.getByText('Identify every voice')).toBeInTheDocument();
  });

  it('renders the Pro badge', () => {
    render(<SpeakerTranscriptPreview />);
    expect(screen.getByText('Pro')).toBeInTheDocument();
  });

  it('renders the preview subtitle', () => {
    render(<SpeakerTranscriptPreview />);
    expect(screen.getByText('See who said what, when')).toBeInTheDocument();
  });
});
