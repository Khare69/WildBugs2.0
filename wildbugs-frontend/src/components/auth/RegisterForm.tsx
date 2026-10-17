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

    const trimmedName = displayName.trim();
    if (trimmedName.length < 2) {
      setError('Display name must be at least 2 characters long.');
      return;
    }

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
      await register(email.trim(), password, trimmedName);
      navigate('/');
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Registration failed. Please try again.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      {error && (
        <div className="form-error-banner" role="alert">
          {error}
        </div>
      )}

      <div className="form-group">
        <label htmlFor="register-name" className="form-label">
          Display Name
        </label>
        <input
          id="register-name"
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Field Entomologist"
          required
          minLength={2}
          maxLength={50}
          className="form-input"
          autoComplete="name"
        />
      </div>

      <div className="form-group">
        <label htmlFor="register-email" className="form-label">
          Email Address
        </label>
        <input
          id="register-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="entomologist@wildbugs.org"
          required
          className="form-input"
          autoComplete="email"
        />
      </div>

      <div className="form-group">
        <label htmlFor="register-password" className="form-label">
          Password (min 8 characters)
        </label>
        <input
          id="register-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
          minLength={8}
          className="form-input"
          autoComplete="new-password"
        />
      </div>

      <div className="form-group">
        <label htmlFor="register-confirm" className="form-label">
          Confirm Password
        </label>
        <input
          id="register-confirm"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="••••••••"
          required
          minLength={8}
          className="form-input"
          autoComplete="new-password"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="form-submit-btn"
      >
        {isLoading ? 'Creating Account...' : 'Register'}
      </button>

      <p className="form-footer-prompt">
        Already have an account?{' '}
        <Link to="/login" className="form-footer-link">
          Sign In
        </Link>
      </p>
    </form>
  );
};

export default RegisterForm;
