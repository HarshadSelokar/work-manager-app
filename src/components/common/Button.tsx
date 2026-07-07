import React, { useRef } from 'react';
import { StyleSheet, TouchableOpacity, ViewStyle, Animated, View } from 'react-native';
import { theme } from '@theme/index';
import { Text } from './Text';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'outlined' | 'ghost';
  style?: ViewStyle;
  disabled?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  style,
  disabled = false,
  icon,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (disabled) return;
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      tension: 100,
      friction: 6,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    if (disabled) return;
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 100,
      friction: 6,
      useNativeDriver: true,
    }).start();
  };

  const getButtonStyles = (): ViewStyle => {
    switch (variant) {
      case 'secondary':
        return {
          backgroundColor: 'rgba(124, 92, 252, 0.1)', // Light brand translucent fill
          borderWidth: 1,
          borderColor: theme.colors.primary,
        };
      case 'outlined':
        return {
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: theme.colors.border,
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
        };
      case 'danger':
        return {
          backgroundColor: theme.colors.danger,
        };
      case 'primary':
      default:
        return {
          backgroundColor: theme.colors.primary,
        };
    }
  };

  const getTextColor = (): keyof typeof theme.colors => {
    switch (variant) {
      case 'secondary':
        return 'primary';
      case 'outlined':
        return 'textPrimary';
      case 'ghost':
        return 'textSecondary';
      case 'danger':
      case 'primary':
      default:
        return 'textLight';
    }
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        style={[
          styles.button,
          getButtonStyles(),
          disabled && styles.disabledButton,
          style,
        ]}
      >
        <View style={styles.contentContainer}>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
          <Text
            variant="bodyLarge"
            fontWeight="semiBold"
            color={getTextColor()}
            style={disabled ? styles.disabledText : undefined}
          >
            {title}
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: theme.spacing.sm + 4,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: theme.spacing.sm,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginRight: theme.spacing.xs + 2,
  },
  disabledButton: {
    backgroundColor: '#1E1E28',
    borderColor: '#1E1E28',
    opacity: 0.5,
  },
  disabledText: {
    color: theme.colors.textTertiary,
  },
});
