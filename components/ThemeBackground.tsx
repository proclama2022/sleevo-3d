import React from 'react';
import { Music, Zap } from 'lucide-react';

interface ThemeBackgroundProps {
  theme: 'Basement' | 'Store' | 'Expo';
}

// AI-Generated backgrounds from Runware
const BACKGROUNDS = {
  Basement: 'https://im.runware.ai/image/ws/2/ii/cd22c6bd-5e9d-4f85-8aed-5d2f9780839d.jpg',
  Store: 'https://im.runware.ai/image/ws/2/ii/cb2c19d2-b6ac-4c75-9c81-f67218ced3b7.jpg',
  Expo: 'https://im.runware.ai/image/ws/2/ii/8d81370c-79aa-4127-a3e4-c034944636f3.jpg',
};

export const ThemeBackground: React.FC<ThemeBackgroundProps> = ({ theme }) => {
  if (theme === 'Basement') {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* AI-Generated Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${BACKGROUNDS.Basement})` }}
        />

        {/* Overlay gradient for depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />

        {/* Vignette effect for focus */}
        <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-black/50" />
      </div>
    );
  }

  if (theme === 'Store') {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* AI-Generated Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${BACKGROUNDS.Store})` }}
        />

        {/* Overlay gradient for UI readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/50" />

        {/* Subtle spotlight effect to enhance the image */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-gradient-to-b from-white/5 to-transparent rounded-full blur-3xl"></div>
      </div>
    );
  }

  if (theme === 'Expo') {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* AI-Generated Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${BACKGROUNDS.Expo})` }}
        />

        {/* Overlay gradient for game elements visibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />

        {/* Enhanced stage spotlights overlay for extra drama */}
        <div className="absolute top-0 left-1/3 w-64 h-96 bg-gradient-to-b from-purple-500/15 to-transparent rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-0 right-1/3 w-64 h-96 bg-gradient-to-b from-pink-500/15 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>

        {/* Smoke effect for atmosphere */}
        <div className="absolute bottom-16 left-10 w-48 h-48 bg-white/5 rounded-full blur-3xl animate-[float_4s_ease-in-out_infinite]"></div>
        <div className="absolute bottom-20 right-16 w-56 h-56 bg-white/5 rounded-full blur-3xl animate-[float_5s_ease-in-out_infinite]" style={{ animationDelay: '2s' }}></div>
      </div>
    );
  }

  return null;
};

export default ThemeBackground;

// Inline styles for custom animations
const styles = `
  @keyframes swing {
    0%, 100% { transform: rotate(-3deg); }
    50% { transform: rotate(3deg); }
  }
  @keyframes float {
    0%, 100% { transform: translateY(0) scale(1); }
    50% { transform: translateY(-20px) scale(1.1); }
  }
  .animate-swing {
    animation: swing 3s ease-in-out infinite;
  }
  .animate-float {
    animation: float 4s ease-in-out infinite;
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleEl = document.createElement('style');
  styleEl.textContent = styles;
  document.head.appendChild(styleEl);
}
