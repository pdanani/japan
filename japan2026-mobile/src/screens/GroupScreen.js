import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme';
import Card from '../components/Card';
import Badge from '../components/Badge';
import { travelers } from '../data/tripData';

const ALLERGY_COLORS = ['#b91c1c', '#ea580c', '#9333ea', '#db2777'];

function getInitials(name) {
  return name.split(/[\s/]+/).map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

export default function GroupScreen() {
  const withAllergies = travelers.filter(t => t.allergies);
  const withoutAllergies = travelers.filter(t => !t.allergies);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ paddingBottom: 100 }}>
      <Text style={styles.title}>Allergies</Text>
      <Text style={styles.subtitle}>
        {withAllergies.length} of {travelers.length} travelers have allergies — keep these in mind when choosing restaurants!
      </Text>

      {withAllergies.map((t, i) => (
        <Card key={i}>
          <View style={[styles.cardInner, { borderLeftWidth: 4, borderLeftColor: '#b91c1c' }]}>
            <View style={styles.row}>
              <View style={[styles.avatar, { backgroundColor: ALLERGY_COLORS[i % ALLERGY_COLORS.length] }]}>
                <Text style={styles.avatarText}>{getInitials(t.name)}</Text>
              </View>
              <View style={{ flex: 1, marginLeft: 14 }}>
                <Text style={styles.name}>{t.name}</Text>
                <View style={{ marginTop: 8 }}>
                  <Badge
                    label={t.allergies}
                    color="red"
                    size="sm"
                    icon={<Ionicons name="alert-circle" size={14} color="#b91c1c" />}
                  />
                </View>
              </View>
            </View>
          </View>
        </Card>
      ))}

      <View style={styles.divider} />
      <Text style={styles.noAllergies}>
        No allergies: {withoutAllergies.map(t => t.name).join(', ')}
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg, padding: 16 },
  title: { fontSize: 22, fontWeight: '700', color: colors.text, marginBottom: 2 },
  subtitle: { fontSize: 13, color: colors.textMuted, marginBottom: 16, lineHeight: 18 },
  row: { flexDirection: 'row', alignItems: 'center' },
  cardInner: { paddingLeft: 4 },
  avatar: {
    width: 44, height: 44, borderRadius: 22,
    justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  name: { fontSize: 15, fontWeight: '700', color: colors.text },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginTop: 8,
    marginBottom: 12,
  },
  noAllergies: { fontSize: 12, color: colors.textMuted },
});
