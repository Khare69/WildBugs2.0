import React from 'react';
import 'leaflet/dist/leaflet.css';
import BiodiversityMap from '../components/map/BiodiversityMap';

export const MapPage: React.FC = () => {
  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: 'calc(100vh - 64px)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Interactive Leaflet Map */}
      <BiodiversityMap />
    </div>
  );
};

export default MapPage;
