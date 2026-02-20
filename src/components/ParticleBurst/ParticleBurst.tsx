import React from 'react';
import styled from 'styled-components';
import { Particle } from './Particle';

export interface ParticleBurstProps {
  x: number; // Center X position
  y: number; // Center Y position
  count?: number; // Number of particles (default: 10)
  size?: { min: number; max: number };
  distance?: { min: number; max: number };
  color?: string;
  onComplete?: () => void;
}

const BurstContainer = styled.div<{ $x: number; $y: number }>`
  position: fixed;
  top: ${(props) => props.$y}px;
  left: ${(props) => props.$x}px;
  transform: translate(-50%, -50%);
  pointer-events: none;
  z-index: 100;
  width: 0;
  height: 0;
`;

export const ParticleBurst: React.FC<ParticleBurstProps> = ({
  x, y, count = 10,
  size = { min: 4, max: 8 },
  distance = { min: 40, max: 80 },
  color = '#ffd700',
  onComplete
}) => {
  const particles = React.useMemo(() =>
    Array.from({ length: count }, (_, i) => ({
      id: `particle-${i}`,
      angle: (360 / count) * i,
      distance: distance.min + Math.random() * (distance.max - distance.min),
      size: size.min + Math.random() * (size.max - size.min),
      delay: Math.random() * 50
    })), [count, distance, size]);

  React.useEffect(() => {
    const timer = setTimeout(() => onComplete?.(), 650);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <BurstContainer $x={x} $y={y} aria-hidden="true">
      {particles.map((p) => (
        <Particle key={p.id} angle={p.angle} distance={p.distance}
                  size={p.size} delay={p.delay} color={color} />
      ))}
    </BurstContainer>
  );
};
