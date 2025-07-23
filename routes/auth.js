const express = require('express');
const { google } = require('googleapis');
const router = express.Router();

// Configure OAuth2 client
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// Scopes for Google Drive access
const SCOPES = [
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/drive.metadata.readonly'
];

// Store user sessions (in production, use a proper session store)
const userSessions = new Map();

// Generate auth URL
router.get('/google', (req, res) => {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent'
  });
  
  res.json({ authUrl });
});

// Handle OAuth callback
router.get('/google/callback', async (req, res) => {
  const { code } = req.query;
  
  if (!code) {
    return res.status(400).json({ error: 'Authorization code not provided' });
  }

  try {
    const { tokens } = await oauth2Client.getAccessToken(code);
    oauth2Client.setCredentials(tokens);

    // Generate a session ID (in production, use proper session management)
    const sessionId = Math.random().toString(36).substring(2, 15);
    userSessions.set(sessionId, {
      tokens,
      createdAt: new Date()
    });

    // Redirect to frontend with session ID
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontendUrl}?session=${sessionId}`);
  } catch (error) {
    console.error('Error getting access token:', error);
    res.status(500).json({ error: 'Failed to authenticate with Google' });
  }
});

// Check authentication status
router.get('/status', (req, res) => {
  const sessionId = req.headers.authorization?.replace('Bearer ', '');
  
  if (!sessionId || !userSessions.has(sessionId)) {
    return res.json({ authenticated: false });
  }

  const session = userSessions.get(sessionId);
  res.json({ 
    authenticated: true,
    sessionId 
  });
});

// Logout
router.post('/logout', (req, res) => {
  const sessionId = req.headers.authorization?.replace('Bearer ', '');
  
  if (sessionId && userSessions.has(sessionId)) {
    userSessions.delete(sessionId);
  }
  
  res.json({ success: true });
});

// Middleware to get authenticated Google Drive client
const getAuthenticatedClient = (req, res, next) => {
  const sessionId = req.headers.authorization?.replace('Bearer ', '');
  
  if (!sessionId || !userSessions.has(sessionId)) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const session = userSessions.get(sessionId);
  const client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
  
  client.setCredentials(session.tokens);
  req.googleAuth = client;
  req.sessionId = sessionId;
  next();
};

module.exports = { router, getAuthenticatedClient };