import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useUploadStore } from '../../store/uploadStore';
import { useGeolocation } from '../../hooks/useGeolocation';
import { speciesApi } from '../../api/speciesApi';
import { sightingsApi } from '../../api/sightingsApi';
import { formatFileSize } from '../../utils/compressImage';
import type { Species } from '../../types/species';
import PhotoCapture from './PhotoCapture';
import { useOfflineQueue } from '../../hooks/useOfflineQueue';

export const UploadForm: React.FC = () => {
  const navigate = useNavigate();
  const {
    isOnline,
    queueCount,
    addToQueue,
    syncNow,
    isSyncing,
    lastSyncMessage,
  } = useOfflineQueue();

  const [queuedNotice, setQueuedNotice] = useState<boolean>(false);
  const {
    step,
    setStep,
    previewUrl,
    compressedFile,
    originalSize,
    compressedSize,
    imageWidth,
    imageHeight,
    latitude,
    longitude,
    speciesId,
    observedAt,
    notes,
    uploadProgress,
    isUploading,
    error,
    createdSighting,
    setLocation,
    setSpeciesId,
    setObservedAt,
    setUploadProgress,
    setIsUploading,
    setError,
    setCreatedSighting,
    reset,
  } = useUploadStore();

  const [latInput, setLatInput] = useState<string>(latitude !== null ? latitude.toString() : '');
  const [lngInput, setLngInput] = useState<string>(longitude !== null ? longitude.toString() : '');
  const [coordError, setCoordError] = useState<string | null>(null);

  const {
    coordinates: geoCoords,
    isLoading: isGeoLoading,
    error: geoError,
    requestLocation,
  } = useGeolocation();

  // Load species for optional selection dropdown
  const { data: speciesData } = useQuery({
    queryKey: ['species-list-options'],
    queryFn: () => speciesApi.getSpecies({ limit: 100 }),
    staleTime: 1000 * 60 * 15,
  });

  const handleDetectLocation = async () => {
    const coords = await requestLocation(true);
    if (coords) {
      setLocation(coords.latitude, coords.longitude);
      setLatInput(coords.latitude.toString());
      setLngInput(coords.longitude.toString());
      setCoordError(null);
    }
  };

  const handleCoordinateChange = (newLat: string, newLng: string) => {
    setLatInput(newLat);
    setLngInput(newLng);

    const latNum = parseFloat(newLat);
    const lngNum = parseFloat(newLng);

    if (isNaN(latNum) || isNaN(lngNum)) {
      setCoordError('Coordinates must be valid decimal numbers.');
      return;
    }

    if (latNum < -90 || latNum > 90) {
      setCoordError('Latitude must be between -90 and 90 degrees.');
      return;
    }

    if (lngNum < -180 || lngNum > 180) {
      setCoordError('Longitude must be between -180 and 180 degrees.');
      return;
    }

    setCoordError(null);
    setLocation(Number(latNum.toFixed(6)), Number(lngNum.toFixed(6)));
  };

  const handleUsePresetLocation = () => {
    // Delhi / Asola Bhatti Wildlife Sanctuary coordinates
    const defaultLat = 28.5147;
    const defaultLng = 77.2625;
    handleCoordinateChange(defaultLat.toString(), defaultLng.toString());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!compressedFile) {
      setError('Please capture or select an observation photo first.');
      setStep('capture');
      return;
    }

    const latNum = parseFloat(latInput);
    const lngNum = parseFloat(lngInput);

    if (isNaN(latNum) || isNaN(lngNum) || latNum < -90 || latNum > 90 || lngNum < -180 || lngNum > 180) {
      setError('Please provide valid GPS coordinates before submitting.');
      return;
    }

    // Offline mode: save directly to IndexedDB queue
    if (!isOnline) {
      try {
        setIsUploading(true);
        setError(null);
        await addToQueue({
          photo: compressedFile,
          latitude: latNum,
          longitude: lngNum,
          speciesId: speciesId ?? undefined,
          observedAt: observedAt ? new Date(observedAt).toISOString() : undefined,
        });
        setQueuedNotice(true);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to save sighting to offline queue.');
      } finally {
        setIsUploading(false);
      }
      return;
    }

    try {
      setIsUploading(true);
      setError(null);
      setStep('submitting');
      setUploadProgress(15);

      const response = await sightingsApi.createSighting(
        {
          photo: compressedFile,
          latitude: latNum,
          longitude: lngNum,
          speciesId: speciesId ?? undefined,
          observedAt: observedAt ? new Date(observedAt).toISOString() : undefined,
          notes: notes || undefined,
        },
        (progressEvent) => {
          if (progressEvent.total) {
            const percent = Math.round((progressEvent.loaded * 80) / progressEvent.total);
            setUploadProgress(Math.min(90, Math.max(15, percent)));
          }
        }
      );

      setUploadProgress(100);
      setCreatedSighting(response.data.sighting);
    } catch (err: unknown) {
      // Auto-fallback to offline queue if network drops mid-request
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        try {
          await addToQueue({
            photo: compressedFile,
            latitude: latNum,
            longitude: lngNum,
            speciesId: speciesId ?? undefined,
            observedAt: observedAt ? new Date(observedAt).toISOString() : undefined,
          });
          setQueuedNotice(true);
          return;
        } catch {
          // ignore fallback error and report original error
        }
      }

      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (err as Error).message ||
        'Failed to upload observation. Please try again.';
      setError(errorMsg);
      setStep('location');
    } finally {
      setIsUploading(false);
    }
  };

  const calculateSavingsPercent = (): number => {
    if (!originalSize || !compressedSize) return 0;
    return Math.max(0, Math.round(((originalSize - compressedSize) / originalSize) * 100));
  };

  return (
    <div className="upload-wizard-container">
      {/* Offline Mode Indicator */}
      {!isOnline && (
        <div className="upload-alert-offline" role="status">
          <span className="alert-icon">📡</span>
          <div className="alert-body">
            <strong>Offline Mode:</strong> Internet connection is currently unavailable. Observations will be safely saved to your local offline queue and uploaded when your connection is restored.
          </div>
        </div>
      )}

      {/* Sync Queue Summary Banner */}
      {queueCount > 0 && (
        <div className="upload-queue-banner">
          <div className="queue-banner-info">
            <span className="queue-badge-icon">📦</span>
            <span>
              <strong>{queueCount}</strong> {queueCount === 1 ? 'observation' : 'observations'} saved in offline sync queue
            </span>
          </div>
          {isOnline && (
            <button
              type="button"
              className="btn-queue-sync"
              onClick={() => syncNow()}
              disabled={isSyncing}
            >
              {isSyncing ? '🔄 Syncing...' : '⚡ Sync Now'}
            </button>
          )}
        </div>
      )}

      {lastSyncMessage && (
        <div className="upload-alert-sync" role="status">
          <span className="alert-icon">✨</span>
          <div className="alert-body">{lastSyncMessage}</div>
        </div>
      )}

      {/* Wizard Progress Indicator */}
      <div className="wizard-step-bar" aria-label="Upload Progress Steps">
        <div className={`step-item ${step === 'capture' ? 'active' : 'completed'}`}>
          <div className="step-circle">{step === 'capture' ? '1' : '✓'}</div>
          <span className="step-label">Capture</span>
        </div>
        <div className="step-line" />
        <div className={`step-item ${step === 'preview' ? 'active' : ['location', 'submitting', 'success'].includes(step) ? 'completed' : ''}`}>
          <div className="step-circle">{['location', 'submitting', 'success'].includes(step) ? '✓' : '2'}</div>
          <span className="step-label">Preview</span>
        </div>
        <div className="step-line" />
        <div className={`step-item ${step === 'location' ? 'active' : ['submitting', 'success'].includes(step) ? 'completed' : ''}`}>
          <div className="step-circle">{['submitting', 'success'].includes(step) ? '✓' : '3'}</div>
          <span className="step-label">Location</span>
        </div>
        <div className="step-line" />
        <div className={`step-item ${step === 'success' ? 'completed' : step === 'submitting' ? 'active' : ''}`}>
          <div className="step-circle">{step === 'success' ? '✓' : '4'}</div>
          <span className="step-label">AI Status</span>
        </div>
      </div>

      {queuedNotice && (
        <div className="upload-offline-queued-card">
          <div className="offline-icon-badge">📦</div>
          <h2>Saved to queue (will upload when online)</h2>
          <p className="offline-description">
            Your insect sighting and compressed observation photo are safely stored in your device&apos;s IndexedDB offline queue. As soon as you reconnect, WildBugs will automatically upload the observation to Cloud Vision AI.
          </p>
          <div className="offline-queue-status-bar">
            <span>Pending Sync: <strong>{queueCount} {queueCount === 1 ? 'item' : 'items'}</strong></span>
            {isOnline && (
              <button
                type="button"
                className="btn-primary btn-sm"
                onClick={() => syncNow()}
                disabled={isSyncing}
              >
                {isSyncing ? 'Syncing...' : 'Sync Now'}
              </button>
            )}
          </div>
          <div className="success-action-row">
            <button
              type="button"
              className="btn-primary"
              onClick={() => {
                setQueuedNotice(false);
                reset();
              }}
            >
              ➕ Record Another Observation
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => navigate('/profile')}
            >
              👤 Go to Field Journal
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="upload-alert-error" role="alert">
          <span className="alert-icon">⚠️</span>
          <div className="alert-body">
            <strong>Upload Error:</strong> {error}
          </div>
        </div>
      )}

      {/* STEP 1: CAPTURE */}
      {step === 'capture' && <PhotoCapture />}

      {/* STEP 2: PREVIEW & COMPRESSION STATS */}
      {step === 'preview' && previewUrl && (
        <div className="upload-preview-card">
          <div className="preview-image-wrapper">
            <img src={previewUrl} alt="Captured insect observation" className="preview-image" />
          </div>

          <div className="compression-badge-card">
            <div className="badge-stat">
              <span className="stat-label">Dimensions</span>
              <span className="stat-val">{imageWidth} × {imageHeight}px</span>
            </div>
            <div className="badge-stat">
              <span className="stat-label">Original</span>
              <span className="stat-val">{formatFileSize(originalSize)}</span>
            </div>
            <div className="badge-stat">
              <span className="stat-label">Optimized</span>
              <span className="stat-val stat-highlight">{formatFileSize(compressedSize)}</span>
            </div>
            <div className="badge-stat">
              <span className="stat-label">Bandwidth Saved</span>
              <span className="stat-val stat-saved">⚡ {calculateSavingsPercent()}%</span>
            </div>
          </div>

          <div className="step-button-group">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setStep('capture')}
            >
              🔄 Retake Photo
            </button>
            <button
              type="button"
              className="btn-primary"
              onClick={() => setStep('location')}
            >
              Continue to Location & Details ➡️
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: LOCATION & SIGHTING DETAILS */}
      {step === 'location' && (
        <form onSubmit={handleSubmit} className="upload-details-form">
          <div className="form-section-header">
            <h3>Observation Location & Context</h3>
            <p className="form-section-subtitle">
              Precise coordinates power biodiversity maps and regional insect species distribution tracking.
            </p>
          </div>

          {/* GPS Auto Detect Box */}
          <div className="gps-detection-box">
            <div className="gps-header-row">
              <span className="gps-title">📍 GPS Geolocation</span>
              <button
                type="button"
                className="btn-detect-gps"
                onClick={handleDetectLocation}
                disabled={isGeoLoading}
              >
                {isGeoLoading ? 'Detecting Location...' : '🎯 Auto-Detect My Location'}
              </button>
            </div>

            {geoError && (
              <p className="gps-error-note">⚠️ {geoError}</p>
            )}

            {geoCoords?.accuracy && (
              <p className="gps-success-note">
                ✓ Location acquired with precision ±{geoCoords.accuracy} meters
              </p>
            )}
          </div>

          {/* Coordinate Inputs */}
          <div className="coordinates-grid">
            <div className="input-group">
              <label htmlFor="latitude-input">Latitude (-90 to 90)</label>
              <input
                id="latitude-input"
                type="number"
                step="any"
                required
                placeholder="e.g. 28.5147"
                value={latInput}
                onChange={(e) => handleCoordinateChange(e.target.value, lngInput)}
                className="form-input"
              />
            </div>

            <div className="input-group">
              <label htmlFor="longitude-input">Longitude (-180 to 180)</label>
              <input
                id="longitude-input"
                type="number"
                step="any"
                required
                placeholder="e.g. 77.2625"
                value={lngInput}
                onChange={(e) => handleCoordinateChange(latInput, e.target.value)}
                className="form-input"
              />
            </div>
          </div>

          {coordError && (
            <p className="coordinate-error-text">⚠️ {coordError}</p>
          )}

          <button
            type="button"
            className="btn-link-preset"
            onClick={handleUsePresetLocation}
          >
            🌿 Fill with Delhi NCR Sanctuary Sample Coordinates
          </button>

          {/* Species Hint Dropdown */}
          <div className="input-group">
            <label htmlFor="species-select">Species Suggestion (Optional)</label>
            <select
              id="species-select"
              value={speciesId ?? ''}
              onChange={(e) => setSpeciesId(e.target.value ? parseInt(e.target.value, 10) : null)}
              className="form-select"
            >
              <option value="">✨ Unknown / Let AI Vision Identify (Recommended)</option>
              {speciesData?.data?.map((sp: Species) => (
                <option key={sp.id} value={sp.id}>
                  {sp.commonName} ({sp.scientificName})
                </option>
              ))}
            </select>
            <span className="input-hint">
              Leave blank to allow Google Cloud Vision AI to classify the species automatically.
            </span>
          </div>

          {/* Observed Date/Time */}
          <div className="input-group">
            <label htmlFor="observed-date">Observation Date & Time</label>
            <input
              id="observed-date"
              type="datetime-local"
              value={observedAt}
              onChange={(e) => setObservedAt(e.target.value)}
              className="form-input"
            />
          </div>

          {/* Navigation Buttons */}
          <div className="step-button-group">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setStep('preview')}
            >
              ⬅️ Back to Preview
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isUploading || !!coordError || !latInput || !lngInput}
            >
              🚀 Submit Observation
            </button>
          </div>
        </form>
      )}

      {/* STEP 4: SUBMITTING / UPLOADING */}
      {step === 'submitting' && (
        <div className="upload-submitting-card">
          <div className="submitting-spinner-ring" />
          <h3>Uploading Your Observation...</h3>
          <p className="submitting-status-text">
            Streaming compressed media to Cloudinary CDN & dispatching AI identification queue...
          </p>

          <div className="upload-progress-bar-track">
            <div
              className="upload-progress-bar-fill"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <span className="progress-percent-label">{uploadProgress}%</span>
        </div>
      )}

      {/* STEP 5: SUCCESS & SIGHTING LINK */}
      {step === 'success' && createdSighting && (
        <div className="upload-success-card">
          <div className="success-icon-badge">🎉</div>
          <h2>Observation Recorded Successfully!</h2>
          <p className="success-description">
            Your sighting has been securely logged and sent to the Cloud Vision AI identification pipeline.
          </p>

          <div className="success-summary-box">
            {createdSighting.photoUrl && (
              <img
                src={createdSighting.thumbnailUrl || createdSighting.photoUrl}
                alt="Uploaded sighting"
                className="success-thumb"
              />
            )}
            <div className="success-meta-details">
              <p><strong>Coordinates:</strong> {createdSighting.latitude.toFixed(4)}°N, {createdSighting.longitude.toFixed(4)}°E</p>
              <p><strong>Status:</strong> <span className={`status-pill status-${createdSighting.status.toLowerCase()}`}>{createdSighting.status}</span></p>
              <p><strong>Observed At:</strong> {new Date(createdSighting.observedAt).toLocaleString()}</p>
            </div>
          </div>

          <div className="success-action-row">
            <button
              type="button"
              className="btn-primary"
              onClick={() => navigate(`/sightings/${createdSighting.id}`)}
            >
              🔍 View Sighting Details & AI Result
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => reset()}
            >
              ➕ Upload Another Observation
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadForm;
