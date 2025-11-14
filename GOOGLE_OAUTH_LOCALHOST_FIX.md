# Fix Google OAuth Error on Localhost

## Error Message
```
[GSI_LOGGER]: The given origin is not allowed for the given client ID.
```

## Problem
Your Google OAuth Client ID is not configured to allow requests from `http://localhost:3000`.

## Solution: Add Localhost to Google Cloud Console

### Step 1: Go to Google Cloud Console

1. Visit: https://console.cloud.google.com/
2. Sign in with your Google account
3. Select your project (or the project where you created the OAuth Client ID)

### Step 2: Navigate to OAuth Credentials

1. Go to **APIs & Services** > **Credentials**
2. Find your OAuth 2.0 Client ID (the one ending with `.apps.googleusercontent.com`)
3. Click on it to edit

### Step 3: Add Localhost to Authorized Origins

1. Scroll down to **Authorized JavaScript origins**
2. Click **+ ADD URI**
3. Add: `http://localhost:3000`
4. **Important:** 
   - Use `http://` (not `https://`)
   - No trailing slash
   - Exact match: `http://localhost:3000`

### Step 4: Add Localhost to Redirect URIs

1. Scroll down to **Authorized redirect URIs**
2. Click **+ ADD URI**
3. Add: `http://localhost:3000`
4. **Important:**
   - Use `http://` (not `https://`)
   - No trailing slash
   - Exact match: `http://localhost:3000`

### Step 5: Save Changes

1. Click **SAVE** at the bottom
2. Wait a few seconds for changes to propagate

### Step 6: Test

1. **Clear browser cache:**
   - Press `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)
   - Or open DevTools (F12) > Application > Clear storage > Clear site data

2. **Restart your development server:**
   ```bash
   # Stop server (Ctrl+C)
   npm start
   ```

3. **Test Google Sign-In:**
   - Open `http://localhost:3000`
   - Click "Sign in with Google"
   - Should work without errors

## Quick Checklist

- [ ] Added `http://localhost:3000` to **Authorized JavaScript origins**
- [ ] Added `http://localhost:3000` to **Authorized redirect URIs**
- [ ] Clicked **SAVE** in Google Cloud Console
- [ ] Cleared browser cache
- [ ] Restarted development server
- [ ] Tested sign-in

## Common Mistakes

❌ **Wrong:**
- `https://localhost:3000` (using https)
- `http://localhost:3000/` (trailing slash)
- `http://127.0.0.1:3000` (different hostname)
- Forgot to click SAVE

✅ **Correct:**
- `http://localhost:3000` (exact match, no trailing slash)

## Still Not Working?

1. **Verify Client ID:**
   - Check `.env` file has correct Client ID
   - Should match the one in Google Cloud Console

2. **Check Browser Console:**
   - Open DevTools (F12) > Console
   - Look for new error messages
   - Check if Client ID is being read correctly

3. **Wait a Few Minutes:**
   - Google changes can take 1-2 minutes to propagate
   - Try again after waiting

4. **Check Multiple Browsers:**
   - Try in incognito/private mode
   - Try different browser

5. **Verify OAuth Consent Screen:**
   - Go to **APIs & Services** > **OAuth consent screen**
   - Make sure it's configured
   - Add your email as a test user if using External app type

## Your Current Client ID

Based on your error, your Client ID is:
```
123979670707-v6thcjf7rpq5ms545qv53bt6a2e2hip7.apps.googleusercontent.com
```

Make sure this is the one you're editing in Google Cloud Console.

