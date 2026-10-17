import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Sighting, SightingIdentification } from '../../types/sighting';

interface IdentificationResultProps {
  sighting: Sighting;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const IdentificationResult: React.FC<IdentificationResultProps> = ({
  sighting,
  onRefresh,
  isRefreshing = false,
}) => {
  const [showCorrectionModal, setShowCorrectionModal] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  const confidence = sighting.aiConfidence ?? 0;
  const confidencePercent = Math.round(confidence * 100);

  const getConfidenceLevel = (val: number): { label: string; colorClass: string } => {
    if (val >= 0.85) return { label: 'High Confidence', colorClass: 'confidence-high' };
    if (val >= 0.6) return { label: 'Moderate Confidence', colorClass: 'confidence-medium' };
    return { label: 'Low Confidence / Review Suggested', colorClass: 'confidence-low' };
  };

  const confidenceInfo = getConfidenceLevel(confidence);

  const copyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2500);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="identification-result-card">
      <div className="id-card-header">
        <div className="header-status-badge-group">
          <span className={`status-pill status-${sighting.status.toLowerCase()}`}>
            {sighting.status}
          </span>
          {sighting.status === 'VERIFIED' && (
            <span className="expert-verified-pill" title="Verified by a certified entomologist">
              ⭐ Expert Verified
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={copyShareLink}
          className="btn-share-sighting"
          title="Copy link to this observation"
        >
          {copiedId ? '✓ Link Copied' : '🔗 Share Sighting'}
        </button>
      </div>

      {/* STATE 1: AI PENDING */}
      {sighting.status === 'PENDING' && (
        <div className="ai-pending-container">
          <div className="ai-pulsing-scanner" />
          <h4>Google Cloud Vision AI Analysis in Progress</h4>
          <p className="ai-pending-text">
            Our background classifier is analyzing taxonomic traits, wing patterns, and morphological markers. This typically takes 3–5 seconds.
          </p>
          {onRefresh && (
            <button
              type="button"
              className="btn-refresh-status"
              onClick={onRefresh}
              disabled={isRefreshing}
            >
              {isRefreshing ? 'Checking Queue...' : '🔄 Refresh AI Status'}
            </button>
          )}
        </div>
      )}

      {/* STATE 2: IDENTIFIED OR VERIFIED */}
      {(sighting.status === 'IDENTIFIED' || sighting.status === 'VERIFIED') && sighting.species && (
        <div className="ai-identified-content">
          <div className="species-spotlight-box">
            <div className="species-spotlight-photo-frame">
              <img
                src={sighting.species.imageUrl}
                alt={sighting.species.commonName}
                className="species-spotlight-img"
              />
            </div>

            <div className="species-spotlight-details">
              <span className="species-family-chip">{sighting.species.family}</span>
              <h3 className="species-common-name">{sighting.species.commonName}</h3>
              <p className="species-scientific-name">
                <em>{sighting.species.scientificName}</em>
              </p>
              <p className="species-short-desc">
                {sighting.species.description.slice(0, 160)}...
              </p>

              <Link
                to={`/species/${sighting.species.id}`}
                className="btn-link-species-guide"
              >
                📖 Explore Full Species Profile & Taxonomy ➡️
              </Link>
            </div>
          </div>

          {/* AI Confidence Meter */}
          <div className="confidence-meter-container">
            <div className="confidence-meter-header">
              <span className="meter-label">AI Classification Confidence</span>
              <span className={`meter-score ${confidenceInfo.colorClass}`}>
                {confidencePercent}% ({confidenceInfo.label})
              </span>
            </div>
            <div className="confidence-meter-track" role="progressbar" aria-valuenow={confidencePercent} aria-valuemin={0} aria-valuemax={100}>
              <div
                className={`confidence-meter-fill ${confidenceInfo.colorClass}`}
                style={{ width: `${Math.max(5, confidencePercent)}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* STATE 3: UNIDENTIFIED / LOW CONFIDENCE */}
      {sighting.status === 'UNIDENTIFIED' && (
        <div className="ai-unidentified-box">
          <div className="unidentified-icon">❓</div>
          <h4>Species Could Not Be Confirmed by AI</h4>
          <p>
            The image did not match catalogued species with sufficiently high certainty. You or a community expert can provide a classification below.
          </p>
        </div>
      )}

      {/* Identifications History & Corrections */}
      {sighting.identifications && sighting.identifications.length > 0 && (
        <div className="identifications-timeline">
          <h4 className="timeline-title">Classification History & Community Suggestions</h4>
          <div className="identifications-list">
            {sighting.identifications.map((idEntry: SightingIdentification) => (
              <div key={idEntry.id} className="id-entry-card">
                <div className="id-entry-badge">
                  <span className={`source-pill source-${idEntry.source.toLowerCase()}`}>
                    {idEntry.source}
                  </span>
                  {idEntry.isAccepted && (
                    <span className="accepted-pill">✓ Accepted</span>
                  )}
                </div>

                <div className="id-entry-body">
                  <p className="id-entry-name">
                    <strong>{idEntry.species?.commonName || `Species #${idEntry.speciesId}`}</strong>
                    {idEntry.species?.scientificName && (
                      <span className="id-entry-sci"> (<em>{idEntry.species.scientificName}</em>)</span>
                    )}
                  </p>
                  <p className="id-entry-meta">
                    Confidence: <strong>{Math.round(idEntry.confidence * 100)}%</strong> • Proposed by {idEntry.user?.displayName || idEntry.source} on {new Date(idEntry.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Correction Trigger Button */}
      <div className="correction-action-section">
        <button
          type="button"
          className="btn-suggest-correction"
          onClick={() => setShowCorrectionModal(true)}
        >
          ✏️ Suggest Species Correction / Community ID
        </button>
      </div>

      {/* Suggest Correction Modal */}
      {showCorrectionModal && (
        <div className="modal-backdrop" onClick={() => setShowCorrectionModal(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Suggest Species Identification</h3>
              <button
                type="button"
                className="btn-modal-close"
                onClick={() => setShowCorrectionModal(false)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <p>
                Notice an error with the AI result? Verified community members and expert entomologists can submit alternative species classifications for this sighting.
              </p>
              <div className="suggestion-notice-box">
                <span>💡 Expert verification voting will be active in the upcoming community peer-review phase.</span>
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setShowCorrectionModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IdentificationResult;
