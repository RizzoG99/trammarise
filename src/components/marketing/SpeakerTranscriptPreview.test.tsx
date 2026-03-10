import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { SpeakerTranscriptPreview } from './SpeakerTranscriptPreview';

describe('SpeakerTranscriptPreview', () => {
  it('renders all 7 mock utterance rows', () => {
    render(<SpeakerTranscriptPreview />);
    expect(screen.getByText(/Thanks everyone for joining/)).toBeInTheDocument();
    expect(screen.getByText(/Should we start with the roadmap/)).toBeInTheDocument();
    expect(screen.getByText(/walk through Q2 milestones/)).toBeInTheDocument();
    expect(screen.getByText(/Engineering pushed the API deadline/)).toBeInTheDocument();
    expect(screen.getByText(/Does that affect the mobile release/)).toBeInTheDocument();
    expect(screen.getByText(/Mobile depends on that endpoint/)).toBeInTheDocument();
    expect(screen.getByText(/lock down the new timeline/)).toBeInTheDocument();
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
    expect(screen.getByText('01:18')).toBeInTheDocument();
    expect(screen.getByText('01:35')).toBeInTheDocument();
    expect(screen.getByText('01:52')).toBeInTheDocument();
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
