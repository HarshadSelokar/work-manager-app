import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Note } from '@models/note.model';
import { theme } from '@theme/index';
import { Text } from '@components/common';

interface NoteCardProps {
  note: Note;
  onPress: (id: string) => void;
}

export const NoteCard: React.FC<NoteCardProps> = React.memo(({ note, onPress }) => {
  const handlePress = () => {
    onPress(note.id);
  };

  const imageCount = note.images ? note.images.length : (note.imageCount || 0);

  return (
    <TouchableOpacity activeOpacity={0.7} onPress={handlePress} style={styles.card}>
      <View style={styles.header}>
        <Text variant="titleMedium" fontWeight="bold" style={styles.title} numberOfLines={2}>
          {note.title || 'Untitled Note'}
        </Text>
      </View>
      <Text variant="bodyMedium" color="textSecondary" numberOfLines={6} style={styles.content}>
        {note.content}
      </Text>
      
      <View style={styles.footer}>
        <Text variant="caption" color="textTertiary">
          {note.createdAt.toLocaleDateString()}
        </Text>
        {imageCount > 0 ? (
          <View style={styles.attachmentBadge}>
            <Text variant="caption" color="primary" fontWeight="semiBold">
              📷 {imageCount}
            </Text>
          </View>
        ) : null}
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    flex: 1,
    margin: 6,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.elevation.sm,
    justifyContent: 'space-between',
    minHeight: 120,
  },
  header: {
    marginBottom: theme.spacing.xs,
  },
  title: {
    color: theme.colors.textPrimary,
  },
  content: {
    lineHeight: 18,
    marginBottom: theme.spacing.md,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: theme.spacing.xs,
    borderTopWidth: 1,
    borderTopColor: theme.colors.divider,
  },
  attachmentBadge: {
    backgroundColor: theme.colors.primaryLight,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: theme.radius.round,
  },
});
