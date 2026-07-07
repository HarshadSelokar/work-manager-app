import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { theme } from '@theme/index';
import { Text } from './Text';
import { Button } from './Button';

interface EmptyStateProps {
  emoji?: string; // Kept for backward compatibility
  icon?: React.ReactNode; // Modern Lucide Icon
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: ViewStyle;
}

export const EmptyState: React.FC<EmptyStateProps> = React.memo(
  ({ emoji, icon, title, description, actionLabel, onAction, style }) => {
    return (
      <View style={[styles.container, style]}>
        <View style={styles.iconWrapper}>
          {icon ? (
            icon
          ) : emoji ? (
            <Text style={styles.emoji}>{emoji}</Text>
          ) : (
            <Text style={styles.emoji}>📂</Text>
          )}
        </View>
        <Text variant="titleLarge" color="textPrimary" align="center" style={styles.title}>
          {title}
        </Text>
        <Text variant="bodyMedium" color="textSecondary" align="center" style={styles.description}>
          {description}
        </Text>
        {actionLabel && onAction ? (
          <Button
            title={actionLabel}
            onPress={onAction}
            variant="secondary"
            style={styles.actionButton}
          />
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
  iconWrapper: {
    marginBottom: theme.spacing.md,
    opacity: 0.8,
  },
  emoji: {
    fontSize: 48,
  },
  title: {
    marginBottom: theme.spacing.xs,
    letterSpacing: -0.2,
  },
  description: {
    lineHeight: 19,
    marginBottom: theme.spacing.lg,
    maxWidth: 280,
  },
  actionButton: {
    minWidth: 140,
    marginTop: theme.spacing.sm,
  },
});
