// Map provider configuration
// Swap this to switch between Mapbox, Google Maps, and Apple MapKit JS
export const MAP_PROVIDER = 'google'; // 'mapbox' | 'google' | 'apple'

// Mapbox config — get a free token at https://account.mapbox.com/
export const MAPBOX_TOKEN = typeof import.meta !== 'undefined' && import.meta.env?.VITE_MAPBOX_TOKEN || '';

// Google Maps config — get an API key at https://console.cloud.google.com/google/maps-apis
export const GOOGLE_MAPS_API_KEY = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GOOGLE_MAP) || '';

// Google Maps Map ID — required for AdvancedMarkerElement (the modern, non-deprecated marker API).
// Create one at https://console.cloud.google.com/google/maps-apis/studio/maps and paste the ID
// into japan2026/.env as VITE_GOOGLE_MAP_ID=<your-map-id>.
// If unset we fall back to Google's DEMO_MAP_ID — works for development with default styling but
// shows a watermark/notice; create a real Map ID before shipping. MapView.jsx surfaces a console
// warning when the fallback is in use.
export const GOOGLE_MAP_ID = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GOOGLE_MAP_ID) || '';

// Apple MapKit JS config (for future use)
// Requires Apple Developer Program membership ($99/yr)
// export const APPLE_MAPKIT_TOKEN = 'YOUR_JWT_HERE';

export const MAP_DEFAULTS = {
  // Tokyo center
  center: [139.6503, 35.6762], // [lng, lat] — Mapbox uses lng,lat order
  zoom: 11,
};
