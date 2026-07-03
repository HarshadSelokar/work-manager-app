import React from 'react';
import { StyleSheet, ActivityIndicator, View } from 'react-native';
import { theme } from '@theme/index';
import { Text } from './Text';

interface LoadingViewProps {
  message?: string;
}

export const LoadingView: React.FC<LoadingViewProps> = React.memo(({ message = 'Loading...' }) => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
      {message ? (
        <Text variant="bodyMedium" color="textSecondary" style={styles.message}>
          {message}
        </Text>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
  },
  message: {
    marginTop: theme.spacing.sm,
  },
});
