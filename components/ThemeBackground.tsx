import React from 'react';
import { useWindowSize } from '../hooks/useWindowSize';

interface ThemeBackgroundProps {
  theme: 'Basement' | 'Store' | 'Expo';
}

// AI-Generated backgrounds from Runware - shown at low opacity for atmosphere
const BACKGROUNDS = {
  Basement: 'https://im.runware.ai/image/ws/2/ii/cd22c6bd-5e9d-4f85-8aed-5d2f9780839d.jpg',
  Store: 'https://im.runware.ai/image/ws/2/ii/cb2c19d2-b6ac-4c75-9c81-f67218ced3b7.jpg',
  Expo: 'https://im.runware.ai/image/ws/2/ii/8d81370c-79aa-4127-a3e4-c034944636f3.jpg',
};

export const ThemeBackground: React.FC<ThemeBackgroundProps> = ({ theme }) => {
  const { isMobile } = useWindowSize();
  const bgUrl = BACKGROUNDS[theme] || BACKGROUNDS.Basement;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Checkered floor */}
      <div className="absolute inset-0 shop-floor" style={{ opacity: 0.3 }} />

      {/* AI Background - the actual shop photo */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${bgUrl})`,
          opacity: 0.5,
          filter: 'saturate(1.2) brightness(1.2)',
        }}
      />

      {/* Window light effect (natural daylight from top) */}
      <div className="absolute inset-0 window-light" />

      {/* Warm ambient shop lighting */}
      <div className="absolute inset-0 shop-ambient-light" />

      {/* Decorative elements - vintage posters on walls */}
      {!isMobile && (
        <>
          {/* Left wall decoration */}
          <div className="absolute left-4 top-20 w-24 h-32 bg-gradient-to-br from-orange-900/20 to-red-900/20 border-2 border-orange-800/30 rounded-sm shadow-xl transform -rotate-3" style={{ opacity: 0.6 }}>
            <div className="absolute inset-0 flex items-center justify-center text-orange-300/40 font-bold text-xs">LIVE</div>
          </div>

          {/* Right wall decoration */}
          <div className="absolute right-4 top-32 w-28 h-36 bg-gradient-to-br from-blue-900/20 to-purple-900/20 border-2 border-blue-800/30 rounded-sm shadow-xl transform rotate-2" style={{ opacity: 0.6 }}>
            <div className="absolute inset-0 flex items-center justify-center text-blue-300/40 font-bold text-xs">JAZZ</div>
          </div>
        </>
      )}

      {/* Hanging lamp effect (warm spotlight) */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 70% 50% at 50% 35%, rgba(255,220,150,0.25) 0%, rgba(255,200,120,0.08) 40%, transparent 70%)'
        }}
      />

      {/* Central play area highlight */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 75% 60% at 50% 50%, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 45%, transparent 75%)'
        }}
      />

      {/* Subtle vignette */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.4) 100%)'
        }}
      />

      {/* Bottom shadow (counter/desk shadow) */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/30 to-transparent" />
    </div>
  );
};

export default ThemeBackground;
