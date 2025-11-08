'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Video, Users, ArrowRight, Check, AlertCircle } from 'lucide-react';
import { useSession, signIn } from 'next-auth/react';
import Link from 'next/link';
import Navbar from '../components/Navbar';

export default function SchedulePage() {
  const { data: session, status } = useSession();
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    time: '',
    duration: '30',
    platform: 'google-meet',
    participants: '',
    description: '',
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [meetingData, setMeetingData] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Check if user is authenticated with Google
    if (!session?.accessToken) {
      setError('Please sign in with Google to create calendar events');
      setLoading(false);
      return;
    }

    try {
      // Validate date and time
      if (!formData.date || !formData.time) {
        setError('Please select both date and time');
        setLoading(false);
        return;
      }

      // Create ISO datetime strings
      const startDateTime = new Date(`${formData.date}T${formData.time}`);
      
      // Check if date is valid
      if (isNaN(startDateTime.getTime())) {
        setError('Invalid date or time format');
        setLoading(false);
        return;
      }

      const duration = parseInt(formData.duration) || 30;
      const endDateTime = new Date(startDateTime.getTime() + duration * 60000);

      const participants = formData.participants
        .split(',')
        .map(email => email.trim())
        .filter(email => email.length > 0);

      const response = await fetch('/api/meetings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          startTime: startDateTime.toISOString(),
          endTime: endDateTime.toISOString(),
          timeZone: formData.timeZone,
          attendees: participants,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create meeting');
      }

      setMeetingData(result);
      setSubmitted(true);
      
      // Log email invitation results
      if (result.emailInvitations) {
        console.log(`📧 Email invitations: ${result.emailInvitations.sent}/${result.emailInvitations.total} sent successfully`);
      }
    } catch (error) {
      console.error('Error creating meeting:', error);
      setError(error instanceof Error ? error.message : 'Failed to create meeting');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (submitted && meetingData) {
    return (
      <div className="min-h-screen bg-[#0f0f0f]">
        <Navbar />
        <div className="min-h-screen flex items-center justify-center px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md w-full text-center"
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <Check className="w-10 h-10 text-emerald-500" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">Meeting Scheduled!</h2>
            <p className="text-zinc-400 mb-6">
              Your meeting "{meetingData.meeting?.title}" has been scheduled successfully. 
              {meetingData.emailInvitations ? (
                <>
                  <br />
                  📧 Invitations sent to {meetingData.emailInvitations.sent} out of {meetingData.emailInvitations.total} participants.
                </>
              ) : null}
            </p>
            
            {meetingData.meeting?.meetingLink && (
              <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4 mb-6">
                <p className="text-sm text-zinc-400 mb-2">Google Meet Link:</p>
                <a
                  href={meetingData.meeting.meetingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 text-sm break-all"
                >
                  {meetingData.meeting.meetingLink}
                </a>
              </div>
            )}

            {/* Email Invitation Status */}
            {meetingData.emailInvitations && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <Check className="w-4 h-4 text-emerald-500" />
                  <p className="text-sm text-emerald-400 font-medium">Email Invitations Sent</p>
                </div>
                <div className="text-xs text-emerald-300">
                  <p>✅ Successfully sent: {meetingData.emailInvitations.sent}</p>
                  {meetingData.emailInvitations.failed > 0 && (
                    <p>❌ Failed to send: {meetingData.emailInvitations.failed}</p>
                  )}
                  <p className="mt-2 text-emerald-400">
                    All participants will receive a professional invitation email with meeting details and join link.
                  </p>
                </div>
              </div>
            )}
            
            <div className="space-y-3">
              {meetingData.meeting?.id && meetingData.meeting?.meetingLink && (
                <>
                  <button
                    onClick={async () => {
                      // Start transcription session
                      try {
                        const response = await fetch('/api/meetings/join', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ 
                            meetingId: meetingData.meeting.id,
                            action: 'join' 
                          }),
                        });

                        if (response.ok) {
                          const data = await response.json();
                          console.log('✅ Transcription session started:', data.transcriptionSessionId);
                          
                          // Store session ID in localStorage for background transcription
                          localStorage.setItem('activeTranscriptionSession', JSON.stringify({
                            sessionId: data.transcriptionSessionId,
                            meetingId: meetingData.meeting.id,
                            meetingLink: meetingData.meeting.meetingLink,
                            startTime: new Date().toISOString(),
                          }));
                          
                          // Open Google Meet in new tab FIRST
                          const meetWindow = window.open(meetingData.meeting.meetingLink, '_blank');
                          
                          // Wait a moment to ensure Google Meet opens
                          setTimeout(() => {
                            // Then navigate current tab to transcribe page
                            window.location.href = '/transcribe';
                          }, 500);
                        }
                      } catch (error) {
                        console.error('Error starting transcription:', error);
                        alert('Failed to start transcription. Opening Google Meet anyway...');
                        window.open(meetingData.meeting.meetingLink, '_blank');
                      }
                    }}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-full font-medium hover:bg-emerald-700 transition-all w-full"
                  >
                    <Video className="w-4 h-4" />
                    Join Google Meet + Start Transcription
                  </button>
                  <div className="text-xs text-zinc-500 text-center">
                    💡 Opens Google Meet in new tab & monitors transcription
                  </div>
                </>
              )}
              <Link
                href="/dashboard"
                className="block px-6 py-3 bg-white text-black rounded-full font-medium hover:bg-zinc-200 transition-all"
              >
                Go to Dashboard
              </Link>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setMeetingData(null);
                  setFormData({
                    title: '',
                    date: '',
                    time: '',
                    duration: '30',
                    platform: 'google-meet',
                    participants: '',
                    description: '',
                    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                  });
                }}
                className="block w-full px-6 py-3 bg-zinc-800 text-white rounded-full font-medium hover:bg-zinc-700 transition-all"
              >
                Schedule Another Meeting
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      <Navbar />
      
      <div className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Schedule a Meeting
            </h1>
            <p className="text-xl text-zinc-400">
              Our AI will automatically join, transcribe, and analyze your call
            </p>
            
            {!session && (
              <div className="mt-6 p-6 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <div className="text-center">
                  <p className="text-blue-400 text-sm mb-4">
                    Sign in with Google to automatically create calendar events and Meet links
                  </p>
                  <button
                    onClick={() => signIn('google')}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Sign in with Google
                  </button>
                </div>
              </div>
            )}
          </motion.div>

          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            onSubmit={handleSubmit}
            className="bg-linear-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-2xl p-8"
          >
            {!session?.accessToken && (
              <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
                <div>
                  <p className="text-amber-400 text-sm font-medium">Google Sign-in Required</p>
                  <p className="text-amber-300 text-xs mt-1">
                    You need to sign in with Google to create calendar events with Meet links.
                  </p>
                </div>
              </div>
            )}
            
            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}
            <div className="space-y-6">
              {/* Meeting Title */}
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Meeting Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600"
                  placeholder="e.g., Sales Review Meeting"
                />
              </div>

              {/* Date and Time */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    <Calendar className="inline w-4 h-4 mr-1" />
                    Date *
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    <Clock className="inline w-4 h-4 mr-1" />
                    Time *
                  </label>
                  <input
                    type="time"
                    name="time"
                    value={formData.time}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600"
                  />
                </div>
              </div>

              {/* Duration and Platform */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    <Clock className="inline w-4 h-4 mr-1" />
                    Duration (minutes) *
                  </label>
                  <select
                    name="duration"
                    value={formData.duration}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600"
                  >
                    <option value="15">15 minutes</option>
                    <option value="30">30 minutes</option>
                    <option value="45">45 minutes</option>
                    <option value="60">1 hour</option>
                    <option value="90">1.5 hours</option>
                    <option value="120">2 hours</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    <Video className="inline w-4 h-4 mr-1" />
                    Platform *
                  </label>
                  <select
                    name="platform"
                    value={formData.platform}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600"
                  >
                    <option value="google-meet">Google Meet</option>
                    <option value="zoom">Zoom</option>
                    <option value="teams">Microsoft Teams</option>
                  </select>
                </div>
              </div>

              {/* Participants */}
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  <Users className="inline w-4 h-4 mr-1" />
                  Participants (Email addresses, comma-separated)
                </label>
                <input
                  type="text"
                  name="participants"
                  value={formData.participants}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600"
                  placeholder="john@example.com, jane@example.com"
                />
                <div className="mt-2 text-xs text-zinc-500">
                  💌 All participants will automatically receive professional invitation emails with meeting details and join link.
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Meeting Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 resize-none"
                  placeholder="Add any additional context or agenda items..."
                />
              </div>

              {/* AI Features */}
              <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-3">🤖 AI Features & Automation</h3>
                <div className="grid md:grid-cols-2 gap-3 text-sm text-zinc-400">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500" />
                    Real-time transcription
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500" />
                    Sentiment analysis
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500" />
                    Action item extraction
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500" />
                    Automatic task creation
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500" />
                    Meeting summary generation
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500" />
                    📧 Auto email invitations
                  </div>
                </div>
                <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <p className="text-xs text-blue-400">
                    💌 <strong>Email Automation:</strong> Professional invitation emails will be automatically sent to all participants with meeting details, calendar integration, and join links.
                  </p>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !session?.accessToken}
                className="w-full px-6 py-4 bg-white hover:bg-zinc-200 disabled:bg-zinc-700 disabled:cursor-not-allowed text-black disabled:text-zinc-400 rounded-full font-medium text-lg transition-all hover:shadow-2xl hover:shadow-white/20 hover:scale-[1.02] flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
                    Creating Meeting...
                  </>
                ) : !session?.accessToken ? (
                  <>
                    Sign in with Google Required
                  </>
                ) : (
                  <>
                    Schedule Meeting
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </motion.form>

          {/* Info Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-8 text-center text-sm text-zinc-500"
          >
            <p>
              By scheduling a meeting, you grant Tea permission to join and record your call.
              All data is encrypted and stored securely.
            </p>
          </motion.div>
          
        </div>
      </div>
    </div>
  );
}
