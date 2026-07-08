import React from 'react';
import { StyleSheet, View } from 'react-native';
import { WorkStatus } from '@models/work.model';
import { theme } from '@theme/index';
import { Text } from './Text';
import { CheckCircle2, Clock, Circle } from 'lucide-react-native';

interface StatusChipProps {
  status: WorkStatus;
  size?: 'sm' | 'md';
}

const STATUS_CONFIG = {
  [WorkStatus.COMPLETED]: {
    color: theme.colors.success,
    bg: theme.colors.successBg,
    label: 'Done',
    Icon: CheckCircle2,
  },
  [WorkStatus.IN_PROGRESS]: {
    color: theme.colors.info,
    bg: theme.colors.infoBg,
    label: 'In Progress',
    Icon: Clock,
  },
  [WorkStatus.TODO]: {
    color: theme.colors.textSecondary,
    bg: 'rgba(163, 163, 178, 0.1)',
    label: 'To Do',
    Icon: Circle,
  },
};

export const StatusChip: React.FC<StatusChipProps> = React.memo(({ status, size = 'sm' }) => {
  const config = STATUS_CONFIG[status];
  const isSmall = size === 'sm';

  return (
    <View style={[styles.chip, { backgroundColor: config.bg }, isSmall && styles.chipSm]}>
      <config.Icon size={isSmall ? 10 : 12} color={config.color} strokeWidth={2.5} />
      <Text
        variant="caption"
        fontWeight="semiBold"
        style={[styles.label, { color: config.color }]}
      >
        {config.label}
      </Text>
    </View>
  );
});

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: theme.radius.round,
    gap: 4,
    alignSelf: 'flex-start',
  },
  chipSm: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  label: {
    letterSpacing: 0.3,
  },
});
