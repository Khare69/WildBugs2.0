import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export const LoginForm: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    try {
      setIsLoading(true);
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Login failed. Please check your credentials.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {error && (
        <div style={{
          padding: '0.75rem 1rem',
          borderRadius: '8px',
          background: 'rgba(239, 68, 68, 0.15)',
          border: '1px solid rgba(239, 68, 68, 0.35)',
          color: '#fca5a5',
          fontSize: '0.9rem',
        }}>
          {error}
        </div>
      )}

      <div>
        <label htmlFor="login-email" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#a7f3d0', marginBottom: '0.5rem' }}>
          Email Address
        </label>
        <input
          id="login-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="field.observer@wildbugs.org"
          required
          style={{
            width: '100%',
            padding: '0.75rem 1rem',
            borderRadius: '10px',
            background: 'rgba(0, 0, 0, 0.4)',
            border: '1px solid rgba(52, 211, 153, 0.25)',
            color: '#f0fdf4',
            fontSize: '1rem',
            outline: 'none',
            transition: 'border-color 0.2s',
          }}
        />
      </div>

      <div>
        <label htmlFor="login-password" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#a7f3d0', marginBottom: '0.5rem' }}>
          Password
        </label>
        <input
          id="login-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
          style={{
            width: '100%',
            padding: '0.75rem 1rem',
            borderRadius: '10px',
            background: 'rgba(0, 0, 0, 0.4)',
            border: '1px solid rgba(52, 211, 153, 0.25)',
            color: '#f0fdf4',
            fontSize: '1rem',
            outline: 'none',
            transition: 'border-color 0.2s',
          }}
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        style={{
          marginTop: '0.5rem',
          padding: '0.85rem',
          borderRadius: '10px',
          background: isLoading ? '#065f46' : '#10b981',
          color: '#ffffff',
          fontWeight: 600,
          fontSize: '1rem',
          border: 'none',
          boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)',
          transition: 'all 0.2s',
        }}
      >
        {isLoading ? 'Signing In...' : 'Sign In'}
      </button>

      <p style={{ textAlign: 'center', fontSize: '0.9rem', color: '#6ee7b7', marginTop: '0.5rem' }}>
        Don't have an account?{' '}
        <Link to="/register" style={{ color: '#34d399', fontWeight: 600, textDecoration: 'underline' }}>
          Create an Account
        </Link>
      </p>
    </form>
  );
};

export default LoginForm;
