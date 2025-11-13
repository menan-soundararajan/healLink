# Google OAuth Login Setup Documentation

## Overview

This application implements Google OAuth 2.0 authentication using the `@react-oauth/google` library. Users can sign in with their Google account, and upon successful authentication, their profile information is displayed.

## Architecture

### Components Structure

```
src/
├── index.js          # App entry point with GoogleOAuthProvider
├── App.js            # Main app component with authentication logic
├── Login.js          # Login page component
├── Login.css         # Login page styles
└── App.css           # App styles
```

### Flow Diagram

```
User visits app
    ↓
Check if user is authenticated
    ↓
No → Show Login Page (Login.js)
    ↓
User clicks "Sign in with Google"
    ↓
Google OAuth popup/redirect
    ↓
User authenticates with Google
    ↓
Google returns JWT credential
    ↓
Decode JWT to get user info
    ↓
Store user in state
    ↓
Show authenticated view (App.js)
```

## Dependencies

### Installed Packages

1. **@react-oauth/google** (v2.x)
   - Official React library for Google OAuth
   - Provides `GoogleOAuthProvider` and `GoogleLogin` components
   - Handles OAuth flow and token management

2. **jwt-decode** (v4.x)
   - Library for decoding JWT tokens
   - Extracts user information from Google's credential response

### Installation Commands

```bash
npm install @react-oauth/google
npm install jwt-decode
```

## Configuration

### 1. Google Cloud Console Setup

#### Step 1: Create/Select Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Note your project name and ID

#### Step 2: Enable APIs
1. Navigate to **APIs & Services** > **Library**
2. Search for "Google Identity Services API" or "Google+ API"
3. Click **Enable**

#### Step 3: Create OAuth 2.0 Credentials
1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth client ID**
3. If prompted, configure the OAuth consent screen:
   - Choose **External** (for testing) or **Internal** (for Google Workspace)
   - Fill in required fields (App name, User support email, Developer contact)
   - Add scopes: `email`, `profile`, `openid`
   - Add test users if using External type
4. Back to Credentials, select **Web application**
5. Configure:
   - **Name**: Your app name (e.g., "My React App")
   - **Authorized JavaScript origins**:
     - `http://localhost:3000` (for development)
     - `https://yourdomain.com` (for production)
   - **Authorized redirect URIs**:
     - `http://localhost:3000` (for development)
     - `https://yourdomain.com` (for production)
6. Click **Create**
7. Copy the **Client ID** (not the Client Secret)

### 2. Environment Variables

Create a `.env` file in the root directory:

```env
REACT_APP_GOOGLE_CLIENT_ID=your_client_id_here.apps.googleusercontent.com
```

**Important Notes:**
- The `REACT_APP_` prefix is required for Create React App to expose the variable
- Never commit `.env` file to version control (it should be in `.gitignore`)
- Restart the development server after creating/modifying `.env`

### 3. Code Configuration

#### index.js
The app is wrapped with `GoogleOAuthProvider`:

```javascript
import { GoogleOAuthProvider } from '@react-oauth/google';

const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID_HERE';

<GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
  <App />
</GoogleOAuthProvider>
```

## Component Details

### Login Component (`src/Login.js`)

**Purpose**: Displays the login page with Google sign-in button

**Props**:
- `onSuccess`: Callback function when login succeeds
- `onError`: Callback function when login fails

**Features**:
- Centered card layout
- Google OAuth button
- One Tap sign-in enabled (`useOneTap` prop)

**Usage**:
```javascript
<Login 
  onSuccess={handleLoginSuccess} 
  onError={handleLoginError} 
/>
```

### App Component (`src/App.js`)

**Purpose**: Main application component managing authentication state

**State**:
- `user`: Stores decoded user information (null when not authenticated)

**Functions**:
- `handleLoginSuccess(credentialResponse)`: 
  - Receives credential from Google
  - Decodes JWT token
  - Extracts user info (name, email, picture)
  - Updates user state
  
- `handleLoginError()`: 
  - Handles authentication errors
  - Logs error to console

- `handleLogout()`: 
  - Clears user state
  - Returns to login page

**User Object Structure**:
```javascript
{
  sub: "user_id",
  name: "User Name",
  email: "user@example.com",
  picture: "https://...",
  email_verified: true,
  // ... other Google profile fields
}
```

## Styling

### Login Page (`Login.css`)

**Design Features**:
- Gradient background (purple theme)
- Centered white card with shadow
- Responsive design for mobile devices
- Modern, clean UI

**Key Styles**:
- Container: Full viewport height with gradient
- Card: White background, rounded corners, shadow
- Typography: Clear hierarchy with title and subtitle

### App Styles (`App.css`)

**Authenticated View**:
- Dark background
- Centered user information
- Profile picture with circular border
- Logout button with hover effects

## Usage Guide

### Starting the Application

1. **Install dependencies** (if not already done):
   ```bash
   npm install
   ```

2. **Set up environment variable**:
   - Create `.env` file with your Client ID
   - Or update `index.js` with your Client ID directly

3. **Start development server**:
   ```bash
   npm start
   ```

4. **Access the app**:
   - Open `http://localhost:3000` in your browser
   - You should see the login page

### User Flow

1. **Login**:
   - User sees login page with "Sign in with Google" button
   - Clicks button
   - Google OAuth popup appears
   - User selects Google account
   - User grants permissions
   - App receives credential and decodes user info
   - User is redirected to authenticated view

2. **Authenticated View**:
   - Displays user's profile picture
   - Shows user's name and email
   - Provides logout button

3. **Logout**:
   - User clicks logout button
   - User state is cleared
   - User is redirected back to login page

## Security Considerations

### Best Practices

1. **Client ID Security**:
   - Client ID is public (safe to expose in frontend)
   - Never expose Client Secret (not used in this flow)
   - Use environment variables, not hardcoded values

2. **Token Handling**:
   - JWT tokens are decoded client-side (for display only)
   - For production, validate tokens on backend
   - Don't store sensitive data in JWT payload

3. **HTTPS**:
   - Always use HTTPS in production
   - Google OAuth requires HTTPS for production domains

4. **Origin Validation**:
   - Only add trusted origins in Google Console
   - Remove unused origins regularly

### Production Checklist

- [ ] Use HTTPS for production domain
- [ ] Add production domain to authorized origins
- [ ] Configure OAuth consent screen for production
- [ ] Set up proper error handling
- [ ] Implement backend token validation (recommended)
- [ ] Add rate limiting (if needed)
- [ ] Set up monitoring/logging

## Troubleshooting

### Common Issues

#### 1. "Error 400: redirect_uri_mismatch"
**Cause**: The redirect URI in your code doesn't match Google Console settings

**Solution**:
- Check authorized JavaScript origins in Google Console
- Ensure `http://localhost:3000` is added (for development)
- Verify no trailing slashes or protocol mismatches

#### 2. "Error 403: access_denied"
**Cause**: OAuth consent screen not configured or user not authorized

**Solution**:
- Complete OAuth consent screen setup
- Add test users if using External app type
- Verify scopes are correctly configured

#### 3. "Invalid Client ID"
**Cause**: Client ID not set or incorrect

**Solution**:
- Verify `.env` file exists and has correct format
- Check `REACT_APP_` prefix is present
- Restart development server after creating `.env`
- Verify Client ID matches Google Console

#### 4. "Popup blocked"
**Cause**: Browser blocking popup windows

**Solution**:
- Allow popups for localhost
- Check browser popup blocker settings
- Consider using redirect flow instead of popup

#### 5. Environment Variable Not Loading
**Cause**: Variable not exposed or server not restarted

**Solution**:
- Ensure variable starts with `REACT_APP_`
- Restart development server (`npm start`)
- Check `.env` file is in root directory
- Verify no typos in variable name

### Debugging Tips

1. **Check Console Logs**:
   - Open browser DevTools
   - Check Console for errors
   - Check Network tab for OAuth requests

2. **Verify Environment Variable**:
   ```javascript
   // Temporarily add to index.js for debugging
   console.log('Client ID:', process.env.REACT_APP_GOOGLE_CLIENT_ID);
   ```

3. **Test Token Decoding**:
   ```javascript
   // In handleLoginSuccess
   console.log('Credential:', credentialResponse);
   console.log('Decoded:', decoded);
   ```

4. **Google Console Verification**:
   - Check API is enabled
   - Verify credentials are active
   - Check authorized origins list

## API Reference

### GoogleLogin Component Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `onSuccess` | function | Yes | Callback when login succeeds |
| `onError` | function | Yes | Callback when login fails |
| `useOneTap` | boolean | No | Enable Google One Tap sign-in |
| `auto_select` | boolean | No | Auto-select account if only one |
| `cancel_on_tap_outside` | boolean | No | Close One Tap on outside click |
| `context` | string | No | Context for One Tap (signin/signup) |

### Credential Response Structure

```javascript
{
  credential: "eyJhbGciOiJSUzI1NiIsImtpZCI6Ij...", // JWT token
  select_by: "user" // How user was selected
}
```

### Decoded JWT Structure

```javascript
{
  iss: "https://accounts.google.com",
  sub: "1234567890",
  email: "user@example.com",
  email_verified: true,
  name: "User Name",
  picture: "https://lh3.googleusercontent.com/...",
  given_name: "User",
  family_name: "Name",
  iat: 1234567890,
  exp: 1234567890
}
```

## Extending the Implementation

### Adding Backend Validation

For production, validate tokens on your backend:

```javascript
// Backend example (Node.js)
const { OAuth2Client } = require('google-auth-library');

const client = new OAuth2Client(CLIENT_ID);

async function verifyToken(token) {
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: CLIENT_ID,
  });
  return ticket.getPayload();
}
```

### Storing User Session

Consider using:
- LocalStorage (client-side only)
- SessionStorage (cleared on tab close)
- Cookies (with httpOnly flag for security)
- Backend session management

### Adding More Scopes

Update OAuth consent screen and request additional scopes:

```javascript
<GoogleLogin
  onSuccess={handleLoginSuccess}
  onError={handleLoginError}
  scope="email profile https://www.googleapis.com/auth/calendar"
/>
```

## Resources

- [Google Identity Services Documentation](https://developers.google.com/identity/gsi/web)
- [@react-oauth/google GitHub](https://github.com/MomenSherif/react-oauth)
- [Google Cloud Console](https://console.cloud.google.com/)
- [JWT.io - JWT Debugger](https://jwt.io/)
- [OAuth 2.0 Best Practices](https://oauth.net/2/)

## Support

For issues or questions:
1. Check this documentation
2. Review Google OAuth documentation
3. Check library GitHub issues
4. Verify Google Console configuration

---

**Last Updated**: 2024
**Version**: 1.0.0

