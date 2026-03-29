import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import {
  Text, Badge, Group, Card, ScrollArea, UnstyledButton, ActionIcon, Tooltip,
  Switch, Slider,
} from '@mantine/core';
import {
  IconStarFilled, IconBookmark, IconNavigation,
  IconChevronLeft, IconChevronRight, IconRoute, IconTimeline,
  IconFilter, IconX,
} from '@tabler/icons-react';
import { timeline } from '../data/tripData';
import { nearbyFinds } from '../data/nearbyFinds';
import { getPlacesForDay } from '../data/savedPlaces';
import {
  getScheduleCoord, getTabelogCoord, getSavedPlaceCoord, getDayCenter,
} from '../data/coords';
import { MAPBOX_TOKEN } from '../data/mapConfig';

mapboxgl.accessToken = MAPBOX_TOKEN;

const NON_JAPANESE = [
  'italian', 'french', 'indian', 'chinese', 'sichuan', 'korean',
  'thai', 'vietnamese', 'spanish', 'american', 'peruvian',
  'nepalese', 'sri lankan', 'bistro', 'pizza', 'pasta', 'steak',
];

function parsePrice(p) {
  if (!p) return 0;
  const m = p.match(/[\d,]+/);
  return m ? parseInt(m[0].replace(/,/g, ""), 10) : 0;
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

export default function MapViewComponent() {
  const isDark = document.querySelector('[data-theme="dark"]') !== null;
  const ov = {
    bg: isDark ? '#1c1c1e' : '#fff',
    text: isDark ? '#f5f5f5' : '#1f2937',
    textDim: isDark ? '#a1a1aa' : '#6b7280',
    border: isDark ? '#2c2c2e' : '#e5e7eb',
    overlay: isDark ? 'rgba(17,17,17,0.92)' : 'rgba(255,255,255,0.92)',
  };
  const mapContainer = useRef(null);
  const map = useRef(null);
  const pinsRef = useRef([]); // always-current reference to allVisiblePins
  const [selected, setSelected] = useState(1);
  const [activePin, setActivePin] = useState(0);
  const [selectedPin, setSelectedPin] = useState(null);
  const [layers, setLayers] = useState({ itinerary: true, tabelog: false, saves: false });
  const [showRoute, setShowRoute] = useState(true);
  const [mapReady, setMapReady] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [maxPrice, setMaxPrice] = useState(15000);
  const [minRating, setMinRating] = useState('all');
  const [japaneseOnly, setJapaneseOnly] = useState(false);
  const [cuisineFilter, setCuisineFilter] = useState([]);

  const hasActiveFilters = maxPrice < 15000 || minRating !== 'all' || japaneseOnly || cuisineFilter.length > 0;
  const resetFilters = () => { setMaxPrice(15000); setMinRating('all'); setJapaneseOnly(false); setCuisineFilter([]); };

  const day = timeline.find(d => d.day === selected);
  const tabelogList = nearbyFinds[selected] || [];
  const savedList = getPlacesForDay(selected);
  const toggleLayer = (key) => setLayers(prev => ({ ...prev, [key]: !prev[key] }));

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
    const cats = new Map();
    tabelogList.forEach(r => {
      (r.cuisine || '').split(/[,/]/).forEach(c => {
        const t = c.trim();
        if (t && t.length > 1) {
          const key = t.toLowerCase();
          if (japaneseOnly && NON_JAPANESE.some(nj => key.includes(nj))) return;
          if (!cats.has(key)) cats.set(key, t);
        }
      });
    });
    return [...cats.entries()].sort((a, b) => a[1].localeCompare(b[1]));
  }, [tabelogList, japaneseOnly]);

  const tabelogPins = useMemo(() => {
    let filtered = tabelogList;
    if (maxPrice < 15000) filtered = filtered.filter(r => parsePrice(r.price) <= maxPrice);
    if (minRating !== 'all') { const min = parseFloat(minRating); filtered = filtered.filter(r => r.rating >= min); }
    if (cuisineFilter.length > 0) filtered = filtered.filter(r => { const cats = (r.cuisine || '').toLowerCase(); return cuisineFilter.some(c => cats.includes(c)); });
    if (japaneseOnly) filtered = filtered.filter(r => { const cats = (r.cuisine || '').toLowerCase(); return !NON_JAPANESE.some(nj => cats.includes(nj)); });
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
    return pins;
  }, [layers, itineraryPins, tabelogPins, savedPins]);

  // Build GeoJSON for native layers
  // Carousel only navigates itinerary pins
  const carouselPins = useMemo(() => {
    if (!layers.itinerary) return [];
    return itineraryPins.map(p => ({
      ...p, kind: 'itinerary', title: p.activity,
      subtitle: `${p.time} · ${p.cfg.label}`, color: p.cfg.color, number: p.index + 1,
    }));
  }, [layers.itinerary, itineraryPins]);

  // Keep ref in sync so click handler always has current data
  pinsRef.current = allVisiblePins;

  const pinsGeoJSON = useMemo(() => ({
    type: 'FeatureCollection',
    features: allVisiblePins.map((pin, i) => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [pin.coord.longitude, pin.coord.latitude],
      },
      properties: {
        index: i,
        kind: pin.kind,
        label: pin.number ? String(pin.number) : (pin.kind === 'tabelog' ? '★' : '♥'),
        color: pin.color,
        isActive: (pin.kind === 'itinerary' && pin.index === activePin),
      },
    })),
  }), [allVisiblePins, activePin]);

  // Separate highlight GeoJSON — only rebuilds when selectedPin changes, doesn't touch main pins
  const highlightGeoJSON = useMemo(() => {
    if (!selectedPin) return { type: 'FeatureCollection', features: [] };
    return {
      type: 'FeatureCollection',
      features: [{
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [selectedPin.coord.longitude, selectedPin.coord.latitude] },
        properties: { color: selectedPin.color },
      }],
    };
  }, [selectedPin]);

  const routeGeoJSON = useMemo(() => {
    if (!layers.itinerary || itineraryPins.length < 2) return null;
    return {
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: itineraryPins.map(p => [p.coord.longitude, p.coord.latitude]),
      },
    };
  }, [layers.itinerary, itineraryPins]);

  // Init map
  useEffect(() => {
    if (map.current || !mapContainer.current) return;
    const dayCenter = day ? getDayCenter(day) : { latitude: 35.6762, longitude: 139.6503 };
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: isDark ? 'mapbox://styles/mapbox/dark-v11' : 'mapbox://styles/mapbox/light-v11',
      center: [dayCenter.longitude, dayCenter.latitude],
      zoom: 13,
    });
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
    map.current.addControl(new mapboxgl.GeolocateControl({
      positionOptions: { enableHighAccuracy: true },
      trackUserLocation: true,
    }), 'top-right');

    map.current.on('load', () => {
      // Route glow layer
      map.current.addSource('route', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
      map.current.addLayer({
        id: 'route-glow', type: 'line', source: 'route',
        paint: { 'line-color': 'rgba(185,28,28,0.12)', 'line-width': 10 },
        layout: { 'line-join': 'round', 'line-cap': 'round' },
      });
      map.current.addLayer({
        id: 'route-line', type: 'line', source: 'route',
        paint: { 'line-color': '#b91c1c', 'line-width': 3.5 },
        layout: { 'line-join': 'round', 'line-cap': 'round' },
      });

      // Pin layers — circle + label
      map.current.addSource('pins', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
      // Base circles — itinerary pins large, tabelog/saves smaller
      map.current.addLayer({
        id: 'pins-circle', type: 'circle', source: 'pins',
        paint: {
          'circle-radius': [
            'case',
            ['get', 'isActive'], 20,
            ['==', ['get', 'kind'], 'itinerary'], 16,
            10,
          ],
          'circle-color': ['get', 'color'],
          'circle-stroke-width': ['case', ['get', 'isActive'], 3, 1.5],
          'circle-stroke-color': ['case', ['get', 'isActive'], '#facc15', '#ffffff'],
        },
      });
      // Labels — all pins get their label (numbers for itinerary, ★ for tabelog, ♥ for saves)
      map.current.addLayer({
        id: 'pins-label', type: 'symbol', source: 'pins',
        layout: {
          'text-field': ['get', 'label'],
          'text-size': ['case', ['==', ['get', 'kind'], 'itinerary'], 12, 8],
          'text-font': ['DIN Pro Bold', 'Arial Unicode MS Bold'],
          'text-allow-overlap': true,
          'icon-allow-overlap': true,
        },
        paint: { 'text-color': '#ffffff' },
      });

      // Highlight ring — separate source, only for selected tabelog/saved pin
      map.current.addSource('highlight', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
      map.current.addLayer({
        id: 'highlight-ring', type: 'circle', source: 'highlight',
        paint: {
          'circle-radius': 14,
          'circle-color': ['get', 'color'],
          'circle-stroke-width': 3,
          'circle-stroke-color': '#facc15',
        },
      });

      // Click handler — show pin in bottom card (uses ref for current data)
      map.current.on('click', 'pins-circle', (e) => {
        const props = e.features?.[0]?.properties;
        if (!props) return;

        const pin = pinsRef.current[props.index];
        if (!pin) return;

        if (pin.kind === 'itinerary') {
          setActivePin(pin.index);
          setSelectedPin(null);
        } else {
          setSelectedPin(pin);
        }

        // Only fly/zoom for itinerary pins; tabelog/saves just highlight in place
        if (pin.kind === 'itinerary') {
          const currentZoom = map.current.getZoom();
          map.current.flyTo({
            center: e.features[0].geometry.coordinates,
            zoom: Math.max(currentZoom, 15),
            duration: 600,
          });
        }
      });
      map.current.on('mouseenter', 'pins-circle', () => { map.current.getCanvas().style.cursor = 'pointer'; });
      map.current.on('mouseleave', 'pins-circle', () => { map.current.getCanvas().style.cursor = ''; });

      setMapReady(true);
    });

    return () => { map.current?.remove(); map.current = null; };
  }, []);

  // Swap map style when dark mode changes
  const prevDarkRef = useRef(isDark);
  useEffect(() => {
    if (!map.current || !mapReady || isDark === prevDarkRef.current) return;
    prevDarkRef.current = isDark;
    const newStyle = isDark ? 'mapbox://styles/mapbox/dark-v11' : 'mapbox://styles/mapbox/light-v11';
    map.current.setStyle(newStyle);
    // Re-add sources and layers after style loads
    map.current.once('style.load', () => {
      // Route
      map.current.addSource('route', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
      map.current.addLayer({ id: 'route-glow', type: 'line', source: 'route', paint: { 'line-color': 'rgba(185,28,28,0.12)', 'line-width': 10 }, layout: { 'line-join': 'round', 'line-cap': 'round' } });
      map.current.addLayer({ id: 'route-line', type: 'line', source: 'route', paint: { 'line-color': '#b91c1c', 'line-width': 3.5 }, layout: { 'line-join': 'round', 'line-cap': 'round' } });
      // Pins
      map.current.addSource('pins', { type: 'geojson', data: pinsGeoJSON });
      map.current.addLayer({ id: 'pins-circle', type: 'circle', source: 'pins', paint: { 'circle-radius': ['case', ['get', 'isActive'], 20, ['==', ['get', 'kind'], 'itinerary'], 16, 10], 'circle-color': ['get', 'color'], 'circle-stroke-width': ['case', ['get', 'isActive'], 3, 1.5], 'circle-stroke-color': ['case', ['get', 'isActive'], '#facc15', '#ffffff'] } });
      map.current.addLayer({ id: 'pins-label', type: 'symbol', source: 'pins', layout: { 'text-field': ['get', 'label'], 'text-size': ['case', ['==', ['get', 'kind'], 'itinerary'], 12, 8], 'text-font': ['DIN Pro Bold', 'Arial Unicode MS Bold'], 'text-allow-overlap': true, 'icon-allow-overlap': true }, paint: { 'text-color': '#ffffff' } });
      map.current.addSource('highlight', { type: 'geojson', data: highlightGeoJSON });
      map.current.addLayer({ id: 'highlight-ring', type: 'circle', source: 'highlight', paint: { 'circle-radius': 14, 'circle-color': ['get', 'color'], 'circle-stroke-width': 3, 'circle-stroke-color': '#facc15' } });
      // Update with current data
      const routeSrc = map.current.getSource('route');
      if (routeSrc) routeSrc.setData(showRoute && routeGeoJSON ? routeGeoJSON : { type: 'FeatureCollection', features: [] });
    });
  }, [isDark, mapReady]);

  // Update route data
  useEffect(() => {
    if (!map.current || !mapReady) return;
    const src = map.current.getSource('route');
    const empty = { type: 'FeatureCollection', features: [] };
    if (src) src.setData(showRoute && routeGeoJSON ? routeGeoJSON : empty);
  }, [mapReady, routeGeoJSON, showRoute]);

  // Update pin data
  useEffect(() => {
    if (!map.current || !mapReady) return;
    const src = map.current.getSource('pins');
    if (src) src.setData(pinsGeoJSON);
  }, [mapReady, pinsGeoJSON]);

  // Update highlight ring (selected tabelog/saved pin)
  useEffect(() => {
    if (!map.current || !mapReady) return;
    const src = map.current.getSource('highlight');
    if (src) src.setData(highlightGeoJSON);
  }, [mapReady, highlightGeoJSON]);

  // Fit map only when day changes (not on layer/filter toggles)
  useEffect(() => {
    if (!map.current || !mapReady) return;
    const dayPins = itineraryPins;
    if (dayPins.length > 1) {
      const bounds = new mapboxgl.LngLatBounds();
      dayPins.forEach(p => bounds.extend([p.coord.longitude, p.coord.latitude]));
      map.current.fitBounds(bounds, { padding: { top: 80, right: 60, bottom: 160, left: 60 }, duration: 1000 });
    } else if (dayPins.length === 1) {
      map.current.flyTo({ center: [dayPins[0].coord.longitude, dayPins[0].coord.latitude], zoom: 14, duration: 1000 });
    } else if (day) {
      const c = getDayCenter(day);
      map.current.flyTo({ center: [c.longitude, c.latitude], zoom: 13, duration: 1000 });
    }
    setActivePin(0);
    setSelectedPin(null);
  }, [selected, mapReady]);

  const focusPin = useCallback((idx) => {
    if (idx < 0 || idx >= carouselPins.length) return;
    setActivePin(idx);
    setSelectedPin(null); // back to carousel mode
    const pin = carouselPins[idx];
    if (pin?.coord && map.current) {
      map.current.flyTo({
        center: [pin.coord.longitude, pin.coord.latitude],
        zoom: 15, duration: 800,
      });
    }
  }, [carouselPins]);

  const openDirections = (pin) => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${pin.coord.latitude},${pin.coord.longitude}`, '_blank');
  };

  const displayPin = selectedPin || carouselPins[activePin];

  return (
    <div style={{ position: 'relative', width: '100%', height: 'calc(100dvh - 56px - env(safe-area-inset-top, 0px))', overflow: 'hidden' }}>
      <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />

      {/* Day selector */}
      <div style={{ position: 'absolute', top: 12, left: 12, right: 60, zIndex: 10 }}>
        <ScrollArea type="never">
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
        </ScrollArea>
      </div>

      {/* Layer toggles */}
      <div style={{ position: 'absolute', top: 60, left: 12, zIndex: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
        {[
          { key: 'itinerary', label: 'Itinerary', color: '#b91c1c', icon: <IconRoute size={14} /> },
          { key: 'tabelog', label: 'Tabelog', color: '#ea580c', icon: <IconStarFilled size={14} /> },
          { key: 'saves', label: 'Saves', color: '#2563eb', icon: <IconBookmark size={14} /> },
        ].map(({ key, label, color, icon }) => {
          const active = layers[key];
          const count = key === 'itinerary' ? itineraryPins.length : key === 'tabelog' ? tabelogPins.length : savedPins.length;
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

        {/* Filter button — only when Tabelog layer is active */}
        {layers.tabelog && (
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
        {layers.tabelog && showFilters && (
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

      {/* Bottom card + carousel controls — hidden when filter sheet is open */}
      {!showFilters && (carouselPins.length > 0 || selectedPin) && (
        <div style={{ position: 'absolute', bottom: 'env(safe-area-inset-bottom, 12px)', left: 0, right: 0, zIndex: 10, paddingBottom: 4 }}>
          {/* Carousel arrows — only for itinerary, hidden when viewing a non-itinerary pin */}
          {!selectedPin && carouselPins.length > 0 && (
            <Group justify="center" gap="sm" mb={8}>
              <ActionIcon variant="default" radius="xl" size="md"
                onClick={() => focusPin(activePin - 1)} disabled={activePin === 0}
                style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.15)', background: ov.bg, color: ov.text, borderColor: ov.border }}>
                <IconChevronLeft size={16} />
              </ActionIcon>
              <Badge size="lg" variant="default" radius="md"
                style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.1)', fontWeight: 700, background: ov.bg, color: ov.text, borderColor: ov.border }}>
                {activePin + 1} / {carouselPins.length}
              </Badge>
              <ActionIcon variant="default" radius="xl" size="md"
                onClick={() => focusPin(activePin + 1)} disabled={activePin === carouselPins.length - 1}
                style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.15)', background: ov.bg, color: ov.text, borderColor: ov.border }}>
                <IconChevronRight size={16} />
              </ActionIcon>
            </Group>
          )}

          {displayPin && (
            <div style={{ padding: '0 12px' }}>
              <Card shadow="md" radius="md" padding="sm"
                style={{
                  border: `1px solid ${selectedPin ? displayPin.color : 'var(--mantine-color-red-6)'}`,
                  maxWidth: 420, margin: '0 auto',
                }}
              >
                <Group wrap="nowrap" gap="sm">
                  <div style={{
                    width: 36, height: 36, borderRadius: 18, background: displayPin.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontWeight: 800, fontSize: 14, flexShrink: 0,
                  }}>
                    {displayPin.number || (displayPin.kind === 'tabelog' ? '★' : '♥')}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Text fw={700} size="sm" truncate>{displayPin.title}</Text>
                    <Text size="xs" c="dimmed" truncate>{displayPin.subtitle}</Text>
                  </div>
                  {selectedPin && (
                    <Tooltip label="Back to itinerary">
                      <ActionIcon variant="subtle" color="gray" radius="xl" size="md"
                        onClick={() => setSelectedPin(null)}>
                        <IconChevronLeft size={16} />
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
          )}
        </div>
      )}

      {/* Token warning */}
      {MAPBOX_TOKEN === 'YOUR_MAPBOX_TOKEN_HERE' && (
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          background: '#fff', padding: 24, borderRadius: 12, boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          textAlign: 'center', zIndex: 20, maxWidth: 360,
        }}>
          <Text fw={700} size="lg" mb="xs">Map needs a Mapbox token</Text>
          <Text size="sm" c="dimmed" mb="md">
            Sign up free at mapbox.com, grab your token, and paste it in:
          </Text>
          <code style={{ fontSize: 12, background: '#f3f4f6', padding: '4px 8px', borderRadius: 4 }}>
            shared/data/mapConfig.js
          </code>
        </div>
      )}
    </div>
  );
}
