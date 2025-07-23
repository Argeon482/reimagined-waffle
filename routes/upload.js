const express = require('express');
const { google } = require('googleapis');
const { getAuthenticatedClient } = require('./auth');
const geminiService = require('../services/geminiService');
const path = require('path');
const router = express.Router();

// Upload files to Google Drive
router.post('/', getAuthenticatedClient, async (req, res) => {
  try {
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const { projectId, manualTitle, textContent } = req.body;

    if (!projectId) {
      return res.status(400).json({ error: 'Project ID is required' });
    }

    const drive = google.drive({ version: 'v3', auth: req.googleAuth });
    const results = [];

    // Handle multiple files
    const files = Array.isArray(req.files.files) ? req.files.files : [req.files.files];

    for (const file of files) {
      try {
        let filename;
        let finalTitle;

        if (manualTitle && manualTitle.trim()) {
          // Use manual title if provided
          finalTitle = manualTitle.trim();
        } else {
          // Generate title using AI
          if (textContent && textContent.trim()) {
            // For text content
            finalTitle = await geminiService.generateTitle(textContent.trim(), 'text');
          } else if (isImageFile(file.mimetype)) {
            // For image files
            finalTitle = await geminiService.generateTitleFromImage(file.data, file.mimetype);
          } else {
            // For other files, use original name without extension
            finalTitle = path.parse(file.name).name;
          }
        }

        // Create the final filename with extension
        const fileExtension = path.extname(file.name) || getExtensionFromMimeType(file.mimetype);
        filename = `${finalTitle}${fileExtension}`;

        // Upload to Google Drive
        const fileMetadata = {
          name: filename,
          parents: [projectId]
        };

        const media = {
          mimeType: file.mimetype,
          body: require('stream').Readable.from(file.data)
        };

        const uploadedFile = await drive.files.create({
          resource: fileMetadata,
          media: media,
          fields: 'id, name, size, mimeType, createdTime'
        });

        results.push({
          success: true,
          file: {
            id: uploadedFile.data.id,
            name: uploadedFile.data.name,
            size: uploadedFile.data.size,
            mimeType: uploadedFile.data.mimeType,
            createdTime: uploadedFile.data.createdTime
          },
          originalName: file.name,
          generatedTitle: manualTitle ? null : finalTitle
        });

      } catch (fileError) {
        console.error(`Error uploading file ${file.name}:`, fileError);
        results.push({
          success: false,
          error: `Failed to upload ${file.name}: ${fileError.message}`,
          originalName: file.name
        });
      }
    }

    res.json({ results });

  } catch (error) {
    console.error('Error in upload route:', error);
    res.status(500).json({ error: 'Failed to upload files' });
  }
});

// Upload text note
router.post('/text-note', getAuthenticatedClient, async (req, res) => {
  try {
    const { projectId, content, manualTitle } = req.body;

    if (!projectId) {
      return res.status(400).json({ error: 'Project ID is required' });
    }

    if (!content || content.trim() === '') {
      return res.status(400).json({ error: 'Note content is required' });
    }

    const drive = google.drive({ version: 'v3', auth: req.googleAuth });

    let finalTitle;
    if (manualTitle && manualTitle.trim()) {
      finalTitle = manualTitle.trim();
    } else {
      // Generate title using AI
      finalTitle = await geminiService.generateTitle(content.trim(), 'text');
    }

    const filename = `${finalTitle}.txt`;

    // Create the file metadata
    const fileMetadata = {
      name: filename,
      parents: [projectId]
    };

    const media = {
      mimeType: 'text/plain',
      body: require('stream').Readable.from(Buffer.from(content, 'utf8'))
    };

    const uploadedFile = await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: 'id, name, size, mimeType, createdTime'
    });

    res.json({
      success: true,
      file: {
        id: uploadedFile.data.id,
        name: uploadedFile.data.name,
        size: uploadedFile.data.size,
        mimeType: uploadedFile.data.mimeType,
        createdTime: uploadedFile.data.createdTime
      },
      generatedTitle: manualTitle ? null : finalTitle
    });

  } catch (error) {
    console.error('Error uploading text note:', error);
    res.status(500).json({ error: 'Failed to upload text note' });
  }
});

// Generate title for preview (without uploading)
router.post('/generate-title', getAuthenticatedClient, async (req, res) => {
  try {
    const { content, fileType } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    const title = await geminiService.generateTitle(content, fileType || 'text');
    
    res.json({ title });
  } catch (error) {
    console.error('Error generating title:', error);
    res.status(500).json({ error: 'Failed to generate title' });
  }
});

// Helper functions
function isImageFile(mimeType) {
  return mimeType && mimeType.startsWith('image/');
}

function getExtensionFromMimeType(mimeType) {
  const mimeToExt = {
    'image/jpeg': '.jpg',
    'image/jpg': '.jpg',
    'image/png': '.png',
    'image/gif': '.gif',
    'image/webp': '.webp',
    'video/mp4': '.mp4',
    'video/quicktime': '.mov',
    'video/x-msvideo': '.avi',
    'text/plain': '.txt',
    'application/pdf': '.pdf',
    'application/msword': '.doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx'
  };

  return mimeToExt[mimeType] || '';
}

module.exports = router;