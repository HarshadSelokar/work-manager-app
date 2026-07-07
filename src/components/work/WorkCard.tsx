import React from 'react';
import { StyleSheet, Pressable, View } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { Image as ImageIcon, Link2 } from 'lucide-react-native';
import { Work } from '@models/work.model';
import { theme } from '@theme/index';
import { Text, PriorityBadge, DeadlineChip, MetadataRow } from '@components/common';

interface WorkCardProps {
  work: Work;
  onPress: (id: string) => void;
}

const PRIORITY_STRIP_COLORS = {
  low: theme.colors.priorityLow,
  medium: theme.colors.priorityMedium,
  high: theme.colors.priorityHigh,
};

export const WorkCard: React.FC<WorkCardProps> = React.memo(({ work, onPress }) => {
  const scale = useSharedValue(1);

  const handlePress = () => {
    onPress(work.id);
  };

  const handlePressIn = () => {
    scale.value = withSpring(0.96, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const stripColor = PRIORITY_STRIP_COLORS[work.priority] || theme.colors.border;

  // Build metadata items using Lucide icons
  const metaItems = [];
  if (work.images && work.images.length > 0) {
    metaItems.push({
      icon: <ImageIcon size={12} color={theme.colors.textSecondary} />,
      value: work.images.length,
    });
  }
  if (work.links && work.links.length > 0) {
    metaItems.push({
      icon: <Link2 size={12} color={theme.colors.textSecondary} />,
      value: work.links.length,
    });
  }

  return (
    <Pressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={styles.pressable}
    >
      <Animated.View style={[styles.card, animatedStyle]}>
        {/* Priority Color Left Indicator Strip */}
        <View style={[styles.priorityStrip, { backgroundColor: stripColor }]} />

        <View style={styles.contentContainer}>
          <View style={styles.header}>
            <View style={styles.titleCol}>
              <Text variant="titleMedium" fontWeight="bold" style={styles.title} numberOfLines={1}>
                {work.title}
              </Text>
              {work.reference ? (
                <Text variant="caption" color="textSecondary" style={styles.refText}>
                  #{work.reference}
                </Text>
              ) : null}
            </View>
            <PriorityBadge priority={work.priority} />
          </View>

          {/* Dynamic Metadata / Deadline Footer */}
          {(work.deadline || metaItems.length > 0) && (
            <View style={styles.metaRow}>
              {work.deadline ? (
                <DeadlineChip deadline={work.deadline} />
              ) : null}
              <MetadataRow items={metaItems} style={styles.attachments} />
            </View>
          )}
        </View>
      </Animated.View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  pressable: {
    marginBottom: theme.spacing.md,
  },
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.md,
    ...theme.elevation.sm,
    flexDirection: 'row',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  priorityStrip: {
    width: 4,
    height: '100%',
  },
  contentContainer: {
    flex: 1,
    padding: theme.spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.xs,
  },
  titleCol: {
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  title: {
    color: theme.colors.textPrimary,
  },
  refText: {
    fontStyle: 'italic',
    marginTop: 1,
  },
  metaRow: {
    marginTop: theme.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  attachments: {
    marginLeft: 'auto',
  },
});
