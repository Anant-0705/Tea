# Email Setup Guide

## Quick Setup for Gmail

### Step 1: Enable 2-Factor Authentication on Gmail
1. Go to https://myaccount.google.com/security
2. Enable "2-Step Verification" if not already enabled

### Step 2: Create App Password
1. Go to https://myaccount.google.com/apppasswords
2. Select "Mail" and "Other (Custom name)"
3. Name it "Meeting Automation"
4. Click "Generate"
5. Copy the 16-character password (it will look like: `abcd efgh ijkl mnop`)

### Step 3: Update .env.local
Replace these lines in your `.env.local` file:

```env
SMTP_USER=aadityasinghal77@gmail.com
SMTP_PASSWORD=your-16-character-app-password-here
SEND_REAL_EMAILS=true
```

**Example:**
```env
SMTP_USER=aadityasinghal77@gmail.com
SMTP_PASSWORD=abcdefghijklmnop
SEND_REAL_EMAILS=true
```

### Step 4: Restart Your Dev Server
```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

## Testing

### Test 1: Simple Email Test
1. Go to http://localhost:3000/test-actions
2. Click "Test Email"
3. Check anantsinghal2134@gmail.com inbox

### Test 2: AI-Generated Email
1. Complete a meeting with transcription
2. The mock transcript includes: "Let's schedule our next meeting at 9 PM tomorrow. Does that work for everyone?"
3. Go to meeting detail page → "AI Actions" tab
4. Click "Analyze Meeting with AI"
5. Click "Generate Actions"
6. You should see an email action to send to Anant about the 9 PM meeting
7. Click "Execute All Actions"
8. Check Anant's email!

## How It Works

When Vertex AI analyzes the transcript and sees:
- "send email to anant" → Creates email action
- "schedule meeting at 9 PM" → Creates meeting action
- Any action item → Creates task action

The system automatically:
1. Parses the AI recommendations
2. Extracts email addresses (defaults to anantsinghal2134@gmail.com)
3. Creates beautiful HTML emails
4. Sends them via Gmail SMTP
5. Shows success/failure in real-time

## Troubleshooting

### "Authentication failed"
- Make sure you're using an App Password, not your regular Gmail password
- Remove any spaces from the app password

### "Connection timeout"
- Check your internet connection
- Some networks block SMTP port 587

### Emails not arriving
- Check spam folder
- Verify the recipient email is correct
- Check logs/emails.log for the email content

## Disable Real Emails (Testing Mode)

To go back to logging emails instead of sending:

```env
SEND_REAL_EMAILS=false
```

Emails will be logged to `logs/emails.log` instead of being sent.
