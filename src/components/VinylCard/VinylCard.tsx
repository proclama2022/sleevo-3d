import React from 'react';
import styled from 'styled-components';

export interface VinylCardProps {
  id: string;
  title: string;
  artist: string;
  genre: string;
  year: number;
  coverImage?: string;
  state: 'idle' | 'dragging' | 'placed';
  onDragStart?: () => void;
  onDragEnd?: () => void;
}

const CardWrapper = styled.div<{ $state: VinylCardProps['state'] }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${(props) => props.theme.spacing.sm};
  padding: ${(props) => props.theme.spacing.sm};
  min-width: 120px;
  min-height: 160px;
  background: ${(props) => props.theme.colors.background.secondary};
  border: 2px solid ${(props) => {
    switch (props.$state) {
      case 'idle': return props.theme.colors.background.primary;
      case 'dragging': return props.theme.colors.accent.primary;
      case 'placed': return '#4ade80';
      default: return props.theme.colors.background.primary;
    }
  }};
  border-radius: 8px;
  cursor: grab;
  opacity: ${(props) => props.$state === 'dragging' ? 0.8 : 1};
  transform: ${(props) => props.$state === 'dragging' ? 'scale(1.05)' : 'scale(1)'};
  transition: transform 0.2s ease, border-color 0.2s ease, opacity 0.2s ease;
  box-shadow: ${(props) => 
    props.$state === 'dragging' 
      ? `0 8px 24px rgba(0, 0, 0, 0.3)` 
      : `0 2px 8px rgba(0, 0, 0, 0.1)`};

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }

  &:active {
    cursor: grabbing;
  }
`;

const CoverArt = styled.div<{ $imageUrl?: string }>`
  width: 80px;
  height: 80px;
  border-radius: 4px;
  background: ${(props) => 
    props.$imageUrl 
      ? `url(${props.$imageUrl}) center/cover` 
      : `linear-gradient(135deg, ${props.theme.colors.accent.primary} 0%, ${props.theme.colors.accent.secondary} 100%)`};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
`;

const InfoSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  text-align: center;
`;

const Title = styled.span`
  font-family: ${(props) => props.theme.typography.fontFamily.ui};
  font-size: ${(props) => props.theme.typography.fontSize.ui.sm};
  font-weight: ${(props) => props.theme.typography.fontWeight.medium};
  color: ${(props) => props.theme.colors.text.primary};
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const Artist = styled.span`
  font-family: ${(props) => props.theme.typography.fontFamily.ui};
  font-size: ${(props) => props.theme.typography.fontSize.ui.xs};
  font-weight: ${(props) => props.theme.typography.fontWeight.regular};
  color: ${(props) => props.theme.colors.text.primary};
  opacity: 0.8;
`;

const MetaRow = styled.div`
  display: flex;
  gap: ${(props) => props.theme.spacing.xs};
  font-family: ${(props) => props.theme.typography.fontFamily.monospace};
  font-size: ${(props) => props.theme.typography.fontSize.monospace.sm};
  color: ${(props) => props.theme.colors.accent.secondary};
`;

const GenreBadge = styled.span`
  padding: 2px 6px;
  background: rgba(93, 197, 226, 0.2);
  border-radius: 4px;
  text-transform: uppercase;
  font-size: 10px;
  letter-spacing: 0.5px;
`;

const Year = styled.span`
  opacity: 0.7;
`;

const PlacedIndicator = styled.div`
  position: absolute;
  top: 4px;
  right: 4px;
  width: 20px;
  height: 20px;
  background: #4ade80;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 12px;
  font-weight: bold;
`;

const CardContainer = styled.div`
  position: relative;
  min-width: 44px;
  min-height: 44px;
`;

export const VinylCard: React.FC<VinylCardProps> = ({
  title,
  artist,
  genre,
  year,
  coverImage,
  state,
  onDragStart,
  onDragEnd,
}) => {
  return (
    <CardContainer>
      <CardWrapper
        $state={state}
        draggable
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        role="button"
        aria-label={`${title} by ${artist}, ${genre}, ${year}`}
        aria-grabbed={state === 'dragging'}
      >
        <CoverArt $imageUrl={coverImage} />
        <InfoSection>
          <Title>{title}</Title>
          <Artist>{artist}</Artist>
          <MetaRow>
            <GenreBadge>{genre}</GenreBadge>
            <Year>{year}</Year>
          </MetaRow>
        </InfoSection>
      </CardWrapper>
      {state === 'placed' && <PlacedIndicator>✓</PlacedIndicator>}
    </CardContainer>
  );
};

export default VinylCard;
