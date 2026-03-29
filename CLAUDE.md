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
