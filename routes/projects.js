const express = require('express');
const { google } = require('googleapis');
const { getAuthenticatedClient } = require('./auth');
const router = express.Router();

// Get all projects (folders in "All Projects" directory)
router.get('/', getAuthenticatedClient, async (req, res) => {
  try {
    const drive = google.drive({ version: 'v3', auth: req.googleAuth });

    // First, find or create the "All Projects" folder
    const allProjectsFolder = await findOrCreateAllProjectsFolder(drive);

    // Get all folders inside "All Projects"
    const response = await drive.files.list({
      q: `'${allProjectsFolder.id}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
      fields: 'files(id, name, createdTime)',
      orderBy: 'name'
    });

    const projects = response.data.files.map(file => ({
      id: file.id,
      name: file.name,
      createdTime: file.createdTime
    }));

    res.json({ 
      projects,
      allProjectsFolderId: allProjectsFolder.id 
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// Create a new project folder
router.post('/', getAuthenticatedClient, async (req, res) => {
  const { name } = req.body;

  if (!name || name.trim() === '') {
    return res.status(400).json({ error: 'Project name is required' });
  }

  try {
    const drive = google.drive({ version: 'v3', auth: req.googleAuth });

    // Find or create the "All Projects" folder
    const allProjectsFolder = await findOrCreateAllProjectsFolder(drive);

    // Check if a project with this name already exists
    const existingProjects = await drive.files.list({
      q: `'${allProjectsFolder.id}' in parents and name='${name.trim()}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
      fields: 'files(id, name)'
    });

    if (existingProjects.data.files.length > 0) {
      return res.status(400).json({ error: 'A project with this name already exists' });
    }

    // Create the new project folder
    const folderMetadata = {
      name: name.trim(),
      mimeType: 'application/vnd.google-apps.folder',
      parents: [allProjectsFolder.id]
    };

    const folder = await drive.files.create({
      resource: folderMetadata,
      fields: 'id, name, createdTime'
    });

    res.json({
      success: true,
      project: {
        id: folder.data.id,
        name: folder.data.name,
        createdTime: folder.data.createdTime
      }
    });
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

// Helper function to find or create "All Projects" folder
async function findOrCreateAllProjectsFolder(drive) {
  try {
    // Search for existing "All Projects" folder
    const response = await drive.files.list({
      q: "name='All Projects' and mimeType='application/vnd.google-apps.folder' and trashed=false",
      fields: 'files(id, name)'
    });

    if (response.data.files.length > 0) {
      return response.data.files[0];
    }

    // Create "All Projects" folder if it doesn't exist
    const folderMetadata = {
      name: 'All Projects',
      mimeType: 'application/vnd.google-apps.folder'
    };

    const folder = await drive.files.create({
      resource: folderMetadata,
      fields: 'id, name'
    });

    return folder.data;
  } catch (error) {
    console.error('Error with All Projects folder:', error);
    throw error;
  }
}

module.exports = router;