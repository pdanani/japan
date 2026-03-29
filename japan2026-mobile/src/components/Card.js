import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '../theme';
import { useTheme } from '../ThemeContext';

export default function Card({ children, style, borderLeftColor }) {
  const { colors: tc } = useTheme();
  return (
    <View style={[
      styles.card,
      { backgroundColor: tc.card, borderColor: tc.border },
      borderLeftColor && { borderLeftWidth: 3, borderLeftColor },
      style,
    ]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
});
