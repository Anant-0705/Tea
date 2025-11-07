# TEA Platform - Phase-wise Implementation Plan
## Transcription Engine for Autonomous Intelligence

---

## Development Strategy Overview

### Timeline: 6-8 Weeks to Production-Ready MVP
### Team Structure: Full-Stack Development with GCP Expertise
### Methodology: Agile with 1-week sprints

---

## Phase 1: Foundation & Infrastructure Setup
**Duration**: Week 1 (7 days)  
**Focus**: GCP setup, authentication, basic infrastructure

### Sprint 1.1: GCP Project Setup (Days 1-2)

**Objectives**:
- Set up GCP organization and projects
- Enable required APIs
- Configure IAM and service accounts
- Initialize development environment

**Tasks**:

#### GCP Infrastructure
```
1. Create GCP Projects
   - tea-dev-{hash}
   - tea-staging-{hash}
   - tea-prod-{hash}

2. Enable APIs (via gcloud CLI)
   gcloud services enable \
     calendar.googleapis.com \
     meet.googleapis.com \
     drive.googleapis.com \
     gmail.googleapis.com \
     cloudfunctions.googleapis.com \
     run.googleapis.com \
     firestore.googleapis.com \
     pubsub.googleapis.com \
     secretmanager.googleapis.com \
     aiplatform.googleapis.com \
     cloudscheduler.googleapis.com \
     logging.googleapis.com \
     monitoring.googleapis.com

3. Create Service Accounts
   - tea-backend@{project}.iam.gserviceaccount.com
   - tea-ai-processor@{project}.iam.gserviceaccount.com
   - tea-integrations@{project}.iam.gserviceaccount.com
   - tea-scheduler@{project}.iam.gserviceaccount.com

4. Assign IAM Roles
   Backend Service Account:
     - roles/calendar.editor
     - roles/meet.admin
     - roles/datastore.user
     - roles/pubsub.publisher
     - roles/secretmanager.secretAccessor
   
   AI Processor:
     - roles/aiplatform.user
     - roles/datastore.user
     - roles/pubsub.subscriber
   
   Integrations:
     - roles/secretmanager.secretAccessor
     - roles/datastore.user
```

#### OAuth Configuration
```
1. Configure OAuth Consent Screen
   - Application name: TEA - Transcription Engine for Autonomous Intelligence
   - User type: Internal (for testing) → External (for production)
   - Scopes:
     * https://www.googleapis.com/auth/calendar.events
     * https://www.googleapis.com/auth/meetings.space.readonly
     * https://www.googleapis.com/auth/gmail.send
     * https://www.googleapis.com/auth/drive.file

2. Create OAuth 2.0 Client ID
   - Type: Web application
   - Authorized redirect URIs:
     * http://localhost:3000/api/auth/callback/google (dev)
     * https://tea-staging.app/api/auth/callback/google
     * https://tea-platform.com/api/auth/callback/google (prod)

3. Store credentials in Secret Manager
   SECRET_NAME: oauth-client-credentials
   DATA: {
     client_id: "...",
     client_secret: "...",
     redirect_uris: [...]
   }
```

**Deliverables**:
- ✅ GCP projects created with billing enabled
- ✅ All required APIs enabled
- ✅ Service accounts configured with proper IAM roles
- ✅ OAuth credentials stored in Secret Manager
- ✅ Development environment documentation

---

### Sprint 1.2: Database & Storage Setup (Days 3-4)

**Objectives**:
- Initialize Firestore database
- Set up Cloud Storage buckets
- Configure security rules
- Create database schema

**Tasks**:

#### Firestore Setup
```
1. Create Firestore Database
   Mode: Native mode
   Location: us-central1 (multi-region for prod)
   
2. Create Collections
   /users
     - userId (auto-generated)
     - email
     - displayName
     - photoURL
     - settings {
         autonomyLevel: 'auto' | 'approval' | 'manual'
         emailApproval: boolean
         crmApproval: boolean
         calendarApproval: boolean
         notificationPreferences: {}
       }
     - createdAt
     - lastLoginAt
   
   /meetings
     - meetingId (auto-generated)
     - userId (owner)
     - title
     - scheduledTime
     - duration
     - participants: []
     - meetingLink
     - status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
     - settings {
         autoTranscribe: boolean
         aiAnalysis: boolean
         autonomousActions: boolean
       }
     - createdAt
     - updatedAt
   
   /transcripts/{meetingId}/chunks
     - chunkId (auto-generated)
     - timestamp
     - speaker
     - text
     - confidence
     - language
   
   /transcripts/{meetingId}/summary
     - fullText
     - summary
     - keyPoints: []
     - duration
     - speakerStats: {}
   
   /actionItems
     - actionId (auto-generated)
     - meetingId
     - userId
     - task
     - assignee
     - deadline
     - priority: 'low' | 'medium' | 'high'
     - status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
     - source: 'ai_extracted' | 'manual'
     - confidence (0-1)
     - createdAt
     - completedAt
   
   /automationRules
     - ruleId (auto-generated)
     - userId
     - name
     - trigger: {
         type: 'action_item' | 'decision' | 'keyword'
         condition: {}
       }
     - actions: [{
         type: 'email' | 'calendar' | 'crm' | 'slack'
         params: {}
       }]
     - requiresApproval: boolean
     - enabled: boolean
   
   /pendingApprovals
     - approvalId (auto-generated)
     - userId
     - taskType
     - taskData: {}
     - aiReasoning
     - status: 'pending' | 'approved' | 'rejected'
     - createdAt
     - respondedAt
   
   /auditLogs
     - logId (auto-generated)
     - userId
     - meetingId
     - actionId
     - action: 'meeting_created' | 'task_executed' | etc.
     - details: {}
     - executionMode: 'auto' | 'approval' | 'manual'
     - result: 'success' | 'failure'
     - timestamp
   
   /integrations
     - integrationId (auto-generated)
     - userId
     - type: 'gmail' | 'salesforce' | 'hubspot' | 'jira'
     - status: 'connected' | 'disconnected' | 'error'
     - credentials: {} (encrypted)
     - lastSync
     - createdAt

3. Create Indexes
   Collection: meetings
   Fields: userId (asc), status (asc), scheduledTime (desc)
   
   Collection: actionItems
   Fields: userId (asc), status (asc), deadline (asc)
   
   Collection: auditLogs
   Fields: userId (asc), timestamp (desc)

4. Security Rules
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       // Helper functions
       function isAuthenticated() {
         return request.auth != null;
       }
       
       function isOwner(userId) {
         return isAuthenticated() && request.auth.uid == userId;
       }
       
       // Users collection
       match /users/{userId} {
         allow read: if isOwner(userId);
         allow write: if isOwner(userId);
       }
       
       // Meetings collection
       match /meetings/{meetingId} {
         allow read: if isAuthenticated() && 
           (resource.data.userId == request.auth.uid ||
            request.auth.uid in resource.data.participants);
         allow create: if isAuthenticated() && 
           request.resource.data.userId == request.auth.uid;
         allow update: if isOwner(resource.data.userId);
         allow delete: if isOwner(resource.data.userId);
       }
       
       // Transcripts (subcollection)
       match /transcripts/{meetingId}/{document=**} {
         allow read: if isAuthenticated();
         allow write: if false; // Only via backend
       }
       
       // Action items
       match /actionItems/{actionId} {
         allow read: if isAuthenticated() && 
           (resource.data.userId == request.auth.uid ||
            resource.data.assignee == request.auth.uid);
         allow write: if isOwner(resource.data.userId);
       }
       
       // Audit logs (read-only for users)
       match /auditLogs/{logId} {
         allow read: if isOwner(resource.data.userId);
         allow write: if false;
       }
     }
   }
```

#### Cloud Storage Buckets
```
1. Create Buckets
   gs://tea-dev-meeting-recordings
   gs://tea-dev-transcripts
   gs://tea-dev-exports
   gs://tea-dev-backups
   
   Location: us-central1
   Storage class: Standard → Nearline (30 days) → Coldline (90 days)
   
2. Lifecycle Policies
   - Delete files older than 365 days
   - Move to Nearline after 30 days
   - Move to Coldline after 90 days
   
3. IAM Permissions
   - Backend service account: storage.objectAdmin
   - Users: storage.objectViewer (via signed URLs)
```

**Deliverables**:
- ✅ Firestore database initialized with schema
- ✅ Security rules deployed and tested
- ✅ Cloud Storage buckets created with lifecycle policies
- ✅ Database documentation and ER diagram

---

### Sprint 1.3: Next.js Frontend Foundation (Days 5-7)

**Objectives**:
- Set up Next.js project structure
- Implement authentication flow
- Create basic UI components
- Configure deployment

**Tasks**:

#### Project Setup
```bash
# Already initialized
cd mnit2025

# Install core dependencies
npm install @google-cloud/firestore @google-cloud/storage
npm install next-auth @auth/core
npm install firebase firebase-admin
npm install @tanstack/react-query
npm install zustand
npm install socket.io-client
npm install date-fns
npm install lucide-react
npm install class-variance-authority clsx tailwind-merge

# Install dev dependencies
npm install -D @types/node @types/react @types/react-dom
npm install -D eslint eslint-config-next
npm install -D prettier prettier-plugin-tailwindcss
```

#### Environment Configuration
```
# .env.local (Development)
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tea-dev-xxxxx
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Server-side only
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
NEXTAUTH_SECRET=... (generate with: openssl rand -base64 32)
NEXTAUTH_URL=http://localhost:3000

# GCP Service Account (for backend operations)
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account-key.json
GCP_PROJECT_ID=tea-dev-xxxxx
```

#### Authentication Setup
```typescript
// src/lib/auth/config.ts
import GoogleProvider from 'next-auth/providers/google';
import { FirestoreAdapter } from '@auth/firebase-adapter';

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: [
            'openid',
            'email',
            'profile',
            'https://www.googleapis.com/auth/calendar.events',
            'https://www.googleapis.com/auth/meetings.space.readonly',
            'https://www.googleapis.com/auth/gmail.send',
          ].join(' '),
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    }),
  ],
  adapter: FirestoreAdapter(),
  callbacks: {
    async session({ session, token }) {
      // Add custom fields to session
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/auth/error',
  },
};
```

#### Core Components
```
Components to Build:

1. Layout Components
   - src/components/layout/Sidebar.tsx
   - src/components/layout/Header.tsx
   - src/components/layout/DashboardLayout.tsx

2. Meeting Components
   - src/components/meetings/MeetingCard.tsx
   - src/components/meetings/MeetingForm.tsx
   - src/components/meetings/MeetingsList.tsx

3. UI Components (shadcn/ui)
   - Button, Input, Card, Badge, Avatar
   - Dialog, DropdownMenu, Toast
   - Table, Tabs, Calendar

4. Pages
   - src/app/(auth)/login/page.tsx
   - src/app/(dashboard)/page.tsx
   - src/app/(dashboard)/meetings/page.tsx
   - src/app/(dashboard)/meetings/new/page.tsx
```

#### Initial Deployment
```
1. Install Google Cloud SDK
2. Build Next.js app
   npm run build
   
3. Create Dockerfile
   FROM node:20-alpine AS base
   
   FROM base AS deps
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci
   
   FROM base AS builder
   WORKDIR /app
   COPY --from=deps /app/node_modules ./node_modules
   COPY . .
   RUN npm run build
   
   FROM base AS runner
   WORKDIR /app
   ENV NODE_ENV production
   
   COPY --from=builder /app/public ./public
   COPY --from=builder /app/.next/standalone ./
   COPY --from=builder /app/.next/static ./.next/static
   
   EXPOSE 3000
   CMD ["node", "server.js"]

4. Deploy to Cloud Run
   gcloud run deploy tea-frontend \
     --source . \
     --region us-central1 \
     --platform managed \
     --allow-unauthenticated \
     --min-instances 0 \
     --max-instances 10 \
     --memory 512Mi
```

**Deliverables**:
- ✅ Next.js app with authentication working
- ✅ Basic UI components library
- ✅ Dashboard layout implemented
- ✅ Deployed to Cloud Run (dev environment)
- ✅ Environment configuration documented

---

## Phase 2: Core Meeting & Transcription Features
**Duration**: Week 2-3 (14 days)  
**Focus**: Google Meet integration, real-time transcription, basic AI analysis

### Sprint 2.1: Google Meet Integration (Days 8-10)

**Objectives**:
- Implement meeting creation via Calendar API
- Set up Google Meet webhook handlers
- Create meeting management UI

**Tasks**:

#### Backend API Development
```typescript
// src/app/api/meetings/create/route.ts

import { google } from 'googleapis';
import { getServerSession } from 'next-auth';
import { Firestore } from '@google-cloud/firestore';

export async function POST(req: Request) {
  const session = await getServerSession();
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  
  const { title, startTime, duration, participants } = await req.json();
  
  // 1. Create Google Calendar event with Meet link
  const calendar = google.calendar('v3');
  const event = await calendar.events.insert({
    calendarId: 'primary',
    conferenceDataVersion: 1,
    requestBody: {
      summary: title,
      start: { dateTime: startTime },
      end: { dateTime: addMinutes(startTime, duration) },
      attendees: participants.map(email => ({ email })),
      conferenceData: {
        createRequest: {
          requestId: generateId(),
          conferenceSolutionKey: { type: 'hangoutsMeet' },
        },
      },
    },
  });
  
  // 2. Save to Firestore
  const firestore = new Firestore();
  const meetingRef = await firestore.collection('meetings').add({
    userId: session.user.id,
    title,
    scheduledTime: startTime,
    duration,
    participants,
    meetingLink: event.data.hangoutLink,
    googleEventId: event.data.id,
    status: 'scheduled',
    createdAt: new Date(),
  });
  
  // 3. Set up Meet webhook (for transcript access)
  await setupMeetWebhook(event.data.hangoutLink, meetingRef.id);
  
  return Response.json({ meetingId: meetingRef.id, meetingLink: event.data.hangoutLink });
}
```

#### Google Meet Webhook Handler
```typescript
// Cloud Function: onMeetingEvent

import { Firestore } from '@google-cloud/firestore';
import { PubSub } from '@google-cloud/pubsub';

export async function handleMeetingEvent(req, res) {
  const { eventType, meetingCode, transcript } = req.body;
  
  const firestore = new Firestore();
  const pubsub = new PubSub();
  
  switch (eventType) {
    case 'meeting.started':
      await firestore.collection('meetings')
        .where('meetingLink', '==', `meet.google.com/${meetingCode}`)
        .get()
        .then(snapshot => {
          snapshot.forEach(doc => {
            doc.ref.update({ status: 'in_progress', startedAt: new Date() });
          });
        });
      break;
      
    case 'transcript.chunk':
      // Publish to Pub/Sub for processing
      await pubsub.topic('transcript-stream').publish(
        Buffer.from(JSON.stringify({
          meetingCode,
          timestamp: transcript.timestamp,
          speaker: transcript.speaker,
          text: transcript.text,
          confidence: transcript.confidence,
        }))
      );
      break;
      
    case 'meeting.ended':
      await firestore.collection('meetings')
        .where('meetingLink', '==', `meet.google.com/${meetingCode}`)
        .get()
        .then(snapshot => {
          snapshot.forEach(doc => {
            doc.ref.update({ status: 'completed', endedAt: new Date() });
          });
        });
      
      // Trigger summary generation
      await pubsub.topic('meeting-ended').publish(
        Buffer.from(JSON.stringify({ meetingCode }))
      );
      break;
  }
  
  res.sendStatus(200);
}
```

#### Frontend Meeting Creation
```typescript
// src/app/(dashboard)/meetings/new/page.tsx

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MeetingForm } from '@/components/meetings/MeetingForm';

export default function NewMeetingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  async function handleSubmit(data) {
    setLoading(true);
    
    const response = await fetch('/api/meetings/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    
    const result = await response.json();
    
    if (response.ok) {
      router.push(`/meetings/${result.meetingId}`);
    }
    
    setLoading(false);
  }
  
  return (
    <div className="container max-w-2xl py-8">
      <h1 className="text-3xl font-bold mb-6">Create New Meeting</h1>
      <MeetingForm onSubmit={handleSubmit} loading={loading} />
    </div>
  );
}
```

**Deliverables**:
- ✅ Meeting creation API integrated with Google Calendar
- ✅ Google Meet links generated automatically
- ✅ Webhook handlers for meeting events
- ✅ Meeting creation UI with form validation
- ✅ Meeting list view with real-time status updates

---

### Sprint 2.2: Real-Time Transcription (Days 11-14)

**Objectives**:
- Process real-time transcript streams
- Store transcripts in Firestore
- Display live transcripts in UI
- Implement WebSocket for real-time updates

**Tasks**:

#### Transcript Stream Processor (Cloud Function)
```typescript
// functions/transcriptStreamHandler/index.ts

import { Firestore } from '@google-cloud/firestore';
import { PubSub } from '@google-cloud/pubsub';

export async function processTranscriptStream(message, context) {
  const data = JSON.parse(Buffer.from(message.data, 'base64').toString());
  const { meetingCode, timestamp, speaker, text, confidence } = data;
  
  const firestore = new Firestore();
  
  // 1. Find meeting by code
  const meetingsSnapshot = await firestore.collection('meetings')
    .where('meetingLink', '==', `meet.google.com/${meetingCode}`)
    .limit(1)
    .get();
  
  if (meetingsSnapshot.empty) {
    console.error('Meeting not found:', meetingCode);
    return;
  }
  
  const meetingId = meetingsSnapshot.docs[0].id;
  
  // 2. Store transcript chunk
  await firestore
    .collection('transcripts')
    .doc(meetingId)
    .collection('chunks')
    .add({
      timestamp,
      speaker,
      text,
      confidence,
      createdAt: new Date(),
    });
  
  // 3. Batch for AI analysis (every 30 seconds)
  const recentChunks = await firestore
    .collection('transcripts')
    .doc(meetingId)
    .collection('chunks')
    .where('timestamp', '>', Date.now() - 30000)
    .orderBy('timestamp', 'asc')
    .get();
  
  if (recentChunks.size >= 5) {
    // Enough data for analysis
    const batchText = recentChunks.docs.map(doc => doc.data().text).join(' ');
    
    const pubsub = new PubSub();
    await pubsub.topic('transcript-batch-analysis').publish(
      Buffer.from(JSON.stringify({
        meetingId,
        text: batchText,
        timeRange: {
          start: recentChunks.docs[0].data().timestamp,
          end: recentChunks.docs[recentChunks.size - 1].data().timestamp,
        },
      }))
    );
  }
}
```

#### WebSocket Server (Cloud Run)
```typescript
// websocket-service/src/server.ts

import { Server } from 'socket.io';
import { createServer } from 'http';
import { Firestore } from '@google-cloud/firestore';

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: { origin: process.env.FRONTEND_URL },
});

const firestore = new Firestore();

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('subscribe:meeting', async (meetingId) => {
    socket.join(`meeting:${meetingId}`);
    
    // Listen to Firestore changes
    const unsubscribe = firestore
      .collection('transcripts')
      .doc(meetingId)
      .collection('chunks')
      .orderBy('timestamp', 'desc')
      .limit(1)
      .onSnapshot((snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added') {
            io.to(`meeting:${meetingId}`).emit('transcript:chunk', {
              ...change.doc.data(),
              id: change.doc.id,
            });
          }
        });
      });
    
    socket.on('disconnect', () => {
      unsubscribe();
    });
  });
});

httpServer.listen(8080);
```

#### Frontend Live Transcript View
```typescript
// src/components/meetings/LiveTranscriptViewer.tsx

'use client';

import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

export function LiveTranscriptViewer({ meetingId }) {
  const [chunks, setChunks] = useState([]);
  const [socket, setSocket] = useState(null);
  
  useEffect(() => {
    const socketInstance = io(process.env.NEXT_PUBLIC_WS_URL);
    
    socketInstance.on('connect', () => {
      socketInstance.emit('subscribe:meeting', meetingId);
    });
    
    socketInstance.on('transcript:chunk', (chunk) => {
      setChunks(prev => [chunk, ...prev]);
    });
    
    setSocket(socketInstance);
    
    return () => {
      socketInstance.disconnect();
    };
  }, [meetingId]);
  
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Live Transcript</h2>
      <div className="bg-gray-50 rounded-lg p-4 max-h-[600px] overflow-y-auto">
        {chunks.map((chunk) => (
          <div key={chunk.id} className="mb-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-sm">{chunk.speaker}</span>
              <span className="text-xs text-gray-500">
                {new Date(chunk.timestamp).toLocaleTimeString()}
              </span>
            </div>
            <p className="text-gray-800">{chunk.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

**Deliverables**:
- ✅ Real-time transcript processing pipeline
- ✅ Firestore storage with efficient querying
- ✅ WebSocket server for live updates
- ✅ Live transcript viewer component
- ✅ Transcript batching for AI analysis

---

### Sprint 2.3: AI Analysis Integration (Days 15-17)

**Objectives**:
- Integrate Vertex AI (Gemini)
- Extract action items from transcripts
- Detect sentiment and key points
- Generate meeting summaries

**Tasks**:

#### Vertex AI Service (Cloud Run)
```typescript
// ai-processor/src/services/vertexAI.ts

import { VertexAI } from '@google-cloud/vertexai';

const vertex = new VertexAI({
  project: process.env.GCP_PROJECT_ID,
  location: 'us-central1',
});

const model = vertex.getGenerativeModel({
  model: 'gemini-1.5-pro-002',
});

export async function analyzeTranscript(text: string) {
  const prompt = `
You are an AI assistant analyzing a meeting transcript segment. 
Extract the following information and return as JSON:

1. Action items: Tasks mentioned with potential assignees and deadlines
2. Decisions: Key decisions made
3. Key points: Important discussion points
4. Sentiment: Overall tone (positive, neutral, negative)

Transcript:
${text}

Return JSON in this format:
{
  "actionItems": [{
    "task": "string",
    "assignee": "string or null",
    "deadline": "date string or null",
    "priority": "low|medium|high",
    "confidence": 0.0-1.0
  }],
  "decisions": ["string"],
  "keyPoints": ["string"],
  "sentiment": "positive|neutral|negative",
  "sentimentScore": 0.0-1.0
}
  `.trim();
  
  const response = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.3,
      maxOutputTokens: 2048,
      topP: 0.8,
    },
  });
  
  const jsonText = response.response.candidates[0].content.parts[0].text;
  return JSON.parse(jsonText);
}
```

#### Batch Analysis Handler (Cloud Function)
```typescript
// functions/analyzeTranscriptBatch/index.ts

import { Firestore } from '@google-cloud/firestore';
import { analyzeTranscript } from './vertexAI';

export async function analyzeBatch(message, context) {
  const { meetingId, text, timeRange } = JSON.parse(
    Buffer.from(message.data, 'base64').toString()
  );
  
  const firestore = new Firestore();
  
  // 1. Analyze with Vertex AI
  const analysis = await analyzeTranscript(text);
  
  // 2. Store action items
  const batch = firestore.batch();
  
  for (const item of analysis.actionItems) {
    if (item.confidence > 0.7) {
      const actionRef = firestore.collection('actionItems').doc();
      batch.set(actionRef, {
        meetingId,
        task: item.task,
        assignee: item.assignee,
        deadline: item.deadline ? new Date(item.deadline) : null,
        priority: item.priority,
        status: 'pending',
        source: 'ai_extracted',
        confidence: item.confidence,
        createdAt: new Date(),
      });
    }
  }
  
  // 3. Update meeting insights
  const meetingRef = firestore.collection('meetings').doc(meetingId);
  batch.update(meetingRef, {
    'insights.lastAnalysis': new Date(),
    'insights.actionItemsCount': analysis.actionItems.length,
    'insights.sentiment': analysis.sentiment,
  });
  
  await batch.commit();
  
  console.log(`Analyzed batch for meeting ${meetingId}: ${analysis.actionItems.length} action items found`);
}
```

**Deliverables**:
- ✅ Vertex AI integration with Gemini Pro
- ✅ Action item extraction with confidence scores
- ✅ Sentiment analysis
- ✅ Real-time AI analysis pipeline
- ✅ Action items dashboard UI

---

## Phase 3: Autonomous Task Execution
**Duration**: Week 4-5 (14 days)  
**Focus**: Integration with third-party services, autonomous workflows, approval system

### Sprint 3.1: Integration Framework (Days 18-21)

**Objectives**:
- Build OAuth management system
- Create Gmail integration
- Create Calendar integration
- Create CRM connectors (Salesforce/HubSpot)

**Tasks**:

#### OAuth Token Manager
```typescript
// integration-service/src/oauth/manager.ts

import { SecretManagerServiceClient } from '@google-cloud/secret-manager';
import { Firestore } from '@google-cloud/firestore';

export class OAuthManager {
  private secretManager = new SecretManagerServiceClient();
  private firestore = new Firestore();
  
  async storeTokens(userId: string, integration: string, tokens: any) {
    // Store in Secret Manager
    const secretName = `projects/${process.env.GCP_PROJECT_ID}/secrets/oauth-${userId}-${integration}`;
    await this.secretManager.addSecretVersion({
      parent: secretName,
      payload: {
        data: Buffer.from(JSON.stringify(tokens)),
      },
    });
    
    // Update Firestore with reference
    await this.firestore.collection('integrations').add({
      userId,
      type: integration,
      status: 'connected',
      secretRef: secretName,
      createdAt: new Date(),
    });
  }
  
  async getTokens(userId: string, integration: string) {
    const doc = await this.firestore
      .collection('integrations')
      .where('userId', '==', userId)
      .where('type', '==', integration)
      .limit(1)
      .get();
    
    if (doc.empty) return null;
    
    const secretRef = doc.docs[0].data().secretRef;
    const [version] = await this.secretManager.accessSecretVersion({
      name: `${secretRef}/versions/latest`,
    });
    
    return JSON.parse(version.payload.data.toString());
  }
  
  async refreshToken(userId: string, integration: string) {
    // Implementation for token refresh
  }
}
```

#### Gmail Integration
```typescript
// integration-service/src/connectors/gmail.ts

import { google } from 'googleapis';
import { OAuthManager } from '../oauth/manager';

export class GmailConnector {
  private oauthManager = new OAuthManager();
  
  async sendEmail(userId: string, params: {
    to: string;
    subject: string;
    body: string;
  }) {
    const tokens = await this.oauthManager.getTokens(userId, 'gmail');
    
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials(tokens);
    
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
    
    const message = [
      `To: ${params.to}`,
      `Subject: ${params.subject}`,
      '',
      params.body,
    ].join('\n');
    
    const encodedMessage = Buffer.from(message)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
    
    const response = await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMessage,
      },
    });
    
    return response.data;
  }
}
```

#### Salesforce CRM Connector
```typescript
// integration-service/src/connectors/salesforce.ts

import jsforce from 'jsforce';
import { OAuthManager } from '../oauth/manager';

export class SalesforceConnector {
  private oauthManager = new OAuthManager();
  
  async updateOpportunity(userId: string, params: {
    opportunityId: string;
    data: any;
  }) {
    const tokens = await this.oauthManager.getTokens(userId, 'salesforce');
    
    const conn = new jsforce.Connection({
      instanceUrl: tokens.instance_url,
      accessToken: tokens.access_token,
    });
    
    const result = await conn.sobject('Opportunity').update({
      Id: params.opportunityId,
      ...params.data,
    });
    
    return result;
  }
  
  async createTask(userId: string, params: {
    subject: string;
    description: string;
    dueDate: string;
    relatedToId: string;
  }) {
    const tokens = await this.oauthManager.getTokens(userId, 'salesforce');
    
    const conn = new jsforce.Connection({
      instanceUrl: tokens.instance_url,
      accessToken: tokens.access_token,
    });
    
    const result = await conn.sobject('Task').create({
      Subject: params.subject,
      Description: params.description,
      ActivityDate: params.dueDate,
      WhatId: params.relatedToId,
      Status: 'Not Started',
    });
    
    return result;
  }
}
```

**Deliverables**:
- ✅ OAuth management system with secure token storage
- ✅ Gmail integration (send emails)
- ✅ Calendar integration (create events)
- ✅ Salesforce CRM connector
- ✅ HubSpot CRM connector
- ✅ Integration settings UI

---

### Sprint 3.2: Autonomous Execution Engine (Days 22-24)

**Objectives**:
- Build task decision engine
- Implement approval workflow
- Create task executor with retry logic
- Build notification system

**Tasks**:

#### Task Executor
```typescript
// integration-service/src/executor/taskExecutor.ts

import { GmailConnector } from '../connectors/gmail';
import { CalendarConnector } from '../connectors/calendar';
import { SalesforceConnector } from '../connectors/salesforce';
import { Firestore } from '@google-cloud/firestore';

export class TaskExecutor {
  private gmail = new GmailConnector();
  private calendar = new CalendarConnector();
  private salesforce = new SalesforceConnector();
  private firestore = new Firestore();
  
  async execute(taskId: string, retryCount = 0) {
    const taskDoc = await this.firestore.collection('pendingTasks').doc(taskId).get();
    if (!taskDoc.exists) throw new Error('Task not found');
    
    const task = taskDoc.data();
    const maxRetries = 3;
    
    try {
      let result;
      
      switch (task.type) {
        case 'send_email':
          result = await this.gmail.sendEmail(task.userId, task.params);
          break;
          
        case 'create_calendar_event':
          result = await this.calendar.createEvent(task.userId, task.params);
          break;
          
        case 'update_crm':
          result = await this.salesforce.updateOpportunity(task.userId, task.params);
          break;
          
        default:
          throw new Error(`Unknown task type: ${task.type}`);
      }
      
      // Mark as completed
      await this.firestore.collection('pendingTasks').doc(taskId).update({
        status: 'completed',
        result,
        completedAt: new Date(),
      });
      
      // Log success
      await this.logExecution(taskId, 'success', result);
      
      return result;
      
    } catch (error) {
      if (retryCount < maxRetries) {
        // Retry with exponential backoff
        const delay = Math.pow(2, retryCount) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.execute(taskId, retryCount + 1);
      } else {
        // Max retries reached, mark as failed
        await this.firestore.collection('pendingTasks').doc(taskId).update({
          status: 'failed',
          error: error.message,
          failedAt: new Date(),
        });
        
        await this.logExecution(taskId, 'failure', { error: error.message });
        throw error;
      }
    }
  }
  
  private async logExecution(taskId: string, result: string, details: any) {
    await this.firestore.collection('auditLogs').add({
      taskId,
      action: 'task_executed',
      result,
      details,
      timestamp: new Date(),
    });
  }
}
```

#### Approval Workflow
```typescript
// Cloud Function: handleApprovalRequest

import { Firestore } from '@google-cloud/firestore';
import { PubSub } from '@google-cloud/pubsub';

export async function requestApproval(taskData: any, userId: string) {
  const firestore = new Firestore();
  
  // Create approval request
  const approvalRef = await firestore.collection('pendingApprovals').add({
    userId,
    taskType: taskData.type,
    taskData,
    aiReasoning: taskData.aiReasoning,
    status: 'pending',
    createdAt: new Date(),
  });
  
  // Send notification
  const pubsub = new PubSub();
  await pubsub.topic('user-notifications').publish(
    Buffer.from(JSON.stringify({
      userId,
      type: 'approval_required',
      approvalId: approvalRef.id,
      message: `AI wants to ${taskData.type}: ${taskData.summary}`,
    }))
  );
  
  return approvalRef.id;
}

export async function handleApprovalResponse(approvalId: string, approved: boolean) {
  const firestore = new Firestore();
  const approvalDoc = await firestore.collection('pendingApprovals').doc(approvalId).get();
  
  if (!approvalDoc.exists) throw new Error('Approval not found');
  
  const approval = approvalDoc.data();
  
  if (approved) {
    // Execute the task
    const pubsub = new PubSub();
    await pubsub.topic('task-execution-queue').publish(
      Buffer.from(JSON.stringify(approval.taskData))
    );
    
    await approvalDoc.ref.update({
      status: 'approved',
      respondedAt: new Date(),
    });
  } else {
    await approvalDoc.ref.update({
      status: 'rejected',
      respondedAt: new Date(),
    });
  }
}
```

**Deliverables**:
- ✅ Task executor with retry logic
- ✅ Approval workflow system
- ✅ Real-time notification system
- ✅ Approval UI in dashboard
- ✅ Audit trail for all executions

---

### Sprint 3.3: Automation Rules Engine (Days 25-28)

**Objectives**:
- Build user-defined automation rules
- Implement rule matching engine
- Create automation settings UI
- Test autonomous workflows end-to-end

**Tasks**:

#### Rule Matching Engine
```typescript
// ai-processor/src/rules/matcher.ts

import { Firestore } from '@google-cloud/firestore';

export class RuleMatcher {
  private firestore = new Firestore();
  
  async matchRules(userId: string, context: {
    actionItem?: any;
    decision?: any;
    keyword?: string;
  }) {
    const rulesSnapshot = await this.firestore
      .collection('automationRules')
      .where('userId', '==', userId)
      .where('enabled', '==', true)
      .get();
    
    const matchedRules = [];
    
    for (const ruleDoc of rulesSnapshot.docs) {
      const rule = ruleDoc.data();
      
      if (this.evaluateCondition(rule.trigger, context)) {
        matchedRules.push({ id: ruleDoc.id, ...rule });
      }
    }
    
    return matchedRules;
  }
  
  private evaluateCondition(trigger: any, context: any): boolean {
    switch (trigger.type) {
      case 'action_item':
        return context.actionItem && 
               this.matchesKeyword(context.actionItem.task, trigger.keywords);
        
      case 'decision':
        return context.decision && 
               this.matchesKeyword(context.decision.text, trigger.keywords);
        
      case 'keyword':
        return context.keyword && 
               trigger.keywords.includes(context.keyword.toLowerCase());
        
      default:
        return false;
    }
  }
  
  private matchesKeyword(text: string, keywords: string[]): boolean {
    const lowerText = text.toLowerCase();
    return keywords.some(keyword => lowerText.includes(keyword.toLowerCase()));
  }
}
```

#### Automation Settings UI
```typescript
// src/app/(dashboard)/settings/automation/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';

export default function AutomationSettings() {
  const [rules, setRules] = useState([]);
  const [showDialog, setShowDialog] = useState(false);
  
  useEffect(() => {
    fetchRules();
  }, []);
  
  async function fetchRules() {
    const response = await fetch('/api/automation/rules');
    const data = await response.json();
    setRules(data.rules);
  }
  
  async function createRule(ruleData) {
    await fetch('/api/automation/rules', {
      method: 'POST',
      body: JSON.stringify(ruleData),
    });
    fetchRules();
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Automation Rules</h1>
        <button onClick={() => setShowDialog(true)}>
          <Plus className="w-5 h-5" />
          Create Rule
        </button>
      </div>
      
      <div className="grid gap-4">
        {rules.map(rule => (
          <RuleCard key={rule.id} rule={rule} />
        ))}
      </div>
    </div>
  );
}
```

**Deliverables**:
- ✅ Automation rules engine
- ✅ Rule creation and management UI
- ✅ End-to-end autonomous workflow testing
- ✅ User documentation for automation

---

## Phase 4: Polish, Testing & Launch Prep
**Duration**: Week 6 (7 days)  
**Focus**: Testing, performance optimization, documentation, demo preparation

### Sprint 4.1: Testing & QA (Days 29-31)

**Testing Checklist**:

#### Functionality Testing
```
✅ Authentication flow
✅ Meeting creation with Google Meet links
✅ Real-time transcription accuracy >90%
✅ Action item extraction accuracy >85%
✅ Autonomous task execution success >95%
✅ Approval workflow
✅ Integration with Gmail, Calendar, CRM
✅ Error handling and edge cases
✅ Audit trail completeness
```

#### Performance Testing
```
✅ API latency p95 <500ms
✅ WebSocket latency <100ms
✅ Transcript processing delay <3s
✅ Concurrent users: 100+
✅ Database query optimization
✅ AI response time <2s
```

#### Security Testing
```
✅ OAuth flow security
✅ JWT token validation
✅ Data encryption at rest
✅ Data encryption in transit
✅ Input sanitization
✅ Rate limiting
✅ CORS configuration
```

#### Usability Testing
```
✅ User onboarding flow
✅ Dashboard navigation
✅ Mobile responsiveness
✅ Accessibility (WCAG 2.1)
✅ Error messages clarity
✅ Loading states
```

**Deliverables**:
- ✅ Complete test suite (unit + integration + E2E)
- ✅ Bug fixes from testing
- ✅ Performance optimization
- ✅ Security audit passed

---

### Sprint 4.2: Documentation & Demo (Days 32-35)

**Documentation to Create**:

1. **User Guide** (`docs/USER_GUIDE.md`)
   - Getting started
   - Creating meetings
   - Understanding AI insights
   - Configuring automation
   - Managing integrations

2. **Technical Architecture** (`docs/TECHNICAL_ARCHITECTURE.md`)
   - System overview
   - Component diagrams
   - Data flow
   - API documentation

3. **Setup Instructions** (`docs/SETUP.md`)
   - GCP project setup
   - Environment configuration
   - Deployment steps
   - Troubleshooting

4. **Demo Script** (`docs/DEMO_SCRIPT.md`)
   - Live demo flow
   - Key features showcase
   - Business value highlights

**Demo Environment Setup**:
```
1. Staging environment with test data
2. Sample meetings with realistic transcripts
3. Pre-configured automation rules
4. Connected integrations (sandbox accounts)
5. Analytics dashboard with metrics
```

**Deliverables**:
- ✅ Complete documentation set
- ✅ Demo environment ready
- ✅ Presentation deck (10-15 min)
- ✅ Video demo (backup)

---

## Success Metrics & KPIs

### Technical Metrics
- ✅ Transcription accuracy: >90%
- ✅ Action item extraction: >85%
- ✅ Task execution success: >95%
- ✅ System uptime: >99.5%
- ✅ API latency p95: <500ms
- ✅ 3+ integrations working

### Business Metrics
- ✅ Time saved per user: 2-3 hours/day
- ✅ Productivity increase: 40-50%
- ✅ User satisfaction: >4/5
- ✅ Feature completeness: 100% of core requirements

### Hackathon Evaluation Criteria
- ✅ Problem understanding: Clear pain point addressed
- ✅ Solution approach: Innovative AI-powered automation
- ✅ Technical implementation: Production-ready system
- ✅ Business viability: Clear ROI and market fit
- ✅ Demo quality: Smooth, impressive live demo
- ✅ Code quality: Clean, well-documented repository

---

## Risk Management

### Technical Risks
| Risk | Mitigation | Backup Plan |
|------|------------|-------------|
| Google Meet API limitations | Early testing & documentation review | Use alternative transcription API |
| Vertex AI quota limits | Monitor usage, request increase | Use OpenAI GPT-4 as fallback |
| Real-time processing delays | Optimize batch sizes, use caching | Async processing with delayed updates |
| Integration API rate limits | Implement queue + retry logic | Show pending status to users |

### Timeline Risks
| Risk | Mitigation | Backup Plan |
|------|------------|-------------|
| Scope creep | Strict phase boundaries | Cut non-critical features |
| Integration delays | Parallel development | Use mock integrations for demo |
| Testing issues | Daily testing throughout | Focus on happy path for demo |

---

## Post-Hackathon Roadmap

### Phase 5: Advanced Features (Optional)
- Multi-language transcription
- Custom AI models fine-tuned on user data
- Mobile app (React Native)
- Slack/Teams bot integration
- Advanced analytics dashboard
- White-label solution for enterprises

### Phase 6: Scale & Growth
- Multi-region deployment
- Enterprise SSO (SAML)
- API for third-party developers
- Webhook system for external integrations
- Advanced automation with workflows
- AI learning from user feedback

---

## Team Roles & Responsibilities

### Recommended Team Structure
```
Frontend Developer:
- Next.js application
- UI/UX implementation
- WebSocket integration
- Real-time updates

Backend Developer:
- Cloud Run services
- Cloud Functions
- API development
- Database design

AI/ML Engineer:
- Vertex AI integration
- Prompt engineering
- Analysis pipeline
- Model optimization

DevOps/Cloud Engineer:
- GCP infrastructure
- CI/CD pipeline
- Monitoring & logging
- Security configuration
```

---

## Budget Estimate

### Development Phase (6 weeks)
```
GCP Costs:
- Cloud Run: ~$50/month (dev environment)
- Cloud Functions: ~$30/month
- Firestore: ~$20/month
- Vertex AI: ~$100/month (development usage)
- Cloud Storage: ~$10/month
- Other services: ~$20/month
Total: ~$230/month during development

Production Estimate (100 users):
- Cloud Run: ~$200/month
- Vertex AI: ~$500/month
- Other services: ~$150/month
Total: ~$850/month
```

### Free Tier Eligible
- Cloud Run: 2M requests/month
- Cloud Functions: 2M invocations/month
- Firestore: 1GB storage, 50K reads/day
- Secret Manager: 6 active secrets
- Cloud Logging: 50GB/month

---

**Document Version**: 1.0  
**Last Updated**: November 7, 2025  
**Status**: Implementation Plan Ready
**Next Step**: Begin Phase 1 - Foundation & Infrastructure Setup
