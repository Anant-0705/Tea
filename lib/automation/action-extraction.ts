import { createActionItem } from '@/lib/google/firestore';
import { analyzeMeetingTranscript } from '@/lib/google/ai-analysis';

export interface IntelligentActionItem {
  task: string;
  assignee?: string;
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  context: string;
  confidence: number;
  keywords: string[];
  category: 'task' | 'follow-up' | 'decision' | 'research' | 'meeting';
}

export interface ExtractionResult {
  actionItems: IntelligentActionItem[];
  summary: string;
  confidence: number;
  processingTime: number;
}

// Keywords and phrases that indicate action items
const actionIndicators = [
  // Task assignment
  'need to', 'should', 'must', 'have to', 'required to', 'responsible for',
  'will do', 'will handle', 'will take care of', 'will follow up',
  
  // Follow-up indicators
  'follow up', 'check back', 'circle back', 'touch base', 'reconnect',
  'schedule', 'set up', 'arrange', 'coordinate',
  
  // Decision points
  'decide', 'determine', 'choose', 'select', 'approve', 'review',
  'consider', 'evaluate', 'assess',
  
  // Research tasks
  'research', 'investigate', 'look into', 'find out', 'explore',
  'analyze', 'study', 'examine',
  
  // Deadlines and timing
  'by', 'before', 'deadline', 'due', 'end of', 'next week', 'tomorrow',
  'monday', 'tuesday', 'wednesday', 'thursday', 'friday'
];

const priorityKeywords = {
  high: ['urgent', 'asap', 'immediately', 'critical', 'priority', 'important', 'deadline'],
  medium: ['soon', 'next week', 'this week', 'follow up', 'update'],
  low: ['when you can', 'eventually', 'sometime', 'low priority', 'nice to have']
};

// Extract potential assignees from transcript
function extractAssignees(text: string, participants: string[] = []): string[] {
  const assigneePatterns = [
    /(\w+)\s+will\s+/gi,
    /(\w+)\s+should\s+/gi,
    /(\w+)\s+can\s+you\s+/gi,
    /(\w+),?\s+please\s+/gi,
    /ask\s+(\w+)\s+to\s+/gi,
    /(\w+)\s+is\s+responsible\s+for\s+/gi,
  ];

  const assignees = new Set<string>();
  
  assigneePatterns.forEach(pattern => {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      if (match[1] && match[1].length > 1) {
        assignees.add(match[1].toLowerCase());
      }
    }
  });

  // Filter against known participants
  const validAssignees = Array.from(assignees).filter(assignee => 
    participants.some(participant => 
      participant.toLowerCase().includes(assignee) || 
      assignee.includes(participant.toLowerCase().split(' ')[0])
    )
  );

  return validAssignees;
}

// Determine priority based on keywords and context
function determinePriority(text: string): 'low' | 'medium' | 'high' {
  const lowerText = text.toLowerCase();
  
  for (const keyword of priorityKeywords.high) {
    if (lowerText.includes(keyword)) return 'high';
  }
  
  for (const keyword of priorityKeywords.medium) {
    if (lowerText.includes(keyword)) return 'medium';
  }
  
  return 'low';
}

// Extract due dates from text
function extractDueDate(text: string): string | undefined {
  const datePatterns = [
    /by\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/gi,
    /by\s+(tomorrow|today)/gi,
    /by\s+end\s+of\s+(week|month)/gi,
    /by\s+(\d{1,2}\/\d{1,2})/gi,
    /deadline\s+(\w+)/gi,
    /due\s+(\w+)/gi,
  ];

  for (const pattern of datePatterns) {
    const match = text.match(pattern);
    if (match) {
      // Simple date parsing - in production, use a proper date parsing library
      const dateStr = match[1];
      const now = new Date();
      
      switch (dateStr.toLowerCase()) {
        case 'tomorrow':
          const tomorrow = new Date(now);
          tomorrow.setDate(tomorrow.getDate() + 1);
          return tomorrow.toISOString().split('T')[0];
        case 'monday':
        case 'tuesday':
        case 'wednesday':
        case 'thursday':
        case 'friday':
          // Find next occurrence of that day
          const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
          const targetDay = days.indexOf(dateStr.toLowerCase());
          const currentDay = now.getDay();
          const daysUntilTarget = (targetDay - currentDay + 7) % 7 || 7;
          const targetDate = new Date(now);
          targetDate.setDate(targetDate.getDate() + daysUntilTarget);
          return targetDate.toISOString().split('T')[0];
        default:
          return undefined;
      }
    }
  }
  
  return undefined;
}

// Categorize action items
function categorizeActionItem(text: string): IntelligentActionItem['category'] {
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('meeting') || lowerText.includes('schedule') || lowerText.includes('call')) {
    return 'meeting';
  }
  
  if (lowerText.includes('follow up') || lowerText.includes('check back') || lowerText.includes('update')) {
    return 'follow-up';
  }
  
  if (lowerText.includes('decide') || lowerText.includes('approve') || lowerText.includes('choose')) {
    return 'decision';
  }
  
  if (lowerText.includes('research') || lowerText.includes('investigate') || lowerText.includes('analyze')) {
    return 'research';
  }
  
  return 'task';
}

// Extract keywords from action item text
function extractKeywords(text: string): string[] {
  const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'will', 'need', 'should']);
  
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.has(word));
  
  const wordFreq = new Map<string, number>();
  words.forEach(word => {
    wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
  });
  
  return Array.from(wordFreq.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([word]) => word);
}

// Main extraction function
export async function extractIntelligentActionItems(
  transcripts: Array<{ speaker: string; text: string; timestamp: string }>,
  meetingContext: {
    title: string;
    participants: string[];
    duration: number;
  }
): Promise<ExtractionResult> {
  const startTime = Date.now();
  
  try {
    // Combine all transcripts
    const fullTranscript = transcripts
      .map(t => `${t.speaker}: ${t.text}`)
      .join('\n');
    
    // Use AI analysis for enhanced extraction
    const aiAnalysis = await analyzeMeetingTranscript(
      transcripts,
      meetingContext.title
    );
    
    const actionItems: IntelligentActionItem[] = [];
    
    // Process each transcript segment
    for (const transcript of transcripts) {
      const text = transcript.text.toLowerCase();
      
      // Check if this segment contains action indicators
      const hasActionIndicator = actionIndicators.some(indicator => 
        text.includes(indicator.toLowerCase())
      );
      
      if (hasActionIndicator) {
        // Extract potential action items from this segment
        const sentences = transcript.text.split(/[.!?]+/).filter(s => s.trim().length > 10);
        
        for (const sentence of sentences) {
          const lowerSentence = sentence.toLowerCase().trim();
          
          if (actionIndicators.some(indicator => lowerSentence.includes(indicator))) {
            const assignees = extractAssignees(sentence, meetingContext.participants);
            const priority = determinePriority(sentence);
            const dueDate = extractDueDate(sentence);
            const category = categorizeActionItem(sentence);
            const keywords = extractKeywords(sentence);
            
            // Calculate confidence based on various factors
            let confidence = 0.6; // Base confidence
            
            // Increase confidence if we found clear indicators
            if (lowerSentence.includes('will') || lowerSentence.includes('should')) confidence += 0.2;
            if (assignees.length > 0) confidence += 0.1;
            if (dueDate) confidence += 0.1;
            if (priority === 'high') confidence += 0.1;
            
            confidence = Math.min(confidence, 0.95);
            
            actionItems.push({
              task: sentence.trim(),
              assignee: assignees[0],
              priority,
              dueDate,
              context: `From ${transcript.speaker} at ${new Date(transcript.timestamp).toLocaleTimeString()}`,
              confidence,
              keywords,
              category,
            });
          }
        }
      }
    }
    
    // Remove duplicates and low-confidence items
    const filteredActionItems = actionItems
      .filter(item => item.confidence >= 0.6)
      .filter((item, index, arr) => 
        arr.findIndex(other => 
          other.task.toLowerCase().includes(item.task.toLowerCase().substring(0, 20))
        ) === index
      )
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 10); // Limit to top 10 action items
    
    const processingTime = Date.now() - startTime;
    
    return {
      actionItems: filteredActionItems,
      summary: aiAnalysis.summary || `Extracted ${filteredActionItems.length} action items from ${meetingContext.title}`,
      confidence: filteredActionItems.length > 0 
        ? filteredActionItems.reduce((sum, item) => sum + item.confidence, 0) / filteredActionItems.length 
        : 0,
      processingTime,
    };
    
  } catch (error) {
    console.error('Error extracting action items:', error);
    
    return {
      actionItems: [],
      summary: 'Failed to extract action items due to processing error',
      confidence: 0,
      processingTime: Date.now() - startTime,
    };
  }
}

// Store extracted action items in database
export async function processAndStoreActionItems(
  meetingId: string,
  extractionResult: ExtractionResult
): Promise<{ success: boolean; storedItems: string[]; error?: string }> {
  try {
    const storedItems: string[] = [];
    
    for (const actionItem of extractionResult.actionItems) {
      const result = await createActionItem({
        meetingId,
        task: actionItem.task,
        assignee: actionItem.assignee,
        priority: actionItem.priority,
        status: 'pending',
        dueDate: actionItem.dueDate,
      });
      
      if (result.success && result.id) {
        storedItems.push(result.id);
      }
    }
    
    return {
      success: true,
      storedItems,
    };
    
  } catch (error) {
    console.error('Error storing action items:', error);
    return {
      success: false,
      storedItems: [],
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Automatically process meeting for action items
export async function autoProcessMeeting(
  meetingId: string,
  transcripts: Array<{ speaker: string; text: string; timestamp: string }>,
  meetingContext: {
    title: string;
    participants: string[];
    duration: number;
  }
): Promise<{
  success: boolean;
  extractionResult?: ExtractionResult;
  storedActionItems?: string[];
  error?: string;
}> {
  try {
    // Extract action items
    const extractionResult = await extractIntelligentActionItems(transcripts, meetingContext);
    
    if (extractionResult.actionItems.length === 0) {
      return {
        success: true,
        extractionResult,
        storedActionItems: [],
      };
    }
    
    // Store action items
    const storageResult = await processAndStoreActionItems(meetingId, extractionResult);
    
    if (!storageResult.success) {
      return {
        success: false,
        error: `Extraction successful but storage failed: ${storageResult.error}`,
        extractionResult,
      };
    }
    
    return {
      success: true,
      extractionResult,
      storedActionItems: storageResult.storedItems,
    };
    
  } catch (error) {
    console.error('Error in auto-processing meeting:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}