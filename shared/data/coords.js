// Known district/station center coordinates
export const AREA_COORDS = {
  // Tokyo
  Akasaka: [35.6762, 139.7370], 'Akasaka Mitsuke': [35.6762, 139.7355],
  Shibuya: [35.6580, 139.7016], Harajuku: [35.6702, 139.7027],
  Omotesando: [35.6654, 139.7122], Aoyama: [35.6654, 139.7122],
  Yoyogi: [35.6712, 139.6951], 'Kita Sando': [35.6740, 139.7050],
  Asakusa: [35.7148, 139.7967], Kappabashi: [35.7120, 139.7880],
  Tawaramachi: [35.7100, 139.7900], Kasuga: [35.7085, 139.7520],
  Gotokuji: [35.6527, 139.6444], Shinjuku: [35.6896, 139.7006],
  'Nishi-Shinjuku': [35.6930, 139.6920],
  Daikanyama: [35.6488, 139.7034], Nakameguro: [35.6440, 139.6988],
  Ebisu: [35.6467, 139.7100], Ginza: [35.6717, 139.7649],
  Nihombashi: [35.6838, 139.7744], Yurakucho: [35.6748, 139.7631],
  Kagurazaka: [35.7026, 139.7410], Kanda: [35.6933, 139.7706],
  Tsukiji: [35.6654, 139.7707], Akihabara: [35.6984, 139.7731],
  'Meiji Jingumae': [35.6702, 139.7027], 'Gaiemmae': [35.6705, 139.7175],
  'Omote Sando': [35.6654, 139.7122], 'Yoyogi Koen': [35.6720, 139.6950],
  Kojimachi: [35.6840, 139.7390], Hanzomon: [35.6840, 139.7400],
  Ikejiri: [35.6530, 139.6860],

  // Osaka
  Dotonbori: [34.6687, 135.5013], Umeda: [34.7055, 135.4983],
  Namba: [34.6657, 135.5013], Shinsekai: [34.6525, 135.5063],
  Shinsaibashi: [34.6740, 135.5015],

  // Kyoto
  Fushimi: [34.9672, 135.7727], Gion: [35.0037, 135.7748],
  Arashiyama: [35.0094, 135.6671], Kinkakuji: [35.0394, 135.7292],
  Nishiki: [35.0050, 135.7640],

  // Cities (fallback)
  Tokyo: [35.6762, 139.6503], Osaka: [34.6937, 135.5023],
  Kyoto: [35.0116, 135.7681], Kinosaki: [35.6265, 134.8118],
  Hakone: [35.2326, 139.1070],

  // Landmarks
  Haneda: [35.5494, 139.7798], JFK: [40.6413, -73.7781],
};

// Slight offset so pins in the same area don't stack
let offsetIndex = 0;
function jitter() {
  offsetIndex++;
  const angle = (offsetIndex * 137.508) * (Math.PI / 180); // golden angle
  const r = 0.0008 * Math.sqrt(offsetIndex % 20);
  return [Math.cos(angle) * r, Math.sin(angle) * r];
}

// Try to resolve coordinates for a schedule item
export function getScheduleCoord(item, dayLocation) {
  // Try parsing the mapUrl query for location name
  const activity = item.activity || '';

  // Match against known areas by activity name
  for (const [key, coord] of Object.entries(AREA_COORDS)) {
    if (activity.toLowerCase().includes(key.toLowerCase())) {
      const [dLat, dLng] = jitter();
      return { latitude: coord[0] + dLat, longitude: coord[1] + dLng };
    }
  }

  // Fallback to day's location
  if (dayLocation && AREA_COORDS[dayLocation]) {
    const coord = AREA_COORDS[dayLocation];
    const [dLat, dLng] = jitter();
    return { latitude: coord[0] + dLat, longitude: coord[1] + dLng };
  }

  return null;
}

// Resolve coords for a tabelog restaurant
export function getTabelogCoord(r) {
  if (r.station) {
    // Direct match
    if (AREA_COORDS[r.station]) {
      const coord = AREA_COORDS[r.station];
      const [dLat, dLng] = jitter();
      return { latitude: coord[0] + dLat, longitude: coord[1] + dLng };
    }
    // Partial match
    for (const [key, coord] of Object.entries(AREA_COORDS)) {
      if (r.station.toLowerCase().includes(key.toLowerCase())) {
        const [dLat, dLng] = jitter();
        return { latitude: coord[0] + dLat, longitude: coord[1] + dLng };
      }
    }
  }
  return null;
}

// Resolve coords for a saved place
export function getSavedPlaceCoord(p) {
  if (p.area && AREA_COORDS[p.area]) {
    const coord = AREA_COORDS[p.area];
    const [dLat, dLng] = jitter();
    return { latitude: coord[0] + dLat, longitude: coord[1] + dLng };
  }
  if (p.city && AREA_COORDS[p.city]) {
    const coord = AREA_COORDS[p.city];
    const [dLat, dLng] = jitter();
    return { latitude: coord[0] + dLat, longitude: coord[1] + dLng };
  }
  return null;
}

// Get the center coord for a day (for map camera)
export function getDayCenter(day) {
  const loc = day.location;
  // Check notes for neighborhood
  if (day.notes) {
    for (const [key, coord] of Object.entries(AREA_COORDS)) {
      if (day.notes.toLowerCase().includes(key.toLowerCase())) {
        return { latitude: coord[0], longitude: coord[1] };
      }
    }
  }
  if (AREA_COORDS[loc]) {
    return { latitude: AREA_COORDS[loc][0], longitude: AREA_COORDS[loc][1] };
  }
  // Default Tokyo
  return { latitude: 35.6762, longitude: 139.6503 };
}
