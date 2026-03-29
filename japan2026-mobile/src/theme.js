export const colors = {
  primary: '#b91c1c',
  primaryLight: '#fecaca',
  bg: '#fafaf9',
  card: '#ffffff',
  text: '#1f2937',
  textSecondary: '#6b7280',
  textMuted: '#9ca3af',
  border: '#e5e7eb',
  accent: {
    red: '#b91c1c',
    orange: '#ea580c',
    yellow: '#ca8a04',
    green: '#059669',
    teal: '#0d9488',
    blue: '#2563eb',
    violet: '#7c3aed',
    grape: '#9333ea',
    pink: '#db2777',
    gray: '#6b7280',
    indigo: '#4f46e5',
    cyan: '#0891b2',
  },
};

export const badgeColor = (color) => {
  const map = {
    red: { bg: '#fef2f2', text: '#b91c1c' },
    orange: { bg: '#fff7ed', text: '#c2410c' },
    yellow: { bg: '#fefce8', text: '#a16207' },
    green: { bg: '#f0fdf4', text: '#15803d' },
    teal: { bg: '#f0fdfa', text: '#0f766e' },
    blue: { bg: '#eff6ff', text: '#1d4ed8' },
    violet: { bg: '#f5f3ff', text: '#6d28d9' },
    grape: { bg: '#faf5ff', text: '#7e22ce' },
    pink: { bg: '#fdf2f8', text: '#be185d' },
    gray: { bg: '#f3f4f6', text: '#4b5563' },
    indigo: { bg: '#eef2ff', text: '#4338ca' },
    cyan: { bg: '#ecfeff', text: '#0e7490' },
  };
  return map[color] || map.gray;
};
