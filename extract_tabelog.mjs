import { readFileSync, writeFileSync } from 'fs';

const file1 = '/Users/nanicheen/.claude/projects/-Users-nanicheen-Desktop-test/7048571d-04ec-40ee-93fb-d4df797ecde6/subagents/agent-ab1b8de8fcca93d46.jsonl';
const file2 = '/Users/nanicheen/.claude/projects/-Users-nanicheen-Desktop-test/7048571d-04ec-40ee-93fb-d4df797ecde6/subagents/agent-a3e9b4581502316c8.jsonl';

function extractFromJsonl(filepath) {
  const lines = readFileSync(filepath, 'utf8').split('\n').filter(l => l.trim());
  const restaurantsByUrl = {};
  const urlToToolId = {};
  const toolIdToCoords = {};

  for (const line of lines) {
    let obj;
    try { obj = JSON.parse(line); } catch { continue; }
    const content = obj?.message?.content;
    if (!Array.isArray(content)) continue;

    for (const item of content) {
      if (item?.type === 'tool_result' && typeof item.content === 'string') {
        const text = item.content;
        if (text.includes('Rating:') && text.includes('URL:')) {
          const entries = text.split(/\n\d+\.\s+\*\*/);
          for (const entry of entries) {
            const nameM = entry.match(/\*?\*?(.+?)\*?\*?\s*\n/);
            const ratingM = entry.match(/Rating:\s*([\d.]+)/);
            const cuisineM = entry.match(/Cuisine:\s*(.+)/);
            const stationM = entry.match(/Station:\s*(.+)/);
            const priceM = entry.match(/(?:Price|Budget):\s*(.+)/);
            const urlM = entry.match(/URL:\s*(https:\/\/tabelog\.com\S+)/);
            if (nameM && ratingM && urlM) {
              restaurantsByUrl[urlM[1].trim()] = {
                name: nameM[1].trim().replace(/\*+/g, '').trim(),
                rating: parseFloat(ratingM[1]),
                cuisine: cuisineM ? cuisineM[1].trim() : '',
                station: stationM ? stationM[1].trim().replace(/\s*Sta\.?$/, '') : '',
                price: priceM ? priceM[1].trim() : ''
              };
            }
          }
          // Also try table format
          const tableRows = text.matchAll(/\|\s*\d+\s*\|\s*(.+?)\s*\|\s*([\d.]+)\s*\|\s*(.+?)\s*\|\s*(.+?)\s*\|\s*(.+?)\s*\|\s*(https:\/\/tabelog\.com\S+?)\s*\|/g);
          for (const row of tableRows) {
            restaurantsByUrl[row[6].trim()] = {
              name: row[1].trim(),
              rating: parseFloat(row[2]),
              cuisine: row[3].trim(),
              station: row[4].trim().replace(/\s*Sta\.?$/, ''),
              price: row[5].trim()
            };
          }
        }
        if (text.includes('Latitude') && text.includes('Longitude')) {
          const latM = text.match(/Latitude[:\s*]+(\d+\.\d+)/);
          const lngM = text.match(/Longitude[:\s*]+(\d+\.\d+)/);
          if (latM && lngM && item.tool_use_id) {
            toolIdToCoords[item.tool_use_id] = { lat: parseFloat(latM[1]), lng: parseFloat(lngM[1]) };
          }
        }
      }
      if (item?.type === 'tool_use' && item?.name === 'WebFetch' && item?.input?.url?.includes('tabelog.com')) {
        const prompt = (item.input.prompt || '').toLowerCase();
        if (prompt.includes('lat') || prompt.includes('coordinate') || prompt.includes('geo')) {
          urlToToolId[item.id] = item.input.url;
        }
      }
    }
  }

  const results = [];
  for (const [toolId, url] of Object.entries(urlToToolId)) {
    if (restaurantsByUrl[url] && toolIdToCoords[toolId]) {
      const r = { ...restaurantsByUrl[url] };
      r.lat = Math.round(toolIdToCoords[toolId].lat * 100000) / 100000;
      r.lng = Math.round(toolIdToCoords[toolId].lng * 100000) / 100000;
      results.push(r);
    }
  }
  results.sort((a, b) => b.rating - a.rating || a.name.localeCompare(b.name));

  console.error(`  Restaurants: ${Object.keys(restaurantsByUrl).length}, GeoURLs: ${Object.keys(urlToToolId).length}, GeoCoords: ${Object.keys(toolIdToCoords).length}, Matched: ${results.length}`);
  return results;
}

console.error('Processing file 1 (pages 21-30)...');
const r1 = extractFromJsonl(file1);
console.error('Processing file 2 (pages 31-40)...');
const r2 = extractFromJsonl(file2);

const all = [...r1, ...r2].sort((a, b) => b.rating - a.rating || a.name.localeCompare(b.name));
console.error(`Total: ${all.length} restaurants`);

const lines = ["export const dinnerPages21to40 = ["];
for (const r of all) {
  const ne = r.name.replace(/'/g, "\\'");
  const ce = r.cuisine.replace(/'/g, "\\'");
  const se = r.station.replace(/'/g, "\\'");
  const pe = r.price.replace(/'/g, "\\'");
  lines.push(`  {name:'${ne}',rating:${r.rating},cuisine:'${ce}',station:'${se}',price:'${pe}',lat:${r.lat},lng:${r.lng}},`);
}
lines.push("];");
lines.push("");

const outPath = '/Users/nanicheen/Desktop/test/shared/data/tabelogDinnerPages21to40.js';
writeFileSync(outPath, lines.join('\n'));
console.error(`Wrote ${all.length} restaurants to ${outPath}`);
all.slice(0, 3).forEach(r => console.error(`  ${r.name} | ${r.rating} | ${r.station} | ${r.lat},${r.lng}`));
console.error('  ...');
all.slice(-3).forEach(r => console.error(`  ${r.name} | ${r.rating} | ${r.station} | ${r.lat},${r.lng}`));
