// Shared utilities for the Japan 2026 trip planner

export const NON_JAPANESE = [
  'italian', 'french', 'indian', 'chinese', 'sichuan', 'korean',
  'thai', 'vietnamese', 'spanish', 'american', 'peruvian',
  'nepalese', 'sri lankan', 'pizza', 'pasta',
];

const JAPANESE_NOODLE_TAGS = ['ramen', 'tsukemen', 'tantan-men'];
const CHINESE_NOODLE_NOISE_TAGS = ['chinese', 'sichuan'];
const JAPANESE_ONLY_CURATION_NOTE = 'Japanese-only cuisine tags should stay curated and compact.';

const ALL_TAG_RULES = [
  { match: /abura-soba|maze-soba/i, labels: ['Mazesoba'] },
  { match: /ramen/i, labels: ['Ramen'] },
  { match: /tsukemen/i, labels: ['Tsukemen'] },
  { match: /tantan-men/i, labels: ['Tantan-men'] },
  { match: /curry udon|udon-suki|\budon\b/i, labels: ['Udon'] },
  { match: /soba/i, labels: ['Soba'] },
  { match: /champon noodle soup|noodles|stir-fried noodles/i, labels: ['Noodles'] },
  { match: /sushi/i, labels: ['Sushi'] },
  { match: /unagi/i, labels: ['Unagi'] },
  { match: /yakitori/i, labels: ['Yakitori'] },
  { match: /kushiyaki/i, labels: ['Kushiyaki'] },
  { match: /yakiniku|gyutan|grilled tripe|tripe/i, labels: ['Yakiniku'] },
  { match: /izakaya/i, labels: ['Izakaya'] },
  { match: /tempura/i, labels: ['Tempura'] },
  { match: /tonkatsu/i, labels: ['Tonkatsu'] },
  { match: /teppanyaki/i, labels: ['Teppanyaki'] },
  { match: /okonomiyaki/i, labels: ['Okonomiyaki'] },
  { match: /donburi|katsu-don|oyako-don/i, labels: ['Donburi'] },
  { match: /nabe|sukiyaki|pork shabu shabu/i, labels: ['Hot Pot'] },
  { match: /oden/i, labels: ['Oden'] },
  { match: /omurice|yoshoku|hamburger steak/i, labels: ['Yoshoku'] },
  { match: /cafe featuring japanese sweets|cafe japanese sweets/i, labels: ['Cafe', 'Sweets'] },
  { match: /indian curry/i, labels: ['Indian', 'Curry'] },
  { match: /curry|indian curry|soup curry/i, labels: ['Curry'] },
  { match: /japanese sweets|japanese traditional sweets|japanese pudding|daifuku|dorayaki|obanyaki|taiyaki|senbei|kakigori|roasted sweet potato|baumkuchen/i, labels: ['Sweets'] },
  { match: /ice cream|soft serve|gelato|cake|chocolate|donut|macaroon|western sweets|pancake/i, labels: ['Desserts'] },
  { match: /bagel|bread|sandwich/i, labels: ['Bakery'] },
  { match: /cafe|kissa|coffee|fruit parlour|juice/i, labels: ['Cafe'] },
  { match: /baru|bar|beer hall|beer bar|wine bar|sake bar|shochu bar|oyster bar|dining bar|stand-up bar/i, labels: ['Bar'] },
  { match: /bento/i, labels: ['Bento'] },
  { match: /seafood/i, labels: ['Seafood'] },
  { match: /beef dishes|meat dishes|meat|steak|hamburger/i, labels: ['Meat'] },
  { match: /chicken dishes|kara-age/i, labels: ['Chicken'] },
  { match: /pork dishes/i, labels: ['Pork'] },
  { match: /deep-fried|croquette/i, labels: ['Fried'] },
  { match: /japanese cuisine|\bjapanese\b/i, labels: ['Japanese'] },
  { match: /chinese hot pot|\bchinese\b|sichuan|dumpling/i, labels: ['Chinese'] },
  { match: /korean/i, labels: ['Korean'] },
  { match: /italian|pasta|pizza/i, labels: ['Italian'] },
  { match: /\bfrench\b|bistro/i, labels: ['French'] },
  { match: /spanish|baru/i, labels: ['Spanish'] },
  { match: /thai/i, labels: ['Thai'] },
  { match: /vietnamese/i, labels: ['Vietnamese'] },
  { match: /\bindian\b/i, labels: ['Indian'] },
  { match: /nepalese/i, labels: ['Nepalese'] },
  { match: /sri lankan/i, labels: ['Sri Lankan'] },
  { match: /taiwanese/i, labels: ['Taiwanese'] },
  { match: /singaporean/i, labels: ['Singaporean'] },
  { match: /portuguese/i, labels: ['Portuguese'] },
  { match: /american/i, labels: ['American'] },
  { match: /german/i, labels: ['German'] },
  { match: /asian|ethnic|european/i, labels: ['Asian'] },
];

const JAPANESE_ONLY_TAG_RULES = [
  { match: /abura-soba|maze-soba/i, label: 'Mazesoba' },
  { match: /ramen/i, label: 'Ramen' },
  { match: /tsukemen/i, label: 'Tsukemen' },
  { match: /tantan-men/i, label: 'Tantan-men' },
  { match: /curry udon|udon-suki|\budon\b/i, label: 'Udon' },
  { match: /soba/i, label: 'Soba' },
  { match: /sushi/i, label: 'Sushi' },
  { match: /unagi/i, label: 'Unagi' },
  { match: /anago/i, label: 'Anago' },
  { match: /yakitori/i, label: 'Yakitori' },
  { match: /kushiyaki/i, label: 'Kushiyaki' },
  { match: /kushi-age/i, label: 'Kushiage' },
  { match: /yakiniku|gyutan|jingisukan/i, label: 'Yakiniku' },
  { match: /izakaya|japanese sake bar|japanese shochu/i, label: 'Izakaya' },
  { match: /tempura/i, label: 'Tempura' },
  { match: /tonkatsu/i, label: 'Tonkatsu' },
  { match: /donburi|kais?en-don|katsu-don|oyako-don|ten-don/i, label: 'Donburi' },
  { match: /teppanyaki/i, label: 'Teppanyaki' },
  { match: /okonomiyaki/i, label: 'Okonomiyaki' },
  { match: /takoyaki/i, label: 'Takoyaki' },
  { match: /motsu-nabe|mizutaki|chanko-nabe|shabu shabu|sukiyaki|\bnabe\b/i, label: 'Hot Pot' },
  { match: /oden/i, label: 'Oden' },
  { match: /onigiri/i, label: 'Onigiri' },
  { match: /kamameshi/i, label: 'Kamameshi' },
  { match: /omurice|yoshoku|hamburger steak/i, label: 'Yoshoku' },
  { match: /okinawa/i, label: 'Okinawa' },
  { match: /kara-age|croquette|deep-fried foods/i, label: 'Fried' },
  { match: /japanese traditional sweets|japanese pudding|daifuku|dorayaki|daigakuimo|taiyaki|obanyaki|kakigori|roasted sweet potato|baumkuchen|\bsweets\b/i, label: 'Sweets' },
  { match: /cafe featuring japanese sweets|coffee stand|kissa|fruit parlour|juice stand|\bcafe\b/i, label: 'Cafe' },
  { match: /bread|bagel|sandwich/i, label: 'Bakery' },
  { match: /gelato|ice cream|soft serve|cake|chocolate|macaroon|crepe|galette|pancake/i, label: 'Desserts' },
  { match: /bento/i, label: 'Bento' },
  { match: /fugu/i, label: 'Fugu' },
  { match: /suppon/i, label: 'Suppon' },
  { match: /tofu/i, label: 'Tofu' },
  { match: /seafood|crab|stand-up sushi/i, label: 'Seafood' },
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

function matchCuisineRule(tag, rules) {
  for (const rule of rules) {
    if (rule.match.test(tag)) return rule.labels || [rule.label];
  }
  return null;
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

  if (!japaneseOnly) {
    return dedupeCuisineTags(
      cleaned.flatMap(tag => matchCuisineRule(tag, ALL_TAG_RULES) || []),
    );
  }

  // Japanese-only tags are intentionally curated so Osaka does not expose every raw
  // Tabelog fragment as a filter chip. Keep this compact when future sweeps are added.
  void JAPANESE_ONLY_CURATION_NOTE;
  return dedupeCuisineTags(
    cleaned
      .flatMap(tag => matchCuisineRule(tag, JAPANESE_ONLY_TAG_RULES) || []),
  );
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
    normalizeCuisineTags(r.cuisine, { japaneseOnly }).forEach(t => {
      const key = t.toLowerCase();
      if (japaneseOnly && !matchesJapaneseOnly(t)) return;
      if (!cats.has(key)) cats.set(key, t);
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
