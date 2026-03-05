# Design: Pricing Page Navigation Fix

**Date**: 2026-03-05
**Branch**: `feature/ux-ui-refactoring`

## Problem

Three connected issues make the pricing page inaccessible or a dead end:

1. **No entry point** — `/pricing` is not linked from anywhere except the "Upgrade to Pro" button in onboarding step 2. Users who have completed onboarding have no way to revisit pricing.

2. **Onboarding trap** — when a user in onboarding clicks "Upgrade to Pro", they land on `/pricing` which is rendered inside the bare onboarding gate (no `AppLayout`). There is no "Back" button, no header, no navigation — they are stuck.

3. **Missing chrome** — because `/pricing` is listed inside the `isSignedIn && needsOnboarding` routing block, it renders without `AppLayout` (no `AppHeader`, no `AppFooter`).

## Design

### 1. Remove `/pricing` from the onboarding gate block (App.tsx)

The onboarding gate renders a separate `<Routes>` tree without `AppLayout` for any signed-in user who still has `needsOnboarding = true`. Currently it lists:

```tsx
<Route path={ROUTES.ONBOARDING} element={<OnboardingPage />} />
<Route path="/pricing" element={<PricingPage />} />   // ← remove this
<Route path="*" element={<Navigate to={ROUTES.ONBOARDING} replace />} />
```

Remove the `/pricing` bare route. Since `/pricing` already exists in the normal authenticated `<Route element={<AppLayout />}>` block, it will continue to work for all signed-in users — including those still in onboarding, because React Router evaluates all `<Routes>` trees and the outer authenticated block renders when the onboarding gate does not return early.

**Effect**: clicking "Upgrade to Pro" in onboarding step 2 navigates to `/pricing` rendered with full `AppLayout` (header, footer, back-navigation possible via browser/header).

### 2. Add "Pricing" link to the user menu dropdown (UserMenu)

Users who have completed onboarding need a path back to pricing. The user menu dropdown (top-right avatar) is the right place — it already contains "Account", "Manage subscription", and "Sign out".

Add a "Pricing" item above "Sign out" (or below "Account"), using a `Sparkles` icon (already imported in the project) and navigating to `ROUTES.PRICING`.

### 3. i18n keys

Add `userMenu.pricing` to all four locale files (`en`, `it`, `de`, `es`).

```json
"userMenu": {
  "pricing": "Pricing"   // "Prezzi" / "Preise" / "Precios"
}
```

## Files Changed

| Action     | File                                                                  |
| ---------- | --------------------------------------------------------------------- |
| **Update** | `src/app/App.tsx` — remove bare `/pricing` route from onboarding gate |
| **Update** | `src/features/user-menu/UserMenuDropdown.tsx` — add Pricing menu item |
| **Update** | `src/locales/en/translation.json`                                     |
| **Update** | `src/locales/it/translation.json`                                     |
| **Update** | `src/locales/de/translation.json`                                     |
| **Update** | `src/locales/es/translation.json`                                     |

## Verification

```bash
npm test && npm run lint && npm run build
```

Manual checks:

- User in onboarding: click "Upgrade to Pro" → lands on `/pricing` with header + footer; can navigate back
- User post-onboarding: user menu shows "Pricing" item; click navigates to `/pricing`
- No regression on existing onboarding flow (steps 1–3 still work)
