import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import {
  Title, Text, Badge, Group, Card, ScrollArea, UnstyledButton, ActionIcon,
  Tooltip, SegmentedControl, Stack, Anchor, ThemeIcon,
} from '@mantine/core';
import {
  IconMapPin, IconCalendar, IconFlame, IconStarFilled, IconBookmark,
  IconNavigation, IconChevronLeft, IconChevronRight, IconRoute,
  IconCurrentLocation, IconExternalLink,
} from '@tabler/icons-react';
import { timeline } from '../data/tripData';
import { nearbyFinds } from '../data/nearbyFinds';
import { getPlacesForDay } from '../data/savedPlaces';
import {
  AREA_COORDS, getScheduleCoord, getTabelogCoord, getSavedPlaceCoord, getDayCenter,
} from '../data/coords';
import { MAPBOX_TOKEN, MAP_DEFAULTS } from '../data/mapConfig';

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

function makeMarkerEl(color, label, isActive) {
  const el = document.createElement('div');
  el.style.cssText = `
    width: ${isActive ? '36px' : '28px'}; height: ${isActive ? '36px' : '28px'};
    border-radius: 50%; background: ${color}; color: #fff;
    display: flex; align-items: center; justify-content: center;
    font-weight: 800; font-size: ${isActive ? '14px' : '12px'};
    border: ${isActive ? '3px solid #facc15' : '2px solid #fff'};
    box-shadow: ${isActive ? '0 0 12px rgba(250,204,21,0.6),' : ''} 0 2px 6px rgba(0,0,0,0.3);
    cursor: pointer; transition: all 0.2s;
  `;
  el.textContent = label;
  return el;
}

function makeIconMarkerEl(color, icon, isActive) {
  const el = document.createElement('div');
  el.style.cssText = `
    width: ${isActive ? '36px' : '28px'}; height: ${isActive ? '36px' : '28px'};
    border-radius: 50%; background: ${color}; color: #fff;
    display: flex; align-items: center; justify-content: center;
    font-size: ${isActive ? '16px' : '13px'};
    border: ${isActive ? '3px solid #facc15' : '2px solid #fff'};
    box-shadow: ${isActive ? '0 0 12px rgba(250,204,21,0.6),' : ''} 0 2px 6px rgba(0,0,0,0.3);
    cursor: pointer; transition: all 0.2s;
  `;
  el.textContent = icon;
  return el;
}

export default function MapViewComponent() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markersRef = useRef([]);
  const [selected, setSelected] = useState(1);
  const [activePin, setActivePin] = useState(0);
  const [layers, setLayers] = useState({ itinerary: true, tabelog: false, saves: false });
  const [mapReady, setMapReady] = useState(false);

  const day = timeline.find(d => d.day === selected);
  const tabelogList = nearbyFinds[selected] || [];
  const savedList = getPlacesForDay(selected);

  const toggleLayer = (key) => setLayers(prev => ({ ...prev, [key]: !prev[key] }));

  // Build pins
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

  const routeSegments = useMemo(() => {
    const segs = [];
    for (let i = 0; i < itineraryPins.length - 1; i++) {
      segs.push([
        [itineraryPins[i].coord.longitude, itineraryPins[i].coord.latitude],
        [itineraryPins[i + 1].coord.longitude, itineraryPins[i + 1].coord.latitude],
      ]);
    }
    return segs;
  }, [itineraryPins]);

  // Init map
  useEffect(() => {
    if (map.current || !mapContainer.current) return;
    const dayCenter = day ? getDayCenter(day) : { latitude: MAP_DEFAULTS.center[1], longitude: MAP_DEFAULTS.center[0] };
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [dayCenter.longitude, dayCenter.latitude],
      zoom: 13,
      pitch: 0,
    });
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
    map.current.addControl(new mapboxgl.GeolocateControl({
      positionOptions: { enableHighAccuracy: true },
      trackUserLocation: true,
    }), 'top-right');
    map.current.on('load', () => setMapReady(true));
    return () => { map.current?.remove(); map.current = null; };
  }, []);

  // Draw route lines
  useEffect(() => {
    if (!map.current || !mapReady) return;
    // Remove old route layers/sources
    const oldIds = (map.current.getStyle()?.layers || [])
      .filter(l => l.id.startsWith('route-'))
      .map(l => l.id);
    oldIds.forEach(id => { map.current.removeLayer(id); });
    ['route-glow', 'route-line'].forEach(id => {
      if (map.current.getSource(id)) map.current.removeSource(id);
    });

    if (!layers.itinerary || routeSegments.length === 0) return;

    const allCoords = routeSegments.flat();
    map.current.addSource('route-glow', {
      type: 'geojson',
      data: { type: 'Feature', geometry: { type: 'LineString', coordinates: allCoords } },
    });
    map.current.addSource('route-line', {
      type: 'geojson',
      data: { type: 'Feature', geometry: { type: 'LineString', coordinates: allCoords } },
    });
    map.current.addLayer({
      id: 'route-glow-layer',
      type: 'line',
      source: 'route-glow',
      paint: { 'line-color': 'rgba(185, 28, 28, 0.12)', 'line-width': 10 },
      layout: { 'line-join': 'round', 'line-cap': 'round' },
    });
    map.current.addLayer({
      id: 'route-line-layer',
      type: 'line',
      source: 'route-line',
      paint: { 'line-color': '#b91c1c', 'line-width': 3.5 },
      layout: { 'line-join': 'round', 'line-cap': 'round' },
    });
  }, [mapReady, layers.itinerary, routeSegments]);

  // Draw markers
  useEffect(() => {
    if (!map.current || !mapReady) return;
    // Clear old markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    allVisiblePins.forEach((pin, i) => {
      const isActive = i === activePin;
      const el = pin.number
        ? makeMarkerEl(pin.color, String(pin.number), isActive)
        : makeIconMarkerEl(pin.color, pin.kind === 'tabelog' ? '★' : '♥', isActive);

      el.addEventListener('click', () => {
        setActivePin(i);
        map.current.flyTo({
          center: [pin.coord.longitude, pin.coord.latitude],
          zoom: 15, duration: 800, essential: true,
        });
      });

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([pin.coord.longitude, pin.coord.latitude])
        .addTo(map.current);
      markersRef.current.push(marker);
    });
  }, [mapReady, allVisiblePins, activePin]);

  // Fit map on day/layer change
  useEffect(() => {
    if (!map.current || !mapReady) return;
    if (allVisiblePins.length > 1) {
      const bounds = new mapboxgl.LngLatBounds();
      allVisiblePins.forEach(p => bounds.extend([p.coord.longitude, p.coord.latitude]));
      map.current.fitBounds(bounds, { padding: { top: 80, right: 60, bottom: 200, left: 60 }, duration: 1000 });
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
    if (idx < 0 || idx >= allVisiblePins.length) return;
    setActivePin(idx);
    const pin = allVisiblePins[idx];
    if (pin?.coord && map.current) {
      map.current.flyTo({
        center: [pin.coord.longitude, pin.coord.latitude],
        zoom: 15, duration: 800, essential: true,
      });
    }
  }, [allVisiblePins]);

  const openDirections = (pin) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${pin.coord.latitude},${pin.coord.longitude}`;
    window.open(url, '_blank');
  };

  const currentPin = allVisiblePins[activePin];

  return (
    <div style={{ position: 'relative', height: 'calc(100vh - 200px)', minHeight: 500 }}>
      {/* Map */}
      <div ref={mapContainer} style={{ width: '100%', height: '100%', borderRadius: 12, overflow: 'hidden' }} />

      {/* Day selector */}
      <div style={{
        position: 'absolute', top: 12, left: 12, right: 60, zIndex: 10,
      }}>
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
      </div>

      {/* Bottom carousel */}
      {allVisiblePins.length > 0 && (
        <div style={{
          position: 'absolute', bottom: 12, left: 0, right: 0, zIndex: 10,
        }}>
          {/* Nav controls */}
          <Group justify="center" gap="sm" mb={8}>
            <ActionIcon variant="white" radius="xl" size="md"
              onClick={() => focusPin(activePin - 1)} disabled={activePin === 0}
              style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.15)' }}>
              <IconChevronLeft size={16} />
            </ActionIcon>
            <Badge size="lg" variant="white" radius="md"
              style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.1)', fontWeight: 700 }}>
              {activePin + 1} / {allVisiblePins.length}
            </Badge>
            <ActionIcon variant="white" radius="xl" size="md"
              onClick={() => focusPin(activePin + 1)} disabled={activePin === allVisiblePins.length - 1}
              style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.15)' }}>
              <IconChevronRight size={16} />
            </ActionIcon>
          </Group>

          {/* Active card */}
          {currentPin && (
            <div style={{ padding: '0 20px' }}>
              <Card shadow="md" radius="md" padding="md"
                style={{
                  border: '2px solid #b91c1c', maxWidth: 420, margin: '0 auto',
                  transition: 'all 0.3s',
                }}
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
