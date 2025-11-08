'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  Users, 
  CheckCircle, 
  AlertCircle, 
  Settings,
  Plus,
  Brain,
  Zap,
  TrendingUp,
  ChevronRight,
  X
} from 'lucide-react';

interface SchedulingSuggestion {
  suggestedTime: string;
  duration: number;
  title: string;
  description: string;
  participants: string[];
  reason: string;
  priority: 'low' | 'medium' | 'high';
  actionItemsToDiscuss: string[];
  confidence: number;
}

interface SmartSchedulingRule {
  id: string;
  name: string;
  enabled: boolean;
  trigger: {
    type: 'action_item_due' | 'meeting_completion' | 'deadline_approaching' | 'manual';
    daysBeforeDue?: number;
    actionItemCategories?: string[];
    priorities?: ('low' | 'medium' | 'high')[];
  };
  meetingTemplate: {
    duration: number;
    title: string;
    description: string;
    bufferTimeBefore?: number;
    bufferTimeAfter?: number;
  };
  scheduling: {
    workingHours: {
      start: string;
      end: string;
    };
    excludeWeekends: boolean;
    preferredDays?: ('monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday')[];
    timeSlotPreference: 'morning' | 'afternoon' | 'any';
    minimumAdvanceNotice: number;
  };
  participants: {
    includeOriginalAttendees: boolean;
    additionalEmails?: string[];
    excludeEmails?: string[];
  };
}

interface SmartSchedulingProps {
  meetingId?: string;
  onScheduleSuccess?: (meetingId: string, calendarEventId: string) => void;
}

const SmartScheduling: React.FC<SmartSchedulingProps> = ({ 
  meetingId, 
  onScheduleSuccess 
}) => {
  const [suggestions, setSuggestions] = useState<SchedulingSuggestion[]>([]);
  const [rules, setRules] = useState<SmartSchedulingRule[]>([]);
  const [loading, setLoading] = useState(false);
  const [autoScheduling, setAutoScheduling] = useState(false);
  const [showRuleConfig, setShowRuleConfig] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState<SchedulingSuggestion | null>(null);

  // Load scheduling suggestions
  const loadSuggestions = async () => {
    if (!meetingId) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/automation/calendar-suggestions?meetingId=${meetingId}`);
      const data = await response.json();
      
      if (data.success) {
        setSuggestions(data.suggestions || []);
      }
    } catch (error) {
      // Error handling without console logging
    }
    setLoading(false);
  };

  // Schedule a meeting from suggestion
  const scheduleMeeting = async (suggestion: SchedulingSuggestion, autoSchedule = false) => {
    setAutoScheduling(autoSchedule);
    try {
      const response = await fetch('/api/automation/schedule-meeting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          suggestion,
          meetingId,
          autoSchedule,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        onScheduleSuccess?.(data.meetingId, data.calendarEventId);
        // Remove the scheduled suggestion from the list
        setSuggestions(prev => prev.filter(s => s !== suggestion));
      }
    } catch (error) {
      console.error('Failed to schedule meeting:', error);
    }
    setAutoScheduling(false);
  };

  useEffect(() => {
    loadSuggestions();
  }, [meetingId]);

  const formatDateTime = (isoString: string) => {
    const date = new Date(isoString);
    return {
      date: date.toLocaleDateString('en-US', { 
        weekday: 'short',
        month: 'short', 
        day: 'numeric' 
      }),
      time: date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
    };
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-400 bg-red-500/10 border-red-500/20';
      case 'medium': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      case 'low': return 'text-green-400 bg-green-500/10 border-green-500/20';
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-400';
    if (confidence >= 0.6) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
            <Brain className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">Smart Scheduling</h2>
            <p className="text-gray-400 text-sm">AI-powered meeting automation</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowRuleConfig(!showRuleConfig)}
            className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg border border-gray-700 hover:bg-gray-700 transition-colors flex items-center space-x-2"
          >
            <Settings className="w-4 h-4" />
            <span>Rules</span>
          </button>
          
          <button
            onClick={loadSuggestions}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
          >
            <Zap className="w-4 h-4" />
            <span>{loading ? 'Analyzing...' : 'Generate'}</span>
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-800">
          <div className="flex items-center space-x-3">
            <TrendingUp className="w-5 h-5 text-green-400" />
            <div>
              <p className="text-2xl font-bold text-white">{suggestions.length}</p>
              <p className="text-gray-400 text-sm">Suggestions</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-800">
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-5 h-5 text-blue-400" />
            <div>
              <p className="text-2xl font-bold text-white">
                {suggestions.filter(s => s.confidence > 0.8).length}
              </p>
              <p className="text-gray-400 text-sm">High Confidence</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-800">
          <div className="flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <div>
              <p className="text-2xl font-bold text-white">
                {suggestions.filter(s => s.priority === 'high').length}
              </p>
              <p className="text-gray-400 text-sm">High Priority</p>
            </div>
          </div>
        </div>
      </div>

      {/* Suggestions List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : suggestions.length === 0 ? (
          <div className="text-center py-12 bg-gray-900/30 rounded-lg border border-gray-800">
            <Calendar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-400 mb-2">No Scheduling Suggestions</h3>
            <p className="text-gray-500">Complete a meeting with action items to generate smart scheduling suggestions.</p>
          </div>
        ) : (
          suggestions.map((suggestion, index) => {
            const datetime = formatDateTime(suggestion.suggestedTime);
            
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-900/50 rounded-lg p-6 border border-gray-800 hover:border-gray-700 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <h3 className="text-lg font-semibold text-white">{suggestion.title}</h3>
                      <span className={`px-2 py-1 rounded-md text-xs font-medium border ${getPriorityColor(suggestion.priority)}`}>
                        {suggestion.priority.toUpperCase()}
                      </span>
                      <span className={`text-sm font-medium ${getConfidenceColor(suggestion.confidence)}`}>
                        {Math.round(suggestion.confidence * 100)}% confidence
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-6 mb-4 text-gray-400">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4" />
                        <span>{datetime.date}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4" />
                        <span>{datetime.time} ({suggestion.duration}m)</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4" />
                        <span>{suggestion.participants.length || 'Same'} attendees</span>
                      </div>
                    </div>
                    
                    <p className="text-gray-300 mb-4">{suggestion.reason}</p>
                    
                    {suggestion.actionItemsToDiscuss.length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-400 mb-2">Action Items to Discuss:</p>
                        <ul className="space-y-1">
                          {suggestion.actionItemsToDiscuss.slice(0, 3).map((item, i) => (
                            <li key={i} className="text-sm text-gray-300 flex items-center space-x-2">
                              <ChevronRight className="w-3 h-3 text-gray-500" />
                              <span>{item}</span>
                            </li>
                          ))}
                          {suggestion.actionItemsToDiscuss.length > 3 && (
                            <li className="text-sm text-gray-500">
                              +{suggestion.actionItemsToDiscuss.length - 3} more items
                            </li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col space-y-2">
                    <button
                      onClick={() => scheduleMeeting(suggestion, false)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Schedule</span>
                    </button>
                    
                    {suggestion.confidence > 0.8 && (
                      <button
                        onClick={() => scheduleMeeting(suggestion, true)}
                        disabled={autoScheduling}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
                      >
                        <Zap className="w-4 h-4" />
                        <span>Auto</span>
                      </button>
                    )}
                    
                    <button
                      onClick={() => setSelectedSuggestion(suggestion)}
                      className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      Details
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Suggestion Details Modal */}
      {selectedSuggestion && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-900 rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto border border-gray-800"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Meeting Details</h3>
              <button
                onClick={() => setSelectedSuggestion(null)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-white mb-2">{selectedSuggestion.title}</h4>
                <p className="text-gray-300">{selectedSuggestion.description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-400 mb-1">Date & Time</p>
                  <p className="text-white">
                    {formatDateTime(selectedSuggestion.suggestedTime).date} at{' '}
                    {formatDateTime(selectedSuggestion.suggestedTime).time}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-400 mb-1">Duration</p>
                  <p className="text-white">{selectedSuggestion.duration} minutes</p>
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-400 mb-2">All Action Items</p>
                <ul className="space-y-2">
                  {selectedSuggestion.actionItemsToDiscuss.map((item, i) => (
                    <li key={i} className="text-gray-300 flex items-start space-x-2">
                      <ChevronRight className="w-4 h-4 mt-0.5 text-gray-500 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => {
                  scheduleMeeting(selectedSuggestion, false);
                  setSelectedSuggestion(null);
                }}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Schedule Meeting
              </button>
              <button
                onClick={() => setSelectedSuggestion(null)}
                className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default SmartScheduling;