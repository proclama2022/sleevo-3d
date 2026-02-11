import React from 'react';
import styled, { css } from 'styled-components';

export interface ShelfSlotProps {
  id: string;
  state: 'empty' | 'highlight' | 'filled' | 'invalid';
  placedVinylId?: string;
  expectedGenre?: string;
  onDrop?: () => void;
  onDragOver?: () => void;
  onDragLeave?: () => void;
}

const glowAnimation = css`
  @keyframes pulse-glow {
    0%, 100% { box-shadow: 0 0 10px currentColor; }
    50% { box-shadow: 0 0 20px currentColor; }
  }
`;

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
  transition: border-color 0.15s ease, box-shadow 0.15s ease;

  ${(props) => props.$state === 'highlight' && css`
    ${glowAnimation}
    animation: pulse-glow 1.5s ease-in-out infinite;
    color: #4ade80;
    box-shadow: 0 0 15px #4ade80;
  `}

  ${(props) => props.$state === 'invalid' && css`
    ${glowAnimation}
    animation: pulse-glow 0.8s ease-in-out infinite;
    color: #ef4444;
    box-shadow: 0 0 15px #ef4444;
  `}

  @media (prefers-reduced-motion: reduce) {
    animation: none;
    transition: none;
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
  transition: opacity 0.15s ease;
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
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: bold;
  
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
