/**
 * Halo Design System — Elevation & Shadow Tokens
 */

export const shadows = {
  0: 'none',
  1: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  2: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  3: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  4: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  5: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  focus: '0 0 0 2px rgba(6, 182, 212, 0.5)',
  glowBrand: '0 0 20px rgba(6, 182, 212, 0.35)',
  glowCritical: '0 0 20px rgba(220, 38, 38, 0.45)',
} as const;

export const zIndex = {
  base: 0,
  sticky: 100,
  drawer: 200,
  modal: 300,
  toast: 400,
  palette: 500,
  orb: 600,
} as const;
