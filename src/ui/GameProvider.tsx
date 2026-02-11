import React, { createContext, useContext, useRef, useEffect, ReactNode } from 'react';
import { useGameStore } from '../store/gameStore';
import { GameBridge, createGameBridge, GameBridgeConfig } from '../services/gameBridge';

interface GameContextValue {
  bridge: GameBridge | null;
}

const GameContext = createContext<GameContextValue>({ bridge: null });

export interface GameProviderProps extends Partial<GameBridgeConfig> {
  children: ReactNode;
}

/**
 * GameProvider - Wraps app with game context
 * Initializes GameBridge and provides it to children
 */
export const GameProvider: React.FC<GameProviderProps> = ({
  children,
  ...bridgeConfig
}) => {
  const bridgeRef = useRef<GameBridge | null>(null);

  useEffect(() => {
    const config: GameBridgeConfig = {
      store: useGameStore,
      ...bridgeConfig,
    };

    bridgeRef.current = createGameBridge(config);

    return () => {
      bridgeRef.current?.disconnect();
      bridgeRef.current = null;
    };
  }, [bridgeConfig]);

  return (
    <GameContext.Provider value={{ bridge: bridgeRef.current }}>
      {children}
    </GameContext.Provider>
  );
};

/**
 * Hook to access GameBridge from context
 */
export const useGameBridge = (): GameBridge | null => {
  const context = useContext(GameContext);
  return context.bridge;
};

export default GameProvider;
