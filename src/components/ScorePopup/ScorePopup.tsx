import React, { useEffect, useState } from 'react';
import styled, { css } from 'styled-components';
import { animations, TIMING, reducedMotion } from '../../animations';

export interface ScorePopupProps {
  points: number;
  x: number;
  y: number;
  label?: string;
  onComplete?: () => void;
}

const PopupContainer = styled.div<{ $x: number; $y: number }>`
  position: fixed;
  left: ${(props) => props.$x}px;
  top: ${(props) => props.$y}px;
  pointer-events: none;
  z-index: 1000;
  transform: translate(-50%, -50%);
  
  ${reducedMotion}
`;

const PointsText = styled.span<{ $isAnimating: boolean }>`
  font-family: ${(props) => props.theme.typography.fontFamily.display};
  font-size: ${(props) => props.theme.typography.fontSize.display.lg};
  font-weight: ${(props) => props.theme.typography.fontWeight.bold};
  color: #4ade80;
  text-shadow: 0 2px 8px rgba(74, 222, 128, 0.4);
  white-space: nowrap;
  
  ${(props) => props.$isAnimating && css`
    ${animations.scoreFloat}
  `}
  
  ${reducedMotion}
`;

const PlusSign = styled.span`
  color: #4ade80;
  margin-right: 2px;
`;

export const ScorePopup: React.FC<ScorePopupProps> = ({
  points,
  x,
  y,
  label,
  onComplete,
}) => {
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnimating(false);
      onComplete?.();
    }, TIMING.SCORE_INCREMENT.duration);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <PopupContainer $x={x} $y={y}>
      <PointsText $isAnimating={isAnimating} aria-live="polite">
        <PlusSign>+</PlusSign>
        {points}
        {label && <span style={{ marginLeft: 4, fontSize: '0.8em', opacity: 0.9 }}>{label}</span>}
      </PointsText>
    </PopupContainer>
  );
};

export default ScorePopup;
