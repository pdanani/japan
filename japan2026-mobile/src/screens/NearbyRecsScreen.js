import React, { useState, useMemo, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  Linking, Switch, FlatList, ActivityIndicator, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import * as Location from 'expo-location';
import { colors, badgeColor } from '../theme';
import { useTheme } from '../ThemeContext';
import Card from '../components/Card';
import Badge from '../components/Badge';
import FilterChip from '../components/FilterChip';
import { nearbyFinds } from '../data/nearbyFinds';
import { getPlacesForDay } from '../data/savedPlaces';
import { AREA_COORDS } from '../data/coords';

/* ── Geolocation helpers ─────────────────────────────── */

function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function getCoordForItem(item) {
  if (item.station) {
    if (AREA_COORDS[item.station]) return AREA_COORDS[item.station];
    for (const [key, coord] of Object.entries(AREA_COORDS)) {
      if (item.station.toLowerCase().includes(key.toLowerCase())) return coord;
    }
  }
  if (item.area && AREA_COORDS[item.area]) return AREA_COORDS[item.area];
  if (item.city && AREA_COORDS[item.city]) return AREA_COORDS[item.city];
  return null;
}

function formatDist(km) {
  const mi = km * 0.621371;
  if (mi < 0.1) return `${Math.round(mi * 5280)} ft`;
  return `${mi.toFixed(1)} mi`;
}

/* Non-linear slider mapping (matches web version) */
const fromSlider = (s) => {
  if (s >= 100) return Infinity;
  if (s <= 70) return s / 70;
  return 1.0 + (s - 70) / 20;
};

const toSlider = (mi) => {
  if (mi >= 2) return 100;
  if (mi <= 1) return mi * 70;
  return 70 + (mi - 1) * 20;
};

/* Preset distance buttons: label -> slider value */
const DISTANCE_PRESETS = [
  { label: '0.2mi', slider: 14 },
  { label: '0.5mi', slider: 35 },
  { label: '1mi', slider: 70 },
  { label: '2mi', slider: 90 },
  { label: 'Any', slider: 100 },
];

const NON_JAPANESE = [
  'italian', 'french', 'indian', 'chinese', 'sichuan', 'korean',
  'thai', 'vietnamese', 'spanish', 'american', 'peruvian',
  'nepalese', 'sri lankan', 'bistro', 'pizza', 'pasta', 'steak',
];

const PLACE_TYPE_COLORS = { food: 'orange', shopping: 'pink', site: 'green', activity: 'yellow' };

function parsePrice(p) {
  if (!p) return 0;
  const m = p.match(/[\d,]+/);
  return m ? parseInt(m[0].replace(/,/g, ''), 10) : 0;
}

function TabelogCard({ r }) {
  const { colors: tc } = useTheme();
  return (
    <Card borderLeftColor="#ea580c">
      <View style={styles.cardRow}>
        <View style={{ flex: 1 }}>
          <View style={styles.row}>
            <Badge label={`#${r.rank}`} color="orange" size="xs" />
            <Text style={[styles.cardName, { color: tc.text }]} numberOfLines={1}>{r.name}</Text>
          </View>
          <View style={[styles.row, { marginTop: 4 }]}>
            <Ionicons name="star" size={12} color="#f59f00" />
            <Text style={styles.ratingText}>{r.rating}</Text>
            <Text style={[styles.dimText, { color: tc.textSecondary }]}> · {r.cuisine}</Text>
          </View>
          <View style={[styles.row, { marginTop: 6, flexWrap: 'wrap', gap: 4 }]}>
            <Badge label={r.price} color="gray" size="xs" />
            {r.dinnerPrice && <Badge label={`Dinner: ${r.dinnerPrice}`} color="red" size="xs" />}
            <Badge label={r.station} color="blue" size="xs" />
            {r._dist != null && <Badge label={formatDist(r._dist)} color="green" size="xs" />}
          </View>
        </View>
        {r.mapUrl && (
          <TouchableOpacity onPress={() => Linking.openURL(r.mapUrl)} style={[styles.mapBtn, { backgroundColor: tc.border }]}>
            <Ionicons name="map" size={16} color={colors.primary} />
          </TouchableOpacity>
        )}
      </View>
    </Card>
  );
}

function SavedPlaceCard({ p }) {
  const { colors: tc } = useTheme();
  const color = PLACE_TYPE_COLORS[p.type] || 'gray';
  return (
    <Card borderLeftColor={badgeColor(color).text}>
      <View style={styles.cardRow}>
        <View style={{ flex: 1 }}>
          <View style={styles.row}>
            <Badge label={p.type} color={color} size="xs" />
            <Text style={[styles.cardName, { color: tc.text }]} numberOfLines={1}>{p.name}</Text>
          </View>
          <View style={[styles.row, { marginTop: 4, gap: 4, flexWrap: 'wrap' }]}>
            {p.area && <Badge label={p.area} color="blue" size="xs" />}
            {p._dist != null && <Badge label={formatDist(p._dist)} color="green" size="xs" />}
            {p.note ? <Text style={[styles.dimText, { color: tc.textSecondary }]} numberOfLines={1}>{p.note}</Text> : null}
          </View>
        </View>
        <TouchableOpacity onPress={() => Linking.openURL(p.mapUrl)} style={[styles.mapBtn, { backgroundColor: tc.border }]}>
          <Ionicons name="map" size={16} color={colors.primary} />
        </TouchableOpacity>
      </View>
    </Card>
  );
}

export default function NearbyRecsScreen({ route }) {
  const { colors: tc } = useTheme();
  const { dayNumber } = route.params;
  const tabelogList = nearbyFinds[dayNumber] || [];
  const savedList = getPlacesForDay(dayNumber);

  // Tab state
  const [activeTab, setActiveTab] = useState(tabelogList.length > 0 ? 'tabelog' : 'saves');

  // Location / distance state
  const [userLoc, setUserLoc] = useState(null);
  const [locLoading, setLocLoading] = useState(false);
  const [sortNearest, setSortNearest] = useState(false);
  const [maxDistance, setMaxDistance] = useState(100);

  const requestLocation = useCallback(async () => {
    if (sortNearest) {
      setSortNearest(false);
      return;
    }
    if (userLoc) {
      setSortNearest(true);
      return;
    }
    setLocLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Enable location access in Settings to sort by distance.');
        setLocLoading(false);
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      setUserLoc({ lat: loc.coords.latitude, lon: loc.coords.longitude });
      setSortNearest(true);
    } catch (err) {
      Alert.alert('Location unavailable', err.message || 'Could not get your location.');
    } finally {
      setLocLoading(false);
    }
  }, [sortNearest, userLoc]);

  const addDistance = useCallback((items) => {
    if (!sortNearest || !userLoc) return items;
    const maxMi = fromSlider(maxDistance);
    return items
      .map(item => {
        const coord = getCoordForItem(item);
        if (!coord) return { ...item, _dist: null };
        const km = haversine(userLoc.lat, userLoc.lon, coord[0], coord[1]);
        return { ...item, _dist: km };
      })
      .filter(item => {
        if (item._dist == null) return true; // keep items without coords
        const mi = item._dist * 0.621371;
        return maxMi === Infinity || mi <= maxMi;
      })
      .sort((a, b) => {
        if (a._dist == null && b._dist == null) return 0;
        if (a._dist == null) return 1;
        if (b._dist == null) return -1;
        return a._dist - b._dist;
      });
  }, [sortNearest, userLoc, maxDistance]);

  // Tabelog filters
  const [maxPrice, setMaxPrice] = useState(15000);
  const [minRating, setMinRating] = useState('all');
  const [japaneseOnly, setJapaneseOnly] = useState(false);
  const [cuisineFilter, setCuisineFilter] = useState([]);

  // Saves filters
  const [typeFilter, setTypeFilter] = useState([]);

  // Extract cuisine tags from tabelog data
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

  // Extract place types from saved places
  const placeTypes = useMemo(() => {
    return [...new Set(savedList.map(p => p.type).filter(Boolean))].sort();
  }, [savedList]);

  // Extract areas from saved places
  const [areaFilter, setAreaFilter] = useState([]);
  const savedAreas = useMemo(() => {
    return [...new Set(savedList.map(p => p.area || p.city || 'Other').filter(Boolean))].sort();
  }, [savedList]);

  // Filtered tabelog
  const filteredTabelog = useMemo(() => {
    let items = tabelogList;
    if (maxPrice < 15000) {
      items = items.filter(r => parsePrice(r.price) <= maxPrice);
    }
    if (minRating !== 'all') {
      const min = parseFloat(minRating);
      items = items.filter(r => r.rating >= min);
    }
    if (cuisineFilter.length > 0) {
      items = items.filter(r => {
        const cats = (r.cuisine || '').toLowerCase();
        return cuisineFilter.some(c => cats.includes(c));
      });
    }
    if (japaneseOnly) {
      items = items.filter(r => {
        const cats = (r.cuisine || '').toLowerCase();
        return !NON_JAPANESE.some(nj => cats.includes(nj));
      });
    }
    return items;
  }, [tabelogList, maxPrice, minRating, cuisineFilter, japaneseOnly]);

  // Filtered saves
  const filteredSaves = useMemo(() => {
    let items = savedList;
    if (typeFilter.length > 0) {
      items = items.filter(p => typeFilter.includes(p.type));
    }
    if (areaFilter.length > 0) {
      items = items.filter(p => areaFilter.includes(p.area || p.city || 'Other'));
    }
    return items;
  }, [savedList, typeFilter, areaFilter]);

  // Apply distance sorting / filtering
  const sortedTabelog = useMemo(() => addDistance(filteredTabelog), [filteredTabelog, addDistance]);
  const sortedSaves = useMemo(() => addDistance(filteredSaves), [filteredSaves, addDistance]);

  // Group by station/area (flat list when sorting by distance)
  const groupedTabelog = useMemo(() => {
    if (sortNearest && userLoc) return [['Nearest first', sortedTabelog]];
    const grouped = {};
    sortedTabelog.forEach(r => {
      const key = r.station || 'Other';
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(r);
    });
    return Object.entries(grouped);
  }, [sortedTabelog, sortNearest, userLoc]);

  const groupedSaves = useMemo(() => {
    if (sortNearest && userLoc) return [['Nearest first', sortedSaves]];
    const grouped = {};
    sortedSaves.forEach(p => {
      const key = p.area || p.city || 'Other';
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(p);
    });
    return Object.entries(grouped);
  }, [sortedSaves, sortNearest, userLoc]);

  const hasActiveFilters = maxPrice < 15000 || minRating !== 'all' || cuisineFilter.length > 0 || japaneseOnly || (sortNearest && maxDistance < 100);

  const toggleCuisine = (key) => {
    setCuisineFilter(prev => prev.includes(key) ? prev.filter(c => c !== key) : [...prev, key]);
  };

  const resetFilters = () => {
    setMaxPrice(15000);
    setMinRating('all');
    setCuisineFilter([]);
    setJapaneseOnly(false);
    setMaxDistance(100);
  };

  return (
    <ScrollView style={[styles.screen, { backgroundColor: tc.bg }]} contentContainerStyle={{ paddingBottom: 100 }}>
      {/* Tab switcher + location button */}
      <View style={styles.tabLocationRow}>
        <View style={[styles.tabRow, { backgroundColor: tc.border, flex: 1 }]}>
          {tabelogList.length > 0 && (
            <TouchableOpacity
              onPress={() => setActiveTab('tabelog')}
              style={[styles.tab, activeTab === 'tabelog' && styles.tabActive]}
            >
              <Ionicons name="star" size={14} color={activeTab === 'tabelog' ? '#fff' : tc.textSecondary} />
              <Text style={[styles.tabText, { color: tc.textSecondary }, activeTab === 'tabelog' && styles.tabTextActive]}>
                Tabelog ({tabelogList.length})
              </Text>
            </TouchableOpacity>
          )}
          {savedList.length > 0 && (
            <TouchableOpacity
              onPress={() => setActiveTab('saves')}
              style={[styles.tab, activeTab === 'saves' && styles.tabActive]}
            >
              <Ionicons name="bookmark" size={14} color={activeTab === 'saves' ? '#fff' : tc.textSecondary} />
              <Text style={[styles.tabText, { color: tc.textSecondary }, activeTab === 'saves' && styles.tabTextActive]}>
                Your Saves ({savedList.length})
              </Text>
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          onPress={requestLocation}
          disabled={locLoading}
          style={[
            styles.locBtn,
            {
              backgroundColor: sortNearest ? '#3b82f6' : tc.border,
              borderColor: sortNearest ? '#3b82f6' : tc.border,
            },
          ]}
          activeOpacity={0.7}
        >
          {locLoading ? (
            <ActivityIndicator size="small" color={sortNearest ? '#fff' : tc.textSecondary} />
          ) : (
            <Ionicons
              name="location-outline"
              size={18}
              color={sortNearest ? '#fff' : tc.textSecondary}
            />
          )}
        </TouchableOpacity>
      </View>

      {/* Distance filter presets (shown when sorting by distance) */}
      {sortNearest && userLoc && (
        <View style={[styles.distRow, { backgroundColor: tc.card, borderColor: tc.border }]}>
          <Text style={[styles.filterLabel, { color: tc.textSecondary, marginBottom: 0, marginRight: 8 }]}>
            Distance
          </Text>
          {DISTANCE_PRESETS.map(({ label, slider }) => {
            const isActive = maxDistance === slider;
            return (
              <TouchableOpacity
                key={label}
                onPress={() => setMaxDistance(slider)}
                style={[
                  styles.distChip,
                  {
                    backgroundColor: isActive ? '#3b82f6' : 'transparent',
                    borderColor: isActive ? '#3b82f6' : tc.border,
                  },
                ]}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.distChipText,
                  { color: isActive ? '#fff' : tc.textSecondary },
                ]}>
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* ===== TABELOG TAB ===== */}
      {activeTab === 'tabelog' && (
        <>
          {/* Filter section */}
          <Card style={{ marginBottom: 16, backgroundColor: tc.card }}>
            {/* Price slider */}
            <View style={styles.filterRow}>
              <Text style={[styles.filterLabel, { color: tc.textSecondary }]}>Price</Text>
              <Text style={styles.filterValue}>
                {maxPrice >= 15000 ? 'Any' : `≤ ¥${(maxPrice / 1000).toFixed(0)}k`}
              </Text>
            </View>
            <Slider
              value={maxPrice}
              onValueChange={setMaxPrice}
              minimumValue={1000}
              maximumValue={15000}
              step={1000}
              minimumTrackTintColor="#ea580c"
              maximumTrackTintColor="#e5e7eb"
              thumbTintColor="#ea580c"
              style={{ marginBottom: 16 }}
            />

            {/* Rating filter */}
            <Text style={[styles.filterLabel, { color: tc.textSecondary }]}>Minimum Rating</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 6, marginBottom: 14 }}>
              <View style={styles.chipRow}>
                {['all', '3.9', '3.8', '3.7', '3.6'].map(v => (
                  <FilterChip
                    key={v}
                    label={v === 'all' ? 'All' : `${v}+`}
                    color="yellow"
                    selected={minRating === v}
                    onPress={() => setMinRating(v)}
                  />
                ))}
              </View>
            </ScrollView>

            {/* Japanese only toggle */}
            <View style={[styles.filterRow, { marginBottom: 10 }]}>
              <Text style={[styles.filterLabel, { marginBottom: 0, color: tc.textSecondary }]}>Japanese food only</Text>
              <Switch
                value={japaneseOnly}
                onValueChange={(v) => { setJapaneseOnly(v); setCuisineFilter([]); }}
                trackColor={{ false: '#e5e7eb', true: '#fca5a5' }}
                thumbColor={japaneseOnly ? colors.primary : '#fff'}
              />
            </View>

            {/* Cuisine tags */}
            <Text style={[styles.filterLabel, { color: tc.textSecondary }]}>Cuisine</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 6 }}>
              <View style={styles.chipRow}>
                {cuisineTags.map(([key, label]) => (
                  <FilterChip
                    key={key}
                    label={label}
                    color="orange"
                    selected={cuisineFilter.includes(key)}
                    onPress={() => toggleCuisine(key)}
                  />
                ))}
              </View>
            </ScrollView>

          </Card>

          {/* Results count + Reset */}
          <View style={styles.resultsRow}>
            <Text style={[styles.resultCount, { color: tc.textMuted }]}>
              {sortedTabelog.length} restaurant{sortedTabelog.length !== 1 ? 's' : ''}
              {hasActiveFilters ? ' (filtered)' : ''}
              {sortNearest && userLoc ? ' · nearest first' : ''}
            </Text>
            {hasActiveFilters && (
              <TouchableOpacity onPress={resetFilters} style={[styles.resetBtn, { backgroundColor: tc.border }]}>
                <Ionicons name="refresh" size={14} color={colors.primary} />
                <Text style={styles.resetText}>Reset</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Grouped results */}
          {sortedTabelog.length === 0 ? (
            <Card>
              <View style={{ alignItems: 'center', paddingVertical: 20 }}>
                <Ionicons name="search" size={28} color={tc.textMuted} />
                <Text style={[styles.dimText, { color: tc.textSecondary, marginTop: 8 }]}>No restaurants match your filters.</Text>
                <TouchableOpacity onPress={resetFilters} style={{ marginTop: 8 }}>
                  <Text style={{ color: colors.primary, fontWeight: '600', fontSize: 13 }}>Reset filters</Text>
                </TouchableOpacity>
              </View>
            </Card>
          ) : (
            groupedTabelog.map(([station, items]) => (
              <View key={station} style={{ marginBottom: 12 }}>
                <View style={[styles.row, { marginBottom: 8, gap: 6 }]}>
                  <Ionicons name="location" size={14} color={tc.textMuted} />
                  <Text style={[styles.groupTitle, { color: tc.textSecondary }]}>{station}</Text>
                  <Badge label={`${items.length}`} color="gray" size="xs" />
                </View>
                {items.map((r) => (
                  <TabelogCard key={r.rank} r={r} />
                ))}
              </View>
            ))
          )}
        </>
      )}

      {/* ===== SAVES TAB ===== */}
      {activeTab === 'saves' && (
        <>
          {/* Filter section */}
          <Card style={{ marginBottom: 16, backgroundColor: tc.card }}>
            {/* Type filter */}
            <Text style={[styles.filterLabel, { color: tc.textSecondary }]}>Type</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 6, marginBottom: 12 }}>
              <View style={styles.chipRow}>
                {placeTypes.map(t => (
                  <FilterChip
                    key={t}
                    label={t}
                    color={PLACE_TYPE_COLORS[t] || 'gray'}
                    selected={typeFilter.includes(t)}
                    onPress={() => setTypeFilter(prev =>
                      prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]
                    )}
                  />
                ))}
              </View>
            </ScrollView>

            {/* Area filter */}
            <Text style={[styles.filterLabel, { color: tc.textSecondary }]}>Area</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 6 }}>
              <View style={styles.chipRow}>
                {savedAreas.map(a => (
                  <FilterChip
                    key={a}
                    label={a}
                    color="blue"
                    selected={areaFilter.includes(a)}
                    onPress={() => setAreaFilter(prev =>
                      prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a]
                    )}
                  />
                ))}
              </View>
            </ScrollView>

          </Card>

          {/* Results count + Reset */}
          <View style={styles.resultsRow}>
            <Text style={[styles.resultCount, { color: tc.textMuted }]}>
              {sortedSaves.length} saved place{sortedSaves.length !== 1 ? 's' : ''}
              {sortNearest && userLoc ? ' · nearest first' : ''}
            </Text>
            {(typeFilter.length > 0 || areaFilter.length > 0) && (
              <TouchableOpacity onPress={() => { setTypeFilter([]); setAreaFilter([]); }} style={[styles.resetBtn, { backgroundColor: tc.border }]}>
                <Ionicons name="refresh" size={14} color={colors.primary} />
                <Text style={styles.resetText}>Reset</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Grouped results */}
          {sortedSaves.length === 0 ? (
            <Card>
              <View style={{ alignItems: 'center', paddingVertical: 20 }}>
                <Ionicons name="bookmark-outline" size={28} color={tc.textMuted} />
                <Text style={[styles.dimText, { color: tc.textSecondary, marginTop: 8 }]}>No saved places match your filters.</Text>
              </View>
            </Card>
          ) : (
            groupedSaves.map(([area, items]) => (
              <View key={area} style={{ marginBottom: 12 }}>
                <View style={[styles.row, { marginBottom: 8, gap: 6 }]}>
                  <Ionicons name="location" size={14} color={tc.textMuted} />
                  <Text style={[styles.groupTitle, { color: tc.textSecondary }]}>{area}</Text>
                  <Badge label={`${items.length}`} color="gray" size="xs" />
                </View>
                {items.map((p, i) => (
                  <SavedPlaceCard key={i} p={p} />
                ))}
              </View>
            ))
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: 16, paddingTop: 54 },
  row: { flexDirection: 'row', alignItems: 'center' },

  // Tabs
  tabRow: {
    flexDirection: 'row', borderRadius: 20, padding: 3,
  },
  tab: {
    flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    paddingVertical: 10, borderRadius: 18, gap: 6,
  },
  tabActive: { backgroundColor: '#ea580c' },
  tabText: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
  tabTextActive: { color: '#fff' },

  // Filters
  filterRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  filterLabel: {
    fontSize: 12, fontWeight: '700', color: colors.textSecondary,
    textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4,
  },
  filterValue: { fontSize: 13, fontWeight: '600', color: '#ea580c' },
  chipRow: { flexDirection: 'row', paddingRight: 16 },
  resetBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8,
    backgroundColor: '#fef2f2',
  },
  resetText: { fontSize: 13, color: colors.primary, fontWeight: '600' },

  // Results
  resultsRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12,
  },
  resultCount: { fontSize: 13, color: colors.textMuted, fontWeight: '500' },
  groupTitle: { fontSize: 14, fontWeight: '600', color: colors.textSecondary },

  // Location button + distance presets
  tabLocationRow: {
    flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 8,
  },
  locBtn: {
    width: 40, height: 40, borderRadius: 20,
    justifyContent: 'center', alignItems: 'center',
  },
  distRow: {
    flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap',
    paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: 12, borderWidth: 1, marginBottom: 12, gap: 6,
  },
  distChip: {
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 20, borderWidth: 1,
  },
  distChipText: {
    fontSize: 12, fontWeight: '500',
  },

  // Cards
  cardRow: { flexDirection: 'row', alignItems: 'center' },
  cardName: { fontSize: 14, fontWeight: '600', color: colors.text, flex: 1, marginLeft: 6 },
  ratingText: { fontSize: 12, fontWeight: '600', color: '#a16207', marginLeft: 4 },
  dimText: { fontSize: 13, color: colors.textSecondary },
  mapBtn: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: '#fef2f2',
    justifyContent: 'center', alignItems: 'center', marginLeft: 10,
  },
});
