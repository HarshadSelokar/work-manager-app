import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, Animated, Pressable } from 'react-native';
import { Plus } from 'lucide-react-native';
import { theme } from '@theme/index';
import { Text } from './Text';

interface FABMenuOption {
  label: string;
  icon: string | React.ReactNode;
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
      tension: 90,
      friction: 8,
      useNativeDriver: true,
    }).start();
    setIsOpen(!isOpen);
  };

  const backdropOpacity = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.65],
  });

  const rotation = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg'], // Rotates Plus into an X
  });

  const menuScale = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 1],
  });

  return (
    <>
      {isOpen && (
        <Pressable style={styles.backdrop} onPress={toggleMenu}>
          <Animated.View style={[styles.backdropFill, { opacity: backdropOpacity }]} />
        </Pressable>
      )}
      
      <View style={styles.container}>
        {isOpen && (
          <Animated.View style={[styles.menuContainer, { transform: [{ scale: menuScale }] }]}>
            {options.map((opt, i) => {
              const translateY = animation.interpolate({
                inputRange: [0, 1],
                outputRange: [30 * (options.length - i), 0],
              });

              const optionOpacity = animation.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 1],
              });

              return (
                <Animated.View
                  key={i}
                  style={[
                    styles.optionRow,
                    {
                      opacity: optionOpacity,
                      transform: [{ translateY }],
                    },
                  ]}
                >
                  <View style={styles.labelContainer}>
                    <Text variant="caption" fontWeight="semiBold" color="textPrimary">
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
                    {typeof opt.icon === 'string' ? (
                      <Text style={styles.optionIconText}>{opt.icon}</Text>
                    ) : (
                      opt.icon
                    )}
                  </TouchableOpacity>
                </Animated.View>
              );
            })}
          </Animated.View>
        )}

        <TouchableOpacity activeOpacity={0.9} style={styles.fab} onPress={toggleMenu}>
          <Animated.View style={{ transform: [{ rotate: rotation }] }}>
            <Plus size={24} color="#FFFFFF" strokeWidth={2.5} />
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
  backdropFill: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#000000',
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
    backgroundColor: '#1E1E28', // Elevated dark surface
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 5,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  optionButton: {
    backgroundColor: '#1E1E28',
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 2,
  },
  optionIconText: {
    fontSize: 16,
  },
  fab: {
    backgroundColor: theme.colors.primary, // Electric Purple
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 5,
  },
});
