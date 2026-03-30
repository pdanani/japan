// Combined Tabelog Tokyo Dinner-price list (1200 restaurants)
import { dinnerPages1to20 } from './tabelogDinnerPages1to20.js';
import { dinnerPages21to40 } from './tabelogDinnerPages21to40.js';
import { dinnerPages41to60 } from './tabelogDinnerPages41to60.js';

export const tabelogDinnerAll = [
  ...dinnerPages1to20,
  ...dinnerPages21to40,
  ...dinnerPages41to60,
].sort((a, b) => b.rating - a.rating);
