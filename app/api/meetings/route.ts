import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { createMeetingEvent } from '@/lib/google/calendar';
import { createMeeting } from '@/lib/google/firestore';
import { sendMeetingInvitations, sendMeetingConfirmationToHost } from '@/lib/email/meeting-invitations';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.accessToken) {
      return NextResponse.json(
        { error: 'Unauthorized - No access token' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      title,
      description,
      startTime,
      endTime,
      timeZone = 'America/New_York',
      attendees = [],
    } = body;

    if (!title || !startTime || !endTime) {
      return NextResponse.json(
        { error: 'Missing required fields: title, startTime, endTime' },
        { status: 400 }
      );
    }

    // Create calendar event with Google Meet link
    const calendarResult = await createMeetingEvent(session.accessToken, {
      summary: title,
      description: `${description}

🎯 Meeting Host: ${session.user?.name} (${session.user?.email})
📅 Created via AutoTrack
🔗 Join as host using the same Google account that created this event

---
This meeting includes AI-powered:
• Real-time transcription
• Automatic action item extraction  
• Smart task generation
• Meeting analytics
      `,
      startTime,
      endTime,
      timeZone,
      attendees,
      organizerEmail: session.user?.email || undefined,
      organizerName: session.user?.name || undefined,
    });

    if (!calendarResult.success) {
      return NextResponse.json(
        { error: 'Failed to create calendar event', details: calendarResult.error },
        { status: 500 }
      );
    }

    // Store meeting in Firestore
    const meetingResult = await createMeeting({
      title,
      description,
      startTime,
      endTime,
      meetingLink: calendarResult.meetLink || undefined,
      calendarEventId: calendarResult.event?.id || undefined,
      organizerId: session.user?.id || '',
      attendees,
      status: 'scheduled',
    });

    if (!meetingResult.success) {
      return NextResponse.json(
        { error: 'Failed to store meeting', details: meetingResult.error },
        { status: 500 }
      );
    }

    // Send invitation emails to all participants
    let emailResults = null;
    if (attendees && attendees.length > 0) {
      console.log(`📧 Sending invitations to ${attendees.length} participants...`);
      
      emailResults = await sendMeetingInvitations(session.accessToken, {
        meetingTitle: title,
        hostName: session.user?.name || 'Unknown Host',
        hostEmail: session.user?.email || '',
        startTime,
        endTime,
        timeZone,
        meetingLink: calendarResult.meetLink || '',
        description,
        attendees,
        calendarEventId: calendarResult.event?.id || undefined,
      });

      console.log(`📊 Email results: ${emailResults.summary.sent}/${emailResults.summary.total} sent successfully`);
    }

    // Send confirmation email to the host
    const hostConfirmation = await sendMeetingConfirmationToHost(session.accessToken, {
      meetingTitle: title,
      hostName: session.user?.name || 'Unknown Host',
      hostEmail: session.user?.email || '',
      startTime,
      endTime,
      timeZone,
      meetingLink: calendarResult.meetLink || '',
      description,
      attendees,
      calendarEventId: calendarResult.event?.id || undefined,
    });

    return NextResponse.json({
      success: true,
      meeting: {
        id: meetingResult.id,
        title,
        description,
        startTime,
        endTime,
        meetingLink: calendarResult.meetLink,
        calendarEventId: calendarResult.event?.id,
        status: 'scheduled',
      },
      calendarEvent: calendarResult.event,
      emailInvitations: emailResults ? {
        sent: emailResults.summary.sent,
        total: emailResults.summary.total,
        failed: emailResults.summary.failed,
        results: emailResults.results,
      } : null,
      hostConfirmation: hostConfirmation.success,
    });

  } catch (error) {
    console.error('Error creating meeting:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.accessToken) {
      return NextResponse.json(
        { error: 'Unauthorized - No access token' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const timeMin = searchParams.get('timeMin');
    const timeMax = searchParams.get('timeMax');

    // Get calendar events (this could be expanded to also get from Firestore)
    const { getCalendarEvents } = await import('@/lib/google/calendar');
    const result = await getCalendarEvents(session.accessToken, timeMin || undefined, timeMax || undefined);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Failed to fetch calendar events', details: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      events: result.events,
    });

  } catch (error) {
    console.error('Error fetching meetings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}