import { google } from 'googleapis';
import { generateMeetingInvitationHTML, generateMeetingInvitationText, MeetingInvitationData } from './meeting-invitation-template';

// Helper function to get authenticated Gmail client
export async function getGmailClient(accessToken: string) {
  const auth = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );
  
  auth.setCredentials({
    access_token: accessToken,
  });

  return google.gmail({ version: 'v1', auth });
}

// Send meeting invitation emails to all participants
export async function sendMeetingInvitations(
  accessToken: string,
  meetingData: MeetingInvitationData
) {
  try {
    const gmail = await getGmailClient(accessToken);
    const results: Array<{ email: string; success: boolean; error?: string }> = [];

    // Generate email content
    const htmlContent = generateMeetingInvitationHTML(meetingData);
    const textContent = generateMeetingInvitationText(meetingData);
    
    // Send email to each participant
    for (const participantEmail of meetingData.attendees) {
      try {
        // Create email message
        const emailLines = [
          `To: ${participantEmail}`,
          `From: ${meetingData.hostEmail}`,
          `Subject: Meeting Invitation: ${meetingData.meetingTitle}`,
          `Content-Type: multipart/alternative; boundary="boundary123"`,
          '',
          '--boundary123',
          'Content-Type: text/plain; charset=UTF-8',
          '',
          textContent,
          '',
          '--boundary123',
          'Content-Type: text/html; charset=UTF-8',
          '',
          htmlContent,
          '',
          '--boundary123--'
        ];

        const email = emailLines.join('\n');
        const encodedEmail = Buffer.from(email).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

        // Send the email
        const response = await gmail.users.messages.send({
          userId: 'me',
          requestBody: {
            raw: encodedEmail,
          },
        });

        results.push({
          email: participantEmail,
          success: true,
        });

        console.log(`✅ Invitation sent to: ${participantEmail}`);
      } catch (error) {
        console.error(`❌ Failed to send invitation to ${participantEmail}:`, error);
        results.push({
          email: participantEmail,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const totalCount = results.length;

    return {
      success: successCount > 0,
      results,
      summary: {
        total: totalCount,
        sent: successCount,
        failed: totalCount - successCount,
      },
    };
  } catch (error) {
    console.error('Error sending meeting invitations:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      results: [],
      summary: {
        total: 0,
        sent: 0,
        failed: 0,
      },
    };
  }
}

// Send a single meeting invitation email
export async function sendSingleMeetingInvitation(
  accessToken: string,
  recipientEmail: string,
  meetingData: MeetingInvitationData
) {
  try {
    const gmail = await getGmailClient(accessToken);
    
    // Generate email content
    const htmlContent = generateMeetingInvitationHTML(meetingData);
    const textContent = generateMeetingInvitationText(meetingData);
    
    // Create email message
    const emailLines = [
      `To: ${recipientEmail}`,
      `From: ${meetingData.hostEmail}`,
      `Subject: Meeting Invitation: ${meetingData.meetingTitle}`,
      `Content-Type: multipart/alternative; boundary="boundary123"`,
      '',
      '--boundary123',
      'Content-Type: text/plain; charset=UTF-8',
      '',
      textContent,
      '',
      '--boundary123',
      'Content-Type: text/html; charset=UTF-8',
      '',
      htmlContent,
      '',
      '--boundary123--'
    ];

    const email = emailLines.join('\n');
    const encodedEmail = Buffer.from(email).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

    // Send the email
    const response = await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedEmail,
      },
    });

    return {
      success: true,
      messageId: response.data.id,
    };
  } catch (error) {
    console.error('Error sending meeting invitation:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Send meeting confirmation email to the host
export async function sendMeetingConfirmationToHost(
  accessToken: string,
  meetingData: MeetingInvitationData
) {
  try {
    const gmail = await getGmailClient(accessToken);
    
    const confirmationHtml = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Meeting Created Successfully</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
        <h1 style="margin: 0; font-size: 24px;">✅ Meeting Created Successfully!</h1>
        <p style="margin: 8px 0 0 0; opacity: 0.9;">Your meeting has been scheduled and invitations sent</p>
    </div>
    
    <div style="background: white; padding: 30px; border: 1px solid #e9ecef; border-top: none;">
        <h2 style="color: #495057; margin-top: 0;">${meetingData.meetingTitle}</h2>
        
        <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #28a745;">
            <p><strong>📅 Date:</strong> ${new Date(meetingData.startTime).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <p><strong>🕒 Time:</strong> ${new Date(meetingData.startTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}</p>
            <p><strong>👥 Participants:</strong> ${meetingData.attendees.length} invited</p>
            <p><strong>🔗 Meeting Link:</strong> <a href="${meetingData.meetingLink}" style="color: #667eea;">${meetingData.meetingLink}</a></p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="${meetingData.meetingLink}" style="display: inline-block; background: #28a745; color: white; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600;">Join as Host</a>
        </div>
        
        <div style="background: #d4edda; border: 1px solid #c3e6cb; border-radius: 6px; padding: 16px; margin: 20px 0;">
            <h3 style="margin: 0 0 10px 0; color: #155724;">📧 Invitations Sent:</h3>
            <ul style="margin: 0; padding-left: 20px; color: #155724;">
                ${meetingData.attendees.map(email => `<li>${email}</li>`).join('')}
            </ul>
        </div>
        
        <p style="text-align: center; color: #6c757d; font-size: 14px; margin-top: 30px;">
            You will automatically be the host when you join this meeting.<br>
            All participants have received invitation emails with the meeting details.
        </p>
    </div>
</body>
</html>`;

    const textContent = `
✅ MEETING CREATED SUCCESSFULLY!

${meetingData.meetingTitle}

📅 Date: ${new Date(meetingData.startTime).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
🕒 Time: ${new Date(meetingData.startTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
👥 Participants: ${meetingData.attendees.length} invited
🔗 Meeting Link: ${meetingData.meetingLink}

📧 INVITATIONS SENT TO:
${meetingData.attendees.map(email => `• ${email}`).join('\n')}

You will automatically be the host when you join this meeting.
All participants have received invitation emails with the meeting details.
`;

    // Create email message
    const emailLines = [
      `To: ${meetingData.hostEmail}`,
      `From: ${meetingData.hostEmail}`,
      `Subject: ✅ Meeting Created: ${meetingData.meetingTitle}`,
      `Content-Type: multipart/alternative; boundary="boundary456"`,
      '',
      '--boundary456',
      'Content-Type: text/plain; charset=UTF-8',
      '',
      textContent,
      '',
      '--boundary456',
      'Content-Type: text/html; charset=UTF-8',
      '',
      confirmationHtml,
      '',
      '--boundary456--'
    ];

    const email = emailLines.join('\n');
    const encodedEmail = Buffer.from(email).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

    // Send the email
    const response = await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedEmail,
      },
    });

    return {
      success: true,
      messageId: response.data.id,
    };
  } catch (error) {
    console.error('Error sending meeting confirmation:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}