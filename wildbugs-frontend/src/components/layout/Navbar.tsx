import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <header className="app-navbar">
      <div className="navbar-container">
        {/* Brand */}
        <Link to="/" className="navbar-brand" onClick={closeMenu}>
          <span className="brand-icon">🪲</span>
          <div className="brand-text">
            <span className="brand-name">WildBugs</span>
            <span className="brand-tag">2.0</span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="desktop-nav">
          <NavLink
            to="/"
            end
            className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}
          >
            Home
          </NavLink>
          <NavLink
            to="/species"
            className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}
          >
            Species Catalog
          </NavLink>
          <NavLink
            to="/map"
            className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}
          >
            🗺️ Biodiversity Map
          </NavLink>
          <NavLink
            to="/leaderboard"
            className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}
          >
            🏆 Leaderboard
          </NavLink>
          <NavLink
            to="/upload"
            className={({ isActive }) => `nav-link nav-link-upload ${isActive ? 'nav-link-active' : ''}`}
          >
            📸 Record Sighting
          </NavLink>
        </nav>

        {/* Auth / Profile Area */}
        <div className="navbar-auth-section">
          {isAuthenticated && user ? (
            <div className="user-profile-badge">
              <Link to="/profile" className="user-profile-link" title="View observer profile and field journal" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
                <span className="user-avatar-circle">
                  {user.displayName.charAt(0).toUpperCase()}
                </span>
                <div className="user-details-mini">
                  <span className="user-name">{user.displayName}</span>
                  <span className="user-role-chip">{user.role}</span>
                </div>
              </Link>
              <button
                type="button"
                className="btn-logout"
                onClick={handleLogout}
                title="Sign out of your session"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="auth-buttons-group">
              <Link to="/login" className="btn-nav-login">
                Sign In
              </Link>
              <Link to="/register" className="btn-nav-register">
                Register
              </Link>
            </div>
          )}

          {/* Mobile Menu Hamburger Toggle */}
          <button
            type="button"
            className="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen((open) => !open)}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="mobile-drawer">
          <NavLink
            to="/"
            end
            className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
            onClick={closeMenu}
          >
            🏠 Home
          </NavLink>
          <NavLink
            to="/species"
            className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
            onClick={closeMenu}
          >
            🐞 Species Catalog
          </NavLink>
          <NavLink
            to="/map"
            className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
            onClick={closeMenu}
          >
            🗺️ Biodiversity Map
          </NavLink>
          <NavLink
            to="/leaderboard"
            className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
            onClick={closeMenu}
          >
            🏆 Leaderboard
          </NavLink>
          <NavLink
            to="/upload"
            className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
            onClick={closeMenu}
          >
            📸 Record Sighting
          </NavLink>

          <div className="mobile-drawer-auth">
            {isAuthenticated && user ? (
              <div className="mobile-user-box">
                <Link to="/profile" onClick={closeMenu} style={{ textDecoration: 'none' }}>
                  <p className="mobile-user-greeting">Signed in as <strong>{user.displayName}</strong> 👤</p>
                </Link>
                <button type="button" className="btn-logout mobile-full-btn" onClick={handleLogout}>
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="mobile-auth-actions">
                <Link to="/login" className="btn-primary mobile-full-btn" onClick={closeMenu}>
                  Sign In
                </Link>
                <Link to="/register" className="btn-secondary mobile-full-btn" onClick={closeMenu}>
                  Create Account
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
