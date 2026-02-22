#7 In-memory rate limiter — The current rate limiter resets on every cold start (serverless), making it ineffective in production. The fix requires Upstash
Redis (a new dependency + infrastructure decision), which is a larger change than a bug fix and deserves its own PR with proper setup and testing.

#12 PRICE_IDS falsy guard — The existing code already has !priceId checks downstream. Adding another guard would be redundant. Unlike Fix #3 (empty-string
key collision which was a real bug), this is purely cosmetic.

#13 Eager locale imports — This is a performance optimization for i18n bundle size, not a correctness issue. It doesn't matter at current scale and the
change pattern (dynamic import()) is better addressed when the locale file list is stable.

#14 ContentTypeSelector unsafe cast — A type assertion that's technically unsafe but works correctly at runtime because the values are controlled. Minor
enough to not risk introducing regressions alongside the other changes.

#15 RecordPanel a11y — Accessibility fix (missing ARIA attributes or similar). Correct to fix, but not a blocker for merging, and bundling a11y fixes with
security/correctness fixes makes the diff harder to review.
