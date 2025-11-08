// Test script to verify Vertex AI authentication
require('dotenv').config({ path: '.env.local' });
const { VertexAI } = require('@google-cloud/vertexai');

async function testVertexAI() {
  try {
    console.log('🔍 Testing Vertex AI authentication...\n');

    const serviceAccountKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
    if (!serviceAccountKey) {
      throw new Error('GOOGLE_SERVICE_ACCOUNT_KEY not found in environment');
    }

    console.log('✅ Service account key found');

    const decodedKey = Buffer.from(serviceAccountKey, 'base64').toString('utf8');
    const credentials = JSON.parse(decodedKey);

    console.log('✅ Credentials decoded successfully');
    console.log(`   Project ID: ${credentials.project_id}`);
    console.log(`   Client Email: ${credentials.client_email}\n`);

    // Initialize Vertex AI
    const vertex_ai = new VertexAI({
      project: credentials.project_id,
      location: 'us-central1',
      googleAuthOptions: {
        credentials: {
          client_email: credentials.client_email,
          private_key: credentials.private_key,
        },
      },
    });

    console.log('✅ Vertex AI client initialized\n');

    // Try to get a model - using Gemini 2.5 Flash
    const model = 'gemini-2.0-flash-exp';
    const generativeModel = vertex_ai.getGenerativeModel({
      model: model,
      generation_config: {
        max_output_tokens: 100,
        temperature: 0.1,
      },
    });

    console.log('✅ Generative model created\n');
    console.log('🧪 Testing with a simple prompt...\n');

    const result = await generativeModel.generateContent('Say "Hello, Vertex AI is working!"');
    const response = result.response;
    
    // Handle different response formats
    let text;
    if (typeof response.text === 'function') {
      text = response.text();
    } else if (response.candidates && response.candidates[0]) {
      text = response.candidates[0].content.parts[0].text;
    } else {
      text = JSON.stringify(response);
    }

    console.log('✅ SUCCESS! Vertex AI is working!\n');
    console.log('Response:', text);

  } catch (error) {
    console.error('❌ ERROR:', error.message);
    if (error.cause) {
      console.error('   Cause:', error.cause.message);
    }
    console.error('\n📝 Troubleshooting steps:');
    console.error('   1. Ensure Vertex AI API is enabled in Google Cloud Console');
    console.error('   2. Visit: https://console.cloud.google.com/apis/library/aiplatform.googleapis.com');
    console.error('   3. Enable the API for project:', process.env.GOOGLE_PROJECT_ID);
    console.error('   4. Ensure service account has "Vertex AI User" role');
    process.exit(1);
  }
}

testVertexAI();
