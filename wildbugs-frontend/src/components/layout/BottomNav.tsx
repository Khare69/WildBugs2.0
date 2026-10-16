import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export const BottomNav: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <nav className="mobile-bottom-nav" aria-label="Mobile Bottom Navigation">
      <NavLink
        to="/"
        end
        className={({ isActive }) => `bottom-nav-item ${isActive ? 'bottom-nav-active' : ''}`}
      >
        <span className="bottom-nav-icon">🏠</span>
        <span className="bottom-nav-label">Home</span>
      </NavLink>

      <NavLink
        to="/species"
        className={({ isActive }) => `bottom-nav-item ${isActive ? 'bottom-nav-active' : ''}`}
      >
        <span className="bottom-nav-icon">🐞</span>
        <span className="bottom-nav-label">Catalog</span>
      </NavLink>

      <NavLink
        to={isAuthenticated ? '/species' : '/login'}
        className={({ isActive }) => `bottom-nav-item ${isActive ? 'bottom-nav-active' : ''}`}
      >
        <span className="bottom-nav-icon">{isAuthenticated ? '👤' : '🔑'}</span>
        <span className="bottom-nav-label">{isAuthenticated ? 'Account' : 'Sign In'}</span>
      </NavLink>
    </nav>
  );
};

export default BottomNav;
