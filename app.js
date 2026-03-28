// ============================================================
// JAPAN 2026 TRIP PLANNER - App Logic
// ============================================================

const SHEET_ID = '1N_V9v7uKz3hXRQSnVNaaeAJO7vgU-GdnE5Pisln6C1A';

// ==================== DATA ====================

const DATA = {
  travelers: [
    { name: 'AO (Adrian)', rsvp: 'yes', allergies: '', email: 'adrianortega789@gmail.com', age: 28 },
    { name: 'Angel', rsvp: 'yes', allergies: 'Fuzzy fruit', email: 'lee.angel219@gmail.com', age: 28 },
    { name: 'Ant (Antonio)', rsvp: 'yes', allergies: '', email: 'abountouvas@gmail.com', age: 27 },
    { name: 'Dami', rsvp: 'yes', allergies: 'Korean Melon, cats', email: 'ekal2646@gmail.com', age: 28 },
    { name: 'McG (Briana)', rsvp: 'yes', allergies: '', email: 'brianamcgg12@gmail.com', age: 27 },
    { name: 'Pawan', rsvp: 'yes', allergies: 'Cats', email: 'nycpawan@gmail.com', age: 27 },
    { name: 'Ken', rsvp: 'yes', allergies: 'Nuts and nuts adjacent', email: 'kends14@gmail.com', age: 27 },
    { name: 'Garny', rsvp: 'yes', allergies: '', email: 'Ggauthier98@gmail.com', age: 28 },
    { name: 'Jonathan', rsvp: 'yes', allergies: '', email: 'Jomi2092@gmail.com', age: 27 },
    { name: 'Manar', rsvp: 'yes', allergies: '', email: 'ManarBarghash12@gmail.com', age: 22 },
  ],

  tasks: [
    { status: 'done', task: 'Book Flights' },
    { status: 'done', task: 'Narrow down locations' },
    { status: 'done', task: 'Make an Instagram group for sending stuff' },
    { status: '', task: 'Research Osaka/Kyoto neighborhoods/accommodations' },
    { status: 'done', task: 'Tokyo timeline' },
    { status: 'pending', task: 'Hotel location and booking' },
    { status: 'done', task: 'Download Google Maps' },
    { status: 'done', task: 'Download Google Translate or Kuli Kuli' },
    { status: '', task: 'Download Suica / Put it in Apple Wallet' },
    { status: '', task: 'Optional DeepL for English \u2192 Japanese translation' },
    { status: 'done', task: 'Check passport expiration date' },
    { status: '', task: 'Visa/Immigration (Visit Japan Web)' },
    { status: 'done', task: 'Book Tokyo hotel' },
    { status: 'done', task: 'Decide on how many days for Osaka (3 days)' },
    { status: 'done', task: 'Decide on how many days for Kyoto (2 days)' },
    { status: 'done', task: 'Email hotel for check-in' },
    { status: 'done', task: 'Book hotels for Osaka' },
    { status: '', task: 'Discuss onsens (Briana, Garny + friend, Ken, Angel, Adrian interested)' },
    { status: 'done', task: 'Discuss which neighborhood to stay in for Tokyo hotel' },
    { status: 'done', task: 'Book return Tokyo hotel' },
    { status: 'done', task: 'Book same Tokyo hotel for July 11-15' },
    { status: '', task: 'Look for Jazz club/bars for Tokyo' },
    { status: '', task: 'Book train from Tokyo \u2192 Osaka' },
    { status: '', task: 'Discuss Group Events' },
    { status: '', task: 'Kimonos' },
    { status: '', task: 'Round1 Spocha' },
    { status: '', task: 'Sensoji Temple' },
    { status: '', task: 'Hikiniku to Come' },
    { status: '', task: 'Tsukiji' },
    { status: '', task: 'Shinkansen tickets (book 3 months in advance)' },
    { status: '', task: 'Jazz place' },
    { status: '', task: 'Pancakes' },
  ],

  links: [
    { url: 'https://www.klook.com/en-US/', label: 'Klook', desc: 'Tours & tickets' },
    { url: 'https://japancheapo.com/events/july/', label: 'Japan Cheapo', desc: 'July events' },
    { url: 'https://www.tokyometro.jp/lang_en/station/akasaka-mitsuke/index.html', label: 'Tokyo Metro - Akasaka-Mitsuke', desc: '3D Map of Metro Stations' },
    { url: 'https://www.kuronekoyamato.co.jp/ytc/en/send/preparations/invoice/', label: 'Kuroneko Yamato', desc: 'Shipping / luggage forwarding' },
    { url: 'https://services.digital.go.jp/en/visit-japan-web/', label: 'Visit Japan Web', desc: 'Visa / Immigration portal' },
  ],

  notes: [
    'Trains stop running around midnight (some as early as 11:30pm) & resume at 5am',
    'Hotel: OMO3 Tokyo Akasaka by Hoshino Resorts \u2014 4-3-2 Akasaka, Minato-ku, Tokyo',
    'Flight: JL3 from JFK, arrives HND ~4:40am July 11',
    'Return flight: JL7010, departs 5:45pm July 25',
    'Shinkansen tickets are booked 3 months in advance',
  ],

  timeline: [
    {
      day: 0, date: 'July 9\u201310', dayOfWeek: 'Wed\u2013Thu', location: 'Flight',
      notes: 'Flight to Japan \u2014 JFK 1:30am (JL3)',
      schedule: [
        { time: '7:00 PM', activity: 'Leave for Airport', type: 'transport' },
        { time: '1:30 AM', activity: 'Flight departs JFK (JL3)', type: 'transport' },
      ]
    },
    {
      day: 1, date: 'July 11', dayOfWeek: 'Saturday', location: 'Tokyo',
      notes: 'Arrival day \u2014 Akasaka area',
      schedule: [
        { time: '4:40 AM', activity: 'Flight arrives at Haneda (HND)', type: 'transport' },
        { time: '5:30 AM', activity: 'Tokyo Monorail \u2192 Yamanote Line \u2192 Ginza Line to Akasaka-Mitsuke Station', type: 'transport' },
        { time: '6:00 PM', activity: 'Group activity', type: 'group' },
      ]
    },
    {
      day: 2, date: 'July 12', dayOfWeek: 'Sunday', location: 'Tokyo',
      notes: 'Shibuya / Harajuku / Yoyogi Park',
      schedule: [
        { time: '6:00 AM', activity: 'Line up for Hikiniku to Come', type: 'food' },
        { time: '11:00 AM', activity: 'AMAM DACOTAN bakery', type: 'food' },
        { time: '12:00 PM', activity: 'SOU\u00b7SOU KYOTO Aoyama', type: 'shopping' },
        { time: '1:00 PM', activity: 'Yoyogi Park walk to lunch', type: 'site' },
        { time: '1:30 PM', activity: 'Meiji Jingu Gyoen', type: 'site' },
        { time: '2:00 PM', activity: 'Meiji Jingu Shrine', type: 'site' },
        { time: '3:00 PM', activity: 'Mukai (kaisendon) lunch + Nata de Cristiano', type: 'food' },
        { time: '4:00 PM', activity: 'DULTON Jinnan Shop', type: 'shopping' },
        { time: '5:00 PM', activity: 'Tower Records Shibuya', type: 'shopping' },
        { time: '6:00 PM', activity: 'Hikiniku to Come (GROUP DINNER)', type: 'group' },
        { time: '7:30 PM', activity: 'BEAMS JAPAN SHIBUYA', type: 'shopping' },
        { time: '9:00 PM', activity: 'MEGA Don Quijote', type: 'shopping' },
      ]
    },
    {
      day: 3, date: 'July 13', dayOfWeek: 'Monday', location: 'Tokyo',
      notes: 'Asakusa / Kappabashi',
      schedule: [
        { time: '7:00 AM', activity: 'Sens\u014d-ji Temple', type: 'site' },
        { time: '8:30 AM', activity: 'FEBRUARY COFFEE ROASTERY', type: 'food' },
        { time: '10:30 AM', activity: 'Asakusa Unana (eel snack)', type: 'food' },
        { time: '11:00 AM', activity: 'Kama Asa (knives)', type: 'shopping' },
        { time: '12:00 PM', activity: 'Honke-Kaneso (knives)', type: 'shopping' },
        { time: '12:30 PM', activity: 'Kamawanu Asakusa Shop', type: 'shopping' },
        { time: '1:30 PM', activity: 'Homemade Noodles Billiken (or Noriaki Bibi) or Kibun Sushi', type: 'food' },
        { time: '2:30 PM', activity: 'Kaminarimon Gate', type: 'site' },
        { time: '3:00 PM', activity: 'OMO3 nap / rest', type: 'rest' },
      ]
    },
    {
      day: 4, date: 'July 14', dayOfWeek: 'Tuesday', location: 'Tokyo',
      notes: 'G\u014dtokuji (AM) + Shinjuku (PM)',
      schedule: [
        { time: '7:00 AM', activity: 'Akasaka st \u2192 Yoyogi Uehara st \u2192 G\u014dtokuji st (40min)', type: 'transport' },
        { time: '7:30 AM', activity: 'Manekineko Statue (at G\u014dtokuji station)', type: 'site' },
        { time: '8:00 AM', activity: 'G\u014dtokuji Temple (cat shrine)', type: 'site' },
        { time: '9:00 AM', activity: 'IRON COFFEE', type: 'food' },
        { time: '9:30 AM', activity: 'Breakfast', type: 'food' },
        { time: '10:00 AM', activity: '\u30c9\u30f3\u30ad\u306e\u6642\u9593 (shop)', type: 'shopping' },
        { time: '11:00 AM', activity: 'RARASAND (cat shaped taiyaki)', type: 'food' },
        { time: '1:30 PM', activity: 'Shinjuku Gyoen National Garden', type: 'site' },
        { time: '3:00 PM', activity: 'OMO3 nap / rest', type: 'rest' },
        { time: '5:00 PM', activity: 'Hanazono Shrine', type: 'site' },
        { time: '7:00 PM', activity: 'Dinner', type: 'food' },
        { time: '9:30 PM', activity: 'Jazz bar?', type: 'activity' },
      ]
    },
    {
      day: 5, date: 'July 15', dayOfWeek: 'Wednesday', location: 'Tokyo',
      notes: 'Sarugakucho (AM) + Shibuya (PM)',
      schedule: [
        { time: '11:00 AM', activity: 'Kamawanu (tenugui) shop', type: 'shopping' },
        { time: '11:30 AM', activity: 'NUMBER SUGAR Daikanyama', type: 'shopping' },
        { time: '3:00 PM', activity: 'OMO3 nap / rest', type: 'rest' },
      ]
    },
    {
      day: 6, date: 'July 16', dayOfWeek: 'Thursday', location: 'Tokyo \u2192 Osaka',
      notes: 'Travel day \u2014 half day Osaka',
      schedule: []
    },
    {
      day: 7, date: 'July 17', dayOfWeek: 'Friday', location: 'Osaka',
      notes: '',
      schedule: []
    },
    {
      day: 8, date: 'July 18', dayOfWeek: 'Saturday', location: 'Osaka',
      notes: '',
      schedule: []
    },
    {
      day: 9, date: 'July 19', dayOfWeek: 'Sunday', location: 'Kyoto Day Trip',
      notes: '',
      schedule: [
        { time: '6:30 AM', activity: 'Train to Kyoto', type: 'transport' },
        { time: '7:00 AM', activity: 'Fushimi Inari (group)', type: 'group' },
        { time: '8:00 AM', activity: 'Breakfast', type: 'food' },
        { time: '10:00 AM', activity: 'Indigo dye class', type: 'activity' },
        { time: '1:30 PM', activity: 'Lunch', type: 'food' },
      ]
    },
    {
      day: 10, date: 'July 20', dayOfWeek: 'Monday', location: 'Kyoto Day Trip',
      notes: '',
      schedule: []
    },
    {
      day: 11, date: 'July 21', dayOfWeek: 'Tuesday', location: 'Osaka',
      notes: '',
      schedule: []
    },
    {
      day: 12, date: 'July 22', dayOfWeek: 'Wednesday', location: 'Tokyo',
      notes: 'Pit stop in Hakone?',
      schedule: [
        { time: '8:00 AM', activity: 'Fish Market Tsukiji', type: 'food' },
      ]
    },
    {
      day: 13, date: 'July 23', dayOfWeek: 'Thursday', location: 'Tokyo',
      notes: 'Ginza',
      schedule: [
        { time: '9:00 AM', activity: 'Glitch Coffee and Roasters GINZA', type: 'food' },
        { time: '10:30 AM', activity: 'ISHIYA G GINZA SIX (sweet shop)', type: 'shopping' },
        { time: '11:30 AM', activity: 'Ginza Hachigou (ramen)', type: 'food' },
      ]
    },
    {
      day: 14, date: 'July 24', dayOfWeek: 'Friday', location: 'Tokyo',
      notes: 'Shopping day!',
      schedule: [
        { time: '10:00 AM', activity: 'Bic Camera Akasaka', type: 'shopping' },
      ]
    },
    {
      day: 15, date: 'July 25', dayOfWeek: 'Saturday', location: 'Departure',
      notes: 'Fly home',
      schedule: [
        { time: '5:45 PM', activity: 'Flight home (JL7010)', type: 'transport' },
      ]
    },
  ],

  food: [
    // KYOTO
    { name: 'Adrian', category: 'Egg Sandwich', details: 'Ninuki \u2014 Ran by an egg sommelier', location: 'Kyoto', neighborhood: 'Shimogyo', notes: '', link: '', interested: '' },
    { name: 'Adrian', category: 'Tempura Omakase', details: 'Tempura Endo Yasaka Gion', location: 'Kyoto', neighborhood: '', notes: '', link: '', interested: '' },
    { name: 'Adrian', category: 'Wagyu Omakase', details: 'Wagyu Ryotei Bungo Gion', location: 'Kyoto', neighborhood: '', notes: '', link: '', interested: '' },
    { name: 'Adrian', category: 'Ramen', details: 'Men-ya Inoichi (Michelin Bib)', location: 'Kyoto', neighborhood: '', notes: '', link: '', interested: '' },
    { name: 'Angel', category: 'Ramen', details: 'Men-ya Inoichi', location: 'Kyoto', neighborhood: '', notes: '', link: 'https://maps.app.goo.gl/p936hQYiSWvZGvC18', interested: 'Briana, Pawan' },
    { name: 'Briana', category: 'Curry', details: 'CLAY POT CURRY OHMIYA', location: 'Kyoto', neighborhood: '', notes: '', link: '', interested: '' },
    { name: 'Briana', category: 'Ramen', details: 'Sugari', location: 'Kyoto', neighborhood: '', notes: '', link: '', interested: '' },
    { name: 'Briana', category: 'Ramen', details: 'Yamazaki Menjiro', location: 'Kyoto', neighborhood: '', notes: '', link: '', interested: '' },
    { name: 'Briana', category: 'Tempura', details: 'Kyoboshi', location: 'Kyoto', neighborhood: '', notes: 'Michelin rated, needs reservation. Smart casual dress code.', link: '', interested: '' },
    { name: 'Briana', category: 'Wine Bar', details: 'Howene', location: 'Kyoto', neighborhood: '', notes: 'Hard to get seat, not ideal for group', link: '', interested: '' },
    { name: 'Briana', category: 'Wine Bar', details: 'Kumano Winehouse', location: 'Kyoto', neighborhood: '', notes: 'Hard to get seat, not ideal for group', link: '', interested: '' },
    { name: 'Briana', category: 'Coffee', details: 'WEEKENDERS COFFEE TOMINOKOJI', location: 'Kyoto', neighborhood: '', notes: 'Open at 7:30am!', link: '', interested: '' },
    { name: 'Briana', category: 'Coffee', details: 'S\u00f6t Coffee Kyoto Shichijo', location: 'Kyoto', neighborhood: '', notes: '', link: '', interested: '' },
    { name: 'Briana', category: 'Coffee', details: 'Coffee Stand ReUnion Arashiyama', location: 'Kyoto', neighborhood: '', notes: '', link: '', interested: '' },
    { name: 'Briana', category: 'Izakaya', details: 'Ashioto', location: 'Kyoto', neighborhood: '', notes: '', link: '', interested: '' },
    { name: 'Briana', category: 'Set Meal', details: 'Arashiyama Itsukichaya', location: 'Kyoto', neighborhood: '', notes: 'Breakfast/lunch with a view of the river', link: '', interested: '' },
    { name: 'Briana', category: 'Soba', details: 'Saryo Tesshin', location: 'Kyoto', neighborhood: '', notes: '', link: '', interested: '' },
    { name: 'Briana', category: 'Noodles', details: 'Gion Duck Noodles', location: 'Kyoto', neighborhood: '', notes: '', link: '', interested: '' },
    { name: 'Briana', category: 'Soba', details: '\u5fa1æ\u89aa \u98a8\u5473\u305d\u3070\u3000\u624b\u6253\u3061\u854a\u9ea6\u30fb\u8c37\u8d8a', location: 'Kyoto', neighborhood: '', notes: 'Reservation needed, call 075-744-1216', link: '', interested: '' },
    { name: 'Pawan', category: 'Curry', details: 'Shinrin Shokudo', location: 'Kyoto', neighborhood: '', notes: '', link: '', interested: '' },
    { name: 'Pawan', category: 'Sweets', details: 'Shogetsu', location: 'Kyoto', neighborhood: '', notes: '', link: '', interested: '' },
    { name: 'Pawan', category: 'Oxtail Stew', details: 'Yassan', location: 'Kyoto', neighborhood: '', notes: 'Known for oxtail stew', link: '', interested: '' },
    // KYOTO/TOKYO
    { name: 'Adrian', category: 'Hamburger', details: 'Hikiniku to Come', location: 'Kyoto/Tokyo', neighborhood: '', notes: 'Hamburg patty place. Priority tickets (1,000 yen/seat) released on 1st of each month. Reserve 8 days to 2 months in advance.', link: 'https://hikinikutocome.com/en/visit', interested: 'Briana, Angel, Antonio, Dami, Pawan' },
    // OSAKA
    { name: 'Adrian', category: 'Takoyaki', details: 'Takoyaki-Juhachiban Sons \u2014 Dotonbori (11am\u20139pm)', location: 'Osaka', neighborhood: 'Dotonbori', notes: '', link: '', interested: 'Briana' },
    { name: 'Adrian', category: 'Gyoza', details: '551 Horai', location: 'Osaka', neighborhood: '', notes: '', link: '', interested: 'Briana' },
    { name: 'Adrian', category: 'Pork Bun', details: '551 Horai', location: 'Osaka', neighborhood: '', notes: '', link: '', interested: 'Briana' },
    { name: 'Adrian', category: 'Beef Tongue', details: 'Beef Lemon Nanba', location: 'Osaka', neighborhood: '', notes: '', link: '', interested: '' },
    { name: 'Adrian', category: 'Oyakodon', details: '\u81ea\u7136\u3068\u304a\u3073 green \u2014 Signature chicken & egg on rice', location: 'Osaka', neighborhood: '', notes: '', link: '', interested: '' },
    { name: 'Angel', category: 'Eel / Tamago', details: 'Izumo Unagi', location: 'Osaka', neighborhood: '', notes: '', link: 'https://maps.app.goo.gl/P5U4vE3FPKSK4yd48', interested: '' },
    { name: 'Briana', category: 'BBQ', details: 'Yakiniku Nikubei', location: 'Osaka', neighborhood: '', notes: '', link: '', interested: '' },
    { name: 'Briana', category: 'Ramen', details: 'Chicken Ramen (Ginza Kagari Lucua / Niwatori)', location: 'Osaka', neighborhood: '', notes: '', link: '', interested: '' },
    { name: 'Briana', category: 'Katsu', details: 'Gyukatsu Motomura Dotonbori', location: 'Osaka', neighborhood: '', notes: '', link: '', interested: '' },
    { name: 'Briana', category: 'Katsu', details: 'New Babe Toyosaki', location: 'Osaka', neighborhood: '', notes: '', link: '', interested: '' },
    { name: 'Briana', category: 'Ramen', details: 'Maru de Sankaku', location: 'Osaka', neighborhood: '', notes: '', link: '', interested: '' },
    { name: 'Briana', category: 'Misc.', details: 'Shokudo Akari', location: 'Osaka', neighborhood: '', notes: '', link: '', interested: '' },
    { name: 'Briana', category: 'Coffee', details: 'Sanwa Coffee Works Lucua 1100', location: 'Osaka', neighborhood: '', notes: '', link: '', interested: '' },
    { name: 'Briana', category: 'Coffee', details: 'LiLo Coffee Roasters', location: 'Osaka', neighborhood: '', notes: '', link: '', interested: '' },
    { name: 'Briana', category: 'Taiyaki', details: 'Naruto Taiyaki Honpo Sonezaki', location: 'Osaka', neighborhood: '', notes: '', link: '', interested: '' },
    { name: 'Pawan', category: 'Takoyaki', details: 'Ichifuku \u2014 mom & pop place with a twist. Also: Takoyaki Wanaka Dotonbori', location: 'Osaka', neighborhood: '', notes: '', link: '', interested: '' },
    { name: 'Pawan', category: 'Tempura', details: 'Tempura no Yama (Minoh Main Shop)', location: 'Osaka', neighborhood: '', notes: 'Ridiculously good tempura, popular with locals', link: '', interested: '' },
    { name: 'Pawan', category: 'Cafe', details: 'ARABIYA', location: 'Osaka', neighborhood: '', notes: '', link: '', interested: '' },
    { name: 'Pawan', category: 'Crepes', details: 'Creperie Alcyon', location: 'Osaka', neighborhood: '', notes: '', link: '', interested: '' },
    { name: 'Pawan', category: 'Ramen', details: 'Men no Youji', location: 'Osaka', neighborhood: '', notes: '', link: '', interested: '' },
    // TOKYO
    { name: 'Adrian', category: 'Beef Steak Bowl', details: 'Nippon no Y\u014dshoku Akasaka Tsutsui', location: 'Tokyo', neighborhood: 'Akasaka', notes: '', link: '', interested: '' },
    { name: 'Adrian', category: 'Japanese BBQ', details: 'Akasaka Raimon', location: 'Tokyo', neighborhood: 'Akasaka', notes: 'Cash Only. Reservation Only. 13 Counter Seats.', link: 'https://tabelog.com/en/tokyo/A1308/A130801/13224635/', interested: 'Briana, Pawan' },
    { name: 'Adrian', category: 'Okonomiyaki', details: 'Giraffa Asakusa (10am\u20136pm)', location: 'Tokyo', neighborhood: 'Asakusa', notes: 'Kare Pan style', link: '', interested: '' },
    { name: 'Adrian', category: 'Sweet Potato', details: 'Imo Pippi Asakusa Ten', location: 'Tokyo', neighborhood: 'Asakusa', notes: 'Purple potato ice cream & baked sweet potato brulee', link: '', interested: '' },
    { name: 'Adrian', category: 'Ice Cream', details: 'Hokkaido Milk Bar', location: 'Tokyo', neighborhood: 'Asakusa', notes: 'M-F 10am\u20135pm, S-S 9:30am\u20136pm', link: '', interested: '' },
    { name: 'Adrian', category: 'Pancake', details: 'Benitsuru Pancake (9:30am\u20134:30pm)', location: 'Tokyo', neighborhood: 'Asakusa', notes: 'Go early morning. Need to pre-pay.', link: '', interested: 'Angel' },
    { name: 'Adrian', category: 'Japanese BBQ', details: 'Ebisu Yoroniku (4.24 Tabelog)', location: 'Tokyo', neighborhood: 'Ebisu', notes: '', link: '', interested: '' },
    { name: 'Adrian', category: 'Eel', details: 'Anagoya Ginza Hirai', location: 'Tokyo', neighborhood: 'Ginza', notes: 'Mon CLOSED. Tue\u2013Sun 11:30am\u20132:30pm, 5:30pm\u20139pm', link: '', interested: '' },
    { name: 'Angel', category: 'Dessert', details: 'age.3 \u2014 Deep fried sandwich w/ cream', location: 'Tokyo', neighborhood: 'Ginza', notes: '', link: 'https://maps.app.goo.gl/Ki2AEdVnfuNAxMy49', interested: '' },
    { name: 'Adrian', category: 'Egg Sandwich', details: 'Chermside Sandwich Harajuku', location: 'Tokyo', neighborhood: 'Harajuku', notes: '', link: '', interested: '' },
    { name: 'Adrian', category: 'Ramen', details: 'Iruca Tokyo \u2014 truffle & porcini ramen with wontons', location: 'Tokyo', neighborhood: 'Roppongi', notes: '', link: '', interested: 'Briana' },
    { name: 'Adrian', category: 'Tempura', details: 'Tempura Kakiage Yukimura', location: 'Tokyo', neighborhood: 'Shinbashi', notes: '', link: '', interested: '' },
    { name: 'Adrian', category: 'Tonkatsu', details: 'Kurobuta Tonkatsu Hori Ichi', location: 'Tokyo', neighborhood: 'Shinbashi', notes: '', link: '', interested: '' },
    { name: 'Adrian', category: 'Katsu-don', details: 'Katsu Pulipo (3.98 Tabelog)', location: 'Tokyo', neighborhood: 'Shinjuku', notes: '', link: 'https://tabelog.com/en/tokyo/A1304/A130401/13264309/', interested: '' },
    { name: 'Adrian', category: 'Ramen', details: 'Tatsunoya \u2014 tonkatsu ramen', location: 'Tokyo', neighborhood: 'Shinjuku', notes: '', link: '', interested: '' },
    { name: 'Adrian', category: 'Ramen', details: 'Raa Men Kuro Uzu', location: 'Tokyo', neighborhood: 'Shinjuku', notes: '', link: '', interested: '' },
    { name: 'Adrian', category: 'Wagyu Omakase', details: 'Sumibi Yakiniku Nakahara', location: 'Tokyo', neighborhood: '', notes: '', link: '', interested: '' },
    { name: 'Angel', category: 'Tsukemen', details: 'Tatsunoya Ramen', location: 'Tokyo', neighborhood: '', notes: 'Counter seating, not ideal for big group', link: 'https://maps.app.goo.gl/JQFEDE7BNXP2vdLi6', interested: '' },
    { name: 'Angel', category: 'Hamburg Omelette Rice', details: 'Ikura Shibuya', location: 'Tokyo', neighborhood: '', notes: '', link: 'https://maps.app.goo.gl/s3Bz9iokcV7pEeQo9', interested: '' },
    { name: 'Briana', category: 'Bakery', details: 'AMAM DACOTAN', location: 'Tokyo', neighborhood: '', notes: '', link: '', interested: '' },
    { name: 'Briana', category: 'Eel', details: 'Unagi onigiri \u2014 grilled eel @ Asakusa Unana / Murakami', location: 'Tokyo', neighborhood: '', notes: 'Near Senso-ji, take out', link: '', interested: '' },
    { name: 'Briana', category: 'Katsu', details: 'Butagumi', location: 'Tokyo', neighborhood: '', notes: '', link: '', interested: '' },
    { name: 'Briana', category: 'Katsu', details: 'Tonkatsu Hajime Nihonbashi', location: 'Tokyo', neighborhood: '', notes: '', link: '', interested: '' },
    { name: 'Briana', category: 'Sushi', details: 'Senryo Sushi', location: 'Tokyo', neighborhood: '', notes: '', link: '', interested: '' },
    { name: 'Briana', category: 'Sushi', details: 'Sushi Mizukami', location: 'Tokyo', neighborhood: '', notes: '', link: '', interested: '' },
    { name: 'Briana', category: 'Sushi', details: 'Tsukijisushiko Sohonten', location: 'Tokyo', neighborhood: '', notes: '', link: '', interested: '' },
    { name: 'Briana', category: 'Tempura', details: 'Doteno Iseya (also Kuramae Iseya, Udon Kanekohannosuke)', location: 'Tokyo', neighborhood: '', notes: '', link: '', interested: '' },
    { name: 'Briana', category: 'Misc.', details: 'Uso \u2014 misc. daily menu', location: 'Tokyo', neighborhood: '', notes: '', link: '', interested: '' },
    { name: 'Briana', category: 'Coffee', details: 'SHI-TEN Coffee', location: 'Tokyo', neighborhood: '', notes: '', link: '', interested: '' },
    { name: 'Briana', category: 'Coffee', details: 'Glitch Coffee and Roasters GINZA', location: 'Tokyo', neighborhood: '', notes: '', link: '', interested: '' },
    { name: 'Briana', category: 'Noodles', details: 'Saiwaiken \u2014 Chinese noodles, popular with locals', location: 'Tokyo', neighborhood: '', notes: 'Cash. No English. Small.', link: '', interested: '' },
    { name: 'Briana', category: 'Ramen', details: 'Paik\u014d TanTan Gonoi \u2014 tantan ramen', location: 'Tokyo', neighborhood: '', notes: '', link: '', interested: '' },
    { name: 'Briana', category: 'Ramen', details: 'Ch\u016bkasoba Katsumoto', location: 'Tokyo', neighborhood: '', notes: 'Cash', link: '', interested: '' },
    { name: 'Briana', category: 'Ramen', details: 'RaMen TOMO TOKYO \u2014 duck ramen', location: 'Tokyo', neighborhood: '', notes: '', link: '', interested: '' },
    { name: 'Briana', category: 'Ramen', details: 'R\u0101menya Shima', location: 'Tokyo', neighborhood: '', notes: 'Must reserve day before online, seats gone in 4-5 min', link: '', interested: '' },
    { name: 'Briana', category: 'Pastry', details: 'CANEL\u00c9 du JAPON Nagahori-shop', location: 'Tokyo', neighborhood: '', notes: '', link: '', interested: '' },
    { name: 'Pawan', category: 'Pancake', details: 'Happy Pancake', location: 'Tokyo', neighborhood: '', notes: 'Fluffy pancake', link: '', interested: 'Angel' },
    { name: 'Pawan', category: 'JBBQ', details: 'JBBQ ($150 option)', location: 'Tokyo', neighborhood: '', notes: '', link: '', interested: 'Briana' },
    { name: 'Pawan', category: 'JBBQ', details: 'JBBQ ($60 option)', location: 'Tokyo', neighborhood: '', notes: '', link: '', interested: 'Briana' },
    { name: 'Pawan', category: 'Ramen', details: '#4 rated ramen in Tokyo', location: 'Tokyo', neighborhood: '', notes: 'Reservation only \u2014 accepted from 10:00 AM every Sunday for the following week', link: '', interested: '' },
    { name: 'Pawan', category: 'Ramen', details: '#1 rated ramen in Tokyo', location: 'Tokyo', neighborhood: '', notes: 'Reservations via TableCheck, midnight one week prior. Walk-in: 9AM, ~10-15 seats', link: '', interested: '' },
    { name: 'Pawan', category: 'Ramen', details: '#5 rated ramen in Tokyo', location: 'Tokyo', neighborhood: '', notes: '', link: '', interested: '' },
    { name: 'Pawan', category: 'Ramen', details: 'S\u014dsakumen K\u014db\u014d Nakiry\u016b', location: 'Tokyo', neighborhood: '', notes: '', link: '', interested: '' },
    { name: 'Pawan', category: 'Ramen', details: 'Honda Tokyo Noodle Works', location: 'Tokyo', neighborhood: '', notes: '', link: '', interested: '' },
    { name: 'Pawan', category: 'Shabu Shabu', details: 'Zakuro Ginza', location: 'Tokyo', neighborhood: '', notes: '', link: '', interested: '' },
    { name: 'Pawan', category: 'Shabu Shabu', details: 'Matsuzakagyu Yoshida', location: 'Tokyo', neighborhood: '', notes: '', link: '', interested: '' },
    { name: 'Pawan', category: 'JBBQ', details: 'Yakiniku Kosen (cheaper, 4.36 Tabelog)', location: 'Tokyo', neighborhood: '', notes: '', link: 'https://tabelog.com/en/tokyo/A1324/A132403/13133997/', interested: '' },
    // MISC LOCATION
    { name: 'Adrian', category: 'Taiyaki', details: 'Osaka Naniwaya (shaved ice too)', location: 'Osaka', neighborhood: '', notes: 'M/Tu/F 12\u20139pm, Sat 11am\u20139pm, Sun 11am\u20136pm', link: '', interested: 'Briana' },
    { name: 'Adrian', category: 'Ice Cream', details: 'Hokkyoku Nanba Honten', location: 'Osaka', neighborhood: '', notes: '', link: '', interested: 'Briana' },
    { name: 'Briana', category: 'Okonomiyaki', details: 'Tsuruhashi Fugetsu / Gion Danran / Sogetsu / CHIBO / Torebon', location: '', neighborhood: '', notes: '', link: '', interested: '' },
    { name: 'Briana', category: 'Coffee', details: 'FEBRUARY COFFEE ROASTERY', location: '', neighborhood: '', notes: '', link: '', interested: '' },
    { name: 'Briana', category: 'Coffee', details: 'Mejicafe', location: '', neighborhood: '', notes: '', link: '', interested: '' },
    { name: 'Briana', category: 'Plum Wine', details: 'Plum wine class \u2014 Choya Ume Studio', location: 'Kyoto', neighborhood: '', notes: '40 min, ~$50', link: '', interested: '' },
    { name: 'Briana', category: 'Bar', details: 'Bar Banten', location: 'Tokyo', neighborhood: 'Shibuya', notes: '', link: '', interested: '' },
    { name: 'Adrian', category: 'Pizza', details: 'Pizza', location: 'Tokyo', neighborhood: 'Ebisu', notes: '', link: '', interested: '' },
    { name: 'Angel', category: 'Fruits', details: 'Expensive fruits', location: '', neighborhood: '', notes: '', link: '', interested: 'Briana, Pawan' },
    { name: 'Adrian', category: 'Bakery', details: 'Maruki Bakery', location: '', neighborhood: '', notes: '', link: '', interested: '' },
  ],

  activities: [
    { name: 'Adrian', category: 'Activity', details: 'National Art Museum, Osaka', location: 'Osaka', notes: '', link: '', interested: 'Ken, Jonathan, P' },
    { name: 'Adrian', category: 'Activity', details: 'Kimonos / Yukata', location: '', notes: '', link: '', interested: 'Angel, Ken, Jonathan' },
    { name: 'Adrian', category: 'Shopping', details: "Traveler's Company Store", location: '', notes: '', link: '', interested: 'Angel' },
    { name: 'Adrian', category: 'Shopping', details: 'Sori Yanagi Store', location: '', notes: '', link: '', interested: '' },
    { name: 'Adrian', category: 'Shopping', details: 'Barbour Store', location: '', notes: '', link: '', interested: '' },
    { name: 'Adrian', category: 'Shopping', details: 'Nishikawa Shinsaibashi \u2014 Custom pillow', location: '', notes: '', link: '', interested: 'Angel' },
    { name: 'Adrian', category: 'Cameras', details: "Kitamura Kamera'", location: '', notes: '', link: '', interested: '' },
    { name: 'Adrian', category: 'Cameras', details: 'Lemonsha', location: '', notes: '', link: '', interested: '' },
    { name: 'Adrian', category: 'Cameras', details: 'Map Camera', location: '', notes: '', link: '', interested: '' },
    { name: 'Adrian', category: 'Cameras', details: '5 Star Camera', location: '', notes: '', link: '', interested: '' },
    { name: 'Adrian / Angel', category: 'Overnight', details: 'Hakone \u2014 Possible overnight onsen', location: 'Hakone', notes: '', link: 'https://tokyocheapo.com/travel/holidays/hakone-day-trip-guide/', interested: 'Briana' },
    { name: 'Angel', category: 'Day Trip', details: 'Kamakura beach town day trip', location: 'Kamakura', notes: '', link: '', interested: 'Antonio, Dami, Adrian, Pawan, Briana' },
    { name: 'Angel', category: 'Site', details: 'Katsuoji + Minoh Falls \u2014 Daruma Shrine', location: 'Osaka', notes: '', link: 'https://maps.app.goo.gl/eMSbmphyY3XCgN826', interested: 'Antonio, Dami' },
    { name: 'Angel', category: 'Activity', details: 'Sokichi \u2014 Edo Kiriko Glass Cutting', location: 'Tokyo', notes: '', link: '', interested: 'Briana, Antonio, Dami' },
    { name: 'Antonio', category: 'Sites', details: 'Nakamise Street', location: 'Enoshima', notes: '', link: '', interested: 'Jonathan, Ken' },
    { name: 'Antonio', category: 'Sites', details: 'Hestunomiya Shrine', location: 'Enoshima', notes: '', link: '', interested: '' },
    { name: 'Antonio', category: 'Sites', details: 'Enoshima Iwaya Caves', location: 'Enoshima', notes: '', link: '', interested: '' },
    { name: 'Antonio', category: 'Sites', details: 'Enoden Train', location: 'Enoshima', notes: '', link: '', interested: '' },
    { name: 'Antonio', category: 'Shopping', details: 'Getting glasses', location: 'Tokyo', notes: '', link: '', interested: 'Ken, Briana' },
    { name: 'Antonio', category: 'Sites', details: 'Kurazukuri Street', location: 'Kawagoe', notes: '', link: '', interested: 'Jonathan' },
    { name: 'Antonio', category: 'Sites', details: 'Kashiya Yokocho', location: 'Kawagoe', notes: '', link: '', interested: '' },
    { name: 'Antonio', category: 'Sites', details: 'Kawagoe Hikawa Shrine', location: 'Kawagoe', notes: '', link: '', interested: '' },
    { name: 'Antonio', category: 'Sites', details: 'Meiji Jingu Shrine', location: 'Shibuya', notes: '', link: '', interested: 'P' },
    { name: 'Antonio', category: 'Music', details: 'Jazz Listening Bar', location: '', notes: '', link: '', interested: 'Pawan, Ken, Jonathan, Briana' },
    { name: 'Briana', category: 'Overnight', details: 'Onsen hot springs (private booking available)', location: 'Kinosaki', notes: '1-2 nights, preferably end of trip after so much walking. Closer to Kyoto/Osaka.', link: '', interested: '' },
    { name: 'Briana', category: 'Activity/Souvenir', details: 'Indigo hand dye workshop', location: 'Kyoto', notes: 'Hand dye tapestry/tote/towel/shirt. 90-120 min, $20-$60.', link: '', interested: '' },
    { name: 'Briana', category: 'Shopping', details: 'Kyoto Ceramic Center', location: 'Kyoto', notes: '', link: '', interested: 'Antonio, Dami' },
    { name: 'Briana', category: 'Shopping', details: 'Craft Gallery Art Eiran', location: 'Kyoto', notes: 'Hand dyed pieces; indigo dye', link: '', interested: '' },
    { name: 'Briana', category: 'Site', details: 'By\u014dd\u014d-ji (Inaba-d\u014d) Temple \u2014 Pet shrine', location: 'Kyoto', notes: '', link: '', interested: 'Antonio, Dami' },
    { name: 'Briana', category: 'Activity/Site', details: 'Suntory Yamazaki Distillery', location: 'Osaka/Kyoto', notes: '', link: '', interested: '' },
    { name: 'Briana', category: 'Activity', details: 'Yoyogi Park (sometimes weekend flea market)', location: 'Tokyo', notes: '', link: '', interested: 'Antonio, Dami, P, Ken' },
    { name: 'Briana', category: 'Shopping', details: 'Kappabashi Street \u2014 Kitchen shopping', location: 'Tokyo', notes: '', link: '', interested: 'Adrian, Angel, Pawan, Antonio, Dami, Ken' },
    { name: 'Briana', category: 'Shopping', details: 'SOU\u00b7SOU KYOTO Aoyama Store \u2014 PANTS', location: 'Tokyo', notes: '', link: '', interested: '' },
    { name: 'Briana', category: 'Shopping', details: 'Kamawanu (tenugui) \u2014 Japanese cloth towels', location: 'Tokyo', notes: '', link: '', interested: '' },
    { name: 'Briana', category: 'Shopping', details: 'Honke-Kaneso \u2014 Knives (small business, engraving)', location: 'Tokyo', notes: '', link: '', interested: '' },
    { name: 'Briana', category: 'Shopping', details: 'Kama-Asa \u2014 More knives', location: 'Tokyo', notes: '', link: '', interested: 'Adrian' },
    { name: 'Briana', category: 'Shopping', details: 'NOREN KAGURAZAKA \u2014 Assorted shopping', location: 'Tokyo', notes: '', link: '', interested: '' },
    { name: 'Briana', category: 'Shopping', details: 'Tokyo City Flea Market (most weekends)', location: 'Tokyo', notes: '', link: '', interested: '' },
    { name: 'Briana', category: 'Site', details: 'G\u014dtokuji Temple \u2014 Cat shrine', location: 'Tokyo', notes: '', link: '', interested: 'Angel, Antonio, Dami, Ken, P, Jonathan' },
    { name: 'Briana', category: 'Site/Activity', details: 'Senso-ji Temple \u2014 Omikuji fortune pulling (100 yen)', location: 'Tokyo', notes: '', link: '', interested: 'Antonio, Dami' },
    { name: 'Pawan', category: 'Site', details: "Philosopher's Path", location: 'Kyoto', notes: '', link: '', interested: 'Antonio, Dami' },
    { name: 'Pawan', category: 'Site', details: 'Nishiki Market', location: 'Kyoto', notes: '', link: '', interested: 'Antonio, Dami, Briana' },
    { name: 'Pawan', category: 'Site', details: 'Fushimi Inari \u2014 Go to the bamboo route instead of bamboo forest', location: 'Kyoto', notes: '', link: 'https://www.travelcaffeine.com/secret-bamboo-forest-fushimi-inari-shrine/', interested: 'Antonio, Dami, Briana' },
    { name: 'Pawan', category: 'Site', details: 'Gion (after dark or morning)', location: 'Kyoto', notes: '', link: '', interested: 'Antonio, Dami, Briana' },
    { name: 'Pawan', category: 'Site', details: 'Golden Pavilion (Kinkaku-ji)', location: 'Kyoto', notes: '', link: '', interested: 'Antonio' },
    { name: 'Pawan', category: 'Site', details: 'Kiyomizudera', location: 'Kyoto', notes: '', link: '', interested: '' },
    { name: 'Pawan', category: 'Site', details: 'Osaka Castle', location: 'Osaka', notes: '', link: '', interested: 'Antonio, Dami, Ken, Jonathan' },
    { name: 'Pawan', category: 'Site/Activity', details: 'Shibuya Sky viewpoint at night', location: 'Tokyo', notes: '', link: '', interested: 'Ken, Jonathan' },
    { name: 'Pawan', category: 'Site/Activity', details: 'Godzilla in Kabukicho', location: 'Tokyo', notes: '', link: '', interested: '' },
    { name: 'Pawan', category: 'Site/Activity', details: 'Pokemon Cafe', location: 'Tokyo/Osaka', notes: '', link: 'https://www.pokemon-cafe.jp/en/cafe/', interested: 'Jonathan' },
    { name: 'Pawan', category: 'Site/Activity', details: 'Kirby Cafe', location: 'Tokyo', notes: '', link: 'https://kirbycafe.jp/', interested: 'Briana, Jonathan' },
    { name: 'Pawan', category: 'Site/Activity', details: 'Shinjuku Gyoen National Park', location: 'Tokyo', notes: '', link: '', interested: '' },
    { name: 'Pawan', category: 'Music', details: 'Jazz Concert @ Shinjuku Pit Inn or Sometime', location: 'Tokyo', notes: '', link: '', interested: 'Antonio, Dami, Briana' },
    { name: 'Pawan', category: 'Drinks', details: 'Kyoto Brewing', location: 'Kyoto', notes: '', link: '', interested: 'Briana' },
    { name: 'Pawan', category: 'Shopping', details: 'Artisan mousepad \u2014 PC Ark / Sofmap / Yodobashi Camera (Akihabara)', location: 'Tokyo', notes: '', link: '', interested: '' },
    { name: 'Pawan/Adrian', category: 'Activity', details: 'Sumo match', location: '', notes: '', link: '', interested: 'Ken, Jonathan, Briana' },
    { name: '', category: 'Shopping', details: 'Loft', location: 'Shibuya', notes: '', link: '', interested: 'Briana, Antonio, Dami, Ken' },
    { name: '', category: 'Shopping', details: 'Don Quijote', location: '', notes: '', link: '', interested: 'Jonathan, P, Ken, Briana' },
    { name: '', category: 'Site', details: 'Namba Yasaka Shrine', location: 'Osaka', notes: '', link: '', interested: 'Antonio, Ken, Briana' },
    { name: 'Briana', category: 'Site', details: 'Shitennoji Temple', location: 'Osaka', notes: '', link: '', interested: '' },
    { name: 'Briana', category: 'Site', details: 'Tennoji Park', location: 'Osaka', notes: '', link: '', interested: '' },
    { name: 'Pawan', category: 'Shopping', details: 'Beams Plus Harajuku & Beams Men Shibuya', location: 'Tokyo', notes: '', link: '', interested: '' },
    { name: 'Pawan', category: 'Shopping', details: 'Panasonic Arc 5 Palm @ Bic Camera or Yodobashi Camera', location: 'Tokyo', notes: '', link: '', interested: '' },
    { name: 'Briana', category: 'Activity/Souvenir', details: 'Plum wine class \u2014 Choya Ume Studio', location: 'Kyoto', notes: '40 min, ~$50', link: '', interested: '' },
    { name: '', category: 'Shopping', details: 'Home decor \u2014 DULTON', location: 'Tokyo', notes: 'Shibuya', link: '', interested: '' },
  ],
};

// ==================== STATE ====================

let state = {
  activeSection: 'timeline',
  selectedDay: 1,
  foodFilters: { location: 'all', category: 'all', person: 'all' },
  activityFilters: { location: 'all', category: 'all', person: 'all' },
  foodSearch: '',
  activitySearch: '',
};

// ==================== HELPERS ====================

const AVATAR_COLORS = [
  '#b91c1c', '#c2410c', '#a16207', '#4d7c0f',
  '#047857', '#0e7490', '#1d4ed8', '#6d28d9',
  '#a21caf', '#be123c',
];

function getInitials(name) {
  return name.split(/[\s/]+/).map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

function getCategoryClass(cat) {
  const c = cat.toLowerCase();
  if (c.includes('ramen') || c.includes('noodle') || c.includes('tsukemen') || c.includes('soba')) return 'cat-ramen';
  if (c.includes('sushi') || c.includes('eel') || c.includes('tempura')) return 'cat-sushi';
  if (c.includes('coffee') || c.includes('cafe')) return 'cat-coffee';
  if (c.includes('shopping') || c.includes('camera')) return 'cat-shopping';
  if (c.includes('bbq') || c.includes('katsu') || c.includes('wagyu') || c.includes('yakiniku') || c.includes('beef')) return 'cat-bbq';
  if (c.includes('site') || c.includes('temple') || c.includes('shrine')) return 'cat-site';
  if (c.includes('activity') || c.includes('souvenir') || c.includes('overnight') || c.includes('day trip')) return 'cat-activity';
  if (c.includes('music') || c.includes('jazz') || c.includes('drinks') || c.includes('bar') || c.includes('wine')) return 'cat-music';
  return 'cat-default';
}

function getScheduleType(activity) {
  const a = activity.toLowerCase();
  if (a.includes('group') || a.includes('fushimi inari')) return 'group';
  if (a.includes('flight') || a.includes('train') || a.includes('monorail') || a.includes('akasaka st')) return 'transport';
  if (a.includes('nap') || a.includes('rest')) return 'rest';
  if (a.includes('coffee') || a.includes('lunch') || a.includes('dinner') || a.includes('breakfast')
    || a.includes('bakery') || a.includes('ramen') || a.includes('hikiniku')
    || a.includes('unana') || a.includes('noodle') || a.includes('sushi')
    || a.includes('taiyaki') || a.includes('iron coffee') || a.includes('rarasand')
    || a.includes('mukai') || a.includes('nata') || a.includes('fish market')
    || a.includes('glitch') || a.includes('ishiya') || a.includes('ginza hachigou')
    || a.includes('february coffee')) return 'food';
  if (a.includes('beams') || a.includes('dulton') || a.includes('tower records')
    || a.includes('don qui') || a.includes('kama') || a.includes('honke')
    || a.includes('kamawanu') || a.includes('number sugar') || a.includes('bic camera')
    || a.includes('sou\u00b7sou') || a.includes('shop')) return 'shopping';
  return '';
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function showToast(message, type) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = 'toast ' + (type || '') + ' show';
  setTimeout(() => { toast.className = 'toast'; }, 3000);
}

function getUniqueValues(arr, key) {
  const vals = new Set();
  arr.forEach(item => {
    const v = item[key];
    if (v && v.trim()) vals.add(v.trim());
  });
  return Array.from(vals).sort();
}

// ==================== NAVIGATION ====================

function setupNavigation() {
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const section = link.dataset.section;
      setActiveSection(section);
    });
  });
}

function setActiveSection(section) {
  state.activeSection = section;

  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
  document.querySelector(`.nav-link[data-section="${section}"]`).classList.add('active');

  document.querySelectorAll('.section').forEach(s => {
    s.classList.remove('active');
    s.style.display = 'none';
  });
  const el = document.getElementById(section);
  el.style.display = 'block';
  // Trigger reflow for animation
  void el.offsetWidth;
  el.classList.add('active');

  window.scrollTo({ top: document.getElementById('main-nav').offsetTop, behavior: 'smooth' });
}

// ==================== TIMELINE ====================

function renderTimeline() {
  const selector = document.getElementById('day-selector');
  const detail = document.getElementById('day-detail');

  // Day pills
  selector.innerHTML = DATA.timeline.map(d => `
    <div class="day-pill ${d.day === state.selectedDay ? 'active' : ''}" onclick="selectDay(${d.day})">
      <span class="day-num">${d.day === 0 ? 'Travel' : d.day === 15 ? 'End' : 'Day ' + d.day}</span>
      <span class="day-date">${d.date.replace('July ', '7/')}</span>
      <span class="day-loc">${d.location.length > 12 ? d.location.slice(0, 12) + '\u2026' : d.location}</span>
    </div>
  `).join('');

  renderDayDetail();
}

function selectDay(dayNum) {
  state.selectedDay = dayNum;
  document.querySelectorAll('.day-pill').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.day-pill')[dayNum] && document.querySelectorAll('.day-pill').forEach((p, i) => {
    if (DATA.timeline[i] && DATA.timeline[i].day === dayNum) p.classList.add('active');
  });
  renderDayDetail();
}

function renderDayDetail() {
  const detail = document.getElementById('day-detail');
  const day = DATA.timeline.find(d => d.day === state.selectedDay);
  if (!day) return;

  const hasSchedule = day.schedule && day.schedule.length > 0;

  detail.innerHTML = `
    <div class="day-header">
      <h3>${day.day === 0 ? 'Travel Day' : day.day === 15 ? 'Departure' : 'Day ' + day.day + ' \u2014 ' + day.dayOfWeek}</h3>
      <div class="day-meta">
        <span>\ud83d\udcc5 ${day.date}</span>
        <span>\ud83d\udccd ${day.location}</span>
      </div>
      ${day.notes ? `<div class="day-notes">${escapeHtml(day.notes)}</div>` : ''}
    </div>
    ${hasSchedule ? `
      <div class="schedule-timeline">
        ${day.schedule.map((s, i) => {
          const type = s.type || getScheduleType(s.activity);
          return `
            <div class="schedule-item" style="animation-delay: ${i * 0.05}s">
              <div class="schedule-time">${s.time}</div>
              <div class="schedule-dot ${type}"></div>
              <div class="schedule-card">
                <div class="sc-activity">${escapeHtml(s.activity)}</div>
                ${type ? `<span class="sc-tag ${type}">${type}</span>` : ''}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    ` : `
      <div class="empty-schedule">
        <p>No detailed schedule yet for this day.</p>
        <p style="margin-top:0.5rem;font-size:0.8rem;">Check the Food & Activities sections for ideas!</p>
      </div>
    `}
  `;
}

// ==================== FOOD ====================

function renderFood() {
  renderFoodFilters();
  renderFoodCards();
}

function renderFoodFilters() {
  const container = document.getElementById('food-filters');
  const locations = getUniqueValues(DATA.food, 'location');
  const categories = getUniqueValues(DATA.food, 'category');
  const people = getUniqueValues(DATA.food, 'name');

  container.innerHTML = `
    <input type="text" class="search-input" placeholder="Search restaurants..." oninput="state.foodSearch=this.value;renderFoodCards()" value="${state.foodSearch}">
    <div class="filter-group">
      <span class="filter-label">City</span>
      <button class="filter-pill ${state.foodFilters.location === 'all' ? 'active' : ''}" onclick="setFoodFilter('location','all')">All</button>
      ${locations.map(l => `<button class="filter-pill ${state.foodFilters.location === l ? 'active' : ''}" onclick="setFoodFilter('location','${l.replace(/'/g, "\\'")}')">${l}</button>`).join('')}
    </div>
    <div class="filter-group">
      <span class="filter-label">By</span>
      <button class="filter-pill ${state.foodFilters.person === 'all' ? 'active' : ''}" onclick="setFoodFilter('person','all')">All</button>
      ${people.map(p => `<button class="filter-pill ${state.foodFilters.person === p ? 'active' : ''}" onclick="setFoodFilter('person','${p.replace(/'/g, "\\'")}')">${p}</button>`).join('')}
    </div>
  `;
}

function setFoodFilter(key, value) {
  state.foodFilters[key] = value;
  renderFoodFilters();
  renderFoodCards();
}

function renderFoodCards() {
  const grid = document.getElementById('food-grid');
  let items = DATA.food;

  if (state.foodFilters.location !== 'all') {
    items = items.filter(f => f.location === state.foodFilters.location);
  }
  if (state.foodFilters.person !== 'all') {
    items = items.filter(f => f.name === state.foodFilters.person);
  }
  if (state.foodSearch) {
    const q = state.foodSearch.toLowerCase();
    items = items.filter(f =>
      f.details.toLowerCase().includes(q) ||
      f.category.toLowerCase().includes(q) ||
      f.name.toLowerCase().includes(q) ||
      f.location.toLowerCase().includes(q) ||
      (f.neighborhood && f.neighborhood.toLowerCase().includes(q)) ||
      (f.notes && f.notes.toLowerCase().includes(q))
    );
  }

  if (items.length === 0) {
    grid.innerHTML = '<div class="no-results">No restaurants match your filters.</div>';
    return;
  }

  grid.innerHTML = items.map(f => `
    <div class="card">
      <div class="card-header">
        <span class="card-title">${escapeHtml(f.details)}</span>
        <span class="card-category ${getCategoryClass(f.category)}">${escapeHtml(f.category)}</span>
      </div>
      <div class="card-meta">
        ${f.location ? `<span class="meta-tag location">\ud83d\udccd ${escapeHtml(f.location)}</span>` : ''}
        ${f.neighborhood ? `<span class="meta-tag neighborhood">${escapeHtml(f.neighborhood)}</span>` : ''}
        ${f.name ? `<span class="meta-tag person">${escapeHtml(f.name)}</span>` : ''}
      </div>
      ${f.notes ? `<div class="card-notes">${escapeHtml(f.notes)}</div>` : ''}
      ${f.interested ? `<div class="card-interested">Also interested: ${escapeHtml(f.interested)}</div>` : ''}
      ${f.link ? `<a class="card-link" href="${f.link}" target="_blank" rel="noopener">\u2192 View details</a>` : ''}
    </div>
  `).join('');
}

// ==================== ACTIVITIES ====================

function renderActivities() {
  renderActivityFilters();
  renderActivityCards();
}

function renderActivityFilters() {
  const container = document.getElementById('activity-filters');
  const locations = getUniqueValues(DATA.activities, 'location');
  const categories = getUniqueValues(DATA.activities, 'category');
  const people = getUniqueValues(DATA.activities, 'name');

  container.innerHTML = `
    <input type="text" class="search-input" placeholder="Search activities..." oninput="state.activitySearch=this.value;renderActivityCards()" value="${state.activitySearch}">
    <div class="filter-group">
      <span class="filter-label">City</span>
      <button class="filter-pill ${state.activityFilters.location === 'all' ? 'active' : ''}" onclick="setActivityFilter('location','all')">All</button>
      ${locations.map(l => `<button class="filter-pill ${state.activityFilters.location === l ? 'active' : ''}" onclick="setActivityFilter('location','${l.replace(/'/g, "\\'")}')">${l}</button>`).join('')}
    </div>
    <div class="filter-group">
      <span class="filter-label">Type</span>
      <button class="filter-pill ${state.activityFilters.category === 'all' ? 'active' : ''}" onclick="setActivityFilter('category','all')">All</button>
      ${categories.map(c => `<button class="filter-pill ${state.activityFilters.category === c ? 'active' : ''}" onclick="setActivityFilter('category','${c.replace(/'/g, "\\'")}')">${c}</button>`).join('')}
    </div>
    <div class="filter-group">
      <span class="filter-label">By</span>
      <button class="filter-pill ${state.activityFilters.person === 'all' ? 'active' : ''}" onclick="setActivityFilter('person','all')">All</button>
      ${people.map(p => `<button class="filter-pill ${state.activityFilters.person === p ? 'active' : ''}" onclick="setActivityFilter('person','${p.replace(/'/g, "\\'")}')">${p}</button>`).join('')}
    </div>
  `;
}

function setActivityFilter(key, value) {
  state.activityFilters[key] = value;
  renderActivityFilters();
  renderActivityCards();
}

function renderActivityCards() {
  const grid = document.getElementById('activity-grid');
  let items = DATA.activities;

  if (state.activityFilters.location !== 'all') {
    items = items.filter(a => a.location === state.activityFilters.location);
  }
  if (state.activityFilters.category !== 'all') {
    items = items.filter(a => a.category === state.activityFilters.category);
  }
  if (state.activityFilters.person !== 'all') {
    items = items.filter(a => a.name === state.activityFilters.person);
  }
  if (state.activitySearch) {
    const q = state.activitySearch.toLowerCase();
    items = items.filter(a =>
      a.details.toLowerCase().includes(q) ||
      a.category.toLowerCase().includes(q) ||
      a.name.toLowerCase().includes(q) ||
      a.location.toLowerCase().includes(q) ||
      (a.notes && a.notes.toLowerCase().includes(q))
    );
  }

  if (items.length === 0) {
    grid.innerHTML = '<div class="no-results">No activities match your filters.</div>';
    return;
  }

  grid.innerHTML = items.map(a => `
    <div class="card">
      <div class="card-header">
        <span class="card-title">${escapeHtml(a.details)}</span>
        <span class="card-category ${getCategoryClass(a.category)}">${escapeHtml(a.category)}</span>
      </div>
      <div class="card-meta">
        ${a.location ? `<span class="meta-tag location">\ud83d\udccd ${escapeHtml(a.location)}</span>` : ''}
        ${a.name ? `<span class="meta-tag person">${escapeHtml(a.name)}</span>` : ''}
      </div>
      ${a.notes ? `<div class="card-notes">${escapeHtml(a.notes)}</div>` : ''}
      ${a.interested ? `<div class="card-interested">Also interested: ${escapeHtml(a.interested)}</div>` : ''}
      ${a.link ? `<a class="card-link" href="${a.link}" target="_blank" rel="noopener">\u2192 View details</a>` : ''}
    </div>
  `).join('');
}

// ==================== PLANNING ====================

function renderPlanning() {
  // Tasks
  const taskList = document.getElementById('task-list');
  const doneTasks = DATA.tasks.filter(t => t.status === 'done').length;
  const totalTasks = DATA.tasks.length;
  const pct = Math.round((doneTasks / totalTasks) * 100);

  document.getElementById('progress-bar').style.width = pct + '%';
  document.getElementById('progress-text').textContent = `${doneTasks}/${totalTasks} done`;

  taskList.innerHTML = DATA.tasks.map(t => `
    <div class="task-item">
      <div class="task-check ${t.status === 'done' ? 'done' : t.status === 'pending' ? 'pending' : ''}">
        ${t.status === 'done' ? '\u2713' : t.status === 'pending' ? '\u25cb' : ''}
      </div>
      <span class="task-text ${t.status === 'done' ? 'done' : ''}">${escapeHtml(t.task)}</span>
    </div>
  `).join('');

  // Links
  const linksList = document.getElementById('links-list');
  linksList.innerHTML = DATA.links.map(l => `
    <a class="link-item" href="${l.url}" target="_blank" rel="noopener">
      <span class="link-icon">\ud83d\udd17</span>
      <div>
        <div>${escapeHtml(l.label)}</div>
        ${l.desc ? `<div class="link-desc">${escapeHtml(l.desc)}</div>` : ''}
      </div>
    </a>
  `).join('');

  // Notes
  const notesList = document.getElementById('notes-list');
  notesList.innerHTML = DATA.notes.map(n => `
    <div class="note-item">${escapeHtml(n)}</div>
  `).join('');
}

// ==================== GROUP ====================

function renderGroup() {
  const grid = document.getElementById('traveler-grid');
  grid.innerHTML = DATA.travelers.map((t, i) => `
    <div class="traveler-card">
      <div class="traveler-avatar" style="background: ${AVATAR_COLORS[i % AVATAR_COLORS.length]}">
        ${getInitials(t.name)}
      </div>
      <div class="traveler-info">
        <div class="traveler-name">${escapeHtml(t.name)}</div>
        <div class="traveler-detail">${escapeHtml(t.email)}</div>
        <div class="traveler-badges">
          <span class="badge badge-yes">\u2713 Confirmed</span>
          <span class="badge badge-age">Age ${t.age}</span>
          ${t.allergies ? `<span class="badge badge-allergy">\u26a0 ${escapeHtml(t.allergies)}</span>` : ''}
        </div>
      </div>
    </div>
  `).join('');
}

// ==================== SYNC ====================

async function syncFromSheets() {
  const btn = document.getElementById('sync-btn');
  btn.classList.add('syncing');
  btn.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M13.65 2.35A7.95 7.95 0 0 0 8 0C3.58 0 0 3.58 0 8s3.58 8 8 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0 1 8 14 6 6 0 1 1 8 2c1.66 0 3.14.69 4.22 1.78L9 7h7V0l-2.35 2.35z" fill="currentColor"/></svg>
    Syncing...
  `;

  try {
    const sheets = [
      { name: 'Activity Menu', gid: '0', target: 'activities' },
      { name: 'Food Menu', gid: null, sheetName: 'Food Menu', target: 'food' },
      { name: 'To-do', gid: '689681346', target: 'tasks' },
    ];

    let successCount = 0;

    for (const sheet of sheets) {
      try {
        const gidParam = sheet.gid ? `gid=${sheet.gid}` : `sheet=${encodeURIComponent(sheet.sheetName)}`;
        const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&${gidParam}`;
        const response = await fetch(url);

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const csvText = await response.text();
        const parsed = Papa.parse(csvText, { header: true, skipEmptyLines: true });

        if (parsed.data && parsed.data.length > 0) {
          if (sheet.target === 'activities') {
            DATA.activities = parseActivityCSV(parsed.data);
          } else if (sheet.target === 'food') {
            DATA.food = parseFoodCSV(parsed.data);
          }
          successCount++;
        }
      } catch (err) {
        console.warn(`Failed to sync ${sheet.name}:`, err);
      }
    }

    if (successCount > 0) {
      renderAll();
      showToast(`Synced ${successCount} sheet(s) from Google Sheets!`, 'success');
    } else {
      showToast('Could not sync \u2014 the sheet may not be publicly accessible', 'error');
    }
  } catch (err) {
    console.error('Sync error:', err);
    showToast('Sync failed \u2014 check console for details', 'error');
  } finally {
    btn.classList.remove('syncing');
    btn.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M13.65 2.35A7.95 7.95 0 0 0 8 0C3.58 0 0 3.58 0 8s3.58 8 8 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0 1 8 14 6 6 0 1 1 8 2c1.66 0 3.14.69 4.22 1.78L9 7h7V0l-2.35 2.35z" fill="currentColor"/></svg>
      Sync from Google Sheets
    `;
  }
}

function parseActivityCSV(rows) {
  return rows.filter(r => r['Details'] && r['Details'].trim()).map(r => ({
    name: (r['Name'] || '').trim(),
    category: (r['Category'] || '').trim(),
    details: (r['Details'] || '').trim(),
    location: (r['Location'] || '').trim(),
    notes: (r['Notes, etc'] || '').trim(),
    link: (r['Link'] || '').trim(),
    interested: (r['Others Interested'] || '').trim(),
  }));
}

function parseFoodCSV(rows) {
  return rows.filter(r => r['Details'] && r['Details'].trim()).map(r => ({
    name: (r['Name'] || '').trim(),
    category: (r['Category'] || '').trim(),
    details: (r['Details'] || '').trim(),
    location: (r['Location'] || '').trim(),
    neighborhood: (r['Neighborhood'] || '').trim(),
    notes: (r['Notes, etc'] || '').trim(),
    link: (r['Link'] || '').trim(),
    interested: (r['Others Interested'] || '').trim(),
  }));
}

// ==================== INIT ====================

function renderAll() {
  renderTimeline();
  renderFood();
  renderActivities();
  renderPlanning();
  renderGroup();
}

function init() {
  setupNavigation();
  renderAll();
}

document.addEventListener('DOMContentLoaded', init);
