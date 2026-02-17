import React, { useRef, useEffect, useState, useCallback } from 'react';
import { ConveyorVinyl } from '../types';
import { VinylOnBelt } from './VinylOnBelt';
import { CONVEYOR_BELT_CONFIG } from '../constants/gameConfig';

interface ConveyorBeltProps {
  vinyls: ConveyorVinyl[];
  beltSpeed: number;
  isPaused: boolean;
  grabbedVinylId: string | null;
  onVinylExpired: (vinyl: ConveyorVinyl) => void;
  onVinylGrabStart: (vinyl: ConveyorVinyl, clientX: number, clientY: number) => void;
}

export const ConveyorBelt: React.FC<ConveyorBeltProps> = React.memo(({
  vinyls,
  beltSpeed,
  isPaused,
  grabbedVinylId,
  onVinylExpired,
  onVinylGrabStart
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>();
  const lastTimeRef = useRef<number>(Date.now());
  const [scrollOffset, setScrollOffset] = useState(0);
  const previousVinylsRef = useRef<ConveyorVinyl[]>([]);

  const beltWidth = CONVEYOR_BELT_CONFIG.beltWidth;
  const laneHeight = CONVEYOR_BELT_CONFIG.laneHeight;
  const numLanes = CONVEYOR_BELT_CONFIG.defaultLanes;
  const beltHeight = laneHeight * numLanes;

  // Animate belt scroll
  useEffect(() => {
    if (isPaused) {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      return;
    }
    const animate = () => {
      const now = Date.now();
      const deltaTime = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;
      setScrollOffset((prev) => (prev + beltSpeed * deltaTime) % 100);
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    animationFrameRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [beltSpeed, isPaused]);

  // Detect expired vinyls
  useEffect(() => {
    const previousVinyls = previousVinylsRef.current;
    previousVinyls.forEach((prevVinyl) => {
      const stillExists = vinyls.find((v) => v.id === prevVinyl.id);
      if (!stillExists && prevVinyl.x < -120) {
        onVinylExpired(prevVinyl);
      }
    });
    previousVinylsRef.current = vinyls;
  }, [vinyls, onVinylExpired]);

  const handleMouseDown = useCallback((e: React.MouseEvent, vinyl: ConveyorVinyl) => {
    e.preventDefault();
    onVinylGrabStart(vinyl, e.clientX, e.clientY);
  }, [onVinylGrabStart]);

  const handleTouchStart = useCallback((e: React.TouchEvent, vinyl: ConveyorVinyl) => {
    e.preventDefault();
    const touch = e.touches[0];
    onVinylGrabStart(vinyl, touch.clientX, touch.clientY);
  }, [onVinylGrabStart]);

  return (
    <div className="relative w-full">
      {/* Cartoon rollers */}
      <div className="flex justify-between items-center px-1 mb-1">
        <div className="conveyor-roller w-6 h-6 md:w-8 md:h-8" />
        <div className="conveyor-roller w-5 h-5 md:w-6 md:h-6" />
        <div className="conveyor-roller w-6 h-6 md:w-8 md:h-8" />
        <div className="conveyor-roller w-5 h-5 md:w-6 md:h-6" />
        <div className="conveyor-roller w-6 h-6 md:w-8 md:h-8" />
      </div>

      {/* Belt surface */}
      <div
        ref={containerRef}
        className="fridge-crate relative overflow-hidden"
        style={{
          width: '100%',
          maxWidth: beltWidth,
          height: beltHeight,
        }}
      >
        {/* Animated stripes */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `
              repeating-linear-gradient(
                90deg,
                transparent 0px,
                transparent 46px,
                rgba(255,255,255,0.08) 46px,
                rgba(255,255,255,0.08) 50px
              )
            `,
            backgroundPosition: `${scrollOffset}px 0`,
          }}
        />

        {/* Lane dividers */}
        {Array.from({ length: numLanes - 1 }).map((_, i) => (
          <div
            key={i}
            className="absolute left-4 right-4"
            style={{
              top: laneHeight * (i + 1),
              height: '1px',
              background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 20%, rgba(255,255,255,0.2) 80%, transparent 100%)',
            }}
          />
        ))}

        {/* Vinyls */}
        <div className="absolute inset-0">
          {vinyls.map((vinyl) => (
            <VinylOnBelt
              key={vinyl.id}
              vinyl={vinyl}
              isGrabbed={vinyl.id === grabbedVinylId}
              onMouseDown={handleMouseDown}
              onTouchStart={handleTouchStart}
              expirationThreshold={150}
            />
          ))}
        </div>

        {/* Edge fades */}
        <div className="absolute top-0 bottom-0 left-0 w-10 bg-gradient-to-r from-purple-950/60 to-transparent pointer-events-none" />
        <div className="absolute top-0 bottom-0 right-0 w-10 bg-gradient-to-l from-purple-950/60 to-transparent pointer-events-none" />

        {/* Warning zone (left) */}
        <div className="absolute top-0 bottom-0 left-0 w-20 bg-gradient-to-r from-red-900/40 to-transparent pointer-events-none animate-pulse" />
      </div>

      {/* Bottom rollers */}
      <div className="flex justify-between items-center px-1 mt-1">
        <div className="conveyor-roller w-6 h-6 md:w-8 md:h-8" />
        <div className="conveyor-roller w-5 h-5 md:w-6 md:h-6" />
        <div className="conveyor-roller w-6 h-6 md:w-8 md:h-8" />
        <div className="conveyor-roller w-5 h-5 md:w-6 md:h-6" />
        <div className="conveyor-roller w-6 h-6 md:w-8 md:h-8" />
      </div>
    </div>
  );
});
