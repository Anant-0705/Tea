import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { getMeetingTranscripts, db } from '@/lib/google/firestore';
import { analyzeTranscriptWithVertexAI, generateMeetingSummary } from '@/lib/google/vertex-ai';

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

    // Get all transcripts for the meeting
    const transcriptsResult = await getMeetingTranscripts(meetingId);
    
    if (!transcriptsResult.success || transcriptsResult.transcripts.length === 0) {
      return NextResponse.json(
        { error: 'No transcripts found for this meeting' },
        { status: 404 }
      );
    }

    // Get meeting details
    const meetingDoc = await db.collection('meetings').doc(meetingId).get();
    if (!meetingDoc.exists) {
      return NextResponse.json(
        { error: 'Meeting not found' },
        { status: 404 }
      );
    }

    const meetingData = meetingDoc.data();
    
    // Combine all transcripts into a single text
    const fullTranscript = transcriptsResult.transcripts
      .map(t => `${t.speaker}: ${t.text}`)
      .join('\n');

    // Extract unique participants from transcripts
    const participants = Array.from(
      new Set(transcriptsResult.transcripts.map(t => t.speaker))
    );

    // Analyze with Vertex AI
    const analysis = await analyzeTranscriptWithVertexAI(
      fullTranscript,
      participants,
      {
        title: meetingData?.title || 'Meeting',
        date: meetingData?.startTime || new Date().toISOString(),
        duration: calculateDuration(meetingData?.startTime, meetingData?.endTime),
      }
    );

    // Generate comprehensive summary
    const summary = await generateMeetingSummary(analysis, {
      title: meetingData?.title || 'Meeting',
      date: meetingData?.startTime || new Date().toISOString(),
      duration: calculateDuration(meetingData?.startTime, meetingData?.endTime),
      participants,
    });

    // Store analysis results in Firestore
    await db.collection('meeting_analysis').doc(meetingId).set({
      meetingId,
      analysis,
      summary,
      fullTranscript,
      analyzedAt: new Date().toISOString(),
      analyzedBy: session.user?.email,
    });

    // Store action items
    for (const actionItem of analysis.actionItems) {
      await db.collection('action-items').add({
        meetingId,
        ...actionItem,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      success: true,
      analysis,
      summary,
      message: 'Meeting analyzed successfully',
    });

  } catch (error) {
    console.error('Error analyzing meeting:', error);
    return NextResponse.json(
      { error: 'Failed to analyze meeting', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

function calculateDuration(startTime?: string, endTime?: string): number {
  if (!startTime || !endTime) return 0;
  
  const start = new Date(startTime).getTime();
  const end = new Date(endTime).getTime();
  return Math.round((end - start) / 60000); // Convert to minutes
}
