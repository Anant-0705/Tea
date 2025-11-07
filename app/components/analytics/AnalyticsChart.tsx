'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface ChartDataPoint {
  date: string;
  [key: string]: number | string;
}

interface AnalyticsChartProps {
  data: ChartDataPoint[];
  title: string;
  type: 'line' | 'bar' | 'area';
  metrics: Array<{
    key: string;
    label: string;
    color: string;
  }>;
  height?: number;
}

const AnalyticsChart: React.FC<AnalyticsChartProps> = ({
  data,
  title,
  type,
  metrics,
  height = 300,
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-gray-900/50 rounded-lg p-6 border border-gray-800">
        <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
        <div className="flex items-center justify-center h-64 text-gray-400">
          No data available
        </div>
      </div>
    );
  }

  // Calculate max values for scaling
  const maxValues = metrics.reduce((acc, metric) => {
    acc[metric.key] = Math.max(...data.map(d => Number(d[metric.key]) || 0));
    return acc;
  }, {} as Record<string, number>);

  const globalMax = Math.max(...Object.values(maxValues));

  // Generate chart points for line/area charts
  const generatePath = (metricKey: string) => {
    const points = data.map((d, index) => {
      const x = (index / (data.length - 1)) * 100;
      const y = 100 - ((Number(d[metricKey]) || 0) / globalMax) * 80; // 80% of height for data, 20% for padding
      return `${x},${y}`;
    });
    
    if (type === 'area') {
      return `M 0,100 L ${points.join(' L ')} L 100,100 Z`;
    }
    return `M ${points.join(' L ')}`;
  };

  // Generate bars for bar chart
  const generateBars = () => {
    const barWidth = 80 / data.length;
    const spacing = 20 / (data.length + 1);
    
    return data.map((d, index) => {
      const x = spacing + index * (barWidth + spacing);
      
      return metrics.map((metric, metricIndex) => {
        const value = Number(d[metric.key]) || 0;
        const height = (value / globalMax) * 80;
        const y = 100 - height;
        const barX = x + (metricIndex * barWidth) / metrics.length;
        const singleBarWidth = barWidth / metrics.length * 0.8;
        
        return (
          <rect
            key={`${index}-${metricIndex}`}
            x={`${barX}%`}
            y={`${y}%`}
            width={`${singleBarWidth}%`}
            height={`${height}%`}
            fill={metric.color}
            opacity={0.8}
          />
        );
      });
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-900/50 rounded-lg p-6 border border-gray-800"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <div className="flex items-center space-x-4">
          {metrics.map((metric) => (
            <div key={metric.key} className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: metric.color }}
              />
              <span className="text-sm text-gray-300">{metric.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="relative" style={{ height: `${height}px` }}>
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="overflow-visible"
        >
          {/* Grid lines */}
          <defs>
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#374151" strokeWidth="0.2"/>
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#grid)" opacity="0.3" />

          {/* Chart content */}
          {type === 'bar' ? (
            generateBars()
          ) : (
            metrics.map((metric) => (
              <g key={metric.key}>
                {type === 'area' && (
                  <path
                    d={generatePath(metric.key)}
                    fill={metric.color}
                    opacity={0.2}
                  />
                )}
                <path
                  d={generatePath(metric.key)}
                  fill="none"
                  stroke={metric.color}
                  strokeWidth="0.5"
                  opacity={0.8}
                />
                {/* Data points */}
                {data.map((d, index) => {
                  const x = (index / (data.length - 1)) * 100;
                  const y = 100 - ((Number(d[metric.key]) || 0) / globalMax) * 80;
                  return (
                    <circle
                      key={index}
                      cx={x}
                      cy={y}
                      r="0.8"
                      fill={metric.color}
                      opacity={0.9}
                    />
                  );
                })}
              </g>
            ))
          )}
        </svg>

        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-400 -ml-12">
          <span>{Math.round(globalMax)}</span>
          <span>{Math.round(globalMax * 0.75)}</span>
          <span>{Math.round(globalMax * 0.5)}</span>
          <span>{Math.round(globalMax * 0.25)}</span>
          <span>0</span>
        </div>

        {/* X-axis labels */}
        <div className="absolute bottom-0 left-0 w-full flex justify-between text-xs text-gray-400 mt-2">
          {data.length <= 7 ? (
            data.map((d, index) => (
              <span key={index} className="text-center">
                {new Date(d.date).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </span>
            ))
          ) : (
            <>
              <span>
                {new Date(data[0].date).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </span>
              <span>
                {new Date(data[Math.floor(data.length / 2)].date).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </span>
              <span>
                {new Date(data[data.length - 1].date).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Summary stats */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        {metrics.map((metric) => {
          const values = data.map(d => Number(d[metric.key]) || 0);
          const total = values.reduce((a, b) => a + b, 0);
          const avg = total / values.length;
          const trend = values.length > 1 ? 
            ((values[values.length - 1] - values[0]) / values[0] * 100) : 0;
          
          return (
            <div key={metric.key} className="text-center">
              <div className="text-lg font-bold text-white">
                {avg.toFixed(1)}
              </div>
              <div className="text-xs text-gray-400">{metric.label} Avg</div>
              <div className={`text-xs ${trend >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {trend >= 0 ? '+' : ''}{trend.toFixed(1)}%
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default AnalyticsChart;