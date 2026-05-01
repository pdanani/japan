Total pending: **60** items (resolved: 48 via Google Places, 1 needs review, 11 generic placeholders)

# Pending coords — 2026-04-30 PB sync

These activities were added during the PB Draft Timeline sync but lack precise coordinates.
They currently render at neighborhood-jitter (`AREA`) or city-jitter (`NONE`) accuracy.

Mapbox SearchBox geocoding (Search Box API + Forward Geocoding) returned no POI matches for these — Mapbox's POI database for Japan is sparse compared to Google.

**Update 2026-04-30:** Switched to Google Places API (New) `places:searchText`
with city-biased proximity. 48 of 60 items auto-resolved with high-confidence
matches; 1 (`711 and Family Mart`) is too generic to pin and is in the "Needs
review" section below; the remaining 11 are generic meal placeholders that
should keep their day-jitter fallback (no specific destination).

**To resolve:** add an entry to `ITINERARY_COORDS` in [shared/data/restaurantCoords.js](../shared/data/restaurantCoords.js) for each. The lookup is case-insensitive substring, so the key only needs to be a substring of the schedule item's `activity` field.

```js
  'Place Name': [lat, lng],
```

**After editing**, propagate to the two app copies:

```bash
cp shared/data/restaurantCoords.js japan2026/src/data/restaurantCoords.js
cp shared/data/restaurantCoords.js japan2026-mobile/src/data/restaurantCoords.js
```

## Day 1 (July 11, Tokyo)

- [~] **9:30 AM** — 711 and Family Mart  *(SKIP — generic chain stop, intentionally unpinned per user policy 2026-04-30)*
- [x] **11:00 AM** — Tsujihan (11am) ?  *(Google Places: Tsujihan, rating 4.4 / 5115)*

## Day 2 (July 12, Tokyo)

- [x] **9:00 AM** — Little Nap Coffee Stand  *(Google Places: rating 4.5 / 1114)*
- [x] **11:30 AM** — Tokyo & Musée du Chocolat Théobroma (cake to go with Koffee mameya)  *(Google Places: Musée du Chocolat Théobroma, rating 4.0 / 445)*
- [x] **12:30 PM** — KOFFEE MAMEYA  *(Google Places: rating 4.6 / 1840)*
- [x] **1:30 PM** — The Flat Head & Loopwheeler & THE REAL McCOY'S (pawan shopping)  *(Google Places: Loopwheeler, rating 4.6 / 222)*
- [x] **7:30 PM** — かき氷ワインバーAO+(アオプラス)  (shaved ice) ?  *(Google Places: かき氷バーAO+, rating 4.7 / 90)*

## Day 3 (July 13, Tokyo)

- [x] **11:00 AM** — Tokyo Curry Pan  *(Google Places: rating 4.6 / 394)*
- [x] **5:00 PM** — Toyokawa-inari Tokyo-betsuin Temple  *(Google Places: rating 4.5 / 4935)*
- [ ] **6:00 PM** — dinner  *(generic placeholder — accept day-jitter)*
- [x] **6:30 PM** — MENDOKORO TOMO Premium (chicken ramen)?  *(Google Places: rating 4.3 / 237)*
- [x] **7:30 PM** — post dinner walk: Nogi Shrine  *(Google Places: rating 4.4 / 4562)*
- [x] **8:00 PM** — Hinokicho Park  *(Google Places: rating 4.3 / 2157)*
- [x] **8:30 PM** — Taiyaki-ya Oyoge  *(Google Places: rating 4.1 / 286)*
- [x] **9:30 PM** — Akasaka Hikawa Shrine  *(Google Places: rating 4.4 / 3008)*

## Day 4 (July 14, Tokyo)

- [ ] **9:30 AM** — Breakfast  *(generic placeholder — accept day-jitter)*
- [x] **10:00 AM** — ドンキの時間 (shop)  *(Google Places: Don Quijote Shinjuku Tonanguchi, rating 3.7 / 4855)*
- [ ] **2:30 PM** — lunch  *(generic placeholder — accept day-jitter)*
- [x] **3:30 PM** — BEAMS Shinjuku  *(Google Places: rating 4.2 / 1085)*
- [x] **5:30 PM** — BEAMS Shinjuku  *(same as 3:30 PM entry — single store, listed twice)*
- [ ] **7:00 PM** — Dinner  *(generic placeholder — accept day-jitter)*

## Day 5 (July 15, Tokyo)

- [x] **12:30 PM** — Jippō Sushi - Lunch set menu for 5500 yen  *(Google Places: rating 4.5 / 73)*
- [x] **1:30 PM** — Starbucks Reserve (shane gift)  *(Google Places: Starbucks Reserve Roastery Tokyo / Nakameguro, rating 4.5 / 13368)*
- [x] **9:30 PM** — A9 Ebisu (bar) ?  *(Google Places: rating 4.2 / 87)*
- [x] **10:00 PM** — Bar 盤天(Banten) ?  *(Google Places: rating 3.8 / 52)*

## Day 6 (July 16, Tokyo → Osaka)

- [ ] **12:30 PM** — lunch  *(generic placeholder — accept day-jitter)*
- [x] **3:00 PM** — Hotel Hankyu Respire - Check in 3pm  *(Google Places: rating 4.3 / 4158)*
- [x] **6:00 PM** — Ōgimachi Park?  *(Google Places: rating 3.9 / 4010)*

## Day 7 (July 17, Osaka)

- [x] **9:30 AM** — Sakai Ichimonji Mitsuhide (knives)  *(Google Places: rating 4.7 / 304)*
- [x] **12:00 PM** — LiLo Coffee Roasters  *(Google Places: rating 4.8 / 2366)*
- [x] **1:00 PM** — CANELÉ du JAPON  *(Google Places: Nagahoribashi store, rating 4.3 / 224)*
- [x] **5:00 PM** — Torebon (okonomiyaki)  *(Google Places: rating 4.5 / 259)*
- [x] **6:30 PM** — Three Tides Tattoo Osaka?  *(Google Places: rating 4.3 / 206)*

## Day 8 (July 18, Osaka)

- [x] **9:30 AM** — Ginkaku-ji  *(Google Places: rating 4.5 / 17075)*
- [x] **10:00 AM** — Ochanoi Well (Tea Well)  *(Google Places: rating 4.4 / 26)*
- [x] **1:00 PM** — Nishiki Market  *(Google Places: rating 4.3 / 51267)*
- [x] **3:00 PM** — Yasaka Shrine  *(Google Places: rating 4.4 / 32467)*
- [ ] **6:30 PM** — dinner  *(generic placeholder — accept day-jitter)*

## Day 9 (July 19, Kyoto Day Trip)

- [ ] **8:00 AM** — Breakfast  *(generic placeholder — accept day-jitter)*
- [x] **9:30 AM** — Rintei (end of fushimi)  *(Google Places: 林亭 (Rintei) tea shop on Fushimi Inari approach, rating 4.6 / 20 — manually selected over the phantom Fushimi Inari Taisha top-result)*
- [x] **11:00 AM** — Men-ya Inoichi  *(Google Places: rating 4.4 / 3781)*
- [x] **1:00 PM** — Kiyomizu-dera  *(Google Places: rating 4.6 / 68755)*
- [ ] **1:30 PM** — Lunch  *(generic placeholder — accept day-jitter)*
- [x] **2:30 PM** — Craft Gallery Art Eiran  *(Google Places: rating 5.0 / 8)*
- [x] **3:30 PM** — Kyoto Ceramic Center  *(Google Places: rating 4.3 / 268)*
- [x] **4:30 PM** — Söt Coffee Kyoto Shichijo  *(Google Places: rating 4.8 / 815)*
- [x] **5:30 PM** — Shōseien Garden  *(Google Places: rating 4.2 / 2830)*
- [x] **6:00 PM** — Kyoto Beer Lab  *(Google Places: rating 4.7 / 1656)*
- [x] **7:30 PM** — Honke Daiichi Asahi Honten (ramen)  *(Google Places: rating 4.0 / 8909)*
- [x] **8:30 PM** — Higashi Hongan-ji Temple  *(Google Places: rating 4.5 / 12447)*

## Day 11 (July 21, Osaka)

- [x] **8:30 AM** — Hotel Hankyu Respire - Check out before 12pm  *(Google Places: same as Day 6, rating 4.3 / 4158)*
- [ ] **7:00 PM** — dinner  *(generic placeholder — accept day-jitter)*

## Day 12 (July 22, Tokyo)

- [x] **7:00 AM** — Fish Market Tsukiji — breakfast & explore  *(Google Places: Tsukiji Outer Market, rating 4.2 / 55566)*
- [x] **9:30 AM** — Glitch Coffee and Roasters GINZA  *(Google Places: rating 4.3 / 1316)*

## Day 13 (July 23, Tokyo)

- [x] **8:00 AM** — Kita-no-maru Park  *(Google Places: rating 4.2 / 3731)*
- [x] **8:30 AM** — Tokyo Daijingu Shrine  *(Google Places: rating 4.4 / 12110)*
- [x] **9:00 AM** — Glitch Coffee and Roasters GINZA  *(same as Day 12 entry — Ginza branch)*
- [x] **10:00 AM** — Tsukudo Shrine  *(Google Places: Tsukudo Hachiman Shrine, rating 4.0 / 348)*
- [x] **12:00 PM** — GLITCH COFFEE & ROASTERS?  *(Google Places: Kanda/Jimbocho main shop, rating 4.4 / 2283)*
- [ ] **7:00 PM** — Dinner  *(generic placeholder — accept day-jitter)*

## Intentionally unpinned (generic chain references)

Per user policy (2026-04-30): activities that name a chain generically without a
specific branch should NOT be pinned. They represent "stop somewhere convenient"
intent, not a destination. Day-jitter is the correct rendering.

- Day 1, 9:30 AM — "711 and Family Mart" — generic stop near OMO3, no specific branch named.

## Possibly worth user confirmation

These auto-applied but the activity text is borderline; verify the chosen branch
matches your intent and re-pick if not:

- **Day 4, 10:00 AM — "ドンキの時間 (shop)"** → resolved to `Don Quijote Shinjuku Tonanguchi` [35.69010, 139.70200]. The phrase "ドンキの時間" is slang for "Donki time"; pinning a specific branch only makes sense if you actually plan to visit that one.
- ~~**Day 5, 1:30 PM — "Starbucks Reserve (shane gift)"** → resolved to `Starbucks Reserve Roastery Nakameguro` [35.64926, 139.69259].~~ **Confirmed** by user 2026-04-30 — this IS the Roastery (4-story Meguro River destination).
- ~~**Day 13, 10:00 AM — "Tsukudo Shrine"** → resolved to `Tsukudo Hachiman Shrine` [35.70405, 139.74061].~~ **Corrected** by user 2026-04-30 — actual shrine is at 1-14-21 Kudankita, Chiyoda [35.696066, 139.749981]. Updated.
- ~~**Day 2, 1:30 PM — "The Flat Head & Loopwheeler & THE REAL McCOY'S"** → only `Loopwheeler` was pinned.~~ **Resolved** 2026-04-30: split the row into three sequential shopping stops at 1:30/1:45/2:00 PM, all three pinned (Harajuku/Jingumae).

Generic meal placeholders left as-is (acceptable to render via day-jitter — these
are not specific destinations and were never going to resolve to a single POI):

- Day 3 6:00 PM — "dinner"
- Day 4 9:30 AM — "Breakfast", 2:30 PM — "lunch", 7:00 PM — "Dinner"
- Day 6 12:30 PM — "lunch"
- Day 8 6:30 PM — "dinner"
- Day 9 8:00 AM — "Breakfast", 1:30 PM — "Lunch"
- Day 11 7:00 PM — "dinner"
- Day 13 7:00 PM — "Dinner"
