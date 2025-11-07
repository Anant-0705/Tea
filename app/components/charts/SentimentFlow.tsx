'use client';

import { motion } from 'framer-motion';

interface SentimentFlowData {
  timestamp: string;
  speaker: string;
  sentiment: number;
  topics: string[];
  impact: number;
}

interface SentimentFlowProps {
  data: SentimentFlowData[];
  title: string;
  height?: number;
}

export default function SentimentFlow({ data, title, height = 400 }: SentimentFlowProps) {
  const speakers = [...new Set(data.map(d => d.speaker))];
  const maxImpact = Math.max(...data.map(d => d.impact));
  const timeSlots = data.length;
  const speakerHeight = (height - 100) / speakers.length;

  const getSentimentColor = (sentiment: number) => {
    if (sentiment >= 80) return '#10b981';
    if (sentiment >= 60) return '#f59e0b';
    return '#ef4444';
  };

  const getSpeakerIndex = (speaker: string) => speakers.indexOf(speaker);

  return (
    <div className="bg-linear-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-white mb-6">{title}</h3>
      
      <div className="relative" style={{ height: `${height}px` }}>
        {/* Speaker lanes */}
        {speakers.map((speaker, index) => (
          <div
            key={speaker}
            className="absolute w-full border-b border-zinc-800/50"
            style={{
              top: `${index * speakerHeight + 50}px`,
              height: `${speakerHeight}px`
            }}
          >
            <div className="absolute left-0 top-2 text-sm text-zinc-400 font-medium">
              {speaker}
            </div>
          </div>
        ))}

        {/* Time axis */}
        <div className="absolute top-0 left-0 right-0 h-10 border-b border-zinc-700">
          {data.map((point, index) => (
            <div
              key={index}
              className="absolute text-xs text-zinc-400"
              style={{
                left: `${(index / (timeSlots - 1)) * 100}%`,
                transform: 'translateX(-50%)'
              }}
            >
              {point.timestamp}
            </div>
          ))}
        </div>

        {/* Sentiment flow lines */}
        <svg className="absolute inset-0 w-full h-full overflow-visible">
          {speakers.map((speaker, speakerIndex) => {
            const speakerData = data.filter(d => d.speaker === speaker);
            if (speakerData.length < 2) return null;

            const pathData = speakerData.map((point, pointIndex) => {
              const dataIndex = data.findIndex(d => d === point);
              const x = (dataIndex / (timeSlots - 1)) * 100;
              const y = speakerIndex * speakerHeight + 50 + speakerHeight / 2;
              return `${pointIndex === 0 ? 'M' : 'L'} ${x}% ${y}px`;
            }).join(' ');

            return (
              <motion.path
                key={speaker}
                d={pathData}
                stroke={getSentimentColor(speakerData[speakerData.length - 1].sentiment)}
                strokeWidth="2"
                fill="none"
                opacity="0.6"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.5, delay: speakerIndex * 0.2 }}
              />
            );
          })}
        </svg>

        {/* Sentiment points */}
        {data.map((point, index) => {
          const speakerIndex = getSpeakerIndex(point.speaker);
          const x = (index / (timeSlots - 1)) * 100;
          const y = speakerIndex * speakerHeight + 50 + speakerHeight / 2;
          const size = 4 + (point.impact / maxImpact) * 8;

          return (
            <motion.div
              key={index}
              className="absolute group cursor-pointer"
              style={{
                left: `${x}%`,
                top: `${y}px`,
                transform: 'translate(-50%, -50%)',
                width: `${size}px`,
                height: `${size}px`,
                backgroundColor: getSentimentColor(point.sentiment),
                borderRadius: '50%',
                border: '2px solid #18181b',
                zIndex: 10
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.5 }}
            >
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-black/90 text-white text-xs px-3 py-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">
                <div className="font-medium">{point.speaker}</div>
                <div>Time: {point.timestamp}</div>
                <div>Sentiment: {point.sentiment}%</div>
                <div>Impact: {point.impact}</div>
                {point.topics.length > 0 && (
                  <div>Topics: {point.topics.join(', ')}</div>
                )}
              </div>
            </motion.div>
          );
        })}

        {/* Legend */}
        <div className="absolute bottom-4 right-4 bg-zinc-800/80 backdrop-blur-sm rounded-lg p-3">
          <div className="text-xs text-zinc-400 mb-2 font-medium">Sentiment Scale</div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
              <span className="text-zinc-300">Positive</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
              <span className="text-zinc-300">Neutral</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-red-400"></div>
              <span className="text-zinc-300">Negative</span>
            </div>
          </div>
          <div className="text-xs text-zinc-500 mt-1">Point size = impact level</div>
        </div>
      </div>
    </div>
  );
}