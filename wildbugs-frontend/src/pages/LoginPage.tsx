import React, { useState, useEffect } from 'react';
import LoginForm from '../components/auth/LoginForm';

export const LoginPage: React.FC = () => {
  const [flashNotice, setFlashNotice] = useState<string | null>(null);

  useEffect(() => {
    const notice = sessionStorage.getItem('auth_flash_message');
    if (notice) {
      setFlashNotice(notice);
      sessionStorage.removeItem('auth_flash_message');
    }
  }, []);

  return (
    <main className="auth-page-wrapper">
      <section className="glass-panel auth-card">
        {flashNotice && (
          <div
            style={{
              padding: '10px 14px',
              marginBottom: '16px',
              borderRadius: '8px',
              backgroundColor: 'rgba(245, 158, 11, 0.15)',
              border: '1px solid rgba(245, 158, 11, 0.4)',
              color: '#f59e0b',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span>⚠️</span>
            <span>{flashNotice}</span>
          </div>
        )}
        <div className="auth-header">
          <span className="auth-header-icon">🪲</span>
          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-subtitle">
            Access your field observations, map pins, and earned badges
          </p>
        </div>
        <LoginForm />
      </section>
    </main>
  );
};

export default LoginPage;
