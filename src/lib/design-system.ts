/**
 * Companion Design System
 * Centralized design tokens for consistent styling across the app
 */

/**
 * Color palette for the Companion app
 * Organized by purpose: primary, emotional states, and accents
 */
export const colors = {
  // Primary Colors
  primary: {
    deepCalmBlue: '#2C5F7C',
    softSage: '#A8C5B5',
    warmNeutral: '#F5F3EF',
  },
  
  // Emotional State Colors - for mood tracking and visualizations
  emotional: {
    sereneGreen: '#6B9E78',    // Good/calm days
    gentleAmber: '#E8B563',    // Okay/managing days
    softCoral: '#D99B7C',      // Challenging days
    mutedLavender: '#B4A5C7',  // Mixed/processing days
  },
  
  // Accent Colors
  accent: {
    highlightTeal: '#4A9B9B',  // CTAs, interactive elements
  },
  
  // Semantic Colors
  semantic: {
    background: '#FEFEFE',
    foreground: '#1A1A1A',
    muted: '#6B7280',
    border: '#E5E7EB',
    error: '#EF4444',
    success: '#10B981',
    warning: '#F59E0B',
  },
} as const;

/**
 * Spacing scale based on 0.25rem (4px) increments
 * Use for margins, padding, and gap properties
 */
export const spacing = {
  xs: '0.5rem',    // 8px
  sm: '0.75rem',   // 12px
  md: '1rem',      // 16px
  lg: '1.5rem',    // 24px
  xl: '2rem',      // 32px
  '2xl': '3rem',   // 48px
  '3xl': '4rem',   // 64px
  '4xl': '6rem',   // 96px
} as const;

/**
 * Border radius values for rounded corners
 * Following the warm, approachable design aesthetic
 */
export const borderRadius = {
  sm: '0.5rem',    // 8px
  md: '0.75rem',   // 12px
  lg: '1rem',      // 16px
  xl: '1.25rem',   // 20px
  '2xl': '1.5rem', // 24px
  full: '9999px',  // Fully rounded (pills)
} as const;

/**
 * Box shadow definitions
 * Soft shadows that align with the calm, non-harsh aesthetic
 */
export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.07), 0 2px 4px -2px rgb(0 0 0 / 0.05)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.08), 0 4px 6px -4px rgb(0 0 0 / 0.05)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.08), 0 8px 10px -6px rgb(0 0 0 / 0.05)',
} as const;

/**
 * Typography scale and settings
 * Readable fonts with generous line-height
 */
export const typography = {
  fontFamily: {
    sans: '-apple-system, "SF Pro Text", Inter, system-ui, sans-serif',
  },
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem',// 30px
    '4xl': '2rem',    // 32px
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  lineHeight: {
    tight: '1.25',
    normal: '1.5',
    relaxed: '1.6',
    loose: '1.75',
  },
} as const;

/**
 * Animation durations and easings
 * For smooth, pleasant interactions
 */
export const animation = {
  duration: {
    fast: '150ms',
    normal: '250ms',
    slow: '350ms',
  },
  easing: {
    default: 'cubic-bezier(0.4, 0, 0.2, 1)',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
} as const;

/**
 * Breakpoints for responsive design
 * Mobile-first approach
 */
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

/**
 * Z-index scale for layering
 * Prevents z-index conflicts
 */
export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1100,
  fixed: 1200,
  modalBackdrop: 1300,
  modal: 1400,
  popover: 1500,
  tooltip: 1600,
} as const;
