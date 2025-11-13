# Troubleshooting Guide

This guide helps you resolve common issues with the React app and OpenMRS integration.

## Network Error: Unable to Connect to OpenMRS

### Symptom
```
Network error: Unable to connect to OpenMRS. Please check CORS settings or network connectivity.
```

### Common Causes and Solutions

#### 1. Proxy Server Not Running

**Problem:** The proxy server is not running, so the React app cannot connect to OpenMRS.

**Solution:**
1. **Start the proxy server:**
   ```bash
   npm run server
   ```
   You should see:
   ```
   Proxy server running on http://localhost:3001
   Proxying OpenMRS requests to https://openmrs6.arogya.cloud
   ```

2. **Or run both servers together:**
   ```bash
   npm run dev
   ```
   This starts both the proxy server (port 3001) and React app (port 3000).

3. **Verify proxy server is running:**
   ```bash
   curl http://localhost:3001/health
   ```
   Expected response:
   ```json
   {
     "status": "ok",
     "message": "Proxy server is running",
     "openmrs_url": "https://openmrs6.arogya.cloud",
     "proxy_path": "/api/openmrs"
   }
   ```

#### 2. Port Already in Use

**Problem:** Port 3001 is already being used by another application.

**Solution:**
1. **Find what's using port 3001:**
   ```bash
   lsof -ti:3001
   ```

2. **Kill the process:**
   ```bash
   lsof -ti:3001 | xargs kill
   ```

3. **Or change the proxy server port:**
   Edit `server.js`:
   ```javascript
   const PORT = process.env.PORT || 3002; // Change to 3002 or another port
   ```
   Then update `.env`:
   ```env
   REACT_APP_PROXY_URL=http://localhost:3002/api/openmrs
   ```

#### 3. Proxy Server Configuration Issue

**Problem:** The proxy server is running but not configured correctly.

**Solution:**
1. **Check proxy server logs:**
   Look for error messages in the terminal where the proxy server is running.

2. **Verify OpenMRS credentials:**
   Check that credentials in `server.js` are correct:
   ```javascript
   const OPENMRS_USERNAME = 'admin';
   const OPENMRS_PASSWORD = 'Admin123';
   ```

3. **Test OpenMRS connection directly:**
   ```bash
   curl -u admin:Admin123 https://openmrs6.arogya.cloud/openmrs/ws/rest/v1/session
   ```

#### 4. React App Not Using Proxy

**Problem:** The React app is trying to connect directly to OpenMRS instead of using the proxy.

**Solution:**
1. **Check environment variables:**
   Make sure `.env` doesn't have:
   ```env
   REACT_APP_USE_PROXY=false
   ```

2. **Verify proxy URL:**
   Check that `src/services/openmrsService.js` is using the proxy:
   ```javascript
   const USE_PROXY = process.env.REACT_APP_USE_PROXY !== 'false'; // Should be true
   const PROXY_URL = process.env.REACT_APP_PROXY_URL || 'http://localhost:3001/api/openmrs';
   ```

3. **Restart React app:**
   Stop and restart the React development server after changing environment variables.

## CORS Errors

### Symptom
```
Access to fetch at 'https://openmrs6.arogya.cloud/...' from origin 'http://localhost:3000' 
has been blocked by CORS policy
```

### Solution
**Always use the proxy server** in development. The proxy server handles CORS automatically.

1. **Start the proxy server:**
   ```bash
   npm run server
   ```

2. **Verify proxy is being used:**
   Check browser console - requests should go to `http://localhost:3001/api/openmrs`, not directly to OpenMRS.

## Authentication Errors

### Symptom
```
Authentication failed: Invalid OpenMRS credentials
```

### Solution
1. **Verify credentials in `server.js`:**
   ```javascript
   const OPENMRS_USERNAME = 'admin';
   const OPENMRS_PASSWORD = 'Admin123';
   ```

2. **Test credentials directly:**
   ```bash
   curl -u admin:Admin123 https://openmrs6.arogya.cloud/openmrs/ws/rest/v1/session
   ```

3. **Check OpenMRS server status:**
   Verify that the OpenMRS server is accessible and the credentials are correct.

## Patient Not Found

### Symptom
```
Patient not found with the provided email
```

### Solution
1. **Verify patient exists in OpenMRS:**
   - Check that a patient with email `test@gmail.com` exists in OpenMRS
   - Verify the email is stored as a person attribute

2. **Check email format:**
   - Ensure the email matches exactly: `test@gmail.com`
   - Check for extra spaces or different casing

3. **Test patient search directly:**
   ```bash
   curl -u admin:Admin123 "https://openmrs6.arogya.cloud/openmrs/ws/rest/v1/patient?q=test@gmail.com&limit=1"
   ```

## Proxy Server Not Starting

### Symptom
```
Error: Cannot find module 'express'
```

### Solution
1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Verify dependencies are installed:**
   ```bash
   npm list express cors http-proxy-middleware
   ```

## React App Not Loading

### Symptom
React app shows blank page or errors in console.

### Solution
1. **Check if React app is running:**
   ```bash
   npm start
   ```

2. **Check browser console:**
   Look for error messages in the browser's developer console.

3. **Verify environment variables:**
   Make sure `.env` file exists with:
   ```env
   REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id_here
   ```

4. **Clear browser cache:**
   Clear browser cache and reload the page.

## Quick Diagnostic Steps

### 1. Check Proxy Server
```bash
curl http://localhost:3001/health
```
Should return JSON with status "ok".

### 2. Check OpenMRS Connection
```bash
curl -u admin:Admin123 https://openmrs6.arogya.cloud/openmrs/ws/rest/v1/session
```
Should return session information.

### 3. Check React App
Open `http://localhost:3000` in browser and check console for errors.

### 4. Check Network Requests
1. Open browser Developer Tools (F12)
2. Go to Network tab
3. Try to login with Google
4. Check if requests are going to `http://localhost:3001/api/openmrs`
5. Check response status codes and error messages

## Common Commands

### Start Proxy Server
```bash
npm run server
```

### Start React App
```bash
npm start
```

### Start Both Servers
```bash
npm run dev
```

### Check Proxy Health
```bash
curl http://localhost:3001/health
```

### Test OpenMRS Connection
```bash
curl -u admin:Admin123 https://openmrs6.arogya.cloud/openmrs/ws/rest/v1/session
```

### Test Patient Search
```bash
curl -u admin:Admin123 "https://openmrs6.arogya.cloud/openmrs/ws/rest/v1/patient?q=test@gmail.com&limit=1"
```

## Still Having Issues?

1. **Check logs:**
   - Proxy server logs (terminal where `npm run server` is running)
   - React app logs (terminal where `npm start` is running)
   - Browser console (F12 → Console tab)

2. **Verify configuration:**
   - Check `server.js` for correct OpenMRS URL and credentials
   - Check `src/services/openmrsService.js` for proxy configuration
   - Check `.env` file for environment variables

3. **Test components separately:**
   - Test proxy server independently
   - Test OpenMRS connection directly
   - Test React app without OpenMRS integration

4. **Review documentation:**
   - [CORS Proxy Setup Guide](./docs/CORS_PROXY_SETUP.md)
   - [OpenMRS Integration Guide](./docs/OPENMRS_INTEGRATION.md)
   - [Quick Start Guide](./docs/QUICK_START.md)

---

**Last Updated:** 2024

