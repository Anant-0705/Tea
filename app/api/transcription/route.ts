import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { 
  transcribeAudioFile, 
  formatTranscription,
  createMeetingTranscriptionSession,
  analyzeMeetingTranscription,
  MeetingTranscriptionSession,
  StreamingTranscriptionResult
} from '@/lib/google/speech';
import { addTranscriptEntry, getMeetingTranscripts, db } from '@/lib/google/firestore';

// In-memory storage for active transcription sessions
const activeSessions = new Map<string, MeetingTranscriptionSession>();

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
    const { action, meetingId, participants, audioData, sessionId, transcriptData } = body;

    // Handle different transcription actions
    switch (action) {
      case 'start_session':
        return await startTranscriptionSession(meetingId, participants, session.user?.email || '');
      
      case 'add_transcript':
        return await addRealtimeTranscript(sessionId, transcriptData);
      
      case 'end_session':
        return await endTranscriptionSession(sessionId);
      
      case 'get_session':
        return await getSessionStatus(sessionId);
      
      default:
        // Fall back to original file upload transcription
        return await handleFileTranscription(request, session);
    }
  } catch (error) {
    console.error('Error processing transcription:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Original file transcription handler
async function handleFileTranscription(request: NextRequest, session: any) {
  const formData = await request.formData();
  const audioFile = formData.get('audio') as File;
  const meetingId = formData.get('meetingId') as string;
  const speaker = formData.get('speaker') as string || 'Unknown Speaker';

  if (!audioFile || !meetingId) {
    return NextResponse.json(
      { error: 'Missing required fields: audio file and meetingId' },
      { status: 400 }
    );
  }

  // Convert audio file to buffer
  const audioBytes = Buffer.from(await audioFile.arrayBuffer());

  // Transcribe audio
  const transcriptionResult = await transcribeAudioFile(audioBytes, {
    encoding: 'WEBM_OPUS',
    sampleRateHertz: 48000,
    languageCode: 'en-US',
    enableSpeakerDiarization: true,
    diarizationSpeakerCount: 6,
  });

  if (!transcriptionResult.success) {
    return NextResponse.json(
      { error: 'Failed to transcribe audio', details: transcriptionResult.error },
      { status: 500 }
    );
  }

  // Format and store transcription
  const formattedTranscripts = formatTranscription(transcriptionResult.transcription);
  const storedTranscripts = [];

  for (const transcript of formattedTranscripts) {
    const result = await addTranscriptEntry({
      meetingId,
      speaker: transcript.speaker,
      text: transcript.text,
      timestamp: new Date().toISOString(),
      confidence: 0.95,
    });

    if (result.success) {
      storedTranscripts.push({
        id: result.id,
        speaker: transcript.speaker,
        text: transcript.text,
        timestamp: new Date().toISOString(),
      });
    }
  }

  return NextResponse.json({
    success: true,
    transcripts: storedTranscripts,
    rawTranscription: transcriptionResult.transcription,
  });
}

// Start a new real-time transcription session
async function startTranscriptionSession(
  meetingId: string,
  participants: string[],
  userEmail: string
) {
  try {
    const transcriptionSession = createMeetingTranscriptionSession(meetingId, participants);
    activeSessions.set(transcriptionSession.sessionId, transcriptionSession);

    // Store session in Firestore
    await db.collection('transcription_sessions').doc(transcriptionSession.sessionId).set({
      ...transcriptionSession,
      createdBy: userEmail,
      createdAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      sessionId: transcriptionSession.sessionId,
      meetingId,
      participants,
      message: 'Real-time transcription session started',
    });
  } catch (error) {
    console.error('Error starting transcription session:', error);
    return NextResponse.json(
      { error: 'Failed to start transcription session' },
      { status: 500 }
    );
  }
}

// Add real-time transcript to session
async function addRealtimeTranscript(
  sessionId: string,
  transcriptData: StreamingTranscriptionResult
) {
  try {
    const session = activeSessions.get(sessionId);
    if (!session || !session.isActive) {
      return NextResponse.json(
        { error: 'Session not found or inactive' },
        { status: 404 }
      );
    }

    // Add transcript to session
    session.transcripts.push(transcriptData);

    // Store final transcripts in Firestore
    if (transcriptData.isFinal) {
      await addTranscriptEntry({
        meetingId: session.meetingId,
        speaker: transcriptData.speakerTag ? `Speaker ${transcriptData.speakerTag + 1}` : 'Unknown',
        text: transcriptData.transcript,
        timestamp: transcriptData.timestamp,
        confidence: transcriptData.confidence,
        sessionId: sessionId,
      });
    }

    return NextResponse.json({
      success: true,
      sessionId,
      transcriptAdded: true,
      isFinal: transcriptData.isFinal,
      transcript: transcriptData.transcript,
      totalTranscripts: session.transcripts.length,
    });
  } catch (error) {
    console.error('Error adding real-time transcript:', error);
    return NextResponse.json(
      { error: 'Failed to add transcript' },
      { status: 500 }
    );
  }
}

// End transcription session and generate analysis
async function endTranscriptionSession(sessionId: string) {
  try {
    const session = activeSessions.get(sessionId);
    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    session.isActive = false;
    const analysis = analyzeMeetingTranscription(session);

    // Update session in Firestore
    await db.collection('transcription_sessions').doc(sessionId).update({
      isActive: false,
      endedAt: new Date(),
      analysis,
      finalTranscript: analysis.fullTranscript,
    });

    // Store complete meeting transcript
    await db.collection('meeting_transcripts').doc(sessionId).set({
      meetingId: session.meetingId,
      sessionId,
      participants: session.participants,
      startTime: session.startTime,
      endTime: new Date().toISOString(),
      transcripts: session.transcripts.filter(t => t.isFinal),
      analysis,
      fullTranscript: analysis.fullTranscript,
      createdAt: new Date(),
    });

    activeSessions.delete(sessionId);

    return NextResponse.json({
      success: true,
      sessionId,
      analysis,
      fullTranscript: analysis.fullTranscript,
      message: 'Transcription session completed successfully',
    });
  } catch (error) {
    console.error('Error ending transcription session:', error);
    return NextResponse.json(
      { error: 'Failed to end transcription session' },
      { status: 500 }
    );
  }
}

// Get session status and recent transcripts
async function getSessionStatus(sessionId: string) {
  try {
    const session = activeSessions.get(sessionId);
    if (!session) {
      const doc = await db.collection('transcription_sessions').doc(sessionId).get();
      if (!doc.exists) {
        return NextResponse.json(
          { error: 'Session not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json({
        success: true,
        session: doc.data(),
        isActive: false,
      });
    }

    const analysis = analyzeMeetingTranscription(session);
    const recentTranscripts = session.transcripts
      .filter(t => t.isFinal)
      .slice(-20)
      .map(t => ({
        speaker: t.speakerTag ? `Speaker ${t.speakerTag + 1}` : 'Unknown',
        text: t.transcript,
        timestamp: t.timestamp,
        confidence: t.confidence,
      }));

    return NextResponse.json({
      success: true,
      session: {
        sessionId: session.sessionId,
        meetingId: session.meetingId,
        participants: session.participants,
        startTime: session.startTime,
        isActive: session.isActive,
        transcriptCount: session.transcripts.filter(t => t.isFinal).length,
      },
      recentTranscripts,
      analysis,
      isActive: session.isActive,
    });
  } catch (error) {
    console.error('Error getting session status:', error);
    return NextResponse.json(
      { error: 'Failed to get session status' },
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

    const result = await getMeetingTranscripts(meetingId);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Failed to fetch transcripts', details: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      transcripts: result.transcripts,
    });

  } catch (error) {
    console.error('Error fetching transcripts:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}