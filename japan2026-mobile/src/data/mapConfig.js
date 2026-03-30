// Map provider configuration
// Swap this to switch between Mapbox and Apple MapKit JS
export const MAP_PROVIDER = 'mapbox'; // 'mapbox' | 'apple'

// Mapbox config — get a free token at https://account.mapbox.com/
export const MAPBOX_TOKEN = typeof import.meta !== 'undefined' && import.meta.env?.VITE_MAPBOX_TOKEN || '';

// Apple MapKit JS config (for future use)
// Requires Apple Developer Program membership ($99/yr)
// export const APPLE_MAPKIT_TOKEN = 'YOUR_JWT_HERE';

export const MAP_DEFAULTS = {
  // Tokyo center
  center: [139.6503, 35.6762], // [lng, lat] — Mapbox uses lng,lat order
  zoom: 11,
};
