'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mic, 
  MicOff, 
  Radio, 
  StopCircle,
  MessageSquare,
  Users,
  Clock,
  Sparkles,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useTranscription } from '@/lib/hooks/useTranscription';

interface RealTimeTranscriptionProps {
  meetingId: string;
  participants?: string[];
  onAnalysisComplete?: () => void;
}

export default function RealTimeTranscription({
  meetingId,
  participants = [],
  onAnalysisComplete,
}: RealTimeTranscriptionProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  const {
    isConnected,
    isRecording,
    transcripts,
    error,
    startMeeting,
    stopMeeting,
  } = useTranscription({
    meetingId,
    participants,
    onTranscript: (transcript) => {
      console.log('New transcript:', transcript);
    },
    onMeetingEnd: async (transcriptCount) => {
      console.log(`Meeting ended with ${transcriptCount} transcripts`);
      
      // Trigger Vertex AI analysis
      setIsAnalyzing(true);
      try {
        const response = await fetch(`/api/meetings/${meetingId}/analyze`, {
          method: 'POST',
        });

        if (response.ok) {
          const data = await response.json();
          console.log('Analysis complete:', data);
          setAnalysisComplete(true);
          onAnalysisComplete?.();
        } else {
          console.error('Analysis failed:', await response.text());
        }
      } catch (error) {
        console.error('Error triggering analysis:', error);
      } finally {
        setIsAnalyzing(false);
      }
    },
    onError: (error) => {
      console.error('Transcription error:', error);
    },
  });

  // Auto-scroll to latest transcript
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcripts]);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Status Bar */}
      <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${
              isRecording ? 'bg-red-500 animate-pulse' : 
              isConnected ? 'bg-emerald-500' : 
              'bg-zinc-600'
            }`} />
            <h3 className="text-lg font-semibold text-white">
              {isRecording ? 'Recording in Progress' : 
               isConnected ? 'Ready to Record' : 
               'Connecting...'}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            {!isRecording ? (
              <button
                onClick={startMeeting}
                disabled={!isConnected}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-zinc-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                <Mic className="w-4 h-4" />
                Start Recording
              </button>
            ) : (
              <button
                onClick={stopMeeting}
                className="flex items-center gap-2 px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg transition-colors"
              >
                <StopCircle className="w-4 h-4" />
                Stop & Analyze
              </button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="flex items-center gap-2 text-sm">
            <MessageSquare className="w-4 h-4 text-blue-400" />
            <span className="text-zinc-400">Transcripts:</span>
            <span className="text-white font-medium">{transcripts.length}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <Users className="w-4 h-4 text-purple-400" />
            <span className="text-zinc-400">Participants:</span>
            <span className="text-white font-medium">{participants.length || 'Auto-detect'}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <Radio className={`w-4 h-4 ${isRecording ? 'text-red-400' : 'text-zinc-600'}`} />
            <span className="text-zinc-400">Status:</span>
            <span className={`font-medium ${
              isRecording ? 'text-red-400' : 
              isConnected ? 'text-emerald-400' : 
              'text-zinc-600'
            }`}>
              {isRecording ? 'Live' : isConnected ? 'Connected' : 'Offline'}
            </span>
          </div>
        </div>

        {error && (
          <div className="mt-4 flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
            <AlertCircle className="w-4 h-4 text-red-400" />
            <span className="text-red-400 text-sm">{error}</span>
          </div>
        )}
      </div>

      {/* Live Transcripts */}
      <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Live Transcription</h3>
          {isRecording && (
            <div className="flex items-center gap-2 text-sm text-zinc-400">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              Recording...
            </div>
          )}
        </div>

        <div className="max-h-96 overflow-y-auto space-y-3 pr-2">
          <AnimatePresence>
            {transcripts.length === 0 ? (
              <div className="text-center py-12">
                <MicOff className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                <p className="text-zinc-400">
                  {isRecording ? 'Listening for speech...' : 'Start recording to see live transcription'}
                </p>
              </div>
            ) : (
              transcripts.map((transcript, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="p-4 bg-zinc-800/30 rounded-lg"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-medium">
                        {transcript.speaker.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className="text-white font-medium">{transcript.speaker}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-zinc-500">
                      <Clock className="w-3 h-3" />
                      {formatTime(transcript.timestamp)}
                    </div>
                  </div>
                  <p className="text-zinc-300 leading-relaxed ml-10">{transcript.text}</p>
                  <div className="flex items-center gap-2 mt-2 ml-10">
                    <div className="flex-1 h-1 bg-zinc-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-emerald-500 to-green-400 rounded-full"
                        style={{ width: `${transcript.confidence * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-zinc-500">
                      {Math.round(transcript.confidence * 100)}%
                    </span>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
          <div ref={transcriptEndRef} />
        </div>
      </div>

      {/* Analysis Status */}
      {(isAnalyzing || analysisComplete) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 backdrop-blur-sm border border-purple-500/30 rounded-xl p-6"
        >
          <div className="flex items-center gap-3">
            {isAnalyzing ? (
              <>
                <Sparkles className="w-6 h-6 text-purple-400 animate-pulse" />
                <div>
                  <h4 className="text-white font-semibold">Analyzing with Vertex AI...</h4>
                  <p className="text-zinc-400 text-sm">
                    Extracting insights, action items, and sentiment analysis
                  </p>
                </div>
              </>
            ) : (
              <>
                <CheckCircle className="w-6 h-6 text-emerald-400" />
                <div>
                  <h4 className="text-white font-semibold">Analysis Complete!</h4>
                  <p className="text-zinc-400 text-sm">
                    Meeting insights and action items are now available
                  </p>
                </div>
              </>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}
