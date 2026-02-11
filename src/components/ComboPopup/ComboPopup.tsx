import React, { useEffect, useState } from 'react';
import styled, { css } from 'styled-components';
import { animations, TIMING, EASING, reducedMotion } from '../../animations';

export interface ComboPopupProps {
  combo: number;
  onComplete?: () => void;
}

const PopupOverlay = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
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

const ComboText = styled.span`
  font-family: ${(props) => props.theme.typography.fontFamily.display};
  font-size: ${(props) => props.theme.typography.fontSize.display.lg};
  font-weight: ${(props) => props.theme.typography.fontWeight.bold};
  color: ${(props) => props.theme.colors.accent.primary};
  text-transform: uppercase;
  letter-spacing: 2px;
  text-shadow: 0 4px 16px rgba(255, 138, 97, 0.4);
`;

const ComboNumber = styled.span`
  font-family: ${(props) => props.theme.typography.fontFamily.display};
  font-size: 72px;
  font-weight: ${(props) => props.theme.typography.fontWeight.bold};
  color: #4ade80;
  text-shadow: 0 4px 24px rgba(74, 222, 128, 0.5);
  line-height: 1;
  
  @media (max-width: ${(props) => props.theme.breakpoints.compact}) {
    font-size: 48px;
  }
`;

const ComboMultiplier = styled.span`
  font-family: ${(props) => props.theme.typography.fontFamily.ui};
  font-size: ${(props) => props.theme.typography.fontSize.ui.md};
  font-weight: ${(props) => props.theme.typography.fontWeight.medium};
  color: ${(props) => props.theme.colors.accent.secondary};
  padding: 4px 12px;
  background: rgba(93, 197, 226, 0.2);
  border-radius: 20px;
`;

const Stars = styled.div`
  display: flex;
  gap: 4px;
`;

const Star = styled.span`
  font-size: 24px;
  color: #fbbf24;
  filter: drop-shadow(0 2px 4px rgba(251, 191, 36, 0.4));
`;

// Dynamic star count based on combo
const getStarCount = (combo: number): number => {
  if (combo >= 10) return 5;
  if (combo >= 7) return 4;
  if (combo >= 5) return 3;
  if (combo >= 3) return 2;
  return 1;
};

export const ComboPopup: React.FC<ComboPopupProps> = ({
  combo,
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

  const starCount = getStarCount(combo);
  const multiplier = Math.min(combo * 0.5, 5); // Cap at 5x

  return (
    <PopupOverlay role="alert" aria-live="assertive">
      <ComboContainer $phase={phase}>
        <ComboText>COMBO</ComboText>
        <ComboNumber>{combo}x</ComboNumber>
        <ComboMultiplier>+{multiplier.toFixed(1)}x Bonus</ComboMultiplier>
        <Stars>
          {Array.from({ length: starCount }, (_, i) => (
            <Star key={i}>★</Star>
          ))}
        </Stars>
      </ComboContainer>
    </PopupOverlay>
  );
};

export default ComboPopup;
