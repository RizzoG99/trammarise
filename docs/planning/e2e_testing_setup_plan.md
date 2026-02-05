# E2E Testing Setup Plan

## Overview

This document outlines the plan for implementing comprehensive End-to-End (E2E) testing for the Trammarise application using Playwright. E2E tests will validate critical user flows and catch integration issues that unit tests miss.

## Why E2E Tests?

E2E tests are essential for validating:

- **Session creation and persistence** - Ensure audio uploads create sessions correctly
- **Storage migration scenarios** - Verify data migration from sessionStorage to localStorage
- **Bulk operations** - Test batch deletion with partial failure handling
- **UI interactions** - Validate multi-component workflows
- **Cross-browser compatibility** - Ensure consistent behavior across browsers

## Technology Choice: Playwright

### Why Playwright over Cypress?

| Feature            | Playwright                 | Cypress                  |
| ------------------ | -------------------------- | ------------------------ |
| TypeScript Support | ✅ Excellent               | ⚠️ Good                  |
| Multi-browser      | ✅ Chrome, Firefox, Safari | ⚠️ Chrome, Firefox only  |
| Parallel Execution | ✅ Built-in                | ⚠️ Requires paid plan    |
| CI/CD Integration  | ✅ Excellent               | ✅ Good                  |
| Debugging Tools    | ✅ Inspector, trace viewer | ✅ Time-travel debugging |
| Learning Curve     | ⚠️ Moderate                | ✅ Easy                  |

**Decision:** Playwright for better TypeScript integration and multi-browser support.

## Implementation Plan

### Phase 1: Setup and Configuration

#### 1.1 Install Dependencies

```bash
npm install -D @playwright/test
npx playwright install
```

#### 1.2 Create Directory Structure

```
e2e/
├── fixtures/
│   ├── test-audio.wav           # Sample audio file (1-2 seconds)
│   ├── test-audio-large.wav     # Larger file for performance tests
│   └── test-context.pdf         # Sample context file
├── tests/
│   ├── history/
│   │   ├── session-creation.spec.ts
│   │   ├── session-deletion.spec.ts
│   │   ├── bulk-operations.spec.ts
│   │   └── filtering.spec.ts
│   ├── upload/
│   │   ├── audio-upload.spec.ts
│   │   └── context-upload.spec.ts
│   └── storage/
│       ├── migration.spec.ts
│       └── quota-warnings.spec.ts
├── utils/
│   ├── test-helpers.ts          # Shared test utilities
│   └── mock-data.ts             # Test data generators
└── playwright.config.ts
```

#### 1.3 Configure Playwright

**playwright.config.ts:**

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e/tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});
```

### Phase 2: Core Test Implementation

#### 2.1 History Session Tests

**Priority: HIGH**

**session-creation.spec.ts:**

- Upload audio file
- Verify session appears in history
- Check metadata accuracy
- Validate persistence after refresh

**session-deletion.spec.ts:**

- Delete single session
- Verify removal from UI
- Confirm IndexedDB cleanup
- Test undo functionality (if implemented)

**bulk-operations.spec.ts:**

- Select multiple sessions
- Bulk delete with all successes
- Bulk delete with partial failures
- Verify ghost selection handling

**filtering.spec.ts:**

- Filter by content type
- Filter by language
- Search by name
- Combine multiple filters

#### 2.2 Upload Flow Tests

**Priority: MEDIUM**

**audio-upload.spec.ts:**

- Upload valid audio file
- Upload invalid file type
- Upload oversized file
- Cancel upload mid-process

**context-upload.spec.ts:**

- Upload context documents
- Upload context images
- Multiple context files
- Remove context files

#### 2.3 Storage Tests

**Priority: MEDIUM**

**migration.spec.ts:**

- Simulate sessionStorage data
- Trigger migration
- Verify localStorage migration
- Confirm sessionStorage cleanup

**quota-warnings.spec.ts:**

- Mock storage quota API
- Trigger warning thresholds
- Test cleanup functionality
- Verify warning dismissal

### Phase 3: Test Utilities

#### 3.1 Helper Functions

**test-helpers.ts:**

```typescript
import { Page } from '@playwright/test';

export async function uploadAudioFile(page: Page, filePath: string) {
  await page.setInputFiles('input[type="file"]', filePath);
  await page.waitForSelector('.upload-success');
}

export async function navigateToHistory(page: Page) {
  await page.click('a[href="/history"]');
  await page.waitForURL('**/history');
}

export async function selectSession(page: Page, sessionName: string) {
  await page.click(`[data-session-name="${sessionName}"] input[type="checkbox"]`);
}

export async function clearLocalStorage(page: Page) {
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
}
```

#### 3.2 Mock Data Generators

**mock-data.ts:**

```typescript
export function generateMockSession(overrides = {}) {
  return {
    sessionId: `test-${Date.now()}`,
    audioName: 'test-audio.wav',
    contentType: 'meeting',
    language: 'en',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    ...overrides,
  };
}
```

### Phase 4: CI/CD Integration

#### 4.1 GitHub Actions Workflow

**.github/workflows/e2e-tests.yml:**

```yaml
name: E2E Tests

on:
  pull_request:
    branches: [main, develop]
  push:
    branches: [main]

jobs:
  test:
    timeout-minutes: 10
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright Browsers
        run: npx playwright install --with-deps

      - name: Run E2E tests
        run: npm run test:e2e

      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30
```

#### 4.2 Package.json Scripts

```json
{
  "scripts": {
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:debug": "playwright test --debug",
    "test:e2e:report": "playwright show-report"
  }
}
```

## Test Coverage Goals

### Critical Paths (Must Have)

- ✅ Session creation flow
- ✅ Session deletion (single and bulk)
- ✅ History filtering and search
- ✅ Storage migration

### Important Paths (Should Have)

- ⏳ Audio upload validation
- ⏳ Context file handling
- ⏳ Storage quota warnings
- ⏳ Error state handling

### Nice to Have

- ⏳ Multi-language support
- ⏳ Dark mode toggle
- ⏳ Export functionality
- ⏳ Keyboard navigation

## Success Metrics

- **Coverage:** >80% of critical user flows
- **Reliability:** <5% flaky test rate
- **Performance:** <5 minutes total execution time
- **Maintenance:** <10% test update rate per feature change

## Timeline Estimate

| Phase             | Duration     | Effort     |
| ----------------- | ------------ | ---------- |
| Setup & Config    | 2 hours      | Low        |
| Core Tests        | 8 hours      | Medium     |
| Utilities         | 2 hours      | Low        |
| CI/CD Integration | 2 hours      | Low        |
| **Total**         | **14 hours** | **Medium** |

## Risks and Mitigations

| Risk                  | Impact | Mitigation                                         |
| --------------------- | ------ | -------------------------------------------------- |
| Flaky tests           | High   | Use proper wait strategies, avoid hardcoded delays |
| Slow execution        | Medium | Run tests in parallel, optimize fixtures           |
| Maintenance burden    | Medium | Keep tests DRY, use page object pattern            |
| Browser compatibility | Low    | Test on all major browsers in CI                   |

## Next Steps

1. **Immediate:** Install Playwright and create basic config
2. **Week 1:** Implement history session tests
3. **Week 2:** Add upload and storage tests
4. **Week 3:** CI/CD integration and documentation
5. **Ongoing:** Expand coverage as new features are added

## References

- [Playwright Documentation](https://playwright.dev/)
- [Best Practices Guide](https://playwright.dev/docs/best-practices)
- [CI/CD Integration](https://playwright.dev/docs/ci)

---

**Status:** 📋 Planning Complete - Ready for Implementation  
**Owner:** TBD  
**Last Updated:** 2026-02-05
