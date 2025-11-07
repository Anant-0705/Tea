import { SpeechClient } from '@google-cloud/speech';

// Initialize Speech-to-Text client with service account
export function createSpeechClient() {
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

  return new SpeechClient({
    credentials,
    projectId: credentials.project_id,
  });
}

// Legacy client for backward compatibility
const speechClient = createSpeechClient();

// Enhanced types for better TypeScript support
export interface TranscriptionWord {
  word: string;
  startTime: any;
  endTime: any;
  speakerTag?: number;
  confidence?: number;
}

export interface TranscriptionResult {
  transcript: string;
  confidence: number;
  words: TranscriptionWord[];
  speakerTag?: number;
  isFinal?: boolean;
  timestamp?: string;
}

export interface StreamingTranscriptionResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
  speakerTag?: number;
  timestamp: string;
  words?: TranscriptionWord[];
}

export interface MeetingTranscriptionSession {
  sessionId: string;
  meetingId: string;
  participants: string[];
  startTime: string;
  isActive: boolean;
  transcripts: StreamingTranscriptionResult[];
}

export interface TranscriptionConfig {
  encoding: 'LINEAR16' | 'FLAC' | 'MULAW' | 'AMR' | 'AMR_WB' | 'OGG_OPUS' | 'SPEEX_WITH_HEADER_BYTE' | 'WEBM_OPUS';
  sampleRateHertz: number;
  languageCode: string;
  enableAutomaticPunctuation: boolean;
  enableWordTimeOffsets: boolean;
  enableSpeakerDiarization: boolean;
  diarizationSpeakerCount?: number;
  model?: 'latest_long' | 'latest_short' | 'command_and_search' | 'phone_call' | 'video' | 'default';
}

export const defaultTranscriptionConfig: TranscriptionConfig = {
  encoding: 'WEBM_OPUS',
  sampleRateHertz: 48000,
  languageCode: 'en-US',
  enableAutomaticPunctuation: true,
  enableWordTimeOffsets: true,
  enableSpeakerDiarization: true,
  diarizationSpeakerCount: 6,
  model: 'latest_long',
};

// Real-time speech recognition stream
export function createSpeechRecognitionStream(config: Partial<TranscriptionConfig> = {}) {
  const finalConfig = { ...defaultTranscriptionConfig, ...config };
  
  const request = {
    config: {
      encoding: finalConfig.encoding,
      sampleRateHertz: finalConfig.sampleRateHertz,
      languageCode: finalConfig.languageCode,
      enableAutomaticPunctuation: finalConfig.enableAutomaticPunctuation,
      enableWordTimeOffsets: finalConfig.enableWordTimeOffsets,
      enableSpeakerDiarization: finalConfig.enableSpeakerDiarization,
      diarizationConfig: finalConfig.enableSpeakerDiarization ? {
        enableSpeakerDiarization: true,
        minSpeakerCount: 2,
        maxSpeakerCount: finalConfig.diarizationSpeakerCount || 6,
      } : undefined,
      model: finalConfig.model,
    },
    interimResults: true,
  };

  return speechClient.streamingRecognize(request);
}

// Enhanced real-time streaming with callback support
export function createEnhancedSpeechStream(
  onTranscript: (result: StreamingTranscriptionResult) => void,
  onError: (error: Error) => void,
  config: Partial<TranscriptionConfig> = {}
) {
  const finalConfig = { ...defaultTranscriptionConfig, ...config };
  
  const request = {
    config: {
      encoding: finalConfig.encoding,
      sampleRateHertz: finalConfig.sampleRateHertz,
      languageCode: finalConfig.languageCode,
      enableAutomaticPunctuation: finalConfig.enableAutomaticPunctuation,
      enableWordTimeOffsets: finalConfig.enableWordTimeOffsets,
      enableSpeakerDiarization: finalConfig.enableSpeakerDiarization,
      diarizationConfig: finalConfig.enableSpeakerDiarization ? {
        enableSpeakerDiarization: true,
        minSpeakerCount: 2,
        maxSpeakerCount: finalConfig.diarizationSpeakerCount || 6,
      } : undefined,
      model: finalConfig.model,
      useEnhanced: true,
    },
    interimResults: true,
    enableVoiceActivityEvents: true,
  };

  const recognizeStream = speechClient
    .streamingRecognize(request)
    .on('error', (error: any) => {
      console.error('Speech recognition error:', error);
      onError(error);
    })
    .on('data', (data: any) => {
      if (data.results?.[0]?.alternatives?.[0]) {
        const result = data.results[0];
        const alternative = result.alternatives[0];
        
        const transcriptResult: StreamingTranscriptionResult = {
          transcript: alternative.transcript || '',
          confidence: alternative.confidence || 0,
          isFinal: result.isFinal || false,
          speakerTag: alternative.words?.[0]?.speakerTag,
          timestamp: new Date().toISOString(),
          words: alternative.words?.map((word: any) => ({
            word: word.word,
            startTime: word.startTime,
            endTime: word.endTime,
            speakerTag: word.speakerTag,
            confidence: word.confidence,
          })),
        };
        
        onTranscript(transcriptResult);
      }
    });

  return recognizeStream;
}

// Create meeting transcription session
export function createMeetingTranscriptionSession(
  meetingId: string,
  participants: string[]
): MeetingTranscriptionSession {
  return {
    sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    meetingId,
    participants,
    startTime: new Date().toISOString(),
    isActive: true,
    transcripts: [],
  };
}

// Process and analyze meeting transcription
export function analyzeMeetingTranscription(
  session: MeetingTranscriptionSession
) {
  const speakers = new Map<number, { name: string; wordCount: number; speaking_time: number }>();
  let totalWords = 0;
  let totalDuration = 0;

  // Analyze speaker distribution and content
  session.transcripts.forEach(transcript => {
    if (transcript.isFinal && transcript.speakerTag !== undefined) {
      const speakerTag = transcript.speakerTag;
      const wordCount = transcript.words?.length || 0;
      
      if (!speakers.has(speakerTag)) {
        speakers.set(speakerTag, {
          name: `Speaker ${speakerTag + 1}`,
          wordCount: 0,
          speaking_time: 0,
        });
      }
      
      const speaker = speakers.get(speakerTag)!;
      speaker.wordCount += wordCount;
      totalWords += wordCount;
      
      // Calculate speaking time from words (rough estimation)
      if (transcript.words && transcript.words.length > 0) {
        const firstWord = transcript.words[0];
        const lastWord = transcript.words[transcript.words.length - 1];
        const duration = (lastWord.endTime?.seconds || 0) - (firstWord.startTime?.seconds || 0);
        speaker.speaking_time += duration;
        totalDuration = Math.max(totalDuration, lastWord.endTime?.seconds || 0);
      }
    }
  });

  // Generate insights
  const speakerStats = Array.from(speakers.entries()).map(([tag, stats]) => ({
    speakerTag: tag,
    name: stats.name,
    wordCount: stats.wordCount,
    speakingTime: stats.speaking_time,
    participationRate: totalWords > 0 ? (stats.wordCount / totalWords * 100) : 0,
  }));

  const fullTranscript = session.transcripts
    .filter(t => t.isFinal)
    .map(t => `${t.speakerTag !== undefined ? `Speaker ${t.speakerTag + 1}` : 'Unknown'}: ${t.transcript}`)
    .join('\n');

  return {
    sessionId: session.sessionId,
    meetingId: session.meetingId,
    duration: totalDuration,
    totalWords,
    speakerCount: speakers.size,
    speakerStats,
    fullTranscript,
    transcriptCount: session.transcripts.filter(t => t.isFinal).length,
    analysis: {
      dominantSpeaker: speakerStats.reduce((prev, current) => 
        prev.participationRate > current.participationRate ? prev : current
      ),
      averageWordsPerSpeaker: totalWords / speakers.size,
      meetingEngagement: speakerStats.filter(s => s.participationRate > 10).length / speakers.size * 100,
    },
  };
}

// Transcribe audio file
export async function transcribeAudioFile(
  audioBytes: Buffer,
  config: Partial<TranscriptionConfig> = {}
) {
  try {
    const finalConfig = { ...defaultTranscriptionConfig, ...config };
    
    const request = {
      audio: {
        content: audioBytes.toString('base64'),
      },
      config: {
        encoding: finalConfig.encoding,
        sampleRateHertz: finalConfig.sampleRateHertz,
        languageCode: finalConfig.languageCode,
        enableAutomaticPunctuation: finalConfig.enableAutomaticPunctuation,
        enableWordTimeOffsets: finalConfig.enableWordTimeOffsets,
        enableSpeakerDiarization: finalConfig.enableSpeakerDiarization,
        diarizationConfig: finalConfig.enableSpeakerDiarization ? {
          enableSpeakerDiarization: true,
          minSpeakerCount: 2,
          maxSpeakerCount: finalConfig.diarizationSpeakerCount || 6,
        } : undefined,
        model: finalConfig.model,
      },
    };

    const [response] = await speechClient.recognize(request);
    
    return {
      success: true,
      transcription: response.results?.map((result: any) => ({
        transcript: result.alternatives?.[0]?.transcript || '',
        confidence: result.alternatives?.[0]?.confidence || 0,
        words: result.alternatives?.[0]?.words || [],
        speakerTag: result.alternatives?.[0]?.words?.[0]?.speakerTag,
      })) || [],
    };
  } catch (error) {
    console.error('Error transcribing audio:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      transcription: [],
    };
  }
}

// Long running operation for longer audio files
export async function transcribeLongAudio(
  audioUri: string,
  config: Partial<TranscriptionConfig> = {}
) {
  try {
    const finalConfig = { ...defaultTranscriptionConfig, ...config };
    
    const request = {
      audio: {
        uri: audioUri,
      },
      config: {
        encoding: finalConfig.encoding,
        sampleRateHertz: finalConfig.sampleRateHertz,
        languageCode: finalConfig.languageCode,
        enableAutomaticPunctuation: finalConfig.enableAutomaticPunctuation,
        enableWordTimeOffsets: finalConfig.enableWordTimeOffsets,
        enableSpeakerDiarization: finalConfig.enableSpeakerDiarization,
        diarizationConfig: finalConfig.enableSpeakerDiarization ? {
          enableSpeakerDiarization: true,
          minSpeakerCount: 2,
          maxSpeakerCount: finalConfig.diarizationSpeakerCount || 6,
        } : undefined,
        model: finalConfig.model,
      },
    };

    const [operation] = await speechClient.longRunningRecognize(request);
    const [response] = await operation.promise();
    
    return {
      success: true,
      transcription: response.results?.map((result: any) => ({
        transcript: result.alternatives?.[0]?.transcript || '',
        confidence: result.alternatives?.[0]?.confidence || 0,
        words: result.alternatives?.[0]?.words || [],
        speakerTag: result.alternatives?.[0]?.words?.[0]?.speakerTag,
      })) || [],
    };
  } catch (error) {
    console.error('Error transcribing long audio:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      transcription: [],
    };
  }
}

// Format transcription for display
export function formatTranscription(transcriptionResults: any[]) {
  const speakers = new Map<number, string[]>();
  
  transcriptionResults.forEach(result => {
    result.words?.forEach((word: any) => {
      const speakerTag = word.speakerTag || 0;
      if (!speakers.has(speakerTag)) {
        speakers.set(speakerTag, []);
      }
      speakers.get(speakerTag)?.push(word.word);
    });
  });
  
  const formattedTranscript = Array.from(speakers.entries()).map(([speakerTag, words]) => ({
    speaker: `Speaker ${speakerTag + 1}`,
    text: words.join(' '),
  }));
  
  return formattedTranscript;
}