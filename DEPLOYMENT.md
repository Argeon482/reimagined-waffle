# Deployment Guide - Project Capture AI

## Quick Deployment to Render

### 1. Prerequisites

- GitHub repository with the code
- Google Cloud Console project with APIs enabled
- Gemini API key from Google AI Studio

### 2. Google Cloud Console Setup

1. **Enable APIs:**
   - Google Drive API
   - Google+ API (for OAuth)

2. **Create OAuth 2.0 Credentials:**
   - Go to Credentials → Create Credentials → OAuth 2.0 Client IDs
   - Application type: Web application
   - Authorized redirect URIs: `https://your-app-name.onrender.com/auth/google/callback`

### 3. Deploy to Render

1. **Connect Repository:**
   - Go to [Render Dashboard](https://dashboard.render.com/)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository

2. **Configure Service:**
   - Name: `project-capture-ai` (or your preferred name)
   - Environment: `Node`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`

3. **Set Environment Variables:**
   ```
   NODE_ENV=production
   GOOGLE_CLIENT_ID=your_actual_client_id
   GOOGLE_CLIENT_SECRET=your_actual_client_secret
   GOOGLE_REDIRECT_URI=https://your-app-name.onrender.com/auth/google/callback
   GEMINI_API_KEY=your_actual_gemini_key
   FRONTEND_URL=https://your-app-name.onrender.com
   ```

4. **Deploy:**
   - Click "Create Web Service"
   - Wait for initial deployment (5-10 minutes)

### 4. Post-Deployment

1. **Update Google OAuth:**
   - Update redirect URI in Google Cloud Console
   - Add your Render URL: `https://your-app-name.onrender.com/auth/google/callback`

2. **Test Application:**
   - Visit your deployed URL
   - Test Google authentication
   - Test file upload functionality

### 5. Custom Domain (Optional)

1. **Add Custom Domain in Render:**
   - Go to Settings → Custom Domains
   - Add your domain

2. **Update Environment Variables:**
   ```
   GOOGLE_REDIRECT_URI=https://yourdomain.com/auth/google/callback
   FRONTEND_URL=https://yourdomain.com
   ```

3. **Update Google OAuth:**
   - Add new domain to authorized redirect URIs

### 6. Monitoring & Maintenance

- **Logs:** Check Render dashboard for application logs
- **Health Check:** Visit `/api/health` endpoint
- **Updates:** Push to GitHub to trigger automatic deployments

### 7. Troubleshooting

**Common Issues:**

1. **OAuth Error:**
   - Verify redirect URIs match exactly
   - Check environment variables are set correctly

2. **API Key Issues:**
   - Verify Gemini API key is valid
   - Check Google APIs are enabled

3. **Build Failures:**
   - Check Node.js version compatibility
   - Verify all dependencies are in package.json

**Debug Commands:**
```bash
# Check logs
render logs --service your-service-name

# Check environment variables
render env --service your-service-name
```

### 8. Security Checklist

- ✅ All API keys stored as environment variables
- ✅ No sensitive data in source code
- ✅ HTTPS enabled (automatic with Render)
- ✅ CORS configured for production domain
- ✅ File size limits enforced (50MB)

---

**Need Help?** Check the main README.md for detailed setup instructions and troubleshooting tips.