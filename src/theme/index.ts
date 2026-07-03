import { COLORS } from './colors';
import { TYPOGRAPHY, FONT_SIZES, FONT_WEIGHTS } from './typography';
import { SPACING } from './spacing';
import { RADIUS } from './radius';
import { ELEVATION } from './elevation';

export const theme = {
  colors: COLORS,
  typography: TYPOGRAPHY,
  fontSizes: FONT_SIZES,
  fontWeights: FONT_WEIGHTS,
  spacing: SPACING,
  radius: RADIUS,
  elevation: ELEVATION,
};

export type Theme = typeof theme;
