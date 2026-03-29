import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { badgeColor } from '../theme';

export default function Badge({ label, color = 'gray', size = 'sm', icon, style }) {
  const c = badgeColor(color);
  const isXs = size === 'xs';
  return (
    <View style={[styles.badge, { backgroundColor: c.bg }, isXs && styles.xs, style]}>
      {icon && <View style={{ marginRight: 4 }}>{icon}</View>}
      <Text style={[styles.text, { color: c.text }, isXs && styles.xsText]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  xs: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
  xsText: {
    fontSize: 10,
  },
});
