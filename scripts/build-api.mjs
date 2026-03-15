/**
 * Pre-bundle Vercel serverless API functions with esbuild.
 *
 * Why: Vercel's default TypeScript handler is transpile-only (strips types,
 * keeps `import` statements). Node.js then fails to load the file because:
 * - Without "type":"module" → CJS loader rejects `import` syntax
 * - With "type":"module" → ESM requires explicit .js extensions on relative imports
 *
 * Fix: esbuild bundles each function entry point into a single self-contained
 * CJS file in api-dist/, inlining all relative helpers (_providers/, _middleware/,
 * _utils/, _lib/, _types/) while keeping npm packages as require() calls.
 */

import * as esbuild from 'esbuild';

const entryPoints = [
  'api/validate-key.ts',
  'api/chat.ts',
  'api/summarize.ts',
  'api/transcribe.ts',
  'api/audio/[sessionId].ts',
  'api/credits/purchase.ts',
  'api/stripe/create-checkout-session.ts',
  'api/transcribe-job/[jobId]/cancel.ts',
  'api/transcribe-job/[jobId]/status.ts',
  'api/user-settings/api-key.ts',
  'api/webhooks/stripe.ts',
];

await esbuild.build({
  entryPoints,
  bundle: true,
  platform: 'node',
  target: 'node20',
  format: 'cjs',
  outdir: 'api',
  outbase: 'api',
  // Keep all npm packages external (resolved from node_modules at runtime).
  // Only local relative imports get inlined — that's the whole point.
  packages: 'external',
});

console.log('API bundles compiled to api/');
