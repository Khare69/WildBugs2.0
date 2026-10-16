import React from 'react';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import apiClient from './api/client';

// Health Check Query Hook using TanStack Query
const useApiHealth = () => {
  return useQuery({
    queryKey: ['apiHealth'],
    queryFn: async () => {
      const response = await apiClient.get('/health');
      return response.data;
    },
  });
};

const Navigation: React.FC = () => {
  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '1rem 2rem',
      background: 'rgba(10, 15, 13, 0.85)',
      backdropFilter: 'blur(10px)',
      borderBottom: '1px solid rgba(52, 211, 153, 0.15)',
      position: 'sticky',
      top: 0,
      zIndex: 50
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <span style={{ fontSize: '1.75rem' }}>🪲</span>
        <span style={{ fontSize: '1.35rem', fontWeight: 700, letterSpacing: '-0.02em', color: '#f0fdf4' }}>
          WildBugs <span style={{ color: '#10b981', fontSize: '0.9rem', verticalAlign: 'super' }}>2.0</span>
        </span>
      </div>

      <nav style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
        <NavLink 
          to="/" 
          style={({ isActive }) => ({
            color: isActive ? '#34d399' : '#d1fae5',
            fontWeight: isActive ? 600 : 400,
            transition: 'color 0.2s',
          })}
        >
          Home
        </NavLink>
        <NavLink 
          to="/species" 
          style={({ isActive }) => ({
            color: isActive ? '#34d399' : '#d1fae5',
            fontWeight: isActive ? 600 : 400,
            transition: 'color 0.2s',
          })}
        >
          Species
        </NavLink>
        <NavLink 
          to="/login" 
          style={({ isActive }) => ({
            padding: '0.45rem 1.1rem',
            borderRadius: '8px',
            backgroundColor: isActive ? '#059669' : '#10b981',
            color: '#ffffff',
            fontWeight: 600,
            transition: 'background 0.2s',
          })}
        >
          Sign In
        </NavLink>
      </nav>
    </header>
  );
};

const HomePage: React.FC = () => {
  const { data: health, isLoading, isError } = useApiHealth();

  return (
    <main style={{ maxWidth: '1000px', margin: '3rem auto', padding: '0 1.5rem' }}>
      <section className="glass-panel" style={{ padding: '3rem 2rem', textAlign: 'center', marginBottom: '2.5rem' }}>
        <div className="badge-status" style={{ marginBottom: '1.25rem' }}>
          <span className="status-dot"></span>
          Sub-Phase 1.1 Scaffold Active
        </div>

        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem', letterSpacing: '-0.03em' }}>
          Explore, Identify, and Conserve Local Insects
        </h1>
        <p style={{ fontSize: '1.15rem', color: '#a7f3d0', maxWidth: '680px', margin: '0 auto 2rem' }}>
          WildBugs is a citizen science platform linking nature observers, AI-assisted species identification,
          and interactive biodiversity mapping.
        </p>

        {/* Backend API Probe Status */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '1rem',
          padding: '0.75rem 1.5rem',
          borderRadius: '12px',
          background: 'rgba(0, 0, 0, 0.35)',
          border: '1px solid rgba(52, 211, 153, 0.2)',
          fontSize: '0.95rem'
        }}>
          <span style={{ color: '#9ca3af' }}>Backend API Status:</span>
          {isLoading && <span style={{ color: '#fbbf24' }}>Connecting...</span>}
          {isError && <span style={{ color: '#f87171' }}>Offline (Run backend on :3001)</span>}
          {health && (
            <span style={{ color: '#34d399', fontWeight: 600 }}>
              Online ({health.service})
            </span>
          )}
        </div>
      </section>

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
        <div className="glass-panel" style={{ padding: '1.75rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>📸</div>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: '#f0fdf4' }}>AI Image Vision</h3>
          <p style={{ color: '#a7f3d0', fontSize: '0.95rem' }}>
            Upload insect sightings and get species suggestions evaluated by Google Cloud Vision AI.
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '1.75rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>🗺️</div>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: '#f0fdf4' }}>Biodiversity Map</h3>
          <p style={{ color: '#a7f3d0', fontSize: '0.95rem' }}>
            Interactive geospatial heatmap powered by PostGIS and Leaflet to visualize species density.
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '1.75rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>🎖️</div>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: '#f0fdf4' }}>Badges & Streaks</h3>
          <p style={{ color: '#a7f3d0', fontSize: '0.95rem' }}>
            Earn achievements for night discoveries, rare sightings, and participating in seasonal challenges.
          </p>
        </div>
      </section>
    </main>
  );
};

const SpeciesPage: React.FC = () => {
  return (
    <main style={{ maxWidth: '1000px', margin: '3rem auto', padding: '0 1.5rem' }}>
      <section className="glass-panel" style={{ padding: '2.5rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#f0fdf4' }}>Species Catalog</h2>
        <p style={{ color: '#a7f3d0', maxWidth: '600px', margin: '0 auto 1.5rem' }}>
          Our species taxonomy database will be populated in Sub-Phase 1.2 with Prisma seeding and rendered in Sub-Phase 1.5.
        </p>
        <div className="badge-status">Coming in Sub-Phase 1.5</div>
      </section>
    </main>
  );
};

const LoginPage: React.FC = () => {
  return (
    <main style={{ maxWidth: '440px', margin: '4rem auto', padding: '0 1.5rem' }}>
      <section className="glass-panel" style={{ padding: '2.5rem' }}>
        <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem', textAlign: 'center', color: '#f0fdf4' }}>
          Welcome Back
        </h2>
        <p style={{ color: '#a7f3d0', textAlign: 'center', marginBottom: '2rem', fontSize: '0.95rem' }}>
          Sign in to access your field journal and submit insect sightings.
        </p>
        <div style={{ padding: '1.5rem', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', textAlign: 'center' }}>
          <div className="badge-status" style={{ marginBottom: '0.75rem' }}>Sub-Phase 1.4</div>
          <p style={{ color: '#6ee7b7', fontSize: '0.9rem' }}>JWT Auth flow & user credentials will be wired in Sub-Phase 1.4.</p>
        </div>
      </section>
    </main>
  );
};

const NotFoundPage: React.FC = () => {
  return (
    <main style={{ maxWidth: '600px', margin: '5rem auto', textAlign: 'center', padding: '0 1.5rem' }}>
      <div className="glass-panel" style={{ padding: '3rem' }}>
        <h1 style={{ fontSize: '4rem', fontWeight: 900, color: '#34d399', marginBottom: '0.5rem' }}>404</h1>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#f0fdf4' }}>Specimen Not Found</h2>
        <p style={{ color: '#a7f3d0', marginBottom: '2rem' }}>
          The page or insect habitat you are looking for does not exist in our field notes.
        </p>
        <NavLink
          to="/"
          style={{
            display: 'inline-block',
            padding: '0.65rem 1.5rem',
            borderRadius: '8px',
            backgroundColor: '#10b981',
            color: '#ffffff',
            fontWeight: 600,
          }}
        >
          Return to Field Base
        </NavLink>
      </div>
    </main>
  );
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navigation />
        <div style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/species" element={<SpeciesPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </div>
        <footer style={{
          textAlign: 'center',
          padding: '1.5rem',
          borderTop: '1px solid rgba(52, 211, 153, 0.1)',
          color: '#6ee7b7',
          fontSize: '0.85rem'
        }}>
          WildBugs 2.0 Citizen Science Platform &copy; 2026
        </footer>
      </div>
    </BrowserRouter>
  );
};

export default App;
