import React, { createContext, useContext, useState } from 'react';
import { colors as lightColors } from './theme';

const darkColors = {
  ...lightColors,
  bg: '#111',
  card: '#1c1c1e',
  text: '#f5f5f5',
  textSecondary: '#a1a1aa',
  textMuted: '#71717a',
  border: '#2c2c2e',
};

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(true);

  const toggleDark = () => setIsDark(prev => !prev);
  const colors = isDark ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ colors, isDark, toggleDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
  return ctx;
}
