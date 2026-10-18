/**
 * Maps sighting status to appropriate nature badge accent colors.
 */
export const getMarkerBadgeColor = (status: string): string => {
  switch (status) {
    case 'VERIFIED':
      return '#10b981'; // Emerald Green
    case 'IDENTIFIED':
      return '#06b6d4'; // Cyan
    case 'REJECTED':
      return '#ef4444'; // Red
    case 'PENDING':
    default:
      return '#f59e0b'; // Amber
  }
};

/**
 * Converts RFC 7946 GeoJSON [longitude, latitude] coordinates to Leaflet [latitude, longitude].
 */
export const geoJsonToLeafletLatLng = (coordinates: [number, number]): [number, number] => {
  const [longitude, latitude] = coordinates;
  return [latitude, longitude];
};

/**
 * Formats observation ISO date string into human-friendly format.
 */
export const formatObservationDate = (dateStr: string): string => {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
};
