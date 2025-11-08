'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, X, Eye, EyeOff, Minimize2, Maximize2, Mail, Calendar, CheckCircle, XCircle, Loader2, Play } from 'lucide-react';

interface BackgroundTranscriptionProps {
  onClose?: () => void;
}

export default function BackgroundTranscription({ onClose }: BackgroundTranscriptionProps) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [transcriptCount, setTranscriptCount] = useState(0);
  const [sessionInfo, setSessionInfo] = useState<any>(null);
  const [recentTranscripts, setRecentTranscripts] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [meetingAnalysis, setMeetingAnalysis] = useState<any>(null);
  const [meetingSummary, setMeetingSummary] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [showActions, setShowActions] = useState(false);
  const [actions, setActions] = useState<any[]>([]);
  const [executingActions, setExecutingActions] = useState(false);
  const [actionResults, setActionResults] = useState<any[]>([]);
  
  const wsRef = useRef<WebSocket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  useEffect(() => {
    // Check for active transcription session
    const sessionData = localStorage.getItem('activeTranscriptionSession');
    if (!sessionData) return;

    const session = JSON.parse(sessionData);
    setSessionInfo(session);

    // Connect to WebSocket
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080';
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('✅ Background transcription connected');
      
      // Send start meeting message
      ws.send(JSON.stringify({
        type: 'start_meeting',
        meetingId: session.meetingId,
        participants: [],
      }));

      // Start audio capture
      startAudioCapture(ws, session.meetingId);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'transcript' && data.isFinal) {
          setTranscriptCount(prev => prev + 1);
          setRecentTranscripts(prev => [...prev.slice(-2), data.text]);
          
          // Store transcript
          storeTranscript(session.meetingId, data);
        }
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    wsRef.current = ws;

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, []);

  const startAudioCapture = async (ws: WebSocket, meetingId: string) => {
    try {
      // Request audio with specific constraints for better quality
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 48000,
        } 
      });
      
      // Check if audio tracks are active
      const audioTracks = stream.getAudioTracks();
      console.log(`🎤 Audio tracks: ${audioTracks.length}`);
      audioTracks.forEach(track => {
        console.log(`  - ${track.label}: ${track.enabled ? 'enabled' : 'disabled'}, ${track.muted ? 'muted' : 'unmuted'}`);
      });
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
      });

      mediaRecorder.ondataavailable = async (event) => {
        if (event.data.size > 0 && ws.readyState === WebSocket.OPEN) {
          console.log(`🎤 Audio captured: ${event.data.size} bytes`);
          
          // Convert Blob to base64 for transmission
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64Audio = reader.result as string;
            // Remove the data URL prefix (e.g., "data:audio/webm;codecs=opus;base64,")
            const base64Data = base64Audio.split(',')[1];
            
            console.log(`📤 Sending audio: ${base64Data.length} bytes (base64)`);
            
            ws.send(JSON.stringify({
              type: 'audio',
              audioData: base64Data,
              meetingId,
              mimeType: 'audio/webm;codecs=opus',
            }));
          };
          reader.readAsDataURL(event.data);
        } else if (event.data.size === 0) {
          console.warn('⚠️  No audio data captured (size: 0)');
        }
      };

      mediaRecorder.start(3000); // Capture every 3 seconds (better for speech detection)
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
      
      console.log('🎙️ Background audio capture started');
    } catch (error) {
      console.error('Error starting audio capture:', error);
    }
  };

  const storeTranscript = async (meetingId: string, transcript: any) => {
    // Transcripts are already stored by the WebSocket server
    // No need to store them again from the client
    console.log('💾 Transcript stored by server:', transcript.text.substring(0, 50) + '...');
  };

  const handleEndMeeting = async () => {
    if (!sessionInfo) return;

    setIsRecording(false);

    // Stop recording
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }

    // Send end meeting message
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'end_meeting',
        meetingId: sessionInfo.meetingId,
      }));
    }

    // Trigger analysis
    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/meetings/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ meetingId: sessionInfo.meetingId }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Meeting analysis complete:', data);
        setMeetingAnalysis(data.analysis);
        setMeetingSummary(data.summary);
        setAnalysisComplete(true);
        
        // Auto-generate actions
        generateActions(data.summary?.recommendedActions || [], data.analysis?.actionItems || []);
      } else {
        const error = await response.text();
        console.error('Analysis failed:', error);
        setError('Analysis failed. Please try again.');
      }
    } catch (error) {
      console.error('Error triggering analysis:', error);
      setError('Failed to analyze meeting. Please check the console.');
    } finally {
      setIsAnalyzing(false);
    }

    // Clean up
    localStorage.removeItem('activeTranscriptionSession');
  };

  const generateActions = (recommendedActions: string[], actionItems: any[]) => {
    const generatedActions: any[] = [];

    // Parse recommended actions
    recommendedActions.forEach((recommendation, index) => {
      const lowerRec = recommendation.toLowerCase();

      // Detect email actions
      if (lowerRec.includes('email') || lowerRec.includes('send') || lowerRec.includes('notify')) {
        const emailMatch = recommendation.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/);
        const recipient = emailMatch ? emailMatch[0] : 'anantsinghal2134@gmail.com';
        
        generatedActions.push({
          id: `email-${index}`,
          type: 'send_email',
          description: recommendation,
          data: {
            recipient,
            subject: `Follow-up: ${recommendation.substring(0, 50)}`,
            body: recommendation,
          }
        });
      }

      // Detect meeting scheduling actions
      if (lowerRec.includes('schedule') || lowerRec.includes('meeting') || lowerRec.includes('9 pm') || lowerRec.includes('9pm')) {
        generatedActions.push({
          id: `meeting-${index}`,
          type: 'schedule_meeting',
          description: recommendation,
          data: {
            title: recommendation.substring(0, 100),
            participants: ['anantsinghal2134@gmail.com'],
            date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
            duration: 60,
            description: recommendation,
          }
        });
      }
    });

    // Convert action items to tasks
    actionItems.forEach((item, index) => {
      if (item.task) {
        generatedActions.push({
          id: `task-${index}`,
          type: 'create_task',
          description: item.task,
          data: {
            task: item.task,
            assignee: item.assignee || 'anantsinghal2134@gmail.com',
            priority: item.priority || 'medium',
            dueDate: item.dueDate || null,
          }
        });
      }
    });

    setActions(generatedActions);
    if (generatedActions.length > 0) {
      setShowActions(true);
    }
  };

  const executeActions = async () => {
    if (!sessionInfo || actions.length === 0) return;

    setExecutingActions(true);
    setActionResults([]);

    try {
      const response = await fetch('/api/meetings/execute-actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          meetingId: sessionInfo.meetingId,
          actions,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setActionResults(data.results);
      } else {
        setError('Failed to execute actions: ' + data.error);
      }
    } catch (error) {
      console.error('Error executing actions:', error);
      setError('Failed to execute actions');
    } finally {
      setExecutingActions(false);
    }
  };

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'send_email': return <Mail className="w-4 h-4" />;
      case 'schedule_meeting': return <Calendar className="w-4 h-4" />;
      default: return <CheckCircle className="w-4 h-4" />;
    }
  };

  const getActionColor = (type: string) => {
    switch (type) {
      case 'send_email': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'schedule_meeting': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
    }
  };

  if (!sessionInfo) return null;

  return (
    <>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className={`fixed ${isMinimized ? 'bottom-4 right-4' : 'bottom-4 right-4'} z-50`}
        >
          <div className={`bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl ${
            isMinimized ? 'w-64' : 'w-96'
          }`}>
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-zinc-700">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-zinc-600'}`} />
              <span className="text-white font-medium text-sm">
                {isRecording ? 'Recording' : 'Stopped'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1 hover:bg-zinc-800 rounded transition-colors"
              >
                {isMinimized ? (
                  <Maximize2 className="w-4 h-4 text-zinc-400" />
                ) : (
                  <Minimize2 className="w-4 h-4 text-zinc-400" />
                )}
              </button>
              <button
                onClick={onClose}
                className="p-1 hover:bg-zinc-800 rounded transition-colors"
              >
                <X className="w-4 h-4 text-zinc-400" />
              </button>
            </div>
          </div>

          {/* Content */}
          {!isMinimized && (
            <div className="p-4">
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Mic className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm text-zinc-400">Background Transcription Active</span>
                </div>
                <div className="text-2xl font-bold text-white mb-1">
                  {transcriptCount} transcripts
                </div>
                <div className="text-xs text-zinc-500">
                  Started {new Date(sessionInfo.startTime).toLocaleTimeString()}
                </div>
              </div>

              {/* Recent Transcripts */}
              {recentTranscripts.length > 0 && (
                <div className="mb-4">
                  <div className="text-xs text-zinc-400 mb-2">Recent:</div>
                  <div className="space-y-2">
                    {recentTranscripts.map((text, index) => (
                      <div key={index} className="text-xs text-zinc-300 bg-zinc-800/50 p-2 rounded">
                        {text.substring(0, 60)}...
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="space-y-2">
                <button
                  onClick={handleEndMeeting}
                  className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  End Meeting & Analyze
                </button>
                <div className="text-xs text-zinc-500 text-center">
                  💡 Click when your Google Meet ends
                </div>
              </div>
            </div>
          )}

          {/* Minimized View */}
          {isMinimized && (
            <div className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mic className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm text-white">{transcriptCount}</span>
                </div>
                <button
                  onClick={handleEndMeeting}
                  className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-medium transition-colors"
                >
                  End
                </button>
              </div>
            </div>
          )}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Analysis Results - Shows below the widget */}
      {(isAnalyzing || analysisComplete) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-[25rem] md:w-[600px] z-40 max-h-[80vh] overflow-y-auto"
        >
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl p-6">
            {isAnalyzing && (
              <div className="text-center py-8">
                <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <h3 className="text-white font-semibold mb-2">Analyzing with Vertex AI...</h3>
                <p className="text-zinc-400 text-sm">
                  Extracting insights, action items, and sentiment analysis
                </p>
              </div>
            )}

            {analysisComplete && meetingAnalysis && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-white">AI Analysis Results</h2>
                  <button
                    onClick={() => {
                      setAnalysisComplete(false);
                      setMeetingAnalysis(null);
                    }}
                    className="text-zinc-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Summary */}
                {meetingAnalysis.summary && (
                  <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-purple-500/30 rounded-lg p-4">
                    <h3 className="text-white font-semibold mb-2">📝 Summary</h3>
                    <p className="text-zinc-300 text-sm leading-relaxed">{meetingAnalysis.summary}</p>
                  </div>
                )}

                {/* Action Items */}
                {meetingAnalysis.actionItems && meetingAnalysis.actionItems.length > 0 && (
                  <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
                    <h3 className="text-white font-semibold mb-3">✅ Action Items</h3>
                    <div className="space-y-2">
                      {meetingAnalysis.actionItems.map((item: any, index: number) => (
                        <div key={index} className="flex items-start gap-2 text-sm">
                          <span className="text-emerald-400 mt-0.5">•</span>
                          <div className="flex-1">
                            <p className="text-zinc-300">{item.task}</p>
                            {item.assignee && (
                              <p className="text-zinc-500 text-xs mt-1">Assigned to: {item.assignee}</p>
                            )}
                          </div>
                          <span className={`px-2 py-0.5 rounded text-xs ${
                            item.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                            item.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-blue-500/20 text-blue-400'
                          }`}>
                            {item.priority}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Key Topics */}
                {meetingAnalysis.keyTopics && meetingAnalysis.keyTopics.length > 0 && (
                  <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
                    <h3 className="text-white font-semibold mb-3">🎯 Key Topics</h3>
                    <div className="flex flex-wrap gap-2">
                      {meetingAnalysis.keyTopics.map((topic: string, index: number) => (
                        <span key={index} className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm border border-blue-500/30">
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sentiment */}
                {meetingAnalysis.sentiment && (
                  <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
                    <h3 className="text-white font-semibold mb-3">😊 Sentiment Analysis</h3>
                    <div className="flex items-center gap-3">
                      <div className={`text-2xl ${
                        meetingAnalysis.sentiment.overall === 'positive' ? 'text-emerald-400' :
                        meetingAnalysis.sentiment.overall === 'negative' ? 'text-red-400' :
                        'text-yellow-400'
                      }`}>
                        {meetingAnalysis.sentiment.overall === 'positive' ? '😊' :
                         meetingAnalysis.sentiment.overall === 'negative' ? '😟' : '😐'}
                      </div>
                      <div>
                        <p className="text-white font-medium capitalize">{meetingAnalysis.sentiment.overall}</p>
                        <p className="text-zinc-400 text-sm">
                          {Math.round(meetingAnalysis.sentiment.score * 100)}% confidence
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Decisions */}
                {meetingAnalysis.decisions && meetingAnalysis.decisions.length > 0 && (
                  <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
                    <h3 className="text-white font-semibold mb-3">🎯 Decisions Made</h3>
                    <ul className="space-y-2">
                      {meetingAnalysis.decisions.map((decision: string, index: number) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-zinc-300">
                          <span className="text-emerald-400 mt-0.5">✓</span>
                          {decision}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Next Steps */}
                {meetingAnalysis.nextSteps && meetingAnalysis.nextSteps.length > 0 && (
                  <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
                    <h3 className="text-white font-semibold mb-3">🚀 Next Steps</h3>
                    <ol className="space-y-2">
                      {meetingAnalysis.nextSteps.map((step: string, index: number) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-zinc-300">
                          <span className="text-blue-400 font-medium">{index + 1}.</span>
                          {step}
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                {/* Automated Actions */}
                {showActions && actions.length > 0 && (
                  <div className="bg-gradient-to-r from-emerald-900/30 to-blue-900/30 border border-emerald-500/30 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-white font-semibold">🤖 Automated Actions</h3>
                      <button
                        onClick={executeActions}
                        disabled={executingActions || actionResults.length > 0}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {executingActions ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Executing...
                          </>
                        ) : actionResults.length > 0 ? (
                          <>
                            <CheckCircle className="w-4 h-4" />
                            Completed
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4" />
                            Execute All
                          </>
                        )}
                      </button>
                    </div>

                    <div className="space-y-3">
                      {actions.map((action) => {
                        const result = actionResults.find(r => r.actionId === action.id);
                        
                        return (
                          <div
                            key={action.id}
                            className={`border rounded-lg p-3 ${
                              result 
                                ? result.success 
                                  ? 'border-green-500/30 bg-green-500/10' 
                                  : 'border-red-500/30 bg-red-500/10'
                                : 'border-zinc-700 bg-zinc-800/30'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`p-2 rounded-lg border ${getActionColor(action.type)}`}>
                                {getActionIcon(action.type)}
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2 mb-1">
                                  <h4 className="text-white font-medium text-sm capitalize">
                                    {action.type.replace('_', ' ')}
                                  </h4>
                                  {result && (
                                    <div className="flex items-center gap-1">
                                      {result.success ? (
                                        <CheckCircle className="w-4 h-4 text-green-400" />
                                      ) : (
                                        <XCircle className="w-4 h-4 text-red-400" />
                                      )}
                                    </div>
                                  )}
                                </div>
                                
                                <p className="text-zinc-300 text-xs mb-2 line-clamp-2">{action.description}</p>
                                
                                {action.type === 'send_email' && (
                                  <div className="text-xs text-zinc-500">
                                    To: {action.data.recipient}
                                  </div>
                                )}
                                
                                {action.type === 'schedule_meeting' && (
                                  <div className="text-xs text-zinc-500">
                                    Participants: {action.data.participants.join(', ')}
                                  </div>
                                )}
                                
                                {result && (
                                  <div className={`mt-2 text-xs ${result.success ? 'text-green-400' : 'text-red-400'}`}>
                                    {result.success ? result.message : result.error}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {actionResults.length > 0 && (
                      <div className="mt-4 p-3 bg-zinc-800/50 rounded-lg">
                        <p className="text-sm text-zinc-300">
                          <strong>Summary:</strong> {actionResults.filter(r => r.success).length} of {actionResults.length} actions completed successfully
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </>
  );
}
