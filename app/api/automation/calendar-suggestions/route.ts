import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { generateSchedulingSuggestions } from '@/lib/automation/calendar-automation';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.accessToken) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const meetingId = searchParams.get('meetingId');
    
    if (!meetingId) {
      return NextResponse.json(
        { success: false, error: 'Meeting ID is required' },
        { status: 400 }
      );
    }

    // Generate intelligent scheduling suggestions
    const suggestions = await generateSchedulingSuggestions(
      session.accessToken,
      meetingId
    );

    return NextResponse.json({
      success: true,
      suggestions,
      count: suggestions.length,
      highConfidenceCount: suggestions.filter(s => s.confidence > 0.8).length,
      highPriorityCount: suggestions.filter(s => s.priority === 'high').length,
    });

  } catch (error) {
    console.error('Calendar suggestions API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    );
  }
}