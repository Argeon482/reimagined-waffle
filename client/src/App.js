import React, { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

import AuthScreen from './components/AuthScreen';
import ProjectSelector from './components/ProjectSelector';
import FileUpload from './components/FileUpload';
import { authAPI } from './services/api';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);

  useEffect(() => {
    // Check for session token in URL (from OAuth callback)
    const urlParams = new URLSearchParams(window.location.search);
    const sessionToken = urlParams.get('session');
    
    if (sessionToken) {
      localStorage.setItem('sessionToken', sessionToken);
      // Clean up URL
      window.history.replaceState({}, document.title, '/');
    }

    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await authAPI.checkStatus();
      setIsAuthenticated(response.data.authenticated);
    } catch (err) {
      console.error('Auth check failed:', err);
      setIsAuthenticated(false);
      localStorage.removeItem('sessionToken');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authAPI.logout();
      localStorage.removeItem('sessionToken');
      setIsAuthenticated(false);
      setSelectedProject(null);
      toast.success('Logged out successfully');
    } catch (err) {
      console.error('Logout error:', err);
      // Still log out locally even if server request fails
      localStorage.removeItem('sessionToken');
      setIsAuthenticated(false);
      setSelectedProject(null);
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="card">
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div className="loading-spinner" style={{ marginBottom: '20px' }}></div>
            <p>Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthScreen onAuthSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="container">
      <div className="card">
        <div className="header">
          <h1>⚡ Project Capture AI</h1>
          <p>Capture and organize your electrical project files with AI-powered naming</p>
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
            <button 
              className="btn btn-secondary"
              onClick={handleLogout}
              style={{ fontSize: '0.9rem', padding: '8px 16px' }}
            >
              🔓 Logout
            </button>
          </div>
        </div>

        {selectedProject && (
          <div className="success-message">
            <strong>Active Project:</strong> {selectedProject.name}
          </div>
        )}

        <ProjectSelector 
          selectedProject={selectedProject}
          onProjectSelect={setSelectedProject}
        />

        {selectedProject && (
          <FileUpload selectedProject={selectedProject} />
        )}

        {!selectedProject && (
          <div style={{ 
            textAlign: 'center', 
            padding: '40px 20px',
            color: '#718096',
            background: '#f7fafc',
            borderRadius: '12px',
            border: '2px dashed #e2e8f0'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '16px' }}>📋</div>
            <h3 style={{ marginBottom: '10px', color: '#4a5568' }}>Select a Project to Get Started</h3>
            <p>Choose an existing project or create a new one to begin uploading files.</p>
          </div>
        )}
      </div>

      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
}

export default App;