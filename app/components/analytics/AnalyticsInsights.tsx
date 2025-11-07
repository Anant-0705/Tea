'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Brain, 
  TrendingUp, 
  Target, 
  Users, 
  Clock, 
  Calendar,
  AlertTriangle,
  CheckCircle,
  Star,
  Zap,
  BarChart3,
  PieChart,
  Activity,
  Award
} from 'lucide-react';

interface PredictiveInsight {
  id: string;
  type: 'trend' | 'recommendation' | 'prediction' | 'alert';
  title: string;
  description: string;
  confidence: number;
  impact: 'low' | 'medium' | 'high';
  category: 'productivity' | 'engagement' | 'efficiency' | 'quality';
  actionable: boolean;
  timeframe: string;
  metrics?: {
    current: number;
    predicted: number;
    change: number;
  };
}

interface AnalyticsInsightsProps {
  timeRange?: string;
}

const AnalyticsInsights: React.FC<AnalyticsInsightsProps> = ({ timeRange = '30d' }) => {
  const [insights, setInsights] = useState<PredictiveInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Load predictive insights
  const loadInsights = async () => {
    setLoading(true);
    try {
      // Mock insights data - in real implementation, this would come from AI analysis
      const mockInsights: PredictiveInsight[] = [
        {
          id: '1',
          type: 'prediction',
          title: 'Meeting Efficiency Will Increase 15%',
          description: 'Based on current automation trends, meeting efficiency is predicted to improve by 15% over the next month.',
          confidence: 87,
          impact: 'high',
          category: 'efficiency',
          actionable: true,
          timeframe: 'Next 30 days',
          metrics: { current: 76, predicted: 87, change: 15 },
        },
        {
          id: '2',
          type: 'recommendation',
          title: 'Optimize Meeting Duration',
          description: 'Analysis shows meetings could be 12 minutes shorter on average while maintaining the same output quality.',
          confidence: 92,
          impact: 'medium',
          category: 'productivity',
          actionable: true,
          timeframe: 'Immediate',
          metrics: { current: 42, predicted: 30, change: -28 },
        },
        {
          id: '3',
          type: 'trend',
          title: 'Action Item Completion Trending Up',
          description: 'Action item completion rates have improved by 23% over the last two weeks, indicating better engagement.',
          confidence: 95,
          impact: 'high',
          category: 'engagement',
          actionable: false,
          timeframe: 'Past 2 weeks',
          metrics: { current: 87, predicted: 91, change: 23 },
        },
        {
          id: '4',
          type: 'alert',
          title: 'Participant Engagement Decline',
          description: 'Engagement scores have dropped 8% in afternoon meetings. Consider rescheduling or reducing duration.',
          confidence: 84,
          impact: 'medium',
          category: 'engagement',
          actionable: true,
          timeframe: 'Past week',
          metrics: { current: 78, predicted: 72, change: -8 },
        },
        {
          id: '5',
          type: 'prediction',
          title: 'AI Accuracy Will Reach 96%',
          description: 'Current learning patterns suggest AI action item extraction accuracy will reach 96% within 2 weeks.',
          confidence: 89,
          impact: 'high',
          category: 'quality',
          actionable: false,
          timeframe: 'Next 2 weeks',
          metrics: { current: 94, predicted: 96, change: 2 },
        },
        {
          id: '6',
          type: 'recommendation',
          title: 'Schedule More Follow-up Meetings',
          description: 'Projects with scheduled follow-ups show 34% higher completion rates. Consider auto-scheduling follow-ups.',
          confidence: 91,
          impact: 'high',
          category: 'productivity',
          actionable: true,
          timeframe: 'Immediate',
          metrics: { current: 67, predicted: 90, change: 34 },
        },
      ];
      
      setInsights(mockInsights);
    } catch (error) {
      console.error('Failed to load insights:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadInsights();
  }, [timeRange]);

  const categories = [
    { id: 'all', label: 'All Insights', icon: Brain },
    { id: 'productivity', label: 'Productivity', icon: Target },
    { id: 'engagement', label: 'Engagement', icon: Users },
    { id: 'efficiency', label: 'Efficiency', icon: Zap },
    { id: 'quality', label: 'Quality', icon: Award },
  ];

  const filteredInsights = selectedCategory === 'all' 
    ? insights 
    : insights.filter(insight => insight.category === selectedCategory);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'prediction': return TrendingUp;
      case 'recommendation': return Target;
      case 'trend': return BarChart3;
      case 'alert': return AlertTriangle;
      default: return Brain;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'prediction': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      case 'recommendation': return 'text-green-400 bg-green-500/10 border-green-500/20';
      case 'trend': return 'text-purple-400 bg-purple-500/10 border-purple-500/20';
      case 'alert': return 'text-red-400 bg-red-500/10 border-red-500/20';
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-400';
    if (confidence >= 80) return 'text-yellow-400';
    return 'text-red-400';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-500/10 rounded-lg border border-purple-500/20">
            <Brain className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">AI Insights & Predictions</h2>
            <p className="text-gray-400 text-sm">Advanced analytics and recommendations</p>
          </div>
        </div>
        
        <div className="text-sm text-gray-400">
          {filteredInsights.length} insights found
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => {
          const Icon = category.icon;
          return (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                selectedCategory === category.id
                  ? 'bg-blue-600 border-blue-500 text-white'
                  : 'bg-gray-800/50 border-gray-700 text-gray-300 hover:bg-gray-700/50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{category.label}</span>
            </button>
          );
        })}
      </div>

      {/* Insights List */}
      <div className="space-y-4">
        {filteredInsights.map((insight, index) => {
          const TypeIcon = getTypeIcon(insight.type);
          
          return (
            <motion.div
              key={insight.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-900/50 rounded-lg p-6 border border-gray-800 hover:border-gray-700 transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg border ${getTypeColor(insight.type)}`}>
                    <TypeIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{insight.title}</h3>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className={`text-sm ${getConfidenceColor(insight.confidence)}`}>
                        {insight.confidence}% confidence
                      </span>
                      <span className={`text-sm ${getImpactColor(insight.impact)}`}>
                        {insight.impact.toUpperCase()} impact
                      </span>
                      <span className="text-sm text-gray-400">{insight.timeframe}</span>
                    </div>
                  </div>
                </div>
                
                {insight.actionable && (
                  <div className="flex items-center space-x-1 text-green-400">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-xs">Actionable</span>
                  </div>
                )}
              </div>
              
              <p className="text-gray-300 mb-4">{insight.description}</p>
              
              {insight.metrics && (
                <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-white">{insight.metrics.current}</div>
                      <div className="text-xs text-gray-400">Current</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-400">{insight.metrics.predicted}</div>
                      <div className="text-xs text-gray-400">Predicted</div>
                    </div>
                    <div>
                      <div className={`text-2xl font-bold ${insight.metrics.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {insight.metrics.change >= 0 ? '+' : ''}{insight.metrics.change}%
                      </div>
                      <div className="text-xs text-gray-400">Change</div>
                    </div>
                  </div>
                </div>
              )}
              
              {insight.actionable && (
                <div className="mt-4 flex space-x-3">
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Apply Recommendation
                  </button>
                  <button className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors">
                    Learn More
                  </button>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {filteredInsights.length === 0 && (
        <div className="text-center py-12 bg-gray-900/30 rounded-lg border border-gray-800">
          <Brain className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-400 mb-2">No Insights Available</h3>
          <p className="text-gray-500">AI insights will appear as more data becomes available.</p>
        </div>
      )}
    </div>
  );
};

export default AnalyticsInsights;