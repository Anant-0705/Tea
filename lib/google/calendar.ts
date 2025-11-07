import { google } from 'googleapis';
import { NextAuthOptions } from 'next-auth';

// Google Calendar configuration
export const calendar = google.calendar('v3');

// Helper function to get authenticated calendar client
export async function getCalendarClient(accessToken: string) {
  const auth = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );
  
  auth.setCredentials({
    access_token: accessToken,
  });

  return google.calendar({ version: 'v3', auth });
}

// Create a Google Meet meeting
export async function createMeetingEvent(
  accessToken: string,
  eventDetails: {
    summary: string;
    description?: string;
    startTime: string;
    endTime: string;
    timeZone: string;
    attendees?: string[];
    organizerEmail?: string;
    organizerName?: string;
  }
) {
  try {
    const calendar = await getCalendarClient(accessToken);
    
    // Validate and filter attendee emails
    const validAttendees = eventDetails.attendees
      ?.filter(email => email && email.trim().length > 0) // Remove empty emails
      ?.map(email => email.trim()) // Trim whitespace
      ?.filter(email => {
        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
      })
      ?.map(email => ({ email })) || [];
    
    const event = {
      summary: eventDetails.summary,
      description: eventDetails.description,
      start: {
        dateTime: eventDetails.startTime,
        timeZone: eventDetails.timeZone,
      },
      end: {
        dateTime: eventDetails.endTime,
        timeZone: eventDetails.timeZone,
      },
      attendees: validAttendees.length > 0 ? validAttendees : undefined, // Only include if there are valid attendees
      conferenceData: {
        createRequest: {
          requestId: `meet-${Date.now()}`,
          conferenceSolutionKey: {
            type: 'hangoutsMeet'
          }
        }
      },
      // Configure guest permissions to ensure creator control
      guestsCanModify: false,
      guestsCanInviteOthers: true,
      guestsCanSeeOtherGuests: true,
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 },
          { method: 'popup', minutes: 10 },
        ],
      },
    };

    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: event,
      conferenceDataVersion: 1,
    });

    return {
      success: true,
      event: response.data,
      meetLink: response.data.conferenceData?.entryPoints?.[0]?.uri,
    };
  } catch (error) {
    console.error('Error creating calendar event:', error);
    
    // Log more details about the error
    if (error && typeof error === 'object' && 'response' in error) {
      const apiError = error as any;
      console.error('API Error Details:', {
        status: apiError.response?.status,
        statusText: apiError.response?.statusText,
        data: apiError.response?.data,
      });
    }
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Get user's calendar events
export async function getCalendarEvents(
  accessToken: string,
  timeMin?: string,
  timeMax?: string
) {
  try {
    const calendar = await getCalendarClient(accessToken);
    
    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: timeMin || new Date().toISOString(),
      timeMax: timeMax,
      maxResults: 10,
      singleEvents: true,
      orderBy: 'startTime',
    });

    return {
      success: true,
      events: response.data.items || [],
    };
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      events: [],
    };
  }
}

// Update meeting with transcription results
export async function updateMeetingWithTranscription(
  accessToken: string,
  eventId: string,
  transcriptionSummary: string
) {
  try {
    const calendar = await getCalendarClient(accessToken);
    
    const response = await calendar.events.patch({
      calendarId: 'primary',
      eventId: eventId,
      requestBody: {
        description: `${transcriptionSummary}\n\n--- AutoTrack Meeting Summary ---`,
      },
    });

    return {
      success: true,
      event: response.data,
    };
  } catch (error) {
    console.error('Error updating calendar event:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}