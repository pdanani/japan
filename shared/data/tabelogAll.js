// Combined Tabelog Top 1200 Tokyo restaurants
// Imports all three page ranges and exports as a single sorted array

import { pages1to10 } from './tabelogPages1to10.js';
import { pages11to35 } from './tabelogPages11to35.js';
import { pages36to60 } from './tabelogPages36to60.js';

export const tabelogAll = [
  ...pages1to10,
  ...pages11to35,
  ...pages36to60,
].sort((a, b) => b.rating - a.rating);
