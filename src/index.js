import React from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { OpenMRSLoadingProvider } from './contexts/OpenMRSLoadingContext';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Replace with your Google OAuth Client ID
// Get it from: https://console.cloud.google.com/apis/credentials
const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID_HERE';

// Validate Client ID
if (!GOOGLE_CLIENT_ID || 
    GOOGLE_CLIENT_ID === 'YOUR_GOOGLE_CLIENT_ID_HERE' || 
    GOOGLE_CLIENT_ID === 'your_google_client_id_here' ||
    !GOOGLE_CLIENT_ID.includes('.apps.googleusercontent.com')) {
  console.error('⚠️ Google OAuth Client ID is not configured correctly.');
  console.error('Please set REACT_APP_GOOGLE_CLIENT_ID in your .env file.');
  console.error('Get your Client ID from: https://console.cloud.google.com/apis/credentials');
  console.error('Current value:', GOOGLE_CLIENT_ID);
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <OpenMRSLoadingProvider>
        <App />
      </OpenMRSLoadingProvider>
    </GoogleOAuthProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
