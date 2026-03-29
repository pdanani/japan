// Shared utilities for the Japan 2026 trip planner

export const NON_JAPANESE = [
  'italian', 'french', 'indian', 'chinese', 'sichuan', 'korean',
  'thai', 'vietnamese', 'spanish', 'american', 'peruvian',
  'nepalese', 'sri lankan', 'bistro', 'pizza', 'pasta', 'steak',
];

export const TYPE_CONFIG = {
  transport: { color: 'violet', hex: '#7c3aed', label: 'Transport' },
  food:      { color: 'orange', hex: '#ea580c', label: 'Food' },
  group:     { color: 'blue',   hex: '#2563eb', label: 'Group' },
  shopping:  { color: 'pink',   hex: '#ec4899', label: 'Shopping' },
  site:      { color: 'green',  hex: '#16a34a', label: 'Site' },
  rest:      { color: 'gray',   hex: '#6b7280', label: 'Rest' },
  activity:  { color: 'yellow', hex: '#ca8a04', label: 'Activity' },
};

const CAT_COLORS = {
  ramen: 'red', tsukemen: 'red', soba: 'orange', udon: 'orange', noodle: 'orange',
  sushi: 'blue', seafood: 'blue', unagi: 'blue', eel: 'blue',
  coffee: 'brown', cafe: 'brown', kissa: 'brown',
  bbq: 'red', yakiniku: 'red', wagyu: 'red', steak: 'red', beef: 'red',
  katsu: 'yellow', tonkatsu: 'yellow', tempura: 'yellow',
  bar: 'grape', wine: 'grape', cocktail: 'grape', jazz: 'grape',
  izakaya: 'teal', sake: 'teal',
  pancake: 'pink', dessert: 'pink', cake: 'pink', sweets: 'pink',
  gelato: 'cyan', ice: 'cyan', chocolate: 'cyan',
  curry: 'lime', indian: 'lime',
  bread: 'yellow', bakery: 'yellow',
  italian: 'indigo', french: 'indigo', pizza: 'indigo',
  chinese: 'orange', sichuan: 'orange', dim: 'orange',
  hamburger: 'red', burger: 'red',
  fruit: 'green', taiyaki: 'orange',
  shopping: 'pink', site: 'green', activity: 'yellow', overnight: 'violet',
  cameras: 'blue', music: 'grape', drinks: 'teal', clothes: 'indigo',
};

export function getCatColor(cat) {
  if (!cat) return 'gray';
  const lower = cat.toLowerCase();
  for (const [key, color] of Object.entries(CAT_COLORS)) {
    if (lower.includes(key)) return color;
  }
  return 'gray';
}

export function parsePrice(p) {
  if (!p) return 0;
  const m = p.match(/[\d,]+/);
  return m ? parseInt(m[0].replace(/,/g, ''), 10) : 0;
}

export function splitNames(name) {
  if (!name) return [];
  return name.split(/\s*[/,]\s*/).map(n => n.trim()).filter(Boolean);
}

export function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function formatDist(km) {
  if (km == null || km > 9000) return null;
  const mi = km * 0.621371;
  if (mi < 0.1) return `${Math.round(mi * 5280)} ft`;
  return `${mi.toFixed(1)} mi`;
}

export function extractCuisineTags(tabelogList, japaneseOnly) {
  const cats = new Map();
  tabelogList.forEach(r => {
    (r.cuisine || '').split(/[,/]/).forEach(c => {
      const t = c.trim();
      if (t && t.length > 1) {
        const key = t.toLowerCase();
        if (japaneseOnly && NON_JAPANESE.some(nj => key.includes(nj))) return;
        if (!cats.has(key)) cats.set(key, t);
      }
    });
  });
  return [...cats.entries()].sort((a, b) => a[1].localeCompare(b[1]));
}

export function filterTabelogList(items, { maxPrice, minRating, cuisineFilter, japaneseOnly }) {
  let filtered = items;
  if (maxPrice < 15000) {
    filtered = filtered.filter(r => parsePrice(r.price) <= maxPrice);
  }
  if (minRating !== 'all') {
    const min = parseFloat(minRating);
    filtered = filtered.filter(r => r.rating >= min);
  }
  if (cuisineFilter.length > 0) {
    filtered = filtered.filter(r => {
      const cats = (r.cuisine || '').toLowerCase();
      return cuisineFilter.some(c => cats.includes(c));
    });
  }
  if (japaneseOnly) {
    filtered = filtered.filter(r => {
      const cats = (r.cuisine || '').toLowerCase();
      return !NON_JAPANESE.some(nj => cats.includes(nj));
    });
  }
  return filtered;
}

export function getDayLabel(day) {
  if (day === 0) return 'Travel';
  if (day === 15) return 'End';
  return `Day ${day}`;
}

export function formatDayDate(dateStr) {
  return dateStr.replace('July ', '7/');
}
