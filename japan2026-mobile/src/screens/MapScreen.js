import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Linking, Platform, Dimensions, FlatList, Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';


let MapView, Marker, Polyline;
if (Platform.OS !== 'web') {
  const Maps = require('react-native-maps');
  MapView = Maps.default;
  Marker = Maps.Marker;
  Polyline = Maps.Polyline;
}
import { colors, badgeColor } from '../theme';
import { useTheme } from '../ThemeContext';
import Badge from '../components/Badge';
import { timeline } from '../data/tripData';
import { nearbyFinds } from '../data/nearbyFinds';
import { getPlacesForDay } from '../data/savedPlaces';
import { tabelogAll as tabelogTokyoAll } from '../data/tabelogAll';
import { tabelogOsakaAll } from '../data/tabelogOsakaAll';
import {
  getScheduleCoord, getTabelogCoord, getSavedPlaceCoord, getDayCenter,
} from '../data/coords';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const TYPE_CONFIG = {
  transport: { color: '#7c3aed', icon: 'train', label: 'Transport' },
  food: { color: '#ea580c', icon: 'restaurant', label: 'Food' },
  group: { color: '#2563eb', icon: 'people', label: 'Group' },
  shopping: { color: '#db2777', icon: 'cart', label: 'Shopping' },
  site: { color: '#059669', icon: 'business', label: 'Site' },
  rest: { color: '#6b7280', icon: 'bed', label: 'Rest' },
  activity: { color: '#ca8a04', icon: 'musical-notes', label: 'Activity' },
};

const LAYER_CONFIG = {
  itinerary: { color: colors.primary, icon: 'navigate-circle', label: 'Itinerary' },
  tabelog: { color: '#ea580c', icon: 'star', label: 'Nearby' },
  allTabelog: { color: '#f97316', icon: 'star', label: 'All Tabelog' },
  saves: { color: '#2563eb', icon: 'bookmark', label: 'Saves' },
};

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

function inferTabelogCity(day) {
  const haystack = `${day?.location || ''} ${day?.notes || ''}`.toLowerCase();
  return haystack.includes('osaka') ? 'Osaka' : 'Tokyo';
}

function openDirections(lat, lng, label) {
  const url = Platform.select({
    ios: `maps:?daddr=${lat},${lng}&q=${encodeURIComponent(label)}`,
    android: `google.navigation:q=${lat},${lng}`,
    default: `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
  });
  Linking.openURL(url);
}


export default function MapScreen() {
  const { colors: tc, isDark } = useTheme();
  const mapRef = useRef(null);
  const carouselRef = useRef(null);
  const [selected, setSelected] = useState(1);
  const [activePin, setActivePin] = useState(0);
  const [carouselMode, setCarouselMode] = useState('itinerary'); // 'itinerary' | 'tabelog'
  const [tabelogIdx, setTabelogIdx] = useState(0);
  const [layers, setLayers] = useState({ itinerary: true, tabelog: false, allTabelog: false, saves: false });
  const [showRoute, setShowRoute] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [allTabelogCity, setAllTabelogCity] = useState('Tokyo');
  const [maxPrice, setMaxPrice] = useState(15000);
  const [minRating, setMinRating] = useState('all');
  const [japaneseOnly, setJapaneseOnly] = useState(false);
  const [cuisineFilter, setCuisineFilter] = useState([]);

  const hasActiveFilters = maxPrice < 15000 || minRating !== 'all' || japaneseOnly || cuisineFilter.length > 0;
  const resetFilters = () => { setMaxPrice(15000); setMinRating('all'); setJapaneseOnly(false); setCuisineFilter([]); };

  if (Platform.OS === 'web') {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: tc.bg }}>
        <Ionicons name="map" size={48} color={tc.textMuted} />
        <Text style={{ marginTop: 12, fontSize: 16, fontWeight: '600', color: tc.text }}>
          Maps available on iPhone
        </Text>
        <Text style={{ marginTop: 4, fontSize: 13, color: tc.textMuted }}>
          Open this in Expo Go to use the map
        </Text>
      </View>
    );
  }

  const day = timeline.find(d => d.day === selected);
  const tabelogList = nearbyFinds[selected] || [];
  const savedList = getPlacesForDay(selected);
  const allTabelogSource = useMemo(
    () => (allTabelogCity === 'Osaka' ? tabelogOsakaAll : tabelogTokyoAll),
    [allTabelogCity],
  );

  useEffect(() => {
    setAllTabelogCity(inferTabelogCity(day));
  }, [day]);

  const cuisineTags = useMemo(() => {
    const cats = new Map();
    const source = layers.allTabelog ? allTabelogSource : tabelogList;
    source.forEach(r => {
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
  }, [tabelogList, japaneseOnly, layers.allTabelog, allTabelogSource]);

  const toggleLayer = (key) => setLayers(prev => ({ ...prev, [key]: !prev[key] }));

  // Build itinerary pins with coords
  const itineraryPins = useMemo(() => {
    if (!day) return [];
    return day.schedule
      .map((s, i) => {
        const coord = getScheduleCoord(s, day.location);
        if (!coord) return null;
        const cfg = TYPE_CONFIG[s.type] || TYPE_CONFIG.activity;
        return { ...s, coord, cfg, index: i };
      })
      .filter(Boolean);
  }, [day]);

  // Build route segments between consecutive pins
  const routeSegments = useMemo(() => {
    const segs = [];
    for (let i = 0; i < itineraryPins.length - 1; i++) {
      segs.push({
        from: itineraryPins[i].coord,
        to: itineraryPins[i + 1].coord,
        index: i,
      });
    }
    return segs;
  }, [itineraryPins]);

  // Build tabelog pins (filtered)
  const tabelogPins = useMemo(() => {
    let filtered = tabelogList;
    if (maxPrice < 15000) filtered = filtered.filter(r => parsePrice(r.price) <= maxPrice);
    if (minRating !== 'all') { const min = parseFloat(minRating); filtered = filtered.filter(r => r.rating >= min); }
    if (cuisineFilter.length > 0) filtered = filtered.filter(r => { const cats = (r.cuisine || '').toLowerCase(); return cuisineFilter.some(c => cats.includes(c)); });
    if (japaneseOnly) filtered = filtered.filter(r => { const cats = (r.cuisine || '').toLowerCase(); return !NON_JAPANESE.some(nj => cats.includes(nj)); });
    return filtered
      .map(r => {
        const coord = getTabelogCoord(r);
        if (!coord) return null;
        return { ...r, coord };
      })
      .filter(Boolean);
  }, [tabelogList, maxPrice, minRating, cuisineFilter, japaneseOnly]);

  // Build saved place pins
  const savedPins = useMemo(() => {
    return savedList
      .map(p => {
        const coord = getSavedPlaceCoord(p);
        if (!coord) return null;
        return { ...p, coord };
      })
      .filter(Boolean);
  }, [savedList]);

  // All 1200 Tabelog pins (filtered)
  const allTabelogPins = useMemo(() => {
    if (!layers.allTabelog) return [];
    let filtered = allTabelogSource;
    if (maxPrice < 15000) filtered = filtered.filter(r => parsePrice(r.price) <= maxPrice);
    if (minRating !== 'all') { const min = parseFloat(minRating); filtered = filtered.filter(r => r.rating >= min); }
    if (cuisineFilter.length > 0) filtered = filtered.filter(r => { const cats = (r.cuisine || '').toLowerCase(); return cuisineFilter.some(c => cats.includes(c)); });
    if (japaneseOnly) filtered = filtered.filter(r => { const cats = (r.cuisine || '').toLowerCase(); return !NON_JAPANESE.some(nj => cats.includes(nj)); });
    return filtered
      .filter(r => r.lat && r.lng)
      .map((r, i) => ({ ...r, coord: { latitude: r.lat, longitude: r.lng } }));
  }, [layers.allTabelog, allTabelogSource, maxPrice, minRating, cuisineFilter, japaneseOnly]);

  // All visible pins for map display (markers)
  const allVisiblePins = useMemo(() => {
    const pins = [];
    if (layers.itinerary) {
      itineraryPins.forEach((p, i) => pins.push({
        key: `itin-${i}`,
        kind: 'itinerary',
        title: p.activity,
        subtitle: `${p.time} · ${p.cfg.label}`,
        color: p.cfg.color,
        icon: p.cfg.icon,
        number: p.index + 1,
        coord: p.coord,
        mapUrl: p.mapUrl,
      }));
    }
    if (layers.tabelog) {
      tabelogPins.forEach((p, i) => pins.push({
        key: `tab-${i}`,
        kind: 'tabelog',
        title: p.name,
        subtitle: `#${p.rank} · ${p.rating}★ · ${p.cuisine}`,
        color: '#ea580c',
        icon: 'star',
        coord: p.coord,
        mapUrl: p.mapUrl,
      }));
    }
    if (layers.saves) {
      savedPins.forEach((p, i) => pins.push({
        key: `save-${i}`,
        kind: 'saves',
        title: p.name,
        subtitle: `${p.type}${p.area ? ' · ' + p.area : ''}`,
        color: '#2563eb',
        icon: 'bookmark',
        coord: p.coord,
        mapUrl: p.mapUrl,
      }));
    }
    if (layers.allTabelog) {
      allTabelogPins.forEach((p, i) => pins.push({
        key: `all-${i}`,
        kind: 'tabelog',
        title: p.name,
        subtitle: `${p.rating}★ · ${p.cuisine}`,
        color: '#f97316',
        icon: 'star',
        coord: p.coord,
      }));
    }
    return pins;
  }, [layers, itineraryPins, tabelogPins, savedPins, allTabelogPins]);

  // Carousel only for itinerary pins
  const carouselPins = useMemo(() => {
    if (!layers.itinerary) return [];
    return allVisiblePins.filter(p => p.kind === 'itinerary');
  }, [layers.itinerary, allVisiblePins]);

  // Non-itinerary pins (tabelog + saves) for their own carousel
  const nonItinPins = useMemo(() => allVisiblePins.filter(p => p.kind !== 'itinerary'), [allVisiblePins]);
  const activeNonItinPin = carouselMode === 'tabelog' ? nonItinPins[tabelogIdx] : null;

  const CARD_WIDTH = SCREEN_WIDTH - 80;

  // Smooth pan to a coordinate
  const smoothPanTo = useCallback((coord) => {
    if (!coord || !mapRef.current) return;
    mapRef.current.animateCamera(
      { center: { latitude: coord.latitude, longitude: coord.longitude }, altitude: 2000 },
      { duration: 800 },
    );
  }, []);

  // When activePin changes, smoothly pan map to it (itinerary only)
  const focusPin = useCallback((index) => {
    if (index < 0 || index >= carouselPins.length) return;
    setActivePin(index);
    smoothPanTo(carouselPins[index]?.coord);
  }, [carouselPins, smoothPanTo]);

  // When a marker is pressed
  const onMarkerPress = useCallback((pinKey) => {
    // Check if it's an itinerary pin
    const itinIdx = carouselPins.findIndex(p => p.key === pinKey);
    if (itinIdx >= 0) {
      setCarouselMode('itinerary');
      setActivePin(itinIdx);
      carouselRef.current?.scrollToOffset({ offset: itinIdx * (CARD_WIDTH + 12), animated: true });
      smoothPanTo(carouselPins[itinIdx]?.coord);
      return;
    }
    // Otherwise it's a tabelog/saves pin — switch to tabelog carousel
    const idx = nonItinPins.findIndex(p => p.key === pinKey);
    if (idx >= 0) {
      setCarouselMode('tabelog');
      setTabelogIdx(idx);
    }
  }, [carouselPins, nonItinPins, CARD_WIDTH, smoothPanTo]);

  // Reset when day changes
  useEffect(() => {
    setActivePin(0);
    setTabelogIdx(0);
    setCarouselMode('itinerary');
    carouselRef.current?.scrollToOffset({ offset: 0, animated: false });
  }, [selected]);

  // Fit map only when day changes (not on layer/filter toggles)
  useEffect(() => {
    const coords = itineraryPins.map(p => p.coord);

    if (coords.length > 1 && mapRef.current) {
      setTimeout(() => {
        mapRef.current?.fitToCoordinates(coords, {
          edgePadding: { top: 100, right: 50, bottom: 220, left: 50 },
          animated: true,
        });
      }, 400);
    } else if (coords.length === 1 && mapRef.current) {
      mapRef.current?.animateCamera(
        { center: coords[0], altitude: 4000 },
        { duration: 1000 },
      );
    } else if (day && mapRef.current) {
      const center = getDayCenter(day);
      mapRef.current?.animateCamera(
        { center, altitude: 8000 },
        { duration: 1000 },
      );
    }
  }, [selected]);

  const dayCenter = day ? getDayCenter(day) : { latitude: 35.6762, longitude: 139.6503 };

  return (
    <View style={styles.screen}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFillObject}
        initialRegion={{
          ...dayCenter,
          latitudeDelta: 0.04,
          longitudeDelta: 0.04,
        }}
        userInterfaceStyle={isDark ? 'dark' : 'light'}
        showsUserLocation
        showsMyLocationButton
        showsCompass
      >
        {/* Route segments — layered: soft glow underneath, crisp line on top */}
        {showRoute && layers.itinerary && routeSegments.map((seg) => (
          <React.Fragment key={`seg-${seg.index}`}>
            {/* Glow / shadow layer */}
            <Polyline
              coordinates={[seg.from, seg.to]}
              strokeColor="rgba(185, 28, 28, 0.12)"
              strokeWidth={10}
              lineJoin="round"
              lineCap="round"
            />
            {/* Main route line */}
            <Polyline
              coordinates={[seg.from, seg.to]}
              strokeColor={
                activePin <= seg.index
                  ? 'rgba(185, 28, 28, 0.25)'  /* upcoming — faded */
                  : colors.primary               /* past — solid */
              }
              strokeWidth={3.5}
              lineJoin="round"
              lineCap="round"
            />
          </React.Fragment>
        ))}

        {/* Itinerary pins */}
        {layers.itinerary && itineraryPins.map((pin, i) => {
          const isActive = carouselPins[activePin]?.key === `itin-${i}`;
          return (
            <Marker
              key={`itin-${selected}-${i}`}
              coordinate={pin.coord}
              onPress={() => onMarkerPress(`itin-${i}`)}
            >
              <View style={[
                styles.markerCircle,
                { backgroundColor: pin.cfg.color },
                isActive && styles.markerActive,
              ]}>
                <Text style={styles.markerNumber}>{pin.index + 1}</Text>
              </View>
            </Marker>
          );
        })}

        {/* Tabelog pins */}
        {layers.tabelog && tabelogPins.map((pin, i) => {
          const isActive = carouselPins[activePin]?.key === `tab-${i}`;
          return (
            <Marker
              key={`tab-${selected}-${i}`}
              coordinate={pin.coord}
              onPress={() => onMarkerPress(`tab-${i}`)}
            >
              <View style={[
                styles.markerSmall, { backgroundColor: '#ea580c' },
                isActive && styles.markerSmallActive,
              ]}>
                <Ionicons name="star" size={10} color="#fff" />
              </View>
            </Marker>
          );
        })}

        {/* Saved place pins */}
        {layers.saves && savedPins.map((pin, i) => {
          const isActive = carouselPins[activePin]?.key === `save-${i}`;
          return (
            <Marker
              key={`save-${selected}-${i}`}
              coordinate={pin.coord}
              onPress={() => onMarkerPress(`save-${i}`)}
            >
              <View style={[
                styles.markerSmall, { backgroundColor: '#2563eb' },
                isActive && styles.markerSmallActive,
              ]}>
                <Ionicons name="bookmark" size={10} color="#fff" />
              </View>
            </Marker>
          );
        })}

        {/* All 1200 Tabelog pins */}
        {layers.allTabelog && allTabelogPins.map((pin, i) => {
          const isActive = carouselPins[activePin]?.key === `all-${i}`;
          return (
            <Marker
              key={`all-${i}`}
              coordinate={pin.coord}
              onPress={() => onMarkerPress(`all-${i}`)}
            >
              <View style={[
                styles.markerSmall, { backgroundColor: '#f97316' },
                isActive && styles.markerSmallActive,
              ]}>
                <Ionicons name="star" size={10} color="#fff" />
              </View>
            </Marker>
          );
        })}
      </MapView>

      {/* Day selector overlay */}
      <View style={[styles.dayOverlay, { backgroundColor: isDark ? 'rgba(17,17,17,0.92)' : 'rgba(255,255,255,0.92)' }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.dayRow}>
            {timeline.map(d => {
              const active = d.day === selected;
              return (
                <TouchableOpacity
                  key={d.day}
                  onPress={() => setSelected(d.day)}
                  style={[styles.dayChip, { backgroundColor: tc.card, borderColor: tc.border }, active && styles.dayChipActive]}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.dayChipLabel, { color: tc.text }, active && { color: '#fff' }]}>
                    {d.day === 0 ? 'Travel' : d.day === 15 ? 'End' : `D${d.day}`}
                  </Text>
                  <Text style={[styles.dayChipDate, { color: tc.textMuted }, active && { color: 'rgba(255,255,255,0.8)' }]}>
                    {d.date.replace('July ', '7/')}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </View>

      {/* Layer toggles overlay */}
      <View style={styles.layerOverlay}>
        {Object.entries(LAYER_CONFIG).map(([key, cfg]) => {
          const active = layers[key];
          const count = key === 'itinerary' ? itineraryPins.length
            : key === 'tabelog' ? tabelogPins.length
            : key === 'allTabelog' ? allTabelogPins.length
            : savedPins.length;
          return (
            <TouchableOpacity
              key={key}
              onPress={() => toggleLayer(key)}
              style={[styles.layerBtn, { backgroundColor: tc.card, borderColor: tc.border }, active && { backgroundColor: cfg.color, borderColor: cfg.color }]}
              activeOpacity={0.7}
            >
              <Ionicons name={cfg.icon} size={16} color={active ? '#fff' : cfg.color} />
              <Text style={[styles.layerLabel, { color: tc.text }, active && { color: '#fff' }]}>
                {cfg.label}
              </Text>
              <View style={[styles.layerCount, { backgroundColor: tc.border }, active && { backgroundColor: 'rgba(255,255,255,0.3)' }]}>
                <Text style={[styles.layerCountText, { color: tc.textSecondary }, active && { color: '#fff' }]}>{count}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
        <TouchableOpacity
          onPress={() => setShowRoute(prev => !prev)}
          style={[styles.layerBtn, { backgroundColor: tc.card, borderColor: tc.border }, showRoute && { backgroundColor: colors.primary, borderColor: colors.primary }]}
          activeOpacity={0.7}
        >
          <Ionicons name="git-branch" size={16} color={showRoute ? '#fff' : colors.primary} />
          <Text style={[styles.layerLabel, { color: tc.text }, showRoute && { color: '#fff' }]}>
            Trail
          </Text>
        </TouchableOpacity>

        {/* Filter button — when any Tabelog layer is active */}
        {(layers.tabelog || layers.allTabelog) && (
          <TouchableOpacity
            onPress={() => setShowFilters(prev => !prev)}
            style={[
              styles.layerBtn,
              { backgroundColor: tc.card, borderColor: tc.border },
              (showFilters || hasActiveFilters) && { backgroundColor: '#ea580c', borderColor: '#ea580c' },
            ]}
            activeOpacity={0.7}
          >
            <Ionicons name="funnel" size={16} color={(showFilters || hasActiveFilters) ? '#fff' : '#ea580c'} />
            <Text style={[styles.layerLabel, { color: tc.text }, (showFilters || hasActiveFilters) && { color: '#fff' }]}>
              Filter
            </Text>
            {hasActiveFilters && (
              <View style={[styles.layerCount, { backgroundColor: 'rgba(255,255,255,0.3)' }]}>
                <Text style={[styles.layerCountText, { color: '#fff' }]}>on</Text>
              </View>
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* Filter bottom sheet */}
      {(layers.tabelog || layers.allTabelog) && showFilters && (
        <>
          {/* Backdrop */}
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => setShowFilters(false)}
            style={styles.sheetBackdrop}
          />
          <View style={[styles.sheetContainer, { backgroundColor: tc.card }]}>
            {/* Handle bar */}
            <View style={[styles.sheetHandle, { backgroundColor: tc.textMuted }]} />

            {/* Header */}
            <View style={styles.sheetHeader}>
              <Text style={[styles.sheetTitle, { color: tc.text }]}>Filter Restaurants</Text>
              {hasActiveFilters && (
                <TouchableOpacity onPress={resetFilters} activeOpacity={0.7}>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: '#ea580c' }}>Reset all</Text>
                </TouchableOpacity>
              )}
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: Dimensions.get('window').height * 0.55 }}>
              {layers.allTabelog && (
                <>
                  <Text style={[styles.fpLabel, { color: tc.textSecondary }]}>CITY</Text>
                  <View style={styles.sheetPillRow}>
                    {['Tokyo', 'Osaka'].map((city) => (
                      <TouchableOpacity
                        key={city}
                        onPress={() => setAllTabelogCity(city)}
                        style={[styles.sheetPill, { backgroundColor: allTabelogCity === city ? '#ea580c' : tc.border }]}
                        activeOpacity={0.7}
                      >
                        <Text style={[styles.sheetPillText, { color: allTabelogCity === city ? '#fff' : tc.textSecondary }]}>
                          {city}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </>
              )}

              {/* Price */}
              <View style={styles.sheetRow}>
                <Text style={[styles.fpLabel, { color: tc.textSecondary }]}>PRICE</Text>
                <Text style={{ fontSize: 12, fontWeight: '600', color: '#ea580c' }}>
                  {maxPrice >= 15000 ? 'Any' : `≤ ¥${(maxPrice / 1000).toFixed(0)}k`}
                </Text>
              </View>
              <View style={styles.sheetPillRow}>
                {[
                  { label: '¥1k', value: 1000 },
                  { label: '¥3k', value: 3000 },
                  { label: '¥6k', value: 6000 },
                  { label: '¥10k', value: 10000 },
                  { label: 'Any', value: 15000 },
                ].map(({ label, value }) => (
                  <TouchableOpacity
                    key={value}
                    onPress={() => setMaxPrice(value)}
                    style={[styles.sheetPill, { backgroundColor: maxPrice === value ? '#ea580c' : tc.border }]}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.sheetPillText, { color: maxPrice === value ? '#fff' : tc.textSecondary }]}>
                      {label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Rating */}
              <Text style={[styles.fpLabel, { color: tc.textSecondary, marginTop: 16 }]}>RATING</Text>
              <View style={styles.sheetPillRow}>
                {['all', '3.9', '3.8', '3.7', '3.6'].map(v => (
                  <TouchableOpacity
                    key={v}
                    onPress={() => setMinRating(v)}
                    style={[styles.sheetPill, { backgroundColor: minRating === v ? '#ea580c' : tc.border }]}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.sheetPillText, { color: minRating === v ? '#fff' : tc.textSecondary }]}>
                      {v === 'all' ? 'All' : `${v}+`}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Japanese only */}
              <View style={[styles.sheetSwitchRow, { borderTopColor: tc.border }]}>
                <Text style={[styles.fpLabel, { color: tc.textSecondary, marginBottom: 0 }]}>JAPANESE ONLY</Text>
                <Switch
                  value={japaneseOnly}
                  onValueChange={(v) => { setJapaneseOnly(v); setCuisineFilter([]); }}
                  trackColor={{ false: tc.border, true: '#fdba74' }}
                  thumbColor={japaneseOnly ? '#ea580c' : tc.card}
                />
              </View>

              {/* Cuisine tags */}
              <Text style={[styles.fpLabel, { color: tc.textSecondary }]}>CUISINE</Text>
              <View style={styles.sheetPillWrap}>
                {cuisineTags.map(([key, label]) => (
                  <TouchableOpacity
                    key={key}
                    onPress={() => setCuisineFilter(prev => prev.includes(key) ? prev.filter(c => c !== key) : [...prev, key])}
                    style={[styles.sheetPill, { backgroundColor: cuisineFilter.includes(key) ? '#ea580c' : tc.border }]}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.sheetPillText, { color: cuisineFilter.includes(key) ? '#fff' : tc.textSecondary }]}>
                      {label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            {/* Done button */}
            <TouchableOpacity
              onPress={() => setShowFilters(false)}
              style={styles.sheetDoneBtn}
              activeOpacity={0.8}
            >
              <Text style={styles.sheetDoneText}>Done</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {/* Tabelog/saves carousel — hidden when filter sheet open */}
      {!showFilters && carouselMode === 'tabelog' && activeNonItinPin && (
        <View style={styles.carouselWrap}>
          {/* Prev / Next */}
          <View style={styles.navRow}>
            <TouchableOpacity
              onPress={() => setTabelogIdx(Math.max(0, tabelogIdx - 1))}
              disabled={tabelogIdx === 0}
              style={[styles.navBtn, { backgroundColor: tc.card }, tabelogIdx === 0 && { opacity: 0.3 }]}
            >
              <Ionicons name="chevron-back" size={18} color={tc.text} />
            </TouchableOpacity>
            <Text style={[styles.navCounter, { color: tc.text, backgroundColor: tc.card }]}>
              {tabelogIdx + 1} / {nonItinPins.length}
            </Text>
            <TouchableOpacity
              onPress={() => setTabelogIdx(Math.min(nonItinPins.length - 1, tabelogIdx + 1))}
              disabled={tabelogIdx === nonItinPins.length - 1}
              style={[styles.navBtn, { backgroundColor: tc.card }, tabelogIdx === nonItinPins.length - 1 && { opacity: 0.3 }]}
            >
              <Ionicons name="chevron-forward" size={18} color={tc.text} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            activeOpacity={0.9}
            style={[styles.card, { width: SCREEN_WIDTH - 40, marginHorizontal: 20, backgroundColor: tc.card }]}
          >
            <View style={styles.cardHeader}>
              <View style={[styles.cardDot, { backgroundColor: activeNonItinPin.color }]}>
                <Ionicons name={activeNonItinPin.icon} size={12} color="#fff" />
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={[styles.cardTitle, { color: tc.text }]} numberOfLines={1}>{activeNonItinPin.title}</Text>
                <Text style={[styles.cardSub, { color: tc.textSecondary }]} numberOfLines={1}>{activeNonItinPin.subtitle}</Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  if (activeNonItinPin.mapUrl) Linking.openURL(activeNonItinPin.mapUrl);
                  else openDirections(activeNonItinPin.coord.latitude, activeNonItinPin.coord.longitude, activeNonItinPin.title);
                }}
                style={[styles.dirBtn, { backgroundColor: tc.border }]}
              >
                <Ionicons name="navigate" size={18} color={colors.primary} />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => { setCarouselMode('itinerary'); setTabelogIdx(0); }}
            style={[styles.backBtn, { backgroundColor: tc.card }]}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={14} color={colors.primary} />
            <Text style={{ fontSize: 12, fontWeight: '600', color: colors.primary, marginLeft: 4 }}>Back to itinerary</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Bottom carousel — itinerary only, hidden when filter sheet open or in tabelog mode */}
      {!showFilters && carouselMode === 'itinerary' && carouselPins.length > 0 && (
        <View style={styles.carouselWrap}>
          {/* Prev / Next buttons */}
          <View style={styles.navRow}>
            <TouchableOpacity
              onPress={() => {
                const prev = Math.max(0, activePin - 1);
                focusPin(prev);
                carouselRef.current?.scrollToOffset({ offset: prev * (CARD_WIDTH + 12), animated: true });
              }}
              disabled={activePin === 0}
              style={[styles.navBtn, { backgroundColor: tc.card }, activePin === 0 && { opacity: 0.3 }]}
            >
              <Ionicons name="chevron-back" size={18} color={tc.text} />
            </TouchableOpacity>
            <Text style={[styles.navCounter, { color: tc.text, backgroundColor: tc.card }]}>
              {activePin + 1} / {carouselPins.length}
            </Text>
            <TouchableOpacity
              onPress={() => {
                const next = Math.min(carouselPins.length - 1, activePin + 1);
                focusPin(next);
                carouselRef.current?.scrollToOffset({ offset: next * (CARD_WIDTH + 12), animated: true });
              }}
              disabled={activePin === carouselPins.length - 1}
              style={[styles.navBtn, { backgroundColor: tc.card }, activePin === carouselPins.length - 1 && { opacity: 0.3 }]}
            >
              <Ionicons name="chevron-forward" size={18} color={tc.text} />
            </TouchableOpacity>
          </View>

          <FlatList
            ref={carouselRef}
            data={carouselPins}
            keyExtractor={item => item.key}
            horizontal
            pagingEnabled={false}
            snapToInterval={CARD_WIDTH + 12}
            snapToAlignment="start"
            decelerationRate="fast"
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20 }}
            onMomentumScrollEnd={(e) => {
              const idx = Math.round(e.nativeEvent.contentOffset.x / (CARD_WIDTH + 12));
              focusPin(Math.max(0, Math.min(idx, carouselPins.length - 1)));
            }}
            renderItem={({ item, index }) => {
              const isActive = index === activePin;
              return (
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() => {
                    focusPin(index);
                    carouselRef.current?.scrollToOffset({ offset: index * (CARD_WIDTH + 12), animated: true });
                  }}
                  style={[
                    styles.card,
                    { width: CARD_WIDTH, marginRight: 12, backgroundColor: tc.card },
                    isActive && styles.cardActive,
                  ]}
                >
                  <View style={styles.cardHeader}>
                    <View style={[styles.cardDot, { backgroundColor: item.color }]}>
                      {item.number
                        ? <Text style={styles.cardDotText}>{item.number}</Text>
                        : <Ionicons name={item.icon} size={12} color="#fff" />
                      }
                    </View>
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text style={[styles.cardTitle, { color: tc.text }]} numberOfLines={1}>{item.title}</Text>
                      <Text style={[styles.cardSub, { color: tc.textSecondary }]} numberOfLines={1}>{item.subtitle}</Text>
                    </View>
                    {item.mapUrl ? (
                      <TouchableOpacity
                        onPress={() => Linking.openURL(item.mapUrl)}
                        style={[styles.dirBtn, { backgroundColor: tc.border }]}
                      >
                        <Ionicons name="navigate" size={18} color={colors.primary} />
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        onPress={() => openDirections(item.coord.latitude, item.coord.longitude, item.title)}
                        style={[styles.dirBtn, { backgroundColor: tc.border }]}
                      >
                        <Ionicons name="navigate" size={18} color={colors.primary} />
                      </TouchableOpacity>
                    )}
                  </View>
                </TouchableOpacity>
              );
            }}
          />
        </View>
      )}

      {/* Empty state */}
      {carouselPins.length === 0 && day && (
        <View style={[styles.emptyCard, { backgroundColor: tc.card }]}>
          <Text style={[styles.emptyText, { color: tc.textMuted }]}>
            No pins for this day. Toggle a layer above.
          </Text>
        </View>
      )}
    </View>
  );
}


const styles = StyleSheet.create({
  screen: { flex: 1 },

  // Custom markers
  markerCircle: {
    width: 28, height: 28, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: '#fff',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3, shadowRadius: 3, elevation: 4,
  },
  markerNumber: { fontSize: 12, fontWeight: '800', color: '#fff' },
  markerSmall: {
    width: 24, height: 24, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1.5, borderColor: '#fff',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2, shadowRadius: 2, elevation: 3,
  },
  markerSmallActive: {
    borderWidth: 2.5, borderColor: '#facc15',
  },

  // Day selector
  dayOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 8, paddingBottom: 8,
    backgroundColor: 'rgba(255,255,255,0.92)',
  },
  dayRow: { flexDirection: 'row', gap: 6 },
  dayChip: {
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20,
    backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border,
    alignItems: 'center', minWidth: 54,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 2,
  },
  dayChipActive: {
    backgroundColor: colors.primary, borderColor: colors.primary,
  },
  dayChipLabel: { fontSize: 11, fontWeight: '700', color: colors.text },
  dayChipDate: { fontSize: 10, color: colors.textMuted, marginTop: 1 },

  // Layer toggles
  layerOverlay: {
    position: 'absolute', top: Platform.OS === 'ios' ? 120 : 100,
    left: 12, gap: 6,
  },
  layerBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 10, paddingVertical: 7, borderRadius: 20,
    backgroundColor: '#fff', borderWidth: 1.5, borderColor: colors.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1, shadowRadius: 3, elevation: 2,
  },
  layerLabel: { fontSize: 12, fontWeight: '600', color: colors.text },
  layerCount: {
    backgroundColor: '#f3f4f6', borderRadius: 10,
    paddingHorizontal: 6, paddingVertical: 1,
  },
  layerCountText: { fontSize: 10, fontWeight: '700', color: colors.textSecondary },

  // Vertical filter panel
  // Bottom sheet filter
  sheetBackdrop: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 50,
  },
  sheetContainer: {
    position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 51,
    borderTopLeftRadius: 16, borderTopRightRadius: 16,
    paddingHorizontal: 20, paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15, shadowRadius: 12, elevation: 16,
  },
  sheetHandle: {
    width: 36, height: 4, borderRadius: 2, alignSelf: 'center',
    marginBottom: 12, opacity: 0.4,
  },
  sheetHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 16,
  },
  sheetTitle: { fontSize: 16, fontWeight: '700' },
  sheetRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 8,
  },
  sheetPillRow: {
    flexDirection: 'row', gap: 8, marginBottom: 8,
  },
  sheetPillWrap: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12,
  },
  sheetPill: {
    paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20,
  },
  sheetPillText: { fontSize: 13, fontWeight: '600' },
  sheetSwitchRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 12, marginVertical: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  sheetDoneBtn: {
    backgroundColor: '#ea580c', borderRadius: 12,
    paddingVertical: 14, alignItems: 'center', marginTop: 12,
  },
  sheetDoneText: { fontSize: 15, fontWeight: '700', color: '#fff' },
  fpLabel: {
    fontSize: 11, fontWeight: '700', letterSpacing: 1,
    textTransform: 'uppercase', marginBottom: 8,
  },

  markerActive: {
    width: 36, height: 36, borderRadius: 18,
    borderWidth: 3, borderColor: '#facc15',
    shadowColor: '#facc15', shadowOpacity: 0.6, shadowRadius: 8,
  },

  // Bottom carousel
  carouselWrap: {
    position: 'absolute', bottom: Platform.OS === 'ios' ? 28 : 12,
    left: 0, right: 0,
  },
  navRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    marginBottom: 8, gap: 12,
  },
  navBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15, shadowRadius: 3, elevation: 3,
  },
  navCounter: {
    fontSize: 13, fontWeight: '700', color: colors.text,
    backgroundColor: '#fff', paddingHorizontal: 12, paddingVertical: 4,
    borderRadius: 12, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1, shadowRadius: 2, elevation: 2,
  },
  card: {
    backgroundColor: '#fff', borderRadius: 14, padding: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12, shadowRadius: 6, elevation: 4,
    borderWidth: 2, borderColor: 'transparent',
  },
  cardActive: {
    borderColor: colors.primary,
  },
  cardHeader: {
    flexDirection: 'row', alignItems: 'center',
  },
  cardDot: {
    width: 32, height: 32, borderRadius: 16,
    justifyContent: 'center', alignItems: 'center',
  },
  cardDotText: { fontSize: 14, fontWeight: '800', color: '#fff' },
  cardTitle: { fontSize: 14, fontWeight: '700', color: colors.text },
  cardSub: { fontSize: 12, color: colors.textSecondary, marginTop: 1 },
  dirBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#fef2f2', justifyContent: 'center', alignItems: 'center',
    marginLeft: 8,
  },
  backBtn: {
    flexDirection: 'row', alignItems: 'center', alignSelf: 'center',
    marginTop: 8, paddingHorizontal: 14, paddingVertical: 6,
    borderRadius: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15, shadowRadius: 2, elevation: 2,
  },
  emptyCard: {
    position: 'absolute', bottom: Platform.OS === 'ios' ? 40 : 20,
    left: 20, right: 20, backgroundColor: '#fff', borderRadius: 14,
    padding: 20, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 6, elevation: 3,
  },
  emptyText: { fontSize: 13, color: colors.textMuted },
});
