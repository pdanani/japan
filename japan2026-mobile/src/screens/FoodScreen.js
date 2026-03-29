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
  ramen: 'orange', noodle: 'orange', tsukemen: 'orange', soba: 'orange',
  sushi: 'blue', eel: 'blue', tempura: 'blue',
  coffee: 'yellow', cafe: 'yellow',
  bbq: 'red', katsu: 'red', wagyu: 'red', beef: 'red', jbbq: 'red',
  bar: 'grape', wine: 'grape', drinks: 'grape', izakaya: 'grape',
  pancake: 'pink', dessert: 'pink', ice: 'pink', sweet: 'pink', crepe: 'pink',
  pastry: 'pink', taiyaki: 'pink', bakery: 'pink',
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

export default function FoodScreen({ data }) {
  const { colors: tc } = useTheme();
  const [search, setSearch] = useState('');
  const [locFilter, setLocFilter] = useState('All');
  const [selectedPeople, setSelectedPeople] = useState([]);

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

  const togglePerson = (p) => {
    setSelectedPeople(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);
  };

  return (
    <ScrollView style={[styles.screen, { backgroundColor: tc.bg }]} contentContainerStyle={{ paddingBottom: 100 }}>
      <Text style={[styles.title, { color: tc.text }]}>Food Menu</Text>
      <Text style={[styles.subtitle, { color: tc.textMuted }]}>
        {filtered.length} restaurant{filtered.length !== 1 ? 's' : ''} across Japan
      </Text>

      <SearchBar
        value={search}
        onChangeText={setSearch}
        placeholder="Search restaurants, categories..."
      />

      {/* City filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
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

      {/* People filter */}
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
            No restaurants match your filters.
          </Text>
        </Card>
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
              {splitNames(f.name).map(n => (
                <Badge key={n} label={n} color="violet" size="xs" />
              ))}
            </View>
            {f.notes ? <Text style={[styles.notes, { color: tc.textSecondary }]} numberOfLines={3}>{f.notes}</Text> : null}
            {f.interested ? (
              <Text style={[styles.notes, { color: tc.textSecondary }]}>
                <Text style={{ fontWeight: '600', color: '#7c3aed' }}>Also interested: </Text>
                {f.interested}
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
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: 16, paddingTop: 54 },
  title: { fontSize: 22, fontWeight: '700', color: colors.text, marginBottom: 2 },
  subtitle: { fontSize: 13, color: colors.textMuted, marginBottom: 12 },
  row: { flexDirection: 'row', alignItems: 'center' },
  chipRow: { flexDirection: 'row', paddingRight: 16 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardTitle: { fontSize: 14, fontWeight: '600', color: colors.text, flex: 1, marginRight: 8 },
  notes: { fontSize: 12, color: colors.textSecondary, marginTop: 8 },
  linkText: { fontSize: 12, fontWeight: '600', color: colors.primary },
});
