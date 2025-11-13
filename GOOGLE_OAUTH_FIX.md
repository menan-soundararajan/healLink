# Fix Google Sign-In Error: "Request details: flowName=GeneralOAuthFlow"

## Problem

The error "Request details: flowName=GeneralOAuthFlow" occurs when Google OAuth is not properly configured.

## Root Cause

Your `.env` file currently has:
```
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id_here
```

This is a **placeholder**, not your actual Google OAuth Client ID.

## Solution Steps

### Step 1: Get Your Google OAuth Client ID

1. **Go to Google Cloud Console:**
   - Visit: https://console.cloud.google.com/
   - Sign in with your Google account

2. **Select or Create a Project:**
   - Click the project dropdown at the top
   - Select an existing project or create a new one

3. **Enable Google Identity Services API:**
   - Go to **APIs & Services** > **Library**
   - Search for "Google Identity Services API"
   - Click **Enable** (if not already enabled)

4. **Create OAuth 2.0 Credentials:**
   - Go to **APIs & Services** > **Credentials**
   - Click **+ CREATE CREDENTIALS** > **OAuth client ID**
   
5. **Configure OAuth Consent Screen (if prompted):**
   - Choose **External** (for testing) or **Internal** (for Google Workspace)
   - Fill in:
     - **App name**: HealLink (or your app name)
     - **User support email**: Your email
     - **Developer contact information**: Your email
   - Click **Save and Continue**
   - On Scopes page, click **Save and Continue**
   - On Test users page, add your email if needed, then **Save and Continue**
   - Review and **Back to Dashboard**

6. **Create OAuth Client ID:**
   - Application type: **Web application**
   - Name: **HealLink** (or your app name)
   - **Authorized JavaScript origins:**
     - Add: `http://localhost:3000`
     - If deploying to Vercel, also add: `https://your-app.vercel.app`
   - **Authorized redirect URIs:**
     - Add: `http://localhost:3000`
     - If deploying to Vercel, also add: `https://your-app.vercel.app`
   - Click **CREATE**

7. **Copy Your Client ID:**
   - A popup will show your Client ID
   - It looks like: `123456789-abcdefghijklmnop.apps.googleusercontent.com`
   - **Copy this value** (you won't see it again)

### Step 2: Update Your .env File

1. **Open your `.env` file** in the project root directory

2. **Replace the placeholder** with your actual Client ID:
   ```env
   REACT_APP_GOOGLE_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
   ```
   (Use your actual Client ID, not this example)

3. **Save the file**

### Step 3: Restart Your Development Server

**IMPORTANT:** Environment variables are only loaded when the server starts.

1. **Stop your current server:**
   - Press `Ctrl+C` in the terminal where the server is running

2. **Start the server again:**
   ```bash
   npm start
   ```

3. **Clear browser cache** (optional but recommended):
   - Press `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)
   - Or open DevTools (F12) > Application > Clear storage > Clear site data

### Step 4: Verify Configuration

1. **Check browser console:**
   - Open DevTools (F12)
   - Go to Console tab
   - You should NOT see the error: "⚠️ Google OAuth Client ID is not configured"
   - If you see it, the Client ID is still not set correctly

2. **Test Google Sign-In:**
   - Click the "Sign in with Google" button
   - You should see the Google sign-in popup
   - After signing in, you should be redirected back to the app

## Troubleshooting

### Still Getting the Error?

1. **Verify .env file location:**
   - Must be in the **root directory** of your project (same level as `package.json`)
   - File name must be exactly `.env` (not `.env.local` or `.env.development`)

2. **Check variable name:**
   - Must be exactly: `REACT_APP_GOOGLE_CLIENT_ID`
   - Case-sensitive
   - Must start with `REACT_APP_`

3. **Verify Client ID format:**
   - Should end with `.apps.googleusercontent.com`
   - Should not have quotes around it
   - Should not have spaces

4. **Check Google Cloud Console:**
   - Verify `http://localhost:3000` is in **Authorized JavaScript origins**
   - Verify `http://localhost:3000` is in **Authorized redirect URIs**
   - No trailing slashes

5. **Restart server:**
   - Environment variables are only loaded on server start
   - Always restart after changing `.env`

6. **Check browser console:**
   - Look for any error messages
   - Check Network tab for failed requests

### Common Mistakes

❌ **Wrong:**
```env
REACT_APP_GOOGLE_CLIENT_ID="123456789-abc.apps.googleusercontent.com"
```
(Don't use quotes)

❌ **Wrong:**
```env
GOOGLE_CLIENT_ID=123456789-abc.apps.googleusercontent.com
```
(Missing `REACT_APP_` prefix)

❌ **Wrong:**
```env
REACT_APP_GOOGLE_CLIENT_ID = 123456789-abc.apps.googleusercontent.com
```
(No spaces around `=`)

✅ **Correct:**
```env
REACT_APP_GOOGLE_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
```

## For Production (Vercel)

If deploying to Vercel, also:

1. **Add environment variable in Vercel:**
   - Go to Vercel project dashboard
   - Settings > Environment Variables
   - Add `REACT_APP_GOOGLE_CLIENT_ID` with your Client ID
   - Select all environments (Production, Preview, Development)
   - Save

2. **Update Google Cloud Console:**
   - Add your Vercel URL to **Authorized JavaScript origins**
   - Add your Vercel URL to **Authorized redirect URIs**
   - Example: `https://your-app.vercel.app`

3. **Redeploy:**
   - Vercel will automatically redeploy when you add environment variables
   - Or manually trigger a redeployment

## Quick Checklist

- [ ] Created OAuth 2.0 Client ID in Google Cloud Console
- [ ] Added `http://localhost:3000` to Authorized JavaScript origins
- [ ] Added `http://localhost:3000` to Authorized redirect URIs
- [ ] Copied the Client ID (ends with `.apps.googleusercontent.com`)
- [ ] Updated `.env` file with actual Client ID (no quotes, no spaces)
- [ ] Restarted development server
- [ ] Cleared browser cache
- [ ] Tested sign-in

## Still Need Help?

If you're still having issues:

1. Check the browser console for specific error messages
2. Verify your `.env` file contents
3. Verify Google Cloud Console settings
4. Make sure you've restarted the server after changing `.env`

