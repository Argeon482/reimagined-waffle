import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { uploadAPI } from '../services/api';

const FileUpload = ({ selectedProject }) => {
  const [uploading, setUploading] = useState(false);
  const [manualTitle, setManualTitle] = useState('');
  const [textNote, setTextNote] = useState('');
  const [uploadResults, setUploadResults] = useState([]);
  const [error, setError] = useState('');

  const onDrop = useCallback(async (acceptedFiles) => {
    if (!selectedProject) {
      setError('Please select a project first');
      return;
    }

    if (acceptedFiles.length === 0) {
      setError('No valid files selected');
      return;
    }

    await handleFileUpload(acceptedFiles);
  }, [selectedProject]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
      'video/*': ['.mp4', '.mov', '.avi'],
      'text/*': ['.txt'],
      'application/pdf': ['.pdf']
    },
    maxSize: 50 * 1024 * 1024 // 50MB
  });

  const handleFileUpload = async (files) => {
    try {
      setUploading(true);
      setError('');
      setUploadResults([]);

      const formData = new FormData();
      
      // Add files to form data
      files.forEach(file => {
        formData.append('files', file);
      });

      // Add project ID
      formData.append('projectId', selectedProject.id);

      // Add manual title if provided
      if (manualTitle.trim()) {
        formData.append('manualTitle', manualTitle.trim());
      }

      const response = await uploadAPI.uploadFiles(formData);
      setUploadResults(response.data.results);

      // Clear manual title after successful upload
      setManualTitle('');
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.response?.data?.error || 'Failed to upload files');
    } finally {
      setUploading(false);
    }
  };

  const handleTextNoteUpload = async () => {
    if (!selectedProject) {
      setError('Please select a project first');
      return;
    }

    if (!textNote.trim()) {
      setError('Please enter some text content');
      return;
    }

    try {
      setUploading(true);
      setError('');
      setUploadResults([]);

      const data = {
        projectId: selectedProject.id,
        content: textNote.trim(),
        manualTitle: manualTitle.trim() || undefined
      };

      const response = await uploadAPI.uploadTextNote(data);
      
      setUploadResults([{
        success: true,
        file: response.data.file,
        generatedTitle: response.data.generatedTitle
      }]);

      // Clear form after successful upload
      setTextNote('');
      setManualTitle('');
    } catch (err) {
      console.error('Text note upload error:', err);
      setError(err.response?.data?.error || 'Failed to upload text note');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="upload-section">
      {/* Text Note Section */}
      <div className="text-note-section">
        <div className="form-group">
          <label>Quick Text Note</label>
          <textarea
            className="form-control"
            value={textNote}
            onChange={(e) => setTextNote(e.target.value)}
            placeholder="Type your project note here... (English or Spanish)"
            disabled={uploading}
          />
        </div>
        
        {textNote.trim() && (
          <button
            className="btn btn-success"
            onClick={handleTextNoteUpload}
            disabled={uploading || !selectedProject}
          >
            {uploading ? (
              <>
                <div className="loading-spinner"></div>
                Saving Note...
              </>
            ) : (
              '💾 Save Text Note'
            )}
          </button>
        )}
      </div>

      {/* Manual Title Input */}
      <div className="form-group">
        <label>Manual Title (Optional)</label>
        <input
          type="text"
          className="form-control"
          value={manualTitle}
          onChange={(e) => setManualTitle(e.target.value)}
          placeholder="Leave blank to use AI-generated title"
          disabled={uploading}
        />
        <small style={{ color: '#718096', fontSize: '0.85rem', marginTop: '5px', display: 'block' }}>
          Manual titles are required for large video files. For other files, AI will generate descriptive names.
        </small>
      </div>

      {/* File Drop Zone */}
      <div 
        {...getRootProps()} 
        className={`upload-area ${isDragActive ? 'active' : ''}`}
      >
        <input {...getInputProps()} />
        <div className="upload-icon">📁</div>
        <div className="upload-text">
          {isDragActive ? (
            'Drop files here...'
          ) : (
            'Drag & drop files here, or click to select'
          )}
        </div>
        <div className="upload-subtext">
          Supports images (.jpg, .png), videos (.mp4, .mov), and documents (.txt, .pdf)
          <br />
          Maximum file size: 50MB
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* Upload Results */}
      {uploadResults.length > 0 && (
        <div className="upload-results">
          <h3>Upload Results</h3>
          {uploadResults.map((result, index) => (
            <div 
              key={index} 
              className={`result-item ${result.success ? 'success' : 'error'}`}
            >
              <div className="result-icon">
                {result.success ? '✅' : '❌'}
              </div>
              <div className="result-details">
                {result.success ? (
                  <>
                    <div className="filename">{result.file.name}</div>
                    {result.generatedTitle && (
                      <div className="generated-title">
                        AI Generated: "{result.generatedTitle}"
                      </div>
                    )}
                    {result.originalName && (
                      <div className="generated-title">
                        Original: {result.originalName}
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div className="filename">Upload Failed</div>
                    <div className="generated-title">{result.error}</div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Progress */}
      {uploading && (
        <div style={{ textAlign: 'center', marginTop: '20px', color: '#667eea' }}>
          <div className="loading-spinner" style={{ marginRight: '10px' }}></div>
          Processing your files...
        </div>
      )}
    </div>
  );
};

export default FileUpload;