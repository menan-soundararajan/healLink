# CORS Proxy Setup Guide

This guide explains how to set up and use the proxy server to resolve CORS (Cross-Origin Resource Sharing) issues when accessing the OpenMRS API from the React application.

## Problem

When making API requests from a browser (React app) to a different domain (OpenMRS server), you may encounter CORS errors:

```
Access to fetch at 'https://openmrs6.arogya.cloud/...' from origin 'http://localhost:3000' 
has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present
```

## Solution

A proxy server acts as an intermediary between your React app and the OpenMRS server, eliminating CORS issues by:
1. Making requests from the same origin (no CORS restrictions)
2. Handling authentication on the server side
3. Forwarding requests to OpenMRS and responses back to the React app

## Setup

### 1. Install Dependencies

The proxy server requires the following packages (already added to `package.json`):

```bash
npm install
```

This installs:
- `express` - Web server framework
- `cors` - CORS middleware
- `http-proxy-middleware` - Proxy middleware
- `concurrently` - Run multiple commands simultaneously

### 2. Proxy Server Configuration

The proxy server is configured in `server.js`:

```javascript
const OPENMRS_BASE_URL = 'https://openmrs6.arogya.cloud';
const OPENMRS_USERNAME = 'admin';
const OPENMRS_PASSWORD = 'Admin123';
const PORT = 3001;
```

### 3. Running the Application

#### Option A: Run Both Servers Together (Recommended)

Use the `dev` script to run both the proxy server and React app:

```bash
npm run dev
```

This will:
- Start the proxy server on `http://localhost:3001`
- Start the React app on `http://localhost:3000`

#### Option B: Run Servers Separately

Terminal 1 - Proxy Server:
```bash
npm run server
```

Terminal 2 - React App:
```bash
npm start
```

### 4. Verify Proxy Server is Running

Check the proxy server health:
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

## How It Works

### Request Flow

```
React App (localhost:3000)
    ↓
Proxy Server (localhost:3001)
    ↓
OpenMRS Server (openmrs6.arogya.cloud)
```

### Example Request

**React App Request:**
```
GET http://localhost:3001/api/openmrs/ws/rest/v1/session
```

**Proxy Server Forwards:**
```
GET https://openmrs6.arogya.cloud/openmrs/ws/rest/v1/session
Headers: Authorization: Basic <credentials>
```

**OpenMRS Response:**
```
200 OK
{
  "authenticated": true,
  ...
}
```

**Proxy Server Returns:**
```
200 OK
Headers: Access-Control-Allow-Origin: http://localhost:3000
{
  "authenticated": true,
  ...
}
```

## Configuration

### Environment Variables

You can configure the proxy server using environment variables:

```bash
# Proxy server port (default: 3001)
PORT=3001

# OpenMRS credentials
OPENMRS_USERNAME=admin
OPENMRS_PASSWORD=Admin123
```

### React App Configuration

The React app automatically uses the proxy when `REACT_APP_USE_PROXY` is not set to `false`.

To disable the proxy (use direct OpenMRS connection):
```env
REACT_APP_USE_PROXY=false
```

To change the proxy URL:
```env
REACT_APP_PROXY_URL=http://localhost:3001/api/openmrs
```

## Proxy Server Features

### 1. Automatic Authentication

The proxy server automatically adds Basic Authentication headers to all requests, so you don't need to handle credentials in the React app.

### 2. CORS Headers

The proxy server adds CORS headers to all responses, allowing the React app to access them.

### 3. Request Logging

The proxy server logs all requests and responses for debugging:
```
[Proxy] GET /api/openmrs/ws/rest/v1/session -> https://openmrs6.arogya.cloud/openmrs/ws/rest/v1/session
[Proxy] Response: 200 for GET /api/openmrs/ws/rest/v1/session
```

### 4. Error Handling

The proxy server handles errors gracefully and returns appropriate error responses.

## Troubleshooting

### Proxy Server Won't Start

**Issue:** Port 3001 is already in use

**Solution:**
1. Change the port in `server.js`:
   ```javascript
   const PORT = process.env.PORT || 3002;
   ```
2. Or kill the process using port 3001:
   ```bash
   lsof -ti:3001 | xargs kill
   ```

### Requests Still Fail

**Issue:** Proxy server is not running

**Solution:**
1. Verify proxy server is running:
   ```bash
   curl http://localhost:3001/health
   ```
2. Check proxy server logs for errors
3. Verify React app is using the proxy (check browser network tab)

### Authentication Errors

**Issue:** Invalid OpenMRS credentials

**Solution:**
1. Verify credentials in `server.js` or environment variables
2. Test credentials directly with OpenMRS:
   ```bash
   curl -u admin:Admin123 https://openmrs6.arogya.cloud/openmrs/ws/rest/v1/session
   ```

### CORS Errors Still Occur

**Issue:** Proxy server not configured correctly

**Solution:**
1. Verify proxy server is running on correct port
2. Check React app is using proxy URL
3. Verify CORS headers in proxy response
4. Check browser console for actual error messages

## Production Deployment

### Option 1: Use Proxy Server (Recommended)

Deploy both the React app and proxy server:

1. **Proxy Server:**
   - Deploy to a server (Node.js hosting)
   - Update CORS origin to your production domain
   - Use environment variables for credentials
   - Enable HTTPS

2. **React App:**
   - Update `REACT_APP_PROXY_URL` to production proxy URL
   - Build and deploy to static hosting

### Option 2: Configure CORS on OpenMRS Server

If you have access to the OpenMRS server, configure CORS:

1. **OpenMRS Configuration:**
   ```properties
   # Allow CORS from your domain
   rest.allowedOrigins=https://yourdomain.com,http://localhost:3000
   ```

2. **Disable Proxy:**
   ```env
   REACT_APP_USE_PROXY=false
   ```

### Option 3: Backend API

Create a dedicated backend API that:
- Handles OpenMRS requests
- Manages authentication
- Provides a REST API for the React app
- Handles CORS properly

## Security Considerations

### 1. Credentials

- **Never commit credentials to version control**
- Use environment variables for credentials
- Use different credentials for dev/staging/prod
- Rotate credentials regularly

### 2. CORS Configuration

- Only allow trusted origins
- Use HTTPS in production
- Validate requests on the proxy server

### 3. Rate Limiting

Consider adding rate limiting to prevent abuse:
```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/openmrs', limiter);
```

### 4. Request Validation

Validate and sanitize all requests before forwarding to OpenMRS.

## Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [http-proxy-middleware Documentation](https://github.com/chimurai/http-proxy-middleware)
- [CORS Documentation](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [OpenMRS REST API Documentation](https://rest.openmrs.org/)

## Support

For issues or questions:
1. Check proxy server logs
2. Verify OpenMRS server is accessible
3. Test proxy server health endpoint
4. Check browser console for errors
5. Review this documentation

---

**Last Updated:** 2024
**Version:** 1.0.0

