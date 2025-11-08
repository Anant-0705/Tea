#!/usr/bin/env node

/**
 * Test script to verify transcription system setup
 * Run with: node scripts/test-transcription-setup.js
 */

const WebSocket = require('ws');

console.log('🧪 Testing Transcription System Setup\n');

// Test 1: Check environment variables
console.log('1️⃣  Checking environment variables...');
const requiredEnvVars = [
  'GOOGLE_SERVICE_ACCOUNT_KEY',
  'GOOGLE_PROJECT_ID',
  'VERTEX_AI_LOCATION',
  'FIREBASE_PROJECT_ID',
  'FIREBASE_CLIENT_EMAIL',
  'FIREBASE_PRIVATE_KEY',
];

let envVarsOk = true;
requiredEnvVars.forEach(varName => {
  if (process.env[varName]) {
    console.log(`   ✅ ${varName} is set`);
  } else {
    console.log(`   ❌ ${varName} is missing`);
    envVarsOk = false;
  }
});

if (!envVarsOk) {
  console.log('\n⚠️  Some environment variables are missing. Check your .env.local file.');
  console.log('   See docs/QUICK_START_TRANSCRIPTION.md for setup instructions.\n');
}

// Test 2: Check WebSocket server
console.log('\n2️⃣  Testing WebSocket server connection...');
const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080';

const ws = new WebSocket(wsUrl);
let wsConnected = false;

ws.on('open', () => {
  console.log(`   ✅ Connected to WebSocket server at ${wsUrl}`);
  wsConnected = true;
  
  // Test sending a message
  console.log('\n3️⃣  Testing message exchange...');
  ws.send(JSON.stringify({
    type: 'start_meeting',
    meetingId: 'test-meeting-123',
    participants: ['Test User 1', 'Test User 2'],
  }));
});

ws.on('message', (data) => {
  try {
    const message = JSON.parse(data);
    console.log(`   ✅ Received message: ${message.type}`);
    
    if (message.type === 'meeting_started') {
      console.log(`   ✅ Meeting session started successfully`);
      
      // Send end meeting message
      setTimeout(() => {
        ws.send(JSON.stringify({
          type: 'end_meeting',
          meetingId: 'test-meeting-123',
        }));
      }, 1000);
    }
    
    if (message.type === 'meeting_ended') {
      console.log(`   ✅ Meeting session ended successfully`);
      console.log(`   📊 Transcript count: ${message.transcriptCount || 0}`);
      
      // Close connection
      setTimeout(() => {
        ws.close();
      }, 500);
    }
  } catch (error) {
    console.log(`   ⚠️  Received non-JSON message: ${data}`);
  }
});

ws.on('error', (error) => {
  console.log(`   ❌ WebSocket error: ${error.message}`);
  console.log('\n   Make sure the transcription server is running:');
  console.log('   node server/transcription-server.js\n');
});

ws.on('close', () => {
  if (wsConnected) {
    console.log('\n✅ All tests passed! Your transcription system is ready.');
    console.log('\n📚 Next steps:');
    console.log('   1. Start the Next.js app: npm run dev');
    console.log('   2. Navigate to: http://localhost:3000/dashboard/meet/test-meeting-123/transcribe');
    console.log('   3. Click "Start Recording" to test the full flow');
    console.log('\n📖 For more info, see: docs/QUICK_START_TRANSCRIPTION.md\n');
  } else {
    console.log('\n❌ Tests failed. Please check the errors above.\n');
  }
  process.exit(wsConnected ? 0 : 1);
});

// Timeout after 10 seconds
setTimeout(() => {
  if (!wsConnected) {
    console.log('\n⏱️  Connection timeout. Make sure the transcription server is running:');
    console.log('   node server/transcription-server.js\n');
    process.exit(1);
  }
}, 10000);
