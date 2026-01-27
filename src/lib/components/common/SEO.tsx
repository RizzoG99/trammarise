import { useMemo } from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title: string;
  description: string;
  canonical?: string;
  image?: string;
  type?: 'website' | 'article';
}

/**
 * SEO Component
 *
 * Manages document head metadata for SEO optimization including:
 * - Page title and description
 * - Open Graph tags for social sharing
 * - Twitter Card tags
 * - JSON-LD structured data
 * - Canonical URLs
 */
export function SEO({
  title,
  description,
  canonical,
  image = 'https://trammarise.app/og-image.png',
  type = 'website',
}: SEOProps) {
  const fullTitle = title.includes('Trammarise') ? title : `${title} - Trammarise`;
  const url = canonical || 'https://trammarise.app';

  // Structured data for search engines
  // Structured data for search engines
  const structuredData = useMemo(
    () => ({
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'Trammarise',
      description,
      url,
      applicationCategory: 'BusinessApplication',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
    }),
    [description, url]
  );

  return (
    <Helmet>
      {/* Basic meta tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {canonical && <link rel="canonical" href={canonical} />}

      {/* Open Graph tags */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />
      <meta property="og:image" content={image} />

      {/* Twitter Card tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* JSON-LD Structured Data - Only on homepage */}
      {canonical === 'https://trammarise.app/' && (
        <script type="application/ld+json" id="trammarise-jsonld">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
}
