export const NON_JAPANESE = [
  'italian', 'french', 'indian', 'chinese', 'sichuan', 'korean',
  'thai', 'vietnamese', 'spanish', 'american', 'peruvian',
  'nepalese', 'sri lankan', 'pizza', 'pasta',
];

const JAPANESE_NOODLE_TAGS = ['ramen', 'tsukemen', 'tantan-men'];
const CHINESE_NOODLE_NOISE_TAGS = ['chinese', 'sichuan'];
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

function dedupeCuisineTags(tags) {
  const unique = new Map();
  tags.forEach(tag => {
    const key = tag.toLowerCase();
    if (!unique.has(key)) unique.set(key, tag);
  });
  return [...unique.values()];
}

function toJapaneseOnlyCuisineTag(tag) {
  for (const rule of JAPANESE_ONLY_TAG_RULES) {
    if (rule.match.test(tag)) return rule.label;
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
  // Keep this rule when future restaurant sweeps are added so Japanese noodle spots stay Japanese.
  if (hasJapaneseNoodleTag) {
    cleaned = tags.filter(tag => !CHINESE_NOODLE_NOISE_TAGS.some(noise => tag.toLowerCase().includes(noise)));
  }

  if (!japaneseOnly) return dedupeCuisineTags(cleaned);

  // Japanese-only tags are intentionally curated so Osaka does not expose every raw
  // Tabelog fragment as a filter chip. Keep this compact when future sweeps are added.
  return dedupeCuisineTags(
    cleaned
      .map(tag => toJapaneseOnlyCuisineTag(tag))
      .filter(Boolean),
  );
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
    normalizeCuisineTags(r.cuisine, { japaneseOnly }).forEach(tag => {
      const key = tag.toLowerCase();
      if (japaneseOnly && !matchesJapaneseOnly(tag)) return;
      if (!cats.has(key)) cats.set(key, tag);
    });
  });
  return [...cats.entries()].sort((a, b) => a[1].localeCompare(b[1]));
}

export function matchesCuisineFilter(cuisine, filters, japaneseOnly = false) {
  const cats = cuisineHaystack(cuisine, { japaneseOnly });
  return filters.some(filter => cats.includes(filter));
}
