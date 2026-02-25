import { useState } from 'react';
import { ThemeProvider } from './ui/ThemeProvider';
import { GameScreen } from './components/GameScreen';
import { LevelSelect } from './components/LevelSelect/LevelSelect';
import { LEVELS } from './game/levels';
import { loadAllProgress } from './game/storage';

type Screen = 'levelSelect' | 'playing';

function findFirstIncompleteLevel(): number {
  // "incomplete" = never earned 3★ — encourages replaying for perfection
  const progress = loadAllProgress();
  for (let i = 0; i < LEVELS.length; i++) {
    const p = progress[LEVELS[i].id];
    if (!p || p.stars < 3) return i;
  }
  // All levels are 3★ — focus last level
  return LEVELS.length - 1;
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('levelSelect');
  const [currentLevelIndex, setCurrentLevelIndex] = useState<number>(
    () => findFirstIncompleteLevel()
  );

  const handleSelectLevel = (index: number) => {
    setCurrentLevelIndex(index);
    setScreen('playing');
  };

  const handleReturnToSelect = () => {
    setScreen('levelSelect');
    // Re-compute focus after returning — player may have just earned stars
    setCurrentLevelIndex(findFirstIncompleteLevel());
  };

  return (
    <ThemeProvider>
      {screen === 'levelSelect' ? (
        <LevelSelect
          onSelectLevel={handleSelectLevel}
          currentFocusIndex={currentLevelIndex}
        />
      ) : (
        <GameScreen
          initialLevelIndex={currentLevelIndex}
          onReturnToSelect={handleReturnToSelect}
        />
      )}
    </ThemeProvider>
  );
}
