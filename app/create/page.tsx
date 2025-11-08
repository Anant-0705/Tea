'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft,
  Calendar, 
  Clock, 
  Users, 
  Video,
  Globe,
  Lock,
  Plus,
  X,
  Save,
  Send,
  Mic,
  Settings,
  Bot,
  FileText,
  Zap
} from 'lucide-react';
import Link from 'next/link';

export default function CreateMeetingPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    duration: '30',
    timezone: 'GMT+05:30',
    isRecurring: false,
    recurringType: 'weekly',
    meetingType: 'video',
    privacy: 'private',
    participants: [] as string[],
    enableAI: true,
    autoRecord: true,
    enableTranscription: true,
    generateMoM: true,
    smartSuggestions: true
  });

  const [participantEmail, setParticipantEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addParticipant = () => {
    if (participantEmail && !formData.participants.includes(participantEmail)) {
      setFormData(prev => ({
        ...prev,
        participants: [...prev.participants, participantEmail]
      }));
      setParticipantEmail('');
    }
  };

  const removeParticipant = (email: string) => {
    setFormData(prev => ({
      ...prev,
      participants: prev.participants.filter(p => p !== email)
    }));
  };

  const handleSubmit = async (action: 'save' | 'schedule') => {
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Redirect to meetings page
    router.push('/dashboard/meet');
  };

  const durations = [
    { value: '15', label: '15 minutes' },
    { value: '30', label: '30 minutes' },
    { value: '45', label: '45 minutes' },
    { value: '60', label: '1 hour' },
    { value: '90', label: '1.5 hours' },
    { value: '120', label: '2 hours' },
    { value: 'custom', label: 'Custom' }
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="pb-20">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4 mb-8"
          >
            <Link
              href="/dashboard"
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors border border-gray-200"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-black">
                Create New Meeting
              </h1>
              <p className="text-gray-600">Schedule an AI-powered meeting with intelligent features</p>
            </div>
          </motion.div>

          <form className="space-y-8">
            {/* Basic Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white border border-gray-200 rounded-xl p-6 shadow-lg"
            >
              <h2 className="text-lg font-semibold text-black mb-6 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-500" />
                Meeting Details
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meeting Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Enter meeting title"
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-black placeholder-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors"
                    required
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="What will you discuss in this meeting?"
                    rows={3}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-black placeholder-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors resize-none"
                  />
                </div>
              </div>
            </motion.div>

            {/* Schedule */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white border border-gray-200 rounded-xl p-6 shadow-lg"
            >
              <h2 className="text-lg font-semibold text-black mb-6 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-emerald-500" />
                Schedule
              </h2>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleInputChange('date', e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-black focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Time *
                  </label>
                  <input
                    type="time"
                    value={formData.time}
                    onChange={(e) => handleInputChange('time', e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-black focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration *
                  </label>
                  <select
                    value={formData.duration}
                    onChange={(e) => handleInputChange('duration', e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-black focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors"
                  >
                    {durations.map(duration => (
                      <option key={duration.value} value={duration.value}>
                        {duration.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-6">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={formData.isRecurring}
                    onChange={(e) => handleInputChange('isRecurring', e.target.checked)}
                    className="w-4 h-4 text-emerald-600 bg-white border-gray-300 rounded focus:ring-emerald-500"
                  />
                  <span className="text-gray-700">Make this a recurring meeting</span>
                </label>
              </div>
            </motion.div>

            {/* Participants */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-xl p-6"
            >
              <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-400" />
                Participants
              </h2>
              
              <div className="flex gap-3 mb-4">
                <input
                  type="email"
                  value={participantEmail}
                  onChange={(e) => setParticipantEmail(e.target.value)}
                  placeholder="Enter participant email"
                  className="flex-1 px-4 py-3 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-white placeholder-zinc-400 focus:border-blue-500/50 focus:outline-none transition-colors"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addParticipant())}
                />
                <button
                  type="button"
                  onClick={addParticipant}
                  className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add
                </button>
              </div>

              {formData.participants.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm text-zinc-400 mb-3">
                    {formData.participants.length} participant(s) added:
                  </p>
                  {formData.participants.map((email, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-zinc-800/30 rounded-lg">
                      <span className="text-white">{email}</span>
                      <button
                        type="button"
                        onClick={() => removeParticipant(email)}
                        className="p-1 hover:bg-zinc-700/50 rounded text-zinc-400 hover:text-red-400 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* AI Features */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-xl p-6"
            >
              <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                <Bot className="w-5 h-5 text-cyan-400" />
                AI-Powered Features
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={formData.enableAI}
                      onChange={(e) => handleInputChange('enableAI', e.target.checked)}
                      className="w-4 h-4 text-blue-600 bg-zinc-800 border-zinc-600 rounded focus:ring-blue-500"
                    />
                    <div>
                      <span className="text-zinc-300">Enable AI Analysis</span>
                      <p className="text-xs text-zinc-500">Real-time sentiment and engagement tracking</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={formData.autoRecord}
                      onChange={(e) => handleInputChange('autoRecord', e.target.checked)}
                      className="w-4 h-4 text-blue-600 bg-zinc-800 border-zinc-600 rounded focus:ring-blue-500"
                    />
                    <div>
                      <span className="text-zinc-300">Auto Recording</span>
                      <p className="text-xs text-zinc-500">Automatically record the meeting</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={formData.enableTranscription}
                      onChange={(e) => handleInputChange('enableTranscription', e.target.checked)}
                      className="w-4 h-4 text-blue-600 bg-zinc-800 border-zinc-600 rounded focus:ring-blue-500"
                    />
                    <div>
                      <span className="text-zinc-300">Live Transcription</span>
                      <p className="text-xs text-zinc-500">Real-time speech-to-text conversion</p>
                    </div>
                  </label>
                </div>

                <div className="space-y-4">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={formData.generateMoM}
                      onChange={(e) => handleInputChange('generateMoM', e.target.checked)}
                      className="w-4 h-4 text-blue-600 bg-zinc-800 border-zinc-600 rounded focus:ring-blue-500"
                    />
                    <div>
                      <span className="text-zinc-300">Generate Minutes</span>
                      <p className="text-xs text-zinc-500">AI-generated meeting minutes</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={formData.smartSuggestions}
                      onChange={(e) => handleInputChange('smartSuggestions', e.target.checked)}
                      className="w-4 h-4 text-blue-600 bg-zinc-800 border-zinc-600 rounded focus:ring-blue-500"
                    />
                    <div>
                      <span className="text-zinc-300">Smart Suggestions</span>
                      <p className="text-xs text-zinc-500">AI-powered action items and follow-ups</p>
                    </div>
                  </label>

                  <div className="p-4 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="w-4 h-4 text-cyan-400" />
                      <span className="text-cyan-400 font-medium text-sm">TEAi Pro Features</span>
                    </div>
                    <p className="text-xs text-zinc-400">
                      Advanced analytics, sentiment analysis, and custom workflows available with Pro plan
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Meeting Settings */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-xl p-6"
            >
              <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                <Settings className="w-5 h-5 text-orange-400" />
                Meeting Settings
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Meeting Type
                  </label>
                  <select
                    value={formData.meetingType}
                    onChange={(e) => handleInputChange('meetingType', e.target.value)}
                    className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-white focus:border-blue-500/50 focus:outline-none transition-colors"
                  >
                    <option value="video">Video Conference</option>
                    <option value="audio">Audio Only</option>
                    <option value="hybrid">Hybrid (In-person + Remote)</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Privacy
                  </label>
                  <select
                    value={formData.privacy}
                    onChange={(e) => handleInputChange('privacy', e.target.value)}
                    className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-white focus:border-blue-500/50 focus:outline-none transition-colors"
                  >
                    <option value="private">Private</option>
                    <option value="public">Public</option>
                    <option value="organization">Organization Only</option>
                  </select>
                </div>
              </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col md:flex-row gap-4 justify-end"
            >
              <button
                type="button"
                onClick={() => handleSubmit('save')}
                disabled={isSubmitting}
                className="px-6 py-3 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg transition-colors flex items-center gap-2 justify-center"
              >
                <Save className="w-4 h-4" />
                Save Draft
              </button>
              
              <button
                type="button"
                onClick={() => handleSubmit('schedule')}
                disabled={isSubmitting || !formData.title || !formData.date || !formData.time}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg transition-all duration-200 flex items-center gap-2 justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Scheduling...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Schedule Meeting
                  </>
                )}
              </button>
            </motion.div>
          </form>
        </div>
      </div>
    </div>
  );
}