import React from 'react';
import styled from 'styled-components';

export interface VisuallyHiddenProps {
  children: React.ReactNode;
  as?: 'span' | 'div' | 'p';
}

/**
 * VisuallyHidden - Content hidden visually but accessible to screen readers
 */
const HiddenStyles = `
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
`;

const HiddenSpan = styled.span`${HiddenStyles}`;
const HiddenDiv = styled.div`${HiddenStyles}`;
const HiddenP = styled.p`${HiddenStyles}`;

export const VisuallyHidden: React.FC<VisuallyHiddenProps> = ({
  children,
  as = 'span',
}) => {
  if (as === 'div') {
    return <HiddenDiv>{children}</HiddenDiv>;
  }
  if (as === 'p') {
    return <HiddenP>{children}</HiddenP>;
  }
  return <HiddenSpan>{children}</HiddenSpan>;
};

/**
 * LiveRegion - Region for screen reader announcements
 */
export interface LiveRegionProps {
  children: React.ReactNode;
  polite?: boolean;
}

const LiveRegionElement = styled.div`
  ${HiddenStyles}
`;

export const LiveRegion: React.FC<LiveRegionProps> = ({
  children,
  polite = true,
}) => {
  return (
    <LiveRegionElement
      role="status"
      aria-live={polite ? 'polite' : 'assertive'}
      aria-atomic="true"
    >
      {children}
    </LiveRegionElement>
  );
};

/**
 * SkipLink - Link to skip to main content
 */
export interface SkipLinkProps {
  targetId: string;
  label?: string;
}

const SkipLinkElement = styled.a`
  position: absolute;
  top: -40px;
  left: 0;
  padding: ${(props) => props.theme.spacing.sm} ${(props) => props.theme.spacing.md};
  background: ${(props) => props.theme.colors.accent.primary};
  color: white;
  text-decoration: none;
  border-radius: 0 0 4px 0;
  z-index: 10000;
  transition: top 0.2s ease;

  &:focus {
    top: 0;
  }
`;

export const SkipLink: React.FC<SkipLinkProps> = ({
  targetId,
  label = 'Skip to main content',
}) => {
  return (
    <SkipLinkElement href={`#${targetId}`}>
      {label}
    </SkipLinkElement>
  );
};

export default VisuallyHidden;
