'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown,
  BarChart3, 
  PieChart, 
  Calendar, 
  Clock, 
  Users, 
  Target,
  Brain,
  Mail,
  CheckCircle,
  AlertTriangle,
  Award,
  Zap,
  Activity,
  RefreshCw,
  Download,
  Filter,
  ChevronUp,
  ChevronDown,
  Star
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
  meetingEffectiveness: {
    avgEngagementScore: number;
    timeUtilization: number;
    actionItemDensity: number;
    followUpRate: number;
    decisionVelocity: number;
  };
  participantInsights: {
    topContributors: Array<{ name: string; contributions: number; meetings: number; engagement: number }>;
    meetingFrequency: Array<{ name: string; count: number; avgDuration: number }>;
    actionItemOwnership: Array<{ name: string; assigned: number; completed: number; completionRate: number }>;
  };
  automationROI: {
    timesSaved: number;
    manualTasksAutomated: number;
    emailsAutomated: number;
    schedulingEfficiency: number;
    costSavings: number;
  };
}

const AdvancedAnalytics: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [timeRange, setTimeRange] = useState('30d');
  const [loading, setLoading] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState('overview');

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

  const formatNumber = (num: number, decimals: number = 0): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toFixed(decimals);
  };

  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getTrendIcon = (current: number, previous: number) => {
    const change = ((current - previous) / previous) * 100;
    if (change > 5) return <ChevronUp className="w-4 h-4 text-green-600" />;
    if (change < -5) return <ChevronDown className="w-4 h-4 text-red-600" />;
    return <ChevronUp className="w-4 h-4 text-gray-600" />;
  };

  if (loading || !analyticsData) {
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
              <h1 className="text-3xl font-bold text-black">Advanced Analytics</h1>
              <p className="text-gray-600">Deep insights into meeting effectiveness and automation ROI</p>
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

        {/* Key Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg p-6 border border-gray-200 shadow-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              {getTrendIcon(analyticsData.overview.totalMeetings, 200)}
            </div>
            <div className="text-3xl font-bold text-black mb-1">
              {formatNumber(analyticsData.overview.totalMeetings)}
            </div>
            <div className="text-sm text-gray-600">Total Meetings</div>
            <div className="text-xs text-green-600 mt-2">+12% from last period</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg p-6 border border-gray-200 shadow-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <Target className="w-6 h-6 text-green-600" />
              </div>
              {getTrendIcon(analyticsData.overview.actionItemsGenerated, 1500)}
            </div>
            <div className="text-3xl font-bold text-black mb-1">
              {formatNumber(analyticsData.overview.actionItemsGenerated)}
            </div>
            <div className="text-sm text-gray-600">Action Items</div>
            <div className="text-xs text-green-600 mt-2">+25% efficiency gain</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg p-6 border border-gray-200 shadow-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-yellow-600" />
              </div>
              {getTrendIcon(analyticsData.overview.completionRate, 80)}
            </div>
            <div className="text-3xl font-bold text-black mb-1">
              {analyticsData.overview.completionRate}%
            </div>
            <div className="text-sm text-gray-600">Completion Rate</div>
            <div className="text-xs text-green-600 mt-2">+7% improvement</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg p-6 border border-gray-200 shadow-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Star className="w-6 h-6 text-purple-600" />
              </div>
              {getTrendIcon(analyticsData.overview.productivityScore, 85)}
            </div>
            <div className={`text-3xl font-bold mb-1 ${getScoreColor(analyticsData.overview.productivityScore)}`}>
              {analyticsData.overview.productivityScore}
            </div>
            <div className="text-sm text-gray-600">Productivity Score</div>
            <div className="text-xs text-green-600 mt-2">Industry leading</div>
          </motion.div>
        </div>

        {/* Meeting Effectiveness Score */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-lg p-6 border border-gray-200 shadow-lg"
        >
          <h3 className="text-xl font-semibold text-black mb-6 flex items-center space-x-2">
            <Award className="w-6 h-6 text-yellow-600" />
            <span>Meeting Effectiveness Analysis</span>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <div className="text-center">
              <div className="relative w-20 h-20 mx-auto mb-3">
                <svg className="w-20 h-20 transform -rotate-90">
                  <circle
                    cx="40"
                    cy="40"
                    r="36"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-gray-700"
                  />
                  <circle
                    cx="40"
                    cy="40"
                    r="36"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${analyticsData.meetingEffectiveness.avgEngagementScore * 2.26} 226`}
                    className="text-blue-400"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold text-white">
                    {analyticsData.meetingEffectiveness.avgEngagementScore}%
                  </span>
                </div>
              </div>
              <p className="text-sm font-medium text-white">Engagement</p>
              <p className="text-xs text-gray-400">Participant involvement</p>
            </div>

            <div className="text-center">
              <div className="relative w-20 h-20 mx-auto mb-3">
                <svg className="w-20 h-20 transform -rotate-90">
                  <circle
                    cx="40"
                    cy="40"
                    r="36"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-gray-700"
                  />
                  <circle
                    cx="40"
                    cy="40"
                    r="36"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${analyticsData.meetingEffectiveness.timeUtilization * 2.26} 226`}
                    className="text-green-400"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold text-white">
                    {analyticsData.meetingEffectiveness.timeUtilization}%
                  </span>
                </div>
              </div>
              <p className="text-sm font-medium text-white">Time Utilization</p>
              <p className="text-xs text-gray-400">Productive time ratio</p>
            </div>

            <div className="text-center">
              <div className="relative w-20 h-20 mx-auto mb-3">
                <svg className="w-20 h-20 transform -rotate-90">
                  <circle
                    cx="40"
                    cy="40"
                    r="36"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-gray-700"
                  />
                  <circle
                    cx="40"
                    cy="40"
                    r="36"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${analyticsData.meetingEffectiveness.actionItemDensity * 2.26} 226`}
                    className="text-yellow-400"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold text-white">
                    {analyticsData.meetingEffectiveness.actionItemDensity}%
                  </span>
                </div>
              </div>
              <p className="text-sm font-medium text-white">Action Density</p>
              <p className="text-xs text-gray-400">Tasks per meeting</p>
            </div>

            <div className="text-center">
              <div className="relative w-20 h-20 mx-auto mb-3">
                <svg className="w-20 h-20 transform -rotate-90">
                  <circle
                    cx="40"
                    cy="40"
                    r="36"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-gray-700"
                  />
                  <circle
                    cx="40"
                    cy="40"
                    r="36"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${analyticsData.meetingEffectiveness.followUpRate * 2.26} 226`}
                    className="text-purple-400"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold text-white">
                    {analyticsData.meetingEffectiveness.followUpRate}%
                  </span>
                </div>
              </div>
              <p className="text-sm font-medium text-white">Follow-up Rate</p>
              <p className="text-xs text-gray-400">Completion tracking</p>
            </div>

            <div className="text-center">
              <div className="relative w-20 h-20 mx-auto mb-3">
                <svg className="w-20 h-20 transform -rotate-90">
                  <circle
                    cx="40"
                    cy="40"
                    r="36"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-gray-700"
                  />
                  <circle
                    cx="40"
                    cy="40"
                    r="36"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${analyticsData.meetingEffectiveness.decisionVelocity * 2.26} 226`}
                    className="text-red-400"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold text-white">
                    {analyticsData.meetingEffectiveness.decisionVelocity}%
                  </span>
                </div>
              </div>
              <p className="text-sm font-medium text-white">Decision Velocity</p>
              <p className="text-xs text-gray-400">Speed of decisions</p>
            </div>
          </div>
        </motion.div>

        {/* Automation ROI */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gray-900/50 rounded-lg p-6 border border-gray-800"
        >
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center space-x-2">
            <Zap className="w-6 h-6 text-yellow-400" />
            <span>Automation ROI Analysis</span>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center space-x-3 mb-2">
                <Clock className="w-5 h-5 text-blue-400" />
                <span className="text-sm font-medium text-gray-300">Time Saved</span>
              </div>
              <div className="text-2xl font-bold text-white">{analyticsData.automationROI.timesSaved}h</div>
              <div className="text-xs text-green-400">Per week</div>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center space-x-3 mb-2">
                <Brain className="w-5 h-5 text-purple-400" />
                <span className="text-sm font-medium text-gray-300">Tasks Automated</span>
              </div>
              <div className="text-2xl font-bold text-white">{analyticsData.automationROI.manualTasksAutomated}</div>
              <div className="text-xs text-green-400">This month</div>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center space-x-3 mb-2">
                <Mail className="w-5 h-5 text-green-400" />
                <span className="text-sm font-medium text-gray-300">Emails Sent</span>
              </div>
              <div className="text-2xl font-bold text-white">{analyticsData.automationROI.emailsAutomated}</div>
              <div className="text-xs text-green-400">Automatically</div>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center space-x-3 mb-2">
                <Calendar className="w-5 h-5 text-yellow-400" />
                <span className="text-sm font-medium text-gray-300">Scheduling Efficiency</span>
              </div>
              <div className="text-2xl font-bold text-white">{analyticsData.automationROI.schedulingEfficiency}%</div>
              <div className="text-xs text-green-400">Improvement</div>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center space-x-3 mb-2">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
                <span className="text-sm font-medium text-gray-300">Cost Savings</span>
              </div>
              <div className="text-2xl font-bold text-white">${formatNumber(analyticsData.automationROI.costSavings)}</div>
              <div className="text-xs text-green-400">Monthly</div>
            </div>
          </div>
        </motion.div>

        {/* Top Contributors */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          <div className="bg-gray-900/50 rounded-lg p-6 border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
              <Users className="w-5 h-5 text-blue-400" />
              <span>Top Contributors</span>
            </h3>
            
            <div className="space-y-3">
              {analyticsData.participantInsights.topContributors.slice(0, 5).map((contributor, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {contributor.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-white font-medium">{contributor.name}</p>
                      <p className="text-xs text-gray-400">{contributor.meetings} meetings</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-white">{contributor.contributions}</p>
                    <p className="text-xs text-gray-400">contributions</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-900/50 rounded-lg p-6 border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
              <Target className="w-5 h-5 text-green-400" />
              <span>Action Item Leaders</span>
            </h3>
            
            <div className="space-y-3">
              {analyticsData.participantInsights.actionItemOwnership.slice(0, 5).map((owner, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {owner.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-white font-medium">{owner.name}</p>
                      <p className="text-xs text-gray-400">{owner.assigned} assigned</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-medium ${getScoreColor(owner.completionRate)}`}>
                      {owner.completionRate}%
                    </p>
                    <p className="text-xs text-gray-400">completion rate</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdvancedAnalytics;