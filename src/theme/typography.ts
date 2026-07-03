import { TextStyle } from 'react-native';

export const FONT_SIZES = {
  displayLarge: 28,
  displaySmall: 22,
  titleLarge: 18,
  titleMedium: 16,
  bodyLarge: 15,
  bodyMedium: 13,
  bodySmall: 12,
  caption: 11,
  overline: 10,

  // Legacy aliases (for backward compat during migration)
  h1: 28,
  h2: 22,
  h3: 18,
};

export const FONT_WEIGHTS: { [key: string]: TextStyle['fontWeight'] } = {
  bold: '700',
  semiBold: '600',
  medium: '500',
  regular: '400',
  light: '300',
};

export const TYPOGRAPHY: { [key: string]: TextStyle } = {
  displayLarge: {
    fontSize: FONT_SIZES.displayLarge,
    fontWeight: FONT_WEIGHTS.bold,
    lineHeight: 34,
    letterSpacing: -0.3,
  },
  displaySmall: {
    fontSize: FONT_SIZES.displaySmall,
    fontWeight: FONT_WEIGHTS.semiBold,
    lineHeight: 28,
    letterSpacing: -0.2,
  },
  titleLarge: {
    fontSize: FONT_SIZES.titleLarge,
    fontWeight: FONT_WEIGHTS.semiBold,
    lineHeight: 24,
  },
  titleMedium: {
    fontSize: FONT_SIZES.titleMedium,
    fontWeight: FONT_WEIGHTS.semiBold,
    lineHeight: 22,
  },
  bodyLarge: {
    fontSize: FONT_SIZES.bodyLarge,
    fontWeight: FONT_WEIGHTS.regular,
    lineHeight: 22,
  },
  bodyMedium: {
    fontSize: FONT_SIZES.bodyMedium,
    fontWeight: FONT_WEIGHTS.regular,
    lineHeight: 18,
  },
  bodySmall: {
    fontSize: FONT_SIZES.bodySmall,
    fontWeight: FONT_WEIGHTS.regular,
    lineHeight: 16,
  },
  caption: {
    fontSize: FONT_SIZES.caption,
    fontWeight: FONT_WEIGHTS.medium,
    lineHeight: 14,
  },
  overline: {
    fontSize: FONT_SIZES.overline,
    fontWeight: FONT_WEIGHTS.semiBold,
    lineHeight: 14,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },

  // Legacy aliases
  h1: {
    fontSize: FONT_SIZES.displayLarge,
    fontWeight: FONT_WEIGHTS.bold,
    lineHeight: 34,
    letterSpacing: -0.3,
  },
  h2: {
    fontSize: FONT_SIZES.displaySmall,
    fontWeight: FONT_WEIGHTS.semiBold,
    lineHeight: 28,
    letterSpacing: -0.2,
  },
  h3: {
    fontSize: FONT_SIZES.titleLarge,
    fontWeight: FONT_WEIGHTS.semiBold,
    lineHeight: 24,
  },
};
