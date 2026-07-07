import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { Text } from './Text';

interface MetadataItem {
  icon: string | React.ReactNode;
  value: string | number;
}

interface MetadataRowProps {
  items: MetadataItem[];
  style?: ViewStyle;
}

export const MetadataRow: React.FC<MetadataRowProps> = React.memo(
  ({ items, style }) => {
    if (items.length === 0) {
      return null;
    }

    return (
      <View style={[styles.row, style]}>
        {items.map((item, index) => (
          <View key={index} style={styles.item}>
            {index > 0 ? (
              <Text variant="caption" color="textTertiary" style={styles.separator}>
                ·
              </Text>
            ) : null}
            <View style={styles.itemContent}>
              {typeof item.icon === 'string' ? (
                <Text variant="caption" color="textSecondary">
                  {item.icon}
                </Text>
              ) : (
                item.icon
              )}
              <Text variant="caption" color="textSecondary" style={styles.valueText}>
                {item.value}
              </Text>
            </View>
          </View>
        ))}
      </View>
    );
  }
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  valueText: {
    // Spacer between icon and text value
  },
  separator: {
    marginHorizontal: 6,
  },
});
