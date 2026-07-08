import React, { useState, useMemo, useCallback } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TextInput,
  Alert,
  Image,
  Pressable,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@navigation/types';
import { AppContainer, Text, Button, Divider } from '@components/common';
import { NotesRepository } from '../repository/notes.repository';
import { Note } from '@models/index';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { theme } from '@theme/index';
import { ArrowLeft, Save, Camera, Image as ImageIcon, Trash2, FileText } from 'lucide-react-native';

type Props = NativeStackScreenProps<RootStackParamList, 'AddNote'>;

export const AddNoteScreen: React.FC<Props> = ({ navigation }) => {
  const notesRepo = useMemo(() => new NotesRepository(), []);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [images, setImages] = useState<{ id: string; imagePath: string }[]>([]);

  const handleSelectImage = useCallback((source: 'camera' | 'gallery') => {
    const options = { mediaType: 'photo' as const, quality: 0.8, saveToPhotos: true };
    const callback = (response: any) => {
      if (response.didCancel) return;
      if (response.errorMessage) { Alert.alert('Error', response.errorMessage); return; }
      if (response.assets && response.assets.length > 0 && response.assets[0].uri) {
        setImages(prev => [...prev, {
          id: 'note-img-' + Math.random().toString(36).substring(2, 9),
          imagePath: response.assets[0].uri,
        }]);
      }
    };
    if (source === 'camera') { launchCamera(options as any, callback); }
    else { launchImageLibrary(options as any, callback); }
  }, []);

  const handleRemoveImage = useCallback((id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
  }, []);

  const handleSave = useCallback(() => {
    if (!content.trim()) { Alert.alert('Validation', 'Note content cannot be empty.'); return; }

    const newNoteId = 'note-' + Math.random().toString(36).substring(2, 15);
    const newNote: Note = {
      id: newNoteId,
      title: title.trim() || undefined,
      content: content.trim(),
      createdAt: new Date(),
      updatedAt: new Date(),
      images: images.map(img => ({ id: img.id, noteId: newNoteId, imagePath: img.imagePath })),
    };

    try {
      notesRepo.create(newNote);
      Alert.alert('Saved', 'Note saved!', [{ text: 'OK', onPress: () => navigation.goBack() }]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save note.');
    }
  }, [title, content, images, notesRepo, navigation]);

  return (
    <AppContainer safeAreaSides={['top', 'left', 'right']} style={styles.container}>
      {/* ─── Nav Bar ─── */}
      <View style={styles.navBar}>
        <Pressable style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ArrowLeft size={20} color={theme.colors.textPrimary} />
        </Pressable>
        <View style={styles.navCenter}>
          <FileText size={16} color={theme.colors.secondary} />
          <Text variant="titleMedium" fontWeight="bold">New Note</Text>
        </View>
        <Pressable style={styles.saveBtn} onPress={handleSave}>
          <Save size={16} color="#FFFFFF" />
          <Text variant="caption" fontWeight="bold" style={styles.saveBtnText}>Save</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        {/* ─── Title ─── */}
        <View style={styles.inputGroup}>
          <Text variant="overline" color="textSecondary" style={styles.label}>TITLE (OPTIONAL)</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Give this note a name..."
            placeholderTextColor={theme.colors.textTertiary}
            value={title}
            onChangeText={setTitle}
          />
        </View>

        {/* ─── Content ─── */}
        <View style={styles.inputGroup}>
          <Text variant="overline" color="textSecondary" style={styles.label}>NOTE *</Text>
          <TextInput
            style={[styles.textInput, styles.contentArea]}
            placeholder="What's on your mind?..."
            placeholderTextColor={theme.colors.textTertiary}
            multiline
            value={content}
            onChangeText={setContent}
            autoFocus
          />
          {content.length > 0 && (
            <Text variant="caption" color="textTertiary" style={styles.charCount}>
              {content.length} characters
            </Text>
          )}
        </View>

        <Divider style={styles.divider} />

        {/* ─── Image Attachments ─── */}
        <Text variant="overline" color="textTertiary" style={styles.sectionHeader}>IMAGE ATTACHMENTS</Text>
        <View style={styles.imagePickerRow}>
          <Pressable style={styles.imagePickerBtn} onPress={() => handleSelectImage('camera')}>
            <Camera size={18} color={theme.colors.primary} />
            <Text variant="bodySmall" fontWeight="semiBold" color="primary">Camera</Text>
          </Pressable>
          <Pressable style={styles.imagePickerBtn} onPress={() => handleSelectImage('gallery')}>
            <ImageIcon size={18} color={theme.colors.secondary} />
            <Text variant="bodySmall" fontWeight="semiBold" style={styles.galleryText}>Gallery</Text>
          </Pressable>
        </View>

        {images.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.imageScrollContent}>
            {images.map(img => (
              <View key={img.id} style={styles.imageWrapper}>
                <Image source={{ uri: img.imagePath }} style={styles.previewImage} />
                <Pressable style={styles.removeImageBtn} onPress={() => handleRemoveImage(img.id)}>
                  <Trash2 size={12} color="#FFFFFF" />
                </Pressable>
              </View>
            ))}
          </ScrollView>
        )}

        <Divider style={styles.divider} />

        <View style={styles.actionRow}>
          <Button title="Save Note" variant="primary" onPress={handleSave} style={styles.actionBtnFlex} />
          <Button title="Cancel" variant="outlined" onPress={() => navigation.goBack()} style={styles.actionBtnFlex} />
        </View>
      </ScrollView>
    </AppContainer>
  );
};

const styles = StyleSheet.create({
  container: { backgroundColor: theme.colors.background },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: theme.colors.secondary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: theme.radius.md,
  },
  saveBtnText: { color: theme.colors.background },
  scrollContainer: {
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.xxl,
  },
  inputGroup: { marginBottom: theme.spacing.md },
  label: { marginBottom: 6 },
  textInput: {
    backgroundColor: theme.colors.card,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm + 2,
    color: theme.colors.textPrimary,
    fontSize: 15,
    ...theme.elevation.xs,
  },
  contentArea: {
    height: 200,
    textAlignVertical: 'top',
    fontSize: 16,
    lineHeight: 24,
  },
  charCount: {
    textAlign: 'right',
    marginTop: 4,
  },
  divider: { marginVertical: theme.spacing.lg },
  sectionHeader: { marginBottom: theme.spacing.sm },
  imagePickerRow: { flexDirection: 'row', gap: theme.spacing.sm, marginBottom: theme.spacing.md },
  imagePickerBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.elevation.xs,
  },
  galleryText: { color: theme.colors.secondary },
  imageScrollContent: { gap: theme.spacing.sm, paddingVertical: theme.spacing.sm },
  imageWrapper: { position: 'relative' },
  previewImage: {
    width: 90,
    height: 90,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.border,
  },
  removeImageBtn: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: theme.colors.danger,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionRow: { flexDirection: 'row', gap: theme.spacing.md },
  actionBtnFlex: { flex: 1 },
});
