import React from 'react';
import RegisterForm from '../components/auth/RegisterForm';

export const RegisterPage: React.FC = () => {
  return (
    <main style={{ maxWidth: '460px', margin: '3.5rem auto', padding: '0 1.5rem' }}>
      <section className="glass-panel" style={{ padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <span style={{ fontSize: '2.5rem' }}>🌿</span>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, marginTop: '0.5rem', color: '#f0fdf4' }}>
            Join WildBugs
          </h1>
          <p style={{ color: '#a7f3d0', fontSize: '0.95rem', marginTop: '0.25rem' }}>
            Create an observer profile to map regional biodiversity
          </p>
        </div>
        <RegisterForm />
      </section>
    </main>
  );
};

export default RegisterPage;
