# Google Meet Auto-Transcription Guide

## 🎯 Overview

This guide explains how to automatically transcribe your Google Meet meetings from start to finish.

---

## 🚀 How It Works

### The Flow

```
Schedule Meeting
    ↓
Click "Join Google Meet (Auto-Transcription)"
    ↓
Transcription starts in background
    ↓
Google Meet opens in new tab
    ↓
You join and conduct your meeting
    ↓
Everything is transcribed automatically
    ↓
Click "End Meeting & Analyze" when done
    ↓
AI analyzes and extracts insights
```

---

## 📋 Step-by-Step Instructions

### Step 1: Schedule Your Meeting

1. Go to `http://localhost:3000/schedule`
2. Fill in meeting details:
   - Title
   - Date & Time
   - Participants (emails)
   - Description
3. Click **"Schedule Meeting"**

✅ **Result**: Meeting created with Google Meet link

---

### Step 2: Join with Auto-Transcription

On the success page, you'll see:

```
✅ Meeting Scheduled!

[Join Google Meet (Auto-Transcription)]
💡 Opens Google Meet & starts transcription automatically
```

**Click the button** and:

1. ✅ Transcription session starts
2. ✅ Google Meet opens in new tab
3. ✅ You're redirected to transcription monitoring page
4. ✅ Floating widget appears showing live progress

---

### Step 3: Join Your Google Meet

1. **Switch to the Google Meet tab** that just opened
2. **Click "Join now"** in Google Meet
3. **Conduct your meeting normally**

**Meanwhile, in the background**:
- Your microphone audio is being captured
- Speech is being transcribed in real-time
- Transcripts are stored in Firestore
- Everything happens automatically!

---

### Step 4: Monitor Progress (Optional)

You can:

- **Keep the transcription page open** to see the floating widget
- **Check transcript count** in real-time
- **See recent transcripts** as they're captured
- **Minimize the widget** to save space

The widget shows:
```
🔴 Recording
42 transcripts
Recent:
"Let's discuss the project timeline..."
"I'll handle the frontend implementation..."
```

---

### Step 5: End the Meeting

When your Google Meet ends:

1. **Go back to the transcription page** (or use the floating widget)
2. **Click "End Meeting & Analyze"**

✅ **What happens automatically**:
- Recording stops
- All transcripts sent to Vertex AI
- AI analyzes everything:
  - Extracts action items
  - Analyzes sentiment
  - Identifies key topics
  - Generates summary
  - Tracks decisions
- Results stored in Firestore
- You're redirected to meeting details page

---

## 🎨 User Interface

### Success Page After Scheduling

```
┌─────────────────────────────────────┐
│  ✅ Meeting Scheduled!              │
│                                     │
│  Your meeting "Team Standup" has    │
│  been scheduled successfully.       │
│                                     │
│  📧 Invitations sent to 3 of 3      │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ Google Meet Link:           │   │
│  │ meet.google.com/abc-defg    │   │
│  └─────────────────────────────┘   │
│                                     │
│  [Join Google Meet (Auto-Trans)]   │
│  💡 Opens Meet & starts trans      │
│                                     │
│  [Go to Dashboard]                 │
│  [Schedule Another Meeting]        │
└─────────────────────────────────────┘
```

---

### Transcription Monitoring Page

```
┌─────────────────────────────────────┐
│  ✅ Transcription Active            │
│                                     │
│  Your meeting is being transcribed  │
│  in the background                  │
│                                     │
│  What's Happening:                  │
│  1️⃣ Audio Capture                  │
│     Microphone capturing audio      │
│                                     │
│  2️⃣ Real-Time Transcription        │
│     Speech → Text → Firestore       │
│                                     │
│  3️⃣ Background Processing          │
│     Works even if you close tab     │
│                                     │
│  4️⃣ AI Analysis (After Meeting)    │
│     Vertex AI extracts insights     │
│                                     │
│  💡 Pro Tips:                       │
│  • Keep tab open for best results   │
│  • Don't mute your microphone       │
│  • Speak clearly                    │
│                                     │
│  [Open Google Meet] [Dashboard]    │
└─────────────────────────────────────┘
```

---

### Floating Widget (Bottom Right)

**Expanded View**:
```
┌─────────────────────────┐
│ 🔴 Recording      [−][×]│
├─────────────────────────┤
│ 🎙️ Background Trans    │
│                         │
│ 42 transcripts          │
│ Started 10:05 AM        │
│                         │
│ Recent:                 │
│ "Let's discuss..."      │
│ "I'll handle..."        │
│                         │
│ [End Meeting & Analyze] │
│ 💡 Click when Meet ends │
└─────────────────────────┘
```

**Minimized View**:
```
┌──────────────┐
│ 🎙️ 42  [End]│
└──────────────┘
```

---

## 🔧 Technical Details

### What Happens Behind the Scenes

#### When You Click "Join Google Meet"

```javascript
// 1. Start transcription session
POST /api/meetings/{meetingId}/join
{
  "action": "join"
}

// 2. Store session in localStorage
localStorage.setItem('activeTranscriptionSession', {
  sessionId: "session_123",
  meetingId: "meeting_456",
  meetingLink: "https://meet.google.com/...",
  startTime: "2025-11-08T10:00:00Z"
});

// 3. Open Google Meet
window.open(meetingLink, '_blank');

// 4. Redirect to monitoring page
window.location.href = '/transcribe';
```

---

#### During the Meeting

```javascript
// 1. Connect to WebSocket
const ws = new WebSocket('ws://localhost:8080');

// 2. Send start meeting message
ws.send({
  type: 'start_meeting',
  meetingId: 'meeting_456',
  participants: []
});

// 3. Capture audio
navigator.mediaDevices.getUserMedia({ audio: true })
  .then(stream => {
    const recorder = new MediaRecorder(stream);
    recorder.ondataavailable = (event) => {
      // Send audio chunk every second
      ws.send({
        type: 'audio',
        audioData: event.data,
        meetingId: 'meeting_456'
      });
    };
    recorder.start(1000);
  });

// 4. Receive transcripts
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.type === 'transcript') {
    // Store in Firestore
    // Update UI
    // Increment counter
  }
};
```

---

#### When You End the Meeting

```javascript
// 1. Stop recording
mediaRecorder.stop();
stream.getTracks().forEach(track => track.stop());

// 2. Send end meeting message
ws.send({
  type: 'end_meeting',
  meetingId: 'meeting_456'
});

// 3. Trigger AI analysis
POST /api/meetings/{meetingId}/analyze

// 4. Clean up
localStorage.removeItem('activeTranscriptionSession');

// 5. Redirect to results
window.location.href = `/dashboard/meet/${meetingId}`;
```

---

## 💾 Data Storage

### Firestore Collections

#### `transcription_sessions`
```json
{
  "sessionId": "session_meeting-123_1699459200000",
  "meetingId": "meeting-123",
  "participants": ["john@example.com", "sarah@example.com"],
  "startTime": "2025-11-08T10:00:00Z",
  "isActive": true,
  "createdBy": "user@example.com",
  "createdAt": "2025-11-08T10:00:00Z"
}
```

#### `transcripts`
```json
{
  "id": "transcript-456",
  "meetingId": "meeting-123",
  "sessionId": "session_meeting-123_1699459200000",
  "speaker": "Speaker 1",
  "text": "Let's discuss the project timeline",
  "timestamp": "2025-11-08T10:05:23Z",
  "confidence": 0.92,
  "createdAt": "2025-11-08T10:05:23Z"
}
```

#### `meeting_analysis`
```json
{
  "meetingId": "meeting-123",
  "analysis": {
    "actionItems": [...],
    "sentiment": {...},
    "keyTopics": [...],
    "summary": "...",
    "decisions": [...],
    "nextSteps": [...]
  },
  "fullTranscript": "...",
  "analyzedAt": "2025-11-08T10:35:00Z",
  "analyzedBy": "user@example.com"
}
```

---

## 🎯 Benefits

### For Users

✅ **Seamless Experience**
- Click one button to start everything
- Join Google Meet normally
- No manual transcription needed

✅ **Real-Time Monitoring**
- See transcript count live
- Check recent transcripts
- Know everything is being captured

✅ **Automatic Analysis**
- AI processes everything when you're done
- Action items extracted automatically
- Summary generated instantly

✅ **Zero Manual Work**
- No note-taking during meeting
- No post-meeting cleanup
- Just attend and let AI handle the rest

---

### For Developers

✅ **Simple Integration**
- One button click starts everything
- Background processing handles complexity
- Clean separation of concerns

✅ **Flexible Architecture**
- Works with any meeting platform
- Easy to extend with more features
- Scalable WebSocket server

✅ **Robust Error Handling**
- Graceful fallbacks
- Session recovery
- Clear error messages

---

## 🐛 Troubleshooting

### Issue: Google Meet doesn't open

**Check**:
- Pop-up blocker settings
- Browser permissions
- Meeting link is valid

**Solution**:
```javascript
// Allow pop-ups for localhost:3000
// Or manually copy the Google Meet link
```

---

### Issue: Transcription not starting

**Check**:
- WebSocket server is running
- Microphone permissions granted
- Browser console for errors

**Solution**:
```bash
# Start WebSocket server
node server/transcription-server.js

# Check connection
wscat -c ws://localhost:8080
```

---

### Issue: No transcripts appearing

**Check**:
- Microphone is not muted
- Audio is being captured
- WebSocket connection is active

**Solution**:
- Check browser console
- Verify microphone permissions
- Restart transcription session

---

### Issue: Widget not showing

**Check**:
- localStorage has session data
- Page is `/transcribe`
- No JavaScript errors

**Solution**:
```javascript
// Check localStorage
console.log(localStorage.getItem('activeTranscriptionSession'));

// Should show session data
```

---

## 🚀 Production Deployment

### Requirements

1. **WebSocket Server**
   - Deploy separately (VPS, container, etc.)
   - Use WSS (secure WebSocket)
   - Update `NEXT_PUBLIC_WS_URL`

2. **Google Cloud APIs**
   - Enable Speech-to-Text API
   - Enable Vertex AI API
   - Configure credentials

3. **Firestore**
   - Set up security rules
   - Configure indexes
   - Enable backups

4. **Environment Variables**
   ```bash
   NEXT_PUBLIC_WS_URL=wss://your-ws-server.com
   GOOGLE_SERVICE_ACCOUNT_KEY=...
   VERTEX_AI_LOCATION=us-central1
   ```

---

## 📊 Example Session

### Complete Meeting Flow

```
10:00 AM - Schedule meeting
           ↓
10:01 AM - Click "Join Google Meet (Auto-Transcription)"
           ↓
10:01 AM - Transcription starts
           Google Meet opens
           Redirected to /transcribe
           ↓
10:02 AM - Join Google Meet
           Start meeting
           ↓
10:02-10:32 AM - Meeting in progress
                  42 transcripts captured
                  All stored in Firestore
           ↓
10:32 AM - Meeting ends
           Click "End Meeting & Analyze"
           ↓
10:32 AM - AI analysis begins
           Vertex AI processes transcript
           ↓
10:33 AM - Results ready
           Redirected to meeting details
           View action items, sentiment, summary
```

**Total Time**: 33 minutes
**Your Effort**: 3 clicks
**Transcripts Captured**: 42
**Action Items Extracted**: 5
**AI Analysis Time**: ~30 seconds

---

## 🎉 Success!

You now have a fully automatic transcription system that:

✅ Starts with one click
✅ Opens Google Meet directly
✅ Transcribes everything in background
✅ Monitors progress in real-time
✅ Analyzes with AI when done
✅ Provides instant insights

**No manual work required!** 🚀

---

## 📚 Related Documentation

- **Technical Details**: `docs/TRANSCRIPTION_SYSTEM.md`
- **Complete Flow**: `docs/AUTO_TRANSCRIPTION_FLOW.md`
- **Quick Start**: `docs/QUICK_START_TRANSCRIPTION.md`
- **User Guide**: `docs/QUICK_GUIDE.md`
