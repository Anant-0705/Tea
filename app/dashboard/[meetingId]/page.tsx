'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Calendar,
  Clock,
  Users,
  FileText,
  BarChart3,
  TrendingUp,
  CheckCircle,
  ArrowLeft,
  Play,
  MessageSquare,
  Eye,
  Download,
  Share
} from 'lucide-react';
import Link from 'next/link';
import Navbar from '../../components/Navbar';

interface MeetingData {
  id: string;
  title: string;
  date: string;
  time: string;
  duration: string;
  participants: Array<{
    name: string;
    email: string;
    joinTime: string;
    leaveTime: string;
  }>;
  status: 'scheduled' | 'ongoing' | 'completed';
  recording?: string;
  transcript: string;
  actionItems: Array<{
    id: string;
    task: string;
    assignee: string;
    priority: 'high' | 'medium' | 'low';
    status: 'pending' | 'in-progress' | 'completed';
    dueDate: string;
  }>;
  sentimentAnalysis: {
    overall: number;
    participants: Record<string, number>;
    timeline: Array<{
      timestamp: string;
      sentiment: number;
    }>;
  };
  keyTopics: string[];
  summaryPoints: string[];
}

export default function MeetingDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const meetingId = params.meetingId as string;
  const [meetingData, setMeetingData] = useState<MeetingData | null>(null);
  const [loading, setLoading] = useState(true);

  // Mock data - in real app, fetch from API
  useEffect(() => {
    const mockData: MeetingData = {
      id: meetingId,
      title: meetingId === 'meeting1' ? 'Team Standup' : 'Client Review Meeting',
      date: '2025-11-07',
      time: '09:00 AM',
      duration: '45 minutes',
      participants: [
        {
          name: 'John Doe',
          email: 'john@company.com',
          joinTime: '09:00 AM',
          leaveTime: '09:45 AM'
        },
        {
          name: 'Jane Smith',
          email: 'jane@company.com',
          joinTime: '09:02 AM',
          leaveTime: '09:45 AM'
        },
        {
          name: 'Mike Johnson',
          email: 'mike@company.com',
          joinTime: '09:00 AM',
          leaveTime: '09:43 AM'
        }
      ],
      status: 'completed',
      recording: '/recordings/meeting1.mp4',
      transcript: 'Full meeting transcript would go here...',
      actionItems: [
        {
          id: '1',
          task: 'Update project timeline',
          assignee: 'John Doe',
          priority: 'high',
          status: 'pending',
          dueDate: '2025-11-10'
        },
        {
          id: '2',
          task: 'Prepare client presentation',
          assignee: 'Jane Smith',
          priority: 'medium',
          status: 'in-progress',
          dueDate: '2025-11-12'
        },
        {
          id: '3',
          task: 'Review code changes',
          assignee: 'Mike Johnson',
          priority: 'low',
          status: 'completed',
          dueDate: '2025-11-08'
        }
      ],
      sentimentAnalysis: {
        overall: 85,
        participants: {
          'John Doe': 90,
          'Jane Smith': 82,
          'Mike Johnson': 78
        },
        timeline: [
          { timestamp: '09:00', sentiment: 80 },
          { timestamp: '09:15', sentiment: 85 },
          { timestamp: '09:30', sentiment: 90 },
          { timestamp: '09:45', sentiment: 85 }
        ]
      },
      keyTopics: ['Project Timeline', 'Client Requirements', 'Resource Allocation', 'Next Steps'],
      summaryPoints: [
        'Project is on track for November delivery',
        'Client feedback was overwhelmingly positive',
        'Need to address resource allocation for Q1 2026',
        'Next review meeting scheduled for November 15th'
      ]
    };

    setTimeout(() => {
      setMeetingData(mockData);
      setLoading(false);
    }, 1000);
  }, [meetingId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-400"></div>
      </div>
    );
  }

  if (!meetingData) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Meeting Not Found</h1>
          <p className="text-zinc-400 mb-6">The meeting you're looking for doesn't exist.</p>
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-emerald-400 bg-emerald-400/10';
      case 'ongoing': return 'text-blue-400 bg-blue-400/10';
      case 'scheduled': return 'text-yellow-400 bg-yellow-400/10';
      default: return 'text-zinc-400 bg-zinc-400/10';
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
                href="/dashboard"
                className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </Link>
            </div>
            
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                  {meetingData.title}
                </h1>
                <div className="flex items-center gap-6 text-zinc-400">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {meetingData.date}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {meetingData.time} ({meetingData.duration})
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    {meetingData.participants.length} participants
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(meetingData.status)}`}>
                  {meetingData.status}
                </span>
                <div className="flex gap-2">
                  <button className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors">
                    <Download className="w-4 h-4 text-zinc-400" />
                  </button>
                  <button className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors">
                    <Share className="w-4 h-4 text-zinc-400" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid md:grid-cols-4 gap-4 mb-8"
          >
            <Link
              href={`/dashboard/${meetingId}/logs`}
              className="bg-linear-to-br from-emerald-900/20 to-zinc-950 border border-emerald-800/30 rounded-xl p-4 hover:border-emerald-700/50 transition-all group"
            >
              <div className="flex items-center gap-3">
                <BarChart3 className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="text-white font-medium">View Logs</h3>
                  <p className="text-xs text-zinc-400">Detailed analytics</p>
                </div>
              </div>
            </Link>

            <button className="bg-linear-to-br from-blue-900/20 to-zinc-950 border border-blue-800/30 rounded-xl p-4 hover:border-blue-700/50 transition-all">
              <div className="flex items-center gap-3">
                <Play className="w-5 h-5 text-blue-400" />
                <div>
                  <h3 className="text-white font-medium">Play Recording</h3>
                  <p className="text-xs text-zinc-400">Watch meeting</p>
                </div>
              </div>
            </button>

            <button className="bg-linear-to-br from-purple-900/20 to-zinc-950 border border-purple-800/30 rounded-xl p-4 hover:border-purple-700/50 transition-all">
              <div className="flex items-center gap-3">
                <MessageSquare className="w-5 h-5 text-purple-400" />
                <div>
                  <h3 className="text-white font-medium">View Transcript</h3>
                  <p className="text-xs text-zinc-400">Full conversation</p>
                </div>
              </div>
            </button>

            <button className="bg-linear-to-br from-orange-900/20 to-zinc-950 border border-orange-800/30 rounded-xl p-4 hover:border-orange-700/50 transition-all">
              <div className="flex items-center gap-3">
                <Eye className="w-5 h-5 text-orange-400" />
                <div>
                  <h3 className="text-white font-medium">AI Insights</h3>
                  <p className="text-xs text-zinc-400">Smart analysis</p>
                </div>
              </div>
            </button>
          </motion.div>

          {/* Content Grid */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Meeting Summary */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-linear-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-xl p-6"
              >
                <h3 className="text-lg font-semibold text-white mb-4">Meeting Summary</h3>
                <div className="space-y-3">
                  {meetingData.summaryPoints.map((point, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-emerald-400 mt-0.5" />
                      <p className="text-zinc-300">{point}</p>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Key Topics */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-linear-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-xl p-6"
              >
                <h3 className="text-lg font-semibold text-white mb-4">Key Topics Discussed</h3>
                <div className="flex flex-wrap gap-2">
                  {meetingData.keyTopics.map((topic, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-zinc-800 text-zinc-300 rounded-full text-sm"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </motion.div>

              {/* Action Items */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-linear-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-xl p-6"
              >
                <h3 className="text-lg font-semibold text-white mb-4">Action Items</h3>
                <div className="space-y-3">
                  {meetingData.actionItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={item.status === 'completed'}
                          className="w-4 h-4"
                          readOnly
                        />
                        <div>
                          <p className="text-white font-medium">{item.task}</p>
                          <p className="text-sm text-zinc-400">
                            Assigned to {item.assignee} • Due {item.dueDate}
                          </p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(item.priority)}`}>
                        {item.priority}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Participants */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-linear-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-xl p-6"
              >
                <h3 className="text-lg font-semibold text-white mb-4">Participants</h3>
                <div className="space-y-3">
                  {meetingData.participants.map((participant, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-medium">{participant.name}</p>
                        <p className="text-xs text-zinc-400">{participant.email}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-zinc-400">
                          {participant.joinTime} - {participant.leaveTime}
                        </p>
                        <div className="w-2 h-2 bg-emerald-400 rounded-full ml-auto mt-1"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Sentiment Overview */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-linear-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-xl p-6"
              >
                <h3 className="text-lg font-semibold text-white mb-4">Sentiment Analysis</h3>
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-zinc-400">Overall</span>
                    <span className="text-emerald-400 font-bold">{meetingData.sentimentAnalysis.overall}%</span>
                  </div>
                  <div className="w-full bg-zinc-800 rounded-full h-2">
                    <div
                      className="bg-linear-to-r from-emerald-500 to-emerald-400 h-2 rounded-full"
                      style={{ width: `${meetingData.sentimentAnalysis.overall}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  {Object.entries(meetingData.sentimentAnalysis.participants).map(([name, sentiment]) => (
                    <div key={name} className="flex items-center justify-between text-sm">
                      <span className="text-zinc-400">{name}</span>
                      <span className="text-white">{sentiment}%</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}