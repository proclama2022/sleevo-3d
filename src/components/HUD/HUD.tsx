import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { ProgressBar } from '../ProgressBar/ProgressBar';
import { TIMING, reducedMotion } from '../../animations';

export interface HUDProps {
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
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  padding: ${(props) => props.theme.spacing.md} ${(props) => props.theme.spacing.lg};
  background: rgba(15, 10, 8, 0.6);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px); // Safari support
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  z-index: 100;

  @media (max-width: ${(props) => props.theme.breakpoints.compact}) {
    padding: ${(props) => props.theme.spacing.sm} ${(props) => props.theme.spacing.md};
  }
`;

// Left section: Score
const LeftSection = styled.div`
  display: flex;
  justify-content: flex-start;
`;

// Center section: Progress Gauge
const CenterSection = styled.div`
  display: flex;
  justify-content: center;
`;

// Right section: Timer + Moves
const RightSection = styled.div`
  display: flex;
  justify-content: flex-end;
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
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.35);

  @media (max-width: ${(props) => props.theme.breakpoints.compact}) {
    font-size: ${(props) => props.theme.typography.fontSize.monospace.sm};
  }
`;

const StatLabel = styled.span`
  font-family: ${(props) => props.theme.typography.fontFamily.ui};
  font-size: ${(props) => props.theme.typography.fontSize.ui.xs};
  color: ${(props) => props.theme.colors.text.primary};
  opacity: 0.5;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const AnimatedScore = styled.span<{ $isAnimating: boolean }>`
  font-family: ${(props) => props.theme.typography.fontFamily.monospace};
  font-size: ${(props) => props.theme.typography.fontSize.monospace.md};
  font-weight: ${(props) => props.theme.typography.fontWeight.bold};
  color: ${(props) => props.theme.colors.accent.primary};
  display: inline-block;
  transform-origin: center;

  ${(props) => props.$isAnimating && `
    animation: scorePop ${TIMING.SCORE_POP.duration}ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  `}

  @keyframes scorePop {
    0% { transform: scale(1); color: inherit; }
    50% { transform: scale(1.3); color: #4ade80; }
    100% { transform: scale(1); color: inherit; }
  }

  @media (max-width: ${(props) => props.theme.breakpoints.compact}) {
    font-size: ${(props) => props.theme.typography.fontSize.monospace.sm};
  }

  ${reducedMotion}
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

  ${reducedMotion}
`;

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const HUD: React.FC<HUDProps> = ({
  score,
  timeRemaining,
  moves,
  progress,
}) => {
  const [displayScore, setDisplayScore] = useState(score);
  const [isAnimating, setIsAnimating] = useState(false);
  const isLowTime = timeRemaining !== undefined && timeRemaining < 30;

  // Animate score changes
  useEffect(() => {
    if (score !== displayScore) {
      setIsAnimating(true);

      const timer = setTimeout(() => {
        setDisplayScore(score);
        setIsAnimating(false);
      }, TIMING.SCORE_POP.duration);

      return () => clearTimeout(timer);
    }
  }, [score, displayScore]);

  return (
    <HUDWrapper role="banner" aria-label="Game status">
      <LeftSection>
        <StatItem>
          <AnimatedScore $isAnimating={isAnimating}>
            {displayScore.toLocaleString()}
          </AnimatedScore>
          <StatLabel>Score</StatLabel>
        </StatItem>
      </LeftSection>

      <CenterSection>
        <ProgressBar
          progress={progress}
          size={56}
          showPercentage={false}
        />
      </CenterSection>

      <RightSection>
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
      </RightSection>
    </HUDWrapper>
  );
};

export default HUD;
