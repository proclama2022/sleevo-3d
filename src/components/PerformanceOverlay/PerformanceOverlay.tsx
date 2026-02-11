import React from 'react';
import styled from 'styled-components';
import { useFPSMonitor, useLowEndDevice } from '../../hooks/useA11y';

export interface PerformanceOverlayProps {
  show?: boolean;
}

const OverlayContainer = styled.div`
  position: fixed;
  bottom: ${(props) => props.theme.spacing.md};
  right: ${(props) => props.theme.spacing.md};
  padding: ${(props) => props.theme.spacing.sm};
  background: rgba(0, 0, 0, 0.8);
  border-radius: 8px;
  font-family: ${(props) => props.theme.typography.fontFamily.monospace};
  font-size: 12px;
  color: white;
  z-index: 9999;
  pointer-events: none;
  min-width: 120px;
`;

const StatRow = styled.div`
  display: flex;
  justify-content: space-between;
  gap: ${(props) => props.theme.spacing.md};
`;

const StatLabel = styled.span`
  opacity: 0.6;
`;

const StatValue = styled.span<{ $good?: boolean }>`
  color: ${(props) => props.$good === false ? '#ef4444' : props.$good === true ? '#4ade80' : 'white'};
`;

const QualityBadge = styled.div<{ $low: boolean }>`
  margin-top: ${(props) => props.theme.spacing.xs};
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  text-transform: uppercase;
  background: ${(props) => props.$low ? '#ef4444' : '#4ade80'};
  color: white;
  text-align: center;
`;

/**
 * PerformanceOverlay - Debug overlay showing FPS and performance stats
 */
export const PerformanceOverlay: React.FC<PerformanceOverlayProps> = ({
  show = true,
}) => {
  const { fps, stats, isGood } = useFPSMonitor(show);
  const { isLowEnd, quality } = useLowEndDevice();

  if (!show) return null;

  return (
    <OverlayContainer aria-hidden="true">
      <StatRow>
        <StatLabel>FPS</StatLabel>
        <StatValue $good={isGood}>{fps}</StatValue>
      </StatRow>
      <StatRow>
        <StatLabel>Min/Max</StatLabel>
        <StatValue>{stats.min}/{stats.max}</StatValue>
      </StatRow>
      <QualityBadge $low={isLowEnd}>
        {isLowEnd ? 'Low-end' : 'Standard'} Mode
      </QualityBadge>
      <div style={{ fontSize: 10, marginTop: 4, opacity: 0.5 }}>
        {quality.shadows ? '✓' : '✕'} Shadows
        {' '}{quality.antialias ? '✓' : '✕'} AA
        {' '}{quality.effects ? '✓' : '✕'} FX
      </div>
    </OverlayContainer>
  );
};

export default PerformanceOverlay;
