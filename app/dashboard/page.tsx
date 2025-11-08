'use client';

import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { 
  Phone, 
  Calendar, 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  ArrowRight,
  Plus,
  Eye
} from 'lucide-react';
import Link from 'next/link';
import { getRecentMeetings, getCompletedMeetings, getOngoingMeetings } from '@/lib/mock-data';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const userName = session?.user?.name || 'User';
  
  const recentMeetings = getRecentMeetings().slice(0, 3);
  const completedMeetings = getCompletedMeetings();
  const ongoingMeetings = getOngoingMeetings();

  const stats = [
    { 
      label: 'Total Meetings', 
      value: completedMeetings.length.toString(), 
      icon: Phone, 
      change: '+3 this week',
      color: 'text-blue-400',
      bg: 'bg-blue-500/10'
    },
    { 
      label: 'Hours Saved', 
      value: '12.5', 
      icon: Clock, 
      change: '+3.2 hrs',
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10'
    },
    { 
      label: 'Action Items', 
      value: '28', 
      icon: CheckCircle, 
      change: '24 completed',
      color: 'text-purple-400',
      bg: 'bg-purple-500/10'
    },
    { 
      label: 'Avg Sentiment', 
      value: '85%', 
      icon: TrendingUp, 
      change: '+5% positive',
      color: 'text-orange-400',
      bg: 'bg-orange-500/10'
    },
  ];

  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      <div className="pb-20">
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
              Here's your meeting intelligence overview
            </p>
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 + index * 0.1 }}
                whileHover={{ scale: 1.02, y: -2 }}
                className="relative overflow-hidden rounded-2xl bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 p-6 hover:border-zinc-700/50 transition-all duration-300"
              >
                <div className={`absolute top-0 right-0 w-24 h-24 ${stat.bg} rounded-full -translate-y-12 translate-x-12 opacity-50`} />
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <stat.icon className={`w-8 h-8 ${stat.color}`} />
                    <span className={`text-xs px-2 py-1 rounded-full ${stat.bg} ${stat.color} font-medium`}>
                      {stat.change}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-1">{stat.value}</h3>
                  <p className="text-zinc-400 text-sm">{stat.label}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
          >
            <Link href="/schedule">
              <motion.div
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600/80 to-blue-800/80 backdrop-blur-sm border border-blue-500/20 p-8 hover:border-blue-400/40 transition-all duration-300"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16" />
                <div className="relative">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                      <Plus className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">Create Meeting</h3>
                      <p className="text-blue-100/80 text-sm">Schedule a new meeting with AI assistance</p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-white/60 group-hover:text-white transition-colors" />
                </div>
              </motion.div>
            </Link>

            <Link href="/dashboard/meet">
              <motion.div
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600/80 to-emerald-800/80 backdrop-blur-sm border border-emerald-500/20 p-8 hover:border-emerald-400/40 transition-all duration-300"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16" />
                <div className="relative">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                      <Eye className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">View All Meetings</h3>
                      <p className="text-emerald-100/80 text-sm">Browse past and current meetings</p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-white/60 group-hover:text-white transition-colors" />
                </div>
              </motion.div>
            </Link>
          </motion.div>

          {/* Recent Meetings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Recent Meetings</h2>
              <Link
                href="/dashboard/meet"
                className="text-blue-400 hover:text-blue-300 transition-colors text-sm font-medium flex items-center gap-1"
              >
                View All
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="space-y-4">
              {recentMeetings.map((meeting, index) => (
                <motion.div
                  key={meeting.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                >
                  <Link href={`/dashboard/meet/${meeting.id}`}>
                    <div className="group flex items-center gap-4 p-4 rounded-xl bg-zinc-800/30 hover:bg-zinc-800/50 border border-zinc-700/30 hover:border-zinc-600/50 transition-all duration-200">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        meeting.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' :
                        meeting.status === 'ongoing' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-orange-500/20 text-orange-400'
                      }`}>
                        <Calendar className="w-6 h-6" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-white group-hover:text-blue-400 transition-colors">
                            {meeting.title}
                          </h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            meeting.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' :
                            meeting.status === 'ongoing' ? 'bg-blue-500/20 text-blue-400' :
                            'bg-orange-500/20 text-orange-400'
                          }`}>
                            {meeting.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-zinc-400">
                          <span>{meeting.date} at {meeting.time}</span>
                          <span>{meeting.duration}</span>
                          <span>{meeting.participants.length} participants</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs text-zinc-500">{meeting.actionItems.length} actions</span>
                        <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-blue-400 transition-colors" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>

            {recentMeetings.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-zinc-600" />
                </div>
                <h3 className="text-lg font-medium text-white mb-2">No meetings yet</h3>
                <p className="text-zinc-400 mb-6">Create your first meeting to get started with TEAi</p>
                <Link
                  href="/schedule"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Create Meeting
                </Link>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
