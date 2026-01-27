#!/usr/bin/env node

/**
 * Sitemap Generator for Trammarise
 *
 * Generates a sitemap.xml file with all static routes.
 * Run with: node scripts/generate-sitemap.js
 */

import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const DOMAIN = 'https://trammarise.app';
const OUTPUT_PATH = join(__dirname, '../public/sitemap.xml');

// Define static routes
const routes = [
  {
    path: '/',
    priority: '1.0',
    changefreq: 'weekly',
  },
  {
    path: '/setup',
    priority: '0.8',
    changefreq: 'monthly',
  },
  {
    path: '/audio-editing',
    priority: '0.7',
    changefreq: 'monthly',
  },
];

/**
 * Generate XML sitemap content
 */
function generateSitemap() {
  const lastmod = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

  const urls = routes.map(route => `  <url>
    <loc>${DOMAIN}${route.path}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
}

/**
 * Write sitemap to file
 */
function writeSitemap() {
  try {
    const sitemap = generateSitemap();
    writeFileSync(OUTPUT_PATH, sitemap, 'utf-8');
    console.log('✅ Sitemap generated successfully at:', OUTPUT_PATH);
    console.log(`📄 Total routes: ${routes.length}`);
  } catch (error) {
    console.error('❌ Failed to generate sitemap:', error);
    process.exit(1);
  }
}

// Run the generator
writeSitemap();
