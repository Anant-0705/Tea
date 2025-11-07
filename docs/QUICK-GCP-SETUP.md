# 🚀 Quick GCP Setup Guide for AutoTrack

## ✅ Completed Steps
- ✅ Service account created (`autotrack-service-account@mnit-477507.iam.gserviceaccount.com`)
- ✅ Environment variables configured in `.env.local`
- ✅ Project ID: `mnit-477507`

## 🔧 Next Steps to Complete Setup

### Step 1: Enable Required APIs in Google Cloud Console

1. **Go to Google Cloud Console**: https://console.cloud.google.com/
2. **Select your project**: `mnit-477507`
3. **Go to APIs & Services** → **Library**
4. **Enable these APIs** (search for each one and click "Enable"):

```bash
✅ APIs to Enable:
- Google Calendar API
- Gmail API
- Cloud Firestore API
- Cloud Speech-to-Text API
- Vertex AI API
- Cloud Resource Manager API
- Identity and Access Management (IAM) API
```

### Step 2: Create OAuth 2.0 Credentials

1. **Go to APIs & Services** → **Credentials**
2. **Click "Create Credentials"** → **OAuth client ID**
3. **First-time setup**: Configure OAuth consent screen:
   - **User Type**: External
   - **App name**: AutoTrack Meeting System
   - **User support email**: Your email
   - **Developer contact**: Your email
   - **Scopes**: Add these scopes:
     ```
     https://www.googleapis.com/auth/calendar
     https://www.googleapis.com/auth/gmail.send
     https://www.googleapis.com/auth/userinfo.email
     https://www.googleapis.com/auth/userinfo.profile
     ```
   - **Test users**: Add your email

4. **Create OAuth Client ID**:
   - **Application type**: Web application
   - **Name**: AutoTrack Web Client
   - **Authorized JavaScript origins**:
     ```
     http://localhost:3000
     ```
   - **Authorized redirect URIs**:
     ```
     http://localhost:3000/api/auth/callback/google
     ```

5. **Copy the credentials** and update your `.env.local` file:
   ```bash
   GOOGLE_CLIENT_ID=your-actual-client-id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your-actual-client-secret
   ```

### Step 3: Setup Firestore Database

1. **Go to Firestore** in Google Cloud Console
2. **Click "Create database"**
3. **Choose "Production mode"**
4. **Select location**: `us-central1` (recommended)
5. **Click "Create"**

### Step 4: Test Your Setup

Run this command to test everything:
```bash
node scripts/test-gcp-setup.js
```

### Step 5: Start the Application

```bash
# Start both frontend and transcription server
npm run dev:full

# Or start just the frontend
npm run dev
```

## 🔑 Your Current Configuration Summary

```bash
✅ Project ID: mnit-477507
✅ Service Account: autotrack-service-account@mnit-477507.iam.gserviceaccount.com
✅ Service Account Key: ✅ Configured (base64 encoded)
✅ NextAuth Secret: ✅ Generated automatically
✅ Environment File: ✅ .env.local created

⚠️  Still needed:
- OAuth Client ID (from Step 2)
- OAuth Client Secret (from Step 2)
```

## 🎯 Quick Links

- **Google Cloud Console**: https://console.cloud.google.com/
- **Your Project**: https://console.cloud.google.com/home/dashboard?project=mnit-477507
- **APIs & Services**: https://console.cloud.google.com/apis/dashboard?project=mnit-477507
- **Firestore**: https://console.cloud.google.com/firestore?project=mnit-477507

## 🧪 Testing Commands

```bash
# Test GCP setup
node scripts/test-gcp-setup.js

# Start development server
npm run dev

# Start with transcription server
npm run dev:full

# Check if all APIs are working
curl http://localhost:3000/api/auth/session
```

## 🆘 Troubleshooting

### Common Issues:

1. **"API not enabled" error**:
   - Go to APIs & Services → Library
   - Search for the specific API and enable it

2. **"Invalid OAuth client" error**:
   - Check that redirect URI is exactly: `http://localhost:3000/api/auth/callback/google`
   - Ensure OAuth client is for "Web application"

3. **"Insufficient permissions" error**:
   - Verify service account has the required roles
   - Check that all APIs are enabled

4. **Authentication not working**:
   - Make sure OAuth consent screen is configured
   - Add your email as a test user
   - Check that OAuth credentials are correct in `.env.local`

## ✨ Once Setup is Complete

You'll have access to:
- ✅ Google OAuth authentication
- ✅ Calendar API for meeting scheduling
- ✅ Gmail API for automated emails
- ✅ Firestore for data storage
- ✅ Speech-to-Text for transcription
- ✅ Vertex AI for intelligent analysis
- ✅ Real-time meeting automation
- ✅ Advanced analytics and insights

**Total setup time**: ~10-15 minutes