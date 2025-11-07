# 🚀 Fix Google OAuth "Access Blocked" Error

## Problem
Your Google OAuth app is in "Testing" mode, which means only approved test users can sign in.

## Quick Solutions

### Solution 1: Add Test Users (Immediate Fix) ⚡

1. **Go to Google Cloud Console**: https://console.cloud.google.com/
2. **Select your project**: `mnit-477507`
3. **Navigate to**: APIs & Services → OAuth consent screen
4. **Scroll down to "Test users" section**
5. **Click "Add users"**
6. **Add your email**: `vanshs2234@gmail.com`
7. **Click "Save"**

### Solution 2: Publish the App (Production Ready) 🚀

1. **Go to**: APIs & Services → OAuth consent screen
2. **Click "Publish App"**
3. **Confirm publishing**

**Note**: Publishing makes the app available to all Google users, but requires additional verification for sensitive scopes.

### Solution 3: Update Scopes to Non-Sensitive (Recommended) ✅

Some scopes require verification. Let's use only basic scopes for now:

1. **Go to**: APIs & Services → OAuth consent screen
2. **Click "Edit App"**
3. **In "Scopes" section, only add these non-sensitive scopes**:
   - `openid`
   - `email` 
   - `profile`
   - `https://www.googleapis.com/auth/calendar.events` (instead of full calendar access)

## Step-by-Step Fix Guide

### Step 1: Add Test User (Do this now)
```
1. Open: https://console.cloud.google.com/apis/credentials/consent?project=mnit-477507
2. Scroll to "Test users"
3. Click "+ ADD USERS"
4. Enter: vanshs2234@gmail.com
5. Click "Add"
6. Click "Save" at the bottom
```

### Step 2: Verify OAuth Configuration
```
1. Go to: APIs & Services → Credentials
2. Click on your OAuth 2.0 Client ID
3. Verify these settings:
   - Authorized JavaScript origins: http://localhost:3000
   - Authorized redirect URIs: http://localhost:3000/api/auth/callback/google
```

### Step 3: Test the Application
```bash
# Start your app
npm run dev

# Try signing in again at:
http://localhost:3000/auth/signin
```

## Alternative: Use Less Sensitive Scopes

If you want to avoid the verification process, update your NextAuth configuration to use less sensitive scopes:

### Current Scopes (Require Verification):
- `https://www.googleapis.com/auth/calendar` (Full calendar access)
- `https://www.googleapis.com/auth/gmail.send` (Send emails)

### Alternative Scopes (No Verification Required):
- `https://www.googleapis.com/auth/calendar.events` (Calendar events only)
- `https://www.googleapis.com/auth/userinfo.email`
- `https://www.googleapis.com/auth/userinfo.profile`

## Quick Links:
- **OAuth Consent Screen**: https://console.cloud.google.com/apis/credentials/consent?project=mnit-477507
- **Credentials**: https://console.cloud.google.com/apis/credentials?project=mnit-477507
- **Your Project**: https://console.cloud.google.com/home/dashboard?project=mnit-477507

## Status Check Commands:
```bash
# Check current OAuth setup
node scripts/check-oauth-setup.js

# Test GCP configuration
node scripts/test-gcp-setup.js
```

## Expected Result:
After adding your email as a test user, you should be able to sign in successfully and create calendar events.