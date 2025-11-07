import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin (server-side)
if (!getApps().length) {
  const serviceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  };

  initializeApp({
    credential: cert(serviceAccount),
    projectId: process.env.FIREBASE_PROJECT_ID,
  });
}

export const db = getFirestore();

// Collection references
export const collections = {
  meetings: 'meetings',
  transcripts: 'transcripts',
  actionItems: 'action-items',
  users: 'users',
  sentimentAnalysis: 'sentiment-analysis',
} as const;

// Types for Firestore documents
export interface MeetingDocument {
  id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  meetingLink?: string;
  calendarEventId?: string;
  organizerId: string;
  attendees: string[];
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface TranscriptDocument {
  id: string;
  meetingId: string;
  speaker: string;
  text: string;
  timestamp: string;
  confidence: number;
  sessionId?: string;
  createdAt: string;
}

export interface ActionItemDocument {
  id: string;
  meetingId: string;
  task: string;
  assignee?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in-progress' | 'completed';
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SentimentDocument {
  id: string;
  meetingId: string;
  overall_sentiment: 'positive' | 'neutral' | 'negative';
  confidence: number;
  emotions: {
    joy: number;
    sadness: number;
    anger: number;
    fear: number;
    surprise: number;
  };
  analysis_timestamp: string;
}

// Helper functions for Firestore operations
export async function createMeeting(meetingData: Omit<MeetingDocument, 'id' | 'createdAt' | 'updatedAt'>) {
  try {
    const now = new Date().toISOString();
    const docRef = await db.collection(collections.meetings).add({
      ...meetingData,
      createdAt: now,
      updatedAt: now,
    });
    
    return {
      success: true,
      id: docRef.id,
    };
  } catch (error) {
    console.error('Error creating meeting:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function getMeeting(meetingId: string) {
  try {
    const doc = await db.collection(collections.meetings).doc(meetingId).get();
    
    if (!doc.exists) {
      return {
        success: false,
        error: 'Meeting not found',
      };
    }
    
    return {
      success: true,
      meeting: { id: doc.id, ...doc.data() } as MeetingDocument,
    };
  } catch (error) {
    console.error('Error getting meeting:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function updateMeetingStatus(meetingId: string, status: MeetingDocument['status']) {
  try {
    await db.collection(collections.meetings).doc(meetingId).update({
      status,
      updatedAt: new Date().toISOString(),
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error updating meeting status:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function addTranscriptEntry(transcriptData: Omit<TranscriptDocument, 'id' | 'createdAt'>) {
  try {
    const docRef = await db.collection(collections.transcripts).add({
      ...transcriptData,
      createdAt: new Date().toISOString(),
    });
    
    return {
      success: true,
      id: docRef.id,
    };
  } catch (error) {
    console.error('Error adding transcript entry:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function getMeetingTranscripts(meetingId: string) {
  try {
    const snapshot = await db
      .collection(collections.transcripts)
      .where('meetingId', '==', meetingId)
      .orderBy('timestamp', 'asc')
      .get();
    
    const transcripts = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as TranscriptDocument[];
    
    return {
      success: true,
      transcripts,
    };
  } catch (error) {
    console.error('Error getting meeting transcripts:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      transcripts: [],
    };
  }
}

export async function createActionItem(actionItemData: Omit<ActionItemDocument, 'id' | 'createdAt' | 'updatedAt'>) {
  try {
    const now = new Date().toISOString();
    const docRef = await db.collection(collections.actionItems).add({
      ...actionItemData,
      createdAt: now,
      updatedAt: now,
    });
    
    return {
      success: true,
      id: docRef.id,
    };
  } catch (error) {
    console.error('Error creating action item:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function getMeetingActionItems(meetingId: string) {
  try {
    const snapshot = await db
      .collection(collections.actionItems)
      .where('meetingId', '==', meetingId)
      .orderBy('createdAt', 'desc')
      .get();
    
    const actionItems = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as ActionItemDocument[];
    
    return {
      success: true,
      actionItems,
    };
  } catch (error) {
    console.error('Error getting action items:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      actionItems: [],
    };
  }
}

export async function updateActionItemStatus(actionItemId: string, status: ActionItemDocument['status']) {
  try {
    await db.collection(collections.actionItems).doc(actionItemId).update({
      status,
      updatedAt: new Date().toISOString(),
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error updating action item status:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}