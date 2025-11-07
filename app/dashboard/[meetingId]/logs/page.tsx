'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Users,
  TrendingUp,
  TrendingDown,
  Brain,
  MessageSquare,
  BarChart3,
  PieChart,
  Activity,
  CheckCircle,
  AlertTriangle,
  Info,
  Download,
  Share,
  Filter,
  Search,
  Eye,
  Play,
  Pause
} from 'lucide-react';
import Link from 'next/link';
import Navbar from '../../../components/Navbar';
import Chart from '../../../components/charts/Chart';

interface MeetingLogs {
  meetingId: string;
  title: string;
  date: string;
  time: string;
  duration: string;
  participants: Array<{
    id: string;
    name: string;
    email: string;
    joinTime: string;
    leaveTime: string;
    speakingTime: number;
    engagement: number;
    sentiment: number;
  }>;
  transcript: Array<{
    id: string;
    speaker: string;
    timestamp: string;
    text: string;
    sentiment: number;
    keywords: string[];
    actionItems: string[];
  }>;
  analytics: {
    totalWords: number;
    averageSpeakingTime: number;
    sentimentOverall: number;
    sentimentTimeline: Array<{
      timestamp: string;
      sentiment: number;
      speaker: string;
    }>;
    keyTopics: Array<{
      topic: string;
      frequency: number;
      sentiment: number;
    }>;
    actionItems: Array<{
      id: string;
      text: string;
      priority: 'high' | 'medium' | 'low';
      assignee?: string;
      status: 'pending' | 'in-progress' | 'completed';
      extractedFrom: string;
      confidence: number;
    }>;
    insights: Array<{
      type: 'positive' | 'neutral' | 'negative' | 'info';
      title: string;
      description: string;
      impact: 'high' | 'medium' | 'low';
    }>;
  };
  engagement: {
    overall: number;
    byParticipant: Record<string, number>;
    timeline: Array<{
      timestamp: string;
      level: number;
    }>;
  };
}

export default function MeetingLogsPage() {
  const params = useParams();
  const router = useRouter();
  const meetingId = params.meetingId as string;
  const [meetingLogs, setMeetingLogs] = useState<MeetingLogs | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpeaker, setSelectedSpeaker] = useState('all');

  // Mock data - in real app, fetch from API
  useEffect(() => {
    const mockLogs: MeetingLogs = {
      meetingId,
      title: meetingId === 'meeting1' ? 'Team Standup' : 'Client Review Meeting',
      date: '2025-11-07',
      time: '09:00 AM',
      duration: '45 minutes',
      participants: [
        {
          id: '1',
          name: 'John Doe',
          email: 'john@company.com',
          joinTime: '09:00 AM',
          leaveTime: '09:45 AM',
          speakingTime: 18,
          engagement: 85,
          sentiment: 90
        },
        {
          id: '2',
          name: 'Jane Smith',
          email: 'jane@company.com',
          joinTime: '09:02 AM',
          leaveTime: '09:45 AM',
          speakingTime: 15,
          engagement: 78,
          sentiment: 82
        },
        {
          id: '3',
          name: 'Mike Johnson',
          email: 'mike@company.com',
          joinTime: '09:00 AM',
          leaveTime: '09:43 AM',
          speakingTime: 12,
          engagement: 92,
          sentiment: 78
        }
      ],
      transcript: [
        {
          id: '1',
          speaker: 'John Doe',
          timestamp: '09:00:15',
          text: 'Good morning everyone! Let\'s start our standup. I\'ll go first - yesterday I completed the user authentication module and today I\'m working on the dashboard integration.',
          sentiment: 85,
          keywords: ['authentication', 'dashboard', 'integration'],
          actionItems: ['Complete dashboard integration']
        },
        {
          id: '2',
          speaker: 'Jane Smith',
          timestamp: '09:02:30',
          text: 'Great work John! I finished the API documentation and I\'m now focusing on the client presentation. We should schedule a review session before Friday.',
          sentiment: 88,
          keywords: ['API', 'documentation', 'presentation', 'review'],
          actionItems: ['Schedule review session before Friday']
        },
        {
          id: '3',
          speaker: 'Mike Johnson',
          timestamp: '09:05:12',
          text: 'I\'ve been working on the performance optimizations. There are some concerns about the loading times that we need to address urgently.',
          sentiment: 65,
          keywords: ['performance', 'optimization', 'loading times'],
          actionItems: ['Address loading time concerns urgently']
        }
      ],
      analytics: {
        totalWords: 2847,
        averageSpeakingTime: 15,
        sentimentOverall: 82,
        sentimentTimeline: [
          { timestamp: '09:00', sentiment: 85, speaker: 'John Doe' },
          { timestamp: '09:05', sentiment: 88, speaker: 'Jane Smith' },
          { timestamp: '09:10', sentiment: 65, speaker: 'Mike Johnson' },
          { timestamp: '09:15', sentiment: 78, speaker: 'John Doe' },
          { timestamp: '09:20', sentiment: 92, speaker: 'Jane Smith' },
          { timestamp: '09:25', sentiment: 75, speaker: 'Mike Johnson' },
          { timestamp: '09:30', sentiment: 88, speaker: 'John Doe' },
          { timestamp: '09:35', sentiment: 85, speaker: 'Jane Smith' },
          { timestamp: '09:40', sentiment: 80, speaker: 'Mike Johnson' }
        ],
        keyTopics: [
          { topic: 'Authentication', frequency: 12, sentiment: 85 },
          { topic: 'Performance', frequency: 8, sentiment: 65 },
          { topic: 'Documentation', frequency: 6, sentiment: 90 },
          { topic: 'Client Presentation', frequency: 4, sentiment: 88 },
          { topic: 'Dashboard', frequency: 7, sentiment: 82 }
        ],
        actionItems: [
          {
            id: '1',
            text: 'Complete dashboard integration',
            priority: 'high',
            assignee: 'John Doe',
            status: 'in-progress',
            extractedFrom: 'John Doe at 09:00:15',
            confidence: 95
          },
          {
            id: '2',
            text: 'Schedule review session before Friday',
            priority: 'medium',
            assignee: 'Jane Smith',
            status: 'pending',
            extractedFrom: 'Jane Smith at 09:02:30',
            confidence: 88
          },
          {
            id: '3',
            text: 'Address loading time concerns urgently',
            priority: 'high',
            status: 'pending',
            extractedFrom: 'Mike Johnson at 09:05:12',
            confidence: 92
          }
        ],
        insights: [
          {
            type: 'positive',
            title: 'High Team Engagement',
            description: 'Team members showed strong engagement with an average score of 85%',
            impact: 'high'
          },
          {
            type: 'negative',
            title: 'Performance Concerns',
            description: 'Multiple mentions of performance issues that need immediate attention',
            impact: 'high'
          },
          {
            type: 'info',
            title: 'Balanced Speaking Time',
            description: 'Good distribution of speaking time across all participants',
            impact: 'medium'
          },
          {
            type: 'positive',
            title: 'Clear Action Items',
            description: 'Meeting generated 3 clear, actionable items with high confidence',
            impact: 'medium'
          }
        ]
      },
      engagement: {
        overall: 85,
        byParticipant: {
          'John Doe': 85,
          'Jane Smith': 78,
          'Mike Johnson': 92
        },
        timeline: [
          { timestamp: '09:00', level: 80 },
          { timestamp: '09:05', level: 85 },
          { timestamp: '09:10', level: 75 },
          { timestamp: '09:15', level: 90 },
          { timestamp: '09:20', level: 95 },
          { timestamp: '09:25', level: 70 },
          { timestamp: '09:30', level: 88 },
          { timestamp: '09:35', level: 85 },
          { timestamp: '09:40', level: 82 }
        ]
      }
    };

    setTimeout(() => {
      setMeetingLogs(mockLogs);
      setLoading(false);
    }, 1000);
  }, [meetingId]);

  const getSentimentColor = (sentiment: number) => {
    if (sentiment >= 80) return 'text-emerald-400';
    if (sentiment >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getSentimentBg = (sentiment: number) => {
    if (sentiment >= 80) return 'bg-emerald-400/10 border-emerald-400/20';
    if (sentiment >= 60) return 'bg-yellow-400/10 border-yellow-400/20';
    return 'bg-red-400/10 border-red-400/20';
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'positive': return <TrendingUp className="w-4 h-4 text-emerald-400" />;
      case 'negative': return <TrendingDown className="w-4 h-4 text-red-400" />;
      case 'neutral': return <Activity className="w-4 h-4 text-blue-400" />;
      default: return <Info className="w-4 h-4 text-zinc-400" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-400 bg-red-400/10';
      case 'medium': return 'text-yellow-400 bg-yellow-400/10';
      case 'low': return 'text-blue-400 bg-blue-400/10';
      default: return 'text-zinc-400 bg-zinc-400/10';
    }
  };

  const filteredTranscript = meetingLogs?.transcript.filter(item => {
    const matchesSearch = item.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.speaker.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSpeaker = selectedSpeaker === 'all' || item.speaker === selectedSpeaker;
    return matchesSearch && matchesSpeaker;
  }) || [];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-400"></div>
      </div>
    );
  }

  if (!meetingLogs) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Meeting Logs Not Found</h1>
          <p className="text-zinc-400 mb-6">The meeting logs you're looking for don't exist.</p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      <Navbar />
      
      <div className="pt-24 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-4 mb-4">
              <Link
                href={`/dashboard/${meetingId}`}
                className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Meeting
              </Link>
            </div>
            
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                  {meetingLogs.title} - Analytics Logs
                </h1>
                <div className="flex items-center gap-6 text-zinc-400">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {meetingLogs.date}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {meetingLogs.time} ({meetingLogs.duration})
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    {meetingLogs.participants.length} participants
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2">
                <button className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors">
                  <Download className="w-4 h-4 text-zinc-400" />
                </button>
                <button className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors">
                  <Share className="w-4 h-4 text-zinc-400" />
                </button>
              </div>
            </div>
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
          >
            <div className="bg-linear-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-2">
                <BarChart3 className="w-5 h-5 text-emerald-400" />
                <span className="text-zinc-400 text-sm">Overall Sentiment</span>
              </div>
              <div className="text-2xl font-bold text-white">{meetingLogs.analytics.sentimentOverall}%</div>
              <div className="text-xs text-emerald-400">+5% from last meeting</div>
            </div>

            <div className="bg-linear-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-2">
                <Activity className="w-5 h-5 text-blue-400" />
                <span className="text-zinc-400 text-sm">Engagement Level</span>
              </div>
              <div className="text-2xl font-bold text-white">{meetingLogs.engagement.overall}%</div>
              <div className="text-xs text-blue-400">Above average</div>
            </div>

            <div className="bg-linear-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-2">
                <MessageSquare className="w-5 h-5 text-purple-400" />
                <span className="text-zinc-400 text-sm">Total Words</span>
              </div>
              <div className="text-2xl font-bold text-white">{meetingLogs.analytics.totalWords.toLocaleString()}</div>
              <div className="text-xs text-purple-400">{Math.round(meetingLogs.analytics.totalWords / 45)} words/min</div>
            </div>

            <div className="bg-linear-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-2">
                <CheckCircle className="w-5 h-5 text-orange-400" />
                <span className="text-zinc-400 text-sm">Action Items</span>
              </div>
              <div className="text-2xl font-bold text-white">{meetingLogs.analytics.actionItems.length}</div>
              <div className="text-xs text-orange-400">All high confidence</div>
            </div>
          </motion.div>

          {/* Tab Navigation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <div className="flex space-x-1 bg-zinc-800/50 rounded-lg p-1">
              {[
                { id: 'overview', label: 'Overview', icon: BarChart3 },
                { id: 'sentiment', label: 'Sentiment Analysis', icon: TrendingUp },
                { id: 'transcript', label: 'Transcript', icon: MessageSquare },
                { id: 'engagement', label: 'Engagement', icon: Activity },
                { id: 'insights', label: 'AI Insights', icon: Brain },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-white text-black'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-700/50'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Key Topics */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-linear-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-xl p-6"
              >
                <h3 className="text-lg font-semibold text-white mb-4">Key Topics</h3>
                <div className="space-y-3">
                  {meetingLogs.analytics.keyTopics.map((topic, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
                      <div>
                        <p className="text-white font-medium">{topic.topic}</p>
                        <p className="text-sm text-zinc-400">Mentioned {topic.frequency} times</p>
                      </div>
                      <div className="text-right">
                        <div className={`text-sm font-medium ${getSentimentColor(topic.sentiment)}`}>
                          {topic.sentiment}%
                        </div>
                        <div className="w-16 h-1 bg-zinc-700 rounded-full mt-1">
                          <div
                            className="h-1 bg-emerald-400 rounded-full"
                            style={{ width: `${topic.sentiment}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Participant Analytics */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-linear-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-xl p-6"
              >
                <h3 className="text-lg font-semibold text-white mb-4">Participant Analytics</h3>
                <div className="space-y-4">
                  {meetingLogs.participants.map((participant) => (
                    <div key={participant.id} className="p-4 bg-zinc-800/50 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-white font-medium">{participant.name}</h4>
                        <span className="text-xs text-zinc-400">{participant.speakingTime}min speaking</span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-3">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-zinc-400">Engagement</span>
                            <span className="text-blue-400">{participant.engagement}%</span>
                          </div>
                          <div className="w-full bg-zinc-700 rounded-full h-1">
                            <div
                              className="bg-blue-400 h-1 rounded-full"
                              style={{ width: `${participant.engagement}%` }}
                            ></div>
                          </div>
                        </div>
                        
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-zinc-400">Sentiment</span>
                            <span className={getSentimentColor(participant.sentiment)}>{participant.sentiment}%</span>
                          </div>
                          <div className="w-full bg-zinc-700 rounded-full h-1">
                            <div
                              className="bg-emerald-400 h-1 rounded-full"
                              style={{ width: `${participant.sentiment}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          )}

          {activeTab === 'sentiment' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Sentiment Timeline Chart */}
              <Chart
                data={meetingLogs.analytics.sentimentTimeline.map(point => ({
                  timestamp: point.timestamp,
                  value: point.sentiment,
                  speaker: point.speaker
                }))}
                title="Sentiment Over Time"
                type="area"
                height={300}
                showLegend={true}
              />

              {/* Sentiment by Speaker */}
              <div className="bg-linear-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Sentiment by Participant</h3>
                <div className="space-y-4">
                  {meetingLogs.participants.map((participant) => (
                    <div key={participant.id} className="flex items-center justify-between">
                      <span className="text-white font-medium">{participant.name}</span>
                      <div className="flex items-center gap-3">
                        <div className="w-32 bg-zinc-700 rounded-full h-3">
                          <div
                            className={`h-3 rounded-full ${
                              participant.sentiment >= 80 ? 'bg-linear-to-r from-emerald-500 to-emerald-400' :
                              participant.sentiment >= 60 ? 'bg-linear-to-r from-yellow-500 to-yellow-400' :
                              'bg-linear-to-r from-red-500 to-red-400'
                            }`}
                            style={{ width: `${participant.sentiment}%` }}
                          ></div>
                        </div>
                        <span className={`font-bold w-12 text-right ${
                          participant.sentiment >= 80 ? 'text-emerald-400' :
                          participant.sentiment >= 60 ? 'text-yellow-400' :
                          'text-red-400'
                        }`}>
                          {participant.sentiment}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'transcript' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Search and Filter */}
              <div className="bg-linear-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-xl p-6">
                <div className="flex gap-4 mb-4">
                  <div className="flex-1 relative">
                    <Search className="w-4 h-4 absolute left-3 top-3 text-zinc-400" />
                    <input
                      type="text"
                      placeholder="Search transcript..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <select
                    value={selectedSpeaker}
                    onChange={(e) => setSelectedSpeaker(e.target.value)}
                    className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="all">All Speakers</option>
                    {meetingLogs.participants.map((participant) => (
                      <option key={participant.id} value={participant.name}>
                        {participant.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Transcript Items */}
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {filteredTranscript.map((item) => (
                    <div key={item.id} className="p-4 bg-zinc-800/50 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <span className="text-white font-medium">{item.speaker}</span>
                          <span className="text-xs text-zinc-400">{item.timestamp}</span>
                          <span className={`text-xs px-2 py-1 rounded ${getSentimentBg(item.sentiment)}`}>
                            {item.sentiment}% sentiment
                          </span>
                        </div>
                        <button className="p-1 hover:bg-zinc-700 rounded">
                          <Play className="w-3 h-3 text-zinc-400" />
                        </button>
                      </div>
                      <p className="text-zinc-300 mb-3">{item.text}</p>
                      
                      {item.keywords.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {item.keywords.map((keyword, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-blue-400/10 text-blue-400 text-xs rounded"
                            >
                              {keyword}
                            </span>
                          ))}
                        </div>
                      )}
                      
                      {item.actionItems.length > 0 && (
                        <div className="space-y-1">
                          {item.actionItems.map((action, index) => (
                            <div key={index} className="flex items-center gap-2 text-xs">
                              <CheckCircle className="w-3 h-3 text-emerald-400" />
                              <span className="text-emerald-400">{action}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'engagement' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Engagement Timeline */}
              <Chart
                data={meetingLogs.engagement.timeline.map(point => ({
                  timestamp: point.timestamp,
                  value: point.level
                }))}
                title="Engagement Over Time"
                type="line"
                height={300}
                valueFormatter={(value) => `${value}%`}
              />

              {/* Engagement by Participant */}
              <div className="bg-linear-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Engagement by Participant</h3>
                <div className="space-y-4">
                  {Object.entries(meetingLogs.engagement.byParticipant).map(([name, level]) => (
                    <div key={name} className="flex items-center justify-between">
                      <span className="text-white font-medium">{name}</span>
                      <div className="flex items-center gap-3">
                        <div className="w-32 bg-zinc-700 rounded-full h-3">
                          <div
                            className="bg-linear-to-r from-blue-500 to-blue-400 h-3 rounded-full"
                            style={{ width: `${level}%` }}
                          ></div>
                        </div>
                        <span className="text-blue-400 font-bold w-12 text-right">{level}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'insights' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* AI Insights */}
              <div className="grid gap-6">
                <div className="bg-linear-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">AI-Generated Insights</h3>
                  <div className="space-y-4">
                    {meetingLogs.analytics.insights.map((insight, index) => (
                      <div key={index} className="p-4 bg-zinc-800/50 rounded-lg border-l-4 border-l-emerald-400">
                        <div className="flex items-start gap-3">
                          {getInsightIcon(insight.type)}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="text-white font-medium">{insight.title}</h4>
                              <span className={`px-2 py-1 text-xs rounded ${
                                insight.impact === 'high' ? 'bg-red-400/10 text-red-400' :
                                insight.impact === 'medium' ? 'bg-yellow-400/10 text-yellow-400' :
                                'bg-blue-400/10 text-blue-400'
                              }`}>
                                {insight.impact} impact
                              </span>
                            </div>
                            <p className="text-zinc-300 text-sm">{insight.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Items from AI */}
                <div className="bg-linear-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Extracted Action Items</h3>
                  <div className="space-y-3">
                    {meetingLogs.analytics.actionItems.map((action) => (
                      <div key={action.id} className="p-4 bg-zinc-800/50 rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <p className="text-white font-medium mb-1">{action.text}</p>
                            <p className="text-xs text-zinc-400">
                              Extracted from: {action.extractedFrom} • Confidence: {action.confidence}%
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 text-xs rounded ${getPriorityColor(action.priority)}`}>
                              {action.priority}
                            </span>
                            <span className={`px-2 py-1 text-xs rounded ${
                              action.status === 'completed' ? 'bg-emerald-400/10 text-emerald-400' :
                              action.status === 'in-progress' ? 'bg-blue-400/10 text-blue-400' :
                              'bg-zinc-400/10 text-zinc-400'
                            }`}>
                              {action.status}
                            </span>
                          </div>
                        </div>
                        {action.assignee && (
                          <p className="text-sm text-zinc-400">Assigned to: {action.assignee}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}