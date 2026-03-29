import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import {
  Text, Badge, Group, Card, ScrollArea, UnstyledButton, ActionIcon, Tooltip,
} from '@mantine/core';
import {
  IconStarFilled, IconBookmark, IconNavigation,
  IconChevronLeft, IconChevronRight, IconRoute, IconTimeline,
  IconList,
} from '@tabler/icons-react';
import { timeline } from '../data/tripData';
import { nearbyFinds } from '../data/nearbyFinds';
import { getPlacesForDay } from '../data/savedPlaces';
import {
  getScheduleCoord, getTabelogCoord, getSavedPlaceCoord, getDayCenter,
} from '../data/coords';
import { MAPBOX_TOKEN } from '../data/mapConfig';

mapboxgl.accessToken = MAPBOX_TOKEN;

const TYPE_CONFIG = {
  transport: { color: '#7c3aed', label: 'Transport' },
  food: { color: '#ea580c', label: 'Food' },
  group: { color: '#2563eb', label: 'Group' },
  shopping: { color: '#db2777', label: 'Shopping' },
  site: { color: '#059669', label: 'Site' },
  rest: { color: '#6b7280', label: 'Rest' },
  activity: { color: '#ca8a04', label: 'Activity' },
};

export default function MapViewComponent({ initialDay, onViewList }) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [selected, setSelected] = useState(initialDay || 1);

  // Sync with parent when initialDay changes (e.g. navigating from timeline)
  useEffect(() => {
    if (initialDay != null && initialDay !== selected) {
      setSelected(initialDay);
    }
  }, [initialDay]);

  const [activePin, setActivePin] = useState(0);
  const [layers, setLayers] = useState({ itinerary: true, tabelog: false, saves: false });
  const [showRoute, setShowRoute] = useState(true);
  const [mapReady, setMapReady] = useState(false);

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

  const tabelogPins = useMemo(() => {
    return tabelogList.map((r, i) => {
      const coord = getTabelogCoord(r);
      if (!coord) return null;
      return { ...r, coord, key: `tab-${i}` };
    }).filter(Boolean);
  }, [tabelogList]);

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
        label: pin.number ? String(pin.number) : (pin.kind === 'tabelog' ? '★' : '♥'),
        color: pin.color,
        isActive: pin.kind === 'itinerary' && pin.index === activePin,
      },
    })),
  }), [allVisiblePins, activePin]);

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
      style: 'mapbox://styles/mapbox/light-v11',
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
      // Active ring
      map.current.addLayer({
        id: 'pins-active-ring', type: 'circle', source: 'pins',
        filter: ['==', ['get', 'isActive'], true],
        paint: {
          'circle-radius': 20,
          'circle-color': 'rgba(250,204,21,0.3)',
          'circle-stroke-width': 2,
          'circle-stroke-color': '#facc15',
        },
      });
      // Base circles
      map.current.addLayer({
        id: 'pins-circle', type: 'circle', source: 'pins',
        paint: {
          'circle-radius': ['case', ['get', 'isActive'], 16, 14],
          'circle-color': ['get', 'color'],
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff',
        },
      });
      // Labels
      map.current.addLayer({
        id: 'pins-label', type: 'symbol', source: 'pins',
        layout: {
          'text-field': ['get', 'label'],
          'text-size': 12,
          'text-font': ['DIN Pro Bold', 'Arial Unicode MS Bold'],
          'text-allow-overlap': true,
          'icon-allow-overlap': true,
        },
        paint: { 'text-color': '#ffffff' },
      });

      // Click handler on pin circles
      map.current.on('click', 'pins-circle', (e) => {
        const props = e.features?.[0]?.properties;
        if (props) {
          // Only select itinerary pins in carousel
          const pin = allVisiblePins[props.index];
          if (pin?.kind === 'itinerary') {
            setActivePin(pin.index);
          }
          map.current.flyTo({
            center: e.features[0].geometry.coordinates,
            zoom: 15, duration: 800,
          });
        }
      });
      map.current.on('mouseenter', 'pins-circle', () => { map.current.getCanvas().style.cursor = 'pointer'; });
      map.current.on('mouseleave', 'pins-circle', () => { map.current.getCanvas().style.cursor = ''; });

      setMapReady(true);
    });

    return () => { map.current?.remove(); map.current = null; };
  }, []);

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

  // Fit map on day/layer change
  useEffect(() => {
    if (!map.current || !mapReady) return;
    if (allVisiblePins.length > 1) {
      const bounds = new mapboxgl.LngLatBounds();
      allVisiblePins.forEach(p => bounds.extend([p.coord.longitude, p.coord.latitude]));
      map.current.fitBounds(bounds, { padding: { top: 80, right: 60, bottom: 160, left: 60 }, duration: 1000 });
    } else if (allVisiblePins.length === 1) {
      const p = allVisiblePins[0];
      map.current.flyTo({ center: [p.coord.longitude, p.coord.latitude], zoom: 15, duration: 1000 });
    } else if (day) {
      const c = getDayCenter(day);
      map.current.flyTo({ center: [c.longitude, c.latitude], zoom: 13, duration: 1000 });
    }
    setActivePin(0);
  }, [selected, layers, mapReady, allVisiblePins.length]);

  const focusPin = useCallback((idx) => {
    if (idx < 0 || idx >= carouselPins.length) return;
    setActivePin(idx);
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

  const currentPin = carouselPins[activePin];

  return (
    <div style={{ position: 'relative', width: '100%', height: 'calc(100dvh - 60px)', overflow: 'hidden' }}>
      <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />

      {/* Day selector */}
      <div style={{ position: 'absolute', top: 12, left: 12, right: onViewList ? 110 : 60, zIndex: 10 }}>
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
                    background: active ? '#b91c1c' : '#fff',
                    color: active ? '#fff' : '#1f2937',
                    border: `1.5px solid ${active ? '#b91c1c' : '#e5e7eb'}`,
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

      {/* View List toggle */}
      {onViewList && (
        <div style={{ position: 'absolute', top: 12, right: 12, zIndex: 10 }}>
          <UnstyledButton
            onClick={() => onViewList(selected)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '6px 12px', borderRadius: 20,
              background: '#fff', color: '#1f2937',
              border: '1.5px solid #e5e7eb',
              boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
              fontSize: 12, fontWeight: 600, transition: 'all 0.2s',
            }}
          >
            <IconList size={14} /> View List
          </UnstyledButton>
        </div>
      )}

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
                background: active ? color : '#fff',
                color: active ? '#fff' : '#1f2937',
                border: `1.5px solid ${active ? color : '#e5e7eb'}`,
                boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
                fontSize: 12, fontWeight: 600, transition: 'all 0.2s',
              }}
            >
              {icon} {label}
              <span style={{
                background: active ? 'rgba(255,255,255,0.3)' : '#f3f4f6',
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
            background: showRoute ? '#b91c1c' : '#fff',
            color: showRoute ? '#fff' : '#1f2937',
            border: `1.5px solid ${showRoute ? '#b91c1c' : '#e5e7eb'}`,
            boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
            fontSize: 12, fontWeight: 600, transition: 'all 0.2s',
          }}
        >
          <IconTimeline size={14} /> Trail
        </UnstyledButton>
      </div>

      {/* Bottom carousel */}
      {carouselPins.length > 0 && (
        <div style={{ position: 'absolute', bottom: 'env(safe-area-inset-bottom, 12px)', left: 0, right: 0, zIndex: 10, paddingBottom: 4 }}>
          <Group justify="center" gap="sm" mb={8}>
            <ActionIcon variant="white" radius="xl" size="md"
              onClick={() => focusPin(activePin - 1)} disabled={activePin === 0}
              style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.15)' }}>
              <IconChevronLeft size={16} />
            </ActionIcon>
            <Badge size="lg" variant="white" radius="md"
              style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.1)', fontWeight: 700 }}>
              {activePin + 1} / {carouselPins.length}
            </Badge>
            <ActionIcon variant="white" radius="xl" size="md"
              onClick={() => focusPin(activePin + 1)} disabled={activePin === carouselPins.length - 1}
              style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.15)' }}>
              <IconChevronRight size={16} />
            </ActionIcon>
          </Group>

          {currentPin && (
            <div style={{ padding: '0 12px' }}>
              <Card shadow="md" radius="md" padding="sm"
                style={{ border: '2px solid #b91c1c', maxWidth: 420, margin: '0 auto' }}
              >
                <Group wrap="nowrap" gap="sm">
                  <div style={{
                    width: 36, height: 36, borderRadius: 18, background: currentPin.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontWeight: 800, fontSize: 14, flexShrink: 0,
                  }}>
                    {currentPin.number || (currentPin.kind === 'tabelog' ? '★' : '♥')}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Text fw={700} size="sm" truncate>{currentPin.title}</Text>
                    <Text size="xs" c="dimmed" truncate>{currentPin.subtitle}</Text>
                  </div>
                  <Tooltip label="Get directions">
                    <ActionIcon variant="light" color="red" radius="xl" size="lg"
                      onClick={() => openDirections(currentPin)}>
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
