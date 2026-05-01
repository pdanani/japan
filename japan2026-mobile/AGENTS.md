# AGENTS.md — Mobile (Expo iOS) operating rules

Read [the repo-root AGENTS.md](../AGENTS.md) first. This file adds mobile-specific rules; the root one still applies (especially the no-overwrite rule on hand-curated `tripData.js`).

## Hard rule: no Google Maps in this app

The mobile app uses **native Apple Maps via `react-native-maps`** (which renders MapKit on iOS). **Do not introduce Google Maps anywhere in `japan2026-mobile/`** — no `react-native-maps` Google provider, no `@vis.gl/*`, no `react-native-google-maps`, no `react-native-maps-directions` against Google's Directions API, no Places API SDK, no `VITE_GOOGLE_MAP*` env vars.

Why this rule exists:
- **Keyless on iOS.** Apple Maps requires no API key on Apple platforms — `react-native-maps` falls through to MapKit automatically. No GCP billing, no key restrictions, no quota panic.
- **Native performance.** MapKit is faster and more battery-efficient on iOS than the Google Maps SDK. Tile loads, gesture responsiveness, and clustering all benefit.
- **Scope discipline.** The Google Maps migration was a web-only decision (made 2026-04-30 after billing was enabled on the user's GCP project). Mobile was explicitly excluded — see the user's message in that session: "lets not update the mobile app for now, focus only on this web app", and later "except using google maps because we're using whatever is native for our mobile app".

If you're tempted to use Google Maps here for feature parity (Places search, AdvancedMarker styling, route polylines from Google Directions), **stop and ask.** Implement with MapKit-native equivalents, or skip the feature on mobile, or surface the gap to the user as a tradeoff. Do not introduce a Google Maps dependency on this side.

## Map provider state

| Concern | Web (`japan2026/`) | Mobile (`japan2026-mobile/`) |
|---|---|---|
| Map renderer | Google Maps via `@react-google-maps/api` | Apple Maps via `react-native-maps` |
| API key | `VITE_GOOGLE_MAP` (in web `.env`) | None (MapKit uses Apple device entitlements) |
| Map ID | `VITE_GOOGLE_MAP_ID` for AdvancedMarker | n/a |
| Marker rendering | `AdvancedMarkerElement` (imperative) | `<Marker>` from `react-native-maps` |
| Search | `Place.searchByText` (new Places API) | (not implemented; can use `Geocoder` from `react-native-maps` if needed, MapKit-native) |

`shared/data/mapConfig.js` is allowed to export Google-Maps-related constants for the web app — mobile just doesn't import them. **Don't sync mapConfig.js to mobile** (the file is allowed to drift on this side).

## What TO sync from `shared/data/`

The mobile app imports these and they should track the web-side copy in `japan2026/src/data/`:

- `tripData.js` — timeline, travelers, tasks, links, food, activities
- `nearbyFinds.js` — Tabelog recommendations per day
- `savedPlaces.js` — Google Maps "saved places" (data only; mobile doesn't use the Google API)
- `coords.js` — area/station coordinate lookups
- `restaurantCoords.js` — `RESTAURANT_COORDS` and `ITINERARY_COORDS` lookup tables
- `tabelogAll.js`, `tabelogDinnerAll.js`, `tabelogOsakaAll.js`, `tabelogOsakaLunchAll.js`, `tabelogOsakaDinnerAll.js` — restaurant datasets

When syncing, copy from the web copy (which is the actively-maintained one) since `shared/data/` is the canonical and `japan2026/src/data/` should already match it:

```bash
cp shared/data/<file>.js japan2026-mobile/src/data/<file>.js
```

Verify with `md5 shared/data/<file>.js japan2026-mobile/src/data/<file>.js` (must match).

## What NOT to sync

- `mapConfig.js` — different provider per platform; the file is allowed to drift.
- Any new web-app-only file (e.g., a future `places.js` wrapping Google's Place API).

## Tech stack reminders

- **Expo SDK 54**, React Native, React Navigation, `react-native-maps`, `@expo/vector-icons` (Ionicons), PapaParse for sheet sync.
- The in-app Sync button (if implemented on mobile) hits the same Google Sheet as the web app — that's just an HTTP fetch of CSV, no Maps APIs involved.

## When to update this file

- If the user adds a new mobile-only feature, document any cross-platform scope decisions here.
- If the user ever opts into Google Maps on mobile (unlikely, but possible if they hit a MapKit limitation), explicitly remove the "no Google Maps" rule above and document why.
