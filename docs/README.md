# Documentation

This folder contains comprehensive documentation for the React application with Google OAuth and OpenMRS integration.

## Documentation Files

### 1. [Quick Start Guide](./QUICK_START.md)
Quick setup guide for getting started with the application.

**Contents:**
- Prerequisites
- Step-by-step setup
- Testing instructions
- Quick troubleshooting
- Next steps

### 2. [Google OAuth Setup](./GOOGLE_OAUTH_SETUP.md)
Complete guide for setting up Google OAuth authentication in the application.

**Contents:**
- Overview and architecture
- Google Cloud Console setup
- Component details
- Configuration steps
- Security considerations
- Troubleshooting guide
- API reference

### 3. [OpenMRS Integration](./OPENMRS_INTEGRATION.md)
Detailed documentation for OpenMRS REST API integration and patient data fetching.

**Contents:**
- Architecture and flow diagrams
- API endpoints documentation
- Implementation details
- Error handling
- Security considerations
- Troubleshooting guide
- Testing procedures
- Deployment guidelines

### 3a. [OpenMRS URLs Reference](./OPENMRS_URLS.md)
Complete reference of all OpenMRS server URLs and endpoints.

**Contents:**
- Base URLs and server information
- Web interface URLs (SPA login)
- REST API endpoints
- Authentication methods
- Proxy server URLs
- Request examples
- Important notes about SPA vs REST API

### 4. [CORS Proxy Setup](./CORS_PROXY_SETUP.md)
Complete guide for setting up and using the proxy server to resolve CORS issues.

**Contents:**
- CORS problem explanation
- Proxy server setup
- Configuration options
- Troubleshooting
- Production deployment
- Security considerations

### 5. [Implementation Summary](./IMPLEMENTATION_SUMMARY.md)
Summary of the complete implementation including architecture, features, and components.

**Contents:**
- Implementation overview
- Files created and modified
- Architecture details
- Data flow
- Configuration
- Dependencies
- Testing
- Deployment considerations

### 6. [Health Advisory LLM Feature](./HEALTH_ADVISORY_LLM.md)
Complete documentation for the AI-powered Health Advisory feature.

**Contents:**
- Feature overview and description
- Condition checking logic
- LLM integration and configuration
- Setup instructions
- UI design and styling
- Error handling
- Troubleshooting guide
- Customization options

### 7. [LLM API Configuration](./LLM_CONFIGURATION.md)
Complete guide for configuring LLM (Large Language Model) API integration.

**Contents:**
- Supported providers (OpenAI, Anthropic, Custom)
- Step-by-step setup instructions
- Environment variables reference
- Provider-specific configuration
- Production deployment (Vercel)
- Testing and troubleshooting
- Security best practices
- Cost considerations

## Quick Start

For a quick setup, see the [Quick Start Guide](./QUICK_START.md).

### Detailed Setup

### Setup Google OAuth
1. Read [Google OAuth Setup](./GOOGLE_OAUTH_SETUP.md)
2. Create Google Cloud Console project
3. Configure OAuth credentials
4. Set up environment variables

### Setup OpenMRS Integration
1. Read [OpenMRS Integration](./OPENMRS_INTEGRATION.md)
2. Configure OpenMRS server settings
3. Verify API endpoints are accessible
4. Test patient search functionality

## Application Flow

```
1. User visits application
   ↓
2. Google OAuth login
   ↓
3. Extract user email from JWT
   ↓
4. Authenticate with OpenMRS
   ↓
5. Search for patient by email
   ↓
6. Fetch patient details
   ↓
7. Display patient information
```

## Architecture Overview

### Components
- **Login Component**: Google OAuth login page
- **App Component**: Main application with authentication flow
- **PatientCard Component**: Patient information display

### Services
- **OpenMRS Service**: API integration for patient data
- **Google OAuth**: Authentication service

### Technologies
- **React**: Frontend framework
- **Tailwind CSS**: Styling framework
- **Google OAuth**: Authentication
- **OpenMRS REST API**: Patient data source

## Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Google OAuth
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id_here

# OpenMRS (optional - can be hardcoded in service)
REACT_APP_OPENMRS_BASE_URL=https://openmrs6.arogya.cloud
REACT_APP_OPENMRS_USERNAME=admin
REACT_APP_OPENMRS_PASSWORD=Admin123
```

### Required Setup

1. **Google OAuth**
   - Google Cloud Console project
   - OAuth 2.0 credentials
   - Authorized JavaScript origins
   - Environment variable configured

2. **OpenMRS**
   - OpenMRS server accessible
   - Valid credentials
   - Patient data with email attributes
   - CORS configured (if needed)

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - See [OpenMRS Integration - Troubleshooting](./OPENMRS_INTEGRATION.md#troubleshooting)

2. **Authentication Failures**
   - See [Google OAuth Setup - Troubleshooting](./GOOGLE_OAUTH_SETUP.md#troubleshooting)
   - See [OpenMRS Integration - Troubleshooting](./OPENMRS_INTEGRATION.md#troubleshooting)

3. **Patient Not Found**
   - Verify patient exists in OpenMRS
   - Check email attribute is set
   - Verify email matches exactly

### Getting Help

1. Check relevant documentation file
2. Review error messages in browser console
3. Verify configuration settings
4. Test API endpoints directly
5. Check server logs

## Development

### Prerequisites
- Node.js and npm
- Google Cloud Console account
- OpenMRS server access
- Modern web browser

### Installation
```bash
npm install
```

### Development Server
```bash
npm start
```

### Build for Production
```bash
npm run build
```

## Security Notes

1. **Never commit credentials**
   - Use environment variables
   - Keep `.env` in `.gitignore`
   - Use different credentials for dev/prod

2. **CORS Configuration**
   - Configure CORS on OpenMRS server
   - Use backend proxy for production (recommended)
   - Never disable CORS in production

3. **HTTPS**
   - Always use HTTPS in production
   - Configure SSL certificates
   - Verify secure connections

## Additional Resources

### External Documentation
- [React Documentation](https://react.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Google Identity Services](https://developers.google.com/identity/gsi/web)
- [OpenMRS REST API](https://rest.openmrs.org/)

### Internal Documentation
- [Quick Start Guide](./QUICK_START.md)
- [Google OAuth Setup](./GOOGLE_OAUTH_SETUP.md)
- [OpenMRS Integration](./OPENMRS_INTEGRATION.md)
- [OpenMRS URLs Reference](./OPENMRS_URLS.md)
- [CORS Proxy Setup](./CORS_PROXY_SETUP.md)
- [Implementation Summary](./IMPLEMENTATION_SUMMARY.md)
- [Health Advisory LLM Feature](./HEALTH_ADVISORY_LLM.md)
- [LLM API Configuration](./LLM_CONFIGURATION.md)
- [Main README](../README.md)

## Version History

### Version 1.0.0
- Initial documentation
- Google OAuth setup guide
- OpenMRS integration documentation
- Complete troubleshooting guides

---

**Last Updated:** 2024
**Maintained by:** Development Team

