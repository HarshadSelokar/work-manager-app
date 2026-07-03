import React, { useState, useMemo, useCallback } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@navigation/types';
import { AppContainer, Text, Button } from '@components/common';
import { NotesRepository } from '../repository/notes.repository';
import { Note } from '@models/index';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { theme } from '@theme/index';

type Props = NativeStackScreenProps<RootStackParamList, 'AddNote'>;

export const AddNoteScreen: React.FC<Props> = ({ navigation }) => {
  const notesRepo = useMemo(() => new NotesRepository(), []);

  // Form States
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [images, setImages] = useState<{ id: string; imagePath: string }[]>([]);

  // 1. Camera/Gallery Picker
  const handleSelectImage = useCallback((source: 'camera' | 'gallery') => {
    const options = {
      mediaType: 'photo' as const,
      quality: 0.8,
      saveToPhotos: true,
    };

    const callback = (response: any) => {
      if (response.didCancel) {
        return;
      }
      if (response.errorMessage) {
        Alert.alert('Error', response.errorMessage);
        return;
      }
      if (response.assets && response.assets.length > 0) {
        const asset = response.assets[0];
        if (asset.uri) {
          const newImg = {
            id: 'note-img-' + Math.random().toString(36).substring(2, 9),
            imagePath: asset.uri,
          };
          setImages(prev => [...prev, newImg]);
        }
      }
    };

    if (source === 'camera') {
      launchCamera(options as any, callback);
    } else {
      launchImageLibrary(options as any, callback);
    }
  }, []);

  const handleRemoveImage = useCallback((id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
  }, []);

  // 2. Save Action
  const handleSave = useCallback(() => {
    if (!content.trim()) {
      Alert.alert('Validation', 'Note content is required.');
      return;
    }

    const newNoteId = 'note-' + Math.random().toString(36).substring(2, 15);
    const newNote: Note = {
      id: newNoteId,
      title: title.trim() || undefined,
      content: content.trim(),
      createdAt: new Date(),
      updatedAt: new Date(),
      images: images.map(img => ({
        id: img.id,
        noteId: newNoteId,
        imagePath: img.imagePath,
      })),
    };

    try {
      notesRepo.create(newNote);
      Alert.alert('Success', 'Note saved successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save note.');
    }
  }, [title, content, images, notesRepo, navigation]);

  return (
    <AppContainer>
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <Text variant="h1" color="primary" style={styles.header}>
          New Quick Scribble
        </Text>

        {/* Title Input */}
        <View style={styles.inputGroup}>
          <Text variant="bodyMedium" fontWeight="semiBold" style={styles.label}>
            Note Title (Optional)
          </Text>
          <TextInput
            style={styles.textInput}
            placeholder="Jot down a title..."
            placeholderTextColor={theme.colors.textTertiary}
            value={title}
            onChangeText={setTitle}
          />
        </View>

        {/* Content Input */}
        <View style={styles.inputGroup}>
          <Text variant="bodyMedium" fontWeight="semiBold" style={styles.label}>
            Scribble Content *
          </Text>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            placeholder="What's on your mind? Scribble something..."
            placeholderTextColor={theme.colors.textTertiary}
            multiline
            numberOfLines={6}
            value={content}
            onChangeText={setContent}
          />
        </View>

        {/* Image Attachments */}
        <View style={styles.sectionDivider} />
        <Text variant="h3" color="primary" style={styles.sectionHeader}>
          Note Images
        </Text>

        <View style={styles.imageSelectorRow}>
          <TouchableOpacity
            style={styles.imageActionButton}
            onPress={() => handleSelectImage('camera')}
          >
            <Text color="primary" fontWeight="bold">
              📷 Use Camera
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.imageActionButton}
            onPress={() => handleSelectImage('gallery')}
          >
            <Text color="primary" fontWeight="bold">
              🖼 Open Gallery
            </Text>
          </TouchableOpacity>
        </View>

        {images.length > 0 ? (
          <ScrollView horizontal style={styles.imageList} contentContainerStyle={styles.imageContent}>
            {images.map(img => (
              <View key={img.id} style={styles.imageWrapper}>
                <Image source={{ uri: img.imagePath }} style={styles.previewImage} />
                <TouchableOpacity
                  style={styles.deleteImageBadge}
                  onPress={() => handleRemoveImage(img.id)}
                >
                  <Text variant="caption" fontWeight="bold" style={{ color: '#ffffff' }}>
                    ✕
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        ) : null}

        {/* Action Buttons */}
        <View style={styles.sectionDivider} />
        <View style={styles.actionRow}>
          <Button title="Save Note" variant="primary" onPress={handleSave} style={styles.actionBtn} />
          <Button
            title="Cancel"
            variant="secondary"
            onPress={() => navigation.goBack()}
            style={styles.actionBtn}
          />
        </View>
      </ScrollView>
    </AppContainer>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.xxl,
  },
  header: {
    marginBottom: theme.spacing.lg,
  },
  inputGroup: {
    marginBottom: theme.spacing.md,
  },
  label: {
    marginBottom: theme.spacing.xs,
  },
  textInput: {
    backgroundColor: theme.colors.card,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: theme.radius.sm,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    color: theme.colors.textPrimary,
    fontSize: 15,
  },
  textArea: {
    height: 140,
    textAlignVertical: 'top',
  },
  sectionDivider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: theme.spacing.lg,
  },
  sectionHeader: {
    marginBottom: theme.spacing.sm,
  },
  imageSelectorRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  imageActionButton: {
    flex: 1,
    backgroundColor: theme.colors.card,
    borderColor: theme.colors.primary,
    borderWidth: 1.5,
    borderRadius: theme.radius.sm,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageList: {
    marginVertical: theme.spacing.sm,
  },
  imageContent: {
    gap: theme.spacing.sm,
  },
  imageWrapper: {
    position: 'relative',
  },
  previewImage: {
    width: 90,
    height: 90,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.border,
  },
  deleteImageBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: theme.colors.danger,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  actionBtn: {
    flex: 1,
  },
});
