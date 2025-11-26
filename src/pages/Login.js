import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../firebase/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setError('');
      setLoading(true);
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError('Failed to login. Please check your credentials.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setError('');
      setLoading(true);
      // Default to customer role for Google login
      await loginWithGoogle('customer');
      navigate('/dashboard');
    } catch (err) {
      setError('Failed to login with Google.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Login to Live MART</h2>
        
        {error && (
          <div style={{ 
            padding: '0.75rem', 
            background: '#fee2e2', 
            border: '1px solid #ef4444',
            borderRadius: '0.375rem',
            color: '#dc2626',
            marginBottom: '1rem'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              disabled={loading}
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', marginTop: '1rem' }}
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          margin: '1.5rem 0',
          gap: '1rem'
        }}>
          <div style={{ flex: 1, height: '1px', background: '#d1d5db' }}></div>
          <span style={{ color: '#6b7280' }}>OR</span>
          <div style={{ flex: 1, height: '1px', background: '#d1d5db' }}></div>
        </div>

        <button 
          onClick={handleGoogleLogin}
          className="btn btn-secondary" 
          style={{ width: '100%' }}
          disabled={loading}
        >
          🌐 Continue with Google
        </button>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', color: '#6b7280' }}>
          Don't have an account?{' '}
          <Link to="/signup" style={{ color: '#2563eb', fontWeight: 500 }}>
            Sign Up
          </Link>
        </p>

        <Link 
          to="/" 
          style={{ 
            display: 'block', 
            textAlign: 'center', 
            marginTop: '1rem',
            color: '#6b7280'
          }}
        >
          ← Back to Home
        </Link>
      </div>
    </div>
  );
};

export default Login;
