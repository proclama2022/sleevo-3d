import type { Level } from './types';

export const level1: Level = {
  id: 'level-1',
  rows: 2,
  cols: 4,
  vinyls: [
    { id: 'v1', color: '#D7263D', genre: 'Rock', year: 1975 },
    { id: 'v2', color: '#2563EB', genre: 'Jazz', year: 1959 },
    { id: 'v3', color: '#EC4899', genre: 'Pop', year: 1989 },
    { id: 'v4', color: '#F97316', genre: 'Hip-Hop', year: 1992 },
    { id: 'v5', color: '#A78BFA', genre: 'Classica', year: 1791 },
    { id: 'v6', color: '#D7263D', genre: 'Rock', year: 1969 },
    { id: 'v7', color: '#2563EB', genre: 'Jazz', year: 1965 },
    { id: 'v8', color: '#EC4899', genre: 'Pop', year: 2001 },
  ],
};

export const level2: Level = {
  id: 'level-2',
  rows: 2,
  cols: 4,
  vinyls: [
    { id: 'v6', color: '#D7263D', genre: 'Rock', year: 1969 },
    { id: 'v3', color: '#EC4899', genre: 'Pop', year: 1989 },
    { id: 'v5', color: '#A78BFA', genre: 'Classica', year: 1791 },
    { id: 'v1', color: '#D7263D', genre: 'Rock', year: 1975 },
    { id: 'v8', color: '#EC4899', genre: 'Pop', year: 2001 },
    { id: 'v4', color: '#F97316', genre: 'Hip-Hop', year: 1992 },
    { id: 'v2', color: '#2563EB', genre: 'Jazz', year: 1959 },
    { id: 'v7', color: '#2563EB', genre: 'Jazz', year: 1965 },
  ],
};

export const LEVELS: Level[] = [level1, level2];
