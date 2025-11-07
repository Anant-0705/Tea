#!/usr/bin/env node

/**
 * GCP Credentials Setup Helper
 * 
 * This script helps you configure your Google Cloud Platform credentials
 * for the AutoTrack Meeting System.
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function setupCredentials() {
  console.log('🚀 AutoTrack GCP Credentials Setup\n');
  console.log('This script will help you configure your .env.local file with GCP credentials.\n');
  
  // Collect credentials
  const credentials = {};
  
  console.log('📝 Please provide the following credentials from Google Cloud Console:\n');
  
  credentials.GOOGLE_CLIENT_ID = await question('Google OAuth Client ID: ');
  credentials.GOOGLE_CLIENT_SECRET = await question('Google OAuth Client Secret: ');
  credentials.GOOGLE_CLOUD_PROJECT_ID = await question('Google Cloud Project ID: ');
  
  // Generate NextAuth secret
  credentials.NEXTAUTH_URL = 'http://localhost:3000';
  credentials.NEXTAUTH_SECRET = generateRandomSecret();
  
  // Ask for service account key
  console.log('\n📋 For the Service Account Key:');
  console.log('1. Download your service-account-key.json file from GCP Console');
  console.log('2. Place it in your project root directory');
  console.log('3. This script will encode it for you\n');
  
  const serviceAccountPath = await question('Path to service-account-key.json (or press Enter for ./service-account-key.json): ') 
    || './service-account-key.json';
  
  // Check if service account file exists
  if (fs.existsSync(serviceAccountPath)) {
    try {
      const serviceAccountContent = fs.readFileSync(serviceAccountPath, 'utf8');
      credentials.GOOGLE_SERVICE_ACCOUNT_KEY = Buffer.from(serviceAccountContent).toString('base64');
      console.log('✅ Service account key encoded successfully');
    } catch (error) {
      console.log('❌ Error reading service account file:', error.message);
      console.log('You can manually add this later to your .env.local file');
    }
  } else {
    console.log('⚠️  Service account file not found. You can add this manually later.');
  }
  
  // Set default values
  credentials.FIRESTORE_PROJECT_ID = credentials.GOOGLE_CLOUD_PROJECT_ID;
  credentials.GOOGLE_CLOUD_LOCATION = 'us-central1';
  credentials.VERTEX_AI_LOCATION = 'us-central1';
  
  // Create .env.local file
  createEnvFile(credentials);
  
  console.log('\n🎉 Setup Complete!');
  console.log('\nYour .env.local file has been created with the following configuration:');
  console.log('✅ OAuth credentials');
  console.log('✅ NextAuth configuration');
  console.log('✅ Google Cloud project settings');
  console.log('✅ Service locations');
  
  if (credentials.GOOGLE_SERVICE_ACCOUNT_KEY) {
    console.log('✅ Service account key (encoded)');
  } else {
    console.log('⚠️  Service account key (you need to add this manually)');
  }
  
  console.log('\n📚 Next steps:');
  console.log('1. Review your .env.local file');
  console.log('2. Ensure all APIs are enabled in GCP Console');
  console.log('3. Run: npm run dev');
  console.log('4. Test the authentication flow');
  
  console.log('\n📖 For detailed setup instructions, see: docs/GCP-SETUP-COMPLETE-GUIDE.md');
}

function generateRandomSecret() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function createEnvFile(credentials) {
  const envContent = `# AutoTrack Meeting System - Environment Configuration
# Generated on ${new Date().toISOString()}

# OAuth 2.0 Credentials (from Google Cloud Console)
GOOGLE_CLIENT_ID=${credentials.GOOGLE_CLIENT_ID}
GOOGLE_CLIENT_SECRET=${credentials.GOOGLE_CLIENT_SECRET}

# NextAuth Configuration
NEXTAUTH_URL=${credentials.NEXTAUTH_URL}
NEXTAUTH_SECRET=${credentials.NEXTAUTH_SECRET}

# Google Cloud Project Configuration
GOOGLE_CLOUD_PROJECT_ID=${credentials.GOOGLE_CLOUD_PROJECT_ID}
FIRESTORE_PROJECT_ID=${credentials.FIRESTORE_PROJECT_ID}

# Service Account Key (Base64 encoded JSON)
GOOGLE_SERVICE_ACCOUNT_KEY=${credentials.GOOGLE_SERVICE_ACCOUNT_KEY || 'YOUR_BASE64_ENCODED_SERVICE_ACCOUNT_JSON_HERE'}

# API Configuration
GOOGLE_CLOUD_LOCATION=${credentials.GOOGLE_CLOUD_LOCATION}
VERTEX_AI_LOCATION=${credentials.VERTEX_AI_LOCATION}

# Development Configuration
NODE_ENV=development
`;

  fs.writeFileSync('.env.local', envContent);
  
  // Update .gitignore to ensure .env.local is ignored
  const gitignorePath = '.gitignore';
  let gitignoreContent = '';
  
  if (fs.existsSync(gitignorePath)) {
    gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
  }
  
  if (!gitignoreContent.includes('.env.local')) {
    gitignoreContent += '\n# Environment variables\n.env.local\n.env\nservice-account-key.json\n';
    fs.writeFileSync(gitignorePath, gitignoreContent);
    console.log('✅ Updated .gitignore to exclude sensitive files');
  }
}

// Run the setup
setupCredentials().finally(() => {
  rl.close();
});