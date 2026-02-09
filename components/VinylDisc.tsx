import React from 'react';
import { Vinyl, GENRE_COLORS } from '../types';
import { Disc } from 'lucide-react';

interface VinylDiscProps {
  vinyl: Vinyl;
  size?: number;
  className?: string;
  rotation?: number;
  isGhost?: boolean;
  spinning?: boolean;
}

export const VinylDisc: React.FC<VinylDiscProps> = ({ 
  vinyl, 
  size = 140, 
  className = '', 
  rotation = 0,
  isGhost = false,
  spinning = false
}) => {
  return (
    <div 
      className={`relative rounded-full shadow-2xl flex items-center justify-center select-none ${className} ${isGhost ? 'opacity-50' : ''}`}
      style={{
        width: size,
        height: size,
        minWidth: size, // prevent shrinking in flex
        background: '#0a0a0a', // Darker black for better contrast
        transform: `rotate(${rotation}deg)`,
        transition: isGhost ? 'none' : 'transform 0.1s ease-out',
        boxShadow: isGhost ? 'none' : '0 10px 25px -5px rgba(0, 0, 0, 0.6), 0 8px 10px -6px rgba(0, 0, 0, 0.1)'
      }}
    >
      {/* Inner wrapper for idle spinning */}
      <div className={`relative w-full h-full flex items-center justify-center ${spinning ? 'animate-spin-slow' : ''}`}>
        {/* Vinyl Grooves Texture */}
        <div className="absolute inset-0.5 rounded-full vinyl-grooves opacity-90 pointer-events-none border border-gray-800"></div>
        
        {/* Runout Groove (gap before label) */}
        <div className="absolute w-[48%] h-[48%] rounded-full bg-[#0a0a0a]"></div>

        {/* Inner Label */}
        <div 
          className={`relative w-[42%] h-[42%] rounded-full ${GENRE_COLORS[vinyl.genre]} flex flex-col items-center justify-center text-center p-1 border border-white/10 shadow-inner overflow-hidden`}
        >
          {/* Label Texture */}
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30 mix-blend-overlay"></div>
          
          <span className="relative z-10 text-[8px] font-bold text-white uppercase tracking-wider truncate w-full drop-shadow-md font-display">
            {vinyl.genre}
          </span>
          <span className="relative z-10 text-[6px] text-white/90 leading-tight line-clamp-2 w-full font-mono mt-0.5">
            {vinyl.artist}
          </span>
          
          {/* Spindle Hole */}
          <div className="absolute w-1.5 h-1.5 bg-[#1a1a1a] rounded-full mt-1 z-20 shadow-[inset_0_1px_1px_rgba(0,0,0,1)]"></div>
        </div>
      </div>
      
      {/* Static Glossy Shine (Does not rotate with disc, simulates light source) */}
      <div className="absolute inset-0 rounded-full vinyl-shine pointer-events-none opacity-60"></div>
      
      {/* Subtle bottom rim highlight for 3D effect */}
      <div className="absolute inset-0 rounded-full border border-white/5 pointer-events-none"></div>
    </div>
  );
};