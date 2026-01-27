# SEO Optimization Plan

## Overview

Optimize the SEO implementation to resolve duplicated structured data issues and improve performance by lazy-loading the SEO component on non-critical pages.

## Proposed Strategy

### 1. Library Components

**Target:** `src/lib/components/common/SEO.tsx`

- Memoize `structuredData` object.
- Add specific `id` to the JSON-LD script tag to ensure `react-helmet-async` deduplicates it correctly.

### 2. Page-Level Optimizations

#### Audio Editing Page (`src/app/routes/AudioEditingPage.tsx`)

- Implement lazy loading for the `SEO` component.
- This is a non-critical page for initial SEO indexing, so lazy loading improves TTI without hurting SEO.

#### Api Key Setup Page (`src/pages/ApiKeySetupPage.tsx`)

- Lazy load `SEO` component.

#### Upload/Record Page (`src/app/routes/UploadRecordPage.tsx`)

- Keep eager loading as this is the landing page and critical for SEO.

## Verification

- Verify `<script type="application/ld+json">` uniqueness on Homepage.
- Verify lazy loading behavior on Audio Editing page via Network tab.
