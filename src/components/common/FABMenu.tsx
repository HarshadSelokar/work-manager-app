import React, { useState, useCallback } from 'react';
import { StyleSheet, View, Pressable, Animated } from 'react-native';
import { Plus } from 'lucide-react-native';
import { theme } from '@theme/index';
import { Text } from './Text';

interface FABMenuOption {
  label: string;
  icon: React.ReactNode;
  onPress: () => void;
  color?: string;
}

interface FABMenuProps {
  options: FABMenuOption[];
}

export const FABMenu: React.FC<FABMenuProps> = ({ options }) => {
  const [isOpen, setIsOpen] = useState(false);
  const animation = React.useRef(new Animated.Value(0)).current;

  const toggleMenu = useCallback(() => {
    const toValue = isOpen ? 0 : 1;
    Animated.spring(animation, {
      toValue,
      tension: 85,
      friction: 7,
      useNativeDriver: true,
    }).start();
    setIsOpen(prev => !prev);
  }, [isOpen, animation]);

  const backdropOpacity = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.7],
  });

  const rotation = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg'],
  });

  const fabScale = animation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 0.92, 1],
  });

  return (
    <>
      {isOpen && (
        <Pressable style={StyleSheet.absoluteFill} onPress={toggleMenu}>
          <Animated.View style={[styles.backdropFill, { opacity: backdropOpacity }]} />
        </Pressable>
      )}

      <View style={styles.container}>
        {isOpen && (
          <View style={styles.menuContainer}>
            {options.map((opt, i) => {
              const itemOpacity = animation.interpolate({
                inputRange: [0, 0.4 + i * 0.1, 1],
                outputRange: [0, 0, 1],
              });
              const itemTranslateY = animation.interpolate({
                inputRange: [0, 1],
                outputRange: [20 * (options.length - i), 0],
              });
              const optBgColor = opt.color || theme.colors.elevated;

              return (
                <Animated.View
                  key={i}
                  style={[
                    styles.optionRow,
                    { opacity: itemOpacity, transform: [{ translateY: itemTranslateY }] },
                  ]}
                >
                  <Pressable
                    style={styles.labelContainer}
                    onPress={() => { toggleMenu(); opt.onPress(); }}
                  >
                    <Text variant="caption" fontWeight="semiBold" color="textPrimary">
                      {opt.label}
                    </Text>
                  </Pressable>
                  <Pressable
                    style={[styles.optionButton, { backgroundColor: optBgColor }]}
                    onPress={() => { toggleMenu(); opt.onPress(); }}
                  >
                    {opt.icon}
                  </Pressable>
                </Animated.View>
              );
            })}
          </View>
        )}

        <Animated.View style={{ transform: [{ scale: fabScale }] }}>
          <Pressable style={styles.fab} onPress={toggleMenu} android_ripple={{ color: 'rgba(255,255,255,0.15)', radius: 28 }}>
            <Animated.View style={{ transform: [{ rotate: rotation }] }}>
              <Plus size={24} color="#FFFFFF" strokeWidth={2.5} />
            </Animated.View>
          </Pressable>
        </Animated.View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  backdropFill: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#000000',
    zIndex: 99,
  },
  container: {
    position: 'absolute',
    bottom: 88,
    right: 20,
    alignItems: 'flex-end',
    zIndex: 100,
  },
  menuContainer: {
    marginBottom: 12,
    alignItems: 'flex-end',
    gap: 10,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  labelContainer: {
    backgroundColor: 'rgba(34, 34, 45, 0.96)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    ...theme.elevation.sm,
  },
  optionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    ...theme.elevation.md,
  },
  fab: {
    backgroundColor: theme.colors.primary,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.elevation.lg,
    borderWidth: 1,
    borderColor: 'rgba(124, 92, 252, 0.4)',
  },
});
