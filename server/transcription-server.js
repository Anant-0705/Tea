const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');

// Mock Google Speech-to-Text simulation
// In production, this would integrate with actual Google Cloud Speech API

class TranscriptionServer {
  constructor(port = 8080) {
    this.port = port;
    this.wss = new WebSocket.Server({ port: this.port });
    this.clients = new Map();
    this.setupServer();
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
        this.handleAudioData(clientId, data);
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
  }

  generateClientId() {
    return 'client_' + Math.random().toString(36).substr(2, 9);
  }

  async handleAudioData(clientId, audioData) {
    const client = this.clients.get(clientId);
    if (!client) return;

    client.lastActivity = Date.now();

    // In development, simulate transcription with mock responses
    // In production, this would send audio to Google Cloud Speech-to-Text
    this.simulateTranscription(client.ws, audioData);
  }

  simulateTranscription(ws, audioData) {
    // Mock transcription responses for development
    const mockPhrases = [
      "Let's start today's meeting with a review of our progress.",
      "I think we should focus on the main objectives for this quarter.",
      "Can everyone see the presentation on their screen?",
      "We need to discuss the budget allocation for the new project.",
      "That's a great point, let me add that to our action items.",
      "I'll follow up with the team about the implementation details.",
      "We should schedule a follow-up meeting next week.",
      "Does anyone have questions about the proposal?",
      "Let's move on to the next agenda item.",
      "I'll send out the meeting notes after this call."
    ];

    const speakers = ['Speaker 1', 'Speaker 2', 'Speaker 3'];
    
    // Simulate processing delay
    setTimeout(() => {
      if (ws.readyState === WebSocket.OPEN) {
        const randomPhrase = mockPhrases[Math.floor(Math.random() * mockPhrases.length)];
        const randomSpeaker = speakers[Math.floor(Math.random() * speakers.length)];
        
        ws.send(JSON.stringify({
          type: 'transcript',
          speaker: randomSpeaker,
          text: randomPhrase,
          confidence: 0.85 + Math.random() * 0.1, // 85-95% confidence
          timestamp: new Date().toISOString(),
          isFinal: true
        }));
      }
    }, 1000 + Math.random() * 2000); // Random delay 1-3 seconds
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