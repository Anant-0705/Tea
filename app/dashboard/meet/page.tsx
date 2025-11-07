'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  Users, 
  Filter,
  Search,
  Plus,
  Video,
  FileText,
  TrendingUp,
  CheckCircle,
  ArrowRight,
  ChevronDown
} from 'lucide-react';
import Link from 'next/link';
import { getAllMeetings, getCompletedMeetings, getOngoingMeetings, getUpcomingMeetings, Meeting } from '@/lib/mock-data';

export default function MeetingsPage() {
  const { data: session } = useSession();
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const allMeetings = getAllMeetings();
  const completedMeetings = getCompletedMeetings();
  const ongoingMeetings = getOngoingMeetings();
  const upcomingMeetings = getUpcomingMeetings();

  const filteredMeetings = allMeetings.filter((meeting: Meeting) => {
    const matchesSearch = meeting.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         meeting.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filter === 'all') return matchesSearch;
    if (filter === 'completed') return meeting.status === 'completed' && matchesSearch;
    if (filter === 'ongoing') return meeting.status === 'ongoing' && matchesSearch;
    if (filter === 'upcoming') return meeting.status === 'scheduled' && matchesSearch;
    
    return matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'ongoing':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'scheduled':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      default:
        return 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30';
    }
  };

  const stats = [
    { label: 'Total Meetings', value: allMeetings.length, icon: Calendar, color: 'text-blue-400' },
    { label: 'Completed', value: completedMeetings.length, icon: CheckCircle, color: 'text-emerald-400' },
    { label: 'Ongoing', value: ongoingMeetings.length, icon: Video, color: 'text-orange-400' },
    { label: 'Upcoming', value: upcomingMeetings.length, icon: Clock, color: 'text-purple-400' },
  ];

  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      <div className="pb-20">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-center md:justify-between mb-8"
          >
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                Meetings
              </h1>
              <p className="text-zinc-400">
                Manage and review all your AI-powered meetings
              </p>
            </div>
            
            <Link href="/create">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="mt-4 md:mt-0 inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium"
              >
                <Plus className="w-5 h-5" />
                Create Meeting
              </motion.button>
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 + index * 0.05 }}
                className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-xl p-4 hover:border-zinc-700/50 transition-all duration-200"
              >
                <div className="flex items-center justify-between mb-2">
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  <span className="text-2xl font-bold text-white">{stat.value}</span>
                </div>
                <p className="text-sm text-zinc-400">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Filters and Search */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col md:flex-row gap-4 mb-8"
          >
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zinc-400" />
              <input
                type="text"
                placeholder="Search meetings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-zinc-900/50 border border-zinc-800/50 rounded-xl text-white placeholder-zinc-400 focus:border-blue-500/50 focus:outline-none transition-colors"
              />
            </div>

            {/* Filter Dropdown */}
            <div className="relative">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="appearance-none bg-zinc-900/50 border border-zinc-800/50 rounded-xl px-4 py-3 pr-10 text-white focus:border-blue-500/50 focus:outline-none transition-colors cursor-pointer"
              >
                <option value="all">All Meetings</option>
                <option value="completed">Completed</option>
                <option value="ongoing">Ongoing</option>
                <option value="upcoming">Upcoming</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zinc-400 pointer-events-none" />
            </div>
          </motion.div>

          {/* Meetings Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid gap-6"
          >
            {filteredMeetings.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 rounded-full bg-zinc-800/50 flex items-center justify-center mx-auto mb-6">
                  <Calendar className="w-10 h-10 text-zinc-600" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">No meetings found</h3>
                <p className="text-zinc-400 mb-8">
                  {searchTerm ? 'Try adjusting your search or filter criteria' : 'Create your first meeting to get started'}
                </p>
                <Link
                  href="/create"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  Create Meeting
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredMeetings.map((meeting: Meeting, index: number) => (
                  <motion.div
                    key={meeting.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + index * 0.05 }}
                    whileHover={{ y: -2 }}
                    className="group"
                  >
                    <Link href={`/dashboard/meet/${meeting.id}`}>
                      <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-2xl p-6 hover:border-zinc-700/50 hover:bg-zinc-800/30 transition-all duration-300">
                        <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                          {/* Meeting Info */}
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-4">
                              <div>
                                <h3 className="text-xl font-semibold text-white group-hover:text-blue-400 transition-colors mb-2">
                                  {meeting.title}
                                </h3>
                                <p className="text-zinc-400 text-sm mb-3 line-clamp-2">
                                  {meeting.description}
                                </p>
                              </div>
                              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(meeting.status)}`}>
                                {meeting.status}
                              </span>
                            </div>

                            <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-400">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                <span>{meeting.date}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                <span>{meeting.time} • {meeting.duration}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Users className="w-4 h-4" />
                                <span>{meeting.participants.length} participants</span>
                              </div>
                            </div>
                          </div>

                          {/* Meeting Stats */}
                          <div className="flex items-center gap-6 lg:border-l lg:border-zinc-700/50 lg:pl-6">
                            <div className="text-center">
                              <div className="text-lg font-semibold text-white">{meeting.actionItems.length}</div>
                              <div className="text-xs text-zinc-400">Action Items</div>
                            </div>
                            
                            {meeting.analytics && (
                              <>
                                <div className="text-center">
                                  <div className="text-lg font-semibold text-emerald-400">
                                    {Math.round(meeting.analytics.averageSentiment * 100)}%
                                  </div>
                                  <div className="text-xs text-zinc-400">Sentiment</div>
                                </div>
                                
                                <div className="text-center">
                                  <div className="text-lg font-semibold text-blue-400">
                                    {meeting.analytics.speakingTime ? Object.keys(meeting.analytics.speakingTime).length : 0}
                                  </div>
                                  <div className="text-xs text-zinc-400">Speakers</div>
                                </div>
                              </>
                            )}

                            <div className="text-center">
                              <ArrowRight className="w-5 h-5 text-zinc-600 group-hover:text-blue-400 transition-colors mx-auto" />
                              <div className="text-xs text-zinc-400 mt-1">View Details</div>
                            </div>
                          </div>
                        </div>

                        {/* Quick Actions */}
                        {meeting.status === 'completed' && meeting.transcript && (
                          <div className="mt-4 pt-4 border-t border-zinc-700/30">
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-2 text-xs text-zinc-500">
                                <FileText className="w-3 h-3" />
                                <span>Transcript: {meeting.transcript.length > 100 ? '100+' : meeting.transcript.length} words</span>
                              </div>
                              
                              {meeting.analytics && (
                                <div className="flex items-center gap-2 text-xs text-zinc-500">
                                  <TrendingUp className="w-3 h-3" />
                                  <span>Analytics available</span>
                                </div>
                              )}
                              
                              {meeting.minutesOfMeeting && (
                                <div className="flex items-center gap-2 text-xs text-zinc-500">
                                  <CheckCircle className="w-3 h-3" />
                                  <span>MoM generated</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Load More (Future Enhancement) */}
          {filteredMeetings.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-center mt-8"
            >
              <p className="text-zinc-500 text-sm">
                Showing {filteredMeetings.length} of {allMeetings.length} meetings
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}