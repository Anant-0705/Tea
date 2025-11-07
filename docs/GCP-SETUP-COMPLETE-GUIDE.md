# Google Cloud Platform (GCP) Setup Guide

## 🚀 Complete GCP Configuration for AutoTrack Meeting System

This guide will walk you through setting up all necessary Google Cloud Platform services and obtaining the required credentials for the Real-Time Autonomous Call Tracking & Task Automation System.

## 📋 Prerequisites

- Google Account (Gmail or Google Workspace)
- Credit card for GCP billing (free tier available)
- Basic familiarity with Google Cloud Console

## 🎯 Services We'll Configure

1. **Google Cloud Project** - Main container for all resources
2. **OAuth 2.0 Credentials** - For user authentication
3. **Calendar API** - For meeting scheduling automation
4. **Gmail API** - For automated email sending
5. **Cloud Firestore** - For data storage
6. **Cloud Speech-to-Text API** - For transcription
7. **Vertex AI** - For intelligent analysis
8. **Service Account** - For server-side API access

---

## Step 1: Create Google Cloud Project

### 1.1 Access Google Cloud Console
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Sign in with your Google account
3. Accept terms of service if prompted

### 1.2 Create New Project
1. Click on the project dropdown at the top
2. Click **"New Project"**
3. Enter project details:
   - **Project Name**: `autotrack-meeting-system`
   - **Project ID**: `autotrack-meeting-system-[random-id]` (will be auto-generated)
   - **Organization**: Leave as default or select your organization
4. Click **"Create"**
5. Wait for project creation (1-2 minutes)
6. Select the new project from the dropdown

### 1.3 Enable Billing (Required)
1. Go to **Billing** in the left sidebar
2. Click **"Link a billing account"**
3. Create new billing account or select existing one
4. Add payment method (credit card)
5. **Note**: Most APIs have generous free tiers

---

## Step 2: Enable Required APIs

### 2.1 Navigate to APIs & Services
1. In the left sidebar, click **"APIs & Services"** → **"Library"**
2. Enable the following APIs one by one:

### 2.2 Enable Each API
Search for and enable each of these APIs:

```bash
# Required APIs to Enable:
✅ Google Calendar API
✅ Gmail API  
✅ Cloud Firestore API
✅ Cloud Speech-to-Text API
✅ Vertex AI API
✅ Cloud Resource Manager API
✅ Identity and Access Management (IAM) API
```

**For each API:**
1. Search for the API name
2. Click on the API
3. Click **"Enable"**
4. Wait for activation

---

## Step 3: Create OAuth 2.0 Credentials

### 3.1 Configure OAuth Consent Screen
1. Go to **"APIs & Services"** → **"OAuth consent screen"**
2. Choose **"External"** (unless you have Google Workspace)
3. Fill in required information:
   - **App name**: `AutoTrack Meeting System`
   - **User support email**: Your email
   - **Developer contact**: Your email
4. Click **"Save and Continue"**
5. **Scopes**: Click **"Add or Remove Scopes"**
   - Add these scopes:
   ```
   https://www.googleapis.com/auth/calendar
   https://www.googleapis.com/auth/gmail.send
   https://www.googleapis.com/auth/userinfo.email
   https://www.googleapis.com/auth/userinfo.profile
   ```
6. **Test users**: Add your email address
7. Click **"Save and Continue"**

### 3.2 Create OAuth Client ID
1. Go to **"APIs & Services"** → **"Credentials"**
2. Click **"+ Create Credentials"** → **"OAuth client ID"**
3. Select **"Web application"**
4. Configure:
   - **Name**: `AutoTrack Web Client`
   - **Authorized JavaScript origins**:
     ```
     http://localhost:3000
     https://your-domain.com
     ```
   - **Authorized redirect URIs**:
     ```
     http://localhost:3000/api/auth/callback/google
     https://your-domain.com/api/auth/callback/google
     ```
5. Click **"Create"**
6. **📝 SAVE THESE CREDENTIALS:**
   - **Client ID**: `your-client-id.apps.googleusercontent.com`
   - **Client Secret**: `your-client-secret`

---

## Step 4: Create Service Account

### 4.1 Create Service Account
1. Go to **"APIs & Services"** → **"Credentials"**
2. Click **"+ Create Credentials"** → **"Service account"**
3. Fill in details:
   - **Service account name**: `autotrack-service-account`
   - **Service account ID**: `autotrack-service-account`
   - **Description**: `Service account for AutoTrack meeting system`
4. Click **"Create and Continue"**

### 4.2 Grant Permissions
1. **Grant this service account access to project**:
   - Add roles:
     ```
     Editor
     Firebase Admin SDK Service Agent
     Cloud Speech Client
     AI Platform Admin
     ```
2. Click **"Continue"**
3. Click **"Done"**

### 4.3 Create Service Account Key
1. Find your service account in the list
2. Click on the service account email
3. Go to **"Keys"** tab
4. Click **"Add Key"** → **"Create new key"**
5. Select **"JSON"**
6. Click **"Create"**
7. **📝 DOWNLOAD AND SAVE** the JSON file as `service-account-key.json`

---

## Step 5: Setup Cloud Firestore

### 5.1 Create Firestore Database
1. Search for **"Firestore"** in the console
2. Click **"Create database"**
3. Choose **"Production mode"**
4. Select location (choose closest to your users):
   - **Multi-region**: `nam5 (United States)`
   - **Region**: `us-central1`
5. Click **"Create"**
6. Wait for database creation

### 5.2 Configure Security Rules
1. Go to **"Rules"** tab in Firestore
2. Replace with these rules:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Allow authenticated users to access meetings they're part of
    match /meetings/{meetingId} {
      allow read, write: if request.auth != null;
    }
    
    // Allow authenticated users to access action items
    match /actionItems/{actionItemId} {
      allow read, write: if request.auth != null;
    }
    
    // Allow authenticated users to access analytics
    match /analytics/{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```
3. Click **"Publish"**

---

## Step 6: Setup Speech-to-Text API

### 6.1 Verify API is Enabled
1. Go to **"APIs & Services"** → **"Enabled APIs"**
2. Confirm **"Cloud Speech-to-Text API"** is listed
3. If not, enable it from the API Library

### 6.2 Test API Access
The service account key will provide access to Speech-to-Text API.

---

## Step 7: Setup Vertex AI

### 7.1 Enable Vertex AI
1. Search for **"Vertex AI"** in the console
2. Click **"Enable all recommended APIs"**
3. Wait for activation

### 7.2 Choose Region
1. Select region: `us-central1` (recommended)
2. Click **"Set Region"**

---

## Step 8: Collect All Credentials

### 8.1 Create Environment Variables File
Create a `.env.local` file in your project root with these values:

```bash
# OAuth 2.0 Credentials
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-random-secret-key-here

# Google Cloud Project
GOOGLE_CLOUD_PROJECT_ID=your-project-id

# Service Account (base64 encoded)
GOOGLE_SERVICE_ACCOUNT_KEY=your-base64-encoded-service-account-json

# Firestore Configuration
FIRESTORE_PROJECT_ID=your-project-id

# Speech-to-Text Configuration
GOOGLE_CLOUD_LOCATION=us-central1

# Vertex AI Configuration
VERTEX_AI_LOCATION=us-central1
```

### 8.2 Encode Service Account Key
To encode your service account JSON for environment variables:

**On Windows (PowerShell):**
```powershell
$content = Get-Content -Path "service-account-key.json" -Raw
$encoded = [System.Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($content))
Write-Output $encoded
```

**On Mac/Linux:**
```bash
base64 -i service-account-key.json
```

Copy the output and use it as `GOOGLE_SERVICE_ACCOUNT_KEY` value.

---

## Step 9: Security & Best Practices

### 9.1 Secure Your Credentials
1. **Never commit** `.env.local` to version control
2. Add `.env.local` to your `.gitignore` file
3. Store `service-account-key.json` securely and don't commit it

### 9.2 Set Up IAM Properly
1. Use principle of least privilege
2. Regularly review service account permissions
3. Enable audit logging for production

### 9.3 Enable Security Features
1. Go to **"Security"** in Cloud Console
2. Enable **"Security Command Center"**
3. Review security findings regularly

---

## Step 10: Test Your Setup

### 10.1 Verify API Access
Run this test script to verify your setup:

```javascript
// test-gcp-setup.js
const { GoogleAuth } = require('google-auth-library');

async function testSetup() {
  try {
    const auth = new GoogleAuth({
      scopes: [
        'https://www.googleapis.com/auth/calendar',
        'https://www.googleapis.com/auth/cloud-platform'
      ]
    });
    
    const client = await auth.getClient();
    console.log('✅ Authentication successful');
    
    const projectId = await auth.getProjectId();
    console.log('✅ Project ID:', projectId);
    
  } catch (error) {
    console.error('❌ Setup error:', error.message);
  }
}

testSetup();
```

### 10.2 Install Dependencies
```bash
npm install google-auth-library googleapis
node test-gcp-setup.js
```

---

## 📝 Quick Reference - All Your Credentials

After following this guide, you should have:

```bash
✅ Google Cloud Project ID
✅ OAuth Client ID  
✅ OAuth Client Secret
✅ Service Account JSON Key
✅ Firestore Database
✅ All APIs Enabled
✅ Proper IAM Permissions
```

---

## 🆘 Troubleshooting

### Common Issues:

**1. "API not enabled" error:**
- Go to APIs & Services → Library
- Search for the specific API
- Click "Enable"

**2. "Insufficient permissions" error:**
- Check service account roles
- Ensure OAuth scopes are correct
- Verify API is enabled

**3. "Invalid credentials" error:**
- Regenerate OAuth client credentials
- Check environment variables
- Verify service account key is valid

**4. "Quota exceeded" error:**
- Check API quotas in Cloud Console
- Enable billing if using free tier
- Request quota increase if needed

---

## 🎉 You're All Set!

Your Google Cloud Platform is now fully configured for the AutoTrack Meeting System. You have all the necessary credentials and APIs enabled to run the complete application with:

- ✅ User authentication via Google OAuth
- ✅ Calendar integration for meeting scheduling  
- ✅ Gmail API for automated emails
- ✅ Firestore for data storage
- ✅ Speech-to-Text for transcription
- ✅ Vertex AI for intelligent analysis

**Next Steps:**
1. Copy your credentials to `.env.local`
2. Run the application: `npm run dev`
3. Test authentication and API access
4. Start using the meeting automation features!

---

**Need Help?** 
- Check the [Google Cloud Documentation](https://cloud.google.com/docs)
- Review API-specific guides for detailed configuration
- Contact support if you encounter issues with billing or quotas