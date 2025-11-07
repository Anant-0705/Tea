import { google } from 'googleapis';

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export interface MeetingSummaryData {
  meetingTitle: string;
  date: string;
  duration: string;
  participants: string[];
  summary: string;
  actionItems: Array<{
    task: string;
    assignee?: string;
    priority: 'low' | 'medium' | 'high';
    dueDate?: string;
  }>;
  sentimentScore?: number;
  keyPoints: string[];
}

export interface ActionItemAlert {
  task: string;
  assignee: string;
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  meetingTitle: string;
  daysUntilDue?: number;
}

// Gmail API client setup
async function getGmailClient(accessToken: string) {
  const auth = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );
  
  auth.setCredentials({
    access_token: accessToken,
  });

  return google.gmail({ version: 'v1', auth });
}

// Create email message in Gmail format
function createEmailMessage(
  to: string[],
  subject: string,
  htmlContent: string,
  textContent: string,
  from?: string
): string {
  const fromAddress = from || process.env.SMTP_FROM || 'autotrack@yourdomain.com';
  
  const message = [
    `From: ${fromAddress}`,
    `To: ${to.join(', ')}`,
    `Subject: ${subject}`,
    'MIME-Version: 1.0',
    'Content-Type: multipart/alternative; boundary="boundary"',
    '',
    '--boundary',
    'Content-Type: text/plain; charset=utf-8',
    '',
    textContent,
    '',
    '--boundary',
    'Content-Type: text/html; charset=utf-8',
    '',
    htmlContent,
    '',
    '--boundary--'
  ].join('\n');

  return Buffer.from(message).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// Generate meeting summary email template
export function generateMeetingSummaryTemplate(data: MeetingSummaryData): EmailTemplate {
  const priorityColors = {
    high: '#ef4444',
    medium: '#f59e0b',
    low: '#10b981'
  };

  const subject = `Meeting Summary: ${data.meetingTitle} - ${data.date}`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Meeting Summary</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px; margin-bottom: 20px; }
    .content { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
    .action-item { background: white; border-left: 4px solid #10b981; padding: 15px; margin: 10px 0; border-radius: 4px; }
    .priority-high { border-left-color: #ef4444; }
    .priority-medium { border-left-color: #f59e0b; }
    .priority-low { border-left-color: #10b981; }
    .stats { display: flex; gap: 20px; margin: 20px 0; }
    .stat { background: white; padding: 15px; border-radius: 8px; text-align: center; flex: 1; }
    .footer { text-align: center; color: #666; font-size: 14px; margin-top: 30px; }
    .btn { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎯 Meeting Summary</h1>
      <h2>${data.meetingTitle}</h2>
      <p>${data.date} • ${data.duration} • ${data.participants.length} participants</p>
    </div>

    <div class="content">
      <h3>📋 Meeting Overview</h3>
      <p>${data.summary}</p>
      
      ${data.sentimentScore ? `
      <div class="stats">
        <div class="stat">
          <strong>Overall Sentiment</strong><br>
          ${data.sentimentScore > 0.7 ? '😊 Positive' : data.sentimentScore > 0.4 ? '😐 Neutral' : '😟 Negative'}
        </div>
        <div class="stat">
          <strong>Action Items</strong><br>
          ${data.actionItems.length}
        </div>
        <div class="stat">
          <strong>Participants</strong><br>
          ${data.participants.length}
        </div>
      </div>
      ` : ''}
    </div>

    ${data.keyPoints.length > 0 ? `
    <div class="content">
      <h3>🔑 Key Points</h3>
      <ul>
        ${data.keyPoints.map(point => `<li>${point}</li>`).join('')}
      </ul>
    </div>
    ` : ''}

    ${data.actionItems.length > 0 ? `
    <div class="content">
      <h3>✅ Action Items</h3>
      ${data.actionItems.map(item => `
        <div class="action-item priority-${item.priority}">
          <strong>${item.task}</strong>
          ${item.assignee ? `<br><small>👤 Assigned to: ${item.assignee}</small>` : ''}
          ${item.dueDate ? `<br><small>📅 Due: ${new Date(item.dueDate).toLocaleDateString()}</small>` : ''}
          <br><small>🎯 Priority: ${item.priority.toUpperCase()}</small>
        </div>
      `).join('')}
    </div>
    ` : ''}

    <div class="content">
      <h3>👥 Participants</h3>
      <p>${data.participants.join(', ')}</p>
    </div>

    <div class="footer">
      <p>This summary was automatically generated by AutoTrack AI</p>
      <p>Powered by AI-driven meeting intelligence</p>
    </div>
  </div>
</body>
</html>
  `;

  const text = `
MEETING SUMMARY: ${data.meetingTitle}
Date: ${data.date}
Duration: ${data.duration}
Participants: ${data.participants.join(', ')}

SUMMARY:
${data.summary}

${data.keyPoints.length > 0 ? `
KEY POINTS:
${data.keyPoints.map(point => `• ${point}`).join('\n')}
` : ''}

${data.actionItems.length > 0 ? `
ACTION ITEMS:
${data.actionItems.map(item => `
• ${item.task}
  ${item.assignee ? `Assigned to: ${item.assignee}` : ''}
  ${item.dueDate ? `Due: ${new Date(item.dueDate).toLocaleDateString()}` : ''}
  Priority: ${item.priority.toUpperCase()}
`).join('\n')}
` : ''}

---
This summary was automatically generated by AutoTrack AI
  `;

  return { subject, html, text };
}

// Generate action item reminder email
export function generateActionItemReminderTemplate(alert: ActionItemAlert): EmailTemplate {
  const subject = `🔔 Action Item Reminder: ${alert.task}`;
  
  const urgencyLevel = alert.daysUntilDue !== undefined && alert.daysUntilDue <= 1 ? 'urgent' : 
                      alert.daysUntilDue !== undefined && alert.daysUntilDue <= 3 ? 'soon' : 'upcoming';
  
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Action Item Reminder</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 500px; margin: 0 auto; padding: 20px; }
    .header { background: ${alert.priority === 'high' ? '#ef4444' : alert.priority === 'medium' ? '#f59e0b' : '#10b981'}; color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; text-align: center; }
    .content { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
    .task { background: white; padding: 20px; border-radius: 8px; border-left: 4px solid ${alert.priority === 'high' ? '#ef4444' : alert.priority === 'medium' ? '#f59e0b' : '#10b981'}; }
    .footer { text-align: center; color: #666; font-size: 14px; }
    .btn { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔔 Action Item Reminder</h1>
      <p>Priority: ${alert.priority.toUpperCase()}</p>
    </div>

    <div class="content">
      <div class="task">
        <h3>${alert.task}</h3>
        <p><strong>From meeting:</strong> ${alert.meetingTitle}</p>
        <p><strong>Assigned to:</strong> ${alert.assignee}</p>
        ${alert.dueDate ? `<p><strong>Due date:</strong> ${new Date(alert.dueDate).toLocaleDateString()}</p>` : ''}
        ${alert.daysUntilDue !== undefined ? `
          <p><strong>Days until due:</strong> 
            ${alert.daysUntilDue === 0 ? '⚠️ Due TODAY' : 
              alert.daysUntilDue === 1 ? '⚠️ Due TOMORROW' : 
              `${alert.daysUntilDue} days`}
          </p>
        ` : ''}
      </div>
    </div>

    <div class="footer">
      <p>This reminder was automatically sent by AutoTrack AI</p>
    </div>
  </div>
</body>
</html>
  `;

  const text = `
ACTION ITEM REMINDER

Task: ${alert.task}
From meeting: ${alert.meetingTitle}
Assigned to: ${alert.assignee}
Priority: ${alert.priority.toUpperCase()}
${alert.dueDate ? `Due date: ${new Date(alert.dueDate).toLocaleDateString()}` : ''}
${alert.daysUntilDue !== undefined ? `Days until due: ${alert.daysUntilDue === 0 ? 'Due TODAY' : alert.daysUntilDue === 1 ? 'Due TOMORROW' : `${alert.daysUntilDue} days`}` : ''}

---
This reminder was automatically sent by AutoTrack AI
  `;

  return { subject, html, text };
}

// Send meeting summary email
export async function sendMeetingSummary(
  accessToken: string,
  recipients: string[],
  summaryData: MeetingSummaryData
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const gmail = await getGmailClient(accessToken);
    const template = generateMeetingSummaryTemplate(summaryData);
    
    const encodedMessage = createEmailMessage(
      recipients,
      template.subject,
      template.html,
      template.text
    );

    const response = await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMessage,
      },
    });

    return {
      success: true,
      messageId: response.data.id,
    };

  } catch (error) {
    console.error('Error sending meeting summary:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Send action item reminder
export async function sendActionItemReminder(
  accessToken: string,
  recipient: string,
  alertData: ActionItemAlert
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const gmail = await getGmailClient(accessToken);
    const template = generateActionItemReminderTemplate(alertData);
    
    const encodedMessage = createEmailMessage(
      [recipient],
      template.subject,
      template.html,
      template.text
    );

    const response = await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMessage,
      },
    });

    return {
      success: true,
      messageId: response.data.id,
    };

  } catch (error) {
    console.error('Error sending action item reminder:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Send daily digest
export async function sendDailyDigest(
  accessToken: string,
  recipient: string,
  digestData: {
    date: string;
    meetings: Array<{
      title: string;
      time: string;
      actionItemsCount: number;
    }>;
    totalActionItems: number;
    completedActionItems: number;
    upcomingDeadlines: Array<{
      task: string;
      dueDate: string;
      priority: 'low' | 'medium' | 'high';
    }>;
  }
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const gmail = await getGmailClient(accessToken);
    
    const subject = `📊 Daily Meeting Digest - ${digestData.date}`;
    
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Daily Digest</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; text-align: center; }
    .stats { display: flex; gap: 15px; margin: 20px 0; }
    .stat { background: white; padding: 15px; border-radius: 8px; text-align: center; flex: 1; border: 1px solid #e5e7eb; }
    .meeting { background: white; padding: 15px; margin: 10px 0; border-radius: 8px; border-left: 4px solid #10b981; }
    .content { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
    .footer { text-align: center; color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📊 Daily Meeting Digest</h1>
      <p>${digestData.date}</p>
    </div>

    <div class="stats">
      <div class="stat">
        <strong>${digestData.meetings.length}</strong><br>
        <small>Meetings</small>
      </div>
      <div class="stat">
        <strong>${digestData.totalActionItems}</strong><br>
        <small>Action Items</small>
      </div>
      <div class="stat">
        <strong>${digestData.completedActionItems}</strong><br>
        <small>Completed</small>
      </div>
    </div>

    ${digestData.meetings.length > 0 ? `
    <div class="content">
      <h3>📅 Today's Meetings</h3>
      ${digestData.meetings.map(meeting => `
        <div class="meeting">
          <strong>${meeting.title}</strong><br>
          <small>⏰ ${meeting.time} • ${meeting.actionItemsCount} action items</small>
        </div>
      `).join('')}
    </div>
    ` : ''}

    ${digestData.upcomingDeadlines.length > 0 ? `
    <div class="content">
      <h3>⚠️ Upcoming Deadlines</h3>
      ${digestData.upcomingDeadlines.map(deadline => `
        <div class="meeting">
          <strong>${deadline.task}</strong><br>
          <small>📅 Due: ${new Date(deadline.dueDate).toLocaleDateString()} • Priority: ${deadline.priority.toUpperCase()}</small>
        </div>
      `).join('')}
    </div>
    ` : ''}

    <div class="footer">
      <p>Daily digest powered by AutoTrack AI</p>
    </div>
  </div>
</body>
</html>
    `;

    const text = `
DAILY MEETING DIGEST - ${digestData.date}

SUMMARY:
• ${digestData.meetings.length} meetings
• ${digestData.totalActionItems} action items
• ${digestData.completedActionItems} completed

${digestData.meetings.length > 0 ? `
TODAY'S MEETINGS:
${digestData.meetings.map(meeting => `• ${meeting.title} at ${meeting.time} (${meeting.actionItemsCount} action items)`).join('\n')}
` : ''}

${digestData.upcomingDeadlines.length > 0 ? `
UPCOMING DEADLINES:
${digestData.upcomingDeadlines.map(deadline => `• ${deadline.task} - Due: ${new Date(deadline.dueDate).toLocaleDateString()} (${deadline.priority.toUpperCase()})`).join('\n')}
` : ''}

---
Daily digest powered by AutoTrack AI
    `;

    const encodedMessage = createEmailMessage(
      [recipient],
      subject,
      html,
      text
    );

    const response = await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMessage,
      },
    });

    return {
      success: true,
      messageId: response.data.id,
    };

  } catch (error) {
    console.error('Error sending daily digest:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}