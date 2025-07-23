import React, { useState } from 'react';
import { authAPI } from '../services/api';

const AuthScreen = ({ onAuthSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleAuth = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await authAPI.getAuthUrl();
      
      // Redirect to Google OAuth
      window.location.href = response.data.authUrl;
    } catch (err) {
      console.error('Auth error:', err);
      setError('Failed to start authentication. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="card">
        <div className="auth-container">
          <h2>Welcome to Project Capture AI</h2>
          <p>
            Organize your electrical project files with AI-powered naming and 
            automatic Google Drive synchronization.
          </p>
          
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
          
          <button 
            className="btn btn-primary"
            onClick={handleGoogleAuth}
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="loading-spinner"></div>
                Connecting...
              </>
            ) : (
              <>
                🔗 Connect Google Drive
              </>
            )}
          </button>
          
          <div style={{ marginTop: '30px', color: '#718096', fontSize: '0.9rem' }}>
            <p><strong>What this app does:</strong></p>
            <ul style={{ textAlign: 'left', marginTop: '10px', marginLeft: '20px' }}>
              <li>Scans your Google Drive for an "All Projects" folder</li>
              <li>Lists your project folders for easy selection</li>
              <li>Uses AI to generate descriptive filenames from your content</li>
              <li>Supports photos, videos, and text notes in English or Spanish</li>
              <li>Saves everything directly to your selected project folder</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;