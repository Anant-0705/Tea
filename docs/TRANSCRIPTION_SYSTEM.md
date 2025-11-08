# Real-Time Transcription & AI Analysis System

## Overview

This system provides real-time meeting transcription with automatic Vertex AI analysis. It captures audio from when users enter a meeting until it ends, stores all transcripts in Firestore, and sends them to Vertex AI for comprehensive insights.

## Architecture

```
┌─────────────────┐
│  Meeting UI     │
│  (React)        │
└────────┬────────┘
         │
         ├─ WebSocket Connection
         │
┌────────▼────────────────────┐
│  Transcription Server       │
│  (WebSocket Server)         │
│  - Receives audio streams   │
│  - Manages sessions         │
│  - Stores transcripts       │
└────────┬────────────────────┘
         │
         ├─ HTTP API Calls
         │
┌────────▼────────────────────┐
│  Next.js API Routes         │
│  /api/transcription         │
│  /api/meetings/[id]/analyze │
└────────┬────────────────────┘
         │
         ├─ Store & Retrieve
         │
┌────────▼────────────────────┐
│  Firestore Database         │
│  - transcripts              │
│  - meeting_analysis         │
│  - action-items             │
└────────┬────────────────────┘
         │
         ├─ AI Analysis
         │
┌────────▼────────────────────┐
│  Vertex AI (Gemini)         │
│  - Transcript analysis      │
│  - Action item extraction   │
│  - Sentiment analysis       │
│  - Summary generation       │
└─────────────────────────────┘
```

## Components

### 1. WebSocket Transcription Server (`server/transcription-server.js`)

**Purpose**: Manages real-time audio streaming and transcription

**Features**:
- WebSocket server on port 8080
- Session management for active meetings
- Real-time transcript storage
- Automatic analysis trigger on meeting end

**Key Methods**:
- `handleStartMeeting()` - Initialize transcription session
- `handleAudioData()` - Process incoming audio chunks
- `handleEndMeeting()` - End session and trigger analysis
- `storeTranscriptInFirestore()` - Save transcripts to database

**Usage**:
```bash
# Start the transcription server
node server/transcription-server.js
```

### 2. React Hook (`lib/hooks/useTranscription.ts`)

**Purpose**: Client-side hook for managing transcription sessions

**Features**:
- WebSocket connection management
- Audio capture from microphone
- Real-time transcript updates
- Automatic reconnection

**Usage**:
```typescript
import { useTranscription } from '@/lib/hooks/useTranscription';

const {
  isConnected,
  isRecording,
  transcripts,
  startMeeting,
  stopMeeting,
} = useTranscription({
  meetingId: 'meeting-123',
  participants: ['John', 'Sarah', 'Mike'],
  onTranscript: (transcript) => {
    console.log('New transcript:', transcript);
  },
  onMeetingEnd: (count) => {
    console.log(`Meeting ended with ${count} transcripts`);
  },
});
```

### 3. UI Component (`components/RealTimeTranscription.tsx`)

**Purpose**: Display live transcription and controls

**Features**:
- Start/stop recording controls
- Live transcript display with speaker identification
- Confidence scores visualization
- Analysis status indicators
- Auto-scroll to latest transcript

**Usage**:
```tsx
import RealTimeTranscription from '@/components/RealTimeTranscription';

<RealTimeTranscription
  meetingId="meeting-123"
  participants={['John', 'Sarah', 'Mike']}
  onAnalysisComplete={() => {
    console.log('Analysis complete!');
  }}
/>
```

### 4. API Routes

#### `/api/transcription` (POST)

**Purpose**: Handle transcription operations

**Actions**:
- `start_session` - Start a new transcription session
- `add_transcript` - Add real-time transcript
- `end_session` - End session and generate analysis
- `get_session` - Get session status

**Example**:
```typescript
// Start session
const response = await fetch('/api/transcription', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'start_session',
    meetingId: 'meeting-123',
    participants: ['John', 'Sarah'],
  }),
});

// End session
await fetch('/api/transcription', {
  method: 'POST',
  body: JSON.stringify({
    action: 'end_session',
    sessionId: 'session-abc',
  }),
});
```

#### `/api/meetings/[meetingId]/analyze` (POST)

**Purpose**: Trigger Vertex AI analysis for a completed meeting

**Process**:
1. Fetch all transcripts from Firestore
2. Combine into full transcript
3. Send to Vertex AI for analysis
4. Store results in Firestore
5. Create action items

**Response**:
```json
{
  "success": true,
  "analysis": {
    "actionItems": [...],
    "insights": [...],
    "sentiment": {...},
    "summary": "...",
    "keyTopics": [...],
    "decisions": [...],
    "nextSteps": [...]
  },
  "summary": {
    "executiveSummary": "...",
    "detailedReport": "...",
    "recommendedActions": [...]
  }
}
```

### 5. Vertex AI Integration (`lib/google/vertex-ai.ts`)

**Purpose**: AI-powered transcript analysis

**Features**:
- Action item extraction with assignees and priorities
- Sentiment analysis per participant
- Key topic identification
- Decision tracking
- Risk assessment
- Next steps generation

**Main Functions**:

#### `analyzeTranscriptWithVertexAI()`
Comprehensive transcript analysis using Gemini 1.5 Pro

**Input**:
```typescript
{
  transcript: string,
  participants: string[],
  meetingContext: {
    title: string,
    date: string,
    duration: number
  }
}
```

**Output**:
```typescript
{
  actionItems: ActionItem[],
  insights: MeetingInsight[],
  sentiment: SentimentAnalysis,
  summary: string,
  keyTopics: string[],
  decisions: string[],
  nextSteps: string[],
  questionsRaised: string[],
  riskAssessment: {
    risks: string[],
    mitigation: string[]
  }
}
```

#### `generateMeetingSummary()`
Generate executive summary and detailed report

**Output**:
```typescript
{
  executiveSummary: string,
  detailedReport: string,
  recommendedActions: string[]
}
```

## Workflow

### Complete Meeting Flow

1. **User Joins Meeting**
   ```typescript
   // Component mounts and connects to WebSocket
   useTranscription({ meetingId, participants })
   ```

2. **Start Recording**
   ```typescript
   // User clicks "Start Recording"
   startMeeting()
   // → Sends 'start_meeting' message to WebSocket
   // → Captures audio from microphone
   // → Sends audio chunks every 1 second
   ```

3. **Real-Time Transcription**
   ```typescript
   // Server receives audio
   handleAudioData(audioData)
   // → Transcribes audio (mock in dev, real in prod)
   // → Stores in session
   // → Sends transcript to client
   // → Stores in Firestore
   ```

4. **Stop Recording**
   ```typescript
   // User clicks "Stop & Analyze"
   stopMeeting()
   // → Sends 'end_meeting' message
   // → Server triggers analysis
   ```

5. **AI Analysis**
   ```typescript
   // Server calls analysis API
   POST /api/meetings/{meetingId}/analyze
   // → Fetches all transcripts
   // → Sends to Vertex AI
   // → Stores analysis results
   // → Creates action items
   ```

6. **Display Results**
   ```typescript
   // Client receives analysis complete
   onAnalysisComplete()
   // → Shows success message
   // → Redirects to analysis page
   ```

## Firestore Collections

### `transcripts`
```typescript
{
  id: string,
  meetingId: string,
  speaker: string,
  text: string,
  timestamp: string,
  confidence: number,
  sessionId?: string,
  createdAt: string
}
```

### `meeting_analysis`
```typescript
{
  meetingId: string,
  analysis: TranscriptAnalysis,
  summary: MeetingSummary,
  fullTranscript: string,
  analyzedAt: string,
  analyzedBy: string
}
```

### `action-items`
```typescript
{
  id: string,
  meetingId: string,
  task: string,
  assignee?: string,
  priority: 'low' | 'medium' | 'high',
  status: 'pending' | 'in-progress' | 'completed',
  dueDate?: string,
  createdAt: string,
  updatedAt: string
}
```

## Environment Variables

Required in `.env.local`:

```bash
# Google Cloud Configuration
GOOGLE_SERVICE_ACCOUNT_KEY=<base64-encoded-json>
GOOGLE_PROJECT_ID=your-project-id
VERTEX_AI_LOCATION=us-central1

# Firebase Configuration
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# WebSocket Server
NEXT_PUBLIC_WS_URL=ws://localhost:8080
```

## Development vs Production

### Development Mode
- Mock transcription with predefined phrases
- Simulated processing delays
- Console logging for debugging
- No actual Google Cloud Speech API calls

### Production Mode
- Real Google Cloud Speech-to-Text API
- Actual Vertex AI analysis
- Proper error handling and retries
- Performance monitoring

## Testing

### 1. Start the Transcription Server
```bash
node server/transcription-server.js
```

### 2. Start the Next.js App
```bash
npm run dev
```

### 3. Test the Flow
1. Navigate to a meeting page
2. Click "Start Recording"
3. Speak or wait for mock transcripts
4. Click "Stop & Analyze"
5. Wait for Vertex AI analysis
6. View results in the UI

## Troubleshooting

### WebSocket Connection Issues
```bash
# Check if server is running
netstat -an | grep 8080

# Check firewall settings
# Ensure port 8080 is open
```

### Transcription Not Appearing
- Check browser console for errors
- Verify microphone permissions
- Check WebSocket connection status
- Review server logs

### Analysis Failing
- Verify Vertex AI credentials
- Check API quotas in Google Cloud Console
- Review Firestore permissions
- Check network connectivity

## Future Enhancements

1. **Real Google Speech-to-Text Integration**
   - Replace mock transcription with actual API
   - Add language detection
   - Support multiple languages

2. **Speaker Diarization**
   - Automatic speaker identification
   - Voice fingerprinting
   - Speaker labeling

3. **Real-Time Analysis**
   - Stream analysis during meeting
   - Live action item detection
   - Real-time sentiment tracking

4. **Advanced Features**
   - Meeting highlights
   - Automatic note-taking
   - Smart meeting summaries
   - Integration with calendar and email

## Support

For issues or questions:
1. Check the logs in `server/transcription-server.js`
2. Review browser console for client-side errors
3. Verify environment variables are set correctly
4. Check Google Cloud Console for API errors
