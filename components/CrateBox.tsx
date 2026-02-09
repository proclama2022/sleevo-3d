import React, { useRef, useEffect } from 'react';
import { Crate, GENRE_COLORS, Genre, Vinyl } from '../types';
import { Star, Zap, Music, Heart, Sparkles, Disc, Skull, Activity, Globe, CheckCircle2, X } from 'lucide-react';
import { VinylCover } from './VinylCover';
import { useWindowSize } from '../hooks/useWindowSize';

interface CrateBoxProps {
  crate: Crate;
  highlightState: 'none' | 'neutral' | 'valid' | 'invalid';
  ghostVinyl?: Vinyl | null;
  hideLabel?: boolean;
  onRegisterRef: (id: string, el: HTMLDivElement | null) => void;
  onRegisterStackRef?: (id: string, el: HTMLDivElement | null) => void;
}

// Visual theme configuration for each genre - MOLTO più chiari per visibilità
const CRATE_THEMES: Record<Genre, {
  woodColor: string;
  accentColor: string;
  textureOpacity: number;
  Icon: React.ElementType;
}> = {
  [Genre.Rock]: { woodColor: '#6d4c41', accentColor: '#ef4444', textureOpacity: 0.6, Icon: Zap },
  [Genre.Jazz]: { woodColor: '#795548', accentColor: '#3b82f6', textureOpacity: 0.4, Icon: Music },
  [Genre.Soul]: { woodColor: '#8d6e63', accentColor: '#eab308', textureOpacity: 0.5, Icon: Heart },
  [Genre.Funk]: { woodColor: '#7a5548', accentColor: '#f97316', textureOpacity: 0.5, Icon: Sparkles },
  [Genre.Disco]: { woodColor: '#4a4a4a', accentColor: '#a855f7', textureOpacity: 0.3, Icon: Disc },
  [Genre.Punk]: { woodColor: '#e0d4d0', accentColor: '#db2777', textureOpacity: 0.8, Icon: Skull },
  [Genre.Electronic]: { woodColor: '#455a64', accentColor: '#06b6d4', textureOpacity: 0.2, Icon: Activity },
};

const CrateDeco = ({ genre }: { genre: Genre }) => {
  // Uniform style for the etched brand mark (bottom-right corner)
  const brandClass = "absolute bottom-3 right-3 w-6 h-6 text-black/40 drop-shadow-[0_1px_0_rgba(255,255,255,0.15)] mix-blend-overlay pointer-events-none opacity-80";
  const scratchClass = "absolute bg-black/10 mix-blend-overlay pointer-events-none";

  switch (genre) {
    case Genre.Rock:
      return (
        <>
          <div className={`${scratchClass} top-1/2 left-2 w-8 h-[1px] -rotate-12`}></div>
          <div className={`${scratchClass} top-1/3 right-4 w-4 h-[1px] rotate-45`}></div>
          <Zap className={brandClass} strokeWidth={2.5} />
        </>
      );
    case Genre.Jazz:
      return (
        <>
           <div className="absolute top-4 left-4 w-8 h-8 rounded-full border-l border-t border-black/5 -rotate-12 pointer-events-none"></div>
           <Music className={brandClass} strokeWidth={2.5} />
        </>
      );
    case Genre.Soul:
      return <Heart className={brandClass} strokeWidth={2.5} fill="currentColor" fillOpacity={0.1} />;
    case Genre.Funk:
        return (
            <>
              <div className="absolute top-2 left-2 w-1 h-1 bg-black/20 rounded-full mix-blend-overlay"></div>
              <Sparkles className={brandClass} strokeWidth={2.5} />
            </>
        );
    case Genre.Disco:
      return <Globe className={brandClass} strokeWidth={2} />;
    case Genre.Punk:
      return (
        <>
           <div className={`${scratchClass} bottom-4 left-4 w-6 h-[2px] rotate-12`}></div>
           <div className={`${scratchClass} bottom-5 left-4 w-6 h-[2px] -rotate-6`}></div>
           <Skull className={brandClass} strokeWidth={2.5} />
        </>
      );
    case Genre.Electronic:
      return (
        <>
           <div className="absolute inset-x-4 top-1/2 h-[1px] bg-black/10 mix-blend-overlay"></div>
           <Activity className={brandClass} strokeWidth={2.5} />
        </>
      );
    default:
      return null;
  }
}

// Sleeve accent colors that vary per record for visual variety
const SLEEVE_ACCENTS = [
  { bg: '#1a1a2e', stripe: '#e94560' },
  { bg: '#0f3460', stripe: '#e94560' },
  { bg: '#2d132c', stripe: '#ee4c7c' },
  { bg: '#1b1b2f', stripe: '#f0a500' },
  { bg: '#162447', stripe: '#1f4068' },
  { bg: '#1a1a1a', stripe: '#e0e0e0' },
  { bg: '#2c3333', stripe: '#395b64' },
  { bg: '#3d0000', stripe: '#950101' },
];

export const CrateBox: React.FC<CrateBoxProps> = React.memo(({ crate, highlightState, ghostVinyl, hideLabel, onRegisterRef, onRegisterStackRef }) => {
  const { isMobile } = useWindowSize();
  const boxRef = useRef<HTMLDivElement>(null);
  const stackRef = useRef<HTMLDivElement>(null);
  const theme = CRATE_THEMES[crate.genre];

  useEffect(() => {
    onRegisterRef(crate.id, boxRef.current);
    return () => onRegisterRef(crate.id, null);
  }, [crate.id, onRegisterRef]);

  useEffect(() => {
    if (onRegisterStackRef) {
      onRegisterStackRef(crate.id, stackRef.current);
      return () => onRegisterStackRef(crate.id, null);
    }
  }, [crate.id, onRegisterStackRef]);

  // Dynamic Border based on drag state
  const borderClass =
    highlightState === 'valid' ? 'ring-8 ring-green-400 scale-105' :
    highlightState === 'invalid' ? 'ring-8 ring-red-500 scale-100' :
    highlightState === 'neutral' ? 'scale-105' : '';

  return (
    <div
      ref={boxRef}
      className={`
        relative flex-shrink-0 flex flex-col items-center justify-end pb-0
        transition-all duration-200 transform
        ${borderClass}
        ${highlightState !== 'none' ? 'z-10' : ''}
        ${isMobile ? 'w-[150px] h-[190px]' : 'w-[160px] h-[190px]'}
      `}
      style={{
        filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.7)) drop-shadow(0 0 20px rgba(255,255,255,0.1))',
      }}
    >
      {/* Enhanced Highlight Effects */}
      {highlightState === 'valid' && (
        <>
          {/* Glow effect */}
          <div className="absolute inset-0 rounded-lg bg-green-400 blur-2xl opacity-50 -z-10 animate-pulse"></div>
          {/* Background overlay */}
          <div className="absolute inset-0 rounded-lg bg-green-400/20 pointer-events-none"></div>
          {/* Success icon */}
          <div className="absolute -top-4 -right-4 z-50">
            <CheckCircle2 className="w-10 h-10 text-green-400 drop-shadow-[0_0_8px_rgba(74,222,128,0.8)] animate-bounce" fill="rgba(74,222,128,0.3)" />
          </div>
        </>
      )}
      {highlightState === 'invalid' && (
        <>
          {/* Glow effect */}
          <div className="absolute inset-0 rounded-lg bg-red-500 blur-2xl opacity-50 -z-10 animate-pulse"></div>
          {/* Background overlay */}
          <div className="absolute inset-0 rounded-lg bg-red-500/20 pointer-events-none"></div>
          {/* Error icon */}
          <div className="absolute -top-4 -right-4 z-50">
            <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center drop-shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-bounce">
              <X className="w-6 h-6 text-white" strokeWidth={3} />
            </div>
          </div>
        </>
      )}

      {/* --- OUTER FRAME (Wood crate walls) - MOLTO PIÙ VISIBILE --- */}
      <div 
        className="absolute inset-x-0 bottom-0 top-4 rounded-lg shadow-2xl overflow-visible -z-20 border-4"
        style={{
          background: `linear-gradient(135deg, ${theme.woodColor} 0%, ${theme.woodColor}dd 100%)`,
          borderColor: theme.accentColor,
          boxShadow: `
            0 8px 32px rgba(0,0,0,0.8),
            inset 0 2px 4px rgba(255,255,255,0.1),
            inset 0 -2px 4px rgba(0,0,0,0.3),
            0 0 0 2px rgba(0,0,0,0.5)
          `
        }}
      >
        {/* Wood texture on frame */}
        <div className="absolute inset-0 bg-wood opacity-40 mix-blend-overlay"></div>
        {/* Wood grain lines */}
        <div className="absolute inset-0 opacity-20" style={{ 
          backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 8px, rgba(0,0,0,0.3) 8px, rgba(0,0,0,0.3) 9px)'
        }}></div>
      </div>

      {/* --- INTERIOR SPACE (Dark container inside) - PIÙ PROFONDO --- */}
      <div 
        className="absolute inset-x-3 bottom-3 top-8 rounded-sm shadow-2xl overflow-visible -z-10"
        style={{
          backgroundColor: '#0a0806',
          boxShadow: `
            inset 0 0 50px rgba(0,0,0,1),
            inset 0 4px 20px rgba(0,0,0,0.9),
            0 0 0 3px rgba(0,0,0,0.8),
            0 4px 12px rgba(0,0,0,0.6)
          `
        }}
      >
        {/* Very deep inner shadows */}
        <div className="absolute inset-0 pointer-events-none rounded-sm" style={{
          boxShadow: 'inset 0 0 60px rgba(0,0,0,0.95), inset 0 20px 40px rgba(0,0,0,0.9)'
        }}></div>

        {/* Side Walls (Thickness) - PIÙ EVIDENTI */}
        <div className="absolute top-0 bottom-0 left-0 w-[6px] md:w-[8px] bg-gradient-to-r from-[#000] via-[#1a0f0d] to-[#2a1d18] z-10 border-r-2 border-white/10"></div>
        <div className="absolute top-0 bottom-0 right-0 w-[6px] md:w-[8px] bg-gradient-to-l from-[#000] via-[#1a0f0d] to-[#2a1d18] z-10 border-l-2 border-white/10"></div>

        {/* Back Wall with visible wood planks */}
        <div className="absolute inset-x-[8px] inset-y-0 bg-[#140b08] flex">
            {/* Wood Grain Texture - MORE VISIBLE */}
            <div className="absolute inset-0 bg-wood opacity-20 mix-blend-overlay"></div>

            {/* Vertical Planks - più definiti */}
            <div className="flex-1 border-r-2 border-black/50 bg-gradient-to-b from-black/60 to-black/30"></div>
            <div className="flex-1 border-r-2 border-black/50 bg-gradient-to-b from-black/40 to-black/20"></div>
            <div className="flex-1 bg-gradient-to-b from-black/70 to-black/40"></div>

            {/* Deep shadow at bottom where records sit */}
            <div className="absolute bottom-0 left-0 right-0 h-2/3 bg-gradient-to-t from-black via-black/80 to-transparent"></div>

            {/* Top light leak - più luminoso */}
            <div className="absolute top-0 left-0 right-0 h-1/4 bg-gradient-to-b from-white/10 to-transparent mix-blend-overlay"></div>
        </div>

        {/* Floor strip - più visibile */}
        <div className="absolute bottom-0 inset-x-0 h-4 bg-black z-10 border-t-2 border-white/10"></div>
      </div>

      {/* --- STACKED SLEEVES (The Records) --- */}
      <style>{`
        @keyframes breathe {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }
      `}</style>
      <div
        ref={stackRef}
        className="absolute pointer-events-none z-10 overflow-visible"
        style={{
          /* Position directly using pixel values for reliability */
          bottom: 65,
          left: '50%',
          width: '70%',
          height: 140,
          transform: 'translateX(-50%)',
        }}
      >
      {Array.from({ length: crate.filled }).map((_, i) => {
        const isFront = i === crate.filled - 1;
        const reverseIndex = crate.filled - 1 - i;

        const randomRot = ((i * 1337) % 5) - 2;
        const verticalStep = 18;
        const visualOffset = Math.min(reverseIndex * verticalStep, 70);
        const sleeveSize = 95;
        const accent = SLEEVE_ACCENTS[i % SLEEVE_ACCENTS.length];
        const seed = (i * 1337) % 4;

        return (
          <div
            key={i}
            className={`
              absolute rounded-[2px]
              transition-all duration-500 cubic-bezier(0.34, 1.56, 0.64, 1)
              ${isFront ? 'animate-[breathe_3s_ease-in-out_infinite]' : ''}
            `}
            style={{
              width: sleeveSize,
              height: sleeveSize,
              bottom: visualOffset,
              left: '50%',
              marginLeft: -(sleeveSize * 0.5),
              transformOrigin: 'bottom center',
              transform: `scale(${0.92 + (i * 0.005)}) rotate(${randomRot}deg)`,
              filter: isFront ? 'none' : `brightness(${0.4 + (i / Math.max(crate.capacity, 1)) * 0.6}) saturate(0.8)`,
              boxShadow: isFront
                ? '0 4px 12px rgba(0,0,0,0.6), -2px 0 4px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)'
                : '-3px 4px 15px rgba(0,0,0,0.8)',
              animationDelay: `${i * 0.2}s`,
              zIndex: i,
              backgroundColor: accent.bg,
            }}
          >
            {/* Spine edge (top of sleeve visible in crate) */}
            <div className="absolute top-0 left-0 right-0 h-[3px] z-20" style={{ background: `linear-gradient(90deg, ${accent.stripe}, ${accent.bg}, ${accent.stripe})` }}></div>

            {/* Album art area - different patterns per seed */}
            {seed === 0 && (
              <>
                {/* Bold diagonal stripe design */}
                <div className="absolute inset-0 overflow-hidden rounded-[2px]">
                  <div className="absolute inset-0 opacity-60" style={{ background: `repeating-linear-gradient(135deg, transparent, transparent 8px, ${accent.stripe}33 8px, ${accent.stripe}33 10px)` }}></div>
                  <div className="absolute bottom-2 left-2 right-2 h-[30%] bg-black/30 rounded-sm flex items-center justify-center">
                    <div className="w-[60%] h-[2px] bg-white/30 rounded"></div>
                  </div>
                </div>
              </>
            )}
            {seed === 1 && (
              <>
                {/* Central circle / vinyl peeking design */}
                <div className="absolute inset-0 overflow-hidden rounded-[2px]">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[65%] h-[65%] rounded-full border-[3px] opacity-40" style={{ borderColor: accent.stripe }}></div>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[25%] h-[25%] rounded-full bg-black/40"></div>
                  <div className="absolute top-2 left-2 w-[40%] h-[2px] bg-white/20 rounded"></div>
                </div>
              </>
            )}
            {seed === 2 && (
              <>
                {/* Split design - half color block */}
                <div className="absolute inset-0 overflow-hidden rounded-[2px]">
                  <div className="absolute top-0 left-0 w-[40%] h-full opacity-40" style={{ backgroundColor: accent.stripe }}></div>
                  <div className="absolute bottom-3 right-3 w-[50%] h-[3px] bg-white/20 rounded"></div>
                  <div className="absolute bottom-5 right-3 w-[35%] h-[2px] bg-white/10 rounded"></div>
                </div>
              </>
            )}
            {seed === 3 && (
              <>
                {/* Minimal typography style */}
                <div className="absolute inset-0 overflow-hidden rounded-[2px]">
                  <div className="absolute top-3 left-3 right-3 h-[2px] bg-white/15 rounded"></div>
                  <div className="absolute top-5 left-3 w-[50%] h-[2px] bg-white/10 rounded"></div>
                  <div className="absolute inset-0 opacity-20" style={{ background: `radial-gradient(ellipse at 70% 60%, ${accent.stripe}, transparent 70%)` }}></div>
                </div>
              </>
            )}

            {/* Vinyl record peeking out from top-right */}
            {isFront && (
              <div className="absolute -top-[6px] -right-[6px] w-[40%] h-[40%] rounded-full bg-[#111] z-30 overflow-hidden"
                style={{ boxShadow: '0 2px 6px rgba(0,0,0,0.5)' }}>
                <div className="absolute inset-0 opacity-40" style={{ background: 'repeating-radial-gradient(#333 0, #111 1px, #111 2px)' }}></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[35%] h-[35%] rounded-full" style={{ backgroundColor: theme.accentColor + '60' }}></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[8%] h-[8%] rounded-full bg-black"></div>
              </div>
            )}

            {/* Light reflection / gloss */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/8 via-transparent to-black/20 rounded-[2px] pointer-events-none z-10"></div>

            {/* Worn edge effect */}
            <div className="absolute inset-0 rounded-[2px] pointer-events-none z-10" style={{ boxShadow: 'inset 0 0 3px rgba(0,0,0,0.4), inset 0 -1px 2px rgba(0,0,0,0.3)' }}></div>
          </div>
        );
      })}

      {/* Ghost preview vinyl */}
      {ghostVinyl && (
        <div
          className="absolute opacity-40 pointer-events-none z-50"
          style={{
            bottom: `${(crate.filled * 18) + 65}px`,
            left: '50%',
            transform: 'translateX(-50%)'
          }}
        >
          <VinylCover vinyl={ghostVinyl} size={70} isMobile={isMobile} />
        </div>
      )}
      </div>

      {/* --- FRONT PANEL (The Wood Crate Front) - MOLTO PIÙ TRIDIMENSIONALE --- */}
      <div className="relative z-20 w-full h-[65px] md:h-[75px] flex flex-col items-center translate-y-1">

         {/* COLORED TOP RIM (opening edge) - MOLTO PIÙ SPESSO */}
         <div
            className="absolute top-0 left-0 right-0 h-4 rounded-t-md z-40 border-t-2 border-b-2"
            style={{
              background: `linear-gradient(180deg, ${theme.accentColor} 0%, ${theme.accentColor}dd 100%)`,
              borderTopColor: `${theme.accentColor}ff`,
              borderBottomColor: 'rgba(0,0,0,0.8)',
              boxShadow: `
                0 0 30px ${theme.accentColor}dd,
                0 0 60px ${theme.accentColor}60,
                inset 0 1px 2px rgba(255,255,255,0.6),
                inset 0 -2px 4px rgba(0,0,0,0.4),
                0 6px 16px rgba(0,0,0,0.7)
              `
            }}
         >
           {/* Inner shine */}
           <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent rounded-t-md"></div>
         </div>

         {/* The main wood front panel - CON BORDI E TEXTURE MOLTO EVIDENTI */}
         <div
            className="absolute inset-0 rounded-md shadow-2xl overflow-hidden border-4"
            style={{
              background: `linear-gradient(135deg, ${theme.woodColor} 0%, ${theme.woodColor}dd 50%, ${theme.woodColor}aa 100%)`,
              borderColor: 'rgba(0,0,0,0.8)',
              boxShadow: `
                0 -8px 32px rgba(0,0,0,0.8),
                0 4px 20px rgba(0,0,0,0.6),
                inset 0 2px 6px rgba(255,255,255,0.15),
                inset 0 -2px 6px rgba(0,0,0,0.4),
                0 0 0 2px ${theme.accentColor}30
              `
            }}
         >
            {/* Horizontal wood planks */}
            <div className="absolute inset-0 opacity-40 pointer-events-none" style={{ 
              backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 20px, rgba(0,0,0,0.4) 20px, rgba(0,0,0,0.4) 22px)'
            }}></div>
            {/* Wood grain texture - PIÙ VISIBILE */}
            <div className="absolute inset-0 bg-wood opacity-60 mix-blend-overlay"></div>
            {/* Vignette for depth */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/40"></div>
            {/* Side panels (thickness illusion) */}
            <div className="absolute top-0 bottom-0 left-0 w-3 bg-gradient-to-r from-black/50 to-transparent border-r-2 border-black/30"></div>
            <div className="absolute top-0 bottom-0 right-0 w-3 bg-gradient-to-l from-black/50 to-transparent border-l-2 border-black/30"></div>
            <CrateDeco genre={crate.genre} />
         </div>

         {/* MAIN BRAND ICON - Much more visible */}
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-70 pointer-events-none scale-110 md:scale-150 z-10" style={{ filter: `drop-shadow(0 2px 4px ${theme.accentColor}60)` }}>
             <theme.Icon size={36} strokeWidth={2.5} style={{ color: theme.accentColor }} />
         </div>

         {/* LABEL STICKER - MOLTO PIÙ GRANDE E CONTRASTATO */}
         {hideLabel ? (
           // Memory Challenge Mode: Show only icon (larger and colored)
           <div className="absolute top-2 w-14 h-14 bg-black/70 backdrop-blur rounded-full shadow-[0_0_20px_rgba(0,0,0,0.9)] flex items-center justify-center border-4 z-30 animate-pulse" style={{ borderColor: theme.accentColor }}>
              <theme.Icon size={32} strokeWidth={2.5} style={{ color: theme.accentColor, filter: `drop-shadow(0 0 8px ${theme.accentColor})` }} />
           </div>
         ) : (
           // Normal Mode: PILL/BADGE GRANDE CON ICONA
           <div
             className="absolute top-2 h-[36px] md:h-[42px] px-3 md:px-4 bg-white shadow-[0_4px_12px_rgba(0,0,0,0.4)] flex items-center justify-center gap-2 z-30 rounded-full border-4"
             style={{
               borderColor: theme.accentColor,
               boxShadow: `0 4px 12px rgba(0,0,0,0.4), 0 0 0 3px ${theme.accentColor}, 0 0 20px ${theme.accentColor}60`
             }}
           >
              <theme.Icon size={20} strokeWidth={2.5} style={{ color: theme.accentColor }} />
              <span className="font-display text-base md:text-lg text-gray-900 font-bold leading-none uppercase tracking-wide">
                {crate.genre}
              </span>
           </div>
         )}

         {/* CAPACITY INDICATOR */}
         <div className="absolute bottom-1 w-full flex justify-center gap-0.5 opacity-90 z-30">
              {Array.from({ length: crate.capacity }).map((_, i) => (
                   <div 
                    key={i} 
                    className={`
                      w-1.5 h-1.5 rounded-full border border-black/20
                      ${i < crate.filled 
                        ? `bg-[${theme.accentColor}] shadow-[0_0_4px_${theme.accentColor}]` 
                        : "bg-[#00000060] box-inner-shadow"}
                    `}
                    style={{ backgroundColor: i < crate.filled ? theme.accentColor : undefined }}
                   />
              ))}
         </div>

      </div>
    </div>
  );
});