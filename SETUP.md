# Photo Booth Setup Guide

## Overview

This is a React frontend for the Photo Booth social media platform. The backend runs locally and needs to be started separately.

## Local Development Setup

### 1. Backend Setup

1. Clone the backend repository
2. Navigate to the backend directory
3. Install dependencies: `npm install`
4. Start the server: `npm start`
5. Ensure the backend is running on `http://localhost:3000`

### 2. Frontend Setup

1. Install dependencies: `npm install`
2. Start the development server: `npm run dev`
3. The frontend will automatically connect to the local backend

## Production Deployment (Vercel)

### Current Configuration

The frontend is deployed on Vercel but configured to connect to a local backend. This means:

- ✅ The frontend is accessible online
- ❌ The backend must be running locally to use the app
- ⚠️ Users will see connection errors if the backend is not running

### Environment Variables

To configure the API URL, you can set the `VITE_API_URL` environment variable:

```bash
# For local development (default)
VITE_API_URL=http://localhost:3000/api

# For a hosted backend
VITE_API_URL=https://your-backend-url.com/api
```

### Vercel Environment Variables

1. Go to your Vercel project dashboard
2. Navigate to Settings > Environment Variables
3. Add `VITE_API_URL` with your backend URL
4. Redeploy the application

## Error Handling

The application now includes better error handling for:

- Backend connectivity issues
- Network errors
- Missing posts/pages
- Authentication errors

Users will see helpful error messages with instructions on how to resolve issues.

## Troubleshooting

### "Cannot connect to backend" error

- Ensure the backend server is running on `localhost:3000`
- Check that the backend is accessible at `http://localhost:3000/api/posts`
- Verify no firewall is blocking the connection

### "Post not found" error

- The post ID might be invalid
- The backend might not be running
- Check the backend logs for any errors

### Authentication issues

- Clear browser localStorage
- Ensure you're using the correct credentials
- Check that the backend auth endpoints are working

## Development Notes

- The frontend uses React Router for navigation
- Authentication state is managed with React Context
- API calls are centralized in `src/utils/api.js`
- Error handling is improved for production deployment
