
import React, { useMemo } from 'react';
import { Vinyl, GENRE_COLORS, Genre } from '../types';
import { Star, Trash2, Cloud, FileWarning, Gem, Zap, Bomb, Link, Clock, Music, Heart, Sparkles, Disc, Skull, Activity } from 'lucide-react';
import { GENRE_PATTERNS } from '../constants/gameConfig';
import { loadSaveData } from '../services/storage';

interface VinylCoverProps {
  vinyl: Vinyl;
  size?: number;
  className?: string;
  rotation?: number;
  isGhost?: boolean;
  isMobile?: boolean;
}

// Genre icon mapping
const GENRE_ICONS: Record<Genre, React.ElementType> = {
  [Genre.Rock]: Zap,
  [Genre.Jazz]: Music,
  [Genre.Soul]: Heart,
  [Genre.Funk]: Sparkles,
  [Genre.Disco]: Disc,
  [Genre.Punk]: Skull,
  [Genre.Electronic]: Activity,
};

// Genre accent colors (hex for inline styles)
const GENRE_ACCENT_COLORS: Record<Genre, string> = {
  [Genre.Rock]: '#ef4444',
  [Genre.Jazz]: '#3b82f6',
  [Genre.Soul]: '#eab308',
  [Genre.Funk]: '#f97316',
  [Genre.Disco]: '#a855f7',
  [Genre.Punk]: '#db2777',
  [Genre.Electronic]: '#06b6d4',
};

// AI-Generated Vinyl Sleeves from Runware
const VINYL_SLEEVE_IMAGES: Record<Genre, string> = {
  [Genre.Rock]: 'https://im.runware.ai/image/ws/2/ii/66032ad1-e95f-40f1-8d5f-0e7d8a8472dc.jpg',
  [Genre.Jazz]: 'https://im.runware.ai/image/ws/2/ii/86883c39-6477-4a7f-aed3-f8db9784f4fc.jpg',
  [Genre.Soul]: 'https://im.runware.ai/image/ws/2/ii/af301809-3a77-4cfc-9898-8289a3fc219a.jpg',
  [Genre.Funk]: 'https://im.runware.ai/image/ws/2/ii/8ce015d2-4597-4be4-9ab5-e96a79305b5a.jpg',
  [Genre.Disco]: 'https://im.runware.ai/image/ws/2/ii/fbf1334f-de4f-4480-b6aa-90263f97781e.jpg',
  [Genre.Punk]: 'https://im.runware.ai/image/ws/2/ii/bc0123a8-d96d-494c-8cb7-02f0617fa030.jpg',
  [Genre.Electronic]: 'https://im.runware.ai/image/ws/2/ii/dccfe150-c871-4e80-aaa3-57ee5be90353.jpg',
};

// --- ART STYLES ---
const VinylArtLayer = ({ genre, isGold, isMobile = false }: { genre: Genre, isGold: boolean, isMobile?: boolean }) => {
  // Mobile: use solid colors + patterns instead of dark AI images
  if (isMobile) {
    return (
      <div className="absolute inset-0 overflow-hidden">
        {/* Bright gradient background */}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(135deg, ${GENRE_ACCENT_COLORS[genre]}dd 0%, ${GENRE_ACCENT_COLORS[genre]}99 50%, ${GENRE_ACCENT_COLORS[genre]}cc 100%)`
          }}
        />
        {/* Large centered icon */}
        <div className="absolute inset-0 flex items-center justify-center opacity-20">
          {React.createElement(GENRE_ICONS[genre], {
            size: 120,
            strokeWidth: 1.5,
            style: { color: 'white' }
          })}
        </div>
        {/* Simple pattern overlay */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.3) 10px, rgba(255,255,255,0.3) 20px)`
          }}
        />
        {/* Gold overlay effect */}
        {isGold && (
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/40 via-transparent to-yellow-600/40"></div>
        )}
      </div>
    );
  }

  // Desktop: keep AI images
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* AI-Generated Album Cover */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${VINYL_SLEEVE_IMAGES[genre]})`,
          filter: isGold ? 'sepia(0.4) saturate(1.5) hue-rotate(-10deg)' : 'none'
        }}
      />
      {/* Gold overlay effect */}
      {isGold && (
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/30 via-transparent to-yellow-600/30 mix-blend-overlay"></div>
      )}
    </div>
  );
};

const TrashArt = () => (
    <div className="absolute inset-0 bg-[#3e3e3e] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[repeating-linear-gradient(45deg,#000,#000_10px,#333_10px,#333_20px)]"></div>
        <Trash2 className="text-white/20 w-1/2 h-1/2" />
        <div className="absolute top-2 left-2 w-12 h-12 bg-white/10 rounded-full blur-xl"></div>
    </div>
);

const DustOverlay = ({ level }: { level: number }) => {
    if (level <= 0) return null;
    const opacity = level === 3 ? 0.95 : level === 2 ? 0.7 : 0.4;
    return (
        <div className="absolute inset-0 z-40 transition-opacity duration-300" style={{ opacity }}>
             <div className="absolute inset-0 bg-[#d1d5db]"></div>
             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/concrete-wall.png')] mix-blend-multiply opacity-50"></div>
             {/* Dust Bunnies */}
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center animate-pulse">
                <Cloud size={40} className="text-gray-500 fill-gray-400 blur-[1px]" />
                <span className="mt-1 font-marker text-xs text-gray-600 tracking-widest uppercase">Tap to Clean</span>
             </div>
        </div>
    );
};

export const VinylCover: React.FC<VinylCoverProps> = React.memo(({
  vinyl,
  size = 140,
  className = '',
  rotation = 0,
  isGhost = false,
  isMobile = false
}) => {
  const { isMystery, isRevealed, isGold, id, genre, artist, title, isTrash, dustLevel } = vinyl;
  const isMysteryState = isMystery && !isRevealed;
  const isDusty = dustLevel > 0;

  // Read accessibility settings for colorblind mode
  const colorBlindMode = useMemo(() => {
    const saveData = loadSaveData();
    return saveData.accessibilitySettings?.colorBlindMode || 'none';
  }, []);

  // Track reveal animation
  const [isRevealing, setIsRevealing] = React.useState(false);
  const prevRevealedRef = React.useRef(isRevealed);

  React.useEffect(() => {
    // Trigger flip animation when mystery is revealed
    if (!prevRevealedRef.current && isRevealed && isMystery) {
      setIsRevealing(true);
      setTimeout(() => setIsRevealing(false), 600);
    }
    prevRevealedRef.current = isRevealed;
  }, [isRevealed, isMystery]);

  const ArtLayer = useMemo(() => {
    if (isTrash) return <TrashArt />;
    if (isMysteryState) return null;
    return <VinylArtLayer genre={genre} isGold={!!isGold} isMobile={isMobile} />;
  }, [genre, isMysteryState, isGold, isTrash, isMobile]);

  const getBgClass = () => {
    if (isTrash) return 'bg-[#2a2a2a]';
    if (isMysteryState) return 'bg-[#1a1a1a]';
    if (isGold) return 'bg-gradient-to-br from-yellow-300 via-yellow-500 to-yellow-700';
    return GENRE_COLORS[genre] || 'bg-gray-700';
  };

  return (
    <div
      className={`relative select-none flex items-center ${className} ${isGhost ? 'opacity-40' : ''} ${isRevealing ? 'animate-flip-reveal' : ''}`}
      style={{
        width: isTrash ? size : size * 1.25,
        height: size,
        transform: `rotate(${rotation}deg)`,
        transition: isGhost ? 'none' : 'transform 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)',
        transformOrigin: '50% 50%',
      }}
    >
      <style>{`
        @keyframes flip-reveal {
          0% { transform: rotateY(0deg); opacity: 1; }
          50% { transform: rotateY(90deg); opacity: 0.5; }
          100% { transform: rotateY(0deg); opacity: 1; }
        }
        .animate-flip-reveal {
          animation: flip-reveal 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}</style>
      {/* 1. The Record (Only if not trash) */}
      {!isTrash && (
        <div 
            className="absolute right-0 top-1/2 -translate-y-1/2 rounded-full bg-[#111] shadow-2xl flex items-center justify-center overflow-hidden"
            style={{ width: size * 0.96, height: size * 0.96 }}
        >
            <div className="absolute inset-0 opacity-30 bg-[repeating-radial-gradient(#333_0,#111_2px,#111_3px)]"></div>
            <div className="w-[35%] h-[35%] rounded-full bg-gray-800 flex items-center justify-center relative">
                <div className={`w-full h-full rounded-full opacity-50 ${GENRE_COLORS[genre]}`}></div>
                <div className="absolute w-1.5 h-1.5 bg-black rounded-full"></div>
            </div>
        </div>
      )}

      {/* 2. The Sleeve / Trash Object */}
      <div
        className={`
          relative z-10 rounded-sm overflow-hidden flex flex-col
          ${getBgClass()}
          ${isTrash ? 'border-2 border-dashed border-gray-600 rounded-xl' : 'border-8'}
        `}
        style={{
            width: size,
            height: size,
            filter: isMysteryState ? 'grayscale(1)' : 'none',
            borderColor: isTrash ? undefined : GENRE_ACCENT_COLORS[genre],
            boxShadow: isTrash ? undefined : `
              2px 5px 20px rgba(0,0,0,0.8),
              0 0 25px ${GENRE_ACCENT_COLORS[genre]}cc,
              inset 0 0 0 2px rgba(255,255,255,0.2)
            `
        }}
      >
        {ArtLayer}

        {/* Colorblind mode texture pattern */}
        {colorBlindMode !== 'none' && !isTrash && !isMysteryState && (
          <div
            className="absolute inset-0 opacity-30 mix-blend-overlay pointer-events-none z-30"
            style={{
              backgroundImage: GENRE_PATTERNS[genre],
              backgroundSize: '20px 20px'
            }}
          />
        )}

        <DustOverlay level={dustLevel} />

        {/* Genre Icon Badge (always visible, except trash) */}
        {!isTrash && !isMysteryState && (
          <div
            className="absolute top-2 left-2 z-50 rounded-full flex items-center justify-center shadow-lg border-4 border-white"
            style={{
              width: size * 0.35,
              height: size * 0.35,
              backgroundColor: `${GENRE_ACCENT_COLORS[genre]}f5`,
              boxShadow: `
                0 0 20px ${GENRE_ACCENT_COLORS[genre]}ff,
                0 4px 12px rgba(0,0,0,0.6),
                inset 0 2px 4px rgba(255,255,255,0.4)
              `
            }}
          >
            {React.createElement(GENRE_ICONS[genre], {
              size: size * 0.2,
              strokeWidth: 3,
              style: { color: 'white', filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.8))' }
            })}
          </div>
        )}

        {isMysteryState && !isTrash && !isDusty && (
           <div className="absolute inset-0 flex flex-col items-center justify-center z-50 bg-black/40">
             <span className="font-display text-4xl text-white/50 animate-pulse">?</span>
           </div>
        )}

        {/* Sparkle effect on reveal */}
        {isRevealing && !isTrash && !isDusty && (
          <div className="absolute inset-0 z-50 pointer-events-none">
            {[...Array(8)].map((_, i) => {
              const angle = (i / 8) * 360;
              const distance = 60;
              return (
                <div
                  key={i}
                  className="absolute top-1/2 left-1/2 w-2 h-2 bg-yellow-400 rounded-full animate-[sparkle_0.6s_ease-out_forwards]"
                  style={{
                    '--angle': `${angle}deg`,
                    '--distance': `${distance}px`,
                  } as React.CSSProperties}
                ></div>
              );
            })}
            <style>{`
              @keyframes sparkle {
                0% {
                  transform: translate(-50%, -50%) rotate(var(--angle)) translateY(0) scale(1);
                  opacity: 1;
                }
                100% {
                  transform: translate(-50%, -50%) rotate(var(--angle)) translateY(calc(var(--distance) * -1)) scale(0);
                  opacity: 0;
                }
              }
            `}</style>
          </div>
        )}

        {/* Content Overlay (Hidden if dusty or trash) */}
        {!isMysteryState && !isTrash && !isDusty && (
          <>
            {/* Gradient overlays for text readability - STRONGER */}
            <div className="absolute top-0 left-0 right-0 h-28 bg-gradient-to-b from-black/85 to-transparent z-10"></div>
            <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-black/85 to-transparent z-10"></div>

            <div className="absolute inset-0 flex flex-col justify-between p-3 z-20">
              <div className="flex justify-between items-start">
                <h3 className="font-display text-white text-xl leading-none font-bold drop-shadow-[0_3px_10px_rgba(0,0,0,1)] truncate flex-1" style={{ textShadow: '0 0 8px rgba(0,0,0,1), 0 3px 10px rgba(0,0,0,1), 0 0 2px rgba(255,255,255,0.3)' }}>{artist}</h3>
                {/* Special Disc Badge */}
                {vinyl.specialType && (
                  <div className="ml-2 flex-shrink-0">
                    {vinyl.specialType === 'diamond' && (
                      <div className="bg-cyan-500 rounded-full p-1 shadow-[0_0_10px_rgba(6,182,212,0.8)]">
                        <Gem size={14} className="text-white" />
                      </div>
                    )}
                    {vinyl.specialType === 'wildcard' && (
                      <div className="bg-gradient-to-br from-red-500 via-yellow-500 to-blue-500 rounded-full p-1 shadow-[0_0_10px_rgba(255,255,255,0.6)]">
                        <Zap size={14} className="text-white" />
                      </div>
                    )}
                    {vinyl.specialType === 'bomb' && (
                      <div className="bg-red-600 rounded-full p-1 shadow-[0_0_10px_rgba(220,38,38,0.8)] animate-pulse">
                        <Bomb size={14} className="text-white" />
                      </div>
                    )}
                    {vinyl.specialType === 'chain' && (
                      <div className="bg-purple-500 rounded-full p-1 shadow-[0_0_10px_rgba(168,85,247,0.8)]">
                        <Link size={14} className="text-white" />
                      </div>
                    )}
                    {vinyl.specialType === 'time' && (
                      <div className="bg-green-500 rounded-full p-1 shadow-[0_0_10px_rgba(34,197,94,0.8)]">
                        <Clock size={14} className="text-white" />
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="flex justify-between items-end">
                <span className="font-marker text-white text-sm leading-tight max-w-[75%] -rotate-2 font-bold" style={{ textShadow: '0 0 8px rgba(0,0,0,1), 0 3px 10px rgba(0,0,0,1), 0 0 2px rgba(255,255,255,0.3)' }}>{title}</span>
                {isGold && <Star size={16} className="text-yellow-400 fill-yellow-400 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]" />}
              </div>
            </div>
          </>
        )}
        
        {isTrash && (
            <div className="absolute inset-0 flex flex-col items-center justify-center z-30 pointer-events-none">
                 <div className="bg-red-600 text-white text-[10px] font-bold px-2 py-1 rotate-12 rounded">TRASH</div>
                 <span className="mt-8 font-marker text-white text-sm text-center px-2">{title}</span>
            </div>
        )}
        
        {/* Subtle shine for depth */}
        {!isTrash && !isDusty && (
           <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none mix-blend-overlay"></div>
        )}
      </div>
    </div>
  );
});
