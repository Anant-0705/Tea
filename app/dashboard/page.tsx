'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { 
  Phone, 
  Calendar, 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  Users,
  FileText,
  Play,
  Pause,
  Settings,
  BarChart3,
  Activity,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import LiveTranscription from '../components/transcription/LiveTranscription';
import AIAnalysis from '../components/AIAnalysis';
import AutomationDashboard from '../components/automation/AutomationDashboard';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState('overview');

  // Mock user name for demo purposes
  const userName = session?.user?.name || 'User';

  const stats = [
    { label: 'Total Meetings', value: '12', icon: Phone, change: '+3 this week' },
    { label: 'Hours Saved', value: '8.5', icon: Clock, change: '+2.1 hrs' },
    { label: 'Action Items', value: '24', icon: CheckCircle, change: '18 completed' },
    { label: 'Avg Sentiment', value: '94%', icon: TrendingUp, change: '+2% positive' },
  ];

  const recentMeetings = [
    {
      id: 1,
      title: 'Team Standup',
      date: '2025-11-07',
      time: '09:00 AM',
      duration: '15 min',
      participants: 4,
      status: 'completed',
      actionItems: 3,
    },
    {
      id: 2,
      title: 'Client Review Meeting',
      date: '2025-11-06',
      time: '2:00 PM',
      duration: '45 min',
      participants: 3,
      status: 'completed',
      actionItems: 7,
    },
  ];

  const actionItems = [
    { id: 1, task: 'Follow up with client', priority: 'high', dueDate: 'Nov 8' },
    { id: 2, task: 'Update project timeline', priority: 'medium', dueDate: 'Nov 9' },
    { id: 3, task: 'Schedule next review', priority: 'low', dueDate: 'Nov 10' },
  ];

  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      <Navbar />
      
      <div className="pt-24 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              Welcome back, {userName.split(' ')[0]}!
            </h1>
            <p className="text-zinc-400">
              Here's what's happening with your meetings and tasks
            </p>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-linear-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition-all"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center">
                    <stat.icon className="w-5 h-5 text-zinc-300" />
                  </div>
                  <span className="text-emerald-500 text-xs font-medium">{stat.change}</span>
                </div>
                <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-sm text-zinc-400">{stat.label}</div>
              </motion.div>
            ))}
          </div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid md:grid-cols-3 gap-6 mb-8"
          >
            <Link
              href="/schedule"
              className="bg-linear-to-br from-emerald-900/20 to-zinc-950 border border-emerald-800/30 rounded-xl p-6 hover:border-emerald-700/50 transition-all group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">Schedule Meeting</h3>
                  <p className="text-sm text-zinc-400">Create a new AI-tracked meeting</p>
                </div>
                <ArrowRight className="w-5 h-5 text-emerald-400 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            <Link
              href="/dashboard/meetings"
              className="bg-linear-to-br from-blue-900/20 to-zinc-950 border border-blue-800/30 rounded-xl p-6 hover:border-blue-700/50 transition-all group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">View Meetings</h3>
                  <p className="text-sm text-zinc-400">Browse your meeting history</p>
                </div>
                <ArrowRight className="w-5 h-5 text-blue-400 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            <Link
              href="/dashboard/tasks"
              className="bg-linear-to-br from-purple-900/20 to-zinc-950 border border-purple-800/30 rounded-xl p-6 hover:border-purple-700/50 transition-all group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">Manage Tasks</h3>
                  <p className="text-sm text-zinc-400">Review action items</p>
                </div>
                <ArrowRight className="w-5 h-5 text-purple-400 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </motion.div>

          {/* Tab Navigation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-8"
          >
            <div className="flex space-x-1 bg-zinc-800/50 rounded-lg p-1">
              {[
                { id: 'overview', label: 'Overview', icon: BarChart3 },
                { id: 'live-transcription', label: 'Live Transcription', icon: Activity },
                { id: 'automation', label: 'Automation', icon: Settings },
                { id: 'analytics', label: 'Analytics', icon: TrendingUp },
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
            <>
              {/* Recent Activity */}
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Recent Meetings */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="bg-linear-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-xl p-6"
                >
                  <h3 className="text-lg font-semibold text-white mb-4">Recent Meetings</h3>
                  <div className="space-y-4">
                    {recentMeetings.map((meeting) => (
                      <Link
                        key={meeting.id}
                        href={`/dashboard/meeting${meeting.id}`}
                        className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-lg hover:bg-zinc-700/50 transition-colors group"
                      >
                        <div>
                          <h4 className="text-white font-medium group-hover:text-emerald-400 transition-colors">{meeting.title}</h4>
                          <p className="text-sm text-zinc-400">
                            {meeting.date} at {meeting.time} • {meeting.duration}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-zinc-400">{meeting.actionItems} items</div>
                          <div className="text-xs text-emerald-400">{meeting.status}</div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </motion.div>

                {/* Action Items */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="bg-linear-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-xl p-6"
                >
                  <h3 className="text-lg font-semibold text-white mb-4">Pending Tasks</h3>
                  <div className="space-y-3">
                    {actionItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <input type="checkbox" className="w-4 h-4" />
                          <div>
                            <p className="text-white text-sm">{item.task}</p>
                            <p className="text-xs text-zinc-500">Due {item.dueDate}</p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs ${
                          item.priority === 'high' ? 'bg-red-500/10 text-red-400' :
                          item.priority === 'medium' ? 'bg-yellow-500/10 text-yellow-400' :
                          'bg-blue-500/10 text-blue-400'
                        }`}>
                          {item.priority}
                        </span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>
            </>
          )}

          {activeTab === 'live-transcription' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <LiveTranscription
                meetingId="demo-meeting"
                onTranscriptUpdate={(transcript) => {
                  console.log('New transcript:', transcript);
                }}
              />
            </motion.div>
          )}

          {activeTab === 'automation' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <AutomationDashboard />
            </motion.div>
          )}

          {activeTab === 'analytics' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <AIAnalysis
                meetingId="demo-meeting"
                onAnalysisComplete={(result) => {
                  console.log('Analysis completed:', result);
                }}
              />
            </motion.div>
          )}

        </div>
      </div>
    </div>
  );
}
