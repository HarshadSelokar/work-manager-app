import React from 'react';
import { StyleSheet, View } from 'react-native';
import { WorkPriority } from '@models/work.model';
import { theme } from '@theme/index';
import { Text } from './Text';

interface PriorityBadgeProps {
  priority: WorkPriority;
  size?: 'sm' | 'md';
}

const PRIORITY_CONFIG = {
  [WorkPriority.HIGH]: {
    color: theme.colors.priorityHigh,
    bg: theme.colors.priorityHighBg,
    label: 'H',
    fullLabel: 'HIGH',
  },
  [WorkPriority.MEDIUM]: {
    color: theme.colors.priorityMedium,
    bg: theme.colors.priorityMediumBg,
    label: 'M',
    fullLabel: 'MED',
  },
  [WorkPriority.LOW]: {
    color: theme.colors.priorityLow,
    bg: theme.colors.priorityLowBg,
    label: 'L',
    fullLabel: 'LOW',
  },
};

export const PriorityBadge: React.FC<PriorityBadgeProps> = React.memo(
  ({ priority, size = 'sm' }) => {
    const config = PRIORITY_CONFIG[priority];
    const isSmall = size === 'sm';

    return (
      <View style={[styles.badge, { backgroundColor: config.bg }, isSmall && styles.badgeSm]}>
        <View style={[styles.dot, { backgroundColor: config.color }]} />
        <Text
          variant="caption"
          fontWeight="semiBold"
          style={[styles.label, { color: config.color }]}
        >
          {isSmall ? config.label : config.fullLabel}
        </Text>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 3,
    borderRadius: theme.radius.round,
    alignSelf: 'flex-start',
    gap: 4,
  },
  badgeSm: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  label: {
    letterSpacing: 0.5,
  },
});
