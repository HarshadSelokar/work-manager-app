import React, { useState, useMemo, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  Modal,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@navigation/types';
import { AppContainer, Text, Button } from '@components/common';
import { NotesRepository } from '../repository/notes.repository';
import { WorksRepository } from '../repository/works.repository';
import { Note, Work, WorkStatus, WorkCategory, WorkPriority } from '@models/index';
import { theme } from '@theme/index';

type Props = NativeStackScreenProps<RootStackParamList, 'NoteDetails'>;

export const NoteDetailsScreen: React.FC<Props> = ({ route, navigation }) => {
  const { noteId } = route.params;
  const notesRepo = useMemo(() => new NotesRepository(), []);
  const worksRepo = useMemo(() => new WorksRepository(), []);
  const [note, setNote] = useState<Note | null>(null);

  // Fullscreen image preview modal
  const [previewImageUri, setPreviewImageUri] = useState<string | null>(null);

  useEffect(() => {
    try {
      const data = notesRepo.findById(noteId);
      setNote(data);
    } catch (err) {
      console.error('Failed to load note details:', err);
    }
  }, [noteId, notesRepo]);

  // 1. Delete Action
  const handleDelete = () => {
    Alert.alert(
      'Confirm Deletion',
      'Are you sure you want to permanently delete this quick note? Attached images will be cascade deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            try {
              notesRepo.delete(noteId);
              navigation.goBack();
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to delete note.');
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  // 2. Convert to Work Action
  const handleConvertToWork = () => {
    if (!note) {
      return;
    }

    Alert.alert(
      'Convert Note to Task',
      'Choose a routine category for the new task:',
      [
        {
          text: 'Today\'s Routine',
          onPress: () => performConversion(WorkCategory.TODAY),
        },
        {
          text: 'Backlog / Other',
          onPress: () => performConversion(WorkCategory.OTHER),
        },
        { text: 'Cancel', style: 'cancel' },
      ],
      { cancelable: true }
    );
  };

  const performConversion = (targetCategory: WorkCategory) => {
    if (!note) {
      return;
    }

    // Prefill fields
    const newWorkId = 'work-' + Math.random().toString(36).substring(2, 15);
    const convertedTitle = note.title ? note.title.trim() : note.content.trim().substring(0, 40) + '...';
    const convertedRef = 'REF-N-' + Math.random().toString(36).substring(2, 6).toUpperCase();

    const newWork: Work = {
      id: newWorkId,
      title: convertedTitle,
      reference: convertedRef,
      description: note.content,
      priority: WorkPriority.MEDIUM,
      category: targetCategory,
      status: WorkStatus.TODO,
      createdAt: new Date(),
      updatedAt: new Date(),
      // Map note images directly to new work images
      images: note.images.map(img => ({
        id: 'img-' + Math.random().toString(36).substring(2, 9),
        workId: newWorkId,
        imagePath: img.imagePath,
      })),
      links: [],
    };

    try {
      // Create new work task in db
      worksRepo.create(newWork);
      // Delete the note (which cascades to delete note_images)
      notesRepo.delete(note.id);

      Alert.alert(
        'Success',
        `Scribble successfully converted to task: "${convertedTitle}"!`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error: any) {
      Alert.alert('Conversion Failed', error.message || 'Failed to convert note to task.');
    }
  };

  if (!note) {
    return (
      <AppContainer style={styles.errorContainer}>
        <Text variant="h2" color="danger" style={styles.errorText}>
          Scribble Not Found
        </Text>
        <Button title="Go Back" variant="secondary" onPress={() => navigation.goBack()} />
      </AppContainer>
    );
  }

  return (
    <AppContainer>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.headerBlock}>
          <Text variant="h1" color="primary" style={styles.title}>
            {note.title || 'Untitled Scribble'}
          </Text>
          <Text variant="caption" color="textTertiary" style={styles.dateText}>
            Written: {note.createdAt.toLocaleString()}
          </Text>
        </View>

        <View style={styles.divider} />

        {/* Content Block */}
        <View style={styles.contentBlock}>
          <Text variant="bodyLarge" style={styles.contentText}>
            {note.content}
          </Text>
        </View>

        {/* Attachments Section */}
        {note.images && note.images.length > 0 ? (
          <View style={styles.sectionBlock}>
            <Text variant="caption" color="textTertiary" fontWeight="bold" style={styles.sectionTitle}>
              ATTACHED IMAGES ({note.images.length})
            </Text>
            <View style={styles.imagesGrid}>
              {note.images.map(img => (
                <TouchableOpacity
                  key={img.id}
                  style={styles.imageCard}
                  onPress={() => setPreviewImageUri(img.imagePath)}
                >
                  <Image source={{ uri: img.imagePath }} style={styles.gridImage} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ) : null}

        {/* Bottom Actions Menu */}
        <View style={styles.divider} />
        <View style={styles.actionsMenu}>
          <Button title="🔄 Convert to Routine Work" variant="primary" onPress={handleConvertToWork} />
          <Button title="🗑️ Delete Scribble" variant="danger" onPress={handleDelete} />
          <Button title="Go Back" variant="secondary" onPress={() => navigation.goBack()} />
        </View>
      </ScrollView>

      {/* Fullscreen Image Preview Modal */}
      <Modal visible={previewImageUri !== null} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalCloseButton} onPress={() => setPreviewImageUri(null)}>
            <Text fontWeight="bold" style={{ color: '#ffffff', fontSize: 18 }}>
              ✕ Close Preview
            </Text>
          </TouchableOpacity>
          {previewImageUri ? (
            <Image source={{ uri: previewImageUri }} style={styles.fullscreenImage} resizeMode="contain" />
          ) : null}
        </View>
      </Modal>
    </AppContainer>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.xxl,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
  },
  errorText: {
    marginBottom: theme.spacing.md,
  },
  headerBlock: {
    marginBottom: theme.spacing.sm,
  },
  title: {
    lineHeight: 34,
    marginBottom: 4,
  },
  dateText: {
    fontStyle: 'italic',
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: theme.spacing.md,
  },
  contentBlock: {
    backgroundColor: theme.colors.card,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: theme.radius.sm,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  contentText: {
    lineHeight: 24,
  },
  sectionBlock: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    marginBottom: theme.spacing.xs,
    letterSpacing: 0.5,
  },
  imagesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  imageCard: {
    width: '31%',
    aspectRatio: 1,
    borderRadius: theme.radius.sm,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.card,
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
  actionsMenu: {
    gap: theme.spacing.md,
    marginTop: theme.spacing.sm,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  modalCloseButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.sm,
    zIndex: 10,
  },
  fullscreenImage: {
    width: '90%',
    height: '80%',
  },
});
