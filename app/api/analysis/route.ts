import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { analyzeMeetingTranscript, analyzeTranscriptChunk } from '@/lib/google/ai-analysis';
import { getMeetingTranscripts } from '@/lib/google/firestore';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { meetingId, analysisType = 'full' } = body;

    if (!meetingId) {
      return NextResponse.json(
        { error: 'Missing meetingId parameter' },
        { status: 400 }
      );
    }

    if (analysisType === 'chunk') {
      // Real-time analysis for individual transcript chunks
      const { transcriptChunk } = body;
      
      if (!transcriptChunk) {
        return NextResponse.json(
          { error: 'Missing transcriptChunk for chunk analysis' },
          { status: 400 }
        );
      }

      const result = await analyzeTranscriptChunk(transcriptChunk, meetingId);
      
      return NextResponse.json({
        success: true,
        analysisType: 'chunk',
        result,
      });
    }

    // Full meeting analysis
    const transcriptsResult = await getMeetingTranscripts(meetingId);
    
    if (!transcriptsResult.success) {
      return NextResponse.json(
        { error: 'Failed to fetch meeting transcripts', details: transcriptsResult.error },
        { status: 500 }
      );
    }

    if (transcriptsResult.transcripts.length === 0) {
      return NextResponse.json(
        { error: 'No transcripts found for this meeting' },
        { status: 404 }
      );
    }

    // Analyze the full meeting transcript
    const analysisResult = await analyzeMeetingTranscript(
      transcriptsResult.transcripts,
      meetingId
    );

    return NextResponse.json({
      success: true,
      analysisType: 'full',
      meetingId,
      transcriptCount: transcriptsResult.transcripts.length,
      analysis: analysisResult,
    });

  } catch (error) {
    console.error('Error processing analysis request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const meetingId = searchParams.get('meetingId');

    if (!meetingId) {
      return NextResponse.json(
        { error: 'Missing meetingId parameter' },
        { status: 400 }
      );
    }

    // Get meeting transcripts for analysis preview
    const transcriptsResult = await getMeetingTranscripts(meetingId);
    
    if (!transcriptsResult.success) {
      return NextResponse.json(
        { error: 'Failed to fetch meeting transcripts', details: transcriptsResult.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      meetingId,
      transcriptCount: transcriptsResult.transcripts.length,
      lastTranscript: transcriptsResult.transcripts[transcriptsResult.transcripts.length - 1],
      analysisReady: transcriptsResult.transcripts.length > 0,
    });

  } catch (error) {
    console.error('Error fetching analysis data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}