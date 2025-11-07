'use client';

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MetricCardData {
  label: string;
  value: number;
  previousValue?: number;
  format: 'percentage' | 'number' | 'time' | 'currency';
  trend?: 'up' | 'down' | 'neutral';
  color?: string;
  target?: number;
}

interface MetricsDashboardProps {
  metrics: MetricCardData[];
  title: string;
  columns?: number;
}

export default function MetricsDashboard({ 
  metrics, 
  title, 
  columns = 4 
}: MetricsDashboardProps) {
  
  const formatValue = (value: number, format: string) => {
    switch (format) {
      case 'percentage':
        return `${value}%`;
      case 'number':
        return value.toLocaleString();
      case 'time':
        return `${Math.floor(value / 60)}h ${value % 60}m`;
      case 'currency':
        return `$${value.toLocaleString()}`;
      default:
        return value.toString();
    }
  };

  const getTrendIcon = (trend?: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-emerald-400" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-400" />;
      default:
        return <Minus className="w-4 h-4 text-zinc-400" />;
    }
  };

  const getTrendChange = (current: number, previous?: number) => {
    if (!previous) return null;
    const change = ((current - previous) / previous) * 100;
    return {
      value: Math.abs(change),
      positive: change >= 0
    };
  };

  const getProgressColor = (value: number, target?: number, color?: string) => {
    if (color) return color;
    if (!target) return '#10b981';
    
    const percentage = (value / target) * 100;
    if (percentage >= 90) return '#10b981';
    if (percentage >= 70) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div className="bg-linear-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-white mb-6">{title}</h3>
      
      <div 
        className="grid gap-4"
        style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
      >
        {metrics.map((metric, index) => {
          const trendChange = getTrendChange(metric.value, metric.previousValue);
          const progressColor = getProgressColor(metric.value, metric.target, metric.color);
          const progressPercentage = metric.target 
            ? Math.min((metric.value / metric.target) * 100, 100)
            : 100;

          return (
            <motion.div
              key={index}
              className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4 hover:border-zinc-600 transition-all"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-zinc-400 text-sm font-medium">
                  {metric.label}
                </span>
                {metric.trend && getTrendIcon(metric.trend)}
              </div>

              {/* Main Value */}
              <div className="mb-3">
                <div className="text-2xl font-bold text-white mb-1">
                  {formatValue(metric.value, metric.format)}
                </div>
                
                {/* Trend Change */}
                {trendChange && (
                  <div className={`text-xs flex items-center gap-1 ${
                    trendChange.positive ? 'text-emerald-400' : 'text-red-400'
                  }`}>
                    <span>{trendChange.positive ? '+' : '-'}{trendChange.value.toFixed(1)}%</span>
                    <span className="text-zinc-500">vs previous</span>
                  </div>
                )}
              </div>

              {/* Progress Bar */}
              <div className="relative">
                <div className="w-full bg-zinc-700 rounded-full h-2 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: progressColor }}
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercentage}%` }}
                    transition={{ duration: 1, delay: index * 0.1 + 0.5 }}
                  />
                </div>
                
                {/* Target indicator */}
                {metric.target && (
                  <div className="flex justify-between text-xs text-zinc-500 mt-1">
                    <span>0</span>
                    <span>Target: {formatValue(metric.target, metric.format)}</span>
                  </div>
                )}
              </div>

              {/* Achievement badge */}
              {metric.target && metric.value >= metric.target && (
                <motion.div
                  className="absolute top-2 right-2 bg-emerald-400 text-black text-xs px-2 py-1 rounded-full font-medium"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.1 + 1 }}
                >
                  Goal Achieved!
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Summary Stats */}
      <div className="mt-6 grid grid-cols-3 gap-4 pt-4 border-t border-zinc-700">
        <div className="text-center">
          <div className="text-sm text-zinc-400 mb-1">Metrics Improving</div>
          <div className="text-lg font-bold text-emerald-400">
            {metrics.filter(m => m.trend === 'up').length}
          </div>
        </div>
        <div className="text-center">
          <div className="text-sm text-zinc-400 mb-1">Targets Met</div>
          <div className="text-lg font-bold text-blue-400">
            {metrics.filter(m => m.target && m.value >= m.target).length}
          </div>
        </div>
        <div className="text-center">
          <div className="text-sm text-zinc-400 mb-1">Total Metrics</div>
          <div className="text-lg font-bold text-white">
            {metrics.length}
          </div>
        </div>
      </div>
    </div>
  );
}