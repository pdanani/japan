import React, { useState, useMemo } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  Linking, Switch, FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { colors, badgeColor } from '../theme';
import Card from '../components/Card';
import Badge from '../components/Badge';
import FilterChip from '../components/FilterChip';
import { nearbyFinds } from '../data/nearbyFinds';
import { getPlacesForDay } from '../data/savedPlaces';

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
  return (
    <Card borderLeftColor="#ea580c">
      <View style={styles.cardRow}>
        <View style={{ flex: 1 }}>
          <View style={styles.row}>
            <Badge label={`#${r.rank}`} color="orange" size="xs" />
            <Text style={styles.cardName} numberOfLines={1}>{r.name}</Text>
          </View>
          <View style={[styles.row, { marginTop: 4 }]}>
            <Ionicons name="star" size={12} color="#f59f00" />
            <Text style={styles.ratingText}>{r.rating}</Text>
            <Text style={styles.dimText}> · {r.cuisine}</Text>
          </View>
          <View style={[styles.row, { marginTop: 6, flexWrap: 'wrap', gap: 4 }]}>
            <Badge label={r.price} color="gray" size="xs" />
            {r.dinnerPrice && <Badge label={`Dinner: ${r.dinnerPrice}`} color="red" size="xs" />}
            <Badge label={r.station} color="blue" size="xs" />
          </View>
        </View>
        {r.mapUrl && (
          <TouchableOpacity onPress={() => Linking.openURL(r.mapUrl)} style={styles.mapBtn}>
            <Ionicons name="map" size={16} color={colors.primary} />
          </TouchableOpacity>
        )}
      </View>
    </Card>
  );
}

function SavedPlaceCard({ p }) {
  const color = PLACE_TYPE_COLORS[p.type] || 'gray';
  return (
    <Card borderLeftColor={badgeColor(color).text}>
      <View style={styles.cardRow}>
        <View style={{ flex: 1 }}>
          <View style={styles.row}>
            <Badge label={p.type} color={color} size="xs" />
            <Text style={styles.cardName} numberOfLines={1}>{p.name}</Text>
          </View>
          {(p.area || p.note) && (
            <View style={[styles.row, { marginTop: 4, gap: 4 }]}>
              {p.area && <Badge label={p.area} color="blue" size="xs" />}
              {p.note ? <Text style={styles.dimText} numberOfLines={1}>{p.note}</Text> : null}
            </View>
          )}
        </View>
        <TouchableOpacity onPress={() => Linking.openURL(p.mapUrl)} style={styles.mapBtn}>
          <Ionicons name="map" size={16} color={colors.primary} />
        </TouchableOpacity>
      </View>
    </Card>
  );
}

export default function NearbyRecsScreen({ route }) {
  const { dayNumber } = route.params;
  const tabelogList = nearbyFinds[dayNumber] || [];
  const savedList = getPlacesForDay(dayNumber);

  // Tab state
  const [activeTab, setActiveTab] = useState(tabelogList.length > 0 ? 'tabelog' : 'saves');

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

  // Group by station/area
  const groupedTabelog = useMemo(() => {
    const grouped = {};
    filteredTabelog.forEach(r => {
      const key = r.station || 'Other';
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(r);
    });
    return Object.entries(grouped);
  }, [filteredTabelog]);

  const groupedSaves = useMemo(() => {
    const grouped = {};
    filteredSaves.forEach(p => {
      const key = p.area || p.city || 'Other';
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(p);
    });
    return Object.entries(grouped);
  }, [filteredSaves]);

  const hasActiveFilters = maxPrice < 15000 || minRating !== 'all' || cuisineFilter.length > 0 || japaneseOnly;

  const toggleCuisine = (key) => {
    setCuisineFilter(prev => prev.includes(key) ? prev.filter(c => c !== key) : [...prev, key]);
  };

  const resetFilters = () => {
    setMaxPrice(15000);
    setMinRating('all');
    setCuisineFilter([]);
    setJapaneseOnly(false);
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ paddingBottom: 100 }}>
      {/* Tab switcher */}
      <View style={styles.tabRow}>
        {tabelogList.length > 0 && (
          <TouchableOpacity
            onPress={() => setActiveTab('tabelog')}
            style={[styles.tab, activeTab === 'tabelog' && styles.tabActive]}
          >
            <Ionicons name="star" size={14} color={activeTab === 'tabelog' ? '#fff' : colors.textSecondary} />
            <Text style={[styles.tabText, activeTab === 'tabelog' && styles.tabTextActive]}>
              Tabelog ({tabelogList.length})
            </Text>
          </TouchableOpacity>
        )}
        {savedList.length > 0 && (
          <TouchableOpacity
            onPress={() => setActiveTab('saves')}
            style={[styles.tab, activeTab === 'saves' && styles.tabActive]}
          >
            <Ionicons name="bookmark" size={14} color={activeTab === 'saves' ? '#fff' : colors.textSecondary} />
            <Text style={[styles.tabText, activeTab === 'saves' && styles.tabTextActive]}>
              Your Saves ({savedList.length})
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* ===== TABELOG TAB ===== */}
      {activeTab === 'tabelog' && (
        <>
          {/* Filter section */}
          <Card style={{ marginBottom: 16, backgroundColor: '#fafaf9' }}>
            {/* Price slider */}
            <View style={styles.filterRow}>
              <Text style={styles.filterLabel}>Price</Text>
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
            <Text style={styles.filterLabel}>Minimum Rating</Text>
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
              <Text style={[styles.filterLabel, { marginBottom: 0 }]}>Japanese food only</Text>
              <Switch
                value={japaneseOnly}
                onValueChange={(v) => { setJapaneseOnly(v); setCuisineFilter([]); }}
                trackColor={{ false: '#e5e7eb', true: '#fca5a5' }}
                thumbColor={japaneseOnly ? colors.primary : '#fff'}
              />
            </View>

            {/* Cuisine tags */}
            <Text style={styles.filterLabel}>Cuisine</Text>
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
            <Text style={styles.resultCount}>
              {filteredTabelog.length} restaurant{filteredTabelog.length !== 1 ? 's' : ''}
              {hasActiveFilters ? ' (filtered)' : ''}
            </Text>
            {hasActiveFilters && (
              <TouchableOpacity onPress={resetFilters} style={styles.resetBtn}>
                <Ionicons name="refresh" size={14} color={colors.primary} />
                <Text style={styles.resetText}>Reset</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Grouped results */}
          {filteredTabelog.length === 0 ? (
            <Card>
              <View style={{ alignItems: 'center', paddingVertical: 20 }}>
                <Ionicons name="search" size={28} color={colors.textMuted} />
                <Text style={[styles.dimText, { marginTop: 8 }]}>No restaurants match your filters.</Text>
                <TouchableOpacity onPress={resetFilters} style={{ marginTop: 8 }}>
                  <Text style={{ color: colors.primary, fontWeight: '600', fontSize: 13 }}>Reset filters</Text>
                </TouchableOpacity>
              </View>
            </Card>
          ) : (
            groupedTabelog.map(([station, items]) => (
              <View key={station} style={{ marginBottom: 12 }}>
                <View style={[styles.row, { marginBottom: 8, gap: 6 }]}>
                  <Ionicons name="location" size={14} color={colors.textMuted} />
                  <Text style={styles.groupTitle}>{station}</Text>
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
          <Card style={{ marginBottom: 16, backgroundColor: '#fafaf9' }}>
            {/* Type filter */}
            <Text style={styles.filterLabel}>Type</Text>
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
            <Text style={styles.filterLabel}>Area</Text>
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
            <Text style={styles.resultCount}>
              {filteredSaves.length} saved place{filteredSaves.length !== 1 ? 's' : ''}
            </Text>
            {(typeFilter.length > 0 || areaFilter.length > 0) && (
              <TouchableOpacity onPress={() => { setTypeFilter([]); setAreaFilter([]); }} style={styles.resetBtn}>
                <Ionicons name="refresh" size={14} color={colors.primary} />
                <Text style={styles.resetText}>Reset</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Grouped results */}
          {filteredSaves.length === 0 ? (
            <Card>
              <View style={{ alignItems: 'center', paddingVertical: 20 }}>
                <Ionicons name="bookmark-outline" size={28} color={colors.textMuted} />
                <Text style={[styles.dimText, { marginTop: 8 }]}>No saved places match your filters.</Text>
              </View>
            </Card>
          ) : (
            groupedSaves.map(([area, items]) => (
              <View key={area} style={{ marginBottom: 12 }}>
                <View style={[styles.row, { marginBottom: 8, gap: 6 }]}>
                  <Ionicons name="location" size={14} color={colors.textMuted} />
                  <Text style={styles.groupTitle}>{area}</Text>
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
  screen: { flex: 1, backgroundColor: colors.bg, padding: 16 },
  row: { flexDirection: 'row', alignItems: 'center' },

  // Tabs
  tabRow: {
    flexDirection: 'row', backgroundColor: '#f3f4f6', borderRadius: 20, padding: 3, marginBottom: 16,
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
