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
    { id: 'v1', color: '#D7263D', genre: 'Rock',    year: 1975, artist: 'Led Zeppelin',    album: 'Led Zeppelin IV' },
    { id: 'v2', color: '#2563EB', genre: 'Jazz',    year: 1959, artist: 'Miles Davis',     album: 'Kind of Blue' },
    { id: 'v3', color: '#EC4899', genre: 'Pop',     year: 1989, artist: 'Madonna',         album: 'Like a Prayer' },
    { id: 'v4', color: '#F97316', genre: 'Hip-Hop', year: 1992, artist: 'Dr. Dre',         album: 'The Chronic' },
    { id: 'v5', color: '#C0392B', genre: 'Rock',    year: 1969, artist: 'The Rolling Stones', album: 'Let It Bleed' },
    { id: 'v6', color: '#1A56DB', genre: 'Jazz',    year: 1965, artist: 'John Coltrane',   album: 'A Love Supreme' },
    { id: 'v7', color: '#F472B6', genre: 'Pop',     year: 2001, artist: 'Destiny\'s Child', album: 'Survivor' },
    { id: 'v8', color: '#EA7C1E', genre: 'Hip-Hop', year: 2003, artist: 'Jay-Z',           album: 'The Black Album' },
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
    { id: 'v1', color: '#8B5CF6', genre: 'Blues',      year: 1951, artist: 'Muddy Waters',    album: 'Louisiana Blues' },
    { id: 'v2', color: '#2563EB', genre: 'Jazz',       year: 1959, artist: 'Dave Brubeck',    album: 'Time Out' },
    { id: 'v3', color: '#D7263D', genre: 'Rock',       year: 1969, artist: 'The Beatles',     album: 'Abbey Road' },
    { id: 'v4', color: '#F97316', genre: 'Funk',       year: 1975, artist: 'James Brown',     album: 'Reality' },
    { id: 'v5', color: '#EC4899', genre: 'Pop',        year: 1983, artist: 'Michael Jackson', album: 'Thriller' },
    { id: 'v6', color: '#10B981', genre: 'Hip-Hop',    year: 1993, artist: 'A Tribe Called Quest', album: 'Midnight Marauders' },
    { id: 'v7', color: '#F59E0B', genre: 'Electronic', year: 2002, artist: 'Daft Punk',       album: 'Discovery' },
    { id: 'v8', color: '#6EE7B7', genre: 'Indie',      year: 2011, artist: 'Bon Iver',        album: 'Bon Iver' },
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
    { id: 'v1', color: '#D7263D', genre: 'Rock',       year: 1973, artist: 'Pink Floyd',      album: 'The Dark Side of the Moon' },
    { id: 'v2', color: '#2563EB', genre: 'Jazz',       year: 1961, artist: 'Bill Evans',      album: 'Waltz for Debby' },
    { id: 'v3', color: '#EC4899', genre: 'Pop',        year: 1984, artist: 'Prince',          album: 'Purple Rain' },
    { id: 'v4', color: '#F97316', genre: 'Rock',       year: 1992, artist: 'Nirvana',         album: 'Nevermind' },
    { id: 'v5', color: '#A78BFA', genre: 'Funk',       year: 1976, artist: 'Earth Wind & Fire', album: 'Spirit' },
    { id: 'v6', color: '#10B981', genre: 'Soul',       year: 1968, artist: 'Aretha Franklin', album: 'Lady Soul' },
    { id: 'v7', color: '#F59E0B', genre: 'Electronic', year: 2004, artist: 'Kraftwerk',       album: 'Tour de France' },
    { id: 'v8', color: '#6EE7B7', genre: 'Jazz',       year: 1975, artist: 'Herbie Hancock',  album: 'Man-Child' },
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
    { id: 'v1', color: '#8B5CF6', genre: 'Blues',    year: 1948, artist: 'Robert Johnson',   album: 'Cross Road Blues' },
    { id: 'v2', color: '#D7263D', genre: 'Rock',     year: 1966, artist: 'The Beach Boys',   album: 'Pet Sounds' },
    { id: 'v3', color: '#EC4899', genre: 'Pop',      year: 1979, artist: 'Blondie',          album: 'Eat to the Beat' },
    { id: 'v4', color: '#F97316', genre: 'Disco',    year: 1983, artist: 'Gloria Gaynor',    album: 'I Am Gloria Gaynor' },
    { id: 'v5', color: '#2563EB', genre: 'Hip-Hop',  year: 1991, artist: 'N.W.A.',           album: 'Niggaz4Life' },
    { id: 'v6', color: '#10B981', genre: 'Grunge',   year: 1997, artist: 'Soundgarden',      album: 'Down on the Upside' },
    { id: 'v7', color: '#F59E0B', genre: 'Electronic', year: 2006, artist: 'LCD Soundsystem', album: 'Sound of Silver' },
    { id: 'v8', color: '#A78BFA', genre: 'Indie',    year: 2015, artist: 'Sufjan Stevens',   album: 'Carrie & Lowell' },
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
    { row: 1, col: 0 },
  ],
  vinyls: [
    { id: 'v1', color: '#D7263D', genre: 'Rock',    year: 1971, artist: 'Black Sabbath',  album: 'Master of Reality' },
    { id: 'v2', color: '#C0392B', genre: 'Rock',    year: 1979, artist: 'AC/DC',           album: 'Highway to Hell' },
    { id: 'v3', color: '#2563EB', genre: 'Jazz',    year: 1963, artist: 'Stan Getz',       album: 'Getz/Gilberto' },
    { id: 'v4', color: '#1A56DB', genre: 'Jazz',    year: 1958, artist: 'Art Blakey',      album: 'Moanin\'' },
    { id: 'v5', color: '#EC4899', genre: 'Pop',     year: 1982, artist: 'ABBA',            album: 'The Visitors' },
    { id: 'v6', color: '#F472B6', genre: 'Pop',     year: 2003, artist: 'Beyoncé',         album: 'Dangerously in Love' },
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
    { id: 'v1', color: '#2563EB', genre: 'Jazz',       year: 1964, artist: 'John Coltrane',   album: 'A Love Supreme', isRare: true },
    { id: 'v2', color: '#D7263D', genre: 'Rock',       year: 1970, artist: 'Deep Purple',      album: 'In Rock' },
    { id: 'v3', color: '#EC4899', genre: 'Pop',        year: 1987, artist: 'Whitney Houston',  album: 'Whitney' },
    { id: 'v4', color: '#F97316', genre: 'Funk',       year: 1971, artist: 'Sly & the Family Stone', album: 'There\'s a Riot Goin\' On' },
    { id: 'v5', color: '#10B981', genre: 'Soul',       year: 1965, artist: 'Sam Cooke',        album: 'Shake' },
    { id: 'v6', color: '#A78BFA', genre: 'Jazz',       year: 1961, artist: 'Bill Evans',       album: 'Sunday at the Village Vanguard' },
    { id: 'v7', color: '#F59E0B', genre: 'Electronic', year: 1997, artist: 'The Prodigy',      album: 'Fat of the Land' },
    { id: 'v8', color: '#8B5CF6', genre: 'Blues',      year: 1967, artist: 'B.B. King',        album: 'Blues Is King', isRare: true },
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
  rushTime: 60,
  parTime: 24,  // 10 vinyls × 3s × 0.8 (rush mode = less time = harder)
  hint: '60 secondi! Ordina per anno con slot rotti. I dischi rari danno +300!',
  theme: 'jazz-club',
  blockedSlots: [
    { row: 0, col: 3 },
    { row: 2, col: 0 },
  ],
  vinyls: [
    { id: 'v1',  color: '#8B5CF6', genre: 'Blues',      year: 1936, artist: 'Robert Johnson',    album: 'Cross Road Blues', isRare: true },
    { id: 'v2',  color: '#2563EB', genre: 'Jazz',       year: 1957, artist: 'Thelonious Monk',   album: 'Brilliant Corners' },
    { id: 'v3',  color: '#D7263D', genre: 'Rock',       year: 1967, artist: 'Jimi Hendrix',      album: 'Are You Experienced', isRare: true },
    { id: 'v4',  color: '#F97316', genre: 'Funk',       year: 1970, artist: 'Parliament',        album: 'Osmium' },
    { id: 'v5',  color: '#EC4899', genre: 'Pop',        year: 1977, artist: 'Fleetwood Mac',     album: 'Rumours' },
    { id: 'v6',  color: '#10B981', genre: 'Reggae',     year: 1984, artist: 'Bob Marley',        album: 'Legend' },
    { id: 'v7',  color: '#F59E0B', genre: 'Hip-Hop',    year: 1994, artist: 'Nas',               album: 'Illmatic', isRare: true },
    { id: 'v8',  color: '#6EE7B7', genre: 'Electronic', year: 2001, artist: 'Boards of Canada',  album: 'Music Has the Right to Children' },
    { id: 'v9',  color: '#A78BFA', genre: 'Indie',      year: 2007, artist: 'Radiohead',         album: 'In Rainbows' },
    { id: 'v10', color: '#C0392B', genre: 'Rock',       year: 2014, artist: 'Jack White',        album: 'Lazaretto' },
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
  hint: '🎵 Abbina ogni disco alla copertina giusta!',
  theme: 'jazz-club',
  vinyls: [
    { id: 'v1', color: '#D7263D', genre: 'Rock',     year: 1971, artist: 'David Bowie',    album: 'Hunky Dory' },
    { id: 'v2', color: '#2563EB', genre: 'Jazz',     year: 1956, artist: 'Chet Baker',     album: 'Chet Baker Sings' },
    { id: 'v3', color: '#EC4899', genre: 'Pop',      year: 1988, artist: 'George Michael',  album: 'Faith' },
    { id: 'v4', color: '#F97316', genre: 'Funk',     year: 1977, artist: 'Stevie Wonder',   album: 'Songs in the Key of Life' },
    { id: 'v5', color: '#10B981', genre: 'Soul',     year: 1966, artist: 'Marvin Gaye',     album: "What's Going On" },
    { id: 'v6', color: '#A78BFA', genre: 'Electronic', year: 2000, artist: 'Air',           album: 'Moon Safari' },
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
    { id: 'v1',  color: '#D7263D', genre: 'Rock',       year: 1972, artist: 'David Bowie',       album: 'Ziggy Stardust' },
    { id: 'v2',  color: '#C0392B', genre: 'Rock',       year: 1980, artist: 'AC/DC',              album: 'Back in Black' },
    { id: 'v3',  color: '#A93226', genre: 'Rock',       year: 1991, artist: 'Guns N\' Roses',     album: 'Use Your Illusion I' },
    { id: 'v4',  color: '#2563EB', genre: 'Jazz',       year: 1958, artist: 'Chet Baker',         album: 'Chet Baker Sings' },
    { id: 'v5',  color: '#1A56DB', genre: 'Jazz',       year: 1964, artist: 'Herbie Hancock',     album: 'Empyrean Isles' },
    { id: 'v6',  color: '#1A3FBD', genre: 'Jazz',       year: 1977, artist: 'Keith Jarrett',      album: 'The Köln Concert' },
    { id: 'v7',  color: '#EC4899', genre: 'Pop',        year: 1983, artist: 'Michael Jackson',    album: 'Thriller' },
    { id: 'v8',  color: '#DB2777', genre: 'Pop',        year: 1995, artist: 'Mariah Carey',       album: 'Daydream' },
    { id: 'v9',  color: '#F97316', genre: 'Hip-Hop',    year: 1993, artist: 'Wu-Tang Clan',       album: 'Enter the Wu-Tang' },
    { id: 'v10', color: '#EA7C1E', genre: 'Hip-Hop',    year: 2001, artist: 'Jay-Z',              album: 'The Blueprint' },
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
    { id: 'v1', color: '#8B5CF6', genre: 'Blues',      year: 1942, artist: 'Billie Holiday',    album: 'God Bless the Child', isRare: true },
    { id: 'v2', color: '#2563EB', genre: 'Jazz',       year: 1961, artist: 'Miles Davis',       album: 'Someday My Prince Will Come' },
    { id: 'v3', color: '#D7263D', genre: 'Rock',       year: 1966, artist: 'The Beatles',       album: 'Revolver', isRare: true },
    { id: 'v4', color: '#F97316', genre: 'Funk',       year: 1974, artist: 'Stevie Wonder',     album: 'Fulfillingness\' First Finale' },
    { id: 'v5', color: '#EC4899', genre: 'Pop',        year: 1982, artist: 'Toto',              album: 'Toto IV' },
    { id: 'v6', color: '#10B981', genre: 'Soul',       year: 1989, artist: 'Anita Baker',       album: 'Giving You the Best That I Got' },
    { id: 'v7', color: '#F59E0B', genre: 'Electronic', year: 1997, artist: 'Aphex Twin',        album: 'Come to Daddy', isRare: true },
    { id: 'v8', color: '#6EE7B7', genre: 'Indie',      year: 2013, artist: 'Vampire Weekend',   album: 'Modern Vampires of the City' },
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
    { id: 'v1', color: '#10B981', genre: 'Soul',       year: 1967, artist: 'Otis Redding',      album: 'The Dock of the Bay' },
    { id: 'v2', color: '#8B5CF6', genre: 'Blues',      year: 1954, artist: 'Muddy Waters',      album: 'Hoochie Coochie Man' },
    { id: 'v3', color: '#2563EB', genre: 'Jazz',       year: 1960, artist: 'Oscar Peterson',    album: 'Night Train' },
    { id: 'v4', color: '#D7263D', genre: 'Rock',       year: 1973, artist: 'Led Zeppelin',      album: 'Houses of the Holy' },
    { id: 'v5', color: '#F97316', genre: 'Funk',       year: 1979, artist: 'Parliament',        album: 'Gloryhallastoopid' },
    { id: 'v6', color: '#EC4899', genre: 'Pop',        year: 1986, artist: 'Madonna',           album: 'True Blue' },
    { id: 'v7', color: '#F59E0B', genre: 'Electronic', year: 1994, artist: 'Massive Attack',    album: 'Protection' },
    { id: 'v8', color: '#6EE7B7', genre: 'Indie',      year: 2004, artist: 'The Arcade Fire',   album: 'Funeral' },
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
    { id: 'v1', color: '#D7263D', genre: 'Rock',       year: 1971, artist: 'Carole King',       album: 'Tapestry' },
    { id: 'v2', color: '#C0392B', genre: 'Rock',       year: 1985, artist: 'Bruce Springsteen', album: 'Born in the U.S.A.' },
    { id: 'v3', color: '#2563EB', genre: 'Jazz',       year: 1963, artist: 'Thelonious Monk',   album: 'Monk\'s Dream' },
    { id: 'v4', color: '#1A56DB', genre: 'Jazz',       year: 1972, artist: 'Charles Mingus',    album: 'Let My Children Hear Music' },
    { id: 'v5', color: '#10B981', genre: 'Soul',       year: 1968, artist: 'Curtis Mayfield',   album: 'Superfly' },
    { id: 'v6', color: '#059669', genre: 'Soul',       year: 1976, artist: 'Al Green',          album: 'Full of Fire' },
    { id: 'v7', color: '#F97316', genre: 'Funk',       year: 1973, artist: 'Sly & the Family Stone', album: 'Fresh' },
    { id: 'v8', color: '#EA7C1E', genre: 'Funk',       year: 1980, artist: 'Bootsy Collins',    album: 'Ultra Wave' },
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
  rushTime: 45,
  parTime: 19,  // 8 vinyls × 3s × 0.8 (rush mode = less time = harder)
  hint: '45 secondi! Slot rotti ovunque — trova spazio e raggruppa per genere.',
  theme: 'punk-basement',
  blockedSlots: [
    { row: 0, col: 1 },
    { row: 1, col: 3 },
    { row: 2, col: 0 },
    { row: 2, col: 2 },
  ],
  vinyls: [
    { id: 'v1', color: '#D7263D', genre: 'Rock',       year: 1968, artist: 'Cream',             album: 'Wheels of Fire' },
    { id: 'v2', color: '#C0392B', genre: 'Rock',       year: 1983, artist: 'The Clash',         album: 'Combat Rock' },
    { id: 'v3', color: '#2563EB', genre: 'Jazz',       year: 1956, artist: 'Clifford Brown',    album: 'Clifford Brown Memorial Album' },
    { id: 'v4', color: '#1A56DB', genre: 'Jazz',       year: 1966, artist: 'Wes Montgomery',    album: 'Goin\' Out of My Head' },
    { id: 'v5', color: '#EC4899', genre: 'Pop',        year: 1990, artist: 'Janet Jackson',     album: 'Rhythm Nation 1814' },
    { id: 'v6', color: '#F472B6', genre: 'Pop',        year: 2000, artist: 'Destiny\'s Child',  album: 'The Writing\'s on the Wall' },
    { id: 'v7', color: '#F97316', genre: 'Hip-Hop',    year: 1996, artist: 'Outkast',           album: 'ATLiens' },
    { id: 'v8', color: '#EA7C1E', genre: 'Hip-Hop',    year: 2004, artist: 'Kanye West',        album: 'The College Dropout', isRare: true },
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
  hint: '9 dischi, 9 copertine — abbina ognuno alla sua copertina!',
  theme: 'punk-basement',
  vinyls: [
    { id: 'v1', color: '#D7263D', genre: 'Rock',       year: 1979, artist: 'The Police',        album: 'Reggatta de Blanc' },
    { id: 'v2', color: '#2563EB', genre: 'Jazz',       year: 1962, artist: 'Sonny Rollins',     album: 'The Bridge' },
    { id: 'v3', color: '#EC4899', genre: 'Pop',        year: 1991, artist: 'Seal',              album: 'Seal' },
    { id: 'v4', color: '#F97316', genre: 'Hip-Hop',    year: 1998, artist: 'Lauryn Hill',       album: 'The Miseducation of Lauryn Hill' },
    { id: 'v5', color: '#10B981', genre: 'Soul',       year: 1974, artist: 'Marvin Gaye',       album: "Let's Get It On" },
    { id: 'v6', color: '#A78BFA', genre: 'Electronic', year: 2003, artist: 'Radiohead',         album: 'Hail to the Thief' },
    { id: 'v7', color: '#F59E0B', genre: 'Funk',       year: 1970, artist: 'James Brown',       album: 'Sex Machine' },
    { id: 'v8', color: '#6EE7B7', genre: 'Indie',      year: 2009, artist: 'Animal Collective',  album: 'Merriweather Post Pavilion' },
    { id: 'v9', color: '#8B5CF6', genre: 'Classica',   year: 1989, artist: 'Nino Rota',         album: 'The Godfather Suite', isRare: true },
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
  customerTimer: 20,
  vinyls: [
    { id: 'v1', color: '#8B5CF6', genre: 'Blues',      year: 1943, artist: 'Muddy Waters',      album: 'I Can\'t Be Satisfied', isRare: true },
    { id: 'v2', color: '#D7263D', genre: 'Rock',       year: 1975, artist: 'Queen',             album: 'A Night at the Opera' },
    { id: 'v3', color: '#2563EB', genre: 'Jazz',       year: 1958, artist: 'Dave Brubeck',      album: 'Time Out' },
    { id: 'v4', color: '#EC4899', genre: 'Pop',        year: 1988, artist: 'Tracy Chapman',     album: 'Tracy Chapman' },
    { id: 'v5', color: '#F97316', genre: 'Funk',       year: 1976, artist: 'George Clinton',    album: 'The Clones of Dr. Funkenstein' },
    { id: 'v6', color: '#10B981', genre: 'Soul',       year: 1971, artist: 'Al Green',          album: 'Let\'s Stay Together' },
    { id: 'v7', color: '#F59E0B', genre: 'Electronic', year: 1993, artist: 'Orbital',           album: 'Orbital II' },
    { id: 'v8', color: '#6EE7B7', genre: 'Indie',      year: 2007, artist: 'Panda Bear',        album: 'Person Pitch', isRare: true },
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
  rushTime: 75,
  parTime: 29,  // 12 vinyls × 3s × 0.8 (rush mode = less time = harder)
  hint: 'IL GRANDE RUSH! 75 secondi, scaffale 3×5 — ordina per anno, non mollare!',
  theme: 'punk-basement',
  blockedSlots: [
    { row: 0, col: 4 },
    { row: 1, col: 2 },
    { row: 2, col: 0 },
  ],
  vinyls: [
    { id: 'v1',  color: '#8B5CF6', genre: 'Blues',      year: 1938, artist: 'Robert Johnson',      album: 'King of the Delta Blues', isRare: true },
    { id: 'v2',  color: '#6D28D9', genre: 'Jazz',       year: 1944, artist: 'Coleman Hawkins',     album: 'Body and Soul' },
    { id: 'v3',  color: '#2563EB', genre: 'Jazz',       year: 1956, artist: 'Miles Davis',         album: 'Kind of Blue' },
    { id: 'v4',  color: '#D7263D', genre: 'Rock',       year: 1963, artist: 'The Beatles',         album: 'Please Please Me', isRare: true },
    { id: 'v5',  color: '#F97316', genre: 'Funk',       year: 1971, artist: 'Funkadelic',          album: 'Maggot Brain' },
    { id: 'v6',  color: '#EC4899', genre: 'Pop',        year: 1978, artist: 'Donna Summer',        album: 'Live and More' },
    { id: 'v7',  color: '#10B981', genre: 'Soul',       year: 1984, artist: 'Prince',              album: 'Purple Rain', isRare: true },
    { id: 'v8',  color: '#F59E0B', genre: 'Hip-Hop',    year: 1992, artist: 'Dr. Dre',             album: 'The Chronic' },
    { id: 'v9',  color: '#6EE7B7', genre: 'Electronic', year: 1998, artist: 'Daft Punk',           album: 'Homework' },
    { id: 'v10', color: '#A78BFA', genre: 'Indie',      year: 2003, artist: 'Interpol',            album: 'Turn on the Bright Lights' },
    { id: 'v11', color: '#34D399', genre: 'Soul',       year: 2010, artist: 'Janelle Monáe',       album: 'The ArchAndroid' },
    { id: 'v12', color: '#60A5FA', genre: 'Electronic', year: 2016, artist: 'Bon Iver',            album: '22, A Million', isRare: true },
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
  hint: '⏰ Il negozio chiude! Abbina tutti i dischi prima della chiusura!',
  theme: 'disco-70s',
  vinyls: [
    { id: 'v1', color: '#D7263D', genre: 'Rock',       year: 1969, artist: 'The Doors',         album: 'The Soft Parade' },
    { id: 'v2', color: '#2563EB', genre: 'Jazz',       year: 1957, artist: 'John Coltrane',     album: 'Blue Train', isRare: true },
    { id: 'v3', color: '#EC4899', genre: 'Pop',        year: 1986, artist: 'Kate Bush',         album: 'The Whole Story' },
    { id: 'v4', color: '#F97316', genre: 'Hip-Hop',    year: 1999, artist: 'Mos Def',           album: 'Black on Both Sides' },
    { id: 'v5', color: '#10B981', genre: 'Soul',       year: 1972, artist: 'Bill Withers',      album: 'Still Bill' },
    { id: 'v6', color: '#A78BFA', genre: 'Electronic', year: 2005, artist: 'M83',               album: 'Before the Dawn Heals Us' },
    { id: 'v7', color: '#F59E0B', genre: 'Funk',       year: 1968, artist: 'James Brown',       album: 'Say It Loud', isRare: true },
    { id: 'v8', color: '#6EE7B7', genre: 'Indie',      year: 2015, artist: 'Tame Impala',       album: 'Currents' },
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
    { id: 'v1', color: '#D7263D', genre: 'Rock',  year: 1975, artist: 'Patti Smith',        album: 'Horses' },
    { id: 'v2', color: '#C0392B', genre: 'Rock',  year: 1988, artist: 'The Pixies',         album: 'Surfer Rosa' },
    { id: 'v3', color: '#A93226', genre: 'Rock',  year: 1996, artist: 'Beck',               album: 'Odelay' },
    { id: 'v4', color: '#7B1F16', genre: 'Rock',  year: 2003, artist: 'The White Stripes',  album: 'Elephant' },
    { id: 'v5', color: '#2563EB', genre: 'Jazz',  year: 1955, artist: 'Art Tatum',          album: 'The Genius of Art Tatum' },
    { id: 'v6', color: '#1A56DB', genre: 'Jazz',  year: 1969, artist: 'Wayne Shorter',      album: 'Moto Grosso Feio' },
    { id: 'v7', color: '#1A3FBD', genre: 'Jazz',  year: 1981, artist: 'Pat Metheny',        album: 'Offramp' },
    { id: 'v8', color: '#102A9A', genre: 'Jazz',  year: 2002, artist: 'Norah Jones',        album: 'Come Away with Me' },
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
    { id: 'v1', color: '#F59E0B', genre: 'Electronic', year: 2001, artist: 'Daft Punk',         album: 'Discovery', isRare: true },
    { id: 'v2', color: '#FBBF24', genre: 'Electronic', year: 2007, artist: 'Justice',           album: 'Cross' },
    { id: 'v3', color: '#D7263D', genre: 'Rock',        year: 1994, artist: 'Oasis',            album: 'Definitely Maybe' },
    { id: 'v4', color: '#C0392B', genre: 'Rock',        year: 2003, artist: 'The Strokes',      album: 'Room on Fire' },
    { id: 'v5', color: '#2563EB', genre: 'Jazz',        year: 1999, artist: 'Diana Krall',      album: 'When I Look in Your Eyes' },
    { id: 'v6', color: '#1A56DB', genre: 'Jazz',        year: 2004, artist: 'Norah Jones',      album: 'Feels Like Home' },
    { id: 'v7', color: '#EC4899', genre: 'Pop',         year: 2006, artist: 'Amy Winehouse',    album: 'Back to Black', isRare: true },
    { id: 'v8', color: '#DB2777', genre: 'Pop',         year: 2008, artist: 'Adele',            album: '19' },
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
    { row: 2, col: 3 },
  ],
  vinyls: [
    { id: 'v1',  color: '#D7263D', genre: 'Rock',       year: 1972, artist: 'Neil Young',        album: 'Harvest' },
    { id: 'v2',  color: '#2563EB', genre: 'Jazz',       year: 1959, artist: 'Dave Brubeck',      album: 'Time Out', isRare: true },
    { id: 'v3',  color: '#EC4899', genre: 'Pop',        year: 1999, artist: 'Santana',           album: 'Supernatural' },
    { id: 'v4',  color: '#F97316', genre: 'Hip-Hop',    year: 1994, artist: 'Notorious B.I.G.',  album: 'Ready to Die', isRare: true },
    { id: 'v5',  color: '#10B981', genre: 'Soul',       year: 1976, artist: 'Stevie Wonder',     album: 'Songs in the Key of Life' },
    { id: 'v6',  color: '#A78BFA', genre: 'Electronic', year: 1997, artist: 'Daft Punk',         album: 'Homework' },
    { id: 'v7',  color: '#F59E0B', genre: 'Funk',       year: 1973, artist: 'Curtis Mayfield',   album: 'Superfly' },
    { id: 'v8',  color: '#8B5CF6', genre: 'Blues',      year: 1958, artist: 'B.B. King',         album: 'Singin\' the Blues' },
    { id: 'v9',  color: '#6EE7B7', genre: 'Indie',      year: 2012, artist: 'Frank Ocean',       album: 'Channel Orange', isRare: true },
    { id: 'v10', color: '#60A5FA', genre: 'Classica',   year: 1971, artist: 'Ennio Morricone',   album: 'The Good, The Bad and The Ugly' },
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

export const LEVELS: Level[] = [
  level1, level2, level3, level4, level5, level6, level7, level8, level9,
  level10, level11, level12, level13, level14, level15, level16, level17, level18,
  level19, level20, level21,
];
