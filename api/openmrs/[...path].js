// Vercel Serverless Function to proxy OpenMRS API requests
// This resolves CORS issues in production

export default async function handler(req, res) {
  // Handle OPTIONS for CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.status(200).end();
  }

  // Only allow GET requests for now (can be extended)
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // OpenMRS server configuration
  const OPENMRS_BASE_URL = 'https://openmrs6.arogya.cloud';
  const OPENMRS_USERNAME = process.env.OPENMRS_USERNAME || 'admin';
  const OPENMRS_PASSWORD = process.env.OPENMRS_PASSWORD || 'Admin123';

  // Get the path from the request query (Vercel catch-all route)
  // When URL is /api/openmrs/ws/rest/v1/visit, path will be ['ws', 'rest', 'v1', 'visit']
  const path = req.query.path || [];
  const apiPath = Array.isArray(path) ? path.join('/') : path;

  // If no path, return error
  if (!apiPath) {
    return res.status(400).json({ 
      error: 'Invalid request',
      message: 'No API path provided',
      query: req.query 
    });
  }

  // Get all query parameters except 'path'
  const queryParams = new URLSearchParams();
  Object.keys(req.query).forEach(key => {
    if (key !== 'path') {
      const value = req.query[key];
      if (Array.isArray(value)) {
        value.forEach(v => queryParams.append(key, v));
      } else {
        queryParams.append(key, value);
      }
    }
  });
  const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';

  // Construct the full OpenMRS URL
  // The apiPath should be like "ws/rest/v1/visit" or "ws/fhir2/R4/Condition"
  const openmrsUrl = `${OPENMRS_BASE_URL}/openmrs/${apiPath}${queryString}`;

  // Create Basic Auth header
  const credentials = Buffer.from(`${OPENMRS_USERNAME}:${OPENMRS_PASSWORD}`).toString('base64');
  const authHeader = `Basic ${credentials}`;

  try {
    // Log for debugging (remove in production if needed)
    console.log(`[Proxy] ${req.method} ${req.url}`);
    console.log(`[Proxy] Path: ${apiPath}`);
    console.log(`[Proxy] Query: ${queryString}`);
    console.log(`[Proxy] Target URL: ${openmrsUrl}`);

    // Forward the request to OpenMRS
    const response = await fetch(openmrsUrl, {
      method: req.method,
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
    });

    // Get response data
    const data = await response.text();
    
    // Log response status for debugging
    console.log(`[Proxy] Response: ${response.status} ${response.statusText}`);

    // If response is not OK, return error details
    if (!response.ok) {
      let errorData;
      try {
        errorData = JSON.parse(data);
      } catch (e) {
        errorData = { error: data };
      }
      
      // Set CORS headers even for errors
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      
      return res.status(response.status).json({
        error: 'OpenMRS API error',
        status: response.status,
        statusText: response.statusText,
        details: errorData,
        requestedUrl: openmrsUrl
      });
    }

    let jsonData;
    try {
      jsonData = JSON.parse(data);
    } catch (e) {
      // If not JSON, return as text
      res.setHeader('Access-Control-Allow-Origin', '*');
      return res.status(response.status).send(data);
    }

    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Return the response
    return res.status(response.status).json(jsonData);
  } catch (error) {
    console.error('Proxy error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      url: openmrsUrl
    });
    
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(500).json({
      error: 'Proxy error',
      message: error.message,
      url: openmrsUrl,
      path: apiPath
    });
  }
}
