# Quick Start: Real-Time Transcription with Vertex AI

## Setup (5 minutes)

### 1. Start the Transcription Server

Open a terminal and run:

```bash
node server/transcription-server.js
```

You should see:
```
🎙️  Transcription WebSocket server starting on port 8080
✅ Transcription server ready on ws://localhost:8080
```

### 2. Start the Next.js App

In another terminal:

```bash
npm run dev
```

### 3. Test the System

1. Navigate to: `http://localhost:3000/dashboard/meet/test-meeting-123/transcribe`

2. Click **"Start Recording"**
   - Grant microphone permissions when prompted
   - You'll see mock transcripts appearing every 1-3 seconds

3. Watch the transcripts appear in real-time with:
   - Speaker identification
   - Confidence scores
   - Timestamps

4. Click **"Stop & Analyze"** after 30-60 seconds
   - The system will send all transcripts to Vertex AI
   - Analysis includes:
     - Action items with assignees
     - Sentiment analysis
     - Key topics
     - Meeting summary
     - Decisions made
     - Next steps

5. View the results on the meeting details page

## What's Happening Behind the Scenes

### During Recording:

```
User clicks "Start Recording"
    ↓
Microphone captures audio
    ↓
Audio chunks sent to WebSocket server (every 1 second)
    ↓
Server transcribes audio (mock in dev, real in production)
    ↓
Transcripts stored in Firestore
    ↓
Transcripts sent back to client for display
```

### After Stopping:

```
User clicks "Stop & Analyze"
    ↓
Server sends 'end_meeting' message
    ↓
API endpoint /api/meetings/[id]/analyze called
    ↓
All transcripts fetched from Firestore
    ↓
Combined transcript sent to Vertex AI (Gemini 1.5 Pro)
    ↓
AI analyzes and extracts:
  - Action items
  - Insights
  - Sentiment
  - Key topics
  - Decisions
  - Risks
    ↓
Results stored in Firestore
    ↓
Action items created as separate documents
    ↓
Client notified of completion
```

## Example Output

After analysis, you'll get:

### Action Items
```json
[
  {
    "task": "Follow up with client on budget approval",
    "assignee": "John",
    "priority": "high",
    "dueDate": "2025-11-10",
    "status": "pending"
  },
  {
    "task": "Update project timeline document",
    "assignee": "Sarah",
    "priority": "medium",
    "dueDate": "2025-11-12",
    "status": "pending"
  }
]
```

### Sentiment Analysis
```json
{
  "overall": "positive",
  "score": 0.75,
  "participantSentiments": [
    {
      "participant": "Speaker 1",
      "sentiment": "positive",
      "score": 0.8
    }
  ]
}
```

### Key Topics
```
["budget allocation", "project timeline", "team coordination", "client feedback"]
```

### Summary
```
"Meeting covered project updates and budget discussions. Team aligned on priorities 
and assigned action items. Overall positive progress with clear deliverables identified."
```

## Integrating into Your App

### Add to Any Meeting Page

```tsx
import RealTimeTranscription from '@/components/RealTimeTranscription';

export default function YourMeetingPage() {
  return (
    <RealTimeTranscription
      meetingId="your-meeting-id"
      participants={['John', 'Sarah', 'Mike']}
      onAnalysisComplete={() => {
        // Handle completion
        console.log('Analysis done!');
      }}
    />
  );
}
```

### Use the Hook Directly

```tsx
import { useTranscription } from '@/lib/hooks/useTranscription';

const {
  isRecording,
  transcripts,
  startMeeting,
  stopMeeting,
} = useTranscription({
  meetingId: 'meeting-123',
  participants: ['John', 'Sarah'],
  onTranscript: (transcript) => {
    console.log('New:', transcript.text);
  },
});
```

### Trigger Analysis Manually

```typescript
const response = await fetch(`/api/meetings/${meetingId}/analyze`, {
  method: 'POST',
});

const { analysis, summary } = await response.json();
console.log('Action items:', analysis.actionItems);
console.log('Summary:', summary.executiveSummary);
```

## Production Deployment

### 1. Enable Google Cloud APIs

In Google Cloud Console, enable:
- Cloud Speech-to-Text API
- Vertex AI API
- Cloud Firestore API

### 2. Update Environment Variables

Ensure these are set in production:
```bash
GOOGLE_SERVICE_ACCOUNT_KEY=<base64-encoded-json>
GOOGLE_PROJECT_ID=your-project-id
VERTEX_AI_LOCATION=us-central1
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

### 3. Replace Mock Transcription

In `server/transcription-server.js`, replace `simulateTranscription()` with actual Google Cloud Speech-to-Text API calls.

### 4. Deploy WebSocket Server

Deploy the transcription server separately (e.g., on a VPS or container):
```bash
# On your server
node server/transcription-server.js

# Or use PM2 for process management
pm2 start server/transcription-server.js --name transcription-server
```

### 5. Update WebSocket URL

Set the production WebSocket URL:
```bash
NEXT_PUBLIC_WS_URL=wss://your-transcription-server.com
```

## Troubleshooting

### No transcripts appearing?
- Check browser console for errors
- Verify microphone permissions
- Ensure WebSocket server is running
- Check `ws://localhost:8080` is accessible

### Analysis failing?
- Verify Vertex AI credentials are correct
- Check Google Cloud Console for API errors
- Ensure Firestore has proper permissions
- Review server logs for errors

### WebSocket connection issues?
```bash
# Test WebSocket connection
wscat -c ws://localhost:8080

# Check if port is open
netstat -an | grep 8080
```

## Next Steps

1. **Customize the UI** - Modify `components/RealTimeTranscription.tsx`
2. **Add more analysis** - Extend `lib/google/vertex-ai.ts`
3. **Integrate with calendar** - Auto-start transcription for scheduled meetings
4. **Add notifications** - Alert users when analysis is complete
5. **Export transcripts** - Add PDF/Word export functionality

## Support

For detailed documentation, see: `docs/TRANSCRIPTION_SYSTEM.md`
