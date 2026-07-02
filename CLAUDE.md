# Japan 2026 Trip Planner — Monorepo

## Project Structure

```
test/
├── shared/data/           ← SINGLE SOURCE OF TRUTH for all trip data
│   ├── tripData.js        ← travelers, tasks, links, notes, timeline, initialFood, initialActivities
│   ├── nearbyFinds.js     ← Tabelog restaurant recs per day
│   ├── savedPlaces.js     ← Google Maps saved places
│   ├── coords.js          ← area/station coordinate lookups (used by both map implementations)
│   └── mapConfig.js       ← map provider config (token, provider switch)
├── japan2026/             ← React web app (Vite + Mantine)
│   └── src/data/          ← symlinks → shared/data/
├── japan2026-mobile/      ← Expo React Native app (SDK 54)
│   └── src/data/          ← symlinks → shared/data/
```

## Shared Data Rules

All data files in `shared/data/` are symlinked into both projects. **Both apps read from the exact same files.**

### What's safe (no cross-project changes needed):

- **Adding** new fields to existing objects (e.g. adding `rating` to a food item)
- **Adding** new exports (e.g. `export const newThing = ...`)
- **Adding** new entries to arrays (new travelers, new timeline days, new restaurants)
- **Adding** new areas to `coords.js` AREA_COORDS

Each platform simply ignores fields/exports it doesn't use.

### What's BREAKING (must update both projects):

- **Renaming** an existing field (e.g. `details` → `description`)
- **Removing** a field or export that either project currently reads
- **Changing the type** of a field (e.g. string → object, flat value → nested)
- **Renaming** an export (e.g. `initialFood` → `foodData`)
- **Changing CSV column mapping** in the Google Sheets sync (parsed shape must stay identical in both App.jsx and App.js)

Before making a breaking change, grep both projects:
```
grep -r "fieldName" japan2026/src/ japan2026-mobile/src/
```

### Shared data must be pure JS:

No `window`, `document`, `navigator`, no `react-native` imports. Plain objects and arrays only.

### Consumer mapping:

| Shared file | Web consumers | Mobile consumers |
|---|---|---|
| `tripData.js` | App.jsx, Timeline.jsx, Planning.jsx, TravelGroup.jsx | App.js, TimelineScreen.js, PlanningScreen.js, GroupScreen.js, MapScreen.js |
| `nearbyFinds.js` | Timeline.jsx, MapView.jsx | TimelineScreen.js, NearbyRecsScreen.js, MapScreen.js |
| `savedPlaces.js` | Timeline.jsx, MapView.jsx | TimelineScreen.js, NearbyRecsScreen.js, MapScreen.js |
| `coords.js` | MapView.jsx | MapScreen.js |
| `mapConfig.js` | MapView.jsx | (not yet used — mobile uses native Apple Maps) |

## Maps

### Architecture — designed for provider swapping:

- **Web**: Mapbox GL JS (`mapbox-gl`). Config in `shared/data/mapConfig.js`.
- **Mobile**: Apple Maps via `react-native-maps` (native MapKit, no API key needed).
- **Coordinates**: Both platforms share `coords.js` for area/station lookups.

### To switch web maps to Apple MapKit JS:

1. In `mapConfig.js`, set `MAP_PROVIDER` to `'apple'` and add your Apple MapKit JWT token
2. In `japan2026/src/components/MapView.jsx`, swap the Mapbox init for MapKit JS init
3. The pin/layer/carousel logic stays the same — only the map renderer changes

### To set up Mapbox:

1. Sign up free at mapbox.com
2. Copy your public token
3. Paste it in `shared/data/mapConfig.js` as the `MAPBOX_TOKEN` value

## Tech Stack

- **Web**: React 19, Vite, Mantine UI, Tabler Icons, Mapbox GL JS, PapaParse
- **Mobile**: React Native (Expo SDK 54), React Navigation, react-native-maps (Apple Maps), @expo/vector-icons (Ionicons), PapaParse

---

## ⚠️ Doc drift — read this

Some sections above are stale. Current reality:

- **The web map uses Google Maps** (`@react-google-maps/api`), not Mapbox. `MAP_PROVIDER = 'google'` in `mapConfig.js`. The Mapbox/`MAPBOX_TOKEN` notes above are dead — nothing reads `VITE_MAPBOX_TOKEN` at runtime.
- **The `shared/data` files are plain copies, not symlinks** (despite the symlink section). Edit `shared/data/<file>.js`, then copy to `japan2026/src/data/` and `japan2026-mobile/src/data/`. The geocode script does this automatically for `itineraryGeocoded.js`.

## Local dev (web) — Node version matters

Vite 8 (rolldown) needs **Node ≥ 20.19 / ≥ 22.12**. The machine default (Node 20.18) is too old and the dev server crashes with a rolldown "Cannot find native binding" error. Use nvm 22:

```
export NVM_DIR="$HOME/.nvm"; . "$NVM_DIR/nvm.sh"; nvm use 22
cd japan2026 && npm run dev        # http://localhost:5173/
```

If the native binding is missing after an install on the wrong Node: `rm -rf node_modules package-lock.json && npm install` under Node 22.

## Env vars (web) — `japan2026/.env` (gitignored)

- `VITE_GOOGLE_MAP` — Google Maps JS API key (read as `GOOGLE_MAPS_API_KEY` in `mapConfig.js`). The same key is used by the geocode script and is baked into the Pages bundle, so keep it HTTP-referrer + API restricted in Google Cloud.
- `VITE_GOOGLE_MAP_ID` — Map ID for AdvancedMarkerElement (falls back to `DEMO_MAP_ID`).
- Deploy (GitHub Pages, `.github/workflows/deploy.yml`) injects both from repo **secrets** of the same name — `.env` never reaches CI.

## Timeline itineraries & picker

The sheet has several timeline tabs (drafts per person). `shared/data/itineraries.js` lists the ones the app offers (`{ id, label, sheet, gid }`) with `DEFAULT_ITINERARY_ID`. The picker (web: Timeline header dropdown + More menu) writes the chosen id to `localStorage.itineraryId`; `sync()` fetches that itinerary's `gid`. To add/remove an option, edit `itineraries.js` (+ copy to both apps). "AD Timeline" is intentionally excluded — its sheet uses a layout `parseTimelineCSV` can't read (parses to 0 rows).

## Geocoding itinerary places (repeatable — works from Claude Code on any device)

The map plots a timeline row by resolving its activity text to coordinates via `getScheduleCoord` (coords.js), which checks `ITINERARY_COORDS` (hand-curated) + `ITINERARY_GEOCODED` (Google-geocoded) → `AREA_COORDS` districts → city-center blob → unpinned. New itineraries name places not in those dictionaries, so pins are missing/vague until geocoded.

**Workflow to refresh coordinates when itineraries change** (Claude does the judgment; Google does the geocoding — no runtime API calls, no Anthropic API):

1. `node scripts/geocode-itineraries.mjs --worklist` — lists every timeline row across all itineraries that doesn't resolve to a precise place.
2. **Claude reads that list and judges each row:** a real, findable place (restaurant, temple, shrine, museum, named shop) vs **filler** (`dinner`, `nap`, `Rest`, `Laundry`, `Line up`, `Train to X`, `shinkansen`, `Choose Your Adventure`, `Note: …`). Filler has no determinable location — skip it. For a row you're **confident is a real POI but can't resolve** (a nickname, a partial/misspelled name, an abbreviation), **web-search it** to find the real restaurant/place name, then geocode that.
3. Add real places to `scripts/itinerary-queries.json` as `"<key that appears in the sheet cell>": "<place> <city>, Japan"`. The key must be a substring of the activity text (that's how `getScheduleCoord` matches). **If a place doesn't resolve well in English (ZERO_RESULTS, or a plausible-but-wrong pin), use its Japanese name** — many cells already include it (e.g. `白龍大神`, `二の丸池`), otherwise look it up. Japanese queries geocode Japanese POIs far more accurately.
4. `node scripts/geocode-itineraries.mjs` — geocodes every query via `VITE_GOOGLE_MAP`, rejects any result outside Japan, and regenerates `shared/data/itineraryGeocoded.js` (+ copies to both apps). Skim the result: any pin that lands far from its day's city is likely a bad English match — re-query it in Japanese.

Requires Node 22. Commit `itinerary-queries.json` + the three `itineraryGeocoded.js` copies together.
