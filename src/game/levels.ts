import type { Level } from './types';

// BASE_URL è '/sleevo-3d/' in prod/dev, '/' in test — risolve il path delle cover
const base = import.meta.env.BASE_URL.replace(/\/$/, '');
const cover = (path: string) => `${base}${path}`;

export const level1: Level = {
  id: 'level-1',
  rows: 2,
  cols: 3,
  sortRule: 'free',
  mode: 'free',
  parTime: 15,  // 4 vinyls × 3s × 1.0 (free mode) — comfortable par for beginners
  hint: 'Trascina i vinili sullo scaffale — posizione libera!',
  theme: 'classic',
  vinyls: [
    { id: 'v1', color: '#D7263D', genre: 'Rock',     year: 1975, artist: 'Led Zeppelin',  album: 'Physical Graffiti', cover: cover('/covers/led-zeppelin-physical-graffiti.jpg') },
    { id: 'v2', color: '#2563EB', genre: 'Jazz',     year: 1959, artist: 'Miles Davis',   album: 'Kind of Blue',      cover: cover('/covers/miles-davis-kind-of-blue.jpg') },
    { id: 'v3', color: '#EC4899', genre: 'Pop',      year: 1989, artist: 'Madonna',       album: 'Like a Prayer',     cover: cover('/covers/madonna-like-a-prayer.jpg') },
    { id: 'v4', color: '#F97316', genre: 'Hip-Hop',  year: 1992, artist: 'Dr. Dre',       album: 'The Chronic',       cover: cover('/covers/dr-dre-the-chronic.jpg') },
  ],
};

export const level2: Level = {
  id: 'level-2',
  rows: 2,
  cols: 4,
  sortRule: 'genre',
  mode: 'genre',
  parTime: 29,  // 8 vinyls × 3s × 1.2 (genre mode)
  hint: 'Raggruppa i vinili per genere nella stessa colonna',
  theme: 'classic',
  vinyls: [
    { id: 'v1', color: '#D7263D', genre: 'Rock',    year: 1975, artist: 'Led Zeppelin',    album: 'Led Zeppelin IV', cover: cover('/covers/led-zeppelin-led-zeppelin-iv.jpg') },
    { id: 'v2', color: '#2563EB', genre: 'Jazz',    year: 1959, artist: 'Miles Davis',     album: 'Kind of Blue', cover: cover('/covers/miles-davis-kind-of-blue.jpg') },
    { id: 'v3', color: '#EC4899', genre: 'Pop',     year: 1989, artist: 'Madonna',         album: 'Like a Prayer', cover: cover('/covers/madonna-like-a-prayer.jpg') },
    { id: 'v4', color: '#F97316', genre: 'Hip-Hop', year: 1992, artist: 'Dr. Dre',         album: 'The Chronic', cover: cover('/covers/dr-dre-the-chronic.jpg') },
    { id: 'v5', color: '#C0392B', genre: 'Rock',    year: 1969, artist: 'The Rolling Stones', album: 'Let It Bleed', cover: cover('/covers/the-rolling-stones-let-it-bleed.jpg') },
    { id: 'v6', color: '#1A56DB', genre: 'Jazz',    year: 1965, artist: 'John Coltrane',   album: 'A Love Supreme', cover: cover('/covers/john-coltrane-a-love-supreme.jpg') },
    { id: 'v7', color: '#F472B6', genre: 'Pop',     year: 2001, artist: 'Destiny\'s Child', album: 'Survivor', cover: cover('/covers/destiny-survivor.jpg') },
    { id: 'v8', color: '#EA7C1E', genre: 'Hip-Hop', year: 2003, artist: 'Jay-Z',           album: 'The Black Album', cover: cover('/covers/jay-z-the-black-album.jpg') },
  ],
};

export const level3: Level = {
  id: 'level-3',
  rows: 2,
  cols: 4,
  sortRule: 'chronological',
  mode: 'chronological',
  parTime: 31,  // 8 vinyls × 3s × 1.3 (chronological mode)
  hint: 'Ordina per anno: più vecchio a sinistra ←, più nuovo a destra →',
  theme: 'classic',
  vinyls: [
    { id: 'v1', color: '#8B5CF6', genre: 'Blues',      year: 1951, artist: 'Muddy Waters',    album: 'Louisiana Blues', cover: cover('/covers/muddy-waters-louisiana-blues.jpg') },
    { id: 'v2', color: '#2563EB', genre: 'Jazz',       year: 1959, artist: 'Dave Brubeck',    album: 'Time Out', cover: cover('/covers/dave-brubeck-time-out.jpg') },
    { id: 'v3', color: '#D7263D', genre: 'Rock',       year: 1969, artist: 'The Beatles',     album: 'Abbey Road', cover: cover('/covers/the-beatles-abbey-road.jpg') },
    { id: 'v4', color: '#F97316', genre: 'Funk',       year: 1975, artist: 'James Brown',     album: 'Reality', cover: cover('/covers/james-brown-reality.jpg') },
    { id: 'v5', color: '#EC4899', genre: 'Pop',        year: 1983, artist: 'Michael Jackson', album: 'Thriller', cover: cover('/covers/michael-jackson-thriller.jpg') },
    { id: 'v6', color: '#10B981', genre: 'Hip-Hop',    year: 1993, artist: 'A Tribe Called Quest', album: 'Midnight Marauders', cover: cover('/covers/a-tribe-called-quest-midnight-marauders.jpg') },
    { id: 'v7', color: '#F59E0B', genre: 'Electronic', year: 2002, artist: 'Daft Punk',       album: 'Discovery', cover: cover('/covers/daft-punk-discovery.jpg') },
    { id: 'v8', color: '#6EE7B7', genre: 'Indie',      year: 2011, artist: 'Bon Iver',        album: 'Bon Iver', cover: cover('/covers/bon-iver-bon-iver.jpg') },
  ],
};

// ── Livello 4: CUSTOMER MODE ──────────────────────────────────────────────────
export const level4: Level = {
  id: 'level-4',
  rows: 2,
  cols: 4,
  sortRule: 'free',
  mode: 'customer',
  customerName: 'Marco',
  parTime: 26,  // 8 vinyls × 3s × 1.1 (customer mode)
  hint: "Il cliente vuole un Rock degli anni '70! Mettilo in cima a sinistra.",
  theme: 'classic',
  customerRequest: {
    genre: 'Rock',
    era: '70s',
    targetRow: 0,
    targetCol: 0,
  },
  vinyls: [
    { id: 'v1', color: '#D7263D', genre: 'Rock',       year: 1973, artist: 'Pink Floyd',      album: 'The Dark Side of the Moon', cover: cover('/covers/pink-floyd-the-dark-side-of-the-moon.jpg') },
    { id: 'v2', color: '#2563EB', genre: 'Jazz',       year: 1961, artist: 'Bill Evans',      album: 'Waltz for Debby', cover: cover('/covers/bill-evans-waltz-for-debby.jpg') },
    { id: 'v3', color: '#EC4899', genre: 'Pop',        year: 1984, artist: 'Prince',          album: 'Purple Rain', cover: cover('/covers/prince-purple-rain.jpg') },
    { id: 'v4', color: '#F97316', genre: 'Rock',       year: 1992, artist: 'Nirvana',         album: 'Nevermind', cover: cover('/covers/nirvana-nevermind.jpg') },
    { id: 'v5', color: '#A78BFA', genre: 'Funk',       year: 1976, artist: 'Earth Wind & Fire', album: 'Spirit', cover: cover('/covers/earth-wind-fire-spirit.jpg') },
    { id: 'v6', color: '#10B981', genre: 'Soul',       year: 1968, artist: 'Aretha Franklin', album: 'Lady Soul', cover: cover('/covers/aretha-franklin-lady-soul.jpg') },
    { id: 'v7', color: '#F59E0B', genre: 'Electronic', year: 2004, artist: 'Kraftwerk',       album: 'Tour de France', cover: cover('/covers/kraftwerk-tour-de-france.jpg') },
    { id: 'v8', color: '#6EE7B7', genre: 'Jazz',       year: 1975, artist: 'Herbie Hancock',  album: 'Man-Child', cover: cover('/covers/herbie-hancock-man-child.jpg') },
  ],
};

// ── Livello 5: BLACKOUT MODE ──────────────────────────────────────────────────
export const level5: Level = {
  id: 'level-5',
  rows: 2,
  cols: 4,
  sortRule: 'chronological',
  mode: 'blackout',
  parTime: 36,  // 8 vinyls × 3s × 1.5 (blackout mode)
  hint: 'Memorizza! Hai 3 secondi, poi le etichette spariscono...',
  theme: 'classic',
  vinyls: [
    { id: 'v1', color: '#8B5CF6', genre: 'Blues',    year: 1948, artist: 'Robert Johnson',   album: 'Cross Road Blues', cover: cover('/covers/robert-johnson-cross-road-blues.jpg') },
    { id: 'v2', color: '#D7263D', genre: 'Rock',     year: 1966, artist: 'The Beach Boys',   album: 'Pet Sounds', cover: cover('/covers/the-beach-boys-pet-sounds.jpg') },
    { id: 'v3', color: '#EC4899', genre: 'Pop',      year: 1979, artist: 'Blondie',          album: 'Eat to the Beat', cover: cover('/covers/blondie-eat-to-the-beat.jpg') },
    { id: 'v4', color: '#F97316', genre: 'Disco',    year: 1983, artist: 'Gloria Gaynor',    album: 'I Am Gloria Gaynor', cover: cover('/covers/gloria-gaynor-i-am-gloria-gaynor.jpg') },
    { id: 'v5', color: '#2563EB', genre: 'Hip-Hop',  year: 1991, artist: 'N.W.A.',           album: 'Niggaz4Life', cover: cover('/covers/n-w-a-niggaz4life.jpg') },
    { id: 'v6', color: '#10B981', genre: 'Grunge',   year: 1997, artist: 'Soundgarden',      album: 'Down on the Upside', cover: cover('/covers/soundgarden-down-on-the-upside.jpg') },
    { id: 'v7', color: '#F59E0B', genre: 'Electronic', year: 2006, artist: 'LCD Soundsystem', album: 'Sound of Silver', cover: cover('/covers/lcd-soundsystem-sound-of-silver.jpg') },
    { id: 'v8', color: '#A78BFA', genre: 'Indie',    year: 2015, artist: 'Sufjan Stevens',   album: 'Carrie & Lowell', cover: cover('/covers/sufjan-stevens-carrie-lowell.jpg') },
  ],
};

// ── Livello 6: SCAFFALE ROTTO + GENERE ───────────────────────────────────────
// Slot bloccati = "in riparazione". Devi ordinare per genere con meno spazio!
export const level6: Level = {
  id: 'level-6',
  rows: 2,
  cols: 4,
  sortRule: 'genre',
  mode: 'genre',
  parTime: 22,  // 6 vinyls × 3s × 1.2 (genre mode)
  hint: 'Alcuni slot sono rotti! Ordina per genere negli spazi rimasti.',
  theme: 'classic',
  blockedSlots: [
    { row: 0, col: 2 },
  ],
  vinyls: [
    { id: 'v1', color: '#D7263D', genre: 'Rock',    year: 1971, artist: 'Black Sabbath',  album: 'Master of Reality', cover: cover('/covers/black-sabbath-master-of-reality.jpg') },
    { id: 'v2', color: '#C0392B', genre: 'Rock',    year: 1979, artist: 'AC/DC',           album: 'Highway to Hell', cover: cover('/covers/ac-dc-highway-to-hell.jpg') },
    { id: 'v3', color: '#2563EB', genre: 'Jazz',    year: 1963, artist: 'Stan Getz',       album: 'Getz/Gilberto', cover: cover('/covers/stan-getz-getz-gilberto.jpg') },
    { id: 'v4', color: '#1A56DB', genre: 'Jazz',    year: 1958, artist: 'Art Blakey',      album: 'Moanin\'', cover: cover('/covers/art-blakey-moanin.jpg') },
    { id: 'v5', color: '#EC4899', genre: 'Pop',     year: 1982, artist: 'ABBA',            album: 'The Visitors', cover: cover('/covers/abba-the-visitors.jpg') },
    { id: 'v6', color: '#F472B6', genre: 'Pop',     year: 2003, artist: 'Beyoncé',         album: 'Dangerously in Love', cover: cover('/covers/beyonc-dangerously-in-love.jpg') },
  ],
};

// ── Livello 7: CLIENTE IMPAZIENTE ────────────────────────────────────────────
// Il cliente ha fretta! 30 secondi per trovare il disco giusto. Vinile raro = bonus.
export const level7: Level = {
  id: 'level-7',
  rows: 2,
  cols: 4,
  sortRule: 'free',
  mode: 'customer',
  customerName: 'Sofia',
  parTime: 26,  // 8 vinyls × 3s × 1.1 (customer mode)
  hint: 'Il cliente ha fretta — trova il Jazz anni \'60 prima che se ne vada!',
  theme: 'classic',
  customerRequest: {
    genre: 'Jazz',
    era: '60s',
    targetRow: 0,
    targetCol: 0,
  },
  customerTimer: 30,
  vinyls: [
    { id: 'v1', color: '#2563EB', genre: 'Jazz',       year: 1964, artist: 'John Coltrane',   album: 'A Love Supreme', isRare: true, cover: cover('/covers/john-coltrane-a-love-supreme.jpg') },
    { id: 'v2', color: '#D7263D', genre: 'Rock',       year: 1970, artist: 'Deep Purple',      album: 'In Rock', cover: cover('/covers/deep-purple-in-rock.jpg') },
    { id: 'v3', color: '#EC4899', genre: 'Pop',        year: 1987, artist: 'Whitney Houston',  album: 'Whitney', cover: cover('/covers/whitney-houston-whitney.jpg') },
    { id: 'v4', color: '#F97316', genre: 'Funk',       year: 1971, artist: 'Sly & the Family Stone', album: 'There\'s a Riot Goin\' On', cover: cover('/covers/sly-the-family-stone-there.jpg') },
    { id: 'v5', color: '#10B981', genre: 'Soul',       year: 1965, artist: 'Sam Cooke',        album: 'Shake', cover: cover('/covers/sam-cooke-shake.jpg') },
    { id: 'v6', color: '#A78BFA', genre: 'Jazz',       year: 1961, artist: 'Bill Evans',       album: 'Sunday at the Village Vanguard', cover: cover('/covers/bill-evans-sunday-at-the-village-vanguard.jpg') },
    { id: 'v7', color: '#F59E0B', genre: 'Electronic', year: 1997, artist: 'The Prodigy',      album: 'Fat of the Land', cover: cover('/covers/the-prodigy-fat-of-the-land.jpg') },
    { id: 'v8', color: '#8B5CF6', genre: 'Blues',      year: 1967, artist: 'B.B. King',        album: 'Blues Is King', isRare: true, cover: cover('/covers/b-b-king-blues-is-king.jpg') },
  ],
};

// ── Livello 8: RUSH — CRONOLOGICO A TEMPO ────────────────────────────────────
// Grande scaffale, tanti dischi, ordine cronologico, 60 secondi! Slot rotti + vinili rari.
export const level8: Level = {
  id: 'level-8',
  rows: 3,
  cols: 4,
  sortRule: 'chronological',
  mode: 'rush',
  rushTime: 75,
  parTime: 24,  // 10 vinyls × 3s × 0.8 (rush mode = less time = harder)
  hint: '60 secondi! Ordina per anno con slot rotti. I dischi rari danno +300!',
  theme: 'jazz-club',
  blockedSlots: [
    { row: 0, col: 3 },
  ],
  vinyls: [
    { id: 'v1',  color: '#8B5CF6', genre: 'Blues',      year: 1936, artist: 'Robert Johnson',    album: 'Cross Road Blues', isRare: true, cover: cover('/covers/robert-johnson-cross-road-blues.jpg') },
    { id: 'v2',  color: '#2563EB', genre: 'Jazz',       year: 1957, artist: 'Thelonious Monk',   album: 'Brilliant Corners', cover: cover('/covers/thelonious-monk-brilliant-corners.jpg') },
    { id: 'v3',  color: '#D7263D', genre: 'Rock',       year: 1967, artist: 'Jimi Hendrix',      album: 'Are You Experienced', isRare: true, cover: cover('/covers/jimi-hendrix-are-you-experienced.jpg') },
    { id: 'v4',  color: '#F97316', genre: 'Funk',       year: 1970, artist: 'Parliament',        album: 'Osmium', cover: cover('/covers/parliament-osmium.jpg') },
    { id: 'v5',  color: '#EC4899', genre: 'Pop',        year: 1977, artist: 'Fleetwood Mac',     album: 'Rumours', cover: cover('/covers/fleetwood-mac-rumours.jpg') },
    { id: 'v6',  color: '#10B981', genre: 'Reggae',     year: 1984, artist: 'Bob Marley',        album: 'Legend', cover: cover('/covers/bob-marley-legend.jpg') },
    { id: 'v7',  color: '#F59E0B', genre: 'Hip-Hop',    year: 1994, artist: 'Nas',               album: 'Illmatic', isRare: true, cover: cover('/covers/nas-illmatic.jpg') },
    { id: 'v8',  color: '#6EE7B7', genre: 'Electronic', year: 2001, artist: 'Boards of Canada',  album: 'Music Has the Right to Children', cover: cover('/covers/boards-of-canada-music-has-the-right-to-children.jpg') },
    { id: 'v9',  color: '#A78BFA', genre: 'Indie',      year: 2007, artist: 'Radiohead',         album: 'In Rainbows', cover: cover('/covers/radiohead-in-rainbows.jpg') },
    { id: 'v10', color: '#C0392B', genre: 'Rock',       year: 2014, artist: 'Jack White',        album: 'Lazaretto', cover: cover('/covers/jack-white-lazaretto.jpg') },
  ],
};

// ── Livello 9: SLEEVE MATCH ─────────────────────────────────────────────────
// Le copertine sono già sullo scaffale (mescolate). Abbina ogni disco alla SUA copertina!
export const level9: Level = {
  id: 'level-9',
  rows: 2,
  cols: 3,
  sortRule: 'free',
  mode: 'sleeve-match',
  parTime: 25,  // 6 vinyls × 3s × 1.4 (sleeve-match mode)
  hint: 'Ogni slot ha una copertina! Trascina il disco GIUSTO su ogni copertina.',
  theme: 'jazz-club',
  vinyls: [
    { id: 'v1', color: '#D7263D', genre: 'Rock',     year: 1971, artist: 'David Bowie',    album: 'Hunky Dory', cover: cover('/covers/david-bowie-hunky-dory.jpg') },
    { id: 'v2', color: '#2563EB', genre: 'Jazz',     year: 1956, artist: 'Chet Baker',     album: 'Chet Baker Sings', cover: cover('/covers/chet-baker-chet-baker-sings.jpg') },
    { id: 'v3', color: '#EC4899', genre: 'Pop',      year: 1988, artist: 'George Michael',  album: 'Faith', cover: cover('/covers/george-michael-faith.jpg') },
    { id: 'v4', color: '#F97316', genre: 'Funk',     year: 1977, artist: 'Stevie Wonder',   album: 'Songs in the Key of Life', cover: cover('/covers/stevie-wonder-songs-in-the-key-of-life.jpg') },
    { id: 'v5', color: '#10B981', genre: 'Soul',     year: 1966, artist: 'Marvin Gaye',     album: "What's Going On", cover: cover('/covers/marvin-gaye-what-s-going-on.jpg') },
    { id: 'v6', color: '#A78BFA', genre: 'Electronic', year: 2000, artist: 'Air',           album: 'Moon Safari', cover: cover('/covers/air-moon-safari.jpg') },
  ],
  // Copertine mescolate sugli slot: il giocatore deve abbinare v1→slot giusto, v2→slot giusto, ecc.
  sleeveTargets: [
    { row: 0, col: 0, vinylId: 'v3' },  // Pop - George Michael
    { row: 0, col: 1, vinylId: 'v1' },  // Rock - David Bowie
    { row: 0, col: 2, vinylId: 'v5' },  // Soul - Marvin Gaye
    { row: 1, col: 0, vinylId: 'v6' },  // Electronic - Air
    { row: 1, col: 1, vinylId: 'v4' },  // Funk - Stevie Wonder
    { row: 1, col: 2, vinylId: 'v2' },  // Jazz - Chet Baker
  ],
};

// ── Livello 10: GENERE su scaffale grande (3×4) ──────────────────────────────
// Più vinili, più righe — ordina per genere su tutto lo spazio extra!
export const level10: Level = {
  id: 'level-10',
  rows: 3,
  cols: 4,
  sortRule: 'genre',
  mode: 'genre',
  parTime: 36,  // 10 vinyls × 3s × 1.2 (genre mode)
  hint: 'Scaffale grande! Raggruppa ogni genere nella stessa colonna.',
  theme: 'jazz-club',
  vinyls: [
    { id: 'v1',  color: '#D7263D', genre: 'Rock',       year: 1972, artist: 'David Bowie',       album: 'Ziggy Stardust', cover: cover('/covers/david-bowie-ziggy-stardust.jpg') },
    { id: 'v2',  color: '#C0392B', genre: 'Rock',       year: 1980, artist: 'AC/DC',              album: 'Back in Black', cover: cover('/covers/ac-dc-back-in-black.jpg') },
    { id: 'v3',  color: '#A93226', genre: 'Rock',       year: 1991, artist: 'Guns N\' Roses',     album: 'Use Your Illusion I', cover: cover('/covers/guns-n-use-your-illusion-i.jpg') },
    { id: 'v4',  color: '#2563EB', genre: 'Jazz',       year: 1958, artist: 'Chet Baker',         album: 'Chet Baker Sings', cover: cover('/covers/chet-baker-chet-baker-sings.jpg') },
    { id: 'v5',  color: '#1A56DB', genre: 'Jazz',       year: 1964, artist: 'Herbie Hancock',     album: 'Empyrean Isles', cover: cover('/covers/herbie-hancock-empyrean-isles.jpg') },
    { id: 'v6',  color: '#1A3FBD', genre: 'Jazz',       year: 1977, artist: 'Keith Jarrett',      album: 'The Köln Concert', cover: cover('/covers/keith-jarrett-the-k-ln-concert.jpg') },
    { id: 'v7',  color: '#EC4899', genre: 'Pop',        year: 1983, artist: 'Michael Jackson',    album: 'Thriller', cover: cover('/covers/michael-jackson-thriller.jpg') },
    { id: 'v8',  color: '#DB2777', genre: 'Pop',        year: 1995, artist: 'Mariah Carey',       album: 'Daydream', cover: cover('/covers/mariah-carey-daydream.jpg') },
    { id: 'v9',  color: '#F97316', genre: 'Hip-Hop',    year: 1993, artist: 'Wu-Tang Clan',       album: 'Enter the Wu-Tang', cover: cover('/covers/wu-tang-clan-enter-the-wu-tang.jpg') },
    { id: 'v10', color: '#EA7C1E', genre: 'Hip-Hop',    year: 2001, artist: 'Jay-Z',              album: 'The Blueprint', cover: cover('/covers/jay-z-the-blueprint.jpg') },
  ],
};

// ── Livello 11: CRONOLOGICO con vinili rari ───────────────────────────────────
// Stessa sfida del livello 3 ma con dischi rari sparsi che valgono punti bonus!
export const level11: Level = {
  id: 'level-11',
  rows: 2,
  cols: 4,
  sortRule: 'chronological',
  mode: 'chronological',
  parTime: 31,  // 8 vinyls × 3s × 1.3 (chronological mode)
  hint: 'Ordina per anno ← vecchio | nuovo → — i rari (✦) valgono +300!',
  theme: 'jazz-club',
  vinyls: [
    { id: 'v1', color: '#8B5CF6', genre: 'Blues',      year: 1942, artist: 'Billie Holiday',    album: 'God Bless the Child', isRare: true, cover: cover('/covers/billie-holiday-god-bless-the-child.jpg') },
    { id: 'v2', color: '#2563EB', genre: 'Jazz',       year: 1961, artist: 'Miles Davis',       album: 'Someday My Prince Will Come', cover: cover('/covers/miles-davis-someday-my-prince-will-come.jpg') },
    { id: 'v3', color: '#D7263D', genre: 'Rock',       year: 1966, artist: 'The Beatles',       album: 'Revolver', isRare: true, cover: cover('/covers/the-beatles-revolver.jpg') },
    { id: 'v4', color: '#F97316', genre: 'Funk',       year: 1974, artist: 'Stevie Wonder',     album: 'Fulfillingness\' First Finale', cover: cover('/covers/stevie-wonder-fulfillingness.jpg') },
    { id: 'v5', color: '#EC4899', genre: 'Pop',        year: 1982, artist: 'Toto',              album: 'Toto IV', cover: cover('/covers/toto-toto-iv.jpg') },
    { id: 'v6', color: '#10B981', genre: 'Soul',       year: 1989, artist: 'Anita Baker',       album: 'Giving You the Best That I Got', cover: cover('/covers/anita-baker-giving-you-the-best-that-i-got.jpg') },
    { id: 'v7', color: '#F59E0B', genre: 'Electronic', year: 1997, artist: 'Aphex Twin',        album: 'Come to Daddy', isRare: true, cover: cover('/covers/aphex-twin-come-to-daddy.jpg') },
    { id: 'v8', color: '#6EE7B7', genre: 'Indie',      year: 2013, artist: 'Vampire Weekend',   album: 'Modern Vampires of the City', cover: cover('/covers/vampire-weekend-modern-vampires-of-the-city.jpg') },
  ],
};

// ── Livello 12: CLIENTE + SCAFFALE CRONOLOGICO ────────────────────────────────
// Il cliente vuole un disco Soul anni '60 in cima — ma TUTTO lo scaffale va ordinato per anno!
export const level12: Level = {
  id: 'level-12',
  rows: 2,
  cols: 4,
  sortRule: 'chronological',
  mode: 'customer',
  customerName: 'Luca',
  parTime: 29,  // 8 vinyls × 3s × 1.2 (customer has lower multiplier than pure chrono)
  hint: "Soul '60 in cima a sinistra per il cliente — colonna = anno, riga libera!",
  theme: 'jazz-club',
  customerRequest: {
    genre: 'Soul',
    era: '60s',
    targetRow: 0,
    targetCol: 0,
  },
  customerTimer: 35,
  vinyls: [
    { id: 'v1', color: '#10B981', genre: 'Soul',       year: 1967, artist: 'Otis Redding',      album: 'The Dock of the Bay', cover: cover('/covers/otis-redding-the-dock-of-the-bay.jpg') },
    { id: 'v2', color: '#8B5CF6', genre: 'Blues',      year: 1954, artist: 'Muddy Waters',      album: 'Hoochie Coochie Man', cover: cover('/covers/muddy-waters-hoochie-coochie-man.jpg') },
    { id: 'v3', color: '#2563EB', genre: 'Jazz',       year: 1960, artist: 'Oscar Peterson',    album: 'Night Train', cover: cover('/covers/oscar-peterson-night-train.jpg') },
    { id: 'v4', color: '#D7263D', genre: 'Rock',       year: 1973, artist: 'Led Zeppelin',      album: 'Houses of the Holy', cover: cover('/covers/led-zeppelin-houses-of-the-holy.jpg') },
    { id: 'v5', color: '#F97316', genre: 'Funk',       year: 1979, artist: 'Parliament',        album: 'Gloryhallastoopid', cover: cover('/covers/parliament-gloryhallastoopid.jpg') },
    { id: 'v6', color: '#EC4899', genre: 'Pop',        year: 1986, artist: 'Madonna',           album: 'True Blue', cover: cover('/covers/madonna-true-blue.jpg') },
    { id: 'v7', color: '#F59E0B', genre: 'Electronic', year: 1994, artist: 'Massive Attack',    album: 'Protection', cover: cover('/covers/massive-attack-protection.jpg') },
    { id: 'v8', color: '#6EE7B7', genre: 'Indie',      year: 2004, artist: 'The Arcade Fire',   album: 'Funeral', cover: cover('/covers/the-arcade-fire-funeral.jpg') },
  ],
};

// ── Livello 13: BLACKOUT + GENERE ────────────────────────────────────────────
// Le etichette spariscono — ma questa volta devi ordinare per GENERE, non per anno!
export const level13: Level = {
  id: 'level-13',
  rows: 2,
  cols: 4,
  sortRule: 'genre',
  mode: 'blackout',
  parTime: 36,  // 8 vinyls × 3s × 1.5 (blackout mode)
  hint: 'Memorizza i generi — le etichette spariscono presto! Raggruppa per genere.',
  theme: 'punk-basement',
  vinyls: [
    { id: 'v1', color: '#D7263D', genre: 'Rock',       year: 1971, artist: 'Carole King',       album: 'Tapestry', cover: cover('/covers/carole-king-tapestry.jpg') },
    { id: 'v2', color: '#C0392B', genre: 'Rock',       year: 1985, artist: 'Bruce Springsteen', album: 'Born in the U.S.A.', cover: cover('/covers/bruce-springsteen-born-in-the-u-s-a.jpg') },
    { id: 'v3', color: '#2563EB', genre: 'Jazz',       year: 1963, artist: 'Thelonious Monk',   album: 'Monk\'s Dream', cover: cover('/covers/thelonious-monk-monk.jpg') },
    { id: 'v4', color: '#1A56DB', genre: 'Jazz',       year: 1972, artist: 'Charles Mingus',    album: 'Let My Children Hear Music', cover: cover('/covers/charles-mingus-let-my-children-hear-music.jpg') },
    { id: 'v5', color: '#10B981', genre: 'Soul',       year: 1968, artist: 'Curtis Mayfield',   album: 'Superfly', cover: cover('/covers/curtis-mayfield-superfly.jpg') },
    { id: 'v6', color: '#059669', genre: 'Soul',       year: 1976, artist: 'Al Green',          album: 'Full of Fire', cover: cover('/covers/al-green-full-of-fire.jpg') },
    { id: 'v7', color: '#F97316', genre: 'Funk',       year: 1973, artist: 'Sly & the Family Stone', album: 'Fresh', cover: cover('/covers/sly-the-family-stone-fresh.jpg') },
    { id: 'v8', color: '#EA7C1E', genre: 'Funk',       year: 1980, artist: 'Bootsy Collins',    album: 'Ultra Wave', cover: cover('/covers/bootsy-collins-ultra-wave.jpg') },
  ],
};

// ── Livello 14: RUSH + SCAFFALE ROTTO + GENERE ───────────────────────────────
// Scaffale 3×4 con 4 slot rotti, 8 vinili, 45 secondi — puzzle spaziale contro il tempo!
export const level14: Level = {
  id: 'level-14',
  rows: 3,
  cols: 4,
  sortRule: 'genre',
  mode: 'rush',
  rushTime: 55,
  parTime: 19,  // 8 vinyls × 3s × 0.8 (rush mode = less time = harder)
  hint: '45 secondi! Slot rotti ovunque — trova spazio e raggruppa per genere.',
  theme: 'punk-basement',
  blockedSlots: [
    { row: 0, col: 1 },
    { row: 2, col: 0 },
  ],
  vinyls: [
    { id: 'v1', color: '#D7263D', genre: 'Rock',       year: 1968, artist: 'Cream',             album: 'Wheels of Fire', cover: cover('/covers/cream-wheels-of-fire.jpg') },
    { id: 'v2', color: '#C0392B', genre: 'Rock',       year: 1983, artist: 'The Clash',         album: 'Combat Rock', cover: cover('/covers/the-clash-combat-rock.jpg') },
    { id: 'v3', color: '#2563EB', genre: 'Jazz',       year: 1956, artist: 'Clifford Brown',    album: 'Clifford Brown Memorial Album', cover: cover('/covers/clifford-brown-clifford-brown-memorial-album.jpg') },
    { id: 'v4', color: '#1A56DB', genre: 'Jazz',       year: 1966, artist: 'Wes Montgomery',    album: 'Goin\' Out of My Head', cover: cover('/covers/wes-montgomery-goin.jpg') },
    { id: 'v5', color: '#EC4899', genre: 'Pop',        year: 1990, artist: 'Janet Jackson',     album: 'Rhythm Nation 1814', cover: cover('/covers/janet-jackson-rhythm-nation-1814.jpg') },
    { id: 'v6', color: '#F472B6', genre: 'Pop',        year: 2000, artist: 'Destiny\'s Child',  album: 'The Writing\'s on the Wall', cover: cover('/covers/destiny-the-writing.jpg') },
    { id: 'v7', color: '#F97316', genre: 'Hip-Hop',    year: 1996, artist: 'Outkast',           album: 'ATLiens', cover: cover('/covers/outkast-atliens.jpg') },
    { id: 'v8', color: '#EA7C1E', genre: 'Hip-Hop',    year: 2004, artist: 'Kanye West',        album: 'The College Dropout', isRare: true, cover: cover('/covers/kanye-west-the-college-dropout.jpg') },
  ],
};

// ── Livello 15: SLEEVE-MATCH grande (3×3) ────────────────────────────────────
// Più copertine, più confusione — abbina 9 dischi alle loro copertine su uno scaffale 3×3!
export const level15: Level = {
  id: 'level-15',
  rows: 3,
  cols: 3,
  sortRule: 'free',
  mode: 'sleeve-match',
  parTime: 38,  // 9 vinyls × 3s × 1.4 (sleeve-match mode)
  hint: 'Abbina ogni disco alla sua copertina sullo scaffale!',
  theme: 'punk-basement',
  vinyls: [
    { id: 'v1', color: '#D7263D', genre: 'Rock',       year: 1979, artist: 'The Police',        album: 'Reggatta de Blanc', cover: cover('/covers/the-police-reggatta-de-blanc.jpg') },
    { id: 'v2', color: '#2563EB', genre: 'Jazz',       year: 1962, artist: 'Sonny Rollins',     album: 'The Bridge', cover: cover('/covers/sonny-rollins-the-bridge.jpg') },
    { id: 'v3', color: '#EC4899', genre: 'Pop',        year: 1991, artist: 'Seal',              album: 'Seal', cover: cover('/covers/seal-seal.jpg') },
    { id: 'v4', color: '#F97316', genre: 'Hip-Hop',    year: 1998, artist: 'Lauryn Hill',       album: 'The Miseducation of Lauryn Hill', cover: cover('/covers/lauryn-hill-the-miseducation-of-lauryn-hill.jpg') },
    { id: 'v5', color: '#10B981', genre: 'Soul',       year: 1974, artist: 'Marvin Gaye',       album: "Let's Get It On", cover: cover('/covers/marvin-gaye-let-s-get-it-on.jpg') },
    { id: 'v6', color: '#A78BFA', genre: 'Electronic', year: 2003, artist: 'Radiohead',         album: 'Hail to the Thief', cover: cover('/covers/radiohead-hail-to-the-thief.jpg') },
    { id: 'v7', color: '#F59E0B', genre: 'Funk',       year: 1970, artist: 'James Brown',       album: 'Sex Machine', cover: cover('/covers/james-brown-sex-machine.jpg') },
    { id: 'v8', color: '#6EE7B7', genre: 'Indie',      year: 2009, artist: 'Animal Collective',  album: 'Merriweather Post Pavilion', cover: cover('/covers/animal-collective-merriweather-post-pavilion.jpg') },
    { id: 'v9', color: '#8B5CF6', genre: 'Classica',   year: 1989, artist: 'Nino Rota',         album: 'The Godfather Suite', isRare: true, cover: cover('/covers/nino-rota-the-godfather-suite.jpg') },
  ],
  sleeveTargets: [
    { row: 0, col: 0, vinylId: 'v4' },  // Hip-Hop - Lauryn Hill
    { row: 0, col: 1, vinylId: 'v7' },  // Funk - James Brown
    { row: 0, col: 2, vinylId: 'v1' },  // Rock - The Police
    { row: 1, col: 0, vinylId: 'v9' },  // Classica - Nino Rota (raro)
    { row: 1, col: 1, vinylId: 'v5' },  // Soul - Marvin Gaye
    { row: 1, col: 2, vinylId: 'v2' },  // Jazz - Sonny Rollins
    { row: 2, col: 0, vinylId: 'v8' },  // Indie - Animal Collective
    { row: 2, col: 1, vinylId: 'v3' },  // Pop - Seal
    { row: 2, col: 2, vinylId: 'v6' },  // Electronic - Radiohead
  ],
};

// ── Livello 16: CLIENTE DIFFICILE — vinile raro, timer brevissimo ──────────────
// Il cliente vuole UN disco rarissimo e ha pochissima pazienza. 20 secondi!
export const level16: Level = {
  id: 'level-16',
  rows: 2,
  cols: 4,
  sortRule: 'free',
  mode: 'customer',
  customerName: 'Elena',
  parTime: 26,  // 8 vinyls × 3s × 1.1 (customer mode)
  hint: "Collezionista esigente! Vuole un Blues anni '40 — hai solo 20 secondi!",
  theme: 'punk-basement',
  customerRequest: {
    genre: 'Blues',
    era: '40s',
    targetRow: 0,
    targetCol: 0,
  },
  customerTimer: 30,
  vinyls: [
    { id: 'v1', color: '#8B5CF6', genre: 'Blues',      year: 1943, artist: 'Muddy Waters',      album: 'I Can\'t Be Satisfied', isRare: true, cover: cover('/covers/muddy-waters-i-can.jpg') },
    { id: 'v2', color: '#D7263D', genre: 'Rock',       year: 1975, artist: 'Queen',             album: 'A Night at the Opera', cover: cover('/covers/queen-a-night-at-the-opera.jpg') },
    { id: 'v3', color: '#2563EB', genre: 'Jazz',       year: 1958, artist: 'Dave Brubeck',      album: 'Time Out', cover: cover('/covers/dave-brubeck-time-out.jpg') },
    { id: 'v4', color: '#EC4899', genre: 'Pop',        year: 1988, artist: 'Tracy Chapman',     album: 'Tracy Chapman', cover: cover('/covers/tracy-chapman-tracy-chapman.jpg') },
    { id: 'v5', color: '#F97316', genre: 'Funk',       year: 1976, artist: 'George Clinton',    album: 'The Clones of Dr. Funkenstein', cover: cover('/covers/george-clinton-the-clones-of-dr-funkenstein.jpg') },
    { id: 'v6', color: '#10B981', genre: 'Soul',       year: 1971, artist: 'Al Green',          album: 'Let\'s Stay Together', cover: cover('/covers/al-green-let.jpg') },
    { id: 'v7', color: '#F59E0B', genre: 'Electronic', year: 1993, artist: 'Orbital',           album: 'Orbital II', cover: cover('/covers/orbital-orbital-ii.jpg') },
    { id: 'v8', color: '#6EE7B7', genre: 'Indie',      year: 2007, artist: 'Panda Bear',        album: 'Person Pitch', isRare: true, cover: cover('/covers/panda-bear-person-pitch.jpg') },
  ],
};

// ── Livello 17: RUSH FINALE — scaffale 3×5, 12 vinili, 75 secondi ────────────
// Il grande rush finale. Scaffale enorme, tanti dischi, ordine cronologico, 75 secondi.
// Tre slot rotti e quattro vinili rari — velocità + precisione!
export const level17: Level = {
  id: 'level-17',
  rows: 3,
  cols: 5,
  sortRule: 'chronological',
  mode: 'rush',
  rushTime: 90,
  parTime: 29,  // 12 vinyls × 3s × 0.8 (rush mode = less time = harder)
  hint: 'IL GRANDE RUSH! 75 secondi, scaffale 3×5 — ordina per anno, non mollare!',
  theme: 'punk-basement',
  blockedSlots: [
    { row: 0, col: 4 },
  ],
  vinyls: [
    { id: 'v1',  color: '#8B5CF6', genre: 'Blues',      year: 1938, artist: 'Robert Johnson',      album: 'King of the Delta Blues', isRare: true, cover: cover('/covers/robert-johnson-king-of-the-delta-blues.jpg') },
    { id: 'v2',  color: '#6D28D9', genre: 'Jazz',       year: 1944, artist: 'Coleman Hawkins',     album: 'Body and Soul', cover: cover('/covers/coleman-hawkins-body-and-soul.jpg') },
    { id: 'v3',  color: '#2563EB', genre: 'Jazz',       year: 1956, artist: 'Miles Davis',         album: 'Kind of Blue', cover: cover('/covers/miles-davis-kind-of-blue.jpg') },
    { id: 'v4',  color: '#D7263D', genre: 'Rock',       year: 1963, artist: 'The Beatles',         album: 'Please Please Me', isRare: true, cover: cover('/covers/the-beatles-please-please-me.jpg') },
    { id: 'v5',  color: '#F97316', genre: 'Funk',       year: 1971, artist: 'Funkadelic',          album: 'Maggot Brain', cover: cover('/covers/funkadelic-maggot-brain.jpg') },
    { id: 'v6',  color: '#EC4899', genre: 'Pop',        year: 1978, artist: 'Donna Summer',        album: 'Live and More', cover: cover('/covers/donna-summer-live-and-more.jpg') },
    { id: 'v7',  color: '#10B981', genre: 'Soul',       year: 1984, artist: 'Prince',              album: 'Purple Rain', isRare: true, cover: cover('/covers/prince-purple-rain.jpg') },
    { id: 'v8',  color: '#F59E0B', genre: 'Hip-Hop',    year: 1992, artist: 'Dr. Dre',             album: 'The Chronic', cover: cover('/covers/dr-dre-the-chronic.jpg') },
    { id: 'v9',  color: '#6EE7B7', genre: 'Electronic', year: 1998, artist: 'Daft Punk',           album: 'Homework', cover: cover('/covers/daft-punk-homework.jpg') },
    { id: 'v10', color: '#A78BFA', genre: 'Indie',      year: 2003, artist: 'Interpol',            album: 'Turn on the Bright Lights', cover: cover('/covers/interpol-turn-on-the-bright-lights.jpg') },
    { id: 'v11', color: '#34D399', genre: 'Soul',       year: 2010, artist: 'Janelle Monáe',       album: 'The ArchAndroid', cover: cover('/covers/janelle-mon-e-the-archandroid.jpg') },
    { id: 'v12', color: '#60A5FA', genre: 'Electronic', year: 2016, artist: 'Bon Iver',            album: '22, A Million', isRare: true, cover: cover('/covers/bon-iver-22-a-million.jpg') },
  ],
};

// ── Livello 18: SLEEVE-MATCH RUSH — abbina e basta, ma con stile ───────────────
// Il negozio sta per chiudere! Sleeve-match con timer. Mode rush + sleeveTargets.
export const level18: Level = {
  id: 'level-18',
  rows: 2,
  cols: 4,
  sortRule: 'free',
  mode: 'sleeve-match',
  parTime: 27,  // 8 vinyls × 3s × 1.15 (sleeve-match mode = 1.4, but combining with rush concept)
  hint: 'Il negozio chiude! Abbina ogni disco alla sua copertina!',
  theme: 'disco-70s',
  vinyls: [
    { id: 'v1', color: '#D7263D', genre: 'Rock',       year: 1969, artist: 'The Doors',         album: 'The Soft Parade', cover: cover('/covers/the-doors-the-soft-parade.jpg') },
    { id: 'v2', color: '#2563EB', genre: 'Jazz',       year: 1957, artist: 'John Coltrane',     album: 'Blue Train', isRare: true, cover: cover('/covers/john-coltrane-blue-train.jpg') },
    { id: 'v3', color: '#EC4899', genre: 'Pop',        year: 1986, artist: 'Kate Bush',         album: 'The Whole Story', cover: cover('/covers/kate-bush-the-whole-story.jpg') },
    { id: 'v4', color: '#F97316', genre: 'Hip-Hop',    year: 1999, artist: 'Mos Def',           album: 'Black on Both Sides', cover: cover('/covers/mos-def-black-on-both-sides.jpg') },
    { id: 'v5', color: '#10B981', genre: 'Soul',       year: 1972, artist: 'Bill Withers',      album: 'Still Bill', cover: cover('/covers/bill-withers-still-bill.jpg') },
    { id: 'v6', color: '#A78BFA', genre: 'Electronic', year: 2005, artist: 'M83',               album: 'Before the Dawn Heals Us', cover: cover('/covers/m83-before-the-dawn-heals-us.jpg') },
    { id: 'v7', color: '#F59E0B', genre: 'Funk',       year: 1968, artist: 'James Brown',       album: 'Say It Loud', isRare: true, cover: cover('/covers/james-brown-say-it-loud.jpg') },
    { id: 'v8', color: '#6EE7B7', genre: 'Indie',      year: 2015, artist: 'Tame Impala',       album: 'Currents', cover: cover('/covers/tame-impala-currents.jpg') },
  ],
  sleeveTargets: [
    { row: 0, col: 0, vinylId: 'v7' },  // Funk - James Brown (raro)
    { row: 0, col: 1, vinylId: 'v2' },  // Jazz - Coltrane (raro)
    { row: 0, col: 2, vinylId: 'v5' },  // Soul - Bill Withers
    { row: 0, col: 3, vinylId: 'v1' },  // Rock - The Doors
    { row: 1, col: 0, vinylId: 'v8' },  // Indie - Tame Impala
    { row: 1, col: 1, vinylId: 'v3' },  // Pop - Kate Bush
    { row: 1, col: 2, vinylId: 'v4' },  // Hip-Hop - Mos Def
    { row: 1, col: 3, vinylId: 'v6' },  // Electronic - M83
  ],
};

// ── Livello 19: SCAFFALE STRETTO — 4 righe × 2 colonne ──────────────────────
// Spazio minimo! Solo 2 colonne, 4 righe — ordina per genere in verticale.
// Simile a uno scaffale vero dove lo spazio è prezioso.
export const level19: Level = {
  id: 'level-19',
  rows: 4,
  cols: 2,
  sortRule: 'genre',
  mode: 'genre',
  parTime: 29,  // 8 vinyls × 3s × 1.2 (genre mode)
  hint: 'Scaffale strettissimo! 2 colonne sole — stessa colonna = stesso genere.',
  theme: 'disco-70s',
  vinyls: [
    { id: 'v1', color: '#D7263D', genre: 'Rock',  year: 1975, artist: 'Patti Smith',        album: 'Horses', cover: cover('/covers/patti-smith-horses.jpg') },
    { id: 'v2', color: '#C0392B', genre: 'Rock',  year: 1988, artist: 'The Pixies',         album: 'Surfer Rosa', cover: cover('/covers/the-pixies-surfer-rosa.jpg') },
    { id: 'v3', color: '#A93226', genre: 'Rock',  year: 1996, artist: 'Beck',               album: 'Odelay', cover: cover('/covers/beck-odelay.jpg') },
    { id: 'v4', color: '#7B1F16', genre: 'Rock',  year: 2003, artist: 'The White Stripes',  album: 'Elephant', cover: cover('/covers/the-white-stripes-elephant.jpg') },
    { id: 'v5', color: '#2563EB', genre: 'Jazz',  year: 1955, artist: 'Art Tatum',          album: 'The Genius of Art Tatum', cover: cover('/covers/art-tatum-the-genius-of-art-tatum.jpg') },
    { id: 'v6', color: '#1A56DB', genre: 'Jazz',  year: 1969, artist: 'Wayne Shorter',      album: 'Moto Grosso Feio', cover: cover('/covers/wayne-shorter-moto-grosso-feio.jpg') },
    { id: 'v7', color: '#1A3FBD', genre: 'Jazz',  year: 1981, artist: 'Pat Metheny',        album: 'Offramp', cover: cover('/covers/pat-metheny-offramp.jpg') },
    { id: 'v8', color: '#102A9A', genre: 'Jazz',  year: 2002, artist: 'Norah Jones',        album: 'Come Away with Me', cover: cover('/covers/norah-jones-come-away-with-me.jpg') },
  ],
};

// ── Livello 20: CLIENTE VIP + GENERE ────────────────────────────────────────
// Cliente esigentissimo: vuole un vinile raro. Ma TUTTO lo scaffale va ordinato per genere!
// Doppia pressione: accontenta il cliente E mantieni l'ordine.
export const level20: Level = {
  id: 'level-20',
  rows: 2,
  cols: 4,
  sortRule: 'genre',
  mode: 'customer',
  customerName: 'Giovanni',
  parTime: 26,  // 8 vinyls × 3s × 1.1 (customer mode)
  hint: "Cliente VIP! Vuole Elettronica anni '00 — e lo scaffale va per genere!",
  theme: 'disco-70s',
  customerRequest: {
    genre: 'Electronic',
    era: '00s',
    targetRow: 0,
    targetCol: 3,
  },
  customerTimer: 40,
  vinyls: [
    { id: 'v1', color: '#F59E0B', genre: 'Electronic', year: 2001, artist: 'Daft Punk',         album: 'Discovery', isRare: true, cover: cover('/covers/daft-punk-discovery.jpg') },
    { id: 'v2', color: '#FBBF24', genre: 'Electronic', year: 2007, artist: 'Justice',           album: 'Cross', cover: cover('/covers/justice-cross.jpg') },
    { id: 'v3', color: '#D7263D', genre: 'Rock',        year: 1994, artist: 'Oasis',            album: 'Definitely Maybe', cover: cover('/covers/oasis-definitely-maybe.jpg') },
    { id: 'v4', color: '#C0392B', genre: 'Rock',        year: 2003, artist: 'The Strokes',      album: 'Room on Fire', cover: cover('/covers/the-strokes-room-on-fire.jpg') },
    { id: 'v5', color: '#2563EB', genre: 'Jazz',        year: 1999, artist: 'Diana Krall',      album: 'When I Look in Your Eyes', cover: cover('/covers/diana-krall-when-i-look-in-your-eyes.jpg') },
    { id: 'v6', color: '#1A56DB', genre: 'Jazz',        year: 2004, artist: 'Norah Jones',      album: 'Feels Like Home', cover: cover('/covers/norah-jones-feels-like-home.jpg') },
    { id: 'v7', color: '#EC4899', genre: 'Pop',         year: 2006, artist: 'Amy Winehouse',    album: 'Back to Black', isRare: true, cover: cover('/covers/amy-winehouse-back-to-black.jpg') },
    { id: 'v8', color: '#DB2777', genre: 'Pop',         year: 2008, artist: 'Adele',            album: '19', cover: cover('/covers/adele-19.jpg') },
  ],
};

// ── Livello 21: ARCHIVIO FINALE — RUSH + SLEEVE-MATCH ────────────────────────
// Il colpo finale: il negozio chiude tra 90 secondi.
// Scaffale 3×4 con sleeve-match su 10 dischi + 2 slot bloccati. Velocità e memoria!
export const level21: Level = {
  id: 'level-21',
  rows: 3,
  cols: 4,
  sortRule: 'free',
  mode: 'sleeve-match',
  parTime: 34,  // 10 vinyls × 3s × 1.15 (sleeve-match with rush pressure = 1.4 × 0.8 ≈ 1.15)
  hint: '🏆 Archivio finale! 10 dischi, 10 copertine — abbina tutto!',
  theme: 'disco-70s',
  blockedSlots: [
    { row: 1, col: 1 },
  ],
  vinyls: [
    { id: 'v1',  color: '#D7263D', genre: 'Rock',       year: 1972, artist: 'Neil Young',        album: 'Harvest', cover: cover('/covers/neil-young-harvest.jpg') },
    { id: 'v2',  color: '#2563EB', genre: 'Jazz',       year: 1959, artist: 'Dave Brubeck',      album: 'Time Out', isRare: true, cover: cover('/covers/dave-brubeck-time-out.jpg') },
    { id: 'v3',  color: '#EC4899', genre: 'Pop',        year: 1999, artist: 'Santana',           album: 'Supernatural', cover: cover('/covers/santana-supernatural.jpg') },
    { id: 'v4',  color: '#F97316', genre: 'Hip-Hop',    year: 1994, artist: 'Notorious B.I.G.',  album: 'Ready to Die', isRare: true, cover: cover('/covers/notorious-b-i-g-ready-to-die.jpg') },
    { id: 'v5',  color: '#10B981', genre: 'Soul',       year: 1976, artist: 'Stevie Wonder',     album: 'Songs in the Key of Life', cover: cover('/covers/stevie-wonder-songs-in-the-key-of-life.jpg') },
    { id: 'v6',  color: '#A78BFA', genre: 'Electronic', year: 1997, artist: 'Daft Punk',         album: 'Homework', cover: cover('/covers/daft-punk-homework.jpg') },
    { id: 'v7',  color: '#F59E0B', genre: 'Funk',       year: 1973, artist: 'Curtis Mayfield',   album: 'Superfly', cover: cover('/covers/curtis-mayfield-superfly.jpg') },
    { id: 'v8',  color: '#8B5CF6', genre: 'Blues',      year: 1958, artist: 'B.B. King',         album: 'Singin\' the Blues', cover: cover('/covers/b-b-king-singin.jpg') },
    { id: 'v9',  color: '#6EE7B7', genre: 'Indie',      year: 2012, artist: 'Frank Ocean',       album: 'Channel Orange', isRare: true, cover: cover('/covers/frank-ocean-channel-orange.jpg') },
    { id: 'v10', color: '#60A5FA', genre: 'Classica',   year: 1971, artist: 'Ennio Morricone',   album: 'The Good, The Bad and The Ugly', cover: cover('/covers/ennio-morricone-the-good-the-bad-and-the-ugly.jpg') },
  ],
  sleeveTargets: [
    { row: 0, col: 0, vinylId: 'v2'  },  // Jazz - Brubeck (raro)
    { row: 0, col: 1, vinylId: 'v8'  },  // Blues - B.B. King
    { row: 0, col: 2, vinylId: 'v5'  },  // Soul - Stevie Wonder
    { row: 0, col: 3, vinylId: 'v1'  },  // Rock - Neil Young
    { row: 1, col: 0, vinylId: 'v10' },  // Classica - Morricone
    // row 1 col 1 → bloccato
    { row: 1, col: 2, vinylId: 'v4'  },  // Hip-Hop - Biggie (raro)
    { row: 1, col: 3, vinylId: 'v7'  },  // Funk - Mayfield
    { row: 2, col: 0, vinylId: 'v9'  },  // Indie - Frank Ocean (raro)
    { row: 2, col: 1, vinylId: 'v6'  },  // Electronic - Daft Punk
    { row: 2, col: 2, vinylId: 'v3'  },  // Pop - Santana
    // row 2 col 3 → bloccato
  ],
};

// ═══════════════════════════════════════════════════════════════════════════════
// LIVELLI 22-36: NUOVE MODALITÀ E TEMI
// ═══════════════════════════════════════════════════════════════════════════════

// ── Livello 22: COLOR-BLIND — tutti stesso colore, leggi solo le etichette ────
// Tutti i vinili hanno colore neutro. Il giocatore deve leggere artist/album.
export const level22: Level = {
  id: 'level-22',
  rows: 2,
  cols: 3,
  sortRule: 'free',
  mode: 'color-blind',
  parTime: 25,
  hint: 'Tutti i dischi hanno lo stesso colore! Leggi le etichette per distinguere.',
  theme: 'classic',
  vinyls: [
    { id: 'v1', color: '#8B7355', genre: 'Rock',    year: 1971, artist: 'Led Zeppelin',   album: 'IV', cover: cover('/covers/led-zeppelin-led-zeppelin-iv.jpg') },
    { id: 'v2', color: '#8B7355', genre: 'Jazz',    year: 1959, artist: 'Miles Davis',    album: 'Kind of Blue', cover: cover('/covers/miles-davis-kind-of-blue.jpg') },
    { id: 'v3', color: '#8B7355', genre: 'Pop',     year: 1984, artist: 'Prince',         album: 'Purple Rain', cover: cover('/covers/prince-purple-rain.jpg') },
    { id: 'v4', color: '#8B7355', genre: 'Hip-Hop', year: 1994, artist: 'Nas',            album: 'Illmatic', cover: cover('/covers/nas-illmatic.jpg') },
    { id: 'v5', color: '#8B7355', genre: 'Soul',    year: 1971, artist: 'Marvin Gaye',    album: "What's Going On", cover: cover('/covers/marvin-gaye-what-s-going-on.jpg') },
    { id: 'v6', color: '#8B7355', genre: 'Funk',    year: 1977, artist: 'Stevie Wonder',  album: 'Songs in the Key of Life', cover: cover('/covers/stevie-wonder-songs-in-the-key-of-life.jpg') },
  ],
};

// ── Livello 23: PILE-UP — vinili arrivano in coda, prendi solo quello in cima ──
// I dischi arrivano uno alla volta. Piano piano la pila cresce.
export const level23: Level = {
  id: 'level-23',
  rows: 2,
  cols: 4,
  sortRule: 'genre',
  mode: 'pile-up',
  pileGrowthRate: 8,  // nuovo vinile ogni 8 secondi
  parTime: 50,
  hint: 'I dischi arrivano in pila! Prendi quello in cima e ordinali per genere.',
  theme: 'indie-loft',
  vinyls: [
    { id: 'v1', color: '#D7263D', genre: 'Rock',    year: 1970, artist: 'The Beatles',    album: 'Let It Be', cover: cover('/covers/the-beatles-abbey-road.jpg') },
    { id: 'v2', color: '#C0392B', genre: 'Rock',    year: 1980, artist: 'AC/DC',          album: 'Back in Black', cover: cover('/covers/ac-dc-back-in-black.jpg') },
    { id: 'v3', color: '#2563EB', genre: 'Jazz',    year: 1964, artist: 'John Coltrane',  album: 'A Love Supreme', cover: cover('/covers/john-coltrane-a-love-supreme.jpg') },
    { id: 'v4', color: '#1A56DB', genre: 'Jazz',    year: 1959, artist: 'Dave Brubeck',   album: 'Time Out', cover: cover('/covers/dave-brubeck-time-out.jpg') },
    { id: 'v5', color: '#EC4899', genre: 'Pop',     year: 1982, artist: 'Michael Jackson', album: 'Thriller', cover: cover('/covers/michael-jackson-thriller.jpg') },
    { id: 'v6', color: '#F472B6', genre: 'Pop',     year: 1998, artist: 'Britney Spears', album: 'Baby One More Time', cover: cover('/covers/madonna-like-a-prayer.jpg') },
    { id: 'v7', color: '#F97316', genre: 'Hip-Hop', year: 2000, artist: 'Eminem',         album: 'Marshall Mathers', cover: cover('/covers/dr-dre-the-chronic.jpg') },
    { id: 'v8', color: '#EA7C1E', genre: 'Hip-Hop', year: 2010, artist: 'Kanye West',     album: 'My Beautiful Dark', cover: cover('/covers/kanye-west-the-college-dropout.jpg') },
  ],
};

// ── Livello 24: DOUBLE-SIDED — vinili con due lati A/B, click per girare ──────
// Ogni disco ha due lati con generi diversi. Click per girare, poi posiziona.
export const level24: Level = {
  id: 'level-24',
  rows: 2,
  cols: 3,
  sortRule: 'genre',
  mode: 'double-sided',
  parTime: 35,
  hint: 'Ogni disco ha due lati! Clicca per girarlo e rivelare il lato B.',
  theme: 'jazz-club',
  currentSide: 'A',
  vinyls: [
    {
      id: 'v1', color: '#D7263D', genre: 'Rock', year: 1970, artist: 'Pink Floyd', album: 'Atom Heart Mother',
      sideA: { genre: 'Rock', year: 1970 }, sideB: { genre: 'Jazz', year: 1969 },
      cover: cover('/covers/pink-floyd-the-dark-side-of-the-moon.jpg')
    },
    {
      id: 'v2', color: '#2563EB', genre: 'Jazz', year: 1965, artist: 'Herbie Hancock', album: 'Maiden Voyage',
      sideA: { genre: 'Jazz', year: 1965 }, sideB: { genre: 'Funk', year: 1970 },
      cover: cover('/covers/herbie-hancock-empyrean-isles.jpg')
    },
    {
      id: 'v3', color: '#EC4899', genre: 'Pop', year: 1985, artist: 'Madonna', album: 'Like a Virgin',
      sideA: { genre: 'Pop', year: 1985 }, sideB: { genre: 'Dance', year: 1983 },
      cover: cover('/covers/madonna-like-a-prayer.jpg')
    },
    {
      id: 'v4', color: '#F97316', genre: 'Funk', year: 1972, artist: 'James Brown', album: 'Get on the Good Foot',
      sideA: { genre: 'Funk', year: 1972 }, sideB: { genre: 'Soul', year: 1968 },
      cover: cover('/covers/james-brown-sex-machine.jpg')
    },
    {
      id: 'v5', color: '#10B981', genre: 'Soul', year: 1973, artist: 'Stevie Wonder', album: 'Innervisions',
      sideA: { genre: 'Soul', year: 1973 }, sideB: { genre: 'Pop', year: 1980 },
      cover: cover('/covers/stevie-wonder-songs-in-the-key-of-life.jpg')
    },
    {
      id: 'v6', color: '#A78BFA', genre: 'Electronic', year: 1997, artist: 'Daft Punk', album: 'Homework',
      sideA: { genre: 'Electronic', year: 1997 }, sideB: { genre: 'Hip-Hop', year: 1998 },
      cover: cover('/covers/daft-punk-homework.jpg')
    },
  ],
};

// ── Livello 25: VINYL-SWAP — scaffale pieno ma disordinato, scambia i dischi ──
// Trascina un vinile su un altro per scambiarli di posto.
export const level25: Level = {
  id: 'level-25',
  rows: 2,
  cols: 3,
  sortRule: 'genre',
  mode: 'vinyl-swap',
  parTime: 30,
  hint: 'Lo scaffale è pieno ma disordinato! Trascina un disco su un altro per scambiarli.',
  theme: 'classic',
  vinyls: [
    { id: 'v1', color: '#D7263D', genre: 'Rock',    year: 1971, artist: 'Led Zeppelin',  album: 'IV', cover: cover('/covers/led-zeppelin-led-zeppelin-iv.jpg') },
    { id: 'v2', color: '#2563EB', genre: 'Jazz',    year: 1959, artist: 'Miles Davis',   album: 'Kind of Blue', cover: cover('/covers/miles-davis-kind-of-blue.jpg') },
    { id: 'v3', color: '#EC4899', genre: 'Pop',     year: 1982, artist: 'Michael Jackson', album: 'Thriller', cover: cover('/covers/michael-jackson-thriller.jpg') },
    { id: 'v4', color: '#F97316', genre: 'Hip-Hop', year: 1994, artist: 'Nas',           album: 'Illmatic', cover: cover('/covers/nas-illmatic.jpg') },
    { id: 'v5', color: '#10B981', genre: 'Soul',    year: 1971, artist: 'Marvin Gaye',   album: "What's Going On", cover: cover('/covers/marvin-gaye-what-s-going-on.jpg') },
    { id: 'v6', color: '#A78BFA', genre: 'Funk',    year: 1977, artist: 'Stevie Wonder', album: 'Songs in the Key of Life', cover: cover('/covers/stevie-wonder-songs-in-the-key-of-life.jpg') },
  ],
};

// ── Livello 26: GENERE in INDIE LOFT ─────────────────────────────────────────
// Ordina per genere in un loft industriale hipster.
export const level26: Level = {
  id: 'level-26',
  rows: 2,
  cols: 4,
  sortRule: 'genre',
  mode: 'genre',
  parTime: 29,
  hint: 'Il loft hipster! Raggruppa i generi nella stessa colonna.',
  theme: 'indie-loft',
  vinyls: [
    { id: 'v1', color: '#D7263D', genre: 'Rock',    year: 1991, artist: 'Nirvana',        album: 'Nevermind', cover: cover('/covers/nirvana-nevermind.jpg') },
    { id: 'v2', color: '#C0392B', genre: 'Rock',    year: 1994, artist: 'Oasis',          album: 'Definitely Maybe', cover: cover('/covers/oasis-definitely-maybe.jpg') },
    { id: 'v3', color: '#2563EB', genre: 'Jazz',    year: 1965, artist: 'Herbie Hancock', album: 'Maiden Voyage', cover: cover('/covers/herbie-hancock-empyrean-isles.jpg') },
    { id: 'v4', color: '#1A56DB', genre: 'Jazz',    year: 1959, artist: 'Miles Davis',    album: 'Kind of Blue', cover: cover('/covers/miles-davis-kind-of-blue.jpg') },
    { id: 'v5', color: '#EC4899', genre: 'Pop',     year: 2011, artist: 'Adele',          album: '21', cover: cover('/covers/adele-19.jpg') },
    { id: 'v6', color: '#F472B6', genre: 'Pop',     year: 2016, artist: 'Beyoncé',        album: 'Lemonade', cover: cover('/covers/beyonc-dangerously-in-love.jpg') },
    { id: 'v7', color: '#F97316', genre: 'Hip-Hop', year: 2015, artist: 'Kendrick Lamar', album: 'To Pimp a Butterfly', cover: cover('/covers/kanye-west-the-college-dropout.jpg') },
    { id: 'v8', color: '#EA7C1E', genre: 'Hip-Hop', year: 2017, artist: 'Kendrick Lamar', album: 'DAMN.', cover: cover('/covers/outkast-atliens.jpg') },
  ],
};

// ── Livello 27: CRONOLOGICO in ELECTRONIC NEON ───────────────────────────────
// Ordina per anno in un club cyberpunk neonato.
export const level27: Level = {
  id: 'level-27',
  rows: 2,
  cols: 4,
  sortRule: 'chronological',
  mode: 'chronological',
  parTime: 31,
  hint: 'Club neon! Ordina per anno: più vecchio a sinistra ← più nuovo a destra →',
  theme: 'electronic-neon',
  vinyls: [
    { id: 'v1', color: '#8B5CF6', genre: 'Electronic', year: 1977, artist: 'Kraftwerk',      album: 'Trans-Europe Express', cover: cover('/covers/kraftwerk-tour-de-france.jpg') },
    { id: 'v2', color: '#2563EB', genre: 'Electronic', year: 1986, artist: 'New Order',      album: 'Brotherhood', cover: cover('/covers/daft-punk-discovery.jpg') },
    { id: 'v3', color: '#D7263D', genre: 'Electronic', year: 1991, artist: 'Orbital',         album: 'Orbital', cover: cover('/covers/orbital-orbital-ii.jpg') },
    { id: 'v4', color: '#F97316', genre: 'Electronic', year: 1997, artist: 'Daft Punk',       album: 'Homework', cover: cover('/covers/daft-punk-homework.jpg') },
    { id: 'v5', color: '#EC4899', genre: 'Electronic', year: 2001, artist: 'Daft Punk',       album: 'Discovery', isRare: true, cover: cover('/covers/daft-punk-discovery.jpg') },
    { id: 'v6', color: '#10B981', genre: 'Electronic', year: 2007, artist: 'Justice',         album: 'Cross', cover: cover('/covers/justice-cross.jpg') },
    { id: 'v7', color: '#F59E0B', genre: 'Electronic', year: 2013, artist: 'Daft Punk',       album: 'RAM', cover: cover('/covers/daft-punk-homework.jpg') },
    { id: 'v8', color: '#6EE7B7', genre: 'Electronic', year: 2020, artist: 'Dua Lipa',        album: 'Future Nostalgia', isRare: true, cover: cover('/covers/madonna-like-a-prayer.jpg') },
  ],
};

// ── Livello 28: CUSTOMER in INDIE LOFT ───────────────────────────────────────
// Il cliente vuole un vinile specifico nel loft.
export const level28: Level = {
  id: 'level-28',
  rows: 2,
  cols: 4,
  sortRule: 'free',
  mode: 'customer',
  customerName: 'Aurora',
  parTime: 28,
  hint: "Aurora vuole un vinile Indie anni 2010 — mettilo in cima a sinistra!",
  theme: 'indie-loft',
  customerRequest: {
    genre: 'Indie',
    era: '10s',
    targetRow: 0,
    targetCol: 0,
  },
  customerTimer: 35,
  vinyls: [
    { id: 'v1', color: '#6EE7B7', genre: 'Indie',    year: 2011, artist: 'Bon Iver',        album: 'Bon Iver', isRare: true, cover: cover('/covers/bon-iver-bon-iver.jpg') },
    { id: 'v2', color: '#D7263D', genre: 'Rock',     year: 1997, artist: 'Radiohead',       album: 'OK Computer', cover: cover('/covers/radiohead-in-rainbows.jpg') },
    { id: 'v3', color: '#2563EB', genre: 'Jazz',     year: 1999, artist: 'St. Germain',     album: 'Tourist', cover: cover('/covers/miles-davis-kind-of-blue.jpg') },
    { id: 'v4', color: '#EC4899', genre: 'Pop',      year: 2008, artist: 'MGMT',            album: 'Oracular Spectacular', cover: cover('/covers/madonna-like-a-prayer.jpg') },
    { id: 'v5', color: '#F97316', genre: 'Hip-Hop',  year: 2010, artist: 'Kanye West',      album: 'My Beautiful Dark', cover: cover('/covers/kanye-west-the-college-dropout.jpg') },
    { id: 'v6', color: '#A78BFA', genre: 'Electronic', year: 2005, artist: 'LCD Soundsystem', album: 'Sound of Silver', cover: cover('/covers/lcd-soundsystem-sound-of-silver.jpg') },
    { id: 'v7', color: '#10B981', genre: 'Soul',     year: 2016, artist: 'Leon Bridges',    album: 'Coming Home', cover: cover('/covers/marvin-gaye-what-s-going-on.jpg') },
    { id: 'v8', color: '#F59E0B', genre: 'Funk',     year: 2015, artist: 'Bruno Mars',      album: 'Uptown Special', cover: cover('/covers/james-brown-sex-machine.jpg') },
  ],
};

// ── Livello 29: BLACKOUT in VINYL STORAGE ────────────────────────────────────
// Magazzino buio — memorizza prima che le etichette spariscano!
export const level29: Level = {
  id: 'level-29',
  rows: 2,
  cols: 3,
  sortRule: 'genre',
  mode: 'blackout',
  parTime: 28,
  hint: 'Magazzino buio! Hai 5 secondi per memorizzare — poi le etichette spariscono!',
  theme: 'vinyl-storage',
  vinyls: [
    { id: 'v1', color: '#D7263D', genre: 'Rock',    year: 1969, artist: 'The Beatles',     album: 'Abbey Road', cover: cover('/covers/the-beatles-abbey-road.jpg') },
    { id: 'v2', color: '#C0392B', genre: 'Rock',    year: 1971, artist: 'Led Zeppelin',    album: 'IV', cover: cover('/covers/led-zeppelin-led-zeppelin-iv.jpg') },
    { id: 'v3', color: '#2563EB', genre: 'Jazz',    year: 1959, artist: 'Miles Davis',     album: 'Kind of Blue', cover: cover('/covers/miles-davis-kind-of-blue.jpg') },
    { id: 'v4', color: '#1A56DB', genre: 'Jazz',    year: 1964, artist: 'John Coltrane',   album: 'A Love Supreme', cover: cover('/covers/john-coltrane-a-love-supreme.jpg') },
    { id: 'v5', color: '#F97316', genre: 'Funk',    year: 1977, artist: 'Stevie Wonder',   album: 'Songs in the Key of Life', cover: cover('/covers/stevie-wonder-songs-in-the-key-of-life.jpg') },
    { id: 'v6', color: '#EA7C1E', genre: 'Funk',    year: 1973, artist: 'James Brown',     album: 'The Payback', cover: cover('/covers/james-brown-sex-machine.jpg') },
  ],
};

// ── Livello 30: PILE-UP + GENERE in ELECTRONIC NEON ─────────────────────────
// La pila cresce nel club — ordina per genere mentre arrivano!
export const level30: Level = {
  id: 'level-30',
  rows: 3,
  cols: 4,
  sortRule: 'genre',
  mode: 'pile-up',
  pileGrowthRate: 6,
  parTime: 55,
  hint: 'Neon pile-up! I dischi arrivano veloci — ordinali per genere!',
  theme: 'electronic-neon',
  vinyls: [
    { id: 'v1', color: '#D7263D', genre: 'Rock',    year: 1991, artist: 'Nirvana',        album: 'Nevermind', cover: cover('/covers/nirvana-nevermind.jpg') },
    { id: 'v2', color: '#C0392B', genre: 'Rock',    year: 1994, artist: 'Soundgarden',    album: 'Superunknown', cover: cover('/covers/soundgarden-down-on-the-upside.jpg') },
    { id: 'v3', color: '#A93226', genre: 'Rock',    year: 2000, artist: 'Radiohead',      album: 'Kid A', cover: cover('/covers/radiohead-in-rainbows.jpg') },
    { id: 'v4', color: '#2563EB', genre: 'Jazz',    year: 1959, artist: 'Miles Davis',    album: 'Kind of Blue', cover: cover('/covers/miles-davis-kind-of-blue.jpg') },
    { id: 'v5', color: '#1A56DB', genre: 'Jazz',    year: 1965, artist: 'Herbie Hancock', album: 'Maiden Voyage', cover: cover('/covers/herbie-hancock-empyrean-isles.jpg') },
    { id: 'v6', color: '#EC4899', genre: 'Pop',     year: 1982, artist: 'Michael Jackson', album: 'Thriller', cover: cover('/covers/michael-jackson-thriller.jpg') },
    { id: 'v7', color: '#F472B6', genre: 'Pop',     year: 2016, artist: 'Beyoncé',        album: 'Lemonade', cover: cover('/covers/beyonc-dangerously-in-love.jpg') },
    { id: 'v8', color: '#F97316', genre: 'Hip-Hop', year: 1994, artist: 'Nas',            album: 'Illmatic', isRare: true, cover: cover('/covers/nas-illmatic.jpg') },
    { id: 'v9', color: '#EA7C1E', genre: 'Hip-Hop', year: 2015, artist: 'Kendrick Lamar', album: 'To Pimp a Butterfly', cover: cover('/covers/kanye-west-the-college-dropout.jpg') },
    { id: 'v10', color: '#A78BFA', genre: 'Electronic', year: 2001, artist: 'Daft Punk',  album: 'Discovery', isRare: true, cover: cover('/covers/daft-punk-discovery.jpg') },
  ],
};

// ── Livello 31: DOUBLE-SIDED + CRONOLOGICO in JAZZ CLUB ─────────────────────
// Gira i dischi per trovare l'anno giusto, poi ordinali cronologicamente.
export const level31: Level = {
  id: 'level-31',
  rows: 2,
  cols: 4,
  sortRule: 'chronological',
  mode: 'double-sided',
  parTime: 40,
  hint: 'Gira i dischi per trovare l\'anno! Poi ordinali: vecchio ← → nuovo',
  theme: 'jazz-club',
  currentSide: 'A',
  vinyls: [
    {
      id: 'v1', color: '#8B5CF6', genre: 'Blues', year: 1955, artist: 'Muddy Waters', album: 'Mannish Boy',
      sideA: { genre: 'Blues', year: 1955 }, sideB: { genre: 'Blues', year: 1960 },
      cover: cover('/covers/muddy-waters-louisiana-blues.jpg')
    },
    {
      id: 'v2', color: '#2563EB', genre: 'Jazz', year: 1959, artist: 'Miles Davis', album: 'Kind of Blue',
      sideA: { genre: 'Jazz', year: 1959 }, sideB: { genre: 'Jazz', year: 1965 },
      cover: cover('/covers/miles-davis-kind-of-blue.jpg')
    },
    {
      id: 'v3', color: '#D7263D', genre: 'Rock', year: 1967, artist: 'The Beatles', album: 'Sgt. Pepper',
      sideA: { genre: 'Rock', year: 1967 }, sideB: { genre: 'Rock', year: 1970 },
      isRare: true, cover: cover('/covers/the-beatles-abbey-road.jpg')
    },
    {
      id: 'v4', color: '#F97316', genre: 'Funk', year: 1972, artist: 'James Brown', album: 'Get on the Good Foot',
      sideA: { genre: 'Funk', year: 1972 }, sideB: { genre: 'Funk', year: 1978 },
      cover: cover('/covers/james-brown-sex-machine.jpg')
    },
    {
      id: 'v5', color: '#EC4899', genre: 'Pop', year: 1983, artist: 'Michael Jackson', album: 'Thriller',
      sideA: { genre: 'Pop', year: 1983 }, sideB: { genre: 'Pop', year: 1987 },
      cover: cover('/covers/michael-jackson-thriller.jpg')
    },
    {
      id: 'v6', color: '#10B981', genre: 'Hip-Hop', year: 1994, artist: 'Nas', album: 'Illmatic',
      sideA: { genre: 'Hip-Hop', year: 1994 }, sideB: { genre: 'Hip-Hop', year: 1999 },
      isRare: true, cover: cover('/covers/nas-illmatic.jpg')
    },
    {
      id: 'v7', color: '#F59E0B', genre: 'Electronic', year: 1997, artist: 'Daft Punk', album: 'Homework',
      sideA: { genre: 'Electronic', year: 1997 }, sideB: { genre: 'Electronic', year: 2001 },
      cover: cover('/covers/daft-punk-homework.jpg')
    },
    {
      id: 'v8', color: '#6EE7B7', genre: 'Indie', year: 2011, artist: 'Bon Iver', album: 'Bon Iver',
      sideA: { genre: 'Indie', year: 2011 }, sideB: { genre: 'Indie', year: 2016 },
      isRare: true, cover: cover('/covers/bon-iver-bon-iver.jpg')
    },
  ],
};

// ── Livello 32: RUSH in VINYL STORAGE ───────────────────────────────────────
// Il magazzino chiude! 60 secondi per sistemare 10 dischi.
export const level32: Level = {
  id: 'level-32',
  rows: 3,
  cols: 4,
  sortRule: 'chronological',
  mode: 'rush',
  rushTime: 60,
  parTime: 24,
  hint: 'Il magazzino chiude! 60 secondi per ordinare tutto per anno!',
  theme: 'vinyl-storage',
  vinyls: [
    { id: 'v1',  color: '#8B5CF6', genre: 'Blues',      year: 1940, artist: 'Robert Johnson',    album: 'King of the Delta Blues', isRare: true, cover: cover('/covers/robert-johnson-king-of-the-delta-blues.jpg') },
    { id: 'v2',  color: '#2563EB', genre: 'Jazz',       year: 1956, artist: 'Miles Davis',        album: 'Round About Midnight', cover: cover('/covers/miles-davis-kind-of-blue.jpg') },
    { id: 'v3',  color: '#D7263D', genre: 'Rock',       year: 1965, artist: 'The Beatles',        album: 'Rubber Soul', cover: cover('/covers/the-beatles-abbey-road.jpg') },
    { id: 'v4',  color: '#F97316', genre: 'Funk',       year: 1970, artist: 'James Brown',        album: 'Sex Machine', cover: cover('/covers/james-brown-sex-machine.jpg') },
    { id: 'v5',  color: '#EC4899', genre: 'Pop',        year: 1977, artist: 'Fleetwood Mac',      album: 'Rumours', cover: cover('/covers/fleetwood-mac-rumours.jpg') },
    { id: 'v6',  color: '#10B981', genre: 'Hip-Hop',    year: 1988, artist: 'Public Enemy',       album: 'It Takes a Nation', cover: cover('/covers/dr-dre-the-chronic.jpg') },
    { id: 'v7',  color: '#F59E0B', genre: 'Electronic', year: 1997, artist: 'Daft Punk',          album: 'Homework', cover: cover('/covers/daft-punk-homework.jpg') },
    { id: 'v8',  color: '#6EE7B7', genre: 'Indie',      year: 2004, artist: 'Arcade Fire',        album: 'Funeral', isRare: true, cover: cover('/covers/the-arcade-fire-funeral.jpg') },
    { id: 'v9',  color: '#A78BFA', genre: 'Soul',       year: 2013, artist: 'Daft Punk',          album: 'RAM', cover: cover('/covers/daft-punk-discovery.jpg') },
    { id: 'v10', color: '#34D399', genre: 'Pop',        year: 2020, artist: 'Dua Lipa',           album: 'Future Nostalgia', cover: cover('/covers/madonna-like-a-prayer.jpg') },
  ],
};

// ── Livello 33: COLOR-BLIND + CRONOLOGICO in INDIE LOFT ────────────────────
// Stesso colore, ma devi ordinare per anno. Difficile!
export const level33: Level = {
  id: 'level-33',
  rows: 2,
  cols: 4,
  sortRule: 'chronological',
  mode: 'color-blind',
  parTime: 35,
  hint: 'Tutti stesso colore! Leggi bene gli anni e ordina: vecchio ← → nuovo',
  theme: 'indie-loft',
  vinyls: [
    { id: 'v1', color: '#8B7355', genre: 'Blues',    year: 1950, artist: 'Muddy Waters',    album: 'Rolling Stone', cover: cover('/covers/muddy-waters-louisiana-blues.jpg') },
    { id: 'v2', color: '#8B7355', genre: 'Jazz',     year: 1959, artist: 'Dave Brubeck',    album: 'Time Out', isRare: true, cover: cover('/covers/dave-brubeck-time-out.jpg') },
    { id: 'v3', color: '#8B7355', genre: 'Rock',     year: 1969, artist: 'The Beatles',     album: 'Abbey Road', cover: cover('/covers/the-beatles-abbey-road.jpg') },
    { id: 'v4', color: '#8B7355', genre: 'Funk',     year: 1974, artist: 'James Brown',     album: 'Hell', cover: cover('/covers/james-brown-sex-machine.jpg') },
    { id: 'v5', color: '#8B7355', genre: 'Pop',      year: 1984, artist: 'Prince',          album: 'Purple Rain', isRare: true, cover: cover('/covers/prince-purple-rain.jpg') },
    { id: 'v6', color: '#8B7355', genre: 'Hip-Hop',  year: 1993, artist: 'Wu-Tang Clan',    album: '36 Chambers', cover: cover('/covers/wu-tang-clan-enter-the-wu-tang.jpg') },
    { id: 'v7', color: '#8B7355', genre: 'Electronic', year: 2001, artist: 'Daft Punk',     album: 'Discovery', cover: cover('/covers/daft-punk-discovery.jpg') },
    { id: 'v8', color: '#8B7355', genre: 'Indie',    year: 2011, artist: 'Bon Iver',        album: 'Bon Iver', cover: cover('/covers/bon-iver-bon-iver.jpg') },
  ],
};

// ── Livello 34: VINYL-SWAP + GENERE in ELECTRONIC NEON ──────────────────────
// Scambia i dischi nel club neonato per raggruppare per genere.
export const level34: Level = {
  id: 'level-34',
  rows: 3,
  cols: 4,
  sortRule: 'genre',
  mode: 'vinyl-swap',
  parTime: 38,
  hint: 'Scambia i dischi nel club! Trascina uno su un altro per scambiarli.',
  theme: 'electronic-neon',
  vinyls: [
    { id: 'v1',  color: '#D7263D', genre: 'Rock',       year: 1991, artist: 'Nirvana',         album: 'Nevermind', cover: cover('/covers/nirvana-nevermind.jpg') },
    { id: 'v2',  color: '#C0392B', genre: 'Rock',       year: 1994, artist: 'Soundgarden',     album: 'Superunknown', cover: cover('/covers/soundgarden-down-on-the-upside.jpg') },
    { id: 'v3',  color: '#A93226', genre: 'Rock',       year: 2000, artist: 'Radiohead',       album: 'Kid A', cover: cover('/covers/radiohead-in-rainbows.jpg') },
    { id: 'v4',  color: '#2563EB', genre: 'Jazz',       year: 1959, artist: 'Miles Davis',     album: 'Kind of Blue', isRare: true, cover: cover('/covers/miles-davis-kind-of-blue.jpg') },
    { id: 'v5',  color: '#1A56DB', genre: 'Jazz',       year: 1965, artist: 'Herbie Hancock',  album: 'Maiden Voyage', cover: cover('/covers/herbie-hancock-empyrean-isles.jpg') },
    { id: 'v6',  color: '#EC4899', genre: 'Pop',        year: 1982, artist: 'Michael Jackson', album: 'Thriller', cover: cover('/covers/michael-jackson-thriller.jpg') },
    { id: 'v7',  color: '#F472B6', genre: 'Pop',        year: 2016, artist: 'Beyoncé',         album: 'Lemonade', cover: cover('/covers/beyonc-dangerously-in-love.jpg') },
    { id: 'v8',  color: '#F97316', genre: 'Hip-Hop',    year: 1994, artist: 'Nas',             album: 'Illmatic', isRare: true, cover: cover('/covers/nas-illmatic.jpg') },
    { id: 'v9',  color: '#EA7C1E', genre: 'Hip-Hop',    year: 2015, artist: 'Kendrick Lamar',  album: 'To Pimp a Butterfly', cover: cover('/covers/kanye-west-the-college-dropout.jpg') },
    { id: 'v10', color: '#A78BFA', genre: 'Electronic', year: 2001, artist: 'Daft Punk',       album: 'Discovery', isRare: true, cover: cover('/covers/daft-punk-discovery.jpg') },
  ],
};

// ── Livello 35: PILE-UP + CUSTOMER in VINYL STORAGE ─────────────────────────
// I dischi arrivano mentre il cliente aspetta!
export const level35: Level = {
  id: 'level-35',
  rows: 2,
  cols: 4,
  sortRule: 'free',
  mode: 'pile-up',
  pileGrowthRate: 7,
  customerName: 'Diego',
  parTime: 45,
  hint: 'Diego vuole Funk anni 70 — i dischi arrivano in pila! Sbrigati!',
  theme: 'vinyl-storage',
  customerRequest: {
    genre: 'Funk',
    era: '70s',
    targetRow: 0,
    targetCol: 0,
  },
  customerTimer: 40,
  vinyls: [
    { id: 'v1', color: '#F97316', genre: 'Funk',    year: 1970, artist: 'James Brown',     album: 'Sex Machine', isRare: true, cover: cover('/covers/james-brown-sex-machine.jpg') },
    { id: 'v2', color: '#D7263D', genre: 'Rock',    year: 1971, artist: 'Led Zeppelin',    album: 'IV', cover: cover('/covers/led-zeppelin-led-zeppelin-iv.jpg') },
    { id: 'v3', color: '#2563EB', genre: 'Jazz',    year: 1959, artist: 'Miles Davis',     album: 'Kind of Blue', cover: cover('/covers/miles-davis-kind-of-blue.jpg') },
    { id: 'v4', color: '#EC4899', genre: 'Pop',     year: 1982, artist: 'Michael Jackson', album: 'Thriller', cover: cover('/covers/michael-jackson-thriller.jpg') },
    { id: 'v5', color: '#10B981', genre: 'Soul',    year: 1971, artist: 'Marvin Gaye',     album: "What's Going On", cover: cover('/covers/marvin-gaye-what-s-going-on.jpg') },
    { id: 'v6', color: '#A78BFA', genre: 'Electronic', year: 1977, artist: 'Kraftwerk',    album: 'Trans-Europe', cover: cover('/covers/kraftwerk-tour-de-france.jpg') },
    { id: 'v7', color: '#EA7C1E', genre: 'Funk',    year: 1975, artist: 'Parliament',      album: 'Mothership', cover: cover('/covers/parliament-osmium.jpg') },
    { id: 'v8', color: '#F59E0B', genre: 'Funk',    year: 1977, artist: 'Stevie Wonder',   album: 'Songs in the Key', cover: cover('/covers/stevie-wonder-songs-in-the-key-of-life.jpg') },
  ],
};

// ── Livello 36: RUSH + DOUBLE-SIDED — FINALE SUPREMO ───────────────────────
// 12 dischi, 90 secondi, ogni disco ha due lati. La sfida finale!
export const level36: Level = {
  id: 'level-36',
  rows: 3,
  cols: 5,
  sortRule: 'chronological',
  mode: 'double-sided',
  rushTime: 90,
  parTime: 36,
  hint: 'FINALE SUPREMO! 90 secondi, gira i dischi, ordinali per anno!',
  theme: 'vinyl-storage',
  currentSide: 'A',
  vinyls: [
    {
      id: 'v1', color: '#8B5CF6', genre: 'Blues', year: 1936, artist: 'Robert Johnson', album: 'Cross Road Blues',
      sideA: { genre: 'Blues', year: 1936 }, sideB: { genre: 'Blues', year: 1938 },
      isRare: true, cover: cover('/covers/robert-johnson-cross-road-blues.jpg')
    },
    {
      id: 'v2', color: '#6D28D9', genre: 'Jazz', year: 1945, artist: 'Charlie Parker', album: 'Ko Ko',
      sideA: { genre: 'Jazz', year: 1945 }, sideB: { genre: 'Jazz', year: 1950 },
      cover: cover('/covers/thelonious-monk-brilliant-corners.jpg')
    },
    {
      id: 'v3', color: '#2563EB', genre: 'Jazz', year: 1959, artist: 'Miles Davis', album: 'Kind of Blue',
      sideA: { genre: 'Jazz', year: 1959 }, sideB: { genre: 'Jazz', year: 1964 },
      isRare: true, cover: cover('/covers/miles-davis-kind-of-blue.jpg')
    },
    {
      id: 'v4', color: '#D7263D', genre: 'Rock', year: 1965, artist: 'The Beatles', album: 'Rubber Soul',
      sideA: { genre: 'Rock', year: 1965 }, sideB: { genre: 'Rock', year: 1969 },
      isRare: true, cover: cover('/covers/the-beatles-abbey-road.jpg')
    },
    {
      id: 'v5', color: '#F97316', genre: 'Funk', year: 1970, artist: 'James Brown', album: 'Sex Machine',
      sideA: { genre: 'Funk', year: 1970 }, sideB: { genre: 'Funk', year: 1975 },
      cover: cover('/covers/james-brown-sex-machine.jpg')
    },
    {
      id: 'v6', color: '#EC4899', genre: 'Pop', year: 1982, artist: 'Michael Jackson', album: 'Thriller',
      sideA: { genre: 'Pop', year: 1982 }, sideB: { genre: 'Pop', year: 1987 },
      isRare: true, cover: cover('/covers/michael-jackson-thriller.jpg')
    },
    {
      id: 'v7', color: '#10B981', genre: 'Hip-Hop', year: 1991, artist: 'N.W.A.', album: 'Niggaz4Life',
      sideA: { genre: 'Hip-Hop', year: 1991 }, sideB: { genre: 'Hip-Hop', year: 1994 },
      cover: cover('/covers/n-w-a-niggaz4life.jpg')
    },
    {
      id: 'v8', color: '#F59E0B', genre: 'Electronic', year: 1997, artist: 'Daft Punk', album: 'Homework',
      sideA: { genre: 'Electronic', year: 1997 }, sideB: { genre: 'Electronic', year: 2001 },
      cover: cover('/covers/daft-punk-homework.jpg')
    },
    {
      id: 'v9', color: '#6EE7B7', genre: 'Indie', year: 2007, artist: 'Arcade Fire', album: 'Neon Bible',
      sideA: { genre: 'Indie', year: 2007 }, sideB: { genre: 'Indie', year: 2010 },
      isRare: true, cover: cover('/covers/the-arcade-fire-funeral.jpg')
    },
    {
      id: 'v10', color: '#A78BFA', genre: 'Soul', year: 2010, artist: 'Janelle Monáe', album: 'ArchAndroid',
      sideA: { genre: 'Soul', year: 2010 }, sideB: { genre: 'Soul', year: 2013 },
      cover: cover('/covers/janelle-mon-e-the-archandroid.jpg')
    },
    {
      id: 'v11', color: '#34D399', genre: 'Electronic', year: 2013, artist: 'Daft Punk', album: 'RAM',
      sideA: { genre: 'Electronic', year: 2013 }, sideB: { genre: 'Electronic', year: 2016 },
      isRare: true, cover: cover('/covers/daft-punk-discovery.jpg')
    },
    {
      id: 'v12', color: '#60A5FA', genre: 'Pop', year: 2020, artist: 'Dua Lipa', album: 'Future Nostalgia',
      sideA: { genre: 'Pop', year: 2020 }, sideB: { genre: 'Pop', year: 2021 },
      cover: cover('/covers/madonna-like-a-prayer.jpg')
    },
  ],
};

export const LEVELS: Level[] = [
  level1, level2, level3, level4, level5, level6, level7, level8, level9,
  level10, level11, level12, level13, level14, level15, level16, level17, level18,
  level19, level20, level21,
  level22, level23, level24, level25, level26, level27, level28, level29,
  level30, level31, level32, level33, level34, level35, level36,
];
