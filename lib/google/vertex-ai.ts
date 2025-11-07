import { VertexAI } from '@google-cloud/vertexai';

// Initialize Vertex AI client
export function createVertexAIClient() {
  const serviceAccountKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (!serviceAccountKey) {
    throw new Error('GOOGLE_SERVICE_ACCOUNT_KEY environment variable is required');
  }

  let credentials;
  try {
    const decodedKey = Buffer.from(serviceAccountKey, 'base64').toString('utf8');
    credentials = JSON.parse(decodedKey);
  } catch (error) {
    console.error('Error parsing service account key:', error);
    throw new Error('Invalid service account key format');
  }

  const vertex_ai = new VertexAI({
    project: credentials.project_id,
    location: 'us-central1', // You can change this to your preferred region
    credentials,
  });

  return vertex_ai;
}

// Interfaces for structured analysis
export interface ActionItem {
  task: string;
  assignee?: string;
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  status: 'pending' | 'in-progress' | 'completed';
}

export interface MeetingInsight {
  type: 'decision' | 'concern' | 'opportunity' | 'risk' | 'follow-up';
  content: string;
  confidence: number;
  timestamp?: string;
  speaker?: string;
}

export interface SentimentAnalysis {
  overall: 'positive' | 'neutral' | 'negative';
  score: number; // -1 to 1
  participantSentiments: {
    participant: string;
    sentiment: 'positive' | 'neutral' | 'negative';
    score: number;
  }[];
}

export interface TranscriptAnalysis {
  actionItems: ActionItem[];
  insights: MeetingInsight[];
  sentiment: SentimentAnalysis;
  summary: string;
  keyTopics: string[];
  decisions: string[];
  nextSteps: string[];
  questionsRaised: string[];
  riskAssessment: {
    risks: string[];
    mitigation: string[];
  };
}

// Analyze meeting transcript using Vertex AI
export async function analyzeTranscriptWithVertexAI(
  transcript: string,
  participants: string[],
  meetingContext: {
    title: string;
    date: string;
    duration: number;
  }
): Promise<TranscriptAnalysis> {
  try {
    const vertex_ai = createVertexAIClient();
    
    // Get the Gemini model
    const model = 'gemini-1.5-pro-preview-0409';
    const generativeModel = vertex_ai.preview.getGenerativeModel({
      model: model,
      generation_config: {
        max_output_tokens: 8192,
        temperature: 0.1,
        top_p: 0.8,
      },
    });

    const prompt = `
You are an AI assistant that analyzes meeting transcripts to extract actionable insights. Please analyze the following meeting transcript and provide a comprehensive analysis.

Meeting Context:
- Title: ${meetingContext.title}
- Date: ${meetingContext.date}
- Duration: ${meetingContext.duration} minutes
- Participants: ${participants.join(', ')}

Transcript:
${transcript}

Please provide a detailed analysis in the following JSON format:

{
  "actionItems": [
    {
      "task": "Clear description of the task",
      "assignee": "Person responsible (if mentioned)",
      "priority": "high|medium|low",
      "dueDate": "YYYY-MM-DD (if mentioned)",
      "status": "pending"
    }
  ],
  "insights": [
    {
      "type": "decision|concern|opportunity|risk|follow-up",
      "content": "Detailed insight content",
      "confidence": 0.95,
      "speaker": "Speaker name (if identifiable)"
    }
  ],
  "sentiment": {
    "overall": "positive|neutral|negative",
    "score": 0.7,
    "participantSentiments": [
      {
        "participant": "Participant name",
        "sentiment": "positive|neutral|negative",
        "score": 0.8
      }
    ]
  },
  "summary": "Comprehensive meeting summary in 2-3 sentences",
  "keyTopics": ["Topic 1", "Topic 2", "Topic 3"],
  "decisions": ["Decision 1", "Decision 2"],
  "nextSteps": ["Next step 1", "Next step 2"],
  "questionsRaised": ["Question 1", "Question 2"],
  "riskAssessment": {
    "risks": ["Risk 1", "Risk 2"],
    "mitigation": ["Mitigation strategy 1", "Mitigation strategy 2"]
  }
}

Focus on:
1. Extracting clear, actionable items with specific owners when possible
2. Identifying key decisions made during the meeting
3. Highlighting potential risks or concerns raised
4. Capturing follow-up questions that need addressing
5. Analyzing the overall sentiment and engagement level
6. Providing strategic insights for business decision-making

Be thorough but concise. Ensure all action items are specific and measurable.
`;

    const result = await generativeModel.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Try to parse the JSON response
    try {
      // Extract JSON from the response (in case there's additional text)
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const analysis: TranscriptAnalysis = JSON.parse(jsonMatch[0]);
      
      // Validate and sanitize the response
      return {
        actionItems: Array.isArray(analysis.actionItems) ? analysis.actionItems : [],
        insights: Array.isArray(analysis.insights) ? analysis.insights : [],
        sentiment: analysis.sentiment || {
          overall: 'neutral',
          score: 0,
          participantSentiments: []
        },
        summary: analysis.summary || 'No summary available',
        keyTopics: Array.isArray(analysis.keyTopics) ? analysis.keyTopics : [],
        decisions: Array.isArray(analysis.decisions) ? analysis.decisions : [],
        nextSteps: Array.isArray(analysis.nextSteps) ? analysis.nextSteps : [],
        questionsRaised: Array.isArray(analysis.questionsRaised) ? analysis.questionsRaised : [],
        riskAssessment: analysis.riskAssessment || {
          risks: [],
          mitigation: []
        }
      };
    } catch (parseError) {
      console.error('Error parsing Vertex AI response:', parseError);
      console.error('Raw response:', text);
      
      // Return a fallback analysis
      return createFallbackAnalysis(transcript, participants);
    }
  } catch (error) {
    console.error('Error analyzing transcript with Vertex AI:', error);
    
    // Return a fallback analysis
    return createFallbackAnalysis(transcript, participants);
  }
}

// Create a fallback analysis when Vertex AI is not available
function createFallbackAnalysis(transcript: string, participants: string[]): TranscriptAnalysis {
  const words = transcript.split(' ');
  const keyTopics = extractKeyTopics(transcript);
  
  return {
    actionItems: extractBasicActionItems(transcript),
    insights: [
      {
        type: 'follow-up',
        content: 'Meeting transcript has been recorded for further analysis',
        confidence: 1.0,
        speaker: undefined
      }
    ],
    sentiment: {
      overall: 'neutral',
      score: 0,
      participantSentiments: participants.map(p => ({
        participant: p,
        sentiment: 'neutral' as const,
        score: 0
      }))
    },
    summary: `Meeting discussion covered ${keyTopics.length} main topics with ${participants.length} participants. Total words: ${words.length}`,
    keyTopics,
    decisions: [],
    nextSteps: [],
    questionsRaised: [],
    riskAssessment: {
      risks: [],
      mitigation: []
    }
  };
}

// Extract basic action items using simple keyword matching
function extractBasicActionItems(transcript: string): ActionItem[] {
  const actionKeywords = [
    'will do', 'should do', 'need to', 'have to', 'must do',
    'action item', 'todo', 'follow up', 'follow-up',
    'assign', 'responsible for', 'take care of'
  ];

  const sentences = transcript.split(/[.!?]+/);
  const actionItems: ActionItem[] = [];

  sentences.forEach(sentence => {
    const lowerSentence = sentence.toLowerCase();
    if (actionKeywords.some(keyword => lowerSentence.includes(keyword))) {
      actionItems.push({
        task: sentence.trim(),
        priority: 'medium',
        status: 'pending'
      });
    }
  });

  return actionItems.slice(0, 5); // Limit to 5 items
}

// Extract key topics using simple frequency analysis
function extractKeyTopics(transcript: string): string[] {
  const words = transcript.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3);

  const stopWords = new Set([
    'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her',
    'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how', 'its',
    'may', 'new', 'now', 'old', 'see', 'two', 'who', 'boy', 'did', 'does', 'let',
    'man', 'new', 'now', 'old', 'see', 'two', 'way', 'who', 'boy', 'did', 'its',
    'said', 'each', 'make', 'most', 'over', 'said', 'some', 'time', 'very', 'what',
    'with', 'have', 'from', 'they', 'know', 'want', 'been', 'good', 'much', 'some',
    'time', 'very', 'when', 'come', 'here', 'just', 'like', 'long', 'make', 'many',
    'over', 'such', 'take', 'than', 'them', 'well', 'were'
  ]);

  const wordCount = new Map<string, number>();
  words.forEach(word => {
    if (!stopWords.has(word)) {
      wordCount.set(word, (wordCount.get(word) || 0) + 1);
    }
  });

  return Array.from(wordCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word]) => word);
}

// Generate meeting summary with action items
export async function generateMeetingSummary(
  analysis: TranscriptAnalysis,
  meetingContext: {
    title: string;
    date: string;
    duration: number;
    participants: string[];
  }
): Promise<{
  executiveSummary: string;
  detailedReport: string;
  recommendedActions: string[];
}> {
  try {
    const vertex_ai = createVertexAIClient();
    
    const model = 'gemini-1.5-pro-preview-0409';
    const generativeModel = vertex_ai.preview.getGenerativeModel({
      model: model,
      generation_config: {
        max_output_tokens: 4096,
        temperature: 0.2,
        top_p: 0.8,
      },
    });

    const prompt = `
Based on the following meeting analysis, create a comprehensive meeting summary report:

Meeting Details:
- Title: ${meetingContext.title}
- Date: ${meetingContext.date}
- Duration: ${meetingContext.duration} minutes
- Participants: ${meetingContext.participants.join(', ')}

Analysis Data:
- Action Items: ${JSON.stringify(analysis.actionItems, null, 2)}
- Key Topics: ${analysis.keyTopics.join(', ')}
- Decisions: ${analysis.decisions.join(', ')}
- Next Steps: ${analysis.nextSteps.join(', ')}
- Sentiment: ${analysis.sentiment.overall} (${analysis.sentiment.score})

Please provide:

1. Executive Summary (2-3 sentences highlighting the key outcomes)
2. Detailed Report (structured summary with sections for topics discussed, decisions made, and outcomes)
3. Recommended Actions (prioritized list of next steps for leadership)

Format as JSON:
{
  "executiveSummary": "Brief high-level summary...",
  "detailedReport": "Structured detailed report...",
  "recommendedActions": ["Action 1", "Action 2", "Action 3"]
}
`;

    const result = await generativeModel.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      return JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      // Return fallback summary
      return {
        executiveSummary: `Meeting "${meetingContext.title}" completed with ${analysis.actionItems.length} action items and ${analysis.decisions.length} key decisions.`,
        detailedReport: `The meeting covered ${analysis.keyTopics.length} main topics with overall ${analysis.sentiment.overall} sentiment. Key areas discussed included: ${analysis.keyTopics.slice(0, 3).join(', ')}.`,
        recommendedActions: analysis.nextSteps.slice(0, 3)
      };
    }
  } catch (error) {
    console.error('Error generating meeting summary:', error);
    
    // Return fallback summary
    return {
      executiveSummary: `Meeting "${meetingContext.title}" completed with ${analysis.actionItems.length} action items identified.`,
      detailedReport: `Meeting analysis completed. ${analysis.keyTopics.length} key topics were discussed.`,
      recommendedActions: analysis.nextSteps.slice(0, 3)
    };
  }
}