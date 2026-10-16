import React from 'react';
import LoginForm from '../components/auth/LoginForm';

export const LoginPage: React.FC = () => {
  return (
    <main style={{ maxWidth: '460px', margin: '4rem auto', padding: '0 1.5rem' }}>
      <section className="glass-panel" style={{ padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <span style={{ fontSize: '2.5rem' }}>🪲</span>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, marginTop: '0.5rem', color: '#f0fdf4' }}>
            Welcome Back
          </h1>
          <p style={{ color: '#a7f3d0', fontSize: '0.95rem', marginTop: '0.25rem' }}>
            Access your field observations, map pins, and earned badges
          </p>
        </div>
        <LoginForm />
      </section>
    </main>
  );
};

export default LoginPage;
