# Usage Panel Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace `UsageTab` in Account Settings with a new `UsagePanel` component that shows rich usage stats for Pro users and a compelling upgrade view for Free users.

**Architecture:** New component tree at `src/features/account/components/UsagePanel/`. Top-level `UsagePanel` reads the subscription tier and renders either `FreePlanPanel` or `ProPlanPanel`. Data comes from `useSubscription()` and a single fetch to `/api/usage/current`. No new API endpoints.

**Tech Stack:** React 19, TypeScript, Tailwind 4 CSS vars, react-i18next, Vitest + Testing Library, Lucide icons

---

## Reference

- Design doc: `docs/plans/2026-03-08-usage-panel-design.md`
- Mockup: `docs/mockups/usage-panel-mockup.html` (open in browser to see target UI)
- Existing component being replaced: `src/features/user-menu/components/UsageTab.tsx`
- Integration point: `src/features/account/AccountBillingPage.tsx`

### Key types (already exist — do not redefine)

```typescript
// src/context/subscription-types.ts
type SubscriptionTier = 'free' | 'pro' | 'team';
type SubscriptionStatus =
  | 'active'
  | 'canceled'
  | 'past_due'
  | 'trialing'
  | 'incomplete'
  | 'incomplete_expired'
  | 'unpaid';
interface Subscription {
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  currentPeriodEnd: string; // ISO8601
  cancelAtPeriodEnd: boolean;
  minutesIncluded: number;
  minutesUsed: number;
}
```

```typescript
// useSubscription() returns:
const { subscription, isLoading, error } = useSubscription();
// subscription is Subscription | null
```

```typescript
// GET /api/usage/current response
interface UsageCurrentResponse {
  totalMinutes: number;
  eventCount: number; // transcription count this month
  billingPeriod: string;
  tier: SubscriptionTier;
  limit: number;
  remainingMinutes: number;
  isOverLimit: boolean;
}
```

```typescript
// src/utils/session-storage.ts
getApiConfig(): StoredConfig | null
// Returns null when user has no API key configured
```

### How to fetch usage count

```typescript
import { fetchWithAuth } from '@/utils/api';
// ...
const { getToken } = useAuth();
const data = await fetchWithAuth<UsageCurrentResponse>('/api/usage/current', getToken);
```

### Status badge logic

| condition                             | badge                     |
| ------------------------------------- | ------------------------- |
| `active` + `cancelAtPeriodEnd: false` | none                      |
| `active` + `cancelAtPeriodEnd: true`  | amber "Cancels [date]"    |
| `trialing`                            | amber "Trial ends [date]" |
| `past_due`                            | red "Payment failed"      |
| `unpaid`                              | red "Unpaid"              |
| `canceled`                            | red "Canceled"            |

### Progress bar state

| minutesUsed / minutesIncluded | bar color      | banner                         |
| ----------------------------- | -------------- | ------------------------------ |
| < 80%                         | primary (blue) | none                           |
| ≥ 80%                         | amber          | amber warning banner           |
| 100%                          | red            | red error banner + upgrade CTA |

---

## Task 1: Add i18n keys to all 4 locales

**Files:**

- Modify: `src/locales/en/translation.json`
- Modify: `src/locales/it/translation.json`
- Modify: `src/locales/de/translation.json`
- Modify: `src/locales/es/translation.json`

**Step 1: Add the `usagePanel` key to English**

In `src/locales/en/translation.json`, add at the top level (alongside `"account"`, `"home"`, etc.):

```json
"usagePanel": {
  "free": {
    "planBadge": "Free",
    "upgradeBtn": "Upgrade to Pro",
    "sectionThisMonth": "This month",
    "transcriptionCount_one": "{{count}} transcription",
    "transcriptionCount_other": "{{count}} transcriptions",
    "byokStatus": "Using your own OpenAI key (BYOK)",
    "checkBalance": "Check your OpenAI balance",
    "noKeyWarning": "No API key configured",
    "noKeyCta": "Set up your API key",
    "sectionMissing": "What you're missing",
    "sectionMissingCaption": "Available on Pro and above",
    "proBadge": "Pro",
    "feature": {
      "hostedApi": {
        "name": "No API key needed",
        "desc": "Platform handles transcription — no OpenAI key required"
      },
      "chat": {
        "name": "AI Chat on results",
        "desc": "Ask questions, translate, or refine your transcript with AI"
      },
      "diarization": {
        "name": "Speaker diarization",
        "desc": "Identify who said what — perfect for interviews and meetings"
      },
      "cloudSync": {
        "name": "Cloud sync",
        "desc": "Access your transcriptions from any device"
      }
    }
  },
  "pro": {
    "planBadge": "Pro",
    "managePlan": "Manage plan",
    "sectionMinutes": "Minutes this month",
    "minutesUsed": "{{minutesUsed}} / {{minutesIncluded}} min",
    "transcriptionCount_one": "{{count}} transcription this month",
    "transcriptionCount_other": "{{count}} transcriptions this month",
    "renews": "Renews {{date}}",
    "accessEnds": "Access ends {{date}}",
    "progressAriaLabel": "{{pct}}% of monthly minutes used",
    "warning": {
      "title": "Running low on minutes",
      "body": "{{minutesUsed}} of {{minutesIncluded}} minutes used — {{remaining}} remaining this period."
    },
    "quota": {
      "title": "Quota reached",
      "body": "Upgrade your plan or wait for renewal on {{date}}.",
      "upgradeBtn": "Upgrade for more minutes"
    },
    "badge": {
      "cancels": "Cancels {{date}}",
      "trial": "Trial ends {{date}}",
      "pastDue": "Payment failed",
      "unpaid": "Unpaid",
      "canceled": "Canceled"
    }
  }
}
```

**Step 2: Add Italian translation**

In `src/locales/it/translation.json`, add:

```json
"usagePanel": {
  "free": {
    "planBadge": "Gratuito",
    "upgradeBtn": "Passa a Pro",
    "sectionThisMonth": "Questo mese",
    "transcriptionCount_one": "{{count}} trascrizione",
    "transcriptionCount_other": "{{count}} trascrizioni",
    "byokStatus": "Stai usando la tua chiave OpenAI (BYOK)",
    "checkBalance": "Controlla il tuo saldo OpenAI",
    "noKeyWarning": "Nessuna chiave API configurata",
    "noKeyCta": "Configura la tua chiave API",
    "sectionMissing": "Cosa ti manca",
    "sectionMissingCaption": "Disponibile con Pro e superiore",
    "proBadge": "Pro",
    "feature": {
      "hostedApi": { "name": "Nessuna chiave API richiesta", "desc": "La piattaforma gestisce la trascrizione" },
      "chat": { "name": "Chat AI sui risultati", "desc": "Fai domande, traduci o raffina la trascrizione con l'AI" },
      "diarization": { "name": "Diarizzazione speaker", "desc": "Identifica chi ha detto cosa" },
      "cloudSync": { "name": "Sincronizzazione cloud", "desc": "Accedi alle tue trascrizioni da qualsiasi dispositivo" }
    }
  },
  "pro": {
    "planBadge": "Pro",
    "managePlan": "Gestisci piano",
    "sectionMinutes": "Minuti questo mese",
    "minutesUsed": "{{minutesUsed}} / {{minutesIncluded}} min",
    "transcriptionCount_one": "{{count}} trascrizione questo mese",
    "transcriptionCount_other": "{{count}} trascrizioni questo mese",
    "renews": "Si rinnova il {{date}}",
    "accessEnds": "Accesso termina il {{date}}",
    "progressAriaLabel": "{{pct}}% dei minuti mensili utilizzati",
    "warning": { "title": "Minuti in esaurimento", "body": "{{minutesUsed}} di {{minutesIncluded}} minuti usati — {{remaining}} rimanenti." },
    "quota": { "title": "Quota raggiunta", "body": "Aggiorna il piano o attendi il rinnovo il {{date}}.", "upgradeBtn": "Aggiorna per più minuti" },
    "badge": { "cancels": "Annulla il {{date}}", "trial": "Trial termina il {{date}}", "pastDue": "Pagamento fallito", "unpaid": "Non pagato", "canceled": "Annullato" }
  }
}
```

**Step 3: Add German translation**

In `src/locales/de/translation.json`, add:

```json
"usagePanel": {
  "free": {
    "planBadge": "Kostenlos",
    "upgradeBtn": "Auf Pro upgraden",
    "sectionThisMonth": "Diesen Monat",
    "transcriptionCount_one": "{{count}} Transkription",
    "transcriptionCount_other": "{{count}} Transkriptionen",
    "byokStatus": "Du verwendest deinen eigenen OpenAI-Schlüssel (BYOK)",
    "checkBalance": "OpenAI-Guthaben prüfen",
    "noKeyWarning": "Kein API-Schlüssel konfiguriert",
    "noKeyCta": "API-Schlüssel einrichten",
    "sectionMissing": "Was dir fehlt",
    "sectionMissingCaption": "Verfügbar ab Pro",
    "proBadge": "Pro",
    "feature": {
      "hostedApi": { "name": "Kein API-Schlüssel erforderlich", "desc": "Die Plattform übernimmt die Transkription" },
      "chat": { "name": "KI-Chat zu Ergebnissen", "desc": "Fragen stellen, übersetzen oder verfeinern mit KI" },
      "diarization": { "name": "Sprecher-Diarisierung", "desc": "Erkennt, wer was gesagt hat" },
      "cloudSync": { "name": "Cloud-Synchronisierung", "desc": "Zugriff auf deine Transkriptionen von überall" }
    }
  },
  "pro": {
    "planBadge": "Pro",
    "managePlan": "Plan verwalten",
    "sectionMinutes": "Minuten diesen Monat",
    "minutesUsed": "{{minutesUsed}} / {{minutesIncluded}} Min.",
    "transcriptionCount_one": "{{count}} Transkription diesen Monat",
    "transcriptionCount_other": "{{count}} Transkriptionen diesen Monat",
    "renews": "Verlängert am {{date}}",
    "accessEnds": "Zugang endet am {{date}}",
    "progressAriaLabel": "{{pct}}% der monatlichen Minuten verbraucht",
    "warning": { "title": "Minuten werden knapp", "body": "{{minutesUsed}} von {{minutesIncluded}} Minuten genutzt — {{remaining}} verbleibend." },
    "quota": { "title": "Kontingent erreicht", "body": "Upgrade oder warte bis zur Verlängerung am {{date}}.", "upgradeBtn": "Upgrade für mehr Minuten" },
    "badge": { "cancels": "Kündigt am {{date}}", "trial": "Test endet am {{date}}", "pastDue": "Zahlung fehlgeschlagen", "unpaid": "Unbezahlt", "canceled": "Gekündigt" }
  }
}
```

**Step 4: Add Spanish translation**

In `src/locales/es/translation.json`, add:

```json
"usagePanel": {
  "free": {
    "planBadge": "Gratis",
    "upgradeBtn": "Actualizar a Pro",
    "sectionThisMonth": "Este mes",
    "transcriptionCount_one": "{{count}} transcripción",
    "transcriptionCount_other": "{{count}} transcripciones",
    "byokStatus": "Usando tu propia clave de OpenAI (BYOK)",
    "checkBalance": "Ver tu saldo de OpenAI",
    "noKeyWarning": "Sin clave API configurada",
    "noKeyCta": "Configurar tu clave API",
    "sectionMissing": "Lo que te falta",
    "sectionMissingCaption": "Disponible en Pro y superior",
    "proBadge": "Pro",
    "feature": {
      "hostedApi": { "name": "Sin clave API necesaria", "desc": "La plataforma gestiona la transcripción" },
      "chat": { "name": "Chat IA en resultados", "desc": "Pregunta, traduce o refina tu transcripción con IA" },
      "diarization": { "name": "Diarización de oradores", "desc": "Identifica quién dijo qué" },
      "cloudSync": { "name": "Sincronización en la nube", "desc": "Accede a tus transcripciones desde cualquier dispositivo" }
    }
  },
  "pro": {
    "planBadge": "Pro",
    "managePlan": "Administrar plan",
    "sectionMinutes": "Minutos este mes",
    "minutesUsed": "{{minutesUsed}} / {{minutesIncluded}} min",
    "transcriptionCount_one": "{{count}} transcripción este mes",
    "transcriptionCount_other": "{{count}} transcripciones este mes",
    "renews": "Se renueva el {{date}}",
    "accessEnds": "El acceso termina el {{date}}",
    "progressAriaLabel": "{{pct}}% de los minutos mensuales usados",
    "warning": { "title": "Pocos minutos restantes", "body": "{{minutesUsed}} de {{minutesIncluded}} minutos usados — {{remaining}} restantes." },
    "quota": { "title": "Cuota alcanzada", "body": "Actualiza tu plan o espera la renovación el {{date}}.", "upgradeBtn": "Actualizar para más minutos" },
    "badge": { "cancels": "Cancela el {{date}}", "trial": "Prueba termina el {{date}}", "pastDue": "Pago fallido", "unpaid": "Sin pagar", "canceled": "Cancelado" }
  }
}
```

**Step 5: Verify**

```bash
npm run build 2>&1 | grep -i "error" | head -10
```

Expected: no errors.

**Step 6: Commit**

```bash
git add src/locales/
git commit -m "feat(i18n): add usagePanel translation keys to all 4 locales"
```

---

## Task 2: Write failing tests

**Files:**

- Create: `src/features/account/components/UsagePanel/UsagePanel.test.tsx`

**Step 1: Create the test file**

```typescript
// src/features/account/components/UsagePanel/UsagePanel.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/i18n';
import { UsagePanel } from './UsagePanel';

// ─── Mocks ───────────────────────────────────────────────

const mockUseSubscription = vi.fn();
vi.mock('@/context/SubscriptionContext', () => ({
  useSubscription: () => mockUseSubscription(),
}));

const mockUseAuth = vi.fn(() => ({ getToken: vi.fn().mockResolvedValue('mock-token') }));
vi.mock('@clerk/react', () => ({ useAuth: () => mockUseAuth() }));

const mockFetchWithAuth = vi.fn();
vi.mock('@/utils/api', () => ({ fetchWithAuth: (...args: unknown[]) => mockFetchWithAuth(...args) }));

const mockGetApiConfig = vi.fn();
vi.mock('@/utils/session-storage', () => ({ getApiConfig: () => mockGetApiConfig() }));

// ─── Helpers ──────────────────────────────────────────────

function makeSubscription(overrides = {}) {
  return {
    id: 'sub_1',
    tier: 'free' as const,
    status: 'active' as const,
    currentPeriodStart: '2026-01-01T00:00:00Z',
    currentPeriodEnd: '2026-02-01T00:00:00Z',
    cancelAtPeriodEnd: false,
    minutesIncluded: 60,
    minutesUsed: 0,
    creditsBalance: 0,
    ...overrides,
  };
}

function makeUsageResponse(overrides = {}) {
  return {
    totalMinutes: 10,
    eventCount: 4,
    billingPeriod: '2026-01-01',
    tier: 'free' as const,
    limit: 60,
    remainingMinutes: 50,
    isOverLimit: false,
    ...overrides,
  };
}

function renderPanel() {
  return render(
    <MemoryRouter>
      <I18nextProvider i18n={i18n}>
        <UsagePanel />
      </I18nextProvider>
    </MemoryRouter>
  );
}

// ─── Tests ────────────────────────────────────────────────

describe('UsagePanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetApiConfig.mockReturnValue({ provider: 'openai', apiKey: 'sk-test', openaiKey: 'sk-test', timestamp: Date.now() });
    mockFetchWithAuth.mockResolvedValue(makeUsageResponse());
  });

  describe('loading state', () => {
    it('shows a loading skeleton while subscription is loading', () => {
      mockUseSubscription.mockReturnValue({ subscription: null, isLoading: true, error: null });
      renderPanel();
      expect(screen.getByRole('status')).toBeInTheDocument();
    });
  });

  describe('error state', () => {
    it('shows an error message when subscription fails', () => {
      mockUseSubscription.mockReturnValue({ subscription: null, isLoading: false, error: 'Failed to load' });
      renderPanel();
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });

  describe('FreePlanPanel', () => {
    beforeEach(() => {
      mockUseSubscription.mockReturnValue({
        subscription: makeSubscription({ tier: 'free' }),
        isLoading: false,
        error: null,
      });
    });

    it('renders the free plan badge', async () => {
      renderPanel();
      expect(await screen.findByText(/free/i)).toBeInTheDocument();
    });

    it('shows transcription count from API', async () => {
      mockFetchWithAuth.mockResolvedValue(makeUsageResponse({ eventCount: 7 }));
      renderPanel();
      expect(await screen.findByText('7')).toBeInTheDocument();
    });

    it('shows BYOK status when API key is configured', async () => {
      renderPanel();
      expect(await screen.findByText(/byok/i)).toBeInTheDocument();
    });

    it('shows no-key warning when no API key is configured', async () => {
      mockGetApiConfig.mockReturnValue(null);
      renderPanel();
      expect(await screen.findByRole('link', { name: /set up/i })).toBeInTheDocument();
    });

    it('renders a link to the OpenAI billing dashboard', async () => {
      renderPanel();
      const link = await screen.findByRole('link', { name: /openai balance/i });
      expect(link).toHaveAttribute('href', 'https://platform.openai.com/usage');
    });

    it('renders 4 locked features', async () => {
      renderPanel();
      const lockChips = await screen.findAllByText('Pro');
      // 4 lock chips in feature list + 1 header badge = 5, but let's count by test id
      expect(await screen.findByText(/no api key needed/i)).toBeInTheDocument();
      expect(await screen.findByText(/ai chat on results/i)).toBeInTheDocument();
      expect(await screen.findByText(/speaker diarization/i)).toBeInTheDocument();
      expect(await screen.findByText(/cloud sync/i)).toBeInTheDocument();
    });

    it('renders upgrade CTA button linking to /pricing', async () => {
      renderPanel();
      const btns = await screen.findAllByRole('link', { name: /upgrade to pro/i });
      expect(btns.length).toBeGreaterThan(0);
      expect(btns[0]).toHaveAttribute('href', '/pricing');
    });
  });

  describe('ProPlanPanel', () => {
    beforeEach(() => {
      mockUseSubscription.mockReturnValue({
        subscription: makeSubscription({
          tier: 'pro',
          minutesIncluded: 500,
          minutesUsed: 320,
          currentPeriodEnd: '2026-02-01T00:00:00Z',
        }),
        isLoading: false,
        error: null,
      });
      mockFetchWithAuth.mockResolvedValue(makeUsageResponse({ eventCount: 12, tier: 'pro' }));
    });

    it('renders the pro plan badge', async () => {
      renderPanel();
      expect(await screen.findByText('Pro')).toBeInTheDocument();
    });

    it('shows no status badge in normal active state', async () => {
      renderPanel();
      await screen.findByText('Pro');
      expect(screen.queryByText(/cancels|payment failed|unpaid|canceled/i)).not.toBeInTheDocument();
    });

    it('shows the progress bar with correct aria attributes at 64%', async () => {
      renderPanel();
      const bar = await screen.findByRole('progressbar');
      expect(bar).toHaveAttribute('aria-valuenow', '64');
    });

    it('shows transcription count from API', async () => {
      renderPanel();
      expect(await screen.findByText('12')).toBeInTheDocument();
    });

    it('shows amber "Cancels" badge when cancelAtPeriodEnd is true', async () => {
      mockUseSubscription.mockReturnValue({
        subscription: makeSubscription({ tier: 'pro', minutesIncluded: 500, minutesUsed: 100, cancelAtPeriodEnd: true }),
        isLoading: false,
        error: null,
      });
      renderPanel();
      expect(await screen.findByText(/cancels/i)).toBeInTheDocument();
    });

    it('shows warning banner at ≥ 80% usage', async () => {
      mockUseSubscription.mockReturnValue({
        subscription: makeSubscription({ tier: 'pro', minutesIncluded: 500, minutesUsed: 410 }),
        isLoading: false,
        error: null,
      });
      renderPanel();
      expect(await screen.findByText(/running low/i)).toBeInTheDocument();
    });

    it('shows error banner and upgrade CTA at 100% usage', async () => {
      mockUseSubscription.mockReturnValue({
        subscription: makeSubscription({ tier: 'pro', minutesIncluded: 500, minutesUsed: 500 }),
        isLoading: false,
        error: null,
      });
      renderPanel();
      expect(await screen.findByText(/quota reached/i)).toBeInTheDocument();
      const upgradeLink = await screen.findByRole('link', { name: /upgrade for more/i });
      expect(upgradeLink).toHaveAttribute('href', '/pricing');
    });

    it('shows red "Payment failed" badge for past_due status', async () => {
      mockUseSubscription.mockReturnValue({
        subscription: makeSubscription({ tier: 'pro', status: 'past_due', minutesIncluded: 500, minutesUsed: 100 }),
        isLoading: false,
        error: null,
      });
      renderPanel();
      expect(await screen.findByText(/payment failed/i)).toBeInTheDocument();
    });
  });
});
```

**Step 2: Run tests to verify they fail**

```bash
npm test UsagePanel.test.tsx 2>&1 | tail -15
```

Expected: Multiple failures like `Cannot find module './UsagePanel'`.

**Step 3: Commit the failing tests**

```bash
git add src/features/account/components/UsagePanel/UsagePanel.test.tsx
git commit -m "test(account): add failing tests for UsagePanel"
```

---

## Task 3: Implement UsagePanel (top-level + barrel)

**Files:**

- Create: `src/features/account/components/UsagePanel/index.ts`
- Create: `src/features/account/components/UsagePanel/UsagePanel.tsx`

**Step 1: Create barrel export**

```typescript
// src/features/account/components/UsagePanel/index.ts
export { UsagePanel } from './UsagePanel';
```

**Step 2: Create UsagePanel.tsx**

```typescript
// src/features/account/components/UsagePanel/UsagePanel.tsx
import { useSubscription } from '@/context/SubscriptionContext';
import { FreePlanPanel } from './FreePlanPanel';
import { ProPlanPanel } from './ProPlanPanel';

export function UsagePanel() {
  const { subscription, isLoading, error } = useSubscription();

  if (isLoading) {
    return (
      <div role="status" aria-label="Loading usage data" className="space-y-3 animate-pulse">
        <div className="h-8 bg-bg-tertiary rounded-lg w-1/3" />
        <div className="h-24 bg-bg-tertiary rounded-xl" />
        <div className="h-16 bg-bg-tertiary rounded-xl" />
      </div>
    );
  }

  if (error || !subscription) {
    return (
      <div role="alert" className="p-4 rounded-xl border border-accent-error/25 bg-accent-error/10 text-accent-error text-sm">
        Failed to load usage data. Please refresh the page.
      </div>
    );
  }

  if (subscription.tier === 'free') {
    return <FreePlanPanel />;
  }

  return <ProPlanPanel subscription={subscription} />;
}
```

**Step 3: Run tests**

```bash
npm test UsagePanel.test.tsx 2>&1 | tail -15
```

Expected: Loading + error tests pass. FreePlanPanel/ProPlanPanel tests still fail (not implemented yet).

---

## Task 4: Implement FreePlanPanel

**Files:**

- Create: `src/features/account/components/UsagePanel/FreePlanPanel.tsx`

**Step 1: Create FreePlanPanel.tsx**

```typescript
// src/features/account/components/UsagePanel/FreePlanPanel.tsx
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@clerk/react';
import { useNavigate } from 'react-router-dom';
import { Key, Lock, MessageSquare, Users, Cloud, ExternalLink, Zap, AlertCircle } from 'lucide-react';
import { fetchWithAuth } from '@/utils/api';
import { getApiConfig } from '@/utils/session-storage';
import { ROUTES } from '@/types/routing';

interface UsageCurrentResponse {
  eventCount: number;
}

const LOCKED_FEATURES = [
  { key: 'hostedApi', Icon: Key },
  { key: 'chat',      Icon: MessageSquare },
  { key: 'diarization', Icon: Users },
  { key: 'cloudSync', Icon: Cloud },
] as const;

export function FreePlanPanel() {
  const { t } = useTranslation();
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const [eventCount, setEventCount] = useState<number | null>(null);
  const hasApiKey = getApiConfig() !== null;

  useEffect(() => {
    fetchWithAuth<UsageCurrentResponse>('/api/usage/current', getToken)
      .then(data => setEventCount(data.eventCount))
      .catch(() => setEventCount(0));
  }, [getToken]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-bg-tertiary border border-border text-text-secondary">
            {t('usagePanel.free.planBadge')}
          </span>
        </div>
        <a
          href={ROUTES.PRICING}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-white text-sm font-semibold cursor-pointer hover:opacity-90 transition-opacity"
        >
          <Zap size={13} aria-hidden="true" />
          {t('usagePanel.free.upgradeBtn')}
        </a>
      </div>

      {/* Divider */}
      <hr className="border-border" />

      {/* This month */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-text-tertiary mb-3">
          {t('usagePanel.free.sectionThisMonth')}
        </p>

        {/* Transcription count callout */}
        <div className="flex items-center gap-3 p-3.5 rounded-lg bg-bg-tertiary/50 border border-border mb-3">
          <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center text-primary flex-shrink-0">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
          </div>
          <div>
            <div className="text-xl font-bold text-text-primary leading-none">
              {eventCount ?? '—'}
            </div>
            <div className="text-sm text-text-secondary mt-0.5">
              {t('usagePanel.free.transcriptionCount', { count: eventCount ?? 0 })}
            </div>
          </div>
        </div>

        {/* BYOK status or no-key warning */}
        {hasApiKey ? (
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <Key size={14} className="text-text-tertiary flex-shrink-0" aria-hidden="true" />
              {t('usagePanel.free.byokStatus')}
            </div>
            <a
              href="https://platform.openai.com/usage"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-primary text-sm font-medium hover:opacity-80 transition-opacity"
            >
              {t('usagePanel.free.checkBalance')}
              <ExternalLink size={12} aria-hidden="true" />
            </a>
          </div>
        ) : (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-accent-warning/10 border border-accent-warning/25">
            <AlertCircle size={15} className="text-accent-warning flex-shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <p className="text-sm text-accent-warning font-medium">{t('usagePanel.free.noKeyWarning')}</p>
              <button
                onClick={() => navigate('/account?section=apiKeys')}
                className="text-sm text-text-secondary hover:text-text-primary transition-colors cursor-pointer underline mt-0.5"
              >
                {t('usagePanel.free.noKeyCta')}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Divider */}
      <hr className="border-border" />

      {/* Missing features */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-text-tertiary mb-1">
          {t('usagePanel.free.sectionMissing')}
        </p>
        <p className="text-xs text-text-tertiary mb-3">
          {t('usagePanel.free.sectionMissingCaption')}
        </p>

        <div className="space-y-0.5">
          {LOCKED_FEATURES.map(({ key, Icon }) => (
            <div
              key={key}
              className="flex items-start gap-3 px-3 py-2.5 rounded-lg hover:bg-bg-tertiary/50 transition-colors"
            >
              <div className="w-7 h-7 rounded-lg bg-bg-tertiary border border-border flex items-center justify-center flex-shrink-0 text-text-tertiary">
                <Icon size={13} aria-hidden="true" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-text-secondary">
                    {t(`usagePanel.free.feature.${key}.name`)}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-text-tertiary bg-bg-tertiary border border-border rounded px-1.5 py-0.5">
                    <Lock size={8} aria-hidden="true" />
                    {t('usagePanel.free.proBadge')}
                  </span>
                </div>
                <p className="text-xs text-text-tertiary mt-0.5 leading-snug">
                  {t(`usagePanel.free.feature.${key}.desc`)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Divider */}
      <hr className="border-border" />

      {/* Bottom upgrade CTA */}
      <a
        href={ROUTES.PRICING}
        className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-primary text-white text-sm font-semibold cursor-pointer hover:opacity-90 transition-opacity"
      >
        <Zap size={14} aria-hidden="true" />
        {t('usagePanel.free.upgradeBtn')}
      </a>
    </div>
  );
}
```

**Step 2: Run tests**

```bash
npm test UsagePanel.test.tsx 2>&1 | tail -20
```

Expected: Free plan tests now pass. Pro plan tests still fail.

---

## Task 5: Implement ProPlanPanel

**Files:**

- Create: `src/features/account/components/UsagePanel/ProPlanPanel.tsx`

**Step 1: Create ProPlanPanel.tsx**

```typescript
// src/features/account/components/UsagePanel/ProPlanPanel.tsx
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@clerk/react';
import { Zap, ChevronRight, AlertTriangle, XCircle } from 'lucide-react';
import type { Subscription, SubscriptionStatus } from '@/context/subscription-types';
import { fetchWithAuth } from '@/utils/api';
import { ROUTES } from '@/types/routing';

interface Props {
  subscription: Subscription;
}

interface UsageCurrentResponse {
  eventCount: number;
}

function formatDate(isoString: string) {
  return new Date(isoString).toLocaleDateString(undefined, {
    year: 'numeric', month: 'long', day: 'numeric',
  });
}

function getStatusBadge(
  status: SubscriptionStatus,
  cancelAtPeriodEnd: boolean,
  periodEnd: string,
  t: (key: string, opts?: Record<string, unknown>) => string,
): { label: string; variant: 'cancels' | 'pastDue' | 'unpaid' | 'canceled' | 'trial' } | null {
  if (status === 'trialing') return { label: t('usagePanel.pro.badge.trial', { date: formatDate(periodEnd) }), variant: 'cancels' };
  if (cancelAtPeriodEnd) return { label: t('usagePanel.pro.badge.cancels', { date: formatDate(periodEnd) }), variant: 'cancels' };
  if (status === 'past_due') return { label: t('usagePanel.pro.badge.pastDue'), variant: 'pastDue' };
  if (status === 'unpaid') return { label: t('usagePanel.pro.badge.unpaid'), variant: 'pastDue' };
  if (status === 'canceled') return { label: t('usagePanel.pro.badge.canceled'), variant: 'canceled' };
  return null;
}

const BADGE_STYLES = {
  cancels:  'bg-accent-warning/10 border-accent-warning/25 text-accent-warning',
  pastDue:  'bg-accent-error/10 border-accent-error/25 text-accent-error',
  canceled: 'bg-accent-error/10 border-accent-error/25 text-accent-error',
  trial:    'bg-accent-warning/10 border-accent-warning/25 text-accent-warning',
  unpaid:   'bg-accent-error/10 border-accent-error/25 text-accent-error',
} as const;

export function ProPlanPanel({ subscription }: Props) {
  const { t } = useTranslation();
  const { getToken } = useAuth();
  const [eventCount, setEventCount] = useState<number | null>(null);

  const { minutesUsed, minutesIncluded, currentPeriodEnd, cancelAtPeriodEnd, status } = subscription;
  const pct = minutesIncluded > 0 ? Math.round((minutesUsed / minutesIncluded) * 100) : 0;
  const remaining = Math.max(0, minutesIncluded - minutesUsed);
  const isWarning = pct >= 80 && pct < 100;
  const isQuotaReached = pct >= 100;
  const statusBadge = getStatusBadge(status, cancelAtPeriodEnd, currentPeriodEnd, t);
  const formattedDate = formatDate(currentPeriodEnd);

  useEffect(() => {
    fetchWithAuth<UsageCurrentResponse>('/api/usage/current', getToken)
      .then(data => setEventCount(data.eventCount))
      .catch(() => setEventCount(0));
  }, [getToken]);

  const barColor = isQuotaReached
    ? 'var(--color-accent-error)'
    : isWarning
    ? 'var(--color-accent-warning)'
    : 'var(--color-primary)';

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-primary/10 border border-primary/30 text-primary">
            {t('usagePanel.pro.planBadge')}
          </span>
          {statusBadge && (
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${BADGE_STYLES[statusBadge.variant]}`}>
              {statusBadge.label}
            </span>
          )}
        </div>
        <a
          href={ROUTES.PRICING}
          className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
        >
          {t('usagePanel.pro.managePlan')}
          <ChevronRight size={14} aria-hidden="true" />
        </a>
      </div>

      {/* Divider */}
      <hr className="border-border" />

      {/* Warning / quota banners */}
      {isQuotaReached && (
        <div role="alert" className="flex items-start gap-2.5 p-3 rounded-lg bg-accent-error/10 border border-accent-error/25">
          <XCircle size={15} className="text-accent-error flex-shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <p className="text-sm font-semibold text-accent-error">{t('usagePanel.pro.quota.title')}</p>
            <p className="text-xs text-text-secondary mt-0.5">{t('usagePanel.pro.quota.body', { date: formattedDate })}</p>
          </div>
        </div>
      )}
      {isWarning && !isQuotaReached && (
        <div role="alert" className="flex items-start gap-2.5 p-3 rounded-lg bg-accent-warning/10 border border-accent-warning/25">
          <AlertTriangle size={15} className="text-accent-warning flex-shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <p className="text-sm font-semibold text-accent-warning">{t('usagePanel.pro.warning.title')}</p>
            <p className="text-xs text-text-secondary mt-0.5">
              {t('usagePanel.pro.warning.body', { minutesUsed, minutesIncluded, remaining })}
            </p>
          </div>
        </div>
      )}

      {/* Minutes section */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-text-tertiary mb-3">
          {t('usagePanel.pro.sectionMinutes')}
        </p>

        <div className="flex justify-between items-baseline mb-2">
          <span className="text-base font-semibold text-text-primary">
            {t('usagePanel.pro.minutesUsed', { minutesUsed, minutesIncluded })}
          </span>
          <span className="text-sm font-medium" style={{ color: isQuotaReached ? 'var(--color-accent-error)' : isWarning ? 'var(--color-accent-warning)' : 'var(--color-text-secondary)' }}>
            {pct}%
          </span>
        </div>

        <div
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={t('usagePanel.pro.progressAriaLabel', { pct })}
          className="h-1.5 rounded-full bg-bg-tertiary overflow-hidden"
        >
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.min(pct, 100)}%`, background: barColor }}
          />
        </div>

        <p className="text-xs text-text-tertiary mt-2">
          {cancelAtPeriodEnd
            ? t('usagePanel.pro.accessEnds', { date: formattedDate })
            : t('usagePanel.pro.renews', { date: formattedDate })}
        </p>
      </div>

      {/* Divider */}
      <hr className="border-border" />

      {/* Transcription count */}
      <div className="flex items-center gap-3 p-3.5 rounded-lg bg-bg-tertiary/50 border border-border">
        <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center text-primary flex-shrink-0">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
        </div>
        <div>
          <div className="text-xl font-bold text-text-primary leading-none">
            {eventCount ?? '—'}
          </div>
          <div className="text-sm text-text-secondary mt-0.5">
            {t('usagePanel.pro.transcriptionCount', { count: eventCount ?? 0 })}
          </div>
        </div>
      </div>

      {/* Upgrade CTA (quota reached only) */}
      {isQuotaReached && (
        <a
          href={ROUTES.PRICING}
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-primary text-white text-sm font-semibold cursor-pointer hover:opacity-90 transition-opacity"
        >
          <Zap size={14} aria-hidden="true" />
          {t('usagePanel.pro.quota.upgradeBtn')}
        </a>
      )}
    </div>
  );
}
```

**Step 2: Run all tests**

```bash
npm test UsagePanel.test.tsx 2>&1 | tail -20
```

Expected: All tests pass.

**Step 3: Commit**

```bash
git add src/features/account/components/UsagePanel/
git commit -m "feat(account): implement UsagePanel with FreePlanPanel and ProPlanPanel"
```

---

## Task 6: Wire UsagePanel into AccountBillingPage

**Files:**

- Modify: `src/features/account/AccountBillingPage.tsx`

**Step 1: Swap the import**

In `AccountBillingPage.tsx`, find:

```typescript
import { UsageTab } from '../user-menu/components/UsageTab';
```

Replace with:

```typescript
import { UsagePanel } from './components/UsagePanel';
```

**Step 2: Replace the render call**

Find the JSX where `<UsageTab />` is rendered. Replace it with:

```tsx
<UsagePanel />
```

**Step 3: Verify the full test suite**

```bash
npm test 2>&1 | tail -10
```

Expected: All existing tests pass, the 2 pre-existing failures remain (unrelated: `UploadRecordTabs.test.tsx`, `ChatSidePanel.test.tsx`).

**Step 4: Check types**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Expected: No new errors.

**Step 5: Commit**

```bash
git add src/features/account/AccountBillingPage.tsx
git commit -m "feat(account): swap UsageTab for UsagePanel in AccountBillingPage"
```

---

## Task 7: Final verification

**Step 1: Lint**

```bash
npm run lint 2>&1 | grep -v "warning" | head -20
```

Expected: No errors.

**Step 2: Build**

```bash
npm run build 2>&1 | tail -10
```

Expected: Build succeeds.

**Step 3: Manual smoke test**

1. `vercel dev`
2. Sign in as a free user → go to `/account?section=plan`
3. Verify: Free plan badge, transcription count loads, BYOK line or no-key warning, 4 locked features, upgrade CTAs
4. Sign in as a pro user → go to `/account?section=plan`
5. Verify: Pro badge, progress bar, transcription count, no status badge in normal state
6. Manually set `minutesUsed` to 410 → verify amber warning
7. Verify "Check your OpenAI balance" link opens correct URL in new tab

**Step 4: Final commit**

```bash
git add -p  # stage any remaining changes
git commit -m "feat(account): usage panel — free + pro views with status states"
```
