import { google } from 'googleapis';
import { createMeetingEvent, getCalendarEvents } from '@/lib/google/calendar';
import { getMeetingActionItems, createMeeting } from '@/lib/google/firestore';

export interface SmartSchedulingRule {
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
    duration: number; // minutes
    title: string;
    description: string;
    bufferTimeBefore?: number; // minutes
    bufferTimeAfter?: number; // minutes
  };
  scheduling: {
    workingHours: {
      start: string; // HH:MM format
      end: string; // HH:MM format
    };
    excludeWeekends: boolean;
    preferredDays?: ('monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday')[];
    timeSlotPreference: 'morning' | 'afternoon' | 'any';
    minimumAdvanceNotice: number; // hours
  };
  participants: {
    includeOriginalAttendees: boolean;
    additionalEmails?: string[];
    excludeEmails?: string[];
  };
}

export interface SchedulingSuggestion {
  suggestedTime: string; // ISO datetime
  duration: number;
  title: string;
  description: string;
  participants: string[];
  reason: string;
  priority: 'low' | 'medium' | 'high';
  actionItemsToDiscuss: string[];
  confidence: number;
}

export interface TimeSlot {
  start: string;
  end: string;
  available: boolean;
  conflicts?: string[];
}

// Default scheduling rules
export const defaultSchedulingRules: SmartSchedulingRule[] = [
  {
    id: 'follow_up_high_priority',
    name: 'High Priority Action Item Follow-up',
    enabled: true,
    trigger: {
      type: 'action_item_due',
      daysBeforeDue: 2,
      priorities: ['high'],
    },
    meetingTemplate: {
      duration: 30,
      title: 'Follow-up: High Priority Action Items',
      description: 'Review progress on high-priority action items and address any blockers.',
      bufferTimeBefore: 5,
      bufferTimeAfter: 5,
    },
    scheduling: {
      workingHours: { start: '09:00', end: '17:00' },
      excludeWeekends: true,
      preferredDays: ['tuesday', 'wednesday', 'thursday'],
      timeSlotPreference: 'morning',
      minimumAdvanceNotice: 24,
    },
    participants: {
      includeOriginalAttendees: true,
    },
  },
  {
    id: 'weekly_review',
    name: 'Weekly Action Item Review',
    enabled: true,
    trigger: {
      type: 'meeting_completion',
      actionItemCategories: ['task', 'decision'],
    },
    meetingTemplate: {
      duration: 45,
      title: 'Weekly Review: Action Items & Progress',
      description: 'Review completed action items and plan for upcoming tasks.',
      bufferTimeBefore: 10,
      bufferTimeAfter: 5,
    },
    scheduling: {
      workingHours: { start: '09:00', end: '17:00' },
      excludeWeekends: true,
      preferredDays: ['friday'],
      timeSlotPreference: 'afternoon',
      minimumAdvanceNotice: 48,
    },
    participants: {
      includeOriginalAttendees: true,
    },
  },
  {
    id: 'decision_follow_up',
    name: 'Decision Follow-up Meeting',
    enabled: true,
    trigger: {
      type: 'action_item_due',
      daysBeforeDue: 1,
      actionItemCategories: ['decision'],
    },
    meetingTemplate: {
      duration: 60,
      title: 'Decision Review & Next Steps',
      description: 'Finalize pending decisions and plan implementation.',
      bufferTimeBefore: 15,
    },
    scheduling: {
      workingHours: { start: '09:00', end: '17:00' },
      excludeWeekends: true,
      timeSlotPreference: 'any',
      minimumAdvanceNotice: 12,
    },
    participants: {
      includeOriginalAttendees: true,
    },
  },
];

// Find available time slots in calendar
export async function findAvailableTimeSlots(
  accessToken: string,
  startDate: Date,
  endDate: Date,
  duration: number, // minutes
  workingHours: { start: string; end: string },
  excludeWeekends: boolean = true
): Promise<TimeSlot[]> {
  try {
    const calendar = await getCalendarEvents(
      accessToken,
      startDate.toISOString(),
      endDate.toISOString()
    );

    if (!calendar.success) {
      throw new Error('Failed to fetch calendar events');
    }

    const events = calendar.events || [];
    const timeSlots: TimeSlot[] = [];
    
    // Generate potential time slots
    const current = new Date(startDate);
    while (current < endDate) {
      // Skip weekends if configured
      if (excludeWeekends && (current.getDay() === 0 || current.getDay() === 6)) {
        current.setDate(current.getDate() + 1);
        continue;
      }

      // Generate slots within working hours
      const workStart = new Date(current);
      const [startHour, startMin] = workingHours.start.split(':').map(Number);
      workStart.setHours(startHour, startMin, 0, 0);

      const workEnd = new Date(current);
      const [endHour, endMin] = workingHours.end.split(':').map(Number);
      workEnd.setHours(endHour, endMin, 0, 0);

      // Create 30-minute slots throughout the working day
      let slotStart = new Date(workStart);
      while (slotStart.getTime() + (duration * 60000) <= workEnd.getTime()) {
        const slotEnd = new Date(slotStart.getTime() + (duration * 60000));
        
        // Check for conflicts with existing events
        const conflicts = events.filter(event => {
          if (!event.start?.dateTime || !event.end?.dateTime) return false;
          
          const eventStart = new Date(event.start.dateTime);
          const eventEnd = new Date(event.end.dateTime);
          
          return (
            (slotStart >= eventStart && slotStart < eventEnd) ||
            (slotEnd > eventStart && slotEnd <= eventEnd) ||
            (slotStart <= eventStart && slotEnd >= eventEnd)
          );
        });

        timeSlots.push({
          start: slotStart.toISOString(),
          end: slotEnd.toISOString(),
          available: conflicts.length === 0,
          conflicts: conflicts.map(event => event.summary || 'Untitled Event'),
        });

        // Move to next 30-minute slot
        slotStart.setTime(slotStart.getTime() + (30 * 60000));
      }

      current.setDate(current.getDate() + 1);
    }

    return timeSlots.filter(slot => slot.available);
  } catch (error) {
    console.error('Error finding available time slots:', error);
    return [];
  }
}

// Generate smart scheduling suggestions
export async function generateSchedulingSuggestions(
  accessToken: string,
  meetingId: string,
  rules: SmartSchedulingRule[] = defaultSchedulingRules
): Promise<SchedulingSuggestion[]> {
  try {
    // Get action items for the meeting
    const actionItemsResult = await getMeetingActionItems(meetingId);
    if (!actionItemsResult.success) {
      throw new Error('Failed to fetch action items');
    }

    const actionItems = actionItemsResult.actionItems;
    const suggestions: SchedulingSuggestion[] = [];

    for (const rule of rules.filter(r => r.enabled)) {
      // Check if rule criteria are met
      const relevantActionItems = actionItems.filter(item => {
        // Filter by priority if specified
        if (rule.trigger.priorities && !rule.trigger.priorities.includes(item.priority)) {
          return false;
        }

        // Filter by category if specified (using task content analysis for category)
        if (rule.trigger.actionItemCategories) {
          const taskLower = item.task.toLowerCase();
          const hasCategory = rule.trigger.actionItemCategories.some(category => {
            switch (category) {
              case 'task':
                return taskLower.includes('task') || taskLower.includes('complete') || taskLower.includes('work on');
              case 'decision':
                return taskLower.includes('decide') || taskLower.includes('decision') || taskLower.includes('approve');
              case 'follow-up':
                return taskLower.includes('follow') || taskLower.includes('check') || taskLower.includes('review');
              default:
                return false;
            }
          });
          if (!hasCategory) return false;
        }

        // Check due date proximity
        if (rule.trigger.daysBeforeDue && item.dueDate) {
          const dueDate = new Date(item.dueDate);
          const now = new Date();
          const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          
          if (daysUntilDue > rule.trigger.daysBeforeDue) {
            return false;
          }
        }

        return true;
      });

      if (relevantActionItems.length === 0) continue;

      // Find available time slots
      const startDate = new Date();
      startDate.setHours(startDate.getHours() + rule.scheduling.minimumAdvanceNotice);
      
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 14); // Look 2 weeks ahead

      const availableSlots = await findAvailableTimeSlots(
        accessToken,
        startDate,
        endDate,
        rule.meetingTemplate.duration,
        rule.scheduling.workingHours,
        rule.scheduling.excludeWeekends
      );

      // Filter slots by preferences
      const preferredSlots = availableSlots.filter(slot => {
        const slotDate = new Date(slot.start);
        
        // Check preferred days
        if (rule.scheduling.preferredDays) {
          const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
          const slotDay = dayNames[slotDate.getDay()];
          if (!rule.scheduling.preferredDays.includes(slotDay as any)) {
            return false;
          }
        }

        // Check time preference
        const hour = slotDate.getHours();
        switch (rule.scheduling.timeSlotPreference) {
          case 'morning':
            return hour >= 9 && hour < 12;
          case 'afternoon':
            return hour >= 13 && hour < 17;
          default:
            return true;
        }
      });

      // Create suggestion for best available slot
      const bestSlot = preferredSlots[0] || availableSlots[0];
      if (bestSlot) {
        // Calculate confidence based on various factors
        let confidence = 0.7; // Base confidence
        
        if (relevantActionItems.length > 2) confidence += 0.1;
        if (relevantActionItems.some(item => item.priority === 'high')) confidence += 0.1;
        if (preferredSlots.length > 0) confidence += 0.1;
        
        confidence = Math.min(confidence, 0.95);

        // Generate dynamic title and description
        const highPriorityCount = relevantActionItems.filter(item => item.priority === 'high').length;
        const titleSuffix = highPriorityCount > 0 ? ` (${highPriorityCount} High Priority)` : '';
        
        suggestions.push({
          suggestedTime: bestSlot.start,
          duration: rule.meetingTemplate.duration,
          title: rule.meetingTemplate.title + titleSuffix,
          description: `${rule.meetingTemplate.description}\n\nAction items to discuss:\n${relevantActionItems.map(item => `• ${item.task}`).join('\n')}`,
          participants: [], // Will be populated based on original meeting
          reason: `Triggered by ${rule.name}: ${relevantActionItems.length} relevant action items`,
          priority: relevantActionItems.some(item => item.priority === 'high') ? 'high' : 
                   relevantActionItems.some(item => item.priority === 'medium') ? 'medium' : 'low',
          actionItemsToDiscuss: relevantActionItems.map(item => item.task),
          confidence,
        });
      }
    }

    // Sort by priority and confidence
    return suggestions.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return b.confidence - a.confidence;
    });

  } catch (error) {
    console.error('Error generating scheduling suggestions:', error);
    return [];
  }
}

// Automatically schedule a suggested meeting
export async function scheduleAutomaticMeeting(
  accessToken: string,
  suggestion: SchedulingSuggestion,
  originalMeetingData: {
    participants: string[];
    organizerId: string;
  }
): Promise<{ success: boolean; meetingId?: string; calendarEventId?: string; error?: string }> {
  try {
    const startTime = new Date(suggestion.suggestedTime);
    const endTime = new Date(startTime.getTime() + (suggestion.duration * 60000));

    // Create calendar event
    const calendarResult = await createMeetingEvent(accessToken, {
      summary: suggestion.title,
      description: suggestion.description,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      attendees: originalMeetingData.participants,
    });

    if (!calendarResult.success) {
      return {
        success: false,
        error: `Failed to create calendar event: ${calendarResult.error}`,
      };
    }

    // Store meeting in database
    const meetingResult = await createMeeting({
      title: suggestion.title,
      description: suggestion.description,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      meetingLink: calendarResult.meetLink,
      calendarEventId: calendarResult.event?.id,
      organizerId: originalMeetingData.organizerId,
      attendees: originalMeetingData.participants,
      status: 'scheduled',
    });

    if (!meetingResult.success) {
      return {
        success: false,
        error: `Calendar event created but database storage failed: ${meetingResult.error}`,
      };
    }

    return {
      success: true,
      meetingId: meetingResult.id,
      calendarEventId: calendarResult.event?.id,
    };

  } catch (error) {
    console.error('Error scheduling automatic meeting:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Process all pending scheduling suggestions
export async function processSchedulingSuggestions(
  accessToken: string,
  meetingId: string,
  autoSchedule: boolean = false
): Promise<{
  suggestions: SchedulingSuggestion[];
  scheduledMeetings?: Array<{ meetingId: string; calendarEventId: string }>;
  errors?: string[];
}> {
  try {
    const suggestions = await generateSchedulingSuggestions(accessToken, meetingId);
    
    if (!autoSchedule) {
      return { suggestions };
    }

    // Auto-schedule high-confidence suggestions
    const highConfidenceSuggestions = suggestions.filter(s => s.confidence > 0.8 && s.priority === 'high');
    const scheduledMeetings = [];
    const errors = [];

    for (const suggestion of highConfidenceSuggestions.slice(0, 2)) { // Limit to 2 auto-scheduled meetings
      // Get original meeting data (mock for now)
      const originalMeetingData = {
        participants: [], // Would fetch from database
        organizerId: '', // Would fetch from database
      };

      const result = await scheduleAutomaticMeeting(accessToken, suggestion, originalMeetingData);
      
      if (result.success && result.meetingId && result.calendarEventId) {
        scheduledMeetings.push({
          meetingId: result.meetingId,
          calendarEventId: result.calendarEventId,
        });
      } else {
        errors.push(result.error || 'Unknown scheduling error');
      }
    }

    return {
      suggestions,
      scheduledMeetings,
      errors: errors.length > 0 ? errors : undefined,
    };

  } catch (error) {
    console.error('Error processing scheduling suggestions:', error);
    return {
      suggestions: [],
      errors: [error instanceof Error ? error.message : 'Unknown error'],
    };
  }
}