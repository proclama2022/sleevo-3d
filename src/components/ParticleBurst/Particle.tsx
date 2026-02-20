import React from 'react';
import styled, { keyframes } from 'styled-components';
import { reducedMotion } from '../../animations';

export interface ParticleProps {
  angle: number; // Direction in degrees (0-360)
  distance: number; // How far to travel (px)
  size: number; // Particle size (px)
  delay: number; // Animation delay (ms)
  color?: string; // Particle color
}

const burstAnim = keyframes`
  0% { transform: translate(0, 0) scale(1); opacity: 1; }
  100% { transform: translate(var(--tx), var(--ty)) scale(0); opacity: 0; }
`;

const ParticleWrapper = styled.div<{
  $angle: number;
  $distance: number;
  $size: number;
  $delay: number;
  $color: string;
}>`
  position: absolute;
  width: ${(props) => props.$size}px;
  height: ${(props) => props.$size}px;
  background: ${(props) => props.$color};
  border-radius: 50%;
  pointer-events: none;
  opacity: 0;
  --tx: ${(props) => Math.cos((props.$angle * Math.PI) / 180) * props.$distance}px;
  --ty: ${(props) => Math.sin((props.$angle * Math.PI) / 180) * props.$distance}px;
  animation: ${burstAnim} 600ms ease-out forwards;
  animation-delay: ${(props) => props.$delay}ms;
  ${reducedMotion}
`;

export const Particle: React.FC<ParticleProps> = ({
  angle, distance, size, delay, color = '#ffd700'
}) => (
  <ParticleWrapper
    $angle={angle} $distance={distance} $size={size}
    $delay={delay} $color={color}
    aria-hidden="true"
  />
);
