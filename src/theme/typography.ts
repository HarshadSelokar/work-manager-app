import { TextStyle } from 'react-native';

export const FONT_SIZES = {
  h1: 32,
  h2: 24,
  h3: 20,
  bodyLarge: 16,
  bodyMedium: 14,
  bodySmall: 12,
  caption: 10,
};

export const FONT_WEIGHTS: { [key: string]: TextStyle['fontWeight'] } = {
  bold: '700',
  semiBold: '600',
  medium: '500',
  regular: '400',
  light: '300',
};

export const TYPOGRAPHY: { [key: string]: TextStyle } = {
  h1: {
    fontSize: FONT_SIZES.h1,
    fontWeight: FONT_WEIGHTS.bold,
    lineHeight: 40,
  },
  h2: {
    fontSize: FONT_SIZES.h2,
    fontWeight: FONT_WEIGHTS.semiBold,
    lineHeight: 32,
  },
  h3: {
    fontSize: FONT_SIZES.h3,
    fontWeight: FONT_WEIGHTS.semiBold,
    lineHeight: 26,
  },
  bodyLarge: {
    fontSize: FONT_SIZES.bodyLarge,
    fontWeight: FONT_WEIGHTS.regular,
    lineHeight: 24,
  },
  bodyMedium: {
    fontSize: FONT_SIZES.bodyMedium,
    fontWeight: FONT_WEIGHTS.regular,
    lineHeight: 20,
  },
  bodySmall: {
    fontSize: FONT_SIZES.bodySmall,
    fontWeight: FONT_WEIGHTS.regular,
    lineHeight: 18,
  },
  caption: {
    fontSize: FONT_SIZES.caption,
    fontWeight: FONT_WEIGHTS.light,
    lineHeight: 14,
  },
};
