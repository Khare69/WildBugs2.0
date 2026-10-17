import React, { useState, useRef, useEffect } from 'react';
import { useCamera } from '../../hooks/useCamera';
import { compressImage, validateImageFile } from '../../utils/compressImage';
import { useUploadStore } from '../../store/uploadStore';

export const PhotoCapture: React.FC = () => {
  const { setPhotoData, setError } = useUploadStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    videoRef,
    isStreaming,
    isLoading: isCameraLoading,
    error: cameraError,
    facingMode,
    startCamera,
    stopCamera,
    switchCamera,
    takePhoto,
  } = useCamera({ idealFacingMode: 'environment' });

  // Clean up camera stream on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  const processFile = async (file: File) => {
    const validation = validateImageFile(file, 20);
    if (!validation.valid) {
      setError(validation.error || 'Invalid file format');
      return;
    }

    try {
      setIsProcessing(true);
      setError(null);

      const result = await compressImage(file, {
        maxDimension: 2048,
        quality: 0.82,
        targetSizeKb: 600,
      });

      setPhotoData({
        rawFile: file,
        compressedFile: result.file,
        previewUrl: result.dataUrl,
        originalSize: result.originalSize,
        compressedSize: result.compressedSize,
        imageWidth: result.width,
        imageHeight: result.height,
      });

      stopCamera();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error processing image';
      setError(`Failed to compress image: ${msg}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCapturePhoto = async () => {
    try {
      setIsProcessing(true);
      const photo = await takePhoto();
      if (!photo) {
        setError('Failed to capture photo from video feed.');
        return;
      }
      await processFile(photo.file);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await processFile(files[0]);
    }
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await processFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="photo-capture-card">
      <div className="capture-header">
        <h3>Capture or Select Insect Photo</h3>
        <p className="capture-subtitle">
          Take a close-up photo in good lighting for highest AI classification accuracy.
        </p>
      </div>

      {cameraError && (
        <div className="camera-alert-warning" role="alert">
          <span>⚠️ {cameraError}</span>
        </div>
      )}

      {/* Live Camera Viewfinder or Upload Area */}
      {isStreaming ? (
        <div className="camera-viewfinder-container">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="camera-video-feed"
          />
          <div className="camera-overlay-controls">
            <button
              type="button"
              className="btn-camera-control"
              onClick={switchCamera}
              title={`Switch camera (current: ${facingMode})`}
            >
              🔄 Flip
            </button>
            <button
              type="button"
              className="btn-camera-capture-trigger"
              onClick={handleCapturePhoto}
              disabled={isProcessing}
            >
              <span className="trigger-inner">📸</span>
            </button>
            <button
              type="button"
              className="btn-camera-control"
              onClick={stopCamera}
              title="Close camera"
            >
              ✕ Close
            </button>
          </div>
        </div>
      ) : (
        <div
          className={`dropzone-container ${dragOver ? 'dropzone-active' : ''}`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          <div className="dropzone-icon">📷</div>
          <div className="dropzone-text">
            <h4>Drag & drop an insect photo here</h4>
            <p>Supports JPG, PNG, WebP up to 20MB (auto-compressed)</p>
          </div>

          <div className="capture-action-row">
            <button
              type="button"
              className="btn-primary"
              onClick={() => startCamera('environment')}
              disabled={isCameraLoading || isProcessing}
            >
              {isCameraLoading ? 'Starting Camera...' : '📸 Open Camera'}
            </button>

            <span className="action-divider">or</span>

            <button
              type="button"
              className="btn-secondary"
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
            >
              📁 Browse Files
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/heic"
              style={{ display: 'none' }}
              onChange={handleFileInputChange}
            />
          </div>
        </div>
      )}

      {isProcessing && (
        <div className="processing-indicator">
          <div className="spinner-small" />
          <span>Compressing & optimizing image for AI classification...</span>
        </div>
      )}
    </div>
  );
};

export default PhotoCapture;
