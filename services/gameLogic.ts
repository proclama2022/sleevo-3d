
import { Genre, Vinyl, Crate, GENRE_LABELS, GENRE_COLORS, Difficulty, LevelMode, ShopTheme, SpecialDiscType } from '../types';
import {
  GENRE_UNLOCK_INTERVAL,
  INITIAL_GENRE_COUNT,
  STORE_THEME_LEVEL,
  EXPO_THEME_LEVEL,
  GOLD_VINYL_CHANCE,
  MAX_CRATES_PER_LEVEL,
  MIN_CRATES_PER_LEVEL,
  CRATE_INCREASE_INTERVAL,
  CAPACITY_INCREASE_INTERVAL,
  TIMED_MODE_MIN_LEVEL,
  TIMED_MODE_INTERVAL,
  SUDDEN_DEATH_MIN_LEVEL,
  SUDDEN_DEATH_INTERVAL,
  INFINITE_MOVES,
  TIME_PER_VINYL_NORMAL,
  TIME_PER_VINYL_HARD,
  MIN_TIMED_SECONDS,
  DIFFICULTY_CONFIG,
  BASE_PLACEMENT_SCORE,
  COMBO_MULTIPLIER_INCREMENT,
  LEVEL_XP_BASE,
} from '../constants/gameConfig';

const ARTIST_NAMES = [
  "The Beagles", "Miles Down", "Aretha F.", "James Braun", "Daft P.", "The Ramones", "Led Zep", "David Bowtie", "Queen B", "Fleetwood Mac"
];

const ALBUM_TITLES = [
  "Greatest Hits", "Live at Tokyo", "Midnight Sessions", "Gold Edition", "Unplugged", "Volume 1", "Rare Cuts", "B-Sides", "Anthology"
];

const TRASH_NAMES = [
  "Old Receipt", "Soda Can", "Broken Stylus", "Banana Peel", "Concert Flyer"
];

// Progression System
const GENRE_UNLOCK_ORDER = [Genre.Rock, Genre.Jazz, Genre.Soul, Genre.Funk, Genre.Disco, Genre.Punk, Genre.Electronic];

const getAvailableGenres = (level: number): Genre[] => {
  // Start with INITIAL_GENRE_COUNT genres, unlock a new one every GENRE_UNLOCK_INTERVAL levels
  const unlockCount = Math.min(GENRE_UNLOCK_ORDER.length, INITIAL_GENRE_COUNT + Math.floor((level) / GENRE_UNLOCK_INTERVAL));
  return GENRE_UNLOCK_ORDER.slice(0, unlockCount);
};

const getShopTheme = (level: number): ShopTheme => {
  if (level < STORE_THEME_LEVEL) return 'Basement';
  if (level < EXPO_THEME_LEVEL) return 'Store';
  return 'Expo';
};

// Helper to get random item
const randomPick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

// Difficulty settings now imported from gameConfig.ts

// Check if level is a boss level (every 10 levels: 10, 20, 30...)
const isBossLevel = (level: number): boolean => {
  return level > 0 && level % 10 === 0;
};

export const generateLevel = (
  levelIndex: number,
  difficulty: Difficulty,
  isEndlessMode: boolean = false
): { crates: Crate[], vinyls: Vinyl[], moves: number, mode: LevelMode, time: number, theme: ShopTheme } => {

  const config = DIFFICULTY_CONFIG[difficulty];
  const theme = getShopTheme(levelIndex + 1);

  // Determine Level Mode
  let mode: LevelMode = 'Standard';
  let time = 0;

  // Boss Level takes priority
  if (isBossLevel(levelIndex + 1)) {
    mode = 'Boss';
  }
  // Endless mode
  else if (isEndlessMode) {
    mode = 'Endless';
  }
  // Introduce modes gradually
  else if (levelIndex > TIMED_MODE_MIN_LEVEL && levelIndex % TIMED_MODE_INTERVAL === 0) {
    mode = 'Timed';
  }
  else if (levelIndex > SUDDEN_DEATH_MIN_LEVEL && levelIndex % SUDDEN_DEATH_INTERVAL === 0) {
    mode = 'SuddenDeath';
  }

  // Available Genres based on progression
  const availableGenres = getAvailableGenres(levelIndex);

  // Determine number of crates based on level progression
  let numCrates = Math.min(MAX_CRATES_PER_LEVEL, Math.max(MIN_CRATES_PER_LEVEL, Math.floor(MIN_CRATES_PER_LEVEL + levelIndex / CRATE_INCREASE_INTERVAL)));

  // Boss Level: More crates for Speed Round mechanic
  if (mode === 'Boss') {
    numCrates = Math.min(MAX_CRATES_PER_LEVEL, numCrates + 1);
  }

  // Endless Mode: Dynamic difficulty scaling
  if (mode === 'Endless') {
    // Scale difficulty based on level progression in endless mode
    numCrates = Math.min(MAX_CRATES_PER_LEVEL, MIN_CRATES_PER_LEVEL + Math.floor(levelIndex / 3));
  }
  
  // Pick unique genres from unlocked list
  const selectedGenres: Genre[] = [];
  while (selectedGenres.length < numCrates) {
    const g = randomPick(availableGenres);
    if (!selectedGenres.includes(g)) selectedGenres.push(g);
  }

  const crates: Crate[] = selectedGenres.map((genre, idx) => ({
    id: `crate-${levelIndex}-${idx}`,
    genre,
    capacity: Math.floor(Math.random() * 2) + config.minCrateSize + Math.floor(levelIndex / CAPACITY_INCREASE_INTERVAL),
    filled: 0,
    label: randomPick(GENRE_LABELS[genre]),
  }));

  const vinyls: Vinyl[] = [];
  
  // 1. Fill mandatory matching vinyls
  crates.forEach(crate => {
    for (let i = 0; i < crate.capacity; i++) {
      const rand = Math.random();

      // Boss Level: Guaranteed gold vinyl per crate
      const isGold = mode === 'Boss' ? (i === 0) : rand > (1 - GOLD_VINYL_CHANCE);
      const isMystery = !isGold && rand > (1 - config.mysteryChance);
      const isDusty = !isGold && !isMystery && Math.random() < config.dustChance;

      vinyls.push({
        id: `vinyl-${crate.id}-${i}`,
        type: 'vinyl',
        genre: crate.genre,
        title: isGold ? "Limited Edition" : randomPick(ALBUM_TITLES),
        artist: randomPick(ARTIST_NAMES),
        coverColor: GENRE_COLORS[crate.genre],
        isGold,
        isMystery,
        isRevealed: false,
        dustLevel: isDusty ? 3 : 0,
        isTrash: false
      });
    }
  });

  // 2. Add Special Discs (1 every 6-8 normal vinyls, starts from level 3)
  if (levelIndex >= 2) {
    const normalVinyls = vinyls.filter(v => !v.isGold && !v.isMystery);
    const specialCount = Math.floor(normalVinyls.length / 7); // About 1 every 7 discs
    const specialTypes: SpecialDiscType[] = ['diamond', 'wildcard', 'bomb', 'chain', 'time'];

    for (let i = 0; i < specialCount; i++) {
      const randomVinyl = normalVinyls[Math.floor(Math.random() * normalVinyls.length)];
      if (randomVinyl && !randomVinyl.specialType) {
        randomVinyl.specialType = randomPick(specialTypes);
      }
    }
  }

  // 3. Add Trash Items
  const baseTrash = Math.floor(levelIndex / 2) + 1;
  const trashCount = Math.max(0, Math.floor(baseTrash * config.trashMultiplier));

  for(let i=0; i<trashCount; i++) {
      vinyls.push({
        id: `trash-${i}`,
        type: 'trash',
        genre: Genre.Rock,
        title: randomPick(TRASH_NAMES),
        artist: "Unknown",
        coverColor: "bg-gray-500",
        isTrash: true,
        dustLevel: 0,
        isGold: false,
        isMystery: false
      });
  }

  // Shuffle
  for (let i = vinyls.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [vinyls[i], vinyls[j]] = [vinyls[j], vinyls[i]];
  }

  // Calculate Constraints
  const totalVinyls = vinyls.filter(v => !v.isTrash).length;
  let moves = totalVinyls + config.moveBuffer;

  if (mode === 'Timed') {
      moves = INFINITE_MOVES; // Infinite moves in timed mode
      time = Math.max(MIN_TIMED_SECONDS, totalVinyls * (difficulty === 'Hard' ? TIME_PER_VINYL_HARD : TIME_PER_VINYL_NORMAL)); // Seconds per vinyl
  }

  if (mode === 'SuddenDeath') {
      moves = totalVinyls + 1; // Very tight moves
  }

  // Boss Level: Speed Round with tight timer
  if (mode === 'Boss') {
      moves = INFINITE_MOVES; // Infinite moves
      time = Math.floor(totalVinyls * 1.5); // Very tight: 1.5 seconds per vinyl
  }

  // Endless Mode: Balanced constraints
  if (mode === 'Endless') {
      // Reduce moves/time based on progression
      const difficulty_scale = 1 - (levelIndex * 0.02); // Reduce by 2% per level
      moves = Math.max(totalVinyls, Math.floor((totalVinyls + config.moveBuffer) * difficulty_scale));
      // In endless, use timed mode with decreasing time
      time = Math.max(MIN_TIMED_SECONDS, Math.floor(totalVinyls * TIME_PER_VINYL_NORMAL * difficulty_scale));
  }

  return { crates, vinyls, moves, mode, time, theme };
};

export const calculateScore = (combo: number) => {
  const multiplier = 1 + (combo * COMBO_MULTIPLIER_INCREMENT);
  return Math.floor(BASE_PLACEMENT_SCORE * multiplier);
};

export const getXPToNextLevel = (currentLevel: number) => {
  return LEVEL_XP_BASE * currentLevel;
};
