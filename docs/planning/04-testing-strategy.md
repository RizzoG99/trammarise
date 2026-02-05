# Testing Strategy

Comprehensive TDD approach following established patterns in the Trammarise codebase.

---

## Testing Philosophy

**Test-Driven Development (TDD) Workflow:**

1. Write test first (red)
2. Implement minimum code to pass (green)
3. Refactor while keeping tests green
4. Repeat

**Coverage Targets:**

- API routes: **80%+**
- Repository layer: **90%+**
- React components: **80%+**
- Critical paths (auth, payment): **95%+**

**Test Pyramid:**

```
        E2E (5%)
      ↗
   Integration (15%)
  ↗
Unit Tests (80%)
```

---

## Test Organization

### Describe Block Structure

**Consistent Nesting Pattern:**

```typescript
describe('ComponentName', () => {
  // Shared setup
  const defaultProps = { ... };
  const mockHandler = vi.fn();

  beforeEach(() => {
    mockHandler.mockClear();
  });

  describe('Rendering', () => {
    it('renders correctly', () => {});
    it('renders with props', () => {});
  });

  describe('Interactions', () => {
    it('handles clicks', () => {});
    it('handles keyboard events', () => {});
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {});
    it('supports keyboard navigation', () => {});
  });

  describe('Edge Cases', () => {
    it('handles empty values', () => {});
    it('handles very long values', () => {});
  });

  describe('State Updates', () => {
    it('updates on prop change', () => {});
  });
});
```

---

## API Route Testing

### Pattern: Test BEFORE Implementation

**File Structure:**

```
api/
├── sessions/
│   ├── create.ts              # Implementation
│   └── __tests__/
│       └── create.test.ts     # Tests
```

### Example: Session Creation Endpoint

```typescript
// api/__tests__/sessions/create.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createMockRequest, createMockResponse } from '@/test/utils/api-mocks';
import handler from '../../sessions/create';

describe('POST /api/sessions/create', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock Clerk auth
    vi.mock('@clerk/nextjs/server', () => ({
      auth: vi.fn().mockReturnValue({ userId: 'user_123' }),
    }));

    // Mock Supabase
    vi.mock('@/lib/supabase/admin', () => ({
      supabaseAdmin: {
        from: vi.fn().mockReturnThis(),
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: 'uuid', session_id: 'test-123' },
              error: null,
            }),
          }),
        }),
      },
    }));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Successful Creation', () => {
    it('should create session for authenticated user', async () => {
      const req = createMockRequest({
        method: 'POST',
        body: {
          sessionId: 'test-123',
          audioName: 'interview.mp3',
          fileSizeBytes: 1024000,
          language: 'en',
          contentType: 'interview',
        },
        headers: {
          authorization: 'Bearer valid-token',
        },
      });
      const res = createMockResponse();

      await handler(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          session_id: 'test-123',
        })
      );
    });

    it('should handle optional fields correctly', async () => {
      const req = createMockRequest({
        method: 'POST',
        body: {
          sessionId: 'test-123',
          audioName: 'test.mp3',
          fileSizeBytes: 1000,
          language: 'en',
          contentType: 'meeting',
          noiseProfile: 'cafe', // Optional
          regionStart: 10.5,    // Optional
        },
      });
      const res = createMockResponse();

      await handler(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
    });
  });

  describe('Authentication', () => {
    it('should return 401 for unauthenticated requests', async () => {
      vi.mocked(auth).mockReturnValue({ userId: null });

      const req = createMockRequest({
        method: 'POST',
        body: { sessionId: 'test-123' },
      });
      const res = createMockResponse();

      await handler(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
    });

    it('should return 404 if user not in database', async () => {
      vi.mocked(supabaseAdmin.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { message: 'User not found' },
            }),
          }),
        }),
      } as any);

      const req = createMockRequest({ method: 'POST', body: {} });
      const res = createMockResponse();

      await handler(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe('Validation', () => {
    it('should validate required fields', async () => {
      const req = createMockRequest({
        method: 'POST',
        body: {
          // Missing required fields
        },
      });
      const res = createMockResponse();

      await handler(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Missing required fields',
      });
    });

    it('should reject invalid language codes', async () => {
      const req = createMockRequest({
        method: 'POST',
        body: {
          sessionId: 'test-123',
          audioName: 'test.mp3',
          language: 'invalid', // Not ISO 639-1
        },
      });
      const res = createMockResponse();

      await handler(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should reject file size > 500MB', async () => {
      const req = createMockRequest({
        method: 'POST',
        body: {
          sessionId: 'test-123',
          fileSizeBytes: 600 * 1024 * 1024, // 600MB
        },
      });
      const res = createMockResponse();

      await handler(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      vi.mocked(supabaseAdmin.from).mockReturnValue({
        insert: vi.fn().mockRejectedValue(new Error('DB connection failed')),
      } as any);

      const req = createMockRequest({
        method: 'POST',
        body: { sessionId: 'test-123', ... },
      });
      const res = createMockResponse();

      await handler(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Failed to create session',
      });
    });
  });

  describe('Method Validation', () => {
    it('should reject non-POST requests', async () => {
      const req = createMockRequest({ method: 'GET' });
      const res = createMockResponse();

      await handler(req, res);

      expect(res.status).toHaveBeenCalledWith(405);
    });
  });
});
```

### Test Utilities

```typescript
// test/utils/api-mocks.ts
export function createMockRequest(options: {
  method: string;
  body?: any;
  headers?: Record<string, string>;
  query?: Record<string, string>;
}): VercelRequest {
  return {
    method: options.method,
    body: options.body || {},
    headers: options.headers || {},
    query: options.query || {},
  } as VercelRequest;
}

export function createMockResponse(): VercelResponse {
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
    send: vi.fn().mockReturnThis(),
  };
  return res as any;
}
```

---

## Repository Testing

### Pattern: Mock fetch, Test Logic

```typescript
// src/repositories/__tests__/SessionRepository.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { sessionRepository } from '../SessionRepository';

describe('SessionRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('create()', () => {
    it('should create session via API', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          id: 'uuid-123',
          session_id: 'test-123',
          audio_name: 'test.mp3',
        }),
      });
      global.fetch = mockFetch;

      const result = await sessionRepository.create({
        sessionId: 'test-123',
        audioName: 'test.mp3',
        fileSizeBytes: 1024,
        language: 'en',
        contentType: 'meeting',
      });

      expect(result.session_id).toBe('test-123');
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/sessions/create',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: 'test-123',
            audioName: 'test.mp3',
            fileSizeBytes: 1024,
            language: 'en',
            contentType: 'meeting',
          }),
        })
      );
    });

    it('should throw error on API failure', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
      });
      global.fetch = mockFetch;

      await expect(
        sessionRepository.create({ sessionId: 'test' })
      ).rejects.toThrow('Failed to create session');
    });
  });

  describe('get()', () => {
    it('should fetch session by ID', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ session_id: 'test-123', ... }),
      });
      global.fetch = mockFetch;

      const result = await sessionRepository.get('test-123');

      expect(result?.session_id).toBe('test-123');
      expect(mockFetch).toHaveBeenCalledWith('/api/sessions/test-123');
    });

    it('should return null for 404', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
      });
      global.fetch = mockFetch;

      const result = await sessionRepository.get('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('list()', () => {
    it('should fetch user sessions with pagination', async () => {
      const mockSessions = [
        { session_id: '1', audio_name: 'test1.mp3' },
        { session_id: '2', audio_name: 'test2.mp3' },
      ];

      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockSessions,
      });
      global.fetch = mockFetch;

      const result = await sessionRepository.list(20, 0);

      expect(result).toHaveLength(2);
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/sessions/list?limit=20&offset=0'
      );
    });
  });
});
```

---

## Component Testing

### Pattern: Render, Interact, Assert

```typescript
// src/app/routes/__tests__/PricingPage.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PricingPage } from '../PricingPage';
import { SubscriptionProvider } from '@/context/SubscriptionContext';

describe('PricingPage', () => {
  const renderWithProviders = (ui: React.ReactElement) => {
    return render(
      <SubscriptionProvider>{ui}</SubscriptionProvider>
    );
  };

  describe('Rendering', () => {
    it('should render three pricing tiers', () => {
      renderWithProviders(<PricingPage />);

      expect(screen.getByText('Free')).toBeInTheDocument();
      expect(screen.getByText('Pro')).toBeInTheDocument();
      expect(screen.getByText('Team')).toBeInTheDocument();
    });

    it('should display feature lists for each tier', () => {
      renderWithProviders(<PricingPage />);

      expect(screen.getByText('BYOK API keys')).toBeInTheDocument();
      expect(screen.getByText('500 minutes/month')).toBeInTheDocument();
      expect(screen.getByText('2000 minutes/month')).toBeInTheDocument();
    });

    it('should show current plan badge', () => {
      // Mock useSubscription to return 'pro'
      vi.mock('@/context/SubscriptionContext', () => ({
        useSubscription: () => ({ subscription: { tier: 'pro' } }),
      }));

      renderWithProviders(<PricingPage />);

      expect(screen.getByText('Current Plan')).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('should call Stripe checkout on upgrade click', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ url: 'https://checkout.stripe.com/session_123' }),
      });
      global.fetch = mockFetch;

      // Mock window.location.href
      delete window.location;
      window.location = { href: '' } as any;

      renderWithProviders(<PricingPage />);

      const upgradeButton = screen.getByText('Upgrade to Pro');
      fireEvent.click(upgradeButton);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          '/api/stripe/create-checkout-session',
          expect.objectContaining({
            method: 'POST',
            body: JSON.stringify({ tier: 'pro', interval: 'month' }),
          })
        );
        expect(window.location.href).toBe('https://checkout.stripe.com/session_123');
      });
    });

    it('should toggle between monthly and annual pricing', () => {
      renderWithProviders(<PricingPage />);

      const toggle = screen.getByRole('switch', { name: /billing cycle/i });
      expect(screen.getByText('$19/month')).toBeInTheDocument();

      fireEvent.click(toggle);

      expect(screen.getByText('$180/year')).toBeInTheDocument();
      expect(screen.getByText('Save 21%')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading structure', () => {
      renderWithProviders(<PricingPage />);

      const headings = screen.getAllByRole('heading');
      expect(headings[0]).toHaveTextContent('Pricing');
      expect(headings).toHaveLength(4); // Page title + 3 tiers
    });

    it('should support keyboard navigation', () => {
      renderWithProviders(<PricingPage />);

      const upgradeButton = screen.getByText('Upgrade to Pro');
      upgradeButton.focus();

      expect(upgradeButton).toHaveFocus();

      // Press Tab to move to next button
      fireEvent.keyDown(upgradeButton, { key: 'Tab' });

      const teamButton = screen.getByText('Upgrade to Team');
      expect(teamButton).toHaveFocus();
    });
  });

  describe('Edge Cases', () => {
    it('should handle Stripe API errors gracefully', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
      });
      global.fetch = mockFetch;

      renderWithProviders(<PricingPage />);

      const upgradeButton = screen.getByText('Upgrade to Pro');
      fireEvent.click(upgradeButton);

      await waitFor(() => {
        expect(screen.getByText('Payment failed. Please try again.')).toBeInTheDocument();
      });
    });

    it('should disable upgrade button while loading', async () => {
      const mockFetch = vi.fn(() => new Promise(() => {})); // Never resolves
      global.fetch = mockFetch;

      renderWithProviders(<PricingPage />);

      const upgradeButton = screen.getByText('Upgrade to Pro');
      fireEvent.click(upgradeButton);

      expect(upgradeButton).toBeDisabled();
      expect(screen.getByText('Processing...')).toBeInTheDocument();
    });
  });
});
```

---

## Integration Testing

### Example: Auth + Session Flow

```typescript
// test/integration/auth-session.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { App } from '@/App';

describe('Authentication + Session Integration', () => {
  beforeEach(() => {
    // Mock Clerk
    vi.mock('@clerk/clerk-react', () => ({
      useAuth: () => ({ isSignedIn: true, userId: 'user_123' }),
      useUser: () => ({ user: { id: 'user_123', email: 'test@example.com' } }),
    }));

    // Mock fetch for API calls
    global.fetch = vi.fn();
  });

  it('should create and persist session for authenticated user', async () => {
    const mockFetch = vi.fn()
      .mockResolvedValueOnce({ // Session create
        ok: true,
        json: async () => ({ session_id: 'test-123' }),
      })
      .mockResolvedValueOnce({ // Session list
        ok: true,
        json: async () => [{ session_id: 'test-123', audio_name: 'test.mp3' }],
      });

    global.fetch = mockFetch;

    render(<App />);

    // Upload audio
    const fileInput = screen.getByLabelText(/upload audio/i);
    const file = new File(['audio data'], 'test.mp3', { type: 'audio/mp3' });
    fireEvent.change(fileInput, { target: { files: [file] } });

    // Configure and start
    fireEvent.click(screen.getByText('Start Processing'));

    await waitFor(() => {
      // Verify session created via API
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/sessions/create',
        expect.objectContaining({ method: 'POST' })
      );
    });

    // Navigate to history
    fireEvent.click(screen.getByText('History'));

    await waitFor(() => {
      // Verify session appears in list
      expect(screen.getByText('test.mp3')).toBeInTheDocument();
    });
  });
});
```

---

## End-to-End Testing (Playwright)

### Example: Full User Journey

```typescript
// tests/e2e/subscription-upgrade.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Subscription Upgrade Flow', () => {
  test('should upgrade from Free to Pro', async ({ page }) => {
    // Sign in (use test account)
    await page.goto('/');
    await page.click('text=Sign In');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'Test123!');
    await page.click('button[type="submit"]');

    // Navigate to pricing
    await page.click('text=Pricing');
    await expect(page).toHaveURL('/pricing');

    // Click upgrade
    await page.click('text=Upgrade to Pro');

    // Stripe Checkout opens in new tab (mock in test mode)
    await expect(page).toHaveURL(/checkout\.stripe\.com/);

    // Fill Stripe form (test mode)
    await page.fill('[name="cardNumber"]', '4242424242424242');
    await page.fill('[name="cardExpiry"]', '12/34');
    await page.fill('[name="cardCvc"]', '123');
    await page.click('button:text("Pay")');

    // Redirected back to app
    await expect(page).toHaveURL('/settings?success=true');
    await expect(page.locator('text=Upgrade successful')).toBeVisible();

    // Verify tier badge
    await expect(page.locator('text=Pro')).toBeVisible();

    // Verify usage dashboard
    await page.click('text=Dashboard');
    await expect(page.locator('text=0 / 500 minutes used')).toBeVisible();
  });

  test('should enforce quota for free users', async ({ page }) => {
    // Sign in as free user
    await page.goto('/');
    await page.click('text=Sign In');
    // ... login

    // Upload 11th audio (exceeds free limit of 10)
    for (let i = 0; i < 11; i++) {
      await page.setInputFiles('input[type="file"]', `test-audio-${i}.mp3');
      await page.click('text=Start Processing');
      await page.waitForSelector('text=Processing complete');
    }

    // 11th upload should show upgrade prompt
    await expect(page.locator('text=Monthly limit reached')).toBeVisible();
    await expect(page.locator('text=Upgrade to Pro')).toBeVisible();
  });
});
```

---

## Test Commands

```bash
# Frontend tests
npm test                          # Run all tests
npm test SessionRepository        # Run specific file
npm run test:ui                   # Vitest UI dashboard
npm run test:coverage             # Coverage report
npm test -- --watch               # Watch mode

# Backend/API tests
npm run api-test                  # Run all API tests
npm run api-test:watch            # Watch mode
npm run api-test:coverage         # Coverage report

# E2E tests
npm run test:e2e                  # Playwright tests
npm run test:e2e:ui               # Playwright UI mode
npm run test:e2e:debug            # Debug mode

# All tests
npm run test:all                  # Run frontend + backend + e2e
```

---

## Coverage Reports

### Viewing Coverage

```bash
npm run test:coverage
# Opens: coverage/index.html
```

### Coverage Thresholds

```json
// vitest.config.ts
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      thresholds: {
        global: {
          statements: 80,
          branches: 80,
          functions: 80,
          lines: 80,
        },
      },
    },
  },
});
```

---

## Continuous Integration

### GitHub Actions Workflow

```yaml
# .github/workflows/test.yml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 20

      - name: Install dependencies
        run: npm ci

      - name: Run linter
        run: npm run lint

      - name: Run frontend tests
        run: npm test -- --coverage

      - name: Run API tests
        run: npm run api-test -- --coverage

      - name: Run E2E tests
        run: npm run test:e2e

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
```

---

**This testing strategy ensures high code quality, prevents regressions, and supports confident refactoring throughout the project lifecycle.**
