import React from 'react';
import { ShelfSection, Genre } from '../types';
import { ShelfSlot } from './ShelfSlot';
import { Music, Zap, Heart, Sparkles, Disc, Skull, Activity } from 'lucide-react';
import { useWindowSize } from '../hooks/useWindowSize';

interface GenreSectionProps {
  section: ShelfSection;
  highlightStates: Map<number, 'none' | 'neutral' | 'valid' | 'invalid'>;
  onRegisterSlotRef: (sectionGenre: Genre, position: number, el: HTMLDivElement | null) => void;
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

export const GenreSection: React.FC<GenreSectionProps> = React.memo(({
  section,
  highlightStates,
  onRegisterSlotRef
}) => {
  const { isMobile } = useWindowSize();
  const GenreIcon = GENRE_ICONS[section.genre];
  const genreColor = GENRE_ACCENT_COLORS[section.genre];
  const slotsPerRow = isMobile ? 3 : 6;

  return (
    <div className="relative flex flex-col">
      {/* Genre label bar with colored left border */}
      <div
        className="flex items-center gap-2 px-3 py-1.5 rounded-t-lg"
        style={{
          background: `linear-gradient(90deg, ${genreColor}30 0%, ${genreColor}10 100%)`,
          borderLeft: `4px solid ${genreColor}`,
          borderBottom: `2px solid ${genreColor}50`,
        }}
      >
        <div
          className="flex items-center justify-center rounded-full p-1.5"
          style={{
            backgroundColor: genreColor,
            boxShadow: `0 2px 8px ${genreColor}80`,
          }}
        >
          <GenreIcon size={isMobile ? 12 : 14} strokeWidth={2.5} style={{ color: 'white' }} />
        </div>
        <span
          className="font-display text-xs md:text-sm font-bold uppercase tracking-wider"
          style={{ color: genreColor, textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}
        >
          {section.genre}
        </span>
        {/* Fill progress dots */}
        <div className="flex items-center gap-1 ml-auto">
          {Array.from({ length: section.capacity }).map((_, i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full transition-all duration-300"
              style={{
                backgroundColor: i < section.filled ? genreColor : 'rgba(148,163,184,0.4)',
                boxShadow: i < section.filled ? `0 0 6px ${genreColor}` : 'none',
                transform: i < section.filled ? 'scale(1.1)' : 'scale(1)',
              }}
            />
          ))}
        </div>
      </div>

      {/* Compartment with fridge styling */}
      <div
        className="fridge-compartment p-2"
        style={{
          borderColor: `${genreColor}40`,
          background: `linear-gradient(180deg, rgba(255,255,255,0.95) 0%, ${genreColor}08 100%)`,
        }}
      >
        <div
          className="grid gap-2"
          style={{ gridTemplateColumns: `repeat(${slotsPerRow}, 1fr)` }}
        >
          {section.slots.map((slot) => (
            <ShelfSlot
              key={slot.position}
              slot={slot}
              highlightState={highlightStates.get(slot.position) || 'none'}
              onRegisterRef={(pos, el) => onRegisterSlotRef(section.genre, pos, el)}
            />
          ))}
        </div>
      </div>
    </div>
  );
});
