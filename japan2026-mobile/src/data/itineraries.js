// Timeline itinerary options.
// Each entry maps to a tab (worksheet) in the trip Google Sheet, identified by
// its `gid`. Syncing the timeline fetches the selected itinerary's gid as CSV.
//
// Using gid (not the tab name) means renaming a tab in the sheet won't break the
// app. To add a new itinerary: add a row in the sheet, grab its gid from the URL
// (…/edit#gid=XXXXXXX), and add an entry here — it shows up in the picker on both
// web and mobile automatically.
//
// This is shared, pure-JS data: no window/document/react-native imports.

// NOTE: the "AD Timeline" tab (gid 1847864022) is intentionally omitted — its grid
// has day/location/notes but no per-time schedule rows, so parseTimelineCSV yields
// 0 schedule items (blank days). Re-add it once the parser surfaces day-level notes.
export const ITINERARIES = [
  { id: 'pb',    label: 'PB Draft',   sheet: 'PB Draft Timeline',   gid: 475087721 },
  { id: 'group', label: 'GROUP MAIN', sheet: 'GROUP MAIN Timeline', gid: 350867624 },
  { id: 'ao',    label: 'AO Draft',   sheet: 'AO Draft Timeline',   gid: 613716340 },
  { id: 'mg2',   label: 'MG2 Draft',  sheet: 'MG2 draft',           gid: 284686706 },
  { id: 's14',   label: 'Sheet 14',   sheet: 'Sheet 14',            gid: 24206304 },
];

// The itinerary loaded before the user picks one (persisted choice overrides this).
export const DEFAULT_ITINERARY_ID = 'pb';

// Resolve an id to its itinerary, falling back to the default for unknown ids.
export function getItinerary(id) {
  return (
    ITINERARIES.find((it) => it.id === id) ||
    ITINERARIES.find((it) => it.id === DEFAULT_ITINERARY_ID)
  );
}
