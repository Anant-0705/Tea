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
    } catch (error) {
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
      <div className="min-h-screen bg-white">
          <Navbar />
        <div className="min-h-screen flex items-center justify-center px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md w-full text-center"
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-100 flex items-center justify-center">
              <Check className="w-10 h-10 text-emerald-600" />
            </div>
            <h2 className="text-3xl font-bold text-black mb-4">Meeting Scheduled!</h2>
            <p className="text-gray-600 mb-6">
              Your meeting "{meetingData.meeting?.title}" has been scheduled successfully. 
              {meetingData.emailInvitations ? (
                <>
                  <br />
                   Invitations sent to {meetingData.emailInvitations.sent} out of {meetingData.emailInvitations.total} participants.
                </>
              ) : null}
            </p>
            
            {meetingData.meeting?.meetingLink && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-600 mb-2">Google Meet Link:</p>
                <a
                  href={meetingData.meeting.meetingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-600 hover:text-emerald-700 text-sm break-all underline"
                >
                  {meetingData.meeting.meetingLink}
                </a>
              </div>
            )}

            {/* Email Invitation Status */}
  
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
                        alert('Failed to start transcription. Opening Google Meet anyway...');
                        window.open(meetingData.meeting.meetingLink, '_blank');
                      }
                    }}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-full font-medium hover:bg-emerald-700 transition-all w-full"
                  >
                    <Video className="w-4 h-4" />
                    Join Google Meet
                  </button>
               
                </>
              )}

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
                className="block w-full px-6 py-3 bg-gray-100 text-black rounded-full font-medium hover:bg-gray-200 transition-all border border-gray-200"
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
    <div className="min-h-screen bg-white">

      
      <div className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-black mb-4">
              Schedule a Meeting
            </h1>
            <p className="text-xl text-gray-600">
              Our AI will automatically join, transcribe, and analyze your call
            </p>
            
            {!session && (
              <div className="mt-6 p-6 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="text-center">
                  <p className="text-blue-600 text-sm mb-4">
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
            className="bg-white border border-gray-200 rounded-2xl p-8 shadow-lg"
          >
            {!session?.accessToken && (
              <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                <div>
                  <p className="text-amber-600 text-sm font-medium">Google Sign-in Required</p>
                  <p className="text-amber-700 text-xs mt-1">
                    You need to sign in with Google to create calendar events with Meet links.
                  </p>
                </div>
              </div>
            )}
            
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}
            <div className="space-y-6">
              {/* Meeting Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meeting Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-black placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  placeholder="e.g., Sales Review Meeting"
                />
              </div>

              {/* Date and Time */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="inline w-4 h-4 mr-1" />
                    Date *
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-black focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Clock className="inline w-4 h-4 mr-1" />
                    Time *
                  </label>
                  <input
                    type="time"
                    name="time"
                    value={formData.time}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-black focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Duration and Platform */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Clock className="inline w-4 h-4 mr-1" />
                    Duration (minutes) *
                  </label>
                  <select
                    name="duration"
                    value={formData.duration}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-black focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Video className="inline w-4 h-4 mr-1" />
                    Platform *
                  </label>
                  <select
                    name="platform"
                    value={formData.platform}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-black focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="google-meet">Google Meet</option>
                    <option value="zoom">Zoom</option>
                    <option value="teams">Microsoft Teams</option>
                  </select>
                </div>
              </div>

              {/* Participants */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Users className="inline w-4 h-4 mr-1" />
                  Participants (Email addresses, comma-separated)
                </label>
                <input
                  type="text"
                  name="participants"
                  value={formData.participants}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-black placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  placeholder="john@example.com, jane@example.com"
                />
                <div className="mt-2 text-xs text-gray-500">
                   All participants will automatically receive professional invitation emails with meeting details and join link.
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meeting Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-black placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 resize-none"
                  placeholder="Add any additional context or agenda items..."
                />
              </div>

              {/* AI Features */}
              
              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !session?.accessToken}
                className="w-full px-6 py-4 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white disabled:text-gray-500 rounded-full font-medium text-lg transition-all hover:shadow-lg hover:scale-[1.02] flex items-center justify-center gap-2"
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
            className="mt-8 text-center text-sm text-gray-500"
          >
            <p>
              By scheduling a meeting, you grant TEAi permission to join and record your call.
              All data is encrypted and stored securely.
            </p>
          </motion.div>
          
        </div>
      </div>
    </div>
  );
}
