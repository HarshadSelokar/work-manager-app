import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { theme } from '@theme/index';
import { Text } from './Text';

interface StatChipProps {
  value: number;
  label: string;
  color?: string;
  style?: ViewStyle;
}

export const StatChip: React.FC<StatChipProps> = React.memo(
  ({ value, label, color, style }) => {
    const accentColor = color || theme.colors.primary;

    return (
      <View style={[styles.chip, style]}>
        <Text
          variant="titleLarge"
          fontWeight="bold"
          style={{ color: accentColor }}
        >
          {value}
        </Text>
        <Text variant="caption" color="textTertiary">
          {label}
        </Text>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  chip: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 72,
    ...theme.elevation.xs,
  },
});
