#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Project Capture AI - Setup Verification\n');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
const envExists = fs.existsSync(envPath);

console.log('📁 File Structure Check:');
console.log(`  ✅ Root package.json: ${fs.existsSync('package.json') ? 'EXISTS' : 'MISSING'}`);
console.log(`  ✅ Client package.json: ${fs.existsSync('client/package.json') ? 'EXISTS' : 'MISSING'}`);
console.log(`  ✅ Server.js: ${fs.existsSync('server.js') ? 'EXISTS' : 'MISSING'}`);
console.log(`  ✅ Routes directory: ${fs.existsSync('routes') ? 'EXISTS' : 'MISSING'}`);
console.log(`  ✅ Services directory: ${fs.existsSync('services') ? 'EXISTS' : 'MISSING'}`);
console.log(`  ✅ Client src directory: ${fs.existsSync('client/src') ? 'EXISTS' : 'MISSING'}`);

console.log('\n🔑 Environment Configuration:');
console.log(`  ${envExists ? '✅' : '❌'} .env file: ${envExists ? 'EXISTS' : 'MISSING (copy from .env.example)'}`);

if (envExists) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const requiredVars = [
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET', 
    'GOOGLE_REDIRECT_URI',
    'GEMINI_API_KEY'
  ];
  
  console.log('\n  Required Environment Variables:');
  requiredVars.forEach(varName => {
    const hasVar = envContent.includes(`${varName}=`) && !envContent.includes(`${varName}=your_`);
    console.log(`    ${hasVar ? '✅' : '❌'} ${varName}: ${hasVar ? 'SET' : 'NEEDS VALUE'}`);
  });
}

console.log('\n📦 Dependencies Check:');
try {
  const backendDeps = fs.existsSync('node_modules');
  const frontendDeps = fs.existsSync('client/node_modules');
  
  console.log(`  ✅ Backend dependencies: ${backendDeps ? 'INSTALLED' : 'RUN: npm install'}`);
  console.log(`  ✅ Frontend dependencies: ${frontendDeps ? 'INSTALLED' : 'RUN: cd client && npm install'}`);
} catch (e) {
  console.log('  ❌ Error checking dependencies');
}

console.log('\n🚀 Next Steps:');
if (!envExists) {
  console.log('  1. Copy .env.example to .env: cp .env.example .env');
  console.log('  2. Set up Google Cloud Console project and get OAuth credentials');
  console.log('  3. Get Gemini API key from Google AI Studio');
  console.log('  4. Update .env with your credentials');
} else {
  console.log('  1. Start backend: npm run dev');
  console.log('  2. Start frontend (new terminal): cd client && npm start');
  console.log('  3. Open http://localhost:3000 in your browser');
}

console.log('\n📚 Documentation: Check README.md for detailed setup instructions');
console.log('\n' + '='.repeat(60));