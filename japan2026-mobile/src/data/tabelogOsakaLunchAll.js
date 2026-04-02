// Combined Tabelog Osaka lunch list (1200 restaurants)
import { osakaLunchPages1to20 } from './tabelogOsakaLunchPages1to20.js';
import { osakaLunchPages21to40 } from './tabelogOsakaLunchPages21to40.js';
import { osakaLunchPages41to60 } from './tabelogOsakaLunchPages41to60.js';

export const tabelogOsakaLunchAll = [
  ...osakaLunchPages1to20,
  ...osakaLunchPages21to40,
  ...osakaLunchPages41to60,
].sort((a, b) => a.rank - b.rank);
