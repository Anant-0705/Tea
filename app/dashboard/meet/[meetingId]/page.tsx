'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Users,
  FileText,
  TrendingUp,
  Download,
  Share,
  Play,
  Pause,
  AlertCircle,
  Target,
  MessageSquare,
  BarChart3,
  PieChart,
  Activity,
  Sparkles
} from 'lucide-react';
import Link from 'next/link';
import { getMeetingById, Meeting } from '@/lib/mock-data';
import ActionExecutor from '@/components/ActionExecutor';

export default function MeetingDetailPage() {
  const params = useParams();
  const meetingId = params.meetingId as string;
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isPlaying, setIsPlaying] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);

  useEffect(() => {
    if (meetingId) {
      const foundMeeting = getMeetingById(meetingId);
      setMeeting(foundMeeting || null);
      
      // Fetch AI analysis if available
      fetchAnalysis();
    }
  }, [meetingId]);

  const fetchAnalysis = async () => {
    setLoadingAnalysis(true);
    try {
      const response = await fetch(`/api/meetings/${meetingId}/analysis`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setAiAnalysis(data);
        }
      }
    } catch (error) {
      console.error('Error fetching analysis:', error);
    } finally {
      setLoadingAnalysis(false);
    }
  };

  if (!meeting) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-zinc-600" />
          </div>
          <h3 className="text-xl font-medium text-white mb-2">Meeting not found</h3>
          <p className="text-zinc-400 mb-6">The meeting you're looking for doesn't exist or has been removed.</p>
          <Link
            href="/dashboard/meet"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Meetings
          </Link>
        </div>
      </div>
    );
  }

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

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'transcript', label: 'Transcript', icon: FileText },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'matrix', label: 'Interaction Matrix', icon: PieChart },
    { id: 'sentiment', label: 'Sentiment Analysis', icon: Activity },
    { id: 'actions', label: 'Action Items', icon: Target },
    { id: 'ai-actions', label: 'AI Actions', icon: Sparkles },
    { id: 'mom', label: 'Minutes', icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      <div className="pb-20">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4 mb-8"
          >
            <Link
              href="/dashboard/meet"
              className="p-2 rounded-lg bg-zinc-800/50 hover:bg-zinc-700/50 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-zinc-400" />
            </Link>

            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl md:text-3xl font-bold text-white">
                  {meeting.title}
                </h1>
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(meeting.status)}`}>
                  {meeting.status}
                </span>
              </div>
              <p className="text-zinc-400">{meeting.description}</p>
            </div>

            <div className="flex items-center gap-2">
              <button className="p-2 rounded-lg bg-zinc-800/50 hover:bg-zinc-700/50 transition-colors">
                <Share className="w-5 h-5 text-zinc-400" />
              </button>
              <button className="p-2 rounded-lg bg-zinc-800/50 hover:bg-zinc-700/50 transition-colors">
                <Download className="w-5 h-5 text-zinc-400" />
              </button>
            </div>
          </motion.div>

          {/* Meeting Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
          >
            <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <Calendar className="w-5 h-5 text-blue-400" />
                <span className="text-sm text-zinc-400">Date & Time</span>
              </div>
              <p className="text-white font-medium">{meeting.date}</p>
              <p className="text-zinc-400 text-sm">{meeting.time}</p>
            </div>

            <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <Clock className="w-5 h-5 text-emerald-400" />
                <span className="text-sm text-zinc-400">Duration</span>
              </div>
              <p className="text-white font-medium">{meeting.duration}</p>
            </div>

            <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <Users className="w-5 h-5 text-purple-400" />
                <span className="text-sm text-zinc-400">Participants</span>
              </div>
              <p className="text-white font-medium">{meeting.participants.length} people</p>
            </div>

            <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <Target className="w-5 h-5 text-orange-400" />
                <span className="text-sm text-zinc-400">Action Items</span>
              </div>
              <p className="text-white font-medium">{meeting.actionItems.length} items</p>
            </div>
          </motion.div>

          {/* Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <div className="flex flex-wrap gap-2 bg-zinc-900/30 backdrop-blur-sm border border-zinc-800/50 rounded-xl p-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                    }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Tab Content */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-6"
          >
            {activeTab === 'overview' && (
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Participants */}
                <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Participants</h3>
                  <div className="space-y-3">
                    {meeting.participants.map((participant, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium">
                          {participant.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="text-white font-medium">{participant.name}</p>
                          <p className="text-zinc-400 text-sm">{participant.role}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Stats */}
                {meeting.analytics && (
                  <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Meeting Analytics</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-zinc-800/30 rounded-lg">
                        <div className="text-2xl font-bold text-emerald-400 mb-1">
                          {Math.round(meeting.analytics.averageSentiment * 100)}%
                        </div>
                        <div className="text-xs text-zinc-400">Avg Sentiment</div>
                      </div>

                      <div className="text-center p-4 bg-zinc-800/30 rounded-lg">
                        <div className="text-2xl font-bold text-blue-400 mb-1">
                          {meeting.analytics.speakingTime ? Object.keys(meeting.analytics.speakingTime).length : 0}
                        </div>
                        <div className="text-xs text-zinc-400">Active Speakers</div>
                      </div>

                      <div className="text-center p-4 bg-zinc-800/30 rounded-lg">
                        <div className="text-2xl font-bold text-purple-400 mb-1">
                          {meeting.analytics.keyTopics?.length || 0}
                        </div>
                        <div className="text-xs text-zinc-400">Key Topics</div>
                      </div>

                      <div className="text-center p-4 bg-zinc-800/30 rounded-lg">
                        <div className="text-2xl font-bold text-orange-400 mb-1">
                          {meeting.actionItems.length}
                        </div>
                        <div className="text-xs text-zinc-400">Action Items</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'transcript' && (
              <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-white">Meeting Transcript</h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      {isPlaying ? 'Pause' : 'Play'}
                    </button>
                    <button className="p-2 rounded-lg bg-zinc-800/50 hover:bg-zinc-700/50 transition-colors">
                      <Download className="w-4 h-4 text-zinc-400" />
                    </button>
                  </div>
                </div>

                {meeting.transcript ? (
                  <div className="max-h-96 overflow-y-auto space-y-4 pr-2">
                    {meeting.transcript.split('\n\n').map((paragraph, index) => (
                      <div key={index} className="p-4 bg-zinc-800/30 rounded-lg">
                        <p className="text-zinc-300 leading-relaxed">{paragraph}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                    <p className="text-zinc-400">No transcript available for this meeting</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'analytics' && meeting.analytics && (
              <div className="space-y-6">
                {/* Key Topics */}
                <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Key Topics Discussed</h3>
                  <div className="flex flex-wrap gap-2">
                    {meeting.analytics.keyTopics?.map((topic, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm border border-blue-500/30"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Speaking Time */}
                {meeting.analytics.speakingTime && (
                  <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Speaking Time Distribution</h3>
                    <div className="space-y-3">
                      {Object.entries(meeting.analytics.speakingTime).map(([name, time]) => (
                        <div key={name} className="flex items-center justify-between">
                          <span className="text-white">{name}</span>
                          <div className="flex items-center gap-3">
                            <div className="w-32 h-2 bg-zinc-700 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
                                style={{ width: `${meeting.analytics?.speakingTime ? (time as number / Math.max(...Object.values(meeting.analytics.speakingTime))) * 100 : 0}%` }}
                              />
                            </div>
                            <span className="text-zinc-400 text-sm w-12">{time}min</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'matrix' && meeting.analytics?.interactionMatrix && (
              <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Interaction Matrix</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr>
                        <th className="text-left text-zinc-400 pb-4">Participant</th>
                        {meeting.participants.map((participant, index) => (
                          <th key={index} className="text-center text-zinc-400 pb-4 min-w-[80px]">
                            {participant.name.split(' ')[0]}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {meeting.participants.map((participant, i) => (
                        <tr key={i}>
                          <td className="text-white py-2 pr-4">{participant.name.split(' ')[0]}</td>
                          {meeting.participants.map((_, j) => (
                            <td key={j} className="text-center py-2">
                              <div className={`w-8 h-8 rounded-lg mx-auto flex items-center justify-center text-xs font-medium ${i === j ? 'bg-zinc-700 text-zinc-500' :
                                meeting.analytics?.interactionMatrix[i] && meeting.analytics.interactionMatrix[i][j] > 5 ?
                                  'bg-emerald-500/20 text-emerald-400' :
                                  meeting.analytics?.interactionMatrix[i] && meeting.analytics.interactionMatrix[i][j] > 2 ?
                                    'bg-yellow-500/20 text-yellow-400' :
                                    'bg-zinc-800/50 text-zinc-600'
                                }`}>
                                {i === j ? '-' : meeting.analytics?.interactionMatrix[i]?.[j] || 0}
                              </div>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 flex items-center gap-4 text-xs text-zinc-400">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-emerald-500/20 rounded border border-emerald-500/30"></div>
                    <span>High interaction (5+)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-yellow-500/20 rounded border border-yellow-500/30"></div>
                    <span>Medium interaction (2-5)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-zinc-800/50 rounded border border-zinc-700"></div>
                    <span>Low interaction (0-2)</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'sentiment' && meeting.analytics?.sentimentTimeline && (
              <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Sentiment Analysis Over Time</h3>
                <div className="space-y-4">
                  {meeting.analytics.sentimentTimeline.map((point, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <span className="text-zinc-400 text-sm w-16">{point.timestamp}</span>
                      <div className="flex-1 flex items-center gap-2">
                        <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${point.sentiment >= 0.7 ? 'bg-gradient-to-r from-emerald-500 to-green-400' :
                              point.sentiment >= 0.4 ? 'bg-gradient-to-r from-yellow-500 to-orange-400' :
                                'bg-gradient-to-r from-red-500 to-pink-400'
                              }`}
                            style={{ width: `${point.sentiment * 100}%` }}
                          />
                        </div>
                        <span className={`text-sm font-medium w-12 ${point.sentiment >= 0.7 ? 'text-emerald-400' :
                          point.sentiment >= 0.4 ? 'text-yellow-400' :
                            'text-red-400'
                          }`}>
                          {Math.round(point.sentiment * 100)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'actions' && (
              <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Action Items</h3>
                <div className="space-y-3">
                  {meeting.actionItems.map((action, index) => (
                    <div key={index} className="flex items-start gap-3 p-4 bg-zinc-800/30 rounded-lg">
                      <input type="checkbox" className="mt-1 w-4 h-4" />
                      <div className="flex-1">
                        <p className="text-white font-medium mb-1">{action.task}</p>
                        <div className="flex items-center gap-4 text-sm text-zinc-400">
                          <span>Assigned to: {action.assignee}</span>
                          <span>Due: {action.dueDate}</span>
                          <span className={`px-2 py-1 rounded text-xs ${action.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                            action.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-blue-500/20 text-blue-400'
                            }`}>
                            {action.priority} priority
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'ai-actions' && (
              <div>
                {loadingAnalysis ? (
                  <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-xl p-6 text-center">
                    <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-zinc-400">Loading AI analysis...</p>
                  </div>
                ) : aiAnalysis && aiAnalysis.summary ? (
                  <div className="space-y-6">
                    {/* AI Summary */}
                    <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-blue-400" />
                        AI-Generated Summary
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-sm font-medium text-zinc-400 mb-2">Executive Summary</h4>
                          <p className="text-white">{aiAnalysis.summary.executiveSummary}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-zinc-400 mb-2">Detailed Report</h4>
                          <p className="text-zinc-300">{aiAnalysis.summary.detailedReport}</p>
                        </div>
                      </div>
                    </div>

                    {/* Action Executor */}
                    <ActionExecutor
                      meetingId={meetingId}
                      recommendedActions={aiAnalysis.summary.recommendedActions || []}
                      actionItems={aiAnalysis.analysis?.actionItems || []}
                    />
                  </div>
                ) : (
                  <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-xl p-6 text-center">
                    <Sparkles className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                    <p className="text-zinc-400 mb-4">No AI analysis available yet</p>
                    <button
                      onClick={async () => {
                        try {
                          const response = await fetch('/api/meetings/analyze', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ meetingId }),
                          });
                          if (response.ok) {
                            await fetchAnalysis();
                          }
                        } catch (error) {
                          console.error('Error analyzing meeting:', error);
                        }
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Analyze Meeting with AI
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'mom' && meeting.minutesOfMeeting && (
              <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-white">Minutes of Meeting</h3>
                  <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                    <Download className="w-4 h-4" />
                    Download MoM
                  </button>
                </div>
                <div className="prose prose-invert max-w-none">
                  <div
                    className="text-zinc-300 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: meeting.minutesOfMeeting.replace(/\n/g, '<br />') }}
                  />
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}