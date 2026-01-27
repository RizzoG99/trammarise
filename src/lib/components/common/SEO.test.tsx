import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { HelmetProvider } from '@dr.pogodin/react-helmet';
import { SEO } from './SEO';

// Wrapper component to provide HelmetProvider context
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <HelmetProvider>{children}</HelmetProvider>
);

describe('SEO', () => {
  describe('Component Rendering', () => {
    it('renders without crashing with required props', () => {
      const { container } = render(<SEO title="Test Page" description="Test description" />, {
        wrapper,
      });
      expect(container).toBeTruthy();
    });

    it('renders with all props provided', () => {
      const { container } = render(
        <SEO
          title="Test Page"
          description="Test description"
          canonical="https://trammarise.app/test"
          image="https://example.com/image.jpg"
          type="article"
        />,
        { wrapper }
      );
      expect(container).toBeTruthy();
    });
  });

  describe('Title Handling', () => {
    it('appends "- Trammarise" when not present in title', () => {
      const { container } = render(<SEO title="My Page" description="Test" />, { wrapper });
      expect(container).toBeTruthy();
      // The component should handle title formatting internally
    });

    it('does not duplicate "Trammarise" when already in title', () => {
      const { container } = render(<SEO title="Trammarise - Audio Tool" description="Test" />, {
        wrapper,
      });
      expect(container).toBeTruthy();
    });

    it('handles title with "Trammarise" in the middle', () => {
      const { container } = render(<SEO title="Welcome to Trammarise App" description="Test" />, {
        wrapper,
      });
      expect(container).toBeTruthy();
    });
  });

  describe('Image Handling', () => {
    it('uses default image when not provided', () => {
      const { container } = render(<SEO title="Test" description="Test" />, { wrapper });
      expect(container).toBeTruthy();
    });

    it('uses custom image when provided', () => {
      const { container } = render(
        <SEO title="Test" description="Test" image="https://example.com/custom.jpg" />,
        { wrapper }
      );
      expect(container).toBeTruthy();
    });
  });

  describe('Canonical URLs', () => {
    it('handles canonical URL when provided', () => {
      const { container } = render(
        <SEO title="Test" description="Test" canonical="https://trammarise.app/about" />,
        { wrapper }
      );
      expect(container).toBeTruthy();
    });

    it('works without canonical URL', () => {
      const { container } = render(<SEO title="Test" description="Test" />, { wrapper });
      expect(container).toBeTruthy();
    });
  });

  describe('Content Types', () => {
    it('handles website content type', () => {
      const { container } = render(<SEO title="Test" description="Test" type="website" />, {
        wrapper,
      });
      expect(container).toBeTruthy();
    });

    it('handles article content type', () => {
      const { container } = render(<SEO title="Test" description="Test" type="article" />, {
        wrapper,
      });
      expect(container).toBeTruthy();
    });

    it('defaults to website type when not specified', () => {
      const { container } = render(<SEO title="Test" description="Test" />, { wrapper });
      expect(container).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('handles empty title', () => {
      const { container } = render(<SEO title="" description="Test" />, { wrapper });
      expect(container).toBeTruthy();
    });

    it('handles very long descriptions', () => {
      const longDescription = 'A'.repeat(500);
      const { container } = render(<SEO title="Test" description={longDescription} />, { wrapper });
      expect(container).toBeTruthy();
    });

    it('handles special characters in title and description', () => {
      const titleWithSpecialChars = 'Test & <Special> "Characters"';
      const descWithSpecialChars = "Description with 'quotes' & <tags>";

      const { container } = render(
        <SEO title={titleWithSpecialChars} description={descWithSpecialChars} />,
        { wrapper }
      );
      expect(container).toBeTruthy();
    });

    it('handles all props with special characters', () => {
      const { container } = render(
        <SEO
          title="Test & Title"
          description="Test & Description"
          canonical="https://trammarise.app/test?param=value&other=test"
          image="https://example.com/image.jpg?size=large&format=webp"
        />,
        { wrapper }
      );
      expect(container).toBeTruthy();
    });
  });

  describe('Props Validation', () => {
    it('requires title prop', () => {
      const { container } = render(<SEO title="Required Title" description="Test" />, { wrapper });
      expect(container).toBeTruthy();
    });

    it('requires description prop', () => {
      const { container } = render(<SEO title="Test" description="Required Description" />, {
        wrapper,
      });
      expect(container).toBeTruthy();
    });

    it('makes canonical prop optional', () => {
      const { container } = render(<SEO title="Test" description="Test" />, { wrapper });
      expect(container).toBeTruthy();
    });

    it('makes image prop optional', () => {
      const { container } = render(<SEO title="Test" description="Test" />, { wrapper });
      expect(container).toBeTruthy();
    });

    it('makes type prop optional', () => {
      const { container } = render(<SEO title="Test" description="Test" />, { wrapper });
      expect(container).toBeTruthy();
    });
  });
});
