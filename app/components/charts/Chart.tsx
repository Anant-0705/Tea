'use client';

import { motion } from 'framer-motion';

interface ChartProps {
  data: Array<{
    timestamp: string;
    value: number;
    speaker?: string;
    color?: string;
  }>;
  title: string;
  type: 'line' | 'bar' | 'area';
  height?: number;
  showLegend?: boolean;
  valueFormatter?: (value: number) => string;
}

export default function Chart({ 
  data, 
  title, 
  type = 'bar', 
  height = 200, 
  showLegend = false,
  valueFormatter = (value) => `${value}%`
}: ChartProps) {
  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  const range = maxValue - minValue;

  const getColor = (value: number, speaker?: string) => {
    if (speaker) {
      // Different colors for different speakers
      const colors = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444'];
      const hash = speaker.split('').reduce((a, b) => {
        a = ((a << 5) - a) + b.charCodeAt(0);
        return a & a;
      }, 0);
      return colors[Math.abs(hash) % colors.length];
    }
    
    // Sentiment-based colors
    if (value >= 80) return '#10b981'; // emerald
    if (value >= 60) return '#f59e0b'; // yellow
    return '#ef4444'; // red
  };

  const renderBar = (item: typeof data[0], index: number) => {
    const heightPercent = ((item.value - minValue) / range) * 100;
    const color = item.color || getColor(item.value, item.speaker);
    
    return (
      <motion.div
        key={index}
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: `${heightPercent}%`, opacity: 1 }}
        transition={{ delay: index * 0.1, duration: 0.5 }}
        className="flex flex-col items-center gap-2 relative group"
        style={{ minWidth: '40px' }}
      >
        {/* Tooltip */}
        <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
          {item.speaker && <div className="font-medium">{item.speaker}</div>}
          <div>{item.timestamp}: {valueFormatter(item.value)}</div>
        </div>
        
        {/* Bar */}
        <div
          className="w-6 rounded-t border-2 border-opacity-40"
          style={{ 
            backgroundColor: `${color}20`,
            borderColor: `${color}60`,
            height: `${heightPercent}%`,
            minHeight: '4px'
          }}
        />
        
        {/* Label */}
        <span className="text-xs text-zinc-400 transform -rotate-45 origin-top-left">
          {item.timestamp}
        </span>
      </motion.div>
    );
  };

  const renderLine = (item: typeof data[0], index: number) => {
    const heightPercent = 100 - ((item.value - minValue) / range) * 100;
    const color = item.color || getColor(item.value, item.speaker);
    
    return (
      <motion.div
        key={index}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        className="absolute group"
        style={{ 
          left: `${(index / (data.length - 1)) * 100}%`,
          top: `${heightPercent}%`,
          transform: 'translate(-50%, -50%)'
        }}
      >
        {/* Tooltip */}
        <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
          {item.speaker && <div className="font-medium">{item.speaker}</div>}
          <div>{item.timestamp}: {valueFormatter(item.value)}</div>
        </div>
        
        {/* Point */}
        <div
          className="w-3 h-3 rounded-full border-2"
          style={{ 
            backgroundColor: color,
            borderColor: `${color}80`
          }}
        />
      </motion.div>
    );
  };

  const speakers = [...new Set(data.map(d => d.speaker).filter(Boolean))];

  return (
    <div className="bg-linear-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        {showLegend && speakers.length > 0 && (
          <div className="flex gap-4 text-sm">
            {speakers.map((speaker) => (
              <div key={speaker} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: getColor(0, speaker) }}
                />
                <span className="text-zinc-400">{speaker}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="relative" style={{ height: `${height}px` }}>
        {type === 'bar' && (
          <div className="h-full flex items-end justify-between gap-2">
            {data.map((item, index) => renderBar(item, index))}
          </div>
        )}

        {type === 'line' && (
          <>
            {/* Grid lines */}
            <div className="absolute inset-0">
              {[0, 25, 50, 75, 100].map((percent) => (
                <div
                  key={percent}
                  className="absolute w-full border-t border-zinc-800"
                  style={{ top: `${percent}%` }}
                />
              ))}
            </div>
            
            {/* Line path */}
            <svg className="absolute inset-0 w-full h-full">
              <path
                d={data.map((item, index) => {
                  const x = (index / (data.length - 1)) * 100;
                  const y = 100 - ((item.value - minValue) / range) * 100;
                  return `${index === 0 ? 'M' : 'L'} ${x}% ${y}%`;
                }).join(' ')}
                stroke="#10b981"
                strokeWidth="2"
                fill="none"
                className="opacity-80"
              />
            </svg>
            
            {/* Points */}
            {data.map((item, index) => renderLine(item, index))}
          </>
        )}

        {type === 'area' && (
          <>
            {/* Area fill */}
            <svg className="absolute inset-0 w-full h-full">
              <path
                d={`
                  M 0% 100%
                  ${data.map((item, index) => {
                    const x = (index / (data.length - 1)) * 100;
                    const y = 100 - ((item.value - minValue) / range) * 100;
                    return `L ${x}% ${y}%`;
                  }).join(' ')}
                  L 100% 100%
                  Z
                `}
                fill="url(#gradient)"
                className="opacity-40"
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#10b98100" />
                </linearGradient>
              </defs>
            </svg>
            
            {/* Line */}
            <svg className="absolute inset-0 w-full h-full">
              <path
                d={data.map((item, index) => {
                  const x = (index / (data.length - 1)) * 100;
                  const y = 100 - ((item.value - minValue) / range) * 100;
                  return `${index === 0 ? 'M' : 'L'} ${x}% ${y}%`;
                }).join(' ')}
                stroke="#10b981"
                strokeWidth="2"
                fill="none"
              />
            </svg>
            
            {/* Points */}
            {data.map((item, index) => renderLine(item, index))}
          </>
        )}
      </div>

      {/* Y-axis labels */}
      <div className="flex justify-between text-xs text-zinc-400 mt-4">
        <span>{valueFormatter(minValue)}</span>
        <span>{valueFormatter(Math.round((minValue + maxValue) / 2))}</span>
        <span>{valueFormatter(maxValue)}</span>
      </div>
    </div>
  );
}