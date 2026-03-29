import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme';
import Card from '../components/Card';
import Badge from '../components/Badge';
import { travelers } from '../data/tripData';

const COLORS = [
  '#b91c1c', '#ea580c', '#ca8a04', '#059669', '#0d9488',
  '#0891b2', '#2563eb', '#7c3aed', '#9333ea', '#db2777',
];

function getInitials(name) {
  return name.split(/[\s/]+/).map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

export default function GroupScreen() {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ paddingBottom: 100 }}>
      <Text style={styles.title}>Travel Group</Text>
      <Text style={styles.subtitle}>{travelers.length} travelers heading to Japan</Text>

      <View style={[styles.row, { gap: 8, marginBottom: 16 }]}>
        <Badge
          label={`${travelers.filter(t => t.rsvp === 'yes').length} confirmed`}
          color="teal"
          size="xs"
          icon={<Ionicons name="checkmark-circle" size={12} color="#059669" />}
        />
        <Badge
          label={`${travelers.filter(t => t.allergies).length} with allergies`}
          color="red"
          size="xs"
          icon={<Ionicons name="alert-circle" size={12} color="#b91c1c" />}
        />
      </View>

      {travelers.map((t, i) => (
        <Card key={i}>
          <View style={styles.row}>
            <View style={[styles.avatar, { backgroundColor: COLORS[i % COLORS.length] }]}>
              <Text style={styles.avatarText}>{getInitials(t.name)}</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text style={styles.name}>{t.name}</Text>
              <View style={[styles.row, { marginTop: 4 }]}>
                <Ionicons name="mail-outline" size={13} color={colors.textMuted} />
                <Text style={styles.email} numberOfLines={1}> {t.email}</Text>
              </View>
              <View style={[styles.row, { marginTop: 8, gap: 6, flexWrap: 'wrap' }]}>
                <Badge
                  label="Confirmed"
                  color="teal"
                  size="xs"
                  icon={<Ionicons name="checkmark" size={10} color="#059669" />}
                />
              </View>
              {t.allergies ? (
                <View style={{ marginTop: 10, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border, paddingTop: 8 }}>
                  <Badge
                    label={t.allergies}
                    color="red"
                    size="xs"
                    icon={<Ionicons name="alert-circle" size={10} color="#b91c1c" />}
                  />
                </View>
              ) : null}
            </View>
          </View>
        </Card>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg, padding: 16 },
  title: { fontSize: 22, fontWeight: '700', color: colors.text, marginBottom: 2 },
  subtitle: { fontSize: 13, color: colors.textMuted, marginBottom: 8 },
  row: { flexDirection: 'row', alignItems: 'center' },
  avatar: {
    width: 52, height: 52, borderRadius: 26,
    justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { fontSize: 18, fontWeight: '700', color: '#fff' },
  name: { fontSize: 15, fontWeight: '700', color: colors.text },
  email: { fontSize: 12, color: colors.textMuted, flex: 1 },
});
