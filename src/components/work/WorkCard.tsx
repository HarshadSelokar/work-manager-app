import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Work, WorkStatus } from '@models/work.model';
import { theme } from '@theme/index';
import { Text, PriorityBadge, DeadlineChip } from '@components/common';

interface WorkCardProps {
  work: Work;
  onPress: (id: string) => void;
}

export const WorkCard: React.FC<WorkCardProps> = React.memo(({ work, onPress }) => {
  const getStatusColor = (): keyof typeof theme.colors => {
    switch (work.status) {
      case WorkStatus.COMPLETED:
        return 'success';
      case WorkStatus.IN_PROGRESS:
        return 'info';
      case WorkStatus.TODO:
      default:
        return 'textSecondary';
    }
  };

  const handlePress = () => {
    onPress(work.id);
  };

  return (
    <TouchableOpacity activeOpacity={0.7} onPress={handlePress} style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleCol}>
          <Text variant="bodyLarge" fontWeight="bold" style={styles.title} numberOfLines={1}>
            {work.title}
          </Text>
          {work.reference ? (
            <Text variant="caption" color="textSecondary" style={styles.refText}>
              #{work.reference}
            </Text>
          ) : null}
        </View>
        <PriorityBadge priority={work.priority} />
      </View>

      {work.description ? (
        <Text
          variant="bodyMedium"
          color="textSecondary"
          style={styles.description}
          numberOfLines={2}
        >
          {work.description}
        </Text>
      ) : null}

      {work.deadline ? (
        <View style={styles.metaRow}>
          <DeadlineChip deadline={work.deadline} />
        </View>
      ) : null}

      <View style={styles.footer}>
        <View style={styles.statusRow}>
          <View
            style={[styles.statusDot, { backgroundColor: theme.colors[getStatusColor()] }]}
          />
          <Text variant="bodySmall" color={getStatusColor()} fontWeight="medium">
            {work.status.replace('_', ' ').toUpperCase()}
          </Text>
        </View>
        <Text variant="caption" color="textTertiary">
          {work.createdAt.toLocaleDateString()}
        </Text>
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    ...theme.elevation.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  titleCol: {
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  title: {
    marginBottom: 2,
  },
  refText: {
    fontStyle: 'italic',
  },
  description: {
    marginBottom: theme.spacing.md,
    lineHeight: 20,
  },
  metaRow: {
    marginBottom: theme.spacing.md,
    flexDirection: 'row',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: theme.spacing.sm,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: theme.spacing.xs,
  },
});
