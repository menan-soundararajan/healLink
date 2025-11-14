// Use proxy server in development to avoid CORS issues
// In production (Vercel), use the serverless function at /api/openmrs
// Note: window is not available during SSR, so we check it safely
const isVercel = typeof window !== 'undefined' && (
  window.location.hostname.includes('vercel.app') || 
  process.env.NODE_ENV === 'production'
);
const USE_PROXY = process.env.REACT_APP_USE_PROXY !== 'false'; // Default to true

// Determine proxy URL based on environment
let PROXY_URL;
if (isVercel) {
  // Use Vercel serverless function in production
  PROXY_URL = '/api/openmrs';
} else {
  // Use local proxy server in development
  PROXY_URL = process.env.REACT_APP_PROXY_URL || 'http://localhost:3001/api/openmrs';
}

// OpenMRS Server Configuration
// Base URL: https://openmrs6.arogya.cloud
// SPA Login URL: https://openmrs6.arogya.cloud/openmrs/spa/login (web interface, not used by API)
// REST API Base: https://openmrs6.arogya.cloud/openmrs/ws/rest/v1/
const OPENMRS_BASE_URL = USE_PROXY ? PROXY_URL : 'https://openmrs6.arogya.cloud';
const OPENMRS_USERNAME = 'admin';
const OPENMRS_PASSWORD = 'Admin123';

// Note: When using proxy, authentication is handled by the proxy server
// So we don't need to send auth headers from the client
const USE_PROXY_AUTH = USE_PROXY;

/**
 * Authenticate with OpenMRS and get session token
 * OpenMRS uses basic authentication, so we'll use credentials for each request
 */
const getAuthHeader = () => {
  const credentials = btoa(`${OPENMRS_USERNAME}:${OPENMRS_PASSWORD}`);
  return `Basic ${credentials}`;
};

/**
 * Login to OpenMRS (establish session)
 * Note: OpenMRS REST API uses basic auth, but we can also establish a session
 */
export const loginOpenMRS = async () => {
  try {
    // When using proxy, request goes to /api/openmrs/ws/rest/v1/session
    // Proxy rewrites it to /openmrs/ws/rest/v1/session
    // When not using proxy, request goes directly to /openmrs/ws/rest/v1/session
    const url = USE_PROXY 
      ? `${OPENMRS_BASE_URL}/ws/rest/v1/session`
      : `${OPENMRS_BASE_URL}/openmrs/ws/rest/v1/session`;
    
    const headers = {
      'Content-Type': 'application/json',
    };
    
    // Only add auth header if not using proxy (proxy handles auth)
    if (!USE_PROXY_AUTH) {
      headers['Authorization'] = getAuthHeader();
    }
    
    // Use openmrsFetch wrapper for global loading state
    const { openmrsFetch } = await import('../utils/openmrsFetch');
    const result = await openmrsFetch(url, {
      method: 'GET',
      headers: headers,
    });

    const data = result.data;
    console.log('OpenMRS login successful:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Error logging into OpenMRS:', error);
    console.error('Error details:', {
      message: error.message,
      useProxy: USE_PROXY,
      url: USE_PROXY 
        ? `${OPENMRS_BASE_URL}/ws/rest/v1/session`
        : `${OPENMRS_BASE_URL}/openmrs/ws/rest/v1/session`
    });
    
    let errorMessage = error.message;
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      if (USE_PROXY) {
        errorMessage = `Cannot connect to proxy server at ${PROXY_URL}. Please start the proxy server: npm run server (or npm run dev to run both servers)`;
      } else {
        errorMessage = 'Unable to connect to OpenMRS server. Please check your network connection or use the proxy server.';
      }
    } else if (error.message.includes('ECONNREFUSED') || error.message.includes('ERR_CONNECTION_REFUSED')) {
      errorMessage = `Connection refused: Cannot connect to ${USE_PROXY ? 'proxy server' : 'OpenMRS server'}. ${USE_PROXY ? 'Please start the proxy server with: npm run server' : 'Please check if OpenMRS server is running'}.`;
    }
    return { success: false, error: errorMessage };
  }
};

/**
 * Search for patient by email
 * @param {string} email - Patient email to search for
 * @returns {Promise} Patient data or error
 */
export const searchPatientByEmail = async (email) => {
  try {
    // First, ensure we're authenticated
    await loginOpenMRS();

    // When using proxy, request goes to /api/openmrs/ws/rest/v1/patient
    // Proxy rewrites it to /openmrs/ws/rest/v1/patient
    // When not using proxy, request goes directly to /openmrs/ws/rest/v1/patient
    const url = USE_PROXY
      ? `${OPENMRS_BASE_URL}/ws/rest/v1/patient?q=${encodeURIComponent(email)}&limit=1&v=default`
      : `${OPENMRS_BASE_URL}/openmrs/ws/rest/v1/patient?q=${encodeURIComponent(email)}&limit=1&v=default`;
    
    const headers = {
      'Content-Type': 'application/json',
    };
    
    // Only add auth header if not using proxy (proxy handles auth)
    if (!USE_PROXY_AUTH) {
      headers['Authorization'] = getAuthHeader();
    }

    // Use openmrsFetch wrapper for global loading state
    const { openmrsFetch } = await import('../utils/openmrsFetch');
    const result = await openmrsFetch(url, {
      method: 'GET',
      headers: headers,
    });

    const data = result.data;
    
    // Check if results array is empty or null
    if (!data.results || data.results.length === 0) {
      return {
        success: false,
        error: 'User not registered',
        patient: null,
      };
    }
    
    // Patient found - fetch full patient details
    const patient = data.results[0];
    const patientDetails = await getPatientDetails(patient.uuid);
    
    return {
      success: true,
      patient: patientDetails || patient,
    };
  } catch (error) {
    console.error('Error searching for patient:', error);
    
    // Handle specific error types
    let errorMessage = error.message;
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      if (USE_PROXY) {
        errorMessage = `Network error: Unable to connect to proxy server at ${PROXY_URL}. Please make sure the proxy server is running (npm run server or npm run dev).`;
      } else {
        errorMessage = 'Network error: Unable to connect to OpenMRS. Please check CORS settings or network connectivity. Consider using the proxy server.';
      }
    } else if (error.message.includes('CORS')) {
      errorMessage = 'CORS error: The OpenMRS server may not allow requests from this origin. Please use the proxy server (npm run server).';
    } else if (error.message.includes('ECONNREFUSED') || error.message.includes('ERR_CONNECTION_REFUSED')) {
      errorMessage = `Connection refused: Cannot connect to ${USE_PROXY ? 'proxy server' : 'OpenMRS server'}. Please ensure the ${USE_PROXY ? 'proxy server is running (npm run server)' : 'OpenMRS server is accessible'}.`;
    }
    
    return {
      success: false,
      error: errorMessage,
      patient: null,
    };
  }
};

/**
 * Get detailed patient information
 * @param {string} uuid - Patient UUID
 * @returns {Promise} Patient details
 */
const getPatientDetails = async (uuid) => {
  try {
    // When using proxy, request goes to /api/openmrs/ws/rest/v1/patient/{uuid}
    // Proxy rewrites it to /openmrs/ws/rest/v1/patient/{uuid}
    // When not using proxy, request goes directly to /openmrs/ws/rest/v1/patient/{uuid}
    const url = USE_PROXY
      ? `${OPENMRS_BASE_URL}/ws/rest/v1/patient/${uuid}?v=full`
      : `${OPENMRS_BASE_URL}/openmrs/ws/rest/v1/patient/${uuid}?v=full`;
    
    const headers = {
      'Content-Type': 'application/json',
    };
    
    // Only add auth header if not using proxy (proxy handles auth)
    if (!USE_PROXY_AUTH) {
      headers['Authorization'] = getAuthHeader();
    }
    
    const { openmrsFetch } = await import('../utils/openmrsFetch');
    const result = await openmrsFetch(url, {
      method: 'GET',
      headers: headers,
    });

    return result.data;
  } catch (error) {
    console.error('Error fetching patient details:', error);
    return null;
  }
};

/**
 * Extract email from patient person attributes
 * @param {Object} patient - Patient object
 * @returns {string|null} Email address or null
 */
export const getPatientEmail = (patient) => {
  if (!patient || !patient.person || !patient.person.attributes) {
    return null;
  }

  const emailAttribute = patient.person.attributes.find(
    attr => attr.attributeType && (
      attr.attributeType.display === 'Email' ||
      attr.attributeType.uuid === '58f43b5e-5311-4512-b0d4-24a2a7f3a4e2' ||
      attr.attributeType.display?.toLowerCase().includes('email')
    )
  );

  return emailAttribute ? emailAttribute.value : null;
};

/**
 * Calculate age from birthdate
 * @param {string} birthdate - Birthdate in YYYY-MM-DD format
 * @returns {number|null} Age in years or null
 */
export const calculateAge = (birthdate) => {
  if (!birthdate) return null;
  
  const birth = new Date(birthdate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
};

/**
 * Format patient data for display
 * @param {Object} patient - Patient object from OpenMRS
 * @returns {Object} Formatted patient data
 */
export const formatPatientData = (patient) => {
  if (!patient) return null;

  const person = patient.person || patient;
  const names = person.names && person.names[0];
  const givenName = names?.givenName || '';
  const familyName = names?.familyName || '';
  const displayName = names?.display || `${givenName} ${familyName}`.trim() || 'Unknown';
  
  const gender = person.gender || 'Unknown';
  const birthdate = person.birthdate || null;
  const age = birthdate ? calculateAge(birthdate) : null;
  const uuid = patient.uuid || 'N/A';
  const email = getPatientEmail(patient);

  return {
    name: displayName,
    gender: gender.charAt(0).toUpperCase() + gender.slice(1),
    age: age !== null ? `${age} years` : 'Unknown',
    uuid: uuid,
    email: email || 'Not available',
    birthdate: birthdate,
  };
};

