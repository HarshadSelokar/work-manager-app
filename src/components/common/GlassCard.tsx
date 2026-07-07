import React from 'react';
import { StyleSheet, View, ViewStyle, StyleProp } from 'react-native';
import { theme } from '@theme/index';

interface GlassCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  elevation?: keyof typeof theme.elevation;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, style, elevation = 'xs' }) => {
  return (
    <View style={[styles.card, theme.elevation[elevation], style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(26, 26, 34, 0.75)',
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: 'rgba(43, 43, 53, 0.6)',
    padding: theme.spacing.md,
  },
});
