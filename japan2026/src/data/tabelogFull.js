// Comprehensive Tabelog Tokyo dataset — Top 1200 highest-rated restaurants
// Each entry: { name, rating, cuisine, station, price, lat, lng }
// Scraped from Tabelog JSON-LD geo data for real coordinates
// This is the master dataset — nearbyFinds.js is a filtered subset by day

const gmap = (name, station) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name + ' ' + (station || '') + ' Tokyo Japan')}`;

export const tabelogAll = [
  // === Page 1 (4.42 - 3.96) ===
  {name:'Tori Shiki',rating:4.42,cuisine:'Yakitori',station:'Meguro',price:'¥8,000–9,999',lat:35.63429,lng:139.71690},
  {name:'Chinese Hanten Fureika',rating:4.29,cuisine:'Chinese',station:'Azabu Juban',price:'¥6,000–19,999',lat:35.65627,lng:139.73848},
  {name:'LATURE',rating:4.26,cuisine:'French',station:'Omote Sando',price:'¥6,000–14,999',lat:35.66077,lng:139.70853},
  {name:'Tonkatsu Narikura',rating:4.26,cuisine:'Tonkatsu',station:'Minami Asagaya',price:'¥6,000–7,999',lat:35.69771,lng:139.63875},
  {name:'European Curry Tomato',rating:4.25,cuisine:'Curry',station:'Ogikubo',price:'¥2,000–2,999',lat:35.70248,lng:139.61974},
  {name:'Okashiya Ucchi',rating:4.23,cuisine:'Cake, Western sweets',station:'Kita Sando',price:'¥5,000–5,999',lat:35.67745,lng:139.70811},
  {name:'Watanabe Ryouri-mise',rating:4.19,cuisine:'Bistro, French',station:'Monzen Nakacho',price:'¥3,000–14,999',lat:35.67114,lng:139.79623},
  {name:'Homemade Ramen Muginawa',rating:4.11,cuisine:'Ramen, Tsukemen',station:'Omorikaigan',price:'¥1,000–1,999',lat:35.59079,lng:139.73281},
  {name:'Japanese Cuisine Yamazaki',rating:4.11,cuisine:'Japanese, Unagi',station:'Takaracho',price:'¥4,000–39,999',lat:35.67650,lng:139.77143},
  {name:'Don Bravo',rating:4.07,cuisine:'Italian, Pizza',station:'Kokuryo',price:'¥2,000–19,999',lat:35.64824,lng:139.55963},
  {name:'400°C Pizza TOKYO',rating:4.06,cuisine:'Pizza',station:'Ushigome Kagurazaka',price:'¥4,000–4,999',lat:35.70023,lng:139.73940},
  {name:'Biryani Osawa',rating:4.05,cuisine:'Indian',station:'Ogawamachi',price:'¥2,000–4,999',lat:35.69223,lng:139.76606},
  {name:'Raa Menya Shima',rating:4.04,cuisine:'Ramen, Tsukemen',station:'Nishi Shinjuku Gochome',price:'¥1,000–1,999',lat:35.68834,lng:139.68087},
  {name:'Chuka Soba Shibata',rating:4.01,cuisine:'Ramen',station:'Komae',price:'¥1,000–1,999',lat:35.63197,lng:139.57665},
  {name:'Watabe',rating:4.01,cuisine:'Unagi, Seafood, Japanese',station:'Kasuga',price:'¥5,000–7,999',lat:35.71133,lng:139.75208},
  {name:'Teuchi Soba Jiyu San',rating:3.99,cuisine:'Soba',station:'Higashi Nagasaki',price:'¥2,000–7,999',lat:35.72992,lng:139.67712},
  {name:'Japanese Ramen Gokan',rating:3.98,cuisine:'Ramen, Tsukemen',station:'Ikebukuro',price:'¥1,000–1,999',lat:35.73309,lng:139.71791},
  {name:'SPICY CURRY Roka',rating:3.97,cuisine:'Curry, Taiwanese',station:'Okubo',price:'¥1,000–1,999',lat:35.69870,lng:139.69773},
  {name:'Fakalo pizza gallery',rating:3.97,cuisine:'Pizza',station:'Shin Okachimachi',price:'¥6,000–7,999',lat:35.70501,lng:139.78361},
  {name:'GELATERIA ACQUOLINA',rating:3.96,cuisine:'Gelato, Ice cream',station:'Yutenji',price:'<¥999',lat:35.63802,lng:139.69105},

  // === Page 2 (3.96 - 3.90) ===
  {name:'ALDEBARAN',rating:3.96,cuisine:'Hamburger, Creative',station:'Azabu Juban',price:'¥2,000–2,999',lat:35.65382,lng:139.73530},
  {name:"L'Atelier à Ma Façon",rating:3.96,cuisine:'Sweets, Cafe',station:'Kaminoge',price:'¥4,000–5,999',lat:35.61260,lng:139.63881},
  {name:'Ginza Hachigo',rating:3.94,cuisine:'Ramen',station:'Shintomicho',price:'¥1,000–1,999',lat:35.67056,lng:139.77016},
  {name:'Shinjiko Shijimi Chuka Soba Kohaku',rating:3.94,cuisine:'Ramen',station:'Zoshiki',price:'¥1,000–1,999',lat:35.55125,lng:139.71120},
  {name:'Iruka Tokyo Roppongi',rating:3.93,cuisine:'Ramen',station:'Roppongi',price:'¥1,000–1,999',lat:35.66477,lng:139.73168},
  {name:'Katsu Pulipo',rating:3.93,cuisine:'Tonkatsu, Katsu-don',station:'Seibu Shinjuku',price:'¥4,000–8,999',lat:35.69476,lng:139.70301},
  {name:"L'atelier de Plaisir",rating:3.93,cuisine:'Bread',station:'Soshigaya Okura',price:'<¥999',lat:35.64168,lng:139.60571},
  {name:'Medika Soba Kingyo',rating:3.93,cuisine:'Ramen',station:'Manganji',price:'¥1,000–1,999',lat:35.66962,lng:139.41914},
  {name:'Sichuan Hashoku',rating:3.93,cuisine:'Sichuan',station:'Asakusa',price:'¥5,000–14,999',lat:35.71562,lng:139.80026},
  {name:'Patisserie Ryoko',rating:3.92,cuisine:'Cake, Cream Puff',station:'Takanawadai',price:'<¥999',lat:35.63502,lng:139.73280},
  {name:'Elio Locanda Italiana',rating:3.92,cuisine:'Italian',station:'Hanzomon',price:'¥3,000–14,999',lat:35.68351,lng:139.74067},
  {name:"Trattoria e Pizzeria L'ARTE",rating:3.92,cuisine:'Italian, Pizza',station:'Sangen Jaya',price:'¥3,000–8,999',lat:35.64305,lng:139.67243},
  {name:'Tonkatsu Nanaido',rating:3.92,cuisine:'Tonkatsu',station:'Gaienmae',price:'¥2,000–2,999',lat:35.67183,lng:139.71381},
  {name:'Soba Osame',rating:3.92,cuisine:'Soba',station:'Mejiro',price:'¥5,000–5,999',lat:35.72263,lng:139.70101},
  {name:'The Bvlgari Bar',rating:3.92,cuisine:'Bar',station:'Tokyo',price:'¥6,000–14,999',lat:35.67914,lng:139.76918},
  {name:'pizzeria fabbrica 1090',rating:3.92,cuisine:'Pizza',station:'Ontakesan',price:'¥1,000–4,999',lat:35.58509,lng:139.68138},
  {name:'Chuka Soba Tagano',rating:3.91,cuisine:'Ramen, Tsukemen',station:'Ebara Nakanobu',price:'<¥999',lat:35.60972,lng:139.71157},
  {name:'Miyawaki',rating:3.91,cuisine:'Japanese Cuisine',station:'Akabanebashi',price:'¥5,000–19,999',lat:35.65453,lng:139.74396},
  {name:'Yaesu unagi hashimoto',rating:3.91,cuisine:'Unagi',station:'Nihombashi',price:'¥5,000–14,999',lat:35.68166,lng:139.77129},
  {name:'Motenashi Kuroki',rating:3.90,cuisine:'Ramen',station:'Asakusabashi',price:'¥1,000–1,999',lat:35.69800,lng:139.78546},

  // Pages 3-7 data will be appended as agents complete...
].map(r => ({ ...r, mapUrl: gmap(r.name, r.station) }));
