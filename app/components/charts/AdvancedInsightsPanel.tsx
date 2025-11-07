'use client';

import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  Info,
  Lightbulb,
  Target,
  Users
} from 'lucide-react';

interface InsightData {
  type: 'success' | 'warning' | 'info' | 'recommendation';
  title: string;
  description: string;
  value?: string;
  trend?: 'up' | 'down' | 'neutral';
  priority: 'high' | 'medium' | 'low';
}

interface AdvancedInsightsPanelProps {
  insights: InsightData[];
  title: string;
}

export default function AdvancedInsightsPanel({ insights, title }: AdvancedInsightsPanelProps) {
  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-emerald-400" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-400" />;
      case 'recommendation':
        return <Lightbulb className="w-5 h-5 text-purple-400" />;
      default:
        return <Info className="w-5 h-5 text-zinc-400" />;
    }
  };

  const getTrendIcon = (trend?: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-emerald-400" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-400" />;
      default:
        return null;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-400 bg-red-400/5';
      case 'medium':
        return 'border-l-yellow-400 bg-yellow-400/5';
      case 'low':
        return 'border-l-blue-400 bg-blue-400/5';
      default:
        return 'border-l-zinc-400 bg-zinc-400/5';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'text-emerald-400';
      case 'warning':
        return 'text-yellow-400';
      case 'info':
        return 'text-blue-400';
      case 'recommendation':
        return 'text-purple-400';
      default:
        return 'text-zinc-400';
    }
  };

  const groupedInsights = insights.reduce((acc, insight) => {
    const priority = insight.priority;
    if (!acc[priority]) acc[priority] = [];
    acc[priority].push(insight);
    return acc;
  }, {} as Record<string, InsightData[]>);

  const priorityOrder = ['high', 'medium', 'low'];

  return (
    <div className="bg-linear-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <Target className="w-6 h-6 text-emerald-400" />
        <h3 className="text-lg font-semibold text-white">{title}</h3>
      </div>

      {/* Priority Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-3 bg-red-400/10 border border-red-400/20 rounded-lg">
          <div className="text-lg font-bold text-red-400">
            {groupedInsights.high?.length || 0}
          </div>
          <div className="text-xs text-zinc-400">High Priority</div>
        </div>
        <div className="text-center p-3 bg-yellow-400/10 border border-yellow-400/20 rounded-lg">
          <div className="text-lg font-bold text-yellow-400">
            {groupedInsights.medium?.length || 0}
          </div>
          <div className="text-xs text-zinc-400">Medium Priority</div>
        </div>
        <div className="text-center p-3 bg-blue-400/10 border border-blue-400/20 rounded-lg">
          <div className="text-lg font-bold text-blue-400">
            {groupedInsights.low?.length || 0}
          </div>
          <div className="text-xs text-zinc-400">Low Priority</div>
        </div>
      </div>

      {/* Insights by Priority */}
      <div className="space-y-6">
        {priorityOrder.map((priority) => {
          const priorityInsights = groupedInsights[priority];
          if (!priorityInsights || priorityInsights.length === 0) return null;

          return (
            <div key={priority}>
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-3 h-3 rounded-full ${
                  priority === 'high' ? 'bg-red-400' :
                  priority === 'medium' ? 'bg-yellow-400' :
                  'bg-blue-400'
                }`}></div>
                <h4 className="text-sm font-medium text-white capitalize">
                  {priority} Priority Insights
                </h4>
              </div>

              <div className="space-y-3">
                {priorityInsights.map((insight, index) => (
                  <motion.div
                    key={index}
                    className={`p-4 rounded-lg border-l-4 ${getPriorityColor(insight.priority)}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex items-start gap-3">
                      {getInsightIcon(insight.type)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h5 className={`font-medium ${getTypeColor(insight.type)}`}>
                            {insight.title}
                          </h5>
                          {insight.trend && getTrendIcon(insight.trend)}
                          {insight.value && (
                            <span className="text-xs bg-zinc-700 px-2 py-1 rounded text-zinc-300">
                              {insight.value}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-zinc-300">
                          {insight.description}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Action Items Summary */}
      <div className="mt-6 pt-4 border-t border-zinc-700">
        <div className="flex items-center gap-2 mb-3">
          <Users className="w-4 h-4 text-emerald-400" />
          <span className="text-sm font-medium text-white">Recommended Actions</span>
        </div>
        <div className="grid gap-2 text-sm">
          <div className="flex items-center gap-2 text-zinc-300">
            <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
            <span>Address high-priority issues first</span>
          </div>
          <div className="flex items-center gap-2 text-zinc-300">
            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
            <span>Monitor sentiment trends closely</span>
          </div>
          <div className="flex items-center gap-2 text-zinc-300">
            <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
            <span>Implement recommended improvements</span>
          </div>
        </div>
      </div>
    </div>
  );
}