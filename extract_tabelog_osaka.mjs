import { mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TOTAL_PAGES = 60;
const LIST_CONCURRENCY = 4;
const DETAIL_CONCURRENCY = 6;
const CACHE_ROOT = '/tmp/tabelog-osaka-cache';
const OUT_DIR = path.join(__dirname, 'shared', 'data');
const LIST_URL =
  'https://tabelog.com/en/rstLst/?PG=1&from_search=&voluntary_search=1&from_search_form=1&lid=&SrtT=rt&pcd=27&LstPrf=&Cat=&RdoCosTp=2&LstCos=0&LstCosT=8&vac_net=0&search_date=April+2%2C+2026+%28Thu%29+&svd=20260402&svt=1900&svps=2&LstRev=0&LstSitu=0&LstSmoking=0';

const PAGE_GROUPS = [
  {
    constName: 'osakaDinnerPages1to20',
    fileName: 'tabelogOsakaDinnerPages1to20.js',
    startPage: 1,
    endPage: 20,
  },
  {
    constName: 'osakaDinnerPages21to40',
    fileName: 'tabelogOsakaDinnerPages21to40.js',
    startPage: 21,
    endPage: 40,
  },
  {
    constName: 'osakaDinnerPages41to60',
    fileName: 'tabelogOsakaDinnerPages41to60.js',
    startPage: 41,
    endPage: 60,
  },
];

const HTML_ENTITIES = new Map([
  ['&amp;', '&'],
  ['&quot;', '"'],
  ['&#39;', "'"],
  ['&#x27;', "'"],
  ['&#x2F;', '/'],
  ['&lt;', '<'],
  ['&gt;', '>'],
  ['&nbsp;', ' '],
  ['&#8211;', '-'],
  ['&#8212;', '-'],
]);

function decodeHtml(value) {
  let decoded = value;
  for (const [entity, replacement] of HTML_ENTITIES) {
    decoded = decoded.split(entity).join(replacement);
  }
  return decoded.replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)));
}

function cleanText(value) {
  return decodeHtml(value)
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function escapeJs(value) {
  return String(value).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

function formatNumber(value, digits = 2) {
  return Number(value.toFixed(digits)).toString();
}

function formatCoord(value) {
  return Number(value.toFixed(5)).toFixed(5);
}

function detailCacheKey(url) {
  const match = url.match(/\/(\d+)\/$/);
  return match ? match[1] : Buffer.from(url).toString('base64url');
}

function buildListPageUrl(page) {
  const url = new URL(LIST_URL);
  url.searchParams.set('PG', String(page));
  return url.toString();
}

async function exists(filepath) {
  try {
    await stat(filepath);
    return true;
  } catch {
    return false;
  }
}

async function fetchText(url) {
  const response = await fetch(url, {
    headers: {
      'accept-language': 'en-US,en;q=0.9',
      'user-agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36',
    },
  });

  if (!response.ok) {
    throw new Error(`Fetch failed for ${url}: ${response.status} ${response.statusText}`);
  }

  return response.text();
}

async function fetchCached(cacheDir, cacheKey, url) {
  const filepath = path.join(cacheDir, `${cacheKey}.html`);
  if (await exists(filepath)) {
    return readFile(filepath, 'utf8');
  }

  const html = await fetchText(url);
  await mkdir(cacheDir, { recursive: true });
  await writeFile(filepath, html, 'utf8');
  return html;
}

function parseAreaGenre(text) {
  const parts = text.split(/\s+\/\s+/).map((part) => part.trim()).filter(Boolean);
  const [station = '', ...cuisineParts] = parts;
  return {
    station: station.replace(/\s+Sta\.?$/i, '').trim(),
    cuisine: cuisineParts.join(', '),
  };
}

function parseListPage(html, page) {
  const segments = html
    .split('<div class="list-rst js-bookmark js-rst-cassette-wrap"')
    .slice(1)
    .map((segment) => `<div class="list-rst js-bookmark js-rst-cassette-wrap"${segment}`);

  const restaurants = [];

  for (const segment of segments) {
    const card = segment.split('<div class="list-rst__rst-photo')[0];
    const rankMatch = card.match(/list-rst__rank-badge-contents">(\d+)</);
    const urlMatch = card.match(/class="list-rst__rst-name-target[^"]*"[^>]+href="([^"]+)"/);
    const nameMatch = card.match(/class="list-rst__rst-name-target[^"]*"[^>]*>([^<]+)</);
    const areaGenreMatch = card.match(/class="list-rst__area-genre[^"]*">\s*([\s\S]*?)\s*<\/div>/);
    const ratingMatch = card.match(/class="c-rating__val[^"]*list-rst__rating-val">([\d.]+)</);
    const dinnerPriceMatch = card.match(
      /c-rating-v3__time--dinner"[^>]*><\/i><span class="c-rating-v3__val">([^<]+)</,
    );
    const lunchPriceMatch = card.match(
      /c-rating-v3__time--lunch"[^>]*><\/i><span class="c-rating-v3__val">([^<]+)</,
    );

    if (!rankMatch || !urlMatch || !nameMatch || !areaGenreMatch || !ratingMatch) {
      continue;
    }

    const { station, cuisine } = parseAreaGenre(cleanText(areaGenreMatch[1]));

    restaurants.push({
      city: 'Osaka',
      page,
      rank: Number(rankMatch[1]),
      name: cleanText(nameMatch[1]),
      rating: Number(ratingMatch[1]),
      cuisine,
      station,
      price: cleanText(dinnerPriceMatch?.[1] ?? lunchPriceMatch?.[1] ?? ''),
      url: urlMatch[1],
    });
  }

  return restaurants;
}

function parseDetailPage(html, url) {
  const geoMatch = html.match(
    /"geo":\{"@type":"GeoCoordinates","latitude":([0-9.]+),"longitude":([0-9.]+)\}/,
  );
  if (geoMatch) {
    return { lat: Number(geoMatch[1]), lng: Number(geoMatch[2]) };
  }

  const staticMapMatch = html.match(/center=([0-9.]+),([0-9.]+)/);
  if (staticMapMatch) {
    return { lat: Number(staticMapMatch[1]), lng: Number(staticMapMatch[2]) };
  }

  throw new Error(`Could not find geo coordinates in detail page: ${url}`);
}

async function mapLimit(items, limit, mapper) {
  const results = new Array(items.length);
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < items.length) {
      const currentIndex = nextIndex;
      nextIndex += 1;
      results[currentIndex] = await mapper(items[currentIndex], currentIndex);
    }
  }

  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, () => worker()));
  return results;
}

function renderPageFile(constName, items) {
  const lines = [`export const ${constName} = [`];

  let currentPage = 0;
  for (const item of items) {
    if (item.page !== currentPage) {
      currentPage = item.page;
      lines.push(`  // Page ${currentPage} (Ranks ${(currentPage - 1) * 20 + 1}-${currentPage * 20})`);
    }

    lines.push(
      `  {city:'Osaka',rank:${item.rank},name:'${escapeJs(item.name)}',rating:${formatNumber(item.rating)},cuisine:'${escapeJs(item.cuisine)}',station:'${escapeJs(item.station)}',price:'${escapeJs(item.price)}',lat:${formatCoord(item.lat)},lng:${formatCoord(item.lng)},url:'${escapeJs(item.url)}'},`,
    );
  }

  lines.push('];', '');
  return lines.join('\n');
}

function renderCombinedFile() {
  return `// Combined Tabelog Osaka dinner list (1200 restaurants)
import { osakaDinnerPages1to20 } from './tabelogOsakaDinnerPages1to20.js';
import { osakaDinnerPages21to40 } from './tabelogOsakaDinnerPages21to40.js';
import { osakaDinnerPages41to60 } from './tabelogOsakaDinnerPages41to60.js';

export const tabelogOsakaDinnerAll = [
  ...osakaDinnerPages1to20,
  ...osakaDinnerPages21to40,
  ...osakaDinnerPages41to60,
].sort((a, b) => a.rank - b.rank);
`;
}

async function main() {
  const listCacheDir = path.join(CACHE_ROOT, 'list');
  const detailCacheDir = path.join(CACHE_ROOT, 'detail');

  console.error(`Fetching ${TOTAL_PAGES} Osaka Tabelog list pages...`);
  const listPages = Array.from({ length: TOTAL_PAGES }, (_, index) => index + 1);

  const listResults = await mapLimit(listPages, LIST_CONCURRENCY, async (page) => {
    const html = await fetchCached(listCacheDir, `page-${page}`, buildListPageUrl(page));
    const restaurants = parseListPage(html, page);
    console.error(`  Page ${page}: ${restaurants.length} restaurants`);
    return restaurants;
  });

  const restaurants = listResults.flat().sort((a, b) => a.rank - b.rank);
  if (restaurants.length !== 1200) {
    console.error(`Expected 1200 restaurants, found ${restaurants.length}`);
  }

  console.error(`Fetching ${restaurants.length} detail pages for coordinates...`);
  const restaurantsWithCoords = await mapLimit(restaurants, DETAIL_CONCURRENCY, async (restaurant, index) => {
    const html = await fetchCached(detailCacheDir, detailCacheKey(restaurant.url), restaurant.url);
    const { lat, lng } = parseDetailPage(html, restaurant.url);
    if ((index + 1) % 50 === 0 || index === restaurants.length - 1) {
      console.error(`  Detail pages parsed: ${index + 1}/${restaurants.length}`);
    }
    return {
      ...restaurant,
      lat,
      lng,
    };
  });

  await mkdir(OUT_DIR, { recursive: true });

  for (const group of PAGE_GROUPS) {
    const items = restaurantsWithCoords.filter(
      (item) => item.page >= group.startPage && item.page <= group.endPage,
    );
    const output = renderPageFile(group.constName, items);
    const filepath = path.join(OUT_DIR, group.fileName);
    await writeFile(filepath, output, 'utf8');
    console.error(`Wrote ${items.length} restaurants to ${filepath}`);
  }

  const combinedPath = path.join(OUT_DIR, 'tabelogOsakaDinnerAll.js');
  await writeFile(combinedPath, renderCombinedFile(), 'utf8');
  console.error(`Wrote combined file to ${combinedPath}`);

  console.error('Top 5 Osaka restaurants:');
  restaurantsWithCoords.slice(0, 5).forEach((item) => {
    console.error(`  #${item.rank} ${item.name} | ${item.rating} | ${item.station}`);
  });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
