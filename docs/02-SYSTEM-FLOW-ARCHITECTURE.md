# TEA Platform - System Flow & Architecture Design
## Transcription Engine for Autonomous Intelligence

---

## High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE LAYER                         │
│                         (Next.js Frontend)                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────┐   │
│  │Dashboard │  │ Meeting  │  │  Tasks   │  │   Integrations   │   │
│  │          │  │ Creation │  │ Manager  │  │    Settings      │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ HTTPS / WebSocket
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      CLOUD LOAD BALANCER                             │
│                      (Global HTTPS LB + CDN)                         │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    ▼               ▼               ▼
        ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
        │  Cloud Run   │  │  Cloud Run   │  │  Cloud Run   │
        │  Next.js API │  │ AI Processor │  │ Integration  │
        │   Service    │  │   Service    │  │   Service    │
        └──────────────┘  └──────────────┘  └──────────────┘
                    │               │               │
                    └───────────────┼───────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    ▼               ▼               ▼
        ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
        │  Cloud       │  │  Vertex AI   │  │  Cloud       │
        │  Functions   │  │  (Gemini)    │  │  Pub/Sub     │
        └──────────────┘  └──────────────┘  └──────────────┘
                    │               │               │
                    └───────────────┼───────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    ▼               ▼               ▼
        ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
        │  Firestore   │  │  Cloud       │  │  Secret      │
        │  Database    │  │  Storage     │  │  Manager     │
        └──────────────┘  └──────────────┘  └──────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    ▼               ▼               ▼
        ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
        │ Google Meet  │  │   Gmail API  │  │   Calendar   │
        │     API      │  │              │  │     API      │
        └──────────────┘  └──────────────┘  └──────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    ▼               ▼               ▼
        ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
        │     CRM      │  │   Project    │  │   Email      │
        │  (Salesforce,│  │  Management  │  │   Service    │
        │   HubSpot)   │  │ (Jira, Asana)│  │  (SendGrid)  │
        └──────────────┘  └──────────────┘  └──────────────┘
```

---

## Complete User Journey Flow

### **Flow 1: Meeting Creation & Setup**

```
User Action                  System Response              Backend Process
───────────────────────────────────────────────────────────────────────────
1. User logs in            → Dashboard loads           → Auth via Identity Platform
   with Google account                                 → Fetch user profile from Firestore
                                                        
2. User clicks             → Meeting creation          → Generate unique meeting ID
   "Create Meeting"          form appears              → Check user permissions
                                                        
3. User fills details:     → Validate form data        → Create Firestore document
   - Title                                             → /meetings/{meetingId}
   - Date/Time                                            {
   - Participants                                           title, datetime,
   - AI settings                                            participants[],
   - Approval mode                                          settings: {
                                                               autoTranscribe: true,
4. User submits            → Processing indicator         autonomyLevel: 'auto',
                                                               approvalRequired: false
                                                            },
                                                            status: 'scheduled'
                                                          }
                                                        
5. System creates          → Google Calendar API       → calendar.events.insert()
   Google Meet link          call                      → Returns event with Meet link
                                                        → conferenceData.entryPoints[]
                                                        
6. Meet link generated     → Update Firestore          → Store meetingLink
                           → Show success message      → Create webhook subscription
                                                        → Set up meeting monitor
                                                        
7. User shares link        → Copy to clipboard         → Log action in audit trail
   with participants       → Option to email           → Send calendar invites
                             participants              → via Gmail API
```

---

### **Flow 2: Real-Time Meeting Transcription**

```
Event Trigger              System Action               Processing Pipeline
───────────────────────────────────────────────────────────────────────────
1. Meeting starts          → Webhook received          → Cloud Function: onMeetingStart
   (participant joins)       from Google Meet          → Update meeting status: 'in_progress'
                                                        → Initialize transcript session
                                                        → Create /transcripts/{meetingId}
                                                        
2. Google Meet             → Real-time stream          → Cloud Function: transcriptStreamHandler
   generates captions        via Meet API              → Receives transcript chunks every 2-3s
   (live transcription)                                   {
                                                            meetingId,
                                                            timestamp,
                                                            speaker,
                                                            text,
                                                            confidence
                                                          }
                                                        
3. Transcript chunk        → Store in Firestore        → /transcripts/{meetingId}/chunks/{chunkId}
   received                 → Real-time listener       → Frontend updates live transcript view
                             updates UI                → WebSocket push to connected clients
                                                        
4. Every 30 seconds        → Aggregate chunks          → Cloud Function: analyzeTranscriptBatch
   (batching)               → Send to Pub/Sub          → Publish to 'transcript-batch' topic
                             topic                     → Batch: last 30s of transcript
                                                        
5. AI Analysis             → Vertex AI processes       → Cloud Run: AI Processor Service
   triggered                 batch                     → Gemini 1.5 Pro API call
                                                          Prompt: "Analyze this meeting segment:
                                                                   - Extract action items
                                                                   - Identify decisions
                                                                   - Detect sentiment
                                                                   - Find commitments"
                                                        
6. AI returns              → Structure data            → Parse JSON response:
   analysis                                               {
                                                            actionItems: [{
                                                              task, assignee, deadline,
                                                              priority, confidence
                                                            }],
                                                            decisions: [],
                                                            sentiment: 'positive',
                                                            keyPoints: []
                                                          }
                                                        
7. Store extracted         → Save to Firestore         → /actionItems/{actionId}
   insights                 → Update meeting doc       → /meetings/{meetingId}/insights
                           → Real-time UI update      → WebSocket notification to user
                                                        
8. If action item          → Check autonomy            → Read /automationRules/{userId}
   detected                  settings                  → Match against user-defined triggers
                                                        
9. Trigger matched         → Autonomy level check     → If level == 'auto': execute immediately
                                                        → If level == 'approval': push notification
                                                        → If level == 'manual': add to task list
```

---

### **Flow 3: Autonomous Task Execution**

```
Trigger Event              Decision Process            Execution Flow
───────────────────────────────────────────────────────────────────────────
1. Action item             → AI Decision Engine        → Cloud Function: taskDecisionMaker
   extracted from            evaluates context         → Vertex AI analyzes:
   transcript                                            - Task type (email, calendar, CRM)
                                                         - Priority level
                                                         - User preferences
                                                         - Historical patterns
                                                        
2. AI recommends           → Generate task plan        → Create execution plan:
   actions                                                {
                                                            taskId,
                                                            type: 'send_email',
                                                            params: {
                                                              to: 'client@example.com',
                                                              subject: 'Follow-up: Action Items',
                                                              body: 'AI-generated summary...'
                                                            },
                                                            requiresApproval: false,
                                                            estimatedImpact: 'medium'
                                                          }
                                                        
3. Check user              → Query Firestore           → /users/{userId}/settings/autonomy
   autonomy settings                                     - emailApproval: false
                                                         - crmApproval: true
                                                         - calendarApproval: false
                                                        
4a. AUTO MODE              → Execute immediately       → Cloud Run: Integration Service
    (no approval)           → Publish to Pub/Sub       → Topic: 'task-execution-queue'
                             'execute-task'            → Subscriber processes task
                                                        
    Email task             → Gmail API call            → gmail.users.messages.send()
                           → Store in sent items       → Draft created and sent
                                                        → Log in audit trail
                                                        
    Calendar task          → Calendar API call         → calendar.events.insert()
                           → Create reminder           → Add to user's calendar
                           → Send notification         → Email confirmation sent
                                                        
    CRM update             → Salesforce API            → Update deal/contact record
                           → Add activity note         → Log meeting summary
                           → Update next steps         → Set follow-up date
                                                        
4b. APPROVAL MODE          → Create approval           → /pendingApprovals/{approvalId}
    (requires confirm)       request                     {
                           → Send notification           taskType,
                                                           recommendedAction,
                                                           aiReasoning,
                                                           timestamp,
                                                           status: 'pending'
                                                         }
                                                        
                           → Push notification         → WebSocket to frontend
                           → Email notification        → Via Gmail API
                           → Mobile push (optional)    → Via Cloud Messaging
                                                        
    User approves          → Execute task              → Same as auto mode above
                           → Learn from decision       → Update AI preference model
                           → Log approval              → Audit trail entry
                                                        
    User rejects           → Cancel task               → Mark as rejected
                           → Learn from decision       → Update AI to avoid similar
                           → Store feedback            → Improve future decisions
                                                        
5. Task execution          → Monitor status            → Cloud Function: taskStatusMonitor
   in progress                                         → Check execution result
                                                        → Retry on failure (max 3 attempts)
                                                        
6. Task completed          → Update Firestore          → /actionItems/{actionId}
                           → Status: 'completed'         status = 'completed'
                           → Log result                  executedAt = timestamp
                           → Notify user                 result = success/failure
                                                        
7. Generate audit          → Create audit entry        → /auditLogs/{logId}
   trail                                                  {
                                                            userId, meetingId, actionId,
                                                            taskType, action,
                                                            executionMode: 'auto/approval',
                                                            result, timestamp,
                                                            aiConfidence: 0.95
                                                          }
```

---

### **Flow 4: Meeting End & Summary Generation**

```
Event                      Processing                  Output
───────────────────────────────────────────────────────────────────────────
1. Meeting ends            → Webhook received          → Cloud Function: onMeetingEnd
   (all participants        → Update status            → /meetings/{meetingId}
    leave)                                               status = 'completed'
                                                        
2. Finalize transcript     → Aggregate all chunks      → Cloud Function: finalizeTranscript
                           → Generate full text        → /transcripts/{meetingId}/full
                           → Calculate statistics        {
                                                            fullText,
                                                            duration,
                                                            speakerStats,
                                                            wordCount
                                                          }
                                                        
3. AI Summary              → Vertex AI call            → Gemini 1.5 Pro
   Generation                Prompt:                     "Generate comprehensive summary:
                             "Create meeting              - Key discussion points
                              summary with:               - Decisions made
                              - Executive summary         - Action items list
                              - Key points                - Participant insights
                              - Action items              - Next steps
                              - Decisions                 - Overall sentiment"
                              - Next steps"             
                                                        
4. Generate meeting        → Format summary            → Create structured document:
   minutes                  → Professional layout         # Meeting Minutes
                           → Include metadata            Date: {date}
                                                          Participants: {list}
                                                          Duration: {duration}
                                                          
                                                          ## Executive Summary
                                                          {AI-generated summary}
                                                          
                                                          ## Key Discussion Points
                                                          {bullet points}
                                                          
                                                          ## Action Items
                                                          {table with assignee, deadline}
                                                          
                                                          ## Decisions Made
                                                          {list}
                                                        
5. Store and distribute    → Save to Cloud Storage     → {meetingId}/minutes.pdf
                           → Send to participants      → Gmail API to all attendees
                           → Update Firestore          → /meetings/{meetingId}/minutesUrl
                           → Dashboard notification    → Real-time update in UI
                                                        
6. Analytics update        → Aggregate metrics         → Update user/team analytics:
                                                          - Total meetings
                                                          - Action items created
                                                          - Automation success rate
                                                          - Time saved
                                                        
7. Schedule follow-ups     → Check action items        → For each item with deadline:
                             with deadlines              - Create calendar reminder
                                                          - Schedule notification
                                                          - Add to task dashboard
```

---

## Data Flow Diagrams

### **Real-Time Data Flow**

```
Google Meet (Live Meeting)
         │
         │ Real-time Transcript Stream
         │ (WebSocket / Webhook)
         ▼
   Cloud Function
   (transcriptStreamHandler)
         │
         ├─────────────────────┬─────────────────────┐
         ▼                     ▼                     ▼
   Firestore              Cloud Pub/Sub         WebSocket
   (Store Chunk)          (Batch Topic)         (Live UI Update)
         │                     │                     │
         │                     ▼                     ▼
         │              AI Processor            Frontend
         │              (Vertex AI)             (Real-time View)
         │                     │
         │                     ▼
         │              Extract Insights
         │              (Action Items,
         │               Decisions, etc.)
         │                     │
         └─────────────────────┼─────────────────────┘
                               ▼
                      Task Decision Engine
                      (Autonomy Check)
                               │
                   ┌───────────┴───────────┐
                   ▼                       ▼
            Auto Execute              Approval Required
                   │                       │
                   ▼                       ▼
          Integration Service      Notification Service
          (Email, CRM, Calendar)    (User Approval UI)
                   │                       │
                   └───────────┬───────────┘
                               ▼
                        Audit Trail
                        (Firestore)
```

### **Authentication & Authorization Flow**

```
User
 │
 │ 1. Navigate to app.tea-platform.com
 ▼
Next.js Frontend
 │
 │ 2. Redirect to Google OAuth
 ▼
Google Identity Platform
 │
 │ 3. User grants permissions:
 │    - Calendar (create events)
 │    - Meet (access transcripts)
 │    - Gmail (send emails)
 │    - Drive (store files)
 ▼
OAuth Consent
 │
 │ 4. Return authorization code
 ▼
Backend API (Cloud Run)
 │
 │ 5. Exchange code for tokens
 │    - Access token
 │    - Refresh token
 │    - ID token (JWT)
 ▼
Secret Manager
 │
 │ 6. Securely store tokens
 │    encrypted at rest
 ▼
Firestore
 │
 │ 7. Create/update user profile
 │    - userId
 │    - email
 │    - permissions
 │    - tokenRef (encrypted)
 ▼
Generate Session Token
 │
 │ 8. Return JWT to frontend
 │    - Expires in 24 hours
 │    - Includes user claims
 ▼
Frontend stores in httpOnly cookie
```

### **Integration Service Flow**

```
Task Execution Request
         │
         ▼
   Integration Router
   (Determines destination)
         │
    ┌────┼────┬────────┬─────────┐
    ▼    ▼    ▼        ▼         ▼
  Email CRM Calendar  Slack   Jira
         │
         ▼
   Fetch Credentials
   (Secret Manager)
         │
         ▼
   OAuth Token Valid?
         │
    ┌────┴────┐
    │         │
   YES        NO
    │         │
    │         ▼
    │    Refresh Token
    │         │
    └────┬────┘
         ▼
   Execute API Call
   (with retry logic)
         │
    ┌────┴────┐
    │         │
 Success   Failure
    │         │
    ▼         ▼
  Update   Retry (max 3)
  Status        │
    │      ┌────┴────┐
    │      │         │
    │   Success   Failure
    │      │         │
    └──────┼─────────┘
           ▼
      Log Result
      (Audit Trail)
           │
           ▼
    Notify User
    (WebSocket)
```

---

## Component Architecture

### **Frontend Architecture (Next.js)**

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx              // Google OAuth login
│   │   └── callback/
│   │       └── page.tsx              // OAuth callback handler
│   │
│   ├── (dashboard)/
│   │   ├── layout.tsx                // Dashboard layout with sidebar
│   │   ├── page.tsx                  // Overview/analytics
│   │   ├── meetings/
│   │   │   ├── page.tsx              // Meetings list
│   │   │   ├── new/
│   │   │   │   └── page.tsx          // Create meeting form
│   │   │   └── [id]/
│   │   │       ├── page.tsx          // Meeting detail view
│   │   │       └── live/
│   │   │           └── page.tsx      // Live meeting transcription
│   │   │
│   │   ├── tasks/
│   │   │   ├── page.tsx              // Action items dashboard
│   │   │   └── [id]/
│   │   │       └── page.tsx          // Task details
│   │   │
│   │   ├── approvals/
│   │   │   └── page.tsx              // Pending approvals queue
│   │   │
│   │   ├── integrations/
│   │   │   └── page.tsx              // Connected apps management
│   │   │
│   │   └── settings/
│   │       ├── page.tsx              // General settings
│   │       ├── automation/
│   │       │   └── page.tsx          // Automation rules config
│   │       └── team/
│   │           └── page.tsx          // Team management
│   │
│   └── api/
│       ├── auth/
│       │   └── [...nextauth]/
│       │       └── route.ts          // NextAuth.js handlers
│       ├── meetings/
│       │   └── route.ts              // Meeting CRUD operations
│       ├── tasks/
│       │   └── route.ts              // Task management
│       └── webhooks/
│           └── google/
│               └── route.ts          // Google Meet webhooks
│
├── components/
│   ├── ui/                           // Shadcn/UI components
│   ├── meetings/
│   │   ├── MeetingCard.tsx
│   │   ├── TranscriptViewer.tsx      // Real-time transcript display
│   │   ├── ActionItemsList.tsx
│   │   └── MeetingForm.tsx
│   │
│   ├── tasks/
│   │   ├── TaskCard.tsx
│   │   ├── ApprovalDialog.tsx
│   │   └── TaskFilters.tsx
│   │
│   └── layout/
│       ├── Sidebar.tsx
│       ├── Header.tsx
│       └── NotificationCenter.tsx
│
├── lib/
│   ├── api/
│   │   ├── client.ts                 // API client wrapper
│   │   ├── meetings.ts               // Meeting API calls
│   │   └── tasks.ts                  // Task API calls
│   │
│   ├── firebase/
│   │   ├── config.ts                 // Firebase config
│   │   ├── firestore.ts              // Firestore utilities
│   │   └── realtime.ts               // Real-time listeners
│   │
│   ├── websocket/
│   │   └── client.ts                 // WebSocket connection
│   │
│   └── utils/
│       ├── auth.ts                   // Auth helpers
│       └── formatters.ts             // Data formatters
│
└── types/
    ├── meeting.ts
    ├── task.ts
    └── user.ts
```

### **Backend Services Architecture**

```
Cloud Run Services:
├── api-service/
│   ├── src/
│   │   ├── routes/
│   │   │   ├── meetings.ts           // Meeting endpoints
│   │   │   ├── tasks.ts              // Task endpoints
│   │   │   ├── users.ts              // User management
│   │   │   └── webhooks.ts           // Webhook receivers
│   │   │
│   │   ├── middleware/
│   │   │   ├── auth.ts               // JWT validation
│   │   │   ├── rateLimit.ts          // Rate limiting
│   │   │   └── errorHandler.ts       // Error handling
│   │   │
│   │   ├── services/
│   │   │   ├── meetingService.ts     // Business logic
│   │   │   ├── taskService.ts
│   │   │   └── integrationService.ts
│   │   │
│   │   └── utils/
│   │       ├── firestore.ts
│   │       └── pubsub.ts
│   │
│   └── Dockerfile
│
├── ai-processor/
│   ├── src/
│   │   ├── analyzers/
│   │   │   ├── actionItemExtractor.ts
│   │   │   ├── sentimentAnalyzer.ts
│   │   │   └── summaryGenerator.ts
│   │   │
│   │   ├── vertex/
│   │   │   ├── client.ts             // Vertex AI client
│   │   │   └── prompts.ts            // Prompt templates
│   │   │
│   │   └── processors/
│   │       ├── transcriptProcessor.ts
│   │       └── batchProcessor.ts
│   │
│   └── Dockerfile
│
└── integration-service/
    ├── src/
    │   ├── connectors/
    │   │   ├── gmail.ts              // Gmail integration
    │   │   ├── calendar.ts           // Calendar integration
    │   │   ├── salesforce.ts         // Salesforce CRM
    │   │   ├── hubspot.ts            // HubSpot CRM
    │   │   └── jira.ts               // Jira integration
    │   │
    │   ├── oauth/
    │   │   ├── manager.ts            // OAuth token management
    │   │   └── refresher.ts          // Token refresh logic
    │   │
    │   └── executor/
    │       ├── taskExecutor.ts       // Main task executor
    │       └── retryHandler.ts       // Retry logic
    │
    └── Dockerfile
```

### **Cloud Functions**

```
functions/
├── onMeetingStart/
│   └── index.ts                      // Meeting initialization
│
├── transcriptStreamHandler/
│   └── index.ts                      // Real-time transcript processing
│
├── analyzeTranscriptBatch/
│   └── index.ts                      // Batch analysis trigger
│
├── taskDecisionMaker/
│   └── index.ts                      // AI decision engine
│
├── executeAutonomousTask/
│   └── index.ts                      // Task executor
│
├── onMeetingEnd/
│   └── index.ts                      // Meeting finalization
│
├── generateMeetingSummary/
│   └── index.ts                      // Summary generation
│
└── scheduledCleanup/
    └── index.ts                      // Daily cleanup job
```

---

## Security Architecture

### **Defense in Depth**

```
Layer 1: Network Security
├── Cloud Armor (DDoS protection)
├── VPC with private subnets
├── Cloud NAT for outbound
└── Firewall rules (least privilege)

Layer 2: Application Security
├── OAuth 2.0 authentication
├── JWT token validation
├── Rate limiting (per user/IP)
├── Input validation & sanitization
└── CORS policy enforcement

Layer 3: Data Security
├── Encryption at rest (AES-256)
├── Encryption in transit (TLS 1.3)
├── Customer-managed keys (CMEK)
├── Secret Manager for credentials
└── Field-level encryption for PII

Layer 4: Access Control
├── IAM least privilege
├── Service account impersonation
├── Role-based access (RBAC)
├── VPC Service Controls
└── Audit logging on all actions

Layer 5: Monitoring & Response
├── Cloud Logging (all requests)
├── Anomaly detection
├── Security Command Center
├── Automated alerting
└── Incident response playbooks
```

---

## Performance Optimization Strategy

### **Frontend Performance**
- Next.js App Router with RSC (React Server Components)
- Static generation for public pages
- Dynamic imports for code splitting
- Image optimization with Next/Image
- CDN caching for static assets
- Service worker for offline support
- WebSocket for real-time updates (no polling)

### **Backend Performance**
- Cloud Run auto-scaling (0-100 instances)
- Connection pooling for Firestore
- Pub/Sub for async processing
- Batch operations where possible
- Caching with Cloud Memorystore (Redis)
- Query optimization with composite indexes

### **AI Performance**
- Gemini Flash for simple tasks (faster, cheaper)
- Gemini Pro for complex analysis
- Response caching for similar queries
- Batch processing of transcripts
- Streaming responses for large outputs

---

## Scalability Plan

```
Current Scale (Launch)          Year 1 Target           Year 2+ Target
──────────────────────────────────────────────────────────────────────
100 concurrent users            1,000 users             10,000+ users
10 meetings/day                 100 meetings/day        1,000+ meetings/day
1,000 action items/day          10,000 items/day        100,000+ items/day
Single region (us-central1)     Multi-region (US)       Global deployment

Infrastructure Scaling:
- Cloud Run: Auto-scale to 100 → 1,000 → 10,000 instances
- Firestore: Single region → Multi-region → Global
- Pub/Sub: Standard → High throughput
- Vertex AI: On-demand → Reserved capacity
```

---

## Monitoring & Observability

### **Key Metrics**

```
Availability Metrics:
- Uptime: 99.9% SLA
- Error rate: <0.5%
- Failed requests: <100/day

Performance Metrics:
- API latency (p50): <200ms
- API latency (p95): <500ms
- API latency (p99): <1000ms
- WebSocket latency: <100ms
- Transcript processing delay: <3s

AI Metrics:
- Transcription accuracy: >90%
- Action item precision: >85%
- Action item recall: >80%
- Summary quality score: >4/5
- AI response time: <2s

Business Metrics:
- Active users (DAU/MAU)
- Meetings created per day
- Action items executed automatically
- User approval rate
- Time saved per user
- Integration success rate
```

### **Alerting Rules**

```
Critical Alerts (Page immediately):
- Service down (uptime <99%)
- Error rate >5%
- Database connection failures
- OAuth failures >10/min

Warning Alerts (Slack notification):
- Latency p95 >1s
- AI accuracy drop >10%
- Failed task execution rate >5%
- Integration failures >20/hour

Info Alerts (Email digest):
- Daily metrics summary
- Weekly usage reports
- Monthly cost analysis
```

---

**Document Version**: 1.0  
**Last Updated**: November 7, 2025  
**Status**: Architecture Design Phase
