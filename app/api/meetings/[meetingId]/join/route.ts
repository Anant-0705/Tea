import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { getMeeting, updateMeetingStatus, db } from '@/lib/google/firestore';

export async function POST(
  request: NextRequest,
  { params }: { params: { meetingId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { meetingId } = params;
    const body = await request.json();
    const { action } = body;

    // Get meeting details
    const meetingResult = await getMeeting(meetingId);
    
    if (!meetingResult.success || !meetingResult.meeting) {
      return NextResponse.json(
        { error: 'Meeting not found' },
        { status: 404 }
      );
    }

    const meeting = meetingResult.meeting;

    if (action === 'join') {
      // Update meeting status to in-progress
      await updateMeetingStatus(meetingId, 'in-progress');

      // Create transcription session
      const transcriptionSessionId = `session_${meetingId}_${Date.now()}`;
      
      await db.collection('transcription_sessions').doc(transcriptionSessionId).set({
        meetingId,
        sessionId: transcriptionSessionId,
        participants: meeting.attendees || [],
        startTime: new Date().toISOString(),
        isActive: true,
        createdBy: session.user?.email,
        createdAt: new Date(),
      });

      return NextResponse.json({
        success: true,
        meetingId,
        transcriptionSessionId,
        meeting: {
          id: meeting.id,
          title: meeting.title,
          description: meeting.description,
          participants: meeting.attendees,
          meetingLink: meeting.meetingLink,
        },
        message: 'Joined meeting successfully. Transcription session started.',
      });
    }

    if (action === 'leave') {
      // Update meeting status to completed
      await updateMeetingStatus(meetingId, 'completed');

      return NextResponse.json({
        success: true,
        meetingId,
        message: 'Left meeting successfully.',
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Error handling meeting join/leave:', error);
    return NextResponse.json(
      { error: 'Failed to process request', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
