import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme';
import { useTheme } from '../ThemeContext';
import Card from '../components/Card';
import Badge from '../components/Badge';
import SearchBar from '../components/SearchBar';
import FilterChip from '../components/FilterChip';

const CAT_COLORS = {
  shopping: 'pink', cameras: 'pink',
  site: 'green', sites: 'green',
  activity: 'violet', 'day trip': 'indigo', overnight: 'indigo',
  music: 'grape', drinks: 'grape',
};

function getCatColor(cat) {
  const c = cat.toLowerCase();
  for (const [key, color] of Object.entries(CAT_COLORS)) {
    if (c.includes(key)) return color;
  }
  return 'gray';
}

function splitNames(name) {
  if (!name) return [];
  return name.split(/\s*[/,]\s*/).map(n => n.trim()).filter(Boolean);
}

export default function ActivitiesScreen({ data }) {
  const { colors: tc } = useTheme();
  const [search, setSearch] = useState('');
  const [locFilter, setLocFilter] = useState('All');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedPeople, setSelectedPeople] = useState([]);

  const locations = useMemo(() => ['All', ...[...new Set(data.map(a => a.location).filter(Boolean))].sort()], [data]);
  const categories = useMemo(() => [...new Set(data.map(a => a.category).filter(Boolean))].sort(), [data]);
  const people = useMemo(() => [...new Set(data.flatMap(a => splitNames(a.name)))].sort(), [data]);

  const filtered = useMemo(() => {
    let items = data;
    if (locFilter !== 'All') items = items.filter(a => a.location === locFilter);
    if (selectedCategories.length > 0) items = items.filter(a => selectedCategories.includes(a.category));
    if (selectedPeople.length > 0) items = items.filter(a => splitNames(a.name).some(n => selectedPeople.includes(n)));
    if (search) {
      const q = search.toLowerCase();
      items = items.filter(a =>
        a.details.toLowerCase().includes(q) || a.category.toLowerCase().includes(q) ||
        a.name.toLowerCase().includes(q) || a.location.toLowerCase().includes(q) ||
        (a.notes || '').toLowerCase().includes(q)
      );
    }
    return items;
  }, [data, locFilter, selectedCategories, selectedPeople, search]);

  const toggleCat = (c) => {
    setSelectedCategories(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);
  };
  const togglePerson = (p) => {
    setSelectedPeople(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);
  };

  return (
    <ScrollView style={[styles.screen, { backgroundColor: tc.bg }]} contentContainerStyle={{ paddingBottom: 100 }}>
      <Text style={[styles.title, { color: tc.text }]}>Activities</Text>
      <Text style={[styles.subtitle, { color: tc.textMuted }]}>
        {filtered.length} thing{filtered.length !== 1 ? 's' : ''} to see, do, and explore
      </Text>

      <SearchBar
        value={search}
        onChangeText={setSearch}
        placeholder="Search activities, sites, shops..."
      />

      {/* City filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
        <View style={styles.chipRow}>
          {locations.map(loc => (
            <FilterChip
              key={loc}
              label={loc}
              color="red"
              selected={locFilter === loc}
              onPress={() => setLocFilter(loc)}
            />
          ))}
        </View>
      </ScrollView>

      {/* Category filter */}
      <Text style={[styles.filterLabel, { color: tc.textMuted }]}>Type</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
        <View style={styles.chipRow}>
          {categories.map(c => (
            <FilterChip
              key={c}
              label={c}
              color={getCatColor(c)}
              selected={selectedCategories.includes(c)}
              onPress={() => toggleCat(c)}
            />
          ))}
        </View>
      </ScrollView>

      {/* People filter */}
      <Text style={[styles.filterLabel, { color: tc.textMuted }]}>Suggested by</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
        <View style={styles.chipRow}>
          {people.map(p => (
            <FilterChip
              key={p}
              label={p}
              color="violet"
              selected={selectedPeople.includes(p)}
              onPress={() => togglePerson(p)}
            />
          ))}
        </View>
      </ScrollView>

      {filtered.length === 0 ? (
        <Card>
          <Text style={{ textAlign: 'center', color: tc.textMuted, paddingVertical: 16 }}>
            No activities match your filters.
          </Text>
        </Card>
      ) : (
        filtered.map((a, i) => (
          <Card key={i}>
            <View style={styles.cardHeader}>
              <Text style={[styles.cardTitle, { color: tc.text }]} numberOfLines={2}>{a.details}</Text>
              <Badge label={a.category} color={getCatColor(a.category)} size="xs" />
            </View>
            <View style={[styles.row, { marginTop: 6, flexWrap: 'wrap', gap: 4 }]}>
              {a.location && <Badge label={a.location} color="blue" size="xs" />}
              {splitNames(a.name).map(n => (
                <Badge key={n} label={n} color="violet" size="xs" />
              ))}
            </View>
            {a.notes ? <Text style={[styles.notes, { color: tc.textSecondary }]} numberOfLines={3}>{a.notes}</Text> : null}
            {a.interested ? (
              <Text style={[styles.notes, { color: tc.textSecondary }]}>
                <Text style={{ fontWeight: '600', color: '#7c3aed' }}>Also interested: </Text>
                {a.interested}
              </Text>
            ) : null}
            {a.link ? (
              <TouchableOpacity onPress={() => Linking.openURL(a.link)} style={{ marginTop: 8 }}>
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
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: 16, paddingTop: 54 },
  title: { fontSize: 22, fontWeight: '700', color: colors.text, marginBottom: 2 },
  subtitle: { fontSize: 13, color: colors.textMuted, marginBottom: 12 },
  row: { flexDirection: 'row', alignItems: 'center' },
  chipRow: { flexDirection: 'row', paddingRight: 16 },
  filterLabel: { fontSize: 11, fontWeight: '600', color: colors.textMuted, textTransform: 'uppercase', marginBottom: 6, letterSpacing: 0.5 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardTitle: { fontSize: 14, fontWeight: '600', color: colors.text, flex: 1, marginRight: 8 },
  notes: { fontSize: 12, color: colors.textSecondary, marginTop: 8 },
  linkText: { fontSize: 12, fontWeight: '600', color: colors.primary },
});
