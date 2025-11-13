# OpenMRS Integration Documentation

## Overview

This document describes the OpenMRS integration implementation that automatically fetches and displays patient information after a successful Google OAuth login. The integration uses the OpenMRS REST API to authenticate and retrieve patient data using a hardcoded test email (`test@gmail.com`) instead of the user's Google account email.

## Architecture

### Flow Diagram

```
User Login Flow:
┌─────────────────┐
│  Google Login   │
│  (OAuth 2.0)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Extract User   │
│  Info from JWT  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  OpenMRS Login  │
│  (Basic Auth)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Search Patient │
│  by Test Email  │
│  (test@gmail.com)│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Fetch Patient  │
│  Details (full) │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Format &       │
│  Display Data   │
└─────────────────┘
```

### Component Structure

```
src/
├── services/
│   └── openmrsService.js    # OpenMRS API integration
├── components/
│   └── PatientCard.js       # Patient display component
└── App.js                   # Main app with integration logic
```

## Configuration

### OpenMRS Server Settings

The OpenMRS integration is configured in `src/services/openmrsService.js`:

```javascript
const OPENMRS_BASE_URL = 'https://openmrs6.arogya.cloud';
const OPENMRS_USERNAME = 'admin';
const OPENMRS_PASSWORD = 'Admin123';
```

### OpenMRS URLs

**Base URL:** `https://openmrs6.arogya.cloud`

**SPA Login URL:** `https://openmrs6.arogya.cloud/openmrs/spa/login`  
*Note: This is the web interface login page. Our integration uses REST API Basic Authentication, not the SPA login.*

**REST API Base:** `https://openmrs6.arogya.cloud/openmrs/ws/rest/v1/`

### Authentication Method

This integration uses **Basic Authentication** with the OpenMRS REST API, which is the standard method for programmatic access. The SPA login URL is for the web interface and is not used by this integration.

- **REST API Authentication:** Basic Auth (username:password)
- **SPA Login:** Not used (web interface only)
- **Session Management:** Handled automatically via Basic Auth headers

### Patient Search Email

The application uses a hardcoded test email for patient queries. This is configured in `src/App.js`:

```javascript
const TEST_PATIENT_EMAIL = 'test@gmail.com';
```

**Note:** The application uses this hardcoded email (`test@gmail.com`) instead of the Google login email to search for patients in OpenMRS. This ensures consistent patient data retrieval regardless of which Google account is used for authentication.

To change the test email, update the `TEST_PATIENT_EMAIL` constant in `src/App.js`.

### Environment Variables

For production or different environments, you can move these to environment variables:

```env
REACT_APP_OPENMRS_BASE_URL=https://openmrs6.arogya.cloud
REACT_APP_OPENMRS_USERNAME=admin
REACT_APP_OPENMRS_PASSWORD=Admin123
REACT_APP_TEST_PATIENT_EMAIL=test@gmail.com
```

Then update the service file to use:
```javascript
const OPENMRS_BASE_URL = process.env.REACT_APP_OPENMRS_BASE_URL;
const OPENMRS_USERNAME = process.env.REACT_APP_OPENMRS_USERNAME;
const OPENMRS_PASSWORD = process.env.REACT_APP_OPENMRS_PASSWORD;
```

And update `App.js` to use:
```javascript
const TEST_PATIENT_EMAIL = process.env.REACT_APP_TEST_PATIENT_EMAIL || 'test@gmail.com';
```

## API Endpoints

### 1. Session Authentication
**Endpoint:** `GET /openmrs/ws/rest/v1/session`

**Purpose:** Authenticate with OpenMRS and establish a session

**Authentication:** Basic Auth (username:password)

**Headers:**
```
Authorization: Basic <base64(username:password)>
Content-Type: application/json
```

**Response:**
```json
{
  "authenticated": true,
  "user": {
    "uuid": "...",
    "display": "admin",
    ...
  }
}
```

### 2. Patient Search
**Endpoint:** `GET /openmrs/ws/rest/v1/patient?q={email}&limit=1&v=default`

**Purpose:** Search for patients by email address

**Parameters:**
- `q`: Email address to search for (URL encoded)
- `limit`: Maximum number of results (default: 1)
- `v`: Representation format (`default` for default representation)

**Authentication:** Basic Auth

**Response:**
```json
{
  "results": [
    {
      "uuid": "patient-uuid",
      "display": "Patient Name",
      ...
    }
  ]
}
```

### 3. Patient Details
**Endpoint:** `GET /openmrs/ws/rest/v1/patient/{uuid}?v=full`

**Purpose:** Get complete patient information including person attributes

**Parameters:**
- `uuid`: Patient UUID
- `v`: Representation format (`full` for complete data)

**Authentication:** Basic Auth

**Response:**
```json
{
  "uuid": "patient-uuid",
  "display": "Patient Name",
  "person": {
    "uuid": "person-uuid",
    "display": "Patient Name",
    "gender": "M",
    "birthdate": "1990-01-01",
    "names": [
      {
        "givenName": "John",
        "familyName": "Doe",
        "display": "John Doe"
      }
    ],
    "attributes": [
      {
        "attributeType": {
          "uuid": "...",
          "display": "Email"
        },
        "value": "patient@example.com"
      }
    ]
  }
}
```

## Implementation Details

### Service Layer (`openmrsService.js`)

#### Authentication
```javascript
const getAuthHeader = () => {
  const credentials = btoa(`${OPENMRS_USERNAME}:${OPENMRS_PASSWORD}`);
  return `Basic ${credentials}`;
};
```

#### Main Functions

1. **loginOpenMRS()**
   - Establishes session with OpenMRS
   - Validates credentials
   - Returns authentication status

2. **searchPatientByEmail(email)**
   - Authenticates with OpenMRS
   - Searches for patient by email
   - Fetches full patient details
   - Returns formatted patient data

3. **getPatientDetails(uuid)**
   - Fetches complete patient information
   - Includes person attributes (email, etc.)
   - Returns full patient object

4. **formatPatientData(patient)**
   - Extracts relevant patient information
   - Calculates age from birthdate
   - Extracts email from person attributes
   - Formats data for display

5. **getPatientEmail(patient)**
   - Searches person attributes for email
   - Handles different email attribute types
   - Returns email or null

6. **calculateAge(birthdate)**
   - Calculates age from birthdate
   - Handles date calculations correctly
   - Returns age in years

### Component Layer

#### PatientCard Component

**Props:**
- `patientData`: Formatted patient data object
- `loading`: Boolean indicating loading state
- `error`: Error message string (if any)

**Features:**
- Responsive design with Tailwind CSS
- Loading skeleton animation
- Error state display
- Clean card layout with rounded corners and shadows
- Displays: Name, Gender, Age, Email, UUID

**States:**
1. **Loading**: Shows skeleton loader
2. **Error**: Displays error message with icon
3. **Success**: Shows patient information card
4. **Empty**: Shows "No patient data" message

### App Integration

#### Flow in App.js

1. **Google Login Success**
   ```javascript
   handleLoginSuccess(credentialResponse) {
     // Decode JWT token
     const decoded = jwtDecode(credentialResponse.credential);
     setUser(decoded);
     
     // Fetch patient data from OpenMRS using test email
     await fetchPatientData(TEST_PATIENT_EMAIL);
   }
   ```
   
   **Note:** The application uses a hardcoded test email (`test@gmail.com`) defined as `TEST_PATIENT_EMAIL` constant, instead of the Google login email (`decoded.email`).

2. **Patient Data Fetching**
   ```javascript
   fetchPatientData(email) {
     setLoading(true);
     const result = await searchPatientByEmail(email);
     if (result.success) {
       setPatientData(formatPatientData(result.patient));
     } else {
       setError(result.error);
     }
     setLoading(false);
   }
   ```

3. **State Management**
   - `user`: Google user information
   - `patientData`: Formatted patient data
   - `loading`: Loading state
   - `error`: Error message

## Data Flow

### Patient Data Structure

**Input (OpenMRS API):**
```json
{
  "uuid": "abc-123-def",
  "person": {
    "gender": "M",
    "birthdate": "1990-01-01",
    "names": [{"givenName": "John", "familyName": "Doe"}],
    "attributes": [{"value": "john@example.com"}]
  }
}
```

**Output (Formatted):**
```javascript
{
  name: "John Doe",
  gender: "Male",
  age: "34 years",
  uuid: "abc-123-def",
  email: "john@example.com",
  birthdate: "1990-01-01"
}
```

## Error Handling

### Error Types

1. **Network Errors**
   - CORS issues
   - Connection failures
   - Timeout errors

2. **Authentication Errors**
   - Invalid credentials (401)
   - Access forbidden (403)
   - Session expired

3. **Data Errors**
   - Patient not found (404)
   - Invalid email format
   - Missing patient data

4. **Processing Errors**
   - JSON parsing errors
   - Missing required fields
   - Date calculation errors

### Error Messages

The service provides user-friendly error messages:

- **Network Error**: "Network error: Unable to connect to OpenMRS. Please check CORS settings or network connectivity."
- **CORS Error**: "CORS error: The OpenMRS server may not allow requests from this origin."
- **Auth Error**: "Authentication failed: Invalid OpenMRS credentials"
- **Not Found**: "Patient not found with the provided email"
- **Forbidden**: "Access forbidden: Insufficient permissions"

## Styling

### Tailwind CSS Configuration

The patient card uses Tailwind CSS for styling:

- **Container**: `max-w-md mx-auto` - Centered, max-width card
- **Card**: `bg-white rounded-lg shadow-lg` - White background, rounded corners, shadow
- **Typography**: Various text sizes and weights
- **Colors**: Blue theme for primary actions, red for errors
- **Spacing**: Consistent padding and margins
- **Responsive**: Mobile-friendly design

### Design Features

- Gradient background (blue to indigo)
- White card with shadow and hover effects
- Rounded corners (lg)
- Icon indicators
- Badge for gender display
- Monospace font for UUID
- Responsive layout

## Security Considerations

### Credentials Management

1. **Basic Authentication**
   - Credentials are base64 encoded
   - Sent in Authorization header
   - Not stored in browser storage

2. **Environment Variables**
   - Use environment variables for credentials
   - Never commit credentials to version control
   - Use different credentials for dev/prod

3. **CORS**
   - OpenMRS server must allow requests from your origin
   - Configure CORS headers on OpenMRS server
   - Consider using a backend proxy for production

### Best Practices

1. **Never expose credentials in client-side code**
2. **Use HTTPS for all API calls**
3. **Validate and sanitize user input**
4. **Handle errors gracefully**
5. **Log errors for debugging (not credentials)**
6. **Use backend proxy for production (recommended)**

## Troubleshooting

### Common Issues

#### 1. CORS Errors

**Symptom:**
```
Access to fetch at 'https://openmrs6.arogya.cloud/...' from origin 'http://localhost:3000' 
has been blocked by CORS policy
```

**Solutions:**
- Configure CORS on OpenMRS server to allow your origin
- Use a backend proxy to forward requests
- Use a browser extension for development (not recommended for production)

**OpenMRS CORS Configuration:**
Add to OpenMRS configuration:
```properties
# Allow CORS from your domain
rest.allowedOrigins=http://localhost:3000,https://yourdomain.com
```

#### 2. Authentication Failures

**Symptom:**
```
Authentication failed: Invalid OpenMRS credentials
```

**Solutions:**
- Verify username and password are correct
- Check if account is active
- Verify Basic Auth is enabled in OpenMRS
- Check OpenMRS logs for authentication errors

#### 3. Patient Not Found

**Symptom:**
```
Patient not found with the provided email
```

**Solutions:**
- Verify patient with email `test@gmail.com` exists in OpenMRS
- Check if email is stored as a person attribute
- Verify email format matches exactly (`test@gmail.com`)
- Check if patient search is enabled
- Verify email attribute type is configured
- Note: The application always searches for `test@gmail.com`, not the Google login email

#### 4. Network Errors

**Symptom:**
```
Network error: Unable to connect to OpenMRS
```

**Solutions:**
- Check network connectivity
- Verify OpenMRS server is accessible
- Check firewall settings
- Verify URL is correct
- Check if server is running

#### 5. Missing Patient Data

**Symptom:**
Patient card shows "Not available" for some fields

**Solutions:**
- Verify patient has complete data in OpenMRS
- Check if person attributes are configured
- Verify birthdate is set for age calculation
- Check if name fields are populated

### Debugging Tips

1. **Check Browser Console**
   - Look for error messages
   - Check network tab for API calls
   - Verify request/response headers

2. **Verify API Endpoints**
   - Test endpoints directly with Postman/curl
   - Verify authentication works
   - Check response format

3. **Check OpenMRS Logs**
   - Look for authentication errors
   - Check for API errors
   - Verify patient search is working

4. **Test with Known Data**
   - Use a patient email you know exists
   - Verify patient has all required fields
   - Check if email attribute is set

## Testing

### Manual Testing Steps

1. **Start Development Server**
   ```bash
   npm start
   ```

2. **Login with Google**
   - Use any Google account (email doesn't need to match patient)
   - Verify login succeeds

3. **Verify OpenMRS Authentication**
   - Check browser console for "OpenMRS login successful"
   - Verify no authentication errors

4. **Verify Patient Search**
   - Check browser console for patient search results
   - Verify patient with email `test@gmail.com` is found in OpenMRS
   - Note: The application searches for `test@gmail.com` regardless of Google login email

5. **Verify Patient Display**
   - Check patient card displays correctly
   - Verify all fields are populated
   - Check responsive design

### Test Cases

1. **Successful Login and Patient Fetch**
   - Google login succeeds
   - OpenMRS authentication succeeds
   - Patient is found
   - Patient data displays correctly

2. **Patient Not Found**
   - Google login succeeds
   - OpenMRS authentication succeeds
   - Patient is not found
   - Error message displays correctly

3. **Authentication Failure**
   - Google login succeeds
   - OpenMRS authentication fails
   - Error message displays correctly

4. **Network Error**
   - Google login succeeds
   - Network request fails
   - Error message displays correctly

5. **CORS Error**
   - Google login succeeds
   - CORS error occurs
   - Error message displays correctly

## Deployment

### Production Considerations

1. **Backend Proxy (Recommended)**
   - Create a backend API to proxy OpenMRS requests
   - Store credentials on backend
   - Handle authentication on backend
   - Avoid CORS issues

2. **Environment Variables**
   - Use environment variables for configuration
   - Different values for dev/staging/prod
   - Never commit credentials

3. **Error Handling**
   - User-friendly error messages
   - Log errors for debugging
   - Don't expose sensitive information

4. **Security**
   - Use HTTPS for all requests
   - Validate and sanitize input
   - Implement rate limiting
   - Monitor for suspicious activity

### Backend Proxy Example

If you need to use a backend proxy, create an API endpoint:

```javascript
// Backend API endpoint
app.get('/api/patient/:email', async (req, res) => {
  try {
    // Authenticate with OpenMRS
    // Search for patient
    // Return patient data
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

Then update the frontend service to call your backend:

```javascript
export const searchPatientByEmail = async (email) => {
  const response = await fetch(`/api/patient/${email}`);
  return await response.json();
};
```

## API Reference

### openmrsService.js

#### Functions

**loginOpenMRS()**
- Returns: `Promise<{success: boolean, data?: object, error?: string}>`
- Authenticates with OpenMRS server

**searchPatientByEmail(email: string)**
- Parameters: `email` - Patient email address
- Returns: `Promise<{success: boolean, patient?: object, error?: string}>`
- Searches for patient by email and returns patient data

**formatPatientData(patient: object)**
- Parameters: `patient` - Patient object from OpenMRS
- Returns: `{name: string, gender: string, age: string, uuid: string, email: string, birthdate: string}`
- Formats patient data for display

**getPatientEmail(patient: object)**
- Parameters: `patient` - Patient object from OpenMRS
- Returns: `string | null` - Patient email or null
- Extracts email from person attributes

**calculateAge(birthdate: string)**
- Parameters: `birthdate` - Birthdate in YYYY-MM-DD format
- Returns: `number | null` - Age in years or null
- Calculates age from birthdate

### PatientCard Component

#### Props

- `patientData?: object` - Formatted patient data
- `loading: boolean` - Loading state
- `error?: string` - Error message

#### Returns

- React component displaying patient information

## Future Enhancements

### Potential Improvements

1. **Backend Integration**
   - Move OpenMRS calls to backend
   - Implement session management
   - Add caching for patient data

2. **Additional Patient Data**
   - Display more patient information
   - Add patient photo
   - Show medical history
   - Display appointments

3. **Search Functionality**
   - Allow manual patient search
   - Search by name, ID, or other criteria
   - Multiple search options

4. **Error Recovery**
   - Retry failed requests
   - Offline support
   - Better error messages

5. **Performance**
   - Cache patient data
   - Lazy loading
   - Optimize API calls

## Resources

### OpenMRS Documentation
- [OpenMRS REST API Documentation](https://rest.openmrs.org/)
- [OpenMRS REST WS Module](https://wiki.openmrs.org/display/docs/REST+Web+Services+Module)
- [OpenMRS Authentication](https://wiki.openmrs.org/display/docs/Authentication)

### Related Documentation
- [Google OAuth Setup](./GOOGLE_OAUTH_SETUP.md)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [React Documentation](https://react.dev/)

## Support

For issues or questions:
1. Check this documentation
2. Review OpenMRS REST API documentation
3. Check browser console for errors
4. Verify OpenMRS server configuration
5. Test API endpoints directly

---

**Last Updated:** 2024
**Version:** 1.0.0
**Author:** Development Team

