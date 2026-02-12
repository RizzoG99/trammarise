# Design System: Trammarise V8.0
**Project ID:** 11760662075630327479

## 1. Visual Theme & Atmosphere
**"Tech-Human Glass"** - A modern, professional interface balancing high-utility data density with approachable, airy aesthetics.
-   **Mood:** Trustworthy, crisp, professional, and slightly futuristic.
-   **Core Metaphor:** Clean glass surfaces over deep data layers.
-   **Density:** Medium-high density for information-rich views (transcripts), but spacious in navigation and landing areas.
-   **Lighting:** Diffused, soft lighting with subtle glassmorphism effects to establish depth.

## 2. Color Palette & Roles

### Brand Colors
-   **Primary Blue (#0A47C2):** Deep, corporate electric blue. Used for primary actions (buttons), active states, and key brand moments.
-   **Primary Hover (#083A9E):** Darker share for hover states on primary interactions.
-   **Primary Light (#EEF4FF):** Very pale blue tint. Used for subtle backgrounds, active item highlighting, and secondary accents.

### Neutrals (Dark Mode First)
-   **Midnight (#101622):** Deep charcoal/black. The primary background color in dark mode. rich and deep, avoiding pure black.
-   **Surface Dark (#1E293B):** Slate gray. Used for card backgrounds, sidebars, and elevated surfaces in dark mode.
-   **Slate Gray (#64748B):** Mid-tone gray. Used for secondary text, icons, and borders.
-   **Background Light (#F5F6F8):** Cool light gray. Primary background for light mode.
-   **Surface Light (#FFFFFF):** Pure white. Card backgrounds in light mode.

### Semantic States
-   **Success (#22C55E):** Vibrant green. Used for completion badges, success toasts.
-   **Warning (#F59E0B):** Amber orange. Used for alerts, attention-needed states.
-   **Error (#EF4444):** Bright red. Used for destructive actions and validation errors.

## 3. Typography Rules
**Font Family:** `Inter` (sans-serif) for both Display and Body.

-   **Display H1:** Inter Bold, 48px. Tight tracking (`tracking-tight`).
-   **Heading H2:** Inter Bold, 30px.
-   **Heading H3:** Inter SemiBold, 24px.
-   **Body Large:** Inter Regular, 18px. Conversational reading text.
-   **Body Regular:** Inter Regular, 16px. Standard UI text.
-   **Caption:** Inter Medium, 14px. Metadata and secondary info.
-   **Small:** Inter Regular, 12px. Legal text and tertiary details.

## 4. Component Stylings

### Buttons
-   **Primary:** Solid Primary Blue background. `rounded` (approx 6px). White text. 
    -   *Hover:* darken to `#083A9E`.
-   **Secondary:** Transparent/White background with Gray border. Slate text.
    -   *Dark Mode:* Transparent background, Gray-600 border, White text.
-   **Ghost/Text:** No background. Text color Primary or Slate. Hover adds subtle `primary/5` background.

### Cards & Containers (`GlassCard`)
-   **Shape:** `rounded-xl` (12px) or `rounded-2xl` (16px) for larger containers.
-   **Background (Light):** White (`#FFFFFF`) or `rgba(255, 255, 255, 0.7)` for glass effect.
-   **Background (Dark):** Surface Dark (`#1E293B`) or `rgba(30, 41, 59, 0.7)` for glass effect.
-   **Glass Effect:** `backdrop-filter: blur(12px)`.
-   **Borders:** 
    -   Light: `border-gray-100` (`rgba(255, 255, 255, 0.3)`).
    -   Dark: `border-gray-700` (`rgba(255, 255, 255, 0.05)`).
-   **Shadow:** `shadow-soft` for standard elevation, `shadow-glass` for distinct floating elements.

### Inputs
-   **Standard:** `rounded` (6px). `border-gray-300` (Light) / `border-gray-600` (Dark).
    -   *Focus:* `ring-1 ring-primary border-primary`.
-   **Background:** Matches Surface color (White / Dark Slate).

## 5. Layout Principles
-   **Spacing:** Spacious relative to text size. Sections separated by `py-10` to `py-16`.
-   **Container:** `max-w-7xl` centered for main page content.
-   **Grids:** `gap-6` or `gap-8` for card layouts.
-   **Navigation:** Sticky header with `backdrop-blur-md` effect.
