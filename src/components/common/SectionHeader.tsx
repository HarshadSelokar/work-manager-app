import React from 'react';
import { StyleSheet, View } from 'react-native';
import { theme } from '@theme/index';
import { Text } from './Text';

interface SectionHeaderProps {
  title: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = React.memo(({ title }) => {
  return (
    <View style={styles.container}>
      <Text variant="bodySmall" fontWeight="bold" color="primary" style={styles.text}>
        {title.toUpperCase()}
      </Text>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.xs,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  text: {
    letterSpacing: 1,
  },
});
