import React from 'react';
import { Text as RNText, TextProps as RNTextProps, TextStyle, StyleProp } from 'react-native';
import { theme } from '@theme/index';

type TypographyVariant =
  | 'displayLarge' | 'displaySmall'
  | 'titleLarge' | 'titleMedium'
  | 'bodyLarge' | 'bodyMedium' | 'bodySmall'
  | 'caption' | 'overline'
  // Legacy aliases
  | 'h1' | 'h2' | 'h3';

interface TextProps extends RNTextProps {
  variant?: TypographyVariant;
  color?: keyof typeof theme.colors;
  align?: 'auto' | 'left' | 'right' | 'center' | 'justify';
  fontWeight?: 'bold' | 'semiBold' | 'medium' | 'regular' | 'light';
  style?: StyleProp<TextStyle>;
}

export const Text: React.FC<TextProps> = ({
  children,
  variant = 'bodyMedium',
  color = 'textPrimary',
  align = 'left',
  fontWeight,
  style,
  ...rest
}) => {
  const textStyle: TextStyle = {
    ...theme.typography[variant],
    color: theme.colors[color],
    textAlign: align,
    ...(fontWeight ? { fontWeight: theme.fontWeights[fontWeight] } : {}),
  };

  return (
    <RNText style={[textStyle, style]} {...rest}>
      {children}
    </RNText>
  );
};
