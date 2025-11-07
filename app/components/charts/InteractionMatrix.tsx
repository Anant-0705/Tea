'use client';

import { motion } from 'framer-motion';

interface MatrixData {
  participant: string;
  interactions: Array<{
    with: string;
    count: number;
    sentiment: number;
  }>;
}

interface InteractionMatrixProps {
  data: MatrixData[];
  title: string;
  height?: number;
}

export default function InteractionMatrix({ data, title, height = 400 }: InteractionMatrixProps) {
  const participants = [...new Set(data.map(d => d.participant))];
  const cellSize = Math.min(40, (height - 100) / participants.length);
  const maxInteractions = Math.max(...data.flatMap(d => d.interactions.map(i => i.count)));

  const getInteractionData = (from: string, to: string) => {
    const fromData = data.find(d => d.participant === from);
    if (!fromData) return null;
    return fromData.interactions.find(i => i.with === to);
  };

  const getIntensityColor = (count: number, sentiment: number) => {
    const intensity = count / maxInteractions;
    if (sentiment >= 80) {
      return `rgba(16, 185, 129, ${intensity})`;
    } else if (sentiment >= 60) {
      return `rgba(245, 158, 11, ${intensity})`;
    } else {
      return `rgba(239, 68, 68, ${intensity})`;
    }
  };

  return (
    <div className="bg-linear-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-white mb-6">{title}</h3>
      
      <div className="overflow-auto">
        <div className="relative" style={{ minWidth: participants.length * cellSize + 150 }}>
          {/* Header row */}
          <div className="flex items-center mb-2">
            <div style={{ width: '150px' }} className="text-xs text-zinc-400 font-medium">
              Participants
            </div>
            {participants.map((participant, index) => (
              <div
                key={participant}
                style={{ width: `${cellSize}px` }}
                className="text-xs text-zinc-400 text-center transform -rotate-45 origin-bottom-left"
              >
                {participant.split(' ')[0]}
              </div>
            ))}
          </div>

          {/* Matrix rows */}
          {participants.map((fromParticipant, rowIndex) => (
            <motion.div
              key={fromParticipant}
              className="flex items-center mb-1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: rowIndex * 0.1 }}
            >
              <div style={{ width: '150px' }} className="text-sm text-white pr-4 truncate">
                {fromParticipant}
              </div>
              {participants.map((toParticipant, colIndex) => {
                const interaction = getInteractionData(fromParticipant, toParticipant);
                const count = interaction?.count || 0;
                const sentiment = interaction?.sentiment || 0;
                const isMainDiagonal = fromParticipant === toParticipant;

                return (
                  <motion.div
                    key={`${fromParticipant}-${toParticipant}`}
                    style={{
                      width: `${cellSize}px`,
                      height: `${cellSize}px`,
                      backgroundColor: isMainDiagonal 
                        ? '#27272a' 
                        : getIntensityColor(count, sentiment)
                    }}
                    className={`border border-zinc-700 flex items-center justify-center text-xs font-medium ${
                      isMainDiagonal ? 'text-zinc-500' : 'text-white'
                    } hover:border-emerald-400 transition-all cursor-pointer group relative`}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: (rowIndex + colIndex) * 0.05 }}
                  >
                    {isMainDiagonal ? '—' : count || ''}
                    
                    {/* Tooltip */}
                    {!isMainDiagonal && interaction && (
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-black/90 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                        <div>{fromParticipant} → {toParticipant}</div>
                        <div>{count} interactions</div>
                        <div>Sentiment: {sentiment}%</div>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </motion.div>
          ))}
        </div>

        {/* Legend */}
        <div className="mt-6 flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-emerald-400/50 border border-emerald-400"></div>
            <span className="text-zinc-400">Positive Interactions</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-400/50 border border-yellow-400"></div>
            <span className="text-zinc-400">Neutral Interactions</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-400/50 border border-red-400"></div>
            <span className="text-zinc-400">Negative Interactions</span>
          </div>
          <div className="ml-auto text-zinc-400">
            Intensity indicates interaction frequency
          </div>
        </div>
      </div>
    </div>
  );
}