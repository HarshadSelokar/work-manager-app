import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, Animated, Pressable } from 'react-native';
import { theme } from '@theme/index';
import { Text } from './Text';

interface FABMenuOption {
  label: string;
  icon: string;
  onPress: () => void;
}

interface FABMenuProps {
  options: FABMenuOption[];
}

export const FABMenu: React.FC<FABMenuProps> = ({ options }) => {
  const [isOpen, setIsOpen] = useState(false);
  const animation = React.useRef(new Animated.Value(0)).current;

  const toggleMenu = () => {
    const toValue = isOpen ? 0 : 1;
    Animated.spring(animation, {
      toValue,
      friction: 6,
      useNativeDriver: true,
    }).start();
    setIsOpen(!isOpen);
  };

  const backdropOpacity = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.4],
  });

  const rotation = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '135deg'],
  });

  return (
    <>
      {isOpen && (
        <Pressable style={styles.backdrop} onPress={toggleMenu}>
          <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: '#000000', opacity: backdropOpacity }]} />
        </Pressable>
      )}
      
      <View style={styles.container}>
        {isOpen && (
          <View style={styles.menuContainer}>
            {options.map((opt, i) => {
              const translateY = animation.interpolate({
                inputRange: [0, 1],
                outputRange: [50 * (options.length - i), 0],
              });

              return (
                <Animated.View
                  key={i}
                  style={[
                    styles.optionRow,
                    {
                      transform: [{ translateY }],
                    },
                  ]}
                >
                  <View style={styles.labelContainer}>
                    <Text variant="caption" fontWeight="semiBold" style={styles.labelText}>
                      {opt.label}
                    </Text>
                  </View>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={styles.optionButton}
                    onPress={() => {
                      toggleMenu();
                      opt.onPress();
                    }}
                  >
                    <Text style={styles.optionIcon}>{opt.icon}</Text>
                  </TouchableOpacity>
                </Animated.View>
              );
            })}
          </View>
        )}

        <TouchableOpacity activeOpacity={0.9} style={styles.fab} onPress={toggleMenu}>
          <Animated.View style={[styles.fabIconWrapper, { transform: [{ rotate: rotation }] }]}>
            <Text style={styles.fabIcon}>+</Text>
          </Animated.View>
        </TouchableOpacity>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 99,
  },
  container: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    alignItems: 'flex-end',
    zIndex: 100,
  },
  menuContainer: {
    marginBottom: theme.spacing.sm,
    alignItems: 'flex-end',
    gap: theme.spacing.sm,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  labelContainer: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.radius.xs,
    ...theme.elevation.xs,
  },
  labelText: {
    color: theme.colors.textPrimary,
  },
  optionButton: {
    backgroundColor: theme.colors.surface,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.elevation.sm,
  },
  optionIcon: {
    fontSize: 16,
  },
  fab: {
    backgroundColor: theme.colors.primary,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.elevation.md,
  },
  fabIconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabIcon: {
    color: '#ffffff',
    fontSize: 28,
    lineHeight: 28,
    marginTop: -2,
    fontWeight: 'bold',
  },
});
