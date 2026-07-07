import React, { useState } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, ViewStyle } from 'react-native';
import { Search, X } from 'lucide-react-native';
import { theme } from '@theme/index';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onFocus?: () => void;
  onBlur?: () => void;
  autoFocus?: boolean;
  style?: ViewStyle;
}

export const SearchBar: React.FC<SearchBarProps> = React.memo(
  ({ value, onChangeText, placeholder = 'Search tasks, references...', onFocus, onBlur, autoFocus, style }) => {
    const [isFocused, setIsFocused] = useState(false);

    const handleFocus = () => {
      setIsFocused(true);
      if (onFocus) onFocus();
    };

    const handleBlur = () => {
      setIsFocused(false);
      if (onBlur) onBlur();
    };

    return (
      <View
        style={[
          styles.container,
          isFocused && styles.containerFocused,
          style,
        ]}
      >
        <Search
          size={18}
          color={isFocused ? theme.colors.primary : theme.colors.textTertiary}
          style={styles.icon}
        />
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textTertiary}
          autoFocus={autoFocus}
          onFocus={handleFocus}
          onBlur={handleBlur}
          returnKeyType="search"
          autoCapitalize="none"
        />
        {value.length > 0 ? (
          <TouchableOpacity
            onPress={() => onChangeText('')}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={styles.clearButton}
          >
            <X size={16} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        ) : null}
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card, // Dark card background
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.md,
    height: 46,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  containerFocused: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.surface, // Shifts color slightly
  },
  icon: {
    marginRight: theme.spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.textPrimary,
    paddingVertical: 0,
  },
  clearButton: {
    marginLeft: theme.spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
    width: 24,
    height: 24,
    borderRadius: theme.radius.round,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
});
