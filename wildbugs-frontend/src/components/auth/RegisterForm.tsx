import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export const RegisterForm: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    try {
      setIsLoading(true);
      await register(email, password, displayName);
      navigate('/');
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Registration failed. Please try again.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
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
        <label htmlFor="register-name" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#a7f3d0', marginBottom: '0.4rem' }}>
          Display Name
        </label>
        <input
          id="register-name"
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Field Entomologist"
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
          }}
        />
      </div>

      <div>
        <label htmlFor="register-email" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#a7f3d0', marginBottom: '0.4rem' }}>
          Email Address
        </label>
        <input
          id="register-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="entomologist@wildbugs.org"
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
          }}
        />
      </div>

      <div>
        <label htmlFor="register-password" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#a7f3d0', marginBottom: '0.4rem' }}>
          Password (min 8 characters)
        </label>
        <input
          id="register-password"
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
          }}
        />
      </div>

      <div>
        <label htmlFor="register-confirm" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#a7f3d0', marginBottom: '0.4rem' }}>
          Confirm Password
        </label>
        <input
          id="register-confirm"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
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
        {isLoading ? 'Creating Account...' : 'Register'}
      </button>

      <p style={{ textAlign: 'center', fontSize: '0.9rem', color: '#6ee7b7', marginTop: '0.5rem' }}>
        Already have an account?{' '}
        <Link to="/login" style={{ color: '#34d399', fontWeight: 600, textDecoration: 'underline' }}>
          Sign In
        </Link>
      </p>
    </form>
  );
};

export default RegisterForm;
