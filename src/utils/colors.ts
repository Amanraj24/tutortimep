// ==============================================
// src/utils/colors.ts
// ==============================================

export const COLORS = {
  // Primary Colors
  primary: '#4F46E5',      // Indigo
  primaryDark: '#4338CA',
  primaryLight: '#818CF8',
  
  // Secondary Colors
  secondary: '#06B6D4',    // Cyan
  secondaryDark: '#0891B2',
  textTertiary: '#9CA3AF',

  
  // Status Colors
  success: '#10B981',      // Green
  warning: '#F59E0B',      // Amber
  error: '#EF4444',        // Red
  info: '#3B82F6',         // Blue
  
  // Neutral Colors
  white: '#FFFFFF',
  black: '#000000',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',
  
  // Gradient Colors
  gradientStart: '#4F46E5',
  gradientEnd: '#7C3AED',
  
  // Background
  background: '#F9FAFB',
  cardBackground: '#FFFFFF',
  
  // Text
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  textLight: '#9CA3AF',
  
  // Border
  border: '#E5E7EB',
  borderLight: '#F3F4F6',
  
  // Shadows
  shadowColor: '#000000',
};

export const GRADIENTS = {
  primary: ['#4F46E5', '#7C3AED'],
  secondary: ['#06B6D4', '#3B82F6'],
  success: ['#10B981', '#059669'],
  danger: ['#EF4444', '#DC2626'],
  purple: ['#8B5CF6', '#A855F7'],
  pink: ['#EC4899', '#F472B6'],
};

export const SIZES = {
  // Font Sizes
  h1: 32,
  h2: 28,
  h3: 24,
  h4: 20,
  h5: 18,
  h6: 16,
  body: 16,
  bodySmall: 14,
  caption: 12,
  
  // Spacing
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
  
  // Border Radius
  radiusSm: 8,
  radiusMd: 12,
  radiusLg: 16,
  radiusXl: 24,
  radiusFull: 9999,
  
  // Icon Sizes
  iconSm: 20,
  iconMd: 24,
  iconLg: 32,
  iconXl: 40,
};

export const SHADOWS = {
  small: {
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  medium: {
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  large: {
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
};