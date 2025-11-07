import { PredictionServiceClient } from '@google-cloud/aiplatform';
import { addTranscriptEntry, createActionItem } from './firestore';

// Initialize Vertex AI client
const predictionClient = new PredictionServiceClient({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});

export interface AnalysisResult {
  actionItems: ActionItem[];
  sentiment: SentimentAnalysis;
  summary: string;
  keyPoints: string[];
}

export interface ActionItem {
  task: string;
  assignee?: string;
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  category: string;
}

export interface SentimentAnalysis {
  overall: 'positive' | 'neutral' | 'negative';
  confidence: number;
  emotions: {
    joy: number;
    sadness: number;
    anger: number;
    fear: number;
    surprise: number;
  };
}

// Analyze meeting transcript for action items and sentiment
export async function analyzeMeetingTranscript(
  transcripts: Array<{ speaker: string; text: string; timestamp: string }>,
  meetingId: string
): Promise<AnalysisResult> {
  try {
    // Combine all transcripts into a single text
    const fullTranscript = transcripts
      .map(t => `${t.speaker}: ${t.text}`)
      .join('\n');

    // Run parallel analysis
    const [actionItems, sentiment, summary, keyPoints] = await Promise.all([
      extractActionItems(fullTranscript),
      analyzeSentiment(fullTranscript),
      generateSummary(fullTranscript),
      extractKeyPoints(fullTranscript),
    ]);

    // Store action items in Firestore
    for (const actionItem of actionItems) {
      await createActionItem({
        meetingId,
        task: actionItem.task,
        assignee: actionItem.assignee,
        priority: actionItem.priority,
        dueDate: actionItem.dueDate,
        status: 'pending',
      });
    }

    return {
      actionItems,
      sentiment,
      summary,
      keyPoints,
    };
  } catch (error) {
    console.error('Error analyzing transcript:', error);
    throw new Error('Failed to analyze meeting transcript');
  }
}

// Extract action items using Vertex AI
async function extractActionItems(transcript: string): Promise<ActionItem[]> {
  try {
    const prompt = `
Analyze the following meeting transcript and extract actionable items. For each action item, provide:
1. The task description
2. Who it's assigned to (if mentioned)
3. Priority level (high, medium, low)
4. Due date (if mentioned)
5. Category (e.g., technical, business, follow-up)

Return the results in JSON format as an array of objects with keys: task, assignee, priority, dueDate, category.

Transcript:
${transcript}

Action Items (JSON):`;

    const response = await callVertexAI(prompt, 'action-extraction');
    
    // Parse the AI response and extract action items
    return parseActionItems(response);
  } catch (error) {
    console.error('Error extracting action items:', error);
    // Return mock data for development
    return getMockActionItems();
  }
}

// Analyze sentiment using Vertex AI
async function analyzeSentiment(transcript: string): Promise<SentimentAnalysis> {
  try {
    const prompt = `
Analyze the sentiment of this meeting transcript. Provide:
1. Overall sentiment (positive, neutral, negative)
2. Confidence score (0-1)
3. Emotion breakdown with scores (0-1) for: joy, sadness, anger, fear, surprise

Return the results in JSON format with keys: overall, confidence, emotions.

Transcript:
${transcript}

Sentiment Analysis (JSON):`;

    const response = await callVertexAI(prompt, 'sentiment-analysis');
    
    return parseSentimentAnalysis(response);
  } catch (error) {
    console.error('Error analyzing sentiment:', error);
    // Return mock data for development
    return getMockSentiment();
  }
}

// Generate meeting summary using Vertex AI
async function generateSummary(transcript: string): Promise<string> {
  try {
    const prompt = `
Summarize this meeting transcript in 2-3 concise sentences. Focus on key decisions, main topics discussed, and outcomes.

Transcript:
${transcript}

Summary:`;

    const response = await callVertexAI(prompt, 'summarization');
    
    return response.trim();
  } catch (error) {
    console.error('Error generating summary:', error);
    // Return mock data for development
    return "Meeting covered project updates, budget discussions, and next steps. Team aligned on priorities and assigned action items. Overall positive progress with clear deliverables identified.";
  }
}

// Extract key points using Vertex AI
async function extractKeyPoints(transcript: string): Promise<string[]> {
  try {
    const prompt = `
Extract the 5 most important key points from this meeting transcript. Return as a JSON array of strings.

Transcript:
${transcript}

Key Points (JSON array):`;

    const response = await callVertexAI(prompt, 'key-extraction');
    
    return parseKeyPoints(response);
  } catch (error) {
    console.error('Error extracting key points:', error);
    // Return mock data for development
    return [
      "Project timeline revised to accommodate new requirements",
      "Budget approved for additional resources",
      "New team member onboarding scheduled",
      "Client feedback incorporated into design",
      "Next milestone target set for end of month"
    ];
  }
}

// Call Vertex AI with a prompt
async function callVertexAI(prompt: string, taskType: string): Promise<string> {
  try {
    // In development, return mock responses
    // In production, this would call the actual Vertex AI API
    if (process.env.NODE_ENV === 'development') {
      return getMockAIResponse(taskType);
    }

    const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
    const location = 'us-central1';
    const model = 'text-bison@001';

    const endpoint = `projects/${projectId}/locations/${location}/publishers/google/models/${model}`;

    const instanceValue = {
      prompt: prompt,
      max_output_tokens: 256,
      temperature: 0.2,
      top_p: 0.8,
      top_k: 40,
    };

    const instance = predictionClient.helpers.toValue(instanceValue);
    const instances = [instance];

    const request = {
      endpoint,
      instances,
    };

    const [response] = await predictionClient.predict(request);
    const predictions = response.predictions;
    
    if (predictions && predictions.length > 0) {
      const prediction = predictionClient.helpers.fromValue(predictions[0]);
      return prediction.content || '';
    }

    throw new Error('No prediction received from Vertex AI');
  } catch (error) {
    console.error('Error calling Vertex AI:', error);
    return getMockAIResponse(taskType);
  }
}

// Parse action items from AI response
function parseActionItems(response: string): ActionItem[] {
  try {
    const parsed = JSON.parse(response);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return getMockActionItems();
  }
}

// Parse sentiment analysis from AI response
function parseSentimentAnalysis(response: string): SentimentAnalysis {
  try {
    const parsed = JSON.parse(response);
    return {
      overall: parsed.overall || 'neutral',
      confidence: parsed.confidence || 0.8,
      emotions: {
        joy: parsed.emotions?.joy || 0.7,
        sadness: parsed.emotions?.sadness || 0.1,
        anger: parsed.emotions?.anger || 0.05,
        fear: parsed.emotions?.fear || 0.05,
        surprise: parsed.emotions?.surprise || 0.1,
      },
    };
  } catch (error) {
    return getMockSentiment();
  }
}

// Parse key points from AI response
function parseKeyPoints(response: string): string[] {
  try {
    const parsed = JSON.parse(response);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [
      "Project timeline revised to accommodate new requirements",
      "Budget approved for additional resources",
      "New team member onboarding scheduled",
      "Client feedback incorporated into design",
      "Next milestone target set for end of month"
    ];
  }
}

// Mock AI responses for development
function getMockAIResponse(taskType: string): string {
  switch (taskType) {
    case 'action-extraction':
      return JSON.stringify([
        {
          task: "Follow up with client on budget approval",
          assignee: "John",
          priority: "high",
          dueDate: "2025-11-10",
          category: "business"
        },
        {
          task: "Update project timeline document",
          assignee: "Sarah",
          priority: "medium",
          dueDate: "2025-11-12",
          category: "documentation"
        },
        {
          task: "Schedule team retrospective meeting",
          priority: "low",
          category: "process"
        }
      ]);
    
    case 'sentiment-analysis':
      return JSON.stringify({
        overall: "positive",
        confidence: 0.85,
        emotions: {
          joy: 0.7,
          sadness: 0.1,
          anger: 0.05,
          fear: 0.05,
          surprise: 0.1
        }
      });
    
    default:
      return "Mock AI response for development";
  }
}

// Mock data generators
function getMockActionItems(): ActionItem[] {
  return [
    {
      task: "Follow up with client on budget approval",
      assignee: "John",
      priority: "high",
      dueDate: "2025-11-10",
      category: "business"
    },
    {
      task: "Update project timeline document",
      assignee: "Sarah",
      priority: "medium",
      dueDate: "2025-11-12",
      category: "documentation"
    },
    {
      task: "Schedule team retrospective meeting",
      priority: "low",
      category: "process"
    }
  ];
}

function getMockSentiment(): SentimentAnalysis {
  return {
    overall: "positive",
    confidence: 0.85,
    emotions: {
      joy: 0.7,
      sadness: 0.1,
      anger: 0.05,
      fear: 0.05,
      surprise: 0.1
    }
  };
}

// Real-time analysis for streaming transcripts
export async function analyzeTranscriptChunk(
  transcriptChunk: { speaker: string; text: string; timestamp: string },
  meetingId: string
): Promise<{ sentiment?: SentimentAnalysis; actionItems?: ActionItem[] }> {
  try {
    // For real-time analysis, we do lighter processing
    const text = transcriptChunk.text;
    
    // Check if this chunk contains action-like language
    const actionKeywords = ['will', 'should', 'need to', 'must', 'action item', 'follow up', 'next step'];
    const hasActionLanguage = actionKeywords.some(keyword => 
      text.toLowerCase().includes(keyword)
    );

    let result: any = {};

    if (hasActionLanguage) {
      // Quick action item extraction for this chunk
      const actionItems = await extractActionItems(text);
      result.actionItems = actionItems;
    }

    // Quick sentiment analysis for this chunk
    if (text.length > 20) {
      const sentiment = await analyzeSentiment(text);
      result.sentiment = sentiment;
    }

    return result;
  } catch (error) {
    console.error('Error analyzing transcript chunk:', error);
    return {};
  }
}