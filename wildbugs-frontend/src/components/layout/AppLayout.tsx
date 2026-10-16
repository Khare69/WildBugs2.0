import React from 'react';
import Navbar from './Navbar';
import BottomNav from './BottomNav';
import { Link } from 'react-router-dom';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <div className="app-layout">
      <Navbar />

      <main className="app-main-content">
        <div className="content-container">{children}</div>
      </main>

      <footer className="app-footer">
        <div className="footer-container">
          <div className="footer-brand-col">
            <div className="footer-logo">
              <span className="logo-icon">🪲</span>
              <span className="logo-text">WildBugs 2.0</span>
            </div>
            <p className="footer-desc">
              Community-driven biodiversity intelligence platform. Documenting arthropod species,
              mapping regional biodiversity, and advancing ecological conservation.
            </p>
          </div>

          <div className="footer-links-col">
            <h4 className="footer-heading">Platform</h4>
            <ul className="footer-nav-list">
              <li>
                <Link to="/">Home & Overview</Link>
              </li>
              <li>
                <Link to="/species">Species Catalog</Link>
              </li>
              <li>
                <Link to="/register">Create Observer Account</Link>
              </li>
              <li>
                <Link to="/login">Sign In</Link>
              </li>
            </ul>
          </div>

          <div className="footer-meta-col">
            <h4 className="footer-heading">System Status</h4>
            <div className="footer-status-pill">
              <span className="status-dot" />
              <span>Phase 1 Architecture Active</span>
            </div>
            <p className="footer-notice">
              Data protected with bcryptjs & JWT in-memory store. PostGIS & AI Vision engine in Phase 2/3.
            </p>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} WildBugs. Open biodiversity science & conservation.</p>
        </div>
      </footer>

      <BottomNav />
    </div>
  );
};

export default AppLayout;
