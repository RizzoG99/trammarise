import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ResultPdfDocument } from './ResultPdfDocument';

// Mock specific template components to verify selection
vi.mock('./templates/PdfTemplates', () => ({
  DefaultTemplate: () => <div data-testid="template-default">Default Template</div>,
  MeetingTemplate: () => <div data-testid="template-meeting">Meeting Template</div>,
  LectureTemplate: () => <div data-testid="template-lecture">Lecture Template</div>,
  InterviewTemplate: () => <div data-testid="template-interview">Interview Template</div>,
}));

// Mock @react-pdf/renderer
vi.mock('@react-pdf/renderer', () => ({
  Document: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Page: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Text: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  View: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  StyleSheet: { create: (s: Record<string, unknown>) => s },
}));

describe('ResultPdfDocument', () => {
  const mockConfig = {
    mode: 'simple' as const,
    provider: 'openai' as const,
    model: 'gpt-4o',
    openaiKey: 'key',
    language: 'en' as const,
  };

  const props = {
    summary: 'Summary',
    transcript: 'Transcript',
    fileName: 'test.pdf',
  };

  it('renders MeetingTemplate for meeting content type', () => {
    const { getByTestId } = render(
      <ResultPdfDocument {...props} config={{ ...mockConfig, contentType: 'meeting' }} />
    );
    expect(getByTestId('template-meeting')).toBeInTheDocument();
  });

  it('renders LectureTemplate for lecture content type', () => {
    const { getByTestId } = render(
      <ResultPdfDocument {...props} config={{ ...mockConfig, contentType: 'lecture' }} />
    );
    expect(getByTestId('template-lecture')).toBeInTheDocument();
  });

  it('renders InterviewTemplate for podcast content type', () => {
    const { getByTestId } = render(
      <ResultPdfDocument {...props} config={{ ...mockConfig, contentType: 'podcast' }} />
    );
    expect(getByTestId('template-interview')).toBeInTheDocument();
  });

  it('renders DefaultTemplate for unknown types', () => {
    const { getByTestId } = render(
      <ResultPdfDocument
        {...props}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        config={{ ...mockConfig, contentType: 'unknown-type' as unknown as any }}
      />
    );
    expect(getByTestId('template-default')).toBeInTheDocument();
  });
});
