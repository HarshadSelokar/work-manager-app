import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { theme } from '@theme/index';
import { Text } from './Text';

interface StatisticCardProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  color?: string;
  bg?: string;
  style?: ViewStyle;
}

export const StatisticCard: React.FC<StatisticCardProps> = React.memo(({
  label,
  value,
  icon,
  color = theme.colors.primary,
  bg,
  style,
}) => {
  const bgColor = bg || `${color}18`;

  return (
    <View style={[styles.card, style]}>
      <View style={[styles.iconBox, { backgroundColor: bgColor }]}>
        {icon}
      </View>
      <Text
        variant="titleLarge"
        fontWeight="bold"
        style={[styles.value, { color }]}
      >
        {value}
      </Text>
      <Text variant="caption" color="textSecondary" style={styles.label} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'flex-start',
    gap: 4,
    ...theme.elevation.sm,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: theme.radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  value: {
    lineHeight: 24,
  },
  label: {
    lineHeight: 14,
  },
});
