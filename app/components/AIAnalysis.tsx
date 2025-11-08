'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  TrendingUp, 
  CheckSquare, 
  MessageSquare, 
  BarChart3,
  Smile,
  Meh,
  Frown,
  Loader2,
  Sparkles,
  Clock,
  User,
  AlertTriangle,
  Target
} from 'lucide-react';

interface AnalysisResult {
  actionItems: Array<{
    task: string;
    assignee?: string;
    priority: 'low' | 'medium' | 'high';
    dueDate?: string;
    category: string;
  }>;
  sentiment: {
    overall: 'positive' | 'neutral' | 'negative';
    confidence: number;
    emotions: {
      joy: number;
      sadness: number;
      anger: number;
      fear: number;
      surprise: number;
    };
  };
  summary: string;
  keyPoints: string[];
}

interface AIAnalysisProps {
  meetingId: string;
  onAnalysisComplete?: (result: AnalysisResult) => void;
}

export default function AIAnalysis({ meetingId, onAnalysisComplete }: AIAnalysisProps) {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [transcriptCount, setTranscriptCount] = useState(0);

  // Check if analysis is ready
  useEffect(() => {
    checkAnalysisReadiness();
  }, [meetingId]);

  const checkAnalysisReadiness = async () => {
    try {
      const response = await fetch(`/api/analysis?meetingId=${meetingId}`);
      const data = await response.json();
      
      if (data.success) {
        setTranscriptCount(data.transcriptCount);
      }
    } catch (error) {
      // Error handling without console logging
    }
  };

  const runAnalysis = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          meetingId,
          analysisType: 'full',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Analysis failed');
      }

      setAnalysis(data.analysis);
      onAnalysisComplete?.(data.analysis);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return <Smile className="w-5 h-5 text-green-600" />;
      case 'negative':
        return <Frown className="w-5 h-5 text-red-600" />;
      default:
        return <Meh className="w-5 h-5 text-yellow-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-50 text-red-600 border-red-200';
      case 'medium':
        return 'bg-yellow-50 text-yellow-600 border-yellow-200';
      default:
        return 'bg-blue-50 text-blue-600 border-blue-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Analysis Header */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <Brain className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-black">AI Analysis</h3>
              <p className="text-sm text-gray-600">
                {transcriptCount > 0 
                  ? `${transcriptCount} transcript entries ready for analysis`
                  : 'No transcripts available yet'
                }
              </p>
            </div>
          </div>

          <button
            onClick={runAnalysis}
            disabled={loading || transcriptCount === 0}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Run Analysis
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}
      </div>

      {/* Analysis Results */}
      <AnimatePresence>
        {analysis && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Summary */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-lg">
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare className="w-5 h-5 text-blue-600" />
                <h4 className="text-lg font-semibold text-black">Meeting Summary</h4>
              </div>
              <p className="text-gray-700 leading-relaxed">{analysis.summary}</p>
            </div>

            {/* Sentiment Analysis */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-lg">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <h4 className="text-lg font-semibold text-black">Sentiment Analysis</h4>
              </div>
              
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-2">
                  {getSentimentIcon(analysis.sentiment.overall)}
                  <span className="text-black font-medium capitalize">
                    {analysis.sentiment.overall}
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  {Math.round(analysis.sentiment.confidence * 100)}% confidence
                </div>
              </div>

              <div className="grid grid-cols-5 gap-3">
                {Object.entries(analysis.sentiment.emotions).map(([emotion, value]) => (
                  <div key={emotion} className="text-center">
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all"
                        style={{ width: `${value * 100}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-600 capitalize">{emotion}</div>
                    <div className="text-xs text-black font-medium">
                      {Math.round(value * 100)}%
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Items */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-lg">
              <div className="flex items-center gap-2 mb-4">
                <CheckSquare className="w-5 h-5 text-emerald-600" />
                <h4 className="text-lg font-semibold text-black">Action Items</h4>
                <span className="text-sm text-gray-600">({analysis.actionItems.length})</span>
              </div>
              
              {analysis.actionItems.length === 0 ? (
                <p className="text-gray-600 text-center py-4">No action items identified</p>
              ) : (
                <div className="space-y-3">
                  {analysis.actionItems.map((item, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex-shrink-0 mt-1">
                        <Target className="w-4 h-4 text-gray-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-black text-sm mb-1">{item.task}</p>
                        <div className="flex items-center gap-3 text-xs">
                          {item.assignee && (
                            <div className="flex items-center gap-1 text-gray-600">
                              <User className="w-3 h-3" />
                              {item.assignee}
                            </div>
                          )}
                          {item.dueDate && (
                            <div className="flex items-center gap-1 text-gray-600">
                              <Clock className="w-3 h-3" />
                              {new Date(item.dueDate).toLocaleDateString()}
                            </div>
                          )}
                          <span className="text-gray-500">{item.category}</span>
                        </div>
                      </div>
                      <div className={`px-2 py-1 rounded text-xs border ${getPriorityColor(item.priority)}`}>
                        {item.priority}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Key Points */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-lg">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="w-5 h-5 text-orange-600" />
                <h4 className="text-lg font-semibold text-black">Key Points</h4>
              </div>
              
              <div className="space-y-2">
                {analysis.keyPoints.map((point, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-2 flex-shrink-0" />
                    <p className="text-gray-700 text-sm">{point}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Development Note */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="w-4 h-4 text-blue-600" />
          <span className="text-blue-600 text-sm font-medium">Development Mode</span>
        </div>
        <p className="text-blue-700 text-xs">
          AI analysis is running in demo mode with mock data. In production, this would use Google Vertex AI 
          for real action item extraction, sentiment analysis, and meeting summarization.
        </p>
      </div>
    </div>
  );
}