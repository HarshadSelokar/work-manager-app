import React from 'react';
import { Text as RNText, TextProps as RNTextProps, TextStyle } from 'react-native';
import { theme } from '@theme/index';

interface TextProps extends RNTextProps {
  variant?: 'h1' | 'h2' | 'h3' | 'bodyLarge' | 'bodyMedium' | 'bodySmall' | 'caption';
  color?: keyof typeof theme.colors;
  align?: 'auto' | 'left' | 'right' | 'center' | 'justify';
  fontWeight?: 'bold' | 'semiBold' | 'medium' | 'regular' | 'light';
  style?: TextStyle;
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
