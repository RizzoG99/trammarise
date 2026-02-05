# Authentication, Database & Monetization Implementation Plan

## Executive Summary

Transform Trammarise from a client-only BYOK (Bring Your Own Key) application into a full SaaS platform with user authentication, server-side persistence, cross-device sync, and tiered monetization. This unified plan addresses all four phases as a sequential implementation due to strong dependencies between components.

**Timeline:** 13 weeks total (MVP after 6 weeks)
**Target:** Individual professionals (journalists, researchers, consultants)
**Business Model:** Free BYOK → Pro (€19/mo, 500 min) → Team (€49/mo, 2000 min)

---

## Dependency Analysis: Why One Unified Plan?

```
Phase 1: Foundation (Auth + Database)
   ↓ (REQUIRED)
Phase 2: Monetization (Stripe + Usage Tracking)
   ↓ (REQUIRED for gating)
Phase 3: Value Features (Speaker ID, Multi-lang, Integrations)
   ↓ (OPTIONAL but needs Phase 1)
Phase 4: Engagement (Analytics, Search, Notifications)
```

**Core Dependencies:**

- **Phase 2 depends on Phase 1:** Cannot implement subscriptions without user accounts
- **Phase 3 depends on Phase 2:** Premium features need tier enforcement to gate access
- **Phase 4 depends on Phase 1:** Analytics/search require database with user sessions

**Conclusion:** Sequential implementation required. This is a single, unified plan with clear phase gates.

---

## Architecture Decisions

### 1. Authentication Strategy: Clerk + Supabase ✅

**Rationale:**

- **Clerk:** Pre-built auth UI, JWT management, social login, MFA support
- **Supabase:** PostgreSQL with Row-Level Security, real-time subscriptions, generous free tier
- **Time to Market:** 1-2 weeks vs 3-4 weeks with custom NextAuth + Prisma
- **Cost:** $0 (free tiers) → $50/month (both Pro plans)

**Alternative Considered:**

- Custom NextAuth + Prisma: More control, but slower and higher maintenance

**Decision:** Use Clerk + Supabase for Phases 1-2. Can migrate later if needed.

---

### 2. API Authentication Flow: JWT in Headers

**Current State:**

- API keys passed in request body (`formData.append('apiKey', apiKey)`)
- No user identification
- No rate limiting per user

**New Architecture:**

```typescript
// Middleware: /api/middleware/auth.ts
import { auth } from '@clerk/nextjs/server';

export async function requireAuth(req: VercelRequest) {
  const { userId } = auth(); // Clerk JWT validation
  if (!userId) throw new AuthError('Unauthorized', 401);

  // Fetch user from Supabase
  const user = await supabaseAdmin.from('users').select('id').eq('clerk_user_id', userId).single();

  return { userId: user.data.id, clerkId: userId };
}

// Usage in API routes
export default async function handler(req, res) {
  const { userId } = await requireAuth(req); // Throws if invalid
  // ... proceed with authenticated logic
}
```

**Backward Compatibility:**

```typescript
// Support both authenticated AND BYOK users
try {
  const { userId } = await requireAuth(req);
  // Authenticated: save to database
} catch (error) {
  const { apiKey } = req.body;
  if (!apiKey) return res.status(401).json({ error: 'Auth or API key required' });
  // BYOK mode: no database persistence
}
```

---

### 3. Database Schema

See `database-schema.md` for complete SQL schema with:

- Users table (synced from Clerk)
- Subscriptions table (Stripe integration)
- Sessions table (replaces localStorage + IndexedDB)
- Usage events table (billing & analytics)
- Team memberships table
- Row-Level Security policies

---

### 4. Migration Strategy for Existing Users

**Three-Phase Approach:**

#### Phase A: Opt-In Account Creation (Week 1)

- Add "Sign Up" button in header + history page
- Show benefits: "Sync across devices • Try Pro features"
- **No forced migration:** BYOK users continue without interruption

#### Phase B: One-Click Import (Week 2)

```typescript
// POST /api/sessions/import
{
  localSessions: SessionData[], // From localStorage
  limit: 50 // Cap initial import
}

// Backend validates and imports:
- Deduplicates by sessionId
- Uploads audio files to Supabase Storage
- Creates database records with foreign keys
```

#### Phase C: Persistent Sync (Week 3)

- Auto-save authenticated sessions to database
- Keep localStorage as offline cache
- Sync on reconnection

**Key Principle:** BYOK users never forced to create accounts. They can use the app indefinitely in local-only mode.

---

### 5. Tier Limits & Enforcement

```typescript
// /src/utils/subscription-manager.ts
export const TIER_LIMITS = {
  free: {
    monthlyMinutes: 0, // BYOK only
    transcriptionsPerMonth: 10,
    features: {
      crossDeviceSync: false,
      speakerDiarization: false,
      multiLanguage: false,
      integrations: false,
      prioritySupport: false,
    },
  },
  pro: {
    monthlyMinutes: 500,
    transcriptionsPerMonth: Infinity,
    features: {
      crossDeviceSync: true,
      speakerDiarization: true,
      multiLanguage: true,
      integrations: true,
      prioritySupport: false,
    },
  },
  team: {
    monthlyMinutes: 2000,
    transcriptionsPerMonth: Infinity,
    features: {
      crossDeviceSync: true,
      speakerDiarization: true,
      multiLanguage: true,
      integrations: true,
      prioritySupport: true,
    },
  },
};

// Usage enforcement BEFORE API processing
async function checkUsageLimit(userId: string): Promise<void> {
  const subscription = await getSubscription(userId);
  const limits = TIER_LIMITS[subscription.tier];

  const usage = await supabaseClient
    .from('usage_events')
    .select('minutes_consumed')
    .eq('user_id', userId)
    .eq('billing_period', getCurrentBillingPeriod())
    .single();

  if ((usage.data?.minutes_consumed || 0) >= limits.monthlyMinutes) {
    throw new UsageExceededError('Monthly limit reached. Upgrade to continue.');
  }
}
```

---

## Implementation Phases

### Phase 1: Foundation (Weeks 1-3)

See `implementation-phase-1.md` for detailed week-by-week tasks including:

- Week 1: Authentication Setup (Clerk + Supabase integration)
- Week 2: Database Integration (Session CRUD, storage)
- Week 3: Migration & Sync (Import local sessions)

**Deliverables:**

- User registration with email/password + social login
- Secure JWT-based API authentication
- Server-side session persistence
- Cross-device session sync
- Import existing localStorage sessions

---

### Phase 2: Monetization (Weeks 4-6)

See `implementation-phase-2.md` for detailed tasks including:

- Week 4: Stripe Integration (Checkout, webhooks, pricing page)
- Week 5: Usage Tracking (Middleware, quota enforcement, dashboard)
- Week 6: Credits System (Hosted API keys, credit purchases)

**Deliverables:**

- Stripe subscription checkout
- Usage tracking and quota enforcement
- Pricing page with tier comparison
- Customer portal for subscription management
- Upgrade prompts when quota exceeded

---

### Phase 3: Value Features (Weeks 7-10) - Nice-to-Have

**Features:**

1. **Speaker Diarization:** Identify multiple speakers (Pro+)
2. **Multi-Language:** 50+ languages with auto-detection (Pro+)
3. **Integrations:** Export to Notion, Google Docs, Slack (Pro+)

See `implementation-phase-3.md` for details.

---

### Phase 4: Engagement (Weeks 11-13) - Nice-to-Have

**Features:**

1. **Analytics Dashboard:** Total minutes, transcriptions count, cost savings
2. **Search Across History:** Full-text search in all sessions
3. **Email Notifications:** Job completion, weekly summaries, quota warnings

See `implementation-phase-4.md` for details.

---

## Testing Strategy (TDD Workflow)

See `testing-strategy.md` for complete TDD patterns including:

- API route testing
- Repository pattern testing
- Component testing with Testing Library
- E2E testing with Playwright
- Coverage targets (80%+ for all layers)

---

## Cost Analysis

### Early Stage (<100 users)

| Service   | Tier     | Monthly Cost          | Notes                      |
| --------- | -------- | --------------------- | -------------------------- |
| Clerk     | Free     | $0                    | Up to 10k MAU              |
| Supabase  | Free     | $0                    | 500MB DB, 1GB storage      |
| Stripe    | Standard | Transaction fees only | 2.9% + 30¢ per transaction |
| Vercel    | Pro      | $20                   | Serverless functions       |
| **Total** |          | **$20/month**         | Excluding transaction fees |

### Scaling (1000 users, $15k MRR)

| Service   | Tier       | Monthly Cost   | Notes                    |
| --------- | ---------- | -------------- | ------------------------ |
| Clerk     | Pro        | $25            | Still within 10k MAU     |
| Supabase  | Pro        | $25            | 8GB DB, 100GB storage    |
| Stripe    | Standard   | ~$450          | 2.9% of $15k             |
| Vercel    | Pro        | $20            | May need Team ($20/seat) |
| SendGrid  | Essentials | $20            | Email notifications      |
| **Total** |            | **$540/month** | 3.6% of MRR              |

### Break-Even Analysis

**At €19/month Pro tier:**

- Cost per active user: ~€8-10 (AI costs) + ~€0.50 (infrastructure) = **€8.50-10.50**
- Gross margin: **45-55%** per user
- Break-even: **5-10 active Pro subscribers**

**Key Insight:** Very low startup costs (~€20/month) with healthy margins at scale.

---

## Critical Files Summary

See `critical-files.md` for complete list of files to create and modify.

---

## Timeline Summary

| Phase                     | Duration     | Deliverables                         |
| ------------------------- | ------------ | ------------------------------------ |
| **Phase 1: Foundation**   | 3 weeks      | Auth, database, migration            |
| **Phase 2: Monetization** | 3 weeks      | Stripe, usage tracking, quotas       |
| **MVP Launch**            | **6 weeks**  | **Ready for paid users**             |
| Phase 3: Value Features   | 4 weeks      | Speaker ID, multi-lang, integrations |
| Phase 4: Engagement       | 3 weeks      | Analytics, search, emails            |
| **Full Platform**         | **13 weeks** | Complete SaaS                        |

---

## Success Metrics

### Phase 1 (Foundation)

- ✅ 100% of new sessions saved to database for authenticated users
- ✅ <500ms latency for session CRUD operations
- ✅ 0 data loss during migration
- ✅ 80%+ test coverage on auth/database code

### Phase 2 (Monetization)

- ✅ 10% conversion rate (free → pro)
- ✅ <5% payment failure rate
- ✅ Accurate usage tracking (±2% of actual API usage)
- ✅ €5k MRR within 30 days of launch

---

## Risk Mitigation

| Risk                            | Impact   | Mitigation                                               |
| ------------------------------- | -------- | -------------------------------------------------------- |
| Data loss during import         | High     | Validate before delete, 30-day rollback                  |
| Webhook failures (Clerk/Stripe) | High     | Retry with exponential backoff, manual reconciliation UI |
| API key exposure                | Critical | Never store hosted keys in DB, use Vercel env vars       |
| Quota enforcement bypass        | Medium   | Server-side validation only, never trust client          |
| Supabase RLS misconfiguration   | Critical | Automated RLS tests, manual audit                        |
| Stripe webhook replay attacks   | Medium   | Verify signatures, idempotency keys                      |
| BYOK user frustration           | Low      | Only show upgrade CTAs after 10 transcriptions           |

---

**This plan prioritizes speed to market (6 weeks to MVP) while maintaining code quality, backward compatibility, and the established TDD patterns in the codebase.**
