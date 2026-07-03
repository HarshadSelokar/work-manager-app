import React from 'react';
import { StyleSheet, View } from 'react-native';
import { WorkPriority } from '@models/work.model';
import { theme } from '@theme/index';
import { Text } from './Text';

interface PriorityBadgeProps {
  priority: WorkPriority;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = React.memo(({ priority }) => {
  const getBadgeColors = () => {
    switch (priority) {
      case WorkPriority.HIGH:
        return {
          backgroundColor: theme.colors.danger + '15', // 15% opacity hex
          textColor: 'danger' as const,
        };
      case WorkPriority.MEDIUM:
        return {
          backgroundColor: theme.colors.warning + '15',
          textColor: 'warning' as const,
        };
      case WorkPriority.LOW:
      default:
        return {
          backgroundColor: theme.colors.border,
          textColor: 'textSecondary' as const,
        };
    }
  };

  const { backgroundColor, textColor } = getBadgeColors();

  return (
    <View style={[styles.badge, { backgroundColor }]}>
      <Text variant="caption" fontWeight="semiBold" color={textColor} style={styles.text}>
        {priority.toUpperCase()}
      </Text>
    </View>
  );
});

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.xs,
    alignSelf: 'flex-start',
  },
  text: {
    letterSpacing: 0.5,
  },
});
