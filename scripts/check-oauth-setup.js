const fs = require('fs');
const path = require('path');

console.log('🔧 AutoTrack OAuth Setup Helper');
console.log('================================\n');

// Check if .env.local exists
const envPath = path.join(__dirname, '..', '.env.local');
if (!fs.existsSync(envPath)) {
    console.log('❌ .env.local file not found!');
    console.log('Please run: node scripts/setup-credentials-quick.js first');
    process.exit(1);
}

// Read current .env.local
let envContent = fs.readFileSync(envPath, 'utf8');

console.log('📋 Current Configuration Status:');
console.log('================================');

// Check what's already configured
const hasClientId = envContent.includes('GOOGLE_CLIENT_ID=') && 
                   !envContent.includes('GOOGLE_CLIENT_ID=your-oauth-client-id');
const hasClientSecret = envContent.includes('GOOGLE_CLIENT_SECRET=') && 
                       !envContent.includes('GOOGLE_CLIENT_SECRET=your-oauth-client-secret');
const hasServiceAccount = envContent.includes('GOOGLE_SERVICE_ACCOUNT_KEY=');
const hasProjectId = envContent.includes('GOOGLE_PROJECT_ID=mnit-477507');

console.log(`✅ Service Account Key: ${hasServiceAccount ? '✅ Configured' : '❌ Missing'}`);
console.log(`✅ Project ID: ${hasProjectId ? '✅ Configured' : '❌ Missing'}`);
console.log(`✅ OAuth Client ID: ${hasClientId ? '✅ Configured' : '⚠️  Needs setup'}`);
console.log(`✅ OAuth Client Secret: ${hasClientSecret ? '✅ Configured' : '⚠️  Needs setup'}`);

if (hasClientId && hasClientSecret) {
    console.log('\n🎉 All credentials are configured!');
    console.log('\nNext steps:');
    console.log('1. Run: npm run dev');
    console.log('2. Open: http://localhost:3000');
    console.log('3. Test OAuth login');
} else {
    console.log('\n📝 To complete setup:');
    console.log('1. Go to: https://console.cloud.google.com/apis/credentials?project=mnit-477507');
    console.log('2. Create OAuth 2.0 Client ID (Web application)');
    console.log('3. Add redirect URI: http://localhost:3000/api/auth/callback/google');
    console.log('4. Copy the Client ID and Secret');
    console.log('5. Update .env.local file with the new credentials');
    
    console.log('\n🔧 Manual update required in .env.local:');
    console.log('Replace these lines:');
    if (!hasClientId) {
        console.log('GOOGLE_CLIENT_ID=your-oauth-client-id');
    }
    if (!hasClientSecret) {
        console.log('GOOGLE_CLIENT_SECRET=your-oauth-client-secret');
    }
}

// Check if APIs are likely enabled (can't check directly without making API calls)
console.log('\n📡 Required APIs to enable in GCP Console:');
console.log('- Google Calendar API');
console.log('- Gmail API'); 
console.log('- Cloud Firestore API');
console.log('- Cloud Speech-to-Text API');
console.log('- Vertex AI API');

console.log('\n🔗 Quick Links:');
console.log(`- Project Dashboard: https://console.cloud.google.com/home/dashboard?project=mnit-477507`);
console.log(`- API Library: https://console.cloud.google.com/apis/library?project=mnit-477507`);
console.log(`- Credentials: https://console.cloud.google.com/apis/credentials?project=mnit-477507`);
console.log(`- Firestore: https://console.cloud.google.com/firestore?project=mnit-477507`);

// Function to help with OAuth setup
function setupOAuth() {
    const readline = require('readline');
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    console.log('\n🚀 Interactive OAuth Setup');
    console.log('==========================');
    
    rl.question('Do you have your OAuth Client ID? (y/n): ', (hasId) => {
        if (hasId.toLowerCase() === 'y') {
            rl.question('Enter your OAuth Client ID: ', (clientId) => {
                rl.question('Enter your OAuth Client Secret: ', (clientSecret) => {
                    // Update .env.local file
                    let updatedContent = envContent;
                    
                    if (updatedContent.includes('GOOGLE_CLIENT_ID=your-oauth-client-id')) {
                        updatedContent = updatedContent.replace(
                            'GOOGLE_CLIENT_ID=your-oauth-client-id',
                            `GOOGLE_CLIENT_ID=${clientId}`
                        );
                    } else if (!hasClientId) {
                        updatedContent += `\nGOOGLE_CLIENT_ID=${clientId}`;
                    }
                    
                    if (updatedContent.includes('GOOGLE_CLIENT_SECRET=your-oauth-client-secret')) {
                        updatedContent = updatedContent.replace(
                            'GOOGLE_CLIENT_SECRET=your-oauth-client-secret',
                            `GOOGLE_CLIENT_SECRET=${clientSecret}`
                        );
                    } else if (!hasClientSecret) {
                        updatedContent += `\nGOOGLE_CLIENT_SECRET=${clientSecret}`;
                    }
                    
                    fs.writeFileSync(envPath, updatedContent);
                    console.log('\n✅ OAuth credentials updated successfully!');
                    console.log('\nYou can now run:');
                    console.log('npm run dev');
                    rl.close();
                });
            });
        } else {
            console.log('\n📝 Please follow these steps:');
            console.log('1. Go to: https://console.cloud.google.com/apis/credentials?project=mnit-477507');
            console.log('2. Click "Create Credentials" → "OAuth client ID"');
            console.log('3. Choose "Web application"');
            console.log('4. Add redirect URI: http://localhost:3000/api/auth/callback/google');
            console.log('5. Copy the credentials and run this script again');
            rl.close();
        }
    });
}

// Check if user wants interactive setup
if (process.argv.includes('--setup') && (!hasClientId || !hasClientSecret)) {
    setupOAuth();
}