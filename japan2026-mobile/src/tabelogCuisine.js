export const NON_JAPANESE = [
  'italian', 'french', 'indian', 'chinese', 'sichuan', 'korean',
  'thai', 'vietnamese', 'spanish', 'american', 'peruvian',
  'nepalese', 'sri lankan', 'pizza', 'pasta',
];

const JAPANESE_NOODLE_TAGS = ['ramen', 'tsukemen', 'tantan-men'];
const CHINESE_NOODLE_NOISE_TAGS = ['chinese', 'sichuan'];
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
  // Keep this rule when future restaurant sweeps are added so Japanese noodle spots stay Japanese.
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
