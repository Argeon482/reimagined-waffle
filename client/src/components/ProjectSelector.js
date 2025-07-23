import React, { useState, useEffect } from 'react';
import { projectsAPI } from '../services/api';

const ProjectSelector = ({ selectedProject, onProjectSelect }) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [showNewForm, setShowNewForm] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await projectsAPI.getAll();
      setProjects(response.data.projects);
    } catch (err) {
      console.error('Error loading projects:', err);
      setError('Failed to load projects. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    
    if (!newProjectName.trim()) {
      setError('Project name is required');
      return;
    }

    try {
      setCreating(true);
      setError('');
      
      const response = await projectsAPI.create(newProjectName.trim());
      const newProject = response.data.project;
      
      // Add to projects list and select it
      setProjects(prev => [...prev, newProject]);
      onProjectSelect(newProject);
      
      // Reset form
      setNewProjectName('');
      setShowNewForm(false);
    } catch (err) {
      console.error('Error creating project:', err);
      setError(err.response?.data?.error || 'Failed to create project');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="project-selector">
      <div className="form-group">
        <label>Select Project</label>
        <select 
          className="form-control"
          value={selectedProject?.id || ''}
          onChange={(e) => {
            const project = projects.find(p => p.id === e.target.value);
            onProjectSelect(project);
          }}
          disabled={loading}
        >
          <option value="">
            {loading ? 'Loading projects...' : 'Choose a project'}
          </option>
          {projects.map(project => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
      </div>

      <button 
        type="button"
        className="btn btn-secondary"
        onClick={() => setShowNewForm(!showNewForm)}
        disabled={loading}
      >
        {showNewForm ? 'Cancel' : '+ New Project'}
      </button>

      {showNewForm && (
        <div style={{ marginTop: '20px', width: '100%' }}>
          <form onSubmit={handleCreateProject}>
            <div className="form-group">
              <label>New Project Name</label>
              <input
                type="text"
                className="form-control"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="e.g. 123 Main St. Renovation"
                disabled={creating}
              />
            </div>
            <button 
              type="submit" 
              className="btn btn-success"
              disabled={creating || !newProjectName.trim()}
            >
              {creating ? (
                <>
                  <div className="loading-spinner"></div>
                  Creating...
                </>
              ) : (
                'Create Project'
              )}
            </button>
          </form>
        </div>
      )}

      {error && (
        <div className="error-message" style={{ marginTop: '15px' }}>
          {error}
        </div>
      )}
    </div>
  );
};

export default ProjectSelector;