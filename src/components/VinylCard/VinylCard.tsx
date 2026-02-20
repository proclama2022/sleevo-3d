import React, { useState, useEffect } from 'react';
import styled, { css } from 'styled-components';
import { animations, TIMING, reducedMotion } from '../../animations';

export interface VinylCardProps {
  id: string;
  title: string;
  artist: string;
  genre: string;
  year: number;
  coverImage?: string;
  state: 'idle' | 'dragging' | 'placed';
  isValid?: boolean;
  onDragStart?: () => void;
  onDragEnd?: () => void;
}

// Outer container ensures 44x44px minimum touch target
const CardContainer = styled.div`
  position: relative;
  min-width: 44px;
  min-height: 44px;
  display: inline-block;
`;

// Sleeve wrapper - 100px width per locked decision
const SleeveWrapper = styled.div<{
  $state: VinylCardProps['state'];
  $isValid: boolean;
  $isAnimating: boolean;
}>`
  position: relative;
  width: 100px;
  height: 120px;
  background: ${(props) => props.theme.colors.background.secondary};
  border: 2px solid ${(props) => {
    switch (props.$state) {
      case 'idle': return props.theme.colors.background.primary;
      case 'dragging': return props.theme.colors.accent.primary;
      case 'placed': return props.$isValid ? '#4ade80' : '#ef4444';
      default: return props.theme.colors.background.primary;
    }
  }};
  border-radius: 8px;
  cursor: grab;
  opacity: ${(props) => props.$state === 'dragging' ? 0.9 : 1};
  transform: ${(props) => {
    if (props.$state === 'dragging') {
      return 'scale(1.08) rotate(2deg)';
    }
    return 'scale(1)';
  }};
  transition:
    transform ${TIMING.CARD_SETTLE.duration}ms ${TIMING.CARD_SETTLE.easing},
    border-color ${TIMING.TRANSITION_NORMAL}ms ${TIMING.CARD_SETTLE.easing},
    opacity ${TIMING.TRANSITION_NORMAL}ms ${TIMING.CARD_SETTLE.easing},
    box-shadow ${TIMING.TRANSITION_NORMAL}ms ${TIMING.CARD_SETTLE.easing};
  overflow: visible; /* Allow vinyl disc to extend beyond sleeve */
  z-index: ${(props) => {
    switch (props.$state) {
      case 'dragging': return 100;
      case 'placed': return 5;
      default: return 1;
    }
  }};

  /* Animation states */
  ${(props) => {
    if (props.$isAnimating && props.$state === 'placed') {
      if (props.$isValid) {
        return css`${animations.cardSettle}`;
      } else {
        return css`${animations.shake}`;
      }
    }
    return css``;
  }}

  ${(props) => props.$state === 'dragging' && css`
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
    cursor: grabbing;
  `}

  ${(props) => props.$state !== 'dragging' && css`
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  `}

  ${reducedMotion}
`;

// Vinyl disc - offset to show peeking out from sleeve
const VinylDisc = styled.div<{ $imageUrl?: string }>`
  position: absolute;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: ${(props) =>
    props.$imageUrl
      ? `url(${props.$imageUrl}) center/cover`
      : `linear-gradient(135deg, #1a1a1a 0%, #333 50%, #1a1a1a 100%)`};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
  /* Offset to show vinyl peeking from sleeve - bottom right corner */
  bottom: -8px;
  right: -8px;
  z-index: 0;

  /* Vinyl grooves effect (subtle concentric rings) */
  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #111;
    box-shadow:
      0 0 0 3px rgba(50, 50, 50, 0.3),
      0 0 0 6px rgba(50, 50, 50, 0.2),
      0 0 0 9px rgba(50, 50, 50, 0.1);
  }

  /* Center label */
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: ${(props) => props.$imageUrl
      ? 'rgba(255, 255, 255, 0.1)'
      : props => `linear-gradient(135deg, ${props.theme.colors.accent.primary} 0%, ${props.theme.colors.accent.secondary} 100%)`};
  }
`;

// Art area with gradient overlay for text readability
const ArtArea = styled.div<{ $imageUrl?: string }>`
  position: relative;
  width: 100%;
  height: 80px;
  border-radius: 6px 6px 0 0;
  background: ${(props) =>
    props.$imageUrl
      ? `url(${props.$imageUrl}) center/cover`
      : `linear-gradient(135deg, ${props.theme.colors.accent.primary} 0%, ${props.theme.colors.accent.secondary} 100%)`};
  overflow: hidden;
`;

// Gradient overlay at bottom for text readability
const TextOverlay = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 6px;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.85) 0%, rgba(0, 0, 0, 0.5) 60%, transparent 100%);
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

// Genre badge - compact styling
const GenreBadge = styled.span`
  display: inline-block;
  padding: 1px 4px;
  background: ${(props) => props.theme.colors.accent.secondary};
  border-radius: 3px;
  text-transform: uppercase;
  font-family: ${(props) => props.theme.typography.fontFamily.monospace};
  font-size: 8px;
  letter-spacing: 0.5px;
  color: ${(props) => props.theme.colors.background.primary};
  font-weight: ${(props) => props.theme.typography.fontWeight.bold};
  width: fit-content;
`;

// Year display
const Year = styled.span`
  font-family: ${(props) => props.theme.typography.fontFamily.monospace};
  font-size: 9px;
  color: rgba(255, 255, 255, 0.7);
`;

// Title - truncated to fit
const Title = styled.span`
  font-family: ${(props) => props.theme.typography.fontFamily.ui};
  font-size: 10px;
  font-weight: ${(props) => props.theme.typography.fontWeight.medium};
  color: white;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 88px;
`;

// Meta row for genre and year
const MetaRow = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

// Placed indicator for feedback
const PlacedIndicator = styled.div<{ $isValid: boolean }>`
  position: absolute;
  top: -6px;
  right: -6px;
  width: 20px;
  height: 20px;
  background: ${(props) => props.$isValid ? '#4ade80' : '#ef4444'};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 12px;
  font-weight: bold;
  border: 2px solid ${(props) => props.theme.colors.background.secondary};
  ${animations.checkPop}

  ${reducedMotion}
`;

export const VinylCard: React.FC<VinylCardProps> = ({
  title,
  artist,
  genre,
  year,
  coverImage,
  state,
  isValid = true,
  onDragStart,
  onDragEnd,
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (state === 'placed') {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 400);
      return () => clearTimeout(timer);
    }
  }, [state]);

  return (
    <CardContainer>
      <SleeveWrapper
        $state={state}
        $isValid={isValid}
        $isAnimating={isAnimating}
        draggable
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        role="button"
        aria-label={`${title} by ${artist}, ${genre}, ${year}`}
        aria-grabbed={state === 'dragging'}
      >
        {/* Vinyl disc peeking from sleeve */}
        <VinylDisc $imageUrl={coverImage} />

        {/* Art area with text overlay */}
        <ArtArea $imageUrl={coverImage}>
          <TextOverlay>
            <MetaRow>
              <GenreBadge>{genre}</GenreBadge>
              <Year>{year}</Year>
            </MetaRow>
            <Title title={title}>{title}</Title>
          </TextOverlay>
        </ArtArea>
      </SleeveWrapper>
      {state === 'placed' && (
        <PlacedIndicator $isValid={isValid} aria-hidden="true">
          {isValid ? '\u2713' : '\u2715'}
        </PlacedIndicator>
      )}
    </CardContainer>
  );
};

export default VinylCard;
