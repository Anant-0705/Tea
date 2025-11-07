#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

console.log('🚀 AutoTrack GCP Setup Helper\n');

// Check if service account file exists
const serviceAccountPath = path.join(__dirname, '..', 'mnit-477507-83763a3bc519.json');
if (!fs.existsSync(serviceAccountPath)) {
  console.error('❌ Service account file not found: mnit-477507-83763a3bc519.json');
  console.log('Please make sure the file is in the project root directory.');
  process.exit(1);
}

// Read service account file
let serviceAccount;
try {
  const serviceAccountContent = fs.readFileSync(serviceAccountPath, 'utf8');
  serviceAccount = JSON.parse(serviceAccountContent);
  console.log('✅ Service account file loaded successfully');
} catch (error) {
  console.error('❌ Error reading service account file:', error.message);
  process.exit(1);
}

// Generate random NextAuth secret
const nextAuthSecret = crypto.randomBytes(32).toString('hex');

// Encode service account JSON to base64
const serviceAccountBase64 = Buffer.from(JSON.stringify(serviceAccount)).toString('base64');

// Create .env.local content
const envContent = `# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=${nextAuthSecret}

# Google OAuth (You need to create these in Google Cloud Console)
# Follow the setup guide to create OAuth 2.0 credentials
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Google Cloud Project Configuration
GOOGLE_CLOUD_PROJECT_ID=${serviceAccount.project_id}

# Service Account Configuration (auto-generated from your JSON file)
GOOGLE_SERVICE_ACCOUNT_KEY=${serviceAccountBase64}

# Firestore Configuration
FIRESTORE_PROJECT_ID=${serviceAccount.project_id}

# Google APIs Configuration
GOOGLE_CLOUD_LOCATION=us-central1
VERTEX_AI_LOCATION=us-central1

# Firebase Configuration (using service account values)
FIREBASE_PROJECT_ID=${serviceAccount.project_id}
FIREBASE_CLIENT_EMAIL=${serviceAccount.client_email}
FIREBASE_PRIVATE_KEY="${serviceAccount.private_key}"

# Development/Production URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_WS_URL=ws://localhost:8080

# Application Configuration
NODE_ENV=development
`;

// Write .env.local file
const envPath = path.join(__dirname, '..', '.env.local');
try {
  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env.local file created successfully');
} catch (error) {
  console.error('❌ Error writing .env.local file:', error.message);
  process.exit(1);
}

console.log('\n📋 Configuration Summary:');
console.log(`Project ID: ${serviceAccount.project_id}`);
console.log(`Service Account: ${serviceAccount.client_email}`);
console.log(`NextAuth Secret: Generated automatically`);

console.log('\n⚠️  IMPORTANT NEXT STEPS:');
console.log('1. Go to Google Cloud Console (https://console.cloud.google.com/)');
console.log('2. Select your project: ' + serviceAccount.project_id);
console.log('3. Enable required APIs:');
console.log('   - Google Calendar API');
console.log('   - Gmail API');
console.log('   - Cloud Firestore API');
console.log('   - Cloud Speech-to-Text API');
console.log('   - Vertex AI API');
console.log('4. Create OAuth 2.0 credentials:');
console.log('   - Go to APIs & Services → Credentials');
console.log('   - Create OAuth client ID (Web application)');
console.log('   - Add redirect URI: http://localhost:3000/api/auth/callback/google');
console.log('   - Copy Client ID and Client Secret to .env.local');
console.log('5. Setup Firestore database in the console');

console.log('\n🔧 Quick Commands:');
console.log('npm install googleapis google-auth-library  # Install dependencies');
console.log('npm run dev                                  # Start development server');
console.log('node scripts/test-gcp-setup.js             # Test GCP connection');

console.log('\n✨ Setup complete! Update GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env.local');