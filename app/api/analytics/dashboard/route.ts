import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';

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
    const timeRange = searchParams.get('timeRange') || '30d';

    // Generate mock analytics data based on time range
    // In a real implementation, this would query your database
    const analytics = {
      overview: {
        totalMeetings: timeRange === '7d' ? 48 : timeRange === '30d' ? 248 : timeRange === '90d' ? 756 : 2847,
        totalParticipants: timeRange === '7d' ? 24 : timeRange === '30d' ? 142 : timeRange === '90d' ? 387 : 1248,
        avgMeetingDuration: timeRange === '7d' ? 42 : timeRange === '30d' ? 38 : timeRange === '90d' ? 35 : 40,
        actionItemsGenerated: timeRange === '7d' ? 324 : timeRange === '30d' ? 1847 : timeRange === '90d' ? 5621 : 18743,
        completionRate: timeRange === '7d' ? 89 : timeRange === '30d' ? 87 : timeRange === '90d' ? 85 : 83,
        productivityScore: timeRange === '7d' ? 92 : timeRange === '30d' ? 89 : timeRange === '90d' ? 87 : 85,
      },
      trends: {
        meetingsOverTime: generateTrendData(timeRange, 'meetings'),
        sentimentTrends: generateSentimentData(timeRange),
        actionItemTrends: generateActionItemData(timeRange),
        participationTrends: generateParticipationData(timeRange),
      },
      meetingEffectiveness: {
        avgEngagementScore: 84,
        timeUtilization: 76,
        actionItemDensity: 92,
        followUpRate: 78,
        decisionVelocity: 82,
      },
      participantInsights: {
        topContributors: [
          { name: 'Sarah Chen', contributions: 156, meetings: 48, engagement: 94 },
          { name: 'Mike Johnson', contributions: 142, meetings: 52, engagement: 87 },
          { name: 'Alex Rodriguez', contributions: 128, meetings: 41, engagement: 91 },
          { name: 'Emily Davis', contributions: 119, meetings: 39, engagement: 89 },
          { name: 'David Wilson', contributions: 103, meetings: 44, engagement: 82 },
          { name: 'Lisa Thompson', contributions: 95, meetings: 36, engagement: 88 },
          { name: 'James Brown', contributions: 87, meetings: 31, engagement: 85 },
        ],
        meetingFrequency: [
          { name: 'Sarah Chen', count: 48, avgDuration: 42 },
          { name: 'Mike Johnson', count: 52, avgDuration: 38 },
          { name: 'Alex Rodriguez', count: 41, avgDuration: 45 },
          { name: 'Emily Davis', count: 39, avgDuration: 35 },
          { name: 'David Wilson', count: 44, avgDuration: 40 },
        ],
        actionItemOwnership: [
          { name: 'Sarah Chen', assigned: 47, completed: 43, completionRate: 91 },
          { name: 'Mike Johnson', assigned: 52, completed: 48, completionRate: 92 },
          { name: 'Alex Rodriguez', assigned: 38, completed: 31, completionRate: 82 },
          { name: 'Emily Davis', assigned: 41, completed: 37, completionRate: 90 },
          { name: 'David Wilson', assigned: 35, completed: 28, completionRate: 80 },
          { name: 'Lisa Thompson', assigned: 29, completed: 26, completionRate: 90 },
          { name: 'James Brown', assigned: 33, completed: 25, completionRate: 76 },
        ],
      },
      automationROI: {
        timesSaved: timeRange === '7d' ? 2.8 : timeRange === '30d' ? 12.5 : timeRange === '90d' ? 38.7 : 156.2,
        manualTasksAutomated: timeRange === '7d' ? 67 : timeRange === '30d' ? 342 : timeRange === '90d' ? 987 : 3842,
        emailsAutomated: timeRange === '7d' ? 28 : timeRange === '30d' ? 156 : timeRange === '90d' ? 478 : 1847,
        schedulingEfficiency: 85,
        costSavings: timeRange === '7d' ? 1200 : timeRange === '30d' ? 5400 : timeRange === '90d' ? 16800 : 67200,
      },
    };

    return NextResponse.json({
      success: true,
      analytics,
      generatedAt: new Date().toISOString(),
      timeRange,
    });

  } catch (error) {
    console.error('Analytics dashboard API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    );
  }
}

// Helper functions to generate trend data
function generateTrendData(timeRange: string, type: string) {
  const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365;
  const data = [];
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    data.push({
      date: date.toISOString().split('T')[0],
      count: Math.floor(Math.random() * 15) + 3,
      duration: Math.floor(Math.random() * 30) + 25,
    });
  }
  
  return data;
}

function generateSentimentData(timeRange: string) {
  const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365;
  const data = [];
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    const positive = Math.floor(Math.random() * 30) + 60;
    const negative = Math.floor(Math.random() * 15) + 5;
    const neutral = 100 - positive - negative;
    
    data.push({
      date: date.toISOString().split('T')[0],
      positive,
      neutral,
      negative,
    });
  }
  
  return data;
}

function generateActionItemData(timeRange: string) {
  const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365;
  const data = [];
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    const created = Math.floor(Math.random() * 25) + 10;
    const completed = Math.floor(created * (0.7 + Math.random() * 0.25));
    
    data.push({
      date: date.toISOString().split('T')[0],
      created,
      completed,
    });
  }
  
  return data;
}

function generateParticipationData(timeRange: string) {
  const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365;
  const data = [];
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    data.push({
      date: date.toISOString().split('T')[0],
      participants: Math.floor(Math.random() * 8) + 3,
      engagement: Math.floor(Math.random() * 25) + 70,
    });
  }
  
  return data;
}