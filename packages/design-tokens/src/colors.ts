/**
 * Halo Design System — Color Tokens
 * Authoritative OKLCH & Hex palette definitions for SafetyOS
 */

export const neutralColors = {
  gray0: { light: '#FCFCFD', dark: '#050609', var: '--gray-0' },
  gray50: { light: '#F6F7F9', dark: '#0A0B0D', var: '--gray-50' },
  gray100: { light: '#EEF0F3', dark: '#101216', var: '--gray-100' },
  gray200: { light: '#DDE1E7', dark: '#181B21', var: '--gray-200' },
  gray300: { light: '#C4CAD3', dark: '#22262E', var: '--gray-300' },
  gray400: { light: '#9AA3AF', dark: '#2F343D', var: '--gray-400' },
  gray500: { light: '#6B7280', dark: '#3F4650', var: '--gray-500' },
  gray600: { light: '#4B5563', dark: '#565E6B', var: '--gray-600' },
  gray700: { light: '#374151', dark: '#8A93A1', var: '--gray-700' },
  gray800: { light: '#1F2937', dark: '#C0C6D0', var: '--gray-800' },
  gray900: { light: '#111827', dark: '#E4E7ED', var: '--gray-900' },
  gray1000: { light: '#050609', dark: '#FCFCFD', var: '--gray-1000' },
} as const;

export const intentColors = {
  info: {
    base: '#0284C7',
    subtle: '#E0F2FE',
    border: '#38BDF8',
    text: '#0369A1',
    var: '--intent-info',
  },
  success: {
    base: '#16A34A',
    subtle: '#DCFCE7',
    border: '#4ADE80',
    text: '#15803D',
    var: '--intent-success',
  },
  warning: {
    base: '#D97706',
    subtle: '#FEF3C7',
    border: '#FBBF24',
    text: '#B45309',
    var: '--intent-warning',
  },
  critical: {
    base: '#DC2626',
    subtle: '#FEE2E2',
    border: '#F87171',
    text: '#B91C1C',
    var: '--intent-critical',
  },
  catastrophic: {
    base: '#7F1D1D',
    subtle: '#450A0A',
    border: '#EF4444',
    text: '#FCA5A5',
    pulse: '#FF0000',
    var: '--intent-catastrophic',
  },
} as const;

export const brandColors = {
  halo: {
    cyan: '#06B6D4',
    electric: '#00F0FF',
    deep: '#083344',
    glow: 'rgba(6, 182, 212, 0.4)',
    var: '--brand-halo',
  },
} as const;
