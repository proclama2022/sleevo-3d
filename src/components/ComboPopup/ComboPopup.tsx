import React, { useEffect, useState } from 'react';
import styled, { css } from 'styled-components';
import { animations, TIMING, EASING, reducedMotion } from '../../animations';

export interface ComboPopupProps {
  pointsBonus: number;
  position?: { x: number; y: number };
  onComplete?: () => void;
}

const PopupOverlay = styled.div<{ $x?: number; $y?: number }>`
  position: fixed;
  top: ${(props) => props.$y ? `${props.$y}px` : '50%'};
  left: ${(props) => props.$x ? `${props.$x}px` : '50%'};
  transform: ${(props) =>
    props.$x && props.$y
      ? 'translate(-50%, -100%)' // Above slot
      : 'translate(-50%, -50%)' // Center fallback
  };
  z-index: 1000;
  pointer-events: none;

  ${reducedMotion}
`;

const ComboContainer = styled.div<{ $phase: 'appear' | 'hold' | 'disappear' }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${(props) => props.theme.spacing.sm};

  ${(props) => {
    switch (props.$phase) {
      case 'appear':
        return css`
          ${animations.comboAppear}
        `;
      case 'disappear':
        return css`
          ${animations.comboDisappear}
        `;
      default:
        return css``;
    }
  }}
`;

const PointsDisplay = styled.span`
  font-family: ${(props) => props.theme.typography.fontFamily.display};
  font-size: ${(props) => props.theme.typography.fontSize.display.lg};
  font-weight: bold;
  color: #4ade80;
  text-shadow: 0 4px 24px rgba(74, 222, 128, 0.5);
`;

export const ComboPopup: React.FC<ComboPopupProps> = ({
  pointsBonus,
  position,
  onComplete,
}) => {
  const [phase, setPhase] = useState<'appear' | 'hold' | 'disappear'>('appear');

  useEffect(() => {
    // Appear phase
    const holdTimer = setTimeout(() => {
      setPhase('hold');
    }, TIMING.COMBO_POPUP.appear);

    // Hold phase
    const disappearTimer = setTimeout(() => {
      setPhase('disappear');
    }, TIMING.COMBO_POPUP.appear + TIMING.COMBO_POPUP.hold);

    // Disappear phase
    const completeTimer = setTimeout(() => {
      onComplete?.();
    }, TIMING.COMBO_POPUP.total);

    return () => {
      clearTimeout(holdTimer);
      clearTimeout(disappearTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <PopupOverlay
      role="alert"
      aria-live="assertive"
      $x={position?.x}
      $y={position ? position.y - 30 : undefined}
    >
      <ComboContainer $phase={phase}>
        <PointsDisplay>+{pointsBonus}</PointsDisplay>
      </ComboContainer>
    </PopupOverlay>
  );
};

export default ComboPopup;
