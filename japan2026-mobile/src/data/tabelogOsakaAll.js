// Combined Tabelog Osaka restaurants — Lunch + Dinner lists, deduplicated
import { tabelogOsakaLunchAll } from './tabelogOsakaLunchAll.js';
import { tabelogOsakaDinnerAll } from './tabelogOsakaDinnerAll.js';

const all = [...tabelogOsakaLunchAll, ...tabelogOsakaDinnerAll];
const seen = new Map();

all.forEach((restaurant) => {
  const key = (restaurant.url || restaurant.name).toLowerCase().trim();
  const previous = seen.get(key);
  if (
    !previous ||
    restaurant.rating > previous.rating ||
    (restaurant.rating === previous.rating && restaurant.rank < previous.rank)
  ) {
    seen.set(key, restaurant);
  }
});

export const tabelogOsakaAll = [...seen.values()].sort((a, b) => b.rating - a.rating || a.rank - b.rank);
