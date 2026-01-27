# Localization Task Plan

## Objective

Externalize hardcoded strings in the application to support internationalization (i18n). The target languages include English (source), Italian, Spanish, and German.

## Scope

The following files have been identified as containing hardcoded strings and need to be updated:

1.  `src/locales/en/translation.json` (Source of truth for keys)
2.  `src/components/layout/AppHeader.tsx`
3.  `src/components/states/InitialState.tsx`
4.  `src/pages/ApiKeySetupPage.tsx`
5.  `src/components/results/ActionButtons.tsx`

> **Note**: `src/pages/PreviewPage.tsx` is validly excluded as it is a development-only component.

## Step-by-Step Instructions

### Phase 1: Update Translation Files

**Action**: Add the following nested structures to `src/locales/en/translation.json`.

```json
{
  "initialState": {
    "title": "Transform Your Audio",
    "subtitle": "Upload an audio file or start recording to transcribe and summarize",
    "uploadButton": "Upload Audio",
    "recordButton": "Start Recording",
    "dropZone": {
      "main": "Drop audio and context files here",
      "sub": "or click to select files",
      "formats": "Audio • Images • PDF • TXT"
    },
    "contextFiles": {
      "title": "Context Files",
      "errors": {
        "invalidType": "Only images, PDF, and TXT files are allowed",
        "sizeLimit": "Total file size cannot exceed 24MB",
        "someIgnored": "Some files were ignored. Only audio, images, PDF, and TXT files are supported.",
        "invalidAudio": "Please select a valid audio file"
      }
    }
  },
  "apiKey": {
    "title": "Setup API Key",
    "metaDescription": "Configure your OpenAI API key to enable AI-powered transcription and summarization features in Trammarise.",
    "heading": "Unlock AI Transcription",
    "description": "Trammarise uses OpenAI's powerful models to transcribe and summarize your audio. Follow the guide below to get your personal API key.",
    "guide": {
      "title": "How to get your API Key",
      "step1": {
        "title": "Log in to OpenAI Platform",
        "text": "Visit platform.openai.com and sign in with your account.",
        "linkText": "Open platform.openai.com"
      },
      "step2": {
        "title": "Navigate to API Keys",
        "text": "Hover over the sidebar on the left and click on \"API Keys\" icon."
      },
      "step3": {
        "title": "Create new secret key",
        "text": "Click \"Create new secret key\". Name it 'Trammarise' to easily identify it later."
      },
      "step4": {
        "title": "Copy and paste",
        "text": "Copy the key starting with sk-... immediately. You won't be able to view it again."
      }
    },
    "form": {
      "title": "Connect OpenAI",
      "subtitle": "Enter your key below to enable transcription features.",
      "label": "OpenAI API Key",
      "placeholder": "sk-...",
      "securityNote": "Your key is stored locally in your browser and is never sent to our servers.",
      "privacy": {
        "secure": "Secure",
        "fast": "Fast",
        "noCode": "No Code"
      },
      "buttons": {
        "connecting": "Connecting...",
        "saved": "Saved",
        "connect": "Test & Save Connection"
      },
      "errors": {
        "invalid": "Invalid API Key. Please check your key and try again.",
        "connection": "Connection failed. Please check your internet connection."
      },
      "success": "Connection verified and saved!",
      "help": "Having trouble?",
      "docsLink": "Check our documentation"
    }
  },
  "actions": {
    "readAloud": "Read Aloud",
    "stop": "Stop",
    "copy": "Copy",
    "copied": "Copied!",
    "aria": {
      "stop": "Stop reading",
      "read": "Read aloud",
      "copy": "Copy to clipboard"
    }
  },
  "header": {
    "aria": {
      "saveFile": "Save file name",
      "cancelEdit": "Cancel editing",
      "editFile": "Edit file name"
    }
  }
}
```

### Phase 2: Refactor Components

#### 1. `src/components/layout/AppHeader.tsx`

- **Import**: `useTranslation` hook.
- **Changes**:
  - Update `aria-label="Save file name"` -> `aria-label={t('header.aria.saveFile')}`
  - Update `aria-label="Cancel editing"` -> `aria-label={t('header.aria.cancelEdit')}`
  - Update `aria-label="Edit file name"` -> `aria-label={t('header.aria.editFile')}`

#### 2. `src/components/states/InitialState.tsx`

- **Import**: `useTranslation` hook.
- **Changes**:
  - Replace all hardcoded texts in the render method with `t('initialState...')` keys.
  - Replace error strings in `handleFileValidation`, `handleFileChange`, `handleDrop`, `handleContextFiles` with `t('initialState.contextFiles.errors...')`.

#### 3. `src/components/results/ActionButtons.tsx`

- **Import**: `useTranslation` hook.
- **Changes**:
  - Replace button texts "Read Aloud", "Stop", "Copy", "Copied!" with corresponding `t('actions...')` keys.
  - Replace `aria-label`s with `t('actions.aria...')` keys.

#### 4. `src/pages/ApiKeySetupPage.tsx`

- **Import**: `useTranslation` hook.
- **Changes**:
  - Heavily refactor this file. Almost every text node is hardcoded.
  - Replace `<SEO>` title and description props.
  - Replace main headings, guide steps, and form labels.
  - Update the status messages in `handleSave`.

## Validation

After applying changes:

1.  Run the application locally.
2.  Navigate to `/setup` (API Key page) to verify the heavy refactoring.
3.  Use the Language Switcher in the header to validte that keys are resolving (even if other languages fallback to English for now, the English keys must display correctly).
4.  Ensure no build errors occur.
