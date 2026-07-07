import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Calendar, Clock, AlertTriangle } from 'lucide-react-native';
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
        backgroundColor: theme.colors.priorityHighBg,
        textColor: 'priorityHigh' as const,
        label: 'Overdue',
        icon: <AlertTriangle size={12} color={theme.colors.priorityHigh} />,
      };
    } else if (diffDays === 0) {
      return {
        backgroundColor: theme.colors.priorityMediumBg,
        textColor: 'priorityMedium' as const,
        label: 'Due Today',
        icon: <Clock size={12} color={theme.colors.priorityMedium} />,
      };
    } else if (diffDays === 1) {
      return {
        backgroundColor: theme.colors.priorityMediumBg,
        textColor: 'priorityMedium' as const,
        label: 'Due Tomorrow',
        icon: <Clock size={12} color={theme.colors.priorityMedium} />,
      };
    } else {
      return {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        textColor: 'textSecondary' as const,
        label: dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        icon: <Calendar size={12} color={theme.colors.textSecondary} />,
      };
    }
  };

  const { backgroundColor, textColor, label, icon } = getDeadlineStyle();

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <View style={styles.content}>
        {icon}
        <Text variant="caption" fontWeight="semiBold" color={textColor} style={styles.text}>
          {label}
        </Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 3,
    borderRadius: theme.radius.sm, // Soft square radius
    alignSelf: 'flex-start',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  text: {
    letterSpacing: 0.2,
  },
});
