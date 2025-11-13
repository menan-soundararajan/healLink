// Vercel Serverless Function to proxy OpenMRS API requests
// This resolves CORS issues in production

export default async function handler(req, res) {
  // Only allow GET requests for now (can be extended)
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // OpenMRS server configuration
  const OPENMRS_BASE_URL = 'https://openmrs6.arogya.cloud';
  const OPENMRS_USERNAME = process.env.OPENMRS_USERNAME || 'admin';
  const OPENMRS_PASSWORD = process.env.OPENMRS_PASSWORD || 'Admin123';

  // Get the path from the request (everything after /api/openmrs/)
  const path = req.query.path || [];
  const apiPath = Array.isArray(path) ? path.join('/') : path;

  // Get query parameters (excluding 'path')
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
  const openmrsUrl = `${OPENMRS_BASE_URL}/openmrs/${apiPath}${queryString}`;

  // Create Basic Auth header
  const credentials = Buffer.from(`${OPENMRS_USERNAME}:${OPENMRS_PASSWORD}`).toString('base64');
  const authHeader = `Basic ${credentials}`;

  try {
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
    let jsonData;
    
    try {
      jsonData = JSON.parse(data);
    } catch (e) {
      // If not JSON, return as text
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
    return res.status(500).json({
      error: 'Proxy error',
      message: error.message
    });
  }
}
