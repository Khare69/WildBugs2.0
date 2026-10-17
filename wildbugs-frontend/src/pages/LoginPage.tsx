import React from 'react';
import LoginForm from '../components/auth/LoginForm';

export const LoginPage: React.FC = () => {
  return (
    <main className="auth-page-wrapper">
      <section className="glass-panel auth-card">
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
