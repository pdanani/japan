import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Linking,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors, badgeColor } from '../theme';
import { useTheme } from '../ThemeContext';
import Card from '../components/Card';
import Badge from '../components/Badge';
import { timeline } from '../data/tripData';
import { nearbyFinds } from '../data/nearbyFinds';
import { getPlacesForDay } from '../data/savedPlaces';

const TYPE_CONFIG = {
  transport: { color: 'violet', icon: 'train', label: 'Transport' },
  food: { color: 'orange', icon: 'restaurant', label: 'Food' },
  group: { color: 'blue', icon: 'people', label: 'Group' },
  shopping: { color: 'pink', icon: 'cart', label: 'Shopping' },
  site: { color: 'green', icon: 'business', label: 'Site' },
  rest: { color: 'gray', icon: 'bed', label: 'Rest' },
  activity: { color: 'yellow', icon: 'musical-notes', label: 'Activity' },
};

const SOURCE_CONFIG = {
  sheet: { icon: 'grid', color: 'blue', label: 'Timeline' },
  activities: { icon: 'checkmark-circle', color: 'teal', label: 'Activities' },
  food: { icon: 'restaurant', color: 'orange', label: 'Food' },
  maps: { icon: 'map', color: 'red', label: 'Maps' },
  tabelog: { icon: 'star', color: 'yellow', label: 'Tabelog' },
  ai: { icon: 'sparkles', color: 'grape', label: 'AI' },
};

export default function TimelineScreen() {
  const navigation = useNavigation();
  const { colors: tc } = useTheme();
  const [selected, setSelected] = useState(1);

  const day = timeline.find(d => d.day === selected);
  const tabelogList = nearbyFinds[selected] || [];
  const savedList = getPlacesForDay(selected);
  const nearbyCount = tabelogList.length + savedList.length;

  return (
    <ScrollView style={[styles.screen, { backgroundColor: tc.bg }]} contentContainerStyle={{ paddingBottom: 100 }}>
      {/* Header */}
      <Text style={[styles.title, { color: tc.text }]}>Trip Timeline</Text>
      <Text style={[styles.subtitle, { color: tc.textMuted }]}>Day-by-day itinerary</Text>

      {/* Type legend */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
        <View style={[styles.row, { gap: 6 }]}>
          {Object.entries(TYPE_CONFIG).map(([key, cfg]) => (
            <Badge key={key} label={cfg.label} color={cfg.color} size="xs" />
          ))}
        </View>
      </ScrollView>

      {/* Day selector */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
        <View style={[styles.row, { gap: 8 }]}>
          {timeline.map(d => {
            const active = d.day === selected;
            return (
              <TouchableOpacity
                key={d.day}
                onPress={() => setSelected(d.day)}
                style={[styles.dayBtn, { backgroundColor: tc.card, borderColor: tc.border }, active && styles.dayBtnActive]}
                activeOpacity={0.7}
              >
                <Text style={[styles.dayLabel, { color: tc.textMuted }, active && { color: 'rgba(255,255,255,0.85)' }]}>
                  {d.day === 0 ? 'Travel' : d.day === 15 ? 'End' : `Day ${d.day}`}
                </Text>
                <Text style={[styles.dayDate, { color: tc.text }, active && { color: '#fff' }]}>
                  {d.date.replace('July ', '7/')}
                </Text>
                <Text style={[styles.dayLoc, { color: tc.textMuted }, active && { color: 'rgba(255,255,255,0.8)' }]} numberOfLines={1}>
                  {d.location.length > 12 ? d.location.slice(0, 12) + '…' : d.location}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Day detail card */}
      {day && (
        <>
          <Card borderLeftColor={colors.primary}>
            <Text style={[styles.dayTitle, { color: tc.text }]}>
              {day.day === 0 ? 'Travel Day' : day.day === 15 ? 'Departure' : `Day ${day.day} — ${day.dayOfWeek}`}
            </Text>
            <View style={[styles.row, { marginTop: 6, gap: 12 }]}>
              <View style={styles.row}>
                <Ionicons name="calendar" size={14} color={tc.textMuted} />
                <Text style={[styles.dimText, { color: tc.textSecondary }]}> {day.date}</Text>
              </View>
              <View style={styles.row}>
                <Ionicons name="location" size={14} color={tc.textMuted} />
                <Text style={[styles.dimText, { color: tc.textSecondary }]}> {day.location}</Text>
              </View>
            </View>
            {day.schedule.length > 0 && (
              <Badge label={`${day.schedule.length} activities`} color="red" size="xs" style={{ marginTop: 8 }} />
            )}
            {day.notes && (
              <Text style={[styles.dimText, { color: tc.textSecondary, marginTop: 8, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: tc.border, paddingTop: 8 }]}>
                {day.notes}
              </Text>
            )}
          </Card>

          {/* Timeline items */}
          {day.schedule.length > 0 ? (
            <View style={{ marginLeft: 4 }}>
              {day.schedule.map((s, i) => {
                const cfg = TYPE_CONFIG[s.type] || { color: 'gray', icon: 'walk', label: '' };
                const srcCfg = s.source ? SOURCE_CONFIG[s.source] : null;
                const c = badgeColor(cfg.color);
                return (
                  <View key={`${selected}-${i}`} style={styles.timelineItem}>
                    {i < day.schedule.length - 1 && <View style={[styles.timelineLine, { backgroundColor: tc.border }]} />}
                    <View style={[styles.timelineBullet, { backgroundColor: c.text }]}>
                      <Ionicons name={cfg.icon} size={14} color="#fff" />
                    </View>
                    <View style={styles.timelineContent}>
                      <View style={styles.row}>
                        <Text style={[styles.activityName, { color: tc.text }, s.suggested && { fontStyle: 'italic' }]}>
                          {s.activity}
                        </Text>
                        {s.suggested && <Badge label="suggested" color="grape" size="xs" />}
                      </View>
                      <View style={[styles.row, { marginTop: 4, flexWrap: 'wrap', gap: 4 }]}>
                        <Badge label={s.time} color="gray" size="xs" />
                        <Badge label={cfg.label} color={cfg.color} size="xs" />
                        {srcCfg && <Badge label={srcCfg.label} color={srcCfg.color} size="xs" />}
                        {s.mapUrl && (
                          <TouchableOpacity onPress={() => Linking.openURL(s.mapUrl)}>
                            <Badge
                              label="Maps"
                              color="red"
                              size="xs"
                              icon={<Ionicons name="open-outline" size={10} color={colors.primary} />}
                            />
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          ) : (
            <Card>
              <View style={{ alignItems: 'center', paddingVertical: 16 }}>
                <Ionicons name="sad-outline" size={32} color={tc.textMuted} />
                <Text style={[styles.dimText, { color: tc.textSecondary, marginTop: 8 }]}>No detailed schedule yet for this day.</Text>
                <Text style={[styles.dimText, { color: tc.textSecondary, fontSize: 12, marginTop: 4 }]}>Check Food & Activities for ideas!</Text>
              </View>
            </Card>
          )}

          {/* Nearby Recs — Navigate to dedicated screen */}
          {nearbyCount > 0 && (
            <TouchableOpacity
              onPress={() => navigation.navigate('NearbyRecs', { dayNumber: selected })}
              style={[styles.nearbyBtn, { backgroundColor: tc.card, borderColor: tc.border }]}
              activeOpacity={0.7}
            >
              <View style={styles.nearbyLeft}>
                <View style={styles.nearbyIcon}>
                  <Ionicons name="flame" size={20} color="#ea580c" />
                </View>
                <View>
                  <Text style={[styles.nearbyTitle, { color: tc.text }]}>Nearby Recs</Text>
                  <Text style={[styles.nearbySubtitle, { color: tc.textMuted }]}>
                    {tabelogList.length} Tabelog · {savedList.length} saved
                  </Text>
                </View>
              </View>
              <View style={styles.row}>
                <Badge label={`${nearbyCount}`} color="orange" size="xs" />
                <Ionicons name="chevron-forward" size={20} color={tc.textMuted} style={{ marginLeft: 8 }} />
              </View>
            </TouchableOpacity>
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: 16, paddingTop: 54 },
  title: { fontSize: 22, fontWeight: '700', color: colors.text, marginBottom: 2 },
  subtitle: { fontSize: 13, color: colors.textMuted, marginBottom: 12 },
  row: { flexDirection: 'row', alignItems: 'center' },
  dayBtn: {
    minWidth: 78, alignItems: 'center', paddingVertical: 10, paddingHorizontal: 12,
    borderRadius: 10, borderWidth: 1.5, borderColor: colors.border,
  },
  dayBtnActive: {
    backgroundColor: colors.primary, borderColor: colors.primary,
    shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8,
  },
  dayLabel: { fontSize: 10, fontWeight: '600', textTransform: 'uppercase', color: colors.textMuted },
  dayDate: { fontSize: 14, fontWeight: '700', color: colors.text, marginTop: 2 },
  dayLoc: { fontSize: 10, color: colors.textMuted, marginTop: 2 },
  dayTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  dimText: { fontSize: 13, color: colors.textSecondary },
  timelineItem: { flexDirection: 'row', marginBottom: 4, position: 'relative' },
  timelineLine: {
    position: 'absolute', left: 13, top: 28, bottom: -4, width: 2, backgroundColor: colors.border,
  },
  timelineBullet: {
    width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  timelineContent: { flex: 1, paddingBottom: 16 },
  activityName: { fontSize: 14, fontWeight: '600', color: colors.text, flex: 1, marginRight: 6 },

  // Nearby Recs button
  nearbyBtn: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderRadius: 14, padding: 16, marginTop: 20,
    borderWidth: 1, borderColor: '#fed7aa',
    shadowColor: '#ea580c', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 8, elevation: 2,
  },
  nearbyLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  nearbyIcon: {
    width: 40, height: 40, borderRadius: 12, backgroundColor: '#fff7ed',
    justifyContent: 'center', alignItems: 'center',
  },
  nearbyTitle: { fontSize: 15, fontWeight: '700', color: colors.text },
  nearbySubtitle: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
});
