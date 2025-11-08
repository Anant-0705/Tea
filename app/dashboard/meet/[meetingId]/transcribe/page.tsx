'use client';

import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles } from 'lucide-react';
import Link from 'next/link';
import RealTimeTranscription from '@/components/RealTimeTranscription';

export default function MeetingTranscribePage() {
  const params = useParams();
  const router = useRouter();
  const meetingId = params.meetingId as string;

  const handleAnalysisComplete = () => {
    // Redirect to meeting details page after analysis
    setTimeout(() => {
      router.push(`/dashboard/meet/${meetingId}`);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      <div className="max-w-7xl mx-auto pb-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-8"
        >
          <Link
            href={`/dashboard/meet/${meetingId}`}
            className="p-2 rounded-lg bg-zinc-800/50 hover:bg-zinc-700/50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-zinc-400" />
          </Link>
          
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <Sparkles className="w-6 h-6 text-purple-400" />
              <h1 className="text-2xl md:text-3xl font-bold text-white">
                Live Transcription & AI Analysis
              </h1>
            </div>
            <p className="text-zinc-400">
              Record your meeting and get instant AI-powered insights
            </p>
          </div>
        </motion.div>

        {/* Info Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 p-6 bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-500/30 rounded-xl"
        >
          <h3 className="text-white font-semibold mb-2">How it works:</h3>
          <ol className="space-y-2 text-zinc-300 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-blue-400 font-bold">1.</span>
              <span>Click "Start Recording" to begin capturing audio from your meeting</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400 font-bold">2.</span>
              <span>Watch as transcripts appear in real-time with speaker identification</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400 font-bold">3.</span>
              <span>Click "Stop & Analyze" when the meeting ends</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400 font-bold">4.</span>
              <span>Vertex AI will analyze the transcript and extract insights, action items, and sentiment</span>
            </li>
          </ol>
        </motion.div>

        {/* Transcription Component */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <RealTimeTranscription
            meetingId={meetingId}
            participants={['John Doe', 'Sarah Smith', 'Mike Johnson']}
            onAnalysisComplete={handleAnalysisComplete}
          />
        </motion.div>

        {/* Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 p-6 bg-zinc-900/50 border border-zinc-800/50 rounded-xl"
        >
          <h3 className="text-white font-semibold mb-3">💡 Tips for best results:</h3>
          <ul className="space-y-2 text-zinc-400 text-sm">
            <li>• Ensure your microphone is working and permissions are granted</li>
            <li>• Speak clearly and minimize background noise</li>
            <li>• Let the AI know who's speaking by introducing participants</li>
            <li>• Mention action items explicitly (e.g., "John will handle the frontend")</li>
            <li>• The longer the meeting, the more insights the AI can extract</li>
          </ul>
        </motion.div>
      </div>
    </div>
  );
}
