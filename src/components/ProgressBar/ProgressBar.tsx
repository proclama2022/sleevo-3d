import React from 'react';
import styled from 'styled-components';

export interface ProgressBarProps {
  progress: number; // 0-100
  size?: number; // pixel diameter
  strokeWidth?: number;
  label?: string;
  showPercentage?: boolean;
}

const Container = styled.div<{ $size: number }>`
  position: relative;
  width: ${(props) => props.$size}px;
  height: ${(props) => props.$size}px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ProgressSvg = styled.svg`
  transform: rotate(-90deg); // Start from top
  width: 100%;
  height: 100%;
`;

const BackgroundCircle = styled.circle`
  fill: none;
  stroke: ${(props) => props.theme.colors.background.primary};
`;

const ProgressCircle = styled.circle<{ $progress: number; $circumference: number }>`
  fill: none;
  stroke: ${(props) => props.theme.colors.accent.primary};
  stroke-linecap: round;
  transition: stroke-dashoffset 0.3s ease-out;
  stroke-dasharray: ${(props) => props.$circumference};
  stroke-dashoffset: ${(props) => 
    props.$circumference - (props.$progress / 100) * props.$circumference
  };

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

const CenterContent = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transform: rotate(0deg); // Counter-rotate for text
`;

const PercentageText = styled.span`
  font-family: ${(props) => props.theme.typography.fontFamily.ui};
  font-size: ${(props) => props.theme.typography.fontSize.ui.md};
  font-weight: ${(props) => props.theme.typography.fontWeight.bold};
  color: ${(props) => props.theme.colors.text.primary};
`;

const LabelText = styled.span`
  font-family: ${(props) => props.theme.typography.fontFamily.ui};
  font-size: ${(props) => props.theme.typography.fontSize.ui.xs};
  color: ${(props) => props.theme.colors.text.primary};
  opacity: 0.7;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

// Vintage tick marks around the gauge
const TickMarks = styled.circle`
  fill: none;
  stroke: ${(props) => props.theme.colors.background.secondary};
  stroke-dasharray: 2 8;
  opacity: 0.3;
`;

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  size = 64,
  strokeWidth = 6,
  label,
  showPercentage = true,
}) => {
  // Ensure progress is clamped between 0 and 100
  const clampedProgress = Math.min(100, Math.max(0, progress));
  
  // Calculate dimensions
  const radius = (size - strokeWidth * 2) / 2;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;
  const tickRadius = radius + strokeWidth / 2 + 2;

  return (
    <Container $size={size}>
      <ProgressSvg
        viewBox={`0 0 ${size} ${size}`}
        role="progressbar"
        aria-valuenow={clampedProgress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label || `${clampedProgress}% progress`}
      >
        {/* Outer tick marks for vintage feel */}
        <TickMarks
          cx={center}
          cy={center}
          r={tickRadius}
          strokeWidth={1}
        />
        
        {/* Background track */}
        <BackgroundCircle
          cx={center}
          cy={center}
          r={radius}
          strokeWidth={strokeWidth}
        />
        
        {/* Progress arc */}
        <ProgressCircle
          $progress={clampedProgress}
          $circumference={circumference}
          cx={center}
          cy={center}
          r={radius}
          strokeWidth={strokeWidth}
        />
      </ProgressSvg>

      <CenterContent>
        {showPercentage && (
          <PercentageText>{Math.round(clampedProgress)}%</PercentageText>
        )}
        {label && <LabelText>{label}</LabelText>}
      </CenterContent>
    </Container>
  );
};

export default ProgressBar;
