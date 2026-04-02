import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Linking, FlatList, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme';
import { useTheme } from '../ThemeContext';
import Card from '../components/Card';
import Badge from '../components/Badge';
import SearchBar from '../components/SearchBar';
import FilterChip from '../components/FilterChip';
import { tabelogAll as tabelogTokyoAll } from '../data/tabelogAll';
import { tabelogOsakaDinnerAll } from '../data/tabelogOsakaDinnerAll';

const NON_JAPANESE = [
  'italian', 'french', 'indian', 'chinese', 'sichuan', 'korean',
  'thai', 'vietnamese', 'spanish', 'american', 'peruvian',
  'nepalese', 'sri lankan', 'bistro', 'pizza', 'pasta', 'steak',
];

function parsePrice(p) {
  if (!p) return 0;
  const m = p.match(/[\d,]+/);
  return m ? parseInt(m[0].replace(/,/g, ''), 10) : 0;
}

function getCatColor(cat) {
  const c = (cat || '').toLowerCase();
  const map = {
    ramen: 'orange', noodle: 'orange', soba: 'orange', sushi: 'blue',
    coffee: 'yellow', cafe: 'yellow', bbq: 'red', katsu: 'red',
    bar: 'grape', wine: 'grape', izakaya: 'grape', curry: 'orange',
    pancake: 'pink', dessert: 'pink', cake: 'pink', bread: 'yellow',
  };
  for (const [key, color] of Object.entries(map)) {
    if (c.includes(key)) return color;
  }
  return 'gray';
}

function splitNames(name) {
  if (!name) return [];
  return name.split(/\s*[/,]\s*/).map(n => n.trim()).filter(Boolean);
}

const INITIAL_SHOW = 50;

export default function FoodScreen({ data }) {
  const { colors: tc } = useTheme();
  const [tab, setTab] = useState('tabelog');

  // === Our Picks state ===
  const [search, setSearch] = useState('');
  const [locFilter, setLocFilter] = useState('All');
  const [selectedPeople, setSelectedPeople] = useState([]);

  // === Tabelog state ===
  const [tSearch, setTSearch] = useState('');
  const [tabelogCity, setTabelogCity] = useState('Tokyo');
  const [maxPrice, setMaxPrice] = useState(15000);
  const [minRating, setMinRating] = useState('all');
  const [japaneseOnly, setJapaneseOnly] = useState(false);
  const [cuisineFilter, setCuisineFilter] = useState([]);
  const [showAll, setShowAll] = useState(false);

  // === Our Picks logic ===
  const locations = useMemo(() => ['All', ...new Set(data.map(f => f.location).filter(Boolean))], [data]);
  const people = useMemo(() => [...new Set(data.flatMap(f => splitNames(f.name)))].sort(), [data]);
  const filtered = useMemo(() => {
    let items = data;
    if (locFilter !== 'All') items = items.filter(f => f.location === locFilter);
    if (selectedPeople.length > 0) items = items.filter(f => splitNames(f.name).some(n => selectedPeople.includes(n)));
    if (search) {
      const q = search.toLowerCase();
      items = items.filter(f =>
        f.details.toLowerCase().includes(q) || f.category.toLowerCase().includes(q) ||
        f.name.toLowerCase().includes(q) || f.location.toLowerCase().includes(q) ||
        (f.neighborhood || '').toLowerCase().includes(q) || (f.notes || '').toLowerCase().includes(q)
      );
    }
    return items;
  }, [data, locFilter, selectedPeople, search]);
  const togglePerson = (p) => setSelectedPeople(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);

  // === Tabelog logic ===
  const tabelogSource = useMemo(
    () => (tabelogCity === 'Osaka' ? tabelogOsakaDinnerAll : tabelogTokyoAll),
    [tabelogCity],
  );
  const cuisineTags = useMemo(() => {
    const cats = new Map();
    tabelogSource.forEach(r => {
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
  }, [tabelogSource, japaneseOnly]);

  const tabelogFiltered = useMemo(() => {
    let items = tabelogSource;
    if (maxPrice < 15000) items = items.filter(r => parsePrice(r.price) <= maxPrice);
    if (minRating !== 'all') { const min = parseFloat(minRating); items = items.filter(r => r.rating >= min); }
    if (cuisineFilter.length > 0) items = items.filter(r => { const cats = (r.cuisine || '').toLowerCase(); return cuisineFilter.some(c => cats.includes(c)); });
    if (japaneseOnly) items = items.filter(r => { const cats = (r.cuisine || '').toLowerCase(); return !NON_JAPANESE.some(nj => cats.includes(nj)); });
    if (tSearch) {
      const q = tSearch.toLowerCase();
      items = items.filter(r => r.name.toLowerCase().includes(q) || r.cuisine.toLowerCase().includes(q) || r.station.toLowerCase().includes(q));
    }
    return items;
  }, [tabelogSource, maxPrice, minRating, cuisineFilter, japaneseOnly, tSearch]);

  const tHasFilters = maxPrice < 15000 || minRating !== 'all' || cuisineFilter.length > 0 || japaneseOnly || tSearch;
  const tResetAll = () => { setMaxPrice(15000); setMinRating('all'); setCuisineFilter([]); setJapaneseOnly(false); setTSearch(''); setShowAll(false); };
  const visibleTabelog = showAll ? tabelogFiltered : tabelogFiltered.slice(0, INITIAL_SHOW);

  return (
    <View style={[styles.screen, { backgroundColor: tc.bg }]}>
      <Text style={[styles.title, { color: tc.text }]}>Food Menu</Text>
      <Text style={[styles.subtitle, { color: tc.textMuted }]}>
        {tab === 'tabelog' ? `${tabelogFiltered.length} Tabelog-rated restaurants in ${tabelogCity}` : `${filtered.length} from our picks`}
      </Text>

      {/* Tab switcher */}
      <View style={[styles.tabRow, { backgroundColor: tc.card, borderColor: tc.border }]}>
        <TouchableOpacity
          onPress={() => setTab('tabelog')}
          style={[styles.tabBtn, tab === 'tabelog' && { backgroundColor: colors.primary }]}
          activeOpacity={0.7}
        >
          <Ionicons name="star" size={14} color={tab === 'tabelog' ? '#fff' : tc.textMuted} />
          <Text style={[styles.tabText, { color: tab === 'tabelog' ? '#fff' : tc.textMuted }]}>Tabelog 1200</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setTab('picks')}
          style={[styles.tabBtn, tab === 'picks' && { backgroundColor: colors.primary }]}
          activeOpacity={0.7}
        >
          <Ionicons name="restaurant" size={14} color={tab === 'picks' ? '#fff' : tc.textMuted} />
          <Text style={[styles.tabText, { color: tab === 'picks' ? '#fff' : tc.textMuted }]}>Our Picks ({data.length})</Text>
        </TouchableOpacity>
      </View>

      {/* ===== TABELOG TAB ===== */}
      {tab === 'tabelog' && (
        <FlatList
          data={visibleTabelog}
          keyExtractor={(item, i) => `${item.name}-${i}`}
          contentContainerStyle={{ paddingBottom: 120 }}
          ListHeaderComponent={
            <View>
              <View style={[styles.cityRow, { backgroundColor: tc.card, borderColor: tc.border }]}>
                {['Tokyo', 'Osaka'].map((city) => (
                  <TouchableOpacity
                    key={city}
                    onPress={() => {
                      setTabelogCity(city);
                      setCuisineFilter([]);
                      setTSearch('');
                      setShowAll(false);
                    }}
                    style={[styles.cityBtn, tabelogCity === city && { backgroundColor: colors.primary }]}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.cityBtnText, { color: tabelogCity === city ? '#fff' : tc.textMuted }]}>
                      {city}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <SearchBar value={tSearch} onChangeText={(v) => { setTSearch(v); setShowAll(false); }} placeholder={`Search name, cuisine, station in ${tabelogCity}...`} />

              {/* Rating pills */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
                <View style={styles.chipRow}>
                  {['all', '4.0', '3.9', '3.8', '3.7'].map(v => (
                    <FilterChip key={v} label={v === 'all' ? 'All' : `${v}+`} color="yellow"
                      selected={minRating === v} onPress={() => { setMinRating(v); setShowAll(false); }} />
                  ))}
                  {tHasFilters && (
                    <TouchableOpacity onPress={tResetAll} style={{ justifyContent: 'center', paddingHorizontal: 8 }}>
                      <Text style={{ fontSize: 12, fontWeight: '600', color: '#ea580c' }}>Reset</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </ScrollView>

              {/* Price pills */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
                <View style={styles.chipRow}>
                  {[{ l: '¥1k', v: 1000 }, { l: '¥3k', v: 3000 }, { l: '¥6k', v: 6000 }, { l: '¥10k', v: 10000 }, { l: 'Any', v: 15000 }].map(({ l, v }) => (
                    <FilterChip key={v} label={l} color="orange"
                      selected={maxPrice === v} onPress={() => { setMaxPrice(v); setShowAll(false); }} />
                  ))}
                </View>
              </ScrollView>

              {/* Japanese only */}
              <View style={[styles.switchRow, { borderColor: tc.border }]}>
                <Text style={{ fontSize: 12, color: tc.textSecondary }}>Japanese food only</Text>
                <Switch value={japaneseOnly} onValueChange={(v) => { setJapaneseOnly(v); setCuisineFilter([]); setShowAll(false); }}
                  trackColor={{ false: tc.border, true: '#fdba74' }} thumbColor={japaneseOnly ? '#ea580c' : tc.card} />
              </View>

              {/* Cuisine tags */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
                <View style={styles.chipRow}>
                  {cuisineTags.slice(0, 30).map(([key, label]) => (
                    <FilterChip key={key} label={label} color="orange"
                      selected={cuisineFilter.includes(key)}
                      onPress={() => { setCuisineFilter(prev => prev.includes(key) ? prev.filter(c => c !== key) : [...prev, key]); setShowAll(false); }} />
                  ))}
                </View>
              </ScrollView>
            </View>
          }
          renderItem={({ item: r, index: i }) => (
            <Card>
              <View style={styles.cardHeader}>
                <View style={[styles.rankBadge, { backgroundColor: '#ea580c' }]}>
                  <Text style={styles.rankText}>#{i + 1}</Text>
                </View>
                <Text style={[styles.cardTitle, { color: tc.text }]} numberOfLines={1}>{r.name}</Text>
                <View style={styles.ratingRow}>
                  <Ionicons name="star" size={12} color="#f59f00" />
                  <Text style={{ fontSize: 12, fontWeight: '700', color: '#f59f00', marginLeft: 2 }}>{r.rating}</Text>
                </View>
              </View>
              <Text style={{ fontSize: 12, color: tc.textSecondary, marginTop: 4 }} numberOfLines={1}>{r.cuisine}</Text>
              <View style={[styles.row, { marginTop: 6, gap: 4 }]}>
                <Badge label={r.price} color="gray" size="xs" />
                <Badge label={r.station} color="blue" size="xs" />
              </View>
              {r.lat && r.lng && (
                <TouchableOpacity onPress={() => Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${r.lat},${r.lng}`)} style={{ marginTop: 8 }}>
                  <View style={styles.row}>
                    <Text style={styles.linkText}>View on map</Text>
                    <Ionicons name="open-outline" size={12} color={colors.primary} style={{ marginLeft: 4 }} />
                  </View>
                </TouchableOpacity>
              )}
            </Card>
          )}
          ListFooterComponent={
            !showAll && tabelogFiltered.length > INITIAL_SHOW ? (
              <TouchableOpacity onPress={() => setShowAll(true)} style={[styles.showAllBtn, { backgroundColor: tc.card, borderColor: tc.border }]}>
                <Text style={{ fontSize: 13, fontWeight: '600', color: '#ea580c' }}>Show all {tabelogFiltered.length} restaurants</Text>
              </TouchableOpacity>
            ) : null
          }
          ListEmptyComponent={
            <Card>
              <Text style={{ textAlign: 'center', color: tc.textMuted, paddingVertical: 16 }}>No restaurants match these filters.</Text>
            </Card>
          }
        />
      )}

      {/* ===== OUR PICKS TAB ===== */}
      {tab === 'picks' && (
        <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
          <SearchBar value={search} onChangeText={setSearch} placeholder="Search restaurants, categories..." />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
            <View style={styles.chipRow}>
              {locations.map(loc => (
                <FilterChip key={loc} label={loc} color="red" selected={locFilter === loc} onPress={() => setLocFilter(loc)} />
              ))}
            </View>
          </ScrollView>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
            <View style={styles.chipRow}>
              {people.map(p => (
                <FilterChip key={p} label={p} color="violet" selected={selectedPeople.includes(p)} onPress={() => togglePerson(p)} />
              ))}
            </View>
          </ScrollView>
          {filtered.length === 0 ? (
            <Card><Text style={{ textAlign: 'center', color: tc.textMuted, paddingVertical: 16 }}>No restaurants match your filters.</Text></Card>
          ) : (
            filtered.map((f, i) => (
              <Card key={i}>
                <View style={styles.cardHeader}>
                  <Text style={[styles.cardTitle, { color: tc.text }]} numberOfLines={2}>{f.details}</Text>
                  <Badge label={f.category} color={getCatColor(f.category)} size="xs" />
                </View>
                <View style={[styles.row, { marginTop: 6, flexWrap: 'wrap', gap: 4 }]}>
                  {f.location && <Badge label={f.location} color="blue" size="xs" />}
                  {f.neighborhood && <Badge label={f.neighborhood} color="teal" size="xs" />}
                  {splitNames(f.name).map(n => <Badge key={n} label={n} color="violet" size="xs" />)}
                </View>
                {f.notes ? <Text style={[styles.notes, { color: tc.textSecondary }]} numberOfLines={3}>{f.notes}</Text> : null}
                {f.interested ? (
                  <Text style={[styles.notes, { color: tc.textSecondary }]}>
                    <Text style={{ fontWeight: '600', color: '#7c3aed' }}>Also interested: </Text>{f.interested}
                  </Text>
                ) : null}
                {f.link ? (
                  <TouchableOpacity onPress={() => Linking.openURL(f.link)} style={{ marginTop: 8 }}>
                    <View style={styles.row}>
                      <Text style={styles.linkText}>View details</Text>
                      <Ionicons name="open-outline" size={12} color={colors.primary} style={{ marginLeft: 4 }} />
                    </View>
                  </TouchableOpacity>
                ) : null}
              </Card>
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, paddingHorizontal: 16, paddingTop: 54 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 2 },
  subtitle: { fontSize: 13, marginBottom: 12 },
  row: { flexDirection: 'row', alignItems: 'center' },
  chipRow: { flexDirection: 'row', paddingRight: 16, gap: 6 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardTitle: { fontSize: 14, fontWeight: '600', flex: 1, marginRight: 8 },
  notes: { fontSize: 12, marginTop: 8 },
  linkText: { fontSize: 12, fontWeight: '600', color: colors.primary },
  tabRow: {
    flexDirection: 'row', borderRadius: 24, borderWidth: 1,
    marginBottom: 12, overflow: 'hidden',
  },
  tabBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 10, gap: 6,
  },
  tabText: { fontSize: 13, fontWeight: '600' },
  cityRow: {
    flexDirection: 'row',
    borderRadius: 14,
    borderWidth: 1,
    padding: 4,
    marginBottom: 10,
  },
  cityBtn: {
    flex: 1,
    borderRadius: 10,
    alignItems: 'center',
    paddingVertical: 8,
  },
  cityBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  rankBadge: {
    paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginRight: 6,
  },
  rankText: { fontSize: 10, fontWeight: '700', color: '#fff' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', flexShrink: 0 },
  switchRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 6, marginBottom: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  showAllBtn: {
    alignItems: 'center', paddingVertical: 12, marginTop: 8,
    borderRadius: 12, borderWidth: 1,
  },
});
