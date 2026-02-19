import React from 'react';
import styled, { css } from 'styled-components';
import { TIMING, reducedMotion } from '../../animations';

export interface ShelfSlotProps {
  id: string;
  state: 'empty' | 'highlight' | 'filled' | 'invalid';
  placedVinylId?: string;
  expectedGenre?: string;
  onDrop?: () => void;
  onDragOver?: () => void;
  onDragLeave?: () => void;
}

const SlotWrapper = styled.div<{ $state: ShelfSlotProps['state'] }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 140px;
  height: 180px;
  background: ${(props) => {
    switch (props.$state) {
      case 'empty': return 'linear-gradient(180deg, #2a1810 0%, #1a1008 100%)';
      case 'highlight': return 'linear-gradient(180deg, #2a1810 0%, #1a1008 100%)';
      case 'filled': return props.theme.colors.background.secondary;
      case 'invalid': return 'linear-gradient(180deg, #2a1810 0%, #1a1008 100%)';
      default: return props.theme.colors.background.secondary;
    }
  }};
  border: 3px solid ${(props) => {
    switch (props.$state) {
      case 'empty': return '#3d2817';
      case 'highlight': return '#4ade80';
      case 'filled': return props.theme.colors.accent.primary;
      case 'invalid': return '#ef4444';
      default: return '#3d2817';
    }
  }};
  border-radius: 8px;
  position: relative;
  transition: 
    border-color ${TIMING.SHELF_HOVER.in}ms ${TIMING.SHELF_HOVER.easing},
    box-shadow ${TIMING.SHELF_HOVER.in}ms ${TIMING.SHELF_HOVER.easing},
    transform ${TIMING.TRANSITION_NORMAL}ms ${TIMING.SHELF_HOVER.easing};

  ${(props) => props.$state === 'highlight' && css`
    box-shadow: 0 0 20px rgba(74, 222, 128, 0.6), 0 0 40px rgba(74, 222, 128, 0.3);
    transform: scale(1.02);
  `}

  ${(props) => props.$state === 'invalid' && css`
    background: linear-gradient(180deg, rgba(58, 18, 12, 0.9) 0%, rgba(32, 10, 8, 0.95) 100%);
    box-shadow: 0 0 20px rgba(239, 68, 68, 0.6), 0 0 40px rgba(239, 68, 68, 0.3);
    animation: shake 400ms ease-in-out, invalidPulse 700ms ease-in-out;
  `}

  ${(props) => props.$state === 'filled' && css`
    box-shadow:
      inset 0 4px 12px rgba(0, 0, 0, 0.5),
      inset 0 2px 4px rgba(0, 0, 0, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.05);
    background: linear-gradient(180deg,
      rgba(30, 20, 15, 0.95) 0%,
      rgba(20, 12, 8, 1) 100%
    );
  `}

  ${reducedMotion}
  
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-3px); }
    20%, 40%, 60%, 80% { transform: translateX(3px); }
  }

  @keyframes invalidPulse {
    0% { box-shadow: 0 0 14px rgba(239, 68, 68, 0.45), 0 0 28px rgba(239, 68, 68, 0.2); }
    60% { box-shadow: 0 0 26px rgba(239, 68, 68, 0.7), 0 0 52px rgba(239, 68, 68, 0.35); }
    100% { box-shadow: 0 0 20px rgba(239, 68, 68, 0.6), 0 0 40px rgba(239, 68, 68, 0.3); }
  }
`;

const ShelfTexture = styled.div`
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    90deg,
    transparent,
    transparent 8px,
    rgba(0, 0, 0, 0.1) 8px,
    rgba(0, 0, 0, 0.1) 10px
  );
  border-radius: 6px;
  pointer-events: none;
`;

const SlotContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${(props) => props.theme.spacing.xs};
  z-index: 1;
`;

const SlotLabel = styled.span<{ $visible: boolean }>`
  font-family: ${(props) => props.theme.typography.fontFamily.ui};
  font-size: ${(props) => props.theme.typography.fontSize.ui.sm};
  color: ${(props) => props.theme.colors.text.primary};
  opacity: ${(props) => props.$visible ? 0.6 : 0};
  text-transform: uppercase;
  letter-spacing: 1px;
  transition: opacity ${TIMING.SHELF_HOVER.in}ms ${TIMING.SHELF_HOVER.easing};
`;

const ExpectedGenre = styled.span`
  font-family: ${(props) => props.theme.typography.fontFamily.monospace};
  font-size: ${(props) => props.theme.typography.fontSize.monospace.sm};
  color: ${(props) => props.theme.colors.accent.secondary};
  opacity: 0.8;
`;

const FeedbackIcon = styled.div<{ $type: 'valid' | 'invalid' | 'none' }>`
  position: absolute;
  bottom: 8px;
  right: 8px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: bold;
  animation: popIn 200ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  
  ${(props) => {
    switch (props.$type) {
      case 'valid':
        return `
          background: #4ade80;
          color: white;
          &::after { content: '✓'; }
        `;
      case 'invalid':
        return `
          background: #ef4444;
          color: white;
          &::after { content: '✕'; }
        `;
      default:
        return 'display: none;';
    }
  }}
  
  @keyframes popIn {
    0% { transform: scale(0); }
    60% { transform: scale(1.2); }
    100% { transform: scale(1); }
  }
  
  ${reducedMotion}
`;

const GlowRing = styled.div<{ $active: boolean; $color: string }>`
  position: absolute;
  inset: -4px;
  border-radius: 12px;
  border: 2px solid ${(props) => props.$color};
  opacity: ${(props) => props.$active ? 0.8 : 0};
  animation: ${(props) => props.$active ? 'pulse 1.5s ease-in-out infinite' : 'none'};
  
  @keyframes pulse {
    0%, 100% { 
      opacity: 0.6;
      transform: scale(1);
    }
    50% { 
      opacity: 1;
      transform: scale(1.02);
    }
  }
  
  ${reducedMotion}
`;

export const ShelfSlot: React.FC<ShelfSlotProps> = ({
  state,
  expectedGenre,
  onDrop,
  onDragOver,
  onDragLeave,
}) => {
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    onDragOver?.();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    onDrop?.();
  };

  const getFeedbackType = (): 'valid' | 'invalid' | 'none' => {
    if (state === 'highlight') return 'valid';
    if (state === 'invalid') return 'invalid';
    return 'none';
  };

  const getGlowColor = (): string => {
    if (state === 'highlight') return '#4ade80';
    if (state === 'invalid') return '#ef4444';
    return 'transparent';
  };

  return (
    <SlotWrapper
      $state={state}
      onDragOver={handleDragOver}
      onDragLeave={onDragLeave}
      onDrop={handleDrop}
      role="region"
      aria-label={`Shelf slot${expectedGenre ? ` for ${expectedGenre}` : ''}`}
      aria-dropeffect={state === 'empty' || state === 'highlight' ? 'move' : 'none'}
    >
      {state === 'empty' && <ShelfTexture />}
      
      <GlowRing 
        $active={state === 'highlight' || state === 'invalid'} 
        $color={getGlowColor()}
        aria-hidden="true"
      />
      
      <SlotContent>
        <SlotLabel $visible={state === 'empty' || state === 'highlight'}>
          {state === 'empty' ? 'Empty Slot' : 'Drop Here'}
        </SlotLabel>
        {expectedGenre && (state === 'empty' || state === 'highlight') && (
          <ExpectedGenre>{expectedGenre}</ExpectedGenre>
        )}
      </SlotContent>

      <FeedbackIcon $type={getFeedbackType()} />
    </SlotWrapper>
  );
};

export default ShelfSlot;
