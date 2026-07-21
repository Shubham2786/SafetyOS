/**
 * Halo Design System — Typography Tokens
 * Font family, sizing, scale, weight, line-height, tracking
 */

export const fontFamilies = {
  sans: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  mono: '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  display: 'Outfit, Inter, system-ui, sans-serif',
} as const;

export const fontSizes = {
  xs: { size: '0.75rem', lineHeight: '1rem', tracking: '0.01em' },     // 12px
  sm: { size: '0.875rem', lineHeight: '1.25rem', tracking: '0' },      // 14px
  base: { size: '1rem', lineHeight: '1.5rem', tracking: '-0.011em' },   // 16px
  lg: { size: '1.125rem', lineHeight: '1.75rem', tracking: '-0.014em' }, // 18px
  xl: { size: '1.25rem', lineHeight: '1.75rem', tracking: '-0.017em' }, // 20px
  '2xl': { size: '1.5rem', lineHeight: '2rem', tracking: '-0.019em' },   // 24px
  '3xl': { size: '1.875rem', lineHeight: '2.25rem', tracking: '-0.021em' },// 30px
  '4xl': { size: '2.25rem', lineHeight: '2.5rem', tracking: '-0.022em' },  // 36px
  '5xl': { size: '3rem', lineHeight: '1', tracking: '-0.025em' },        // 48px
} as const;

export const fontWeights = {
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
} as const;
