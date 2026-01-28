import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { generatePDF } from './pdf-generator';
import { pdf } from '@react-pdf/renderer';

// Mock @react-pdf/renderer
vi.mock('@react-pdf/renderer', () => ({
  pdf: vi.fn(() => ({
    toBlob: vi.fn().mockResolvedValue(new Blob(['pdf content'], { type: 'application/pdf' })),
  })),
  Document: ({ children }: { children: React.ReactNode }) => children,
  Page: ({ children }: { children: React.ReactNode }) => children,
  Text: ({ children }: { children: React.ReactNode }) => children,
  View: ({ children }: { children: React.ReactNode }) => children,
  StyleSheet: { create: (styles: Record<string, unknown>) => styles },
}));

describe('generatePDF', () => {
  const mockBlob = new Blob(['pdf-content'], { type: 'application/pdf' });
  const mockUrl = 'blob:url';

  // DOM mocks
  const mockAnchor = {
    href: '',
    download: '',
    click: vi.fn(),
  } as unknown as HTMLAnchorElement;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Mock specific implementations
    (pdf as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      toBlob: vi.fn().mockResolvedValue(mockBlob),
    });

    // Mock URL.createObjectURL and revokeObjectURL
    window.URL.createObjectURL = vi.fn().mockReturnValue(mockUrl);
    window.URL.revokeObjectURL = vi.fn();

    // Mock document.createElement
    vi.spyOn(document, 'createElement').mockReturnValue(mockAnchor);
    vi.spyOn(document.body, 'appendChild').mockImplementation(() => mockAnchor);
    vi.spyOn(document.body, 'removeChild').mockImplementation(() => mockAnchor);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('sanitizes filenames correctly', async () => {
    const config = {
      mode: 'simple' as const,
      provider: 'openai' as const,
      model: 'gpt-4o',
      openaiKey: 'test-key',
      contentType: 'meeting',
      language: 'en' as const,
    };

    // Test with unsafe characters
    await generatePDF('Summary', 'Transcript', config, 'Bad/File:Name*');

    expect(mockAnchor.download).toBe('Bad-File-Name-.pdf');
    expect(mockAnchor.click).toHaveBeenCalled();
  });

  it('supports unicode characters in filenames', async () => {
    const config = {
      mode: 'simple' as const,
      provider: 'openai' as const,
      model: 'gpt-4o',
      openaiKey: 'test-key',
      contentType: 'meeting',
      language: 'en' as const,
    };

    // Test with Unicode characters
    await generatePDF('Summary', 'Transcript', config, 'Möting Reçort 🚀');

    expect(mockAnchor.download).toBe('Möting-Reçort-🚀.pdf');
    expect(mockAnchor.click).toHaveBeenCalled();
  });

  it('defaults to safe filename if empty', async () => {
    const config = {
      mode: 'simple' as const,
      provider: 'openai' as const,
      model: 'gpt-4o',
      openaiKey: 'test-key',
      contentType: 'meeting',
      language: 'en' as const,
    };

    await generatePDF('Summary', 'Transcript', config, '');

    expect(mockAnchor.download).toBe('Trammarise-Summary.pdf');
  });

  it('cleans up object URL after download', async () => {
    vi.useFakeTimers();
    const config = {
      mode: 'simple' as const,
      provider: 'openai' as const,
      model: 'gpt-4o',
      openaiKey: 'test-key',
      contentType: 'meeting',
      language: 'en' as const,
    };

    await generatePDF('Summary', 'Transcript', config, 'test');

    // Fast-forward timers
    vi.runAllTimers();

    expect(window.URL.revokeObjectURL).toHaveBeenCalledWith(mockUrl);
    vi.useRealTimers();
  });

  it('handles errors during generation', async () => {
    const error = new Error('PDF Error');
    (pdf as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      toBlob: vi.fn().mockRejectedValue(error),
    });

    const config = {
      mode: 'simple' as const,
      provider: 'openai' as const,
      model: 'gpt-4o',
      openaiKey: 'test-key',
      contentType: 'meeting',
      language: 'en' as const,
    };

    await expect(generatePDF('Summary', 'Transcript', config, 'test')).rejects.toThrow(
      'Failed to generate PDF: PDF Error'
    );
  });
});
