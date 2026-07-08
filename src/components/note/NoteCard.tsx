import React from 'react';
import { StyleSheet, Pressable, View } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { Image as ImageIcon, BookOpen } from 'lucide-react-native';
import { Note } from '@models/note.model';
import { theme } from '@theme/index';
import { Text } from '@components/common';

interface NoteCardProps {
  note: Note;
  onPress: (id: string) => void;
}

// Subtle tinted backgrounds for visual variety
const NOTE_TINTS = [
  'rgba(124, 92, 252, 0.06)',
  'rgba(0, 240, 255, 0.05)',
  'rgba(16, 185, 129, 0.05)',
  'rgba(245, 158, 11, 0.05)',
  'rgba(239, 68, 68, 0.05)',
];

function getNoteTint(id: string): string {
  const sum = id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return NOTE_TINTS[sum % NOTE_TINTS.length];
}

export const NoteCard: React.FC<NoteCardProps> = React.memo(({ note, onPress }) => {
  const scale = useSharedValue(1);

  const handlePress = () => onPress(note.id);
  const handlePressIn = () => { scale.value = withSpring(0.96, { damping: 15, stiffness: 300 }); };
  const handlePressOut = () => { scale.value = withSpring(1, { damping: 15, stiffness: 300 }); };

  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const imageCount = note.images ? note.images.length : (note.imageCount || 0);
  const tint = getNoteTint(note.id);

  return (
    <Pressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={styles.pressable}
    >
      <Animated.View style={[styles.card, { backgroundColor: tint }, animatedStyle]}>
        {note.title ? (
          <Text variant="titleMedium" fontWeight="semiBold" style={styles.title} numberOfLines={2}>
            {note.title}
          </Text>
        ) : null}
        <Text variant="bodySmall" color="textSecondary" numberOfLines={7} style={styles.content}>
          {note.content}
        </Text>
        <View style={styles.footer}>
          <View style={styles.footerLeft}>
            <BookOpen size={10} color={theme.colors.textTertiary} />
            <Text variant="caption" color="textTertiary" style={styles.date}>
              {note.createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </Text>
          </View>
          {imageCount > 0 ? (
            <View style={styles.imageBadge}>
              <ImageIcon size={10} color={theme.colors.primary} />
              <Text variant="caption" color="primary" style={styles.imageCount} fontWeight="semiBold">
                {imageCount}
              </Text>
            </View>
          ) : null}
        </View>
      </Animated.View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  pressable: {
    flex: 1,
    margin: 6,
  },
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    flex: 1,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.elevation.sm,
    justifyContent: 'space-between',
    minHeight: 120,
  },
  title: {
    color: theme.colors.textPrimary,
    marginBottom: 4,
    lineHeight: 20,
  },
  content: {
    lineHeight: 17,
    flex: 1,
    marginBottom: theme.spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: theme.spacing.xs,
    borderTopWidth: 1,
    borderTopColor: theme.colors.divider,
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  date: {
    fontSize: 10,
  },
  imageBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: theme.colors.primaryLight,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: theme.radius.round,
  },
  imageCount: {
    fontSize: 10,
  },
});
