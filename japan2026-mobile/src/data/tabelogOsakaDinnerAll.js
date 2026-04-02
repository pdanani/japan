// Combined Tabelog Osaka dinner list (1200 restaurants)
import { osakaDinnerPages1to20 } from './tabelogOsakaDinnerPages1to20.js';
import { osakaDinnerPages21to40 } from './tabelogOsakaDinnerPages21to40.js';
import { osakaDinnerPages41to60 } from './tabelogOsakaDinnerPages41to60.js';

export const tabelogOsakaDinnerAll = [
  ...osakaDinnerPages1to20,
  ...osakaDinnerPages21to40,
  ...osakaDinnerPages41to60,
].sort((a, b) => a.rank - b.rank);
