import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { scheduleAutomaticMeeting } from '@/lib/automation/calendar-automation';
import { getMeeting } from '@/lib/google/firestore';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.accessToken) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { suggestion, meetingId, autoSchedule } = body;

    if (!suggestion || !meetingId) {
      return NextResponse.json(
        { success: false, error: 'Suggestion and meeting ID are required' },
        { status: 400 }
      );
    }

    // Get original meeting data for participant information
    const originalMeetingResult = await getMeeting(meetingId);
    if (!originalMeetingResult.success || !originalMeetingResult.meeting) {
      return NextResponse.json(
        { success: false, error: 'Original meeting not found' },
        { status: 404 }
      );
    }

    const originalMeeting = originalMeetingResult.meeting;
    const originalMeetingData = {
      participants: originalMeeting.attendees || [],
      organizerId: originalMeeting.organizerId || '',
    };

    // Schedule the meeting
    const result = await scheduleAutomaticMeeting(
      session.accessToken,
      suggestion,
      originalMeetingData
    );

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    // Log the scheduling action
    console.log(`Meeting scheduled: ${result.meetingId} (${autoSchedule ? 'auto' : 'manual'})`);

    return NextResponse.json({
      success: true,
      meetingId: result.meetingId,
      calendarEventId: result.calendarEventId,
      autoScheduled: autoSchedule,
      suggestion: {
        title: suggestion.title,
        time: suggestion.suggestedTime,
        duration: suggestion.duration,
        confidence: suggestion.confidence,
      },
    });

  } catch (error) {
    console.error('Schedule meeting API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    );
  }
}