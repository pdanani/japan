import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, badgeColor } from '../theme';
import Card from '../components/Card';
import Badge from '../components/Badge';
import { tasks, links, notes } from '../data/tripData';

export default function PlanningScreen() {
  const done = tasks.filter(t => t.status === 'done').length;
  const pending = tasks.filter(t => t.status === 'pending').length;
  const todo = tasks.length - done - pending;
  const pct = Math.round((done / tasks.length) * 100);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ paddingBottom: 100 }}>
      <Text style={styles.title}>Planning</Text>
      <Text style={styles.subtitle}>Checklist, links, and notes</Text>

      {/* Progress card */}
      <Card>
        <View style={styles.row}>
          <View style={styles.progressCircle}>
            <Text style={styles.progressText}>{pct}%</Text>
          </View>
          <View style={{ marginLeft: 14 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text }}>Progress</Text>
            <View style={[styles.row, { marginTop: 6, gap: 6 }]}>
              <Badge label={`${done} done`} color="teal" size="xs" />
              <Badge label={`${pending} pending`} color="yellow" size="xs" />
              <Badge label={`${todo} to do`} color="gray" size="xs" />
            </View>
          </View>
        </View>
        {/* Progress bar */}
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${pct}%`, backgroundColor: badgeColor('teal').text }]} />
          <View style={[styles.progressFill, { width: `${(pending / tasks.length) * 100}%`, backgroundColor: badgeColor('yellow').text }]} />
        </View>
      </Card>

      {/* Checklist */}
      <Text style={styles.sectionTitle}>Checklist</Text>
      {tasks.map((t, i) => {
        const statusColor = t.status === 'done' ? 'teal' : t.status === 'pending' ? 'yellow' : 'gray';
        const borderColor = t.status === 'done' ? '#059669' : t.status === 'pending' ? '#eab308' : '#e5e7eb';
        const iconName = t.status === 'done' ? 'checkmark-circle' : t.status === 'pending' ? 'time' : 'ellipse-outline';
        return (
          <Card key={i} borderLeftColor={borderColor} style={{ padding: 12 }}>
            <View style={styles.row}>
              <Ionicons
                name={iconName}
                size={20}
                color={badgeColor(statusColor).text}
                style={{ marginRight: 10 }}
              />
              <Text
                style={[
                  styles.taskText,
                  t.status === 'done' && { textDecorationLine: 'line-through', color: colors.textMuted },
                ]}
              >
                {t.task}
              </Text>
            </View>
          </Card>
        );
      })}

      {/* Links */}
      <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Useful Links</Text>
      {links.map((l, i) => (
        <TouchableOpacity key={i} onPress={() => Linking.openURL(l.url)} activeOpacity={0.7}>
          <Card>
            <View style={styles.row}>
              <View style={styles.linkIcon}>
                <Ionicons name="link" size={16} color={colors.primary} />
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={{ fontSize: 14, fontWeight: '500', color: colors.text }} numberOfLines={1}>
                  {l.label}
                </Text>
                {l.desc && <Text style={{ fontSize: 12, color: colors.textMuted }}>{l.desc}</Text>}
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
            </View>
          </Card>
        </TouchableOpacity>
      ))}

      {/* Notes */}
      <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Notes</Text>
      {notes.map((n, i) => (
        <Card key={i} style={{ backgroundColor: '#fef3c7', borderLeftWidth: 3, borderLeftColor: '#c9a96e' }}>
          <View style={styles.row}>
            <Ionicons name="document-text" size={16} color="#92400e" style={{ marginRight: 8 }} />
            <Text style={{ fontSize: 13, color: '#92400e', flex: 1 }}>{n}</Text>
          </View>
        </Card>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg, padding: 16 },
  title: { fontSize: 22, fontWeight: '700', color: colors.text, marginBottom: 2 },
  subtitle: { fontSize: 13, color: colors.textMuted, marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 10 },
  row: { flexDirection: 'row', alignItems: 'center' },
  progressCircle: {
    width: 56, height: 56, borderRadius: 28,
    borderWidth: 4, borderColor: '#059669',
    justifyContent: 'center', alignItems: 'center',
  },
  progressText: { fontSize: 14, fontWeight: '700', color: colors.text },
  progressBar: {
    flexDirection: 'row', height: 6, borderRadius: 3,
    backgroundColor: '#e5e7eb', marginTop: 12, overflow: 'hidden',
  },
  progressFill: { height: 6 },
  taskText: { fontSize: 13, color: colors.text, flex: 1 },
  linkIcon: {
    width: 32, height: 32, borderRadius: 8, backgroundColor: '#fef2f2',
    justifyContent: 'center', alignItems: 'center',
  },
});
