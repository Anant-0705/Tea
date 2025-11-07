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

    // Mock automation statistics for now
    // In a real implementation, these would come from your database
    const stats = {
      totalMeetings: 248,
      actionItemsExtracted: 1847,
      emailsSent: 156,
      meetingsScheduled: 89,
      completionRate: 87,
      averageResponseTime: 2.4, // hours
    };

    const recentActivity = [
      {
        id: '1',
        type: 'scheduling',
        title: 'Smart scheduling suggestion created',
        description: 'High-priority follow-up meeting suggested for Project Alpha',
        timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 minutes ago
        status: 'success',
      },
      {
        id: '2',
        type: 'email',
        title: 'Meeting summary sent',
        description: 'Automated summary sent to 5 participants',
        timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(), // 45 minutes ago
        status: 'success',
      },
      {
        id: '3',
        type: 'extraction',
        title: 'Action items extracted',
        description: '8 action items identified from Weekly Standup',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        status: 'success',
      },
      {
        id: '4',
        type: 'completion',
        title: 'Task marked complete',
        description: 'Review quarterly budget - completed by John Doe',
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
        status: 'success',
      },
      {
        id: '5',
        type: 'scheduling',
        title: 'Auto-scheduled meeting',
        description: 'Decision review meeting automatically scheduled',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
        status: 'success',
      },
      {
        id: '6',
        type: 'email',
        title: 'Reminder sent',
        description: 'Action item deadline reminder sent to team',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
        status: 'pending',
      },
    ];

    return NextResponse.json({
      success: true,
      stats,
      recentActivity,
      trends: {
        meetingsGrowth: 12,
        actionItemsGrowth: 25,
        emailsGrowth: 8,
        completionRateChange: -3,
      },
      performance: {
        aiAccuracy: 94.2,
        automationSavings: '12.5 hours/week',
        userSatisfaction: 4.6,
        systemUptime: 99.8,
      },
    });

  } catch (error) {
    console.error('Automation stats API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    );
  }
}