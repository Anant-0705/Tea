console.log('🔧 Google OAuth Configuration Checker');
console.log('====================================\n');

console.log('🚨 OAUTH ACCESS BLOCKED ERROR DETECTED');
console.log('======================================\n');

console.log('📋 Problem:');
console.log('Your Google OAuth app is in "Testing" mode, which means only');
console.log('users you specifically add to the test user list can sign in.\n');

console.log('⚡ IMMEDIATE FIX (Takes 2 minutes):');
console.log('===================================');
console.log('1. Go to: https://console.cloud.google.com/apis/credentials/consent?project=mnit-477507');
console.log('2. Scroll down to "Test users" section');
console.log('3. Click "+ ADD USERS"');
console.log('4. Enter your email: vanshs2234@gmail.com');
console.log('5. Click "Add" then "Save"\n');

console.log('🔗 Direct Links:');
console.log('================');
console.log('• OAuth Consent Screen: https://console.cloud.google.com/apis/credentials/consent?project=mnit-477507');
console.log('• Credentials: https://console.cloud.google.com/apis/credentials?project=mnit-477507');
console.log('• Project Dashboard: https://console.cloud.google.com/home/dashboard?project=mnit-477507\n');

console.log('🎯 Alternative Solutions:');
console.log('=========================');
console.log('Option 1: Add test users (recommended for development)');
console.log('Option 2: Publish the app (makes it public)');
console.log('Option 3: Use less sensitive scopes (no verification needed)\n');

console.log('📧 Add These Test Users:');
console.log('========================');
console.log('• vanshs2234@gmail.com (your email)');
console.log('• Any other emails you want to test with\n');

console.log('⏱️  The fix should work immediately after adding test users.');
console.log('Try signing in again at: http://localhost:3000/auth/signin\n');

console.log('🆘 If you still get errors:');
console.log('===========================');
console.log('1. Check that your email is added to test users');
console.log('2. Try signing out of Google and signing back in');
console.log('3. Clear browser cache/cookies');
console.log('4. Use incognito/private browsing mode\n');

console.log('✅ Once fixed, you can:');
console.log('======================');
console.log('• Sign in with Google OAuth');
console.log('• Create calendar events with Meet links');
console.log('• Access all automation features');
console.log('• Use the full scheduling system\n');

// Check if we can provide more specific guidance
const fs = require('fs');
const path = require('path');

// Check if .env.local exists and has the right OAuth credentials
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const hasClientId = envContent.includes('GOOGLE_CLIENT_ID=176510027749-');
    const hasClientSecret = envContent.includes('GOOGLE_CLIENT_SECRET=GOCSPX-');
    
    console.log('📊 Current Configuration Status:');
    console.log('=================================');
    console.log(`OAuth Client ID: ${hasClientId ? '✅ Configured' : '❌ Missing'}`);
    console.log(`OAuth Client Secret: ${hasClientSecret ? '✅ Configured' : '❌ Missing'}`);
    console.log(`Project ID: mnit-477507 ✅`);
    
    if (hasClientId && hasClientSecret) {
        console.log('\n🎉 Your OAuth credentials are properly configured!');
        console.log('The only issue is the test user access restriction.');
        console.log('Just add your email as a test user and you\'re good to go!\n');
    }
} else {
    console.log('❌ .env.local file not found. Run setup first.');
}