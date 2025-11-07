'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar,
  Clock,
  Users,
  BarChart3,
  Search,
  Filter,
  ArrowLeft,
  TrendingUp,
  MessageSquare,
  CheckCircle,
  Eye,
  Play
} from 'lucide-react';
import Link from 'next/link';
import Navbar from '../../components/Navbar';

interface Meeting {
  id: string;
  title: string;
  date: string;
  time: string;
  duration: string;
  participants: number;
  status: 'scheduled' | 'ongoing' | 'completed';
  actionItems: number;
  sentiment: number;
  engagement: number;
  hasRecording: boolean;
  hasTranscript: boolean;
}

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');

  useEffect(() => {
    // Mock data - in real app, fetch from API
    const mockMeetings: Meeting[] = [
      {
        id: 'meeting1',
        title: 'Team Standup',
        date: '2025-11-07',
        time: '09:00 AM',
        duration: '45 min',
        participants: 4,
        status: 'completed',
        actionItems: 3,
        sentiment: 85,
        engagement: 92,
        hasRecording: true,
        hasTranscript: true
      },
      {
        id: 'meeting2',
        title: 'Client Review Meeting',
        date: '2025-11-06',
        time: '2:00 PM',
        duration: '1h 15min',
        participants: 6,
        status: 'completed',
        actionItems: 7,
        sentiment: 78,
        engagement: 88,
        hasRecording: true,
        hasTranscript: true
      },
      {
        id: 'meeting3',
        title: 'Sprint Planning',
        date: '2025-11-05',
        time: '10:00 AM',
        duration: '2h',
        participants: 8,
        status: 'completed',
        actionItems: 12,
        sentiment: 82,
        engagement: 85,
        hasRecording: true,
        hasTranscript: true
      },
      {
        id: 'meeting4',
        title: 'Design Review',
        date: '2025-11-04',
        time: '3:00 PM',
        duration: '30 min',
        participants: 3,
        status: 'completed',
        actionItems: 2,
        sentiment: 90,
        engagement: 95,
        hasRecording: false,
        hasTranscript: true
      },
      {
        id: 'meeting5',
        title: 'Weekly All-Hands',
        date: '2025-11-08',
        time: '11:00 AM',
        duration: '1h',
        participants: 15,
        status: 'scheduled',
        actionItems: 0,
        sentiment: 0,
        engagement: 0,
        hasRecording: false,
        hasTranscript: false
      }
    ];

    setTimeout(() => {
      setMeetings(mockMeetings);
      setLoading(false);
    }, 1000);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-emerald-400 bg-emerald-400/10';
      case 'ongoing': return 'text-blue-400 bg-blue-400/10';
      case 'scheduled': return 'text-yellow-400 bg-yellow-400/10';
      default: return 'text-zinc-400 bg-zinc-400/10';
    }
  };

  const getSentimentColor = (sentiment: number) => {
    if (sentiment >= 80) return 'text-emerald-400';
    if (sentiment >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const filteredMeetings = meetings.filter(meeting => {
    const matchesSearch = meeting.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || meeting.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const sortedMeetings = [...filteredMeetings].sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      case 'title':
        return a.title.localeCompare(b.title);
      case 'sentiment':
        return b.sentiment - a.sentiment;
      case 'engagement':
        return b.engagement - a.engagement;
      default:
        return 0;
    }
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-400"></div>
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
                href="/dashboard"
                className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </Link>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              All Meetings
            </h1>
            <p className="text-zinc-400">
              Browse and analyze your meeting history
            </p>
          </motion.div>

          {/* Stats Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
          >
            <div className="bg-linear-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-2">
                <Calendar className="w-5 h-5 text-emerald-400" />
                <span className="text-zinc-400 text-sm">Total Meetings</span>
              </div>
              <div className="text-2xl font-bold text-white">{meetings.length}</div>
              <div className="text-xs text-emerald-400">This month</div>
            </div>

            <div className="bg-linear-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-5 h-5 text-blue-400" />
                <span className="text-zinc-400 text-sm">Avg Sentiment</span>
              </div>
              <div className="text-2xl font-bold text-white">
                {Math.round(meetings.filter(m => m.sentiment > 0).reduce((acc, m) => acc + m.sentiment, 0) / meetings.filter(m => m.sentiment > 0).length)}%
              </div>
              <div className="text-xs text-blue-400">+5% from last month</div>
            </div>

            <div className="bg-linear-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-2">
                <Users className="w-5 h-5 text-purple-400" />
                <span className="text-zinc-400 text-sm">Avg Engagement</span>
              </div>
              <div className="text-2xl font-bold text-white">
                {Math.round(meetings.filter(m => m.engagement > 0).reduce((acc, m) => acc + m.engagement, 0) / meetings.filter(m => m.engagement > 0).length)}%
              </div>
              <div className="text-xs text-purple-400">High participation</div>
            </div>

            <div className="bg-linear-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-2">
                <CheckCircle className="w-5 h-5 text-orange-400" />
                <span className="text-zinc-400 text-sm">Total Action Items</span>
              </div>
              <div className="text-2xl font-bold text-white">
                {meetings.reduce((acc, m) => acc + m.actionItems, 0)}
              </div>
              <div className="text-xs text-orange-400">Generated this month</div>
            </div>
          </motion.div>

          {/* Filters and Search */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-linear-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-xl p-6 mb-8"
          >
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Search meetings..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:border-emerald-500"
                />
              </div>
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="ongoing">Ongoing</option>
                <option value="scheduled">Scheduled</option>
              </select>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="date">Sort by Date</option>
                <option value="title">Sort by Title</option>
                <option value="sentiment">Sort by Sentiment</option>
                <option value="engagement">Sort by Engagement</option>
              </select>
            </div>
          </motion.div>

          {/* Meetings List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-4"
          >
            {sortedMeetings.map((meeting, index) => (
              <motion.div
                key={meeting.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="bg-linear-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-xl font-semibold text-white">{meeting.title}</h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(meeting.status)}`}>
                        {meeting.status}
                      </span>
                      {meeting.hasRecording && (
                        <span className="flex items-center gap-1 px-2 py-1 bg-blue-400/10 text-blue-400 rounded text-xs">
                          <Play className="w-3 h-3" />
                          Recording
                        </span>
                      )}
                      {meeting.hasTranscript && (
                        <span className="flex items-center gap-1 px-2 py-1 bg-purple-400/10 text-purple-400 rounded text-xs">
                          <MessageSquare className="w-3 h-3" />
                          Transcript
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-6 text-zinc-400 mb-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {meeting.date}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {meeting.time} ({meeting.duration})
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        {meeting.participants} participants
                      </div>
                      {meeting.actionItems > 0 && (
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4" />
                          {meeting.actionItems} action items
                        </div>
                      )}
                    </div>

                    {meeting.status === 'completed' && (
                      <div className="flex items-center gap-6 mb-4">
                        <div className="flex items-center gap-2">
                          <span className="text-zinc-400 text-sm">Sentiment:</span>
                          <span className={`font-medium ${getSentimentColor(meeting.sentiment)}`}>
                            {meeting.sentiment}%
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-zinc-400 text-sm">Engagement:</span>
                          <span className="text-blue-400 font-medium">{meeting.engagement}%</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 ml-6">
                    <Link
                      href={`/dashboard/${meeting.id}`}
                      className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      <span className="text-sm">View</span>
                    </Link>
                    {meeting.status === 'completed' && (
                      <Link
                        href={`/dashboard/${meeting.id}/logs`}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors"
                      >
                        <BarChart3 className="w-4 h-4" />
                        <span className="text-sm">Analytics</span>
                      </Link>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
}