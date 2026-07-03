import React from 'react';
import { StyleSheet, View } from 'react-native';
import { theme } from '@theme/index';
import { Text } from './Text';

interface EmptyStateProps {
  title: string;
  description: string;
}

export const EmptyState: React.FC<EmptyStateProps> = React.memo(({ title, description }) => {
  return (
    <View style={styles.container}>
      <Text variant="h3" color="textSecondary" align="center" style={styles.title}>
        {title}
      </Text>
      <Text variant="bodyMedium" color="textTertiary" align="center" style={styles.description}>
        {description}
      </Text>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: theme.spacing.xxl,
  },
  title: {
    marginBottom: theme.spacing.xs,
  },
  description: {
    lineHeight: 20,
  },
});
