# Speaker Diarization Feature

**Status:** ✅ Complete
**Phase:** Phase 3 Week 7
**Version:** 1.0.0

## Overview

Speaker diarization is a feature that identifies and labels different speakers in audio transcriptions. Instead of receiving a single continuous transcript, users get an utterance-based transcript where each segment is labeled with the speaker who said it.

**Key Benefits:**

- **Meeting Notes:** Clearly distinguish who said what in meetings
- **Interview Transcripts:** Separate interviewer from interviewee
- **Podcast Transcriptions:** Identify multiple hosts and guests
- **Legal/Medical:** Accurate speaker attribution for records

---

## Architecture

### High-Level Flow

```
User enables speaker diarization
         ↓
Audio uploaded to /api/transcribe
         ↓
TranscriptionProviderFactory
         ├─ enableSpeakerDiarization=true → AssemblyAI (full file)
         └─ enableSpeakerDiarization=false → OpenAI (chunked)
         ↓
AssemblyAI API Processing
         ├─ Upload audio file
         ├─ Submit transcription job
         └─ Poll for completion (5s intervals)
         ↓
Result: { text, utterances[] }
         ↓
Store in job: transcript + utterances
         ↓
Frontend: SpeakerTranscriptView displays color-coded speakers
```

### Key Components

#### Backend

**1. Provider Abstraction**

- `TranscriptionProvider` interface - Unified API for all providers
- `AssemblyAIProvider` - Speaker diarization implementation
- `OpenAIProvider` - Standard transcription (no speaker support)
- `TranscriptionProviderFactory` - Provider selection logic

**2. Type System**

```typescript
interface Utterance {
  speaker: string; // "A", "B", "Speaker 1", etc.
  text: string; // What was said
  start: number; // Timestamp in milliseconds
  end: number; // End timestamp
  confidence: number; // 0-1 confidence score
  words?: Word[]; // Optional word-level timestamps
}

interface TranscriptionResponse {
  text: string; // Full transcript
  utterances?: Utterance[]; // Speaker-labeled segments
  duration?: number;
  language?: string;
}
```

**3. Job System Extensions**

```typescript
interface JobConfiguration {
  enableSpeakerDiarization?: boolean;
  speakersExpected?: number; // 2-10 speakers for better accuracy
}

interface TranscriptionJob {
  transcript?: string;
  utterances?: Utterance[]; // Stored alongside transcript
}
```

#### Frontend

**1. Configuration UI**

- `SpeakerDiarizationToggle` - Enable/disable toggle with speaker count input
- Located in UploadRecordPage configuration grid
- Optional speaker count (2-10) for improved accuracy

**2. Display UI**

- `SpeakerTranscriptView` - Color-coded utterance display
- 10 distinct gradient colors for speaker distinction
- Active utterance highlighting during playback
- Search functionality across all utterances
- Clickable timestamps for audio navigation

**3. State Management**

- `SessionData` - Extended with speaker diarization fields
- `ProcessingResult` - Includes optional utterances
- Conditional rendering in `ResultsState`

---

## Usage Guide

### For Users

#### Enabling Speaker Diarization

1. **Upload/Record Audio**
   - Go to the home page
   - Upload an audio file or start recording

2. **Enable Speaker Identification**
   - In the "Configure" section (Column 3)
   - Toggle "Speaker Identification" ON
   - _Optional:_ Specify expected number of speakers (2-10)
     - Leave blank for auto-detection
     - Specify for better accuracy when you know the count

3. **Process Audio**
   - Click "Process Audio"
   - Processing takes longer than standard transcription (2-5 minutes)
   - Poll status shows "Transcribing" progress

4. **View Results**
   - Transcript shows speaker-labeled utterances
   - Each speaker has a unique color
   - Click timestamps to jump to that point in audio
   - Search works across all utterances

#### Best Practices

**When to Use:**

- ✅ Meetings with 2-10 participants
- ✅ Interviews (1-on-1 or panel)
- ✅ Podcasts with multiple hosts
- ✅ Focus groups or discussions

**When NOT to Use:**

- ❌ Single speaker recordings (unnecessary overhead)
- ❌ Large conferences (>10 speakers, accuracy degrades)
- ❌ Very short recordings (<30 seconds)
- ❌ Poor audio quality (speaker overlap, noise)

**Audio Quality Tips:**

- Use separate microphones when possible
- Minimize speaker overlap
- Reduce background noise
- Clear, distinct voices work best

### For Developers

#### API Integration

**Request:**

```typescript
// FormData with speaker diarization enabled
const formData = new FormData();
formData.append('audioFile', audioBlob);
formData.append('apiKey', apiKey);
formData.append('language', 'en');
formData.append('enableSpeakerDiarization', 'true');
formData.append('speakersExpected', '3'); // Optional

const response = await fetch('/api/transcribe', {
  method: 'POST',
  body: formData,
});

const { jobId, statusUrl } = await response.json();
```

**Polling for Results:**

```typescript
const pollStatus = async (jobId: string) => {
  const response = await fetch(`/api/transcribe-job/${jobId}/status`);
  const result = await response.json();

  if (result.status === 'completed') {
    console.log('Transcript:', result.transcript);
    console.log('Utterances:', result.utterances);
    // utterances is an array of Utterance objects
  }
};
```

**Response Format:**

```json
{
  "jobId": "uuid-123",
  "status": "completed",
  "transcript": "Full transcript text...",
  "utterances": [
    {
      "speaker": "A",
      "text": "Hello, how are you?",
      "start": 1000,
      "end": 3000,
      "confidence": 0.95
    },
    {
      "speaker": "B",
      "text": "I'm doing well, thank you.",
      "start": 3200,
      "end": 5500,
      "confidence": 0.92
    }
  ]
}
```

#### Provider Factory Usage

```typescript
import { TranscriptionProviderFactory } from './providers/factory';

// Create provider based on requirements
const provider = TranscriptionProviderFactory.create({
  provider: 'assemblyai', // or 'openai'
  apiKey: process.env.ASSEMBLYAI_API_KEY,
  enableSpeakerDiarization: true,
});

// Transcribe with speaker diarization
const result = await provider.transcribe({
  audioFile: buffer,
  language: 'en',
  enableSpeakerDiarization: true,
  speakersExpected: 2,
});

console.log(result.text); // Full transcript
console.log(result.utterances); // Speaker-labeled segments
```

#### Frontend Component Usage

**Configuration Toggle:**

```tsx
import { SpeakerDiarizationToggle } from '@/features/configuration/components/SpeakerDiarizationToggle';

function MyConfigPage() {
  const [enabled, setEnabled] = useState(false);
  const [speakersExpected, setSpeakersExpected] = useState<number | undefined>();

  return (
    <SpeakerDiarizationToggle
      enabled={enabled}
      speakersExpected={speakersExpected}
      onEnabledChange={setEnabled}
      onSpeakersExpectedChange={setSpeakersExpected}
    />
  );
}
```

**Display Component:**

```tsx
import { SpeakerTranscriptView } from '@/features/results/components/SpeakerTranscriptView';

function ResultsPage({ result, audioPlayer }) {
  if (result.utterances && result.utterances.length > 0) {
    return (
      <SpeakerTranscriptView
        utterances={result.utterances}
        currentTime={audioPlayer.currentTime}
        onTimestampClick={(time) => audioPlayer.seek(time)}
      />
    );
  }

  // Fallback to standard transcript view
  return <SearchableTranscript transcript={result.transcript} />;
}
```

---

## Technical Details

### Provider Selection Logic

```typescript
// Factory automatically selects the right provider
static create(config: ProviderConfig): TranscriptionProvider {
  switch (config.provider) {
    case 'assemblyai':
      if (config.enableSpeakerDiarization) {
        return new AssemblyAIProvider({ apiKey: config.apiKey });
      }
      // Fall back to OpenAI for cost efficiency
      return new OpenAIProvider(config.apiKey);

    case 'openai':
      return new OpenAIProvider(config.apiKey);

    default:
      throw new Error(`Unknown provider: ${config.provider}`);
  }
}
```

### Dual Transcription Paths

#### Standard Path (OpenAI)

1. **Chunk audio** - Split into 24MB segments
2. **Parallel processing** - Process chunks concurrently with rate limiting
3. **Assemble transcript** - Join chunks with overlap handling
4. **No utterances** - Single continuous transcript

#### Speaker Diarization Path (AssemblyAI)

1. **Upload full file** - Send complete audio (no chunking)
2. **Submit job** - AssemblyAI processes asynchronously
3. **Poll for completion** - Check status every 5 seconds
4. **Return utterances** - Get speaker-labeled segments

**Key Difference:** AssemblyAI needs the full audio file to maintain speaker consistency across the entire recording.

### Performance Characteristics

| Metric                    | Standard (OpenAI) | Speaker Diarization (AssemblyAI)   |
| ------------------------- | ----------------- | ---------------------------------- |
| **Processing Time**       | 1-2 minutes       | 2-5 minutes                        |
| **Cost per minute**       | $0.006            | $0.015                             |
| **Accuracy**              | 95-98%            | 90-95% (speaker ID), 95-98% (text) |
| **Max Audio Size**        | 500MB             | 500MB                              |
| **Concurrent Processing** | Yes (chunked)     | No (full file)                     |
| **Speaker Limit**         | N/A               | 2-10 optimal                       |

### Error Handling

**Common Errors:**

1. **Timeout** - Processing exceeded max polling attempts (60 attempts × 5s = 5 minutes)

   ```typescript
   throw new Error('Transcription timeout after 60 attempts');
   ```

2. **Audio File Corrupted**

   ```typescript
   // AssemblyAI returns error status
   { status: 'error', error: 'Audio file is corrupted' }
   ```

3. **Network Errors**

   ```typescript
   // Axios request failed
   throw new Error('Network error: Failed to upload audio');
   ```

4. **API Key Invalid**
   ```typescript
   // 401 Unauthorized
   throw new Error('AssemblyAI API key is required');
   ```

**Retry Logic:**

- AssemblyAI provider retries automatically on transient errors
- Max 60 polling attempts with 5s intervals
- Falls back gracefully to error state in job system

---

## Testing

### Test Coverage

**Backend (25 tests):**

- ✅ AssemblyAI provider (7 tests)
  - Upload and transcription flow
  - Speaker diarization enabled/disabled
  - Speaker count specification
  - Error handling
  - Timeout handling
- ✅ Factory pattern (9 tests)
  - Provider creation for each type
  - Default provider selection
  - Speaker diarization support checks
- ✅ Integration (9 tests)
  - Job configuration with speaker settings
  - Utterances storage and retrieval
  - TranscriptionResponse structure

**Run Tests:**

```bash
# All provider tests
npm run api-test -- api/__tests__/providers/

# Speaker diarization integration tests
npm run api-test -- api/__tests__/transcribe-speaker-diarization-unit.test.ts

# All tests
npm test
```

### Manual Testing Checklist

**UI Flow:**

- [ ] Toggle speaker diarization ON
- [ ] Enter speaker count (2-10)
- [ ] Upload audio file with multiple speakers
- [ ] Verify job status shows "Transcribing"
- [ ] Verify results show utterances with speaker labels
- [ ] Verify each speaker has unique color
- [ ] Click timestamp to jump in audio
- [ ] Search for text across utterances
- [ ] Verify active utterance highlights during playback

**Edge Cases:**

- [ ] Toggle speaker diarization OFF (should use OpenAI)
- [ ] Leave speaker count blank (auto-detection)
- [ ] Single speaker audio (works but inefficient)
- [ ] Very short audio (<10s)
- [ ] Very long audio (>60 minutes)
- [ ] Poor audio quality
- [ ] Multiple languages in one recording

---

## Limitations & Future Improvements

### Current Limitations

1. **Speaker Identification:** Speakers labeled as "A", "B", "C" etc. (not named)
2. **Speaker Overlap:** Overlapping speech may be attributed to one speaker
3. **Speaker Count:** Best with 2-10 speakers, degrades beyond that
4. **Processing Time:** 2-5 minutes (slower than standard transcription)
5. **Cost:** 2.5x more expensive than standard transcription ($0.015 vs $0.006 per minute)

### Future Enhancements

**Near-term (Phase 4):**

- [ ] Speaker name mapping (assign custom names to speakers)
- [ ] Speaker voice profiles (recognize known speakers)
- [ ] Confidence threshold filtering (hide low-confidence segments)

**Long-term:**

- [ ] Real-time speaker diarization (live transcription)
- [ ] Speaker emotion detection
- [ ] Automatic speaker role identification (host, guest, etc.)
- [ ] Support for >10 speakers
- [ ] Multilingual speaker diarization

---

## Troubleshooting

### Speaker Diarization Not Working

**Symptom:** Results show regular transcript instead of speaker-labeled utterances

**Possible Causes:**

1. Speaker diarization toggle not enabled
2. API using BYOK OpenAI key (doesn't support speaker diarization)
3. Job configuration not saving speaker settings
4. AssemblyAI API key not configured

**Solution:**

```bash
# Check job configuration
curl http://localhost:3001/api/transcribe-job/YOUR_JOB_ID/status

# Verify enableSpeakerDiarization is true in job config
# Verify utterances array exists in response
```

### Poor Speaker Accuracy

**Symptom:** Speakers frequently mislabeled or merged

**Possible Causes:**

1. Similar-sounding voices
2. Poor audio quality
3. Speaker overlap
4. Background noise
5. Incorrect speaker count

**Solution:**

- Use separate microphones for each speaker
- Reduce background noise
- Specify expected speaker count
- Ensure clear, distinct voices
- Avoid speaker overlap

### Processing Timeout

**Symptom:** Job status shows "failed" with timeout error

**Possible Causes:**

1. Very long audio file (>60 minutes)
2. Network issues
3. AssemblyAI service degradation

**Solution:**

- Split audio into smaller segments (<30 minutes)
- Retry the request
- Check AssemblyAI status page
- Increase maxPollingAttempts in AssemblyAIProvider config

---

## API Reference

See full API documentation in `/docs/api/TRANSCRIPTION_API.md`

**Key Endpoints:**

- `POST /api/transcribe` - Create transcription job with speaker diarization
- `GET /api/transcribe-job/:id/status` - Poll job status and get results

**Environment Variables:**

```bash
ASSEMBLYAI_API_KEY=your_assemblyai_api_key_here
```

---

## Resources

**External Documentation:**

- [AssemblyAI Speaker Diarization Docs](https://www.assemblyai.com/docs/audio-intelligence#speaker-diarization)
- [OpenAI Whisper API](https://platform.openai.com/docs/guides/speech-to-text)

**Internal Documentation:**

- [Provider Factory Pattern](/docs/architecture/PROVIDER_PATTERN.md)
- [Job System Architecture](/docs/architecture/JOB_SYSTEM.md)
- [Frontend State Management](/docs/architecture/STATE_MANAGEMENT.md)

---

**Last Updated:** 2026-02-06
**Maintained By:** Trammarise Development Team
