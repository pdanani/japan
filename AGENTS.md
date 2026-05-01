# AGENTS.md — Operating rules for Claude (and other agents)

This repo is the **Japan 2026 trip planner** (web + mobile). It is being maintained partly by Claude running locally and partly by Claude running in the cloud via the GitHub integration. Both should read this file before making changes. `CLAUDE.md` covers project structure and tech stack — read it too. This file is the operational rule book: what to never do, what to always do, and where the foot-guns are.

## Scope

- **In scope:** everything under `japan2026/`, `japan2026-mobile/`, `shared/`, and the Tabelog scrapers at the repo root.
- **Out of scope:** `trip-planner-scaffold/`. That is a separate greenfield SaaS project — do not touch it as part of Japan 2026 work.

---

## Hard rules — do not break these

### 1. Never overwrite `shared/data/tripData.js` from a CSV regenerate

The `timeline` export in [shared/data/tripData.js](shared/data/tripData.js) is **hand-curated**, not a raw dump of the PB Draft Timeline sheet. Each schedule item has a `source` field that distinguishes origin:

| `source`       | Meaning                                                             |
|----------------|---------------------------------------------------------------------|
| `'sheet'`      | Came from the PB Draft Timeline Google Sheet                         |
| `'food'`       | Layered in from the Food Menu sheet / `initialFood`                  |
| `'activities'` | Layered in from the Activities sheet / `initialActivities`           |
| `'tabelog'`    | Suggested from Tabelog dataset (often paired with `suggested: true`) |
| `'ai'`         | Suggested by an earlier AI pass (often paired with `suggested: true`)|
| `'maps'`       | Pulled from a Maps reference (e.g. saved place)                      |

The user has spent real time refining wording (e.g. `'Sensō-ji Temple'` instead of PB's raw `'Sensō-ji'`) and selecting precise `mapUrl` queries. **A wholesale `parseTimelineCSV` replacement erases all of that.**

**Always do an additive surgical merge** when syncing PB updates:

```bash
# 1. Fetch latest PB sheet
curl -sS "https://docs.google.com/spreadsheets/d/1N_V9v7uKz3hXRQSnVNaaeAJO7vgU-GdnE5Pisln6C1A/gviz/tq?tqx=out:csv&sheet=PB%20Draft%20Timeline" -o /tmp/pb-timeline.csv

# 2. Parse with parseTimelineCSV (in japan2026/src/utils.js) — handles the 12-hour clock wrap at noon

# 3. For each PB item, only add it if no near-equivalent exists in current[day].schedule
#    Near-equivalent = same activity tokens AND time within ±60min
#    Reference implementation: see git history for /tmp/merge-pb-timeline.mjs from the 2026-04-30 session
#    (regenerable; not committed because it's a one-shot tool)

# 4. Sort each day's schedule by time (AM before PM, untimed at end)

# 5. Preserve all non-'sheet' source items verbatim
```

If you are unsure whether something would be a "blind overwrite," **stop and ask** rather than risk losing curated content.

### 2. `shared/data/*.js` files are real copies, not symlinks

There used to be symlinks; commit `8391fed` replaced them because the symlinks broke Vercel deploys. Three copies exist for any shared data file:

- `shared/data/<file>.js` — canonical
- `japan2026/src/data/<file>.js` — copy (**actively maintained**)
- `japan2026-mobile/src/data/<file>.js` — copy (**paused — do not update**)

**Current scope (web-only):** the user paused work on mobile on 2026-04-30 to focus on the web map experience. **Only propagate `shared/data/<file>.js` → `japan2026/src/data/<file>.js`.** Skip the mobile dir until the user explicitly resumes mobile work. Verify with:

```bash
md5 shared/data/tripData.js japan2026/src/data/tripData.js   # must match
```

The mobile copy is allowed to drift; don't try to "fix" it without explicit confirmation. When the user does resume mobile, that's the moment to bulk-resync.

### 3. The `parseTimelineCSV` AM/PM toggle is correct — do not "simplify" it

`japan2026/src/utils.js` `parseTimelineCSV` walks time rows in order and toggles AM↔PM whenever it enters a `12:xx` slot from a non-12 hour. This is required because the PB sheet uses a 12-hour clock that wraps at noon (`5:00, 5:30, …, 11:30, 12:00, 12:30, 1:00, …, 11:30, 12:00`) and gives no AM/PM indicator. A naive `hour >= 12 ? 'PM' : 'AM'` returns `1:30 AM` for what is actually `1:30 PM`. Don't undo the fix.

### 4. API keys live in `.env` — no hardcoded fallbacks

`shared/data/mapConfig.js` reads tokens from `import.meta.env`:

- `VITE_MAPBOX_TOKEN` — Mapbox public token (current default provider)
- `VITE_GOOGLE_MAP` — Google Maps JS API key (note: `VITE_GOOGLE_MAP`, **not** `VITE_GOOGLE_MAPS_API_KEY`; the Google Maps migration is currently stashed but if you revive it the env var name matters)

**Do not commit a hardcoded fallback string.** Prior incident: a fallback like `|| 'AIzaSy...'` was committed and the same string was also the user's real key in `.env` — code that "checks if the key is the placeholder" then false-positives and shows a "missing key" overlay forever. Always check empty (`!KEY`) for missing-key UI.

### 5. Map provider state

- **Web app currently uses Mapbox** (`MAP_PROVIDER = 'mapbox'`).
- **Mobile uses native Apple Maps** via `react-native-maps` (no token needed).
- A Google Maps migration was attempted and lives in `git stash` as **`google-maps-migration-wip`** (created 2026-04-30). It was reverted because the user's GCP project lacked billing. If you restore it via `git stash pop`, you'll need: billing enabled on GCP, Maps JavaScript API + Places API enabled, HTTP-referrer restrictions on the key.

### 6. When new schedule items are added, also add coords

A schedule item's pin position is resolved by `getScheduleCoord()` in [shared/data/coords.js](shared/data/coords.js). The lookup checks (in order):

1. `ITINERARY_COORDS` in [shared/data/restaurantCoords.js](shared/data/restaurantCoords.js) — case-insensitive substring on the activity field
2. `RESTAURANT_COORDS` in the same file
3. `AREA_COORDS` in [coords.js](shared/data/coords.js) — falls back to a jittered offset around a neighborhood/station center
4. The `dayLocation` itself, jittered (city center)

Tiers 3 and 4 produce **wrong-looking pins** that float around an area or city. After adding new schedule items, **always either** add a real coord to `ITINERARY_COORDS` **or** explicitly accept the jittered fallback (e.g. for "lunch" or "Group dinner" placeholders).

**Resolution pipeline (try in order):**

1. **Tabelog match** — most restaurants in the schedule appear in `shared/data/tabelogAll.js` / `tabelogDinnerAll.js` / the Osaka equivalents (1632 entries with real lat/lng). Match by activity-name substring + filter by `restaurant.station` matching the day's neighborhood. The pattern lives at `/tmp/resolve-coords.mjs` from the 2026-04-30 session — strict word-boundary phrase containment + station-context boost. **Caveat:** this only works for restaurants Tabelog has indexed.

2. **Mapbox geocoding** — DOES NOT WORK for most Japanese POIs. The Mapbox Search Box and Forward Geocoding APIs have very sparse POI coverage in Japan. Even famous landmarks like Kiyomizu-dera and Ginkaku-ji return only neighborhood admin levels, not the actual sites. Don't waste a session on this — Mapbox geocoding will return `feature_type: 'place'` / `'neighborhood'` / `'locality'` for almost every query and they're useless for pinning. Reject any result with `feature_type` that isn't `'poi'` or `'address'`.

3. **Manual entry** — pull coords from Tabelog/Wikipedia/Google Maps and add them to `ITINERARY_COORDS`. Track outstanding items in [docs/coords-pending.md](docs/coords-pending.md).

**Don't pin generic chain references.** When the activity names a chain without a specific branch (e.g. `711 and Family Mart`, bare `Starbucks`, `Don Quijote` without a neighborhood, `convenience store`), it represents "stop somewhere convenient" intent — pinning an arbitrary branch produces a misleading dot on the map. Skip silently and let day-jitter render. **Resolve only when** the activity names a specific branch (`MEGA Don Quijote Shibuya`, `Bic Camera Akasaka`, `BEAMS Shinjuku`) or a single named establishment (`Pizza Marumo`, `Kiyomizu-dera`, `Starbucks Reserve Roastery Nakameguro`). When it's ambiguous (could be the famous Reserve Roastery, could be a generic Reserve branch), flag for user review with candidates listed — do not auto-apply. User policy stated 2026-04-30.

### 8. Sensitive data hygiene

- Don't `cat` `.env` files into the conversation transcript or external services. Use `awk` to inspect structure (variable names + value lengths) without dumping secrets.
- Don't curl the user's real API keys to third-party endpoints to "test" them. The cloud sandbox treats this as exfiltration.
- Mapbox calls for **geocoding using the user's own token** are explicitly authorized — that's a normal use of the token, not exfiltration.

### 9. Don't commit unless asked

Defaults to off. If the user asks for a commit, follow the standard rules in the system prompt (NEW commit, never `--amend`, never `--no-verify`).

---

## Useful commands

```bash
# Run the web app
cd japan2026 && npm run dev   # http://localhost:5173/

# Type-check / parse-check before committing
node --check shared/data/tripData.js
node -e "import('./shared/data/tripData.js').then(m => console.log('timeline:', m.timeline.length, 'days,', m.timeline.reduce((n,d)=>n+d.schedule.length,0), 'items'))"

# Verify all three tripData copies match
md5 shared/data/tripData.js japan2026/src/data/tripData.js japan2026-mobile/src/data/tripData.js

# Find references to a shared data field across both apps
grep -rn "fieldName" japan2026/src/ japan2026-mobile/src/
```

## Schema reference (timeline)

```js
{
  day: number,                   // 0..15
  date: string,                  // 'July 11'
  dayOfWeek: string,             // 'Saturday'
  location: string,              // 'Tokyo' | 'Osaka' | 'Tokyo → Osaka' | …
  notes: string,
  schedule: [
    {
      time: string,              // '7:00 AM' | '5:30 PM'
      activity: string,
      type: 'transport' | 'food' | 'group' | 'shopping' | 'site' | 'rest' | 'activity',
      source: 'sheet' | 'food' | 'activities' | 'tabelog' | 'ai' | 'maps',
      mapUrl?: string,           // optional, Google Maps search URL
      suggested?: true,          // optional, for tabelog/ai recommendations
    }
  ]
}
```

## Verification before claiming done

For UI changes: start the dev server, load it, and click through the affected feature. Type checks and parse-checks verify code correctness, not feature correctness. If you can't open a browser (e.g. cloud agent), say so explicitly — don't claim a UI works because the build succeeded.

For data changes: run the `node -e "import(...)"` smoke test above and confirm counts (days, schedule items, food, activities) match expectations.
