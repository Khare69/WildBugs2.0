import { useState, useCallback, useEffect } from 'react';

export interface GeolocationCoordinates {
  latitude: number;
  longitude: number;
  accuracy?: number | null;
}

export interface UseGeolocationReturn {
  coordinates: GeolocationCoordinates | null;
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  isLoading: boolean;
  error: string | null;
  isSupported: boolean;
  permissionState: 'prompt' | 'granted' | 'denied' | 'unknown';
  requestLocation: (enableHighAccuracy?: boolean) => Promise<GeolocationCoordinates | null>;
  setManualCoordinates: (latitude: number, longitude: number) => void;
  clearLocation: () => void;
}

export const useGeolocation = (autoFetch = false): UseGeolocationReturn => {
  const [coordinates, setCoordinates] = useState<GeolocationCoordinates | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [permissionState, setPermissionState] = useState<'prompt' | 'granted' | 'denied' | 'unknown'>('unknown');

  const isSupported = typeof window !== 'undefined' && 'geolocation' in navigator;

  // Query permissions if Permissions API is supported
  useEffect(() => {
    if (typeof navigator !== 'undefined' && 'permissions' in navigator && navigator.permissions.query) {
      navigator.permissions
        .query({ name: 'geolocation' as PermissionName })
        .then((status) => {
          setPermissionState(status.state as 'prompt' | 'granted' | 'denied');
          status.onchange = () => {
            setPermissionState(status.state as 'prompt' | 'granted' | 'denied');
          };
        })
        .catch(() => {
          setPermissionState('unknown');
        });
    }
  }, []);

  const requestLocation = useCallback(
    async (enableHighAccuracy = true): Promise<GeolocationCoordinates | null> => {
      if (!isSupported) {
        const errMsg = 'Geolocation is not supported by your browser. Please enter coordinates manually.';
        setError(errMsg);
        return null;
      }

      setIsLoading(true);
      setError(null);

      return new Promise<GeolocationCoordinates | null>((resolve) => {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const coords: GeolocationCoordinates = {
              latitude: Number(pos.coords.latitude.toFixed(6)),
              longitude: Number(pos.coords.longitude.toFixed(6)),
              accuracy: Math.round(pos.coords.accuracy),
            };
            setCoordinates(coords);
            setIsLoading(false);
            setPermissionState('granted');
            resolve(coords);
          },
          (err) => {
            let errorMsg = 'Could not retrieve your location.';
            if (err.code === err.PERMISSION_DENIED) {
              errorMsg = 'Location permission was denied. Please allow location access or input coordinates manually.';
              setPermissionState('denied');
            } else if (err.code === err.POSITION_UNAVAILABLE) {
              errorMsg = 'Location information is currently unavailable.';
            } else if (err.code === err.TIMEOUT) {
              errorMsg = 'Location request timed out. Please try again or enter manually.';
            }
            setError(errorMsg);
            setIsLoading(false);
            resolve(null);
          },
          {
            enableHighAccuracy,
            timeout: 10000,
            maximumAge: 60000,
          }
        );
      });
    },
    [isSupported]
  );

  const setManualCoordinates = useCallback((latitude: number, longitude: number) => {
    setCoordinates({
      latitude: Number(latitude.toFixed(6)),
      longitude: Number(longitude.toFixed(6)),
      accuracy: null,
    });
    setError(null);
  }, []);

  const clearLocation = useCallback(() => {
    setCoordinates(null);
    setError(null);
  }, []);

  useEffect(() => {
    if (autoFetch && isSupported) {
      const timer = setTimeout(() => {
        void requestLocation();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [autoFetch, isSupported, requestLocation]);

  return {
    coordinates,
    latitude: coordinates?.latitude ?? null,
    longitude: coordinates?.longitude ?? null,
    accuracy: coordinates?.accuracy ?? null,
    isLoading,
    error,
    isSupported,
    permissionState,
    requestLocation,
    setManualCoordinates,
    clearLocation,
  };
};

export default useGeolocation;
