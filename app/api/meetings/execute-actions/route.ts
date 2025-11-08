import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { db } from '@/lib/google/firestore';
import { sendEmail } from '@/lib/email/send';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { meetingId, actions } = body;

    if (!meetingId || !actions || !Array.isArray(actions)) {
      return NextResponse.json(
        { error: 'Missing meetingId or actions' },
        { status: 400 }
      );
    }

    const results = [];

    for (const action of actions) {
      try {
        let result;
        
        switch (action.type) {
          case 'send_email':
            result = await executeEmailAction(action, session, meetingId);
            break;
          
          case 'schedule_meeting':
            result = await executeScheduleMeetingAction(action, session, meetingId);
            break;
          
          case 'create_task':
            result = await executeCreateTaskAction(action, session, meetingId);
            break;
          
          default:
            result = { success: false, error: 'Unknown action type' };
        }

        results.push({
          actionId: action.id,
          ...result
        });

        // Log the action execution
        await db.collection('action_executions').add({
          meetingId,
          actionId: action.id,
          actionType: action.type,
          executedBy: session.user?.email,
          executedAt: new Date().toISOString(),
          result,
        });

      } catch (error) {
        console.error(`Error executing action ${action.id}:`, error);
        results.push({
          actionId: action.id,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return NextResponse.json({
      success: true,
      results,
      message: `Executed ${results.filter(r => r.success).length}/${actions.length} actions successfully`
    });

  } catch (error) {
    console.error('Error executing actions:', error);
    return NextResponse.json(
      { error: 'Failed to execute actions', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

async function executeEmailAction(action: any, session: any, meetingId: string) {
  const { recipient, subject, body } = action.data;

  if (!recipient || !subject || !body) {
    return { success: false, error: 'Missing email data' };
  }

  try {
    // Enhanced email with meeting details
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">📧 Meeting Follow-up</h1>
        </div>
        
        <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
          <p style="color: #374151; font-size: 16px; line-height: 1.6;">
            Hi there! 👋
          </p>
          
          <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
            <p style="color: #1f2937; font-size: 15px; line-height: 1.8; margin: 0;">
              ${body}
            </p>
          </div>
          
          <div style="margin: 30px 0; padding: 20px; background: #eff6ff; border-radius: 8px;">
            <p style="margin: 0 0 10px 0; color: #1e40af; font-weight: 600;">
              🤖 AI-Generated Action
            </p>
            <p style="margin: 0; color: #1e3a8a; font-size: 14px;">
              This email was automatically sent based on AI analysis of your recent meeting.
            </p>
          </div>
          
          <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
            Best regards,<br>
            <strong>Meeting Automation System</strong>
          </p>
        </div>
        
        <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
          <p style="margin: 5px 0;">Meeting ID: ${meetingId}</p>
          <p style="margin: 5px 0;">Sent: ${new Date().toLocaleString()}</p>
        </div>
      </div>
    `;

    const result = await sendEmail({
      to: recipient,
      subject: subject,
      html: emailHtml,
      from: process.env.SMTP_FROM || 'aadityasinghal77@gmail.com',
    });

    if (!result.success) {
      return { success: false, error: result.error || 'Failed to send email' };
    }

    return { success: true, message: `✅ Email sent to ${recipient}` };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to send email' };
  }
}

async function executeScheduleMeetingAction(action: any, session: any, meetingId: string) {
  const { title, participants, date, duration, description } = action.data;

  if (!title || !participants || !date) {
    return { success: false, error: 'Missing meeting data' };
  }

  try {
    // Create meeting in Firestore
    const meetingRef = await db.collection('meetings').add({
      title,
      description: description || `Follow-up meeting scheduled by AI from meeting ${meetingId}`,
      startTime: new Date(date).toISOString(),
      endTime: new Date(new Date(date).getTime() + (duration || 60) * 60000).toISOString(),
      participants: Array.isArray(participants) ? participants : [participants],
      organizer: session.user?.email,
      status: 'scheduled',
      createdAt: new Date().toISOString(),
      createdBy: session.user?.email,
      parentMeetingId: meetingId,
      autoScheduled: true,
    });

    // Send invitations to participants
    const participantList = Array.isArray(participants) ? participants : [participants];
    
    for (const participant of participantList) {
      await sendEmail({
        to: participant,
        subject: `Meeting Invitation: ${title}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">You're Invited to a Meeting</h2>
            <div style="background: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <h3 style="margin-top: 0;">${title}</h3>
              <p><strong>Date:</strong> ${new Date(date).toLocaleString()}</p>
              <p><strong>Duration:</strong> ${duration || 60} minutes</p>
              <p><strong>Organizer:</strong> ${session.user?.email}</p>
              ${description ? `<p><strong>Description:</strong> ${description}</p>` : ''}
            </div>
            <p style="color: #666; font-size: 12px;">
              This meeting was automatically scheduled based on AI recommendations.
            </p>
          </div>
        `,
        from: session.user?.email || 'noreply@yourdomain.com',
      });
    }

    return { 
      success: true, 
      message: `Meeting scheduled with ${participantList.length} participants`,
      meetingId: meetingRef.id 
    };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to schedule meeting' };
  }
}

async function executeCreateTaskAction(action: any, session: any, meetingId: string) {
  const { task, assignee, priority, dueDate } = action.data;

  if (!task) {
    return { success: false, error: 'Missing task data' };
  }

  try {
    // Create task in Firestore
    const taskRef = await db.collection('action-items').add({
      meetingId,
      task,
      assignee: assignee || session.user?.email,
      priority: priority || 'medium',
      dueDate: dueDate || null,
      status: 'pending',
      createdAt: new Date().toISOString(),
      createdBy: session.user?.email,
      autoCreated: true,
    });

    // Send notification to assignee
    if (assignee && assignee !== session.user?.email) {
      await sendEmail({
        to: assignee,
        subject: `New Task Assigned: ${task}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">New Task Assigned</h2>
            <div style="background: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <p><strong>Task:</strong> ${task}</p>
              <p><strong>Priority:</strong> ${priority || 'medium'}</p>
              ${dueDate ? `<p><strong>Due Date:</strong> ${new Date(dueDate).toLocaleDateString()}</p>` : ''}
              <p><strong>Assigned by:</strong> ${session.user?.email}</p>
            </div>
            <p style="color: #666; font-size: 12px;">
              This task was automatically created based on AI analysis of meeting: ${meetingId}
            </p>
          </div>
        `,
        from: session.user?.email || 'noreply@yourdomain.com',
      });
    }

    return { 
      success: true, 
      message: `Task created and assigned to ${assignee || session.user?.email}`,
      taskId: taskRef.id 
    };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to create task' };
  }
}
