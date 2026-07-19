/**
 * Indigo Pop Design System
 * Clean, bright, modern SaaS feel with cyan accent for rewards
 */

export const Colors = {
  // Primary Indigo Shades
  primary: '#4F46E5',        // Indigo - buttons, active nav, headers
  primaryHover: '#4338CA',   // Hover state
  primaryBright: '#6366F1',  // Progress fill, highlights
  primarySoft: '#E0E7FF',    // Progress track, soft fills
  primaryTint: '#EEF2FF',    // Selected/completed card background
  primaryLight: '#818CF8',   // Light indigo for accents
  primaryDark: '#3730A3',    // Dark indigo for pressed states

  // Accent Cyan (Rewards & Gamification)
  accent: '#06B6D4',         // Cyan - points, streaks, rewards only
  accentSoft: '#CFFAFE',     // Soft cyan background
  accentText: '#0E7490',     // Text on accent-soft background
  accentDark: '#0891B2',     // Dark cyan

  // Neutral Grays
  textPrimary: '#0F172A',    // Primary text
  textSecondary: '#64748B',  // Secondary text
  textMuted: '#64748B',      // Muted text
  textFaint: '#94A3B8',      // Completed/struck items - still legible
  textTertiary: '#94A3B8',   // Tertiary/helper text

  // Backgrounds
  background: '#F8FAFC',     // Page background
  backgroundSecondary: '#F1F5F9', // Secondary background
  card: '#FFFFFF',           // Card/surface backgrounds
  surface: '#FFFFFF',        // Surface backgrounds

  // Borders & Dividers
  border: '#E5E7EB',         // Default borders
  borderHover: '#D1D5DB',    // Hover borders
  borderLight: '#F3F4F6',    // Light borders

  // Semantic Colors
  success: '#10B981',        // Success states
  warning: '#F59E0B',        // Warning states
  error: '#EF4444',          // Error states
  danger: '#F43F5E',         // Streak flame, alerts
  info: '#3B82F6',           // Info states

  // Fixed Colors
  white: '#FFFFFF',
  black: '#000000',

  // Transparent overlays
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.08)',
} as const;

export type ColorKey = keyof typeof Colors;
