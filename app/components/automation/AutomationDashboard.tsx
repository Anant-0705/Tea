'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Brain, 
  Calendar, 
  Mail, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  Zap,
  Settings,
  Activity,
  Users,
  Target,
  ArrowUp,
  ArrowDown,
  BarChart3
} from 'lucide-react';
import SmartScheduling from '@/app/components/automation/SmartScheduling';

interface AutomationStats {
  totalMeetings: number;
  actionItemsExtracted: number;
  emailsSent: number;
  meetingsScheduled: number;
  completionRate: number;
  averageResponseTime: number;
}

interface RecentActivity {
  id: string;
  type: 'scheduling' | 'email' | 'extraction' | 'completion';
  title: string;
  description: string;
  timestamp: string;
  status: 'success' | 'pending' | 'failed';
}

const AutomationDashboard: React.FC = () => {
  const [stats, setStats] = useState<AutomationStats>({
    totalMeetings: 0,
    actionItemsExtracted: 0,
    emailsSent: 0,
    meetingsScheduled: 0,
    completionRate: 0,
    averageResponseTime: 0,
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'scheduling' | 'analytics' | 'settings'>('overview');
  const [loading, setLoading] = useState(true);

  // Load automation statistics
  const loadStats = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/automation/stats');
      const data = await response.json();
      
      if (data.success) {
        setStats(data.stats);
        setRecentActivity(data.recentActivity || []);
      }
    } catch (error) {
      console.error('Failed to load automation stats:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadStats();
  }, []);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'scheduling', label: 'Smart Scheduling', icon: Calendar },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'scheduling': return Calendar;
      case 'email': return Mail;
      case 'extraction': return Brain;
      case 'completion': return CheckCircle;
      default: return Activity;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-400 bg-green-500/10';
      case 'pending': return 'text-yellow-400 bg-yellow-500/10';
      case 'failed': return 'text-red-400 bg-red-500/10';
      default: return 'text-gray-400 bg-gray-500/10';
    }
  };

  const formatNumber = (num: number, suffix?: string) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M${suffix || ''}`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K${suffix || ''}`;
    return `${num}${suffix || ''}`;
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-linear-to-r from-blue-500 to-purple-600 rounded-lg">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Automation Dashboard</h1>
              <p className="text-gray-400">AI-powered meeting intelligence and task automation</p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-1 bg-gray-900/50 rounded-lg p-1 border border-gray-800">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-900/50 rounded-lg p-6 border border-gray-800"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Total Meetings</p>
                    <p className="text-2xl font-bold text-white">{formatNumber(stats.totalMeetings)}</p>
                  </div>
                  <div className="p-3 bg-blue-500/10 rounded-lg">
                    <Calendar className="w-6 h-6 text-blue-400" />
                  </div>
                </div>
                <div className="flex items-center mt-4 text-sm">
                  <ArrowUp className="w-4 h-4 text-green-400 mr-1" />
                  <span className="text-green-400">+12%</span>
                  <span className="text-gray-400 ml-1">from last month</span>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-gray-900/50 rounded-lg p-6 border border-gray-800"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Action Items</p>
                    <p className="text-2xl font-bold text-white">{formatNumber(stats.actionItemsExtracted)}</p>
                  </div>
                  <div className="p-3 bg-green-500/10 rounded-lg">
                    <Target className="w-6 h-6 text-green-400" />
                  </div>
                </div>
                <div className="flex items-center mt-4 text-sm">
                  <ArrowUp className="w-4 h-4 text-green-400 mr-1" />
                  <span className="text-green-400">+25%</span>
                  <span className="text-gray-400 ml-1">extraction accuracy</span>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gray-900/50 rounded-lg p-6 border border-gray-800"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Emails Sent</p>
                    <p className="text-2xl font-bold text-white">{formatNumber(stats.emailsSent)}</p>
                  </div>
                  <div className="p-3 bg-purple-500/10 rounded-lg">
                    <Mail className="w-6 h-6 text-purple-400" />
                  </div>
                </div>
                <div className="flex items-center mt-4 text-sm">
                  <ArrowUp className="w-4 h-4 text-green-400 mr-1" />
                  <span className="text-green-400">+8%</span>
                  <span className="text-gray-400 ml-1">open rate</span>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gray-900/50 rounded-lg p-6 border border-gray-800"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Completion Rate</p>
                    <p className="text-2xl font-bold text-white">{stats.completionRate}%</p>
                  </div>
                  <div className="p-3 bg-yellow-500/10 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-yellow-400" />
                  </div>
                </div>
                <div className="flex items-center mt-4 text-sm">
                  <ArrowDown className="w-4 h-4 text-red-400 mr-1" />
                  <span className="text-red-400">-3%</span>
                  <span className="text-gray-400 ml-1">response time</span>
                </div>
              </motion.div>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-gray-900/50 rounded-lg p-6 border border-gray-800"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
                  <button className="text-blue-400 hover:text-blue-300 text-sm">View All</button>
                </div>
                
                <div className="space-y-4">
                  {recentActivity.slice(0, 5).map((activity) => {
                    const Icon = getActivityIcon(activity.type);
                    return (
                      <div key={activity.id} className="flex items-start space-x-3">
                        <div className={`p-2 rounded-lg ${getStatusColor(activity.status)}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-medium">{activity.title}</p>
                          <p className="text-gray-400 text-sm">{activity.description}</p>
                          <p className="text-gray-500 text-xs mt-1">
                            {new Date(activity.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>

              {/* Quick Actions */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-gray-900/50 rounded-lg p-6 border border-gray-800"
              >
                <h3 className="text-lg font-semibold text-white mb-6">Quick Actions</h3>
                
                <div className="space-y-3">
                  <button className="w-full flex items-center space-x-3 p-3 bg-blue-600/10 border border-blue-500/20 rounded-lg hover:bg-blue-600/20 transition-colors text-left">
                    <Zap className="w-5 h-5 text-blue-400" />
                    <div>
                      <p className="text-white font-medium">Generate Scheduling Suggestions</p>
                      <p className="text-gray-400 text-sm">AI-powered meeting scheduling</p>
                    </div>
                  </button>
                  
                  <button className="w-full flex items-center space-x-3 p-3 bg-green-600/10 border border-green-500/20 rounded-lg hover:bg-green-600/20 transition-colors text-left">
                    <Mail className="w-5 h-5 text-green-400" />
                    <div>
                      <p className="text-white font-medium">Send Follow-up Emails</p>
                      <p className="text-gray-400 text-sm">Automated email summaries</p>
                    </div>
                  </button>
                  
                  <button className="w-full flex items-center space-x-3 p-3 bg-purple-600/10 border border-purple-500/20 rounded-lg hover:bg-purple-600/20 transition-colors text-left">
                    <Brain className="w-5 h-5 text-purple-400" />
                    <div>
                      <p className="text-white font-medium">Extract Action Items</p>
                      <p className="text-gray-400 text-sm">AI analysis of meeting content</p>
                    </div>
                  </button>
                  
                  <button className="w-full flex items-center space-x-3 p-3 bg-yellow-600/10 border border-yellow-500/20 rounded-lg hover:bg-yellow-600/20 transition-colors text-left">
                    <Settings className="w-5 h-5 text-yellow-400" />
                    <div>
                      <p className="text-white font-medium">Configure Automation</p>
                      <p className="text-gray-400 text-sm">Customize automation rules</p>
                    </div>
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        )}

        {activeTab === 'scheduling' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <SmartScheduling 
              meetingId="demo-meeting-id"
              onScheduleSuccess={(meetingId, calendarEventId) => {
                console.log('Meeting scheduled:', { meetingId, calendarEventId });
                loadStats(); // Refresh stats
              }}
            />
          </motion.div>
        )}

        {activeTab === 'analytics' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="space-y-6">
              {/* Analytics Overview */}
              <div className="bg-gray-900/50 rounded-lg p-6 border border-gray-800">
                <h3 className="text-lg font-semibold text-white mb-4">Automation Performance</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-400 mb-2">94.2%</div>
                    <div className="text-sm text-gray-400">AI Accuracy</div>
                    <div className="text-xs text-green-400 mt-1">+2.1% this month</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-400 mb-2">12.5h</div>
                    <div className="text-sm text-gray-400">Time Saved/Week</div>
                    <div className="text-xs text-green-400 mt-1">+15% improvement</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-3xl font-bold text-yellow-400 mb-2">$5,400</div>
                    <div className="text-sm text-gray-400">Cost Savings/Month</div>
                    <div className="text-xs text-green-400 mt-1">ROI: 340%</div>
                  </div>
                </div>
              </div>

              {/* Quick Analytics Links */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-900/50 rounded-lg p-6 border border-gray-800">
                  <h4 className="text-md font-semibold text-white mb-3">Quick Insights</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Meetings Automated</span>
                      <span className="text-white font-medium">89</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Emails Sent</span>
                      <span className="text-white font-medium">156</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Action Items Extracted</span>
                      <span className="text-white font-medium">1,847</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-900/50 rounded-lg p-6 border border-gray-800">
                  <h4 className="text-md font-semibold text-white mb-3">System Health</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Uptime</span>
                      <span className="text-green-400 font-medium">99.8%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Response Time</span>
                      <span className="text-blue-400 font-medium">&lt; 2s</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Success Rate</span>
                      <span className="text-green-400 font-medium">97.3%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Link to Full Analytics */}
              <div className="text-center">
                <a
                  href="/analytics"
                  className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <BarChart3 className="w-5 h-5" />
                  <span>View Detailed Analytics</span>
                </a>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'settings' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-900/50 rounded-lg p-6 border border-gray-800"
          >
            <h3 className="text-lg font-semibold text-white mb-4">Automation Settings</h3>
            <p className="text-gray-400">Configure automation rules and preferences...</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AutomationDashboard;