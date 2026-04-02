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

function splitCuisine(cuisine) {
  return (cuisine || '').split(/[,/]/).map(c => c.trim()).filter(c => c.length > 1);
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
    'Chicken', 'Chicken dishes', 'Pork', 'Pork dishes', 'Tonkatsu', 'Teppanyaki',
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
  // Keep this rule when future restaurant sweeps are added so Japanese noodle spots stay Japanese.
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

export function extractCuisineTags(list, japaneseOnly) {
  const cats = new Map();
  list.forEach(r => {
    if (japaneseOnly && !matchesJapaneseOnly(r.cuisine)) return;
    normalizeCuisineTags(r.cuisine, { japaneseOnly }).forEach(tag => addCuisineTag(cats, tag));
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

export function matchesCuisineFilter(cuisine, filters, japaneseOnly = false) {
  const cats = cuisineHaystack(cuisine, { japaneseOnly });
  return filters.some(filter => cats.includes(filter));
}
