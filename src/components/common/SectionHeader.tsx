import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { theme } from '@theme/index';
import { Text } from './Text';

interface SectionHeaderProps {
  title: string;
  count?: number;
  accentColor?: string;
  style?: ViewStyle;
}

export const SectionHeader: React.FC<SectionHeaderProps> = React.memo(
  ({ title, count, accentColor, style }) => {
    return (
      <View style={[styles.container, style]}>
        {accentColor ? (
          <View style={[styles.accentDot, { backgroundColor: accentColor }]} />
        ) : null}
        <Text
          variant="overline"
          style={[styles.label, accentColor ? { color: accentColor } : null]}
        >
          {title}
        </Text>
        {count !== undefined ? (
          <View style={[styles.countBadge, accentColor ? { backgroundColor: accentColor + '18' } : null]}>
            <Text
              variant="caption"
              fontWeight="semiBold"
              style={accentColor ? { color: accentColor } : undefined}
              color={accentColor ? undefined : 'textTertiary'}
            >
              {count}
            </Text>
          </View>
        ) : null}
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
    gap: 6,
  },
  accentDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  label: {
    color: theme.colors.textTertiary,
  },
  countBadge: {
    backgroundColor: theme.colors.divider,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: theme.radius.round,
    marginLeft: 2,
  },
});
