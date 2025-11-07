# TEA Platform - Routes & API Reference
## Transcription Engine for Autonomous Intelligence

**Last Updated**: November 7, 2025  
**Base URL (Dev)**: http://localhost:3000  
**Base URL (Prod)**: https://tea-platform.com

---

## Frontend Routes

### Public Routes (Unauthenticated)

```
/                                    Landing page
/login                               Google OAuth login
/auth/error                          Authentication error page
/auth/callback                       OAuth callback handler
```

---

### Protected Routes (Requires Authentication)

#### Dashboard
```
/dashboard                           Main dashboard overview
  - Analytics summary
  - Recent meetings
  - Pending action items
  - Quick actions
```

#### Meetings
```
/dashboard/meetings                  All meetings list
  - Filters: status, date range
  - Search by title/participants
  - Sort: date, status, duration

/dashboard/meetings/new              Create new meeting
  - Meeting form
  - Participant selection
  - AI settings configuration
  
/dashboard/meetings/[id]             Meeting detail view
  - Meeting metadata
  - Participants list
  - Action items extracted
  - Meeting summary
  - Transcript access
  
/dashboard/meetings/[id]/live        Live meeting view
  - Real-time transcription
  - Live action item detection
  - Participant status
  - Recording controls
  
/dashboard/meetings/[id]/transcript  Full transcript view
  - Complete transcript
  - Speaker identification
  - Timestamp navigation
  - Export options
  
/dashboard/meetings/[id]/summary     AI-generated summary
  - Executive summary
  - Key points
  - Decisions made
  - Next steps
```

#### Tasks & Action Items
```
/dashboard/tasks                     All action items
  - Filters: status, priority, assignee
  - Due date sorting
  - Bulk actions
  
/dashboard/tasks/[id]                Task detail view
  - Task description
  - Source meeting
  - Execution history
  - Related tasks
  
/dashboard/tasks/pending             Pending tasks only
/dashboard/tasks/completed           Completed tasks
/dashboard/tasks/overdue             Overdue tasks
```

#### Approvals
```
/dashboard/approvals                 Approval queue
  - Pending autonomous actions
  - AI reasoning display
  - Approve/reject interface
  
/dashboard/approvals/[id]            Approval detail
  - Full task context
  - AI confidence score
  - Similar past approvals
  - Impact assessment
```

#### Integrations
```
/dashboard/integrations              Connected apps
  - Gmail status
  - Calendar status
  - CRM connections
  - Project management tools
  
/dashboard/integrations/gmail        Gmail settings
/dashboard/integrations/calendar     Calendar settings
/dashboard/integrations/salesforce   Salesforce configuration
/dashboard/integrations/hubspot      HubSpot configuration
/dashboard/integrations/jira         Jira configuration
```

#### Settings
```
/dashboard/settings                  General settings
  - Profile information
  - Notification preferences
  - Privacy settings
  
/dashboard/settings/automation       Automation rules
  - Rule creation
  - Rule management
  - Trigger configuration
  - Action templates
  
/dashboard/settings/team             Team management
  - Team members
  - Role assignments
  - Permissions
  
/dashboard/settings/billing          Billing & subscription
  - Current plan
  - Usage statistics
  - Payment methods
```

#### Analytics
```
/dashboard/analytics                 Analytics dashboard
  - Meeting statistics
  - Time saved metrics
  - Automation success rate
  - Integration health
  
/dashboard/analytics/meetings        Meeting analytics
/dashboard/analytics/tasks           Task analytics
/dashboard/analytics/automations     Automation analytics
```

#### Audit
```
/dashboard/audit                     Audit trail
  - All system actions
  - User actions
  - Autonomous executions
  - Filter by date/user/action
```

---

## API Routes (Next.js API)

### Authentication
```
POST   /api/auth/signin              Initiate Google OAuth
POST   /api/auth/signout             Sign out user
GET    /api/auth/session              Get current session
GET    /api/auth/callback/google      OAuth callback
```

### Meetings
```
GET    /api/meetings                  List all meetings
  Query: ?status=scheduled&limit=10&page=1
  
POST   /api/meetings                  Create new meeting
  Body: {
    title: string
    scheduledTime: ISO8601
    duration: number
    participants: string[]
    settings: {
      autoTranscribe: boolean
      aiAnalysis: boolean
      autonomousActions: boolean
    }
  }
  
GET    /api/meetings/[id]             Get meeting details
  
PATCH  /api/meetings/[id]             Update meeting
  
DELETE /api/meetings/[id]             Cancel meeting
  
GET    /api/meetings/[id]/transcript  Get transcript
  Query: ?format=json|text
  
GET    /api/meetings/[id]/summary     Get AI summary
```

### Transcripts
```
GET    /api/transcripts/[meetingId]          Full transcript
GET    /api/transcripts/[meetingId]/chunks   Transcript chunks
  Query: ?startTime=timestamp&endTime=timestamp
  
POST   /api/transcripts/[meetingId]/export   Export transcript
  Body: { format: 'pdf' | 'docx' | 'txt' }
```

### Action Items
```
GET    /api/tasks                     List action items
  Query: ?status=pending&priority=high&assignee=userId
  
POST   /api/tasks                     Create action item
  Body: {
    task: string
    assignee: string
    deadline: ISO8601
    priority: 'low' | 'medium' | 'high'
    meetingId: string
  }
  
GET    /api/tasks/[id]                Get task details
  
PATCH  /api/tasks/[id]                Update task
  
DELETE /api/tasks/[id]                Delete task
  
POST   /api/tasks/[id]/complete       Mark as complete
```

### Approvals
```
GET    /api/approvals                 List pending approvals
  
GET    /api/approvals/[id]            Get approval details
  
POST   /api/approvals/[id]/approve    Approve action
  Body: { feedback: string (optional) }
  
POST   /api/approvals/[id]/reject     Reject action
  Body: { reason: string }
```

### Automation Rules
```
GET    /api/automation/rules          List rules
  
POST   /api/automation/rules          Create rule
  Body: {
    name: string
    trigger: {
      type: 'action_item' | 'decision' | 'keyword'
      condition: object
    }
    actions: [{
      type: 'email' | 'calendar' | 'crm'
      params: object
    }]
    requiresApproval: boolean
  }
  
GET    /api/automation/rules/[id]     Get rule details
  
PATCH  /api/automation/rules/[id]     Update rule
  
DELETE /api/automation/rules/[id]     Delete rule
  
POST   /api/automation/rules/[id]/toggle  Enable/disable rule
```

### Integrations
```
GET    /api/integrations              List all integrations
  
POST   /api/integrations/gmail/connect       Connect Gmail
POST   /api/integrations/calendar/connect    Connect Calendar
POST   /api/integrations/salesforce/connect  Connect Salesforce
POST   /api/integrations/hubspot/connect     Connect HubSpot
POST   /api/integrations/jira/connect        Connect Jira
  
DELETE /api/integrations/[type]/disconnect   Disconnect integration
  
GET    /api/integrations/[type]/status       Get integration status
```

### Analytics
```
GET    /api/analytics/overview        Dashboard metrics
  
GET    /api/analytics/meetings        Meeting statistics
  Query: ?startDate=ISO8601&endDate=ISO8601
  
GET    /api/analytics/tasks           Task statistics
  
GET    /api/analytics/automations     Automation metrics
  
GET    /api/analytics/time-saved      Time saved calculation
```

### Audit
```
GET    /api/audit/logs                List audit logs
  Query: ?userId=id&action=type&startDate=ISO8601&limit=50
  
GET    /api/audit/logs/[id]           Get log details
  
GET    /api/audit/export              Export audit logs
  Body: { format: 'csv' | 'json', filter: object }
```

### User
```
GET    /api/user/profile              Get user profile
  
PATCH  /api/user/profile              Update profile
  
GET    /api/user/settings             Get user settings
  
PATCH  /api/user/settings             Update settings
  
GET    /api/user/notifications        Get notifications
  
PATCH  /api/user/notifications/[id]/read  Mark as read
```

### Webhooks (External)
```
POST   /api/webhooks/google/meet      Google Meet events
  - Meeting started
  - Meeting ended
  - Transcript chunk received
  
POST   /api/webhooks/calendar         Calendar events
  - Event created
  - Event updated
  - Event cancelled
```

---

## WebSocket Events

### Connection
```
ws://localhost:8080

Events:
  connect                            Client connected
  disconnect                         Client disconnected
```

### Client → Server
```
subscribe:meeting                    Subscribe to meeting updates
  Payload: { meetingId: string }
  
unsubscribe:meeting                  Unsubscribe from meeting
  Payload: { meetingId: string }
  
subscribe:tasks                      Subscribe to task updates
  
subscribe:approvals                  Subscribe to approval updates
```

### Server → Client
```
transcript:chunk                     New transcript chunk
  Payload: {
    meetingId: string
    timestamp: number
    speaker: string
    text: string
    confidence: number
  }
  
action-item:detected                 New action item detected
  Payload: {
    meetingId: string
    actionItem: object
  }
  
approval:required                    Approval needed
  Payload: {
    approvalId: string
    taskType: string
    summary: string
  }
  
task:completed                       Task execution completed
  Payload: {
    taskId: string
    result: object
  }
  
meeting:status                       Meeting status changed
  Payload: {
    meetingId: string
    status: 'scheduled' | 'in_progress' | 'completed'
  }
```

---

## GCP Cloud Functions Endpoints

### Internal (Service-to-Service)

```
POST   /onMeetingStart                Handle meeting start
POST   /transcriptStreamHandler       Process transcript chunks
POST   /analyzeTranscriptBatch        Analyze transcript batch
POST   /taskDecisionMaker             AI decision for tasks
POST   /executeAutonomousTask         Execute approved task
POST   /onMeetingEnd                  Handle meeting end
POST   /generateMeetingSummary        Generate AI summary
GET    /scheduledCleanup              Daily cleanup job
```

---

## Cloud Run Services

### API Service
```
Base: https://tea-api-{hash}.run.app

All /api/* routes from Next.js
```

### AI Processor Service
```
Base: https://tea-ai-{hash}.run.app

POST   /analyze                       Analyze text with Vertex AI
POST   /extract-actions               Extract action items
POST   /summarize                     Generate summary
POST   /sentiment                     Analyze sentiment
```

### Integration Service
```
Base: https://tea-integrations-{hash}.run.app

POST   /execute                       Execute integration task
POST   /gmail/send                    Send email via Gmail
POST   /calendar/create               Create calendar event
POST   /crm/update                    Update CRM record
```

### WebSocket Service
```
Base: wss://tea-ws-{hash}.run.app

WebSocket connection for real-time updates
```

---

## Response Formats

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "timestamp": "2025-11-07T12:00:00Z"
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": { ... }
  },
  "timestamp": "2025-11-07T12:00:00Z"
}
```

### Paginated Response
```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

## Status Codes

```
200  OK                    Request successful
201  Created               Resource created
204  No Content            Successful, no response body
400  Bad Request           Invalid request data
401  Unauthorized          Authentication required
403  Forbidden             Insufficient permissions
404  Not Found             Resource not found
409  Conflict              Resource conflict
422  Unprocessable         Validation failed
429  Too Many Requests     Rate limit exceeded
500  Internal Error        Server error
503  Service Unavailable   Service temporarily down
```

---

## Rate Limits

```
API Endpoints:
  - Authenticated: 1000 requests/hour/user
  - Unauthenticated: 100 requests/hour/IP
  
WebSocket:
  - Max connections: 10/user
  - Max messages: 1000/minute
  
Vertex AI:
  - Max requests: 60/minute (quota-based)
```

---

## Authentication

### Headers Required
```
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json
```

### JWT Token Structure
```json
{
  "userId": "string",
  "email": "string",
  "role": "admin" | "manager" | "user",
  "permissions": ["string"],
  "iat": 1234567890,
  "exp": 1234567890
}
```

---

**Document Version**: 1.0  
**Last Updated**: November 7, 2025  
**Maintained By**: Development Team
