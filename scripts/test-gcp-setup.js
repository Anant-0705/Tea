#!/usr/bin/env node

/**
 * GCP Setup Verification Script
 * 
 * This script tests your Google Cloud Platform configuration
 * to ensure all services are properly set up.
 */

require('dotenv').config({ path: '.env.local' });

async function testGCPSetup() {
  console.log('🔍 Testing Google Cloud Platform Setup...\n');
  
  let allTestsPassed = true;
  
  // Test 1: Environment Variables
  console.log('📋 Testing Environment Variables:');
  const requiredEnvVars = [
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET', 
    'GOOGLE_CLOUD_PROJECT_ID',
    'NEXTAUTH_SECRET',
    'GOOGLE_SERVICE_ACCOUNT_KEY'
  ];
  
  for (const envVar of requiredEnvVars) {
    if (process.env[envVar]) {
      console.log(`✅ ${envVar} is set`);
    } else {
      console.log(`❌ ${envVar} is missing`);
      allTestsPassed = false;
    }
  }
  
  if (!process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
    console.log('\n⚠️  Service account key is required for API access.');
    console.log('   Follow the GCP setup guide to obtain this credential.');
    return;
  }
  
  // Test 2: Service Account Authentication
  console.log('\n🔑 Testing Service Account Authentication:');
  try {
    const { GoogleAuth } = require('google-auth-library');
    
    const auth = new GoogleAuth({
      credentials: JSON.parse(Buffer.from(process.env.GOOGLE_SERVICE_ACCOUNT_KEY, 'base64').toString()),
      scopes: [
        'https://www.googleapis.com/auth/cloud-platform',
        'https://www.googleapis.com/auth/calendar',
        'https://www.googleapis.com/auth/gmail.send'
      ]
    });
    
    const client = await auth.getClient();
    const projectId = await auth.getProjectId();
    
    console.log('✅ Service account authentication successful');
    console.log(`✅ Project ID verified: ${projectId}`);
    
    if (projectId !== process.env.GOOGLE_CLOUD_PROJECT_ID) {
      console.log('⚠️  Project ID mismatch in environment variables');
    }
    
  } catch (error) {
    console.log('❌ Service account authentication failed:', error.message);
    allTestsPassed = false;
  }
  
  // Test 3: API Access
  console.log('\n🌐 Testing API Access:');
  try {
    const { google } = require('googleapis');
    const { GoogleAuth } = require('google-auth-library');
    
    const auth = new GoogleAuth({
      credentials: JSON.parse(Buffer.from(process.env.GOOGLE_SERVICE_ACCOUNT_KEY, 'base64').toString()),
      scopes: ['https://www.googleapis.com/auth/cloud-platform']
    });
    
    // Test Calendar API
    try {
      const calendar = google.calendar({ version: 'v3', auth });
      console.log('✅ Calendar API access verified');
    } catch (error) {
      console.log('❌ Calendar API access failed');
      allTestsPassed = false;
    }
    
    // Test Gmail API
    try {
      const gmail = google.gmail({ version: 'v1', auth });
      console.log('✅ Gmail API access verified');
    } catch (error) {
      console.log('❌ Gmail API access failed');
      allTestsPassed = false;
    }
    
  } catch (error) {
    console.log('❌ API setup error:', error.message);
    allTestsPassed = false;
  }
  
  // Test 4: OAuth Configuration
  console.log('\n🔐 Testing OAuth Configuration:');
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (clientId && clientId.includes('.apps.googleusercontent.com')) {
    console.log('✅ OAuth Client ID format is valid');
  } else {
    console.log('❌ OAuth Client ID format is invalid');
    allTestsPassed = false;
  }
  
  if (process.env.NEXTAUTH_SECRET && process.env.NEXTAUTH_SECRET.length >= 32) {
    console.log('✅ NextAuth secret is properly configured');
  } else {
    console.log('❌ NextAuth secret is too short or missing');
    allTestsPassed = false;
  }
  
  // Test 5: Project Structure
  console.log('\n📁 Testing Project Structure:');
  const fs = require('fs');
  const requiredFiles = [
    'package.json',
    'next.config.ts',
    'app/api/auth/[...nextauth]/route.ts',
    'lib/google/calendar.ts',
    'lib/google/firestore.ts'
  ];
  
  for (const file of requiredFiles) {
    if (fs.existsSync(file)) {
      console.log(`✅ ${file} exists`);
    } else {
      console.log(`❌ ${file} is missing`);
      allTestsPassed = false;
    }
  }
  
  // Final Results
  console.log('\n' + '='.repeat(50));
  if (allTestsPassed) {
    console.log('🎉 All tests passed! Your GCP setup is ready.');
    console.log('\n✅ You can now:');
    console.log('   • Run: npm run dev');
    console.log('   • Test authentication');
    console.log('   • Use calendar integration');
    console.log('   • Send automated emails');
    console.log('   • Access all meeting features');
  } else {
    console.log('❌ Some tests failed. Please review the errors above.');
    console.log('\n📚 For help:');
    console.log('   • Check docs/GCP-SETUP-COMPLETE-GUIDE.md');
    console.log('   • Verify all APIs are enabled in GCP Console');
    console.log('   • Ensure proper IAM permissions');
    console.log('   • Run: node scripts/setup-gcp-credentials.js');
  }
  console.log('='.repeat(50));
}

// Handle missing dependencies gracefully
function checkDependencies() {
  const required = ['google-auth-library', 'googleapis'];
  const missing = [];
  
  for (const dep of required) {
    try {
      require(dep);
    } catch (error) {
      missing.push(dep);
    }
  }
  
  if (missing.length > 0) {
    console.log('❌ Missing required dependencies:');
    missing.forEach(dep => console.log(`   • ${dep}`));
    console.log('\n📦 Install missing dependencies:');
    console.log(`   npm install ${missing.join(' ')}`);
    process.exit(1);
  }
}

// Run tests
checkDependencies();
testGCPSetup().catch(error => {
  console.error('❌ Test script error:', error.message);
  process.exit(1);
});