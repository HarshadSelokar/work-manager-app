import React from 'react';
import { StyleSheet, View, TouchableOpacity, ViewStyle } from 'react-native';
import { theme } from '@theme/index';
import { Text } from './Text';

interface EmptyStateProps {
  emoji?: string;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: ViewStyle;
}

export const EmptyState: React.FC<EmptyStateProps> = React.memo(
  ({ emoji = '📭', title, description, actionLabel, onAction, style }) => {
    return (
      <View style={[styles.container, style]}>
        <Text style={styles.emoji}>{emoji}</Text>
        <Text variant="titleMedium" color="textPrimary" align="center" style={styles.title}>
          {title}
        </Text>
        <Text variant="bodyMedium" color="textTertiary" align="center" style={styles.description}>
          {description}
        </Text>
        {actionLabel && onAction ? (
          <TouchableOpacity activeOpacity={0.7} style={styles.actionButton} onPress={onAction}>
            <Text variant="bodyMedium" fontWeight="semiBold" color="primary">
              {actionLabel}
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    paddingVertical: theme.spacing.xxl,
    paddingHorizontal: theme.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 48,
    marginBottom: theme.spacing.md,
  },
  title: {
    marginBottom: theme.spacing.xs,
  },
  description: {
    lineHeight: 20,
    marginBottom: theme.spacing.md,
  },
  actionButton: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.round,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryLight,
  },
});
