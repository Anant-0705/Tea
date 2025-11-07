'use client';

import { motion } from 'framer-motion';

interface NetworkNode {
  id: string;
  label: string;
  value: number;
  category: 'speaker' | 'topic' | 'action';
  connections: string[];
}

interface NetworkDiagramProps {
  nodes: NetworkNode[];
  title: string;
  height?: number;
}

export default function NetworkDiagram({ nodes, title, height = 400 }: NetworkDiagramProps) {
  const centerX = 200;
  const centerY = height / 2;
  const radius = Math.min(height, 350) / 2 - 60;

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'speaker': return '#10b981';
      case 'topic': return '#3b82f6';
      case 'action': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const getNodeSize = (value: number) => {
    const maxValue = Math.max(...nodes.map(n => n.value));
    return 8 + (value / maxValue) * 12;
  };

  const getNodePosition = (index: number, total: number) => {
    const angle = (index / total) * 2 * Math.PI - Math.PI / 2;
    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle)
    };
  };

  const getConnections = () => {
    const connections: Array<{ from: NetworkNode; to: NetworkNode }> = [];
    
    nodes.forEach(node => {
      node.connections.forEach(connectionId => {
        const targetNode = nodes.find(n => n.id === connectionId);
        if (targetNode) {
          connections.push({ from: node, to: targetNode });
        }
      });
    });
    
    return connections;
  };

  const connections = getConnections();

  return (
    <div className="bg-linear-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-white mb-6">{title}</h3>
      
      <div className="flex items-center justify-center">
        <svg width="400" height={height} className="overflow-visible">
          {/* Connection lines */}
          {connections.map((connection, index) => {
            const fromIndex = nodes.indexOf(connection.from);
            const toIndex = nodes.indexOf(connection.to);
            const fromPos = getNodePosition(fromIndex, nodes.length);
            const toPos = getNodePosition(toIndex, nodes.length);
            
            return (
              <motion.line
                key={index}
                x1={fromPos.x}
                y1={fromPos.y}
                x2={toPos.x}
                y2={toPos.y}
                stroke="#27272a"
                strokeWidth="1"
                opacity="0.6"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1, delay: index * 0.1 }}
              />
            );
          })}

          {/* Nodes */}
          {nodes.map((node, index) => {
            const position = getNodePosition(index, nodes.length);
            const nodeSize = getNodeSize(node.value);
            const color = getCategoryColor(node.category);
            
            return (
              <g key={node.id}>
                {/* Node circle */}
                <motion.circle
                  cx={position.x}
                  cy={position.y}
                  r={nodeSize}
                  fill={color}
                  stroke="#18181b"
                  strokeWidth="2"
                  className="hover:opacity-80 cursor-pointer"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: index * 0.15 }}
                  whileHover={{ scale: 1.2 }}
                >
                  <title>{`${node.label} (${node.category}): ${node.value}`}</title>
                </motion.circle>

                {/* Node label */}
                <motion.text
                  x={position.x}
                  y={position.y + nodeSize + 15}
                  textAnchor="middle"
                  className="fill-zinc-400 text-xs font-medium"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.15 + 0.5 }}
                >
                  {node.label.length > 12 ? `${node.label.substring(0, 12)}...` : node.label}
                </motion.text>

                {/* Value indicator */}
                <motion.text
                  x={position.x}
                  y={position.y + 3}
                  textAnchor="middle"
                  className="fill-white text-xs font-bold"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.15 + 0.3 }}
                >
                  {node.value}
                </motion.text>
              </g>
            );
          })}

          {/* Center info */}
          <g>
            <circle
              cx={centerX}
              cy={centerY}
              r="25"
              fill="#18181b"
              stroke="#27272a"
              strokeWidth="2"
            />
            <text
              x={centerX}
              y={centerY - 5}
              textAnchor="middle"
              className="fill-white text-xs font-medium"
            >
              Meeting
            </text>
            <text
              x={centerX}
              y={centerY + 8}
              textAnchor="middle"
              className="fill-zinc-400 text-xs"
            >
              Network
            </text>
          </g>
        </svg>
      </div>

      {/* Legend */}
      <div className="mt-6 flex justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-emerald-400"></div>
          <span className="text-zinc-400">Speakers</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-blue-400"></div>
          <span className="text-zinc-400">Topics</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-yellow-400"></div>
          <span className="text-zinc-400">Actions</span>
        </div>
      </div>

      <div className="text-center text-xs text-zinc-500 mt-2">
        Node size represents importance/frequency
      </div>
    </div>
  );
}