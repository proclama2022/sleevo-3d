import { keyframes, css } from 'styled-components';
import { TIMING, EASING } from './timing';

/**
 * Card Pickup Animation
 * Spring-based lift with scale and shadow
 */
export const cardPickup = keyframes`
  0% {
    transform: scale(1);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  50% {
    transform: scale(1.15);
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.25);
  }
  100% {
    transform: scale(1.08);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  }
`;

/**
 * Card Drop Animation
 * Smooth settle into slot
 */
export const cardDrop = keyframes`
  0% {
    transform: scale(1.05);
    opacity: 0.9;
  }
  60% {
    transform: scale(0.98);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
`;

/**
 * Card Settle Animation
 * Subtle bounce when placed correctly
 */
export const cardSettle = keyframes`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.02);
  }
  100% {
    transform: scale(1);
  }
`;

/**
 * Score Increment Pop
 * Number pop and color flash
 */
export const scorePop = keyframes`
  0% {
    transform: scale(1);
    color: inherit;
  }
  50% {
    transform: scale(1.3);
    color: #4ade80;
  }
  100% {
    transform: scale(1);
    color: inherit;
  }
`;

/**
 * Score Float Up
 * Points floating upward and fading
 */
export const scoreFloat = keyframes`
  0% {
    transform: translateY(0);
    opacity: 1;
  }
  100% {
    transform: translateY(-30px);
    opacity: 0;
  }
`;

/**
 * Combo Popup Appear
 * Scale in with rotation
 */
export const comboAppear = keyframes`
  0% {
    transform: scale(0) rotate(-10deg);
    opacity: 0;
  }
  60% {
    transform: scale(1.1) rotate(2deg);
  }
  100% {
    transform: scale(1) rotate(0deg);
    opacity: 1;
  }
`;

/**
 * Combo Popup Disappear
 * Scale out with fade
 */
export const comboDisappear = keyframes`
  0% {
    transform: scale(1);
    opacity: 1;
  }
  100% {
    transform: scale(0.8);
    opacity: 0;
  }
`;

/**
 * Glow Pulse
 * Subtle pulsing glow effect for shelf slot hover (MOTION-03)
 * Uses specific green color per user decision from 03-CONTEXT.md
 */
export const glowPulse = keyframes`
  0%, 100% {
    box-shadow: 0 0 12px rgba(74, 222, 128, 0.4),
                0 0 24px rgba(74, 222, 128, 0.2);
  }
  50% {
    box-shadow: 0 0 20px rgba(74, 222, 128, 0.6),
                0 0 40px rgba(74, 222, 128, 0.3);
  }
`;

/**
 * Hover Glow - for shelf slot hover state
 * Fast enter (150ms ease-out), subtle pulse animation
 * Per requirement MOTION-03: 150ms enter, 200-300ms exit
 */
export const hoverGlow = css`
  transition: all ${TIMING.SHELF_HOVER.in}ms ease-out;
  animation: ${glowPulse} 2s ease-in-out infinite;

  @media (prefers-reduced-motion: reduce) {
    transition: none;
    animation: none;
  }
`;

/**
 * Check Mark Pop
 * Success indicator animation
 */
export const checkPop = keyframes`
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
`;

/**
 * Shake Animation
 * Invalid placement feedback - 2-3 oscillations for snappier feel
 */
export const shake = keyframes`
  0%, 100% {
    transform: translateX(0);
  }
  20%, 60% {
    transform: translateX(-4px);
  }
  40%, 80% {
    transform: translateX(4px);
  }
`;

/**
 * Animation mixins for components
 */
export const animations = {
  cardPickup: css`
    animation: ${cardPickup} ${TIMING.CARD_PICKUP.duration}ms ${TIMING.CARD_PICKUP.easing} forwards;
  `,
  
  cardDrop: css`
    animation: ${cardDrop} ${TIMING.CARD_DROP.duration}ms ${TIMING.CARD_DROP.easing} forwards;
  `,
  
  cardSettle: css`
    animation: ${cardSettle} ${TIMING.CARD_SETTLE.duration}ms ${TIMING.CARD_SETTLE.easing} forwards;
  `,
  
  scorePop: css`
    animation: ${scorePop} ${TIMING.SCORE_POP.duration}ms ${TIMING.SCORE_POP.easing} forwards;
  `,
  
  scoreFloat: css`
    animation: ${scoreFloat} ${TIMING.SCORE_INCREMENT.duration}ms ${EASING.DECELERATE} forwards;
  `,
  
  comboAppear: css`
    animation: ${comboAppear} ${TIMING.COMBO_POPUP.appear}ms ${EASING.SPRING} forwards;
  `,
  
  comboDisappear: css`
    animation: ${comboDisappear} ${TIMING.COMBO_POPUP.disappear}ms ${EASING.ACCELERATE} forwards;
  `,
  
  checkPop: css`
    animation: ${checkPop} 200ms ${EASING.SPRING} forwards;
  `,
  
  shake: css`
    animation: ${shake} 150ms ${EASING.STANDARD};
  `,
  
  glowPulse: css`
    animation: ${glowPulse} 1.5s ${EASING.STANDARD} infinite;
  `,
};

/**
 * Reduced motion versions - instant transitions
 */
export const reducedMotion = css`
  @media (prefers-reduced-motion: reduce) {
    animation: none !important;
    transition: none !important;
  }
`;
