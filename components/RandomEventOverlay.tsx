/**
 * Random Event Overlay Component
 *
 * Displays active random events with countdown timer and visual effects.
 */

import React from 'react';
import { RandomEvent, RANDOM_EVENT_CONFIG, isBlackoutActive, isEarthquakeActive } from '../types/events';
import { getEventProgress } from '../services/randomEvents';

interface RandomEventOverlayProps {
  activeEvent: RandomEvent | null;
}

export const RandomEventOverlay: React.FC<RandomEventOverlayProps> = ({ activeEvent }) => {
  if (!activeEvent) return null;

  const config = RANDOM_EVENT_CONFIG[activeEvent.type];
  const progress = getEventProgress(activeEvent);

  return (
    <>
      {/* Event notification banner */}
      <div
        className={`
          fixed top-20 left-1/2 -translate-x-1/2 z-50
          px-6 py-3 rounded-lg font-bold text-white
          animate-fade-in-down
          ${config.isBonus ? 'bg-gradient-to-r from-yellow-500 to-orange-500' : 'bg-gradient-to-r from-red-600 to-red-700'}
          shadow-2xl border-2 border-white/20
        `}
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{config.title.split(' ')[0]}</span>
          <span className="text-lg">{config.title.split(' ').slice(1).join(' ')}</span>
        </div>

        {/* Countdown bar */}
        {config.duration > 0 && (
          <div className="mt-2 w-full bg-black/30 rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-white transition-all duration-100 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>

      {/* Blackout overlay */}
      {isBlackoutActive(activeEvent) && (
        <div className="fixed inset-0 bg-black/85 z-40 pointer-events-none backdrop-blur-sm">
          {/* Subtle vignette effect */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/60" />
        </div>
      )}

      {/* Earthquake effect - applied via CSS class to game container */}
      {isEarthquakeActive(activeEvent) && (
        <style>{`
          @keyframes earthquake {
            0%, 100% { transform: translate(0, 0); }
            25% { transform: translate(-5px, 5px); }
            50% { transform: translate(5px, -5px); }
            75% { transform: translate(-5px, -5px); }
          }

          .earthquake-active {
            animation: earthquake 0.1s infinite;
          }

          .earthquake-active .crate-box {
            animation: crate-shake 0.2s infinite;
          }

          @keyframes crate-shake {
            0%, 100% { transform: rotate(0deg); }
            25% { transform: rotate(-2deg); }
            75% { transform: rotate(2deg); }
          }
        `}</style>
      )}

      {/* Magnetic glow effect */}
      {activeEvent.type === 'magnetic_surge' && (
        <style>{`
          .magnetic-glow {
            box-shadow: 0 0 30px rgba(59, 130, 246, 0.8), 0 0 60px rgba(59, 130, 246, 0.4);
          }
        `}</style>
      )}

      {/* Slow motion visual effect */}
      {activeEvent.type === 'slow_motion' && (
        <style>{`
          .slow-motion-active {
            animation: slow-motion-pulse 2s ease-in-out infinite;
          }

          @keyframes slow-motion-pulse {
            0%, 100% { filter: blur(0px); }
            50% { filter: blur(2px); }
          }
        `}</style>
      )}
    </>
  );
};
