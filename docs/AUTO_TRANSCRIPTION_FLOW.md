# Automatic Transcription Flow

## Overview

This document explains how automatic transcription works from scheduling a meeting to getting AI-powered insights.

## Complete Flow

### 1. Schedule a Meeting

**User Action**: Navigate to `/schedule` and create a meeting

**What Happens**:
```
User fills form → Clicks "Schedule Meeting"
    ↓
POST /api/meetings
    ↓
Creates Google Calendar event with Meet link
    ↓
Stores meeting in Firestore
    ↓
Sends email invitations to all participants
    ↓
Returns meeting ID and Meet link
```

**Result**: Meeting is scheduled with a unique ID and Google Meet link

---

### 2. Join the Meeting

**User Action**: Click "Join Meeting Room (Auto-Transcription)" button

**What Happens**:
```
User clicks button → Redirects to /meeting?id={meetingId}
    ↓
Page loads meeting details
    ↓
User clicks "Join Meeting & Start Transcription"
    ↓
POST /api/meetings/{meetingId}/join
    ↓
Updates meeting status to "in-progress"
    ↓
Creates transcription session in Firestore
    ↓
Returns transcriptionSessionId
    ↓
Automatically starts recording
    ↓
Connects to WebSocket server (ws://localhost:8080)
    ↓
Begins capturing audio from microphone
```

**Result**: Transcription is now running automatically

---

### 3. During the Meeting

**What Happens**:
```
Audio captured from microphone (every 1 second)
    ↓
Sent to WebSocket server
    ↓
Server transcribes audio
    ↓
Transcript stored in Firestore
    ↓
Transcript sent back to client
    ↓
Displayed in real-time in side panel
```

**User Sees**:
- Live transcripts appearing in the side panel
- Speaker identification
- Confidence scores
- Timestamps
- Recording indicator (red dot)

---

### 4. End the Meeting

**User Action**: Click "End" button

**What Happens**:
```
User clicks "End"
    ↓
Stops audio recording
    ↓
Sends 'end_meeting' message to WebSocket
    ↓
POST /api/meetings/{meetingId}/join (action: leave)
    ↓
Updates meeting status to "completed"
    ↓
Automatically triggers analysis
    ↓
POST /api/meetings/{meetingId}/analyze
    ↓
Fetches all transcripts from Firestore
    ↓
Combines into full transcript
    ↓
Sends to Vertex AI (Gemini 1.5 Pro)
    ↓
AI analyzes and extracts:
  • Action items with assignees
  • Sentiment analysis
  • Key topics
  • Decisions made
  • Next steps
  • Risks and mitigation
    ↓
Stores analysis in Firestore
    ↓
Creates action items as separate documents
    ↓
Redirects to meeting details page
```

**Result**: Complete meeting analysis available

---

## File Structure

### Frontend Components

```
app/
├── schedule/page.tsx              # Schedule meeting form
├── meeting/page.tsx                # Meeting room with auto-transcription
└── dashboard/meet/[meetingId]/
    ├── page.tsx                    # Meeting details & analysis
    └── transcribe/page.tsx         # Manual transcription page

components/
└── RealTimeTranscription.tsx      # Transcription UI component

lib/
└── hooks/
    └── useTranscription.ts         # Transcription hook
```

### Backend APIs

```
app/api/
├── meetings/
│   ├── route.ts                    # Create/list meetings
│   └── [meetingId]/
│       ├── join/route.ts           # Join/leave meeting
│       └── analyze/route.ts        # Trigger AI analysis
└── transcription/
    └── route.ts                    # Transcription operations

server/
└── transcription-server.js         # WebSocket server
```

### Data Storage

```
Firestore Collections:
├── meetings                        # Meeting metadata
├── transcripts                     # Individual transcripts
├── transcription_sessions          # Active sessions
├── meeting_analysis                # AI analysis results
└── action-items                    # Extracted action items
```

---

## API Endpoints

### POST /api/meetings
Create a new meeting with Google Calendar integration

**Request**:
```json
{
  "title": "Team Standup",
  "description": "Daily standup meeting",
  "startTime": "2025-11-08T10:00:00Z",
  "endTime": "2025-11-08T10:30:00Z",
  "attendees": ["john@example.com", "sarah@example.com"]
}
```

**Response**:
```json
{
  "success": true,
  "meeting": {
    "id": "meeting-123",
    "title": "Team Standup",
    "meetingLink": "https://meet.google.com/abc-defg-hij",
    "calendarEventId": "event-456"
  }
}
```

---

### POST /api/meetings/{meetingId}/join
Join or leave a meeting

**Request**:
```json
{
  "action": "join"  // or "leave"
}
```

**Response**:
```json
{
  "success": true,
  "meetingId": "meeting-123",
  "transcriptionSessionId": "session_meeting-123_1699459200000",
  "message": "Joined meeting successfully. Transcription session started."
}
```

---

### POST /api/meetings/{meetingId}/analyze
Trigger Vertex AI analysis

**Response**:
```json
{
  "success": true,
  "analysis": {
    "actionItems": [
      {
        "task": "Follow up with client",
        "assignee": "John",
        "priority": "high",
        "dueDate": "2025-11-10"
      }
    ],
    "sentiment": {
      "overall": "positive",
      "score": 0.75
    },
    "keyTopics": ["budget", "timeline", "resources"],
    "summary": "Meeting covered project updates..."
  }
}
```

---

## WebSocket Protocol

### Connect
```javascript
const ws = new WebSocket('ws://localhost:8080');
```

### Start Meeting
```json
{
  "type": "start_meeting",
  "meetingId": "meeting-123",
  "participants": ["John", "Sarah"]
}
```

### Send Audio
```json
{
  "type": "audio",
  "audioData": <Blob>,
  "meetingId": "meeting-123"
}
```

### Receive Transcript
```json
{
  "type": "transcript",
  "speaker": "Speaker 1",
  "text": "Let's discuss the project timeline",
  "confidence": 0.92,
  "timestamp": "2025-11-08T10:05:23Z",
  "isFinal": true
}
```

### End Meeting
```json
{
  "type": "end_meeting",
  "meetingId": "meeting-123"
}
```

---

## User Journey

### Scenario: Team Lead Scheduling a Meeting

1. **Schedule** (2 minutes)
   - Go to `/schedule`
   - Fill in meeting details
   - Add team members' emails
   - Click "Schedule Meeting"
   - ✅ Meeting created, invitations sent

2. **Join** (30 seconds)
   - Click "Join Meeting Room" from success page
   - Click "Join Meeting & Start Transcription"
   - ✅ Transcription starts automatically

3. **During Meeting** (30 minutes)
   - Discuss project updates
   - Make decisions
   - Assign tasks
   - ✅ Everything transcribed in real-time

4. **End Meeting** (10 seconds)
   - Click "End" button
   - ✅ Automatically triggers AI analysis

5. **Review Results** (5 minutes)
   - Redirected to meeting details page
   - View action items
   - Check sentiment analysis
   - Read meeting summary
   - ✅ All insights ready to use

**Total Time**: ~38 minutes (30 min meeting + 8 min setup/review)
**Manual Work**: Minimal - just click buttons!

---

## Configuration

### Environment Variables

Required in `.env.local`:

```bash
# Google Cloud
GOOGLE_SERVICE_ACCOUNT_KEY=<base64-encoded-json>
GOOGLE_PROJECT_ID=your-project-id
VERTEX_AI_LOCATION=us-central1

# Firebase
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=service-account@project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# WebSocket
NEXT_PUBLIC_WS_URL=ws://localhost:8080

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
```

---

## Running the System

### Development

1. **Start Transcription Server**:
   ```bash
   node server/transcription-server.js
   ```

2. **Start Next.js App**:
   ```bash
   npm run dev
   ```

3. **Test the Flow**:
   - Go to `http://localhost:3000/schedule`
   - Create a meeting
   - Click "Join Meeting Room"
   - Click "Join Meeting & Start Transcription"
   - Watch transcripts appear
   - Click "End" to trigger analysis

### Production

1. **Deploy WebSocket Server** separately (VPS, container, etc.)
2. **Update** `NEXT_PUBLIC_WS_URL` to production WebSocket URL
3. **Enable** Google Cloud APIs (Speech-to-Text, Vertex AI)
4. **Replace** mock transcription with real Google Speech API
5. **Deploy** Next.js app to Vercel/your hosting

---

## Troubleshooting

### Transcription Not Starting

**Check**:
- WebSocket server is running (`node server/transcription-server.js`)
- Browser console for connection errors
- Microphone permissions granted
- `NEXT_PUBLIC_WS_URL` is correct

**Fix**:
```bash
# Test WebSocket connection
wscat -c ws://localhost:8080

# Check if port is open
netstat -an | grep 8080
```

---

### Analysis Not Triggered

**Check**:
- Vertex AI credentials are correct
- Firestore has transcripts stored
- API endpoint is accessible
- Browser console for errors

**Fix**:
```bash
# Test analysis endpoint
curl -X POST http://localhost:3000/api/meetings/test-meeting-123/analyze \
  -H "Content-Type: application/json"
```

---

### No Transcripts in Firestore

**Check**:
- Firebase credentials are correct
- Firestore rules allow writes
- WebSocket server is storing transcripts
- Network connectivity

**Fix**:
- Check server logs: `node server/transcription-server.js`
- Verify Firestore rules in Firebase Console
- Test Firestore connection manually

---

## Benefits

### For Users
✅ **Zero Manual Work** - Transcription starts automatically
✅ **Real-Time Feedback** - See transcripts as they happen
✅ **Instant Insights** - AI analysis ready when meeting ends
✅ **Action Items** - Automatically extracted and assigned
✅ **Meeting Summary** - Professional summary generated

### For Developers
✅ **Simple Integration** - Just add the component
✅ **Flexible** - Works with any meeting platform
✅ **Scalable** - WebSocket server handles multiple sessions
✅ **Extensible** - Easy to add more AI features

---

## Next Steps

1. **Integrate with Google Meet** - Auto-join meetings
2. **Add Speaker Diarization** - Better speaker identification
3. **Real-Time Analysis** - Show insights during meeting
4. **Email Summaries** - Send analysis to participants
5. **Calendar Integration** - Auto-schedule follow-ups

---

## Support

For questions or issues:
- See `docs/TRANSCRIPTION_SYSTEM.md` for technical details
- See `docs/QUICK_START_TRANSCRIPTION.md` for setup guide
- Check browser console for errors
- Review server logs for WebSocket issues
