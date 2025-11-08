'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import AdvancedAnalytics from '../components/analytics/AdvancedAnalytics';
import AnalyticsChart from '../components/analytics/AnalyticsChart';
import AnalyticsInsights from '../components/analytics/AnalyticsInsights';
import { 
  TrendingUp, 
  Calendar, 
  Users, 
  Target,
  Brain,
  BarChart3,
  Activity,
  Settings,
  Download,
  Filter,
  RefreshCw
} from 'lucide-react';

interface AnalyticsData {
  overview: {
    totalMeetings: number;
    totalParticipants: number;
    avgMeetingDuration: number;
    actionItemsGenerated: number;
    completionRate: number;
    productivityScore: number;
  };
  trends: {
    meetingsOverTime: Array<{ date: string; count: number; duration: number }>;
    sentimentTrends: Array<{ date: string; positive: number; neutral: number; negative: number }>;
    actionItemTrends: Array<{ date: string; created: number; completed: number }>;
    participationTrends: Array<{ date: string; participants: number; engagement: number }>;
  };
}

export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [timeRange, setTimeRange] = useState('30d');
  const [activeView, setActiveView] = useState<'overview' | 'detailed' | 'charts' | 'insights'>('overview');
  const [loading, setLoading] = useState(true);

  // Load analytics data
  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/analytics/dashboard?timeRange=${timeRange}`);
      const data = await response.json();
      
      if (data.success) {
        setAnalyticsData(data.analytics);
      }
    } catch (error) {
      // Error handling without console logging
    }
    setLoading(false);
  };

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const views = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'detailed', label: 'Detailed Analytics', icon: TrendingUp },
    { id: 'charts', label: 'Charts & Trends', icon: Activity },
    { id: 'insights', label: 'AI Insights', icon: Brain },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg">
              <BarChart3 className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-black">Analytics Hub</h1>
              <p className="text-gray-600">Comprehensive insights and performance metrics</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 bg-white text-gray-700 rounded-lg border border-gray-300 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="1y">Last Year</option>
            </select>
            
            <button
              onClick={loadAnalytics}
              className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors flex items-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
            
            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2 border border-gray-200">
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex space-x-1 bg-gray-50 rounded-lg p-1 border border-gray-200">
          {views.map((view) => {
            const Icon = view.icon;
            return (
              <button
                key={view.id}
                onClick={() => setActiveView(view.id as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                  activeView === view.id
                    ? 'bg-emerald-500 text-white'
                    : 'text-gray-600 hover:text-black hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{view.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        {activeView === 'overview' && analyticsData && (
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg p-6 border border-gray-200 shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Total Meetings</p>
                    <p className="text-3xl font-bold text-black">{analyticsData.overview.totalMeetings}</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Calendar className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="text-sm text-green-600">+12% from last period</div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-lg p-6 border border-gray-200 shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Participants</p>
                    <p className="text-3xl font-bold text-black">{analyticsData.overview.totalParticipants}</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-lg">
                    <Users className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="text-sm text-green-600">+8% engagement</div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-lg p-6 border border-gray-200 shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Action Items</p>
                    <p className="text-3xl font-bold text-black">{analyticsData.overview.actionItemsGenerated}</p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Target className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="text-sm text-green-600">+25% efficiency</div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-lg p-6 border border-gray-200 shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Completion Rate</p>
                    <p className="text-3xl font-bold text-black">{analyticsData.overview.completionRate}%</p>
                  </div>
                  <div className="p-3 bg-yellow-100 rounded-lg">
                    <Brain className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="text-sm text-green-600">Industry leading</div>
                </div>
              </motion.div>
            </div>

            {/* Mini Charts Preview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <AnalyticsChart
                  data={analyticsData.trends.meetingsOverTime}
                  title="Meeting Activity"
                  type="area"
                  metrics={[
                    { key: 'count', label: 'Meetings', color: '#3B82F6' },
                  ]}
                  height={200}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <AnalyticsChart
                  data={analyticsData.trends.actionItemTrends}
                  title="Action Items"
                  type="bar"
                  metrics={[
                    { key: 'created', label: 'Created', color: '#10B981' },
                    { key: 'completed', label: 'Completed', color: '#8B5CF6' },
                  ]}
                  height={200}
                />
              </motion.div>
            </div>
          </div>
        )}

        {activeView === 'detailed' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <AdvancedAnalytics />
          </motion.div>
        )}

        {activeView === 'charts' && analyticsData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AnalyticsChart
                data={analyticsData.trends.meetingsOverTime}
                title="Meeting Activity Over Time"
                type="line"
                metrics={[
                  { key: 'count', label: 'Count', color: '#3B82F6' },
                  { key: 'duration', label: 'Avg Duration', color: '#10B981' },
                ]}
              />

              <AnalyticsChart
                data={analyticsData.trends.sentimentTrends}
                title="Sentiment Analysis Trends"
                type="area"
                metrics={[
                  { key: 'positive', label: 'Positive', color: '#10B981' },
                  { key: 'neutral', label: 'Neutral', color: '#F59E0B' },
                  { key: 'negative', label: 'Negative', color: '#EF4444' },
                ]}
              />

              <AnalyticsChart
                data={analyticsData.trends.actionItemTrends}
                title="Action Item Performance"
                type="bar"
                metrics={[
                  { key: 'created', label: 'Created', color: '#8B5CF6' },
                  { key: 'completed', label: 'Completed', color: '#06B6D4' },
                ]}
              />

              <AnalyticsChart
                data={analyticsData.trends.participationTrends}
                title="Participation & Engagement"
                type="line"
                metrics={[
                  { key: 'participants', label: 'Participants', color: '#F59E0B' },
                  { key: 'engagement', label: 'Engagement %', color: '#EF4444' },
                ]}
              />
            </div>
          </motion.div>
        )}

        {activeView === 'insights' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <AnalyticsInsights timeRange={timeRange} />
          </motion.div>
        )}
      </div>
    </div>
  );
}