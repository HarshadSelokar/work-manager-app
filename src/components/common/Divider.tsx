import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { theme } from '@theme/index';

interface DividerProps {
  style?: ViewStyle;
}

export const Divider: React.FC<DividerProps> = React.memo(({ style }) => {
  return <View style={[styles.divider, style]} />;
});

const styles = StyleSheet.create({
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: theme.colors.border,
    marginVertical: theme.spacing.sm,
  },
});
