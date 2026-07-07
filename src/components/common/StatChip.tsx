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
          variant="displaySmall"
          fontWeight="bold"
          style={{ color: accentColor }}
        >
          {value}
        </Text>
        <Text variant="overline" color="textSecondary" style={styles.label}>
          {label}
        </Text>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  chip: {
    backgroundColor: 'rgba(26, 26, 34, 0.65)',
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  label: {
    marginTop: theme.spacing.xs - 2,
    fontSize: 9,
  },
});
