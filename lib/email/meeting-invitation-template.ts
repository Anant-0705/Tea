export interface MeetingInvitationData {
  meetingTitle: string;
  hostName: string;
  hostEmail: string;
  startTime: string;
  endTime: string;
  timeZone: string;
  meetingLink: string;
  description?: string;
  attendees: string[];
  calendarEventId?: string;
}

export function generateMeetingInvitationHTML(data: MeetingInvitationData): string {
  const startDate = new Date(data.startTime);
  const endDate = new Date(data.endTime);
  const duration = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60)); // minutes
  
  const formattedDate = startDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  const formattedTime = startDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZoneName: 'short'
  });

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Meeting Invitation: ${data.meetingTitle}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8f9fa;
        }
        .email-container {
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 600;
        }
        .header p {
            margin: 8px 0 0 0;
            opacity: 0.9;
            font-size: 16px;
        }
        .content {
            padding: 30px;
        }
        .meeting-info {
            background: #f8f9fa;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
            border-left: 4px solid #667eea;
        }
        .info-row {
            display: flex;
            align-items: center;
            margin: 12px 0;
            padding: 8px 0;
        }
        .info-label {
            font-weight: 600;
            color: #495057;
            min-width: 100px;
            display: flex;
            align-items: center;
        }
        .info-value {
            color: #212529;
            flex: 1;
        }
        .icon {
            width: 18px;
            height: 18px;
            margin-right: 8px;
            opacity: 0.7;
        }
        .join-button {
            display: inline-block;
            background: linear-gradient(135deg, #28a745, #20c997);
            color: white;
            text-decoration: none;
            padding: 16px 32px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            text-align: center;
            margin: 20px 0;
            box-shadow: 0 4px 12px rgba(40, 167, 69, 0.3);
            transition: all 0.3s ease;
        }
        .join-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 16px rgba(40, 167, 69, 0.4);
        }
        .description {
            background: #ffffff;
            border: 1px solid #e9ecef;
            border-radius: 8px;
            padding: 16px;
            margin: 20px 0;
            white-space: pre-wrap;
        }
        .ai-features {
            background: linear-gradient(135deg, #f8f9fa, #e9ecef);
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        .ai-features h3 {
            margin: 0 0 12px 0;
            color: #495057;
            font-size: 16px;
        }
        .feature-list {
            list-style: none;
            padding: 0;
            margin: 0;
        }
        .feature-list li {
            padding: 4px 0;
            color: #6c757d;
            font-size: 14px;
        }
        .feature-list li:before {
            content: "✨";
            margin-right: 8px;
        }
        .footer {
            background: #f8f9fa;
            padding: 20px 30px;
            text-align: center;
            border-top: 1px solid #e9ecef;
            font-size: 14px;
            color: #6c757d;
        }
        .footer a {
            color: #667eea;
            text-decoration: none;
        }
        .calendar-note {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 6px;
            padding: 12px;
            margin: 16px 0;
            font-size: 14px;
            color: #856404;
        }
        @media (max-width: 600px) {
            body {
                padding: 10px;
            }
            .content {
                padding: 20px;
            }
            .header {
                padding: 20px;
            }
            .info-row {
                flex-direction: column;
                align-items: flex-start;
            }
            .info-label {
                margin-bottom: 4px;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h1>📅 Meeting Invitation</h1>
            <p>You've been invited to join a meeting</p>
        </div>
        
        <div class="content">
            <h2 style="color: #495057; margin-top: 0;">${data.meetingTitle}</h2>
            
            <div class="meeting-info">
                <div class="info-row">
                    <div class="info-label">
                        📅 <span>Date:</span>
                    </div>
                    <div class="info-value">${formattedDate}</div>
                </div>
                
                <div class="info-row">
                    <div class="info-label">
                        🕒 <span>Time:</span>
                    </div>
                    <div class="info-value">${formattedTime}</div>
                </div>
                
                <div class="info-row">
                    <div class="info-label">
                        ⏱️ <span>Duration:</span>
                    </div>
                    <div class="info-value">${duration} minutes</div>
                </div>
                
                <div class="info-row">
                    <div class="info-label">
                        👤 <span>Host:</span>
                    </div>
                    <div class="info-value">${data.hostName} (${data.hostEmail})</div>
                </div>
                
                <div class="info-row">
                    <div class="info-label">
                        📍 <span>Platform:</span>
                    </div>
                    <div class="info-value">Google Meet</div>
                </div>
            </div>

            ${data.description ? `
            <div class="description">
                <strong>Meeting Description:</strong><br>
                ${data.description}
            </div>
            ` : ''}

            <div style="text-align: center; margin: 30px 0;">
                <a href="${data.meetingLink}" class="join-button">
                    🎥 Join Meeting
                </a>
            </div>

            <div class="calendar-note">
                📌 <strong>Calendar Integration:</strong> This meeting has been added to your Google Calendar. 
                You can also join directly from your calendar event.
            </div>

            <div class="ai-features">
                <h3>🤖 AI-Powered Meeting Features</h3>
                <ul class="feature-list">
                    <li>Real-time transcription and recording</li>
                    <li>Automatic action item extraction</li>
                    <li>Smart task assignment and follow-ups</li>
                    <li>Meeting summary generation</li>
                    <li>Sentiment analysis and insights</li>
                    <li>Automated meeting minutes</li>
                </ul>
            </div>

            <div style="margin-top: 30px; padding: 20px; background: #f8f9fa; border-radius: 8px; text-align: center;">
                <h3 style="margin: 0 0 10px 0; color: #495057;">Need Help?</h3>
                <p style="margin: 0; color: #6c757d; font-size: 14px;">
                    Having trouble joining? 
                    <a href="mailto:${data.hostEmail}" style="color: #667eea;">Contact the host</a> or 
                    <a href="https://support.google.com/meet" style="color: #667eea;">view Google Meet help</a>
                </p>
            </div>
        </div>

        <div class="footer">
            <p>
                This invitation was sent by <strong>AutoTrack</strong><br>
                <a href="mailto:${data.hostEmail}">Reply to ${data.hostName}</a> | 
                <a href="${data.meetingLink}">Meeting Link</a>
            </p>
            <p style="margin-top: 12px; font-size: 12px;">
                Powered by AutoTrack - AI Meeting Intelligence Platform
            </p>
        </div>
    </div>
</body>
</html>`;
}

export function generateMeetingInvitationText(data: MeetingInvitationData): string {
  const startDate = new Date(data.startTime);
  const endDate = new Date(data.endTime);
  const duration = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60));
  
  const formattedDate = startDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  const formattedTime = startDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZoneName: 'short'
  });

  return `
📅 MEETING INVITATION

${data.meetingTitle}

📋 MEETING DETAILS:
• Date: ${formattedDate}
• Time: ${formattedTime}
• Duration: ${duration} minutes
• Host: ${data.hostName} (${data.hostEmail})
• Platform: Google Meet

${data.description ? `
📝 DESCRIPTION:
${data.description}
` : ''}

🎥 JOIN MEETING:
${data.meetingLink}

🤖 AI FEATURES INCLUDED:
• Real-time transcription and recording
• Automatic action item extraction
• Smart task assignment and follow-ups
• Meeting summary generation
• Sentiment analysis and insights
• Automated meeting minutes

📌 CALENDAR:
This meeting has been added to your Google Calendar.

❓ NEED HELP?
Contact the host: ${data.hostEmail}
Google Meet Support: https://support.google.com/meet

---
This invitation was sent by AutoTrack
AI Meeting Intelligence Platform
`;
}