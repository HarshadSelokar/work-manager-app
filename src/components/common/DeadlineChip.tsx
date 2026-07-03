import React from 'react';
import { StyleSheet, View } from 'react-native';
import { theme } from '@theme/index';
import { Text } from './Text';

interface DeadlineChipProps {
  deadline?: Date;
}

export const DeadlineChip: React.FC<DeadlineChipProps> = React.memo(({ deadline }) => {
  if (!deadline) {
    return null;
  }

  const getDeadlineStyle = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(deadline);
    dueDate.setHours(0, 0, 0, 0);

    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return {
        backgroundColor: theme.colors.danger + '15',
        textColor: 'danger' as const,
        label: 'Overdue',
      };
    } else if (diffDays === 0) {
      return {
        backgroundColor: theme.colors.warning + '15',
        textColor: 'warning' as const,
        label: 'Due Today',
      };
    } else if (diffDays === 1) {
      return {
        backgroundColor: theme.colors.warning + '10',
        textColor: 'warning' as const,
        label: 'Due Tomorrow',
      };
    } else {
      return {
        backgroundColor: theme.colors.border,
        textColor: 'textSecondary' as const,
        label: `Due ${dueDate.toLocaleDateString()}`,
      };
    }
  };

  const { backgroundColor, textColor, label } = getDeadlineStyle();

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Text variant="caption" fontWeight="semiBold" color={textColor}>
        {label}
      </Text>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.xs,
    alignSelf: 'flex-start',
  },
});
