'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import BackgroundTranscription from '@/components/BackgroundTranscription';
import { Video, ArrowRight, CheckCircle } from 'lucide-react';

export default function TranscribePage() {
  const router = useRouter();
  const [sessionInfo, setSessionInfo] = useState<any>(null);
  const [showWidget, setShowWidget] = useState(false);

  useEffect(() => {
    // Check for active transcription session
    const sessionData = localStorage.getItem('activeTranscriptionSession');
    if (sessionData) {
      const session = JSON.parse(sessionData);
      setSessionInfo(session);
      setShowWidget(true);
    }
  }, []);

  const handleClose = () => {
    setShowWidget(false);
    router.push('/dashboard');
  };

  if (!sessionInfo) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Video className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-black mb-2">No Active Transcription</h2>
          <p className="text-gray-600 mb-6">Schedule a meeting to start transcription</p>
          <button
            onClick={() => router.push('/schedule')}
            className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors"
          >
            Schedule Meeting
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-emerald-600" />
          </div>
          <h1 className="text-4xl font-bold text-black mb-4">
            Transcription Active
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Your meeting is being transcribed in the background
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-8 mb-8 shadow-lg">
          <h2 className="text-xl font-semibold text-black mb-6">What's Happening:</h2>
          
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center shrink-0">
                <span className="text-emerald-600 font-bold">1</span>
              </div>
              <div>
                <h3 className="text-black font-medium mb-1">Audio Capture</h3>
                <p className="text-gray-600 text-sm">
                  Your microphone is capturing audio and sending it to the transcription server
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center shrink-0">
                <span className="text-emerald-600 font-bold">2</span>
              </div>
              <div>
                <h3 className="text-black font-medium mb-1">Real-Time Transcription</h3>
                <p className="text-gray-600 text-sm">
                  Speech is being converted to text and stored in Firestore
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center shrink-0">
                <span className="text-emerald-600 font-bold">3</span>
              </div>
              <div>
                <h3 className="text-black font-medium mb-1">Background Processing</h3>
                <p className="text-gray-600 text-sm">
                  You can close this tab - transcription continues in the background
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                <span className="text-blue-600 font-bold">4</span>
              </div>
              <div>
                <h3 className="text-black font-medium mb-1">AI Analysis (After Meeting)</h3>
                <p className="text-gray-600 text-sm">
                  When you end the meeting, Vertex AI will analyze everything and extract insights
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
          <h3 className="text-black font-semibold mb-3">💡 Pro Tips:</h3>
          <ul className="space-y-2 text-gray-700 text-sm">
            <li>• Keep this browser tab open for best results</li>
            <li>• Make sure your microphone is not muted</li>
            <li>• Speak clearly for better transcription accuracy</li>
            <li>• Use the floating widget to monitor progress</li>
            <li>• Click "End Meeting & Analyze" when your Google Meet ends</li>
          </ul>
        </div>

        <div className="flex gap-4">
          {sessionInfo.meetingLink && (
            <a
              href={sessionInfo.meetingLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Video className="w-4 h-4" />
              Open Google Meet
            </a>
          )}
          <button
            onClick={() => router.push('/dashboard')}
            className="flex-1 px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            Go to Dashboard
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Background Transcription Widget */}
      {showWidget && <BackgroundTranscription onClose={handleClose} />}
    </div>
  );
}
