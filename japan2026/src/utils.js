// Shared utilities for the Japan 2026 trip planner

export const NON_JAPANESE = [
  'italian', 'french', 'indian', 'chinese', 'sichuan', 'korean',
  'thai', 'vietnamese', 'spanish', 'american', 'peruvian',
  'nepalese', 'sri lankan', 'pizza', 'pasta',
];

const JAPANESE_NOODLE_TAGS = ['ramen', 'tsukemen', 'tantan-men'];
const CHINESE_NOODLE_NOISE_TAGS = ['chinese', 'sichuan'];
const CUISINE_ALIASES = [
  { match: /^abura-soba$/i, label: 'Abura-soba' },
  { match: /^maze-soba$/i, label: 'Maze-soba' },
  { match: /^tsukemen(?:\s*\(.*\))?$/i, label: 'Tsukemen' },
  { match: /^tantan-men(?:\s*\(.*\))?$/i, label: 'Tantan-men' },
  { match: /^soba(?:\s*\(.*\))?$/i, label: 'Soba' },
  { match: /^udon(?:\s*\(.*\))?$/i, label: 'Udon' },
  { match: /^unagi(?:\s*\(.*\))?$/i, label: 'Unagi' },
  { match: /^yakitori(?:\s*\(.*\))?$/i, label: 'Yakitori' },
  { match: /^yakiniku(?:\s*\(.*\))?$/i, label: 'Yakiniku' },
  { match: /^tonkatsu(?:\s*\(.*\))?$/i, label: 'Tonkatsu' },
  { match: /^okonomiyaki(?:\s*\(.*\))?$/i, label: 'Okonomiyaki' },
  { match: /^izakaya(?:\s*\(.*\))?$/i, label: 'Izakaya' },
  { match: /^kissa(?:\s*\(.*\))?$/i, label: 'Kissa' },
  { match: /^kakigori(?:\s*\(.*\))?$/i, label: 'Kakigori' },
  { match: /^senbei(?:\s*\(.*\))?$/i, label: 'Senbei' },
  { match: /^taiyaki$/i, label: 'Taiyaki' },
  { match: /^takoyaki(?:\s*\(.*\))?$/i, label: 'Takoyaki' },
  { match: /^onigiri(?:\s*\(.*\))?$/i, label: 'Onigiri' },
  { match: /^anago(?:\s*\(.*\))?$/i, label: 'Anago' },
  { match: /^fugu(?:\s*\(.*\))?$/i, label: 'Fugu' },
  { match: /^suppon(?:\s*\(.*\))?$/i, label: 'Suppon' },
  { match: /^kamameshi$/i, label: 'Kamameshi' },
  { match: /^mizutaki$/i, label: 'Mizutaki' },
  { match: /^kais?en-don(?:\s*\(.*\))?$/i, label: 'Kaisen-don' },
  { match: /^katsu-don(?:\s*\(.*\))?$/i, label: 'Katsu-don' },
  { match: /^oyako-don(?:\s*\(.*\))?$/i, label: 'Oyako-don' },
  { match: /^ten-don(?:\s*\(.*\))?$/i, label: 'Ten-don' },
  { match: /^omurice(?:\s*\(.*\))?$/i, label: 'Omurice' },
  { match: /^yoshoku(?:\s*\(.*\))?$/i, label: 'Yoshoku' },
  { match: /^japanese cuisine$/i, label: 'Japanese' },
  { match: /^japanese sweets$/i, label: 'Japanese sweets' },
  { match: /^japanese sweets cafe$/i, label: 'Japanese sweets cafe' },
  { match: /^japanese traditional sweets$/i, label: 'Japanese traditional sweets' },
  { match: /^japanese pudding$/i, label: 'Japanese pudding' },
  { match: /^japanese coffee shop$/i, label: 'Kissa' },
  { match: /^cafe japanese sweets$/i, label: 'Japanese sweets cafe' },
  { match: /^cafe featuring japanese sweets$/i, label: 'Japanese sweets cafe' },
  { match: /^indian curry$/i, labels: ['Indian', 'Curry'] },
  { match: /^western sweets$/i, label: 'Western sweets' },
  { match: /^sweets \(western(?: style)?\)$/i, label: 'Western sweets' },
  { match: /^baru(?:\s*\(.*\))?$/i, label: 'Baru' },
  { match: /^beer hall$/i, label: 'Beer hall' },
  { match: /^beer bar$/i, label: 'Beer bar' },
  { match: /^wine bar$/i, label: 'Wine bar' },
  { match: /^sake bar$/i, label: 'Sake bar' },
  { match: /^shochu bar$/i, label: 'Shochu bar' },
  { match: /^japanese sake bar$/i, label: 'Japanese sake bar' },
  { match: /^japanese shochu \(spirits\) bar$/i, label: 'Japanese shochu bar' },
  { match: /^dining bar$/i, label: 'Dining bar' },
  { match: /^stand-up bar$/i, label: 'Stand-up bar' },
  { match: /^oyster bar$/i, label: 'Oyster Bar' },
  { match: /^soft serve(?: ice cream)?$/i, label: 'Soft serve' },
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

export function getRestaurantKey(restaurant) {
  return restaurant?.url || [restaurant?.name || '', restaurant?.station || ''].join('__');
}

export function getMealDatasets(allItems, dinnerItems) {
  const dinnerKeys = new Set(dinnerItems.map(getRestaurantKey));
  return {
    all: allItems,
    dinner: dinnerItems,
    lunch: allItems.filter(item => !dinnerKeys.has(getRestaurantKey(item))),
  };
}

const CUISINE_SECTION_ORDER = [
  'Japanese',
  'Noodles',
  'Rice & Hot Pot',
  'Grill & Meat',
  'Seafood',
  'Sweets & Bakery',
  'Cafe & Drinks',
  'Bars',
  'International',
  'Other',
];

function getCuisineSection(label) {
  if ([
    'Japanese', 'Izakaya', 'Yoshoku', 'Okonomiyaki', 'Takoyaki', 'Onigiri', 'Kamameshi',
    'Anago', 'Fugu', 'Suppon', 'Mizutaki', 'Okinawa cuisine', 'Tofu dishes',
    'Japanese sweets', 'Japanese sweets cafe', 'Japanese traditional sweets', 'Japanese pudding',
  ].includes(label)) return 'Japanese';
  if ([
    'Ramen', 'Tsukemen', 'Tantan-men', 'Soba', 'Udon', 'Abura-soba', 'Maze-soba',
    'Champon noodle soup', 'Noodles',
  ].includes(label)) return 'Noodles';
  if ([
    'Donburi', 'Kaisen-don', 'Katsu-don', 'Oyako-don', 'Ten-don',
    'Nabe', 'Shabu shabu', 'Sukiyaki', 'Motsu-nabe', 'Hot Pot',
  ].includes(label)) return 'Rice & Hot Pot';
  if ([
    'Yakiniku', 'Yakitori', 'Kushiyaki', 'Steak', 'Hamburger', 'Beef dishes',
    'Meat dishes', 'Horse meat dishes', 'Tripe', 'Grilled tripe', 'Gyutan',
    'Chicken', 'Chicken dishes', 'Chicken', 'Pork', 'Pork dishes', 'Tonkatsu', 'Teppanyaki',
  ].includes(label)) return 'Grill & Meat';
  if ([
    'Sushi', 'Seafood', 'Unagi', 'Crab',
  ].includes(label)) return 'Seafood';
  if ([
    'Cake', 'Gelato', 'Ice cream', 'Chocolate', 'Donut', 'Macaroon', 'Western sweets',
    'Taiyaki', 'Kakigori', 'Senbei', 'Sweets', 'Desserts', 'Pancake',
    'Bakery', 'Bread', 'Bagel', 'Sandwich', 'Crepe', 'Galette',
  ].includes(label)) return 'Sweets & Bakery';
  if ([
    'Cafe', 'Kissa', 'Coffee shop', 'Tea', 'Fruit parlour', 'Juice', 'Cafeteria',
  ].includes(label)) return 'Cafe & Drinks';
  if ([
    'Bar', 'Wine bar', 'Beer bar', 'Beer hall', 'Sake bar', 'Shochu bar',
    'Japanese sake bar', 'Japanese shochu bar', 'Dining bar', 'Stand-up bar', 'Baru', 'Oyster Bar',
  ].includes(label)) return 'Bars';
  if ([
    'Italian', 'French', 'Chinese', 'Korean', 'Thai', 'Indian', 'Mexican', 'Vietnamese',
    'Indonesian', 'Singaporean', 'Taiwanese', 'Sri Lankan', 'Nepalese', 'Spanish',
    'Portuguese', 'American', 'German', 'Asian', 'Ethnic', 'European', 'Bistro',
    'Dim sum', 'Dim Sum', 'Dim sum & Yum cha',
  ].includes(label)) return 'International';
  return 'Other';
}

function splitCuisine(cuisine) {
  return (cuisine || '').split(/[,/]/).map(c => c.trim()).filter(c => c.length > 1);
}

function dedupeCuisineTags(tags) {
  const unique = new Map();
  tags.forEach(tag => {
    const key = tag.toLowerCase();
    if (!unique.has(key)) unique.set(key, tag);
  });
  return [...unique.values()];
}

function matchCuisineAlias(tag) {
  for (const alias of CUISINE_ALIASES) {
    if (alias.match.test(tag)) return alias.labels || [alias.label];
  }
  const trimmed = tag.trim();
  if (!trimmed) return [];
  if (/^restaurants$/i.test(trimmed)) return [];
  return [trimmed];
}

function shouldKeepJapaneseOnlyTag(tag) {
  const key = tag.toLowerCase();
  if (NON_JAPANESE.some(nj => key.includes(nj))) return false;
  return !/^restaurants$/i.test(tag);
}

function collectNormalizedTags(tags) {
  return dedupeCuisineTags(tags.flatMap(matchCuisineAlias));
}

function sortCuisineEntries(cats) {
  return [...cats.entries()].sort((a, b) => {
    if (b[1].count !== a[1].count) return b[1].count - a[1].count;
    return a[1].label.localeCompare(b[1].label);
  }).map(([key, value]) => [key, value.label]);
}

function addCuisineTag(cats, tag) {
  const key = tag.toLowerCase();
  if (!cats.has(key)) {
    cats.set(key, { label: tag, count: 0 });
  }
  cats.get(key).count += 1;
}

export function normalizeCuisineTags(cuisine, options = {}) {
  const { japaneseOnly = false } = options;
  const tags = splitCuisine(cuisine);
  const lowered = tags.map(tag => tag.toLowerCase());
  const hasJapaneseNoodleTag = JAPANESE_NOODLE_TAGS.some(tag => lowered.some(value => value.includes(tag)));
  let cleaned = tags;

  // Tabelog sometimes adds "Chinese" or "Sichuan" to ramen/tsukemen/tantan-men shops.
  // When future sweeps bring in more of these, keep the noodle tag and drop the noisy
  // Chinese label so Japanese-only does not exclude clearly Japanese noodle spots.
  if (hasJapaneseNoodleTag) {
    cleaned = tags.filter(tag => !CHINESE_NOODLE_NOISE_TAGS.some(noise => tag.toLowerCase().includes(noise)));
  }

  const normalized = collectNormalizedTags(cleaned);
  if (!japaneseOnly) return normalized;
  return normalized.filter(shouldKeepJapaneseOnlyTag);
}

function cuisineHaystack(cuisine, options = {}) {
  return normalizeCuisineTags(cuisine, options).join(' ').toLowerCase();
}

export function matchesJapaneseOnly(cuisine) {
  const cats = cuisineHaystack(cuisine);
  return !NON_JAPANESE.some(nj => cats.includes(nj));
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
    if (japaneseOnly && !matchesJapaneseOnly(r.cuisine)) return;
    normalizeCuisineTags(r.cuisine, { japaneseOnly }).forEach(t => addCuisineTag(cats, t));
  });
  return sortCuisineEntries(cats);
}

export function groupCuisineTags(tagEntries) {
  const grouped = new Map(CUISINE_SECTION_ORDER.map(section => [section, []]));
  tagEntries.forEach(([key, label]) => {
    const section = getCuisineSection(label);
    grouped.get(section).push([key, label]);
  });
  return CUISINE_SECTION_ORDER
    .map(section => ({ title: section, items: grouped.get(section) || [] }))
    .filter(section => section.items.length > 0);
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
      const cats = cuisineHaystack(r.cuisine, { japaneseOnly });
      return cuisineFilter.some(c => cats.includes(c));
    });
  }
  if (japaneseOnly) {
    filtered = filtered.filter(r => matchesJapaneseOnly(r.cuisine));
  }
  return filtered;
}

// Auto-detect schedule item type from activity text
export function detectActivityType(text) {
  const t = text.toLowerCase();
  if (/flight|train|monorail|shinkansen|yamanote|ginza line|bus|taxi|station|→|->/.test(t)) return 'transport';
  if (/group|everyone|all\b/.test(t)) return 'group';
  if (/nap|rest|hotel|omo3|check.?in|check.?out|pack|sleep/.test(t)) return 'rest';
  if (/coffee|ramen|sushi|tempura|bakery|lunch|dinner|breakfast|eat|food|restaurant|cafe|taiyaki|kaisendon|tonkatsu|katsu|eel|unana|udon|soba|gyoza|takoyaki|pancake|ice.?cream|sweet|dessert|snack/.test(t)) return 'food';
  if (/shop|store|camera|don.?quij|loft|beams|tower.?records|dulton|bic.?camera|sugar|kamawanu|knives|kama.?asa|honke|souvenir|mall/.test(t)) return 'shopping';
  if (/shrine|temple|park|garden|castle|museum|palace|gate|river|stroll|walk|sky.?view|godzilla|tower|bridge/.test(t)) return 'site';
  if (/jazz|concert|bar|karaoke|round1|spocha|arcade|glass.?cut|workshop|dye|class|sumo|kimono|kiriko/.test(t)) return 'activity';
  if (/market|tsukiji|nishiki/.test(t)) return 'food';
  return 'activity';
}

// Generate a Google Maps search URL from an activity name
export function activityMapUrl(activity, location) {
  const query = encodeURIComponent(`${activity} ${location || ''} Japan`.trim());
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
}

// Parse the PB Draft Timeline CSV grid into our timeline array format
// The sheet is a grid: days as columns, times as rows
// Row 0: day headers (Day 0, Day 1, ...)
// Row 1: dates
// Row 2: locations
// Row 3: notes
// Row 4+: time slots with activities
export function parseTimelineCSV(rows) {
  if (!rows || rows.length < 5) return null;

  // Find day columns — look for "Day X" or "End" in row 0
  const headerRow = rows[0];
  const dateRow = rows[1];
  const locationRow = rows[2];
  const notesRow = rows[3];

  const dayColumns = [];
  for (let col = 1; col < headerRow.length; col++) {
    const h = (headerRow[col] || '').trim();
    const dayMatch = h.match(/Day\s+(\d+)/i);
    if (dayMatch) {
      dayColumns.push({ col, day: parseInt(dayMatch[1], 10) });
    } else if (/end/i.test(h)) {
      dayColumns.push({ col, day: 15 });
    }
  }

  if (dayColumns.length === 0) return null;

  const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const timeline = dayColumns.map(({ col, day }) => {
    const rawDate = (dateRow[col] || '').trim();
    // Extract day of week from date string like "Saturday, July 11"
    let dayOfWeek = '';
    const dowMatch = rawDate.match(/(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)/i);
    if (dowMatch) dayOfWeek = dowMatch[1];
    // Clean date — remove day of week prefix
    const date = rawDate.replace(/^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday),?\s*/i, '').trim() || rawDate;

    const location = (locationRow[col] || '').trim();
    const notes = (notesRow[col] || '').trim();

    // Parse schedule from time rows (row 4+)
    const schedule = [];
    for (let r = 4; r < rows.length; r++) {
      const timeRaw = (rows[r][0] || '').trim();
      const activity = (rows[r][col] || '').trim();
      if (!activity || activity === ' ') continue;

      // Convert time like "5:00" to "5:00 AM"
      let time = timeRaw;
      if (/^\d{1,2}:\d{2}$/.test(time)) {
        const hour = parseInt(time.split(':')[0], 10);
        const suffix = hour >= 12 && hour < 24 ? 'PM' : 'AM';
        const h12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
        time = `${h12}:${time.split(':')[1]} ${suffix}`;
      }

      const type = detectActivityType(activity);
      const item = { time, activity, type, source: 'sheet' };

      // Add map URL for non-generic activities
      if (!/nap|rest|flex|dinner$|lunch$|breakfast$/i.test(activity)) {
        item.mapUrl = activityMapUrl(activity, location);
      }

      schedule.push(item);
    }

    return { day, date, dayOfWeek, location, notes, schedule };
  });

  return timeline;
}

export function getDayLabel(day) {
  if (day === 0) return 'Travel';
  if (day === 15) return 'End';
  return `Day ${day}`;
}

export function formatDayDate(dateStr) {
  return dateStr.replace('July ', '7/');
}
