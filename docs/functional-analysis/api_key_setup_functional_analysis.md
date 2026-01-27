# Functional Analysis: API Key Setup Page

## 1. Overview

The **API Key Setup Page** empowers users to bring their own OpenAI API key to Trammarise, enabling core transcription and summarization features. This self-service configuration ensures user privacy by keeping credentials client-side while unlocking the application's AI capabilities.

**Goal:** Provide a secure, educational, and seamless "Get Started" experience for users to configure their API provider.

## 2. User Flow

1.  **Entry:** User clicks the **Avatar** in the App Header.
2.  **Navigation:** User is directed to the API Key Setup page (Route: `/setup-api-key`).
3.  **Education:** User interacts with the "How to get your API Key" guide.
4.  **Action:**
    - User navigates to the OpenAI platform.
    - User generates and copies a new key.
    - User pastes the key into the "Connect OpenAI" panel.
5.  **Validation:**
    - System performs a "Test Connection" call to OpenAI.
    - **Success:** Key is saved to Local Storage; User is notified and potentially redirected.
    - **Failure:** Error message details the issue (invalid key, network error).

## 3. UI Specifications

Based on `docs/mockup/api_key_setup_page/code.html`.

### 3.1 Layout

- **Responsive:**
  - **Desktop:** Split view. Left column (7 cols) for Education, Right column (5 cols) for Actions (Sticky).
  - **Mobile:** Stacked view. Education flows into Action panel.
- **Theme:** Supports Light/Dark mode (`dark:` Tailwind classes).

### 3.2 Educational Panel (Left)

- **Headline:** "Unlock AI Transcription".
- **Step-by-Step Guide:**
  1.  **Link:** External link to `platform.openai.com`.
  2.  **Visual Instruction:** Screenshot/graphic showing "API Keys" sidebar menu.
  3.  **Visual Instruction:** Screenshot/graphic showing "Create new secret key" modal.
  4.  **Warning:** "Copy and paste" instruction emphasizing key visibility.

### 3.3 Action Panel (Right)

- **Title:** "Connect OpenAI".
- **Privacy Assurance:** Green highlight box stating "Your key is stored locally in your browser and is never sent to our servers."
- **Input Field:**
  - Label: "OpenAI API Key".
  - Type: Password (masked) with Toggle Visibility (Eye icon).
  - Placeholder: `sk-...`.
- **Primary Action:** Button "Test & Save Connection".
  - States: Default, Loading (Spinner), Success (Checkmark), Error (Shake/Red).
- **Footer:** Links to Documentation and Support.
- **Trust Badges:** "Secure", "Fast", "No Code".

## 4. Functional Requirements

### 4.1 Persistence (Crucial)

- **Storage Target:** `localStorage`.
- **Key:** `trammarise_openai_api_key` (Proposed).
- **Security:** The specific API Key must **never** be transmitted to Trammarise backend services. It is strictly for client-side API usage.

### 4.2 Validation Logic

1.  **Format Check:** Basic client-side check (non-empty, string).
2.  **Live Verification:**
    - **Action:** `GET https://api.openai.com/v1/models`
    - **Auth:** `Authorization: Bearer <INPUT_KEY>`
    - **Success Criteria:** HTTP 200 OK.
    - **Error Handling:** Catch 401 (Invalid Key) and 429 (Rate Limit).

### 4.3 Integration Points

- **AppHeader:** Clicking the Avatar should navigate to this page.
- **State Management:** The global app state (likely Context or Zustand) should update to reflect "Authenticated/Configured" status immediately upon save.

## 5. Technical Stack

- **Framework:** React (+ Vite as existing).
- **Styling:** Tailwind CSS.
- **Icons:** Lucide React (standardizing from Mockup's Material Symbols).
- **Routing:** React Router (assumed standard).

## 6. Questions for Product Owner

To finalize the PRD and move to TDD, please clarify:

1.  **Navigation Flow:** After a successful "Save", where should the user be redirected? (e.g., Dashboard, previous page, or stay on page with success toast?)
2.  **Validation Strictness:** Should we implement regex validation for `sk-...` or rely solely on the API test? (OpenAI keys format can change).
3.  **Provider Scope:** Is this page _strictly_ for OpenAI for now, or should we design the UI to support switching providers (e.g., Anthropic) immediately? The mockup says "Connect OpenAI".
4.  **Existing Key:** If a user returns to this page with a key already saved, should we:
    - Show the input as empty?
    - Show a masked placeholder `sk-...XXXX`?
    - Show a "Disconnect" button?
5.  **Icon Consistency:** Can we swap the mockup's Material Symbols for **Lucide React** to match the existing design system?
