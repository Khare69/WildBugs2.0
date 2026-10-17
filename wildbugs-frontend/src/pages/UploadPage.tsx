import React from 'react';
import UploadForm from '../components/sightings/UploadForm';

export const UploadPage: React.FC = () => {
  return (
    <div className="upload-page-layout">
      <div className="upload-page-header">
        <h1 className="page-title">📸 Record Insect Sighting</h1>
        <p className="page-description">
          Contribute to regional biodiversity tracking. Capture a photo, record your coordinates, and let our Google Cloud Vision AI pipeline identify the species.
        </p>
      </div>

      <div className="upload-page-content">
        <div className="upload-main-col">
          <UploadForm />
        </div>

        <aside className="upload-tips-sidebar">
          <div className="tips-card">
            <h3 className="tips-title">💡 Tips for Accurate AI Identification</h3>
            <ul className="tips-list">
              <li>
                <strong>Fill the frame:</strong> Get as close as safely possible without startling the insect.
              </li>
              <li>
                <strong>Highlight key features:</strong> Distinct wing patterns, head structure, and leg coloration help our AI classification model.
              </li>
              <li>
                <strong>Good lighting:</strong> Direct natural light or diffused sunlight produces the sharpest details.
              </li>
              <li>
                <strong>Multiple angles:</strong> Dorsal (top-down) views work best for beetles and butterflies.
              </li>
            </ul>
          </div>

          <div className="ethics-card">
            <h3 className="ethics-title">🌿 Ethical Field Guidelines</h3>
            <p className="ethics-text">
              Respect natural habitats. Never harm, capture, or disturb nesting insects or sensitive flora when capturing observations.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default UploadPage;
