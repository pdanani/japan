import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  GoogleMap,
  useJsApiLoader,
  Polyline,
  Circle,
} from '@react-google-maps/api';
import {
  Text, Badge, Group, Card, UnstyledButton, ActionIcon, Tooltip,
  Switch, Slider,
} from '@mantine/core';
import {
  IconStarFilled, IconBookmark, IconNavigation,
  IconChevronLeft, IconChevronRight, IconRoute, IconTimeline,
  IconFilter, IconX, IconSearch,
} from '@tabler/icons-react';
import { timeline as defaultTimeline } from '../data/tripData';
import { nearbyFinds } from '../data/nearbyFinds';
import { getPlacesForDay } from '../data/savedPlaces';
import {
  getScheduleCoord, getTabelogCoord, getSavedPlaceCoord, getDayCenter,
} from '../data/coords';
import { MAP_PROVIDER, GOOGLE_MAPS_API_KEY, GOOGLE_MAP_ID } from '../data/mapConfig';
import { tabelogAll as tabelogTokyoAll } from '../data/tabelogAll';
import { tabelogDinnerAll as tabelogTokyoDinnerAll } from '../data/tabelogDinnerAll';
import { tabelogOsakaAll } from '../data/tabelogOsakaAll';
import { tabelogOsakaLunchAll } from '../data/tabelogOsakaLunchAll';
import { tabelogOsakaDinnerAll } from '../data/tabelogOsakaDinnerAll';
import { extractCuisineTags, getMealDatasets, groupCuisineTags, matchesJapaneseOnly, normalizeCuisineTags } from '../utils';

// Module-level so `useJsApiLoader` sees a stable identity (fixes the "LoadScript reloaded
// unintentionally" warning). `marker` is required for AdvancedMarkerElement; `places` is for
// the Place.searchByText autocomplete.
const GOOGLE_MAPS_LIBRARIES = ['places', 'marker'];
const GOOGLE_MAPS_LOADER_ID = 'japan2026-google-maps-script';
// Stable initial camera. `<GoogleMap center>` is a controlled prop in @react-google-maps/api —
// passing a fresh object each render snaps the camera back, overriding imperative panTo().
// Keep this as a module-level const; per-day fitting is done imperatively via mapRef.
const INITIAL_CENTER = { lat: 35.6762, lng: 139.6503 }; // Tokyo
const INITIAL_ZOOM = 12;
// Resolved Map ID for <GoogleMap mapId>. AdvancedMarkerElement requires a non-empty mapId.
// Fall back to Google's DEMO_MAP_ID for dev so markers still render. The user should create a
// real Map ID at https://console.cloud.google.com/google/maps-apis/studio/maps and put it in
// VITE_GOOGLE_MAP_ID — until then the demo ID works but is rate-limited and shows default style.
const RESOLVED_MAP_ID = GOOGLE_MAP_ID || 'DEMO_MAP_ID';
if (!GOOGLE_MAP_ID && typeof console !== 'undefined') {
  // eslint-disable-next-line no-console
  console.warn(
    '[MapView] VITE_GOOGLE_MAP_ID is unset — using DEMO_MAP_ID. ' +
      'Create a Map ID at https://console.cloud.google.com/google/maps-apis/studio/maps ' +
      'and add VITE_GOOGLE_MAP_ID=<id> to japan2026/.env to get custom styling and remove this warning.',
  );
}

function parsePrice(p) {
  if (!p) return 0;
  const m = p.match(/[\d,]+/);
  return m ? parseInt(m[0].replace(/,/g, ""), 10) : 0;
}

function inferTabelogCity(day) {
  const haystack = `${day?.location || ''} ${day?.notes || ''}`.toLowerCase();
  return haystack.includes('osaka') ? 'Osaka' : 'Tokyo';
}

const TYPE_CONFIG = {
  transport: { color: '#7c3aed', label: 'Transport' },
  food: { color: '#ea580c', label: 'Food' },
  group: { color: '#2563eb', label: 'Group' },
  shopping: { color: '#db2777', label: 'Shopping' },
  site: { color: '#059669', label: 'Site' },
  rest: { color: '#6b7280', label: 'Rest' },
  activity: { color: '#ca8a04', label: 'Activity' },
};

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
    + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180)
    * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function tokenizeSearch(value) {
  return value.toLowerCase().trim().split(/\s+/).filter(Boolean);
}

function scoreSearchText(query, ...values) {
  const q = query.toLowerCase().trim();
  const text = values.join(' ').toLowerCase().trim();
  if (!q || !text) return 0;
  if (text === q) return 200;
  if (text.startsWith(q)) return 140;
  if (text.includes(q)) return 120;

  const words = tokenizeSearch(q);
  if (words.length === 0) return 0;
  const matchedWords = words.filter((word) => text.includes(word));
  if (matchedWords.length !== words.length) return 0;
  return 80 + matchedWords.length * 5;
}

// Place is the new Places API class (google.maps.places.Place). The legacy PlacesService /
// PlacesServiceStatus surface was deprecated for new customers on 2025-03-01.
// place.displayName is a {text,languageCode} object; place.location is a LatLng with
// .lat()/.lng() methods; id replaces place_id.
function getPlaceName(place) {
  if (!place) return '';
  const dn = place.displayName;
  if (typeof dn === 'string') return dn;
  if (dn && typeof dn === 'object' && typeof dn.text === 'string') return dn.text;
  return '';
}

function getPlaceLatLng(place) {
  const loc = place?.location;
  if (!loc) return null;
  if (typeof loc.lat === 'function' && typeof loc.lng === 'function') {
    return { lat: loc.lat(), lng: loc.lng() };
  }
  if (typeof loc.lat === 'number' && typeof loc.lng === 'number') {
    return { lat: loc.lat, lng: loc.lng };
  }
  return null;
}

function isJapanGooglePlace(place) {
  if (!place) return false;
  if (!getPlaceLatLng(place)) return false;
  const address = place.formattedAddress || '';
  const name = getPlaceName(place);
  const text = `${name} ${address}`.toLowerCase();
  return text.includes('japan') || text.includes('tokyo') || text.includes('osaka') || text.includes('kyoto');
}

function calculateMatchQuality(query, place) {
  const q = query.toLowerCase().trim();
  const name = getPlaceName(place).toLowerCase();
  const address = (place.formattedAddress || '').toLowerCase();
  const types = (place.types || []).join(' ').toLowerCase();
  const text = `${name} ${address} ${types}`;

  if (!q || !text) return 0;
  if (text === q) return 200;
  if (text.startsWith(q)) return 140;
  if (text.includes(q)) return 120;

  const words = tokenizeSearch(q);
  if (words.length === 0) return 0;
  const matchedWords = words.filter((word) => text.includes(word));
  if (matchedWords.length !== words.length) return 0;
  return 80 + matchedWords.length * 5;
}

export default function MapViewComponent({ timeline: timelineProp }) {
  // Follow the selected/synced itinerary from App; fall back to the baked-in default.
  const timeline = timelineProp || defaultTimeline;
  const isDark = document.querySelector('[data-theme="dark"]') !== null;
  const ov = {
    bg: isDark ? '#1c1c1e' : '#fff',
    text: isDark ? '#f5f5f5' : '#1f2937',
    textDim: isDark ? '#a1a1aa' : '#6b7280',
    border: isDark ? '#2c2c2e' : '#e5e7eb',
    overlay: isDark ? 'rgba(17,17,17,0.92)' : 'rgba(255,255,255,0.92)',
  };

  // useJsApiLoader is the singleton-style loader — it dedupes across remounts (the MapView
  // component unmounts/remounts every time the user toggles the Map tab in App.jsx) so we no
  // longer get "LoadScript has been reloaded unintentionally" warnings.
  const { isLoaded, loadError } = useJsApiLoader({
    id: GOOGLE_MAPS_LOADER_ID,
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: GOOGLE_MAPS_LIBRARIES,
  });

  const mapRef = useRef(null);
  const pinsRef = useRef([]); // always-current reference to allVisiblePins
  const searchAbortRef = useRef(null);
  const lastRemoteSearchKeyRef = useRef('');
  // Imperatively-managed AdvancedMarkerElement instances, keyed by pin.key so we can diff
  // create/update/destroy across renders without mounting JSX <Marker> children.
  const advancedMarkersRef = useRef(new Map());
  const [selected, setSelected] = useState(1);
  const [activePin, setActivePin] = useState(0);
  const [selectedPin, setSelectedPin] = useState(null); // index into tabelogPins, or null
  const [carouselMode, setCarouselMode] = useState('itinerary'); // 'itinerary' | 'tabelog'
  const [layers, setLayers] = useState({ itinerary: true, tabelog: false, saves: false, allTabelog: false });
  const [showRoute, setShowRoute] = useState(true);
  const [mapReady, setMapReady] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [allTabelogCity, setAllTabelogCity] = useState('Tokyo');
  const [mealFilter, setMealFilter] = useState('all');
  const [maxPrice, setMaxPrice] = useState(15000);
  const [minRating, setMinRating] = useState('all');
  const [japaneseOnly, setJapaneseOnly] = useState(false);
  const [cuisineFilter, setCuisineFilter] = useState([]);
  const [cuisineLayout, setCuisineLayout] = useState('grouped');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedSearchPin, setSelectedSearchPin] = useState(null);

  const hasActiveFilters = maxPrice < 15000 || minRating !== 'all' || japaneseOnly || cuisineFilter.length > 0 || (layers.allTabelog && mealFilter !== 'all');
  const resetFilters = () => { setMaxPrice(15000); setMinRating('all'); setJapaneseOnly(false); setCuisineFilter([]); setMealFilter('all'); };

  const day = timeline.find(d => d.day === selected);
  const tabelogList = nearbyFinds[selected] || [];
  const savedList = getPlacesForDay(selected);
  const tokyoMeals = useMemo(
    () => getMealDatasets(tabelogTokyoAll, tabelogTokyoDinnerAll),
    [],
  );
  const osakaMeals = useMemo(
    () => ({ all: tabelogOsakaAll, lunch: tabelogOsakaLunchAll, dinner: tabelogOsakaDinnerAll }),
    [],
  );
  const allTabelogSource = useMemo(
    () => {
      const meals = allTabelogCity === 'Osaka' ? osakaMeals : tokyoMeals;
      return meals[mealFilter] || meals.all;
    },
    [allTabelogCity, mealFilter, osakaMeals, tokyoMeals],
  );
  const toggleLayer = (key) => setLayers(prev => ({ ...prev, [key]: !prev[key] }));

  useEffect(() => {
    setAllTabelogCity(inferTabelogCity(day));
    setMealFilter('all');
  }, [day]);

  const itineraryPins = useMemo(() => {
    if (!day) return [];
    return day.schedule.map((s, i) => {
      const coord = getScheduleCoord(s, day.location);
      if (!coord) return null;
      const cfg = TYPE_CONFIG[s.type] || TYPE_CONFIG.activity;
      return { ...s, coord, cfg, index: i, key: `itin-${i}` };
    }).filter(Boolean);
  }, [day]);

  const cuisineTags = useMemo(() => {
    const source = layers.allTabelog ? allTabelogSource : tabelogList;
    return extractCuisineTags(source, japaneseOnly);
  }, [tabelogList, japaneseOnly, layers.allTabelog, allTabelogSource]);
  const cuisineSections = useMemo(() => groupCuisineTags(cuisineTags), [cuisineTags]);

  const tabelogPins = useMemo(() => {
    let filtered = tabelogList;
    if (maxPrice < 15000) filtered = filtered.filter(r => parsePrice(r.price) <= maxPrice);
    if (minRating !== 'all') { const min = parseFloat(minRating); filtered = filtered.filter(r => r.rating >= min); }
    if (cuisineFilter.length > 0) filtered = filtered.filter(r => {
      const cats = normalizeCuisineTags(r.cuisine, { japaneseOnly }).join(' ').toLowerCase();
      return cuisineFilter.some(c => cats.includes(c));
    });
    if (japaneseOnly) filtered = filtered.filter(r => matchesJapaneseOnly(r.cuisine));
    return filtered.map((r, i) => {
      const coord = getTabelogCoord(r);
      if (!coord) return null;
      return { ...r, coord, key: `tab-${i}` };
    }).filter(Boolean);
  }, [tabelogList, maxPrice, minRating, cuisineFilter, japaneseOnly]);

  const savedPins = useMemo(() => {
    return savedList.map((p, i) => {
      const coord = getSavedPlaceCoord(p);
      if (!coord) return null;
      return { ...p, coord, key: `save-${i}` };
    }).filter(Boolean);
  }, [savedList]);

  // Build searchable restaurants from full Tabelog list + allTabelogSource when layer is on
  const searchableRestaurants = useMemo(() => {
    const restaurants = allTabelogSource;
    return restaurants
      .map((r, i) => {
        const coord = getTabelogCoord(r);
        if (!coord) return null;
        return {
          id: `tabelog-${i}`,
          source: 'tabelog',
          title: r.name || r.title || '',
          subtitle: r.cuisine || r.tags || '',
          coord,
          rating: r.rating || 0,
          pin: { ...r, coord, kind: 'restaurant', source: 'tabelog' },
        };
      })
      .filter(Boolean);
  }, [allTabelogSource]);

  // All 1200 Tabelog pins (filtered)
  const allTabelogPins = useMemo(() => {
    if (!layers.allTabelog) return [];
    let filtered = allTabelogSource;
    if (maxPrice < 15000) filtered = filtered.filter(r => parsePrice(r.price) <= maxPrice);
    if (minRating !== 'all') { const min = parseFloat(minRating); filtered = filtered.filter(r => r.rating >= min); }
    if (cuisineFilter.length > 0) filtered = filtered.filter(r => {
      const cats = normalizeCuisineTags(r.cuisine, { japaneseOnly }).join(' ').toLowerCase();
      return cuisineFilter.some(c => cats.includes(c));
    });
    if (japaneseOnly) filtered = filtered.filter(r => matchesJapaneseOnly(r.cuisine));
    return filtered
      .filter(r => r.lat && r.lng)
      .map((r, i) => ({
        ...r,
        coord: { latitude: r.lat, longitude: r.lng },
        key: `all-${i}`,
      }));
  }, [layers.allTabelog, allTabelogSource, maxPrice, minRating, cuisineFilter, japaneseOnly]);

  const allVisiblePins = useMemo(() => {
    const pins = [];
    if (layers.itinerary) itineraryPins.forEach(p => pins.push({
      ...p, kind: 'itinerary', title: p.activity,
      subtitle: `${p.time} · ${p.cfg.label}`, color: p.cfg.color, number: p.index + 1,
    }));
    if (layers.tabelog) tabelogPins.forEach(p => pins.push({
      ...p, kind: 'tabelog', title: p.name,
      subtitle: `#${p.rank} · ${p.rating}★ · ${p.cuisine}`, color: '#ea580c',
    }));
    if (layers.saves) savedPins.forEach(p => pins.push({
      ...p, kind: 'saves', title: p.name,
      subtitle: `${p.type}${p.area ? ' · ' + p.area : ''}`, color: '#2563eb',
    }));
    if (layers.allTabelog) allTabelogPins.forEach(p => pins.push({
      ...p, kind: 'tabelog', title: p.name,
      subtitle: `${p.rating}★ · ${p.cuisine}`, color: '#f97316',
    }));
    return pins;
  }, [layers, itineraryPins, tabelogPins, savedPins, allTabelogPins]);

  // Itinerary carousel pins
  const carouselPins = useMemo(() => {
    if (!layers.itinerary) return [];
    return itineraryPins.map(p => ({
      ...p, kind: 'itinerary', title: p.activity,
      subtitle: `${p.time} · ${p.cfg.label}`, color: p.cfg.color, number: p.index + 1,
    }));
  }, [layers.itinerary, itineraryPins]);

  // Non-itinerary pins (tabelog + saves) for their own carousel
  const nonItinPins = useMemo(() => allVisiblePins.filter(p => p.kind !== 'itinerary'), [allVisiblePins]);

  // Keep ref in sync so click handler always has current data
  useEffect(() => {
    pinsRef.current = allVisiblePins;
  }, [allVisiblePins]);

  const searchablePins = useMemo(() => allVisiblePins.map((pin) => ({
    id: pin.key,
    source: pin.kind,
    title: pin.title,
    subtitle: pin.subtitle,
    coord: pin.coord,
    pin,
  })), [allVisiblePins]);

  // The currently displayed non-itinerary pin (if in tabelog mode)
  const activeNonItinPin = carouselMode === 'tabelog' && selectedPin != null ? nonItinPins[selectedPin] : null;

  const routePath = useMemo(() => {
    if (!layers.itinerary || itineraryPins.length < 2) return [];
    return itineraryPins.map(p => ({ lat: p.coord.latitude, lng: p.coord.longitude }));
  }, [layers.itinerary, itineraryPins]);

  // Map ready callback
  const onMapLoad = useCallback((mapInstance) => {
    mapRef.current = mapInstance;
    setMapReady(true);
  }, []);

  // Imperatively manage AdvancedMarkerElement instances. Replaces the deprecated
  // google.maps.Marker (used by <Marker> from @react-google-maps/api). We diff against
  // advancedMarkersRef.current so each render creates/updates/removes only what changed.
  // Click handlers read from pinsRef so they always see the latest pin list.
  useEffect(() => {
    if (!mapReady || !mapRef.current || typeof window === 'undefined') return;
    const gm = window.google?.maps;
    if (!gm?.marker?.AdvancedMarkerElement) return;

    const { AdvancedMarkerElement, PinElement } = gm.marker;
    const map = mapRef.current;
    const existing = advancedMarkersRef.current;
    const nextKeys = new Set();

    const buildContent = (pin) => {
      // Custom HTML content preserves the existing numbered-circle look (PinElement's glyph
      // is anchored differently and can't reproduce the centered numeral with a white border).
      const isActiveItin = pin.kind === 'itinerary' && pin.index === activePin;
      const size = isActiveItin ? 28 : 24;
      const glyph = pin.number != null
        ? String(pin.number)
        : pin.kind === 'tabelog'
          ? '★'
          : '♥';
      const div = document.createElement('div');
      div.style.width = `${size}px`;
      div.style.height = `${size}px`;
      div.style.borderRadius = '50%';
      div.style.background = pin.color;
      div.style.border = '3px solid #ffffff';
      div.style.boxShadow = '0 1px 3px rgba(0,0,0,0.35)';
      div.style.display = 'flex';
      div.style.alignItems = 'center';
      div.style.justifyContent = 'center';
      div.style.color = '#ffffff';
      div.style.fontFamily = 'Arial, sans-serif';
      div.style.fontWeight = '700';
      div.style.fontSize = `${Math.max(10, Math.round(size * 0.45))}px`;
      div.style.lineHeight = '1';
      div.style.cursor = 'pointer';
      div.style.transform = 'translateY(0)'; // anchor center via gmpDraggable=false default
      div.textContent = glyph;
      return div;
    };

    // Reference PinElement to silence unused-import warnings; reserved for future use if we
    // ever want to drop the custom DOM and use the canonical pin shape instead.
    void PinElement;

    pinsRef.current.forEach((pin) => {
      nextKeys.add(pin.key);
      const position = { lat: pin.coord.latitude, lng: pin.coord.longitude };
      let entry = existing.get(pin.key);
      if (!entry) {
        const content = buildContent(pin);
        const marker = new AdvancedMarkerElement({
          map,
          position,
          content,
          title: pin.title || '',
        });
        const listener = marker.addListener('gmp-click', () => {
          // Look up the pin from pinsRef at click time — by-key resolution survives reorders.
          const current = pinsRef.current.find((p) => p.key === pin.key);
          if (!current) return;
          if (current.kind === 'itinerary') {
            setActivePin(current.index);
            setCarouselMode('itinerary');
            setSelectedPin(null);
          } else {
            const nonItin = pinsRef.current.filter((p) => p.kind !== 'itinerary');
            const idx = nonItin.findIndex((p) => p.key === current.key);
            setSelectedPin(idx >= 0 ? idx : 0);
            setCarouselMode('tabelog');
          }
        });
        entry = { marker, listener, color: pin.color, glyphKey: `${pin.number ?? pin.kind}`, isActiveItin: pin.kind === 'itinerary' && pin.index === activePin };
        existing.set(pin.key, entry);
      } else {
        // Update position (cheap) and content only if visual state changed.
        entry.marker.position = position;
        const isActiveItin = pin.kind === 'itinerary' && pin.index === activePin;
        const glyphKey = `${pin.number ?? pin.kind}`;
        if (entry.color !== pin.color || entry.glyphKey !== glyphKey || entry.isActiveItin !== isActiveItin) {
          entry.marker.content = buildContent(pin);
          entry.color = pin.color;
          entry.glyphKey = glyphKey;
          entry.isActiveItin = isActiveItin;
        }
        if (entry.marker.map !== map) entry.marker.map = map;
      }
    });

    // Drop markers no longer in the visible list.
    existing.forEach((entry, key) => {
      if (!nextKeys.has(key)) {
        if (entry.listener?.remove) entry.listener.remove();
        entry.marker.map = null;
        existing.delete(key);
      }
    });
  }, [allVisiblePins, activePin, mapReady]);

  // Cleanup on unmount — make sure no orphaned markers stay attached to the map instance.
  useEffect(() => {
    return () => {
      const existing = advancedMarkersRef.current;
      existing.forEach((entry) => {
        if (entry.listener?.remove) entry.listener.remove();
        if (entry.marker) entry.marker.map = null;
      });
      existing.clear();
    };
  }, []);

  // Fit map only when day changes (not on layer/filter toggles)
  useEffect(() => {
    if (!mapRef.current || !mapReady) return;
    const dayPins = itineraryPins;
    if (dayPins.length > 1) {
      const bounds = new window.google.maps.LatLngBounds();
      dayPins.forEach(p => bounds.extend({ lat: p.coord.latitude, lng: p.coord.longitude }));
      mapRef.current.fitBounds(bounds, { padding: { top: 80, right: 60, bottom: 160, left: 60 } });
    } else if (dayPins.length === 1) {
      mapRef.current.panTo({ lat: dayPins[0].coord.latitude, lng: dayPins[0].coord.longitude });
      mapRef.current.setZoom(14);
    } else if (day) {
      const c = getDayCenter(day);
      mapRef.current.panTo({ lat: c.latitude, lng: c.longitude });
      mapRef.current.setZoom(13);
    }
    setActivePin(0);
    setSelectedPin(null);
    setCarouselMode('itinerary');
  }, [selected, mapReady, itineraryPins, day]);

  const focusPin = useCallback((idx) => {
    if (idx < 0 || idx >= carouselPins.length) return;
    setActivePin(idx);
    setCarouselMode('itinerary');
    setSelectedSearchPin(null); // clear any active search result so the camera + card both update
    const pin = carouselPins[idx];
    if (pin?.coord && mapRef.current) {
      const target = { lat: pin.coord.latitude, lng: pin.coord.longitude };
      mapRef.current.panTo(target);
      // Defer zoom so panTo's animation kicks in cleanly. Always zoom in to a per-pin level
      // (17 ≈ block-level) when navigating between schedule items so the user can see the
      // surroundings without the camera staying at fit-bounds.
      requestAnimationFrame(() => {
        if (!mapRef.current) return;
        const z = mapRef.current.getZoom();
        if (z == null || z < 17) mapRef.current.setZoom(17);
      });
    }
  }, [carouselPins]);

  const openDirections = (pin) => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${pin.coord.latitude},${pin.coord.longitude}`, '_blank');
  };

  useEffect(() => {
    const query = searchQuery.trim();
    if (!query) {
      searchAbortRef.current?.abort?.();
      lastRemoteSearchKeyRef.current = '';
      setSearchResults([]);
      setIsSearching(false);
      return;
    }
    const timeoutId = setTimeout(async () => {
      const normalized = query.toLowerCase();
      const center = mapRef.current?.getCenter();
      const centerLat = center?.lat() || 35.6762;
      const centerLng = center?.lng() || 139.6503;
      const cityBias = allTabelogCity.toLowerCase();

      const dedupeById = (items) => {
        const seen = new Set();
        return items.filter((item) => {
          const key = item.id || `${item.title}__${item.coord?.latitude}__${item.coord?.longitude}`;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
      };

      // 1. Search Tabelog restaurants first (prioritize exact/partial matches)
      const restaurantMatches = searchableRestaurants
        .filter((item) => {
          return scoreSearchText(query, item.title, item.subtitle) > 0;
        })
        .map((item) => ({
          ...item,
          quality: scoreSearchText(query, item.title, item.subtitle),
          distance: calculateDistance(centerLat, centerLng, item.coord.latitude, item.coord.longitude),
        }))
        .sort((a, b) => {
          if (b.quality !== a.quality) return b.quality - a.quality;
          return a.distance - b.distance;
        });

      // 2. Search local itinerary/saved pins
      const localMatches = searchablePins
        .filter((item) => scoreSearchText(query, item.title, item.subtitle) > 0)
        .map((item) => ({
          ...item,
          quality: scoreSearchText(query, item.title, item.subtitle),
          distance: calculateDistance(centerLat, centerLng, item.coord.latitude, item.coord.longitude),
        }))
        .sort((a, b) => {
          if (b.quality !== a.quality) return b.quality - a.quality;
          return a.distance - b.distance;
        });

      const localResults = dedupeById([...restaurantMatches, ...localMatches]).slice(0, 8);
      setSearchResults(localResults);

      if (!GOOGLE_MAPS_API_KEY) {
        return;
      }

      // Avoid hammering Google when local matches are already strong enough.
      if (localResults.length >= 5) {
        setIsSearching(false);
        return;
      }

      const remoteSearchKey = `${normalized}__${allTabelogCity}`;
      if (lastRemoteSearchKeyRef.current === remoteSearchKey) {
        setIsSearching(false);
        return;
      }

      lastRemoteSearchKeyRef.current = remoteSearchKey;

      try {
        searchAbortRef.current?.abort?.();
        const controller = new AbortController();
        searchAbortRef.current = controller;
        setIsSearching(true);

        // New Places API: google.maps.places.Place.searchByText. Replaces the deprecated
        // PlacesService.textSearch (deprecated for new customers 2025-03-01).
        const placesLib = await window.google.maps.importLibrary('places');
        if (controller.signal.aborted) {
          setIsSearching(false);
          return;
        }
        const PlaceCtor = placesLib?.Place || window.google.maps.places?.Place;
        if (!PlaceCtor?.searchByText) {
          setIsSearching(false);
          return;
        }

        const { places } = await PlaceCtor.searchByText({
          textQuery: query,
          fields: ['id', 'displayName', 'location', 'formattedAddress', 'types', 'rating', 'userRatingCount'],
          locationBias: {
            circle: {
              center: { lat: centerLat, lng: centerLng },
              radius: 50000,
            },
          },
          language: 'en',
          region: 'JP',
          maxResultCount: 8,
        });

        if (controller.signal.aborted) {
          setIsSearching(false);
          return;
        }

        const remote = (places || [])
          .filter((place) => isJapanGooglePlace(place))
          .map((place) => {
            const ll = getPlaceLatLng(place);
            if (!ll) return null;
            const distance = calculateDistance(centerLat, centerLng, ll.lat, ll.lng);
            const quality = calculateMatchQuality(query, place);
            const name = getPlaceName(place);
            const address = place.formattedAddress || '';
            const cityText = `${name} ${address}`.toLowerCase();
            const cityBonus = cityText.includes(cityBias) ? 25 : 0;
            return {
              id: place.id,
              source: 'google',
              title: name || 'Unknown Place',
              subtitle: address,
              coord: { latitude: ll.lat, longitude: ll.lng },
              distance,
              quality: quality + cityBonus,
            };
          })
          .filter(Boolean)
          .filter((r) => r.quality > 20) // Filter out low quality matches
          .sort((a, b) => {
            if (b.quality !== a.quality) return b.quality - a.quality;
            return a.distance - b.distance;
          });

        // 3. Combine: Tabelog restaurants first, then local pins, then Google results
        const allResults = dedupeById([...localResults, ...remote]).slice(0, 8);
        setSearchResults(allResults);
        setIsSearching(false);
      } catch (error) {
        if (error?.name !== 'AbortError') {
          console.error('Search error:', error);
          setSearchResults(localResults);
        }
        setIsSearching(false);
      }
    }, 300);
    return () => {
      clearTimeout(timeoutId);
      searchAbortRef.current?.abort?.();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, allTabelogCity]);

  const handleSelectSearchResult = useCallback((result) => {
    setSearchOpen(false);
    setSearchQuery(result.title);
    if (result.source !== 'google' && result.pin) {
      if (result.pin.kind === 'itinerary') {
        setCarouselMode('itinerary');
        setSelectedPin(null);
        setActivePin(result.pin.index);
      } else {
        const idx = nonItinPins.findIndex(p => p.key === result.pin.key);
        setCarouselMode('tabelog');
        setSelectedPin(idx >= 0 ? idx : 0);
      }
    }
    setSelectedSearchPin(result);
    if (mapRef.current) {
      mapRef.current.panTo({
        lat: result.coord.latitude,
        lng: result.coord.longitude,
      });
      mapRef.current.setZoom(15);
    }
  }, [nonItinPins]);

  // Display pin from carousel or search result
  const displayPin = selectedSearchPin 
    ? {
        ...selectedSearchPin,
        color: '#1d4ed8',
        number: null,
        kind: 'search',
      }
    : (carouselMode === 'tabelog' ? activeNonItinPin : carouselPins[activePin]);

  if (loadError) return <div>Error loading maps</div>;
  if (!isLoaded) return <div>Loading maps...</div>;

  return (
    <div style={{ position: 'relative', width: '100%', height: 'calc(100dvh - 56px - env(safe-area-inset-top, 0px))', overflow: 'hidden' }}>
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '100%' }}
        center={INITIAL_CENTER}
        zoom={INITIAL_ZOOM}
        onLoad={onMapLoad}
        options={{
          // mapId is required for AdvancedMarkerElement. Inline `styles` is incompatible with
          // mapId-styled maps — styling is configured in Cloud Console against the Map ID instead.
          mapId: RESOLVED_MAP_ID,
          disableDefaultUI: false,
          zoomControl: true,
          mapTypeControl: false,
          scaleControl: false,
          streetViewControl: false,
          rotateControl: false,
          fullscreenControl: false,
        }}
      >
        {/* Route Polyline */}
        {showRoute && routePath.length > 0 && (
          <Polyline
            path={routePath}
            options={{
              strokeColor: '#b91c1c',
              strokeOpacity: 1,
              strokeWeight: 3,
            }}
          />
        )}

        {/* Pins are rendered imperatively as AdvancedMarkerElement instances — see the
            useEffect below keyed on [allVisiblePins, activePin, mapReady]. The legacy <Marker>
            component from @react-google-maps/api uses google.maps.Marker which Google
            deprecated 2024-02-21. */}

        {/* Active-pin highlight — thin yellow ring, no fill, won't block clicks on neighboring pins */}
        {activeNonItinPin && (
          <Circle
            center={{ lat: activeNonItinPin.coord.latitude, lng: activeNonItinPin.coord.longitude }}
            radius={25}
            options={{
              fillOpacity: 0,
              strokeColor: '#facc15',
              strokeOpacity: 0.9,
              strokeWeight: 2,
              clickable: false,
            }}
          />
        )}

        {/* Search-result highlight — thin blue ring, transparent fill */}
        {selectedSearchPin && (
          <Circle
            center={{ lat: selectedSearchPin.coord.latitude, lng: selectedSearchPin.coord.longitude }}
            radius={25}
            options={{
              fillOpacity: 0,
              strokeColor: '#1d4ed8',
              strokeOpacity: 0.85,
              strokeWeight: 2,
              clickable: false,
            }}
          />
        )}
      </GoogleMap>

      {/* Day selector */}
      <div style={{ position: 'absolute', top: 12, left: 12, right: 60, zIndex: 10 }}>
        <div style={{ overflowX: 'auto', paddingBottom: 4 }}>
          <Group gap={6} wrap="nowrap">
            {timeline.map(d => {
              const active = d.day === selected;
              return (
                <UnstyledButton
                  key={d.day}
                  onClick={() => setSelected(d.day)}
                  style={{
                    flexShrink: 0, minWidth: 60, textAlign: 'center',
                    padding: '6px 12px', borderRadius: 20,
                    background: active ? '#b91c1c' : ov.bg,
                    color: active ? '#fff' : ov.text,
                    border: `1.5px solid ${active ? '#b91c1c' : ov.border}`,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                    transition: 'all 0.2s',
                  }}
                >
                  <Text size="xs" fw={700}>{d.day === 0 ? 'Travel' : d.day === 15 ? 'End' : `D${d.day}`}</Text>
                  <Text size="10px" opacity={active ? 0.8 : 0.5}>{d.date.replace('July ', '7/')}</Text>
                </UnstyledButton>
              );
            })}
          </Group>
        </div>
      </div>

      {/* Layer toggles */}
      <div style={{ position: 'absolute', top: 60, left: 12, zIndex: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
        {[
          { key: 'itinerary', label: 'Itinerary', color: '#b91c1c', icon: <IconRoute size={14} /> },
          { key: 'tabelog', label: 'Nearby', color: '#ea580c', icon: <IconStarFilled size={14} /> },
          { key: 'allTabelog', label: 'All Tabelog', color: '#f97316', icon: <IconStarFilled size={14} /> },
          { key: 'saves', label: 'Saves', color: '#2563eb', icon: <IconBookmark size={14} /> },
        ].map(({ key, label, color, icon }) => {
          const active = layers[key];
          const count = key === 'itinerary' ? itineraryPins.length
            : key === 'tabelog' ? tabelogPins.length
            : key === 'allTabelog' ? allTabelogPins.length
            : savedPins.length;
          return (
            <UnstyledButton
              key={key}
              onClick={() => toggleLayer(key)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '6px 10px', borderRadius: 20,
                background: active ? color : ov.bg,
                color: active ? '#fff' : ov.text,
                border: `1.5px solid ${active ? color : ov.border}`,
                boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
                fontSize: 12, fontWeight: 600, transition: 'all 0.2s',
              }}
            >
              {icon} {label}
              <span style={{
                background: active ? 'rgba(255,255,255,0.3)' : (isDark ? '#2c2c2e' : '#f3f4f6'),
                borderRadius: 10, padding: '1px 6px', fontSize: 10, fontWeight: 700,
              }}>{count}</span>
            </UnstyledButton>
          );
        })}
        <UnstyledButton
          onClick={() => setShowRoute(prev => !prev)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '6px 10px', borderRadius: 20,
            background: showRoute ? '#b91c1c' : ov.bg,
            color: showRoute ? '#fff' : ov.text,
            border: `1.5px solid ${showRoute ? '#b91c1c' : ov.border}`,
            boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
            fontSize: 12, fontWeight: 600, transition: 'all 0.2s',
          }}
        >
          <IconTimeline size={14} /> Trail
        </UnstyledButton>

        {/* Filter button — when any Tabelog layer is active */}
        {(layers.tabelog || layers.allTabelog) && (
          <UnstyledButton
            onClick={() => setShowFilters(prev => !prev)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '6px 10px', borderRadius: 20,
              background: showFilters || hasActiveFilters ? '#ea580c' : ov.bg,
              color: showFilters || hasActiveFilters ? '#fff' : ov.text,
              border: `1.5px solid ${showFilters || hasActiveFilters ? '#ea580c' : ov.border}`,
              boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
              fontSize: 12, fontWeight: 600, transition: 'all 0.2s',
            }}
          >
            <IconFilter size={14} /> Filter
            {hasActiveFilters && (
              <span style={{
                background: 'rgba(255,255,255,0.3)',
                borderRadius: 10, padding: '1px 6px', fontSize: 10, fontWeight: 700,
              }}>on</span>
            )}
          </UnstyledButton>
        )}

        {/* Filter bottom sheet */}
        {(layers.tabelog || layers.allTabelog) && showFilters && (
          <>
            {/* Backdrop */}
            <div
              onClick={() => setShowFilters(false)}
              style={{
                position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
                zIndex: 999,
              }}
            />
            <div style={{
              position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
              width: '100%', maxWidth: 480, zIndex: 1000,
              background: ov.bg, borderRadius: '16px 16px 0 0',
              padding: '12px 20px calc(env(safe-area-inset-bottom, 20px) + 16px)',
              boxShadow: '0 -4px 24px rgba(0,0,0,0.2)',
              maxHeight: '75vh', overflowY: 'auto',
              WebkitOverflowScrolling: 'touch',
            }}>
              {/* Handle bar */}
              <div style={{ width: 36, height: 4, borderRadius: 2, background: ov.textDim, margin: '0 auto 12px', opacity: 0.4 }} />

              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Text size="sm" fw={700}>Filter Restaurants</Text>
                {hasActiveFilters && (
                  <UnstyledButton onClick={resetFilters} style={{ fontSize: 12, fontWeight: 600, color: '#ea580c' }}>
                    Reset all
                  </UnstyledButton>
                )}
              </div>

              {/* Price */}
              {layers.allTabelog && (
                <>
                  <Text size="xs" fw={700} c="dimmed" tt="uppercase" mb={8}>City</Text>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
                    {['Tokyo', 'Osaka'].map((city) => (
                      <UnstyledButton
                        key={city}
                        onClick={() => {
                          setAllTabelogCity(city);
                          setMealFilter('all');
                          setCuisineFilter([]);
                        }}
                        style={{
                          padding: '8px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600,
                          background: allTabelogCity === city ? '#ea580c' : ov.border,
                          color: allTabelogCity === city ? '#fff' : ov.textDim,
                          transition: 'all 0.15s',
                        }}
                      >
                        {city}
                      </UnstyledButton>
                    ))}
                  </div>

                  <>
                    <Text size="xs" fw={700} c="dimmed" tt="uppercase" mb={8}>Meal</Text>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
                      {[
                        { label: 'All', value: 'all' },
                        { label: 'Lunch', value: 'lunch' },
                        { label: 'Dinner', value: 'dinner' },
                      ].map(({ label, value }) => (
                        <UnstyledButton
                          key={value}
                          onClick={() => {
                            setMealFilter(value);
                            setCuisineFilter([]);
                          }}
                          style={{
                            padding: '8px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600,
                            background: mealFilter === value ? '#ea580c' : ov.border,
                            color: mealFilter === value ? '#fff' : ov.textDim,
                            transition: 'all 0.15s',
                          }}
                        >
                          {label}
                        </UnstyledButton>
                      ))}
                    </div>
                  </>
                </>
              )}

              {/* Price */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <Text size="xs" fw={700} c="dimmed" tt="uppercase">Price</Text>
                <Text size="xs" fw={600} c="orange">
                  {maxPrice >= 15000 ? 'Any' : `≤ ¥${(maxPrice / 1000).toFixed(0)}k`}
                </Text>
              </div>
              <div style={{ padding: '0 4px 20px' }}>
                <Slider
                  value={maxPrice} onChange={setMaxPrice}
                  min={1000} max={15000} step={1000}
                  label={(v) => v >= 15000 ? 'Any' : `¥${(v / 1000).toFixed(0)}k`}
                  color="orange" size="md"
                  marks={[{ value: 1000, label: '¥1k' }, { value: 6000, label: '¥6k' }, { value: 15000, label: 'Any' }]}
                  styles={{ markLabel: { fontSize: 10 } }}
                />
              </div>

              {/* Rating */}
              <Text size="xs" fw={700} c="dimmed" tt="uppercase" mb={8}>Rating</Text>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
                {['all', '3.9', '3.8', '3.7', '3.6'].map(v => (
                  <UnstyledButton
                    key={v}
                    onClick={() => setMinRating(v)}
                    style={{
                      padding: '8px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600,
                      background: minRating === v ? '#ea580c' : ov.border,
                      color: minRating === v ? '#fff' : ov.textDim,
                      transition: 'all 0.15s',
                    }}
                  >
                    {v === 'all' ? 'All' : `${v}+`}
                  </UnstyledButton>
                ))}
              </div>

              {/* Japanese only */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingTop: 12, borderTop: `1px solid ${ov.border}` }}>
                <Text size="xs" fw={700} c="dimmed" tt="uppercase">Japanese only</Text>
                <Switch
                  size="sm" checked={japaneseOnly}
                  onChange={(e) => { setJapaneseOnly(e.currentTarget.checked); setCuisineFilter([]); }}
                  color="red"
                />
              </div>

              {/* Cuisine tags — horizontal wrap */}
              <Text size="xs" fw={700} c="dimmed" tt="uppercase" mb={8}>Cuisine</Text>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
                {[
                  { label: 'Grouped', value: 'grouped' },
                  { label: 'Flat', value: 'flat' },
                ].map(({ label, value }) => (
                  <UnstyledButton
                    key={value}
                    onClick={() => setCuisineLayout(value)}
                    style={{
                      padding: '6px 12px', borderRadius: 16, fontSize: 12, fontWeight: 600,
                      background: cuisineLayout === value ? '#ea580c' : ov.border,
                      color: cuisineLayout === value ? '#fff' : ov.textDim,
                    }}
                  >
                    {label}
                  </UnstyledButton>
                ))}
              </div>
              {cuisineLayout === 'flat' ? (
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
                  {cuisineTags.map(([key, label]) => (
                    <UnstyledButton
                      key={key}
                      onClick={() => setCuisineFilter(prev => prev.includes(key) ? prev.filter(c => c !== key) : [...prev, key])}
                      style={{
                        padding: '6px 12px', borderRadius: 16, fontSize: 12, fontWeight: 500,
                        background: cuisineFilter.includes(key) ? '#ea580c' : ov.border,
                        color: cuisineFilter.includes(key) ? '#fff' : ov.textDim,
                        transition: 'all 0.15s',
                      }}
                    >
                      {label}
                    </UnstyledButton>
                  ))}
                </div>
              ) : (
                <div style={{ marginBottom: 12, display: 'grid', gap: 10 }}>
                  {cuisineSections.map((section) => (
                    <div key={section.title}>
                      <Text size="xs" fw={700} c="dimmed" tt="uppercase" mb={6}>{section.title}</Text>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {section.items.map(([key, label]) => (
                          <UnstyledButton
                            key={key}
                            onClick={() => setCuisineFilter(prev => prev.includes(key) ? prev.filter(c => c !== key) : [...prev, key])}
                            style={{
                              padding: '6px 12px', borderRadius: 16, fontSize: 12, fontWeight: 500,
                              background: cuisineFilter.includes(key) ? '#ea580c' : ov.border,
                              color: cuisineFilter.includes(key) ? '#fff' : ov.textDim,
                              transition: 'all 0.15s',
                            }}
                          >
                            {label}
                          </UnstyledButton>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Done button */}
              <UnstyledButton
                onClick={() => setShowFilters(false)}
                style={{
                  width: '100%', textAlign: 'center', padding: '12px 0', marginTop: 8,
                  fontSize: 14, fontWeight: 700, color: '#fff', background: '#ea580c',
                  borderRadius: 12,
                }}
              >
                Done
              </UnstyledButton>
            </div>
          </>
        )}
      </div>

      <div style={{ position: 'absolute', top: 62, left: 240, right: 200, zIndex: 11 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px',
          borderRadius: 12, border: `1px solid ${ov.border}`, background: ov.overlay,
          boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
        }}>
          <IconSearch size={16} color={ov.textDim} />
          <input
            value={searchQuery}
            onFocus={() => setSearchOpen(true)}
            onChange={(e) => { setSearchQuery(e.currentTarget.value); setSearchOpen(true); }}
            placeholder="Search POIs, restaurants, stations..."
            style={{
              flex: 1, border: 'none', outline: 'none', background: 'transparent',
              color: ov.text, fontSize: 13, fontWeight: 500,
            }}
          />
          {searchQuery && (
            <ActionIcon variant="subtle" color="gray" size="sm" onClick={() => { setSearchQuery(''); setSearchResults([]); setSelectedSearchPin(null); }}>
              <IconX size={14} />
            </ActionIcon>
          )}
        </div>
        {searchOpen && searchQuery.trim() && (
          <div style={{
            marginTop: 6, borderRadius: 12, border: `1px solid ${ov.border}`, background: ov.bg,
            boxShadow: '0 6px 20px rgba(0,0,0,0.18)', overflow: 'hidden', maxHeight: '300px', overflowY: 'auto',
          }}>
            {isSearching && searchResults.length === 0 && (
              <Text size="xs" c="dimmed" px={12} py={8}>Searching…</Text>
            )}
            {!isSearching && searchResults.length === 0 && (
              <Text size="xs" c="dimmed" px={12} py={8}>No results found</Text>
            )}
            {searchResults.map((result) => (
              <div
                key={result.id}
                onClick={() => handleSelectSearchResult(result)}
                onKeyDown={(e) => e.key === 'Enter' && handleSelectSearchResult(result)}
                role="button"
                tabIndex={0}
                style={{
                  width: '100%', padding: '10px 12px', textAlign: 'left', borderTop: `1px solid ${ov.border}`,
                  display: 'grid', gap: 2, cursor: 'pointer', transition: 'background 0.1s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = ov.border}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <Text size="sm" fw={600} lineClamp={1}>
                  {result.title}
                  {result.distance && <span style={{ fontSize: 11, fontWeight: 400, color: ov.textDim, marginLeft: 8 }}>
                    {result.distance.toFixed(1)} km
                  </span>}
                </Text>
                <Text size="xs" c="dimmed" lineClamp={1}>
                  {result.source === 'itinerary' ? 'In itinerary' : result.subtitle}
                </Text>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom card + carousel controls — hidden when filter sheet is open */}
      {!showFilters && displayPin && (
        <div style={{ position: 'absolute', bottom: 'env(safe-area-inset-bottom, 12px)', left: 0, right: 0, zIndex: 10, paddingBottom: 4 }}>
          {/* Carousel arrows — hidden for search results */}
          {displayPin.kind !== 'search' && (() => {
            const list = carouselMode === 'tabelog' ? nonItinPins : carouselPins;
            const idx = carouselMode === 'tabelog' ? selectedPin : activePin;
            if (list.length === 0) return null;
            const goPrev = () => {
              const prev = Math.max(0, idx - 1);
              if (carouselMode === 'tabelog') setSelectedPin(prev);
              else focusPin(prev);
            };
            const goNext = () => {
              const next = Math.min(list.length - 1, idx + 1);
              if (carouselMode === 'tabelog') setSelectedPin(next);
              else focusPin(next);
            };
            return (
              <Group justify="center" gap="sm" mb={8}>
                <ActionIcon variant="default" radius="xl" size="md"
                  onClick={goPrev} disabled={idx === 0}
                  style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.15)', background: ov.bg, color: ov.text, borderColor: ov.border }}>
                  <IconChevronLeft size={16} />
                </ActionIcon>
                <Badge size="lg" variant="default" radius="md"
                  style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.1)', fontWeight: 700, background: ov.bg, color: ov.text, borderColor: ov.border }}>
                  {idx + 1} / {list.length}
                </Badge>
                <ActionIcon variant="default" radius="xl" size="md"
                  onClick={goNext} disabled={idx === list.length - 1}
                  style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.15)', background: ov.bg, color: ov.text, borderColor: ov.border }}>
                  <IconChevronRight size={16} />
                </ActionIcon>
              </Group>
            );
          })()}

          <div style={{ padding: '0 12px' }}>
            <Card shadow="md" radius="md" padding="sm"
              style={{
                border: `1px solid ${displayPin.color || 'var(--mantine-color-red-6)'}`,
                maxWidth: 420, margin: '0 auto',
              }}
            >
              <Group wrap="nowrap" gap="sm">
                <div style={{
                  width: 36, height: 36, borderRadius: 18, background: displayPin.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontWeight: 800, fontSize: 14, flexShrink: 0,
                }}>
                  {displayPin.number || (displayPin.kind === 'search' ? '🔍' : displayPin.kind === 'tabelog' ? '★' : '♥')}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Text fw={700} size="sm" truncate>{displayPin.title}</Text>
                  <Text size="xs" c="dimmed" truncate>{displayPin.subtitle}</Text>
                </div>
                {(carouselMode === 'tabelog' || displayPin.kind === 'search') && (
                  <Tooltip label={displayPin.kind === 'search' ? 'Close' : 'Back to itinerary'}>
                    <ActionIcon variant="subtle" color="gray" radius="xl" size="md"
                      onClick={() => {
                        if (displayPin.kind === 'search') {
                          setSelectedSearchPin(null);
                        } else {
                          setCarouselMode('itinerary');
                          setSelectedPin(null);
                        }
                      }}>
                      <IconX size={16} />
                    </ActionIcon>
                  </Tooltip>
                )}
                <Tooltip label="Get directions">
                  <ActionIcon variant="light" color="red" radius="xl" size="lg"
                    onClick={() => openDirections(displayPin)}>
                    <IconNavigation size={18} />
                  </ActionIcon>
                </Tooltip>
              </Group>
            </Card>
          </div>
        </div>
      )}

      {/* Token warning */}
      {!GOOGLE_MAPS_API_KEY && (
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          background: '#fff', padding: 24, borderRadius: 12, boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          textAlign: 'center', zIndex: 20, maxWidth: 360,
        }}>
          <Text fw={700} size="lg" mb="xs">Map needs a Google Maps API key</Text>
          <Text size="sm" c="dimmed" mb="md">
            Set <code>VITE_GOOGLE_MAP</code> in <code>japan2026/.env</code> — get a key at console.cloud.google.com/google/maps-apis
          </Text>
        </div>
      )}
    </div>
  );
}
