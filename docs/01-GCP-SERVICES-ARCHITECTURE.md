# TEA Platform - GCP Services & Architecture
## Transcription Engine for Autonomous Intelligence

---

## Platform Overview

**TEA (Transcription Engine for Autonomous Intelligence)** is an enterprise-grade, real-time call tracking and autonomous task automation system built entirely on Google Cloud Platform.

### Core Value Proposition
- Real-time Google Meet transcription and analysis
- AI-powered autonomous task execution
- Seamless integration with business tools
- 40-50% productivity improvement for knowledge workers

---

## Google Cloud Platform Services Required

### 1. **Google Meet API & Calendar API**
**Purpose**: Core meeting management and transcription access

**Services Needed**:
- **Google Calendar API** - Create and manage Google Meet links from TEA platform
- **Google Meet Real-time Transcription API** - Access live captions/transcripts during meetings
- **Google Workspace Admin SDK** - Manage user access and permissions

**Configuration**:
```
APIs to Enable:
- calendar.googleapis.com
- meet.googleapis.com
- admin.googleapis.com
- drive.googleapis.com (for meeting recordings)
```

**IAM Roles Required**:
- `roles/calendar.editor` - Create/modify calendar events
- `roles/meet.admin` - Access meeting transcripts
- `roles/iam.serviceAccountTokenCreator` - Service account delegation

---

### 2. **Cloud Functions (2nd Gen)**
**Purpose**: Serverless event-driven processing

**Use Cases**:
- **Meeting Event Processor** - Triggered when meeting starts/ends
- **Transcription Stream Handler** - Process real-time transcript chunks
- **Task Executor** - Execute autonomous actions (email, CRM updates, etc.)
- **Webhook Handler** - Receive callbacks from Google Meet

**Configuration**:
```
Runtime: Node.js 20 / Python 3.12
Memory: 512MB - 2GB (based on function)
Timeout: 60-540 seconds
Concurrency: 80-1000 instances
Trigger Types: HTTP, Pub/Sub, Cloud Scheduler
```

**Functions to Deploy**:
1. `onMeetingCreated` - Initialize meeting session
2. `processTranscriptStream` - Real-time transcript processing
3. `analyzeWithAI` - Send to Vertex AI for analysis
4. `executeAutonomousTasks` - Perform automated actions
5. `sendNotifications` - User notifications and approvals

---

### 3. **Cloud Run**
**Purpose**: Containerized backend services

**Services to Deploy**:

**A. Main API Service**
- Next.js API routes backend
- RESTful endpoints for frontend
- WebSocket server for real-time updates
- Auto-scaling: 0-100 instances

**B. AI Processing Service**
- Vertex AI integration layer
- Action item extraction engine
- Sentiment analysis processor
- Decision-making orchestrator

**C. Integration Service**
- CRM connectors (Salesforce, HubSpot)
- Email service (Gmail API, SendGrid)
- Project management (Jira, Asana, Monday)
- Calendar and task management

**Configuration**:
```
CPU: 1-2 vCPU
Memory: 512MB - 4GB
Min Instances: 0 (cost optimization)
Max Instances: 100
Request Timeout: 300 seconds
Concurrency: 80 requests per instance
```

---

### 4. **Vertex AI**
**Purpose**: AI/ML decision-making brain

**Models to Use**:
- **Gemini 1.5 Pro** - Primary LLM for analysis and decision-making
- **Gemini 1.5 Flash** - Quick sentiment/tone detection
- **Text Embedding API** - Semantic search in meeting history

**Capabilities Required**:
- Natural language understanding
- Action item extraction
- Context-aware decision making
- Sentiment and tone analysis
- Meeting summarization
- Learning from user feedback

**Configuration**:
```
Model: gemini-1.5-pro-002
Temperature: 0.3 (consistent outputs)
Max Tokens: 8192
Top-p: 0.8
Region: us-central1
```

**Prompt Engineering Strategy**:
- System prompts for role-based behavior
- Few-shot examples for action extraction
- Chain-of-thought reasoning for complex decisions
- Structured output formatting (JSON)

---

### 5. **Cloud Pub/Sub**
**Purpose**: Event streaming and async communication

**Topics to Create**:
1. `meeting-started` - Meeting initialization events
2. `transcript-stream` - Real-time transcript chunks
3. `ai-analysis-complete` - Analysis results from Vertex AI
4. `task-execution-queue` - Autonomous tasks to execute
5. `user-approval-required` - Tasks needing confirmation
6. `audit-log-stream` - All system actions for compliance

**Subscription Patterns**:
- Push subscriptions to Cloud Functions
- Pull subscriptions for batch processing
- Dead letter queues for failed messages
- Message retention: 7 days

---

### 6. **Cloud Firestore (Native Mode)**
**Purpose**: Primary real-time database

**Collections Structure**:
```
/users/{userId}
  - profile, settings, permissions
  
/meetings/{meetingId}
  - metadata, participants, status
  
/transcripts/{meetingId}/chunks/{chunkId}
  - real-time transcript segments
  
/actionItems/{actionId}
  - extracted tasks, deadlines, assignees
  
/automationRules/{ruleId}
  - user-defined triggers and workflows
  
/auditLogs/{logId}
  - complete audit trail
  
/integrations/{userId}/connections/{integrationId}
  - OAuth tokens, API keys (encrypted)
```

**Features Utilized**:
- Real-time listeners for live updates
- Compound queries for analytics
- Security rules for multi-tenant isolation
- Automatic indexing
- Offline persistence

---

### 7. **Cloud Storage**
**Purpose**: File and media storage

**Buckets**:
1. `{project}-meeting-recordings` - Audio/video recordings
2. `{project}-transcripts` - Full transcript archives
3. `{project}-exports` - Generated reports and summaries
4. `{project}-backups` - Database backups

**Lifecycle Policies**:
- Move to Nearline after 30 days
- Move to Coldline after 90 days
- Delete after 365 days (configurable)

---

### 8. **Cloud Scheduler**
**Purpose**: Cron jobs and scheduled tasks

**Jobs to Create**:
1. **Daily Summary Generator** - EOD meeting summaries
2. **Cleanup Old Transcripts** - Remove expired data
3. **Analytics Aggregator** - Weekly/monthly reports
4. **Health Check** - System monitoring
5. **Reminder Processor** - Follow-up notifications

---

### 9. **Secret Manager**
**Purpose**: Secure credential storage

**Secrets to Store**:
- Google OAuth client secrets
- Third-party API keys (CRM, email, etc.)
- Database encryption keys
- JWT signing secrets
- Webhook verification tokens

**Access Control**:
- Service account-based access
- Automatic rotation policies
- Version management
- Audit logging enabled

---

### 10. **Cloud IAM & Identity Platform**
**Purpose**: Authentication and authorization

**Authentication Methods**:
- Google Workspace SSO (primary)
- Email/password (fallback)
- Service accounts for integrations

**User Roles**:
1. **Admin** - Full system access
2. **Manager** - Team oversight, approval workflows
3. **User** - Standard meeting and task features
4. **Viewer** - Read-only access

**Service Accounts**:
- `tea-backend-service` - Backend API operations
- `tea-ai-processor` - Vertex AI access
- `tea-integrations` - Third-party API calls
- `tea-scheduler` - Cron job execution

---

### 11. **Cloud Logging & Monitoring**
**Purpose**: Observability and debugging

**Logging Strategy**:
- Structured JSON logs
- Log levels: DEBUG, INFO, WARN, ERROR
- Request tracing with correlation IDs
- User action logs for audit

**Monitoring Dashboards**:
1. **System Health** - Uptime, latency, errors
2. **AI Performance** - Accuracy metrics, token usage
3. **Integration Status** - Third-party API health
4. **User Analytics** - Active users, meeting count

**Alerts to Configure**:
- Error rate > 5%
- Latency > 2 seconds (p95)
- Failed autonomous tasks
- Vertex AI quota warnings

---

### 12. **Cloud Load Balancing**
**Purpose**: Global traffic distribution

**Configuration**:
- HTTPS Load Balancer for Cloud Run
- SSL certificate (auto-managed)
- CDN enabled for static assets
- Backend services health checks
- Session affinity for WebSocket

---

### 13. **VPC & Networking**
**Purpose**: Secure networking

**Setup**:
- VPC with private subnets
- Cloud NAT for outbound traffic
- VPC Service Controls for data security
- Private Google Access enabled
- Firewall rules for least privilege

---

### 14. **Cloud Build**
**Purpose**: CI/CD pipeline

**Build Triggers**:
- GitHub repository integration
- Automatic builds on `main` branch
- Multi-stage Docker builds
- Deploy to Cloud Run on success

**Pipeline Stages**:
1. Install dependencies
2. Run tests (unit + integration)
3. Build Next.js application
4. Build Docker image
5. Push to Artifact Registry
6. Deploy to Cloud Run
7. Run smoke tests

---

### 15. **Artifact Registry**
**Purpose**: Container image storage

**Repositories**:
- `tea-frontend` - Next.js application
- `tea-api` - Backend services
- `tea-ai-processor` - AI processing service
- `tea-integrations` - Integration workers

---

## Cost Optimization Strategy

### 1. **Compute**
- Cloud Run min instances = 0
- Auto-scaling based on demand
- Use Cloud Functions for event-driven tasks

### 2. **Storage**
- Lifecycle policies for Cloud Storage
- Firestore query optimization
- TTL on Pub/Sub messages

### 3. **AI**
- Use Gemini Flash for simple tasks
- Batch processing where possible
- Cache frequent queries

### 4. **Networking**
- CDN caching for static content
- Compression enabled
- Regional deployment to reduce egress

---

## Security Best Practices

### 1. **Data Protection**
- Encryption at rest (default in GCP)
- Encryption in transit (TLS 1.3)
- Customer-managed encryption keys (CMEK)

### 2. **Access Control**
- Least privilege IAM roles
- Service account impersonation
- VPC Service Controls
- Workload Identity for GKE (if used)

### 3. **Compliance**
- Audit logging enabled on all services
- Data residency controls
- Regular security scanning
- Vulnerability detection

### 4. **Application Security**
- OAuth 2.0 for API access
- JWT tokens with short expiry
- Rate limiting on APIs
- Input validation and sanitization

---

## Regional Deployment Strategy

**Primary Region**: `us-central1` (Iowa)
- Lowest latency for US users
- Full service availability
- Cost-effective

**Backup Region**: `us-east1` (South Carolina)
- Multi-region redundancy
- Disaster recovery
- Database replication

**Global Services**:
- Cloud CDN for static assets
- Global load balancing
- Multi-region storage for critical data

---

## Development Environment Setup

### GCP Project Structure
```
Production: tea-prod-{hash}
Staging: tea-staging-{hash}
Development: tea-dev-{hash}
```

### Local Development
- Cloud Code for VS Code
- Local emulators for Firestore and Pub/Sub
- Service account keys for testing (dev only)
- Environment variable management

---

## Next Steps

1. Create GCP projects (dev, staging, prod)
2. Enable required APIs
3. Set up service accounts and IAM
4. Configure OAuth consent screen
5. Initialize Firestore database
6. Deploy infrastructure with Terraform (optional)
7. Set up CI/CD pipeline
8. Begin development phases

---

**Document Version**: 1.0  
**Last Updated**: November 7, 2025  
**Status**: Architecture Planning Phase
