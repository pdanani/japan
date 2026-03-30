// Combined Tabelog Tokyo restaurants — Lunch + Dinner lists, deduplicated
// ~2000+ unique restaurants with real coordinates

import { pages1to10 } from './tabelogPages1to10.js';
import { pages11to35 } from './tabelogPages11to35.js';
import { pages36to60 } from './tabelogPages36to60.js';
import { dinnerPages1to20 } from './tabelogDinnerPages1to20.js';
import { dinnerPages21to40 } from './tabelogDinnerPages21to40.js';
import { dinnerPages41to60 } from './tabelogDinnerPages41to60.js';

// Merge lunch + dinner, deduplicate by name (keep higher-rated entry)
const all = [...pages1to10, ...pages11to35, ...pages36to60, ...dinnerPages1to20, ...dinnerPages21to40, ...dinnerPages41to60];
const seen = new Map();
all.forEach(r => {
  const key = r.name.toLowerCase().trim();
  if (!seen.has(key) || r.rating > seen.get(key).rating) {
    seen.set(key, r);
  }
});

export const tabelogAll = [...seen.values()].sort((a, b) => b.rating - a.rating);
