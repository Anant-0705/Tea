import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { db } from '@/lib/google/firestore';

export async function GET(
  request: NextRequest,
  { params }: { params: { meetingId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { meetingId } = params;

    if (!meetingId) {
      return NextResponse.json({ error: 'Missing meetingId' }, { status: 400 });
    }

    // Get analysis from Firestore
    const analysisDoc = await db.collection('meeting_analysis').doc(meetingId).get();

    if (!analysisDoc.exists) {
      return NextResponse.json(
        { error: 'Analysis not found for this meeting' },
        { status: 404 }
      );
    }

    const analysisData = analysisDoc.data();

    return NextResponse.json({
      success: true,
      analysis: analysisData?.analysis || null,
      summary: analysisData?.summary || null,
      fullTranscript: analysisData?.fullTranscript || '',
      analyzedAt: analysisData?.analyzedAt || null,
      analyzedBy: analysisData?.analyzedBy || null,
    });

  } catch (error) {
    console.error('Error fetching analysis:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analysis', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
