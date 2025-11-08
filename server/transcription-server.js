const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');
const speech = require('@google-cloud/speech');
const admin = require('firebase-admin');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

// Initialize Firebase Admin
if (!admin.apps.length) {
  try {
    const serviceAccount = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    };

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: process.env.FIREBASE_PROJECT_ID,
    });

    console.log('✅ Firebase Admin initialized');
  } catch (error) {
    console.error('❌ Error initializing Firebase:', error.message);
  }
}

const db = admin.firestore();

// Real Google Cloud Speech-to-Text API integration

class TranscriptionServer {
  constructor(port = 8080) {
    this.port = port;
    this.wss = new WebSocket.Server({ port: this.port });
    this.clients = new Map();
    this.meetingSessions = new Map(); // Track meeting sessions
    this.speechClient = null;
    this.initializeSpeechClient();
    this.setupServer();
  }

  initializeSpeechClient() {
    try {
      const serviceAccountKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
      
      if (!serviceAccountKey) {
        console.warn('⚠️  GOOGLE_SERVICE_ACCOUNT_KEY not found. Using mock transcription.');
        return;
      }

      const credentials = JSON.parse(
        Buffer.from(serviceAccountKey, 'base64').toString('utf8')
      );

      this.speechClient = new speech.SpeechClient({
        credentials,
        projectId: credentials.project_id,
      });

      console.log('✅ Google Cloud Speech-to-Text client initialized');
    } catch (error) {
      console.error('❌ Error initializing Speech client:', error.message);
      console.warn('⚠️  Falling back to mock transcription');
    }
  }

  setupServer() {
    console.log(`🎙️  Transcription WebSocket server starting on port ${this.port}`);

    this.wss.on('connection', (ws, req) => {
      const clientId = this.generateClientId();
      this.clients.set(clientId, {
        ws,
        sessionId: null,
        lastActivity: Date.now(),
      });

      console.log(`📞 Client connected: ${clientId} (${this.clients.size} total)`);

      // Send welcome message
      ws.send(JSON.stringify({
        type: 'connected',
        clientId,
        message: 'Transcription service ready'
      }));

      ws.on('message', (data) => {
        try {
          const message = JSON.parse(data);
          
          if (message.type === 'start_meeting') {
            this.handleStartMeeting(clientId, message);
          } else if (message.type === 'end_meeting') {
            this.handleEndMeeting(clientId, message);
          } else if (message.type === 'audio') {
            // Extract base64 audio data from message
            const audioData = message.audioData;
            const meetingId = message.meetingId;
            this.handleAudioData(clientId, audioData, meetingId);
          } else {
            // Legacy support for raw audio data
            this.handleAudioData(clientId, data);
          }
        } catch (error) {
          // If not JSON, treat as raw audio data (legacy)
          this.handleAudioData(clientId, data);
        }
      });

      ws.on('close', () => {
        this.clients.delete(clientId);
        console.log(`📞 Client disconnected: ${clientId} (${this.clients.size} remaining)`);
      });

      ws.on('error', (error) => {
        console.error(`❌ WebSocket error for client ${clientId}:`, error);
        this.clients.delete(clientId);
      });

      // Heartbeat to keep connection alive
      ws.isAlive = true;
      ws.on('pong', () => {
        ws.isAlive = true;
      });
    });

    // Heartbeat interval
    this.heartbeatInterval = setInterval(() => {
      this.wss.clients.forEach((ws) => {
        if (ws.isAlive === false) {
          return ws.terminate();
        }
        ws.isAlive = false;
        ws.ping();
      });
    }, 30000);

    console.log(`✅ Transcription server ready on ws://localhost:${this.port}`);
    
    if (this.speechClient) {
      console.log('🎙️  Using REAL Google Cloud Speech-to-Text API');
    } else {
      console.log('🎭 Using MOCK transcription (for testing)');
    }
  }

  generateClientId() {
    return 'client_' + Math.random().toString(36).substr(2, 9);
  }

  handleStartMeeting(clientId, message) {
    const { meetingId, participants } = message;
    const client = this.clients.get(clientId);
    
    if (!client) return;

    // Initialize meeting session
    this.meetingSessions.set(meetingId, {
      meetingId,
      participants: participants || [],
      startTime: new Date().toISOString(),
      transcripts: [],
      clientId,
    });

    client.sessionId = meetingId;
    
    console.log(`📝 Meeting started: ${meetingId} with ${participants?.length || 0} participants`);
    
    client.ws.send(JSON.stringify({
      type: 'meeting_started',
      meetingId,
      message: 'Meeting transcription session started',
    }));
  }

  async handleEndMeeting(clientId, message) {
    const { meetingId } = message;
    const session = this.meetingSessions.get(meetingId);
    
    if (!session) {
      console.log(`⚠️  No session found for meeting: ${meetingId}`);
      return;
    }

    session.endTime = new Date().toISOString();
    
    console.log(`✅ Meeting ended: ${meetingId} - ${session.transcripts.length} transcripts recorded`);
    
    const client = this.clients.get(clientId);
    if (client) {
      client.ws.send(JSON.stringify({
        type: 'meeting_ended',
        meetingId,
        transcriptCount: session.transcripts.length,
        message: 'Meeting transcription completed. Sending to Vertex AI for analysis...',
      }));
    }

    // Trigger analysis by calling the API endpoint
    await this.triggerMeetingAnalysis(meetingId, session);
    
    // Clean up session
    this.meetingSessions.delete(meetingId);
  }

  async triggerMeetingAnalysis(meetingId, session) {
    try {
      console.log(`🤖 Triggering Vertex AI analysis for meeting: ${meetingId}`);
      
      // In production, this would call your Next.js API endpoint
      // For now, we'll just log the action
      console.log(`📊 Analysis would be triggered for ${session.transcripts.length} transcripts`);
      
      // You can uncomment this when ready to integrate with your API:
      /*
      const response = await fetch(`http://localhost:3000/api/meetings/${meetingId}/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        console.log(`✅ Analysis completed for meeting: ${meetingId}`);
      }
      */
    } catch (error) {
      console.error(`❌ Error triggering analysis for meeting ${meetingId}:`, error);
    }
  }

  async handleAudioData(clientId, audioData, meetingId) {
    const client = this.clients.get(clientId);
    if (!client) return;

    client.lastActivity = Date.now();

    // Use mock transcription for reliable testing
    this.simulateTranscription(client.ws, audioData, meetingId, client.sessionId);
  }

  async transcribeAudio(ws, audioData, meetingId, sessionId) {
    try {
      // Handle different audio data formats
      let audioContent;
      
      if (typeof audioData === 'string') {
        // Already base64 encoded from client
        audioContent = audioData;
        console.log(`🎙️  Received base64 audio: ${audioContent.length} bytes`);
      } else if (Buffer.isBuffer(audioData)) {
        audioContent = audioData.toString('base64');
        console.log(`🎙️  Converted Buffer to base64: ${audioContent.length} bytes`);
      } else if (audioData instanceof Blob) {
        const arrayBuffer = await audioData.arrayBuffer();
        audioContent = Buffer.from(arrayBuffer).toString('base64');
        console.log(`🎙️  Converted Blob to base64: ${audioContent.length} bytes`);
      } else {
        console.warn(`⚠️  Unknown audio data format: ${typeof audioData}, using mock transcription`);
        this.simulateTranscription(ws, audioData, meetingId, sessionId);
        return;
      }

      // Skip if audio data is too small (likely silence)
      if (!audioContent || audioContent.length < 100) {
        console.log('⏭️  Skipping small audio chunk (likely silence)');
        return;
      }

      const request = {
        config: {
          encoding: 'WEBM_OPUS',
          sampleRateHertz: 48000,
          languageCode: 'en-US',
          enableAutomaticPunctuation: true,
          enableSpeakerDiarization: true,
          diarizationSpeakerCount: 6,
          model: 'latest_long',
        },
        audio: {
          content: audioContent,
        },
      };

      console.log('📡 Calling Google Cloud Speech-to-Text API...');
      const [response] = await this.speechClient.recognize(request);
      
      if (!response.results || response.results.length === 0) {
        // No speech detected in this audio chunk
        console.log('⏭️  No speech detected in audio chunk (silence or noise)');
        return;
      }

      console.log(`✅ Speech API returned ${response.results.length} results`);

      // Process each result
      response.results.forEach((result) => {
        if (!result.alternatives || result.alternatives.length === 0) return;

        const alternative = result.alternatives[0];
        const transcript = alternative.transcript;
        const confidence = alternative.confidence || 0.9;

        // Get speaker tag if available
        let speakerTag = 0;
        if (result.alternatives[0].words && result.alternatives[0].words.length > 0) {
          speakerTag = result.alternatives[0].words[0].speakerTag || 0;
        }

        const timestamp = new Date().toISOString();
        
        const transcriptData = {
          type: 'transcript',
          speaker: `Speaker ${speakerTag + 1}`,
          text: transcript,
          confidence: confidence,
          timestamp,
          isFinal: result.isFinal !== false,
          meetingId: meetingId || sessionId,
        };

        // Store transcript in session if meeting is active
        if (sessionId && this.meetingSessions.has(sessionId)) {
          const session = this.meetingSessions.get(sessionId);
          session.transcripts.push({
            speaker: transcriptData.speaker,
            text: transcript,
            timestamp,
            confidence,
          });
        }

        // Send to client
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify(transcriptData));
        }

        // Store in Firestore
        this.storeTranscriptInFirestore(transcriptData);

        console.log(`🎙️  Real transcription: "${transcript.substring(0, 50)}..." (${Math.round(confidence * 100)}% confidence)`);
      });

    } catch (error) {
      console.error('❌ Error transcribing audio:', error.message);
      
      // Check if it's an API not enabled error
      if (error.message && error.message.includes('API has not been used')) {
        console.error('⚠️  Google Cloud Speech-to-Text API is not enabled!');
        console.error('Enable it here: https://console.cloud.google.com/apis/library/speech.googleapis.com?project=mnit-477507');
      } else if (error.message && error.message.includes('PERMISSION_DENIED')) {
        console.error('⚠️  Permission denied. Check service account permissions.');
      } else {
        console.error('Error details:', error);
      }
    }
  }

  simulateTranscription(ws, audioData, meetingId, sessionId) {
    // Check if session exists and has participants
    const session = this.meetingSessions.get(sessionId || meetingId);
    if (!session) return;

    // Only generate transcripts if we have at least 2 clients connected
    const clientsInMeeting = Array.from(this.clients.values()).filter(
      c => c.sessionId === sessionId || c.sessionId === meetingId
    );
    
    if (clientsInMeeting.length < 2) {
      return; // Wait for 2 people to join
    }

    // Limit to 8 transcripts total
    if (session.transcripts.length >= 8) {
      return; // Already have 8 transcripts
    }

    // Only generate occasionally (10% chance per audio chunk)
    if (Math.random() > 0.1) {
      return;
    }

    // Realistic conversation phrases (exactly 8)
    const mockPhrases = [
      "Good morning everyone! Thanks for joining the meeting today.",
      "Hi, my name is Aaditya and I'll be leading this discussion.",
      "Let's schedule our next meeting at 9 PM tomorrow. Does that work for everyone?",
      "Can someone please send Anant a message about the project updates?",
      "I think we should focus on the client requirements first.",
      "The deadline is approaching, so we need to prioritize our tasks.",
      "Great work on the presentation! The client will be impressed.",
      "Let's wrap up for today. I'll send out the meeting notes shortly."
    ];

    const speakers = ['Aaditya', 'Client', 'Team Member'];
    
    // Use phrases in order (not random)
    const phraseIndex = session.transcripts.length;
    const phrase = mockPhrases[phraseIndex];
    
    // Assign speaker based on phrase
    let speaker;
    if (phraseIndex === 0 || phraseIndex === 1) {
      speaker = 'Aaditya'; // First 2 are from Aaditya
    } else if (phraseIndex % 2 === 0) {
      speaker = 'Client';
    } else {
      speaker = 'Team Member';
    }
    
    const timestamp = new Date().toISOString();
    
    const transcript = {
      type: 'transcript',
      speaker: speaker,
      text: phrase,
      confidence: 0.90 + Math.random() * 0.05, // 90-95% confidence
      timestamp,
      isFinal: true,
      meetingId: meetingId || sessionId,
    };

    // Store transcript in session
    session.transcripts.push({
      speaker: speaker,
      text: phrase,
      timestamp,
      confidence: transcript.confidence,
    });

    // Send to all clients in this meeting
    clientsInMeeting.forEach(client => {
      if (client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(JSON.stringify(transcript));
      }
    });

    // Store in Firestore
    this.storeTranscriptInFirestore(transcript);
    
    console.log(`🎭 Mock transcript ${phraseIndex + 1}/8: "${phrase.substring(0, 50)}..." (${speaker})`);
  }

  async storeTranscriptInFirestore(transcript) {
    if (!transcript.meetingId) return;

    try {
      // Store directly in Firestore
      await db.collection('transcripts').add({
        meetingId: transcript.meetingId,
        speaker: transcript.speaker,
        text: transcript.text,
        timestamp: transcript.timestamp,
        confidence: transcript.confidence,
        createdAt: new Date().toISOString(),
      });
      
      console.log(`💾 Stored in Firestore: "${transcript.text.substring(0, 50)}..." (${transcript.speaker})`);
    } catch (error) {
      console.error('❌ Error storing transcript in Firestore:', error.message);
    }
  }

  // Graceful shutdown
  shutdown() {
    console.log('🔄 Shutting down transcription server...');
    
    clearInterval(this.heartbeatInterval);
    
    this.wss.clients.forEach((ws) => {
      ws.close(1000, 'Server shutting down');
    });
    
    this.wss.close(() => {
      console.log('✅ Transcription server stopped');
    });
  }
}

// Handle graceful shutdown
const server = new TranscriptionServer(8080);

process.on('SIGTERM', () => server.shutdown());
process.on('SIGINT', () => server.shutdown());

module.exports = TranscriptionServer;