import React from 'react';
import RegisterForm from '../components/auth/RegisterForm';

export const RegisterPage: React.FC = () => {
  return (
    <main className="auth-page-wrapper">
      <section className="glass-panel auth-card">
        <div className="auth-header">
          <span className="auth-header-icon">🌿</span>
          <h1 className="auth-title">Join WildBugs</h1>
          <p className="auth-subtitle">
            Create an observer profile to map regional biodiversity
          </p>
        </div>
        <RegisterForm />
      </section>
    </main>
  );
};

export default RegisterPage;
