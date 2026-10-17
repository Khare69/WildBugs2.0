import { useState, useRef, useCallback, useEffect } from 'react';

export interface CapturedPhoto {
  blob: Blob;
  dataUrl: string;
  file: File;
  width: number;
  height: number;
}

export interface UseCameraOptions {
  idealFacingMode?: 'environment' | 'user';
  maxDimension?: number;
}

export interface UseCameraReturn {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  stream: MediaStream | null;
  isStreaming: boolean;
  isLoading: boolean;
  error: string | null;
  hasCameraSupport: boolean;
  capturedPhoto: CapturedPhoto | null;
  facingMode: 'environment' | 'user';
  startCamera: (mode?: 'environment' | 'user') => Promise<boolean>;
  stopCamera: () => void;
  switchCamera: () => Promise<boolean>;
  takePhoto: () => Promise<CapturedPhoto | null>;
  capturePhoto: () => Promise<CapturedPhoto | null>;
  clearPhoto: () => void;
  loadPhotoFromFile: (file: File) => Promise<CapturedPhoto | null>;
}

export const useCamera = (options: UseCameraOptions = {}): UseCameraReturn => {
  const { idealFacingMode = 'environment' } = options;

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>(idealFacingMode);
  const [capturedPhoto, setCapturedPhoto] = useState<CapturedPhoto | null>(null);

  const hasCameraSupport = typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia;

  /**
   * Stops all active tracks on the active camera media stream.
   */
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setStream(null);
    setIsStreaming(false);
    setIsLoading(false);
  }, []);

  /**
   * Initializes user media stream and attaches it to video element ref.
   */
  const startCamera = useCallback(
    async (mode?: 'environment' | 'user'): Promise<boolean> => {
      setError(null);
      setIsLoading(true);

      const targetMode = mode || facingMode;

      if (!hasCameraSupport) {
        setError('Camera capture is not supported on this browser or device. Please select an image from your files.');
        setIsLoading(false);
        return false;
      }

      // Stop any existing stream before starting a new one
      stopCamera();

      try {
        let stream: MediaStream;
        try {
          // Attempt target facing mode (e.g., environment for rear nature camera)
          stream = await navigator.mediaDevices.getUserMedia({
            audio: false,
            video: {
              facingMode: { ideal: targetMode },
              width: { ideal: 1920 },
              height: { ideal: 1080 },
            },
          });
        } catch (firstErr) {
          console.warn('[useCamera] Ideal facing mode failed, falling back to any available video stream:', firstErr);
          // Fallback to any default video device
          stream = await navigator.mediaDevices.getUserMedia({
            audio: false,
            video: true,
          });
        }

        streamRef.current = stream;
        setStream(stream);
        setFacingMode(targetMode);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.playsInline = true;
          videoRef.current.muted = true;

          // Wait until metadata is loaded to ensure dimensions are known
          await new Promise<void>((resolve) => {
            const vid = videoRef.current;
            if (!vid) return resolve();
            if (vid.readyState >= 1) return resolve();

            const timer = setTimeout(() => resolve(), 2000);
            vid.onloadedmetadata = () => {
              clearTimeout(timer);
              resolve();
            };
          });

          await videoRef.current.play();
        }

        setIsStreaming(true);
        setIsLoading(false);
        return true;
      } catch (err: unknown) {
        let msg = 'Could not access camera.';
        if (err instanceof DOMException) {
          if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
            msg = 'Camera access was denied. Please allow camera permissions in your browser or upload a file.';
          } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
            msg = 'No camera found on this device. Please upload a photo from your gallery.';
          } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
            msg = 'Camera hardware is currently in use by another application.';
          } else if (err.name === 'OverconstrainedError') {
            msg = 'Requested camera resolution or constraints are not supported.';
          }
        } else if (err instanceof Error) {
          msg = err.message;
        }

        console.error('[useCamera Error]:', err);
        setError(msg);
        setIsStreaming(false);
        setIsLoading(false);
        return false;
      }
    },
    [facingMode, hasCameraSupport, stopCamera]
  );

  /**
   * Switches between environment (rear) and user (front) cameras.
   */
  const switchCamera = useCallback(async (): Promise<boolean> => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    return startCamera(nextMode);
  }, [facingMode, startCamera]);

  /**
   * Captures the current video frame to an offscreen canvas and returns a CapturedPhoto.
   */
  const takePhoto = useCallback(async (): Promise<CapturedPhoto | null> => {
    if (!videoRef.current || !isStreaming) {
      setError('Camera is not active.');
      return null;
    }

    const video = videoRef.current;
    const width = video.videoWidth || 1280;
    const height = video.videoHeight || 720;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setError('Could not initialize canvas context for photo capture.');
      return null;
    }

    // Mirror image if front camera is active for natural appearance
    if (facingMode === 'user') {
      ctx.translate(width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, width, height);

    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            setError('Failed to create image blob from camera capture.');
            return resolve(null);
          }

          const filename = `insect_capture_${Date.now()}.jpg`;
          const file = new File([blob], filename, { type: 'image/jpeg', lastModified: Date.now() });
          const dataUrl = canvas.toDataURL('image/jpeg', 0.95);

          const photoResult: CapturedPhoto = {
            blob,
            dataUrl,
            file,
            width,
            height,
          };

          setCapturedPhoto(photoResult);
          stopCamera();
          resolve(photoResult);
        },
        'image/jpeg',
        0.95
      );
    });
  }, [isStreaming, facingMode, stopCamera]);

  /**
   * Loads an existing file (e.g. from file picker fallback) as a CapturedPhoto.
   */
  const loadPhotoFromFile = useCallback(async (file: File): Promise<CapturedPhoto | null> => {
    if (!file.type.startsWith('image/')) {
      setError('Selected file is not an image.');
      return null;
    }

    setError(null);

    return new Promise((resolve) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        const img = new Image();

        img.onload = () => {
          const photoResult: CapturedPhoto = {
            blob: file,
            dataUrl,
            file,
            width: img.naturalWidth,
            height: img.naturalHeight,
          };

          setCapturedPhoto(photoResult);
          resolve(photoResult);
        };

        img.onerror = () => {
          setError('Failed to decode image file.');
          resolve(null);
        };

        img.src = dataUrl;
      };

      reader.onerror = () => {
        setError('Failed to read image file.');
        resolve(null);
      };

      reader.readAsDataURL(file);
    });
  }, []);

  /**
   * Resets captured photo state.
   */
  const clearPhoto = useCallback(() => {
    setCapturedPhoto(null);
    setError(null);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return {
    videoRef,
    stream,
    isStreaming,
    isLoading,
    error,
    hasCameraSupport,
    capturedPhoto,
    facingMode,
    startCamera,
    stopCamera,
    switchCamera,
    takePhoto,
    capturePhoto: takePhoto,
    clearPhoto,
    loadPhotoFromFile,
  };
};

export default useCamera;
