import React, { useMemo } from 'react';
import { ConveyorVinyl } from '../types';
import { VinylCover } from './VinylCover';
import { useWindowSize } from '../hooks/useWindowSize';

interface VinylOnBeltProps {
  vinyl: ConveyorVinyl;
  isGrabbed: boolean;
  onMouseDown: (e: React.MouseEvent, vinyl: ConveyorVinyl) => void;
  onTouchStart: (e: React.TouchEvent, vinyl: ConveyorVinyl) => void;
  expirationThreshold?: number;
}

export const VinylOnBelt: React.FC<VinylOnBeltProps> = React.memo(({
  vinyl,
  isGrabbed,
  onMouseDown,
  onTouchStart,
  expirationThreshold = 150
}) => {
  const { isMobile } = useWindowSize();
  const vinylSize = isMobile ? 70 : 80;
  const LANE_HEIGHT = 120;
  const yPosition = vinyl.lane * LANE_HEIGHT + (LANE_HEIGHT / 2);

  const isNearExpiration = vinyl.x < expirationThreshold;
  const isCritical = vinyl.x < expirationThreshold * 0.5;

  // Slight random rotation for variety (stable per vinyl)
  const randomRotation = useMemo(() => {
    const seed = vinyl.id.charCodeAt(0) + vinyl.id.charCodeAt(vinyl.id.length - 1);
    return ((seed % 11) - 5) * 0.8; // -4 to +4 degrees
  }, [vinyl.id]);

  return (
    <div
      className={`
        absolute
        transition-all
        ${isGrabbed
          ? 'vinyl-grab vinyl-shadow z-50 cursor-grabbing duration-200'
          : 'z-10 cursor-grab duration-300'}
        ${isCritical && !isGrabbed ? 'expiration-warning' : ''}
      `}
      style={{
        left: vinyl.x,
        top: yPosition,
        transform: `translate(-50%, -50%) ${
          isGrabbed
            ? 'scale(1.15) rotate(5deg)'
            : `scale(1) rotate(${randomRotation}deg)`
        }`,
        pointerEvents: 'auto',
        transition: isGrabbed
          ? 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)'
          : 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), left 0.05s linear',
        filter: isGrabbed
          ? 'drop-shadow(0 16px 20px rgba(0,0,0,0.6))'
          : 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))',
      }}
      onMouseDown={(e) => onMouseDown(e, vinyl)}
      onTouchStart={(e) => onTouchStart(e, vinyl)}
    >
      {/* Expiration warning */}
      {isNearExpiration && !isGrabbed && (
        <div
          className={`
            absolute -top-2 -right-2 w-7 h-7
            rounded-full flex items-center justify-center
            text-white text-xs font-bold z-20
            ${isCritical ? 'bg-red-600 expiration-flash' : 'bg-orange-500'}
          `}
          style={{
            boxShadow: isCritical
              ? '0 0 16px rgba(239, 68, 68, 0.8)'
              : '0 0 8px rgba(249, 115, 22, 0.6)',
          }}
        >
          !
        </div>
      )}

      <VinylCover vinyl={vinyl} size={vinylSize} isMobile={isMobile} />

      {/* Hover hint */}
      {!isGrabbed && (
        <div className="absolute inset-0 rounded-lg bg-white/0 hover:bg-white/10 transition-colors duration-200 pointer-events-none" />
      )}
    </div>
  );
});
