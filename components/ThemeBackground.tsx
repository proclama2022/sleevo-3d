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

// Color themes per ambiente (per mobile) - molto più chiari
const THEME_COLORS = {
  Basement: {
    from: '#4d3535',
    via: '#3a2828',
    to: '#2a2020',
    accent: '#8b4513'
  },
  Store: {
    from: '#3a4a5d',
    via: '#2a3848',
    to: '#1f2a35',
    accent: '#4a90e2'
  },
  Expo: {
    from: '#4d3545',
    via: '#3a2835',
    to: '#2a2025',
    accent: '#9b59b6'
  }
};

export const ThemeBackground: React.FC<ThemeBackgroundProps> = ({ theme }) => {
  const { isMobile } = useWindowSize();
  const bgUrl = BACKGROUNDS[theme] || BACKGROUNDS.Basement;
  const colors = THEME_COLORS[theme];

  // STESSO SFONDO SU MOBILE E DESKTOP: AI images nitide con spotlight centrale
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* AI Background - nitido e visibile */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${bgUrl})`,
          opacity: 0.4,
          filter: 'saturate(0.8) brightness(1.1)',
        }}
      />

      {/* FORTE spotlight centrale per area di gioco */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 80% 65% at 50% 45%, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.12) 45%, transparent 75%)'
        }}
      />

      {/* Oscura solo i bordi */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/15 via-transparent to-black/25" />

      {/* Vignetta SOLO sui bordi estremi */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.5) 100%)'
        }}
      />
    </div>
  );
};

export default ThemeBackground;
