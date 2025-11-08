'use client';

import { motion } from 'framer-motion';
import { 
  Calendar, 
  Mail, 
  Video, 
  FileText, 
  MessageSquare, 
  Database,
  Brain,
  Plus
} from 'lucide-react';

interface IntegrationNode {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  color: string;
  position: { x: number; y: number };
}

export default function IntegrationDiagram() {
  const integrations: IntegrationNode[] = [
    {
      id: 'meet',
      name: 'Google Meet',
      icon: Video,
      color: 'text-green-600',
      position: { x: 0, y: -120 }
    },
    {
      id: 'calendar',
      name: 'Calendar',
      icon: Calendar,
      color: 'text-blue-600',
      position: { x: 85, y: -85 }
    },
    {
      id: 'docs',
      name: 'Google Docs',
      icon: FileText,
      color: 'text-yellow-600',
      position: { x: 120, y: 0 }
    },
    {
      id: 'drive',
      name: 'Google Drive',
      icon: Database,
      color: 'text-green-600',
      position: { x: 85, y: 85 }
    },
    {
      id: 'gmail',
      name: 'Gmail',
      icon: Mail,
      color: 'text-red-600',
      position: { x: 0, y: 120 }
    },
    {
      id: 'slack',
      name: 'Slack',
      icon: MessageSquare,
      color: 'text-purple-600',
      position: { x: -85, y: 85 }
    },
    {
      id: 'sheets',
      name: 'Google Sheets',
      icon: Database,
      color: 'text-green-600',
      position: { x: -120, y: 0 }
    },
    {
      id: 'more',
      name: 'More Apps',
      icon: Plus,
      color: 'text-gray-400',
      position: { x: -85, y: -85 }
    }
  ];

  return (
    <div className="relative w-80 h-80 mx-auto">
      {/* Central Hub */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 200 }}
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-black rounded-full flex items-center justify-center shadow-lg z-10"
      >
        <Brain className="w-10 h-10 text-white" />
      </motion.div>

      {/* Integration Nodes */}
      {integrations.map((integration, index) => (
        <motion.div
          key={integration.id}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ 
            duration: 0.4, 
            delay: index * 0.1 + 0.3,
            type: "spring",
            stiffness: 200
          }}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
          style={{
            transform: `translate(${integration.position.x - 32}px, ${integration.position.y - 32}px)`
          }}
        >
          {/* Connection Line */}
          <motion.svg
            className="absolute top-8 left-8 pointer-events-none"
            width="200"
            height="200"
            style={{
              transform: `translate(${-integration.position.x}px, ${-integration.position.y}px)`
            }}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1, delay: index * 0.1 + 0.8 }}
          >
            <line
              x1="100"
              y1="100"
              x2={100 + integration.position.x}
              y2={100 + integration.position.y}
              stroke="#e5e7eb"
              strokeWidth="2"
              strokeDasharray="4 4"
            />
          </motion.svg>

          {/* Integration Icon */}
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="w-16 h-16 bg-white rounded-full shadow-md border border-gray-200 flex items-center justify-center cursor-pointer group hover:shadow-lg transition-shadow"
          >
            <integration.icon className={`w-8 h-8 ${integration.color} group-hover:scale-110 transition-transform`} />
          </motion.div>

          {/* Label */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.1 + 1 }}
            className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 whitespace-nowrap"
          >
            <span className="text-xs text-gray-600 font-medium bg-white px-2 py-1 rounded shadow-sm">
              {integration.name}
            </span>
          </motion.div>
        </motion.div>
      ))}

      {/* Animated Pulse Rings */}
      <motion.div
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full border-2 border-emerald-300"
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.8, 0, 0.8],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full border-2 border-emerald-400"
        animate={{
          scale: [1, 2, 1],
          opacity: [0.6, 0, 0.6],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.5,
        }}
      />
    </div>
  );
}