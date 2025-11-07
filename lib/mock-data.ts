export interface Meeting {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  duration: string;
  status: 'scheduled' | 'ongoing' | 'completed';
  participants: Participant[];
  host: string;
  meetingLink?: string;
  recordingUrl?: string;
  transcript?: string;
  analytics?: MeetingAnalytics;
  actionItems: ActionItem[];
  sentiment?: SentimentData;
  minutesOfMeeting?: string;
}

export interface Participant {
  id: string;
  name: string;
  email: string;
  role?: string;
  avatar?: string;
  joinTime?: string;
  leaveTime?: string;
  speakingTime?: number;
  engagement?: number;
  sentiment?: number;
}

export interface MeetingAnalytics {
  totalParticipants: number;
  attendanceRate: number;
  averageEngagement: number;
  averageSentiment: number;
  speakingTimeDistribution: Record<string, number>;
  speakingTime: Record<string, number>;
  interactionMatrix: Record<string, Record<string, number>>;
  keywords: Array<{ word: string; frequency: number; sentiment: number }>;
  topicsDiscussed: Array<{ topic: string; timeSpent: number; importance: number }>;
  keyTopics: string[];
  sentimentTimeline: Array<{ timestamp: string; sentiment: number }>;
}

export interface ActionItem {
  id: string;
  task: string;
  description: string;
  assignee: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in-progress' | 'completed';
  dueDate: string;
  createdAt: string;
}

export interface SentimentData {
  overall: number;
  timeline: Array<{
    timestamp: string;
    sentiment: number;
    speaker?: string;
  }>;
  byParticipant: Record<string, number>;
  emotions: Record<string, number>;
}

export const mockMeetings: Meeting[] = [
  {
    id: 'meet-001',
    title: 'Q4 Strategy Planning',
    description: 'Quarterly strategy planning session for product roadmap and team objectives.',
    date: '2025-11-08',
    time: '14:00',
    duration: '90 min',
    status: 'completed',
    host: 'sarah.chen@company.com',
    meetingLink: 'https://meet.google.com/abc-defg-hij',
    recordingUrl: 'https://drive.google.com/recording/123',
    transcript: `Sarah Chen: Good afternoon everyone, thank you for joining our Q4 strategy planning session. Today we'll be discussing our product roadmap, team objectives, and key initiatives for the upcoming quarter.

Mike Rodriguez: Thanks Sarah. I've prepared the analysis on our current market position. Our user engagement has increased by 35% this quarter, and we're seeing strong adoption of the new features we launched in Q3.

Emily Davis: That's great news Mike. From the product perspective, we should focus on the AI integration features that our enterprise clients have been requesting. I've been working with the engineering team on a proposal.

James Wilson: I agree with Emily. The enterprise clients are definitely our growth opportunity. However, we need to ensure our infrastructure can handle the increased load. I suggest we allocate 30% of our Q4 resources to scaling our backend systems.

Sarah Chen: Excellent points from everyone. Let's prioritize the AI integration features while ensuring our infrastructure scaling doesn't get overlooked. Mike, can you coordinate with Emily on the enterprise feature requirements?

Mike Rodriguez: Absolutely. I'll schedule a follow-up meeting with Emily and the product team by Friday.

Emily Davis: Perfect. I'll also prepare a detailed technical specification document that includes the infrastructure requirements James mentioned.

James Wilson: I'll work on the capacity planning analysis and share it with the team by next week.

Sarah Chen: Great work everyone. Let's summarize our action items: Mike will coordinate with Emily on enterprise features, Emily will prepare technical specs, and James will handle capacity planning. Our next review meeting is scheduled for November 15th.`,
    analytics: {
      totalParticipants: 4,
      attendanceRate: 100,
      averageEngagement: 87,
      averageSentiment: 0.82,
      speakingTimeDistribution: {
        'Sarah Chen': 25,
        'Mike Rodriguez': 28,
        'Emily Davis': 26,
        'James Wilson': 21
      },
      speakingTime: {
        'Sarah Chen': 25,
        'Mike Rodriguez': 28,
        'Emily Davis': 26,
        'James Wilson': 21
      },
      keyTopics: ['Product Strategy', 'AI Integration', 'Infrastructure Scaling', 'Enterprise Features'],
      sentimentTimeline: [
        { timestamp: '15:00', sentiment: 0.7 },
        { timestamp: '15:15', sentiment: 0.8 },
        { timestamp: '15:30', sentiment: 0.9 },
        { timestamp: '15:45', sentiment: 0.85 }
      ],
      interactionMatrix: {
        'Sarah Chen': { 'Mike Rodriguez': 5, 'Emily Davis': 4, 'James Wilson': 3 },
        'Mike Rodriguez': { 'Sarah Chen': 5, 'Emily Davis': 6, 'James Wilson': 2 },
        'Emily Davis': { 'Sarah Chen': 4, 'Mike Rodriguez': 6, 'James Wilson': 4 },
        'James Wilson': { 'Sarah Chen': 3, 'Mike Rodriguez': 2, 'Emily Davis': 4 }
      },
      keywords: [
        { word: 'strategy', frequency: 12, sentiment: 0.8 },
        { word: 'enterprise', frequency: 8, sentiment: 0.9 },
        { word: 'AI integration', frequency: 6, sentiment: 0.85 },
        { word: 'infrastructure', frequency: 7, sentiment: 0.6 },
        { word: 'growth', frequency: 5, sentiment: 0.9 }
      ],
      topicsDiscussed: [
        { topic: 'Product Roadmap', timeSpent: 35, importance: 0.95 },
        { topic: 'Enterprise Features', timeSpent: 25, importance: 0.9 },
        { topic: 'Infrastructure Scaling', timeSpent: 20, importance: 0.8 },
        { topic: 'Team Coordination', timeSpent: 10, importance: 0.7 }
      ]
    },
    participants: [
      {
        id: 'p1',
        name: 'Sarah Chen',
        email: 'sarah.chen@company.com',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b23c?w=150',
        joinTime: '14:00',
        leaveTime: '15:30',
        speakingTime: 22,
        engagement: 95,
        sentiment: 0.82
      },
      {
        id: 'p2',
        name: 'Mike Rodriguez',
        email: 'mike.rodriguez@company.com',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
        joinTime: '14:02',
        leaveTime: '15:30',
        speakingTime: 25,
        engagement: 88,
        sentiment: 0.75
      },
      {
        id: 'p3',
        name: 'Emily Davis',
        email: 'emily.davis@company.com',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
        joinTime: '14:00',
        leaveTime: '15:28',
        speakingTime: 23,
        engagement: 92,
        sentiment: 0.88
      },
      {
        id: 'p4',
        name: 'James Wilson',
        email: 'james.wilson@company.com',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
        joinTime: '14:05',
        leaveTime: '15:30',
        speakingTime: 19,
        engagement: 78,
        sentiment: 0.65
      }
    ],
    actionItems: [
      {
        id: 'ai-001',
        task: 'Coordinate enterprise feature requirements',
        description: 'Work with Emily to define specific requirements for AI integration features requested by enterprise clients',
        assignee: 'Mike Rodriguez',
        priority: 'high',
        status: 'pending',
        dueDate: '2025-11-15',
        createdAt: '2025-11-08'
      },
      {
        id: 'ai-002',
        task: 'Prepare technical specification document',
        description: 'Create detailed technical specs including infrastructure requirements for new features',
        assignee: 'Emily Davis',
        priority: 'high',
        status: 'pending',
        dueDate: '2025-11-12',
        createdAt: '2025-11-08'
      },
      {
        id: 'ai-003',
        task: 'Complete capacity planning analysis',
        description: 'Analyze current infrastructure capacity and plan for scaling requirements',
        assignee: 'James Wilson',
        priority: 'medium',
        status: 'pending',
        dueDate: '2025-11-14',
        createdAt: '2025-11-08'
      }
    ],
    sentiment: {
      overall: 0.78,
      timeline: [
        { timestamp: '14:00', sentiment: 0.75, speaker: 'Sarah Chen' },
        { timestamp: '14:15', sentiment: 0.85, speaker: 'Mike Rodriguez' },
        { timestamp: '14:30', sentiment: 0.82, speaker: 'Emily Davis' },
        { timestamp: '14:45', sentiment: 0.68, speaker: 'James Wilson' },
        { timestamp: '15:00', sentiment: 0.79, speaker: 'Sarah Chen' },
        { timestamp: '15:15', sentiment: 0.76, speaker: 'Mike Rodriguez' },
        { timestamp: '15:30', sentiment: 0.81, speaker: 'Emily Davis' }
      ],
      byParticipant: {
        'Sarah Chen': 0.82,
        'Mike Rodriguez': 0.75,
        'Emily Davis': 0.88,
        'James Wilson': 0.65
      },
      emotions: {
        'positive': 0.65,
        'neutral': 0.28,
        'negative': 0.07
      }
    },
    minutesOfMeeting: `# Meeting Minutes: Q4 Strategy Planning

**Date:** November 8, 2025  
**Time:** 2:00 PM - 3:30 PM  
**Duration:** 90 minutes  
**Host:** Sarah Chen  

## Attendees
- Sarah Chen (Host)
- Mike Rodriguez  
- Emily Davis  
- James Wilson  

## Meeting Objective
Quarterly strategy planning session for product roadmap and team objectives.

## Key Discussions

### Market Performance Update
Mike Rodriguez reported a **35% increase in user engagement** this quarter with strong adoption of Q3 feature releases.

### Product Strategy Focus
Emily Davis proposed prioritizing **AI integration features** for enterprise clients, with engineering team collaboration on implementation proposals.

### Infrastructure Considerations
James Wilson emphasized the need for **backend scaling** to handle increased load, suggesting **30% of Q4 resources** allocated to infrastructure improvements.

## Decisions Made
1. Prioritize AI integration features for enterprise clients
2. Ensure infrastructure scaling runs parallel to feature development
3. Allocate resources appropriately between features and infrastructure

## Action Items
| Task | Assignee | Due Date | Priority |
|------|----------|----------|----------|
| Coordinate enterprise feature requirements with Emily | Mike Rodriguez | Nov 15, 2025 | High |
| Prepare technical specification document | Emily Davis | Nov 12, 2025 | High |
| Complete capacity planning analysis | James Wilson | Nov 14, 2025 | Medium |

## Next Steps
- Next review meeting scheduled for **November 15th, 2025**
- Teams to coordinate on enterprise feature development
- Infrastructure scaling to proceed in parallel

## Key Metrics
- **Engagement Level:** 87% average
- **Sentiment Score:** 78% positive
- **Action Items Generated:** 3
- **Follow-up Required:** Yes

*Minutes generated by TEAi on November 8, 2025*`
  },
  {
    id: 'meet-002',
    title: 'Team Daily Standup',
    description: 'Daily standup to discuss progress, blockers, and plan for the day.',
    date: '2025-11-07',
    time: '09:00',
    duration: '15 min',
    status: 'completed',
    host: 'team.lead@company.com',
    meetingLink: 'https://meet.google.com/xyz-abcd-efg',
    transcript: `Team Lead: Good morning everyone! Let's do our quick standup. Sarah, would you like to start?

Sarah: Good morning! Yesterday I completed the user authentication flow and started working on the dashboard components. Today I'll be focusing on the analytics integration. No blockers for me.

Mike: Thanks Sarah. I finished the API documentation and resolved the database performance issues we discussed yesterday. Today I'm working on the new endpoint for user preferences. I have a question about the data schema for Emily later.

Emily: Perfect timing Mike! I completed the schema updates yesterday and they're ready for review. Today I'm working on the caching layer implementation. No blockers currently.

Team Lead: Great progress everyone. Mike, make sure to sync with Emily on the schema before implementing the preferences endpoint. Any other questions or concerns?

Sarah: Just a quick note - the analytics API will be ready for integration testing by end of day.

Team Lead: Excellent. Let's keep up the momentum. Same time tomorrow!`,
    analytics: {
      totalParticipants: 4,
      attendanceRate: 100,
      averageEngagement: 82,
      averageSentiment: 0.88,
      speakingTimeDistribution: {
        'Team Lead': 30,
        'Sarah': 25,
        'Mike': 25,
        'Emily': 20
      },
      speakingTime: {
        'Team Lead': 30,
        'Sarah': 25,
        'Mike': 25,
        'Emily': 20
      },
      keyTopics: ['Daily Updates', 'Progress Sharing', 'Coordination', 'Team Sync'],
      sentimentTimeline: [
        { timestamp: '09:00', sentiment: 0.85 },
        { timestamp: '09:05', sentiment: 0.90 },
        { timestamp: '09:10', sentiment: 0.88 },
        { timestamp: '09:15', sentiment: 0.90 }
      ],
      interactionMatrix: {
        'Team Lead': { 'Sarah': 2, 'Mike': 2, 'Emily': 1 },
        'Sarah': { 'Team Lead': 2, 'Mike': 1, 'Emily': 1 },
        'Mike': { 'Team Lead': 2, 'Sarah': 1, 'Emily': 2 },
        'Emily': { 'Team Lead': 1, 'Sarah': 1, 'Mike': 2 }
      },
      keywords: [
        { word: 'completed', frequency: 4, sentiment: 0.9 },
        { word: 'working', frequency: 5, sentiment: 0.7 },
        { word: 'progress', frequency: 3, sentiment: 0.85 },
        { word: 'integration', frequency: 3, sentiment: 0.8 }
      ],
      topicsDiscussed: [
        { topic: 'Daily Updates', timeSpent: 60, importance: 0.9 },
        { topic: 'Progress Sharing', timeSpent: 25, importance: 0.8 },
        { topic: 'Coordination', timeSpent: 15, importance: 0.7 }
      ]
    },
    participants: [
      {
        id: 'p5',
        name: 'Team Lead',
        email: 'team.lead@company.com',
        joinTime: '09:00',
        leaveTime: '09:15',
        speakingTime: 4.5,
        engagement: 85,
        sentiment: 0.8
      },
      {
        id: 'p1',
        name: 'Sarah Chen',
        email: 'sarah.chen@company.com',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b23c?w=150',
        joinTime: '09:00',
        leaveTime: '09:15',
        speakingTime: 3.8,
        engagement: 88,
        sentiment: 0.85
      },
      {
        id: 'p2',
        name: 'Mike Rodriguez',
        email: 'mike.rodriguez@company.com',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
        joinTime: '09:01',
        leaveTime: '09:15',
        speakingTime: 3.7,
        engagement: 82,
        sentiment: 0.75
      },
      {
        id: 'p3',
        name: 'Emily Davis',
        email: 'emily.davis@company.com',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
        joinTime: '09:00',
        leaveTime: '09:14',
        speakingTime: 3.0,
        engagement: 78,
        sentiment: 0.82
      }
    ],
    actionItems: [
      {
        id: 'ai-004',
        task: 'Sync with Emily on data schema',
        description: 'Review schema updates before implementing user preferences endpoint',
        assignee: 'Mike Rodriguez',
        priority: 'medium',
        status: 'completed',
        dueDate: '2025-11-07',
        createdAt: '2025-11-07'
      },
      {
        id: 'ai-005',
        task: 'Complete analytics API integration testing',
        description: 'Finish analytics API integration and prepare for testing phase',
        assignee: 'Sarah Chen',
        priority: 'medium',
        status: 'completed',
        dueDate: '2025-11-07',
        createdAt: '2025-11-07'
      }
    ],
    sentiment: {
      overall: 0.81,
      timeline: [
        { timestamp: '09:00', sentiment: 0.8, speaker: 'Team Lead' },
        { timestamp: '09:03', sentiment: 0.85, speaker: 'Sarah Chen' },
        { timestamp: '09:06', sentiment: 0.75, speaker: 'Mike Rodriguez' },
        { timestamp: '09:09', sentiment: 0.82, speaker: 'Emily Davis' },
        { timestamp: '09:12', sentiment: 0.85, speaker: 'Sarah Chen' },
        { timestamp: '09:15', sentiment: 0.8, speaker: 'Team Lead' }
      ],
      byParticipant: {
        'Team Lead': 0.8,
        'Sarah Chen': 0.85,
        'Mike Rodriguez': 0.75,
        'Emily Davis': 0.82
      },
      emotions: {
        'positive': 0.72,
        'neutral': 0.26,
        'negative': 0.02
      }
    },
    minutesOfMeeting: `# Meeting Minutes: Team Daily Standup

**Date:** November 7, 2025  
**Time:** 9:00 AM - 9:15 AM  
**Duration:** 15 minutes  
**Host:** Team Lead  

## Attendees
- Team Lead (Host)
- Sarah Chen  
- Mike Rodriguez  
- Emily Davis  

## Meeting Objective
Daily standup to discuss progress, blockers, and plan for the day.

## Progress Updates

### Sarah Chen
- **Completed:** User authentication flow
- **In Progress:** Dashboard components, analytics integration
- **Blockers:** None

### Mike Rodriguez
- **Completed:** API documentation, database performance issues resolved
- **In Progress:** New endpoint for user preferences
- **Needs:** Schema review with Emily

### Emily Davis
- **Completed:** Schema updates (ready for review)
- **In Progress:** Caching layer implementation
- **Blockers:** None

## Action Items
| Task | Assignee | Due Date | Status |
|------|----------|----------|--------|
| Schema review before preferences endpoint | Mike Rodriguez | Nov 7, 2025 | Completed |
| Analytics API integration testing | Sarah Chen | Nov 7, 2025 | Completed |

## Key Outcomes
- All team members on track with their tasks
- Good coordination between Mike and Emily on schema work
- Analytics integration progressing well

## Next Meeting
Tomorrow at 9:00 AM

*Minutes generated by TEAi on November 7, 2025*`
  },
  {
    id: 'meet-003',
    title: 'Client Presentation Demo',
    description: 'Product demonstration for potential enterprise client - ABC Corporation.',
    date: '2025-11-06',
    time: '15:30',
    duration: '45 min',
    status: 'completed',
    host: 'sales.manager@company.com',
    meetingLink: 'https://meet.google.com/client-demo-123',
    recordingUrl: 'https://drive.google.com/recording/456',
    transcript: `Sales Manager: Good afternoon everyone, thank you for joining us today. I'm excited to demonstrate our latest TEAi platform capabilities for ABC Corporation. With me today are our Product Manager Emily and Technical Lead James.

Client Contact: Thank you for accommodating our schedule. We're very interested in understanding how TEAi can help streamline our meeting processes and improve productivity across our organization.

Emily Davis: Absolutely! Let me start by showing you our real-time transcription capabilities. As you can see, TEAi is currently transcribing our conversation with 95% accuracy, capturing not just what we say, but also the context and sentiment.

James Wilson: From a technical perspective, our platform integrates seamlessly with your existing Google Workspace or Microsoft 365 environment. The setup takes less than 5 minutes, and your team can start benefiting immediately.

Client Contact: That's impressive. What about data privacy and security? We handle sensitive information in our meetings.

Sales Manager: Excellent question. We're SOC 2 compliant and all data is encrypted both in transit and at rest. You maintain complete control over your data, and we can deploy on-premises if required.

Emily Davis: Let me show you our analytics dashboard. Here you can see meeting efficiency metrics, participant engagement levels, and automatically generated action items. This particular view shows a 40% improvement in meeting productivity for our current enterprise clients.

Client Contact: The sentiment analysis feature is particularly interesting. How accurate is it?

James Wilson: Our sentiment analysis achieves 87% accuracy across different languages and cultural contexts. It helps managers understand team dynamics and identify potential issues before they escalate.

Sales Manager: Based on ABC Corporation's size and meeting volume, we estimate you could save approximately 12 hours per week per manager, translating to significant cost savings and improved productivity.

Client Contact: This looks very promising. What would be the next steps for a pilot program?

Sales Manager: I'd recommend starting with a 30-day pilot with your leadership team. We can have you set up by next week, and I'll personally ensure smooth onboarding.

Emily Davis: We'll also provide dedicated support during the pilot phase and customize the dashboard to match your specific KPIs and reporting requirements.

Client Contact: Perfect. Let's proceed with the pilot. I'll need to coordinate with our IT team, but this definitely addresses our pain points.

James Wilson: I'll send over the technical requirements and integration guide today. Our IT team can also schedule a call with yours to ensure smooth implementation.

Sales Manager: Wonderful! I'll follow up with the pilot agreement and timeline. Thank you for your time today, and we're excited to partner with ABC Corporation.`,
    analytics: {
      totalParticipants: 4,
      attendanceRate: 100,
      averageEngagement: 91,
      averageSentiment: 0.91,
      speakingTimeDistribution: {
        'Sales Manager': 28,
        'Emily Davis': 26,
        'James Wilson': 24,
        'Client Contact': 22
      },
      speakingTime: {
        'Sales Manager': 28,
        'Emily Davis': 26,
        'James Wilson': 24,
        'Client Contact': 22
      },
      keyTopics: ['Platform Demo', 'Security & Privacy', 'Integration Capabilities', 'Pilot Program'],
      sentimentTimeline: [
        { timestamp: '14:00', sentiment: 0.85 },
        { timestamp: '14:15', sentiment: 0.90 },
        { timestamp: '14:30', sentiment: 0.95 },
        { timestamp: '14:45', sentiment: 0.93 }
      ],
      interactionMatrix: {
        'Sales Manager': { 'Client Contact': 8, 'Emily Davis': 3, 'James Wilson': 2 },
        'Emily Davis': { 'Client Contact': 6, 'Sales Manager': 3, 'James Wilson': 1 },
        'James Wilson': { 'Client Contact': 5, 'Sales Manager': 2, 'Emily Davis': 1 },
        'Client Contact': { 'Sales Manager': 8, 'Emily Davis': 6, 'James Wilson': 5 }
      },
      keywords: [
        { word: 'platform', frequency: 8, sentiment: 0.9 },
        { word: 'productivity', frequency: 6, sentiment: 0.95 },
        { word: 'integration', frequency: 7, sentiment: 0.85 },
        { word: 'security', frequency: 4, sentiment: 0.8 },
        { word: 'pilot', frequency: 5, sentiment: 0.92 }
      ],
      topicsDiscussed: [
        { topic: 'Platform Demo', timeSpent: 40, importance: 0.95 },
        { topic: 'Security & Privacy', timeSpent: 20, importance: 0.9 },
        { topic: 'Integration Process', timeSpent: 25, importance: 0.85 },
        { topic: 'Pilot Program', timeSpent: 15, importance: 0.88 }
      ]
    },
    participants: [
      {
        id: 'p6',
        name: 'Sales Manager',
        email: 'sales.manager@company.com',
        joinTime: '15:30',
        leaveTime: '16:15',
        speakingTime: 12.6,
        engagement: 95,
        sentiment: 0.92
      },
      {
        id: 'p3',
        name: 'Emily Davis',
        email: 'emily.davis@company.com',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
        joinTime: '15:30',
        leaveTime: '16:15',
        speakingTime: 11.7,
        engagement: 93,
        sentiment: 0.88
      },
      {
        id: 'p4',
        name: 'James Wilson',
        email: 'james.wilson@company.com',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
        joinTime: '15:30',
        leaveTime: '16:15',
        speakingTime: 10.8,
        engagement: 89,
        sentiment: 0.85
      },
      {
        id: 'p7',
        name: 'Client Contact',
        email: 'contact@abccorp.com',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        joinTime: '15:32',
        leaveTime: '16:15',
        speakingTime: 9.9,
        engagement: 87,
        sentiment: 0.82
      }
    ],
    actionItems: [
      {
        id: 'ai-006',
        task: 'Send technical requirements and integration guide',
        description: 'Provide ABC Corporation with detailed technical documentation for pilot setup',
        assignee: 'James Wilson',
        priority: 'high',
        status: 'completed',
        dueDate: '2025-11-06',
        createdAt: '2025-11-06'
      },
      {
        id: 'ai-007',
        task: 'Schedule IT team coordination call',
        description: 'Arrange technical discussion between our IT team and ABC Corporation\'s IT team',
        assignee: 'James Wilson',
        priority: 'high',
        status: 'completed',
        dueDate: '2025-11-08',
        createdAt: '2025-11-06'
      },
      {
        id: 'ai-008',
        task: 'Prepare pilot agreement and timeline',
        description: 'Draft 30-day pilot program agreement with timeline and deliverables',
        assignee: 'Sales Manager',
        priority: 'high',
        status: 'in-progress',
        dueDate: '2025-11-09',
        createdAt: '2025-11-06'
      },
      {
        id: 'ai-009',
        task: 'Customize dashboard for ABC Corporation KPIs',
        description: 'Configure analytics dashboard to match client\'s specific reporting requirements',
        assignee: 'Emily Davis',
        priority: 'medium',
        status: 'pending',
        dueDate: '2025-11-13',
        createdAt: '2025-11-06'
      }
    ],
    sentiment: {
      overall: 0.87,
      timeline: [
        { timestamp: '15:30', sentiment: 0.85, speaker: 'Sales Manager' },
        { timestamp: '15:35', sentiment: 0.8, speaker: 'Client Contact' },
        { timestamp: '15:40', sentiment: 0.9, speaker: 'Emily Davis' },
        { timestamp: '15:45', sentiment: 0.88, speaker: 'James Wilson' },
        { timestamp: '15:50', sentiment: 0.82, speaker: 'Client Contact' },
        { timestamp: '15:55', sentiment: 0.92, speaker: 'Sales Manager' },
        { timestamp: '16:00', sentiment: 0.89, speaker: 'Emily Davis' },
        { timestamp: '16:05', sentiment: 0.85, speaker: 'Client Contact' },
        { timestamp: '16:10', sentiment: 0.9, speaker: 'James Wilson' },
        { timestamp: '16:15', sentiment: 0.95, speaker: 'Sales Manager' }
      ],
      byParticipant: {
        'Sales Manager': 0.92,
        'Emily Davis': 0.88,
        'James Wilson': 0.85,
        'Client Contact': 0.82
      },
      emotions: {
        'positive': 0.78,
        'neutral': 0.19,
        'negative': 0.03
      }
    },
    minutesOfMeeting: `# Meeting Minutes: Client Presentation Demo - ABC Corporation

**Date:** November 6, 2025  
**Time:** 3:30 PM - 4:15 PM  
**Duration:** 45 minutes  
**Host:** Sales Manager  

## Attendees

### Company Team
- Sales Manager (Host)
- Emily Davis (Product Manager)
- James Wilson (Technical Lead)

### Client Team
- Client Contact (ABC Corporation)

## Meeting Objective
Product demonstration of TEAi platform capabilities for ABC Corporation's enterprise needs.

## Demo Highlights

### Core Features Presented
1. **Real-time Transcription** - 95% accuracy with context and sentiment capture
2. **Analytics Dashboard** - Meeting efficiency metrics and participant engagement
3. **Sentiment Analysis** - 87% accuracy across languages and cultural contexts
4. **Integration Capabilities** - Seamless Google Workspace/Microsoft 365 integration

### Key Benefits Discussed
- **Productivity Improvement:** 40% increase for current enterprise clients
- **Time Savings:** Estimated 12 hours per week per manager for ABC Corporation
- **Quick Setup:** Less than 5 minutes integration time
- **Security Compliance:** SOC 2 compliant with encryption and on-premises options

## Client Questions & Responses

### Data Privacy & Security
**Client Concern:** Handling sensitive information  
**Response:** SOC 2 compliance, end-to-end encryption, complete data control, on-premises deployment available

### Sentiment Analysis Accuracy
**Client Question:** Accuracy across different contexts  
**Response:** 87% accuracy across languages and cultural contexts with team dynamics insights

## Decision & Next Steps

### Pilot Program Agreement
- **Duration:** 30-day pilot with leadership team
- **Setup Timeline:** Next week
- **Support:** Dedicated support with personalized onboarding
- **Customization:** Dashboard tailored to ABC Corporation's KPIs

## Action Items
| Task | Assignee | Due Date | Priority | Status |
|------|----------|----------|----------|--------|
| Send technical requirements and integration guide | James Wilson | Nov 6, 2025 | High | Completed |
| Schedule IT team coordination call | James Wilson | Nov 8, 2025 | High | Completed |
| Prepare pilot agreement and timeline | Sales Manager | Nov 9, 2025 | High | In Progress |
| Customize dashboard for ABC Corporation KPIs | Emily Davis | Nov 13, 2025 | Medium | Pending |

## Outcome
✅ **Client approved pilot program**  
✅ **Technical requirements to be shared**  
✅ **Implementation timeline established**  

## Key Metrics
- **Engagement Level:** 91% average
- **Sentiment Score:** 87% positive
- **Action Items Generated:** 4
- **Conversion Status:** Pilot approved

*Minutes generated by TEAi on November 6, 2025*`
  }
];

export const getRecentMeetings = (): Meeting[] => {
  return mockMeetings.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const getMeetingById = (id: string): Meeting | undefined => {
  return mockMeetings.find(meeting => meeting.id === id);
};

export const getUpcomingMeetings = (): Meeting[] => {
  const today = new Date();
  return mockMeetings.filter(meeting => {
    const meetingDate = new Date(meeting.date);
    return meetingDate >= today && meeting.status === 'scheduled';
  });
};

export const getCompletedMeetings = (): Meeting[] => {
  return mockMeetings.filter(meeting => meeting.status === 'completed');
};

export const getOngoingMeetings = (): Meeting[] => {
  return mockMeetings.filter(meeting => meeting.status === 'ongoing');
};

export const getAllMeetings = (): Meeting[] => {
  return mockMeetings;
};