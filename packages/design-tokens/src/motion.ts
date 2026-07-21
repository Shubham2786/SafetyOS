/**
 * Halo Design System — Motion Tokens
 * Direct implementation of Motion_Design_Specification.md
 */

export const durations = {
  instant: '0ms',
  fast: '120ms',
  moderate: '240ms',
  slow: '360ms',
  deliberate: '480ms',
} as const;

export const easings = {
  standard: 'cubic-bezier(0.2, 0, 0, 1)',
  entrance: 'cubic-bezier(0, 0, 0.2, 1)',
  exit: 'cubic-bezier(0.4, 0, 1, 1)',
  emphasized: 'cubic-bezier(0.2, 0, 0, 1.2)',
  spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
} as const;
