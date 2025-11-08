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
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    { 
      label: 'Hours Saved', 
      value: '12.5', 
      icon: Clock, 
      change: '+3.2 hrs',
      color: 'text-emerald-600',
      bg: 'bg-emerald-50'
    },
    { 
      label: 'Action Items', 
      value: '28', 
      icon: CheckCircle, 
      change: '24 completed',
      color: 'text-purple-600',
      bg: 'bg-purple-50'
    },
    { 
      label: 'Avg Sentiment', 
      value: '85%', 
      icon: TrendingUp, 
      change: '+5% positive',
      color: 'text-orange-600',
      bg: 'bg-orange-50'
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="pb-20">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl md:text-4xl font-bold text-black mb-2">
              Welcome back, {userName.split(' ')[0]}!
            </h1>
            <p className="text-gray-600">
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
                className="relative overflow-hidden rounded-2xl bg-white border border-gray-200 p-6 hover:border-gray-300 hover:shadow-lg transition-all duration-300"
              >
                <div className={`absolute top-0 right-0 w-24 h-24 ${stat.bg} rounded-full -translate-y-12 translate-x-12 opacity-30`} />
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <stat.icon className={`w-8 h-8 ${stat.color}`} />
                    <span className={`text-xs px-2 py-1 rounded-full ${stat.bg} ${stat.color} font-medium border`}>
                      {stat.change}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-black mb-1">{stat.value}</h3>
                  <p className="text-gray-600 text-sm">{stat.label}</p>
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
                className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 border border-blue-300 p-8 hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
                <div className="relative">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                      <Plus className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">Create Meeting</h3>
                      <p className="text-blue-100 text-sm">Schedule a new meeting with AI assistance</p>
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
                className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 border border-emerald-300 p-8 hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 shadow-lg"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
                <div className="relative">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                      <Eye className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">View All Meetings</h3>
                      <p className="text-emerald-100 text-sm">Browse past and current meetings</p>
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
            className="bg-white border border-gray-200 rounded-2xl p-6 shadow-lg"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-black">Recent Meetings</h2>
              <Link
                href="/dashboard/meet"
                className="text-emerald-500 hover:text-emerald-600 transition-colors text-sm font-medium flex items-center gap-1"
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
                    <div className="group flex items-center gap-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200 hover:border-gray-300 transition-all duration-200">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        meeting.status === 'completed' ? 'bg-emerald-100 text-emerald-600' :
                        meeting.status === 'ongoing' ? 'bg-blue-100 text-blue-600' :
                        'bg-orange-100 text-orange-600'
                      }`}>
                        <Calendar className="w-6 h-6" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-black group-hover:text-emerald-600 transition-colors">
                            {meeting.title}
                          </h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            meeting.status === 'completed' ? 'bg-emerald-100 text-emerald-600' :
                            meeting.status === 'ongoing' ? 'bg-blue-100 text-blue-600' :
                            'bg-orange-100 text-orange-600'
                          }`}>
                            {meeting.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>{meeting.date} at {meeting.time}</span>
                          <span>{meeting.duration}</span>
                          <span>{meeting.participants.length} participants</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">{meeting.actionItems.length} actions</span>
                        <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-emerald-500 transition-colors" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>

            {recentMeetings.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-black mb-2">No meetings yet</h3>
                <p className="text-gray-600 mb-6">Create your first meeting to get started with TEAi</p>
                <Link
                  href="/schedule"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
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
