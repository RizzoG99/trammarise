# Functional Analysis

Detailed feature specifications and user requirements for Trammarise SaaS transformation.

---

## User Personas

### Primary Persona: Professional Journalist

**Name:** Sarah, 34
**Role:** Freelance journalist
**Goals:**

- Quickly transcribe interview recordings
- Extract key quotes and themes
- Maintain interview archives across devices
- Protect source confidentiality (API key privacy)

**Pain Points:**

- Managing API keys is technical friction
- Loses transcripts when switching computers
- Manually searching through old interviews
- Expensive per-minute transcription services

**How Trammarise Helps:**

- Pro tier: No API key management needed
- Cross-device sync: Access on laptop + phone
- Search across all transcripts
- €19/month = predictable costs

---

### Secondary Persona: Academic Researcher

**Name:** Dr. Chen, 42
**Role:** University professor
**Goals:**

- Transcribe lecture recordings for accessibility
- Create study materials from lectures
- Collaborate with teaching assistants
- Multi-language support (English + Mandarin)

**Pain Points:**

- Students can't access lecture content after class
- Manual transcription is time-consuming
- Need to share transcripts with TAs
- Budget constraints

**How Trammarise Helps:**

- Bulk transcription with Team plan
- Shared workspaces for TAs
- Multi-language auto-detection
- Educational pricing

---

### Tertiary Persona: Consultant

**Name:** Marcus, 38
**Role:** Business consultant
**Goals:**

- Document client meetings
- Extract action items automatically
- Professional PDF reports
- Client confidentiality

**Pain Points:**

- Note-taking distracts from meetings
- Action items get lost
- Manual meeting summaries take 30+ minutes
- Client data security concerns

**How Trammarise Helps:**

- Speaker identification (who said what)
- AI extracts action items
- One-click PDF export
- SOC 2 compliance (Enterprise tier)

---

## Feature Specifications

### Phase 1: Foundation Features

#### F1.1: User Authentication

**Description:** Secure user registration and login with Clerk.

**Acceptance Criteria:**

- ✅ User can sign up with email + password in <30 seconds
- ✅ User can sign in with Google OAuth
- ✅ User can sign in with GitHub OAuth
- ✅ User session persists across browser restarts
- ✅ User can sign out and clear session
- ✅ JWT tokens expire after 24 hours

**User Stories:**

- As a new user, I want to sign up quickly so I can start transcribing
- As a returning user, I want to stay signed in so I don't re-enter credentials
- As a privacy-conscious user, I want to use social login to avoid password management

**UI Components:**

- Sign In button in header (unauthenticated state)
- Sign Up modal with Clerk UI
- User avatar dropdown (authenticated state)
- Sign Out option in dropdown

**Technical Requirements:**

- Clerk integration with React SDK
- JWT stored in httpOnly cookies
- Webhook syncs Clerk → Supabase users table
- RLS policies validate JWT on every query

**Test Cases:**

```typescript
// Auth flow tests
- Sign up with email + password
- Sign in with Google (mock OAuth)
- Session persistence after reload
- Sign out clears tokens
- Expired JWT returns 401
```

---

#### F1.2: Session Persistence

**Description:** Save sessions to database for cross-device access.

**Acceptance Criteria:**

- ✅ Authenticated user's sessions auto-save to database
- ✅ Sessions appear on all user's devices
- ✅ Offline changes sync when reconnected
- ✅ BYOK users still work in local-only mode
- ✅ Session list loads in <500ms

**User Stories:**

- As a mobile user, I want to start a transcription on my phone and finish on my laptop
- As an offline user, I want the app to work without internet and sync later
- As a BYOK user, I don't want to be forced to create an account

**UI Components:**

- Sync status indicator in header
- "Syncing..." spinner during upload
- "Local only" badge for BYOK sessions
- "Import Local Sessions" banner

**Technical Requirements:**

- Dual-write: localStorage (cache) + API (persistence)
- Audio files uploaded to Supabase Storage
- Background sync on network reconnection
- Optimistic UI updates

**Test Cases:**

```typescript
// Persistence tests
- Create session → Verify in database
- Modify session → Verify update synced
- Load session on second device
- Offline creation → Sync on reconnect
- BYOK mode works without auth
```

---

#### F1.3: Session Import

**Description:** One-click import of existing localStorage sessions.

**Acceptance Criteria:**

- ✅ User sees "Import Sessions" banner if local sessions exist
- ✅ Import completes in <30 seconds for 50 sessions
- ✅ Duplicate sessions are skipped (by sessionId)
- ✅ Audio files uploaded to storage
- ✅ Success message shows import count
- ✅ Local sessions remain after import (backup)

**User Stories:**

- As an existing user, I want to import my history so I don't lose past work
- As a migrating user, I want reassurance that my data won't be lost

**UI Components:**

- MigrationBanner component (dismissible)
- Import progress modal
- Success toast with count

**Technical Requirements:**

- POST /api/sessions/import endpoint
- Batch insert (50 sessions max per request)
- Audio files uploaded in parallel
- Deduplication by sessionId

**Test Cases:**

```typescript
// Import tests
- Import 50 sessions → All created
- Import 60 sessions → Only 50 imported
- Duplicate sessionId → Skipped
- Audio files uploaded to storage
- Error mid-import → Partial rollback
```

---

### Phase 2: Monetization Features

#### F2.1: Subscription Management

**Description:** Stripe-powered subscription checkout and management.

**Acceptance Criteria:**

- ✅ User can upgrade to Pro from pricing page
- ✅ Checkout completes in <3 clicks
- ✅ Subscription status updates in real-time (webhook)
- ✅ User can cancel subscription via portal
- ✅ Downgrade takes effect at period end
- ✅ Payment failure shows clear error message

**User Stories:**

- As a power user, I want to upgrade to Pro for more minutes
- As a budget-conscious user, I want to cancel anytime without hidden fees
- As a paying customer, I want to update my payment method easily

**UI Components:**

- Pricing page with 3 tier cards
- Stripe Checkout modal
- "Manage Billing" button in settings
- Current tier badge in header

**Technical Requirements:**

- Stripe products: Free, Pro ($19/mo), Team ($49/mo)
- Webhook: customer.subscription.created/updated/deleted
- Portal session for self-service management
- Subscription status cached in context

**Test Cases:**

```typescript
// Subscription tests
- Upgrade to Pro → Checkout → Success
- Webhook updates subscription status
- Cancel subscription → Status = canceled
- Payment fails → Status = past_due
- Downgrade at period end
```

---

#### F2.2: Usage Tracking

**Description:** Track API usage for quota enforcement and billing.

**Acceptance Criteria:**

- ✅ Every API call creates usage event
- ✅ Minutes calculated from audio duration
- ✅ Quota check BEFORE processing
- ✅ User sees current usage in dashboard
- ✅ "Upgrade" prompt when 80% of quota used
- ✅ API rejects requests when quota exceeded

**User Stories:**

- As a Pro user, I want to see how many minutes I've used this month
- As a Free user, I want to know when I'm close to my limit
- As a cost-conscious user, I want warnings before exceeding quota

**UI Components:**

- UsageDashboard with progress bar
- Usage stats: "250 / 500 minutes used"
- Warning alert at 80% usage
- Upgrade prompt at 100% usage

**Technical Requirements:**

- Middleware: withUsageTracking() wrapper
- Pre-check: checkUsageLimit()
- Post-success: trackUsage()
- Monthly billing period rollup

**Test Cases:**

```typescript
// Usage tracking tests
- Transcription creates event
- Minutes calculated correctly
- Quota enforced before processing
- Dashboard shows accurate usage
- 100% quota rejects API call
```

---

#### F2.3: Tier Enforcement

**Description:** Gate premium features behind Pro/Team tiers.

**Acceptance Criteria:**

- ✅ Free users cannot access Pro features
- ✅ Pro features show "Upgrade" button for Free users
- ✅ Feature gates checked on server-side (not just UI)
- ✅ Clear messaging: "Available on Pro plan"
- ✅ Upgrade flow from gated feature is seamless

**User Stories:**

- As a Free user, I want to understand what I get with Pro
- As a Pro user, I want exclusive features unavailable to Free users
- As a developer, I want to ensure feature gates can't be bypassed

**UI Components:**

- UpgradePrompt component
- Feature badges: "Pro" tag on buttons
- useFeatureGate() hook

**Technical Requirements:**

- TIER_LIMITS object with feature flags
- Server-side validation in API routes
- React hook: useFeatureGate(feature)
- Middleware: requireFeature(feature)

**Test Cases:**

```typescript
// Feature gating tests
- Free user clicks Pro feature → Upgrade prompt
- Pro user accesses feature → Success
- API rejects Free user's Pro feature call
- Feature flags loaded from subscription
```

---

### Phase 3: Value Features (Nice-to-Have)

#### F3.1: Speaker Diarization

**Description:** Identify multiple speakers in transcript.

**Acceptance Criteria:**

- ✅ Pro users see "Enable Speaker ID" toggle
- ✅ Transcript shows "Speaker 1:", "Speaker 2:" labels
- ✅ Supports 2-5 speakers
- ✅ Costs +€0.05/minute (disclosed upfront)
- ✅ Free users see "Upgrade to Pro" instead of toggle

**User Stories:**

- As a journalist, I want to identify which person said what
- As a meeting participant, I want transcripts with speaker names

**UI Components:**

- Toggle in audio config
- Speaker labels in transcript display
- Cost estimate: "+€0.05/min for Speaker ID"

**Technical Requirements:**

- AssemblyAI or Deepgram integration
- Speaker label format: "Speaker {n}:"
- Manual rename UI (future: "Speaker 1" → "John Doe")

---

#### F3.2: Multi-Language Support

**Description:** Auto-detect and transcribe 50+ languages.

**Acceptance Criteria:**

- ✅ Language selector shows 50+ options
- ✅ Auto-detect option available
- ✅ Transcription accuracy >90% for top 10 languages
- ✅ Summary prompts adapted per language

**User Stories:**

- As a bilingual user, I want to transcribe Spanish and English audio
- As a global user, I want auto-detection so I don't pick wrong language

**UI Components:**

- Language dropdown with search
- "Auto-detect" option (default)
- Language confidence badge

**Technical Requirements:**

- Whisper API supports 50+ languages natively
- Language-specific summarization prompts
- Translation feature (future)

---

#### F3.3: Export Integrations

**Description:** One-click export to Notion, Google Docs, Slack.

**Acceptance Criteria:**

- ✅ Pro users see "Export" dropdown
- ✅ Notion: Creates page in selected workspace
- ✅ Google Docs: Creates doc with formatting
- ✅ Slack: Posts summary to channel
- ✅ OAuth consent flow for each integration

**User Stories:**

- As a Notion user, I want transcripts in my workspace
- As a team member, I want to share summaries in Slack

**UI Components:**

- Export dropdown in results page
- OAuth consent modals
- Success toast with link

**Technical Requirements:**

- Notion API: Create page with blocks
- Google Docs API: Create document
- Slack API: Post message with webhook

---

### Phase 4: Engagement Features (Nice-to-Have)

#### F4.1: Analytics Dashboard

**Description:** Usage stats and insights.

**Acceptance Criteria:**

- ✅ Shows total transcriptions this month
- ✅ Shows total minutes processed all-time
- ✅ Charts: Usage over time (last 3 months)
- ✅ Cost savings calculator vs manual transcription

**User Stories:**

- As a power user, I want to see my usage trends
- As a manager, I want to justify subscription cost

**UI Components:**

- Dashboard page with cards
- Line chart (usage over time)
- Stat cards: transcriptions, minutes, savings

---

#### F4.2: Search Across History

**Description:** Full-text search in all sessions.

**Acceptance Criteria:**

- ✅ Search box in history page
- ✅ Results show within <500ms
- ✅ Highlights search terms in results
- ✅ Filters: date range, content type, language

**User Stories:**

- As a researcher, I want to find all sessions mentioning "Q4 earnings"
- As a journalist, I want to search old interviews for quotes

**UI Components:**

- Search input with debounce
- Results list with highlighting
- Filter sidebar

**Technical Requirements:**

- Postgres full-text search
- GIN index on transcript + summary
- Search query: `SELECT * FROM sessions WHERE to_tsvector(transcript) @@ plainto_tsquery(?)`

---

#### F4.3: Email Notifications

**Description:** Automated email updates.

**Acceptance Criteria:**

- ✅ Email sent when transcription completes
- ✅ Weekly summary email (Pro users)
- ✅ Quota warning email at 80% usage
- ✅ User can opt-out in settings

**User Stories:**

- As a busy user, I want to know when my long transcription finishes
- As a Pro user, I want weekly recaps of my activity

**UI Components:**

- Email preference checkboxes in settings

**Technical Requirements:**

- SendGrid or Resend integration
- Email templates with transactional/marketing split
- Unsubscribe link in footer

---

## Acceptance Testing Checklist

### Phase 1: Foundation

**Authentication:**

- [ ] Sign up with email + password
- [ ] Sign in with Google OAuth
- [ ] Sign out clears session
- [ ] JWT expires after 24 hours

**Session Persistence:**

- [ ] Create session → Appears in database
- [ ] Modify session → Update syncs
- [ ] Load session on second device
- [ ] Offline mode works

**Session Import:**

- [ ] Import 50 localStorage sessions
- [ ] Duplicate sessions skipped
- [ ] Audio files uploaded
- [ ] Success message shows count

---

### Phase 2: Monetization

**Subscription:**

- [ ] Upgrade to Pro via Stripe
- [ ] Checkout completes in <3 clicks
- [ ] Webhook updates status
- [ ] Cancel via portal works

**Usage Tracking:**

- [ ] Transcription creates usage event
- [ ] Dashboard shows accurate usage
- [ ] Quota enforced at 100%
- [ ] Warning at 80% usage

**Tier Enforcement:**

- [ ] Free user cannot access Pro features
- [ ] Pro user can access Pro features
- [ ] API rejects unauthorized feature calls

---

## Non-Functional Requirements

### Performance

- Session list load: <500ms
- API response (CRUD): <200ms
- Usage check: <50ms
- Stripe checkout: <3 seconds

### Security

- All API routes require auth (except BYOK mode)
- JWT tokens in httpOnly cookies
- RLS policies at database level
- API keys encrypted at rest (Vercel env vars)

### Scalability

- Support 10,000 concurrent users
- Database query optimization with indexes
- CDN for audio files (Supabase Storage)
- Serverless functions scale automatically

### Accessibility

- WCAG 2.1 AA compliance
- Keyboard navigation
- Screen reader support
- Dark mode support

---

**This functional analysis ensures all features are testable, user-centered, and aligned with business goals.**
