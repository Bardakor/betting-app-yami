import React, { useState } from 'react';
import { api } from '../services/api';

const Login = ({ onLogin }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleLogin = () => {
    // Redirect to Google OAuth
    window.location.href = `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001'}/auth/google`;
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001'}/auth/demo-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success && data.token) {
        localStorage.setItem('token', data.token);
        onLogin(data.user);
      } else {
        throw new Error(data.message || 'Demo login failed');
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTokenLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Check if there's a token in the URL (from OAuth callback)
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');
      
      if (token) {
        localStorage.setItem('token', token);
        const userData = await api.auth.getProfile();
        onLogin(userData);
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    } catch (error) {
      setError('Login failed. Please try again.');
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  // Check for token on component mount
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    
    if (token) {
      handleTokenLogin(new Event('submit'));
    }
  }, []);

  return (
    <div className="login-container" style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <div className="card" style={{ maxWidth: '400px', width: '100%' }}>
        <div className="card-header">
          <h1 className="card-title" style={{ textAlign: 'center' }}>
            🎲 Mini Betting Platform
          </h1>
          <p style={{ textAlign: 'center', color: '#666', margin: '0.5rem 0 0 0' }}>
            Sign in to start betting
          </p>
        </div>

        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        <div style={{ textAlign: 'center' }}>
          <button
            onClick={handleDemoLogin}
            disabled={loading}
            className="btn btn-success"
            style={{
              width: '100%',
              padding: '1rem',
              fontSize: '1.1rem',
              marginBottom: '1rem'
            }}
          >
            {loading ? 'Signing in...' : '🎮 Demo Login (No OAuth needed)'}
          </button>

          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="btn btn-primary"
            style={{
              width: '100%',
              padding: '1rem',
              fontSize: '1.1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {loading ? 'Signing in...' : 'Continue with Google'}
          </button>

          <div style={{ margin: '2rem 0', color: '#666' }}>
            <hr style={{ margin: '1rem 0' }} />
            <p style={{ margin: 0, fontSize: '0.9rem' }}>
              Use Demo Login for testing or set up Google OAuth for production
            </p>
          </div>

          <div style={{ fontSize: '0.8rem', color: '#888', lineHeight: '1.4' }}>
            <p>By signing in, you agree to our terms of service.</p>
            <p>Your data is protected and secure.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
