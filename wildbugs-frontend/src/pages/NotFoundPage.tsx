import React from 'react';
import { Link } from 'react-router-dom';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="not-found-page">
      <div className="glass-panel not-found-card">
        <span className="not-found-badge">404</span>
        <h1 className="not-found-title">Specimen Not Found</h1>
        <p className="not-found-text">
          The ecological habitat or specimen page you are looking for does not exist in our field records.
        </p>
        <Link to="/" className="btn-primary">
          Return to Field Base →
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
