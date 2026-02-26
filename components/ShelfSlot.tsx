import React, { useRef, useEffect } from 'react';
import { ShelfSlot as ShelfSlotType, Genre } from '../types';
import { VinylCover } from './VinylCover';
import { Plus, Music, Zap, Heart, Sparkles, Disc, Skull, Activity } from 'lucide-react';
import { useWindowSize } from '../hooks/useWindowSize';

interface ShelfSlotProps {
  slot: ShelfSlotType;
  highlightState: 'none' | 'neutral' | 'valid' | 'invalid';
  onRegisterRef: (position: number, el: HTMLDivElement | null) => void;
}

const GENRE_ICONS: Record<Genre, React.ElementType> = {
  [Genre.Rock]: Zap,
  [Genre.Jazz]: Music,
  [Genre.Soul]: Heart,
  [Genre.Funk]: Sparkles,
  [Genre.Disco]: Disc,
  [Genre.Punk]: Skull,
  [Genre.Electronic]: Activity,
};

const GENRE_ACCENT_COLORS: Record<Genre, string> = {
  [Genre.Rock]: '#ef4444',
  [Genre.Jazz]: '#3b82f6',
  [Genre.Soul]: '#eab308',
  [Genre.Funk]: '#f97316',
  [Genre.Disco]: '#a855f7',
  [Genre.Punk]: '#db2777',
  [Genre.Electronic]: '#06b6d4',
};

export const ShelfSlot: React.FC<ShelfSlotProps> = React.memo(({
  slot,
  highlightState,
  onRegisterRef
}) => {
  const { isMobile } = useWindowSize();
  const slotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    onRegisterRef(slot.position, slotRef.current);
    return () => onRegisterRef(slot.position, null);
  }, [slot.position, onRegisterRef]);

  const isEmpty = slot.vinyl === null;
  const hasHint = slot.genre !== null && isEmpty;
  const GenreIcon = hasHint && slot.genre ? GENRE_ICONS[slot.genre] : Plus;
  const genreColor = slot.genre ? GENRE_ACCENT_COLORS[slot.genre] : '#94a3b8';

  // Highlight ring colors
  const ringStyle =
    highlightState === 'valid'
      ? { boxShadow: `0 0 0 3px #22c55e, 0 0 20px rgba(34,197,94,0.5)`, transform: 'scale(1.04)' }
      : highlightState === 'invalid'
      ? { boxShadow: `0 0 0 3px #ef4444, 0 0 20px rgba(239,68,68,0.5)` }
      : highlightState === 'neutral'
      ? { boxShadow: `0 0 0 3px #3b82f6, 0 0 16px rgba(59,130,246,0.4)`, transform: 'scale(1.02)' }
      : {};

  return (
    <div
      ref={slotRef}
      className={`
        relative flex items-center justify-center
        transition-all duration-200
        ${highlightState !== 'none' ? 'z-20' : 'z-0'}
      `}
      style={{
        aspectRatio: '4 / 5',
        borderRadius: '12px',
        ...ringStyle,
      }}
    >
      {/* Slot background */}
      <div
        className={`
          w-full h-full rounded-xl flex items-center justify-center relative overflow-hidden
          ${isEmpty ? 'slot-depth' : 'slot-filled'}
        `}
        style={{
          backgroundColor: isEmpty ? `${genreColor}10` : 'transparent',
          border: isEmpty ? `2px dashed ${genreColor}30` : '2px solid transparent',
        }}
      >
        {isEmpty ? (
          <>
            {/* Genre hint icon at low opacity */}
            {hasHint ? (
              <div
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
                style={{ color: genreColor, opacity: 0.2 }}
              >
                <GenreIcon size={isMobile ? 30 : 36} strokeWidth={1.5} />
              </div>
            ) : (
              <Plus size={isMobile ? 20 : 26} className="text-gray-400/30" strokeWidth={2} />
            )}
          </>
        ) : (
          <>
            {/* Filled vinyl with pop-out effect */}
            <div className="cartoon-bounce">
              <VinylCover vinyl={slot.vinyl} size={isMobile ? 54 : 64} isMobile={isMobile} />
            </div>
            {/* Genre dot badge */}
            {slot.vinyl && (
              <div
                className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center z-30 border-2 border-white shadow-md"
                style={{ backgroundColor: genreColor }}
              >
                <div className="w-1.5 h-1.5 bg-white rounded-full" />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
});
