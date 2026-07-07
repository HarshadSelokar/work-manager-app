import React from 'react';
import { StyleSheet, View, ViewStyle, Dimensions } from 'react-native';
import { theme } from '@theme/index';

interface GradientBackgroundProps {
  children?: React.ReactNode;
  style?: ViewStyle;
}

const { width, height } = Dimensions.get('window');

export const GradientBackground: React.FC<GradientBackgroundProps> = ({ children, style }) => {
  return (
    <View style={[styles.container, style]}>
      {/* Glowing ambient light orbs */}
      <View style={[styles.orb, styles.purpleOrb]} />
      <View style={[styles.orb, styles.blueOrb]} />
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    overflow: 'hidden',
  },
  orb: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.08, // Very subtle, clean ambient glow
  },
  purpleOrb: {
    width: width * 1.0,
    height: width * 1.0,
    backgroundColor: theme.colors.primary,
    top: -width * 0.4,
    left: -width * 0.3,
  },
  blueOrb: {
    width: width * 0.8,
    height: width * 0.8,
    backgroundColor: theme.colors.secondary,
    bottom: height * 0.1,
    right: -width * 0.3,
  },
});
