import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import './Login.css';

function Login({ onSuccess, onError }) {
  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">Welcome</h1>
        <p className="login-subtitle">Sign in with your Google account to continue</p>
        <div className="google-login-wrapper">
          <GoogleLogin
            onSuccess={onSuccess}
            onError={onError}
            useOneTap
          />
        </div>
      </div>
    </div>
  );
}

export default Login;

