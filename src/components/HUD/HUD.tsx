import React from 'react';
import styled from 'styled-components';
import { ProgressBar } from '../ProgressBar';

export interface HUDProps {
  levelName: string;
  score: number;
  timeRemaining?: number; // in seconds
  moves: number;
  progress: number; // 0-100
}

const HUDWrapper = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${(props) => props.theme.spacing.md} ${(props) => props.theme.spacing.lg};
  background: linear-gradient(
    180deg,
    rgba(0, 0, 0, 0.8) 0%,
    rgba(0, 0, 0, 0.4) 70%,
    transparent 100%
  );
  z-index: 100;
  
  @media (max-width: ${(props) => props.theme.breakpoints.compact}) {
    padding: ${(props) => props.theme.spacing.sm} ${(props) => props.theme.spacing.md};
  }
`;

const LevelSection = styled.div`
  display: flex;
  align-items: center;
  gap: ${(props) => props.theme.spacing.sm};
`;

const LevelName = styled.h1`
  font-family: ${(props) => props.theme.typography.fontFamily.display};
  font-size: ${(props) => props.theme.typography.fontSize.display.md};
  font-weight: ${(props) => props.theme.typography.fontWeight.bold};
  color: ${(props) => props.theme.colors.text.primary};
  margin: 0;
  letter-spacing: 1px;
  
  @media (max-width: ${(props) => props.theme.breakpoints.compact}) {
    font-size: ${(props) => props.theme.typography.fontSize.display.sm};
  }
`;

const ProgressSection = styled.div`
  display: flex;
  align-items: center;
`;

const StatsSection = styled.div`
  display: flex;
  align-items: center;
  gap: ${(props) => props.theme.spacing.lg};
  
  @media (max-width: ${(props) => props.theme.breakpoints.compact}) {
    gap: ${(props) => props.theme.spacing.md};
  }
`;

const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
`;

const StatValue = styled.span`
  font-family: ${(props) => props.theme.typography.fontFamily.monospace};
  font-size: ${(props) => props.theme.typography.fontSize.monospace.md};
  font-weight: ${(props) => props.theme.typography.fontWeight.bold};
  color: ${(props) => props.theme.colors.accent.primary};
  
  @media (max-width: ${(props) => props.theme.breakpoints.compact}) {
    font-size: ${(props) => props.theme.typography.fontSize.monospace.sm};
  }
`;

const StatLabel = styled.span`
  font-family: ${(props) => props.theme.typography.fontFamily.ui};
  font-size: ${(props) => props.theme.typography.fontSize.ui.xs};
  color: ${(props) => props.theme.colors.text.primary};
  opacity: 0.6;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const TimerValue = styled(StatValue)<{ $lowTime?: boolean }>`
  color: ${(props) => 
    props.$lowTime ? '#ef4444' : props.theme.colors.accent.primary
  };
  animation: ${(props) => 
    props.$lowTime ? 'pulse 1s ease-in-out infinite' : 'none'
  };
  
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
  
  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const HUD: React.FC<HUDProps> = ({
  levelName,
  score,
  timeRemaining,
  moves,
  progress,
}) => {
  const isLowTime = timeRemaining !== undefined && timeRemaining < 30;

  return (
    <HUDWrapper role="banner" aria-label="Game status">
      <LevelSection>
        <LevelName>{levelName}</LevelName>
      </LevelSection>

      <ProgressSection>
        <ProgressBar
          progress={progress}
          size={56}
          strokeWidth={5}
          showPercentage={false}
          label="Level"
        />
      </ProgressSection>

      <StatsSection>
        <StatItem>
          <StatValue>{score.toLocaleString()}</StatValue>
          <StatLabel>Score</StatLabel>
        </StatItem>

        {timeRemaining !== undefined && (
          <StatItem>
            <TimerValue $lowTime={isLowTime}>
              {formatTime(timeRemaining)}
            </TimerValue>
            <StatLabel>Time</StatLabel>
          </StatItem>
        )}

        <StatItem>
          <StatValue>{moves}</StatValue>
          <StatLabel>Moves</StatLabel>
        </StatItem>
      </StatsSection>
    </HUDWrapper>
  );
};

export default HUD;
