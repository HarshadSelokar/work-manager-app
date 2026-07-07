import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { theme } from '@theme/index';

interface ProgressRingProps {
  progress: number; // Value between 0 and 1
  size?: number;
  strokeWidth?: number;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  progress,
  size = 70,
  strokeWidth = 7,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  
  // Bound progress between 0 and 1
  const cleanProgress = Math.min(Math.max(progress, 0), 1);
  const strokeDashoffset = circumference - cleanProgress * circumference;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} style={styles.svg}>
        {/* Background Circle Track */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#2B2B35" // Accent border matching
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Foreground Circle Progress */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={theme.colors.primary}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  svg: {
    transform: [{ scaleX: 1 }],
  },
});
