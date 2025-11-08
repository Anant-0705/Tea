import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { db } from '@/lib/google/firestore';
import { sendEmail } from '@/lib/email/send';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await request.json();
    const { title, participants } = body;

    // Create test meeting
    const meetingRef = await db.collection('meetings').add({
      title: title || 'Test Follow-up Meeting',
      description: 'This is a test meeting created by the automation system',
      startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
      endTime: new Date(Date.now() + 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(), // +1 hour
      participants: participants || ['anantsinghal2134@gmail.com'],
      organizer: session?.user?.email || 'test@example.com',
      status: 'scheduled',
      createdAt: new Date().toISOString(),
      createdBy: session?.user?.email || 'test@example.com',
      isTest: true,
    });

    // Send invitation email
    const participantList = participants || ['anantsinghal2134@gmail.com'];
    
    for (const participant of participantList) {
      await sendEmail({
        to: participant,
        subject: `Meeting Invitation: ${title || 'Test Follow-up Meeting'}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">📅 You're Invited to a Meeting</h2>
            <div style="background: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <h3 style="margin-top: 0;">${title || 'Test Follow-up Meeting'}</h3>
              <p><strong>Date:</strong> ${new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleString()}</p>
              <p><strong>Duration:</strong> 60 minutes</p>
              <p><strong>Organizer:</strong> ${session?.user?.email || 'test@example.com'}</p>
            </div>
            <p style="color: #666; font-size: 12px;">
              This is a test meeting created by the automated actions system.
            </p>
          </div>
        `,
      });
    }

    return NextResponse.json({
      success: true,
      meetingId: meetingRef.id,
      message: `Meeting created and invitations sent to ${participantList.length} participants`,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
