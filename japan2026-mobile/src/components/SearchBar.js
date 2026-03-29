import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme';
import { useTheme } from '../ThemeContext';

export default function SearchBar({ value, onChangeText, placeholder }) {
  const { colors: tc } = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: tc.border }]}>
      <Ionicons name="search" size={16} color={tc.textMuted} style={{ marginRight: 8 }} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={tc.textMuted}
        style={[styles.input, { color: tc.text }]}
        autoCorrect={false}
        clearButtonMode="while-editing"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  input: {
    flex: 1,
    fontSize: 14,
  },
});
