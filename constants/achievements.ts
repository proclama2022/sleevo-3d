// Achievement system definitions for Sleevo Vinyl Shop Manager

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string; // emoji icon
  condition: (saveData: any, gameState?: any) => boolean;
  hidden?: boolean; // Hidden until unlocked
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export const ACHIEVEMENTS: Achievement[] = [
  // Beginner achievements
  {
    id: 'first_steps',
    title: 'First Steps',
    description: 'Complete the tutorial',
    icon: '🎓',
    condition: (saveData) => saveData.tutorialCompleted,
    rarity: 'common',
  },
  {
    id: 'rookie_collector',
    title: 'Rookie Collector',
    description: 'Sort your first 10 vinyls',
    icon: '📀',
    condition: (saveData) => saveData.stats.totalVinylsSorted >= 10,
    rarity: 'common',
  },
  {
    id: 'first_victory',
    title: 'First Victory',
    description: 'Win your first level',
    icon: '🎉',
    condition: (saveData) => saveData.stats.wins >= 1,
    rarity: 'common',
  },

  // Progression achievements
  {
    id: 'getting_serious',
    title: 'Getting Serious',
    description: 'Reach level 5',
    icon: '⭐',
    condition: (saveData) => saveData.level >= 5,
    rarity: 'common',
  },
  {
    id: 'veteran',
    title: 'Veteran Collector',
    description: 'Reach level 10',
    icon: '🌟',
    condition: (saveData) => saveData.level >= 10,
    rarity: 'rare',
  },
  {
    id: 'master',
    title: 'Master Collector',
    description: 'Reach level 20',
    icon: '💫',
    condition: (saveData) => saveData.level >= 20,
    rarity: 'epic',
  },
  {
    id: 'legendary_collector',
    title: 'Legendary Collector',
    description: 'Reach level 30',
    icon: '🏆',
    condition: (saveData) => saveData.level >= 30,
    rarity: 'legendary',
  },

  // Sorting achievements
  {
    id: 'busy_hands',
    title: 'Busy Hands',
    description: 'Sort 100 vinyls',
    icon: '✋',
    condition: (saveData) => saveData.stats.totalVinylsSorted >= 100,
    rarity: 'common',
  },
  {
    id: 'sorting_machine',
    title: 'Sorting Machine',
    description: 'Sort 500 vinyls',
    icon: '🤖',
    condition: (saveData) => saveData.stats.totalVinylsSorted >= 500,
    rarity: 'rare',
  },
  {
    id: 'vinyl_tsunami',
    title: 'Vinyl Tsunami',
    description: 'Sort 1000 vinyls',
    icon: '🌊',
    condition: (saveData) => saveData.stats.totalVinylsSorted >= 1000,
    rarity: 'epic',
  },

  // Win streak achievements
  {
    id: 'winning_streak',
    title: 'Winning Streak',
    description: 'Win 5 levels in a row',
    icon: '🔥',
    condition: (saveData) => saveData.stats.wins >= 5,
    rarity: 'rare',
  },
  {
    id: 'unstoppable',
    title: 'Unstoppable',
    description: 'Win 20 levels',
    icon: '💪',
    condition: (saveData) => saveData.stats.wins >= 20,
    rarity: 'epic',
  },

  // Perfect play achievements
  {
    id: 'perfectionist',
    title: 'Perfectionist',
    description: 'Complete 3 perfect levels (3 stars)',
    icon: '✨',
    condition: (saveData) => saveData.stats.perfectLevels >= 3,
    rarity: 'rare',
  },
  {
    id: 'flawless',
    title: 'Flawless Master',
    description: 'Complete 10 perfect levels',
    icon: '💎',
    condition: (saveData) => saveData.stats.perfectLevels >= 10,
    rarity: 'epic',
  },

  // Combo achievements
  {
    id: 'combo_starter',
    title: 'Combo Starter',
    description: 'Reach a 5x combo',
    icon: '⚡',
    condition: (saveData) => saveData.stats.maxCombo >= 5,
    rarity: 'common',
  },
  {
    id: 'combo_master',
    title: 'Combo Master',
    description: 'Reach a 10x combo',
    icon: '⚡⚡',
    condition: (saveData) => saveData.stats.maxCombo >= 10,
    rarity: 'rare',
  },
  {
    id: 'combo_god',
    title: 'Combo God',
    description: 'Reach a 20x combo',
    icon: '⚡⚡⚡',
    condition: (saveData) => saveData.stats.maxCombo >= 20,
    rarity: 'epic',
  },
  {
    id: 'combo_legend',
    title: 'Combo Legend',
    description: 'Reach a 30x combo',
    icon: '🌩️',
    condition: (saveData) => saveData.stats.maxCombo >= 30,
    rarity: 'legendary',
  },

  // Score achievements
  {
    id: 'high_roller',
    title: 'High Roller',
    description: 'Score 10,000 points in a single game',
    icon: '💰',
    condition: (saveData) => saveData.highScore >= 10000,
    rarity: 'rare',
  },
  {
    id: 'score_legend',
    title: 'Score Legend',
    description: 'Score 50,000 points in a single game',
    icon: '💸',
    condition: (saveData) => saveData.highScore >= 50000,
    rarity: 'epic',
  },

  // Dedication achievements
  {
    id: 'dedicated',
    title: 'Dedicated Collector',
    description: 'Play 50 games',
    icon: '🎮',
    condition: (saveData) => saveData.stats.totalGames >= 50,
    rarity: 'rare',
  },
  {
    id: 'addicted',
    title: 'Vinyl Addict',
    description: 'Play 100 games',
    icon: '🎯',
    condition: (saveData) => saveData.stats.totalGames >= 100,
    rarity: 'epic',
  },

  // Star collection achievements
  {
    id: 'star_collector',
    title: 'Star Collector',
    description: 'Earn a total of 30 stars',
    icon: '⭐⭐',
    condition: (saveData) => {
      const totalStars = Object.values(saveData.levelStars as Record<number, number>).reduce((a, b) => a + b, 0);
      return totalStars >= 30;
    },
    rarity: 'rare',
  },
  {
    id: 'constellation',
    title: 'Constellation',
    description: 'Earn a total of 60 stars',
    icon: '🌠',
    condition: (saveData) => {
      const totalStars = Object.values(saveData.levelStars as Record<number, number>).reduce((a, b) => a + b, 0);
      return totalStars >= 60;
    },
    rarity: 'epic',
  },

  // Hidden/Secret achievements
  {
    id: 'phoenix',
    title: 'Phoenix',
    description: 'Come back from 5 losses to win 5 games',
    icon: '🔥🦅',
    condition: (saveData) => saveData.stats.losses >= 5 && saveData.stats.wins >= 5,
    rarity: 'rare',
    hidden: true,
  },
  {
    id: 'persistent',
    title: 'Persistent',
    description: 'Lose 10 games but keep playing',
    icon: '💪😤',
    condition: (saveData) => saveData.stats.losses >= 10,
    rarity: 'rare',
    hidden: true,
  },
  {
    id: 'completionist',
    title: 'Completionist',
    description: 'Unlock all other achievements',
    icon: '👑',
    condition: (saveData) => {
      const unlockedCount = saveData.achievements?.filter((a: string) => a !== 'completionist').length || 0;
      return unlockedCount >= ACHIEVEMENTS.length - 1;
    },
    rarity: 'legendary',
    hidden: true,
  },

  // Fun achievements
  {
    id: 'night_owl',
    title: 'Night Owl',
    description: 'Play between midnight and 6 AM',
    icon: '🦉',
    condition: (saveData) => {
      const hour = new Date(saveData.lastPlayed).getHours();
      return hour >= 0 && hour < 6;
    },
    rarity: 'common',
    hidden: true,
  },
  {
    id: 'early_bird',
    title: 'Early Bird',
    description: 'Play between 6 AM and 8 AM',
    icon: '🐦',
    condition: (saveData) => {
      const hour = new Date(saveData.lastPlayed).getHours();
      return hour >= 6 && hour < 8;
    },
    rarity: 'common',
    hidden: true,
  },
  {
    id: 'weekend_warrior',
    title: 'Weekend Warrior',
    description: 'Play on both Saturday and Sunday',
    icon: '🎉🎮',
    condition: (saveData) => {
      // This would need additional tracking, simplified for now
      const day = new Date(saveData.lastPlayed).getDay();
      return day === 0 || day === 6;
    },
    rarity: 'common',
    hidden: true,
  },
];

// Helper functions
export const checkAchievements = (saveData: any, gameState?: any): string[] => {
  const unlockedAchievements = saveData.achievements || [];
  const newlyUnlocked: string[] = [];

  ACHIEVEMENTS.forEach((achievement) => {
    if (!unlockedAchievements.includes(achievement.id) && achievement.condition(saveData, gameState)) {
      newlyUnlocked.push(achievement.id);
    }
  });

  return newlyUnlocked;
};

export const getAchievementProgress = (saveData: any): { unlocked: number; total: number; percentage: number } => {
  const unlockedAchievements = saveData.achievements || [];
  const unlocked = unlockedAchievements.length;
  const total = ACHIEVEMENTS.length;
  const percentage = Math.round((unlocked / total) * 100);

  return { unlocked, total, percentage };
};

export const getAchievementById = (id: string): Achievement | undefined => {
  return ACHIEVEMENTS.find((a) => a.id === id);
};

export const getRarityColor = (rarity: Achievement['rarity']): string => {
  switch (rarity) {
    case 'common':
      return 'text-gray-400';
    case 'rare':
      return 'text-blue-400';
    case 'epic':
      return 'text-purple-500';
    case 'legendary':
      return 'text-yellow-500';
  }
};

export const getRarityBgColor = (rarity: Achievement['rarity']): string => {
  switch (rarity) {
    case 'common':
      return 'bg-gray-700';
    case 'rare':
      return 'bg-blue-900';
    case 'epic':
      return 'bg-purple-900';
    case 'legendary':
      return 'bg-yellow-900';
  }
};
