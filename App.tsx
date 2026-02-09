import React, { useState, useEffect, useRef, useCallback, useLayoutEffect } from 'react';
import { Crate, Vinyl, GameState, Genre, Difficulty, TutorialStep, CollectionItem, SecondaryObjective } from './types';
import { generateLevel, calculateScore, getXPToNextLevel } from './services/gameLogic';
import { loadSaveData, saveSaveData, updateStats, SaveData, addToCollection, unlockAchievement, updateLevelRecords, checkNewRecords } from './services/storage';
import { initAudioContext, playThemeMusic, stopMusic, sfx } from './services/audio';
import { generateSecondaryObjectives, updateObjectiveProgress, calculateObjectiveBonus } from './services/objectives';
import { useWindowSize } from './hooks/useWindowSize';
import { VinylCover } from './components/VinylCover';
import { CrateBox } from './components/CrateBox';
import { ThemeBackground } from './components/ThemeBackground';
import { Tutorial } from './components/Tutorial';
import { HintButton } from './components/HintButton';
import { CollectionScreen } from './components/CollectionScreen';
import { AudioSettings } from './components/AudioSettings';
import { AccessibilitySettings } from './components/AccessibilitySettings';
import { CustomizationScreen } from './components/CustomizationScreen';
import { AchievementScreen } from './components/AchievementScreen';
import { AchievementToast } from './components/AchievementToast';
import { StatsScreen } from './components/StatsScreen';
import { InGameStats } from './components/InGameStats';
import { SecondaryObjectives } from './components/SecondaryObjectives';
import { Trophy, Music, Disc3, RefreshCw, Zap, Disc, Trash2, CheckCircle2, Play, Settings, Clock, AlertTriangle, ArrowUp, X, Star, Library, TrendingUp, Eye, ChevronRight, RotateCcw, Palette } from 'lucide-react';
import { checkAchievements, getAchievementProgress } from './constants/achievements';
import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { StatusBar, Style } from '@capacitor/status-bar';
import {
  MAGNET_RADIUS,
  TRASH_RADIUS,
  PARTICLES_PER_EXPLOSION,
  PARTICLES_PER_EXPLOSION_MOBILE,
  PARTICLE_SPREAD_RADIUS,
  PARTICLE_ANIMATION_DURATION,
  PARTICLE_CLEANUP_DELAY,
  PARTICLE_Z_INDEX,
  FLYING_VINYL_Z_INDEX,
  FLYING_VINYL_DURATION,
  COMBO_TIER_COLORS,
  FLYING_VINYL_EASING,
  FLYING_VINYL_SCALE,
  FLYING_VINYL_ROTATION,
  FADE_DURATION,
  HAPTIC_DURATION,
  COMBO_TIMEOUT,
  MOBILE_BREAKPOINT,
  VINYL_SIZE_DESKTOP,
  VINYL_SIZE_MOBILE,
  DUST_CLEAN_BONUS,
  MYSTERY_REVEAL_BONUS,
  GOLD_VINYL_BONUS,
} from './constants/gameConfig';

// --- CSS BASED PARTICLE SYSTEM (Enhanced) ---
const ParticleExplosion: React.FC<{ x: number, y: number, color: string, genre?: Genre, isMobile?: boolean }> = ({ x, y, color, genre, isMobile = false }) => {
  const config = genre ? {
    colors: (() => {
      switch(genre) {
        case Genre.Rock: return ['#ef4444', '#dc2626', '#991b1b'];
        case Genre.Jazz: return ['#3b82f6', '#60a5fa', '#2563eb'];
        case Genre.Soul: return ['#eab308', '#fbbf24', '#f59e0b'];
        case Genre.Funk: return ['#f97316', '#fb923c', '#ea580c'];
        case Genre.Disco: return ['#a855f7', '#c084fc', '#9333ea'];
        case Genre.Punk: return ['#db2777', '#ec4899', '#be185d'];
        case Genre.Electronic: return ['#06b6d4', '#22d3ee', '#0891b2'];
        default: return [color];
      }
    })(),
    count: (() => {
      // Ridotte per mobile
      const multiplier = isMobile ? 0.5 : 1;
      switch(genre) {
        case Genre.Rock: return Math.ceil(12 * multiplier);
        case Genre.Funk: return Math.ceil(12 * multiplier);
        case Genre.Disco: return Math.ceil(14 * multiplier);
        case Genre.Punk: return Math.ceil(16 * multiplier);
        default: return Math.ceil(10 * multiplier);
      }
    })(),
    shape: (() => {
      switch(genre) {
        case Genre.Jazz: return 'star';
        case Genre.Disco: return 'star';
        case Genre.Funk: return 'square';
        case Genre.Punk: return 'square';
        default: return 'circle';
      }
    })()
  } : { colors: [color], count: isMobile ? PARTICLES_PER_EXPLOSION_MOBILE : PARTICLES_PER_EXPLOSION, shape: 'circle' };

  const particleCount = Math.min(config.count, isMobile ? 8 : 16); // Performance limit (reduced on mobile)

  return (
    <div className="fixed pointer-events-none" style={{ left: x, top: y, zIndex: PARTICLE_Z_INDEX }}>
       {/* Main particles */}
       {Array.from({ length: particleCount }).map((_, i) => {
         const angle = (i / particleCount) * 360;
         const distance = PARTICLE_SPREAD_RADIUS + (Math.random() - 0.5) * 20;
         const size = config.shape === 'star' ? 8 : 6;
         const particleColor = config.colors[i % config.colors.length];
         const shapeClass = config.shape === 'star' ? 'star-particle' : config.shape === 'square' ? 'rounded' : 'rounded-full';

         return (
           <div
            key={i}
            className={`absolute ${shapeClass} animate-particle-burst`}
            style={{
              width: `${size}px`,
              height: `${size}px`,
              backgroundColor: particleColor,
              '--tw-translate-x': `${Math.cos(angle * Math.PI / 180) * distance}px`,
              '--tw-translate-y': `${Math.sin(angle * Math.PI / 180) * distance}px`,
              animationDelay: `${Math.random() * 50}ms`,
            } as React.CSSProperties}
           />
         )
       })}
       {/* Center flash */}
       <div className="absolute w-8 h-8 -translate-x-1/2 -translate-y-1/2 rounded-full animate-flash" style={{ backgroundColor: config.colors[0] }}></div>
       <style>{`
         @keyframes particle-burst {
           0% { transform: translate(0,0) scale(1) rotate(0deg); opacity: 1; }
           100% { transform: translate(var(--tw-translate-x), var(--tw-translate-y)) scale(0) rotate(180deg); opacity: 0; }
         }
         .animate-particle-burst {
           animation: particle-burst ${PARTICLE_ANIMATION_DURATION}ms ease-out forwards;
         }
         .star-particle {
           clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);
         }
         @keyframes flash {
           0% { transform: translate(-50%, -50%) scale(0); opacity: 1; }
           50% { transform: translate(-50%, -50%) scale(1); opacity: 0.6; }
           100% { transform: translate(-50%, -50%) scale(1.5); opacity: 0; }
         }
         .animate-flash {
           animation: flash 300ms ease-out forwards;
         }
       `}</style>
    </div>
  );
};

// --- FEEDBACK MESSAGES ---
const FEEDBACK_MESSAGES = {
  correct: ["Groovy!", "Nice!", "Perfect!", "Slick!", "Yeah!", "Sweet!", "Nailed it!"],
  wrong: ["Oops!", "Wrong bin!", "Check again!", "Not quite!", "Try again!", "Missed!"],
  trash: ["Clean!", "Tossed!", "Binned!", "Gone!", "Sorted!"],
  combo2: ["2x Combo!", "Double!", "x2!"],
  combo3: ["3x! Keep going!", "Triple!", "On fire!", "3x Streak!"],
  combo5: ["5x! Amazing!", "Unstoppable!", "5x Combo!", "You're on 🔥!"],
  gold: ["+3 Moves!", "Bonus Moves!", "Extra Time!", "Golden!"],
  full: ["Full!", "No space!", "Crate full!", "Filled!"],
};

const randomMessage = (type: keyof typeof FEEDBACK_MESSAGES): string => {
  const msgs = FEEDBACK_MESSAGES[type];
  return msgs[Math.floor(Math.random() * msgs.length)];
};

// --- TYPES ---
interface FlyingVinyl {
  id: string;
  vinyl: Vinyl;
  startPos: { x: number; y: number };
  targetPos: { x: number; y: number }; // Calculated target position for the vinyl stack area
  targetRect: DOMRect; // Keep for explosion position
  crateId: string; // or 'trash'
  crateFilledCount: number;
}

// --- UTILS ---
const triggerHaptic = async (type: 'light' | 'heavy' | 'success') => {
  if (Capacitor.isNativePlatform()) {
    try {
        if(type === 'light') await Haptics.impact({ style: ImpactStyle.Light });
        if(type === 'heavy') await Haptics.notification({ type: NotificationType.Error });
        if(type === 'success') await Haptics.notification({ type: NotificationType.Success });
    } catch (e) {}
  } else if (navigator.vibrate) {
     if(type==='light') navigator.vibrate(HAPTIC_DURATION.light);
     if(type==='heavy') navigator.vibrate(HAPTIC_DURATION.heavy);
     if(type==='success') navigator.vibrate(HAPTIC_DURATION.success);
  }
};

const FlyingVinylItem: React.FC<{ item: FlyingVinyl; onComplete: (item: FlyingVinyl) => void; isMobile: boolean }> = ({ item, onComplete, isMobile }) => {
  const [style, setStyle] = useState<React.CSSProperties>({
    transform: `translate(${item.startPos.x}px, ${item.startPos.y}px) scale(1) rotate(0deg)`,
    opacity: 1,
    transition: `transform ${FLYING_VINYL_DURATION}ms ${FLYING_VINYL_EASING}, opacity ${FADE_DURATION}s ease-in`
  });

  useEffect(() => {
    // Force a reflow/tick to ensure transition plays
    const rafId = requestAnimationFrame(() => {
        // Use the pre-calculated target position that aligns with the vinyl stack area
        const tx = item.targetPos.x;
        const ty = item.targetPos.y;
        setStyle({
            transform: `translate(${tx}px, ${ty}px) scale(${FLYING_VINYL_SCALE}) rotate(${FLYING_VINYL_ROTATION}deg)`,
            opacity: 0,
            transition: `transform ${FLYING_VINYL_DURATION}ms ${FLYING_VINYL_EASING}, opacity ${FADE_DURATION}s ease-in`
        });
    });

    const endTimer = setTimeout(() => {
        onComplete(item);
    }, FLYING_VINYL_DURATION);

    return () => { cancelAnimationFrame(rafId); clearTimeout(endTimer); };
  }, [item, onComplete]);

  const vinylSize = isMobile ? VINYL_SIZE_MOBILE : VINYL_SIZE_DESKTOP;
  
  return (
    <div className="fixed top-0 left-0 pointer-events-none" style={{ ...style, zIndex: FLYING_VINYL_Z_INDEX }}>
       <div className="-translate-x-1/2 -translate-y-1/2">
          <VinylCover vinyl={item.vinyl} size={vinylSize} className="shadow-2xl" />
       </div>
    </div>
  );
};

// --- COMPONENTS ---

export default function App() {
  const { isMobile } = useWindowSize();

  // Load saved progress
  const [saveData, setSaveData] = useState<SaveData>(() => loadSaveData());

  const [levelIndex, setLevelIndex] = useState(0);
  const [gameState, setGameState] = useState<GameState>({
    currentLevel: 1,
    score: 0,
    movesLeft: 10,
    timeLeft: 0,
    maxTime: 0,
    combo: 0,
    comboMultiplier: 1,
    xp: 0,
    level: saveData.level, // Start from saved level
    status: 'menu',
    difficulty: 'Normal',
    mode: 'Standard',
    theme: 'Basement',

    // Session stats
    vinylsSorted: 0,
    maxComboThisLevel: 0,
    startTime: Date.now(),
    totalMoves: 0,
    mistakes: 0,
    lastSortedGenre: null,
    starsEarned: 0,
  });

  const [crates, setCrates] = useState<Crate[]>([]);
  const [shelfVinyls, setShelfVinyls] = useState<Vinyl[]>([]);
  const crateRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const stackRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const trashRef = useRef<HTMLDivElement>(null);
  
  const [activeVinyl, setActiveVinyl] = useState<Vinyl | null>(null);
  
  // Dragging state references for direct manipulation
  const dragElRef = useRef<HTMLDivElement>(null);
  const dragPosRef = useRef({ x: 0, y: 0 }); // Current touch position
  const initialDragPosRef = useRef({ x: 0, y: 0 }); // Initial touch position
  
  const [magnetTargetId, setMagnetTargetId] = useState<string | null>(null);
  
  const [feedback, setFeedback] = useState<{ text: string, type: 'good' | 'bad' | 'bonus' } | null>(null);
  const [flyingVinyls, setFlyingVinyls] = useState<FlyingVinyl[]>([]);
  const [explosions, setExplosions] = useState<{id: number, x: number, y: number, color: string, genre?: Genre}[]>([]);
  
  const [landingId, setLandingId] = useState<string | null>(null);
  const [shake, setShake] = useState(false);
  const [comboTimerPercent, setComboTimerPercent] = useState(0); // 0-100, countdown

  // Tutorial state
  const [tutorialActive, setTutorialActive] = useState(false);
  const [tutorialStep, setTutorialStep] = useState<TutorialStep>('drag');
  const firstVinylRef = useRef<HTMLDivElement | null>(null);
  const firstCrateRef = useRef<HTMLDivElement | null>(null);
  const movesCounterRef = useRef<HTMLDivElement | null>(null);

  // Collection screen state
  const [showCollection, setShowCollection] = useState(false);
  const [newVinylToast, setNewVinylToast] = useState<CollectionItem | null>(null);
  const prevCollectionLengthRef = useRef(0);

  // Audio settings modal state
  const [showAudioSettings, setShowAudioSettings] = useState(false);

  // Accessibility settings modal state
  const [showAccessibilitySettings, setShowAccessibilitySettings] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Customization settings modal state
  const [showCustomization, setShowCustomization] = useState(false);

  // Achievement system state
  const [showAchievements, setShowAchievements] = useState(false);
  const [achievementToasts, setAchievementToasts] = useState<string[]>([]);

  // Stats screen state
  const [showStats, setShowStats] = useState(false);
  const [isNewRecord, setIsNewRecord] = useState(false);

  // In-game stats state (closed by default on mobile)
  const [showInGameStats, setShowInGameStats] = useState(false);

  // Confirm dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    title: string;
    message: string;
    confirmLabel?: string;
    onConfirm: () => void;
  } | null>(null);

  // Level-up animation state
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [levelUpNumber, setLevelUpNumber] = useState(0);

  // Hint system state
  const [hintSpotlight, setHintSpotlight] = useState<{ vinylId: string; crateId: string } | null>(null);

  // Ghost preview for drag & drop
  const [ghostPreview, setGhostPreview] = useState<{ crateId: string; vinyl: Vinyl } | null>(null);

  // Secondary Objectives tracking
  const [hintsUsed, setHintsUsed] = useState(0);
  const [dustyVinylsCleaned, setDustyVinylsCleaned] = useState(0);

  // Crate Swapping system (for levels >= 15)
  const [swapCountdown, setSwapCountdown] = useState<number | null>(null);
  const swapTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const comboTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const comboIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const comboStartTimeRef = useRef<number>(0);
  const shelfTilts = useRef<Record<string, number>>({});
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prevMagnetRef = useRef<string | null>(null);

  // Utility function to clear combo timer
  const clearComboTimer = useCallback(() => {
    if (comboTimerRef.current) {
      clearTimeout(comboTimerRef.current);
      comboTimerRef.current = null;
    }
    if (comboIntervalRef.current) {
      clearInterval(comboIntervalRef.current);
      comboIntervalRef.current = null;
    }
    setComboTimerPercent(0);
  }, []);

  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      StatusBar.setOverlaysWebView({ overlay: true }).catch(() => {});
      StatusBar.setStyle({ style: Style.Dark }).catch(() => {});
    }
  }, []);

  // Cleanup combo timer on component unmount
  useEffect(() => {
    return () => {
      clearComboTimer();
    };
  }, [clearComboTimer]);

  // Play theme music when theme changes or game status changes
  useEffect(() => {
    if (gameState.status === 'playing') {
      playThemeMusic(gameState.theme);
    } else if (gameState.status === 'menu') {
      stopMusic();
    }
  }, [gameState.theme, gameState.status]);

  // Timer Logic
  useEffect(() => {
    if (gameState.status === 'playing' && gameState.mode === 'Timed') {
        timerRef.current = setInterval(() => {
            setGameState(prev => {
                if (prev.timeLeft <= 0) {
                    if(timerRef.current) clearInterval(timerRef.current);
                    saveProgressRef.current(false); // Save when time runs out
                    return { ...prev, status: 'lost', timeLeft: 0 };
                }
                return { ...prev, timeLeft: prev.timeLeft - 1 };
            });
        }, 1000);
    } else {
        if(timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if(timerRef.current) clearInterval(timerRef.current); };
  }, [gameState.status, gameState.mode]);

  // Set initial position of dragged element correctly when activeVinyl changes
  useLayoutEffect(() => {
    if (activeVinyl && dragElRef.current) {
        const x = initialDragPosRef.current.x;
        const y = initialDragPosRef.current.y;
        dragElRef.current.style.transform = `translate(${x - 70}px, ${y - 120}px) rotate(0deg) scale(1.1)`;
        dragElRef.current.style.filter = 'none';
    }
  }, [activeVinyl]);

  const startGame = (difficulty: Difficulty, endless: boolean = false) => {
      initAudioContext();
      setGameState(prev => ({
        ...prev,
        difficulty,
        score: 0,
        xp: 0,
        level: 1,
        isEndlessMode: endless,
        endlessVinylsSorted: 0,
      }));
      setLevelIndex(0);
      startLevel(0, difficulty, endless);
  };

  const startLevel = (idx: number, difficulty: Difficulty, endless: boolean = false) => {
    // Clear combo timer when starting new level
    clearComboTimer();

    const data = generateLevel(idx, difficulty, endless);
    setCrates(data.crates);
    setShelfVinyls(data.vinyls);

    // Generate secondary objectives for this level
    const objectives = !endless ? generateSecondaryObjectives(idx, data.mode) : [];

    setGameState(prev => ({
        ...prev,
        movesLeft: data.moves,
        status: 'playing',
        combo: 0,
        comboMultiplier: 1,
        difficulty,
        mode: data.mode,
        timeLeft: data.time,
        maxTime: data.time,
        theme: data.theme,

        // Reset session stats
        vinylsSorted: 0,
        maxComboThisLevel: 0,
        startTime: Date.now(),
        totalMoves: 0,
        mistakes: 0,
        lastSortedGenre: null,
        starsEarned: 0,
        isEndlessMode: endless,
        endlessVinylsSorted: prev.endlessVinylsSorted || 0,

        // Secondary objectives
        secondaryObjectives: objectives,
    }));
    setFlyingVinyls([]);

    // Reset objective tracking
    setHintsUsed(0);
    setDustyVinylsCleaned(0);

    // Show tutorial for first-time players
    if (idx === 0 && !saveData.tutorialCompleted && !endless) {
      setTutorialActive(true);
      setTutorialStep('drag');
    }

    const tilts: Record<string, number> = {};
    data.vinyls.forEach(v => { tilts[v.id] = Math.random() * 6 - 3; });
    shelfTilts.current = tilts;

    // Clear old refs
    crateRefs.current = {};
    stackRefs.current = {};
  };

  // Tutorial handlers
  const handleTutorialNext = () => {
    const stepOrder: TutorialStep[] = ['drag', 'genre', 'mystery', 'moves', 'trash', 'special', 'combo', 'capacity', 'complete'];
    const currentIndex = stepOrder.indexOf(tutorialStep);
    const nextStep = stepOrder[currentIndex + 1];

    if (nextStep === 'complete') {
      // Tutorial completed
      setTutorialActive(false);
      const updatedProgress = saveData.tutorialProgress || { completedSteps: [], skippedSteps: [], hintsEnabled: false };
      updatedProgress.completedSteps.push(tutorialStep);
      const updatedSave = {
        ...saveData,
        tutorialCompleted: true,
        tutorialProgress: updatedProgress
      };
      setSaveData(updatedSave);
      saveSaveData(updatedSave);
    } else {
      const updatedProgress = saveData.tutorialProgress || { completedSteps: [], skippedSteps: [], hintsEnabled: false };
      updatedProgress.completedSteps.push(tutorialStep);
      const updatedSave = {
        ...saveData,
        tutorialProgress: updatedProgress
      };
      setSaveData(updatedSave);
      saveSaveData(updatedSave);
      setTutorialStep(nextStep);
    }
  };

  const handleTutorialSkipStep = () => {
    const stepOrder: TutorialStep[] = ['drag', 'genre', 'mystery', 'moves', 'trash', 'special', 'combo', 'capacity', 'complete'];
    const currentIndex = stepOrder.indexOf(tutorialStep);
    const nextStep = stepOrder[currentIndex + 1];

    const updatedProgress = saveData.tutorialProgress || { completedSteps: [], skippedSteps: [], hintsEnabled: false };
    updatedProgress.skippedSteps.push(tutorialStep);

    if (nextStep === 'complete') {
      // Tutorial completed
      setTutorialActive(false);
      const updatedSave = {
        ...saveData,
        tutorialCompleted: true,
        tutorialProgress: updatedProgress
      };
      setSaveData(updatedSave);
      saveSaveData(updatedSave);
    } else {
      const updatedSave = {
        ...saveData,
        tutorialProgress: updatedProgress
      };
      setSaveData(updatedSave);
      saveSaveData(updatedSave);
      setTutorialStep(nextStep);
    }
  };

  const handleTutorialSkip = () => {
    setTutorialActive(false);
    const stepOrder: TutorialStep[] = ['drag', 'genre', 'mystery', 'moves', 'trash', 'special', 'combo', 'capacity'];
    const updatedProgress = saveData.tutorialProgress || { completedSteps: [], skippedSteps: [], hintsEnabled: false };
    updatedProgress.skippedSteps = stepOrder.filter(s => !updatedProgress.completedSteps.includes(s));
    const updatedSave = {
      ...saveData,
      tutorialCompleted: true,
      tutorialProgress: updatedProgress
    };
    setSaveData(updatedSave);
    saveSaveData(updatedSave);
  };

  // Hint system handler
  const showHint = () => {
    if (gameState.movesLeft <= 0 || saveData.level < 10) return;

    const firstVinyl = shelfVinyls.find(v => !v.isTrash);
    if (!firstVinyl) return;

    const targetCrate = crates.find(c => c.genre === firstVinyl.genre && c.filled < c.capacity);
    if (!targetCrate) {
      showFeedback("No space available!", 'bad');
      return;
    }

    setHintSpotlight({ vinylId: firstVinyl.id, crateId: targetCrate.id });
    setGameState(prev => ({ ...prev, movesLeft: prev.movesLeft - 1 }));
    setHintsUsed(prev => prev + 1);
    sfx.click();

    setTimeout(() => setHintSpotlight(null), 3000);
  };

  // Crate Swapping system
  const swapCrates = useCallback(() => {
    if (crates.length < 2) return;

    // Select 2 random different crates
    const index1 = Math.floor(Math.random() * crates.length);
    let index2 = Math.floor(Math.random() * crates.length);
    while (index2 === index1) {
      index2 = Math.floor(Math.random() * crates.length);
    }

    // Play swap sound
    sfx.achievement(); // Reuse achievement sound for swap

    // Swap positions
    setCrates(prev => {
      const newCrates = [...prev];
      const temp = newCrates[index1];
      newCrates[index1] = newCrates[index2];
      newCrates[index2] = temp;
      return newCrates;
    });

    // Trigger haptic feedback
    triggerHaptic('heavy');

    // Reset countdown
    setSwapCountdown(null);
  }, [crates.length]);

  // Navigation confirm handlers
  const confirmBackToMenu = () => {
    setConfirmDialog({
      title: "Leave Level?",
      message: "Your progress will be lost. Are you sure?",
      confirmLabel: "Leave",
      onConfirm: () => {
        clearComboTimer();
        setGameState(prev => ({ ...prev, status: 'menu' }));
      }
    });
  };

  const confirmRestart = () => {
    setConfirmDialog({
      title: "Restart Level?",
      message: "Current progress will be lost.",
      confirmLabel: "Restart",
      onConfirm: () => {
        startLevel(levelIndex, gameState.difficulty, gameState.isEndlessMode);
      }
    });
  };

  // Level-up animation handler
  const goToNextLevel = () => {
    const nextIdx = levelIndex + 1;
    setLevelUpNumber(nextIdx + 1); // Display level number (1-indexed)
    setShowLevelUp(true);
    sfx.levelComplete();

    setTimeout(() => {
      setLevelIndex(nextIdx);
      startLevel(nextIdx, gameState.difficulty);
      setGameState(prev => ({...prev, xp: prev.xp + 100}));
      setShowLevelUp(false);
    }, 2500);
  };

  const registerCrateRef = useCallback((id: string, el: HTMLDivElement | null) => {
    if (el) crateRefs.current[id] = el;
    else delete crateRefs.current[id];
  }, []);

  const registerStackRef = useCallback((id: string, el: HTMLDivElement | null) => {
    if (el) stackRefs.current[id] = el;
    else delete stackRefs.current[id];
  }, []);

  // Save game progress when level ends - using refs to avoid dependency issues
  const saveProgressRef = useRef<(won: boolean) => void>(() => {});

  useEffect(() => {
    saveProgressRef.current = (won: boolean) => {
      const isPerfect = gameState.mistakes === 0 && won;
      const timeElapsed = Math.floor((Date.now() - gameState.startTime) / 1000);

      // Check for new records BEFORE updating
      const recordCheck = checkNewRecords(saveData, levelIndex, gameState.score);
      setIsNewRecord(recordCheck.newBestScore && won);

      const updatedSave = updateStats(saveData, {
        won,
        score: gameState.score,
        vinylsSorted: gameState.vinylsSorted,
        maxCombo: gameState.maxComboThisLevel,
        isPerfect,
      });

      // Update stars for this level (only if better than previous)
      const currentLevelStars = (saveData.levelStars && saveData.levelStars[levelIndex]) || 0;
      const newStars = won ? Math.max(currentLevelStars, gameState.starsEarned) : currentLevelStars;

      // Calculate bonus XP from completed objectives
      const objectiveBonusXP = gameState.secondaryObjectives
        ? calculateObjectiveBonus(gameState.secondaryObjectives)
        : 0;

      // Level up only if won
      const newLevel = won ? Math.max(saveData.level, gameState.level + 1) : saveData.level;
      let finalSave = {
        ...updatedSave,
        level: newLevel,
        totalXP: updatedSave.totalXP + gameState.xp + objectiveBonusXP,
        levelStars: {
          ...(updatedSave.levelStars || {}),
          [levelIndex]: newStars,
        },
      };

      // Update level records
      finalSave = updateLevelRecords(finalSave, levelIndex, {
        score: gameState.score,
        combo: gameState.maxComboThisLevel,
        time: timeElapsed,
        stars: gameState.starsEarned,
        won,
      });

      // Check for new achievements
      const newAchievements = checkAchievements(finalSave, gameState);
      if (newAchievements.length > 0) {
        // Unlock all new achievements
        newAchievements.forEach((achievementId) => {
          finalSave = unlockAchievement(finalSave, achievementId);
        });
        // Show toast notifications
        setAchievementToasts((prev) => [...prev, ...newAchievements]);
      }

      setSaveData(finalSave);
      saveSaveData(finalSave);
    };
  }, [gameState, saveData, levelIndex]);

  const handlePointerDown = (e: React.PointerEvent, vinyl: Vinyl) => {
    if (gameState.status !== 'playing') return;

    e.preventDefault(); e.stopPropagation();

    const clientX = e.clientX;
    const clientY = e.clientY;

    if (vinyl.dustLevel > 0) {
        triggerHaptic('light');
        sfx.dustClean();
        const explosionId = Date.now();
        setExplosions(prev => [...prev, { id: explosionId, x: clientX, y: clientY, color: '#9ca3af' }]);
        setTimeout(() => setExplosions(prev => prev.filter(e => e.id !== explosionId)), PARTICLE_CLEANUP_DELAY);

        // Track if vinyl is fully cleaned (dustLevel going from 1 to 0)
        if (vinyl.dustLevel === 1) {
          setDustyVinylsCleaned(prev => prev + 1);
        }

        setShelfVinyls(prev => prev.map(v => {
            if (v.id === vinyl.id) {
                return { ...v, dustLevel: v.dustLevel - 1 };
            }
            return v;
        }));
        return;
    }

    triggerHaptic('light');
    sfx.dragStart();
    if (vinyl.isMystery && !vinyl.isRevealed && !vinyl.isTrash) {
        sfx.mysteryReveal();
        setShelfVinyls(prev => prev.map(v => v.id === vinyl.id ? { ...v, isRevealed: true } : v));
        setActiveVinyl({ ...vinyl, isRevealed: true });
    } else {
        if (vinyl.isGold) sfx.goldVinyl();
        setActiveVinyl(vinyl);
    }

    // Store initial positions
    dragPosRef.current = { x: clientX, y: clientY };
    initialDragPosRef.current = { x: clientX, y: clientY };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!activeVinyl) return;
    e.preventDefault(); e.stopPropagation();

    const clientX = e.clientX;
    const clientY = e.clientY;

    dragPosRef.current = { x: clientX, y: clientY };

    let bestDist = MAGNET_RADIUS;
    let targetId: string | null = null;
    let snappedX = clientX;
    let snappedY = clientY;
    let isValidTarget = false;

    // 1. Check Crate Collision using current DOM Rects (handles scrolling!)
    Object.entries(crateRefs.current).forEach(([cId, el]) => {
      if (!el) return;
      const rect = (el as HTMLDivElement).getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dist = Math.sqrt(Math.pow(clientX - cx, 2) + Math.pow(clientY - cy, 2));

      if (dist < bestDist) {
        const targetCrate = crates.find(c => c.id === cId);
        bestDist = dist;
        targetId = cId;
        // Check if it's a valid target
        isValidTarget = targetCrate ?
          !activeVinyl.isTrash &&
          targetCrate.genre === activeVinyl.genre &&
          targetCrate.filled < targetCrate.capacity : false;
        // Snap calculation
        snappedX = clientX + (cx - clientX) * 0.5;
        snappedY = clientY + (cy - clientY - 40) * 0.5;
      }
    });

    if (trashRef.current) {
        const rect = trashRef.current.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dist = Math.sqrt(Math.pow(clientX - cx, 2) + Math.pow(clientY - cy, 2));

        if (dist < TRASH_RADIUS && dist < bestDist) {
            targetId = 'trash';
            isValidTarget = activeVinyl.isTrash;
            snappedX = cx;
            snappedY = cy;
        }
    }

    // Direct DOM update for high performance
    if (dragElRef.current) {
        if (targetId) {
            // Snapped to target - no rotation, larger scale, with glow
            const scale = 1.15;
            dragElRef.current.style.transform = `translate(${snappedX - 70}px, ${snappedY - 120}px) rotate(0deg) scale(${scale})`;
            dragElRef.current.style.filter = isValidTarget ?
              'drop-shadow(0 0 20px rgba(34, 197, 94, 0.8))' :
              'drop-shadow(0 0 20px rgba(239, 68, 68, 0.8))';
            if (targetId !== magnetTargetId) triggerHaptic('light');
        } else {
            // Free dragging - no rotation, normal scale
            dragElRef.current.style.transform = `translate(${clientX - 70}px, ${clientY - 120}px) rotate(0deg) scale(1.1)`;
            dragElRef.current.style.filter = 'none';
        }
    }

    // Update ghost preview and haptic feedback for magnet zone
    if (targetId && targetId !== 'trash') {
      if (!prevMagnetRef.current) {
        // Just entered magnet zone
        if (navigator.vibrate) navigator.vibrate([10]);
      }
      setGhostPreview({ crateId: targetId, vinyl: activeVinyl });
    } else {
      setGhostPreview(null);
    }
    prevMagnetRef.current = targetId;

    if (targetId !== magnetTargetId) {
        setMagnetTargetId(targetId);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!activeVinyl) return;
    e.preventDefault();

    if (magnetTargetId === 'trash') {
        handleTrashDrop(activeVinyl);
    } else if (magnetTargetId) {
      const targetCrate = crates.find(c => c.id === magnetTargetId);
      if (targetCrate) {
        // Wild Card can go anywhere
        const isWildCard = activeVinyl.specialType === 'wildcard';
        const isCorrectGenre = targetCrate.genre === activeVinyl.genre || isWildCard;

        if (activeVinyl.isTrash) {
             handleMistake(false, randomMessage('wrong'), activeVinyl);
        } else if (isCorrectGenre && targetCrate.filled < targetCrate.capacity) {
             handleSuccess(magnetTargetId, activeVinyl);
        } else {
             const msg = targetCrate.filled >= targetCrate.capacity ? randomMessage('full') : randomMessage('wrong');
             handleMistake(targetCrate.filled >= targetCrate.capacity, msg, activeVinyl);
        }
      }
    }

    setActiveVinyl(null);
    setMagnetTargetId(null);
    setGhostPreview(null);
    prevMagnetRef.current = null;
  };

  const handleTrashDrop = (item: Vinyl) => {
      if (item.isTrash) {
          triggerHaptic('success');
          sfx.trash();
          setShelfVinyls(prev => prev.filter(v => v.id !== item.id));
          if(trashRef.current) {
              const r = trashRef.current.getBoundingClientRect();
              const explosionId = Date.now();
              setExplosions(prev => [...prev, { id: explosionId, x: r.left + r.width/2, y: r.top + r.height/2, color: '#555' }]);
              setTimeout(() => setExplosions(prev => prev.filter(e => e.id !== explosionId)), PARTICLE_CLEANUP_DELAY);
          }
          showFeedback(randomMessage('trash'), 'good');
      } else {
          handleMistake(false, randomMessage('wrong'), item);
          setShelfVinyls(prev => prev.filter(v => v.id !== item.id));
          setGameState(prev => ({ ...prev, movesLeft: prev.movesLeft - 2 }));
      }
  };

  const handleMistake = (isFull: boolean, msg: string, vinyl?: Vinyl) => {
    // Granular haptic: double tap for wrong genre, heavy for full
    if (isFull) {
      triggerHaptic('heavy');
    } else {
      // Wrong genre - double tap pattern
      if (navigator.vibrate) navigator.vibrate([20, 10, 20]);
    }
    sfx.dropError();
    setShake(true);
    setTimeout(() => setShake(false), 300);

    // Bomb disc penalty: -5 moves extra
    const isBomb = vinyl?.specialType === 'bomb';
    const movePenalty = isBomb ? 5 : 0;

    setGameState(prev => ({
      ...prev,
      combo: 0,
      comboMultiplier: 1,
      totalMoves: prev.totalMoves + 1,
      mistakes: prev.mistakes + 1,
      movesLeft: prev.movesLeft - movePenalty,
    }));
    clearComboTimer();

    if (isBomb) {
      showFeedback('💣 Bomb! -5 Moves!', 'bad');
    } else {
      showFeedback(msg, 'bad');
    }

    if (gameState.mode === 'SuddenDeath') {
        setGameState(prev => ({ ...prev, status: 'lost' }));
        saveProgressRef.current(false);
    }
  };

  const handleSuccess = (crateId: string, vinyl: Vinyl) => {
    triggerHaptic('success');
    sfx.dropSuccess();
    const el = crateRefs.current[crateId];
    let rect: DOMRect | undefined;
    
    if (el) {
        rect = el.getBoundingClientRect();
        const colorMap: any = { Rock: '#ef4444', Jazz: '#3b82f6', Soul: '#eab308', Funk: '#f97316', Disco: '#a855f7', Punk: '#db2777', Electronic: '#06b6d4' };
        const explosionId = Date.now();
        setExplosions(prev => [...prev, { id: explosionId, x: rect!.left + rect!.width/2, y: rect!.top + rect!.height/2, color: colorMap[vinyl.genre] || '#fff', genre: vinyl.genre }]);
        setTimeout(() => setExplosions(prev => prev.filter(e => e.id !== explosionId)), PARTICLE_CLEANUP_DELAY);
    }

    setShelfVinyls(prev => prev.filter(v => v.id !== vinyl.id));
    const moveCost = vinyl.isGold ? -3 : 1;
    if (gameState.mode !== 'Timed') {
        setGameState(prev => ({ ...prev, movesLeft: prev.movesLeft - moveCost }));
    }

    if (vinyl.isGold) showFeedback(randomMessage('gold'), 'bonus');

    const targetCrate = crates.find(c => c.id === crateId);
    const stackEl = stackRefs.current[crateId];
    
    if (rect && stackEl) {
        // Get the actual stack area position from DOM
        const stackRect = stackEl.getBoundingClientRect();
        
        // The new vinyl will be at the front (visualOffset = 0)
        // So its bottom edge aligns with the bottom of the stack area
        // Vinyl is w-[85%] of stack area and aspect-square
        const vinylSize = stackRect.width * 0.85; // 85% of stack area width
        
        // Target X = center of stack area horizontally
        const targetX = stackRect.left + stackRect.width / 2;
        
        // Target Y = center of the new vinyl
        // Vinyl bottom = stack area bottom (since visualOffset = 0)
        // Vinyl center = vinyl bottom - half height
        const targetY = stackRect.bottom - (vinylSize / 2);
        
        setFlyingVinyls(prev => [...prev, {
            id: Math.random().toString(36),
            vinyl,
            startPos: { x: dragPosRef.current.x, y: dragPosRef.current.y }, 
            targetPos: { x: targetX, y: targetY },
            targetRect: rect,
            crateId,
            crateFilledCount: targetCrate ? targetCrate.filled : 0
        }]);
    } else if (rect) {
        // Fallback if stack ref not available (shouldn't happen, but just in case)
        const bottomOffset = isMobile ? 65 : 75;
        const stackAreaWidth = rect.width * 0.85;
        const vinylSize = stackAreaWidth * 0.85;
        const stackAreaBottom = rect.bottom - bottomOffset;
        const targetX = rect.left + rect.width / 2;
        const targetY = stackAreaBottom - (vinylSize / 2);
        
        setFlyingVinyls(prev => [...prev, {
            id: Math.random().toString(36),
            vinyl,
            startPos: { x: dragPosRef.current.x, y: dragPosRef.current.y }, 
            targetPos: { x: targetX, y: targetY },
            targetRect: rect,
            crateId,
            crateFilledCount: targetCrate ? targetCrate.filled : 0
        }]);
    }
  };

  const showFeedback = (text: string, type: 'good' | 'bad' | 'bonus') => {
    setFeedback({ text, type });
    setTimeout(() => setFeedback(null), 1500);
  };

  const handleLanding = useCallback((item: FlyingVinyl) => {
    triggerHaptic('light');

    // Play appropriate sound
    if (item.vinyl.isGold) {
      sfx.goldVinyl();
    } else {
      sfx.dropSuccess();
    }

    setLandingId(item.crateId);
    setTimeout(() => setLandingId(null), 150);
    setFlyingVinyls(prev => prev.filter(f => f.id !== item.id));
    setCrates(prev => prev.map(c => c.id === item.crateId ? { ...c, filled: c.filled + 1 } : c));

    // Add to collection if rare (gold or special type)
    if (item.vinyl.isGold || item.vinyl.specialType) {
      const updatedSave = addToCollection(saveData, {
        artist: item.vinyl.artist,
        title: item.vinyl.title,
        genre: item.vinyl.genre,
        coverColor: item.vinyl.coverColor,
        specialType: item.vinyl.specialType,
        isGold: item.vinyl.isGold || false,
      });
      setSaveData(updatedSave);
      saveSaveData(updatedSave);
    }

    setGameState(prev => {
      const newCombo = prev.combo + 1;

      // Calculate combo multiplier: x1 → x2 (2+) → x3 (5+) → x5 (10+) → x10 (15+)
      let comboMultiplier = 1;
      if (newCombo >= 15) comboMultiplier = 10;
      else if (newCombo >= 10) comboMultiplier = 5;
      else if (newCombo >= 5) comboMultiplier = 3;
      else if (newCombo >= 2) comboMultiplier = 2;

      // Base points
      let points = calculateScore(newCombo);

      // Apply combo multiplier
      points *= comboMultiplier;

      // Gold vinyl doubles points
      if (item.vinyl.isGold) points *= 2;

      // Special disc effects
      let bonusPoints = 0;
      let specialFeedback = '';

      if (item.vinyl.specialType === 'diamond') {
        // Diamond: x3 points
        points *= 3;
        bonusPoints += 150;
        specialFeedback = '💎 Diamond x3!';
      }

      if (item.vinyl.specialType === 'chain') {
        // Chain: bonus if same genre as last sorted
        if (prev.lastSortedGenre === item.vinyl.genre) {
          bonusPoints += 100;
          specialFeedback = '🔗 Chain Bonus +100!';
        }
      }

      if (item.vinyl.specialType === 'time' && prev.mode === 'Timed') {
        // Time disc: +10 seconds in timed mode
        specialFeedback = '⏰ +10 Seconds!';
      }

      const finalPoints = points + bonusPoints;

      // Clear existing timers
      clearComboTimer();

      // Start combo countdown timer (4.5s total)
      const comboTimeout = 4500;
      comboStartTimeRef.current = Date.now();
      setComboTimerPercent(100);

      // Visual timer interval (update every 50ms for smooth animation)
      comboIntervalRef.current = setInterval(() => {
        const elapsed = Date.now() - comboStartTimeRef.current;
        const remaining = Math.max(0, 100 - (elapsed / comboTimeout) * 100);
        setComboTimerPercent(remaining);

        if (remaining <= 0 && comboIntervalRef.current) {
          clearInterval(comboIntervalRef.current);
          comboIntervalRef.current = null;
        }
      }, 50);

      // Actual timeout to reset combo and multiplier
      comboTimerRef.current = setTimeout(() => {
        setGameState(s => ({ ...s, combo: 0, comboMultiplier: 1 }));
        setFeedback(null);
        setComboTimerPercent(0);
      }, comboTimeout);

      // Show varied feedback based on combo level and special discs
      if (specialFeedback) {
        showFeedback(specialFeedback, 'bonus');
      } else if (!item.vinyl.isGold) {
        // Play combo milestone sound
        if (newCombo === 5 || newCombo === 10 || newCombo === 15) {
          sfx.comboMilestone();
        }

        if (newCombo >= 15) {
          showFeedback(`🔥 x${comboMultiplier} INSANE!`, 'good');
        } else if (newCombo >= 10) {
          showFeedback(`⚡ x${comboMultiplier} Combo!`, 'good');
        } else if (newCombo >= 5) {
          showFeedback(randomMessage('combo5'), 'good');
        } else if (newCombo >= 3) {
          showFeedback(randomMessage('combo3'), 'good');
        } else if (newCombo === 2) {
          showFeedback(randomMessage('combo2'), 'good');
        } else {
          showFeedback(randomMessage('correct'), 'good');
        }
      }

      // Apply time bonus for time disc in timed mode
      let newTimeLeft = prev.timeLeft;
      if (item.vinyl.specialType === 'time' && prev.mode === 'Timed') {
        newTimeLeft += 10;
      }

      return {
        ...prev,
        score: prev.score + finalPoints,
        combo: newCombo,
        comboMultiplier,
        xp: prev.xp + 10,
        vinylsSorted: prev.vinylsSorted + 1,
        totalMoves: prev.totalMoves + 1,
        maxComboThisLevel: Math.max(prev.maxComboThisLevel, newCombo),
        lastSortedGenre: item.vinyl.genre,
        timeLeft: newTimeLeft,
      };
    });
  }, [clearComboTimer]);

  // Detect prefers-reduced-motion and allow user override
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const effectiveReduceMotion = saveData.accessibilitySettings?.reduceMotion ?? mediaQuery.matches;
    setPrefersReducedMotion(effectiveReduceMotion);

    const handler = (e: MediaQueryListEvent) => {
      if (!saveData.accessibilitySettings?.reduceMotion) {
        setPrefersReducedMotion(e.matches);
      }
    };
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [saveData.accessibilitySettings]);

  // New vinyl discovery toast
  useEffect(() => {
    const prevLength = prevCollectionLengthRef.current;
    const newLength = saveData.collection.length;

    if (newLength > prevLength && prevLength > 0) {
      const newestVinyl = saveData.collection[newLength - 1];
      setNewVinylToast(newestVinyl);
      sfx.achievement();
      setTimeout(() => setNewVinylToast(null), 3500);
    }

    prevCollectionLengthRef.current = newLength;
  }, [saveData.collection.length]);

  // Memory Challenge: Hide labels after 5 seconds
  useEffect(() => {
    if (gameState.status === 'playing' && gameState.mode !== 'Timed' && saveData.level >= 5) {
      const timer = setTimeout(() => {
        setGameState(prev => ({ ...prev, hideLabels: true }));
      }, 5000); // 5 seconds

      return () => clearTimeout(timer);
    }
  }, [gameState.status, levelIndex]);

  // Update Secondary Objectives progress
  useEffect(() => {
    if (gameState.status === 'playing' && gameState.secondaryObjectives && gameState.secondaryObjectives.length > 0) {
      const timeElapsed = Math.floor((Date.now() - gameState.startTime) / 1000);
      const totalDustyVinyls = shelfVinyls.filter(v => v.dustLevel > 0).length + dustyVinylsCleaned;

      const updatedObjectives = updateObjectiveProgress(gameState.secondaryObjectives, {
        mistakes: gameState.mistakes,
        maxComboThisLevel: gameState.maxComboThisLevel,
        timeElapsed,
        hintsUsed,
        dustyVinylsCleaned,
        totalDustyVinyls,
        totalMoves: gameState.totalMoves
      });

      // Only update if objectives actually changed
      const hasChanged = updatedObjectives.some((obj, idx) =>
        obj.completed !== gameState.secondaryObjectives![idx].completed ||
        obj.currentValue !== gameState.secondaryObjectives![idx].currentValue
      );

      if (hasChanged) {
        setGameState(prev => ({ ...prev, secondaryObjectives: updatedObjectives }));
      }
    }
  }, [
    gameState.status,
    gameState.mistakes,
    gameState.maxComboThisLevel,
    gameState.startTime,
    gameState.totalMoves,
    hintsUsed,
    dustyVinylsCleaned,
    shelfVinyls.length
  ]);

  // Crate Swapping Timer (for levels >= 15)
  useEffect(() => {
    if (gameState.status === 'playing' && levelIndex >= 14 && !gameState.isEndlessMode) { // levelIndex 14 = level 15
      let secondsElapsed = 0;
      const SWAP_INTERVAL = 15; // Swap every 15 seconds
      const COUNTDOWN_START = 3; // Start countdown at 3 seconds

      swapTimerRef.current = setInterval(() => {
        secondsElapsed++;
        const timeUntilSwap = SWAP_INTERVAL - (secondsElapsed % SWAP_INTERVAL);

        if (timeUntilSwap <= COUNTDOWN_START && timeUntilSwap > 0) {
          setSwapCountdown(timeUntilSwap);
          // Play warning sound at 3 seconds
          if (timeUntilSwap === COUNTDOWN_START) {
            sfx.click();
          }
        } else if (timeUntilSwap === 0) {
          // Trigger swap
          swapCrates();
        } else {
          setSwapCountdown(null);
        }
      }, 1000);

      return () => {
        if (swapTimerRef.current) {
          clearInterval(swapTimerRef.current);
          swapTimerRef.current = null;
        }
        setSwapCountdown(null);
      };
    } else {
      // Clean up if conditions not met
      if (swapTimerRef.current) {
        clearInterval(swapTimerRef.current);
        swapTimerRef.current = null;
      }
      setSwapCountdown(null);
    }
  }, [gameState.status, levelIndex, swapCrates, gameState.isEndlessMode]);

  // Haptic feedback for low moves
  useEffect(() => {
    if (gameState.movesLeft === 3 && gameState.status === 'playing') {
      triggerHaptic('heavy');
    }
  }, [gameState.movesLeft, gameState.status]);

  useEffect(() => {
    if (flyingVinyls.length > 0) return;
    const allCratesFull = crates.every(c => c.filled >= c.capacity);
    const hasVinylsLeft = shelfVinyls.some(v => !v.isTrash);

    if (allCratesFull && gameState.status === 'playing') {
      // Calculate stars earned
      const isPerfect = gameState.mistakes === 0;
      const hasGoodCombo = gameState.maxComboThisLevel >= 3;
      const hasGreatCombo = gameState.maxComboThisLevel >= 5;

      // Calculate initial moves (data.moves from generateLevel)
      const totalVinyls = gameState.vinylsSorted;
      const movesUsed = gameState.totalMoves;
      const movesRemaining = gameState.movesLeft;

      // Estimate initial moves (rough calculation since we don't have it stored)
      const estimatedInitialMoves = movesUsed + movesRemaining;
      const movesEfficiency = estimatedInitialMoves > 0 ? (movesRemaining / estimatedInitialMoves) : 0;

      let stars = 1; // Base: Always get 1 star for completing
      if (isPerfect && hasGoodCombo) stars = 2; // Silver: No mistakes + combo >= 3
      if (isPerfect && hasGreatCombo && movesEfficiency >= 0.2) stars = 3; // Gold: Perfect + combo >= 5 + 20% moves left

      // Level won!
      sfx.levelComplete();
      setGameState(prev => ({ ...prev, status: 'won', xp: prev.xp + 100, starsEarned: stars }));
      saveProgressRef.current(true);
    } else if (
        gameState.status === 'playing' &&
        gameState.mode !== 'Timed' &&
        (gameState.movesLeft <= 0 || (shelfVinyls.length === 0 && !allCratesFull)) && !hasVinylsLeft
    ) {
      if (!allCratesFull) {
        // Level lost
        setGameState(prev => ({ ...prev, status: 'lost' }));
        saveProgressRef.current(false);
      }
    }
  }, [crates, gameState.status, gameState.movesLeft, gameState.mode, flyingVinyls.length, shelfVinyls, gameState.mistakes, gameState.maxComboThisLevel, gameState.vinylsSorted, gameState.totalMoves]);

  // --- RENDER MENU ---
  if (gameState.status === 'menu') {
      return (
          <div className="relative w-full h-[100dvh] bg-bricks overflow-hidden flex flex-col items-center justify-center p-6 animate-[fade-in_0.3s_ease-out]">
              <div className="bg-noise"></div>
              <div className="vignette"></div>
              <div className="relative z-20 flex flex-col items-center gap-8 animate-in fade-in zoom-in duration-500">
                  <div className="flex flex-col items-center">
                    <div className="w-24 h-24 rounded-full bg-black border-4 border-gray-800 flex items-center justify-center shadow-2xl mb-4 animate-spin-slow">
                        <Disc3 size={48} className="text-neon-pink" />
                    </div>
                    <h1 className="text-6xl font-display text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)] rotate-[-3deg]">SLEEVO</h1>
                    <p className="text-gray-400 font-mono tracking-widest uppercase text-sm mt-2">Vinyl Shop Manager</p>
                  </div>

                  {/* Progress stats */}
                  {saveData.stats.totalGames > 0 && (
                    <div className="flex gap-4 text-center">
                      <div className="bg-black/40 px-4 py-2 rounded-lg border border-yellow-500/30">
                        <div className="text-yellow-400 font-display text-2xl">{saveData.level}</div>
                        <div className="text-gray-400 text-xs uppercase tracking-wider">Level</div>
                      </div>
                      <div className="bg-black/40 px-4 py-2 rounded-lg border border-blue-500/30">
                        <div className="text-blue-400 font-display text-2xl">{saveData.highScore}</div>
                        <div className="text-gray-400 text-xs uppercase tracking-wider">Best</div>
                      </div>
                      <div className="bg-black/40 px-4 py-2 rounded-lg border border-green-500/30">
                        <div className="text-green-400 font-display text-2xl">{saveData.stats.wins}</div>
                        <div className="text-gray-400 text-xs uppercase tracking-wider">Wins</div>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col gap-4 w-full max-w-xs">
                      {(['Easy', 'Normal', 'Hard'] as Difficulty[]).map(d => (
                          <button key={d} onClick={() => startGame(d, false)} className={`w-full py-4 rounded-xl border-2 font-black uppercase text-xl transition-all active:scale-95 ${d === 'Easy' ? 'bg-green-600/20 border-green-500 text-green-400 hover:bg-green-600/40' : ''} ${d === 'Normal' ? 'bg-blue-600/20 border-blue-500 text-blue-400 hover:bg-blue-600/40' : ''} ${d === 'Hard' ? 'bg-red-600/20 border-red-500 text-red-400 hover:bg-red-600/40' : ''}`}>
                              {d}
                          </button>
                      ))}

                      {/* Endless Mode Button (unlocked after level 15) */}
                      {saveData.level >= 15 && (
                        <button
                          onClick={() => startGame('Normal', true)}
                          className="w-full py-4 rounded-xl border-2 border-orange-500 bg-gradient-to-r from-orange-600/20 to-red-600/20 text-orange-300 font-black uppercase text-xl transition-all hover:from-orange-600/40 hover:to-red-600/40 active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20"
                        >
                          <Zap size={24} className="animate-pulse" />
                          ENDLESS MODE
                          <span className="text-sm bg-orange-500/30 px-2 py-0.5 rounded-full">
                            {saveData.endlessHighScore}
                          </span>
                        </button>
                      )}

                      {/* Collection Button */}
                      <button
                        onClick={() => setShowCollection(true)}
                        className="w-full py-3 rounded-xl border-2 border-purple-500/50 bg-purple-600/10 text-purple-300 font-bold uppercase text-lg transition-all hover:bg-purple-600/20 active:scale-95 flex items-center justify-center gap-2"
                      >
                        <Library size={20} />
                        Collezione
                        <span className="text-sm bg-purple-500/30 px-2 py-0.5 rounded-full">
                          {saveData.collection.length}
                        </span>
                      </button>

                      {/* Achievements Button */}
                      <button
                        onClick={() => setShowAchievements(true)}
                        className="w-full py-3 rounded-xl border-2 border-yellow-500/50 bg-yellow-600/10 text-yellow-300 font-bold uppercase text-lg transition-all hover:bg-yellow-600/20 active:scale-95 flex items-center justify-center gap-2"
                      >
                        <Trophy size={20} />
                        Trofei
                        <span className="text-sm bg-yellow-500/30 px-2 py-0.5 rounded-full">
                          {getAchievementProgress(saveData).percentage}%
                        </span>
                      </button>

                      {/* Stats Button */}
                      <button
                        onClick={() => setShowStats(true)}
                        className="w-full py-3 rounded-xl border-2 border-cyan-500/50 bg-cyan-600/10 text-cyan-300 font-bold uppercase text-lg transition-all hover:bg-cyan-600/20 active:scale-95 flex items-center justify-center gap-2"
                      >
                        <TrendingUp size={20} />
                        Statistiche
                      </button>

                      {/* Audio Settings Button */}
                      <button
                        onClick={() => setShowAudioSettings(true)}
                        className="mt-2 text-gray-400 hover:text-white flex items-center justify-center gap-2 transition-colors text-sm"
                      >
                        <Settings size={16} />
                        Audio Settings
                      </button>

                      {/* Accessibility Settings Button */}
                      <button
                        onClick={() => setShowAccessibilitySettings(true)}
                        className="text-gray-400 hover:text-white flex items-center justify-center gap-2 transition-colors text-sm"
                      >
                        <Eye size={16} />
                        Accessibility
                      </button>

                      {/* Customization Button */}
                      <button
                        onClick={() => setShowCustomization(true)}
                        className="text-gray-400 hover:text-white flex items-center justify-center gap-2 transition-colors text-sm"
                      >
                        <Palette size={16} />
                        Customize
                      </button>
                  </div>
              </div>
          </div>
      );
  }

  return (
    <div
      className={`relative w-full h-[100dvh] bg-black text-white overflow-hidden flex flex-col items-center animate-[fade-in_0.3s_ease-out] ${shake ? 'translate-x-1' : ''}`}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      {/* Theme-specific background */}
      <ThemeBackground theme={gameState.theme} />

      <div className="bg-noise"></div>
      <div className="vignette"></div>

      {/* Tutorial Overlay */}
      {tutorialActive && (
        <Tutorial
          step={tutorialStep}
          onNext={handleTutorialNext}
          onSkip={handleTutorialSkip}
          onSkipStep={handleTutorialSkipStep}
          targetElement={
            tutorialStep === 'drag' ? firstVinylRef.current :
            tutorialStep === 'genre' ? (crates && crates.length > 0 ? crateRefs.current[crates[0].id] : null) :
            tutorialStep === 'mystery' ? firstVinylRef.current :
            tutorialStep === 'moves' ? movesCounterRef.current :
            tutorialStep === 'trash' ? trashRef.current :
            tutorialStep === 'special' ? firstVinylRef.current :
            tutorialStep === 'combo' ? movesCounterRef.current :
            tutorialStep === 'capacity' ? (crates && crates.length > 0 ? crateRefs.current[crates[0].id] : null) :
            null
          }
        />
      )}

      <header className="w-full max-w-lg h-[90px] md:h-[120px] flex flex-col px-4 pt-2 md:pt-3 z-30 relative shrink-0">
        {/* Top Row: Breadcrumb + Quick Restart */}
        <div className="flex items-center justify-between mb-1 md:mb-2">
          <button
            onClick={confirmBackToMenu}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors"
          >
            <span>Menu</span>
            <ChevronRight size={12} className="text-gray-600" />
            <span className="text-white font-medium">
              Level {levelIndex + 1}
              {gameState.isEndlessMode && ' (Endless)'}
            </span>
          </button>
          <button
            onClick={confirmRestart}
            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
            title="Restart Level"
          >
            <RotateCcw size={16} className="text-gray-400 hover:text-white" />
          </button>
        </div>

        {/* Bottom Row: Game Info */}
        <div className="flex items-center justify-between">
        {/* Left: Score + Level + Collection Counter */}
        <div className="flex flex-col gap-1">
           <div className="border-3 md:border-4 border-gray-800 bg-black/80 rounded-lg px-2.5 md:px-3 py-1 md:py-1.5 relative shadow-lg">
             <div className="flex items-baseline gap-1.5">
               <div className="text-xl md:text-2xl font-display text-neon-blue tracking-wider">{gameState.score.toString().padStart(4, '0')}</div>
               <div className="bg-yellow-500 text-black text-[8px] md:text-[10px] font-bold px-1.5 py-0.5 rounded-sm">L{gameState.level}</div>
             </div>
             <div className="text-[7px] md:text-[9px] text-gray-400 font-mono text-center tracking-widest uppercase">Score</div>
           </div>
           <button
             onClick={() => setShowCollection(true)}
             className="flex items-center gap-1 bg-purple-900/40 border border-purple-500/30 rounded px-1.5 py-0.5 hover:bg-purple-900/60 transition-colors"
           >
             <Library size={10} className="text-purple-400" />
             <span className="text-[9px] text-purple-300 font-mono">{saveData.collection.length}</span>
           </button>
        </div>

        {/* Center: Combo or Mode indicator */}
        {gameState.mode === 'Timed' ? (
             <div className="flex flex-col items-center bg-black/40 px-3 py-1 rounded-full border border-red-500/50">
                <Clock className="w-3 h-3 md:w-4 md:h-4 text-red-400 mb-0.5" />
                <span className="font-mono text-xl md:text-2xl text-red-400">{gameState.timeLeft}s</span>
             </div>
        ) : gameState.mode === 'SuddenDeath' ? (
             <div className="flex flex-col items-center animate-pulse">
                <AlertTriangle className="w-6 h-6 md:w-8 md:h-8 text-red-500" />
                <span className="text-[8px] md:text-[10px] font-black text-red-500 uppercase">Sudden Death</span>
             </div>
        ) : (
            <div className={`flex flex-col items-center gap-0.5 md:gap-1 transition-all duration-300 ${gameState.combo > 1 ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
               <div className="flex items-center gap-1">
                 <span className="text-2xl md:text-3xl font-marker text-neon-pink rotate-[-10deg] drop-shadow-md">{gameState.combo}x!</span>
                 {gameState.comboMultiplier > 1 && (
                   <span className={`${
                     gameState.combo >= 5 ? 'text-4xl' : gameState.combo >= 3 ? 'text-2xl' : 'text-xl'
                   } font-black ${
                     gameState.combo >= 5 ? COMBO_TIER_COLORS.high : gameState.combo >= 3 ? COMBO_TIER_COLORS.mid : COMBO_TIER_COLORS.low
                   } bg-black/50 px-2 py-1 rounded border-2 transition-all`}>
                     ×{gameState.comboMultiplier}
                   </span>
                 )}
               </div>
               {gameState.combo > 1 && (
                 <div className="w-14 md:w-16 h-1 bg-black/50 rounded-full overflow-hidden border border-neon-pink/30">
                   <div
                     className="h-full bg-gradient-to-r from-neon-pink to-purple-500 transition-all duration-100 ease-linear"
                     style={{ width: `${comboTimerPercent}%` }}
                   />
                 </div>
               )}
            </div>
        )}

        {/* Right: XP + Settings */}
        <div className="flex flex-col w-16 md:w-20">
           <div className="flex justify-between items-center mb-0.5 md:mb-1">
               <span className="text-[7px] md:text-[9px] text-gray-300 font-bold tracking-widest uppercase">XP</span>
               <button onClick={() => setShowAudioSettings(true)} className="text-gray-400 hover:text-white transition-colors"><Settings size={10} className="md:w-3 md:h-3" /></button>
           </div>
           <div className="h-2 md:h-2.5 bg-[#111] rounded-sm border border-gray-600 relative overflow-hidden flex gap-0.5 p-0.5">
              {Array.from({ length: 10 }).map((_, i) => (
                 <div key={i} className={`flex-1 rounded-sm transition-colors duration-200 ${(gameState.xp % 100) / 10 > i ? (i > 7 ? 'bg-red-500' : 'bg-green-500') : 'bg-[#222]'}`} />
              ))}
           </div>
        </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-3xl flex flex-col justify-end items-center relative z-10 pb-4 md:pb-8">
        {feedback && (
          <div className="absolute top-10 z-50 animate-bounce pointer-events-none">
             <div className={`px-4 py-2 rounded-lg font-display text-2xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] border-2 border-white ${feedback.type === 'good' ? 'bg-green-600 rotate-2' : feedback.type === 'bonus' ? 'bg-yellow-500 rotate-0 text-black' : 'bg-red-600 -rotate-2'} text-white`}>
                {feedback.text}
             </div>
          </div>
        )}

        {!prefersReducedMotion && explosions.map(ex => <ParticleExplosion key={ex.id} x={ex.x} y={ex.y} color={ex.color} genre={ex.genre} isMobile={isMobile} />)}

        <div className="w-full overflow-x-auto no-scrollbar flex items-end gap-2 md:gap-4 px-4 md:px-8 py-4 md:py-10 snap-x snap-mandatory h-[260px] md:h-[300px]" style={{ touchAction: 'pan-x' }}>
          {crates.map(crate => {
            let highlightState: 'none' | 'neutral' | 'valid' | 'invalid' = 'none';
            if (magnetTargetId === crate.id) {
                if (!activeVinyl) highlightState = 'neutral';
                else if (activeVinyl.isTrash) highlightState = 'invalid';
                else if (activeVinyl.genre === crate.genre) highlightState = 'valid';
                else highlightState = 'invalid';
            }
            // Apply hint spotlight
            if (hintSpotlight?.crateId === crate.id) {
              highlightState = 'valid';
            }
            return (
                <div key={crate.id} className={`snap-center pt-2 md:pt-10 transition-transform duration-100 ease-out ${landingId === crate.id ? 'scale-95 translate-y-1' : ''}`}>
                  <CrateBox
                    crate={crate}
                    highlightState={highlightState}
                    ghostVinyl={ghostPreview?.crateId === crate.id ? ghostPreview.vinyl : null}
                    hideLabel={gameState.hideLabels || false}
                    onRegisterRef={registerCrateRef}
                    onRegisterStackRef={registerStackRef}
                  />
                </div>
            );
          })}
          <div className="w-4 shrink-0"></div>
        </div>
        
        <div ref={trashRef} className={`absolute bottom-4 right-4 w-20 h-24 border-4 border-gray-700 bg-gray-800 rounded-lg flex flex-col items-center justify-end pb-2 transition-transform duration-200 ${magnetTargetId === 'trash' ? 'scale-110 border-green-500 shadow-[0_0_20px_green]' : 'scale-100 opacity-80'}`}>
             <div className="absolute -top-3 w-22 h-4 bg-gray-700 rounded-t-sm w-[110%]"></div>
             <Trash2 size={32} className={`${magnetTargetId === 'trash' ? 'text-green-500' : 'text-gray-500'} mb-2`} />
             <span className="text-[10px] font-mono text-gray-400">TRASH</span>
        </div>
      </main>

      <section className="w-full h-[240px] md:h-[320px] bg-wood-dark shadow-[0_-10px_50px_rgba(0,0,0,1)] border-t-[8px] border-[#2d1b15] relative z-20 flex flex-col shrink-0 animate-[shelf-sway_8s_ease-in-out_infinite]">
         <div className="absolute top-0 left-0 right-0 h-[1px] bg-white/20"></div>
         <style>{`
           @keyframes shelf-sway {
             0%, 100% { transform: translateY(0px) rotate(0deg); }
             25% { transform: translateY(-1px) rotate(0.2deg); }
             75% { transform: translateY(1px) rotate(-0.2deg); }
           }
         `}</style>
         <div className="absolute -top-8 md:-top-10 left-4 md:left-6 transform flex items-start gap-3">
            {/* Moves Counter */}
            <div>
              <div ref={movesCounterRef} className={`bg-black/90 px-2.5 md:px-3 py-1 md:py-1.5 rounded-lg border-2 ${gameState.movesLeft <= 3 ? 'border-red-500 animate-pulse' : 'border-gray-700'} shadow-xl flex flex-col items-center min-w-[60px] md:min-w-[70px] relative`}>
                 {gameState.movesLeft === 1 && (
                   <AlertTriangle className="absolute -top-2 -right-2 text-red-500 animate-bounce" size={16} />
                 )}
                 <span className="text-[7px] md:text-[8px] text-gray-400 tracking-[0.2em] mb-0.5 md:mb-1 uppercase">Moves</span>
                 <div className={`text-lg md:text-xl font-mono leading-none ${gameState.movesLeft <= 3 ? 'text-red-500' : 'text-white'}`}>{gameState.movesLeft === 999 ? '∞' : gameState.movesLeft}</div>
              </div>
              <div className="absolute top-full left-1/2 w-0.5 h-8 md:h-10 bg-black -z-10"></div>
            </div>

            {/* Vinyl Progress */}
            <div className="bg-black/90 px-3 py-1.5 rounded-lg border-2 border-gray-700 shadow-xl">
              <div className="flex items-center gap-2 mb-1">
                <Disc size={14} className="text-cyan-400" />
                <span className="text-white text-xs font-mono">{crates.reduce((sum, c) => sum + c.filled, 0)}/{shelfVinyls.length + crates.reduce((sum, c) => sum + c.filled, 0)}</span>
              </div>
              <div className="w-20 h-1 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-green-500 rounded-full transition-all duration-300"
                  style={{
                    width: `${((crates.reduce((sum, c) => sum + c.filled, 0)) / (shelfVinyls.length + crates.reduce((sum, c) => sum + c.filled, 0))) * 100}%`
                  }}
                />
              </div>
            </div>
         </div>

         <div className="flex-1 overflow-x-auto overflow-y-hidden no-scrollbar flex items-center px-6 gap-0 pt-4 md:pt-6" style={{ touchAction: 'pan-x' }}>
            {shelfVinyls.map((vinyl, idx) => {
              const isActive = activeVinyl?.id === vinyl.id;
              const overlapClass = idx > 0 ? "-ml-8 md:-ml-10" : ""; // Reduced from -ml-16/-ml-20
              const tilt = shelfTilts.current[vinyl.id] || 0;
              return (
                <div
                  key={vinyl.id}
                  ref={idx === 0 ? firstVinylRef : null}
                  className={`
                    flex-shrink-0 transition-all duration-300
                    md:hover:-translate-y-8 md:hover:z-50 md:hover:mr-12 md:hover:ml-6
                    group z-0
                    ${isActive ? 'opacity-0' : 'opacity-100'}
                    ${overlapClass}
                    ${hintSpotlight?.vinylId === vinyl.id ? 'ring-4 ring-cyan-400 animate-pulse z-50' : ''}
                  `}
                  onPointerDown={(e) => handlePointerDown(e, vinyl)}
                  style={{
                    transform: `rotate(${tilt}deg)`,
                    touchAction: 'none',
                    filter: isActive ? 'none' : 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.3))'
                  }}
                >
                  <VinylCover vinyl={vinyl} size={isMobile ? 120 : 150} className={`${vinyl.dustLevel > 0 ? 'cursor-pointer' : 'cursor-grab'}`} />
                </div>
              );
            })}
            
            {shelfVinyls.length === 0 && (
              <div className="w-full flex flex-col items-center justify-center opacity-30 mt-10">
                <Disc size={48} className="mb-2" />
                <span className="font-marker text-xl">Sold Out!</span>
              </div>
            )}
            <div className="w-24 flex-shrink-0"></div>
         </div>
      </section>

      {flyingVinyls.map(item => <FlyingVinylItem key={item.id} item={item} onComplete={handleLanding} isMobile={isMobile} />)}

      {activeVinyl && (
        <div className="fixed inset-0 z-[100] pointer-events-none" style={{ touchAction: 'none' }}>
            {/* Direct DOM Element for smooth dragging */}
            <div
                ref={dragElRef}
                className="absolute top-0 left-0 will-change-transform"
                style={{
                    transition: 'filter 0.15s ease-out'
                }}
            >
                <VinylCover vinyl={activeVinyl} size={isMobile ? 130 : 150} className="shadow-[0_40px_80px_rgba(0,0,0,0.8)]" />
            </div>
        </div>
      )}

      {(gameState.status === 'won' || gameState.status === 'lost') && (() => {
        // Calculate stats
        const timeElapsed = Math.floor((Date.now() - gameState.startTime) / 1000);
        const accuracy = gameState.totalMoves > 0
          ? Math.floor(((gameState.totalMoves - gameState.mistakes) / gameState.totalMoves) * 100)
          : 100;
        const isPerfect = gameState.mistakes === 0;

        // Rating: S (perfect) > A (>90%) > B (>70%) > C (rest)
        const rating = isPerfect ? 'S' : accuracy >= 90 ? 'A' : accuracy >= 70 ? 'B' : 'C';
        const ratingColor = rating === 'S' ? 'text-yellow-400' : rating === 'A' ? 'text-green-400' : rating === 'B' ? 'text-blue-400' : 'text-gray-400';

        const StatRow = ({ icon, label, value }: { icon: string; label: string; value: string }) => (
          <div className="flex items-center justify-between py-2 border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className="text-xl">{icon}</span>
              <span className="text-white/80 text-sm">{label}</span>
            </div>
            <span className="text-white font-display text-lg">{value}</span>
          </div>
        );

        return (
          <div className="absolute inset-0 z-[200] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#1a1110] border-2 border-[#5c4033] p-1 rounded-2xl shadow-2xl max-w-sm w-full transform rotate-1">
               <div className="bg-[#2a1d18] border border-[#3e2723] rounded-xl p-6 text-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-wood opacity-30 pointer-events-none"></div>
                  <div className="relative z-10">
                    {gameState.status === 'won' ? (
                      <>
                        <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-3 drop-shadow-[0_0_20px_rgba(250,204,21,0.6)]" />
                        <h2 className="text-4xl font-marker text-white mb-1 rotate-[-2deg]">Groovy!</h2>

                        {/* Stars Display */}
                        <div className="flex justify-center gap-1 mb-3">
                          {[1, 2, 3].map((star) => (
                            <Star
                              key={star}
                              size={28}
                              className={`${
                                star <= gameState.starsEarned
                                  ? 'text-yellow-400 fill-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.8)] animate-pulse'
                                  : 'text-gray-600 fill-gray-800'
                              }`}
                              style={{ animationDelay: `${star * 0.1}s` }}
                            />
                          ))}
                        </div>

                        {/* Rating Badge */}
                        <div className={`inline-block px-4 py-1 rounded-full border-2 ${ratingColor} ${rating === 'S' ? 'border-yellow-400 bg-yellow-400/20' : rating === 'A' ? 'border-green-400 bg-green-400/20' : rating === 'B' ? 'border-blue-400 bg-blue-400/20' : 'border-gray-400 bg-gray-400/20'} font-black text-2xl mb-4`}>
                          {rating}
                        </div>

                        {/* New Record Badge */}
                        {isNewRecord && (
                          <div className="mb-3 px-4 py-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-2 border-yellow-400 rounded-lg animate-pulse">
                            <div className="flex items-center justify-center gap-2 text-yellow-400 font-display text-lg">
                              <TrendingUp size={20} />
                              Nuovo Record!
                            </div>
                          </div>
                        )}

                        {/* Stats */}
                        <div className="bg-black/40 rounded-lg p-4 mb-4 text-left">
                          <StatRow icon="🎯" label="Accuracy" value={`${accuracy}%`} />
                          <StatRow icon="🔥" label="Max Combo" value={`${gameState.maxComboThisLevel}x`} />
                          <StatRow icon="⏱️" label="Time" value={`${timeElapsed}s`} />
                          <StatRow icon="💿" label="Sorted" value={`${gameState.vinylsSorted}`} />
                          {isPerfect && (
                            <div className="mt-2 pt-2 border-t border-yellow-400/30 flex items-center justify-center gap-2 text-yellow-400 animate-pulse">
                              <CheckCircle2 size={16} />
                              <span className="font-marker text-sm">PERFECT!</span>
                            </div>
                          )}
                        </div>

                        {/* Secondary Objectives Results */}
                        {gameState.secondaryObjectives && gameState.secondaryObjectives.length > 0 && (() => {
                          const completedObjectives = gameState.secondaryObjectives.filter(obj => obj.completed);
                          const bonusXP = calculateObjectiveBonus(gameState.secondaryObjectives);

                          if (completedObjectives.length > 0) {
                            return (
                              <div className="bg-purple-900/30 border border-purple-500/50 rounded-lg p-3 mb-4">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-purple-300 font-marker text-sm">Obiettivi Completati</span>
                                  <span className="text-purple-400 font-bold text-xs">{completedObjectives.length}/{gameState.secondaryObjectives.length}</span>
                                </div>
                                <div className="space-y-1">
                                  {completedObjectives.map(obj => (
                                    <div key={obj.id} className="flex items-center justify-between text-xs">
                                      <div className="flex items-center gap-1.5">
                                        <CheckCircle2 size={12} className="text-green-400" />
                                        <span className="text-white/80">{obj.title}</span>
                                      </div>
                                      <span className="text-green-400 font-bold">+{obj.bonusXP} XP</span>
                                    </div>
                                  ))}
                                </div>
                                {bonusXP > 0 && (
                                  <div className="mt-2 pt-2 border-t border-purple-500/30 flex items-center justify-between">
                                    <span className="text-purple-300 font-marker text-sm">Bonus Totale</span>
                                    <span className="text-yellow-400 font-black text-lg">+{bonusXP} XP</span>
                                  </div>
                                )}
                              </div>
                            );
                          }
                          return null;
                        })()}

                        <button onClick={goToNextLevel} className="w-full py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-black uppercase rounded-lg text-lg flex items-center justify-center gap-3 shadow-[0_5px_0_#b45309] active:shadow-none active:translate-y-[5px]">Next Gig <Zap size={20} fill="black" /></button>
                        <button onClick={() => { clearComboTimer(); setGameState(prev => ({...prev, status: 'menu'})); }} className="mt-3 text-gray-400 underline text-sm">Return to Menu</button>
                      </>
                    ) : (
                      <>
                        <Music className="w-16 h-16 text-red-500 mx-auto mb-3 drop-shadow-[0_0_20px_rgba(239,68,68,0.6)]" />
                        <h2 className="text-4xl font-marker text-white mb-2 rotate-[-2deg]">Bummer!</h2>
                        <p className="text-white/60 mb-4 text-sm">{gameState.mode === 'SuddenDeath' ? "Don't make a single mistake!" : gameState.mode === 'Timed' ? "Time ran out!" : "Out of moves!"}</p>

                        {/* Stats (even on loss) */}
                        <div className="bg-black/40 rounded-lg p-4 mb-4 text-left">
                          <StatRow icon="🎯" label="Accuracy" value={`${accuracy}%`} />
                          <StatRow icon="🔥" label="Max Combo" value={`${gameState.maxComboThisLevel}x`} />
                          <StatRow icon="⏱️" label="Time" value={`${timeElapsed}s`} />
                          <StatRow icon="💿" label="Sorted" value={`${gameState.vinylsSorted}`} />
                        </div>

                        <button onClick={() => startLevel(levelIndex, gameState.difficulty)} className="w-full py-3 bg-[#3e2723] hover:bg-[#4e342e] text-[#d7ccc8] font-black uppercase rounded-lg text-lg flex items-center justify-center gap-3 shadow-[0_5px_0_#271c19] active:shadow-none active:translate-y-[5px] border border-[#5d4037]">Replay <RefreshCw size={20} /></button>
                        <button onClick={() => { clearComboTimer(); setGameState(prev => ({...prev, status: 'menu'})); }} className="mt-3 text-gray-400 underline text-sm">Return to Menu</button>
                      </>
                    )}
                  </div>
               </div>
            </div>
          </div>
        );
      })()}

      {/* Collection Screen Overlay */}
      {showCollection && (
        <CollectionScreen
          collection={saveData.collection}
          totalRareVinyls={50} // Placeholder: questo dovrebbe venire da gameLogic
          onClose={() => setShowCollection(false)}
        />
      )}

      {/* Audio Settings Modal */}
      {showAudioSettings && (
        <AudioSettings onClose={() => setShowAudioSettings(false)} />
      )}

      {/* Accessibility Settings Overlay */}
      {showAccessibilitySettings && (
        <AccessibilitySettings
          saveData={saveData}
          onClose={() => setShowAccessibilitySettings(false)}
          onUpdate={setSaveData}
        />
      )}

      {/* Customization Settings Overlay */}
      {showCustomization && (
        <CustomizationScreen
          saveData={saveData}
          onClose={() => setShowCustomization(false)}
          onUpdate={setSaveData}
        />
      )}

      {/* Confirm Dialog */}
      {confirmDialog && (
        <div className="fixed inset-0 z-[400] bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#2a1d18] rounded-xl p-6 max-w-sm w-full border-2 border-white/20">
            <h3 className="font-display text-2xl text-white mb-2">{confirmDialog.title}</h3>
            <p className="text-gray-300 mb-6">{confirmDialog.message}</p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDialog(null)}
                className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors font-marker"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  confirmDialog.onConfirm();
                  setConfirmDialog(null);
                }}
                className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors font-marker font-bold"
              >
                {confirmDialog.confirmLabel || 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Level-Up Animation */}
      {showLevelUp && !prefersReducedMotion && (
        <div className="fixed inset-0 z-[600] bg-gradient-to-br from-purple-900 via-black to-blue-900 flex items-center justify-center overflow-hidden">
          <div className="text-center animate-[scale-pulse_2s_ease-in-out_infinite]">
            <Star size={140} className="text-yellow-400 mx-auto mb-6 animate-[spin-slow_3s_linear_infinite] drop-shadow-[0_0_30px_rgba(250,204,21,0.8)]" />
            <h2 className="text-7xl font-display text-white mb-4 animate-bounce">
              Level {levelUpNumber}!
            </h2>
            <p className="text-2xl text-cyan-400 animate-pulse">Get ready...</p>
          </div>

          {/* Background floating particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {Array.from({ length: 20 }).map((_, i) => (
              <div
                key={i}
                className="absolute bg-white rounded-full animate-[float_3s_ease-in-out_infinite]"
                style={{
                  width: Math.random() * 4 + 2 + 'px',
                  height: Math.random() * 4 + 2 + 'px',
                  left: Math.random() * 100 + '%',
                  top: Math.random() * 100 + '%',
                  animationDelay: Math.random() * 2 + 's',
                  opacity: Math.random() * 0.5 + 0.3
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Simplified level-up for reduced motion */}
      {showLevelUp && prefersReducedMotion && (
        <div className="fixed inset-0 z-[600] bg-black/95 flex items-center justify-center">
          <div className="text-center">
            <Star size={80} className="text-yellow-400 mx-auto mb-4" />
            <h2 className="text-5xl font-display text-white mb-2">
              Level {levelUpNumber}!
            </h2>
            <p className="text-xl text-cyan-400">Get ready...</p>
          </div>
        </div>
      )}

      <style>{`
        @keyframes scale-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-30px); }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Achievement Screen Overlay */}
      {showAchievements && (
        <AchievementScreen
          saveData={saveData}
          onClose={() => setShowAchievements(false)}
        />
      )}

      {/* Stats Screen Overlay */}
      {showStats && (
        <StatsScreen
          saveData={saveData}
          onClose={() => setShowStats(false)}
        />
      )}

      {/* Achievement Toast Notifications */}
      {achievementToasts.map((achievementId, index) => (
        <div key={achievementId} style={{ position: 'fixed', top: `${80 + index * 130}px` }}>
          <AchievementToast
            achievementId={achievementId}
            onComplete={() => {
              setAchievementToasts((prev) => prev.filter((id) => id !== achievementId));
            }}
          />
        </div>
      ))}

      {/* New Vinyl Discovery Toast */}
      {newVinylToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 animate-[slide-down_0.5s_ease-out] z-[250]">
          <div className="bg-gradient-to-br from-purple-900 to-purple-700 backdrop-blur rounded-xl p-4 border-2 border-yellow-400 shadow-2xl max-w-sm">
            <Sparkles className="text-yellow-400 mx-auto mb-2 animate-pulse" size={32} />
            <p className="text-white font-display text-lg text-center">Nuovo vinile scoperto!</p>
            <div className="mt-2 bg-black/30 rounded-lg p-3">
              <p className="text-yellow-400 font-bold text-center">{newVinylToast.title}</p>
              <p className="text-gray-300 text-sm text-center">{newVinylToast.artist}</p>
              <div className="text-center mt-1">
                <span className={`inline-block px-2 py-1 rounded text-xs ${GENRE_COLORS[newVinylToast.genre]}`}>
                  {newVinylToast.genre}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
      <style>{`
        @keyframes slide-down {
          from { transform: translateX(-50%) translateY(-100px); opacity: 0; }
          to { transform: translateX(-50%) translateY(0); opacity: 1; }
        }
      `}</style>

      {/* In-Game Stats */}
      {gameState.status === 'playing' && (() => {
        const currentAccuracy = gameState.totalMoves > 0
          ? ((gameState.totalMoves - gameState.mistakes) / gameState.totalMoves) * 100
          : 100;

        const predictedStars = gameState.mistakes === 0
          ? (gameState.maxComboThisLevel >= 5 ? 3 : 2)
          : 1;

        const personalBest = saveData.levelRecords?.[levelIndex]?.bestScore || 0;

        return (
          <InGameStats
            currentAccuracy={currentAccuracy}
            predictedStars={predictedStars}
            personalBest={personalBest}
            isVisible={showInGameStats}
            onToggle={() => setShowInGameStats(!showInGameStats)}
          />
        );
      })()}

      {/* Hint Button */}
      <HintButton
        onClick={showHint}
        disabled={gameState.movesLeft <= 0}
        visible={saveData.level >= 10 && gameState.status === 'playing'}
      />

      {/* Secondary Objectives */}
      {gameState.status === 'playing' && gameState.secondaryObjectives && gameState.secondaryObjectives.length > 0 && (
        <SecondaryObjectives objectives={gameState.secondaryObjectives} isMobile={isMobile} />
      )}

      {/* Crate Swap Countdown Warning */}
      {swapCountdown !== null && swapCountdown > 0 && (
        <div className={`fixed ${isMobile ? 'top-20' : 'top-1/2'} left-1/2 -translate-x-1/2 ${isMobile ? '' : '-translate-y-1/2'} z-[250] pointer-events-none`}>
          <div className={`bg-red-900/90 backdrop-blur border-4 border-red-500 rounded-full ${isMobile ? 'w-16 h-16' : 'w-24 h-24'} flex items-center justify-center animate-pulse shadow-[0_0_30px_rgba(239,68,68,0.8)]`}>
            <div className="text-center">
              <div className={`text-white ${isMobile ? 'text-3xl' : 'text-5xl'} font-black animate-bounce`}>{swapCountdown}</div>
              {!isMobile && <div className="text-red-300 text-xs font-marker mt-1">SWAP!</div>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}