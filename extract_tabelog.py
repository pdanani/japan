#!/usr/bin/env python3
"""Extract restaurant data from Tabelog crawl agent output files."""
import json, re, sys

def extract_from_jsonl(filepath):
    """Parse JSONL agent output and extract restaurant data with coordinates."""
    # First pass: collect restaurant listings (name, rating, cuisine, station, price, url)
    # Second pass: collect geocoding results (url -> lat, lng)

    restaurants_by_url = {}  # url -> {name, rating, cuisine, station, price}
    url_to_toolid = {}  # tool_use_id -> url (from WebFetch geocoding calls)
    toolid_to_coords = {}  # tool_use_id -> (lat, lng) (from tool_results)

    with open(filepath) as f:
        lines = f.readlines()

    for line in lines:
        line = line.strip()
        if not line:
            continue
        try:
            obj = json.loads(line)
        except json.JSONDecodeError:
            continue

        msg = obj.get('message', {})
        content = msg.get('content', [])

        if isinstance(content, str):
            # tool_result content as string
            continue

        if isinstance(content, list):
            for item in content:
                if not isinstance(item, dict):
                    continue

                # Restaurant listings from page fetches
                if item.get('type') == 'tool_result':
                    text = item.get('content', '')
                    if isinstance(text, str) and ('Rating:' in text and 'URL:' in text):
                        # Parse restaurant entries
                        entries = re.split(r'\n\d+\.\s+\*\*', text)
                        for entry in entries:
                            name_m = re.search(r'\*?\*?(.+?)\*?\*?\s*\n', entry)
                            if not name_m:
                                name_m = re.search(r'^(.+?)\*?\*?\s*\n', entry)
                            rating_m = re.search(r'Rating:\s*([\d.]+)', entry)
                            cuisine_m = re.search(r'Cuisine:\s*(.+)', entry)
                            station_m = re.search(r'Station:\s*(.+)', entry)
                            price_m = re.search(r'Price:\s*(.+)', entry)
                            url_m = re.search(r'URL:\s*(https://tabelog\.com\S+)', entry)

                            if name_m and rating_m and url_m:
                                name = name_m.group(1).strip().strip('*').strip()
                                url = url_m.group(1).strip()
                                restaurants_by_url[url] = {
                                    'name': name,
                                    'rating': float(rating_m.group(1)),
                                    'cuisine': cuisine_m.group(1).strip() if cuisine_m else '',
                                    'station': station_m.group(1).strip() if station_m else '',
                                    'price': price_m.group(1).strip() if price_m else '',
                                }

                    # Geocoding results
                    if isinstance(text, str) and 'Latitude' in text and 'Longitude' in text:
                        lat_m = re.search(r'Latitude[:\s]+([\d.]+)', text)
                        lng_m = re.search(r'Longitude[:\s]+([\d.]+)', text)
                        tool_id = item.get('tool_use_id', '')
                        if lat_m and lng_m and tool_id:
                            toolid_to_coords[tool_id] = (float(lat_m.group(1)), float(lng_m.group(1)))

                # WebFetch geocoding calls (to map tool_use_id -> url)
                if item.get('type') == 'tool_use' and item.get('name') == 'WebFetch':
                    inp = item.get('input', {})
                    url = inp.get('url', '')
                    prompt = inp.get('prompt', '')
                    tool_id = item.get('id', '')
                    if 'tabelog.com' in url and ('latitude' in prompt.lower() or 'lat' in prompt.lower() or 'coordinate' in prompt.lower()):
                        url_to_toolid[tool_id] = url

    # Now match: url -> restaurant info + coordinates
    # Reverse: tool_id -> url
    toolid_to_url = {v: k for k, v in url_to_toolid.items() if v}  # url -> tool_id
    # Actually url_to_toolid maps tool_id -> url, so:

    results = []
    matched = 0
    for tool_id, url in url_to_toolid.items():
        if url in restaurants_by_url and tool_id in toolid_to_coords:
            r = restaurants_by_url[url].copy()
            lat, lng = toolid_to_coords[tool_id]
            r['lat'] = round(lat, 5)
            r['lng'] = round(lng, 5)
            results.append(r)
            matched += 1

    print(f'  Restaurants found: {len(restaurants_by_url)}', file=sys.stderr)
    print(f'  Geocoding calls: {len(url_to_toolid)}', file=sys.stderr)
    print(f'  Geocoding results: {len(toolid_to_coords)}', file=sys.stderr)
    print(f'  Matched: {matched}', file=sys.stderr)

    # Sort by rating descending
    results.sort(key=lambda x: (-x['rating'], x['name']))
    return results

file1 = '/Users/nanicheen/.claude/projects/-Users-nanicheen-Desktop-test/7048571d-04ec-40ee-93fb-d4df797ecde6/subagents/agent-ab1b8de8fcca93d46.jsonl'
file2 = '/Users/nanicheen/.claude/projects/-Users-nanicheen-Desktop-test/7048571d-04ec-40ee-93fb-d4df797ecde6/subagents/agent-a3e9b4581502316c8.jsonl'

print('Processing file 1 (pages 21-30)...', file=sys.stderr)
r1 = extract_from_jsonl(file1)
print('Processing file 2 (pages 31-40)...', file=sys.stderr)
r2 = extract_from_jsonl(file2)

all_restaurants = r1 + r2
# Sort by rating descending
all_restaurants.sort(key=lambda x: (-x['rating'], x['name']))

print(f'\nTotal restaurants: {len(all_restaurants)}', file=sys.stderr)

# Generate JS
lines = ["export const dinnerPages21to40 = ["]
for r in all_restaurants:
    name_escaped = r['name'].replace("'", "\\'")
    cuisine_escaped = r['cuisine'].replace("'", "\\'")
    station_escaped = r['station'].replace("'", "\\'")
    price_escaped = r['price'].replace("'", "\\'")
    lines.append(f"  {{name:'{name_escaped}',rating:{r['rating']},cuisine:'{cuisine_escaped}',station:'{station_escaped}',price:'{price_escaped}',lat:{r['lat']},lng:{r['lng']}}},")
lines.append("];")
lines.append("")

output = '\n'.join(lines)
outpath = '/Users/nanicheen/Desktop/test/shared/data/tabelogDinnerPages21to40.js'
with open(outpath, 'w') as f:
    f.write(output)

print(f'Wrote {len(all_restaurants)} restaurants to {outpath}', file=sys.stderr)

# Also print summary
for r in all_restaurants[:5]:
    print(f"  {r['name']} | {r['rating']} | {r['station']} | {r['lat']},{r['lng']}", file=sys.stderr)
print('  ...', file=sys.stderr)
for r in all_restaurants[-5:]:
    print(f"  {r['name']} | {r['rating']} | {r['station']} | {r['lat']},{r['lng']}", file=sys.stderr)
