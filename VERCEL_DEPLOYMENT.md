# Vercel Deployment Guide

## Overview

This guide covers deployment on Vercel, including Google OAuth configuration and CORS handling for OpenMRS API.

## Google OAuth Configuration for Vercel

The error "Request details: flowName=GeneralOAuthFlow" occurs when Google OAuth is not properly configured for production.

### Step 1: Add Environment Variable in Vercel

1. Go to your Vercel project dashboard
2. Navigate to **Settings** > **Environment Variables**
3. Add a new environment variable:
   - **Name**: `REACT_APP_GOOGLE_CLIENT_ID`
   - **Value**: Your Google OAuth Client ID (e.g., `123456789-abcdefghijklmnop.apps.googleusercontent.com`)
   - **Environment**: Select all (Production, Preview, Development)
4. Click **Save**
5. **Redeploy** your application (Vercel will automatically redeploy when you add environment variables, or you can manually trigger a redeployment)

### Step 2: Update Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** > **Credentials**
3. Click on your OAuth 2.0 Client ID
4. Under **Authorized JavaScript origins**, add:
   - Your Vercel deployment URL (e.g., `https://your-app.vercel.app`)
   - If you have a custom domain, add that too
5. Under **Authorized redirect URIs**, add:
   - Your Vercel deployment URL (e.g., `https://your-app.vercel.app`)
   - If you have a custom domain, add that too
6. Click **Save**

### Step 3: Verify Configuration

After updating both Vercel and Google Cloud Console:

1. Wait a few minutes for changes to propagate
2. Redeploy your Vercel application
3. Clear your browser cache and cookies
4. Test the Google OAuth login

### Common Issues

**Issue**: Still getting "flowName=GeneralOAuthFlow" error
- **Solution**: Make sure the environment variable name is exactly `REACT_APP_GOOGLE_CLIENT_ID` (case-sensitive)
- **Solution**: Verify the Client ID value is correct (should end with `.apps.googleusercontent.com`)
- **Solution**: Ensure you've redeployed after adding the environment variable

**Issue**: OAuth works locally but not on Vercel
- **Solution**: Check that your Vercel domain is added to Google Cloud Console authorized origins
- **Solution**: Verify the environment variable is set for the correct environment (Production/Preview)

**Issue**: "Invalid Client ID" error
- **Solution**: Double-check the Client ID in Vercel matches the one in Google Cloud Console
- **Solution**: Make sure you're using the Client ID (not the Client Secret)

### Testing

1. After deployment, check the browser console for any errors
2. Verify the environment variable is loaded by checking the network tab
3. Test the Google OAuth flow end-to-end

### Security Notes

- Never commit your `.env` file to version control
- The Client ID is safe to expose in frontend code (it's public)
- Never expose the Client Secret
- Use different Client IDs for development and production if needed

## CORS Configuration for OpenMRS API

The app uses a Vercel serverless function to proxy OpenMRS API requests, which resolves CORS issues in production.

### How It Works

1. **Development**: Uses local proxy server (`server.js`) on port 3001
2. **Production (Vercel)**: Uses Vercel serverless function at `/api/openmrs/[...path]`

The serverless function (`api/openmrs/[...path].js`) automatically:
- Proxies all requests to OpenMRS
- Adds Basic Authentication headers
- Handles CORS headers
- Forwards query parameters correctly

### Environment Variables for OpenMRS (Optional)

You can optionally set these in Vercel if you want to override defaults:

- `OPENMRS_USERNAME` (default: `admin`)
- `OPENMRS_PASSWORD` (default: `Admin123`)

**Note**: These are optional as the defaults are already set in the serverless function.

### Testing the Proxy

After deployment, the app will automatically use the Vercel serverless function for all OpenMRS API calls. No additional configuration is needed.

### Troubleshooting CORS Issues

**Issue**: Still getting CORS errors after deployment
- **Solution**: Make sure the serverless function file exists at `api/openmrs/[...path].js`
- **Solution**: Check Vercel deployment logs for any errors in the serverless function
- **Solution**: Verify the function is being called by checking the Network tab in browser dev tools

