# Localization Fix for Configuration Section

## Proposed Changes

### Translations

Update `src/locales/en/translation.json` to include keys for all configuration components.

#### [MODIFY] [translation.json](file:///Users/gabrielerizzo/Develop/trammarise/src/locales/en/translation.json)

```json
{
  "configuration": {
    "context": {
      "title": "Context (Optional)",
      "subtitle": "Upload Agenda or Slides to improve accuracy",
      "attachFiles": "Attach Files",
      "formats": "PDF, JPG, PNG"
    },
    "processingMode": {
      "title": "Processing Mode",
      "balanced": {
        "title": "Balanced",
        "description": "Standard accuracy, faster processing",
        "credits": "~10 credits"
      },
      "quality": {
        "title": "Quality",
        "description": "GPT-4 enhanced analysis & summary",
        "credits": "~25 credits"
      }
    },
    "audioEnvironment": {
      "title": "Audio Environment"
    },
    "noiseProfiles": {
      "quiet": "Quiet Environment",
      "meeting_room": "Meeting Room",
      "cafe": "Cafe / Restaurant",
      "outdoor": "Outdoor",
      "phone": "Phone / Digital Call"
    },
    "meetingType": {
      "title": "Meeting Type",
      "options": {
        "meeting_notes": "Meeting Notes",
        "transcript": "Transcript",
        "summary": "Summary",
        "podcast": "Podcast / Interview",
        "lecture": "Lecture / Presentation",
        "video": "Video Script"
      }
    },
    "language": {
      "title": "Language",
      "options": {
        "en": "English",
        "it": "Italian",
        "es": "Spanish",
        "de": "German",
        "fr": "French",
        "pt": "Portuguese"
      }
    }
  }
}
```

### Components

#### [MODIFY] [ContextUploadArea.tsx](file:///Users/gabrielerizzo/Develop/trammarise/src/features/upload/components/ContextUploadArea.tsx)

- Import `useTranslation`.
- Replace hardcoded strings with `t('configuration.context...')`.

#### [MODIFY] [ProcessingModeSelector.tsx](file:///Users/gabrielerizzo/Develop/trammarise/src/features/configuration/components/ProcessingModeSelector.tsx)

- Import `useTranslation`.
- Replace hardcoded strings with `t('configuration.processingMode...')`.

#### [MODIFY] [NoiseProfileSelector.tsx](file:///Users/gabrielerizzo/Develop/trammarise/src/features/configuration/components/NoiseProfileSelector.tsx)

- Import `useTranslation`.
- Replace "Audio Environment" with `t('configuration.audioEnvironment.title')`.
- Modify `NOISE_PROFILE_OPTIONS` usage: `t('configuration.noiseProfiles.' + option.value)`.

#### [MODIFY] [ContentTypeSelector.tsx](file:///Users/gabrielerizzo/Develop/trammarise/src/features/configuration/components/ContentTypeSelector.tsx)

- Import `useTranslation`.
- Replace "Meeting Type" with `t('configuration.meetingType.title')`.
- Modify `CONTENT_TYPE_OPTIONS` usage: `t('configuration.meetingType.options.' + option.value)`.

#### [MODIFY] [LanguageSelector.tsx](file:///Users/gabrielerizzo/Develop/trammarise/src/features/configuration/components/LanguageSelector.tsx)

- Import `useTranslation`.
- Replace "Language" with `t('configuration.language.title')`.
- Modify `LANGUAGE_OPTIONS` usage: `t('configuration.language.options.' + option.value)`.

## Verification

- Manual verification: Switch language and observe all dropdowns and labels in the "Configura" section update.
