export const NON_JAPANESE = [
  'italian', 'french', 'indian', 'chinese', 'sichuan', 'korean',
  'thai', 'vietnamese', 'spanish', 'american', 'peruvian',
  'nepalese', 'sri lankan', 'pizza', 'pasta',
];

const JAPANESE_NOODLE_TAGS = ['ramen', 'tsukemen', 'tantan-men'];
const CHINESE_NOODLE_NOISE_TAGS = ['chinese', 'sichuan'];

function splitCuisine(cuisine) {
  return (cuisine || '').split(/[,/]/).map(c => c.trim()).filter(c => c.length > 1);
}

export function normalizeCuisineTags(cuisine) {
  const tags = splitCuisine(cuisine);
  const lowered = tags.map(tag => tag.toLowerCase());
  const hasJapaneseNoodleTag = JAPANESE_NOODLE_TAGS.some(tag => lowered.some(value => value.includes(tag)));

  // Tabelog sometimes adds "Chinese" or "Sichuan" to ramen/tsukemen/tantan-men shops.
  // Keep this rule when future restaurant sweeps are added so Japanese noodle spots stay Japanese.
  if (hasJapaneseNoodleTag) {
    return tags.filter(tag => !CHINESE_NOODLE_NOISE_TAGS.some(noise => tag.toLowerCase().includes(noise)));
  }

  return tags;
}

function cuisineHaystack(cuisine) {
  return normalizeCuisineTags(cuisine).join(' ').toLowerCase();
}

export function matchesJapaneseOnly(cuisine) {
  const cats = cuisineHaystack(cuisine);
  return !NON_JAPANESE.some(nj => cats.includes(nj));
}

export function extractCuisineTags(list, japaneseOnly) {
  const cats = new Map();
  list.forEach(r => {
    normalizeCuisineTags(r.cuisine).forEach(tag => {
      const key = tag.toLowerCase();
      if (japaneseOnly && !matchesJapaneseOnly(tag)) return;
      if (!cats.has(key)) cats.set(key, tag);
    });
  });
  return [...cats.entries()].sort((a, b) => a[1].localeCompare(b[1]));
}

export function matchesCuisineFilter(cuisine, filters) {
  const cats = cuisineHaystack(cuisine);
  return filters.some(filter => cats.includes(filter));
}
