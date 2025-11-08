import { useState, useEffect, useCallback, useRef } from 'react';

export interface TranscriptEntry {
  speaker: string;
  text: string;
  timestamp: string;
  confidence: number;
  isFinal: boolean;
}

export interface UseTranscriptionOptions {
  meetingId: string;
  participants?: string[];
  autoStart?: boolean;
  onTranscript?: (transcript: TranscriptEntry) => void;
  onMeetingEnd?: (transcriptCount: number) => void;
  onError?: (error: Error) => void;
}

export function useTranscription({
  meetingId,
  participants = [],
  autoStart = false,
  onTranscript,
  onMeetingEnd,
  onError,
}: UseTranscriptionOptions) {
  const [isConnected, setIsConnected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [transcripts, setTranscripts] = useState<TranscriptEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const wsRef = useRef<WebSocket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Connect to WebSocket server
  const connect = useCallback(() => {
    try {
      const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080';
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        setIsConnected(true);
        setError(null);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          switch (data.type) {
            case 'connected':
              break;
              
            case 'transcript':
              const transcript: TranscriptEntry = {
                speaker: data.speaker,
                text: data.text,
                timestamp: data.timestamp,
                confidence: data.confidence,
                isFinal: data.isFinal,
              };
              
              setTranscripts(prev => [...prev, transcript]);
              onTranscript?.(transcript);
              break;
              
            case 'meeting_started':
              break;
              
            case 'meeting_ended':
              onMeetingEnd?.(data.transcriptCount);
              break;
              
            default:
              break;
          }
        } catch (error) {
          setError('Failed to parse server response');
        }
      };

      ws.onerror = (error) => {
        setError('Connection error');
        onError?.(new Error('WebSocket connection error'));
      };

      ws.onclose = () => {
        setIsConnected(false);
      };

      wsRef.current = ws;
    } catch (error) {
      setError('Failed to connect');
      onError?.(error as Error);
    }
  }, [onTranscript, onMeetingEnd, onError]);

  // Start meeting transcription
  const startMeeting = useCallback(async () => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      setError('Not connected to transcription server');
      return;
    }

    try {
      // Send start meeting message
      wsRef.current.send(JSON.stringify({
        type: 'start_meeting',
        meetingId,
        participants,
      }));

      // Start audio capture
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
      });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
          
          // Send audio data to server
          if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({
              type: 'audio',
              audioData: event.data,
              meetingId,
            }));
          }
        }
      };

      mediaRecorder.start(1000); // Capture audio in 1-second chunks
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
      setError(null);
    } catch (error) {
      setError('Failed to start recording');
      onError?.(error as Error);
    }
  }, [meetingId, participants, onError]);

  // Stop meeting transcription
  const stopMeeting = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      mediaRecorderRef.current = null;
    }

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'end_meeting',
        meetingId,
      }));
    }

    setIsRecording(false);
    audioChunksRef.current = [];
  }, [meetingId]);

  // Disconnect from server
  const disconnect = useCallback(() => {
    if (isRecording) {
      stopMeeting();
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setIsConnected(false);
  }, [isRecording, stopMeeting]);

  // Auto-connect on mount
  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  // Auto-start if enabled
  useEffect(() => {
    if (autoStart && isConnected && !isRecording) {
      startMeeting();
    }
  }, [autoStart, isConnected, isRecording, startMeeting]);

  return {
    isConnected,
    isRecording,
    transcripts,
    error,
    connect,
    disconnect,
    startMeeting,
    stopMeeting,
  };
}
