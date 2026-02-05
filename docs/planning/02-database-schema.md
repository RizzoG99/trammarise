# Database Schema Design

Complete PostgreSQL schema for Trammarise SaaS platform using Supabase.

---

## Schema Overview

```
users (Clerk sync)
  ↓ one-to-one
subscriptions (Stripe)
  ↑ references
sessions (user data)
  ↑ references
usage_events (billing)
  ↑ references
team_memberships (collaboration)
```

---

## Tables

### 1. Users Table

Synced from Clerk via webhook. Primary user identity table.

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_clerk_id ON users(clerk_user_id);
CREATE INDEX idx_users_email ON users(email);
```

**Fields:**

- `id`: Internal UUID primary key
- `clerk_user_id`: Clerk's user ID (external reference)
- `email`: User's primary email
- `full_name`: Display name
- `avatar_url`: Profile picture URL

**Relationships:**

- One-to-one with `subscriptions`
- One-to-many with `sessions`
- One-to-many with `usage_events`
- Many-to-many with `team_memberships`

---

### 2. Subscriptions Table

Stripe subscription management with tier enforcement.

```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,

  -- Tier & Status
  tier TEXT NOT NULL CHECK (tier IN ('free', 'pro', 'team')),
  status TEXT NOT NULL CHECK (status IN ('active', 'canceled', 'past_due', 'trialing')),

  -- Stripe Integration
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,

  -- Credits System (for hosted API keys)
  credits_balance NUMERIC DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id)
);

CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe ON subscriptions(stripe_subscription_id);
CREATE INDEX idx_subscriptions_tier ON subscriptions(tier);
```

**Fields:**

- `tier`: Subscription level (free, pro, team)
- `status`: Current state (active, canceled, past_due, trialing)
- `stripe_customer_id`: Stripe customer reference
- `stripe_subscription_id`: Stripe subscription reference
- `current_period_start/end`: Billing cycle dates
- `cancel_at_period_end`: Scheduled cancellation flag
- `credits_balance`: Prepaid credits for hosted API keys

**Relationships:**

- Belongs to `users` (one-to-one)
- Referenced by usage enforcement logic

**Tier Values:**

- `free`: BYOK users, no included minutes
- `pro`: €19/month, 500 minutes included
- `team`: €49/month, 2000 minutes shared

---

### 3. Sessions Table

Replaces localStorage + IndexedDB with server-side persistence.

```sql
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  session_id TEXT UNIQUE NOT NULL, -- Client-generated for compatibility

  -- Audio Metadata
  audio_name TEXT NOT NULL,
  file_size_bytes BIGINT NOT NULL,
  audio_url TEXT, -- Supabase Storage URL
  duration_seconds NUMERIC,

  -- Configuration
  language TEXT NOT NULL,
  content_type TEXT NOT NULL,
  processing_mode TEXT,
  noise_profile TEXT,

  -- Audio Editing
  selection_mode TEXT CHECK (selection_mode IN ('full', 'selection')),
  region_start NUMERIC,
  region_end NUMERIC,

  -- Processing Results
  transcript TEXT,
  summary TEXT,
  chat_history JSONB DEFAULT '[]',
  ai_config JSONB, -- Audit trail of AI configuration

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ, -- Soft delete

  CHECK (deleted_at IS NULL OR deleted_at >= created_at)
);

CREATE INDEX idx_sessions_user_created ON sessions(user_id, created_at DESC);
CREATE INDEX idx_sessions_session_id ON sessions(session_id);
CREATE INDEX idx_sessions_deleted ON sessions(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX idx_sessions_content_type ON sessions(content_type);
```

**Fields:**

- `session_id`: Client-generated ID (format: `${Date.now()}-${random}`)
- `audio_url`: Supabase Storage path (not blob data)
- `duration_seconds`: Audio length for usage tracking
- `language`: ISO 639-1 code (en, es, fr, etc.)
- `content_type`: meeting, lecture, interview, podcast, voice_memo, other
- `selection_mode`: Whether full audio or trimmed region used
- `region_start/end`: Trim points in seconds
- `transcript`: Full transcription text
- `summary`: AI-generated summary
- `chat_history`: JSONB array of chat messages
- `ai_config`: JSONB snapshot of AI configuration used
- `deleted_at`: Soft delete timestamp (null = active)

**Relationships:**

- Belongs to `users` (many-to-one)
- Referenced by `usage_events`

**JSONB Schemas:**

**chat_history:**

```json
[
  {
    "role": "user" | "assistant",
    "content": "message text",
    "timestamp": 1234567890
  }
]
```

**ai_config:**

```json
{
  "provider": "openai" | "openrouter",
  "model": "gpt-4",
  "temperature": 0.7,
  "contentType": "meeting",
  "language": "en"
}
```

---

### 4. Usage Events Table

Tracks API usage for billing and analytics.

```sql
CREATE TABLE usage_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  session_id UUID REFERENCES sessions(id) ON DELETE SET NULL,

  -- Event Type
  event_type TEXT NOT NULL CHECK (event_type IN ('transcription', 'summarization', 'chat')),

  -- Usage Metrics
  audio_duration_seconds NUMERIC,
  transcript_chars INTEGER,
  message_chars INTEGER,

  -- Credits/Minutes Consumed
  credits_consumed NUMERIC NOT NULL DEFAULT 0,
  minutes_consumed NUMERIC NOT NULL DEFAULT 0,

  -- API Metadata
  provider TEXT NOT NULL, -- 'openai', 'openrouter', 'hosted'
  model TEXT,

  -- Billing Period (for monthly rollups)
  billing_period DATE NOT NULL, -- Format: YYYY-MM-01

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_usage_user_period ON usage_events(user_id, billing_period);
CREATE INDEX idx_usage_created ON usage_events(created_at DESC);
CREATE INDEX idx_usage_event_type ON usage_events(event_type);
```

**Fields:**

- `event_type`: Type of API call
  - `transcription`: Whisper API call
  - `summarization`: GPT/Claude summarization
  - `chat`: Interactive chat message
- `audio_duration_seconds`: For transcriptions
- `transcript_chars`: For summarizations (input length)
- `message_chars`: For chat (message length)
- `credits_consumed`: For hosted API key mode
- `minutes_consumed`: For quota tracking (transcription minutes)
- `provider`: Which API was used
- `model`: Specific model (gpt-4, claude-3-opus, etc.)
- `billing_period`: Month this usage belongs to (always 1st of month)

**Relationships:**

- Belongs to `users` (many-to-one)
- References `sessions` (optional, SET NULL on delete)

**Usage Calculation Logic:**

```typescript
// Transcription
minutes_consumed = Math.ceil(audio_duration_seconds / 60);

// Summarization
credits_consumed = Math.ceil(transcript_chars / 1000) * COST_PER_1K_CHARS;

// Chat
credits_consumed = Math.ceil(message_chars / 1000) * COST_PER_1K_CHARS;
```

---

### 5. Team Memberships Table

Team collaboration (Phase 2 extension).

```sql
CREATE TABLE team_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES users(id) ON DELETE CASCADE, -- Team owner
  member_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'member')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(team_id, member_id)
);

CREATE INDEX idx_team_memberships_team ON team_memberships(team_id);
CREATE INDEX idx_team_memberships_member ON team_memberships(member_id);
```

**Fields:**

- `team_id`: User ID of team owner
- `member_id`: User ID of team member
- `role`: Permission level
  - `owner`: Full control, billing management
  - `admin`: Can manage members, no billing access
  - `member`: Can only access team sessions

**Relationships:**

- Many-to-many between `users`

**Team Tier Logic:**

- Team tier subscription includes 5 members
- Additional members: €8/month each
- Shared usage pool: 2000 minutes/month

---

## Row-Level Security (RLS) Policies

Supabase RLS enforces data access at the database level.

```sql
-- Enable RLS on all tables
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Sessions: Users can only access their own
CREATE POLICY sessions_user_access ON sessions
  FOR ALL
  USING (auth.uid()::text = (SELECT clerk_user_id FROM users WHERE id = user_id));

-- Usage events: Read-only access to own events
CREATE POLICY usage_user_access ON usage_events
  FOR SELECT
  USING (auth.uid()::text = (SELECT clerk_user_id FROM users WHERE id = user_id));

-- Subscriptions: Read-only access to own subscription
CREATE POLICY subscriptions_user_access ON subscriptions
  FOR SELECT
  USING (auth.uid()::text = (SELECT clerk_user_id FROM users WHERE id = user_id));

-- Team sessions: Members can access team owner's sessions
CREATE POLICY team_sessions_access ON sessions
  FOR SELECT
  USING (
    user_id IN (
      SELECT team_id FROM team_memberships WHERE member_id = (
        SELECT id FROM users WHERE clerk_user_id = auth.uid()::text
      )
    )
  );
```

**Security Notes:**

- `auth.uid()` returns Clerk user ID from JWT
- Policies are evaluated on every query
- Server-side admin client bypasses RLS for webhooks
- Critical: Test RLS policies with automated tests

---

## Indexes Strategy

**Purpose:**

- `idx_sessions_user_created`: Optimize session listing by user (DESC for latest first)
- `idx_usage_user_period`: Fast monthly usage queries for quota enforcement
- `idx_sessions_session_id`: Client-side session ID lookup
- `idx_subscriptions_stripe`: Webhook lookups by Stripe ID

**Performance Targets:**

- Session list query: <100ms
- Usage check query: <50ms
- Session CRUD: <200ms

---

## Data Retention Policy

| Table            | Retention                     | Soft Delete? | Reason                 |
| ---------------- | ----------------------------- | ------------ | ---------------------- |
| users            | Permanent                     | No           | Account data           |
| subscriptions    | Permanent                     | No           | Billing history        |
| sessions         | 90 days (Pro), 30 days (Free) | Yes          | Storage costs          |
| usage_events     | 24 months                     | No           | Tax/audit requirements |
| team_memberships | Permanent                     | No           | Small data volume      |

**Soft Delete Implementation:**

```sql
-- Sessions table has deleted_at column
UPDATE sessions SET deleted_at = NOW() WHERE id = ?;

-- Cleanup job (run monthly)
DELETE FROM sessions
WHERE deleted_at < NOW() - INTERVAL '90 days'
  AND user_id IN (SELECT user_id FROM subscriptions WHERE tier = 'pro');

DELETE FROM sessions
WHERE deleted_at < NOW() - INTERVAL '30 days'
  AND user_id IN (SELECT user_id FROM subscriptions WHERE tier = 'free');
```

---

## Migration Scripts

### Initial Setup

```sql
-- Run in Supabase SQL editor
\i schema.sql
```

### Add Credits System (Phase 2 Week 6)

```sql
ALTER TABLE subscriptions ADD COLUMN credits_balance NUMERIC DEFAULT 0;
ALTER TABLE usage_events ADD COLUMN credits_consumed NUMERIC DEFAULT 0;
```

### Add Team Features (Phase 2 Extension)

```sql
-- Already included in main schema
-- Just uncomment team_memberships table if disabled
```

---

## Database Backup Strategy

**Supabase Automated Backups:**

- Daily backups (retained 7 days) - Free tier
- Point-in-time recovery (30 days) - Pro tier ($25/month)

**Manual Exports:**

```bash
# Weekly export via pg_dump
pg_dump -h db.xxx.supabase.co -U postgres -d postgres > backup_$(date +%Y%m%d).sql
```

---

## TypeScript Type Generation

```bash
# Generate types from Supabase schema
npx supabase gen types typescript --project-id xxx > src/types/database.ts
```

**Generated Types Example:**

```typescript
export interface Database {
  public: {
    Tables: {
      sessions: {
        Row: {
          id: string;
          user_id: string;
          session_id: string;
          audio_name: string;
          transcript: string | null;
          // ... all fields
        };
        Insert: {
          // ... insert fields
        };
        Update: {
          // ... update fields
        };
      };
      // ... other tables
    };
  };
}
```

---

## Query Examples

### Get User's Recent Sessions

```sql
SELECT
  session_id,
  audio_name,
  content_type,
  created_at
FROM sessions
WHERE user_id = ? AND deleted_at IS NULL
ORDER BY created_at DESC
LIMIT 20;
```

### Check Monthly Usage

```sql
SELECT
  SUM(minutes_consumed) as total_minutes,
  COUNT(*) as event_count
FROM usage_events
WHERE user_id = ?
  AND billing_period = date_trunc('month', CURRENT_DATE)::date;
```

### Get Subscription with Usage

```sql
SELECT
  s.tier,
  s.status,
  s.current_period_end,
  COALESCE(SUM(u.minutes_consumed), 0) as minutes_used
FROM subscriptions s
LEFT JOIN usage_events u ON u.user_id = s.user_id
  AND u.billing_period = date_trunc('month', CURRENT_DATE)::date
WHERE s.user_id = ?
GROUP BY s.id;
```

---

**This schema prioritizes:**

1. **Security:** RLS policies at database level
2. **Performance:** Strategic indexes for common queries
3. **Flexibility:** JSONB for evolving schemas
4. **Compliance:** 24-month event retention for audits
5. **Scalability:** Soft deletes prevent accidental data loss
