'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mic, 
  MicOff, 
  Play, 
  Pause, 
  Square, 
  Users, 
  Clock,
  Activity,
  Volume2,
  VolumeX,
  Download,
  Share2
} from 'lucide-react';

interface TranscriptEntry {
  id: string;
  speaker: string;
  text: string;
  timestamp: string;
  confidence: number;
  isFinal?: boolean;
}

interface LiveTranscriptionProps {
  meetingId: string;
  participants?: string[];
  onTranscriptUpdate?: (transcript: TranscriptEntry) => void;
  onSessionStart?: (sessionId: string) => void;
  onSessionEnd?: (analysis: any) => void;
}

export default function LiveTranscription({ 
  meetingId, 
  participants = [],
  onTranscriptUpdate, 
  onSessionStart,
  onSessionEnd 
}: LiveTranscriptionProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [transcripts, setTranscripts] = useState<TranscriptEntry[]>([]);
  const [currentSpeaker, setCurrentSpeaker] = useState('You');
  const [audioLevel, setAudioLevel] = useState(0);
  const [error, setError] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [interimText, setInterimText] = useState('');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<any>(null);
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  // Audio level monitoring
  const monitorAudioLevel = () => {
    if (analyserRef.current) {
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      analyserRef.current.getByteFrequencyData(dataArray);
      
      const sum = dataArray.reduce((a, b) => a + b, 0);
      const average = sum / dataArray.length;
      setAudioLevel(average);
      
      if (isRecording && !isPaused) {
        requestAnimationFrame(monitorAudioLevel);
      }
    }
  };

  // Initialize audio capture
  const initializeAudio = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 48000,
        },
      });

      streamRef.current = stream;

      // Setup audio context for level monitoring
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      analyserRef.current.fftSize = 256;

      return true;
    } catch (error) {
      console.error('Error accessing microphone:', error);
      setError('Failed to access microphone. Please ensure microphone permissions are granted.');
      return false;
    }
  };

  // Initialize Web Speech API
  const initializeSpeechRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setError('Speech recognition not supported in this browser. Please use Chrome or Edge.');
      return false;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      console.log('Speech recognition started');
      setIsProcessing(true);
    };

    recognition.onresult = async (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        const confidence = event.results[i][0].confidence || 0.8;

        if (event.results[i].isFinal) {
          finalTranscript += transcript;
          
          // Create new transcript entry
          const newTranscript: TranscriptEntry = {
            id: `${Date.now()}-${Math.random()}`,
            speaker: currentSpeaker,
            text: transcript.trim(),
            timestamp: new Date().toISOString(),
            confidence,
            isFinal: true,
          };

          if (newTranscript.text) {
            setTranscripts(prev => [...prev, newTranscript]);
            onTranscriptUpdate?.(newTranscript);

            // Send to backend
            if (sessionId) {
              try {
                await fetch('/api/transcription', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    action: 'add_transcript',
                    sessionId,
                    transcriptData: {
                      transcript: newTranscript.text,
                      confidence: newTranscript.confidence,
                      isFinal: true,
                      timestamp: newTranscript.timestamp,
                      speakerTag: currentSpeaker === 'You' ? 0 : 1,
                    },
                  }),
                });
              } catch (err) {
                console.error('Failed to send transcript to backend:', err);
              }
            }

            // Auto-scroll to bottom
            setTimeout(() => {
              transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
          }
          
          setInterimText('');
        } else {
          interimTranscript += transcript;
          setInterimText(interimTranscript);
        }
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'not-allowed') {
        setError('Microphone access denied. Please allow microphone access and try again.');
      } else if (event.error === 'network') {
        setError('Network error. Please check your internet connection.');
      } else {
        setError(`Speech recognition error: ${event.error}`);
      }
      setIsProcessing(false);
    };

    recognition.onend = () => {
      console.log('Speech recognition ended');
      setIsProcessing(false);
      
      // Restart if still recording
      if (isRecording && !isPaused) {
        setTimeout(() => {
          if (recognitionRef.current && isRecording) {
            try {
              recognitionRef.current.start();
            } catch (err) {
              console.error('Failed to restart recognition:', err);
            }
          }
        }, 100);
      }
    };

    recognitionRef.current = recognition;
    return true;
  };

  // Start transcription session
  const startTranscriptionSession = async () => {
    try {
      const response = await fetch('/api/transcription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'start_session',
          meetingId,
          participants,
        }),
      });

      const result = await response.json();
      if (result.success) {
        setSessionId(result.sessionId);
        onSessionStart?.(result.sessionId);
        return true;
      } else {
        throw new Error(result.error || 'Failed to start session');
      }
    } catch (err) {
      console.error('Failed to start transcription session:', err);
      setError('Failed to start transcription session');
      return false;
    }
  };

  // End transcription session
  const endTranscriptionSession = async () => {
    if (!sessionId) return;

    try {
      const response = await fetch('/api/transcription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'end_session',
          sessionId,
        }),
      });

      const result = await response.json();
      if (result.success) {
        onSessionEnd?.(result.analysis);
      }
    } catch (err) {
      console.error('Failed to end transcription session:', err);
    }
  };

  // Start recording
  const startRecording = async () => {
    const audioInitialized = await initializeAudio();
    if (!audioInitialized) return;

    const speechInitialized = initializeSpeechRecognition();
    if (!speechInitialized) return;

    const sessionStarted = await startTranscriptionSession();
    if (!sessionStarted) return;

    try {
      recognitionRef.current.start();
      setIsRecording(true);
      setIsPaused(false);
      setError('');
      monitorAudioLevel();
    } catch (err) {
      console.error('Failed to start speech recognition:', err);
      setError('Failed to start speech recognition');
    }
  };

  // Stop recording
  const stopRecording = async () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }

    await endTranscriptionSession();

    setIsRecording(false);
    setIsPaused(false);
    setAudioLevel(0);
    setInterimText('');
    setIsProcessing(false);
  };

  // Pause/Resume recording
  const togglePause = () => {
    if (recognitionRef.current) {
      if (isPaused) {
        recognitionRef.current.start();
        monitorAudioLevel();
      } else {
        recognitionRef.current.stop();
      }
      setIsPaused(!isPaused);
    }
  };

  // Export transcripts
  const exportTranscripts = () => {
    const content = transcripts.map(t => 
      `[${new Date(t.timestamp).toLocaleTimeString()}] ${t.speaker}: ${t.text}`
    ).join('\n');

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `meeting-transcript-${meetingId}-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isRecording) {
        stopRecording();
      }
    };
  }, [isRecording]);

  return (
    <div className="bg-linear-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-400" />
            <h3 className="text-lg font-semibold text-white">Live Transcription</h3>
          </div>
          
          {sessionId && (
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-emerald-400">Session Active</span>
            </div>
          )}

          {isProcessing && (
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-blue-400">Processing</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Audio Level Indicator */}
          {isRecording && (
            <div className="flex items-center gap-2">
              {audioLevel > 10 ? (
                <Volume2 className="w-4 h-4 text-zinc-400" />
              ) : (
                <VolumeX className="w-4 h-4 text-zinc-500" />
              )}
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-1 h-4 rounded-full transition-colors ${
                      audioLevel > (i + 1) * 20
                        ? 'bg-emerald-500'
                        : 'bg-zinc-700'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Export Button */}
          {transcripts.length > 0 && (
            <button
              onClick={exportTranscripts}
              className="flex items-center gap-2 px-3 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg transition-colors"
              title="Export transcripts"
            >
              <Download className="w-4 h-4" />
            </button>
          )}

          {/* Control Buttons */}
          <div className="flex gap-2">
            {!isRecording ? (
              <button
                onClick={startRecording}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
              >
                <Mic className="w-4 h-4" />
                Start Recording
              </button>
            ) : (
              <>
                <button
                  onClick={togglePause}
                  className="flex items-center gap-2 px-3 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg transition-colors"
                >
                  {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                </button>
                <button
                  onClick={stopRecording}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  <Square className="w-4 h-4" />
                  Stop
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Recording Status */}
      <div className="flex items-center gap-4 mb-4 p-3 bg-zinc-800/50 rounded-lg">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${
            isRecording ? (isPaused ? 'bg-yellow-500' : 'bg-red-500 animate-pulse') : 'bg-zinc-500'
          }`} />
          <span className="text-sm text-zinc-300">
            {isRecording ? (isPaused ? 'Paused' : 'Recording') : 'Stopped'}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-zinc-400" />
          <span className="text-sm text-zinc-400">
            {transcripts.length} transcript{transcripts.length !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-zinc-400" />
          <select
            value={currentSpeaker}
            onChange={(e) => setCurrentSpeaker(e.target.value)}
            className="text-sm bg-zinc-700 border border-zinc-600 rounded px-2 py-1 text-white"
            disabled={isRecording}
          >
            <option value="You">You</option>
            {participants.map((participant, index) => (
              <option key={index} value={participant}>
                {participant}
              </option>
            ))}
            <option value="Speaker 1">Speaker 1</option>
            <option value="Speaker 2">Speaker 2</option>
            <option value="Speaker 3">Speaker 3</option>
            <option value="Speaker 4">Speaker 4</option>
          </select>
        </div>

        {sessionId && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-500">
              Session: {sessionId.slice(-8)}
            </span>
          </div>
        )}
      </div>

      {/* Transcript Display */}
      <div className="h-96 overflow-y-auto border border-zinc-700 rounded-lg p-4 bg-zinc-900/50">
        {transcripts.length === 0 && !interimText ? (
          <div className="flex items-center justify-center h-full text-zinc-500">
            <div className="text-center">
              <MicOff className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No transcripts yet</p>
              <p className="text-xs">Start recording to see live transcription</p>
              <p className="text-xs mt-2 text-zinc-600">
                Using Web Speech API for real-time transcription
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {transcripts.map((transcript) => (
                <motion.div
                  key={transcript.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="flex gap-3 p-3 bg-zinc-800/30 rounded-lg"
                >
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                      <span className="text-xs font-medium text-emerald-400">
                        {transcript.speaker.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-zinc-300">
                        {transcript.speaker}
                      </span>
                      <span className="text-xs text-zinc-500">
                        {new Date(transcript.timestamp).toLocaleTimeString()}
                      </span>
                      <div className="flex items-center gap-1">
                        <div className={`w-2 h-2 rounded-full ${
                          transcript.confidence > 0.8 ? 'bg-emerald-500' :
                          transcript.confidence > 0.6 ? 'bg-yellow-500' : 'bg-red-500'
                        }`} />
                        <span className="text-xs text-zinc-500">
                          {Math.round(transcript.confidence * 100)}%
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-white break-words">{transcript.text}</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Interim Text */}
            {interimText && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-3 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg"
              >
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <span className="text-xs font-medium text-blue-400">
                      {currentSpeaker.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-blue-300">
                      {currentSpeaker}
                    </span>
                    <span className="text-xs text-blue-500">speaking...</span>
                  </div>
                  <p className="text-sm text-blue-100 break-words italic">{interimText}</p>
                </div>
              </motion.div>
            )}

            <div ref={transcriptEndRef} />
          </div>
        )}
      </div>

      {/* Info Footer */}
      <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
        <p className="text-blue-400 text-xs">
          <strong>Real-time Transcription:</strong> Using Web Speech API for instant transcription. 
          All transcripts are processed and stored securely for meeting analysis.
          {sessionId && ` Session ID: ${sessionId}`}
        </p>
      </div>
    </div>
  );
}