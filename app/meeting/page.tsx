'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Phone, 
  Users, 
  MessageSquare,
  FileText,
  Share2,
  Settings,
  Download
} from 'lucide-react';
import LiveTranscription from '@/app/components/transcription/LiveTranscription';

interface MeetingData {
  id: string;
  title: string;
  description: string;
  startTime: string;
  duration: number;
  participants: string[];
  meetLink: string;
}

export default function MeetingRoom() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const meetingId = searchParams.get('id') || '';

  const [meetingData, setMeetingData] = useState<MeetingData | null>(null);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [activeTab, setActiveTab] = useState<'transcription' | 'chat' | 'participants'>('transcription');
  const [transcriptSession, setTranscriptSession] = useState<string>('');
  const [meetingAnalysis, setMeetingAnalysis] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasJoined, setHasJoined] = useState(false);
  const [autoTranscriptionEnabled, setAutoTranscriptionEnabled] = useState(true);

  // Fetch meeting data
  useEffect(() => {
    const fetchMeetingData = async () => {
      if (!meetingId) return;

      try {
        // In a real app, this would fetch from your meetings API
        // For now, we'll simulate meeting data
        const mockMeetingData: MeetingData = {
          id: meetingId,
          title: 'Team Standup Meeting',
          description: 'Daily team standup and project updates',
          startTime: new Date().toISOString(),
          duration: 30,
          participants: [
            session?.user?.email || 'you@example.com',
            'john.doe@company.com',
            'sarah.smith@company.com',
            'mike.johnson@company.com'
          ],
          meetLink: `https://meet.google.com/${meetingId}`,
        };

        setMeetingData(mockMeetingData);
        setIsLoading(false);
      } catch (error) {
        setIsLoading(false);
      }
    };

    fetchMeetingData();
  }, [meetingId, session]);

  // Auto-join meeting and start transcription
  const joinMeeting = async () => {
    if (!meetingId || hasJoined) return;

    try {
      const response = await fetch(`/api/meetings/${meetingId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'join' }),
      });

      if (response.ok) {
        const data = await response.json();
        setHasJoined(true);
        setTranscriptSession(data.transcriptionSessionId);
        
        // Auto-start recording if enabled
        if (autoTranscriptionEnabled) {
          setIsRecording(true);
        }
      }
    } catch (error) {
      // Error handling without console logging
    }
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
  };

  const handleTranscriptionStart = (sessionId: string) => {
    setTranscriptSession(sessionId);
  };

  const handleTranscriptionEnd = async (analysis: any) => {
    setMeetingAnalysis(analysis);
    
    // Trigger Vertex AI analysis
    try {
      const response = await fetch(`/api/meetings/${meetingId}/analyze`, {
        method: 'POST',
      });

      if (response.ok) {
        const data = await response.json();
        setMeetingAnalysis(data.analysis);
      }
    } catch (error) {
      // Error handling without console logging
    }
  };

  const joinGoogleMeet = () => {
    if (meetingData?.meetLink) {
      window.open(meetingData.meetLink, '_blank');
    }
  };

  const endMeeting = async () => {
    if (isRecording) {
      setIsRecording(false);
    }
    
    // Leave meeting and trigger analysis
    if (hasJoined && meetingId) {
      try {
        await fetch(`/api/meetings/${meetingId}/join`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'leave' }),
        });
      } catch (error) {
        // Error handling without console logging
      }
    }
    
    // Redirect to meeting details page
    window.location.href = `/dashboard/meet/${meetingId}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-zinc-400">Loading meeting room...</p>
        </div>
      </div>
    );
  }

  if (!meetingData) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Meeting Not Found</h1>
          <p className="text-zinc-400 mb-4">The requested meeting could not be found.</p>
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <div className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div>
                <h1 className="text-xl font-semibold text-white">{meetingData.title}</h1>
                <p className="text-sm text-zinc-400">{meetingData.description}</p>
              </div>
              
              {transcriptSession && (
                <div className="flex items-center space-x-2 px-3 py-1 bg-emerald-500/20 rounded-full">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-emerald-400">Recording</span>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-3">
              {/* Meeting Controls */}
              <button
                onClick={() => setIsVideoOn(!isVideoOn)}
                className={`p-3 rounded-full transition-colors ${
                  isVideoOn 
                    ? 'bg-zinc-700 hover:bg-zinc-600 text-white' 
                    : 'bg-red-600 hover:bg-red-700 text-white'
                }`}
                title={isVideoOn ? 'Turn off video' : 'Turn on video'}
              >
                {isVideoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
              </button>

              <button
                onClick={() => setIsAudioOn(!isAudioOn)}
                className={`p-3 rounded-full transition-colors ${
                  isAudioOn 
                    ? 'bg-zinc-700 hover:bg-zinc-600 text-white' 
                    : 'bg-red-600 hover:bg-red-700 text-white'
                }`}
                title={isAudioOn ? 'Mute' : 'Unmute'}
              >
                {isAudioOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
              </button>

              <button
                onClick={joinGoogleMeet}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center space-x-2"
              >
                <Video className="w-4 h-4" />
                <span>Join Meet</span>
              </button>

              <button
                onClick={endMeeting}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center space-x-2"
              >
                <Phone className="w-4 h-4" />
                <span>End</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Video/Meeting Area */}
          <div className="lg:col-span-2">
            <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6 h-96 flex items-center justify-center">
              <div className="text-center">
                {!hasJoined ? (
                  <>
                    <Video className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-zinc-300 mb-2">Ready to Join</h3>
                    <p className="text-zinc-500 mb-6">
                      Click below to join the meeting and start automatic transcription
                    </p>
                    <button
                      onClick={joinMeeting}
                      className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors flex items-center space-x-2 mx-auto mb-4"
                    >
                      <Video className="w-5 h-5" />
                      <span>Join Meeting & Start Transcription</span>
                    </button>
                    <div className="flex items-center justify-center space-x-4 text-sm text-zinc-400">
                      <div className="flex items-center space-x-1">
                        <Users className="w-4 h-4" />
                        <span>{meetingData.participants.length} participants</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                        <span>Ready to join</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Video className="w-8 h-8 text-emerald-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-emerald-300 mb-2">Meeting Active</h3>
                    <p className="text-zinc-500 mb-4">
                      Transcription is running. Check the side panel for live transcripts.
                    </p>
                    <div className="flex items-center justify-center space-x-4 text-sm">
                      <div className="flex items-center space-x-1 text-emerald-400">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                        <span>Recording</span>
                      </div>
                      <div className="flex items-center space-x-1 text-zinc-400">
                        <Users className="w-4 h-4" />
                        <span>{meetingData.participants.length} participants</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Meeting Info */}
            <div className="mt-6 bg-zinc-900 rounded-xl border border-zinc-800 p-6">
              <h3 className="text-lg font-semibold mb-4">Meeting Information</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-zinc-400">Start Time:</span>
                  <p className="text-white">{new Date(meetingData.startTime).toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-zinc-400">Duration:</span>
                  <p className="text-white">{meetingData.duration} minutes</p>
                </div>
                <div>
                  <span className="text-zinc-400">Meeting ID:</span>
                  <p className="text-white font-mono">{meetingData.id}</p>
                </div>
                <div>
                  <span className="text-zinc-400">Participants:</span>
                  <p className="text-white">{meetingData.participants.length} invited</p>
                </div>
              </div>
            </div>
          </div>

          {/* Side Panel */}
          <div className="lg:col-span-1">
            {/* Tab Navigation */}
            <div className="bg-zinc-900 rounded-t-xl border-x border-t border-zinc-800">
              <div className="flex">
                <button
                  onClick={() => setActiveTab('transcription')}
                  className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                    activeTab === 'transcription'
                      ? 'bg-emerald-600 text-white'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                  }`}
                >
                  <FileText className="w-4 h-4 inline mr-2" />
                  Transcription
                </button>
                <button
                  onClick={() => setActiveTab('participants')}
                  className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                    activeTab === 'participants'
                      ? 'bg-emerald-600 text-white'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                  }`}
                >
                  <Users className="w-4 h-4 inline mr-2" />
                  Participants
                </button>
              </div>
            </div>

            {/* Tab Content */}
            <div className="bg-zinc-900 rounded-b-xl border-x border-b border-zinc-800 min-h-[600px]">
              {activeTab === 'transcription' && (
                <div className="p-0">
                  <LiveTranscription
                    meetingId={meetingData.id}
                    participants={meetingData.participants}
                    onTranscriptUpdate={(transcript) => {
                      // Handle transcript updates silently
                    }}
                    onSessionStart={handleTranscriptionStart}
                    onSessionEnd={handleTranscriptionEnd}
                  />
                </div>
              )}

              {activeTab === 'participants' && (
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Participants ({meetingData.participants.length})</h3>
                  <div className="space-y-3">
                    {meetingData.participants.map((participant, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 bg-zinc-800/50 rounded-lg">
                        <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                          <span className="text-sm font-medium text-emerald-400">
                            {participant.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-white">{participant}</p>
                          <p className="text-xs text-zinc-400">
                            {index === 0 ? 'Organizer' : 'Participant'}
                          </p>
                        </div>
                        <div className="flex items-center space-x-1">
                          <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                          <span className="text-xs text-zinc-400">Ready</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Meeting Analysis */}
        {meetingAnalysis && (
          <div className="mt-6 bg-zinc-900 rounded-xl border border-zinc-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Meeting Analysis</h3>
              <button className="flex items-center space-x-2 px-3 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-lg transition-colors">
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-zinc-800/50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-zinc-400 mb-1">Duration</h4>
                <p className="text-2xl font-bold text-white">{Math.round(meetingAnalysis.duration / 60)}m</p>
              </div>
              <div className="bg-zinc-800/50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-zinc-400 mb-1">Total Words</h4>
                <p className="text-2xl font-bold text-white">{meetingAnalysis.totalWords}</p>
              </div>
              <div className="bg-zinc-800/50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-zinc-400 mb-1">Speakers</h4>
                <p className="text-2xl font-bold text-white">{meetingAnalysis.speakerCount}</p>
              </div>
            </div>

            <div className="bg-zinc-800/30 rounded-lg p-4">
              <h4 className="text-sm font-medium text-zinc-400 mb-2">Full Transcript</h4>
              <div className="max-h-40 overflow-y-auto">
                <p className="text-sm text-zinc-300 whitespace-pre-wrap">{meetingAnalysis.fullTranscript}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}