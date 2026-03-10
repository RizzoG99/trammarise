import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { AppFooter } from './AppFooter';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: Record<string, unknown>) => {
      if (key === 'footer.copyright') {
        return `© ${opts?.year} Trammarise. All rights reserved.`;
      }
      return key;
    },
  }),
}));

const renderFooter = () =>
  render(
    <BrowserRouter>
      <AppFooter />
    </BrowserRouter>
  );

describe('AppFooter', () => {
  it('renders logo link pointing to /', () => {
    renderFooter();
    const logoLink = screen.getByRole('link', { name: /trammarise/i });
    expect(logoLink).toHaveAttribute('href', '/');
  });

  it('renders current year in copyright', () => {
    renderFooter();
    const year = new Date().getFullYear();
    expect(screen.getByText(new RegExp(String(year)))).toBeInTheDocument();
  });

  it('renders Privacy link', () => {
    renderFooter();
    expect(screen.getByRole('link', { name: 'footer.links.privacy' })).toBeInTheDocument();
  });

  it('renders Terms link', () => {
    renderFooter();
    expect(screen.getByRole('link', { name: 'footer.links.terms' })).toBeInTheDocument();
  });

  it('renders GitHub social link', () => {
    renderFooter();
    expect(screen.getByRole('link', { name: 'footer.social.github' })).toBeInTheDocument();
  });

  it('renders LinkedIn social link', () => {
    renderFooter();
    expect(screen.getByRole('link', { name: 'footer.social.linkedin' })).toBeInTheDocument();
  });

  it('renders Twitter social link', () => {
    renderFooter();
    expect(screen.getByRole('link', { name: 'footer.social.twitter' })).toBeInTheDocument();
  });

  it('renders contact email link', () => {
    renderFooter();
    expect(screen.getByRole('link', { name: 'footer.social.contact' })).toBeInTheDocument();
  });
});
