'use client';

import { motion } from 'framer-motion';

interface ChartProps {
  data: Array<{
    timestamp: string;
    value: number;
    speaker?: string;
    color?: string;
    category?: string;
    secondary?: number;
  }>;
  title: string;
  type: 'line' | 'bar' | 'area' | 'donut' | 'heatmap' | 'radar' | 'scatter';
  height?: number;
  showLegend?: boolean;
  valueFormatter?: (value: number) => string;
  showGrid?: boolean;
  animated?: boolean;
}

export default function Chart({ 
  data, 
  title, 
  type = 'bar', 
  height = 200, 
  showLegend = false,
  valueFormatter = (value) => `${value}%`,
  showGrid = true,
  animated = true
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

  const renderDonut = () => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    let currentAngle = 0;
    const radius = Math.min(height, 300) / 2 - 20;
    const centerX = 150;
    const centerY = height / 2;

    return (
      <div className="flex items-center justify-center">
        <svg width="300" height={height} className="overflow-visible">
          {data.map((item, index) => {
            const percentage = item.value / total;
            const angle = percentage * 360;
            const startAngle = currentAngle;
            const endAngle = currentAngle + angle;
            
            const x1 = centerX + radius * Math.cos((startAngle * Math.PI) / 180);
            const y1 = centerY + radius * Math.sin((startAngle * Math.PI) / 180);
            const x2 = centerX + radius * Math.cos((endAngle * Math.PI) / 180);
            const y2 = centerY + radius * Math.sin((endAngle * Math.PI) / 180);
            
            const largeArcFlag = angle > 180 ? 1 : 0;
            const color = item.color || getColor(item.value, item.speaker);
            
            const pathData = [
              `M ${centerX} ${centerY}`,
              `L ${x1} ${y1}`,
              `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
              'Z'
            ].join(' ');
            
            currentAngle += angle;
            
            return (
              <motion.path
                key={index}
                d={pathData}
                fill={color}
                stroke="#18181b"
                strokeWidth="2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: animated ? index * 0.1 : 0 }}
                className="hover:opacity-80 transition-opacity cursor-pointer"
              />
            );
          })}
          
          {/* Center circle */}
          <circle
            cx={centerX}
            cy={centerY}
            r={radius * 0.4}
            fill="#18181b"
            stroke="#27272a"
            strokeWidth="2"
          />
          
          {/* Center text */}
          <text
            x={centerX}
            y={centerY - 5}
            textAnchor="middle"
            className="fill-white text-sm font-medium"
          >
            Total
          </text>
          <text
            x={centerX}
            y={centerY + 15}
            textAnchor="middle"
            className="fill-zinc-400 text-xs"
          >
            {total}
          </text>
        </svg>
      </div>
    );
  };

  const renderRadar = () => {
    const categories = [...new Set(data.map(d => d.category || d.timestamp))];
    const maxValue = Math.max(...data.map(d => d.value));
    const centerX = 150;
    const centerY = height / 2;
    const radius = Math.min(height, 250) / 2 - 40;
    
    const angleStep = (2 * Math.PI) / categories.length;
    
    return (
      <div className="flex items-center justify-center">
        <svg width="300" height={height} className="overflow-visible">
          {/* Grid circles */}
          {[0.2, 0.4, 0.6, 0.8, 1].map((scale, index) => (
            <circle
              key={index}
              cx={centerX}
              cy={centerY}
              r={radius * scale}
              fill="none"
              stroke="#27272a"
              strokeWidth="1"
              opacity="0.3"
            />
          ))}
          
          {/* Grid lines */}
          {categories.map((_, index) => {
            const angle = index * angleStep - Math.PI / 2;
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);
            
            return (
              <line
                key={index}
                x1={centerX}
                y1={centerY}
                x2={x}
                y2={y}
                stroke="#27272a"
                strokeWidth="1"
                opacity="0.3"
              />
            );
          })}
          
          {/* Data polygon */}
          <motion.polygon
            points={data.map((item, index) => {
              const angle = index * angleStep - Math.PI / 2;
              const distance = (item.value / maxValue) * radius;
              const x = centerX + distance * Math.cos(angle);
              const y = centerY + distance * Math.sin(angle);
              return `${x},${y}`;
            }).join(' ')}
            fill="rgba(16, 185, 129, 0.2)"
            stroke="#10b981"
            strokeWidth="2"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: animated ? 0.8 : 0 }}
          />
          
          {/* Data points */}
          {data.map((item, index) => {
            const angle = index * angleStep - Math.PI / 2;
            const distance = (item.value / maxValue) * radius;
            const x = centerX + distance * Math.cos(angle);
            const y = centerY + distance * Math.sin(angle);
            
            return (
              <motion.circle
                key={index}
                cx={x}
                cy={y}
                r="4"
                fill="#10b981"
                stroke="#065f46"
                strokeWidth="2"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: animated ? index * 0.1 : 0 }}
                className="hover:r-6 transition-all cursor-pointer"
              />
            );
          })}
          
          {/* Labels */}
          {categories.map((category, index) => {
            const angle = index * angleStep - Math.PI / 2;
            const labelDistance = radius + 20;
            const x = centerX + labelDistance * Math.cos(angle);
            const y = centerY + labelDistance * Math.sin(angle);
            
            return (
              <text
                key={index}
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-zinc-400 text-xs"
              >
                {category}
              </text>
            );
          })}
        </svg>
      </div>
    );
  };

  const renderHeatmap = () => {
    const speakers = [...new Set(data.map(d => d.speaker).filter(Boolean))];
    const timeSlots = [...new Set(data.map(d => d.timestamp))];
    const cellWidth = 40;
    const cellHeight = 30;
    
    return (
      <div className="overflow-x-auto">
        <svg width={timeSlots.length * cellWidth + 100} height={speakers.length * cellHeight + 50}>
          {/* Y-axis labels (speakers) */}
          {speakers.map((speaker, speakerIndex) => (
            <text
              key={speaker}
              x="90"
              y={speakerIndex * cellHeight + 20}
              textAnchor="end"
              dominantBaseline="middle"
              className="fill-zinc-400 text-xs"
            >
              {speaker}
            </text>
          ))}
          
          {/* X-axis labels (time) */}
          {timeSlots.map((time, timeIndex) => (
            <text
              key={time}
              x={timeIndex * cellWidth + 100 + cellWidth / 2}
              y={speakers.length * cellHeight + 20}
              textAnchor="middle"
              className="fill-zinc-400 text-xs"
            >
              {time}
            </text>
          ))}
          
          {/* Heatmap cells */}
          {speakers.map((speaker, speakerIndex) =>
            timeSlots.map((time, timeIndex) => {
              const dataPoint = data.find(d => d.speaker === speaker && d.timestamp === time);
              const value = dataPoint?.value || 0;
              const intensity = value / 100;
              
              return (
                <motion.rect
                  key={`${speaker}-${time}`}
                  x={timeIndex * cellWidth + 100}
                  y={speakerIndex * cellHeight}
                  width={cellWidth - 1}
                  height={cellHeight - 1}
                  fill={`rgba(16, 185, 129, ${intensity})`}
                  stroke="#27272a"
                  strokeWidth="1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: animated ? (speakerIndex + timeIndex) * 0.05 : 0 }}
                  className="hover:stroke-emerald-400 hover:stroke-2 transition-all cursor-pointer"
                >
                  <title>{`${speaker} at ${time}: ${valueFormatter(value)}`}</title>
                </motion.rect>
              );
            })
          )}
        </svg>
      </div>
    );
  };

  const renderScatter = () => {
    const maxX = Math.max(...data.map(d => d.value));
    const maxY = Math.max(...data.map(d => d.secondary || 0));
    const padding = 40;
    const chartWidth = 400;
    const chartHeight = height;
    
    return (
      <div className="flex items-center justify-center">
        <svg width={chartWidth} height={chartHeight} className="overflow-visible">
          {/* Grid lines */}
          {showGrid && (
            <>
              {[0, 0.25, 0.5, 0.75, 1].map((scale, index) => (
                <g key={index}>
                  <line
                    x1={padding}
                    y1={padding + (chartHeight - 2 * padding) * scale}
                    x2={chartWidth - padding}
                    y2={padding + (chartHeight - 2 * padding) * scale}
                    stroke="#27272a"
                    strokeWidth="1"
                    opacity="0.3"
                  />
                  <line
                    x1={padding + (chartWidth - 2 * padding) * scale}
                    y1={padding}
                    x2={padding + (chartWidth - 2 * padding) * scale}
                    y2={chartHeight - padding}
                    stroke="#27272a"
                    strokeWidth="1"
                    opacity="0.3"
                  />
                </g>
              ))}
            </>
          )}
          
          {/* Data points */}
          {data.map((item, index) => {
            const x = padding + ((item.value / maxX) * (chartWidth - 2 * padding));
            const y = chartHeight - padding - (((item.secondary || 0) / maxY) * (chartHeight - 2 * padding));
            const color = item.color || getColor(item.value, item.speaker);
            
            return (
              <motion.circle
                key={index}
                cx={x}
                cy={y}
                r="6"
                fill={color}
                stroke="#18181b"
                strokeWidth="2"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: animated ? index * 0.1 : 0 }}
                className="hover:r-8 transition-all cursor-pointer"
              >
                <title>{`${item.speaker || item.timestamp}: (${valueFormatter(item.value)}, ${valueFormatter(item.secondary || 0)})`}</title>
              </motion.circle>
            );
          })}
          
          {/* Axis labels */}
          <text
            x={chartWidth / 2}
            y={chartHeight - 10}
            textAnchor="middle"
            className="fill-zinc-400 text-xs"
          >
            Primary Metric
          </text>
          <text
            x="15"
            y={chartHeight / 2}
            textAnchor="middle"
            transform={`rotate(-90, 15, ${chartHeight / 2})`}
            className="fill-zinc-400 text-xs"
          >
            Secondary Metric
          </text>
        </svg>
      </div>
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

        {type === 'donut' && renderDonut()}
        {type === 'radar' && renderRadar()}
        {type === 'heatmap' && renderHeatmap()}
        {type === 'scatter' && renderScatter()}

        {type === 'line' && (
          <>
            {/* Grid lines */}
            {showGrid && (
              <div className="absolute inset-0">
                {[0, 25, 50, 75, 100].map((percent) => (
                  <div
                    key={percent}
                    className="absolute w-full border-t border-zinc-800"
                    style={{ top: `${percent}%` }}
                  />
                ))}
              </div>
            )}
            
            {/* Line path */}
            <svg className="absolute inset-0 w-full h-full">
              <motion.path
                d={data.map((item, index) => {
                  const x = (index / (data.length - 1)) * 100;
                  const y = 100 - ((item.value - minValue) / range) * 100;
                  return `${index === 0 ? 'M' : 'L'} ${x}% ${y}%`;
                }).join(' ')}
                stroke="#10b981"
                strokeWidth="3"
                fill="none"
                className="opacity-80"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: animated ? 1 : 1 }}
                transition={{ duration: animated ? 1.5 : 0 }}
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
              <motion.path
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
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.4 }}
                transition={{ duration: animated ? 1 : 0 }}
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
              <motion.path
                d={data.map((item, index) => {
                  const x = (index / (data.length - 1)) * 100;
                  const y = 100 - ((item.value - minValue) / range) * 100;
                  return `${index === 0 ? 'M' : 'L'} ${x}% ${y}%`;
                }).join(' ')}
                stroke="#10b981"
                strokeWidth="3"
                fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: animated ? 1 : 1 }}
                transition={{ duration: animated ? 1.5 : 0 }}
              />
            </svg>
            
            {/* Points */}
            {data.map((item, index) => renderLine(item, index))}
          </>
        )}
      </div>

      {/* Y-axis labels */}
      {(type === 'bar' || type === 'line' || type === 'area') && (
        <div className="flex justify-between text-xs text-zinc-400 mt-4">
          <span>{valueFormatter(minValue)}</span>
          <span>{valueFormatter(Math.round((minValue + maxValue) / 2))}</span>
          <span>{valueFormatter(maxValue)}</span>
        </div>
      )}
    </div>
  );
}