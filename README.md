# Project Capture AI

A web application designed for electrical project managers to capture project-related notes, photos, and videos with AI-powered organization and automatic Google Drive synchronization.

## 🎯 Features

- **Google Drive Integration**: Seamlessly authenticate and sync with Google Drive
- **AI-Powered File Naming**: Automatically generate descriptive filenames using Gemini AI
- **Multi-language Support**: Supports content in English and Spanish
- **Project Organization**: Automatically organizes files into project folders
- **File Upload Support**: 
  - Images (.jpg, .png, .gif, .webp)
  - Videos (.mp4, .mov, .avi)
  - Documents (.txt, .pdf)
- **Text Notes**: Quick text note capture with AI title generation
- **Mobile Responsive**: Optimized for both desktop and mobile use
- **Drag & Drop Interface**: Intuitive file upload experience

## 🏗️ Architecture

- **Frontend**: React.js with modern hooks and responsive design
- **Backend**: Node.js with Express.js
- **AI Integration**: Google Gemini API for content analysis and title generation
- **Cloud Storage**: Google Drive API for file storage and organization
- **Authentication**: Google OAuth 2.0

## 📋 Prerequisites

- Node.js 18+ 
- Google Cloud Console account
- Google Drive API credentials
- Gemini API key

## 🚀 Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd project-capture-ai
```

### 2. Backend Setup

```bash
# Install backend dependencies
npm install

# Create environment file
cp .env.example .env
```

### 3. Frontend Setup

```bash
# Install frontend dependencies
cd client
npm install
cd ..
```

### 4. Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the following APIs:
   - Google Drive API
   - Google+ API (for OAuth)

4. Create OAuth 2.0 credentials:
   - Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
   - Application type: Web application
   - Authorized redirect URIs: `http://localhost:3001/auth/google/callback` (development)
   - For production: `https://your-domain.com/auth/google/callback`

### 5. Gemini API Setup

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create an API key for Gemini
3. Copy the API key for your environment variables

### 6. Environment Configuration

Edit the `.env` file with your credentials:

```env
# Google Drive API Configuration
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:3001/auth/google/callback

# Gemini AI API Configuration
GEMINI_API_KEY=your_gemini_api_key_here

# Server Configuration
PORT=3001
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000
```

## 🔧 Development

### Start the Development Server

```bash
# Start backend (from root directory)
npm run dev

# Start frontend (in another terminal)
cd client
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

## 📱 How It Works

### User Flow

1. **Authentication**: User clicks "Connect Google Drive" and authorizes the app
2. **Project Selection**: App scans Google Drive for "All Projects" folder and lists sub-folders
3. **File Upload**: User selects a project and uploads files via drag-and-drop or text input
4. **AI Processing**: Gemini AI analyzes content and generates descriptive filenames
5. **Storage**: Files are saved to Google Drive in the selected project folder

### Project Structure

```
project-capture-ai/
├── server.js                 # Main server entry point
├── routes/
│   ├── auth.js              # Google OAuth routes
│   ├── projects.js          # Project management routes
│   └── upload.js            # File upload routes
├── services/
│   └── geminiService.js     # AI integration service
├── client/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── services/        # API services
│   │   └── App.js          # Main app component
│   └── public/             # Static files
├── package.json            # Backend dependencies
└── .env.example           # Environment template
```

## 🚀 Deployment to Render

### 1. Prepare for Production

1. Update environment variables for production:
```env
NODE_ENV=production
GOOGLE_REDIRECT_URI=https://your-app-name.onrender.com/auth/google/callback
FRONTEND_URL=https://your-app-name.onrender.com
```

2. Update Google Cloud Console OAuth credentials with production URLs

### 2. Deploy to Render

1. Connect your GitHub repository to Render
2. Create a new Web Service
3. Set the build command: `npm install && npm run build`
4. Set the start command: `npm start`
5. Add environment variables in Render dashboard
6. Deploy

### 3. Configure Domain (Optional)

- Set up custom domain in Render dashboard
- Update Google OAuth credentials with new domain
- Update environment variables

## 🔐 Security Features

- **Environment Variables**: All sensitive data stored in environment variables
- **OAuth 2.0**: Secure Google authentication
- **CORS Protection**: Configured for specific origins
- **File Size Limits**: 50MB maximum file size
- **Input Validation**: Server-side validation for all inputs

## 🧪 Testing

```bash
# Test backend
npm test

# Test frontend
cd client
npm test
```

## 📝 API Endpoints

### Authentication
- `GET /api/auth/google` - Get Google OAuth URL
- `GET /api/auth/google/callback` - Handle OAuth callback
- `GET /api/auth/status` - Check authentication status
- `POST /api/auth/logout` - Logout user

### Projects
- `GET /api/projects` - Get all projects
- `POST /api/projects` - Create new project

### Upload
- `POST /api/upload` - Upload files
- `POST /api/upload/text-note` - Upload text note
- `POST /api/upload/generate-title` - Generate AI title

## 🐛 Troubleshooting

### Common Issues

1. **OAuth Error**: Verify redirect URIs match exactly in Google Console
2. **API Key Issues**: Ensure Gemini API key is valid and has proper permissions
3. **File Upload Fails**: Check file size limits and supported formats
4. **Drive Access**: Verify Google Drive API is enabled

### Debug Mode

Set `NODE_ENV=development` for detailed error messages and logging.

## 📄 License

MIT License - See LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For issues and questions:
1. Check the troubleshooting section
2. Review the GitHub issues
3. Create a new issue with detailed information

---

**Note**: This application requires internet connectivity and Google account access to function properly.
