# Google Cloud Platform Setup Guide

This guide walks you through setting up Google Cloud Platform for the AutoTrack application.

## Prerequisites

1. Google Account
2. Google Cloud Platform Account (with billing enabled)

## Step 1: Create a Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" dropdown → "New Project"
3. Enter project name: `autotrack-ai` (or your preferred name)
4. Note your Project ID (will be auto-generated)
5. Click "Create"

## Step 2: Enable Required APIs

In the Google Cloud Console, navigate to "APIs & Services" → "Library" and enable:

1. **Google Calendar API**
   - Search for "Google Calendar API"
   - Click "Enable"

2. **Cloud Speech-to-Text API**
   - Search for "Cloud Speech-to-Text API"
   - Click "Enable"

3. **Cloud Firestore API**
   - Search for "Cloud Firestore API"
   - Click "Enable"

4. **Gmail API** (for sending notifications)
   - Search for "Gmail API"
   - Click "Enable"

## Step 3: Create Service Account

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "Service Account"
3. Enter service account details:
   - **Name**: `autotrack-service-account`
   - **Description**: `Service account for AutoTrack AI application`
4. Click "Create and Continue"
5. Grant roles:
   - **Firebase Admin SDK Administrator Service Agent**
   - **Cloud Speech Service Agent**
   - **Service Account Token Creator**
6. Click "Continue" → "Done"

## Step 4: Generate Service Account Key

1. In the Credentials page, find your service account
2. Click on the service account email
3. Go to "Keys" tab
4. Click "Add Key" → "Create new key"
5. Select "JSON" format
6. Click "Create" - this downloads your key file
7. **IMPORTANT**: Store this file securely and never commit it to version control

## Step 5: Setup Firebase (Firestore)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Select your existing Google Cloud project
4. Enable Google Analytics (optional)
5. Click "Create project"

### Initialize Firestore Database

1. In Firebase Console, click "Firestore Database"
2. Click "Create database"
3. Start in **production mode** (we'll add security rules later)
4. Choose your location (preferably same as your application server)
5. Click "Done"

## Step 6: Update Environment Variables

Update your `.env.local` file with the following values:

```bash
# Google Cloud Platform Configuration
GOOGLE_CLOUD_PROJECT_ID=your-actual-project-id
GOOGLE_APPLICATION_CREDENTIALS=path/to/your/service-account-key.json

# Firebase Configuration (from Firebase Console → Project Settings → Service Accounts)
FIREBASE_PROJECT_ID=your-actual-project-id
FIREBASE_CLIENT_EMAIL=autotrack-service-account@your-project-id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_ACTUAL_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
```

### How to get Firebase credentials:

1. In Firebase Console → Project Settings → Service Accounts
2. Click "Generate new private key"
3. Use the downloaded JSON file values:
   - `project_id` → `FIREBASE_PROJECT_ID`
   - `client_email` → `FIREBASE_CLIENT_EMAIL`
   - `private_key` → `FIREBASE_PRIVATE_KEY` (keep the \n characters)

## Step 7: Setup OAuth Consent Screen

1. Go to "APIs & Services" → "OAuth consent screen"
2. Choose "External" user type
3. Fill in required fields:
   - **App name**: AutoTrack AI
   - **User support email**: Your email
   - **Developer contact**: Your email
4. Add scopes:
   - `.../auth/calendar`
   - `.../auth/gmail.send`
   - `openid`
   - `email`
   - `profile`
5. Add test users (your email and any other developers)

## Step 8: Update OAuth Credentials

1. Go to "APIs & Services" → "Credentials"
2. Find your OAuth 2.0 Client ID
3. Click edit (pencil icon)
4. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (development)
   - `https://yourdomain.com/api/auth/callback/google` (production)
5. Update your `.env.local` with the real client ID and secret

## Step 9: Test the Setup

1. Run your development server: `npm run dev`
2. Try to schedule a meeting while signed in with Google
3. Check that:
   - Calendar event is created
   - Google Meet link is generated
   - Meeting data is stored in Firestore

## Firestore Security Rules

Add these security rules in Firebase Console → Firestore Database → Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Meetings: Users can read/write their own meetings
    match /meetings/{meetingId} {
      allow read, write: if request.auth != null && 
        (request.auth.uid == resource.data.organizerId || 
         request.auth.token.email in resource.data.attendees);
    }
    
    // Transcripts: Users can read transcripts for meetings they're part of
    match /transcripts/{transcriptId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    
    // Action Items: Users can read/write action items for their meetings
    match /action-items/{actionItemId} {
      allow read, write: if request.auth != null;
    }
    
    // Users: Users can read/write their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Sentiment Analysis: Read-only for authenticated users
    match /sentiment-analysis/{sentimentId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

## Troubleshooting

### Common Issues:

1. **"Access Token Expired"**: Make sure your OAuth consent screen is configured properly
2. **"Calendar API not enabled"**: Double-check that all required APIs are enabled
3. **"Service account permissions"**: Ensure the service account has the correct roles
4. **"Firestore permission denied"**: Check your security rules match the patterns above

### Debug Tips:

1. Check browser network tab for API errors
2. Look at server logs for detailed error messages
3. Verify all environment variables are set correctly
4. Test API endpoints directly with tools like Postman

## Production Deployment

When deploying to production:

1. Create a production Google Cloud project
2. Use production domain in OAuth redirect URIs
3. Store service account key securely (not in code)
4. Use environment variables for all sensitive data
5. Enable proper Firestore security rules
6. Monitor API quotas and billing

## Cost Optimization

- Calendar API: 100 requests/day free
- Speech-to-Text: 60 minutes/month free
- Firestore: 1GB storage + 50K reads + 20K writes/day free
- Monitor usage in Google Cloud Console → Billing