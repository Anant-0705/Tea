# AI-Powered Automated Actions System

## Overview
The AI Actions system automatically executes recommendations from Vertex AI meeting analysis, including sending emails, scheduling follow-up meetings, and creating tasks.

## Features

### 1. **Automated Email Sending**
- Sends follow-up emails to participants based on AI recommendations
- Includes meeting context and action items
- Customizable email templates

### 2. **Automatic Meeting Scheduling**
- Schedules follow-up meetings based on AI suggestions
- Sends calendar invitations to participants
- Stores meetings in Firestore for tracking

### 3. **Task Creation**
- Creates action items with assignees
- Sets priorities and due dates
- Sends notifications to assignees

## How It Works

### Step 1: Meeting Analysis
After a meeting ends, the system:
1. Transcribes the meeting audio
2. Analyzes the transcript with Vertex AI
3. Generates recommendations and action items

### Step 2: Action Generation
The ActionExecutor component:
1. Parses AI recommendations
2. Identifies actionable items (emails, meetings, tasks)
3. Presents them to the user for review

### Step 3: Execution
When the user clicks "Execute All Actions":
1. Each action is processed sequentially
2. Emails are sent via your email service
3. Meetings are created in Firestore
4. Tasks are assigned and notifications sent
5. Results are displayed in real-time

## Usage

### In the Meeting Detail Page

1. Navigate to a completed meeting
2. Click the "AI Actions" tab
3. Click "Generate Actions" to parse AI recommendations
4. Review the suggested actions
5. Click "Execute All Actions" to run them

### Action Types

#### Send Email
```typescript
{
  type: 'send_email',
  description: 'Send follow-up email to team',
  data: {
    recipient: 'anantsinghal2134@gmail.com',
    subject: 'Follow-up: Project Discussion',
    body: 'Meeting summary and next steps...'
  }
}
```

#### Schedule Meeting
```typescript
{
  type: 'schedule_meeting',
  description: 'Schedule follow-up meeting',
  data: {
    title: 'Follow-up Discussion',
    participants: ['anantsinghal2134@gmail.com'],
    date: '2024-01-15T10:00:00Z',
    duration: 60,
    description: 'Discuss action items from previous meeting'
  }
}
```

#### Create Task
```typescript
{
  type: 'create_task',
  description: 'Complete project proposal',
  data: {
    task: 'Complete project proposal',
    assignee: 'anantsinghal2134@gmail.com',
    priority: 'high',
    dueDate: '2024-01-20'
  }
}
```

## API Endpoints

### Execute Actions
```
POST /api/meetings/execute-actions
```

**Request Body:**
```json
{
  "meetingId": "meeting-123",
  "actions": [
    {
      "id": "email-1",
      "type": "send_email",
      "description": "Send follow-up email",
      "data": { ... }
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "results": [
    {
      "actionId": "email-1",
      "success": true,
      "message": "Email sent to anantsinghal2134@gmail.com"
    }
  ]
}
```

### Get Meeting Analysis
```
GET /api/meetings/[meetingId]/analysis
```

**Response:**
```json
{
  "success": true,
  "analysis": {
    "actionItems": [...],
    "insights": [...],
    "sentiment": {...}
  },
  "summary": {
    "executiveSummary": "...",
    "detailedReport": "...",
    "recommendedActions": [...]
  }
}
```

## Configuration

### Email Settings
Update your email configuration in `.env.local`:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

### Default Recipients
To change the default recipient for actions, update the `generateActions` function in `components/ActionExecutor.tsx`:

```typescript
const recipient = emailMatch ? emailMatch[0] : 'your-default@email.com';
```

## Customization

### Adding New Action Types

1. Add the action type to the interface:
```typescript
type ActionType = 'send_email' | 'schedule_meeting' | 'create_task' | 'your_new_type';
```

2. Add the execution logic in `app/api/meetings/execute-actions/route.ts`:
```typescript
case 'your_new_type':
  result = await executeYourNewAction(action, session, meetingId);
  break;
```

3. Add the UI icon and styling in `components/ActionExecutor.tsx`:
```typescript
case 'your_new_type': return <YourIcon className="w-5 h-5" />;
```

## Monitoring

All action executions are logged in Firestore:
- Collection: `action_executions`
- Fields: `meetingId`, `actionType`, `executedBy`, `executedAt`, `result`

## Best Practices

1. **Review Before Executing**: Always review generated actions before executing
2. **Test Email Settings**: Test email delivery before using in production
3. **Monitor Execution Logs**: Check Firestore logs for failed actions
4. **Customize Templates**: Adjust email and meeting templates for your use case
5. **Set Permissions**: Ensure service account has necessary permissions

## Troubleshooting

### Emails Not Sending
- Check SMTP credentials in `.env.local`
- Verify email service allows app passwords
- Check spam folder for test emails

### Meetings Not Creating
- Verify Firestore permissions
- Check meeting data format
- Ensure participants array is valid

### Actions Failing
- Check browser console for errors
- Review API response in Network tab
- Check Firestore `action_executions` collection for error details

## Future Enhancements

- [ ] Batch action execution with progress tracking
- [ ] Action templates for common scenarios
- [ ] Integration with calendar APIs (Google Calendar, Outlook)
- [ ] Slack/Teams notifications
- [ ] Action scheduling (execute at specific time)
- [ ] Action approval workflow
- [ ] Undo/rollback functionality
