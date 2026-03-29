import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { badgeColor, colors } from '../theme';
import { useTheme } from '../ThemeContext';

export default function FilterChip({ label, color = 'gray', selected, onPress }) {
  const { colors: tc } = useTheme();
  const c = badgeColor(color);
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.chip,
        selected
          ? { backgroundColor: c.text, borderColor: c.text }
          : { backgroundColor: 'transparent', borderColor: tc.border },
      ]}
      activeOpacity={0.7}
    >
      <Text style={[
        styles.text,
        { color: selected ? '#fff' : c.text },
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 6,
    marginBottom: 6,
  },
  text: {
    fontSize: 12,
    fontWeight: '500',
  },
});
